import { createClient } from '@supabase/supabase-js'

// Read Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that the environment variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Make sure .env file is set up correctly and the Vite server was restarted.');
  // Optionally, throw an error to prevent the app from running without config
  // throw new Error('Supabase configuration is missing.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test connection
export async function testConnection() {
    try {
        const { data, error } = await supabase.from('schools').select('count').single()
        if (error) throw error
        console.log('Supabase connection successful')
        return true
    } catch (error) {
        console.error('Supabase connection error:', error)
        return false
    }
}

// Database operations for Schools
export async function createSchool(data) {
    try {
        console.log('Creating school with data:', data)
        const { data: result, error } = await supabase
            .from('schools')
            .insert([data])
            .select()
        
        if (error) {
            console.error('Error creating school:', error)
            throw error
        }
        
        console.log('School created successfully:', result)
        return result
    } catch (error) {
        console.error('Error in createSchool:', error)
        throw error
    }
}

export async function getSchools() {
    try {
        const { data, error } = await supabase
            .from('schools')
            .select('*')
        
        if (error) {
            console.error('Error getting schools:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getSchools:', error)
        throw error
    }
}

export async function updateSchool(schoolId, updateData) {
    try {
        if (!schoolId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(schoolId)) {
            throw new Error('Invalid school ID format')
        }

        console.log('Updating school:', schoolId, 'with data:', updateData)
        const { data, error } = await supabase
            .from('schools')
            .update(updateData)
            .eq('id', schoolId)
            .select()
        
        if (error) {
            console.error('Error updating school:', error)
            throw error
        }
        
        console.log('School updated successfully:', data)
        return data
    } catch (error) {
        console.error('Error in updateSchool:', error)
        throw error
    }
}

// Database operations for Coaches
export async function createCoach(data) {
    try {
        console.log('Creating coach with data:', data)
        const { data: result, error } = await supabase
            .from('coaches')
            .insert([data])
            .select()
        
        if (error) {
            console.error('Error creating coach:', error)
            throw error
        }
        
        console.log('Coach created successfully:', result)
        return result
    } catch (error) {
        console.error('Error in createCoach:', error)
        throw error
    }
}

export async function getCoaches() {
    try {
        const { data, error } = await supabase
            .from('coaches')
            .select('*')
        
        if (error) {
            console.error('Error getting coaches:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getCoaches:', error)
        throw error
    }
}

// Database operations for Classes
export async function createClass(data) {
    if (!data.schoolId) {
        throw new Error('SchoolId is required')
    }

    try {
        console.log('Creating class with data:', data)
        // Ensure schoolId is a valid UUID
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.schoolId)) {
            throw new Error('Invalid schoolId format')
        }

        // Validate coachId if provided
        if (data.coachId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.coachId)) {
            throw new Error('Invalid coachId format')
        }

        const { data: result, error } = await supabase
            .from('classes')
            .insert([{
                school_id: data.schoolId,
                coach_id: data.coachId || null,
                name: data.name,
                grade: data.grade || null
            }])
            .select()
        
        if (error) {
            console.error('Error creating class:', error)
            throw error
        }
        
        console.log('Class created successfully:', result)
        return result
    } catch (error) {
        console.error('Error in createClass:', error)
        throw error
    }
}

export async function getClasses(schoolId) {
    if (!schoolId) {
        throw new Error('SchoolId is required')
    }

    try {
        // Ensure schoolId is a valid UUID
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(schoolId)) {
            throw new Error('Invalid schoolId format')
        }

        const { data, error } = await supabase
            .from('classes')
            .select(`
                *,
                school:schools(*),
                coach:coaches(*)
            `)
            .eq('school_id', schoolId)
        
        if (error) {
            console.error('Error getting classes:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getClasses:', error)
        throw error
    }
}

export async function updateClass(classId, updateData) {
    try {
        if (!classId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classId)) {
            throw new Error('Invalid class ID format')
        }

        console.log('Updating class:', classId, 'with data:', updateData)
        const { data, error } = await supabase
            .from('classes')
            .update(updateData)
            .eq('id', classId)
            .select()
        
        if (error) {
            console.error('Error updating class:', error)
            throw error
        }
        
        console.log('Class updated successfully:', data)
        return data
    } catch (error) {
        console.error('Error in updateClass:', error)
        throw error
    }
}

