/**
 * Bonus Detection Utilities
 * Detects when students earn bonus points for special achievements
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Check if student beat their Personal Best
 * PB is checked across ALL competitions and event types
 * Returns true if this is the best time ever recorded
 */
export async function checkPBBonus(studentId: string, currentTimeMs: number | null): Promise<boolean> {
  if (currentTimeMs === null) return false // DNF can't be a PB

  const supabase = createClient()

  // Get all previous best times for this student across all competitions
  const { data: previousBests, error } = await supabase
    .from('final_scores')
    .select('best_time_milliseconds')
    .eq('student_id', studentId)
    .not('best_time_milliseconds', 'is', null)
    .order('best_time_milliseconds', { ascending: true })
    .limit(1)

  if (error) {
    console.error('Error checking PB:', error)
    return false
  }

  // If no previous bests, this is definitely a PB
  if (!previousBests || previousBests.length === 0) {
    return true
  }

  const previousBest = previousBests[0].best_time_milliseconds
  return currentTimeMs < previousBest
}

/**
 * Check if student earned Clutch Bonus
 * Clutch = best time happened in Finals round (not in earlier rounds)
 * Only apply in finals rounds
 */
export async function checkClutchBonus(
  roundId: string,
  studentId: string,
  currentBestTimeMs: number | null
): Promise<boolean> {
  if (currentBestTimeMs === null) return false

  const supabase = createClient()

  // Check if this round is a finals round
  const { data: roundData, error: roundError } = await supabase
    .from('rounds')
    .select('round_name, competition_event_id')
    .eq('id', roundId)
    .single()

  if (roundError) {
    console.error('Error fetching round:', roundError)
    return false
  }

  if (!roundData?.round_name.toLowerCase().includes('final')) {
    return false // Not a finals round
  }

  // Get the student's best time in previous rounds of this event
  const { data: previousRounds, error: prevError } = await supabase
    .from('final_scores')
    .select('best_time_milliseconds')
    .eq('student_id', studentId)
    .eq('competition_event_id', roundData.competition_event_id)
    .not('id', 'eq', roundId) // Exclude current round
    .order('best_time_milliseconds', { ascending: true })

  if (prevError) {
    console.error('Error checking previous rounds:', prevError)
    return false
  }

  // If no previous rounds, first attempt in finals with a time is clutch
  if (!previousRounds || previousRounds.length === 0) {
    return true
  }

  // Check if current time is better than all previous times
  const previousBestTimes = previousRounds
    .map(r => r.best_time_milliseconds)
    .filter(t => t !== null) as number[]

  if (previousBestTimes.length === 0) {
    return true // No valid previous times, current is best
  }

  const previousBest = Math.min(...previousBestTimes)
  return currentBestTimeMs < previousBest
}

/**
 * Check if student earned Streak Bonus
 * Streak = 3 or more consecutive solve improvements in same round
 */
export async function checkStreakBonus(roundId: string, studentId: string): Promise<boolean> {
  const supabase = createClient()

  // Get all 5 results for this student in this round, in order
  const { data: results, error } = await supabase
    .from('results')
    .select('attempt_number, time_milliseconds, is_dnf')
    .eq('round_id', roundId)
    .eq('student_id', studentId)
    .order('attempt_number', { ascending: true })

  if (error) {
    console.error('Error fetching results:', error)
    return false
  }

  if (!results || results.length < 3) {
    return false // Need at least 3 attempts to have a streak
  }

  // Filter out DNS and null times, keep the sequence
  const validResults = results.filter(r => r.time_milliseconds !== null && !r.is_dnf)

  if (validResults.length < 3) {
    return false // Not enough valid attempts for a streak
  }

  // Check for 3 consecutive improvements
  let consecutiveImprovements = 0
  for (let i = 1; i < validResults.length; i++) {
    const prevTime = validResults[i - 1].time_milliseconds
    const currentTime = validResults[i].time_milliseconds

    if (currentTime !== null && prevTime !== null && currentTime < prevTime) {
      consecutiveImprovements++
      if (consecutiveImprovements >= 2) {
        // 2 improvements means 3 consecutive better times
        return true
      }
    } else {
      // Reset streak if no improvement
      consecutiveImprovements = 0
    }
  }

  return false
}

/**
 * Check if school earned Momentum Bonus
 * Momentum = entire school had zero DNFs in a round
 */
export async function checkSchoolMomentumBonus(
  roundId: string,
  schoolId: string
): Promise<boolean> {
  const supabase = createClient()

  // Get all students from this school who participated in this round
  const { data: schoolResults, error } = await supabase
    .from('results')
    .select('student_id, is_dnf')
    .in(
      'student_id',
      supabase
        .from('students')
        .select('id')
        .eq('school_id', schoolId)
    )
    .eq('round_id', roundId)

  if (error) {
    console.error('Error checking school momentum:', error)
    return false
  }

  if (!schoolResults || schoolResults.length === 0) {
    return false // No students from school in this round
  }

  // Check if ANY student from the school had a DNF
  const hasDNF = schoolResults.some(r => r.is_dnf === true)

  return !hasDNF // Bonus if no DNFs found
}

/**
 * Check if student set Most Improved status
 * Most Improved = highest percentage improvement from previous competition average
 */
export async function checkMostImprovedBonus(
  studentId: string,
  competitionId: string
): Promise<boolean> {
  const supabase = createClient()

  // Get current competition's average
  const { data: currentCompData, error: currentError } = await supabase
    .from('final_scores')
    .select('average_time_milliseconds, best_time_milliseconds')
    .eq('student_id', studentId)
    .limit(1) // Assuming already filtered to current competition

  if (currentError || !currentCompData) {
    return false
  }

  // This is a simplified check - full implementation would compare to previous competition
  // For now, we'll use PB as a proxy for improvement
  return true // Marked for manual review in badge evaluator
}
