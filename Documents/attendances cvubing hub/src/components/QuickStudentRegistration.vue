<template>
  <div class="quick-registration">
    <!-- Header with status indicators -->
    <div class="header-section">
      <div class="gradient-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">
              ⚡ Quick Registration
              <span v-if="!syncManager.isOnline" class="offline-badge">OFFLINE</span>
            </h1>
            <p class="page-subtitle">Fast student registration for open days</p>
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

    <!-- Quick Registration Form -->
    <div class="registration-container">
      <div class="form-card">
        <div class="form-header">
          <h2>{{ batchMode ? 'Batch Registration' : 'Single Registration' }}</h2>
          <div class="form-controls">
            <button 
              @click="toggleBatchMode" 
              :class="['mode-toggle', { active: batchMode }]"
            >
              {{ batchMode ? '📝 Single' : '📋 Batch' }}
            </button>
            <button @click="clearForm" class="clear-btn">🗑️ Clear</button>
          </div>
        </div>

        <!-- Batch Mode -->
        <div v-if="batchMode" class="batch-section">
          <div class="batch-controls">
            <select v-model="selectedClass" class="class-select" required>
              <option value="">Select Class</option>
              <option v-for="class_ in classes" :key="class_.id" :value="class_.id">
                {{ class_.name }} - {{ class_.grade || 'No Grade' }}
              </option>
            </select>
            <input 
              v-model="defaultSchool" 
              placeholder="Default School (optional)"
              class="school-input"
            >
          </div>
          
          <div class="batch-students">
            <div 
              v-for="(student, index) in batchStudents" 
              :key="index" 
              class="batch-student-row"
            >
              <input 
                v-model="student.name" 
                placeholder="First Name*" 
                class="name-input"
                @keyup.enter="focusNext(index, 'surname')"
                :ref="`name-${index}`"
              >
              <input 
                v-model="student.surname" 
                placeholder="Surname*" 
                class="surname-input"
                @keyup.enter="focusNext(index, 'grade')"
                :ref="`surname-${index}`"
              >
              <select 
                v-model="student.grade" 
                class="grade-select"
                @change="focusNext(index, 'parent_contact_name')"
                :ref="`grade-${index}`"
              >
                <option value="">Grade</option>
                <option v-for="grade in grades" :key="grade" :value="grade">{{ grade }}</option>
              </select>
              <input 
                v-model="student.parent_contact_name" 
                placeholder="Parent Name" 
                class="parent-input"
                @keyup.enter="focusNext(index, 'parent_phone')"
                :ref="`parent_contact_name-${index}`"
              >
              <input 
                v-model="student.parent_phone" 
                placeholder="Phone" 
                class="phone-input"
                @keyup.enter="addBatchRow"
                :ref="`parent_phone-${index}`"
              >
              <button @click="removeBatchRow(index)" class="remove-btn">❌</button>
            </div>
          </div>
          
          <div class="batch-actions">
            <button @click="addBatchRow" class="add-row-btn">+ Add Row</button>
            <button @click="saveBatchStudents" :disabled="loading" class="save-batch-btn">
              {{ loading ? '💾 Saving...' : `💾 Save All (${validBatchStudents})` }}
            </button>
          </div>
        </div>

        <!-- Single Mode -->
        <div v-else class="single-section">
          <div class="form-grid">
            <div class="form-row">
              <input 
                v-model="student.name" 
                placeholder="First Name*" 
                class="form-input required"
                ref="singleName"
                @keyup.enter="$refs.singleSurname.focus()"
              >
              <input 
                v-model="student.surname" 
                placeholder="Surname*" 
                class="form-input required"
                ref="singleSurname"
                @keyup.enter="$refs.singleGrade.focus()"
              >
            </div>
            
            <div class="form-row">
              <select 
                v-model="student.grade" 
                class="form-input"
                ref="singleGrade"
                @change="$refs.singleSchool.focus()"
              >
                <option value="">Select Grade</option>
                <option v-for="grade in grades" :key="grade" :value="grade">{{ grade }}</option>
              </select>
              <select 
                v-model="student.class_id" 
                class="form-input"
                ref="singleClass"
              >
                <option value="">Select Class</option>
                <option v-for="class_ in classes" :key="class_.id" :value="class_.id">
                  {{ class_.name }} - {{ class_.grade || 'No Grade' }}
                </option>
              </select>
            </div>
            
            <div class="form-row">
              <input 
                v-model="student.school_name" 
                placeholder="School Name" 
                class="form-input"
                ref="singleSchool"
                @keyup.enter="$refs.singleParent.focus()"
              >
              <input 
                v-model="student.parent_contact_name" 
                placeholder="Parent/Guardian Name" 
                class="form-input"
                ref="singleParent"
                @keyup.enter="$refs.singlePhone.focus()"
              >
            </div>
            
            <div class="form-row">
              <input 
                v-model="student.parent_phone" 
                placeholder="Parent Phone" 
                class="form-input"
                ref="singlePhone"
                @keyup.enter="$refs.singleEmail.focus()"
              >
              <input 
                v-model="student.parent_email" 
                placeholder="Parent Email (optional)" 
                class="form-input"
                ref="singleEmail"
                type="email"
                @keyup.enter="saveSingleStudent"
              >
            </div>
          </div>
          
          <div class="single-actions">
            <button @click="saveSingleStudent" :disabled="!canSaveSingle || loading" class="save-single-btn">
              {{ loading ? '💾 Saving...' : '💾 Save Student' }}
            </button>
            <button @click="saveAndAddAnother" :disabled="!canSaveSingle || loading" class="save-another-btn">
              {{ loading ? '💾 Saving...' : '💾 Save & Add Another' }}
            </button>
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
              <span class="grade">{{ recent.grade }}</span>
            </div>
            <div class="sync-status">
              <span v-if="recent.is_synced" class="synced">✅</span>
              <span v-else class="pending">⏳</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sync Status Bar -->
    <div v-if="showSyncStatus" class="sync-status-bar">
      <div class="sync-info">
        <span class="sync-icon">{{ syncStatusIcon }}</span>
        <span class="sync-text">{{ syncStatusText }}</span>
      </div>
      <button v-if="canSync" @click="forceSync" class="sync-btn">
        🔄 Sync Now
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useClassStore } from '../stores/class.js'
import syncManager from '../utils/syncManager.js'
import offlineStorage from '../utils/offlineStorage.js'

