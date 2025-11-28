/**
 * Tier Determination
 * Evaluates a time against tier thresholds to determine which tier it belongs to
 */

import { createClient } from '@/lib/supabase/client'

export interface TierThreshold {
  id: string
  event_type_id: string
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
 * Determine which tier a time belongs to
 * @param timeMs Time in milliseconds
 * @param eventTypeId UUID of the event type (3x3, 2x2, etc.)
 * @param isDNF Whether the attempt was a DNF
 * @returns The tier threshold object, or null if not found
 */
export async function determineTier(
  timeMs: number | null,
  eventTypeId: string,
  isDNF: boolean = false
): Promise<TierThreshold | null> {
  const supabase = createClient()

  // DNF always gets Tier D
  if (isDNF || timeMs === null) {
    const { data, error } = await supabase
      .from('tier_thresholds')
      .select('*')
      .eq('event_type_id', eventTypeId)
      .eq('tier_name', 'D')
      .single()

    if (error) {
      console.error('Error fetching Tier D:', error)
      return null
    }

    return data as TierThreshold
  }

  // Fetch all tiers for this event, sorted by order
  const { data: thresholds, error } = await supabase
    .from('tier_thresholds')
    .select('*')
    .eq('event_type_id', eventTypeId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching tier thresholds:', error)
    return null
  }

  if (!thresholds || thresholds.length === 0) {
    console.error(`No tier thresholds found for event_type_id: ${eventTypeId}`)
    return null
  }

  // Find matching tier
  for (const threshold of thresholds) {
    if (threshold.tier_name === 'D') continue // Skip Tier D in this loop

    const minTime = threshold.min_time_milliseconds ?? 0
    const maxTime = threshold.max_time_milliseconds ?? Infinity

    if (timeMs >= minTime && timeMs < maxTime) {
      return threshold as TierThreshold
    }
  }

  // If no tier matched, return Tier D (catch-all)
  return (thresholds.find(t => t.tier_name === 'D') as TierThreshold) || null
}

/**
 * Get all tier thresholds for a specific event type
 * Useful for display and configuration
 */
export async function getTierThresholds(eventTypeId: string): Promise<TierThreshold[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tier_thresholds')
    .select('*')
    .eq('event_type_id', eventTypeId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching tier thresholds:', error)
    return []
  }

  return (data || []) as TierThreshold[]
}

/**
 * Synchronous version for client-side preview (requires pre-fetched thresholds)
 * Use this in React components where thresholds are already loaded
 */
export function determineTierSync(
  timeMs: number | null,
  thresholds: TierThreshold[],
  isDNF: boolean = false
): TierThreshold | null {
  // DNF always gets Tier D
  if (isDNF || timeMs === null) {
    return thresholds.find(t => t.tier_name === 'D') || null
  }

  // Find matching tier
  for (const threshold of thresholds) {
    if (threshold.tier_name === 'D') continue // Skip Tier D in this loop

    const minTime = threshold.min_time_milliseconds ?? 0
    const maxTime = threshold.max_time_milliseconds ?? Infinity

    if (timeMs >= minTime && timeMs < maxTime) {
      return threshold
    }
  }

  // If no tier matched, return Tier D (catch-all)
  return thresholds.find(t => t.tier_name === 'D') || null
}

/**
 * Format a time in milliseconds to human-readable format
 */
export function formatTime(ms: number | null): string {
  if (ms === null) return 'DNF'
  const seconds = ms / 1000
  return seconds.toFixed(2) + 's'
}

/**
 * Format milliseconds to display format with proper decimals
 */
export function msToSeconds(ms: number): string {
  return (ms / 1000).toFixed(2)
}
