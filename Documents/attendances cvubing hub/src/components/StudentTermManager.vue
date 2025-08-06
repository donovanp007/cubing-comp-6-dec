<template>
  <div class="student-term-manager">
    <div class="term-header">
      <h1>Student Term Management</h1>
      <div class="header-actions">
        <button @click="showAddTermModal = true" class="add-term-btn">
          <span class="icon">+</span> Add Term
        </button>
        <button @click="showImportModal = true" class="import-btn">
          <span class="icon">📥</span> Import Students
        </button>
      </div>
    </div>

    <!-- Active Term Info -->
    <div v-if="activeTerm" class="active-term-info">
      <div class="term-details">
        <h2>{{ activeTerm.name }}</h2>
        <p>{{ formatDate(activeTerm.start_date) }} - {{ formatDate(activeTerm.end_date) }}</p>
        <span class="active-badge">Active Term</span>
      </div>
      <div class="term-stats">
        <div class="stat-item">
          <span class="stat-value">{{ activeStudentsCount }}</span>
          <span class="stat-label">Active Students</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalStudentsCount }}</span>
          <span class="stat-label">Total Students</span>
        </div>
      </div>
    </div>

    <!-- Term Selector -->
    <div class="term-selector">
      <label>View Term:</label>
      <select v-model="selectedTermId" @change="loadTermData">
        <option v-for="term in terms" :key="term.id" :value="term.id">
          {{ term.name }} {{ term.is_active ? '(Active)' : '' }}
        </option>
      </select>
    </div>

    <!-- Students Table -->
    <div class="students-table-container">
      <div class="table-header">
        <h3>Students in {{ selectedTerm?.name }}</h3>
        <div class="filter-controls">
          <select v-model="statusFilter" class="status-filter">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="transferred">Transferred</option>
          </select>
          <input 
            v-model="searchQuery" 
            placeholder="Search students..."
            class="search-input"
          >
        </div>
      </div>

      <table class="students-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Enrolled Date</th>
            <th>Status</th>
            <th>Cube Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in filteredStudents" :key="student.id" class="student-row">
            <td>
              <div class="student-name">
                <router-link :to="{ name: 'StudentProfile', params: { id: student.id }}">
                  {{ student.name }}
                </router-link>
              </div>
            </td>
            <td>{{ student.class?.name }}</td>
            <td>{{ formatDate(student.enrolled_date) }}</td>
            <td>
              <select 
                :value="student.term_status"
                @change="updateStudentStatus(student.id, $event.target.value)"
                class="status-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="transferred">Transferred</option>
              </select>
            </td>
            <td>
              <div class="cube-progress-summary">
                <div class="progress-item">
                  <span class="cube-type">3x3:</span>
                  <span class="progress-level">{{ getCubeProgress(student, '3x3') }}</span>
                </div>
                <div class="progress-item">
                  <span class="cube-type">2x2:</span>
                  <span class="progress-level">{{ getCubeProgress(student, '2x2') }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="student-actions">
                <button @click="moveToTerm(student)" class="move-btn" title="Move to different term">
                  📋
                </button>
                <button @click="viewHistory(student)" class="history-btn" title="View history">
                  📊
                </button>
                <button @click="archiveStudent(student)" class="archive-btn" title="Archive student">
                  📦
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Term Modal -->
    <div v-if="showAddTermModal" class="modal">
      <div class="modal-content">
        <h2>Add New Term</h2>
        <form @submit.prevent="addTerm">
          <div class="form-group">
            <label>Term Name:</label>
            <input v-model="termForm.name" required placeholder="e.g., Term 1 2024">
          </div>
          <div class="form-group">
            <label>Start Date:</label>
            <input v-model="termForm.start_date" type="date" required>
          </div>
          <div class="form-group">
            <label>End Date:</label>
            <input v-model="termForm.end_date" type="date" required>
          </div>
          <div class="form-group">
            <label>
              <input v-model="termForm.is_active" type="checkbox">
              Set as Active Term
            </label>
          </div>
          <div class="button-group">
            <button type="submit" class="save-btn">Add Term</button>
            <button type="button" @click="showAddTermModal = false" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Import Students Modal -->
    <div v-if="showImportModal" class="modal">
      <div class="modal-content">
        <h2>Import Students</h2>
        <div class="import-options">
          <div class="import-option">
            <h3>Import from Previous Term</h3>
            <select v-model="importFromTerm" class="term-select">
              <option value="">Select term to import from...</option>
              <option v-for="term in terms" :key="term.id" :value="term.id">
                {{ term.name }}
              </option>
            </select>
            <button @click="importFromPreviousTerm" class="import-btn" :disabled="!importFromTerm">
              Import Students
            </button>
          </div>
          
          <div class="import-option">
            <h3>Import from CSV</h3>
            <input type="file" @change="handleFileUpload" accept=".csv" class="file-input">
            <button @click="importFromCSV" class="import-btn" :disabled="!csvFile">
              Import CSV
            </button>
          </div>
        </div>
        
        <div class="import-preview" v-if="importPreview.length > 0">
          <h3>Import Preview</h3>
          <div class="preview-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in importPreview" :key="student.id || student.name">
                  <td>{{ student.name }}</td>
                  <td>{{ student.class_name }}</td>
                  <td>{{ student.term_status }}</td>
                  <td>
                    <select v-model="student.action" class="action-select">
                      <option value="import">Import</option>
                      <option value="skip">Skip</option>
                      <option value="update">Update Existing</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="preview-actions">
            <button @click="confirmImport" class="confirm-btn">Confirm Import</button>
            <button @click="importPreview = []" class="cancel-btn">Cancel</button>
          </div>
        </div>
        
        <div class="button-group">
          <button @click="showImportModal = false" class="cancel-btn">Close</button>
        </div>
      </div>
    </div>

    <!-- Student History Modal -->
    <div v-if="showHistoryModal" class="modal">
      <div class="modal-content history-modal">
        <h2>{{ selectedStudent?.name }} - History</h2>
        <div class="history-content">
          <div class="history-section">
            <h3>Term History</h3>
            <div class="term-history">
              <div v-for="term in studentTermHistory" :key="term.id" class="term-item">
                <div class="term-info">
                  <h4>{{ term.name }}</h4>
                  <p>{{ formatDate(term.start_date) }} - {{ formatDate(term.end_date) }}</p>
                  <span class="status-badge" :class="term.status">{{ term.status }}</span>
                </div>
                <div class="term-progress">
                  <div class="progress-summary">
                    <span>Lessons Completed: {{ term.lessons_completed || 0 }}/8</span>
                    <span>Attendance Rate: {{ term.attendance_rate || 0 }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="history-section">
            <h3>Cube Progress History</h3>
            <div class="cube-history">
              <div v-for="progress in cubeProgressHistory" :key="progress.id" class="progress-item">
                <div class="progress-info">
                  <span class="cube-type">{{ progress.cube_type }}</span>
                  <span class="progress-change">{{ progress.from_level }} → {{ progress.to_level }}</span>
                  <span class="progress-date">{{ formatDate(progress.changed_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="button-group">
          <button @click="showHistoryModal = false" class="cancel-btn">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useTermStore } from '../stores/term'
import { useStudentStore } from '../stores/student'

export default {
  name: 'StudentTermManager',
  
  setup() {
    const termStore = useTermStore()
    const studentStore = useStudentStore()
    
    const showAddTermModal = ref(false)
    const showImportModal = ref(false)
    const showHistoryModal = ref(false)
    const selectedTermId = ref('')
    const statusFilter = ref('')
    const searchQuery = ref('')
    const importFromTerm = ref('')
    const csvFile = ref(null)
    const importPreview = ref([])
    const selectedStudent = ref(null)
    const studentTermHistory = ref([])
    const cubeProgressHistory = ref([])
    
    const termForm = ref({
      name: '',
      start_date: '',
      end_date: '',
      is_active: false
    })
    
    const terms = computed(() => termStore.terms)
    const activeTerm = computed(() => termStore.activeTerm)
    const selectedTerm = computed(() => terms.value.find(t => t.id === selectedTermId.value))
    const termStudents = computed(() => studentStore.students)
    
    const activeStudentsCount = computed(() => {
      return termStudents.value.filter(s => s.term_status === 'active').length
    })
    
    const totalStudentsCount = computed(() => {
      return termStudents.value.length
    })
    
    const filteredStudents = computed(() => {
      let filtered = termStudents.value
      
      if (statusFilter.value) {
        filtered = filtered.filter(s => s.term_status === statusFilter.value)
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(query) ||
          s.class?.name.toLowerCase().includes(query)
        )
      }
      
      return filtered
    })
    
    onMounted(async () => {
      await termStore.fetchTerms()
      if (activeTerm.value) {
        selectedTermId.value = activeTerm.value.id
        await loadTermData()
      }
    })
    
    const loadTermData = async () => {
      if (selectedTermId.value) {
        await studentStore.fetchStudentsByTerm(selectedTermId.value)
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString()
    }
    
    const getCubeProgress = (student, cubeType) => {
      const progress = student.cube_progress?.find(p => p.cube_type === cubeType)
      return progress ? progress.current_level.replace(`${cubeType}_`, '') : 'Not Started'
    }
    
    const addTerm = async () => {
      try {
        await termStore.createTerm(termForm.value)
        showAddTermModal.value = false
        termForm.value = {
          name: '',
          start_date: '',
          end_date: '',
          is_active: false
        }
      } catch (error) {
        alert('Error adding term: ' + error.message)
      }
    }
    
    const updateStudentStatus = async (studentId, newStatus) => {
      try {
        await studentStore.updateStudentTermStatus(studentId, newStatus)
      } catch (error) {
        alert('Error updating student status: ' + error.message)
      }
    }
    
    const importFromPreviousTerm = async () => {
      try {
        const students = await termStore.getStudentsFromTerm(importFromTerm.value)
        importPreview.value = students.map(s => ({
          ...s,
          action: 'import',
          term_status: 'active'
        }))
      } catch (error) {
        alert('Error loading students from previous term: ' + error.message)
      }
    }
    
    const handleFileUpload = (event) => {
      csvFile.value = event.target.files[0]
    }
    
    const importFromCSV = async () => {
      if (!csvFile.value) return
      
      try {
        const text = await csvFile.value.text()
        const lines = text.split('\n')
        const headers = lines[0].split(',')
        
        const students = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',')
          if (values.length >= 2) {
            students.push({
              name: values[0].trim(),
              class_name: values[1].trim(),
              term_status: values[2]?.trim() || 'active',
              action: 'import'
            })
          }
        }
        
        importPreview.value = students
      } catch (error) {
        alert('Error reading CSV file: ' + error.message)
      }
    }
    
    const confirmImport = async () => {
      try {
        const studentsToImport = importPreview.value.filter(s => s.action === 'import')
        await termStore.importStudents(selectedTermId.value, studentsToImport)
        importPreview.value = []
        showImportModal.value = false
        await loadTermData()
        alert(`Successfully imported ${studentsToImport.length} students`)
      } catch (error) {
        alert('Error importing students: ' + error.message)
      }
    }
    
    const moveToTerm = async (student) => {
      // Implementation for moving student to different term
      console.log('Move student to term:', student)
    }
    
    const viewHistory = async (student) => {
      selectedStudent.value = student
      try {
        studentTermHistory.value = await termStore.getStudentTermHistory(student.id)
        cubeProgressHistory.value = await termStore.getStudentCubeHistory(student.id)
        showHistoryModal.value = true
      } catch (error) {
        alert('Error loading student history: ' + error.message)
      }
    }
    
    const archiveStudent = async (student) => {
      if (confirm(`Are you sure you want to archive ${student.name}? This will change their status to inactive.`)) {
        try {
          await updateStudentStatus(student.id, 'inactive')
        } catch (error) {
          alert('Error archiving student: ' + error.message)
        }
      }
    }
    
    return {
      showAddTermModal,
      showImportModal,
      showHistoryModal,
      selectedTermId,
      statusFilter,
      searchQuery,
      importFromTerm,
      csvFile,
      importPreview,
      selectedStudent,
      studentTermHistory,
      cubeProgressHistory,
      termForm,
      terms,
      activeTerm,
      selectedTerm,
      activeStudentsCount,
      totalStudentsCount,
      filteredStudents,
      loadTermData,
      formatDate,
      getCubeProgress,
      addTerm,
      updateStudentStatus,
      importFromPreviousTerm,
      handleFileUpload,
      importFromCSV,
      confirmImport,
      moveToTerm,
      viewHistory,
      archiveStudent
    }
  }
}
</script>

<style scoped>
.student-term-manager {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.term-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.term-header h1 {
  color: #2d3748;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.add-term-btn, .import-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.add-term-btn:hover, .import-btn:hover {
  background: #3182ce;
}

.active-term-info {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.term-details h2 {
  margin: 0 0 5px 0;
  color: #22543d;
}

.term-details p {
  margin: 0;
  color: #4a5568;
}

.active-badge {
  background: #38a169;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
  display: inline-block;
}

.term-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #22543d;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #4a5568;
}

.term-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
}

.term-selector label {
  font-weight: 500;
  color: #4a5568;
}

.term-selector select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  min-width: 200px;
}

.students-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.table-header h3 {
  margin: 0;
  color: #2d3748;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.status-filter, .search-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table th {
  background: #f8fafc;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
}

.students-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

.student-row:hover {
  background: #f7fafc;
}

.student-name a {
  color: #2d3748;
  text-decoration: none;
  font-weight: 500;
}

.student-name a:hover {
  color: #4299e1;
}

.status-select {
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
}

.cube-progress-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-item {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.cube-type {
  font-weight: 500;
  color: #4a5568;
}

.progress-level {
  color: #22543d;
}

.student-actions {
  display: flex;
  gap: 4px;
}

.move-btn, .history-btn, .archive-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.move-btn:hover, .history-btn:hover, .archive-btn:hover {
  background: #f7fafc;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.history-modal {
  max-width: 800px;
}

.modal-content h2 {
  margin: 0 0 20px 0;
  color: #2d3748;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #4a5568;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.save-btn, .confirm-btn {
  background: #48bb78;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.import-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.import-option {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.import-option h3 {
  margin: 0 0 12px 0;
  color: #2d3748;
}

.term-select, .file-input {
  margin-bottom: 10px;
}

.import-btn {
  background: #4299e1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.import-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.preview-table {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 16px;
}

.preview-table table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th, .preview-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.preview-table th {
  background: #f8fafc;
  font-weight: 600;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.history-section h3 {
  margin: 0 0 16px 0;
  color: #2d3748;
}

.term-history, .cube-history {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.term-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.term-info h4 {
  margin: 0;
  color: #2d3748;
}

.term-info p {
  margin: 4px 0;
  color: #4a5568;
  font-size: 14px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.inactive {
  background: #e2e8f0;
  color: #4a5568;
}

.status-badge.graduated {
  background: #bee3f8;
  color: #1a365d;
}

.progress-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #4a5568;
}

.progress-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f7fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.progress-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.progress-change {
  font-weight: 500;
  color: #22543d;
}

.progress-date {
  color: #718096;
  font-size: 12px;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .term-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .active-term-info {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .term-stats {
    justify-content: center;
  }
  
  .table-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .students-table {
    font-size: 14px;
  }
  
  .students-table th, .students-table td {
    padding: 8px;
  }
  
  .modal-content {
    margin: 20px;
    max-width: none;
  }
  
  .import-options {
    flex-direction: column;
  }
  
  .button-group {
    flex-direction: column;
  }
}
</style>