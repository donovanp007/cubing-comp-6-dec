'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Update student competition history when times are recorded
 * This ensures the rankings page has data to pull from
 */
export async function updateCompetitionHistory(
  studentId: string,
  competitionId: string,
  eventTypeId: string,
  finalScoreId: string | null,
  bestSingle: number | null,
  bestAverage: number | null
) {
  const supabase = await createClient()

  try {
    // Check if student already has a PB record for this event
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
      if (previousPBs.best_single_milliseconds && bestSingle && bestSingle > 0) {
        improvementSingle = ((previousPBs.best_single_milliseconds - bestSingle) / previousPBs.best_single_milliseconds) * 100
      }
      if (previousPBs.best_average_milliseconds && bestAverage && bestAverage > 0) {
        improvementAverage = ((previousPBs.best_average_milliseconds - bestAverage) / previousPBs.best_average_milliseconds) * 100
      }
    }

    // Determine if this is a personal best
    const isPBSingle = bestSingle && bestSingle > 0 && (!previousPBs || bestSingle < (previousPBs.best_single_milliseconds || Infinity))
    const isPBAverage = bestAverage && bestAverage > 0 && (!previousPBs || bestAverage < (previousPBs.best_average_milliseconds || Infinity))

    // Upsert into student_competition_history
    const { error: historyError } = await supabase
      .from('student_competition_history')
      .upsert(
        {
          student_id: studentId,
          competition_id: competitionId,
          event_type_id: eventTypeId,
          final_score_id: finalScoreId,
          best_single_milliseconds: bestSingle,
          best_average_milliseconds: bestAverage,
          is_pb_single: isPBSingle ? true : false,
          is_pb_average: isPBAverage ? true : false,
          is_record_single: false, // Records handled separately
          is_record_average: false,
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

    if (historyError) {
      console.error('Error updating student competition history:', historyError)
      return { success: false, error: historyError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in updateCompetitionHistory:', error)
    return { success: false, error: String(error) }
  }
}
