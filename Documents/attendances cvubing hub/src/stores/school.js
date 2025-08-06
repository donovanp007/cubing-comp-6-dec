import { defineStore } from 'pinia'
import { createSchool, getSchools, updateSchool } from '../supabase'

export const useSchoolStore = defineStore('school', {
  state: () => ({
    schools: [],
    loading: false,
    error: null,
    lastFetch: null,
    cacheTimeout: 5 * 60 * 1000 // 5 minutes
  }),
  
  actions: {
    async fetchSchools(force = false) {
      // Return cached data if it's fresh enough
      if (!force && this.lastFetch && (Date.now() - this.lastFetch) < this.cacheTimeout) {
        return this.schools;
      }

      this.loading = true
      this.error = null
      try {
        console.log('Fetching schools...')
        const schools = await getSchools()
        this.schools = schools || []
        this.lastFetch = Date.now()
        console.log('Schools fetched:', this.schools)
      } catch (error) {
        console.error('Error fetching schools:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async addSchool(school) {
      this.loading = true
      this.error = null
      try {
        console.log('Adding school:', school)
        const result = await createSchool(school)
        if (result && result[0]) {
          this.schools.push(result[0])
          console.log('School added successfully:', result[0])
          return result[0]
        } else {
          throw new Error('Failed to add school: No result returned')
        }
      } catch (error) {
        console.error('Error adding school:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateSchool(schoolId, updateData) {
      this.loading = true
      this.error = null
      try {
        console.log('Updating school:', schoolId, 'with data:', updateData)
        const result = await updateSchool(schoolId, updateData)
        if (result && result[0]) {
          const index = this.schools.findIndex(s => s.id === schoolId)
          if (index !== -1) {
            this.schools[index] = { ...this.schools[index], ...result[0] }
          }
          console.log('School updated successfully:', result[0])
          return result[0]
        } else {
          throw new Error('Failed to update school: No result returned')
        }
      } catch (error) {
        console.error('Error updating school:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    deleteSchool(schoolId) {
      this.schools = this.schools.filter(s => s.id !== schoolId)
    },

    clearError() {
      this.error = null
    }
  },

  getters: {
    getSchoolById: (state) => (id) => {
      return state.schools.find(school => school.id === id)
    },
    
    hasSchools: (state) => {
      return state.schools.length > 0
    },

    isLoading: (state) => state.loading
  }
})
