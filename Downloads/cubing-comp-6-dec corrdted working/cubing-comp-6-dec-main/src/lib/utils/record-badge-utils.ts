/**
 * Utilities for managing record and PB badges
 * Integrates record breaking and personal best achievement tracking
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Check if a student breaks a record and award badge if applicable
 */
export async function checkAndAwardRecordBadge(
  studentId: string,
  competitionId: string,
  eventTypeId: string,
  bestSingle: number,
  bestAverage: number,
  badgeId: string | null = null
) {
  const supabase = await createClient()

  try {
    // Get baseline records
    const { data: baselineRecords, error: baselineError } = await supabase
      .from('competition_records')
      .select('*')
      .eq('student_id', studentId)
      .eq('event_type_id', eventTypeId)
      .eq('is_baseline', true)
      .single()

    if (baselineError && baselineError.code !== 'PGRST116') {
      console.error('Error fetching baseline records:', baselineError)
      return { awarded: false, type: null }
    }

    if (!baselineRecords) {
      // No baseline to compare against
      return { awarded: false, type: null }
    }

    const isRecordSingle = bestSingle > 0 && bestSingle < baselineRecords.record_single_milliseconds
    const isRecordAverage =
      bestAverage > 0 && bestAverage < baselineRecords.record_average_milliseconds

    if (!isRecordSingle && !isRecordAverage) {
      return { awarded: false, type: null }
    }

    // Get record breaking badge ID if not provided
    let recordBadgeId = badgeId
    if (!recordBadgeId) {
      const { data: badges } = await supabase
        .from('badges')
        .select('id')
        .eq('badge_code', 'record_breaker')
        .single()
      recordBadgeId = badges?.id || null
    }

    if (!recordBadgeId) {
      return { awarded: false, type: null }
    }

    // Award badge
    const recordType = isRecordSingle && isRecordAverage ? 'both' : isRecordSingle ? 'single' : 'average'

    const { error: awardError } = await supabase.from('badge_awards').insert({
      badge_id: recordBadgeId,
      competition_id: competitionId,
      student_id: studentId,
      awarded_for: `Record ${recordType === 'both' ? 'Single & Average' : recordType === 'single' ? 'Single: ' + formatTime(bestSingle) : 'Average: ' + formatTime(bestAverage)}`,
      awarded_at: new Date().toISOString(),
    })

    if (awardError) {
      console.error('Error awarding record badge:', awardError)
      return { awarded: false, type: null }
    }

    return { awarded: true, type: recordType }
  } catch (error) {
    console.error('Error in checkAndAwardRecordBadge:', error)
    return { awarded: false, type: null }
  }
}

/**
 * Check if a student achieves a personal best and award badge if applicable
 */
export async function checkAndAwardPBBadge(
  studentId: string,
  competitionId: string,
  eventTypeId: string,
  bestSingle: number,
  bestAverage: number,
  badgeId: string | null = null
) {
  const supabase = await createClient()

  try {
    // Get personal best record
    const { data: pbRecords, error: pbError } = await supabase
      .from('personal_bests')
      .select('*')
      .eq('student_id', studentId)
      .eq('event_type_id', eventTypeId)
      .single()

    if (pbError && pbError.code !== 'PGRST116') {
      console.error('Error fetching personal best:', pbError)
      return { awarded: false, type: null }
    }

    if (!pbRecords) {
      // First attempt in this event - this counts as PB
      const isPBSingle = bestSingle > 0
      const isPBAverage = bestAverage > 0

      if (!isPBSingle && !isPBAverage) {
        return { awarded: false, type: null }
      }

      // Award first attempt badge
      let pbBadgeId = badgeId
      if (!pbBadgeId) {
        const { data: badges } = await supabase
          .from('badges')
          .select('id')
          .eq('badge_code', 'first_pb')
          .single()
        pbBadgeId = badges?.id || null
      }

      if (!pbBadgeId) {
        return { awarded: false, type: null }
      }

      const { error: awardError } = await supabase.from('badge_awards').insert({
        badge_id: pbBadgeId,
        competition_id: competitionId,
        student_id: studentId,
        awarded_for: 'First official attempt',
        awarded_at: new Date().toISOString(),
      })

      if (awardError) {
        console.error('Error awarding first attempt badge:', awardError)
        return { awarded: false, type: null }
      }

      return { awarded: true, type: 'first_attempt' }
    }

    // Check if current performance beats personal best
    const isPBSingle = bestSingle > 0 && bestSingle < (pbRecords.best_single_milliseconds || Infinity)
    const isPBAverage =
      bestAverage > 0 && bestAverage < (pbRecords.best_average_milliseconds || Infinity)

    if (!isPBSingle && !isPBAverage) {
      return { awarded: false, type: null }
    }

    // Get PB badge ID if not provided
    let pbBadgeId = badgeId
    if (!pbBadgeId) {
      const { data: badges } = await supabase
        .from('badges')
        .select('id')
        .eq('badge_code', 'personal_best')
        .single()
      pbBadgeId = badges?.id || null
    }

    if (!pbBadgeId) {
      return { awarded: false, type: null }
    }

    // Award PB badge
    const pbType = isPBSingle && isPBAverage ? 'both' : isPBSingle ? 'single' : 'average'

    const { error: awardError } = await supabase.from('badge_awards').insert({
      badge_id: pbBadgeId,
      competition_id: competitionId,
      student_id: studentId,
      awarded_for: `Personal Best ${pbType === 'both' ? 'Single & Average' : pbType === 'single' ? 'Single: ' + formatTime(bestSingle) : 'Average: ' + formatTime(bestAverage)}`,
      awarded_at: new Date().toISOString(),
    })

    if (awardError) {
      console.error('Error awarding PB badge:', awardError)
      return { awarded: false, type: null }
    }

    return { awarded: true, type: pbType }
  } catch (error) {
    console.error('Error in checkAndAwardPBBadge:', error)
    return { awarded: false, type: null }
  }
}

