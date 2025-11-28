/**
 * School Standings Aggregation
 * Aggregates student points to school leaderboards
 * Updates school_standings table with pre-computed totals
 */

import { createClient } from '@/lib/supabase/client'

export interface SchoolStandingsRecord {
  id?: string
  competition_id: string
  school_id: string
  total_points: number
  best_time_points: number
  average_time_points: number
  bonus_points: number
  total_students: number
  average_points_per_student: number
  total_pb_count: number
  total_dnf_count: number
  overall_rank?: number
  division_rank?: number
  last_updated?: string
}

/**
 * Aggregate points for a school in a competition
 * Sums all point transactions and calculates metrics
 */
export async function aggregateSchoolPoints(
  competitionId: string,
  schoolId: string
): Promise<SchoolStandingsRecord | null> {
  const supabase = createClient()

  try {
    // Query all point transactions for this school in this competition
    const { data: transactions, error: transError } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('competition_id', competitionId)
      .eq('school_id', schoolId)

    if (transError) {
      console.error('Error fetching point transactions:', transError)
      return null
    }

    if (!transactions || transactions.length === 0) {
      return {
        competition_id: competitionId,
        school_id: schoolId,
        total_points: 0,
        best_time_points: 0,
        average_time_points: 0,
        bonus_points: 0,
        total_students: 0,
        average_points_per_student: 0,
        total_pb_count: 0,
        total_dnf_count: 0
      }
    }

    // Aggregate totals by point type
    const bestTimePoints = transactions
      .filter(t => t.point_type === 'best_time')
      .reduce((sum, t) => sum + t.final_points, 0)

    const averageTimePoints = transactions
      .filter(t => t.point_type === 'average_time')
      .reduce((sum, t) => sum + t.final_points, 0)

    const bonusPoints = transactions
      .filter(t =>
        ['pb_bonus', 'clutch_bonus', 'streak_bonus', 'school_momentum_bonus'].includes(t.point_type)
      )
      .reduce((sum, t) => sum + t.final_points, 0)

    const totalPoints = bestTimePoints + averageTimePoints + bonusPoints

    // Count PBs
    const pbCount = transactions.filter(t => t.point_type === 'pb_bonus').length

    // Count unique students who participated
    const uniqueStudents = new Set(transactions.map(t => t.student_id).filter(id => id))
    const totalStudents = uniqueStudents.size

    // Count DNFs
    const { data: dnfData, error: dnfError } = await supabase
      .from('results')
      .select('id')
      .eq('is_dnf', true)
      .in(
        'student_id',
        Array.from(uniqueStudents)
      )

    const dnfCount = dnfError ? 0 : (dnfData?.length ?? 0)

    const averagePointsPerStudent = totalStudents > 0 ? totalPoints / totalStudents : 0

    return {
      competition_id: competitionId,
      school_id: schoolId,
      total_points: totalPoints,
      best_time_points: bestTimePoints,
      average_time_points: averageTimePoints,
      bonus_points: bonusPoints,
      total_students: totalStudents,
      average_points_per_student: averagePointsPerStudent,
      total_pb_count: pbCount,
      total_dnf_count: dnfCount
    }
  } catch (error) {
    console.error('Error aggregating school points:', error)
    return null
  }
}

/**
 * Update school standings record in database
 * Creates or updates the school_standings entry
 */
