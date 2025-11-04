'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { StudentWithSchool, StudentInsert, StudentUpdate } from '@/types'

export function useSupabaseStudents() {
  const [students, setStudents] = useState<StudentWithSchool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingLocalStorage, setUsingLocalStorage] = useState(false)

  // Track if component is mounted
  const isMountedRef = useRef(true)

  // Fetch students with school information - SUPABASE ONLY
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setUsingLocalStorage(false)

      console.log('Fetching students from Supabase...')

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
        console.error('Supabase fetch failed:', fetchError.message)
        setError(`Database error: ${fetchError.message}`)
        setStudents([])
        return
      }

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        console.log('Successfully fetched students from Supabase:', data?.length || 0)
        // Add default values for missing fields in the database schema
        const studentsWithDefaults = (data || []).map(student => ({
          ...student,
          invoice_sent: student.invoice_sent ?? false,
          cubing_competition_invited: student.cubing_competition_invited ?? false,
          parent_notes: student.parent_notes ?? null,
        }))
        setStudents(studentsWithDefaults)
      }
    } catch (err: any) {
      console.error('Unexpected error:', err.message)
      if (isMountedRef.current) {
        setError(`Connection error: ${err.message}`)
        setStudents([])
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  // Set mounted flag on mount/unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Helper function to find or create school by name
  const findOrCreateSchool = useCallback(async (schoolName: string): Promise<string> => {
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
          program_fee_per_student: 450,
          term_fee_per_student: 1350 // 3 months * 450
        }])
        .select('id')
        .single()

      if (createError) throw createError

      return newSchool.id
    } catch (error) {
      console.error('Error finding/creating school:', error)
      return crypto.randomUUID() // Fallback
    }
  }, [])

  // Create a new student - SUPABASE ONLY
  const createStudent = async (studentData: StudentInsert | any): Promise<boolean> => {
    try {
      setError(null)

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
            .insert([{ name: 'Default School', target_enrollment: 30, monthly_cost: 2000, program_fee_per_student: 400, term_fee_per_student: 1200 }])
            .select('id')
            .single()
          
          if (newSchool) {
            studentData.school_id = newSchool.id
          }
        }
      }

      // Remove fields that don't exist in the database
      const { school_name, parent_notes, invoice_sent, cubing_competition_invited, ...cleanStudentData } = studentData

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
        console.error('Failed to create student:', insertError.message)
        setError(`Failed to create student: ${insertError.message}`)
        return false
      }

      // Add the new student to the local state with default values for missing fields
      if (data) {
        const studentWithDefaults = {
          ...data,
          invoice_sent: data.invoice_sent ?? false,
          cubing_competition_invited: data.cubing_competition_invited ?? false,
          parent_notes: data.parent_notes ?? null,
        }
        setStudents(prev => [studentWithDefaults, ...prev])
        return true
      }

      return false
    } catch (err: any) {
      console.error('Error creating student:', err.message)
      setError(`Error creating student: ${err.message}`)
      return false
    }
  }

  // Update a student
  const updateStudent = async (id: string, updates: StudentUpdate): Promise<boolean> => {
    try {
      setError(null)
      console.log('=== Student Update Debug ===')
      console.log('Student ID:', id)
      console.log('Updates object:', updates)
      console.log('Updates keys:', Object.keys(updates))
      console.log('Updates values:', Object.values(updates))
      console.log('Update types:', Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, typeof v])))

      // Check if invoice_sent field exists by testing with a simple query first
      if (updates.invoice_sent !== undefined) {
        console.log('Attempting to update invoice_sent field...')
        const { data: testData, error: testError } = await supabase
          .from('students')
          .select('invoice_sent')
          .eq('id', id)
          .limit(1)

        if (testError) {
          console.error('invoice_sent field does not exist in database:', testError)
          // Remove invoice_sent from updates if column doesn't exist
          const { invoice_sent, ...updatesWithoutInvoice } = updates
          updates = updatesWithoutInvoice
          console.log('Continuing without invoice_sent field:', updates)
        } else {
          console.log('invoice_sent field exists, test query successful:', testData)
        }
      }

      // Add updated_at timestamp
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      console.log('Final update data being sent to database:', updateData)
      
      const { data, error: updateError } = await supabase
        .from('students')
        .update(updateData)
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
        console.error('Supabase update error details:')
        console.error('Error code:', updateError.code)
        console.error('Error message:', updateError.message)
        console.error('Error details:', updateError.details)
        console.error('Error hint:', updateError.hint)
        console.error('Full error object:', updateError)
        setError(`Database update failed: ${updateError.message}`)
        return false
      }

      // Update the student in local state with missing field defaults
      const mappedStudent = {
        ...data,
        parent_notes: null,
        invoice_sent: data.invoice_sent ?? false,
        cubing_competition_invited: data.cubing_competition_invited ?? false,
      }
      setStudents(prev => 
        prev.map(student => student.id === id ? mappedStudent : student)
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
  }, [fetchStudents])

  // Set mounted flag on mount/unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
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