export default {
  name: 'QuickStudentRegistration',
  setup() {
    const classStore = useClassStore()
    
    // Reactive data
    const loading = ref(false)
    const batchMode = ref(false)
    const selectedClass = ref('')
    const defaultSchool = ref('')
    const registeredToday = ref(0)
    const pendingSync = ref(0)
    
    // Single student form
    const student = reactive({
      name: '',
      surname: '',
      grade: '',
      class_id: '',
      school_name: '',
      parent_contact_name: '',
      parent_phone: '',
      parent_email: '',
      registration_source: 'open_day'
    })
    
    // Batch students
    const batchStudents = ref([
      { name: '', surname: '', grade: '', parent_contact_name: '', parent_phone: '' }
    ])
    
    const recentRegistrations = ref([])
    const syncStatus = ref(null)
    
    // Constants
    const grades = [
      'Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
      'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
      'Grade 11', 'Grade 12'
    ]
    
    // Computed properties
    const classes = computed(() => classStore.classes)
    
    const canSaveSingle = computed(() => {
      return student.name.trim() && student.surname.trim()
    })
    
    const validBatchStudents = computed(() => {
      return batchStudents.value.filter(s => s.name.trim() && s.surname.trim()).length
    })
    
    const showSyncStatus = computed(() => {
      return !syncManager.isOnline || pendingSync.value > 0
    })
    
    const syncStatusIcon = computed(() => {
      if (!syncManager.isOnline) return '📴'
      if (syncManager.syncInProgress) return '⏳'
      if (pendingSync.value > 0) return '🔄'
      return '✅'
    })
    
    const syncStatusText = computed(() => {
      if (!syncManager.isOnline) return 'Working offline'
      if (syncManager.syncInProgress) return 'Syncing...'
      if (pendingSync.value > 0) return `${pendingSync.value} items pending sync`
      return 'All synced'
    })
    
    const canSync = computed(() => {
      return syncManager.isOnline && pendingSync.value > 0 && !syncManager.syncInProgress
    })
    
    // Methods
    const clearForm = () => {
      if (batchMode.value) {
        batchStudents.value = [
          { name: '', surname: '', grade: '', parent_contact_name: '', parent_phone: '' }
        ]
      } else {
        Object.keys(student).forEach(key => {
          if (key !== 'registration_source') {
            student[key] = ''
          }
        })
      }
    }
    
    const toggleBatchMode = () => {
      batchMode.value = !batchMode.value
      clearForm()
    }
    
    const addBatchRow = () => {
      batchStudents.value.push({
        name: '', surname: '', grade: '', parent_contact_name: '', parent_phone: ''
      })
    }
    
    const removeBatchRow = (index) => {
      if (batchStudents.value.length > 1) {
        batchStudents.value.splice(index, 1)
      }
    }
    
    const focusNext = (index, field) => {
      // Navigate to next input or add new row
      const nextField = getNextField(field)
      if (nextField) {
        setTimeout(() => {
          const ref = `${nextField}-${index}`
          if (refs[ref] && refs[ref][0]) {
            refs[ref][0].focus()
          }
        }, 50)
      } else {
        // Last field, add new row if this row is complete
        const currentStudent = batchStudents.value[index]
        if (currentStudent.name && currentStudent.surname) {
          addBatchRow()
          setTimeout(() => {
            const ref = `name-${batchStudents.value.length - 1}`
            if (refs[ref] && refs[ref][0]) {
              refs[ref][0].focus()
            }
          }, 50)
        }
      }
    }
    
    const getNextField = (current) => {
      const fields = ['name', 'surname', 'grade', 'parent_contact_name', 'parent_phone']
      const currentIndex = fields.indexOf(current)
      return currentIndex < fields.length - 1 ? fields[currentIndex + 1] : null
    }
    
    const saveSingleStudent = async () => {
      if (!canSaveSingle.value) return
      
      loading.value = true
      try {
        const studentData = {
          ...student,
          registration_source: 'open_day'
        }
        
        const result = await syncManager.saveStudent(studentData)
        
        // Add to recent registrations
        recentRegistrations.value.unshift(result)
        if (recentRegistrations.value.length > 10) {
          recentRegistrations.value = recentRegistrations.value.slice(0, 10)
        }
        
        // Clear form
        clearForm()
        
        // Focus back on name input
        setTimeout(() => {
          if (refs.singleName) {
            refs.singleName.focus()
          }
        }, 100)
        
        updateStats()
        
      } catch (error) {
        console.error('Failed to save student:', error)
        alert('Failed to save student. Please try again.')
      } finally {
        loading.value = false
      }
    }
    
    const saveAndAddAnother = async () => {
      await saveSingleStudent()
    }
    
    const saveBatchStudents = async () => {
      const validStudents = batchStudents.value.filter(s => s.name.trim() && s.surname.trim())
      
      if (validStudents.length === 0) {
        alert('Please add at least one student with name and surname.')
        return
      }
      
      if (!selectedClass.value) {
        alert('Please select a class for batch registration.')
        return
      }
      
      loading.value = true
      try {
        const promises = validStudents.map(batchStudent => {
          const studentData = {
            name: batchStudent.name.trim(),
            surname: batchStudent.surname.trim(),
            grade: batchStudent.grade || '',
            class_id: selectedClass.value,
            school_name: defaultSchool.value || '',
            parent_contact_name: batchStudent.parent_contact_name || '',
            parent_phone: batchStudent.parent_phone || '',
            registration_source: 'open_day_batch'
          }
          return syncManager.saveStudent(studentData)
        })
        
        const results = await Promise.all(promises)
        
        // Add all to recent registrations
        results.forEach(result => {
          recentRegistrations.value.unshift(result)
        })
        
        // Keep only recent 10
        if (recentRegistrations.value.length > 10) {
          recentRegistrations.value = recentRegistrations.value.slice(0, 10)
        }
        
        // Clear form
        clearForm()
        selectedClass.value = ''
        
        updateStats()
        
        alert(`Successfully registered ${results.length} students!`)
        
      } catch (error) {
        console.error('Failed to save batch students:', error)
        alert('Failed to save some students. Please try again.')
      } finally {
        loading.value = false
      }
    }
    
    const forceSync = async () => {
      await syncManager.forcSync()
      updateStats()
    }
    
    const updateStats = async () => {
      try {
        const stats = await offlineStorage.getStorageStats()
        pendingSync.value = stats.students?.unsynced || 0
        
        // Calculate today's registrations
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
          .filter(s => s.registration_source?.includes('open_day'))
          .sort((a, b) => new Date(b.created_at || b.offline_created_at) - new Date(a.created_at || a.offline_created_at))
          .slice(0, 10)
      } catch (error) {
        console.error('Failed to load recent registrations:', error)
      }
    }
    
    // Lifecycle
    onMounted(async () => {
      await classStore.fetchClasses()
      await updateStats()
      await loadRecentRegistrations()
      
      // Set up sync listeners
      syncManager.addSyncListener((event) => {
        if (event.type === 'sync_complete') {
          updateStats()
        }
      })
      
      // Focus on first input
      setTimeout(() => {
        if (refs.singleName) {
          refs.singleName.focus()
        }
      }, 500)
    })
    
    return {
      // Data
      loading,
      batchMode,
      selectedClass,
      defaultSchool,
      registeredToday,
      pendingSync,
      student,
      batchStudents,
      recentRegistrations,
      grades,
      
      // Computed
      classes,
      canSaveSingle,
      validBatchStudents,
      showSyncStatus,
      syncStatusIcon,
      syncStatusText,
      canSync,
      
      // Methods
      clearForm,
      toggleBatchMode,
      addBatchRow,
      removeBatchRow,
      focusNext,
      saveSingleStudent,
      saveAndAddAnother,
      saveBatchStudents,
      forceSync,
      
      // Sync manager for template access
      syncManager
    }
  }
}
</script>

