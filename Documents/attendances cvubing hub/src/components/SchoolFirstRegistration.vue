<template>
  <div class="school-first-registration">
    <!-- Header -->
    <div class="header-section">
      <div class="gradient-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">
              🏫 School-First Registration
              <span v-if="!syncManager.isOnline" class="offline-badge">OFFLINE</span>
            </h1>
            <p class="page-subtitle">Select school → class → add students</p>
          </div>
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-number">{{ registeredToday }}</span>
              <span class="stat-label">Today</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ pendingSync }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="registration-container">
      <div class="form-card">
        <div class="form-header">
          <h2>Student Registration</h2>
          <div class="form-controls">
            <button @click="clearForm" class="clear-btn">🗑️ Clear</button>
          </div>
        </div>

        <!-- Step 1: Select School -->
        <div class="step-section">
          <h3>Step 1: Select School</h3>
          <select v-model="selectedSchool" class="form-input school-select" required>
            <option value="">Choose a school...</option>
            <option v-for="school in schools" :key="school.id" :value="school.id">
              {{ school.name }}
            </option>
          </select>
        </div>

        <!-- Step 2: Select Class (filtered by school) -->
        <div class="step-section" v-if="selectedSchool">
          <h3>Step 2: Select Class</h3>
          <select v-model="selectedClass" class="form-input class-select" required>
            <option value="">Choose a class...</option>
            <option v-for="class_ in filteredClasses" :key="class_.id" :value="class_.id">
              {{ class_.name }} - {{ class_.grade || 'No Grade' }}
            </option>
          </select>
          <p v-if="filteredClasses.length === 0" class="no-classes">
            No classes found for this school. Please create a class first.
          </p>
        </div>

        <!-- Step 3: Student Details -->
        <div class="step-section" v-if="selectedClass">
          <h3>Step 3: Student Details</h3>
          
          <div class="form-grid">
            <div class="form-row">
              <input 
                v-model="student.name" 
                placeholder="First Name*" 
                class="form-input required"
                ref="nameInput"
              >
              <input 
                v-model="student.surname" 
                placeholder="Surname*" 
                class="form-input required"
              >
            </div>
            
            <div class="form-row">
              <select v-model="student.grade" class="form-input">
                <option value="">Select Grade</option>
                <option v-for="grade in grades" :key="grade" :value="grade">{{ grade }}</option>
              </select>
              <input 
                v-model="student.school_name" 
                placeholder="School Name (auto-filled)" 
                class="form-input"
                :value="selectedSchoolName"
                readonly
              >
            </div>
            
            <div class="form-row">
              <input 
                v-model="student.parent_contact_name" 
                placeholder="Parent/Guardian Name" 
                class="form-input"
              >
              <input 
                v-model="student.parent_phone" 
                placeholder="Parent Phone" 
                class="form-input"
              >
            </div>
            
            <div class="form-row">
              <input 
                v-model="student.parent_email" 
                placeholder="Parent Email (optional)" 
                class="form-input"
                type="email"
              >
            </div>
          </div>

          <div class="registration-actions">
            <button 
              @click="saveStudent" 
              :disabled="!canSaveStudent || loading"
              class="save-btn"
            >
              {{ loading ? '💾 Saving...' : '💾 Register Student' }}
            </button>
            <button 
              @click="saveAndAddAnother" 
              :disabled="!canSaveStudent || loading"
              class="save-another-btn"
            >
              {{ loading ? '💾 Saving...' : '💾 Register & Add Another' }}
            </button>
          </div>
        </div>

        <!-- Step 4: View Students in Class -->
        <div class="step-section" v-if="selectedClass">
          <h3>Step 4: Students in Selected Class</h3>
          <div class="students-preview">
            <div class="preview-header">
              <h4>{{ selectedClassName }}</h4>
              <span class="student-count">{{ studentsInClass }} students</span>
            </div>
            
            <div v-if="classStudents.length > 0" class="students-list">
              <div 
                v-for="student in classStudents" 
                :key="student.id" 
                class="student-item"
              >
                <span class="student-name">{{ student.name }} {{ student.surname || '' }}</span>
                <span class="student-grade">{{ student.grade || 'No Grade' }}</span>
              </div>
            </div>
            
            <div v-else class="no-students">
              <p>No students in this class yet. Add your first student above!</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Registrations -->
      <div class="recent-section">
        <h3>Recent Registrations</h3>
        <div class="recent-list">
          <div 
            v-for="recent in recentRegistrations" 
            :key="recent.id" 
            :class="['recent-item', { unsynced: !recent.is_synced }]"
          >
            <div class="student-info">
              <strong>{{ recent.name }} {{ recent.surname }}</strong>
              <span class="school">{{ recent.school_name }}</span>
              <span class="class">{{ recent.class_name }}</span>
            </div>
            <div class="sync-status">
              <span v-if="recent.is_synced" class="synced">✅</span>
              <span v-else class="pending">⏳</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useSchoolStore } from '../stores/school'
