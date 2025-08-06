<template>
  <div class="schools">
    <!-- Compact Header -->
    <div class="header-section">
      <div class="compact-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">🏫 Schools</h1>
            <span class="school-count">{{ schools.length }} school{{ schools.length !== 1 ? 's' : '' }}</span>
          </div>
          <div class="header-actions">
            <button class="action-btn" @click="exportToCSV">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export
            </button>
            <button class="action-btn primary" @click="showAddSchoolForm = true">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add School
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Compact Schools List -->
    <div class="content-section">
      <div class="schools-container">
        <div class="schools-list">
          <div v-for="school in sortedSchools" :key="school.id" class="school-row">
            <router-link :to="{ name: 'SchoolDetails', params: { id: school.id }}" class="school-link">
              <div class="school-icon">🏫</div>
              <div class="school-info">
                <div class="school-name">{{ school.name }}</div>
                <div class="school-address" v-if="school.address">{{ school.address }}</div>
              </div>
              <div class="school-stats">
                <div class="stat-chip">
                  <span class="stat-icon">📚</span>
                  <span class="stat-value">{{ getSchoolClassCount(school.id) }}</span>
                  <span class="stat-label">classes</span>
                </div>
              </div>
            </router-link>
            <div class="school-actions">
              <button class="edit-btn" @click.stop="openEditSchool(school)" title="Edit school">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </button>
              <div class="school-arrow">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div class="add-school-section">
          <button class="add-school-btn" @click="showAddSchoolForm = true">
            <div class="add-icon">+</div>
            <div class="add-text">
              <span class="add-title">Add New School</span>
              <span class="add-subtitle">Create a new institution</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- iOS-style Modal -->
    <div v-if="showAddSchoolForm" class="modal-overlay" @click="showAddSchoolForm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Add New School</h2>
          <button class="close-button" @click="showAddSchoolForm = false">×</button>
        </div>
        
        <form @submit.prevent="addSchool" class="modal-form">
          <div class="form-section">
            <div class="form-group">
              <label class="form-label">School Name</label>
              <input 
                v-model="newSchool.name" 
                type="text"
                class="form-input"
                placeholder="Enter school name"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="form-label">Address (Optional)</label>
              <input 
                v-model="newSchool.address" 
                type="text"
                class="form-input"
                placeholder="Enter school address"
              >
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="showAddSchoolForm = false" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="submit-btn">
              Add School
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit School Modal -->
    <div v-if="showEditSchoolForm" class="modal-overlay" @click="showEditSchoolForm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Edit School</h2>
          <button class="close-button" @click="showEditSchoolForm = false">×</button>
        </div>
        
        <form @submit.prevent="updateSchool" class="modal-form">
          <div class="form-section">
            <div class="form-group">
              <label class="form-label">School Name</label>
              <input 
                v-model="editingSchool.name" 
                type="text"
                class="form-input"
                placeholder="Enter school name"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="form-label">Address (Optional)</label>
              <input 
                v-model="editingSchool.address" 
                type="text"
                class="form-input"
                placeholder="Enter school address"
              >
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="showEditSchoolForm = false" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="submit-btn">
              Update School
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useSchoolStore } from '../stores/school'
import { useClassStore } from '../stores/class'
import { testConnection } from '../supabase'

