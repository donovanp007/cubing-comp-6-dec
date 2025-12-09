'use server'

/**
 * Server actions for grade multiplier management
 */

import { createClient } from '@/lib/supabase/server'

export interface GradeMultiplierRow {
  id: string
  grade: string
  multiplier: number
  display_order: number
  description?: string
}

/**
 * Get all grade multipliers
 */
export async function getAllGradeMultipliers(): Promise<GradeMultiplierRow[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('grade_multipliers')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching grade multipliers:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllGradeMultipliers:', error)
    return []
  }
}

/**
 * Update a grade multiplier
 */
export async function updateGradeMultiplier(
  id: string,
  multiplier: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Validate multiplier is between 0.5 and 3.0
    if (multiplier < 0.5 || multiplier > 3.0) {
      return { success: false, error: 'Multiplier must be between 0.5 and 3.0' }
    }

    const { error } = await supabase
      .from('grade_multipliers')
      .update({
        multiplier,
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
 * Reset grade multipliers to defaults
 */
export async function resetGradeMultipliersToDefaults(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const defaults = [
      { grade: '5', multiplier: 2.0 },
      { grade: '6', multiplier: 1.85 },
      { grade: '7', multiplier: 1.7 },
      { grade: '8', multiplier: 1.55 },
      { grade: '9', multiplier: 1.4 },
      { grade: '10', multiplier: 1.25 },
      { grade: '11', multiplier: 1.1 },
      { grade: '12', multiplier: 1.0 }
    ]

    for (const { grade, multiplier } of defaults) {
      const { error } = await supabase
        .from('grade_multipliers')
        .update({ multiplier, updated_at: new Date().toISOString() })
        .eq('grade', grade)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
