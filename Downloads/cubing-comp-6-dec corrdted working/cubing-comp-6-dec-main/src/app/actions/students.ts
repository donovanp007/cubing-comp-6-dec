'use server'

/**
 * Server actions for student profile data including points and tier history
 */

import { createClient } from '@/lib/supabase/server'

export interface StudentPointRecord {
  competition_id: string
  competition_name: string
  competition_date: string
  event_id: string
  event_name: string
  round_id: string
  round_name: string
  round_number: number
  total_points: number
  best_time_points: number
  average_time_points: number
  bonus_points: number
  bonus_details: {
    pb_bonus: number
    clutch_bonus: number
    streak_bonus: number
    school_momentum_bonus: number
  }
}

export interface StudentTierAchievement {
  competition_id: string
  event_id: string
  round_id: string
  round_number: number
  tier: 'S' | 'A' | 'B' | 'C' | 'D'
  time_ms: number
  is_dnf: boolean
}

export interface StudentPointSummary {
  total_career_points: number
  total_competitions: number
  competitions_by_type: {
    event_type_id: string
    event_name: string
    competitions_count: number
    total_points: number
    avg_points_per_comp: number
  }[]
}

/**
 * Get all point transactions for a student across all competitions
 */
export async function getStudentPointHistory(
  studentId: string
): Promise<StudentPointRecord[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('point_transactions')
      .select(`
        competition_id,
        student_id,
        competitions!inner(
          id,
          name,
          competition_date
        ),
        rounds!inner(
          id,
          round_number,
          round_name,
          competition_events!inner(
            id,
            event_type_id,
            event_types!inner(
              id,
              name,
              display_name
            )
          )
        ),
        point_type,
        final_points
      `)
      .eq('student_id', studentId)
      .order('competitions(competition_date)', { ascending: false })

    if (error) {
      console.error('Error fetching student points:', error)
      return []
    }

    // Aggregate by competition/round
    const recordMap = new Map<string, StudentPointRecord>()

    ;(data as any[]).forEach((trans) => {
      const key = `${trans.competition_id}-${trans.rounds.id}`

      if (!recordMap.has(key)) {
        recordMap.set(key, {
          competition_id: trans.competition_id,
          competition_name: trans.competitions.name,
          competition_date: trans.competitions.competition_date,
          event_id: trans.rounds.competition_events.id,
          event_name: trans.rounds.competition_events.event_types.display_name,
          round_id: trans.rounds.id,
          round_name: trans.rounds.round_name,
          round_number: trans.rounds.round_number,
          total_points: 0,
          best_time_points: 0,
          average_time_points: 0,
          bonus_points: 0,
          bonus_details: {
            pb_bonus: 0,
            clutch_bonus: 0,
            streak_bonus: 0,
            school_momentum_bonus: 0
          }
        })
      }

      const record = recordMap.get(key)!
      record.total_points += trans.final_points

      switch (trans.point_type) {
        case 'best_time':
          record.best_time_points += trans.final_points
          break
        case 'average_time':
          record.average_time_points += trans.final_points
          break
        case 'pb_bonus':
          record.bonus_details.pb_bonus += trans.final_points
          record.bonus_points += trans.final_points
          break
        case 'clutch_bonus':
          record.bonus_details.clutch_bonus += trans.final_points
          record.bonus_points += trans.final_points
          break
        case 'streak_bonus':
          record.bonus_details.streak_bonus += trans.final_points
          record.bonus_points += trans.final_points
          break
        case 'school_momentum_bonus':
          record.bonus_details.school_momentum_bonus += trans.final_points
          record.bonus_points += trans.final_points
          break
      }
    })

    return Array.from(recordMap.values())
  } catch (error) {
    console.error('Error in getStudentPointHistory:', error)
    return []
  }
}

/**
 * Get point summary for student
 */
