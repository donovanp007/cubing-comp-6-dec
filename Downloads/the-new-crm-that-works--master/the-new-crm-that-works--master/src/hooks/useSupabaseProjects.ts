'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Project, WorkTask, User, TaskList } from '@/types'

export function useSupabaseProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<WorkTask[]>([])
  const [taskLists, setTaskLists] = useState<TaskList[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingLocalStorage, setUsingLocalStorage] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)

  // No localStorage - Supabase only

  // Fetch projects with team members
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()

      console.log('Attempting to fetch projects from Supabase...')

      // Connect to Supabase directly
      console.log('Connecting to Supabase projects...')
      setUsingLocalStorage(false)

      console.log('Supabase connection successful, fetching projects...')
      setUsingLocalStorage(false)

      // Fetch projects, tasks, task lists, and users in parallel
      const [projectsResult, tasksResult, taskListsResult, usersResult] = await Promise.all([
        Promise.race([
          supabase
            .from('projects')
            .select(`
              *,
              project_members!inner (
                user_id,
                role,
                users (
                  id,
                  name,
                  email,
                  role,
                  department,
                  status
                )
              )
            `)
            .order('created_at', { ascending: false })
            .limit(500),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Projects fetch timeout')), 10000)
          )
        ]),
        Promise.race([
          supabase
            .from('work_tasks')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Tasks fetch timeout')), 10000)
          )
        ]),
        Promise.race([
          supabase
            .from('task_lists')
            .select('*')
            .order('position'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Task lists fetch timeout')), 10000)
          )
        ]),
        Promise.race([
          supabase
            .from('users')
            .select('*')
            .order('name'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Users fetch timeout')), 10000)
          )
        ])
      ]) as any

      if (projectsResult.error || tasksResult.error || taskListsResult.error || usersResult.error) {
        console.error('Supabase fetch failed:', {
          projects: projectsResult.error?.message,
          tasks: tasksResult.error?.message,
          taskLists: taskListsResult.error?.message,
          users: usersResult.error?.message
        })
        setError(`Database error: ${projectsResult.error?.message || tasksResult.error?.message || taskListsResult.error?.message || usersResult.error?.message}`)
        setProjects([])
        setTasks([])
        setTaskLists([])
        setUsers([])
        return
      }

      // Transform projects data to include team_members array
      const transformedProjects: Project[] = (projectsResult.data || []).map((project: any) => ({
        ...project,
        team_members: project.project_members?.map((pm: any) => pm.user_id) || []
      }))

      const fetchedTasks: WorkTask[] = tasksResult.data || []
      const fetchedTaskLists: TaskList[] = taskListsResult.data || []
      const fetchedUsers: User[] = usersResult.data || []

      console.log('Successfully fetched from Supabase:', {
        projects: transformedProjects.length,
        tasks: fetchedTasks.length,
        taskLists: fetchedTaskLists.length,
        users: fetchedUsers.length
      })

      setProjects(transformedProjects)
      setTasks(fetchedTasks)
      setTaskLists(fetchedTaskLists)
      setUsers(fetchedUsers)

      // No localStorage backup needed
    } catch (err: any) {
      console.error('Error fetching projects:', err.message)
      setError(`Database error: ${err.message}`)
      setProjects([])
      setTasks([])
      setTaskLists([])
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new project - SUPABASE ONLY
  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      setError(null)

      // Prepare project data for insertion
      const { team_members, ...rawProjectData } = projectData
      
      // Clean up date fields - convert empty strings to null for database
      const projectInsertData = {
        ...rawProjectData,
        start_date: rawProjectData.start_date || null,
        due_date: rawProjectData.due_date || null
      }

      const { data: project, error: insertError } = await supabase
        .from('projects')
        .insert([projectInsertData])
        .select()
        .single()

      if (insertError) {
        console.error('Failed to create project:', insertError.message)
        setError(`Failed to create project: ${insertError.message}`)
        return false
      }

      // Add team members
      if (team_members && team_members.length > 0) {
        const memberInserts = team_members.map(userId => ({
          project_id: project.id,
          user_id: userId,
          role: userId === project.owner_id ? 'lead' : 'member'
        }))

        const { error: memberError } = await supabase
          .from('project_members')
          .insert(memberInserts)

        if (memberError) {
          console.error('Failed to add team members:', memberError.message)
        }
      }

      const newProject: Project = {
        ...project,
        team_members: team_members || []
      }

      setProjects(prev => [newProject, ...prev])
      console.log('Project created successfully:', newProject.name)
      return true
    } catch (err: any) {
      console.error('Error creating project:', err.message)
      setError(`Error creating project: ${err.message}`)
      return false
    }
  }

  // Update a project - SUPABASE ONLY
  const updateProject = async (id: string, updates: Partial<Project>): Promise<boolean> => {
    try {
      setError(null)

      const { team_members, ...projectUpdates } = updates
      projectUpdates.updated_at = new Date().toISOString()

      const { data, error: updateError } = await supabase
        .from('projects')
        .update(projectUpdates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update project:', updateError.message)
        setError(`Failed to update project: ${updateError.message}`)
        return false
      }

      // Update team members if provided
      if (team_members !== undefined) {
        // Remove existing members
        const { error: deleteError } = await supabase
          .from('project_members')
          .delete()
          .eq('project_id', id)

        if (deleteError) {
          console.error('Failed to remove existing members:', deleteError.message)
        }

        // Add new members
        if (team_members.length > 0) {
          const memberInserts = team_members.map(userId => ({
            project_id: id,
            user_id: userId,
            role: userId === data.owner_id ? 'lead' : 'member'
          }))

          const { error: insertError } = await supabase
            .from('project_members')
            .insert(memberInserts)

          if (insertError) {
            console.error('Failed to add new members:', insertError.message)
          }
        }
      }

      // Update local state
      const updatedProjects = projects.map(project => 
        project.id === id 
          ? { 
              ...project, 
              ...updates,
              updated_at: data.updated_at
            }
          : project
      )
      setProjects(updatedProjects)
      console.log('Project updated successfully:', data.name)
      return true
    } catch (err: any) {
      console.error('Error updating project:', err.message)
      setError(`Error updating project: ${err.message}`)
      return false
    }
  }

  // Delete a project - SUPABASE ONLY
  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Failed to delete project:', deleteError.message)
        setError(`Failed to delete project: ${deleteError.message}`)
        return false
      }

      // Remove from local state (cascade delete should handle related records)
      setProjects(prev => prev.filter(project => project.id !== id))
      setTasks(prev => prev.filter(task => task.project_id !== id))
      console.log('Project deleted successfully')
      return true
    } catch (err: any) {
      console.error('Error deleting project:', err.message)
      setError(`Error deleting project: ${err.message}`)
      return false
    }
  }

  // Create a new work task - SUPABASE ONLY
  const createTask = async (taskData: Omit<WorkTask, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      setError(null)

      // Clean up task data for database - handle mock IDs and invalid UUIDs
      const cleanTaskData = {
        ...taskData,
        // Convert mock IDs like "list-3" to null, keep proper UUIDs
        task_list_id: (taskData.task_list_id && 
                      taskData.task_list_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) 
                      ? taskData.task_list_id : null,
        due_date: taskData.due_date || null,
        start_date: taskData.start_date || null,
        assigned_to: (taskData.assigned_to && 
                     taskData.assigned_to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))
                     ? taskData.assigned_to : null,
        parent_task_id: (taskData.parent_task_id && 
                        taskData.parent_task_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))
                        ? taskData.parent_task_id : null
      }

      const { data, error: insertError } = await supabase
        .from('work_tasks')
        .insert([cleanTaskData])
        .select()
        .single()

      if (insertError) {
        console.error('Failed to create task:', insertError.message)
        setError(`Failed to create task: ${insertError.message}`)
        return false
      }

      setTasks(prev => [data, ...prev])
      console.log('Task created successfully:', data.title)
      return true
    } catch (err: any) {
      console.error('Error creating task:', err.message)
      setError(`Error creating task: ${err.message}`)
      return false
    }
  }

  // Update a work task - SUPABASE ONLY
  const updateTask = async (id: string, updates: Partial<WorkTask>): Promise<boolean> => {
    try {
      setError(null)

      const taskUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
        completed_at: updates.status === 'completed' ? new Date().toISOString() : undefined
      }

      const { data, error: updateError } = await supabase
        .from('work_tasks')
        .update(taskUpdates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update task:', updateError.message)
        setError(`Failed to update task: ${updateError.message}`)
        return false
      }

      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === id ? data : task
      )
      setTasks(updatedTasks)
      console.log('Task updated successfully:', data.title)
      return true
    } catch (err: any) {
      console.error('Error updating task:', err.message)
      setError(`Error updating task: ${err.message}`)
      return false
    }
  }

  // Delete a work task - SUPABASE ONLY
  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      const { error: deleteError } = await supabase
        .from('work_tasks')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Failed to delete task:', deleteError.message)
        setError(`Failed to delete task: ${deleteError.message}`)
        return false
      }

      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== id))
      console.log('Task deleted successfully')
      return true
    } catch (err: any) {
      console.error('Error deleting task:', err.message)
      setError(`Error deleting task: ${err.message}`)
      return false
    }
  }

  // Create a new task list - SUPABASE ONLY
  const createTaskList = async (taskListData: Omit<TaskList, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      setError(null)

      const { data, error: insertError } = await supabase
        .from('task_lists')
        .insert([taskListData])
        .select()
        .single()

      if (insertError) {
        console.error('Failed to create task list:', insertError.message)
        setError(`Failed to create task list: ${insertError.message}`)
        return false
      }

      setTaskLists(prev => [...prev, data])
      console.log('Task list created successfully:', data.name)
      return true
    } catch (err: any) {
      console.error('Error creating task list:', err.message)
      setError(`Error creating task list: ${err.message}`)
      return false
    }
  }

  // Update a task list - SUPABASE ONLY
  const updateTaskList = async (id: string, updates: Partial<TaskList>): Promise<boolean> => {
    try {
      setError(null)
      const updatedData = { ...updates, updated_at: new Date().toISOString() }

      const { data, error } = await supabase
        .from('task_lists')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Failed to update task list:', error.message)
        setError(`Failed to update task list: ${error.message}`)
        return false
      }

      // Update local state
      setTaskLists(prev => prev.map(list => list.id === id ? data : list))
      console.log('Task list updated successfully:', data.name)
      return true
    } catch (err: any) {
      console.error('Error updating task list:', err)
      setError(`Error updating task list: ${err.message}`)
      return false
    }
  }

  // Delete a task list - SUPABASE ONLY
  const deleteTaskList = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      // Delete all tasks in the list first
      const listTasks = tasks.filter(t => t.task_list_id === id)
      for (const task of listTasks) {
        await deleteTask(task.id)
      }

      const { error } = await supabase
        .from('task_lists')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Failed to delete task list:', error.message)
        setError(`Failed to delete task list: ${error.message}`)
        return false
      }

      const updatedLists = taskLists.filter(list => list.id !== id)
      setTaskLists(updatedLists)
      console.log('Task list deleted successfully')
      return true
    } catch (err: any) {
      console.error('Error deleting task list:', err)
      setError(`Error deleting task list: ${err.message}`)
      return false
    }
  }
  
  // Get tasks for a specific project
  const getTasksForProject = useCallback((projectId: string): WorkTask[] => {
    return tasks.filter(task => task.project_id === projectId)
  }, [tasks])

  // Get task lists for a specific project
  const getTaskListsForProject = useCallback((projectId: string): TaskList[] => {
    return taskLists.filter(list => list.project_id === projectId)
  }, [taskLists])

  // Test database connection
  const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .limit(1)

      if (error) {
        throw error
      }

      return {
        success: true,
        message: `Connected successfully. Found ${data?.length || 0} projects.`
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Connection failed: ${err.message}`
      }
    }
  }

  useEffect(() => {
    fetchProjects()
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchProjects])

  // Cleanup function to cancel requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    projects,
    tasks,
    taskLists,
    users,
    loading,
    error,
    usingLocalStorage,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    createTaskList,
    updateTaskList,
    deleteTaskList,
    getTasksForProject,
    getTaskListsForProject,
    testConnection
  }
}