export async function updateSchoolStanding(standing: SchoolStandingsRecord): Promise<boolean> {
  const supabase = createClient()

  try {
    // Check if record exists
    const { data: existing, error: checkError } = await supabase
      .from('school_standings')
      .select('id')
      .eq('competition_id', standing.competition_id)
      .eq('school_id', standing.school_id)
      .single()

    if (existing && !checkError) {
      // Update existing
      const { error: updateError } = await supabase
        .from('school_standings')
        .update({
          ...standing,
          last_updated: new Date().toISOString()
        })
        .eq('competition_id', standing.competition_id)
        .eq('school_id', standing.school_id)

      if (updateError) {
        console.error('Error updating school standing:', updateError)
        return false
      }
    } else {
      // Insert new
      const { error: insertError } = await supabase.from('school_standings').insert([
        {
          ...standing,
          last_updated: new Date().toISOString()
        }
      ])

      if (insertError) {
        console.error('Error inserting school standing:', insertError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error saving school standing:', error)
    return false
  }
}

/**
 * Aggregate standings for entire competition
 * Call after each round completes
 */
export async function updateAllSchoolStandingsForCompetition(competitionId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Get all schools with students in this competition
    const { data: schools, error: schoolsError } = await supabase
      .from('point_transactions')
      .select('school_id')
      .eq('competition_id', competitionId)
      .neq('school_id', null)

    if (schoolsError) {
      console.error('Error fetching schools:', schoolsError)
      return false
    }

    if (!schools || schools.length === 0) {
      return true // No schools yet
    }

    // Get unique school IDs
    const uniqueSchoolIds = Array.from(new Set(schools.map(s => s.school_id)))

    // Aggregate and update standings for each school
    for (const schoolId of uniqueSchoolIds) {
      const standing = await aggregateSchoolPoints(competitionId, schoolId)
      if (standing) {
        await updateSchoolStanding(standing)
      }
    }

    // Calculate rankings
    await calculateSchoolRankings(competitionId)

    return true
  } catch (error) {
    console.error('Error updating all school standings:', error)
    return false
  }
}

/**
 * Calculate rankings for schools
 * Sets overall_rank and division_rank
 */
export async function calculateSchoolRankings(competitionId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Get all standings sorted by points
    const { data: standings, error: standingsError } = await supabase
      .from('school_standings')
      .select(
        `
        id,
        school_id,
        total_points,
        schools!inner(division)
      `
      )
      .eq('competition_id', competitionId)
      .order('total_points', { ascending: false })

    if (standingsError) {
      console.error('Error fetching standings:', standingsError)
      return false
    }

    if (!standings || standings.length === 0) {
      return true
    }

    // Assign overall ranks
    for (let i = 0; i < standings.length; i++) {
      await supabase
        .from('school_standings')
        .update({ overall_rank: i + 1 })
        .eq('id', standings[i].id)
    }

    // Assign division ranks
    const divisions = ['A', 'B', 'C']
    for (const division of divisions) {
      const divisionStandings = standings.filter(s => (s.schools as any).division === division)

      for (let i = 0; i < divisionStandings.length; i++) {
        await supabase
          .from('school_standings')
          .update({ division_rank: i + 1 })
          .eq('id', divisionStandings[i].id)
      }
    }

    return true
  } catch (error) {
    console.error('Error calculating rankings:', error)
    return false
  }
}

/**
 * Get school standings for a competition
 */
export async function getCompetitionSchoolStandings(
  competitionId: string,
  limit?: number
): Promise<any[]> {
  const supabase = createClient()

  let query = supabase
    .from('school_standings')
    .select(
      `
      *,
      schools!inner(
        id,
        name,
        abbreviation,
        division,
        logo_url,
        color_hex
      )
    `
    )
    .eq('competition_id', competitionId)
    .order('overall_rank', { ascending: true })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching school standings:', error)
    return []
  }

  return data || []
}

/**
 * Get school standings for a specific division
 */
export async function getDivisionStandings(
  competitionId: string,
  division: 'A' | 'B' | 'C'
): Promise<any[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('school_standings')
    .select(
      `
      *,
      schools!inner(
        id,
        name,
        abbreviation,
        division,
        logo_url,
        color_hex
      )
    `
    )
    .eq('competition_id', competitionId)
    .eq('schools.division', division)
    .order('division_rank', { ascending: true })

  if (error) {
    console.error('Error fetching division standings:', error)
    return []
  }

  return data || []
}