/**
 * Update student competition history with record/PB information
 */
export async function updateStudentCompetitionHistory(
  studentId: string,
  competitionId: string,
  eventTypeId: string,
  finalScoreId: string,
  bestSingle: number,
  bestAverage: number,
  ranking: number
) {
  const supabase = await createClient()

  try {
    // Check for records
    const { data: recordCheck } = await supabase.rpc('check_record_break', {
      p_student_id: studentId,
      p_event_type_id: eventTypeId,
      p_best_single: bestSingle,
      p_best_average: bestAverage,
    })

    // Check for PBs
    const { data: pbCheck } = await supabase.rpc('check_personal_best', {
      p_student_id: studentId,
      p_event_type_id: eventTypeId,
      p_best_single: bestSingle,
      p_best_average: bestAverage,
    })

    // Get previous PBs for comparison
    const { data: previousPBs } = await supabase
      .from('personal_bests')
      .select('*')
      .eq('student_id', studentId)
      .eq('event_type_id', eventTypeId)
      .single()

    // Calculate improvement percentages
    let improvementSingle = null
    let improvementAverage = null

    if (previousPBs) {
      if (previousPBs.best_single_milliseconds && bestSingle > 0) {
        improvementSingle = ((previousPBs.best_single_milliseconds - bestSingle) / previousPBs.best_single_milliseconds) * 100
      }
      if (previousPBs.best_average_milliseconds && bestAverage > 0) {
        improvementAverage = ((previousPBs.best_average_milliseconds - bestAverage) / previousPBs.best_average_milliseconds) * 100
      }
    }

    // Insert or update competition history
    const { error } = await supabase.from('student_competition_history').upsert(
      {
        student_id: studentId,
        competition_id: competitionId,
        event_type_id: eventTypeId,
        final_score_id: finalScoreId,
        best_single_milliseconds: bestSingle,
        best_average_milliseconds: bestAverage,
        ranking,
        is_record_single: recordCheck?.is_record_single || false,
        is_record_average: recordCheck?.is_record_average || false,
        is_pb_single: pbCheck?.is_pb_single || false,
        is_pb_average: pbCheck?.is_pb_average || false,
        previous_pb_single_milliseconds: previousPBs?.best_single_milliseconds || null,
        previous_pb_average_milliseconds: previousPBs?.best_average_milliseconds || null,
        improvement_percent_single: improvementSingle,
        improvement_percent_average: improvementAverage,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'student_id,competition_id,event_type_id',
      }
    )

    if (error) {
      console.error('Error updating competition history:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      isRecord: recordCheck?.is_record_single || recordCheck?.is_record_average,
      isPB: pbCheck?.is_pb_single || pbCheck?.is_pb_average,
    }
  } catch (error) {
    console.error('Error in updateStudentCompetitionHistory:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Format time in milliseconds to readable format
 */
function formatTime(ms: number | null): string {
  if (!ms || ms <= 0) return 'DNF'
  return (ms / 1000).toFixed(2) + 's'
}

/**
 * Get achievement summary for a student
 */
export async function getStudentAchievementSummary(studentId: string) {
  const supabase = await createClient()

  try {
    // Count records
    const { count: recordCount } = await supabase
      .from('achievement_log')
      .select('*', { count: 'exact' })
      .eq('student_id', studentId)
      .contains('achievement_type', 'record')

    // Count PBs
    const { count: pbCount } = await supabase
      .from('achievement_log')
      .select('*', { count: 'exact' })
      .eq('student_id', studentId)
      .contains('achievement_type', 'pb')

    // Count badges
    const { count: badgeCount } = await supabase
      .from('badge_awards')
      .select('*', { count: 'exact' })
      .eq('student_id', studentId)

    return {
      records: recordCount || 0,
      pbs: pbCount || 0,
      badges: badgeCount || 0,
      totalAchievements: (recordCount || 0) + (pbCount || 0) + (badgeCount || 0),
    }
  } catch (error) {
    console.error('Error in getStudentAchievementSummary:', error)
    return {
      records: 0,
      pbs: 0,
      badges: 0,
      totalAchievements: 0,
    }
  }
}
