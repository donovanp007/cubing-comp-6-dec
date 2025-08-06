import { defineStore } from 'pinia'
import { createClass, getClasses, updateClass } from '../supabase'

export const useClassStore = defineStore('class', {
  state: () => ({
    classes: [],
    loading: false,
    error: null,
    lastFetch: null,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    availableGrades: Array.from({ length: 12 }, (_, i) => (i + 1).toString()),
    classesCache: new Map() // Cache by schoolId
  }),

  actions: {
    async fetchClasses(schoolId) {
      if (!schoolId) {
        console.error('SchoolId is required to fetch classes')
        return
      }

      // Check cache first
      const cachedData = this.classesCache.get(schoolId)
      const now = Date.now()
      if (cachedData && (now - cachedData.timestamp) < this.cacheTimeout) {
        // Merge cached classes instead of overwriting
        const existingClasses = this.classes.filter(c => c.school_id !== schoolId)
        this.classes = [...existingClasses, ...cachedData.classes]
        return
      }

      this.loading = true
      this.error = null
      try {
        console.log('Fetching classes for school:', schoolId)
        const classes = await getClasses(schoolId)
        const fetchedClasses = classes || []
        
        // Merge with existing classes from other schools
        const existingClasses = this.classes.filter(c => c.school_id !== schoolId)
        this.classes = [...existingClasses, ...fetchedClasses]
        
        // Update cache
        this.classesCache.set(schoolId, {
          classes: fetchedClasses,
          timestamp: now
        })
        
        console.log('Classes fetched for school', schoolId, ':', fetchedClasses)
      } catch (error) {
        console.error('Error fetching classes:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async addClass(classData) {
      if (!classData.schoolId) {
        throw new Error('SchoolId is required to create a class')
      }

      this.loading = true
      this.error = null
      try {
        console.log('Adding class:', classData)
        const result = await createClass({
          schoolId: classData.schoolId,
          coachId: classData.coachId || null,
          name: classData.name,
          grade: classData.grade || null
        })
        
        if (result && result[0]) {
          const newClass = result[0]
          this.classes.push(newClass)
          
          // Update cache to include the new class
          const cachedData = this.classesCache.get(classData.schoolId)
          if (cachedData) {
            cachedData.classes.push(newClass)
            cachedData.timestamp = Date.now() // Refresh cache timestamp
          }
          
          console.log('Class added successfully:', newClass)
          return newClass
        } else {
          throw new Error('Failed to add class: No result returned')
        }
      } catch (error) {
        console.error('Error adding class:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateClass(classId, updateData) {
      this.loading = true
      this.error = null
      try {
        console.log('Updating class:', classId, 'with data:', updateData)
        const result = await updateClass(classId, updateData)
        if (result && result[0]) {
          const index = this.classes.findIndex(c => c.id === classId)
          if (index !== -1) {
            this.classes[index] = { ...this.classes[index], ...result[0] }
          }
          
          // Update cache
          for (const [schoolId, cachedData] of this.classesCache.entries()) {
            const cachedIndex = cachedData.classes.findIndex(c => c.id === classId)
            if (cachedIndex !== -1) {
              cachedData.classes[cachedIndex] = { ...cachedData.classes[cachedIndex], ...result[0] }
              break
            }
          }
          
          console.log('Class updated successfully:', result[0])
          return result[0]
        } else {
          throw new Error('Failed to update class: No result returned')
        }
      } catch (error) {
        console.error('Error updating class:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    deleteClass(classId) {
      this.classes = this.classes.filter(c => c.id !== classId)
    },

    getClassesBySchool(schoolId) {
      return this.classes.filter(c => c.school_id === schoolId)
    },

    clearError() {
      this.error = null
    }
  },

  getters: {
    getClassById: (state) => (id) => {
      return state.classes.find(class_ => class_.id === id)
    },
    
    hasClasses: (state) => {
      return state.classes.length > 0
    },

    isLoading: (state) => state.loading,

    getError: (state) => state.error
  }
})
