/**
 * Tier Points Calculation
 * Core logic for calculating how many points a student earns
 *
 * Points are awarded based on:
 * 1. Best time tier (S/A/B/C/D) × grade multiplier
 * 2. Average time tier (S/A/B/C/D) × grade multiplier
 * 3. Bonuses: PB (+1), Clutch (+2), Streak (+3) × grade multiplier
 * 4. School Momentum (+5 shared by all students)
 */

import { createClient } from '@/lib/supabase/client'
import { determineTier, type TierThreshold } from './determine-tier'
import {
  checkPBBonus,
  checkClutchBonus,
  checkStreakBonus,
  checkSchoolMomentumBonus
} from './bonus-detection'

export interface TierPointCalculation {
  studentId: string
  schoolId: string
  roundId: string
  competitionId: string
  competitionEventId: string
  grade: string

  // Best time scoring
  bestTimeMs: number | null
  bestTimeTier: 'S' | 'A' | 'B' | 'C' | 'D' | null
  bestTimeBasePoints: number
  bestTimeMultiplier: number
  bestTimeFinalPoints: number

  // Average time scoring
  averageTimeMs: number | null
  averageTimeTier: 'S' | 'A' | 'B' | 'C' | 'D' | null
  averageTimeBasePoints: number
  averageTimeMultiplier: number
  averageTimeFinalPoints: number

  // Bonuses (each bonus is multiplied by grade multiplier)
  pbBonus: number
  clutchBonus: number
  streakBonus: number
  schoolMomentumBonus: number

  // Total
  totalPoints: number
  breakdown: string[] // Human-readable breakdown for debugging
}

/**
 * Get grade multiplier for a specific grade
 */
export async function getGradeMultiplier(grade: string): Promise<number> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('grade_multipliers')
    .select('multiplier')
    .eq('grade', grade)
    .single()

  if (error) {
    console.warn(`Grade multiplier not found for grade "${grade}", defaulting to 1.0`, error)
    return 1.0
  }

  return data?.multiplier ?? 1.0
}

/**
 * Calculate total points for a student for a specific round
 * This is the main function that orchestrates the entire point calculation
 */
