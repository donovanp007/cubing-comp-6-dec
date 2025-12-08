'use server'

/**
 * Server actions for competition records management
 * Handles record tracking, PB detection, and achievement logging
 */

import { createClient } from '@/lib/supabase/server'

export interface RecordData {
  studentId: string
  competitionId: string
  eventTypeId: string
  bestSingle: number
  bestAverage: number
  isRecordSingle: boolean
  isRecordAverage: boolean
  isPbSingle: boolean
  isPbAverage: boolean
}

/**
 * Mark a competition as the baseline for records
 * This should only be done for the first competition
 */
export async function markBaselineCompetition(competitionId: string) {
  const supabase = await createClient()

  try {
    // First, unmark any other baseline competitions
    await supabase
      .from('competitions')
      .update({ is_baseline_competition: false })
      .eq('is_baseline_competition', true)

    // Mark this competition as baseline
    const { error } = await supabase
      .from('competitions')
      .update({
        is_baseline_competition: true,
        baseline_set_at: new Date().toISOString(),
      })
      .eq('id', competitionId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: 'Baseline competition set' }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Get the baseline competition (first competition that sets records)
 */
export async function getBaselineCompetition() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('is_baseline_competition', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching baseline competition:', error)
      return null
    }

    return data || null
  } catch (error) {
    console.error('Error in getBaselineCompetition:', error)
    return null
  }
}

/**
 * Create baseline records from a competition's final scores
 * This is called once after the baseline competition completes
 */
