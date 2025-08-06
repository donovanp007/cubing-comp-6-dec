<template>
  <div class="student-list">
    <!-- iOS-inspired header -->
    <div class="header-section">
      <div class="gradient-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">All Students</h1>
            <p class="page-subtitle">Manage and track student progress across all classes</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Compact Filters Bar -->
    <div class="filters-bar">
      <div class="filters-container">
        <div class="search-box">
          <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search students..."
            class="search-input"
          >
        </div>
        
        <select v-model="selectedClass" class="compact-select">
          <option value="">All Classes</option>
          <option v-for="class_ in classes" :key="class_.id" :value="class_.id">
            {{ class_.name }}
          </option>
        </select>
        
        <select v-model="sortBy" class="compact-select">
          <option value="name">Sort by Name</option>
          <option value="class">Sort by Class</option>
          <option value="merits">Sort by Merit Points</option>
          <option value="attendance">Sort by Attendance</option>
        </select>
        
        <button @click="exportToCSV" class="export-btn">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export
        </button>
      </div>
      
      <div class="results-info">
        <span class="student-count">{{ filteredStudents.length }} student{{ filteredStudents.length !== 1 ? 's' : '' }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-section">
      <div class="loading-card">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading student data...</div>
      </div>
    </div>

    <!-- No Results State -->
    <div v-else-if="filteredStudents.length === 0" class="no-results-section">
      <div class="no-results-card">
        <div class="no-results-icon">👥</div>
        <div class="no-results-message">No students found matching your criteria</div>
        <div class="no-results-subtitle">Try adjusting your filters or search terms</div>
      </div>
    </div>

    <!-- Compact Students List -->
    <div v-else class="content-section">
      <div class="students-list">
        <div v-for="student in sortedStudents" :key="student.id" class="student-row">
          <router-link :to="{ name: 'StudentProfile', params: { id: student.id }}" class="student-link">
            <div class="student-avatar">
              {{ student.name.charAt(0).toUpperCase() }}
            </div>
            
            <div class="student-info">
              <div class="student-name">{{ student.name }}</div>
              <div class="student-details">
                <span class="class-tag">{{ getClassName(student.class_id) || 'No Class' }}</span>
                <span class="school-text">{{ getSchoolName(getClassSchoolId(student.class_id)) || 'No School' }}</span>
              </div>
            </div>
            
            <div class="student-stats">
              <div class="student-tags" v-if="hasTag(student, 'potential_client')">
                <div class="tag-chip potential-client">
                  {{ getTagDisplay('potential_client') }}
                </div>
              </div>
              <div class="stat-chip merit">
                <span class="stat-icon">🏆</span>
                <span class="stat-value">{{ getTotalMerits(student.id) }}</span>
              </div>
              <div class="stat-chip attendance" :class="getAttendanceClass(getAttendanceRate(student))">
                <span class="stat-icon">📊</span>
                <span class="stat-value">{{ getAttendanceRate(student) }}%</span>
              </div>
            </div>
            
            <div class="student-actions">
              <button @click.prevent="editStudent(student)" class="action-button edit-button" title="Edit Student">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m18 2 4 4-12 12H6v-4L18 2z"/>
                </svg>
              </button>
              <button @click.prevent="deleteStudent(student)" class="action-button delete-button" title="Delete Student">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
              <button @click.prevent="togglePotentialClientTag(student)" class="tag-button" :class="{ active: hasTag(student, 'potential_client') }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              </button>
            </div>
            
            <div class="student-arrow">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- Edit Student Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Student</h3>
          <button @click="closeEditModal" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="updateStudent">
            <div class="form-group">
              <label for="editStudentName">Student Name</label>
              <input 
                id="editStudentName"
                v-model="editForm.name" 
                type="text" 
                required 
                class="form-input"
                placeholder="Enter student name"
              >
            </div>
            
            <div class="form-group">
              <label for="editStudentClass">Class</label>
              <select id="editStudentClass" v-model="editForm.classId" class="form-select">
                <option value="">No Class Assigned</option>
                <option v-for="class_ in classes" :key="class_.id" :value="class_.id">
                  {{ class_.name }}
                </option>
              </select>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="closeEditModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary" :disabled="!editForm.name.trim()">
                Update Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStudentStore } from '../stores/student'
