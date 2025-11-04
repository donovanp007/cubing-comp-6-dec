'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Reminder = Database['public']['Tables']['reminders']['Row']
type ReminderInsert = Database['public']['Tables']['reminders']['Insert']
type ReminderUpdate = Database['public']['Tables']['reminders']['Update']

// Extended reminder type with student info
export interface ReminderWithStudent extends Reminder {
  students?: {
    first_name: string
    last_name: string
    schools?: {
      name: string
    }
  }
}

export function useSupabaseReminders() {
  const [reminders, setReminders] = useState<ReminderWithStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch reminders with student and school information
  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('reminders')
        .select(`
          *,
          students (
            first_name,
            last_name,
            schools (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching reminders:', fetchError)
        setError(fetchError.message)
        return
      }

      setReminders(data || [])
    } catch (err) {
      console.error('Error in fetchReminders:', err)
      setError('Failed to fetch reminders')
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new reminder
  const createReminder = useCallback(async (reminderData: ReminderInsert): Promise<boolean> => {
    try {
      const { error: insertError } = await supabase
        .from('reminders')
        .insert(reminderData)

      if (insertError) {
        console.error('Error creating reminder:', insertError)
        setError(insertError.message)
        return false
      }

      // Refresh the list
      await fetchReminders()
      return true
    } catch (err) {
      console.error('Error in createReminder:', err)
      setError('Failed to create reminder')
      return false
    }
  }, [fetchReminders])

  // Update an existing reminder
  const updateReminder = useCallback(async (id: string, updates: ReminderUpdate): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('reminders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating reminder:', updateError)
        setError(updateError.message)
        return false
      }

      // Refresh the list
      await fetchReminders()
      return true
    } catch (err) {
      console.error('Error in updateReminder:', err)
      setError('Failed to update reminder')
      return false
    }
  }, [fetchReminders])

  // Delete a reminder
  const deleteReminder = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Error deleting reminder:', deleteError)
        setError(deleteError.message)
        return false
      }

      // Refresh the list
      await fetchReminders()
      return true
    } catch (err) {
      console.error('Error in deleteReminder:', err)
      setError('Failed to delete reminder')
      return false
    }
  }, [fetchReminders])

  // Mark reminder as completed
  const markAsCompleted = useCallback(async (id: string): Promise<boolean> => {
    return updateReminder(id, { completed: true })
  }, [updateReminder])

  // Mark reminder as incomplete
  const markAsIncomplete = useCallback(async (id: string): Promise<boolean> => {
    return updateReminder(id, { completed: false })
  }, [updateReminder])

  // Bulk operations
  const bulkUpdateReminders = useCallback(async (
    reminderIds: string[], 
    updates: ReminderUpdate
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('reminders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', reminderIds)

      if (updateError) {
        console.error('Error bulk updating reminders:', updateError)
        setError(updateError.message)
        return false
      }

      // Refresh the list
      await fetchReminders()
      return true
    } catch (err) {
      console.error('Error in bulkUpdateReminders:', err)
      setError('Failed to bulk update reminders')
      return false
    }
  }, [fetchReminders])

  // Load reminders on mount
  useEffect(() => {
    fetchReminders()
  }, [fetchReminders])

  return {
    reminders,
    loading,
    error,
    fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    markAsCompleted,
    markAsIncomplete,
    bulkUpdateReminders
  }
}