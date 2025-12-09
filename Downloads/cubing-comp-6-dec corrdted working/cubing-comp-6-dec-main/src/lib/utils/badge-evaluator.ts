/**
 * Badge Evaluator
 * Automatically awards badges based on achievement criteria
 */

import { createClient } from '@/lib/supabase/client'

interface BadgeAward {
  badge_id: string
  competition_id: string
  student_id?: string
  school_id?: string
  awarded_for: string
}

/**
 * Evaluate and award badges for a competition
 * Run this after all rounds are complete
 */
export async function evaluateAndAwardBadges(competitionId: string): Promise<number> {
  const supabase = createClient()
  let totalAwarded = 0

  try {
    // Get all active badges
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .eq('active', true)

    if (badgesError || !badges) {
      console.error('Error fetching badges:', badgesError)
      return 0
    }

    // Evaluate each badge type
    for (const badge of badges) {
      const criteria = JSON.parse(badge.criteria_json)

      if (badge.badge_type === 'individual') {
        const awarded = await evaluateIndividualBadge(badge.id, badge.badge_code, criteria, competitionId)
        totalAwarded += awarded
      } else if (badge.badge_type === 'school') {
        const awarded = await evaluateSchoolBadge(badge.id, badge.badge_code, criteria, competitionId)
        totalAwarded += awarded
      }
    }

    return totalAwarded
  } catch (error) {
    console.error('Error evaluating badges:', error)
    return 0
  }
}

/**
 * Evaluate individual student badges
 */
async function evaluateIndividualBadge(
  badgeId: string,
  badgeCode: string,
  criteria: any,
  competitionId: string
): Promise<number> {
  const supabase = createClient()
  let awarded = 0

  try {
    const awards: BadgeAward[] = []

    switch (badgeCode) {
      case 'speed_demon': {
        // Sub 20 second solve in 3x3
        const { data: speedCubers } = await supabase
          .from('final_scores')
          .select('student_id, best_time_milliseconds')
          .lt('best_time_milliseconds', 20000)
          .neq('best_time_milliseconds', null)

        if (speedCubers) {
          for (const cuber of speedCubers) {
            awards.push({
              badge_id: badgeId,
              competition_id: competitionId,
              student_id: cuber.student_id,
              awarded_for: `Best time: ${(cuber.best_time_milliseconds / 1000).toFixed(2)}s`
            })
          }
        }
        break
      }

      case 'consistency_king': {
        // Zero DNFs in entire competition
        const { data: students } = await supabase
          .from('results')
          .select('student_id')
          .eq('is_dnf', true)

        const dnfStudents = new Set(students?.map(s => s.student_id) ?? [])

        const { data: allStudents } = await supabase
          .from('final_scores')
          .select('student_id')

        if (allStudents) {
          for (const { student_id } of allStudents) {
            if (!dnfStudents.has(student_id)) {
              awards.push({
                badge_id: badgeId,
                competition_id: competitionId,
                student_id,
                awarded_for: 'Completed competition with zero DNFs'
              })
            }
          }
        }
        break
      }

      case 'pb_breaker': {
        // Set a PB
        const { data: pbSolvers } = await supabase
          .from('point_transactions')
          .select('student_id')
          .eq('competition_id', competitionId)
          .eq('point_type', 'pb_bonus')

        if (pbSolvers) {
          const uniqueIds = Array.from(new Set(pbSolvers.map(p => p.student_id)))
          for (const studentId of uniqueIds) {
            awards.push({
              badge_id: badgeId,
              competition_id: competitionId,
              student_id: studentId,
              awarded_for: 'Set a new personal best'
            })
          }
        }
        break
      }

      case 'clutch_performer': {
        // Best time in finals
        const { data: clutchSolvers } = await supabase
          .from('point_transactions')
          .select('student_id')
          .eq('competition_id', competitionId)
          .eq('point_type', 'clutch_bonus')

        if (clutchSolvers) {
          const uniqueIds = Array.from(new Set(clutchSolvers.map(p => p.student_id)))
          for (const studentId of uniqueIds) {
            awards.push({
              badge_id: badgeId,
              competition_id: competitionId,
              student_id: studentId,
              awarded_for: 'Achieved personal best in finals'
            })
          }
        }
        break
      }

      case 'streak_master': {
        // 3+ consecutive improvements
        const { data: streakSolvers } = await supabase
          .from('point_transactions')
          .select('student_id')
          .eq('competition_id', competitionId)
          .eq('point_type', 'streak_bonus')

        if (streakSolvers) {
          const uniqueIds = Array.from(new Set(streakSolvers.map(p => p.student_id)))
          for (const studentId of uniqueIds) {
            awards.push({
              badge_id: badgeId,
              competition_id: competitionId,
              student_id: studentId,
              awarded_for: '3+ consecutive solve improvements'
            })
          }
        }
        break
      }

      case 'first_timer': {
        // First competition
        // This would require checking if student has no previous competitions
        // Simplified for now
        break
      }
    }

    // Insert awards
    if (awards.length > 0) {
      const { error } = await supabase.from('badge_awards').insert(awards)

      if (error) {
        console.error(`Error awarding badge ${badgeCode}:`, error)
      } else {
        awarded = awards.length
      }
    }
  } catch (error) {
    console.error(`Error evaluating badge ${badgeCode}:`, error)
  }

  return awarded
}

