<template>
  <div class="unassigned-students">
    <div class="header">
      <h2>📋 Unassigned Students</h2>
      <p>Students without a class assignment</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading unassigned students...</p>
    </div>

    <div v-else-if="unassignedStudents.length === 0" class="empty-state">
      <div class="empty-icon">✅</div>
      <h3>All students are assigned to classes!</h3>
      <p>Great job! Every student has been properly allocated.</p>
    </div>

    <div v-else class="students-list">
      <div class="stats-bar">
        <span class="stat">{{ unassignedStudents.length }} unassigned students</span>
        <button @click="refreshList" class="refresh-btn">🔄 Refresh</button>
      </div>

      <div class="bulk-actions">
        <select v-model="selectedClass" class="class-select">
          <option value="">Select class to assign</option>
          <option v-for="class_ in classes" :key="class_.id" :value="class_.id">
            {{ class_.name }} - {{ class_.grade || 'No Grade' }}
          </option>
        </select>
        <button 
          @click="assignSelectedStudents" 
          :disabled="selectedStudents.length === 0 || !selectedClass"
          class="assign-btn"
        >
          Assign Selected ({{ selectedStudents.length }})
        </button>
      </div>

      <div class="student-grid">
        <div 
          v-for="student in unassignedStudents" 
          :key="student.id" 
          class="student-card"
        >
          <div class="student-info">
            <h4>{{ student.name }} {{ student.surname || '' }}</h4>
            <p class="grade">{{ student.grade || 'No Grade' }}</p>
            <p class="school">{{ student.school_name || 'No School' }}</p>
            <p class="parent">Parent: {{ student.parent_contact_name || 'N/A' }}</p>
            <p class="phone">Phone: {{ student.parent_phone || 'N/A' }}</p>
          </div>

          <div class="actions">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                :value="student.id" 
                v-model="selectedStudents"
              >
              Select
            </label>
            
            <select 
              v-model="individualAssignments[student.id]" 
              class="individual-class-select"
            >
              <option value="">Assign to class...</option>
              <option v-for="class_ in classes" :key="class_.id" :value="class_.id">
                {{ class_.name }}
              </option>
            </select>
            
            <button 
              @click="assignIndividual(student.id, individualAssignments[student.id])"
              :disabled="!individualAssignments[student.id]"
              class="assign-individual-btn"
            >
              Assign
            </button>
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
import { ref, onMounted } from 'vue'
import { useClassStore } from '../stores/class'
import { getUnassignedStudents, assignStudentsToClass } from '../utils/studentValidation'

export default {
  name: 'UnassignedStudents',
  setup() {
    const classStore = useClassStore()
    const unassignedStudents = ref([])
    const loading = ref(false)
    const selectedClass = ref('')
    const selectedStudents = ref([])
    const individualAssignments = ref({})
    const successMessage = ref('')

    const classes = ref([])

    const loadUnassignedStudents = async () => {
      loading.value = true
      try {
        const students = await getUnassignedStudents()
        unassignedStudents.value = students
      } catch (error) {
        console.error('Error loading unassigned students:', error)
      } finally {
        loading.value = false
      }
    }

    const loadClasses = async () => {
      try {
        await classStore.fetchClasses()
        classes.value = classStore.classes
      } catch (error) {
        console.error('Error loading classes:', error)
      }
    }

    const assignSelectedStudents = async () => {
      if (!selectedClass.value || selectedStudents.value.length === 0) return

      try {
        await assignStudentsToClass(selectedStudents.value, selectedClass.value)
        
        // Remove assigned students from the list
        unassignedStudents.value = unassignedStudents.value.filter(
          student => !selectedStudents.value.includes(student.id)
        )
        
        // Clear selections
        selectedStudents.value = []
        selectedClass.value = ''
        
        successMessage.value = `Successfully assigned ${selectedStudents.value.length} students to class`
        setTimeout(() => successMessage.value = '', 3000)
        
      } catch (error) {
        console.error('Error assigning students:', error)
        alert('Failed to assign students. Please try again.')
      }
    }

    const assignIndividual = async (studentId, classId) => {
      if (!classId) return

      try {
        await assignStudentsToClass([studentId], classId)
        
        // Remove assigned student from the list
        unassignedStudents.value = unassignedStudents.value.filter(
          student => student.id !== studentId
        )
        
        // Clear individual assignment
        individualAssignments.value[studentId] = ''
        
        successMessage.value = 'Student successfully assigned to class'
        setTimeout(() => successMessage.value = '', 3000)
        
      } catch (error) {
        console.error('Error assigning individual student:', error)
        alert('Failed to assign student. Please try again.')
      }
    }

    const refreshList = () => {
      loadUnassignedStudents()
    }

    onMounted(() => {
      loadUnassignedStudents()
      loadClasses()
    })

    return {
      unassignedStudents,
      loading,
      classes,
      selectedClass,
      selectedStudents,
      individualAssignments,
      successMessage,
      assignSelectedStudents,
      assignIndividual,
      refreshList
    }
  }
}
</script>

<style scoped>
.unassigned-students {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.header p {
  color: #666;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #27ae60;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat {
  font-weight: bold;
  color: #e74c3c;
}

.refresh-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.bulk-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.class-select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.assign-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.assign-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.student-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: white;
}

.student-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.student-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.actions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.individual-class-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.assign-individual-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.assign-individual-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #27ae60;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  z-index: 1000;
}
</style>
