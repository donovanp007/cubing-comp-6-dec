'use server'

/**
 * Server actions for public rankings leaderboard
 * Fetches and aggregates student performance across all competitions
 */

import { createClient } from '@/lib/supabase/server'

export interface CubeStats {
  best_single: number
  best_average: number
}

export interface RankingEntry {
  student_id: string
  student_name: string
  grade: string | null
  school: string | null
  age: number | null
  age_range: string
  // Per-cube tracking
  cube_stats: Record<string, CubeStats> // e.g., {"3x3x3 Cube": {best_single: 12.5, best_average: 15.3}}
  competitions_participated: number
  events_participated: number
  records_count: number
  pbs_count: number
  profile_image_url: string | null
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age >= 0 ? age : null
}

/**
 * Map age to age range
 */
function getAgeRange(age: number | null): string {
  if (age === null) return 'Unknown'
  if (age >= 5 && age <= 7) return '5-7'
  if (age >= 8 && age <= 10) return '8-10'
  if (age >= 11 && age <= 13) return '11-13'
  return '14+'
}

/**
 * Get all rankings data aggregated across all competitions
 * Returns each student once with their absolute best times across all events
 */
export async function getAllRankingsData(): Promise<RankingEntry[]> {
  const supabase = await createClient()

  try {
    const startTime = Date.now()
    console.log('[Rankings] Starting getAllRankingsData...')

    // Fetch all students with timeout handling (30 second timeout)
    let allStudents
    let studentsError
    try {
      const result = await Promise.race([
        supabase
          .from('students')
          .select('id, first_name, last_name, grade, school, date_of_birth, profile_image_url'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Students fetch timeout')), 30000))
      ]) as any
      allStudents = result.data
      studentsError = result.error
    } catch (err) {
      console.error('[Rankings] Students fetch error:', err)
      return []
    }

    if (studentsError) {
      console.error('[Rankings] Error fetching students:', studentsError)
      return []
    }

    if (!allStudents || allStudents.length === 0) {
      console.log('[Rankings] No students found')
      return []
    }

    console.log(`[Rankings] Found ${allStudents.length} students (${Date.now() - startTime}ms)`)

    // Fetch all final scores with timeout handling (30 second timeout)
    let finalScores
    let scoresError
    try {
      const result = await Promise.race([
        supabase
          .from('final_scores')
          .select('id, student_id, best_time_milliseconds, average_time_milliseconds, round_id'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Final scores fetch timeout')), 30000))
      ]) as any
      finalScores = result.data
      scoresError = result.error
    } catch (err) {
      console.error('[Rankings] Final scores fetch error:', err)
      return []
    }

    if (scoresError) {
      console.error('[Rankings] Error fetching final scores:', scoresError)
      return []
    }

    if (!finalScores || finalScores.length === 0) {
      console.log('[Rankings] No final scores found - trying student_competition_history as fallback')

      // Fallback: try to get data from student_competition_history
      const { data: historyData, error: historyError } = await supabase
        .from('student_competition_history')
        .select('student_id, best_single_milliseconds, best_average_milliseconds')

      if (historyError || !historyData || historyData.length === 0) {
        console.log('[Rankings] No data in student_competition_history either')
        return []
      }

      console.log(`[Rankings] Found ${historyData.length} records in student_competition_history`)

      // Create simplified rankings from history data
      const studentMapFallback = new Map(allStudents.map((s: any) => [s.id, s]))
      const rankings = historyData.map((h: any) => {
        const student = studentMapFallback.get(h.student_id) as any
        return {
          student_id: h.student_id,
          student_name: student?.first_name && student?.last_name
            ? `${student.first_name} ${student.last_name}`
            : 'Unknown',
          grade: student?.grade || null,
          school: student?.school || null,
          age: student?.date_of_birth ? calculateAge(student.date_of_birth) : null,
          age_range: student?.date_of_birth ? getAgeRange(calculateAge(student.date_of_birth)) : 'Unknown',
          cube_stats: {
            'Unknown': {
              best_single: h.best_single_milliseconds || 0,
              best_average: h.best_average_milliseconds || 0,
            }
          },
          competitions_participated: 1,
          events_participated: 1,
          records_count: 0,
          pbs_count: 0,
          profile_image_url: student?.profile_image_url || null,
        }
      })

      console.log(`[Rankings] Returning ${rankings.length} rankings from student_competition_history`)
      return rankings
    }

    console.log(`[Rankings] Found ${finalScores.length} final scores (${Date.now() - startTime}ms)`)

    // Fetch rounds separately - no nested joins, with timeout
    const roundIds = [...new Set(finalScores.map((fs: any) => fs.round_id))]
    console.log(`[Rankings] Fetching ${roundIds.length} unique round IDs`)

    let rounds
    let roundsError
    try {
      const result = await Promise.race([
        supabase
          .from('rounds')
          .select('id, competition_event_id')
          .in('id', roundIds),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Rounds fetch timeout')), 30000))
      ]) as any
      rounds = result.data
      roundsError = result.error
    } catch (err) {
      console.error('[Rankings] Rounds fetch error:', err)
      return []
    }

    if (roundsError) {
      console.error('[Rankings] Error fetching rounds:', roundsError)
      return []
    }

    if (!rounds) {
      console.error('[Rankings] Rounds data is null')
      return []
    }

    console.log(`[Rankings] Fetched ${rounds.length} rounds (${Date.now() - startTime}ms)`)

    // Fetch competition_events separately
    const compEventIds = [...new Set(rounds.map((r: any) => r.competition_event_id))]
    console.log(`[Rankings] Fetching ${compEventIds.length} unique competition events`)

    let compEvents
    let compEventsError
    try {
      const result = await Promise.race([
        supabase
          .from('competition_events')
          .select('id, event_type_id, competition_id')
          .in('id', compEventIds),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Comp events fetch timeout')), 30000))
      ]) as any
      compEvents = result.data
      compEventsError = result.error
    } catch (err) {
      console.error('[Rankings] Comp events fetch error:', err)
      return []
    }

    if (compEventsError) {
      console.error('[Rankings] Error fetching competition events:', compEventsError)
      return []
    }

    console.log(`[Rankings] Fetched ${compEvents?.length || 0} competition events (${Date.now() - startTime}ms)`)

    // Fetch event_types separately
    const eventTypeIds = [...new Set((compEvents || []).map((ce: any) => ce.event_type_id))]
    console.log(`[Rankings] Fetching ${eventTypeIds.length} unique event types`)

    let eventTypes
    let eventTypesError
    try {
      const result = await Promise.race([
        supabase
          .from('event_types')
          .select('id, display_name')
          .in('id', eventTypeIds),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Event types fetch timeout')), 30000))
      ]) as any
      eventTypes = result.data
      eventTypesError = result.error
    } catch (err) {
      console.error('[Rankings] Event types fetch error:', err)
      return []
    }

    if (eventTypesError) {
      console.error('[Rankings] Error fetching event types:', eventTypesError)
      return []
    }

    console.log(`[Rankings] Fetched ${eventTypes?.length || 0} event types (${Date.now() - startTime}ms)`)

    // Create lookup maps for fast access
    const roundMap = new Map(rounds.map((r: any) => [r.id, r]))
    const compEventMap = new Map((compEvents || []).map((ce: any) => [ce.id, ce]))
    const eventTypeMap = new Map((eventTypes || []).map((et: any) => [et.id, et]))

    console.log(`[Rankings] Created maps: rounds=${roundMap.size}, compEvents=${compEventMap.size}, eventTypes=${eventTypeMap.size}`)

    // Group data by student and track their best times across all events
    const studentRankings = new Map<string, any>()

    for (const score of finalScores) {
      const studentId = score.student_id
      const student = allStudents.find((s: any) => s.id === studentId)

      if (!student) {
        console.warn(`[Rankings] Student ${studentId} not found in students list`)
        continue
      }

      const round = roundMap.get(score.round_id) as any
      if (!round) {
        console.warn(`[Rankings] Round ${score.round_id} not found`)
        continue
      }

      const compEvent = compEventMap.get(round?.competition_event_id) as any
      if (!compEvent) {
        console.warn(`[Rankings] Competition event ${round.competition_event_id} not found`)
        continue
      }

      const eventType = eventTypeMap.get(compEvent?.event_type_id) as any
      const eventName = eventType?.display_name || 'Unknown'

      if (!studentRankings.has(studentId)) {
        const age = calculateAge(student.date_of_birth)
        studentRankings.set(studentId, {
          student_id: studentId,
          student_name: `${student.first_name} ${student.last_name}`,
          grade: student.grade || null,
          school: student.school || null,
          age,
          age_range: getAgeRange(age),
          cube_stats: {},
          competitions_participated: new Set<string>(),
          events_participated: new Set<string>(),
          records_count: 0,
          pbs_count: 0,
          profile_image_url: student.profile_image_url || null,
        })
      }

      const rankingEntry = studentRankings.get(studentId) as any

      // Initialize cube stats if not present
      if (!rankingEntry.cube_stats[eventName]) {
        rankingEntry.cube_stats[eventName] = {
          best_single: Infinity,
          best_average: Infinity,
        }
      }

      // Update best single for this cube
      if (score.best_time_milliseconds) {
        if (score.best_time_milliseconds < rankingEntry.cube_stats[eventName].best_single) {
          rankingEntry.cube_stats[eventName].best_single = score.best_time_milliseconds
        }
      }

      // Update best average for this cube
      if (score.average_time_milliseconds) {
        if (score.average_time_milliseconds < rankingEntry.cube_stats[eventName].best_average) {
          rankingEntry.cube_stats[eventName].best_average = score.average_time_milliseconds
        }
      }

      // Track participated events and competitions
      rankingEntry.events_participated.add(eventName)
      rankingEntry.competitions_participated.add(compEvent.competition_id)
    }

    // Convert to array and finalize
    const rankings: RankingEntry[] = Array.from(studentRankings.values()).map(
      (entry: any) => {
        // Clean up cube_stats (convert Infinity to 0)
        const cleanedCubeStats: Record<string, CubeStats> = {}
        for (const [cubeName, stats] of Object.entries(entry.cube_stats)) {
          cleanedCubeStats[cubeName] = {
            best_single: (stats as any).best_single === Infinity ? 0 : (stats as any).best_single,
            best_average: (stats as any).best_average === Infinity ? 0 : (stats as any).best_average,
          }
        }
        return {
          ...entry,
          cube_stats: cleanedCubeStats,
          competitions_participated: entry.competitions_participated.size,
          events_participated: entry.events_participated.size,
        }
      }
    )

    console.log(`[Rankings] Returning ${rankings.length} final rankings (${Date.now() - startTime}ms total)`)
    return rankings
  } catch (error) {
    console.error('[Rankings] Error in getAllRankingsData:', error instanceof Error ? error.message : error)
    return []
  }
}

/**
 * Get list of all active event types for filtering
 */
export async function getEventTypesForRankings() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('event_types')
      .select('id, display_name')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching event types:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getEventTypesForRankings:', error)
    return []
  }
}

