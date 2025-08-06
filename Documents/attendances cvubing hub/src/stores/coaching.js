import { defineStore } from 'pinia'
import { 
  fetchCoachingWeeks,
  getClassLessonProgress,
  markLessonComplete,
  sendParentNotifications,
  getStudentLessonProgress
} from '../supabase'

export const useCoachingStore = defineStore('coaching', {
  state: () => ({
    coachingWeeks: [],
    classProgress: {},
    studentProgress: {},
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchCoachingWeeks() {
      this.loading = true
      this.error = null
      
      try {
        const data = await fetchCoachingWeeks()
        this.coachingWeeks = data
      } catch (error) {
        console.error('Error fetching coaching weeks:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async fetchClassProgress(classId) {
      this.loading = true
      this.error = null
      
      try {
        const data = await getClassLessonProgress(classId)
        
        // Convert array to object with week_number as key
        this.classProgress = {}
        data.forEach(progress => {
          this.classProgress[progress.week_number] = progress
        })
      } catch (error) {
        console.error('Error fetching class progress:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async markLessonComplete(classId, weekNumber, notes = '') {
      this.loading = true
      this.error = null
      
      try {
        const data = await markLessonComplete(classId, weekNumber, notes)
        
        // Update local state
        if (data && data.length > 0) {
          this.classProgress[weekNumber] = data[0]
        }
        
        return data
      } catch (error) {
        console.error('Error marking lesson complete:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async reopenLesson(classId, weekNumber) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('class_lesson_progress')
          .update({
            status: 'not_started',
            completed_at: null
          })
          .eq('class_id', classId)
          .eq('week_number', weekNumber)
          .select()
        
        if (error) throw error
        
        // Update local state
        if (data && data.length > 0) {
          this.classProgress[weekNumber] = data[0]
        }
        
        return data
      } catch (error) {
        console.error('Error reopening lesson:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async sendParentNotifications(classId, weekNumber) {
      this.loading = true
      this.error = null
      
      try {
        // Get the coaching week info
        const coachingWeek = this.coachingWeeks.find(w => w.week_number === weekNumber)
        if (!coachingWeek) throw new Error('Coaching week not found')
        
        const data = await sendParentNotifications(classId, weekNumber, coachingWeek)
        return data
      } catch (error) {
        console.error('Error sending parent notifications:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async fetchStudentProgress(studentId) {
      this.loading = true
      this.error = null
      
      try {
        const data = await getStudentLessonProgress(studentId)
        
        // Convert array to object with week_number as key
        this.studentProgress[studentId] = {}
        data.forEach(progress => {
          this.studentProgress[studentId][progress.week_number] = progress
        })
        
        return data
      } catch (error) {
        console.error('Error fetching student progress:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async getStudentProgressSummary(studentId) {
      try {
        const progress = await this.fetchStudentProgress(studentId)
        
        const completed = progress.filter(p => p.status === 'completed').length
        const inProgress = progress.filter(p => p.status === 'in_progress').length
        const notStarted = 8 - completed - inProgress
        
        return {
          completed,
          inProgress,
          notStarted,
          percentage: Math.round((completed / 8) * 100)
        }
      } catch (error) {
        console.error('Error getting student progress summary:', error)
        throw error
      }
    },
    
    clearError() {
      this.error = null
    }
  },
  
  getters: {
    getWeekByNumber: (state) => (weekNumber) => {
      return state.coachingWeeks.find(week => week.week_number === weekNumber)
    },
    
    getClassProgressByWeek: (state) => (weekNumber) => {
      return state.classProgress[weekNumber] || null
    },
    
    getStudentProgressByWeek: (state) => (studentId, weekNumber) => {
      return state.studentProgress[studentId]?.[weekNumber] || null
    },
    
    getCompletedWeeksCount: (state) => {
      return Object.values(state.classProgress).filter(progress => progress.status === 'completed').length
    },
    
    getOverallProgress: (state) => {
      const completedWeeks = Object.values(state.classProgress).filter(progress => progress.status === 'completed').length
      return Math.round((completedWeeks / 8) * 100)
    }
  }
})