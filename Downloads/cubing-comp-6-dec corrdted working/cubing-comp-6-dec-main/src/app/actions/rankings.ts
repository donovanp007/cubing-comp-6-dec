'use server'

/**
 * Server actions for public rankings leaderboard
 * Fetches and aggregates student performance across all competitions
 */

import { createClient } from '@/lib/supabase/server'

export interface RankingEntry {
  student_id: string
  student_name: string
  grade: string | null
  school: string | null
  age: number | null
  age_range: string
  overall_best_single: number
  overall_best_average: number
  best_single_event: string
  best_average_event: string
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
    // Fetch all student competition history across all competitions (past, current, and future)
    const { data: historyData, error: historyError } = await supabase
      .from('student_competition_history')
      .select(
        `
        student_id,
        best_single_milliseconds,
        best_average_milliseconds,
        is_record_single,
        is_record_average,
        is_pb_single,
        is_pb_average,
        students(first_name, last_name, grade, school, date_of_birth, profile_image_url),
        event_types(display_name),
        competitions(status)
      `
      )

    if (historyError) {
      console.error('Error fetching rankings data:', historyError)
      return []
    }

    if (!historyData || historyData.length === 0) {
      return []
    }

    // Group data by student
    const studentMap = new Map<string, any>()

    for (const entry of historyData) {
      const student = (entry.students as any)?.[0]
      const eventType = (entry.event_types as any)?.[0]

      if (!student || !eventType) continue

      const studentKey = entry.student_id
      const studentName = `${student.first_name} ${student.last_name}`
      const age = calculateAge(student.date_of_birth)
      const ageRange = getAgeRange(age)

      if (!studentMap.has(studentKey)) {
        studentMap.set(studentKey, {
          student_id: studentKey,
          student_name: studentName,
          grade: student.grade,
          school: student.school,
          age,
          age_range: ageRange,
          overall_best_single: entry.best_single_milliseconds || Infinity,
          overall_best_average: entry.best_average_milliseconds || Infinity,
          best_single_event: entry.best_single_milliseconds
            ? eventType.display_name
            : '',
          best_average_event: entry.best_average_milliseconds
            ? eventType.display_name
            : '',
          competitions_participated: new Set<string>(),
          events_participated: new Set<string>(),
          records_count: 0,
          pbs_count: 0,
          profile_image_url: student.profile_image_url,
        })
      }

      const studentData = studentMap.get(studentKey)

      // Update best single if this is better
      if (
        entry.best_single_milliseconds &&
        entry.best_single_milliseconds < studentData.overall_best_single
      ) {
        studentData.overall_best_single = entry.best_single_milliseconds
        studentData.best_single_event = eventType.display_name
      }

      // Update best average if this is better
      if (
        entry.best_average_milliseconds &&
        entry.best_average_milliseconds < studentData.overall_best_average
      ) {
        studentData.overall_best_average = entry.best_average_milliseconds
        studentData.best_average_event = eventType.display_name
      }

      // Count records and PBs
      if (entry.is_record_single || entry.is_record_average) {
        studentData.records_count += 1
      }
      if (entry.is_pb_single || entry.is_pb_average) {
        studentData.pbs_count += 1
      }

      studentData.events_participated.add(eventType.display_name)
    }

    // Convert to array and finalize
    const rankings: RankingEntry[] = Array.from(studentMap.values()).map(
      (entry) => ({
        ...entry,
        competitions_participated: entry.competitions_participated.size,
        events_participated: entry.events_participated.size,
      })
    )

    return rankings
  } catch (error) {
    console.error('Error in getAllRankingsData:', error)
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
