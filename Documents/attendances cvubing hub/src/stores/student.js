import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import { 
  createStudent, 
  getStudents, 
  recordAttendance, 
  getStudentAttendance,
  addNote,
  getStudentNotes,
  deleteNote,
  addMeritPoints,
  getStudentMerits,
  addSolveTime,
  getStudentSolveTimes,
  getStudent,
  updateStudent,
  recordAttendanceWithCubeProgress,
  getCubeProgress,
  updateCubeProgress,
  getCubeProgressHistory,
  getStudentsByTerm,
  updateStudentTermStatus,
  addCharacterSticker,
  addCustomMeritPoints,
  getCharacterStickers,
  getStudentCharacterSummary,
  getCharacterLeaderboard,
  addMeritBadge,
  getStudentBadges,
  updateStudentTags,
  addStudentTag,
  removeStudentTag
} from '../supabase'

export const useStudentStore = defineStore('student', {
  state: () => ({
    students: [],
    loading: false,
    error: null,
    // TCH Character Development Merit System
    characterStickers: {
      persistence_power: [
        { type: 'never_give_up', name: 'Never Give Up', emoji: '🎯', points: 3, description: 'For continuing after multiple failures' },
        { type: 'try_again_champion', name: 'Try Again Champion', emoji: '🏆', points: 2, description: 'For attempting difficult challenges repeatedly' },
        { type: 'breakthrough_moment', name: 'Breakthrough Moment', emoji: '💡', points: 5, description: 'For sudden improvement after struggle' }
      ],
      leadership_light: [
        { type: 'helper_hero', name: 'Helper Hero', emoji: '🤝', points: 4, description: 'For assisting struggling classmates' },
        { type: 'teaching_star', name: 'Teaching Star', emoji: '⭐', points: 5, description: 'For explaining concepts to others' },
        { type: 'encourager_award', name: 'Encourager Award', emoji: '💪', points: 3, description: 'For lifting others up with words' }
      ],
      problem_solver: [
        { type: 'detective_cube', name: 'Detective Cube', emoji: '🧠', points: 4, description: 'For systematic problem-solving approach' },
        { type: 'creative_solution', name: 'Creative Solution', emoji: '🎨', points: 5, description: 'For finding unique ways to solve challenges' },
        { type: 'calm_under_pressure', name: 'Calm Under Pressure', emoji: '🧘', points: 4, description: 'For staying focused during difficulty' }
      ],
      community_builder: [
        { type: 'kindness_cube', name: 'Kindness Cube', emoji: '❤️', points: 3, description: 'For acts of kindness toward others' },
        { type: 'team_player', name: 'Team Player', emoji: '🤝', points: 4, description: 'For putting group success before personal achievement' },
        { type: 'celebration_champion', name: 'Celebration Champion', emoji: '🎉', points: 3, description: 'For genuinely celebrating others success' }
      ]
    },
    // Legacy categories for backwards compatibility
    meritCategories: [
      'Academic Excellence',
      'Good Behavior',
      'Homework',
      'Class Participation',
      'Extra Curricular',
      'Leadership',
      'Helping Others'
    ]
  }),
  
  getters: {
    // Character Development Leaderboard (simplified for basic schema)
    characterLeaderboard: (state) => {
      return state.students
        .map(student => {
          const merits = student.merit_points || []
          // For basic schema, categorize by checking category text
          const persistencePoints = merits.filter(m => m.category?.toLowerCase().includes('persistence')).reduce((sum, m) => sum + m.points, 0)
          const leadershipPoints = merits.filter(m => m.category?.toLowerCase().includes('leadership')).reduce((sum, m) => sum + m.points, 0)
          const problemSolverPoints = merits.filter(m => m.category?.toLowerCase().includes('problem')).reduce((sum, m) => sum + m.points, 0)
          const communityBuilderPoints = merits.filter(m => m.category?.toLowerCase().includes('community')).reduce((sum, m) => sum + m.points, 0)
          const totalPoints = merits.reduce((sum, m) => sum + m.points, 0)
          
          return {
            id: student.id,
            name: student.name,
            totalPoints,
            persistencePoints,
            leadershipPoints,
            problemSolverPoints,
            communityBuilderPoints,
            totalStickers: merits.length,
            balanceScore: 0, // Simplified for basic schema
            class_id: student.class_id
          }
        })
        .sort((a, b) => b.totalPoints - a.totalPoints)
    },

    topStudents: (state) => {
      return state.students
        .map(student => ({
          id: student.id,
          name: student.name,
          totalPoints: student.merit_points ? student.merit_points.reduce((total, merit) => total + merit.points, 0) : 0,
          class_id: student.class_id
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 5)
    },

    fastestSolves: (state) => {
      return state.students
        .map(student => {
          const bestTime = student.solve_times?.length > 0 
            ? Math.min(...student.solve_times.map(s => s.time_seconds))
            : Infinity
          return {
            id: student.id,
            name: student.name,
            time: bestTime,
            class_id: student.class_id
          }
        })
        .filter(student => student.time !== Infinity)
        .sort((a, b) => a.time - b.time)
        .slice(0, 5)
    },

    bestAverages: (state) => {
      return state.students
        .map(student => {
          if (!student.solve_times || student.solve_times.length < 5) return null
          
          const times = student.solve_times
            .map(s => s.time_seconds)
            .sort((a, b) => a - b)
          
          let bestAo5 = Infinity
          for (let i = 0; i <= times.length - 5; i++) {
            const ao5 = times.slice(i, i + 5).reduce((a, b) => a + b) / 5
            bestAo5 = Math.min(bestAo5, ao5)
          }
          
          return {
            id: student.id,
            name: student.name,
            average: bestAo5,
            class_id: student.class_id
          }
        })
        .filter(student => student && student.average !== Infinity)
        .sort((a, b) => a.average - b.average)
        .slice(0, 5)
    },

    getTotalMerits: (state) => (studentId) => {
      const student = state.students.find(s => s.id === studentId)
      if (!student || !student.merit_points) return 0
      return student.merit_points.reduce((total, merit) => total + merit.points, 0)
    }
  },
  
  actions: {
    async fetchAllStudents() {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await getStudents()
        if (error) throw error

        this.students = data
      } catch (error) {
        console.error('Error fetching students:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchStudentsByTerm(termId) {
      this.loading = true
      this.error = null
      
      try {
        const data = await getStudentsByTerm(termId)
        this.students = data
      } catch (error) {
        console.error('Error fetching students by term:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async updateStudentTermStatus(studentId, newStatus) {
      try {
        await updateStudentTermStatus(studentId, newStatus)
        // Update local state
        const student = this.students.find(s => s.id === studentId)
        if (student) {
          student.term_status = newStatus
        }
      } catch (error) {
        console.error('Error updating student term status:', error)
        this.error = error.message
        throw error
      }
    },

    async fetchStudents(classId) {
      console.log('🔍 fetchStudents called with classId:', classId)
      
      try {
        // Validate class_id is a UUID
        if (!classId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classId)) {
          throw new Error('Invalid class ID format: ' + classId)
        }

        console.log('📡 Fetching students directly for class:', classId)
        
        // Fetch students directly for this class - much more efficient!
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
            )
          `)
          .eq('class_id', classId)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('❌ Supabase error:', error)
          throw error
        }
        
        console.log('✅ Students fetched for class:', data?.length || 0, 'students')
        
        if (!data || !Array.isArray(data)) {
          console.warn('⚠️ Invalid data format')
          this.students = []
          return
        }
        
        // Store the students for this class - ensure reactivity
        this.students = data || []
        
        console.log('🎯 Students stored in store:', this.students.length)
        console.log('📱 Mobile check - students for classId:', classId, ':', this.getStudentsByClass(classId).length)
        
      } catch (error) {
        console.error('❌ Error fetching students:', error)
        this.error = error.message
        this.students = [] // Set empty array as fallback
        throw error
      }
    },

    async addStudent(student) {
      try {
        // Validate class_id is a UUID
        if (!student.class_id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(student.class_id)) {
          throw new Error('Class ID is required and must be a valid UUID')
        }

        // Validate name is provided
        if (!student.name || student.name.trim() === '') {
          throw new Error('Student name is required')
        }

        console.log('🔄 Creating student in database:', student)
        const result = await createStudent(student)
        if (result && result[0]) {
          console.log('✅ Student created in database:', result[0])
          
          // Add to local store - ensure reactivity by creating a new array
          this.students = [...this.students, result[0]]
          
          console.log('📊 Updated students array, now contains:', this.students.length, 'students')
          console.log('🎯 Students for class', student.class_id, ':', this.getStudentsByClass(student.class_id).length)
          console.log('📱 Mobile check - added student class_id:', result[0].class_id)
          
          return result[0]
        } else {
          throw new Error('Failed to create student: No result returned')
        }
      } catch (error) {
        console.error('❌ Error adding student:', error)
        this.error = error.message
        throw error
      }
    },

    async updateStudent(studentId, updateData) {
      try {
        // Validate student ID is a UUID
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
          throw new Error('Invalid student ID format')
        }

        console.log('Updating student:', studentId, 'with data:', updateData)
        const result = await updateStudent(studentId, updateData)
        if (result && result[0]) {
          const index = this.students.findIndex(s => s.id === studentId)
          if (index !== -1) {
            this.students[index] = { ...this.students[index], ...result[0] }
          }
          console.log('Student updated successfully:', result[0])
          return result[0]
        } else {
          throw new Error('Failed to update student: No result returned')
        }
      } catch (error) {
        console.error('Error updating student:', error)
        this.error = error.message
        throw error
      }
    },

    async markAttendance(studentId, date, status) {
      try {
        // Ensure studentId is a valid UUID
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
          throw new Error('Invalid student ID format')
        }

        // Ensure date is valid
        if (!date || isNaN(new Date(date).getTime())) {
          throw new Error('Invalid date format')
        }

        // Ensure status is valid
        const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']
        if (!status || !validStatuses.includes(status.toUpperCase())) {
          throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '))
        }

        // Record attendance
        await recordAttendance({
          student_id: studentId,
          date,
          status: status.toUpperCase()
        })
        
        // Refresh student data
        const student = await getStudent(studentId)
        if (!student) {
          throw new Error('Failed to refresh student data')
        }
        
        // Update student in store
        const index = this.students.findIndex(s => s.id === studentId)
        if (index !== -1) {
          this.students[index] = {
            ...this.students[index],
            ...student,
            attendance: student.attendance || []
          }
        } else {
          // If student not in store, add them
          this.students.push({
            ...student,
            attendance: student.attendance || []
          })
        }

      } catch (error) {
        console.error('Error marking attendance:', error)
        this.error = error.message
        throw error
      }
    },

    async addNote(studentId, note) {
      try {
        await addNote({
          student_id: studentId,
          text: note
        })
        
        // Refresh student notes
        const notes = await getStudentNotes(studentId)
        const student = this.students.find(s => s.id === studentId)
        if (student) {
          student.notes = notes
        }
      } catch (error) {
        console.error('Error adding note:', error)
        this.error = error.message
        throw error
      }
    },

    async deleteNote(studentId, noteId) {
      try {
        await deleteNote(noteId)
        
        // Refresh student notes
        const notes = await getStudentNotes(studentId)
        const student = this.students.find(s => s.id === studentId)
        if (student) {
          student.notes = notes
        }
      } catch (error) {
        console.error('Error deleting note:', error)
        this.error = error.message
        throw error
      }
    },

    async addMerit(studentId, { points, category, description }) {
      try {
        // First fetch the current student data
        const student = this.students.find(s => s.id === studentId)
        if (!student) throw new Error('Student not found')

        const { data, error } = await addMeritPoints({
          student_id: studentId,
          points,
          category,
          description
        })
        if (error) throw error

        // Update local state
        if (!student.merit_points) student.merit_points = []
        student.merit_points.push(data)

        // Re-fetch student data to ensure consistency
        await this.fetchStudent(studentId)
      } catch (error) {
        console.error('Error adding merit points:', error)
        throw error
      }
    },

    async addCharacterSticker(studentId, { stickerCategory, stickerType, description, activityType }) {
      try {
        const student = this.students.find(s => s.id === studentId)
        if (!student) throw new Error('Student not found')

        // Find the sticker details
        const sticker = this.characterStickers[stickerCategory]?.find(s => s.type === stickerType)
        if (!sticker) throw new Error('Invalid sticker type')

        const result = await addCharacterSticker({
          student_id: studentId,
          points: sticker.points,
          sticker_category: stickerCategory,
          sticker_type: stickerType,
          description: description || sticker.description,
          activity_type: activityType
        })

        // Update local state
        if (!student.merit_points) student.merit_points = []
        student.merit_points.push(result[0])

        // Re-fetch student data to ensure consistency
        await this.fetchStudent(studentId)
        
        return result[0]
      } catch (error) {
        console.error('Error adding character sticker:', error)
        throw error
      }
    },

    async addCustomMerit(studentId, { points, category, description, activityType }) {
      try {
        const student = this.students.find(s => s.id === studentId)
        if (!student) throw new Error('Student not found')

        const result = await addCustomMeritPoints({
          student_id: studentId,
          points: points,
          category: category || 'Custom Merit',
          description: description,
          activity_type: activityType || 'custom'
        })

        // Update local state
        if (!student.merit_points) student.merit_points = []
        student.merit_points.push(result[0])

        // Re-fetch student data to ensure consistency
        await this.fetchStudent(studentId)
        
        return result[0]
      } catch (error) {
        console.error('Error adding custom merit:', error)
        throw error
      }
    },

    async subtractMerit(studentId, { points, category, description }) {
      try {
        // First fetch the current student data
        const student = this.students.find(s => s.id === studentId)
        if (!student) throw new Error('Student not found')

        const { data, error } = await addMeritPoints({
          student_id: studentId,
          points: -Math.abs(points), // Make sure points are negative
          category,
          description
        })
        if (error) throw error

        // Update local state
        if (!student.merit_points) student.merit_points = []
        student.merit_points.push(data)

        // Re-fetch student data to ensure consistency
        await this.fetchStudent(studentId)
      } catch (error) {
        console.error('Error subtracting merit points:', error)
        throw error
      }
    },

    async addSolveTime(studentId, { timeMs, puzzleType }) {
      try {
        // First fetch the current student data
        const student = this.students.find(s => s.id === studentId)
        if (!student) throw new Error('Student not found')

        // Convert milliseconds to seconds and ensure it's a valid number
        const timeSeconds = parseFloat((timeMs / 1000).toFixed(3))
        if (isNaN(timeSeconds) || timeSeconds <= 0) {
          throw new Error('Invalid solve time')
        }

        const { data, error } = await addSolveTime({
          student_id: studentId,
          time_seconds: timeSeconds,
          puzzle_type: puzzleType
        })
        if (error) throw error

        // Update local state
        if (!student.solve_times) student.solve_times = []
        student.solve_times.push(data)

        // Re-fetch student data to ensure consistency
        await this.fetchStudent(studentId)
      } catch (error) {
        console.error('Error adding solve time:', error)
        throw error
      }
    },

    async fetchStudent(studentId) {
      try {
        // Validate student ID is a UUID
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
          throw new Error('Invalid student ID format')
        }

        const student = await getStudent(studentId)
        if (student) {
          // Update or add the student in the store
          const index = this.students.findIndex(s => s.id === studentId)
          if (index >= 0) {
            this.students[index] = student
          } else {
            this.students.push(student)
          }
        }
        return student
      } catch (error) {
        console.error('Error fetching student:', error)
        this.error = error.message
        throw error
      }
    },

    getStudentsByClass(classId) {
      const filteredStudents = this.students.filter(s => s.class_id === classId)
      console.log(`🔍 getStudentsByClass(${classId}):`, {
        totalStudents: this.students.length,
        filteredStudents: filteredStudents.length,
        studentNames: filteredStudents.map(s => s.name)
      })
      return filteredStudents
    },

    async deleteStudent(studentId) {
      try {
        // Note: The database schema should handle cascade deletes for cube_progress
        // when a student is deleted, but we'll implement the frontend delete logic here
        
        // For now, just remove from local store
        // In a real implementation, you'd call a delete API endpoint
        const index = this.students.findIndex(s => s.id === studentId)
        if (index >= 0) {
          this.students.splice(index, 1)
        }
        
        return true
      } catch (error) {
        console.error('Error deleting student:', error)
        this.error = error.message
        throw error
      }
    },

    addMeritCategory(category) {
      if (!this.meritCategories.includes(category)) {
        this.meritCategories.push(category)
      }
    },

    clearError() {
      this.error = null
    },

    async markAttendanceWithCubeProgress(studentId, date, status, cubeProgressUpdates = []) {
      try {
        // Validate inputs
        if (!studentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
          throw new Error('Invalid student ID format')
        }

        if (!date || isNaN(new Date(date).getTime())) {
          throw new Error('Invalid date format')
        }

        const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']
        if (!status || !validStatuses.includes(status.toUpperCase())) {
          throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '))
        }

        // Use the new combined function
        const result = await recordAttendanceWithCubeProgress(
          {
            student_id: studentId,
            date,
            status: status.toUpperCase()
          },
          cubeProgressUpdates
        )
        
        // Refresh student data to get updated cube progress
        const student = await getStudent(studentId)
        if (!student) {
          throw new Error('Failed to refresh student data')
        }
        
        // Update student in store
        const index = this.students.findIndex(s => s.id === studentId)
        if (index !== -1) {
          this.students[index] = {
            ...this.students[index],
            ...student,
            attendance: student.attendance || [],
            cube_progress: student.cube_progress || []
          }
        } else {
          // If student not in store, add them
          this.students.push({
            ...student,
            attendance: student.attendance || [],
            cube_progress: student.cube_progress || []
          })
        }

        return result
      } catch (error) {
        console.error('Error marking attendance with cube progress:', error)
        this.error = error.message
        throw error
      }
    },

    async getCubeProgress(studentId) {
      try {
        const cubeProgress = await getCubeProgress(studentId)
        return cubeProgress
      } catch (error) {
        console.error('Error getting cube progress:', error)
        this.error = error.message
        throw error
      }
    },

    async updateCubeProgress(studentId, cubeType, currentLevel, notes = null) {
      try {
        const result = await updateCubeProgress(studentId, cubeType, currentLevel, null, notes)
        
        // Refresh student data
        const student = await getStudent(studentId)
        if (student) {
          const index = this.students.findIndex(s => s.id === studentId)
          if (index >= 0) {
            this.students[index] = {
              ...this.students[index],
              ...student,
              cube_progress: student.cube_progress || []
            }
          }
        }
        
        return result
      } catch (error) {
        console.error('Error updating cube progress:', error)
        this.error = error.message
        throw error
      }
    },

    async getCubeProgressHistory(studentId, cubeType = null) {
      try {
        const history = await getCubeProgressHistory(studentId, cubeType)
        return history
      } catch (error) {
        console.error('Error getting cube progress history:', error)
        this.error = error.message
        throw error
      }
    },

    async updateStudentTags(studentId, tags) {
      try {
        const result = await updateStudentTags(studentId, tags)
        
        // Update local student data
        const student = this.students.find(s => s.id === studentId)
        if (student) {
          student.tags = tags
        }
        
        return result
      } catch (error) {
        console.error('Error updating student tags:', error)
        this.error = error.message
        throw error
      }
    },

    async addStudentTag(studentId, tag) {
      try {
        const result = await addStudentTag(studentId, tag)
        
        // Update local student data
        const student = this.students.find(s => s.id === studentId)
        if (student) {
          if (!student.tags) student.tags = []
          if (!student.tags.includes(tag)) {
            student.tags.push(tag)
          }
        }
        
        return result
      } catch (error) {
        console.error('Error adding student tag:', error)
        this.error = error.message
        throw error
      }
    },

    async removeStudentTag(studentId, tag) {
      try {
        const result = await removeStudentTag(studentId, tag)
        
        // Update local student data
        const student = this.students.find(s => s.id === studentId)
        if (student && student.tags) {
          student.tags = student.tags.filter(t => t !== tag)
        }
        
        return result
      } catch (error) {
        console.error('Error removing student tag:', error)
        this.error = error.message
        throw error
      }
    }
  }
})