/**
 * Get detailed profile data for a student including competition history
 */
export interface StudentProfileData {
  student_id: string
  student_name: string
  grade: string | null
  school: string | null
  age: number | null
  age_range: string
  profile_image_url: string | null
  competitions_participated: number
  events_participated: number
  records_count: number
  pbs_count: number
  cube_stats: Record<string, CubeStats>
  competitions: Array<{
    competition_id: string
    competition_name: string
    competition_date: string
    rounds: Array<{
      round_id: string
      round_name: string
      round_number: number
      event_name: string
      best_single: number
      best_average: number
      solves: Array<{
        solve_time: number
        penalty: string | null
        isPB?: boolean
      }>
    }>
  }>
}

export async function getStudentProfileData(studentId: string): Promise<StudentProfileData | null> {
  const supabase = await createClient()

  try {
    const profileStartTime = Date.now()
    console.log(`[StudentProfile] Fetching profile for student ${studentId}`)

    // Get student basic info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, first_name, last_name, grade, school, date_of_birth, profile_image_url')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      console.error('[StudentProfile] Error fetching student:', studentError)
      return null
    }

    const age = calculateAge(student.date_of_birth)
    const age_range = getAgeRange(age)

    // Get all final scores
    const { data: finalScores, error: scoresError } = await supabase
      .from('final_scores')
      .select('id, best_time_milliseconds, average_time_milliseconds, round_id')
      .eq('student_id', studentId)

    if (scoresError || !finalScores || finalScores.length === 0) {
      console.log('[StudentProfile] No scores found for student')
      return {
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        grade: student.grade || null,
        school: student.school || null,
        age,
        age_range,
        profile_image_url: student.profile_image_url || null,
        competitions_participated: 0,
        events_participated: 0,
        records_count: 0,
        pbs_count: 0,
        cube_stats: {},
        competitions: [],
      }
    }

    // Extract unique IDs
    const roundIds = [...new Set((finalScores as any[]).map((fs) => fs.round_id))]

    // Fetch rounds and solves IN PARALLEL
    const [
      { data: rounds, error: roundsError },
      { data: solvesData, error: solvesError }
    ] = await Promise.all([
      supabase
        .from('rounds')
        .select('id, round_number, round_name, competition_event_id')
        .in('id', roundIds),
      supabase
        .from('results')
        .select('round_id, time_milliseconds, is_dnf, penalty_seconds')
        .eq('student_id', studentId)
    ])

    if (roundsError || !rounds || rounds.length === 0) {
      console.error('[StudentProfile] Error fetching rounds:', roundsError)
      return null
    }

    const solves = solvesData || []

    const roundMap = new Map(rounds.map((r: any) => [r.id, r]))
    const compEventIds = [...new Set((rounds as any[]).map((r) => r.competition_event_id))]

    // Fetch competition events, event types, and competitions IN PARALLEL
    const [
      { data: compEvents, error: compEventsError },
      { data: eventTypes, error: eventTypesError }
    ] = await Promise.all([
      supabase
        .from('competition_events')
        .select('id, event_type_id, competition_id')
        .in('id', compEventIds),
      supabase
        .from('event_types')
        .select('id, display_name')
    ])

    if (compEventsError || !compEvents || eventTypesError || !eventTypes) {
      console.error('[StudentProfile] Error fetching comp events or event types:', { compEventsError, eventTypesError })
      return null
    }

    const compEventMap = new Map(compEvents.map((ce: any) => [ce.id, ce]))
    const eventTypeMap = new Map(eventTypes.map((et: any) => [et.id, et]))
    const competitionIds = [...new Set((compEvents as any[]).map((ce) => ce.competition_id))]

    // Fetch competitions
    const { data: competitions, error: competitionsError } = await supabase
      .from('competitions')
      .select('id, name, competition_date')
      .in('id', competitionIds)

    if (competitionsError || !competitions) {
      console.error('[StudentProfile] Error fetching competitions:', competitionsError)
      return null
    }

    const competitionMapLookup = new Map(competitions.map((c: any) => [c.id, c]))
    const solvesMap = new Map<string, any[]>()
    if (solves) {
      ;(solves as any[]).forEach((result) => {
        if (!solvesMap.has(result.round_id)) {
          solvesMap.set(result.round_id, [])
        }

        // Determine penalty string based on DNF flag
        let penalty = 'OK'
        if (result.is_dnf) {
          penalty = 'DNF'
        } else if (result.penalty_seconds && result.penalty_seconds > 0) {
          penalty = '+2'
        }

        solvesMap.get(result.round_id)!.push({
          solve_time: result.time_milliseconds || 0,
          penalty: penalty
        })
      })
    }

    // Organize data by competition
    const competitionsByIdMap = new Map<string, any>()
    const cubeStatsMap = new Map<string, CubeStats>()

    ;(finalScores as any[]).forEach((score: any) => {
      const round = roundMap.get(score.round_id)
      if (!round) return

      const compEvent = compEventMap.get(round.competition_event_id)
      if (!compEvent) return

      const eventType = eventTypeMap.get(compEvent.event_type_id)
      if (!eventType) return

      const competition = competitionMapLookup.get(compEvent.competition_id)
      if (!competition) return

      const compKey = competition.id
      const eventName = eventType.display_name

      // Track cube stats
      if (!cubeStatsMap.has(eventName)) {
        cubeStatsMap.set(eventName, {
          best_single: 0,
          best_average: 0,
        })
      }

      const stats = cubeStatsMap.get(eventName)!
      if (score.best_time_milliseconds && (!stats.best_single || score.best_time_milliseconds < stats.best_single)) {
        stats.best_single = score.best_time_milliseconds
      }
      if (score.average_time_milliseconds && (!stats.best_average || score.average_time_milliseconds < stats.best_average)) {
        stats.best_average = score.average_time_milliseconds
      }

      // Build competition structure
      if (!competitionsByIdMap.has(compKey)) {
        competitionsByIdMap.set(compKey, {
          competition_id: competition.id,
          competition_name: competition.name,
          competition_date: competition.competition_date,
          rounds: new Map<string, any>(),
        })
      }

      const comp = competitionsByIdMap.get(compKey)!
      const roundKey = round.id

      if (!comp.rounds.has(roundKey)) {
        const roundSolves = (solvesMap.get(roundKey) || []).map((solve) => ({
          ...solve,
          isPB: solve.solve_time === score.best_time_milliseconds && score.best_time_milliseconds > 0
        }))

        comp.rounds.set(roundKey, {
          round_id: round.id,
          round_name: round.round_name,
          round_number: round.round_number,
          event_name: eventName,
          best_single: score.best_time_milliseconds || 0,
          best_average: score.average_time_milliseconds || 0,
          solves: roundSolves
        })
      }
    })

    // Convert to arrays
    const competitionsArray = Array.from(competitionsByIdMap.values()).map((comp) => ({
      ...comp,
      rounds: Array.from(comp.rounds.values()),
    }))

    const cube_stats: Record<string, CubeStats> = {}
    cubeStatsMap.forEach((stats, eventName) => {
      cube_stats[eventName] = stats
    })

    const profile: StudentProfileData = {
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      grade: student.grade || null,
      school: student.school || null,
      age,
      age_range,
      profile_image_url: student.profile_image_url || null,
      competitions_participated: competitionsArray.length,
      events_participated: Object.keys(cube_stats).length,
      records_count: 0,
      pbs_count: 0,
      cube_stats,
      competitions: competitionsArray,
    }

    const elapsed = Date.now() - profileStartTime
    console.log(`[StudentProfile] Profile loaded in ${elapsed}ms`)
    return profile
  } catch (error) {
    console.error('[StudentProfile] Error in getStudentProfileData:', error)
    return null
  }
}
