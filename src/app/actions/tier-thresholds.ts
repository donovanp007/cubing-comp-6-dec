'use server'

/**
 * Server actions for tier threshold management
 */

import { createClient } from '@/lib/supabase/server'

export interface TierThresholdRow {
  id: string
  event_type_id: string
  event_name?: string
  tier_name: 'S' | 'A' | 'B' | 'C' | 'D'
  tier_display_name: string
  min_time_milliseconds: number | null
  max_time_milliseconds: number | null
  base_points: number
  color_hex: string
  sort_order: number
  description: string
}

/**
 * Get all tier thresholds for an event type
 */
export async function getTierThresholdsForEvent(eventTypeId: string): Promise<TierThresholdRow[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('tier_thresholds')
      .select(`
        *,
        event_types!inner(name)
      `)
      .eq('event_type_id', eventTypeId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching tier thresholds:', error)
      return []
    }

    return (data as any[]).map(row => ({
      ...row,
      event_name: row.event_types?.name
    })) || []
  } catch (error) {
    console.error('Error in getTierThresholdsForEvent:', error)
    return []
  }
}

/**
 * Get all event types for selector
 */
export async function getAllEventTypes() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('event_types')
      .select('id, name, display_name')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching event types:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllEventTypes:', error)
    return []
  }
}

/**
 * Update a tier threshold
 */
export async function updateTierThreshold(
  id: string,
  updates: {
    min_time_milliseconds?: number | null
    max_time_milliseconds?: number | null
    base_points?: number
    color_hex?: string
    description?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('tier_thresholds')
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
 * Bulk reset tier thresholds for an event to defaults
 */
export async function resetTierThresholdsToDefaults(eventTypeId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Get event type name to determine defaults
    const { data: eventType } = await supabase
      .from('event_types')
      .select('name')
      .eq('id', eventTypeId)
      .single()

    if (!eventType) {
      return { success: false, error: 'Event type not found' }
    }

    const eventName = eventType.name.toLowerCase()

    // Define defaults for common events
    const defaults: Record<string, any[]> = {
      '3x3x3': [
        { tier_name: 'S', min_ms: null, max_ms: 20000, base_points: 10 },
        { tier_name: 'A', min_ms: 20000, max_ms: 45000, base_points: 5 },
        { tier_name: 'B', min_ms: 45000, max_ms: 60000, base_points: 2 },
        { tier_name: 'C', min_ms: 60000, max_ms: 120000, base_points: 1 },
        { tier_name: 'D', min_ms: 120000, max_ms: null, base_points: 0 }
      ],
      '2x2x2': [
        { tier_name: 'S', min_ms: null, max_ms: 10000, base_points: 10 },
        { tier_name: 'A', min_ms: 10000, max_ms: 15000, base_points: 5 },
        { tier_name: 'B', min_ms: 15000, max_ms: 25000, base_points: 2 },
        { tier_name: 'C', min_ms: 25000, max_ms: 60000, base_points: 1 },
        { tier_name: 'D', min_ms: 60000, max_ms: null, base_points: 0 }
      ]
    }

    // Get defaults or use 3x3 as fallback
    const defaultTiers = defaults[eventName] || defaults['3x3x3']

    // Update each tier
    for (const defaultTier of defaultTiers) {
      const { error } = await supabase
        .from('tier_thresholds')
        .update({
          min_time_milliseconds: defaultTier.min_ms,
          max_time_milliseconds: defaultTier.max_ms,
          base_points: defaultTier.base_points,
          updated_at: new Date().toISOString()
        })
        .eq('event_type_id', eventTypeId)
        .eq('tier_name', defaultTier.tier_name)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
