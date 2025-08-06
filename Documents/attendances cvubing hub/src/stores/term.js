import { defineStore } from 'pinia'
import { 
  supabase,
  fetchTerms,
  createTerm,
  updateTerm,
  getStudentsByTerm,
  importStudentsToTerm,
  updateStudentTermStatus,
  getCubeProgressHistory
} from '../supabase'

export const useTermStore = defineStore('term', {
  state: () => ({
    terms: [],
    activeTerm: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchTerms() {
      this.loading = true
      this.error = null
      
      try {
        const data = await fetchTerms()
        
        this.terms = data
        this.activeTerm = data.find(term => term.is_active)
      } catch (error) {
        console.error('Error fetching terms:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async createTerm(termData) {
      this.loading = true
      this.error = null
      
      try {
        // If this term is being set as active, deactivate others first
        if (termData.is_active) {
          await this.deactivateAllTerms()
        }
        
        const data = await createTerm(termData)
        
        if (data && data.length > 0) {
          this.terms.unshift(data[0])
          if (data[0].is_active) {
            this.activeTerm = data[0]
          }
        }
        
        return data
      } catch (error) {
        console.error('Error creating term:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateTerm(termId, termData) {
      this.loading = true
      this.error = null
      
      try {
        // If this term is being set as active, deactivate others first
        if (termData.is_active) {
          await this.deactivateAllTerms()
        }
        
        const data = await updateTerm(termId, termData)
        
        if (data && data.length > 0) {
          const index = this.terms.findIndex(t => t.id === termId)
          if (index >= 0) {
            this.terms[index] = data[0]
            if (data[0].is_active) {
              this.activeTerm = data[0]
            }
          }
        }
        
        return data
      } catch (error) {
        console.error('Error updating term:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deactivateAllTerms() {
      try {
        const { error } = await supabase
          .from('terms')
          .update({ is_active: false })
          .neq('id', '')
        
        if (error) throw error
        
        // Update local state
        this.terms.forEach(term => {
          term.is_active = false
        })
        this.activeTerm = null
      } catch (error) {
        console.error('Error deactivating terms:', error)
        throw error
      }
    },
    
    async getStudentsFromTerm(termId) {
      this.loading = true
      this.error = null
      
      try {
        const data = await getStudentsByTerm(termId)
        return data
      } catch (error) {
        console.error('Error fetching students from term:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async importStudents(termId, studentsData) {
      this.loading = true
      this.error = null
      
      try {
        const data = await importStudentsToTerm(termId, studentsData)
        return data
      } catch (error) {
        console.error('Error importing students:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async getStudentTermHistory(studentId) {
      this.loading = true
      this.error = null
      
      try {
        // Get all terms the student has been in
        const { data: studentTerms, error: studentError } = await supabase
          .from('students')
          .select(`
            term_id,
            term_status,
            enrolled_date,
            term:terms(
              id,
              name,
              start_date,
              end_date
            )
          `)
          .eq('id', studentId)
        
        if (studentError) throw studentError
        
        // Get lesson progress for each term
        const termsWithProgress = await Promise.all(
          studentTerms.map(async (studentTerm) => {
            const { data: lessonProgress, error: progressError } = await supabase
              .from('student_lesson_progress')
              .select('*')
              .eq('student_id', studentId)
            
            if (progressError) throw progressError
            
            const completedLessons = lessonProgress.filter(p => p.status === 'completed').length
            
            // Get attendance for this term
            const { data: attendance, error: attendanceError } = await supabase
              .from('attendance')
              .select('*')
              .eq('student_id', studentId)
              .gte('date', studentTerm.term.start_date)
              .lte('date', studentTerm.term.end_date)
            
            if (attendanceError) throw attendanceError
            
            const attendanceRate = attendance.length > 0 ? 
              Math.round((attendance.filter(a => a.status === 'PRESENT').length / attendance.length) * 100) : 0
            
            return {
              ...studentTerm.term,
              status: studentTerm.term_status,
              enrolled_date: studentTerm.enrolled_date,
              lessons_completed: completedLessons,
              attendance_rate: attendanceRate
            }
          })
        )
        
        return termsWithProgress
      } catch (error) {
        console.error('Error fetching student term history:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async getStudentCubeHistory(studentId) {
      this.loading = true
      this.error = null
      
      try {
        const data = await getCubeProgressHistory(studentId)
        return data
      } catch (error) {
        console.error('Error fetching student cube history:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    clearError() {
      this.error = null
    }
  },
  
  getters: {
    getTermById: (state) => (termId) => {
      return state.terms.find(term => term.id === termId)
    },
    
    getCurrentTerm: (state) => {
      return state.activeTerm
    },
    
    getPreviousTerms: (state) => {
      return state.terms.filter(term => !term.is_active)
    }
  }
})