export default {
  setup() {
    const schoolStore = useSchoolStore()
    const classStore = useClassStore()
    const schools = ref([])
    const showAddSchoolForm = ref(false)
    const showEditSchoolForm = ref(false)
    const newSchool = ref({
      name: '',
      address: ''
    })
    const editingSchool = ref({
      id: '',
      name: '',
      address: ''
    })

    // Computed properties
    const sortedSchools = computed(() => {
      return [...schools.value].sort((a, b) => a.name.localeCompare(b.name))
    })

    const getSchoolClassCount = (schoolId) => {
      return classStore.classes.filter(cls => cls.schoolId === schoolId).length
    }

    // Fetch schools when component mounts
    onMounted(async () => {
      try {
        // Test connection first
        const isConnected = await testConnection()
        if (!isConnected) {
          throw new Error('Could not connect to database')
        }

        await schoolStore.fetchSchools()
        schools.value = schoolStore.schools
        
        // Load classes for each school to show counts
        for (const school of schools.value) {
          try {
            await classStore.fetchClasses(school.id)
          } catch (error) {
            console.warn(`Could not fetch classes for school ${school.id}:`, error)
          }
        }
      } catch (error) {
        console.error('Error in SchoolList setup:', error)
        alert('Could not connect to the database. Please check your connection and try again.')
      }
    })

    const addSchool = async () => {
      try {
        console.log('Adding school:', newSchool.value)
        await schoolStore.addSchool({
          name: newSchool.value.name,
          address: newSchool.value.address
        })
        showAddSchoolForm.value = false
        newSchool.value = { name: '', address: '' }
        // Refresh the schools list
        schools.value = schoolStore.schools
      } catch (error) {
        console.error('Error adding school:', error)
        alert('Failed to add school. Please try again.')
      }
    }

    const openEditSchool = (school) => {
      editingSchool.value = {
        id: school.id,
        name: school.name,
        address: school.address || ''
      }
      showEditSchoolForm.value = true
    }

    const updateSchool = async () => {
      try {
        console.log('Updating school:', editingSchool.value)
        await schoolStore.updateSchool(editingSchool.value.id, {
          name: editingSchool.value.name,
          address: editingSchool.value.address
        })
        showEditSchoolForm.value = false
        editingSchool.value = { id: '', name: '', address: '' }
        // Refresh the schools list
        schools.value = schoolStore.schools
      } catch (error) {
        console.error('Error updating school:', error)
        alert('Failed to update school. Please try again.')
      }
    }

    const exportToCSV = () => {
      const csvContent = schools.value.map(school => 
        `${school.name},${school.address || ''}`
      ).join('\n')
      
      const blob = new Blob([`Name,Address\n${csvContent}`], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'schools.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    }

    return {
      schools,
      sortedSchools,
      showAddSchoolForm,
      showEditSchoolForm,
      newSchool,
      editingSchool,
      addSchool,
      openEditSchool,
      updateSchool,
      exportToCSV,
      getSchoolClassCount
    }
  }
}
</script>

<style scoped>
.schools {
  min-height: 100vh;
  background: var(--ios-background-primary);
  font-family: var(--ios-font-family);
}

/* Compact Header */
.header-section {
  background: white;
  border-bottom: 1px solid var(--ios-border-light);
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.compact-header {
  max-width: 1200px;
  margin: 0 auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0;
}

.school-count {
  font-size: 0.9rem;
  color: var(--ios-text-secondary);
  background: var(--ios-background-elevated);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--ios-border-medium);
  border-radius: 8px;
  background: white;
  color: var(--ios-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.action-btn svg {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
}

.action-btn:hover {
  background: var(--ios-background-elevated);
  border-color: var(--ios-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  color: white;
  border-color: var(--ios-primary);
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #0056D6, #6366F1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.action-btn.primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Content Section */
.content-section {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.schools-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Schools List */
.schools-list {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--ios-border-light);
  overflow: hidden;
}

.school-row {
  border-bottom: 1px solid var(--ios-border-light);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.school-row:last-child {
  border-bottom: none;
}

.school-row:hover {
  background: var(--ios-background-elevated);
}

.school-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  flex: 1;
}

.school-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
}

.edit-btn {
  background: none;
  border: none;
  color: var(--ios-text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: var(--ios-background-elevated);
  color: var(--ios-primary);
  transform: scale(1.1);
}

.edit-btn svg {
  width: 16px;
  height: 16px;
}

.school-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.school-info {
  flex: 1;
  min-width: 0;
}

.school-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.school-address {
  font-size: 0.9rem;
  color: var(--ios-text-secondary);
  margin: 0;
  line-height: 1.3;
}

.school-stats {
  margin: 0 1rem 0 0;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--ios-background-elevated);
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--ios-border-light);
  font-size: 0.8rem;
  color: var(--ios-text-secondary);
}

.stat-icon {
  font-size: 0.8rem;
}

.stat-value {
  font-weight: 600;
  color: var(--ios-primary);
}

.stat-label {
  font-weight: 400;
}

.school-arrow {
  color: var(--ios-text-tertiary);
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  transition: all 0.2s ease;
}

.school-row:hover .school-arrow {
  color: var(--ios-primary);
  transform: translateX(2px);
}

/* Add School Section */
.add-school-section {
  margin-top: 0.5rem;
}

.add-school-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  background: white;
  border: 2px dashed var(--ios-border-medium);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--ios-text-secondary);
}

.add-school-btn:hover {
  border-color: var(--ios-primary);
  background: var(--ios-background-elevated);
  color: var(--ios-primary);
}

.add-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--ios-border-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--ios-text-secondary);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.add-school-btn:hover .add-icon {
  background: var(--ios-primary);
  color: white;
  transform: scale(1.05);
}

.add-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  text-align: left;
}

.add-title {
  font-size: 1rem;
  font-weight: 600;
  color: inherit;
}

.add-subtitle {
  font-size: 0.85rem;
  opacity: 0.8;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(10px);
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(50px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--ios-border-light);
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: var(--ios-background-elevated);
  color: var(--ios-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--ios-border-light);
  color: var(--ios-text-primary);
}

.modal-form {
  padding: 1rem 1.5rem 1.5rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: var(--ios-text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--ios-border-medium);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--ios-background-elevated);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--ios-primary);
  background: white;
  box-shadow: 0 0 0 2px rgba(var(--ios-primary-rgb), 0.1);
}

.form-input::placeholder {
  color: var(--ios-text-tertiary);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.cancel-btn, .submit-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.95rem;
}

.cancel-btn {
  background: var(--ios-background-elevated);
  color: var(--ios-text-primary);
  border: 1px solid var(--ios-border-medium);
}

.cancel-btn:hover {
  background: var(--ios-border-light);
}

.submit-btn {
  background: var(--ios-primary);
  color: white;
}

.submit-btn:hover {
  background: var(--ios-primary-dark);
  transform: translateY(-1px);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .school-link {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .school-stats {
    margin: 0;
    order: -1;
    align-self: flex-start;
  }
  
  .content-section {
    padding: 0.5rem;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

/* Touch-friendly enhancements */
@media (pointer: coarse) {
  .school-link {
    min-height: 72px;
  }
  
  .action-btn, .add-school-btn {
    min-height: 44px;
  }
}
</style>