// Database operations for Students
export async function createStudent(data) {
    try {
        console.log('Creating student with data:', data)
        
        // Start with basic columns that we know exist
        const studentData = {
            name: data.name,
            class_id: data.class_id || null
        }
        
        // Try to add enhanced columns if they're available
        // This will fail gracefully if the schema cache hasn't refreshed
        try {
            const enhancedData = {
                ...studentData,
                surname: data.surname || '',
                grade: data.grade || '',
                school_name: data.school_name || '',
                parent_contact_name: data.parent_contact_name || '',
                parent_phone: data.parent_phone || '',
                parent_email: data.parent_email || '',
                emergency_contact: data.emergency_contact || '',
                medical_notes: data.medical_notes || '',
                registration_source: data.registration_source || 'regular',
                term_id: data.term_id || null,
                term_status: data.term_status || 'active',
                enrolled_date: data.enrolled_date || new Date().toISOString().split('T')[0]
                // Removed date_of_birth as it's causing schema cache issues
            }
            
            const { data: result, error } = await supabase
                .from('students')
                .insert([enhancedData])
                .select()
            
            if (error) {
                throw error
            }
            
            console.log('Student created successfully with enhanced data:', result)
            return result
            
        } catch (enhancedError) {
            console.warn('Enhanced columns not available, using basic schema:', enhancedError.message)
            
            // Fallback to basic columns only
            const { data: result, error } = await supabase
                .from('students')
                .insert([studentData])
                .select()
            
            if (error) {
                console.error('Error creating student with basic data:', error)
                throw error
            }
            
            console.log('Student created successfully with basic data:', result)
            return result
        }
        
    } catch (error) {
        console.error('Error in createStudent:', error)
        throw error
    }
}

