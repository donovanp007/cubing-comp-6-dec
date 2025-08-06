<template>
  <div class="school-details" v-if="school">
    <!-- iOS-inspired header -->
    <div class="header-section">
      <div class="gradient-header">
        <div class="header-content">
          <div class="school-info">
            <h1 class="school-title">{{ school.name }}</h1>
            <p class="school-subtitle" v-if="school.address">{{ school.address }}</p>
          </div>
          <div class="header-actions">
            <button class="action-button" @click="showAddClassForm = true">
              <div class="action-icon">+</div>
              <span>Add Class</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats overview section -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🎓</div>
          <div class="stat-content">
            <div class="stat-value">{{ classes.length }}</div>
            <div class="stat-label">Total Classes</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalStudents }}</div>
            <div class="stat-label">Total Students</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <div class="stat-value">{{ uniqueGrades }}</div>
            <div class="stat-label">Grade Levels</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="classStore.loading" class="loading-section">
      <div class="loading-card">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading classes...</div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="classStore.error" class="error-section">
      <div class="error-card">
        <div class="error-icon">⚠️</div>
        <div class="error-message">{{ classStore.error }}</div>
      </div>
    </div>

    <!-- Classes Grid -->
    <div v-else class="content-section">
      <div class="section-header">
        <h2 class="section-title">Classes</h2>
        <div class="section-subtitle">{{ classes.length }} class{{ classes.length !== 1 ? 'es' : '' }} total</div>
      </div>
      
      <div class="classes-grid">
        <div v-for="class_ in classes" :key="class_.id" class="class-card">
          <div class="card-content">
            <div class="class-header">
              <div class="class-icon">📖</div>
              <div class="class-info">
                <h3 class="class-name">{{ class_.name }}</h3>
                <div class="class-meta">
                  <span v-if="class_.grade" class="grade-badge">Grade {{ class_.grade }}</span>
                  <span class="student-count">{{ getStudentCount(class_.id) }} students</span>
                </div>
              </div>
            </div>
            
            <div class="class-actions">
              <router-link 
                :to="{ name: 'ClassDetails', params: { id: class_.id }}" 
                class="view-button"
              >
                <span>View Class</span>
                <div class="button-arrow">→</div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- iOS-style Modal -->
    <div v-if="showAddClassForm" class="modal-overlay" @click="closeAddClassForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Add New Class</h2>
          <button class="close-button" @click="closeAddClassForm">×</button>
        </div>
        
        <form @submit.prevent="addClass" class="modal-form">
          <div class="form-section">
            <div class="form-group">
              <label class="form-label">Class Name</label>
              <input 
                v-model="newClass.name" 
                type="text"
                class="form-input"
                placeholder="Enter class name"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Grade (Optional)</label>
              <select v-model="newClass.grade" class="form-select">
                <option value="">Select Grade</option>
                <option v-for="grade in classStore.availableGrades" :key="grade" :value="grade">
                  Grade {{ grade }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="modal-actions">
            <button 
              type="button" 
              @click="closeAddClassForm" 
              class="cancel-btn"
              :disabled="classStore.loading"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="submit-btn"
              :disabled="classStore.loading || !newClass.name"
            >
              <span v-if="classStore.loading">⏳ Adding...</span>
              <span v-else>Add Class</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  <div v-else class="loading-section">
    <div class="loading-card">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading school details...</div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useClassStore } from '../stores/class'
import { useSchoolStore } from '../stores/school'
import { useStudentStore } from '../stores/student'