import { useClassStore } from '../stores/class'
import { useSchoolStore } from '../stores/school'
import { deleteStudent as deleteStudentAPI, updateStudent as updateStudentAPI } from '../supabase'

export default {
  name: 'StudentList',
  
  setup() {
    const studentStore = useStudentStore()
    const classStore = useClassStore()
    const schoolStore = useSchoolStore()
    
    const searchQuery = ref('')
    const selectedClass = ref('')
    const sortBy = ref('name')
    const isLoading = ref(true)
    
    // Edit modal state
    const showEditModal = ref(false)
    const currentStudent = ref(null)
    const editForm = ref({
      name: '',
      classId: ''
    })

    // Fetch data on mount
    onMounted(async () => {
      isLoading.value = true;
      try {
        console.log('Loading StudentList data...')
        
        // Fetch schools first
        await schoolStore.fetchSchools()
        
        // Fetch all students
        await studentStore.fetchAllStudents()
        
        // Fetch all classes for filtering
        const schoolIds = schoolStore.schools.map(s => s.id)
        for (const schoolId of schoolIds) {
          try {
            await classStore.fetchClasses(schoolId)
          } catch (error) {
            console.warn('Could not fetch classes for school:', schoolId, error)
          }
        }
        
        console.log('StudentList data loaded successfully')
      } catch (error) {
        console.error("Error loading data for StudentList:", error);
        alert('Error loading student data. Please refresh the page.')
      } finally {
        isLoading.value = false;
      }
    });
    
    // Access store state directly
    const students = computed(() => studentStore.students)
    const classes = computed(() => classStore.classes)
    
    const uniqueGrades = computed(() => {
      if (!students.value) return []
      const grades = new Set()
      students.value.forEach(student => {
        if (student.grade) grades.add(student.grade)
      })
      return Array.from(grades).sort()
    })

    const filteredStudents = computed(() => {
      if (isLoading.value) return []

      let result = students.value || [] 

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase().trim()
        if (query) {
          result = result.filter(student => 
            student.name.toLowerCase().includes(query) ||
            getClassName(student.class_id).toLowerCase().includes(query) ||
            getSchoolName(getClassSchoolId(student.class_id)).toLowerCase().includes(query)
          )
        }
      }

      // Filter by selected class
      if (selectedClass.value) {
        result = result.filter(student => 
          student.class_id === selectedClass.value
        )
      }

      return result
    })

    const sortedStudents = computed(() => {
      const result = [...filteredStudents.value]
      
      switch (sortBy.value) {
        case 'name':
          return result.sort((a, b) => a.name.localeCompare(b.name))
        case 'class':
          return result.sort((a, b) => 
            getClassName(a.class_id).localeCompare(getClassName(b.class_id))
          )
        case 'merits':
          return result.sort((a, b) => getTotalMerits(b.id) - getTotalMerits(a.id))
        case 'attendance':
          return result.sort((a, b) => getAttendanceRate(b) - getAttendanceRate(a))
        default:
          return result
      }
    })

    const getClassName = (classId) => {
      const class_ = classStore.classes.find(c => c.id === classId)
      return class_ ? class_.name : ''
    }

    const getClassSchoolId = (classId) => {
      const class_ = classStore.classes.find(c => c.id === classId)
      return class_ ? class_.schoolId : null
    }

    const getSchoolName = (schoolId) => {
      if (!schoolId) return '';
      const school = schoolStore.schools.find(s => s.id === schoolId)
      return school ? school.name : ''
    }

    const getTotalMerits = (studentId) => {
      // Ensure the method exists and handles potential errors
      return typeof studentStore.getTotalMerits === 'function' 
        ? studentStore.getTotalMerits(studentId) 
        : 0;
    }

    const getAttendanceRate = (student) => {
      const total = student.attendance?.length || 0
      if (total === 0) return 0
      
      const present = student.attendance?.filter(a => 
        a.status === 'present' || a.status === 'late'
      ).length || 0
      
      return Math.round((present / total) * 100)
    }

    const getAttendanceClass = (rate) => {
      if (rate >= 90) return 'excellent'
      if (rate >= 75) return 'good'
      if (rate >= 60) return 'fair'
      return 'poor'
    }

    const exportToCSV = () => {
      try {
        if (!filteredStudents.value || filteredStudents.value.length === 0) {
          alert('No students to export!')
          return
        }

        // Simple CSV escaping function
        const escapeCSV = (value) => {
          if (value === null || value === undefined) return ''
          const str = String(value)
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }

        // Create simple CSV data
        const csvRows = []
        
        // Headers
        csvRows.push([
          'Student Name',
          'Class',
          'School',
          'Merit Points', 
          'Attendance Rate',
          'Tags',
          'Student ID'
        ].join(','))

        // Data rows
        filteredStudents.value.forEach(student => {
          const row = [
            escapeCSV(student.name || ''),
            escapeCSV(getClassName(student.class_id) || 'No Class'),
            escapeCSV(getSchoolName(getClassSchoolId(student.class_id)) || 'No School'),
            escapeCSV(getTotalMerits(student.id) || 0),
            escapeCSV(`${getAttendanceRate(student)}%`),
            escapeCSV((student.tags || []).map(getTagDisplay).join(', ')),
            escapeCSV(student.id || '')
          ]
          csvRows.push(row.join(','))
        })

        const csvContent = csvRows.join('\n')
        const timestamp = new Date().toISOString().split('T')[0]
        const filename = `students_export_${timestamp}.csv`

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob)
          link.setAttribute('href', url)
          link.setAttribute('download', filename)
          link.style.visibility = 'hidden'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          // Success feedback
          const count = filteredStudents.value.length
          alert(`✅ Successfully exported ${count} student${count !== 1 ? 's' : ''} to ${filename}`)
        } else {
          throw new Error('Browser does not support file downloads')
        }
      } catch (error) {
        console.error('Export CSV Error:', error)
        alert('❌ Export failed. Please try again.')
      }
    }

    // Tag management functions
    const hasTag = (student, tag) => {
      return student.tags && student.tags.includes(tag)
    }

    const getTagClass = (tag) => {
      switch (tag) {
        case 'potential_client':
          return 'potential-client'
        default:
          return 'default'
      }
    }

    const getTagDisplay = (tag) => {
      switch (tag) {
        case 'potential_client':
          return '💼 Potential Client'
        default:
          return tag
      }
    }

    const togglePotentialClientTag = async (student) => {
      try {
        const currentlyTagged = hasTag(student, 'potential_client')
        
        if (currentlyTagged) {
          await studentStore.removeStudentTag(student.id, 'potential_client')
        } else {
          await studentStore.addStudentTag(student.id, 'potential_client')
        }
      } catch (error) {
        console.error('Error toggling potential client tag:', error)
        alert('Error updating student tag. Please try again.')
      }
    }

    // Edit student functions
    const editStudent = (student) => {
      currentStudent.value = student
      editForm.value = {
        name: student.name,
        classId: student.class_id || ''
      }
      showEditModal.value = true
    }

    const closeEditModal = () => {
      showEditModal.value = false
      currentStudent.value = null
      editForm.value = {
        name: '',
        classId: ''
      }
    }

    const updateStudent = async () => {
      try {
        if (!currentStudent.value || !editForm.value.name.trim()) {
          alert('Please enter a valid student name')
          return
        }

        const updateData = {
          name: editForm.value.name.trim(),
          class_id: editForm.value.classId || null
        }

        await updateStudentAPI(currentStudent.value.id, updateData)
        await studentStore.fetchAllStudents() // Refresh the list
        
        closeEditModal()
        alert('Student updated successfully!')
      } catch (error) {
        console.error('Error updating student:', error)
        alert('Error updating student. Please try again.')
      }
    }

    // Delete student function
    const deleteStudent = async (student) => {
      try {
        if (!confirm(`Are you sure you want to delete "${student.name}"? This action cannot be undone and will remove all associated data (attendance, notes, merit points, etc.).`)) {
          return
        }

        await deleteStudentAPI(student.id)
        await studentStore.fetchAllStudents() // Refresh the list
        
        alert('Student deleted successfully!')
      } catch (error) {
        console.error('Error deleting student:', error)
        alert('Error deleting student. Please try again.')
      }
    }

    return {
      searchQuery,
      selectedClass,
      sortBy,
      filteredStudents,
      sortedStudents,
      classes,
      isLoading,
      getClassName,
      getSchoolName,
      getClassSchoolId,
      getTotalMerits,
      getAttendanceRate,
      getAttendanceClass,
      exportToCSV,
      hasTag,
      getTagClass,
      getTagDisplay,
      togglePotentialClientTag,
      // Edit/Delete functionality
      showEditModal,
      editForm,
      editStudent,
      closeEditModal,
      updateStudent,
      deleteStudent
    }
  }
}
</script>

