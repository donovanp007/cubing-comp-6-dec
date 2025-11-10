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

  // Data sanitization functions (lenient - no rejections)
  const sanitizePhone = (phone: string | null | undefined): string | null => {
    if (!phone || typeof phone !== 'string') return null
    const trimmed = phone.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  const sanitizeEmail = (email: string | null | undefined): string | null => {
    if (!email || typeof email !== 'string') return null

    // Handle comma-separated emails (take the first one)
    const emails = email.split(',').map(e => e.trim())
    const primaryEmail = emails[0]

    return primaryEmail && primaryEmail.length > 0 ? primaryEmail : null
  }

  const sanitizeName = (name: string | null | undefined): string | null => {
    if (!name || typeof name !== 'string') return null

    // Trim whitespace and remove problematic special characters like ?
    let sanitized = name.trim().replace(/[?]/g, '')

    return sanitized && sanitized.length > 0 ? sanitized : null
  }

  const normalizeSchoolName = (schoolName: string | null | undefined): string | null => {
    if (!schoolName || typeof schoolName !== 'string') return null

    const normalized = schoolName.trim().toLowerCase()

    // Map common school name variations to standard names
    const schoolMappings: { [key: string]: string } = {
      'elk senior prep': 'Elkanah',
      'elkanah sun prep': 'Elkanah',
      'elkanah': 'Elkanah',
      'sunningdale': 'Sunningdale',
      'sunningdale primary': 'Sunningdale',
      'milnerton': 'Milnerton',
      'milnerton primary': 'Milnerton',
    }

    // Check if we have a mapping for this school
    for (const [key, value] of Object.entries(schoolMappings)) {
      if (normalized.includes(key)) {
        return value
      }
    }

    // If no mapping found, return the original with proper casing
    return schoolName.trim()
  }

  const validateGrade = (grade: any): number | null => {
    // Try to parse as number
    const parsed = parseInt(String(grade), 10)

    // Accept grades 0-12 (and R/prep as 0)
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 12) {
      return parsed
    }

    return null
  }

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
      if (!schoolName || schoolName.trim().length === 0) {
        throw new Error('School name cannot be empty')
      }

      // First, try to find existing school by name (case-insensitive)
      const { data: existingSchools, error: searchError } = await supabase
        .from('schools')
        .select('id')
        .ilike('name', schoolName)
        .limit(1)

      if (searchError) {
        console.error('Error searching for school:', searchError.message)
        throw searchError
      }

      if (existingSchools && existingSchools.length > 0) {
        console.log(`Found existing school: ${schoolName}`)
        return existingSchools[0].id
      }

      // Create new school if not found
      console.log(`Creating new school: ${schoolName}`)
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

      if (createError) {
        console.error('Error creating school:', createError.message)
        throw createError
      }

      if (!newSchool || !newSchool.id) {
        throw new Error('Failed to create school: no ID returned')
      }

      console.log(`Successfully created school: ${schoolName} with ID: ${newSchool.id}`)
      return newSchool.id
    } catch (error: any) {
      console.error('Error in findOrCreateSchool:', error.message || JSON.stringify(error))
      // Return a fallback UUID
      const fallbackId = crypto.randomUUID()
      console.warn(`Using fallback school ID: ${fallbackId}`)
      return fallbackId
    }
  }, [])

  // Create a new student - SUPABASE ONLY
  const createStudent = async (studentData: StudentInsert | any): Promise<boolean> => {
    try {
      setError(null)

      // Sanitize all available fields (lenient - no field rejection)
      const sanitizedData = {
        ...studentData,
        first_name: sanitizeName(studentData.first_name) || studentData.first_name || 'Unknown',
        last_name: sanitizeName(studentData.last_name) || studentData.last_name || undefined,
        parent_name: sanitizeName(studentData.parent_name) || studentData.parent_name || undefined,
        parent_phone: sanitizePhone(studentData.parent_phone) || studentData.parent_phone || null,
        parent_email: sanitizeEmail(studentData.parent_email) || studentData.parent_email || null,
        grade: validateGrade(studentData.grade) ?? parseInt(studentData.grade) ?? 0,
      }

      // Handle school lookup/creation if school_name is provided
      let schoolId = studentData.school_id
      if (studentData.school_name && !schoolId) {
        const normalizedSchoolName = normalizeSchoolName(studentData.school_name) || studentData.school_name
        if (normalizedSchoolName) {
          schoolId = await findOrCreateSchool(normalizedSchoolName)
        }
      }

      // Ensure we have a valid school_id
      if (!schoolId) {
        console.log('No school_id found, attempting to fetch or create one...')
        const { data: schools } = await supabase.from('schools').select('id').limit(1)
        if (schools && schools.length > 0) {
          schoolId = schools[0].id
          console.log(`Using existing school: ${schoolId}`)
        } else {
          console.log('No existing schools found, creating default school...')
          // Create a default school
          const { data: newSchool, error: defaultError } = await supabase
            .from('schools')
            .insert([{ name: 'Default School', target_enrollment: 30, monthly_cost: 2000, program_fee_per_student: 400 }])
            .select('id')
            .single()

          if (defaultError) {
            console.error('Error creating default school:', defaultError.message)
            throw defaultError
          }

          if (newSchool && newSchool.id) {
            schoolId = newSchool.id
            console.log(`Created default school: ${schoolId}`)
          } else {
            throw new Error('Failed to create or find a valid school')
          }
        }
      }

      if (!schoolId) {
        throw new Error('Unable to determine a valid school_id for student')
      }

      // Remove fields that don't exist in the database
      const { school_name, parent_notes, invoice_sent, cubing_competition_invited, ...cleanStudentData } = sanitizedData

      // Set the validated school_id
      cleanStudentData.school_id = schoolId
      console.log(`Inserting student with school_id: ${schoolId}`)

      // Truncate fields that might exceed length limits
      const fieldLimits: { [key: string]: number } = {
        'status': 20,
        'payment_status': 20,
        'class_type': 50,
        'first_name': 100,
        'last_name': 100,
        'parent_name': 100,
        'parent_phone': 20,
        'parent_email': 255,
        'notes': 1000
      }

      Object.entries(fieldLimits).forEach(([field, limit]) => {
        if (cleanStudentData[field] && typeof cleanStudentData[field] === 'string') {
          cleanStudentData[field] = cleanStudentData[field].substring(0, limit)
        }
      })

      // Log the data being inserted for debugging
      console.log('Data being inserted:', JSON.stringify(cleanStudentData, null, 2))

      // Check field lengths before inserting
      Object.entries(cleanStudentData).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 20) {
          console.warn(`Field "${key}" has length ${value.length}: "${value}"`)
        }
      })

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
        console.error('Student data that failed:', cleanStudentData)
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