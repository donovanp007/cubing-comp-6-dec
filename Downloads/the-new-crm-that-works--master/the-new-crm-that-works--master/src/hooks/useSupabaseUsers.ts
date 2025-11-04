'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

export function useSupabaseUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingLocalStorage, setUsingLocalStorage] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)

  const storeUsersLocally = (users: User[]) => {
    try {
      localStorage.setItem('team_users', JSON.stringify(users))
    } catch (err) {
      console.warn('Failed to store users locally:', err)
    }
  }

  const getUsersFromLocalStorage = (): User[] => {
    try {
      const stored = localStorage.getItem('team_users')
      return stored ? JSON.parse(stored) : []
    } catch (err) {
      console.warn('Failed to get users from localStorage:', err)
      return []
    }
  }

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()

      console.log('Attempting to fetch users from Supabase...')

      const { data: testData, error: testError } = await Promise.race([
        supabase.from('users').select('id').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]) as any

      if (testError) {
        console.warn('Supabase failed, using localStorage for users:', testError.message)
        setUsingLocalStorage(true)
        const localUsers = getUsersFromLocalStorage()
        setUsers(localUsers)
        setError('Using local storage - users will persist in browser')
        return
      }

      console.log('Supabase connection successful, fetching users...')
      setUsingLocalStorage(false)

      const { data, error: fetchError } = await Promise.race([
        supabase
          .from('users')
          .select('*')
          .order('name'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Users fetch timeout')), 10000)
        )
      ]) as any

      if (fetchError) {
        console.warn('Supabase fetch failed, using localStorage for users:', fetchError.message)
        setUsingLocalStorage(true)
        const localUsers = getUsersFromLocalStorage()
        setUsers(localUsers)
        setError('Using local storage - users will persist in browser')
        return
      }

      const fetchedUsers: User[] = data || []
      console.log('Successfully fetched users from Supabase:', fetchedUsers.length)

      setUsers(fetchedUsers)
      storeUsersLocally(fetchedUsers)
    } catch (err: any) {
      console.warn('Unexpected error, falling back to localStorage for users:', err.message)
      setUsingLocalStorage(true)
      const localUsers = getUsersFromLocalStorage()
      setUsers(localUsers)
      setError('Using local storage - users will persist in browser')
    } finally {
      setLoading(false)
    }
  }, [])

  const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'last_active'>): Promise<boolean> => {
    try {
      setError(null)

      if (usingLocalStorage) {
        const newUser: User = {
          ...userData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        }
        const updatedUsers = [...users, newUser]
        setUsers(updatedUsers)
        storeUsersLocally(updatedUsers)
        return true
      }

      const { data, error: insertError } = await supabase
        .from('users')
        .insert([{
          ...userData,
          last_active: new Date().toISOString()
        }])
        .select()
        .single()

      if (insertError) {
        console.warn('Supabase create failed, using localStorage for user:', insertError.message)
        setUsingLocalStorage(true)
        const newUser: User = {
          ...userData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        }
        const updatedUsers = [...users, newUser]
        setUsers(updatedUsers)
        storeUsersLocally(updatedUsers)
        setError('Using local storage - users will persist in browser')
        return true
      }

      setUsers(prev => [...prev, data])
      return true
    } catch (err: any) {
      console.warn('Error creating user, falling back to localStorage:', err.message)
      setUsingLocalStorage(true)
      const newUser: User = {
        ...userData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      }
      const updatedUsers = [...users, newUser]
      setUsers(updatedUsers)
      storeUsersLocally(updatedUsers)
      setError('Using local storage - users will persist in browser')
      return true
    }
  }

  const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
    try {
      setError(null)

      if (usingLocalStorage) {
        const updatedUsers = users.map(user => 
          user.id === id 
            ? { 
                ...user, 
                ...updates,
                updated_at: new Date().toISOString(),
                last_active: new Date().toISOString()
              }
            : user
        )
        setUsers(updatedUsers)
        storeUsersLocally(updatedUsers)
        return true
      }

      const userUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      }

      const { data, error: updateError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      const updatedUsers = users.map(user => 
        user.id === id ? data : user
      )
      setUsers(updatedUsers)
      return true
    } catch (err: any) {
      console.error('Error updating user:', err)
      setError(err.message)
      return false
    }
  }

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      if (usingLocalStorage) {
        const updatedUsers = users.filter(user => user.id !== id)
        setUsers(updatedUsers)
        storeUsersLocally(updatedUsers)
        return true
      }

      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      setUsers(prev => prev.filter(user => user.id !== id))
      return true
    } catch (err: any) {
      console.error('Error deleting user:', err)
      setError(err.message)
      return false
    }
  }

  useEffect(() => {
    fetchUsers()
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    usingLocalStorage,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  }
}