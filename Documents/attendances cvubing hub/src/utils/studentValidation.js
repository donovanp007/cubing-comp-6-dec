// Student validation and class assignment utilities
import { supabase } from '../supabase'

export const validateStudentData = (studentData) => {
  const errors = []
  
  if (!studentData.name || studentData.name.trim() === '') {
    errors.push('Student name is required')
  }
  
  if (!studentData.surname || studentData.surname.trim() === '') {
    errors.push('Student surname is required')
  }
  
  if (!studentData.class_id) {
    errors.push('Class assignment is required')
  }
  
  // Validate class_id is a valid UUID
  if (studentData.class_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentData.class_id)) {
    errors.push('Invalid class ID format')
  }
  
  return errors
}

export const ensureStudentHasClass = async (studentData) => {
  if (!studentData.class_id) {
    // Find or create a default class
    const { data: defaultClass } = await supabase
      .from('classes')
      .select('id')
      .eq('name', 'Unassigned Students')
      .single()
    
    if (defaultClass) {
      studentData.class_id = defaultClass.id
    } else {
      // Create default unassigned class
      const { data: newClass } = await supabase
        .from('classes')
        .insert({
          name: 'Unassigned Students',
          grade: 'Mixed',
          school_id: studentData.school_id || 'default-school-id'
        })
        .select('id')
        .single()
      
      if (newClass) {
        studentData.class_id = newClass.id
      }
    }
  }
  
  return studentData
}

export const getStudentsByClass = async (classId) => {
  if (!classId) {
    console.error('No class ID provided to getStudentsByClass')
    return []
  }
  
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      merit_points (
        id,
        points,
        category,
        description,
        created_at
      ),
      attendance (
        id,
        date,
        status,
        created_at
      ),
      cube_progress (
        id,
        cube_type,
        current_level,
        notes,
        created_at
      )
    `)
    .eq('class_id', classId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching students by class:', error)
    return []
  }
  
  return data || []
}

export const assignStudentToClass = async (studentId, classId) => {
  if (!studentId || !classId) {
    throw new Error('Both student ID and class ID are required')
  }
  
  const { data, error } = await supabase
    .from('students')
    .update({ class_id: classId })
    .eq('id', studentId)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to assign student to class: ${error.message}`)
  }
  
  return data
}

export const createStudentWithClass = async (studentData) => {
  // Ensure required fields
  const errors = validateStudentData(studentData)
  if (errors.length > 0) {
    throw new Error(errors.join(', '))
  }
  
  // Ensure student has a class
  const validatedData = await ensureStudentHasClass(studentData)
  
  // Create student
  const { data, error } = await supabase
    .from('students')
    .insert(validatedData)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create student: ${error.message}`)
  }
  
  return data
}

// Utility to check if a class exists
export const validateClassExists = async (classId) => {
  if (!classId) return false
  
  const { data, error } = await supabase
    .from('classes')
    .select('id')
    .eq('id', classId)
    .single()
  
  return !error && !!data
}

// Get all students without a class
export const getUnassignedStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .is('class_id', null)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching unassigned students:', error)
    return []
  }
  
  return data || []
}

// Bulk assign students to class
export const assignStudentsToClass = async (studentIds, classId) => {
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    throw new Error('Student IDs array is required')
  }
  
  if (!classId) {
    throw new Error('Class ID is required')
  }
  
  const { data, error } = await supabase
    .from('students')
    .update({ class_id: classId })
    .in('id', studentIds)
    .select()
  
  if (error) {
    throw new Error(`Failed to assign students to class: ${error.message}`)
  }
  
  return data
}