<style scoped>
.student-list {
  min-height: 100vh;
  background: var(--ios-background-primary);
  font-family: var(--ios-font-family);
}

/* Compact Header */
.gradient-header {
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  padding: 2rem 1rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Compact Filters Bar */
.filters-bar {
  background: white;
  border-bottom: 1px solid var(--ios-border-light);
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.filters-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--ios-text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid var(--ios-border-medium);
  border-radius: 8px;
  font-size: 0.95rem;
  background: var(--ios-background-elevated);
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--ios-primary);
  box-shadow: 0 0 0 2px rgba(var(--ios-primary-rgb), 0.1);
}

.compact-select {
  padding: 0.75rem;
  border: 1px solid var(--ios-border-medium);
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: var(--ios-text-primary);
  min-width: 120px;
  cursor: pointer;
}

.compact-select:focus {
  outline: none;
  border-color: var(--ios-primary);
}

.export-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #34D399;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(52, 211, 153, 0.2);
  white-space: nowrap;
  min-height: 44px;
  position: relative;
  overflow: hidden;
}

.export-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.export-btn:hover::before {
  left: 100%;
}

.export-btn svg {
  width: 1.1rem;
  height: 1.1rem;
  stroke-width: 2;
  flex-shrink: 0;
}

.export-btn:hover {
  background: #10B981;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(52, 211, 153, 0.4);
}