export default {
  name: 'SchoolDetails',
  
  setup() {
    const route = useRoute()
    const classStore = useClassStore()
    const schoolStore = useSchoolStore()
    const studentStore = useStudentStore()
    
    const showAddClassForm = ref(false)
    const newClass = ref({
      name: '',
      grade: ''
    })

    // Get school ID from route params
    const schoolId = route.params.id

    // Get school data
    const school = computed(() => 
      schoolStore.schools.find(s => s.id === schoolId)
    )

    // Get classes for this school
    const classes = computed(() => 
      classStore.classes.filter(c => c.school_id === schoolId)
    )

    // Computed properties for stats
    const totalStudents = computed(() => {
      return classes.value.reduce((total, classItem) => {
        return total + getStudentCount(classItem.id)
      }, 0)
    })

    const uniqueGrades = computed(() => {
      const grades = classes.value
        .map(classItem => classItem.grade)
        .filter(grade => grade !== null && grade !== undefined && grade !== '')
      return new Set(grades).size
    })

    // Load data on mount
    onMounted(async () => {
      try {
        console.log('SchoolDetails mounting, schoolId:', schoolId)
        
        // Validate schoolId
        if (!schoolId) {
          throw new Error('No school ID provided')
        }
        
        if (!schoolStore.hasSchools) {
          console.log('Fetching schools...')
          await schoolStore.fetchSchools()
        }
        
        console.log('Fetching classes for school:', schoolId)
        await classStore.fetchClasses(schoolId)
        
        console.log('SchoolDetails mounted successfully')
      } catch (error) {
        console.error('Error in SchoolDetails onMounted:', error)
        alert('Error loading school details. Please check your internet connection and try again. Error: ' + error.message)
      }
    })

    // Methods
    const addClass = async () => {
      try {
        await classStore.addClass({
          schoolId: schoolId, // Pass the schoolId from the route
          name: newClass.value.name,
          grade: newClass.value.grade || null
        })
        
        // Reset form and close modal
        closeAddClassForm()
        
        // No need to refresh classes - the store automatically updates the state
      } catch (error) {
        console.error('Error adding class:', error)
      }
    }

    const closeAddClassForm = () => {
      showAddClassForm.value = false
      newClass.value = {
        name: '',
        grade: ''
      }
    }

    const getStudentCount = (classId) => {
      try {
        if (!studentStore.students || !Array.isArray(studentStore.students)) {
          return 0
        }
        return studentStore.students.filter(s => s.class_id === classId).length
      } catch (error) {
        console.warn('Error getting student count:', error)
        return 0
      }
    }

    return {
      school,
      classes,
      totalStudents,
      uniqueGrades,
      showAddClassForm,
      newClass,
      classStore,
      addClass,
      closeAddClassForm,
      getStudentCount
    }
  }
}
</script>

<style scoped>
.school-details {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    var(--ios-background-primary) 0%, 
    var(--ios-background-secondary) 100%);
  font-family: var(--ios-font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Header Section */
.header-section {
  padding: 0;
}

.gradient-header {
  background: linear-gradient(135deg, 
    var(--ios-primary) 0%, 
    var(--ios-secondary) 100%);
  padding: 3rem 2rem 4rem;
  position: relative;
  overflow: hidden;
}

.gradient-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%);
  pointer-events: none;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}

.school-info {
  flex: 1;
}

.school-title {
  font-family: var(--ios-font-display);
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.school-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 1.5rem;
}

.action-button span {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Stats Section */
.stats-section {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  transform: translateY(-2rem);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--ios-text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--ios-text-secondary);
  margin-top: 0.25rem;
  font-weight: 500;
}

/* Loading Section */
.loading-section {
  padding: 4rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-card {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--ios-border-light);
  border-top: 4px solid var(--ios-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-text {
  font-size: 1.1rem;
  color: var(--ios-text-secondary);
  font-weight: 500;
}

/* Error Section */
.error-section {
  padding: 4rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-card {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-destructive-light);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.1rem;
  color: var(--ios-destructive);
  font-weight: 500;
}

/* Content Section */
.content-section {
  padding: 0 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 2rem;
}

.section-title {
  font-family: var(--ios-font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0 0 0.5rem 0;
}

.section-subtitle {
  font-size: 1rem;
  color: var(--ios-text-secondary);
  margin: 0;
}

/* Classes Grid */
.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.class-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
  overflow: hidden;
  transition: all 0.3s ease;
}

.class-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-content {
  padding: 1.5rem;
}

.class-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.class-icon {
  font-size: 1.5rem;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.class-info {
  flex: 1;
}

.class-name {
  font-family: var(--ios-font-display);
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.class-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.grade-badge {
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.student-count {
  font-size: 0.9rem;
  color: var(--ios-text-secondary);
  font-weight: 500;
}

.class-actions {
  padding-top: 0.5rem;
}

.view-button {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--ios-background-elevated);
  border: 1px solid var(--ios-border-light);
  border-radius: 12px;
  color: var(--ios-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-button:hover {
  background: var(--ios-primary);
  color: white;
  transform: translateX(4px);
  text-decoration: none;
}

.button-arrow {
  opacity: 0.7;
  transition: all 0.3s ease;
}

.view-button:hover .button-arrow {
  opacity: 1;
  transform: translateX(4px);
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
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
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
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid var(--ios-border-light);
}

.modal-title {
  font-family: var(--ios-font-display);
  font-size: 1.5rem;
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
  padding: 1rem 2rem 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: var(--ios-text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--ios-border-medium);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--ios-background-elevated);
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-family: var(--ios-font-family);
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--ios-primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(var(--ios-primary-rgb), 0.1);
}

.form-input::placeholder {
  color: var(--ios-text-tertiary);
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.cancel-btn, .submit-btn {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
  font-family: var(--ios-font-family);
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
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--ios-primary-rgb), 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .gradient-header {
    padding: 2rem 1rem 3rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .school-title {
    font-size: 2.5rem;
  }
  
  .stats-section,
  .content-section {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .classes-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