export async function createBaselineRecords(competitionId: string) {
  const supabase = await createClient()

  try {
    // Get all final scores from the competition
    const { data: finalScores, error: scoresError } = await supabase
      .from('final_scores')
      .select(`
        id,
        student_id,
        best_time_milliseconds,
        average_time_milliseconds,
        round_id,
        rounds!inner(competition_event_id, competition_events!inner(event_type_id))
      `)
      .eq('rounds.competition_events.competitions.id', competitionId)

    if (scoresError) {
      return { success: false, error: scoresError.message }
    }

    if (!finalScores || finalScores.length === 0) {
      return { success: false, error: 'No final scores found for competition' }
    }

    // Group scores by student and event
    const recordsToCreate: any[] = []
    const studentEventMap = new Map<string, any>()

    for (const score of finalScores) {
      const round = (score.round_id as any)?.rounds?.[0]
      const eventId = round?.competition_events?.[0]?.event_type_id
      const key = `${score.student_id}-${eventId}`

      if (!studentEventMap.has(key)) {
        studentEventMap.set(key, {
          student_id: score.student_id,
          event_type_id: eventId,
          best_single: score.best_time_milliseconds,
          best_average: score.average_time_milliseconds,
          round_id: score.id,
        })
      }
    }

    // Create competition records for each student-event combination
    for (const record of studentEventMap.values()) {
      recordsToCreate.push({
        baseline_competition_id: competitionId,
        student_id: record.student_id,
        event_type_id: record.event_type_id,
        record_single_milliseconds: record.best_single || 0,
        record_average_milliseconds: record.best_average || 0,
        record_round_id: record.round_id,
        is_baseline: true,
        record_date: new Date().toISOString().split('T')[0],
      })
    }

    // Bulk insert baseline records
    const { error: insertError } = await supabase
      .from('competition_records')
      .insert(recordsToCreate)

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    return {
      success: true,
      message: `Created ${recordsToCreate.length} baseline records`,
      count: recordsToCreate.length,
    }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Check if a student's performance breaks baseline records
 */
export async function checkRecordBreak(
  studentId: string,
  eventTypeId: string,
  competitionId: string,
  bestSingle: number,
  bestAverage: number
) {
  const supabase = await createClient()

  try {
    // Get baseline competition records for this student-event
    const { data: baselineRecords, error: baselineError } = await supabase
      .from('competition_records')
      .select('*')
      .eq('student_id', studentId)
      .eq('event_type_id', eventTypeId)
      .eq('is_baseline', true)
      .single()

    if (baselineError && baselineError.code !== 'PGRST116') {
      console.error('Error fetching baseline records:', baselineError)
      return { isRecordSingle: false, isRecordAverage: false }
    }

    if (!baselineRecords) {
      // No baseline records yet
      return { isRecordSingle: false, isRecordAverage: false }
    }

    // Check if current performance breaks records
    const isRecordSingle = bestSingle > 0 && bestSingle < baselineRecords.record_single_milliseconds
    const isRecordAverage =
      bestAverage > 0 && bestAverage < baselineRecords.record_average_milliseconds

    return {
      isRecordSingle,
      isRecordAverage,
      previousRecordSingle: baselineRecords.record_single_milliseconds,
      previousRecordAverage: baselineRecords.record_average_milliseconds,
    }
  } catch (error) {
    console.error('Error in checkRecordBreak:', error)
    return { isRecordSingle: false, isRecordAverage: false }
  }
}

/**
 * Check if a student's performance achieves a personal best
 */
export async function checkPersonalBest(
  studentId: string,
  eventTypeId: string,
  bestSingle: number,
  bestAverage: number
) {
  const supabase = await createClient()

  try {
    // Get the student's personal best record
    const { data: pbRecords, error: pbError } = await supabase
      .from('personal_bests')
      .select('*')
      .eq('student_id', studentId)
      .eq('event_type_id', eventTypeId)
      .single()

    if (pbError && pbError.code !== 'PGRST116') {
      console.error('Error fetching personal best:', pbError)
      return { isPbSingle: false, isPbAverage: false }
    }

    if (!pbRecords) {
      // First attempt in this event
      return {
        isPbSingle: bestSingle > 0,
        isPbAverage: bestAverage > 0,
        previousPbSingle: null,
        previousPbAverage: null,
      }
    }

    // Check if current performance beats personal best
    const isPbSingle = bestSingle > 0 && bestSingle < (pbRecords.best_single_milliseconds || Infinity)
    const isPbAverage = bestAverage > 0 && bestAverage < (pbRecords.best_average_milliseconds || Infinity)

    return {
      isPbSingle,
      isPbAverage,
      previousPbSingle: pbRecords.best_single_milliseconds,
      previousPbAverage: pbRecords.best_average_milliseconds,
    }
  } catch (error) {
    console.error('Error in checkPersonalBest:', error)
    return { isPbSingle: false, isPbAverage: false }
  }
}

/**
 * Log an achievement (immutable audit trail)
 */
export async function logAchievement(
  studentId: string,
  competitionId: string,
  eventTypeId: string,
  achievementType: string,
  title: string,
  description: string,
  achievedTime: number,
  previousBest: number | null = null,
  badgeId: string | null = null
) {
  const supabase = await createClient()

  try {
    // Calculate improvement percentage
    let improvementPercent = null
    if (previousBest && previousBest > 0) {
      improvementPercent = ((previousBest - achievedTime) / previousBest) * 100
    }

    const { error } = await supabase.from('achievement_log').insert({
      student_id: studentId,
      competition_id: competitionId,
      event_type_id: eventTypeId,
      achievement_type: achievementType,
      title,
      description,
      achieved_time_milliseconds: achievedTime,
      previous_best_milliseconds: previousBest,
      improvement_percent: improvementPercent,
      badge_id: badgeId,
      achieved_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Error logging achievement:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in logAchievement:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Get all records for a given competition
 */
export async function getCompetitionRecords(competitionId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('competition_records')
      .select(
        `
        *,
        students(first_name, last_name),
        event_types(display_name)
      `
      )
      .eq('baseline_competition_id', competitionId)
      .order('record_single_milliseconds', { ascending: true })

    if (error) {
      console.error('Error fetching competition records:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getCompetitionRecords:', error)
    return []
  }
}

/**
 * Get student's record history across competitions
 */
export async function getStudentRecordHistory(studentId: string, eventTypeId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('student_competition_history')
      .select(
        `
        *,
        competitions(name, competition_date, status)
      `
      )
      .eq('student_id', studentId)
      .eq('event_type_id', eventTypeId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching student record history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getStudentRecordHistory:', error)
    return []
  }
}

/**
 * Get best times across all competitions (for coach dashboard)
 */
export async function getAllTimesBestTimes() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('student_competition_history')
      .select(
        `
        student_id,
        event_type_id,
        best_single_milliseconds,
        best_average_milliseconds,
        students(first_name, last_name, grade, school),
        event_types(display_name)
      `
      )
      .order('best_single_milliseconds', { ascending: true })

    if (error) {
      console.error('Error fetching all-time best times:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllTimesBestTimes:', error)
    return []
  }
}

/**
 * Get achievement statistics for a student
 */
export async function getStudentAchievementStats(studentId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('achievement_log')
      .select('*')
      .eq('student_id', studentId)
      .order('achieved_at', { ascending: false })

    if (error) {
      console.error('Error fetching achievement stats:', error)
      return { records: 0, pbs: 0, badges: 0, achievements: [] }
    }

    const achievements = data || []
    const recordCount = achievements.filter((a) => a.achievement_type.includes('record')).length
    const pbCount = achievements.filter((a) => a.achievement_type.includes('pb')).length
    const badgeCount = achievements.filter((a) => a.achievement_type === 'badge').length

    return {
      records: recordCount,
      pbs: pbCount,
      badges: badgeCount,
      achievements,
    }
  } catch (error) {
    console.error('Error in getStudentAchievementStats:', error)
    return { records: 0, pbs: 0, badges: 0, achievements: [] }
  }
}
