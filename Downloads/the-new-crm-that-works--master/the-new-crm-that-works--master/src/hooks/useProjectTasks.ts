'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { WorkTask, TaskList, TaskComment } from '@/types'

export function useProjectTasks(projectId: string) {
  const [taskLists, setTaskLists] = useState<TaskList[]>([])
  const [tasks, setTasks] = useState<WorkTask[]>([])
  const [comments, setComments] = useState<TaskComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch task lists and tasks for the project
  const fetchProjectTasks = useCallback(async () => {
    if (!projectId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch task lists
      const { data: listsData, error: listsError } = await supabase
        .from('task_lists')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true })

      if (listsError) {
        console.error('Error fetching task lists:', listsError)
        // Use localStorage fallback
        const storedLists = localStorage.getItem(`task_lists_${projectId}`)
        if (storedLists) {
          setTaskLists(JSON.parse(storedLists))
        }
      } else {
        setTaskLists(listsData || [])
        // Store in localStorage for offline access
        localStorage.setItem(`task_lists_${projectId}`, JSON.stringify(listsData || []))
      }

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('work_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true })

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
        // Use localStorage fallback
        const storedTasks = localStorage.getItem(`work_tasks_${projectId}`)
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks))
        }
      } else {
        setTasks(tasksData || [])
        // Store in localStorage for offline access
        localStorage.setItem(`work_tasks_${projectId}`, JSON.stringify(tasksData || []))
      }

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('task_comments')
        .select('*')
        .in('task_id', tasksData?.map(t => t.id) || [])
        .order('created_at', { ascending: false })

      if (!commentsError) {
        setComments(commentsData || [])
      }

    } catch (err: any) {
      console.error('Error in fetchProjectTasks:', err)
      setError(err.message)
      
      // Try to load from localStorage
      const storedLists = localStorage.getItem(`task_lists_${projectId}`)
      const storedTasks = localStorage.getItem(`work_tasks_${projectId}`)
      
      if (storedLists) setTaskLists(JSON.parse(storedLists))
      if (storedTasks) setTasks(JSON.parse(storedTasks))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Create a new task list
  const createTaskList = async (listData: Partial<TaskList>) => {
    try {
      const newList = {
        ...listData,
        project_id: projectId,
        position: taskLists.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Try Supabase first
      const { data, error } = await supabase
        .from('task_lists')
        .insert([newList])
        .select()
        .single()

      if (error) {
        console.error('Error creating task list:', error)
        // Fallback to localStorage
        const localList = { ...newList, id: crypto.randomUUID() }
        const updatedLists = [...taskLists, localList]
        setTaskLists(updatedLists)
        localStorage.setItem(`task_lists_${projectId}`, JSON.stringify(updatedLists))
        return localList
      }

      const updatedLists = [...taskLists, data]
      setTaskLists(updatedLists)
      localStorage.setItem(`task_lists_${projectId}`, JSON.stringify(updatedLists))
      return data

    } catch (err: any) {
      console.error('Error creating task list:', err)
      // Fallback to localStorage
      const localList = { 
        ...listData, 
        id: crypto.randomUUID(),
        project_id: projectId,
        position: taskLists.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const updatedLists = [...taskLists, localList]
      setTaskLists(updatedLists)
      localStorage.setItem(`task_lists_${projectId}`, JSON.stringify(updatedLists))
      return localList
    }
  }

  // Create a new task
  const createTask = async (taskData: Partial<WorkTask>) => {
    try {
      const newTask = {
        ...taskData,
        project_id: projectId,
        status: taskData.status || 'todo',
        progress: 0,
        position: tasks.filter(t => t.task_list_id === taskData.task_list_id).length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Try Supabase first
      const { data, error } = await supabase
        .from('work_tasks')
        .insert([newTask])
        .select()
        .single()

      if (error) {
        console.error('Error creating task:', error)
        // Fallback to localStorage
        const localTask = { ...newTask, id: crypto.randomUUID() }
        const updatedTasks = [...tasks, localTask]
        setTasks(updatedTasks)
        localStorage.setItem(`work_tasks_${projectId}`, JSON.stringify(updatedTasks))
        return localTask
      }

      const updatedTasks = [...tasks, data]
      setTasks(updatedTasks)
      localStorage.setItem(`work_tasks_${projectId}`, JSON.stringify(updatedTasks))
      return data

    } catch (err: any) {
      console.error('Error creating task:', err)
      // Fallback to localStorage
      const localTask = { 
        ...taskData,
        id: crypto.randomUUID(),
        project_id: projectId,
        status: taskData.status || 'todo',
        progress: 0,
        position: tasks.filter(t => t.task_list_id === taskData.task_list_id).length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const updatedTasks = [...tasks, localTask]
      setTasks(updatedTasks)
      localStorage.setItem(`work_tasks_${projectId}`, JSON.stringify(updatedTasks))
      return localTask
    }
  }

  // Update a task
  const updateTask = async (taskId: string, updates: Partial<WorkTask>) => {
    try {
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      // Try Supabase first
      const { data, error } = await supabase
        .from('work_tasks')
        .update(updatedData)
        .eq('id', taskId)
        .select()
        .single()

      if (error) {
        console.error('Error updating task:', error)
        // Fallback to localStorage
        const updatedTasks = tasks.map(task => 
          task.id === taskId ? { ...task, ...updatedData } : task
        )
        setTasks(updatedTasks)
        localStorage.setItem(`work_tasks_${projectId}`, JSON.stringify(updatedTasks))
        return
      }

      const updatedTasks = tasks.map(task => 
        task.id === taskId ? data : task
      )
      setTasks(updatedTasks)
      localStorage.setItem(`work_tasks_${projectId}`, JSON.stringify(updatedTasks))

    } catch (err: any) {
      console.error('Error updating task:', err)
      // Fallback to localStorage
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
      )
      setTasks(updatedTasks)
      localStorage.setItem(`work_tasks_${projectId}`, JSON.stringify(updatedTasks))
    }
  }

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('work_tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.error('Error deleting task:', error)
      }

      const updatedTasks = tasks.filter(task => task.id !== taskId)
      setTasks(updatedTasks)
      localStorage.setItem(`work_tasks_${projectId}`, JSON.stringify(updatedTasks))

    } catch (err: any) {
      console.error('Error deleting task:', err)
      const updatedTasks = tasks.filter(task => task.id !== taskId)
      setTasks(updatedTasks)
      localStorage.setItem(`work_tasks_${projectId}`, JSON.stringify(updatedTasks))
    }
  }

  // Delete a task list
  const deleteTaskList = async (listId: string) => {
    try {
      // Delete all tasks in the list first
      const listTasks = tasks.filter(t => t.task_list_id === listId)
      for (const task of listTasks) {
        await deleteTask(task.id)
      }

      const { error } = await supabase
        .from('task_lists')
        .delete()
        .eq('id', listId)

      if (error) {
        console.error('Error deleting task list:', error)
      }

      const updatedLists = taskLists.filter(list => list.id !== listId)
      setTaskLists(updatedLists)
      localStorage.setItem(`task_lists_${projectId}`, JSON.stringify(updatedLists))

    } catch (err: any) {
      console.error('Error deleting task list:', err)
      const updatedLists = taskLists.filter(list => list.id !== listId)
      setTaskLists(updatedLists)
      localStorage.setItem(`task_lists_${projectId}`, JSON.stringify(updatedLists))
    }
  }

  // Add a comment
  const addComment = async (taskId: string, content: string, userId: string) => {
    try {
      const newComment = {
        task_id: taskId,
        user_id: userId,
        content,
        type: 'comment' as const,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('task_comments')
        .insert([newComment])
        .select()
        .single()

      if (error) {
        console.error('Error adding comment:', error)
        // Fallback to localStorage
        const localComment = { ...newComment, id: crypto.randomUUID() }
        setComments(prev => [...prev, localComment])
        return localComment
      }

      setComments(prev => [...prev, data])
      return data

    } catch (err: any) {
      console.error('Error adding comment:', err)
      const localComment = { 
        id: crypto.randomUUID(),
        task_id: taskId,
        user_id: userId,
        content,
        type: 'comment' as const,
        created_at: new Date().toISOString()
      }
      setComments(prev => [...prev, localComment])
      return localComment
    }
  }

  // Set up real-time subscriptions
  useEffect(() => {
    if (!projectId) return

    fetchProjectTasks()

    // Subscribe to task list changes
    const listsSubscription = supabase
      .channel(`task_lists_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'task_lists',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchProjectTasks()
      })
      .subscribe()

    // Subscribe to task changes
    const tasksSubscription = supabase
      .channel(`work_tasks_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'work_tasks',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchProjectTasks()
      })
      .subscribe()

    return () => {
      listsSubscription.unsubscribe()
      tasksSubscription.unsubscribe()
    }
  }, [projectId, fetchProjectTasks])

  return {
    taskLists,
    tasks,
    comments,
    loading,
    error,
    createTaskList,
    createTask,
    updateTask,
    deleteTask,
    deleteTaskList,
    addComment,
    refresh: fetchProjectTasks
  }
}