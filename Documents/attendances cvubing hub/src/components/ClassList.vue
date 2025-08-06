<template>
  <div class="classes">
    <div class="header">
      <h1 class="page-title">Classes</h1>
      <button class="add-button" @click="showAddClassForm = true">
        <span class="button-icon">➕</span>
        Add New Class
      </button>
    </div>

    <div class="filters">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search classes..."
        class="search-input"
      >
      <select v-model="selectedSchool" class="filter-select">
        <option value="">All Schools</option>
        <option v-for="school in schools" :key="school.id" :value="school.id">
          {{ school.name }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="classStore.loading" class="loading">
      <div class="loading-spinner"></div>
      Loading classes...
    </div>

    <!-- Error State -->
    <div v-else-if="classStore.error" class="error">
      <div class="error-icon">⚠️</div>
      {{ classStore.error }}
    </div>

    <!-- Classes Grid -->
    <div v-else class="class-grid">
      <div 
        v-for="class_ in filteredClasses" 
        :key="class_.id" 
        class="class-card"
        @mouseenter="class_._hover = true"
        @mouseleave="class_._hover = false"
      >
        <div class="card-gradient"></div>
        <router-link :to="{ name: 'ClassDetails', params: { id: class_.id }}" class="class-link">
          <div class="class-content">
            <h3 class="class-name">{{ class_.name }}</h3>
            <div class="class-info">
              <p><span class="info-label">School:</span> {{ getSchoolName(class_.school_id) }}</p>
              <p v-if="class_.grade"><span class="info-label">Grade:</span> {{ class_.grade }}</p>
              <p><span class="info-label">Students:</span> {{ getStudentCount(class_.id) }}</p>
            </div>
          </div>
        </router-link>
        <div class="card-actions">
          <button class="edit-btn" @click.stop="openEditClass(class_)" title="Edit class">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Class Modal -->
    <Teleport to="body">
      <div v-if="showAddClassForm" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Add New Class</h2>
            <button class="close-button" @click="showAddClassForm = false">&times;</button>
          </div>

          <form @submit.prevent="addClass" class="add-class-form">
            <div class="form-group">
              <label>Select Grades:</label>
              <div class="grades-grid">
                <div v-for="grade in availableGrades" :key="grade" class="grade-checkbox">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      :value="grade"
                      v-model="selectedGrades"
                      @change="updateClassName"
                    >
                    <span class="custom-checkbox"></span>
                    Grade {{ grade }}
                  </label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Class Name (auto-generated):</label>
              <input 
                v-model="newClass.name" 
                class="form-input" 
                :placeholder="classNamePlaceholder"
                disabled
              >
            </div>

            <div class="form-group">
              <label>Coach (Optional):</label>
              <div class="coach-select-container">
                <select v-model="selectedCoach" class="form-select">
                  <option value="">No Coach</option>
                  <option v-for="coach in coaches" :key="coach.id" :value="coach.id">
                    {{ coach.name }}
                  </option>
                </select>
                <button type="button" class="add-coach-button" @click="showAddCoachModal">
                  <span>+</span>
                </button>
              </div>
            </div>

            <div class="button-group">
              <button 
                type="submit" 
                class="submit-button"
                :disabled="classStore.loading || selectedGrades.length === 0"
              >
                Add Class
              </button>
              <button 
                type="button" 
                @click="showAddClassForm = false" 
                class="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Class Modal -->
      <div v-if="showEditClassForm" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Edit Class</h2>
            <button class="close-button" @click="showEditClassForm = false">&times;</button>
          </div>

          <form @submit.prevent="updateClass" class="add-class-form">
            <div class="form-group">
              <label>Class Name:</label>
              <input 
                v-model="editingClass.name" 
                class="form-input" 
                placeholder="Enter class name"
                required
              >
            </div>

            <div class="form-group">
              <label>Grade (Optional):</label>
              <select v-model="editingClass.grade" class="form-select">
                <option value="">No Grade</option>
                <option v-for="grade in availableGrades" :key="grade" :value="grade">
                  Grade {{ grade }}
                </option>
              </select>
            </div>

            <div class="button-group">
              <button 
                type="submit" 
                class="submit-button"
                :disabled="classStore.loading"
              >
                Update Class
              </button>
              <button 
                type="button" 
                @click="showEditClassForm = false" 
                class="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useClassStore } from '../stores/class'
import { useSchoolStore } from '../stores/school'
import { useStudentStore } from '../stores/student'
import { useCoachStore } from '../stores/coach'
import { debounce } from 'lodash-es'

export default {
  name: 'ClassList',
  
  setup() {
    const classStore = useClassStore()
    const schoolStore = useSchoolStore()
    const studentStore = useStudentStore()
    const coachStore = useCoachStore()
    
    const searchQuery = ref('')
    const selectedSchool = ref('')
    const showAddClassForm = ref(false)
    const showEditClassForm = ref(false)
    const selectedGrades = ref([])
    const selectedCoach = ref('')
    
    const newClass = ref({
      name: ''
    })
    
    const editingClass = ref({
      id: '',
      name: '',
      grade: ''
    })

    const classNamePlaceholder = computed(() => {
      if (selectedGrades.value.length === 0) {
        return 'Select grades above'
      }
      return `Grade ${selectedGrades.value.sort((a, b) => a - b).join(' and ')}`
    })

    const debouncedSearch = debounce((query) => {
      searchQuery.value = query
    }, 300)

    const updateClassName = () => {
      newClass.value.name = classNamePlaceholder.value
    }

    const resetForm = () => {
      newClass.value = { name: '' }
      selectedGrades.value = []
      selectedCoach.value = ''
    }

    const addClass = async () => {
      if (!selectedSchool.value) {
        console.error('No school selected')
        return
      }

      try {
      try {
        await classStore.addClass({
          schoolId: selectedSchool.value,
          name: newClass.value.name,
          grade: selectedGrades.value.sort((a, b) => a - b).join(' and '),
          coachId: selectedCoach.value || null
        })
        
        console.log('Class added successfully')
        
        resetForm()
        showAddClassForm.value = false
        await classStore.fetchClasses(selectedSchool.value)
      } catch (error) {
        console.error('Error adding class:', error)
      }
    }

    const showAddCoachModal = () => {
      console.log('Show add coach modal')
    }

    const openEditClass = (classItem) => {
      editingClass.value = {
        id: classItem.id,
        name: classItem.name,
        grade: classItem.grade || ''
      }
      showEditClassForm.value = true
    }

    const updateClass = async () => {
      try {
        console.log('Updating class:', editingClass.value)
        await classStore.updateClass(editingClass.value.id, {
          name: editingClass.value.name,
          grade: editingClass.value.grade || null
        })
        
        console.log('Class updated successfully')
        showEditClassForm.value = false
        editingClass.value = { id: '', name: '', grade: '' }
        
        // Refresh classes if a school is selected
        if (selectedSchool.value) {
          await classStore.fetchClasses(selectedSchool.value)
        }
      } catch (error) {
        console.error('Error updating class:', error)
        alert('Failed to update class. Please try again.')
      }
    }

    onMounted(async () => {
      try {
        await Promise.all([
          schoolStore.fetchSchools(),
          coachStore.fetchCoaches()
        ])
      } catch (error) {
        console.error('Error fetching initial data:', error)
      }
    })

    return {
      classStore,
      searchQuery: computed({
        get: () => searchQuery.value,
        set: debouncedSearch
      }),
      selectedSchool,
      showAddClassForm,
      showEditClassForm,
      newClass,
      editingClass,
      schools: computed(() => schoolStore.schools),
      coaches: computed(() => coachStore.coaches),
      availableGrades: computed(() => classStore.availableGrades),
      selectedGrades,
      selectedCoach,
      classNamePlaceholder,
      addClass,
      openEditClass,
      updateClass,
      updateClassName,
      showAddCoachModal
    }
  }
}
</script>

<style scoped>
.classes {
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  background: linear-gradient(90deg, #3498db, #9b59b6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input,
.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  flex: 1;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.class-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  border: 1px solid rgba(0,0,0,0.05);
}

.card-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  opacity: 0;
  transition: all 0.2s ease;
}

.class-card:hover .card-actions {
  opacity: 1;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #7f8c8d;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-btn:hover {
  background: white;
  color: #3498db;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.edit-btn svg {
  width: 16px;
  height: 16px;
}

.class-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.05);
  border-color: rgba(52, 152, 219, 0.2);
}