.export-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(52, 211, 153, 0.3);
}

.export-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.3);
}

.results-info {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.student-count {
  font-size: 0.9rem;
  color: var(--ios-text-secondary);
  font-weight: 500;
}

/* Compact Content Section */
.content-section {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Compact Students List */
.students-list {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--ios-border-light);
  overflow: hidden;
}

.student-row {
  border-bottom: 1px solid var(--ios-border-light);
  transition: all 0.2s ease;
}

.student-row:last-child {
  border-bottom: none;
}

.student-row:hover {
  background: var(--ios-background-elevated);
}

.student-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  flex-shrink: 0;
}

.student-info {
  flex: 1;
  min-width: 0;
}

.student-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.student-details {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.class-tag {
  background: var(--ios-primary);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.school-text {
  font-size: 0.8rem;
  color: var(--ios-text-secondary);
  font-weight: 400;
}

.student-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0 1rem 0 0;
}

.student-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
}

.tag-chip {
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
}

.tag-chip.potential-client {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
}

.tag-chip.default {
  background: linear-gradient(135deg, #6B7280, #4B5563);
  color: white;
}

.student-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0.5rem 0 0;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--ios-background-elevated);
  border: 1px solid var(--ios-border-medium);
  border-radius: 6px;
  color: var(--ios-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: var(--ios-background-secondary);
  border-color: var(--ios-primary);
  color: var(--ios-primary);
}