export async function getStudents() {
  try {
    console.log('🔍 getStudents: Starting simplified query...')
    
    // Start with a simple query first
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        name,
        class_id,
        created_at
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Supabase error in getStudents:', error)
      throw error
    }
    
    console.log('✅ getStudents: Basic query successful, returned', data?.length || 0, 'students')
    
    // Try to fetch additional data, but don't let it block the main query
    if (data && data.length > 0) {
      try {
        console.log('🔄 Attempting to fetch additional student data...')
        const enrichedData = await Promise.race([
          supabase
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
              class:classes (
                id,
                name
              )
            `)
            .order('created_at', { ascending: false }),
          new Promise((resolve) => setTimeout(() => resolve({ data: null }), 2000)) // 2s timeout
        ])
        
        if (enrichedData.data) {
          console.log('✅ Enriched data loaded successfully')
          return { data: enrichedData.data, error: null }
        } else {
          console.log('⚠️ Using basic data due to timeout')
        }
      } catch (enrichError) {
        console.warn('⚠️ Failed to load enriched data, using basic:', enrichError)
      }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('❌ Exception in getStudents:', error)
    throw error
  }
}

export async function getStudent(studentId) {
    try {
        // Validate student ID is a UUID
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        const { data, error } = await supabase
            .from('students')
            .select(`
                *,
                class:classes(
                    id,
                    name,
                    grade,
                    school:schools(
                        id,
                        name
                    )
                ),
                attendance:attendance(
                    id,
                    date,
                    status,
                    created_at
                ),
                notes:notes(
                    id,
                    text,
                    created_at
                ),
                merit_points:merit_points(
                    id,
                    points,
                    category,
                    description,
                    created_at
                ),
                solve_times:solve_times(
                    id,
                    time_seconds,
                    puzzle_type,
                    created_at
                ),
                cube_progress:cube_progress(
                    id,
                    cube_type,
                    current_level,
                    updated_at,
                    notes
                )
            `)
            .eq('id', studentId)
            .single()
        
        if (error) {
            console.error('Error getting student:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getStudent:', error)
        throw error
    }
}

export async function updateStudent(studentId, updateData) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        console.log('Updating student:', studentId, 'with data:', updateData)
        const { data, error } = await supabase
            .from('students')
            .update(updateData)
            .eq('id', studentId)
            .select()
        
        if (error) {
            console.error('Error updating student:', error)
            throw error
        }
        
        console.log('Student updated successfully:', data)
        return data
    } catch (error) {
        console.error('Error in updateStudent:', error)
        throw error
    }
}

// Database operations for Attendance
export async function recordAttendance(data) {
    try {
        console.log('Recording attendance with data:', data)
        
        // Validate student_id is a valid UUID
        if (!data.student_id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.student_id)) {
            throw new Error('Invalid student_id format')
        }

        // Validate date is a valid date string
        if (!data.date || isNaN(new Date(data.date).getTime())) {
            throw new Error('Invalid date format')
        }

        // Validate status is one of the allowed values
        const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']
        if (!data.status || !validStatuses.includes(data.status.toUpperCase())) {
            throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '))
        }

        const { data: result, error } = await supabase
            .from('attendance')
            .insert([{
                student_id: data.student_id,
                date: data.date,
                status: data.status.toUpperCase()
            }])
            .select()
        
        if (error) {
            console.error('Error recording attendance:', error)
            throw error
        }
        
        console.log('Attendance recorded successfully:', result)
        return result
    } catch (error) {
        console.error('Error in recordAttendance:', error)
        throw error
    }
}

export async function getStudentAttendance(studentId) {
    try {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('student_id', studentId)
        
        if (error) {
            console.error('Error getting student attendance:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getStudentAttendance:', error)
        throw error
    }
}

// Database operations for Notes
export async function addNote(data) {
    try {
        console.log('Adding note with data:', data)
        const { data: result, error } = await supabase
            .from('notes')
            .insert([data])
            .select()
        
        if (error) {
            console.error('Error adding note:', error)
            throw error
        }
        
        console.log('Note added successfully:', result)
        return result
    } catch (error) {
        console.error('Error in addNote:', error)
        throw error
    }
}

export async function getStudentNotes(studentId) {
    try {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('student_id', studentId)
        
        if (error) {
            console.error('Error getting student notes:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getStudentNotes:', error)
        throw error
    }
}

export async function deleteNote(noteId) {
    try {
        console.log('Deleting note with ID:', noteId)
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId)
        
        if (error) {
            console.error('Error deleting note:', error)
            throw error
        }
        
        console.log('Note deleted successfully')
        return true
    } catch (error) {
        console.error('Error in deleteNote:', error)
        throw error
    }
}

// Database operations for Merit Points
export async function addMeritPoints(data) {
    try {
        console.log('Adding merit points with data:', data)
        const { data: result, error } = await supabase
            .from('merit_points')
            .insert([data])
            .select()
        
        if (error) {
            console.error('Error adding merit points:', error)
            throw error
        }
        
        console.log('Merit points added successfully:', result)
        return result
    } catch (error) {
        console.error('Error in addMeritPoints:', error)
        throw error
    }
}

export async function getStudentMerits(studentId) {
    try {
        const { data, error } = await supabase
            .from('merit_points')
            .select('*')
            .eq('student_id', studentId)
        
        if (error) {
            console.error('Error getting student merits:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getStudentMerits:', error)
        throw error
    }
}

// Enhanced merit functions for character development system
export async function addCharacterSticker(data) {
    try {
        console.log('Adding character sticker with data:', data)
        
        // Validate required fields
        if (!data.student_id || !data.sticker_category || !data.sticker_type) {
            throw new Error('student_id, sticker_category, and sticker_type are required')
        }
        
        const { data: result, error } = await supabase
            .from('merit_points')
            .insert([{
                student_id: data.student_id,
                points: data.points || 1,
                category: `${data.sticker_category || 'Character'} - ${data.sticker_type || 'Sticker'}`,
                description: data.description || `Character sticker: ${data.sticker_type || 'Achievement'}`
            }])
            .select()
        
        if (error) {
            console.error('Error adding character sticker:', error)
            throw error
        }
        
        console.log('Character sticker added successfully:', result)
        return result
    } catch (error) {
        console.error('Error in addCharacterSticker:', error)
        throw error
    }
}

export async function addCustomMeritPoints(data) {
    try {
        console.log('Adding custom merit points with data:', data)
        
        // Validate required fields
        if (!data.student_id || !data.points || !data.description) {
            throw new Error('student_id, points, and description are required')
        }
        
        const { data: result, error } = await supabase
            .from('merit_points')
            .insert([{
                student_id: data.student_id,
                points: data.points,
                category: data.category || 'Custom Merit',
                description: data.description
            }])
            .select()
        
        if (error) {
            console.error('Error adding custom merit points:', error)
            throw error
        }
        
        console.log('Custom merit points added successfully:', result)
        return result
    } catch (error) {
        console.error('Error in addCustomMeritPoints:', error)
        throw error
    }
}

export async function getCharacterStickers() {
    try {
        const { data, error } = await supabase
            .from('merit_stickers')
            .select('*')
            .order('category', { ascending: true })
            .order('sticker_type', { ascending: true })
        
        if (error) {
            console.error('Error getting character stickers:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getCharacterStickers:', error)
        throw error
    }
}

export async function getStudentCharacterSummary(studentId) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        const { data, error } = await supabase
            .from('student_merit_summary')
            .select('*')
            .eq('student_id', studentId)
            .single()
        
        if (error) {
            console.error('Error getting student character summary:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getStudentCharacterSummary:', error)
        throw error
    }
}

export async function getCharacterLeaderboard(classId = null) {
    try {
        let query = supabase
            .from('merit_leaderboard')
            .select('*')
            .order('total_points', { ascending: false })
        
        if (classId) {
            query = query.eq('class_id', classId)
        }
        
        const { data, error } = await query
        
        if (error) {
            console.error('Error getting character leaderboard:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getCharacterLeaderboard:', error)
        throw error
    }
}

export async function addMeritBadge(data) {
    try {
        console.log('Adding merit badge with data:', data)
        
        // Validate required fields
        if (!data.student_id || !data.badge_type || !data.badge_name) {
            throw new Error('student_id, badge_type, and badge_name are required')
        }
        
        const { data: result, error } = await supabase
            .from('merit_badges')
            .insert([{
                student_id: data.student_id,
                badge_type: data.badge_type,
                badge_name: data.badge_name,
                description: data.description || '',
                requirements_met: data.requirements_met || '',
                term_id: data.term_id || null
            }])
            .select()
        
        if (error) {
            console.error('Error adding merit badge:', error)
            throw error
        }
        
        console.log('Merit badge added successfully:', result)
        return result
    } catch (error) {
        console.error('Error in addMeritBadge:', error)
        throw error
    }
}

export async function getStudentBadges(studentId) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        const { data, error } = await supabase
            .from('merit_badges')
            .select('*')
            .eq('student_id', studentId)
            .order('awarded_date', { ascending: false })
        
        if (error) {
            console.error('Error getting student badges:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getStudentBadges:', error)
        throw error
    }
}

// Database operations for Solve Times
export async function addSolveTime(data) {
    try {
        console.log('Adding solve time with data:', data)
        const { data: result, error } = await supabase
            .from('solve_times')
            .insert([data])
            .select()
        
        if (error) {
            console.error('Error adding solve time:', error)
            throw error
        }
        
        console.log('Solve time added successfully:', result)
        return result
    } catch (error) {
        console.error('Error in addSolveTime:', error)
        throw error
    }
}

export async function getStudentSolveTimes(studentId) {
    try {
        const { data, error } = await supabase
            .from('solve_times')
            .select('*')
            .eq('student_id', studentId)
        
        if (error) {
            console.error('Error getting student solve times:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getStudentSolveTimes:', error)
        throw error
    }
}

// Database operations for Cube Progress
export async function getCubeProgress(studentId) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        const { data, error } = await supabase
            .from('cube_progress')
            .select('*')
            .eq('student_id', studentId)
        
        if (error) {
            console.error('Error getting cube progress:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getCubeProgress:', error)
        throw error
    }
}

export async function updateCubeProgress(studentId, cubeType, currentLevel, updatedBy = null, notes = null) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        const validCubeTypes = ['2x2', '3x3', '4x4']
        if (!validCubeTypes.includes(cubeType)) {
            throw new Error('Invalid cube type. Must be one of: ' + validCubeTypes.join(', '))
        }

        const { data: result, error } = await supabase
            .from('cube_progress')
            .upsert([{
                student_id: studentId,
                cube_type: cubeType,
                current_level: currentLevel,
                updated_by: updatedBy,
                notes: notes,
                updated_at: new Date().toISOString()
            }], {
                onConflict: 'student_id,cube_type'
            })
            .select()
        
        if (error) {
            console.error('Error updating cube progress:', error)
            throw error
        }
        
        console.log('Cube progress updated successfully:', result)
        return result
    } catch (error) {
        console.error('Error in updateCubeProgress:', error)
        throw error
    }
}

export async function getClassCubeProgress(classId) {
    try {
        if (!classId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classId)) {
            throw new Error('Invalid class ID format')
        }

        const { data, error } = await supabase
            .from('student_cube_progress')
            .select('*')
            .eq('class_id', classId)
        
        if (error) {
            console.error('Error getting class cube progress:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getClassCubeProgress:', error)
        throw error
    }
}

export async function recordAttendanceWithCubeProgress(attendanceData, cubeProgressUpdates = []) {
    try {
        console.log('Recording attendance with cube progress:', { attendanceData, cubeProgressUpdates })
        
        // First record attendance
        const attendanceResult = await recordAttendance(attendanceData)
        
        // Then update cube progress if provided
        const cubeProgressResults = []
        for (const update of cubeProgressUpdates) {
            if (update.currentLevel && update.currentLevel !== update.previousLevel) {
                const result = await updateCubeProgress(
                    attendanceData.student_id,
                    update.cubeType,
                    update.currentLevel,
                    update.updatedBy,
                    update.notes
                )
                cubeProgressResults.push(result)
            }
        }
        
        return {
            attendance: attendanceResult,
            cubeProgress: cubeProgressResults
        }
    } catch (error) {
        console.error('Error in recordAttendanceWithCubeProgress:', error)
        throw error
    }
}

export async function getCubeProgressHistory(studentId, cubeType = null) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        let query = supabase
            .from('cube_progress_history')
            .select('*')
            .eq('student_id', studentId)
            .order('changed_at', { ascending: false })

        if (cubeType) {
            query = query.eq('cube_type', cubeType)
        }

        const { data, error } = await query
        
        if (error) {
            console.error('Error getting cube progress history:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getCubeProgressHistory:', error)
        throw error
    }
}

// Database operations for Coaching Program
export async function fetchCoachingWeeks() {
    try {
        const { data, error } = await supabase
            .from('coaching_weeks')
            .select('*')
            .order('week_number', { ascending: true })
        
        if (error) {
            console.error('Error fetching coaching weeks:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in fetchCoachingWeeks:', error)
        throw error
    }
}

export async function getClassLessonProgress(classId) {
    try {
        if (!classId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classId)) {
            throw new Error('Invalid class ID format')
        }

        const { data, error } = await supabase
            .from('class_lesson_progress')
            .select('*')
            .eq('class_id', classId)
            .order('week_number', { ascending: true })
        
        if (error) {
            console.error('Error getting class lesson progress:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getClassLessonProgress:', error)
        throw error
    }
}

export async function markLessonComplete(classId, weekNumber, notes = '') {
    try {
        if (!classId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classId)) {
            throw new Error('Invalid class ID format')
        }

        const { data, error } = await supabase
            .from('class_lesson_progress')
            .upsert([{
                class_id: classId,
                week_number: weekNumber,
                status: 'completed',
                completed_at: new Date().toISOString(),
                notes: notes
            }])
            .select()
        
        if (error) {
            console.error('Error marking lesson complete:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in markLessonComplete:', error)
        throw error
    }
}

export async function sendParentNotifications(classId, weekNumber, coachingWeek) {
    try {
        if (!classId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classId)) {
            throw new Error('Invalid class ID format')
        }

        // Get all active students in the class
        const { data: students, error: studentsError } = await supabase
            .from('students')
            .select('id, name')
            .eq('class_id', classId)
            .eq('term_status', 'active')
        
        if (studentsError) {
            console.error('Error getting students for notifications:', studentsError)
            throw studentsError
        }
        
        // Create notification records for each student
        const notifications = students.map(student => ({
            student_id: student.id,
            message: coachingWeek.parent_communication.replace('[Student]', student.name),
            notification_type: 'lesson_completion',
            delivery_status: 'sent'
        }))
        
        const { data, error } = await supabase
            .from('parent_notifications')
            .insert(notifications)
            .select()
        
        if (error) {
            console.error('Error sending parent notifications:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in sendParentNotifications:', error)
        throw error
    }
}

export async function getStudentLessonProgress(studentId) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        const { data, error } = await supabase
            .from('student_lesson_progress')
            .select('*')
            .eq('student_id', studentId)
            .order('week_number', { ascending: true })
        
        if (error) {
            console.error('Error getting student lesson progress:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getStudentLessonProgress:', error)
        throw error
    }
}

// Database operations for Term Management
export async function fetchTerms() {
    try {
        const { data, error } = await supabase
            .from('terms')
            .select('*')
            .order('start_date', { ascending: false })
        
        if (error) {
            console.error('Error fetching terms:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in fetchTerms:', error)
        throw error
    }
}

export async function createTerm(termData) {
    try {
        const { data, error } = await supabase
            .from('terms')
            .insert([termData])
            .select()
        
        if (error) {
            console.error('Error creating term:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in createTerm:', error)
        throw error
    }
}

export async function updateTerm(termId, termData) {
    try {
        if (!termId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(termId)) {
            throw new Error('Invalid term ID format')
        }

        const { data, error } = await supabase
            .from('terms')
            .update(termData)
            .eq('id', termId)
            .select()
        
        if (error) {
            console.error('Error updating term:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in updateTerm:', error)
        throw error
    }
}

export async function getStudentsByTerm(termId) {
    try {
        if (!termId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(termId)) {
            throw new Error('Invalid term ID format')
        }

        const { data, error } = await supabase
            .from('students')
            .select(`
                *,
                class:classes(
                    id,
                    name
                ),
                cube_progress:cube_progress(
                    id,
                    cube_type,
                    current_level
                )
            `)
            .eq('term_id', termId)
        
        if (error) {
            console.error('Error getting students by term:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in getStudentsByTerm:', error)
        throw error
    }
}

export async function importStudentsToTerm(termId, studentsData) {
    try {
        if (!termId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(termId)) {
            throw new Error('Invalid term ID format')
        }

        const studentsToInsert = studentsData.map(student => ({
            name: student.name,
            class_id: student.class_id || null,
            term_id: termId,
            term_status: student.term_status || 'active',
            enrolled_date: new Date().toISOString().split('T')[0]
        }))
        
        const { data, error } = await supabase
            .from('students')
            .insert(studentsToInsert)
            .select()
        
        if (error) {
            console.error('Error importing students to term:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in importStudentsToTerm:', error)
        throw error
    }
}

export async function updateStudentTermStatus(studentId, newStatus) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        const validStatuses = ['active', 'inactive', 'graduated', 'transferred']
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '))
        }

        const { data, error } = await supabase
            .from('students')
            .update({ term_status: newStatus })
            .eq('id', studentId)
            .select()
        
        if (error) {
            console.error('Error updating student term status:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in updateStudentTermStatus:', error)
        throw error
    }
}

// Database operations for Sales Flow
export async function fetchSalesStages() {
    try {
        const { data, error } = await supabase
            .from('sales_stages')
            .select('*')
            .order('order_position', { ascending: true })
        
        if (error) {
            console.error('Error fetching sales stages:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in fetchSalesStages:', error)
        throw error
    }
}

export async function createSalesStage(stageData) {
    try {
        const { data, error } = await supabase
            .from('sales_stages')
            .insert([stageData])
            .select()
        
        if (error) {
            console.error('Error creating sales stage:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in createSalesStage:', error)
        throw error
    }
}

export async function updateSalesStage(stageId, stageData) {
    try {
        if (!stageId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stageId)) {
            throw new Error('Invalid stage ID format')
        }

        const { data, error } = await supabase
            .from('sales_stages')
            .update(stageData)
            .eq('id', stageId)
            .select()
        
        if (error) {
            console.error('Error updating sales stage:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in updateSalesStage:', error)
        throw error
    }
}

export async function fetchStudentSalesData() {
    try {
        const { data, error } = await supabase
            .from('student_sales_progress')
            .select('*')
            .order('moved_to_stage_at', { ascending: false })
        
        if (error) {
            console.error('Error fetching student sales data:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in fetchStudentSalesData:', error)
        throw error
    }
}

export async function addStudentToSalesStage(studentId, stageId, amount = 0, notes = '') {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        if (!stageId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stageId)) {
            throw new Error('Invalid stage ID format')
        }

        const { data, error } = await supabase
            .from('student_sales_progress')
            .insert([{
                student_id: studentId,
                stage_id: stageId,
                amount_zar: amount,
                notes: notes
            }])
            .select()
        
        if (error) {
            console.error('Error adding student to sales stage:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in addStudentToSalesStage:', error)
        throw error
    }
}

export async function moveStudentToStage(studentId, newStageId, notes = '') {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        if (!newStageId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newStageId)) {
            throw new Error('Invalid stage ID format')
        }

        // Get current data to preserve amount
        const { data: currentData, error: currentError } = await supabase
            .from('student_sales_progress')
            .select('amount_zar')
            .eq('student_id', studentId)
            .order('moved_to_stage_at', { ascending: false })
            .limit(1)
        
        if (currentError) {
            console.error('Error getting current student sales data:', currentError)
            throw currentError
        }

        const { data, error } = await supabase
            .from('student_sales_progress')
            .insert([{
                student_id: studentId,
                stage_id: newStageId,
                amount_zar: currentData?.[0]?.amount_zar || 0,
                notes: notes
            }])
            .select()
        
        if (error) {
            console.error('Error moving student to stage:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in moveStudentToStage:', error)
        throw error
    }
}

export async function updateStudentSalesInfo(studentId, updateData) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        // Get current record
        const { data: currentData, error: currentError } = await supabase
            .from('student_sales_progress')
            .select('*')
            .eq('student_id', studentId)
            .order('moved_to_stage_at', { ascending: false })
            .limit(1)
        
        if (currentError) {
            console.error('Error getting current student sales data:', currentError)
            throw currentError
        }

        if (!currentData || currentData.length === 0) {
            throw new Error('No sales data found for student')
        }

        const current = currentData[0]

        // If stage changed, create new record
        if (updateData.stage_id !== current.stage_id) {
            const { data, error } = await supabase
                .from('student_sales_progress')
                .insert([{
                    student_id: studentId,
                    stage_id: updateData.stage_id,
                    amount_zar: updateData.amount_zar,
                    notes: updateData.notes
                }])
                .select()
            
            if (error) {
                console.error('Error creating new sales progress record:', error)
                throw error
            }
            
            return data
        } else {
            // Update current record
            const { data, error } = await supabase
                .from('student_sales_progress')
                .update({
                    amount_zar: updateData.amount_zar,
                    notes: updateData.notes
                })
                .eq('id', current.id)
                .select()
            
            if (error) {
                console.error('Error updating sales progress record:', error)
                throw error
            }
            
            return data
        }
    } catch (error) {
        console.error('Error in updateStudentSalesInfo:', error)
        throw error
    }
}

export async function removeStudentFromSalesPipeline(studentId) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        const { error } = await supabase
            .from('student_sales_progress')
            .delete()
            .eq('student_id', studentId)
        
        if (error) {
            console.error('Error removing student from sales pipeline:', error)
            throw error
        }
        
        return true
    } catch (error) {
        console.error('Error in removeStudentFromSalesPipeline:', error)
        throw error
    }
}

// Student Tags Management
export async function updateStudentTags(studentId, tags) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        const { data, error } = await supabase
            .from('students')
            .update({ tags: tags || [] })
            .eq('id', studentId)
            .select()
        
        if (error) {
            console.error('Error updating student tags:', error)
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Error in updateStudentTags:', error)
        throw error
    }
}

export async function addStudentTag(studentId, tag) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        // First get current tags
        const { data: studentData, error: getError } = await supabase
            .from('students')
            .select('tags')
            .eq('id', studentId)
            .single()
        
        if (getError) {
            console.error('Error getting student tags:', getError)
            throw getError
        }

        const currentTags = studentData.tags || []
        if (!currentTags.includes(tag)) {
            const newTags = [...currentTags, tag]
            return await updateStudentTags(studentId, newTags)
        }
        
        return studentData
    } catch (error) {
        console.error('Error in addStudentTag:', error)
        throw error
    }
}

export async function removeStudentTag(studentId, tag) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        // First get current tags
        const { data: studentData, error: getError } = await supabase
            .from('students')
            .select('tags')
            .eq('id', studentId)
            .single()
        
        if (getError) {
            console.error('Error getting student tags:', getError)
            throw getError
        }

        const currentTags = studentData.tags || []
        const newTags = currentTags.filter(t => t !== tag)
        return await updateStudentTags(studentId, newTags)
    } catch (error) {
        console.error('Error in removeStudentTag:', error)
        throw error
    }
}

// Database operations for deleting students
export async function deleteStudent(studentId) {
    try {
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
            throw new Error('Invalid student ID format')
        }

        console.log('Deleting student with ID:', studentId)
        
        // Delete student and all related records
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', studentId)
        
        if (error) {
            console.error('Error deleting student:', error)
            throw error
        }
        
        console.log('Student deleted successfully')
        return true
    } catch (error) {
        console.error('Error in deleteStudent:', error)
        throw error
    }
}
