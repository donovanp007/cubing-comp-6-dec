import { defineStore } from 'pinia'
import { 
  fetchSalesStages,
  createSalesStage,
  updateSalesStage,
  fetchStudentSalesData,
  addStudentToSalesStage,
  moveStudentToStage,
  updateStudentSalesInfo,
  removeStudentFromSalesPipeline
} from '../supabase'

export const useSalesStore = defineStore('sales', {
  state: () => ({
    salesStages: [],
    studentSalesData: {},
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchSalesStages() {
      this.loading = true
      this.error = null
      
      try {
        const data = await fetchSalesStages()
        this.salesStages = data
      } catch (error) {
        console.error('Error fetching sales stages:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async createSalesStage(stageData) {
      this.loading = true
      this.error = null
      
      try {
        const data = await createSalesStage(stageData)
        
        if (data && data.length > 0) {
          this.salesStages.push(data[0])
          this.salesStages.sort((a, b) => a.order_position - b.order_position)
        }
        
        return data
      } catch (error) {
        console.error('Error creating sales stage:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateSalesStage(stageId, stageData) {
      this.loading = true
      this.error = null
      
      try {
        const data = await updateSalesStage(stageId, stageData)
        
        if (data && data.length > 0) {
          const index = this.salesStages.findIndex(s => s.id === stageId)
          if (index >= 0) {
            this.salesStages[index] = data[0]
            this.salesStages.sort((a, b) => a.order_position - b.order_position)
          }
        }
        
        return data
      } catch (error) {
        console.error('Error updating sales stage:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async fetchStudentSalesData() {
      this.loading = true
      this.error = null
      
      try {
        const data = await fetchStudentSalesData()
        
        // Convert to object with student_id as key, keeping only the latest record per student
        this.studentSalesData = {}
        data.forEach(record => {
          if (!this.studentSalesData[record.student_id]) {
            this.studentSalesData[record.student_id] = record
          }
        })
      } catch (error) {
        console.error('Error fetching student sales data:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async addStudentToSalesStage(studentId, stageId, amount = 0, notes = '') {
      this.loading = true
      this.error = null
      
      try {
        const data = await addStudentToSalesStage(studentId, stageId, amount, notes)
        
        if (data && data.length > 0) {
          this.studentSalesData[studentId] = data[0]
        }
        
        return data
      } catch (error) {
        console.error('Error adding student to sales stage:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async moveStudentToStage(studentId, newStageId, notes = '') {
      this.loading = true
      this.error = null
      
      try {
        const data = await moveStudentToStage(studentId, newStageId, notes)
        
        if (data && data.length > 0) {
          this.studentSalesData[studentId] = data[0]
        }
        
        return data
      } catch (error) {
        console.error('Error moving student to stage:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateStudentSalesInfo(studentId, updateData) {
      this.loading = true
      this.error = null
      
      try {
        const data = await updateStudentSalesInfo(studentId, updateData)
        
        if (data && data.length > 0) {
          this.studentSalesData[studentId] = data[0]
        }
        
        return this.studentSalesData[studentId]
      } catch (error) {
        console.error('Error updating student sales info:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async removeStudentFromPipeline(studentId) {
      this.loading = true
      this.error = null
      
      try {
        const result = await removeStudentFromSalesPipeline(studentId)
        
        if (result) {
          delete this.studentSalesData[studentId]
        }
        
        return result
      } catch (error) {
        console.error('Error removing student from pipeline:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async getSalesStatistics() {
      try {
        const totalValue = Object.values(this.studentSalesData).reduce((sum, student) => {
          return sum + (student.amount_zar || 0)
        }, 0)
        
        const totalStudents = Object.keys(this.studentSalesData).length
        
        const enrolledStage = this.salesStages.find(stage => stage.name === 'Enrolled')
        const enrolledCount = enrolledStage ? 
          Object.values(this.studentSalesData).filter(student => student.stage_id === enrolledStage.id).length : 0
        
        const conversionRate = totalStudents > 0 ? (enrolledCount / totalStudents) * 100 : 0
        const averageDealSize = totalStudents > 0 ? totalValue / totalStudents : 0
        
        return {
          totalValue,
          totalStudents,
          enrolledCount,
          conversionRate,
          averageDealSize
        }
      } catch (error) {
        console.error('Error getting sales statistics:', error)
        throw error
      }
    },
    
    clearError() {
      this.error = null
    }
  },
  
  getters: {
    getStageById: (state) => (stageId) => {
      return state.salesStages.find(stage => stage.id === stageId)
    },
    
    getStudentsByStage: (state) => (stageId) => {
      return Object.values(state.studentSalesData).filter(student => student.stage_id === stageId)
    },
    
    getTotalPipelineValue: (state) => {
      return Object.values(state.studentSalesData).reduce((total, student) => {
        return total + (student.amount_zar || 0)
      }, 0)
    },
    
    getStageValue: (state) => (stageId) => {
      return Object.values(state.studentSalesData)
        .filter(student => student.stage_id === stageId)
        .reduce((total, student) => total + (student.amount_zar || 0), 0)
    },
    
    getActiveStages: (state) => {
      return state.salesStages.filter(stage => stage.is_active)
    }
  }
})