.edit-button {
  color: #3B82F6;
  border-color: #3B82F6;
  background: rgba(59, 130, 246, 0.1);
}

.edit-button:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: #2563EB;
  color: #2563EB;
  transform: translateY(-1px);
}

.delete-button {
  color: #EF4444;
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
}

.delete-button:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #DC2626;
  color: #DC2626;
  transform: translateY(-1px);
}

.tag-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--ios-background-elevated);
  border: 1px solid var(--ios-border-medium);
  border-radius: 6px;
  color: var(--ios-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-button:hover {
  background: var(--ios-background-secondary);
  border-color: var(--ios-primary);
  color: var(--ios-primary);
}

.tag-button.active {
  background: var(--ios-primary);
  border-color: var(--ios-primary);
  color: white;
}

.tag-button.active:hover {
  background: var(--ios-primary-dark);
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.stat-chip.merit {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
}

.stat-chip.attendance.excellent {
  background: linear-gradient(135deg, #34D399, #10B981);
  color: white;
}

.stat-chip.attendance.good {
  background: linear-gradient(135deg, #60A5FA, #3B82F6);
  color: white;
}

.stat-chip.attendance.fair {
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: white;
}

.stat-chip.attendance.poor {
  background: linear-gradient(135deg, #F87171, #EF4444);
  color: white;
}

.stat-icon {
  font-size: 0.8rem;
}

.stat-value {
  font-weight: 600;
}

.student-arrow {
  color: var(--ios-text-tertiary);
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  transition: all 0.2s ease;
}

.student-row:hover .student-arrow {
  color: var(--ios-primary);
  transform: translateX(2px);
}

/* Loading Section */
.loading-section {
  padding: 3rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  border: 1px solid var(--ios-border-light);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--ios-border-light);
  border-top: 3px solid var(--ios-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-text {
  font-size: 0.95rem;
  color: var(--ios-text-secondary);
}

/* No Results Section */
.no-results-section {
  padding: 3rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.no-results-card {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  border: 1px solid var(--ios-border-light);
  max-width: 400px;
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results-message {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin-bottom: 0.5rem;
}

.no-results-subtitle {
  font-size: 0.9rem;
  color: var(--ios-text-secondary);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .compact-select {
    min-width: auto;
  }
  
  .student-link {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .student-stats {
    flex-direction: column;
    gap: 0.25rem;
    margin: 0;
  }
  
  .student-tags {
    margin-bottom: 0.125rem;
  }
  
  .tag-chip {
    font-size: 0.65rem;
    padding: 0.1rem 0.3rem;
  }
  
  .student-actions {
    margin: 0 0.25rem 0 0;
  }
  
  .tag-button {
    width: 28px;
    height: 28px;
  }
  
  .student-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .content-section {
    padding: 0.5rem;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--ios-border-light);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--ios-background-elevated);
  border: 1px solid var(--ios-border-medium);
  border-radius: 8px;
  color: var(--ios-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--ios-background-secondary);
  border-color: var(--ios-primary);
  color: var(--ios-primary);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--ios-text-primary);
  margin-bottom: 0.5rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--ios-border-medium);
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  color: var(--ios-text-primary);
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--ios-primary);
  box-shadow: 0 0 0 2px rgba(var(--ios-primary-rgb), 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 100px;
}

.btn-primary {
  background: var(--ios-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--ios-primary-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: var(--ios-border-medium);
  color: var(--ios-text-tertiary);
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--ios-background-elevated);
  color: var(--ios-text-secondary);
  border: 1px solid var(--ios-border-medium);
}

.btn-secondary:hover {
  background: var(--ios-background-secondary);
  border-color: var(--ios-border-dark);
  color: var(--ios-text-primary);
}

/* Touch-friendly enhancements */
@media (pointer: coarse) {
  .student-link {
    min-height: 72px;
  }
  
  .compact-select, .search-input, .export-btn {
    min-height: 44px;
  }
  
  .action-button, .tag-button {
    width: 36px;
    height: 36px;
  }
}
</style>
