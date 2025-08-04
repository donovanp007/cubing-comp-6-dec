'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { localDB } from '@/lib/storage'
import { StudentWithSchool, StudentInsert, StudentUpdate } from '@/types'

export function useSupabaseStudents() {
  const [students, setStudents] = useState<StudentWithSchool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingLocalStorage, setUsingLocalStorage] = useState(false)

  // Fetch students with school information
  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Attempting to fetch students from Supabase...')

      // Try Supabase first
      const { data: testData, error: testError } = await supabase
        .from('students')
        .select('count')
        .limit(1)

      if (testError) {
        console.warn('Supabase failed, using localStorage:', testError.message)
        setUsingLocalStorage(true)
        const localStudents = await localDB.getStudents()
        setStudents(localStudents)
        setError('Using local storage - data will persist in browser')
        return
      }

      console.log('Supabase connection successful, fetching students...')
      setUsingLocalStorage(false)

      const { data, error: fetchError } = await supabase
        .from('students')
        .select(`
          *,
          schools (
            id,
            name,
            target_enrollment,
            current_enrollment,
            monthly_cost,
            program_fee_per_student,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.warn('Supabase fetch failed, using localStorage:', fetchError.message)
        setUsingLocalStorage(true)
        const localStudents = await localDB.getStudents()
        setStudents(localStudents)
        setError('Using local storage - data will persist in browser')
        return
      }

      console.log('Successfully fetched students from Supabase:', data?.length || 0)
      setStudents(data || [])
    } catch (err: any) {
      console.warn('Unexpected error, falling back to localStorage:', err.message)
      setUsingLocalStorage(true)
      const localStudents = await localDB.getStudents()
      setStudents(localStudents)
      setError('Using local storage - data will persist in browser')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to find or create school by name
  const findOrCreateSchool = async (schoolName: string): Promise<string> => {
    try {
      // First, try to find existing school by name
      const { data: existingSchools, error: searchError } = await supabase
        .from('schools')
        .select('id')
        .eq('name', schoolName)
        .limit(1)

      if (searchError) throw searchError

      if (existingSchools && existingSchools.length > 0) {
        return existingSchools[0].id
      }

      // Create new school if not found
      const { data: newSchool, error: createError } = await supabase
        .from('schools')
        .insert([{
          name: schoolName,
          target_enrollment: 30,
          current_enrollment: 0,
          monthly_cost: 2500,
          program_fee_per_student: 450
        }])
        .select('id')
        .single()

      if (createError) throw createError

      return newSchool.id
    } catch (error) {
      console.error('Error finding/creating school:', error)
      return crypto.randomUUID() // Fallback
    }
  }

  // Create a new student
  const createStudent = async (studentData: StudentInsert | any): Promise<boolean> => {
    try {
      setError(null)

      if (usingLocalStorage) {
        // Use localStorage
        const newStudent = await localDB.createStudent(studentData)
        setStudents(prev => [newStudent, ...prev])
        return true
      }

      // Try Supabase
      // Handle school lookup/creation if school_name is provided
      if (studentData.school_name && !studentData.school_id) {
        studentData.school_id = await findOrCreateSchool(studentData.school_name)
      }

      // Ensure we have a valid school_id
      if (!studentData.school_id) {
        const { data: schools } = await supabase.from('schools').select('id').limit(1)
        if (schools && schools.length > 0) {
          studentData.school_id = schools[0].id
        } else {
          // Create a default school
          const { data: newSchool } = await supabase
            .from('schools')
            .insert([{ name: 'Default School', target_enrollment: 30, monthly_cost: 2000, program_fee_per_student: 400 }])
            .select('id')
            .single()
          
          studentData.school_id = newSchool?.id || crypto.randomUUID()
        }
      }

      // Remove school_name from studentData as it's not a database field
      const { school_name, ...cleanStudentData } = studentData

      const { data, error: insertError } = await supabase
        .from('students')
        .insert([cleanStudentData])
        .select(`
          *,
          schools (
            id,
            name,
            target_enrollment,
            current_enrollment,
            monthly_cost,
            program_fee_per_student,
            created_at,
            updated_at
          )
        `)
        .single()

      if (insertError) {
        console.warn('Supabase create failed, using localStorage:', insertError.message)
        setUsingLocalStorage(true)
        const newStudent = await localDB.createStudent(studentData)
        setStudents(prev => [newStudent, ...prev])
        setError('Using local storage - data will persist in browser')
        return true
      }

      // Add the new student to the local state
      setStudents(prev => [data, ...prev])
      return true
    } catch (err: any) {
      console.warn('Error creating student, falling back to localStorage:', err.message)
      setUsingLocalStorage(true)
      const newStudent = await localDB.createStudent(studentData)
      setStudents(prev => [newStudent, ...prev])
      setError('Using local storage - data will persist in browser')
      return true
    }
  }

  // Update a student
  const updateStudent = async (id: string, updates: StudentUpdate): Promise<boolean> => {
    try {
      setError(null)

      const { data, error: updateError } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          schools (
            id,
            name,
            target_enrollment,
            current_enrollment,
            monthly_cost,
            program_fee_per_student,
            created_at,
            updated_at
          )
        `)
        .single()

      if (updateError) {
        throw updateError
      }

      // Update the student in local state
      setStudents(prev => 
        prev.map(student => student.id === id ? data : student)
      )
      return true
    } catch (err: any) {
      console.error('Error updating student:', err)
      setError(err.message)
      return false
    }
  }

  // Delete a student
  const deleteStudent = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      // Remove the student from local state
      setStudents(prev => prev.filter(student => student.id !== id))
      return true
    } catch (err: any) {
      console.error('Error deleting student:', err)
      setError(err.message)
      return false
    }
  }

  // Import multiple students
  const importStudents = async (studentsData: StudentInsert[]): Promise<{ success: number; errors: number }> => {
    let successCount = 0
    let errorCount = 0

    for (const studentData of studentsData) {
      const success = await createStudent(studentData)
      if (success) {
        successCount++
      } else {
        errorCount++
      }
    }

    return { success: successCount, errors: errorCount }
  }

  // Test database connection
  const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .limit(1)

      if (error) {
        throw error
      }

      return {
        success: true,
        message: `Connected successfully. Found ${data?.length || 0} schools.`
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Connection failed: ${err.message}`
      }
    }
  }

  // Fetch schools for dropdown
  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name')

      if (error) {
        throw error
      }

      return data || []
    } catch (err: any) {
      console.error('Error fetching schools:', err)
      return []
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  return {
    students,
    loading,
    error,
    usingLocalStorage,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    testConnection,
    fetchSchools
  }
}