import { useClassStore } from '../stores/class'
import { useStudentStore } from '../stores/student'
import syncManager from '../utils/syncManager'
import offlineStorage from '../utils/offlineStorage'

export default {
  name: 'SchoolFirstRegistration',
  setup() {
    const schoolStore = useSchoolStore()
    const classStore = useClassStore()
    const studentStore = useStudentStore()
    
    // Reactive data
    const loading = ref(false)
    const selectedSchool = ref('')
    const selectedClass = ref('')
    const registeredToday = ref(0)
    const pendingSync = ref(0)
    const successMessage = ref('')
    
    // Student form
    const student = reactive({
      name: '',
      surname: '',
      grade: '',
      class_id: '',
      school_name: '',
      parent_contact_name: '',
      parent_phone: '',
      parent_email: '',
      registration_source: 'school_first'
    })
    
    const recentRegistrations = ref([])
    
    // Constants
    const grades = [
      'Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
      'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
      'Grade 11', 'Grade 12'
    ]
    
    // Computed properties
    const schools = computed(() => schoolStore.schools)
    const filteredClasses = computed(() => {
      if (!selectedSchool.value) return []
      return classStore.classes.filter(c => c.school_id === selectedSchool.value)
    })
    
    const selectedSchoolName = computed(() => {
      const school = schools.value.find(s => s.id === selectedSchool.value)
      return school ? school.name : ''
    })
    
    const selectedClassName = computed(() => {
      const class_ = filteredClasses.value.find(c => c.id === selectedClass.value)
      return class_ ? `${class_.name} - ${class_.grade || 'No Grade'}` : ''
    })
    
    const studentsInClass = computed(() => {
      return classStudents.value.length
    })
    
    const classStudents = computed(() => {
      if (!selectedClass.value) return []
      return studentStore.getStudentsByClass(selectedClass.value)
    })
    
    const canSaveStudent = computed(() => {
      return student.name.trim() && student.surname.trim() && selectedClass.value
    })
    
    // Methods
    const clearForm = () => {
      Object.keys(student).forEach(key => {
        if (key !== 'registration_source') {
          student[key] = ''
        }
      })
      selectedSchool.value = ''
      selectedClass.value = ''
    }
    
    const saveStudent = async () => {
      if (!canSaveStudent.value) return
      
      loading.value = true
      try {
        const studentData = {
          ...student,
          class_id: selectedClass.value,
          school_name: selectedSchoolName.value,
          registration_source: 'school_first'
        }
        
        const result = await syncManager.saveStudent(studentData)
        
        // Add to recent registrations
        recentRegistrations.value.unshift({
          ...result,
          school_name: selectedSchoolName.value,
          class_name: selectedClassName.value
        })
        
        if (recentRegistrations.value.length > 10) {
          recentRegistrations.value = recentRegistrations.value.slice(0, 10)
        }
        
        // Clear form for next student
        student.name = ''
        student.surname = ''
        student.grade = ''
        student.parent_contact_name = ''
        student.parent_phone = ''
        student.parent_email = ''
        
        successMessage.value = `Student ${result.name} ${result.surname} registered successfully!`
        setTimeout(() => successMessage.value = '', 3000)
        
        // Refresh students for the selected class
        await studentStore.fetchStudents(selectedClass.value)
        
      } catch (error) {
        console.error('Failed to save student:', error)
        alert('Failed to save student. Please try again.')
      } finally {
        loading.value = false
      }
    }
    
    const saveAndAddAnother = async () => {
      await saveStudent()
      // Keep school and class selected for next student
      student.name = ''
      student.surname = ''
      student.grade = ''
      student.parent_contact_name = ''
      student.parent_phone = ''
      student.parent_email = ''
    }
    
    const updateStats = async () => {
      try {
        const stats = await offlineStorage.getStorageStats()
        pendingSync.value = stats.students?.unsynced || 0
        
        const today = new Date().toISOString().split('T')[0]
        const allStudents = await offlineStorage.getAll('students')
        registeredToday.value = allStudents.filter(s => 
          s.created_at?.startsWith(today) || s.offline_created_at?.startsWith(today)
        ).length
        
      } catch (error) {
        console.error('Failed to update stats:', error)
      }
    }
    
    const loadRecentRegistrations = async () => {
      try {
        const allStudents = await offlineStorage.getAll('students')
        recentRegistrations.value = allStudents
          .filter(s => s.registration_source?.includes('school_first'))
          .sort((a, b) => new Date(b.created_at || b.offline_created_at) - new Date(a.created_at || a.offline_created_at))
          .slice(0, 10)
          .map(s => ({
            ...s,
            school_name: schools.value.find(school => school.id === classStore.classes.find(c => c.id === s.class_id)?.school_id)?.name || 'Unknown',
            class_name: classStore.classes.find(c => c.id === s.class_id)?.name || 'Unknown'
          }))
      } catch (error) {
        console.error('Failed to load recent registrations:', error)
      }
    }
    
    // Watch for class selection to load students
    watch(selectedClass, async (newClassId) => {
      if (newClassId) {
        await studentStore.fetchStudents(newClassId)
      }
    })
    
    // Lifecycle
    onMounted(async () => {
      await schoolStore.fetchSchools()
      await classStore.fetchClasses()
      await updateStats()
      await loadRecentRegistrations()
      
      // Focus on school selection
      setTimeout(() => {
        const schoolSelect = document.querySelector('.school-select')
        if (schoolSelect) schoolSelect.focus()
      }, 500)
    })
    
    return {
      // Data
      loading,
      selectedSchool,
      selectedClass,
      registeredToday,
      pendingSync,
      student,
      recentRegistrations,
      grades,
      
      // Computed
      schools,
      filteredClasses,
      selectedSchoolName,
      selectedClassName,
      studentsInClass,
      classStudents,
      canSaveStudent,
      
      // Methods
      clearForm,
      saveStudent,
      saveAndAddAnother,
      
      // Sync manager
      syncManager
    }
  }
}
</script>