export async function getStudentPointSummary(
  studentId: string
): Promise<StudentPointSummary | null> {
  const supabase = await createClient()

  try {
    // Get all point transactions
    const { data: transactions, error: transError } = await supabase
      .from('point_transactions')
      .select(`
        final_points,
        rounds!inner(
          competition_events!inner(
            event_type_id,
            event_types!inner(
              id,
              name,
              display_name
            )
          ),
          competition_event_id
        ),
        competitions!inner(
          id
        )
      `)
      .eq('student_id', studentId)

    if (transError || !transactions) {
      console.error('Error fetching point summary:', transError)
      return null
    }

    const totalPoints = (transactions as any[]).reduce(
      (sum, t) => sum + t.final_points,
      0
    )

    // Get competition count
    const { data: competitions, error: compError } = await supabase
      .from('competitions')
      .select('id')

    if (compError || !competitions) {
      return {
        total_career_points: totalPoints,
        total_competitions: 0,
        competitions_by_type: []
      }
    }

    // Count competitions where student participated
    const { data: studentComps, error: scError } = await supabase
      .from('final_scores')
      .select('round_id, rounds!inner(competition_events!inner(event_type_id))')
      .eq('student_id', studentId)

    const totalComps = new Set(
      (studentComps as any[])?.map((sc) => sc.rounds.competition_events.event_type_id) || []
    ).size

    // Group by event type
    const eventMap = new Map<string, any>()

    ;(transactions as any[]).forEach((trans) => {
      const eventId = trans.rounds.competition_events.event_type_id
      const eventName = trans.rounds.competition_events.event_types.display_name

      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          event_type_id: eventId,
          event_name: eventName,
          competitions_count: 0,
          total_points: 0
        })
      }

      const event = eventMap.get(eventId)!
      event.total_points += trans.final_points
    })

    const byType = Array.from(eventMap.values()).map((evt) => ({
      ...evt,
      avg_points_per_comp:
        evt.competitions_count > 0
          ? Math.round((evt.total_points / evt.competitions_count) * 10) / 10
          : 0
    }))

    return {
      total_career_points: totalPoints,
      total_competitions: totalComps,
      competitions_by_type: byType
    }
  } catch (error) {
    console.error('Error in getStudentPointSummary:', error)
    return null
  }
}

/**
 * Get student's contribution to school standings
 */
export async function getStudentSchoolContribution(
  studentId: string,
  competitionId: string
): Promise<{
  school_id: string | null
  school_name: string | null
  school_division: string | null
  total_points: number
  rank_in_school: number | null
} | null> {
  const supabase = await createClient()

  try {
    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('school_id, school')
      .eq('id', studentId)
      .single()

    if (studentError) {
      console.error('Error fetching student:', studentError)
      return null
    }

    // Get school info
    let schoolData = null
    if (student.school_id) {
      const { data } = await supabase
        .from('schools')
        .select('id, name, division')
        .eq('id', student.school_id)
        .single()
      schoolData = data
    }

    // Get student's points in this competition
    const { data: points, error: pointsError } = await supabase
      .from('point_transactions')
      .select('final_points')
      .eq('student_id', studentId)
      .eq('competition_id', competitionId)

    if (pointsError) {
      console.error('Error fetching points:', pointsError)
      return null
    }

    const studentPoints = (points as any[]).reduce((sum, p) => sum + p.final_points, 0)

    // Get rank in school
    const { data: schoolPoints, error: schoolError } = await supabase
      .from('point_transactions')
      .select('student_id, final_points')
      .eq('competition_id', competitionId)
      .eq('school_id', student.school_id || '')

    let rankInSchool = null
    if (schoolError === null && schoolPoints) {
      const studentTotals = new Map<string, number>()
      ;(schoolPoints as any[]).forEach((p) => {
        const current = studentTotals.get(p.student_id) || 0
        studentTotals.set(p.student_id, current + p.final_points)
      })

      const sorted = Array.from(studentTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .map((e) => e[0])

      rankInSchool = sorted.indexOf(studentId) + 1
    }

    return {
      school_id: student.school_id || null,
      school_name: schoolData?.name || student.school || null,
      school_division: schoolData?.division || null,
      total_points: studentPoints,
      rank_in_school: rankInSchool
    }
  } catch (error) {
    console.error('Error in getStudentSchoolContribution:', error)
    return null
  }
}
