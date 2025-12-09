/**
 * Record Points Transactions
 * Saves point calculations to the database as immutable audit trail
 */

import { createClient } from '@/lib/supabase/client'
import type { TierPointCalculation } from './tier-points'

export interface PointTransaction {
  id?: string
  competition_id: string
  competition_event_id: string
  round_id: string
  student_id: string
  school_id: string
  point_type: 'best_time' | 'average_time' | 'pb_bonus' | 'clutch_bonus' | 'streak_bonus' | 'school_momentum_bonus'
  tier_achieved: 'S' | 'A' | 'B' | 'C' | 'D' | null
  base_points: number
  grade_multiplier: number
  final_points: number
  time_milliseconds: number | null
  is_average: boolean
  created_at?: string
}

/**
 * Record all point transactions for a student's round performance
 * Creates immutable audit trail
 */
export async function recordPointTransactions(
  calculation: TierPointCalculation
): Promise<PointTransaction[]> {
  const supabase = createClient()
  const transactions: PointTransaction[] = []

  // Best time points (if any)
  if (calculation.bestTimeFinalPoints > 0) {
    transactions.push({
      competition_id: calculation.competitionId,
      competition_event_id: calculation.competitionEventId,
      round_id: calculation.roundId,
      student_id: calculation.studentId,
      school_id: calculation.schoolId,
      point_type: 'best_time',
      tier_achieved: calculation.bestTimeTier,
      base_points: calculation.bestTimeBasePoints,
      grade_multiplier: calculation.bestTimeMultiplier,
      final_points: calculation.bestTimeFinalPoints,
      time_milliseconds: calculation.bestTimeMs,
      is_average: false
    })
  }

  // Average time points (if any)
  if (calculation.averageTimeFinalPoints > 0) {
    transactions.push({
      competition_id: calculation.competitionId,
      competition_event_id: calculation.competitionEventId,
      round_id: calculation.roundId,
      student_id: calculation.studentId,
      school_id: calculation.schoolId,
      point_type: 'average_time',
      tier_achieved: calculation.averageTimeTier,
      base_points: calculation.averageTimeBasePoints,
      grade_multiplier: calculation.averageTimeMultiplier,
      final_points: calculation.averageTimeFinalPoints,
      time_milliseconds: calculation.averageTimeMs,
      is_average: true
    })
  }

  // PB Bonus
  if (calculation.pbBonus > 0) {
    transactions.push({
      competition_id: calculation.competitionId,
      competition_event_id: calculation.competitionEventId,
      round_id: calculation.roundId,
      student_id: calculation.studentId,
      school_id: calculation.schoolId,
      point_type: 'pb_bonus',
      tier_achieved: null,
      base_points: 1,
      grade_multiplier: calculation.bestTimeMultiplier,
      final_points: calculation.pbBonus,
      time_milliseconds: null,
      is_average: false
    })
  }

  // Clutch Bonus
  if (calculation.clutchBonus > 0) {
    transactions.push({
      competition_id: calculation.competitionId,
      competition_event_id: calculation.competitionEventId,
      round_id: calculation.roundId,
      student_id: calculation.studentId,
      school_id: calculation.schoolId,
      point_type: 'clutch_bonus',
      tier_achieved: null,
      base_points: 2,
      grade_multiplier: calculation.bestTimeMultiplier,
      final_points: calculation.clutchBonus,
      time_milliseconds: null,
      is_average: false
    })
  }

  // Streak Bonus
  if (calculation.streakBonus > 0) {
    transactions.push({
      competition_id: calculation.competitionId,
      competition_event_id: calculation.competitionEventId,
      round_id: calculation.roundId,
      student_id: calculation.studentId,
      school_id: calculation.schoolId,
      point_type: 'streak_bonus',
      tier_achieved: null,
      base_points: 3,
      grade_multiplier: calculation.bestTimeMultiplier,
      final_points: calculation.streakBonus,
      time_milliseconds: null,
      is_average: false
    })
  }

  if (transactions.length === 0) {
    return [] // No points to record
  }

  // Insert all transactions
  try {
    const { data, error } = await supabase.from('point_transactions').insert(transactions).select()

    if (error) {
      console.error('Error recording point transactions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error inserting transactions:', error)
    return []
  }
}

/**
 * Record school momentum bonus for a round
 * Only call if school earned the bonus
 */
export async function recordSchoolMomentumBonus(
  competitionId: string,
  competitionEventId: string,
  roundId: string,
  schoolId: string,
  bonusAmount: number = 5
): Promise<PointTransaction | null> {
  if (bonusAmount <= 0) return null

  const supabase = createClient()

  const transaction: PointTransaction = {
    competition_id: competitionId,
    competition_event_id: competitionEventId,
    round_id: roundId,
    student_id: '', // No individual student - this is a school-level transaction
    school_id: schoolId,
    point_type: 'school_momentum_bonus',
    tier_achieved: null,
    base_points: bonusAmount,
    grade_multiplier: 1.0,
    final_points: bonusAmount,
    time_milliseconds: null,
    is_average: false
  }

  try {
    const { data, error } = await supabase
      .from('point_transactions')
      .insert([transaction])
      .select()
      .single()

    if (error) {
      console.error('Error recording school momentum bonus:', error)
      return null
    }

    return data || null
  } catch (error) {
    console.error('Error inserting school momentum bonus:', error)
    return null
  }
}

/**
 * Get point transaction history for a student
 */
export async function getStudentPointHistory(
  studentId: string,
  competitionId?: string
): Promise<PointTransaction[]> {
  const supabase = createClient()

  let query = supabase.from('point_transactions').select('*').eq('student_id', studentId)

  if (competitionId) {
    query = query.eq('competition_id', competitionId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching student point history:', error)
    return []
  }

  return (data || []) as PointTransaction[]
}

/**
 * Get point transaction history for a school
 */
export async function getSchoolPointHistory(
  schoolId: string,
  competitionId?: string
): Promise<PointTransaction[]> {
  const supabase = createClient()

  let query = supabase.from('point_transactions').select('*').eq('school_id', schoolId)

  if (competitionId) {
    query = query.eq('competition_id', competitionId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching school point history:', error)
    return []
  }

  return (data || []) as PointTransaction[]
}

/**
 * Delete point transactions for a round (for corrections)
 * Should only be used by admins for competition corrections
 */
export async function deleteRoundPointTransactions(roundId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from('point_transactions').delete().eq('round_id', roundId)

    if (error) {
      console.error('Error deleting point transactions:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting transactions:', error)
    return false
  }
}
