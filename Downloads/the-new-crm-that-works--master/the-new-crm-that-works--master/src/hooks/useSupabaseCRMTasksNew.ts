'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type CRMTask = Database['public']['Tables']['crm_tasks']['Row']
type CRMTaskInsert = Database['public']['Tables']['crm_tasks']['Insert']
type CRMTaskUpdate = Database['public']['Tables']['crm_tasks']['Update']

// Extended CRM task type with related data
export interface CRMTaskWithDetails extends CRMTask {
  students?: {
    first_name: string
    last_name: string
    schools?: {
      name: string
    }
  }
  assigned_user?: {
    name: string
    email: string
    avatar_url: string | null
  }
  created_user?: {
    name: string
    email: string
  }
}

export function useSupabaseCRMTasksNew() {
  const [tasks, setTasks] = useState<CRMTaskWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch CRM tasks with related data
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('crm_tasks')
        .select(`
          *,
          students (
            first_name,
            last_name,
            schools (
              name
            )
          ),
          assigned_user:users!assigned_to (
            name,
            email,
            avatar_url
          ),
          created_user:users!created_by (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching CRM tasks:', fetchError)
        setError(fetchError.message)
        return
      }

      setTasks(data || [])
    } catch (err) {
      console.error('Error in fetchTasks:', err)
      setError('Failed to fetch CRM tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new CRM task
  const createTask = useCallback(async (taskData: CRMTaskInsert): Promise<boolean> => {
    try {
      const { error: insertError } = await supabase
        .from('crm_tasks')
        .insert(taskData)

      if (insertError) {
        console.error('Error creating CRM task:', insertError)
        setError(insertError.message)
        return false
      }

      // Refresh the list
      await fetchTasks()
      return true
    } catch (err) {
      console.error('Error in createTask:', err)
      setError('Failed to create CRM task')
      return false
    }
  }, [fetchTasks])

  // Update an existing CRM task
  const updateTask = useCallback(async (id: string, updates: CRMTaskUpdate): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('crm_tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating CRM task:', updateError)
        setError(updateError.message)
        return false
      }

      // Refresh the list
      await fetchTasks()
      return true
    } catch (err) {
      console.error('Error in updateTask:', err)
      setError('Failed to update CRM task')
      return false
    }
  }, [fetchTasks])

  // Delete a CRM task
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('crm_tasks')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Error deleting CRM task:', deleteError)
        setError(deleteError.message)
        return false
      }

      // Refresh the list
      await fetchTasks()
      return true
    } catch (err) {
      console.error('Error in deleteTask:', err)
      setError('Failed to delete CRM task')
      return false
    }
  }, [fetchTasks])

  // Mark task as completed
  const completeTask = useCallback(async (id: string): Promise<boolean> => {
    return updateTask(id, { 
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }, [updateTask])

  // Assign task to user
  const assignTask = useCallback(async (taskId: string, userId: string): Promise<boolean> => {
    return updateTask(taskId, { assigned_to: userId })
  }, [updateTask])

  // Get tasks for a specific student
  const getTasksForStudent = useCallback((studentId: string): CRMTaskWithDetails[] => {
    return tasks.filter(task => task.student_id === studentId)
  }, [tasks])

  // Get tasks assigned to a specific user
  const getTasksForUser = useCallback((userId: string): CRMTaskWithDetails[] => {
    return tasks.filter(task => task.assigned_to === userId)
  }, [tasks])

  // Get tasks by status
  const getTasksByStatus = useCallback((status: string): CRMTaskWithDetails[] => {
    return tasks.filter(task => task.status === status)
  }, [tasks])

  // Get overdue tasks
  const getOverdueTasks = useCallback((): CRMTaskWithDetails[] => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter(task => 
      task.due_date && 
      task.due_date < today && 
      task.status !== 'completed' && 
      task.status !== 'cancelled'
    )
  }, [tasks])

  // Bulk operations
  const bulkUpdateTasks = useCallback(async (
    taskIds: string[], 
    updates: CRMTaskUpdate
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('crm_tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in('id', taskIds)

      if (updateError) {
        console.error('Error bulk updating CRM tasks:', updateError)
        setError(updateError.message)
        return false
      }

      // Refresh the list
      await fetchTasks()
      return true
    } catch (err) {
      console.error('Error in bulkUpdateTasks:', err)
      setError('Failed to bulk update CRM tasks')
      return false
    }
  }, [fetchTasks])

  // Statistics
  const getTaskStats = useCallback(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const overdue = getOverdueTasks().length
    const urgent = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length
    
    return {
      total,
      completed,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      overdue,
      urgent,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [tasks, getOverdueTasks])

  // Load tasks on mount
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    assignTask,
    getTasksForStudent,
    getTasksForUser,
    getTasksByStatus,
    getOverdueTasks,
    bulkUpdateTasks,
    getTaskStats
  }
}