.card-gradient {
  height: 6px;
  background: linear-gradient(90deg, #3498db, #9b59b6);
  opacity: 0.8;
}

.class-content {
  padding: 1.5rem;
}

.class-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.class-name::before {
  content: "";
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(90deg, #3498db, #9b59b6);
}

.class-info {
  color: #636e72;
  line-height: 1.6;
  font-size: 0.95rem;
}

.info-label {
  font-weight: 500;
  color: #2c3e50;
  display: inline-block;
  min-width: 70px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: #3498db;
  font-weight: 500;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(52, 152, 219, 0.2);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: #e74c3c;
  font-weight: 500;
}

.error-icon {
  font-size: 1.5rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #e74c3c;
}

.grades-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 0.5rem;
}

.grade-checkbox {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  color: #2c3e50;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #bdc3c7;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

input[type="checkbox"] {
  display: none;
}

input[type="checkbox"]:checked + .custom-checkbox {
  background: #3498db;
  border-color: #3498db;
  color: white;
}

input[type="checkbox"]:checked + .custom-checkbox::after {
  content: "✓";
  font-size: 12px;
}

.coach-select-container {
  display: flex;
  gap: 0.5rem;
}

.form-select {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  font-size: 1rem;
  color: #2c3e50;
  background: white;
  transition: all 0.3s ease;
}

.form-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.add-coach-button {
  background: linear-gradient(90deg, #2ecc71, #27ae60);
  color: white;
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.add-coach-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  font-size: 1rem;
  color: #2c3e50;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.form-input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-button,
.cancel-button {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button {
  background: linear-gradient(90deg, #3498db, #9b59b6);
  color: white;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
}

.cancel-button {
  background: #e74c3c;
  color: white;
}

.cancel-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.add-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(90deg, #2ecc71, #27ae60);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
}

.button-icon {
  font-size: 1.2rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filters {
    flex-direction: column;
  }

  .class-grid {
    grid-template-columns: 1fr;
  }

  .grades-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