<style scoped>
.quick-registration {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-section {
  padding: 2rem 1rem;
}

.gradient-header {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.offline-badge {
  background: #ff6b6b;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.registration-container {
  padding: 0 1rem 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  max-width: 1400px;
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

.form-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.form-controls {
  display: flex;
  gap: 1rem;
}

.mode-toggle {
  padding: 0.5rem 1rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-toggle.active,
.mode-toggle:hover {
  background: #667eea;
  color: white;
}

.clear-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #dc3545;
  background: white;
  color: #dc3545;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: #dc3545;
  color: white;
}

/* Single Mode Styles */
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

.single-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.save-single-btn,
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

.save-single-btn {
  background: #28a745;
  color: white;
}

.save-another-btn {
  background: #17a2b8;
  color: white;
}

.save-single-btn:hover,
.save-another-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.save-single-btn:disabled,
.save-another-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Batch Mode Styles */
.batch-controls {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.class-select,
.school-input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
}

.batch-students {
  margin-bottom: 1rem;
}

.batch-student-row {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1.5fr 1fr auto;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.name-input,
.surname-input,
.grade-select,
.parent-input,
.phone-input {
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-size: 0.9rem;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.add-row-btn,
.save-batch-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.add-row-btn {
  background: #6c757d;
  color: white;
}

.save-batch-btn {
  background: #28a745;
  color: white;
  flex: 1;
}

/* Recent Registrations */
.recent-section {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  height: fit-content;
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

.grade {
  font-size: 0.8rem;
  color: #666;
}

/* Sync Status Bar */
.sync-status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
}

.sync-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sync-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .registration-container {
    grid-template-columns: 1fr;
    padding: 0 0.5rem 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .batch-student-row {
    grid-template-columns: 1fr 1fr;
    gap: 0.25rem;
  }
  
  .grade-select,
  .parent-input,
  .phone-input,
  .remove-btn {
    grid-column: span 2;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
}
</style>
