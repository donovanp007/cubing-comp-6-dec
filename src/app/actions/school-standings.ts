'use server'

/**
 * Server actions for school standings and leaderboards
 */

import { createClient } from '@/lib/supabase/server'

export interface SchoolStandingRow {
  id: string
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
  overall_rank: number | null
  division_rank: number | null
  improvement_percentage: number | null
  schools: {
    id: string
    name: string
    abbreviation: string
    division: string
    logo_url: string | null
    color_hex: string
  }
}

/**
 * Get all school standings for a competition
 */
export async function getCompetitionStandings(competitionId: string): Promise<SchoolStandingRow[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('school_standings')
      .select(`
        *,
        schools!inner(
          id,
          name,
          abbreviation,
          division,
          logo_url,
          color_hex
        )
      `)
      .eq('competition_id', competitionId)
      .order('overall_rank', { ascending: true })

    if (error) {
      console.error('Error fetching standings:', error)
      return []
    }

    return (data as any[]) || []
  } catch (error) {
    console.error('Error in getCompetitionStandings:', error)
    return []
  }
}

/**
 * Get standings for a specific division
 */
export async function getDivisionStandings(
  competitionId: string,
  division: 'A' | 'B' | 'C'
): Promise<SchoolStandingRow[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('school_standings')
      .select(`
        *,
        schools!inner(
          id,
          name,
          abbreviation,
          division,
          logo_url,
          color_hex
        )
      `)
      .eq('competition_id', competitionId)
      .eq('schools.division', division)
      .order('division_rank', { ascending: true })

    if (error) {
      console.error('Error fetching division standings:', error)
      return []
    }

    return (data as any[]) || []
  } catch (error) {
    console.error('Error in getDivisionStandings:', error)
    return []
  }
}

/**
 * Get top schools across all divisions
 */
export async function getTopSchools(competitionId: string, limit: number = 10): Promise<SchoolStandingRow[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('school_standings')
      .select(`
        *,
        schools!inner(
          id,
          name,
          abbreviation,
          division,
          logo_url,
          color_hex
        )
      `)
      .eq('competition_id', competitionId)
      .order('total_points', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching top schools:', error)
      return []
    }

    return (data as any[]) || []
  } catch (error) {
    console.error('Error in getTopSchools:', error)
    return []
  }
}

/**
 * Get school's detailed stats
 */
export async function getSchoolStats(
  competitionId: string,
  schoolId: string
): Promise<{
  standing: SchoolStandingRow | null
  studentBreakdown: Array<{
    student_id: string
    name: string
    grade: string
    total_points: number
    pb_count: number
  }>
}> {
  const supabase = await createClient()

  try {
    // Get school standing
    const { data: standingData, error: standingError } = await supabase
      .from('school_standings')
      .select(`
        *,
        schools!inner(
          id,
          name,
          abbreviation,
          division,
          logo_url,
          color_hex
        )
      `)
      .eq('competition_id', competitionId)
      .eq('school_id', schoolId)
      .single()

    if (standingError) {
      console.error('Error fetching school standing:', standingError)
      return { standing: null, studentBreakdown: [] }
    }

    // Get student breakdown
    const { data: studentData, error: studentError } = await supabase
      .from('point_transactions')
      .select(`
        student_id,
        students!inner(first_name, last_name, grade),
        point_type,
        final_points
      `)
      .eq('competition_id', competitionId)
      .eq('school_id', schoolId)

    if (studentError) {
      console.error('Error fetching student breakdown:', studentError)
      return { standing: standingData as any, studentBreakdown: [] }
    }

    // Aggregate by student
    const studentMap = new Map<
      string,
      { name: string; grade: string; points: number; pbCount: number }
    >()

    ;(studentData as any[]).forEach((trans) => {
      const studentId = trans.student_id
      const student = trans.students
      const existing = studentMap.get(studentId) || {
        name: `${student.first_name} ${student.last_name}`,
        grade: student.grade,
        points: 0,
        pbCount: 0
      }

      existing.points += trans.final_points
      if (trans.point_type === 'pb_bonus') {
        existing.pbCount += 1
      }

      studentMap.set(studentId, existing)
    })

    const breakdown = Array.from(studentMap.entries())
      .map(([studentId, data]) => ({
        student_id: studentId,
        name: data.name,
        grade: data.grade,
        total_points: data.points,
        pb_count: data.pbCount
      }))
      .sort((a, b) => b.total_points - a.total_points)

    return { standing: standingData as any, studentBreakdown: breakdown }
  } catch (error) {
    console.error('Error in getSchoolStats:', error)
    return { standing: null, studentBreakdown: [] }
  }
}

/**
 * Get competition info for display
 */
export async function getCompetitionInfo(competitionId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('competitions')
      .select('id, name, location, competition_date')
      .eq('id', competitionId)
      .single()

    if (error) {
      console.error('Error fetching competition:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getCompetitionInfo:', error)
    return null
  }
}
