'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { CRMTask } from '@/types'

export function useSupabaseCRMTasks() {
  const [tasks, setTasks] = useState<CRMTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingLocalStorage, setUsingLocalStorage] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)

  // Helper function to store tasks in localStorage as fallback
  const storeTasksLocally = (tasks: CRMTask[]) => {
    try {
      localStorage.setItem('crm_tasks', JSON.stringify(tasks))
    } catch (err) {
      console.warn('Failed to store tasks locally:', err)
    }
  }

  const getTasksFromLocalStorage = (): CRMTask[] => {
    try {
      const stored = localStorage.getItem('crm_tasks')
      return stored ? JSON.parse(stored) : []
    } catch (err) {
      console.warn('Failed to get tasks from localStorage:', err)
      return []
    }
  }

  // Fetch CRM tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()

      console.log('Attempting to fetch CRM tasks from Supabase...')

      // Try Supabase first with timeout
      const { data: testData, error: testError } = await Promise.race([
        supabase.from('reminders').select('id').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]) as any

      if (testError) {
        console.warn('Supabase failed, using localStorage for CRM tasks:', testError.message)
        setUsingLocalStorage(true)
        const localTasks = getTasksFromLocalStorage()
        setTasks(localTasks)
        setError('Using local storage - CRM tasks will persist in browser')
        return
      }

      console.log('Supabase connection successful, fetching CRM tasks...')
      setUsingLocalStorage(false)

      const { data, error: fetchError } = await Promise.race([
        supabase
          .from('reminders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Fetch timeout')), 10000)
        )
      ]) as any

      if (fetchError) {
        console.warn('Supabase fetch failed, using localStorage for CRM tasks:', fetchError.message)
        setUsingLocalStorage(true)
        const localTasks = getTasksFromLocalStorage()
        setTasks(localTasks)
        setError('Using local storage - CRM tasks will persist in browser')
        return
      }

      // Transform reminders to CRM tasks format
      const transformedTasks: CRMTask[] = (data || []).map((reminder: any) => ({
        id: reminder.id.toString(),
        title: reminder.title,
        description: reminder.description,
        priority: reminder.priority,
        status: reminder.status,
        due_date: reminder.due_date,
        student_id: reminder.student_id || 'unknown',
        task_type: 'general' as const,
        created_at: reminder.created_at,
        updated_at: reminder.updated_at,
        completed_at: reminder.completed ? reminder.updated_at : undefined
      }))

      console.log('Successfully fetched CRM tasks from Supabase:', transformedTasks.length)
      setTasks(transformedTasks)
      storeTasksLocally(transformedTasks)
    } catch (err: any) {
      console.warn('Unexpected error, falling back to localStorage for CRM tasks:', err.message)
      setUsingLocalStorage(true)
      const localTasks = getTasksFromLocalStorage()
      setTasks(localTasks)
      setError('Using local storage - CRM tasks will persist in browser')
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new CRM task
  const createTask = async (taskData: Omit<CRMTask, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      setError(null)

      if (usingLocalStorage) {
        // Use localStorage
        const newTask: CRMTask = {
          ...taskData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        const updatedTasks = [newTask, ...tasks]
        setTasks(updatedTasks)
        storeTasksLocally(updatedTasks)
        return true
      }

      // Try Supabase - transform CRM task to reminder format
      const reminderData = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        due_date: taskData.due_date,
        student_id: taskData.student_id,
        student_name: '', // Will be populated by trigger or separately
        school_name: '',  // Will be populated by trigger or separately
        completed: taskData.status === 'completed'
      }

      const { data, error: insertError } = await supabase
        .from('reminders')
        .insert([reminderData])
        .select()
        .single()

      if (insertError) {
        console.warn('Supabase create failed, using localStorage for CRM task:', insertError.message)
        setUsingLocalStorage(true)
        const newTask: CRMTask = {
          ...taskData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        const updatedTasks = [newTask, ...tasks]
        setTasks(updatedTasks)
        storeTasksLocally(updatedTasks)
        setError('Using local storage - CRM tasks will persist in browser')
        return true
      }

      // Transform back to CRM task format
      const newTask: CRMTask = {
        id: data.id.toString(),
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        due_date: data.due_date,
        student_id: data.student_id || 'unknown',
        task_type: taskData.task_type,
        created_at: data.created_at,
        updated_at: data.updated_at,
        completed_at: data.completed ? data.updated_at : undefined
      }

      setTasks(prev => [newTask, ...prev])
      return true
    } catch (err: any) {
      console.warn('Error creating CRM task, falling back to localStorage:', err.message)
      setUsingLocalStorage(true)
      const newTask: CRMTask = {
        ...taskData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const updatedTasks = [newTask, ...tasks]
      setTasks(updatedTasks)
      storeTasksLocally(updatedTasks)
      setError('Using local storage - CRM tasks will persist in browser')
      return true
    }
  }

  // Update a CRM task
  const updateTask = async (id: string, updates: Partial<CRMTask>): Promise<boolean> => {
    try {
      setError(null)

      if (usingLocalStorage) {
        // Use localStorage
        const updatedTasks = tasks.map(task => 
          task.id === id 
            ? { 
                ...task, 
                ...updates,
                updated_at: new Date().toISOString(),
                completed_at: updates.status === 'completed' ? new Date().toISOString() : task.completed_at
              }
            : task
        )
        setTasks(updatedTasks)
        storeTasksLocally(updatedTasks)
        return true
      }

      // Convert updates to reminder format
      const reminderUpdates: any = {}
      if (updates.title !== undefined) reminderUpdates.title = updates.title
      if (updates.description !== undefined) reminderUpdates.description = updates.description
      if (updates.priority !== undefined) reminderUpdates.priority = updates.priority
      if (updates.status !== undefined) {
        reminderUpdates.status = updates.status
        reminderUpdates.completed = updates.status === 'completed'
      }
      if (updates.due_date !== undefined) reminderUpdates.due_date = updates.due_date
      reminderUpdates.updated_at = new Date().toISOString()

      const { data, error: updateError } = await supabase
        .from('reminders')
        .update(reminderUpdates)
        .eq('id', parseInt(id))
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === id 
          ? { 
              ...task, 
              ...updates,
              updated_at: data.updated_at,
              completed_at: data.completed ? data.updated_at : undefined
            }
          : task
      )
      setTasks(updatedTasks)
      return true
    } catch (err: any) {
      console.error('Error updating CRM task:', err)
      setError(err.message)
      return false
    }
  }

  // Delete a CRM task
  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      if (usingLocalStorage) {
        // Use localStorage
        const updatedTasks = tasks.filter(task => task.id !== id)
        setTasks(updatedTasks)
        storeTasksLocally(updatedTasks)
        return true
      }

      const { error: deleteError } = await supabase
        .from('reminders')
        .delete()
        .eq('id', parseInt(id))

      if (deleteError) {
        throw deleteError
      }

      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== id))
      return true
    } catch (err: any) {
      console.error('Error deleting CRM task:', err)
      setError(err.message)
      return false
    }
  }

  // Get tasks for a specific student
  const getTasksForStudent = useCallback((studentId: string): CRMTask[] => {
    return tasks.filter(task => task.student_id === studentId)
  }, [tasks])

  // Test database connection
  const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('id, title')
        .limit(1)

      if (error) {
        throw error
      }

      return {
        success: true,
        message: `Connected successfully. Found ${data?.length || 0} CRM tasks.`
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Connection failed: ${err.message}`
      }
    }
  }

  useEffect(() => {
    fetchTasks()
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchTasks])

  // Cleanup function to cancel requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    tasks,
    loading,
    error,
    usingLocalStorage,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTasksForStudent,
    testConnection
  }
}