<style scoped>
.school-first-registration {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.header-section {
  margin-bottom: 2rem;
}

.gradient-header {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.offline-badge {
  background: #ff6b6b;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 1rem;
}

.registration-container {
  max-width: 1000px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.step-section {
  margin-bottom: 2rem;
}

.step-section h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-input.required {
  border-color: #ff9800;
}

.school-select,
.class-select {
  font-size: 1.1rem;
  padding: 1rem;
}

.registration-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.save-btn,
.save-another-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background: #28a745;
  color: white;
}

.save-another-btn {
  background: #17a2b8;
  color: white;
}

.save-btn:hover,
.save-another-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.save-btn:disabled,
.save-another-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.students-preview {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.student-count {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.students-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.no-students {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.no-classes {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.recent-section {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  height: fit-content;
  margin-top: 2rem;
}

.recent-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #28a745;
}

.recent-item.unsynced {
  border-left-color: #ffc107;
  background: #fff3cd;
}

.student-info {
  display: flex;
  flex-direction: column;
}

.school, .class {
  font-size: 0.8rem;
  color: #666;
}

.sync-status {
  font-size: 1.2rem;
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #28a745;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  z-index: 1000;
}

@media (max-width: 768px) {
  .school-first-registration {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .registration-actions {
    flex-direction: column;
  }
}
</style>
