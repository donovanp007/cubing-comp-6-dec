<template>
  <div class="sales-flow-manager">
    <div class="sales-header">
      <h1>Sales Flow Manager</h1>
      <div class="header-actions">
        <button @click="showAddStageModal = true" class="add-stage-btn">
          <span class="icon">+</span> Add Stage
        </button>
        <button @click="showStatsModal = true" class="stats-btn">
          <span class="icon">📊</span> Statistics
        </button>
      </div>
    </div>

    <!-- Sales Pipeline -->
    <div class="sales-pipeline">
      <div class="pipeline-header">
        <h2>Sales Pipeline</h2>
        <div class="currency-info">
          <span class="currency-label">Currency: South African Rand (ZAR)</span>
        </div>
      </div>

      <div class="pipeline-stages">
        <div 
          v-for="stage in salesStages" 
          :key="stage.id" 
          class="stage-column"
          :class="{ 'inactive': !stage.is_active }"
        >
          <div class="stage-header">
            <div class="stage-info">
              <h3>{{ stage.name }}</h3>
              <p class="stage-description">{{ stage.description }}</p>
            </div>
            <div class="stage-metrics">
              <span class="student-count">{{ getStudentCount(stage.id) }}</span>
              <span class="stage-value">R{{ formatCurrency(getStageValue(stage.id)) }}</span>
            </div>
            <div class="stage-actions">
              <button @click="editStage(stage)" class="edit-btn" title="Edit Stage">✏️</button>
              <button @click="toggleStageActive(stage)" class="toggle-btn" :title="stage.is_active ? 'Deactivate' : 'Activate'">
                {{ stage.is_active ? '🔴' : '🟢' }}
              </button>
            </div>
          </div>

          <div class="stage-students">
            <div 
              v-for="student in getStudentsInStage(stage.id)" 
              :key="student.id"
              class="student-card"
              @click="openStudentDetails(student)"
            >
              <div class="student-info">
                <h4>{{ student.name }}</h4>
                <p class="student-class">{{ student.class?.name }}</p>
                <p class="student-value">R{{ formatCurrency(student.amount_zar || 0) }}</p>
              </div>
              <div class="student-actions">
                <select 
                  @change="moveStudent(student.id, $event.target.value)"
                  class="move-select"
                  :value="stage.id"
                >
                  <option value="">Move to...</option>
                  <option 
                    v-for="targetStage in salesStages" 
                    :key="targetStage.id"
                    :value="targetStage.id"
                    :disabled="targetStage.id === stage.id"
                  >
                    {{ targetStage.name }}
                  </option>
                </select>
                <button @click="removeFromPipeline(student.id)" class="remove-btn" title="Remove from pipeline">🗑️</button>
              </div>
            </div>

            <!-- Add Student to Stage -->
            <div class="add-student-to-stage">
              <select 
                @change="addStudentToStage(stage.id, $event.target.value); $event.target.value = ''"
                class="add-student-select"
              >
                <option value="">Add student...</option>
                <option 
                  v-for="student in availableStudents" 
                  :key="student.id"
                  :value="student.id"
                >
                  {{ student.name }} ({{ student.class?.name }})
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Stage Modal -->
    <div v-if="showAddStageModal || editingStage" class="modal">
      <div class="modal-content">
        <h2>{{ editingStage ? 'Edit Stage' : 'Add New Stage' }}</h2>
        <form @submit.prevent="saveStage">
          <div class="form-group">
            <label>Stage Name:</label>
            <input v-model="stageForm.name" required>
          </div>
          <div class="form-group">
            <label>Description:</label>
            <textarea v-model="stageForm.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Position:</label>
            <input v-model.number="stageForm.order_position" type="number" min="1" required>
          </div>
          <div class="form-group">
            <label>
              <input v-model="stageForm.is_active" type="checkbox">
              Active Stage
            </label>
          </div>
          <div class="button-group">
            <button type="submit" class="save-btn">{{ editingStage ? 'Update' : 'Add' }} Stage</button>
            <button type="button" @click="cancelStageEdit" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Student Details Modal -->
    <div v-if="selectedStudent" class="modal">
      <div class="modal-content">
        <h2>{{ selectedStudent.name }} - Sales Details</h2>
        <form @submit.prevent="updateStudentSalesInfo">
          <div class="form-group">
            <label>Amount (ZAR):</label>
            <input 
              v-model.number="studentSalesForm.amount_zar" 
              type="number" 
              step="0.01" 
              min="0"
              placeholder="0.00"
            >
          </div>
          <div class="form-group">
            <label>Notes:</label>
            <textarea v-model="studentSalesForm.notes" rows="4" placeholder="Add notes about this student's sales progress..."></textarea>
          </div>
          <div class="form-group">
            <label>Current Stage:</label>
            <select v-model="studentSalesForm.stage_id" required>
              <option 
                v-for="stage in salesStages" 
                :key="stage.id"
                :value="stage.id"
              >
                {{ stage.name }}
              </option>
            </select>
          </div>
          <div class="button-group">
            <button type="submit" class="save-btn">Update Details</button>
            <button type="button" @click="selectedStudent = null" class="cancel-btn">Close</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Statistics Modal -->
    <div v-if="showStatsModal" class="modal">
      <div class="modal-content stats-modal">
        <h2>Sales Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Pipeline Value</h3>
            <p class="stat-value">R{{ formatCurrency(totalPipelineValue) }}</p>
          </div>
          <div class="stat-card">
            <h3>Active Students</h3>
            <p class="stat-value">{{ totalActiveStudents }}</p>
          </div>
          <div class="stat-card">
            <h3>Conversion Rate</h3>
            <p class="stat-value">{{ conversionRate }}%</p>
          </div>
          <div class="stat-card">
            <h3>Average Deal Size</h3>
            <p class="stat-value">R{{ formatCurrency(averageDealSize) }}</p>
          </div>
        </div>
        <div class="stats-charts">
          <div class="chart-section">
            <h3>Students per Stage</h3>
            <div class="bar-chart">
              <div v-for="stage in salesStages" :key="stage.id" class="bar-item">
                <div class="bar-label">{{ stage.name }}</div>
                <div class="bar">
                  <div 
                    class="bar-fill" 
                    :style="{ width: (getStudentCount(stage.id) / totalActiveStudents * 100) + '%' }"
                  ></div>
                  <span class="bar-value">{{ getStudentCount(stage.id) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="button-group">
          <button @click="showStatsModal = false" class="cancel-btn">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useSalesStore } from '../stores/sales'
import { useStudentStore } from '../stores/student'

export default {
  name: 'SalesFlowManager',
  
  setup() {
    const salesStore = useSalesStore()
    const studentStore = useStudentStore()
    
    const showAddStageModal = ref(false)
    const showStatsModal = ref(false)
    const editingStage = ref(null)
    const selectedStudent = ref(null)
    
    const stageForm = ref({
      name: '',
      description: '',
      order_position: 1,
      is_active: true
    })
    
    const studentSalesForm = ref({
      amount_zar: 0,
      notes: '',
      stage_id: ''
    })
    
    const salesStages = computed(() => salesStore.salesStages)
    const studentSalesData = computed(() => salesStore.studentSalesData)
    const allStudents = computed(() => studentStore.students)
    
    const availableStudents = computed(() => {
      const studentsInPipeline = Object.keys(studentSalesData.value)
      return allStudents.value.filter(student => 
        !studentsInPipeline.includes(student.id) && 
        student.term_status === 'active'
      )
    })
    
    const totalPipelineValue = computed(() => {
      return Object.values(studentSalesData.value).reduce((total, student) => {
        return total + (student.amount_zar || 0)
      }, 0)
    })
    
    const totalActiveStudents = computed(() => {
      return Object.keys(studentSalesData.value).length
    })
    
    const conversionRate = computed(() => {
      const enrolled = getStudentCount(salesStages.value.find(s => s.name === 'Enrolled')?.id)
      return totalActiveStudents.value > 0 ? Math.round((enrolled / totalActiveStudents.value) * 100) : 0
    })
    
    const averageDealSize = computed(() => {
      return totalActiveStudents.value > 0 ? totalPipelineValue.value / totalActiveStudents.value : 0
    })
    
    onMounted(async () => {
      await salesStore.fetchSalesStages()
      await salesStore.fetchStudentSalesData()
      await studentStore.fetchAllStudents()
    })
    
    const getStudentCount = (stageId) => {
      return Object.values(studentSalesData.value).filter(student => student.stage_id === stageId).length
    }
    
    const getStageValue = (stageId) => {
      return Object.values(studentSalesData.value)
        .filter(student => student.stage_id === stageId)
        .reduce((total, student) => total + (student.amount_zar || 0), 0)
    }
    
    const getStudentsInStage = (stageId) => {
      return Object.values(studentSalesData.value)
        .filter(student => student.stage_id === stageId)
        .map(salesData => {
          const student = allStudents.value.find(s => s.id === salesData.student_id)
          return {
            ...student,
            ...salesData
          }
        })
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    }
    
    const editStage = (stage) => {
      editingStage.value = stage
      stageForm.value = { ...stage }
      showAddStageModal.value = true
    }
    
    const saveStage = async () => {
      try {
        if (editingStage.value) {
          await salesStore.updateSalesStage(editingStage.value.id, stageForm.value)
        } else {
          await salesStore.createSalesStage(stageForm.value)
        }
        cancelStageEdit()
      } catch (error) {
        alert('Error saving stage: ' + error.message)
      }
    }
    
    const cancelStageEdit = () => {
      showAddStageModal.value = false
      editingStage.value = null
      stageForm.value = {
        name: '',
        description: '',
        order_position: 1,
        is_active: true
      }
    }
    
    const toggleStageActive = async (stage) => {
      try {
        await salesStore.updateSalesStage(stage.id, { is_active: !stage.is_active })
      } catch (error) {
        alert('Error updating stage: ' + error.message)
      }
    }
    
    const addStudentToStage = async (stageId, studentId) => {
      try {
        await salesStore.addStudentToSalesStage(studentId, stageId)
      } catch (error) {
        alert('Error adding student to stage: ' + error.message)
      }
    }
    
    const moveStudent = async (studentId, newStageId) => {
      if (!newStageId) return
      
      try {
        await salesStore.moveStudentToStage(studentId, newStageId)
      } catch (error) {
        alert('Error moving student: ' + error.message)
      }
    }
    
    const removeFromPipeline = async (studentId) => {
      if (confirm('Are you sure you want to remove this student from the sales pipeline?')) {
        try {
          await salesStore.removeStudentFromPipeline(studentId)
        } catch (error) {
          alert('Error removing student: ' + error.message)
        }
      }
    }
    
    const openStudentDetails = (student) => {
      selectedStudent.value = student
      studentSalesForm.value = {
        amount_zar: student.amount_zar || 0,
        notes: student.notes || '',
        stage_id: student.stage_id
      }
    }
    
    const updateStudentSalesInfo = async () => {
      try {
        await salesStore.updateStudentSalesInfo(selectedStudent.value.student_id, studentSalesForm.value)
        selectedStudent.value = null
      } catch (error) {
        alert('Error updating student info: ' + error.message)
      }
    }
    
    return {
      showAddStageModal,
      showStatsModal,
      editingStage,
      selectedStudent,
      stageForm,
      studentSalesForm,
      salesStages,
      availableStudents,
      totalPipelineValue,
      totalActiveStudents,
      conversionRate,
      averageDealSize,
      getStudentCount,
      getStageValue,
      getStudentsInStage,
      formatCurrency,
      editStage,
      saveStage,
      cancelStageEdit,
      toggleStageActive,
      addStudentToStage,
      moveStudent,
      removeFromPipeline,
      openStudentDetails,
      updateStudentSalesInfo
    }
  }
}
</script>

<style scoped>
.sales-flow-manager {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.sales-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.sales-header h1 {
  color: #2d3748;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.add-stage-btn, .stats-btn {
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

.add-stage-btn:hover, .stats-btn:hover {
  background: #3182ce;
}

.pipeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pipeline-header h2 {
  margin: 0;
  color: #2d3748;
}

.currency-info {
  background: #f0fff4;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #9ae6b4;
}

.currency-label {
  font-weight: 500;
  color: #22543d;
}

.pipeline-stages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stage-column {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.stage-column.inactive {
  opacity: 0.6;
  background: #f7fafc;
}

.stage-header {
  background: #f8fafc;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.stage-info h3 {
  margin: 0 0 5px 0;
  color: #2d3748;
  font-size: 16px;
}

.stage-description {
  margin: 0;
  color: #718096;
  font-size: 12px;
}

.stage-metrics {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}

.student-count {
  background: #4299e1;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stage-value {
  background: #48bb78;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stage-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-btn, .toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.edit-btn:hover, .toggle-btn:hover {
  background: #edf2f7;
}

.stage-students {
  padding: 16px;
  min-height: 200px;
}

.student-card {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.student-card:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.student-info h4 {
  margin: 0 0 4px 0;
  color: #2d3748;
  font-size: 14px;
}

.student-class {
  margin: 0;
  color: #718096;
  font-size: 12px;
}

.student-value {
  margin: 4px 0 0 0;
  color: #22543d;
  font-weight: 500;
  font-size: 12px;
}

.student-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.move-select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: #fed7d7;
}

.add-student-to-stage {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.add-student-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
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
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.stats-modal {
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

.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  outline: none;
  border-color: #4299e1;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.save-btn {
  background: #48bb78;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #38a169;
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #cbd5e0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 8px 0;
  color: #4a5568;
  font-size: 14px;
}

.stat-value {
  margin: 0;
  color: #2d3748;
  font-size: 24px;
  font-weight: 700;
}

.bar-chart {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.bar-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.bar-label {
  width: 120px;
  font-size: 12px;
  color: #4a5568;
}

.bar {
  flex: 1;
  height: 20px;
  background: #e2e8f0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4299e1 0%, #3182ce 100%);
  transition: width 0.3s ease;
}

.bar-value {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #4a5568;
  font-weight: 500;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .sales-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .pipeline-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .pipeline-stages {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modal-content {
    margin: 20px;
    max-width: none;
  }
  
  .button-group {
    flex-direction: column;
  }
}
</style>