export async function calculateStudentPointsForRound(
  roundId: string,
  studentId: string
): Promise<TierPointCalculation | null> {
  const supabase = createClient()

  try {
    // Step 1: Fetch student's final scores for this round
    const { data: finalScore, error: scoreError } = await supabase
      .from('final_scores')
      .select(
        `
        id,
        best_time_milliseconds,
        average_time_milliseconds,
        round_id,
        rounds!inner(
          id,
          competition_event_id,
          competition_events!inner(
            competition_id,
            event_type_id
          )
        ),
        student_id,
        students!inner(
          id,
          grade,
          school_id
        )
      `
      )
      .eq('round_id', roundId)
      .eq('student_id', studentId)
      .single()

    if (scoreError || !finalScore) {
      console.error('Error fetching final score:', scoreError)
      return null
    }

    // Extract nested data
    const roundData = (finalScore as any).rounds
    const competitionEventData = (roundData.competition_events as any)
    const studentData = (finalScore as any).students
    const competitionId = competitionEventData.competition_id
    const eventTypeId = competitionEventData.event_type_id
    const grade = studentData.grade
    const schoolId = studentData.school_id

    // Step 2: Get grade multiplier
    const gradeMultiplier = await getGradeMultiplier(grade)

    // Step 3: Determine tier for best time
    const bestTimeMs = finalScore.best_time_milliseconds
    const bestTimeTierData = await determineTier(bestTimeMs, eventTypeId)

    const bestTimeBasePoints = bestTimeTierData?.base_points ?? 0
    const bestTimeTierName = bestTimeTierData?.tier_name ?? 'D'
    const bestTimeFinalPoints = bestTimeBasePoints * gradeMultiplier

    // Step 4: Determine tier for average time
    const averageTimeMs = finalScore.average_time_milliseconds
    const averageTimeTierData = await determineTier(averageTimeMs, eventTypeId)

    const averageTimeBasePoints = averageTimeTierData?.base_points ?? 0
    const averageTimeTierName = averageTimeTierData?.tier_name ?? 'D'
    const averageTimeFinalPoints = averageTimeBasePoints * gradeMultiplier

    // Step 5: Calculate bonuses
    const pbBonusEarned = await checkPBBonus(studentId, bestTimeMs)
    const pbBonus = pbBonusEarned ? 1 * gradeMultiplier : 0

    const clutchBonusEarned = await checkClutchBonus(roundId, studentId, bestTimeMs)
    const clutchBonus = clutchBonusEarned ? 2 * gradeMultiplier : 0

    const streakBonusEarned = await checkStreakBonus(roundId, studentId)
    const streakBonus = streakBonusEarned ? 3 * gradeMultiplier : 0

    // School momentum bonus is +5 to school total, not individual
    // We'll calculate this separately when aggregating school points
    const schoolMomentumBonus = 0 // Will be added at school level

    // Step 6: Calculate total
    const totalPoints = bestTimeFinalPoints + averageTimeFinalPoints + pbBonus + clutchBonus + streakBonus

    // Build breakdown for debugging
    const breakdown: string[] = []
    if (bestTimeFinalPoints > 0) {
      breakdown.push(`Best Time (${bestTimeTierName}): ${bestTimeBasePoints} × ${gradeMultiplier} = ${bestTimeFinalPoints}`)
    }
    if (averageTimeFinalPoints > 0) {
      breakdown.push(
        `Average Time (${averageTimeTierName}): ${averageTimeBasePoints} × ${gradeMultiplier} = ${averageTimeFinalPoints}`
      )
    }
    if (pbBonus > 0) breakdown.push(`PB Bonus: +${pbBonus}`)
    if (clutchBonus > 0) breakdown.push(`Clutch Bonus: +${clutchBonus}`)
    if (streakBonus > 0) breakdown.push(`Streak Bonus: +${streakBonus}`)

    return {
      studentId,
      schoolId,
      roundId,
      competitionId,
      competitionEventId: competitionEventData.id,
      grade,
      bestTimeMs,
      bestTimeTier: bestTimeTierName as any,
      bestTimeBasePoints,
      bestTimeMultiplier: gradeMultiplier,
      bestTimeFinalPoints,
      averageTimeMs,
      averageTimeTier: averageTimeTierName as any,
      averageTimeBasePoints,
      averageTimeMultiplier: gradeMultiplier,
      averageTimeFinalPoints,
      pbBonus,
      clutchBonus,
      streakBonus,
      schoolMomentumBonus,
      totalPoints,
      breakdown
    }
  } catch (error) {
    console.error('Error calculating student points:', error)
    return null
  }
}

/**
 * Calculate points for all students in a round
 * Returns array of point calculations
 */
export async function calculatePointsForRound(roundId: string): Promise<TierPointCalculation[]> {
  const supabase = createClient()

  try {
    // Get all students who participated in this round
    const { data: finalScores, error } = await supabase
      .from('final_scores')
      .select('student_id')
      .eq('round_id', roundId)

    if (error || !finalScores) {
      console.error('Error fetching students for round:', error)
      return []
    }

    // Calculate points for each student
    const calculations: TierPointCalculation[] = []
    for (const { student_id } of finalScores) {
      const calc = await calculateStudentPointsForRound(roundId, student_id)
      if (calc) {
        calculations.push(calc)
      }
    }

    return calculations
  } catch (error) {
    console.error('Error calculating round points:', error)
    return []
  }
}

/**
 * Calculate school momentum bonus for a round
 * If all school students had zero DNFs, add +5 to school total
 */
export async function calculateSchoolMomentumBonus(
  roundId: string,
  schoolId: string
): Promise<number> {
  const hasBonus = await checkSchoolMomentumBonus(roundId, schoolId)
  return hasBonus ? 5 : 0
}
