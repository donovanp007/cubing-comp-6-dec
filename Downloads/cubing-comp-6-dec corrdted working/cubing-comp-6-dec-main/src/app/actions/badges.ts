'use server'

/**
 * Server actions for badge management
 */

import { createClient } from '@/lib/supabase/server'

export interface BadgeRow {
  id: string
  badge_code: string
  badge_name: string
  badge_description: string
  badge_type: 'individual' | 'school'
  icon_url: string | null
  color_hex: string
  criteria_json: string
  sort_order: number
  active: boolean
}

/**
 * Get all badges
 */
export async function getAllBadges(): Promise<BadgeRow[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching badges:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllBadges:', error)
    return []
  }
}

/**
 * Get badges by type
 */
export async function getBadgesByType(type: 'individual' | 'school'): Promise<BadgeRow[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('badge_type', type)
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching badges:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getBadgesByType:', error)
    return []
  }
}

/**
 * Update badge activation status
 */
export async function toggleBadgeActive(id: string, active: boolean): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('badges').update({ active }).eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Update badge details
 */
export async function updateBadge(
  id: string,
  updates: {
    badge_name?: string
    badge_description?: string
    color_hex?: string
    criteria_json?: string
    sort_order?: number
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('badges')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Get badge awards for a competition
 */
export async function getBadgeAwardsForCompetition(competitionId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('badge_awards')
      .select(`
        *,
        badges!inner(badge_name, badge_description, icon_url),
        students(id, first_name, last_name),
        schools(id, name)
      `)
      .eq('competition_id', competitionId)
      .order('awarded_at', { ascending: false })

    if (error) {
      console.error('Error fetching badge awards:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getBadgeAwardsForCompetition:', error)
    return []
  }
}
