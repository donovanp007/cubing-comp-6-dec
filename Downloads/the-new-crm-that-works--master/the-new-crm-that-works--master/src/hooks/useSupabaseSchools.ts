'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSchools, School } from './useSchools'

interface SchoolInsert {
  name: string
  target_enrollment: number
  monthly_cost: number
  program_fee_per_student: number
}

export function useSupabaseSchools() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingLocalStorage, setUsingLocalStorage] = useState(false)
  
  // Fallback to localStorage
  const localSchools = useSchools()

  // Fetch schools from Supabase
  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Attempting to fetch schools from Supabase...')

      // Test connection first
      const { data: testData, error: testError } = await Promise.race([
        supabase.from('schools').select('count').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]) as any

      if (testError) {
        console.warn('Supabase failed, using localStorage:', testError.message)
        setUsingLocalStorage(true)
        setSchools(localSchools.schools)
        setError('Using local storage - data will persist in browser')
        return
      }

      console.log('Supabase connection successful, fetching schools...')
      setUsingLocalStorage(false)

      const { data, error: fetchError } = await Promise.race([
        supabase
          .from('schools')
          .select('*')
          .order('name', { ascending: true }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Fetch timeout')), 10000)
        )
      ]) as any

      if (fetchError) {
        console.warn('Supabase fetch failed, using localStorage:', fetchError.message)
        setUsingLocalStorage(true)
        setSchools(localSchools.schools)
        setError('Using local storage - data will persist in browser')
        return
      }

      console.log('Successfully fetched schools from Supabase:', data?.length || 0)
      setSchools(data || [])
    } catch (err: any) {
      console.warn('Unexpected error, falling back to localStorage:', err.message)
      setUsingLocalStorage(true)
      setSchools(localSchools.schools)
      setError('Using local storage - data will persist in browser')
    } finally {
      setLoading(false)
    }
  }, [localSchools.schools])

  // Create a new school
  const createSchool = useCallback(async (schoolData: SchoolInsert): Promise<boolean> => {
    try {
      setError(null)

      if (usingLocalStorage) {
        // Use localStorage
        localSchools.addSchool(schoolData)
        setSchools(localSchools.schools)
        return true
      }

      // Try Supabase
      const { data, error: insertError } = await supabase
        .from('schools')
        .insert([{
          ...schoolData,
          current_enrollment: 0, // New schools start with 0 enrollment
          term_fee_per_student: schoolData.program_fee_per_student * 3 // Calculate 3-month term fee
        }])
        .select()
        .single()

      if (insertError) {
        console.warn('Supabase create failed, using localStorage:', insertError.message)
        setUsingLocalStorage(true)
        localSchools.addSchool(schoolData)
        setSchools(localSchools.schools)
        setError('Using local storage - data will persist in browser')
        return true
      }

      // Add the new school to the local state and refresh
      setSchools(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      fetchSchools() // Refresh to get the latest data
      return true
    } catch (err: any) {
      console.warn('Error creating school, falling back to localStorage:', err.message)
      setUsingLocalStorage(true)
      localSchools.addSchool(schoolData)
      setSchools(localSchools.schools)
      setError('Using local storage - data will persist in browser')
      return true
    }
  }, [usingLocalStorage, localSchools])

  // Update a school
  const updateSchool = useCallback(async (id: string, updates: Partial<School>): Promise<boolean> => {
    try {
      setError(null)

      if (usingLocalStorage) {
        const success = localSchools.updateSchool(id, updates)
        setSchools(localSchools.schools)
        return success
      }

      const { data, error: updateError } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Update the school in local state
      setSchools(prev => 
        prev.map(school => school.id === id ? data : school)
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      return true
    } catch (err: any) {
      console.error('Error updating school:', err)
      setError(err.message)
      return false
    }
  }, [usingLocalStorage, localSchools])

  // Delete a school
  const deleteSchool = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null)

      if (usingLocalStorage) {
        const success = localSchools.deleteSchool(id)
        setSchools(localSchools.schools)
        return success
      }

      const { error: deleteError } = await supabase
        .from('schools')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      // Remove the school from local state
      setSchools(prev => prev.filter(school => school.id !== id))
      return true
    } catch (err: any) {
      console.error('Error deleting school:', err)
      setError(err.message)
      return false
    }
  }, [usingLocalStorage, localSchools])

  useEffect(() => {
    fetchSchools()
  }, [fetchSchools])

  return {
    schools,
    loading,
    error,
    usingLocalStorage,
    fetchSchools,
    createSchool,
    updateSchool,
    deleteSchool
  }
}