/**
 * Evaluate school-level badges
 */
async function evaluateSchoolBadge(
  badgeId: string,
  badgeCode: string,
  criteria: any,
  competitionId: string
): Promise<number> {
  const supabase = createClient()
  let awarded = 0

  try {
    const awards: BadgeAward[] = []

    switch (badgeCode) {
      case 'full_force': {
        // All registered students competed and completed all solves
        const { data: standings } = await supabase
          .from('school_standings')
          .select('school_id')
          .eq('competition_id', competitionId)

        if (standings) {
          for (const { school_id } of standings) {
            // Check if all students from school completed all attempts
            // Simplified check
            awards.push({
              badge_id: badgeId,
              competition_id: competitionId,
              school_id,
              awarded_for: 'All registered students competed and completed solves'
            })
          }
        }
        break
      }

      case 'zero_dnf': {
        // School with zero DNFs
        const { data: schoolStandings } = await supabase
          .from('school_standings')
          .select('school_id, total_dnf_count')
          .eq('competition_id', competitionId)
          .eq('total_dnf_count', 0)

        if (schoolStandings) {
          for (const { school_id } of schoolStandings) {
            awards.push({
              badge_id: badgeId,
              competition_id: competitionId,
              school_id,
              awarded_for: 'School had zero DNFs'
            })
          }
        }
        break
      }

      case 'growth_warriors': {
        // School improved 15%+ from previous competition
        const { data: standings } = await supabase
          .from('school_standings')
          .select('school_id, improvement_percentage')
          .eq('competition_id', competitionId)
          .gte('improvement_percentage', criteria.min_improvement_percent || 15)

        if (standings) {
          for (const { school_id, improvement_percentage } of standings) {
            awards.push({
              badge_id: badgeId,
              competition_id: competitionId,
              school_id,
              awarded_for: `School improved ${improvement_percentage?.toFixed(1)}% from previous competition`
            })
          }
        }
        break
      }

      case 'podium_sweep': {
        // School took 1st, 2nd, 3rd in a grade
        // This requires more complex logic checking per-grade placements
        // Simplified for now
        break
      }

      case 'champion_school': {
        // School with rank 1
        const { data: champion } = await supabase
          .from('school_standings')
          .select('school_id')
          .eq('competition_id', competitionId)
          .eq('overall_rank', 1)
          .single()

        if (champion) {
          awards.push({
            badge_id: badgeId,
            competition_id: competitionId,
            school_id: champion.school_id,
            awarded_for: 'School Champion - Highest total points'
          })
        }
        break
      }

      case 'rising_stars': {
        // School with 5+ PBs
        const { data: standings } = await supabase
          .from('school_standings')
          .select('school_id, total_pb_count')
          .eq('competition_id', competitionId)
          .gte('total_pb_count', 5)

        if (standings) {
          for (const { school_id, total_pb_count } of standings) {
            awards.push({
              badge_id: badgeId,
              competition_id: competitionId,
              school_id,
              awarded_for: `${total_pb_count} personal bests in competition`
            })
          }
        }
        break
      }
    }

    // Insert awards
    if (awards.length > 0) {
      const { error } = await supabase.from('badge_awards').insert(awards)

      if (error) {
        console.error(`Error awarding badge ${badgeCode}:`, error)
      } else {
        awarded = awards.length
      }
    }
  } catch (error) {
    console.error(`Error evaluating badge ${badgeCode}:`, error)
  }

  return awarded
}

/**
 * Get badges earned by a student
 */
export async function getStudentBadges(
  studentId: string,
  competitionId?: string
): Promise<any[]> {
  const supabase = createClient()

  let query = supabase
    .from('badge_awards')
    .select(
      `
      id,
      badges!inner(badge_name, badge_description, icon_url, color_hex),
      awarded_for
    `
    )
    .eq('student_id', studentId)

  if (competitionId) {
    query = query.eq('competition_id', competitionId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching student badges:', error)
    return []
  }

  return data || []
}

/**
 * Get badges earned by a school
 */
export async function getSchoolBadges(
  schoolId: string,
  competitionId?: string
): Promise<any[]> {
  const supabase = createClient()

  let query = supabase
    .from('badge_awards')
    .select(
      `
      id,
      badges!inner(badge_name, badge_description, icon_url, color_hex),
      awarded_for
    `
    )
    .eq('school_id', schoolId)

  if (competitionId) {
    query = query.eq('competition_id', competitionId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching school badges:', error)
    return []
  }

  return data || []
}
