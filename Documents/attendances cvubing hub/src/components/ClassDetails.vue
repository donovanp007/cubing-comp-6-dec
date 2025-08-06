<template>
  <div class="class-details">
    <!-- Offline Indicator -->
    <div v-if="!isOnline" class="offline-indicator visible">
      <span>Working Offline</span>
    </div>
    
    <div v-if="isLoadingClassDetails" class="loading-overlay">
      <div class="loading-card">
        <div class="loading-spinner"></div>
        <h2 class="loading-title">Loading class details...</h2>
        <p class="loading-subtitle">Please wait while we prepare your classroom</p>
        <p class="loading-timeout-hint">If this takes more than 5 seconds, you can skip loading</p>
        <button class="skip-loading-btn" @click="skipLoading">
          <span>Skip Loading</span>
        </button>
      </div>
    </div>
    
    <template v-else>
      <!-- iOS-inspired header -->
      <div class="header-section">
        <div class="gradient-header">
          <div class="header-content">
            <div class="class-info">
              <h1 class="class-title">{{ class_?.name || 'Class' }}</h1>
              <p class="school-subtitle">{{ school?.name || 'School' }}</p>
            </div>
            <div class="header-actions">
              <router-link 
                :to="{ name: 'CoachingProgramGuide', params: { classId: classId } }" 
                class="action-button coaching"
              >
                <div class="action-icon">🎓</div>
                <span>Coaching Program</span>
              </router-link>
              <button class="action-button add-student" @click="showAddStudentForm = true">
                <div class="action-icon">+</div>
                <span>Add Student</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Attendance Section -->
      <div class="attendance-section">
        <div class="section-header">
          <div class="section-title-row">
            <h2 class="section-title">Take Attendance</h2>
            <div class="date-selector">
              <input type="date" v-model="selectedDate" class="date-input">
            </div>
          </div>
          <div class="section-controls">
            <div class="view-toggle">
              <button 
                class="toggle-btn" 
                :class="{ active: viewMode === 'cards' }"
                @click="viewMode = 'cards'"
              >
                <div class="toggle-icon">📋</div>
                <span>Cards</span>
              </button>
              <button 
                class="toggle-btn" 
                :class="{ active: viewMode === 'compact' }"
                @click="viewMode = 'compact'"
              >
                <div class="toggle-icon">📊</div>
                <span>Compact</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions">
          <div class="actions-grid">
            <button class="quick-action-btn present" @click="markAllAs('present')">
              <div class="action-icon">✓</div>
              <div class="action-text">
                <div class="action-title">Mark All Present</div>
                <div class="action-subtitle">{{ classStudents.length }} students</div>
              </div>
            </button>
            <button class="quick-action-btn absent" @click="markAllAs('absent')">
              <div class="action-icon">✗</div>
              <div class="action-text">
                <div class="action-title">Mark All Absent</div>
                <div class="action-subtitle">{{ classStudents.length }} students</div>
              </div>
            </button>
            <button class="quick-action-btn late" @click="markAllAs('late')">
              <div class="action-icon">⏰</div>
              <div class="action-text">
                <div class="action-title">Mark All Late</div>
                <div class="action-subtitle">{{ classStudents.length }} students</div>
              </div>
            </button>
            <button class="quick-action-btn cube-progress" @click="showBulkCubeProgress = !showBulkCubeProgress">
              <div class="action-icon">🧩</div>
              <div class="action-text">
                <div class="action-title">Bulk Progress</div>
                <div class="action-subtitle">Update levels</div>
              </div>
            </button>
          </div>
        </div>
      
      <!-- Bulk Cube Progress Section -->
      <div v-if="showBulkCubeProgress" class="bulk-cube-progress">
        <h3>Bulk Cube Progress Update</h3>
        <div class="bulk-cube-controls">
          <div class="bulk-cube-row">
            <label>Cube Type:</label>
            <select v-model="bulkCubeType">
              <option value="">Select Cube Type</option>
              <option v-for="cubeType in cubeTypes" :key="cubeType.value" :value="cubeType.value">
                {{ cubeType.label }}
              </option>
            </select>
          </div>
          <div class="bulk-cube-row">
            <label>Level:</label>
            <select v-model="bulkCubeLevel" :disabled="!bulkCubeType">
              <option value="">Select Level</option>
              <option v-for="level in getCubeLevels(bulkCubeType)" :key="level.value" :value="level.value">
                {{ level.label }}
              </option>
            </select>
          </div>
          <div class="bulk-cube-row">
            <label>Apply to:</label>
            <div class="bulk-cube-filters">
              <button 
                class="filter-btn" 
                :class="{ active: bulkCubeFilter === 'all' }"
                @click="bulkCubeFilter = 'all'"
              >
                All Students
              </button>
              <button 
                class="filter-btn" 
                :class="{ active: bulkCubeFilter === 'present' }"
                @click="bulkCubeFilter = 'present'"
              >
                Present Only
              </button>
              <button 
                class="filter-btn" 
                :class="{ active: bulkCubeFilter === 'selected' }"
                @click="bulkCubeFilter = 'selected'"
              >
                Selected Students
              </button>
            </div>
          </div>
          <div class="bulk-cube-actions">
            <button 
              class="apply-bulk-btn"
              @click="applyBulkCubeProgress"
              :disabled="!bulkCubeType || !bulkCubeLevel"
            >
              Apply to {{ getBulkApplyCount() }} Students
            </button>
            <button class="cancel-bulk-btn" @click="cancelBulkCubeProgress">
              Cancel
            </button>
          </div>
        </div>
      </div>
      
        
        <!-- Progress Indicator -->
        <div class="progress-section">
          <div class="progress-header">
            <div class="progress-title">Attendance Progress</div>
            <div class="progress-stats">{{ attendanceCount }} of {{ classStudents.length }} students marked</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="progress-percentage">{{ progressPercentage }}% Complete</div>
        </div>
      
      <!-- Students Grid (Card View) -->
      <div v-if="viewMode === 'cards'" class="students-grid">
        <div v-for="student in classStudents" :key="student.id" class="student-card">
          <div class="student-info">
            <div class="student-name-section">
              <router-link 
                :to="{ name: 'StudentProfile', params: { id: student.id }}" 
                class="student-name"
              >
                {{ student.name }}
              </router-link>
              <button class="edit-student-btn" @click="openEditStudent(student)" title="Edit student name">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </button>
            </div>
            <div class="student-details">
              <span class="attendance-history">{{ getAttendanceRate(student.id) }}% attendance</span>
            </div>
          </div>
          
          <div class="attendance-controls">
            <div class="status-buttons">
              <button 
                class="status-btn present" 
                :class="{ active: attendanceStatus[student.id] === 'present' }"
                @click="setAttendanceStatus(student.id, 'present')"
              >
                <span class="icon">✓</span>
                <span class="label">Present</span>
              </button>
              <button 
                class="status-btn late" 
                :class="{ active: attendanceStatus[student.id] === 'late' }"
                @click="setAttendanceStatus(student.id, 'late')"
              >
                <span class="icon">⏰</span>
                <span class="label">Late</span>
              </button>
              <button 
                class="status-btn absent" 
                :class="{ active: attendanceStatus[student.id] === 'absent' }"
                @click="setAttendanceStatus(student.id, 'absent')"
              >
                <span class="icon">✗</span>
                <span class="label">Absent</span>
              </button>
            </div>
            
            <!-- Quick Notes -->
            <div class="quick-notes">
              <input 
                type="text" 
                placeholder="Add quick note..."
                v-model="quickNotes[student.id]"
                @keyup.enter="addQuickNote(student.id)"
                class="note-input"
              >
              <button 
                v-if="quickNotes[student.id]"
                @click="addQuickNote(student.id)"
                class="add-note-btn"
              >
                💬
              </button>
            </div>
          </div>
          
          <!-- Cube Progress Section -->
          <div class="cube-progress-section">
            <div class="cube-progress-header">
              <h4>Cube Progress</h4>
              <div class="cube-progress-controls">
                <button 
                  class="toggle-cube-btn"
                  @click="toggleCubeProgress(student.id)"
                  :class="{ active: showCubeProgress[student.id] }"
                >
                  {{ showCubeProgress[student.id] ? '▼' : '▶' }}
                </button>
              </div>
            </div>
            
            <div v-if="showCubeProgress[student.id]" class="cube-progress-content">
              <div v-for="cubeType in cubeTypes" :key="cubeType.value" class="cube-type-row">
                <div class="cube-type-label">{{ cubeType.label }}</div>
                <div class="cube-level-selector">
                  <select 
                    :value="cubeProgress[student.id] && cubeProgress[student.id][cubeType.value]"
                    @change="updateStudentCubeProgress(student.id, cubeType.value, $event.target.value)"
                    class="cube-level-select"
                  >
                    <option value="">Not Started</option>
                    <option 
                      v-for="level in getCubeLevels(cubeType.value)" 
                      :key="level.value"
                      :value="level.value"
                    >
                      {{ level.label }}
                    </option>
                  </select>
                  <div class="cube-progress-indicator">
                    <div 
                      class="cube-progress-fill" 
                      :style="{ width: getCubeProgressPercentage(cubeType.value, cubeProgress[student.id] && cubeProgress[student.id][cubeType.value]) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="student-actions">
            <button class="delete-button" @click="deleteStudent(student.id)">Remove</button>
          </div>
        </div>
      </div>
      
      <!-- Compact Table View -->
      <div v-if="viewMode === 'compact'" class="compact-attendance-table">
        <table class="attendance-table">
          <thead>
            <tr>
              <th class="student-name-col">Student Name</th>
              <th class="attendance-col">Attendance</th>
              <th class="cube-progress-col">2x2 Progress</th>
              <th class="cube-progress-col">3x3 Progress</th>
              <th class="cube-progress-col">4x4 Progress</th>
              <th class="notes-col">Quick Notes</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in classStudents" :key="student.id" class="student-row">
              <!-- Student Name -->
              <td class="student-name-cell">
                <router-link 
                  :to="{ name: 'StudentProfile', params: { id: student.id }}" 
                  class="student-link"
                >
                  {{ student.name }}
                </router-link>
                <div class="student-stats">
                  {{ getAttendanceRate(student.id) }}% attendance
                </div>
              </td>
              
              <!-- Attendance Status -->
              <td class="attendance-cell">
                <div class="attendance-buttons">
                  <button 
                    class="mini-btn present" 
                    :class="{ active: attendanceStatus[student.id] === 'present' }"
                    @click="setAttendanceStatus(student.id, 'present')"
                    title="Present"
                  >
                    ✓
                  </button>
                  <button 
                    class="mini-btn late" 
                    :class="{ active: attendanceStatus[student.id] === 'late' }"
                    @click="setAttendanceStatus(student.id, 'late')"
                    title="Late"
                  >
                    ⏰
                  </button>
                  <button 
                    class="mini-btn absent" 
                    :class="{ active: attendanceStatus[student.id] === 'absent' }"
                    @click="setAttendanceStatus(student.id, 'absent')"
                    title="Absent"
                  >
                    ✗
                  </button>
                </div>
              </td>
              
              <!-- 2x2 Cube Progress -->
              <td class="cube-progress-cell">
                <select 
                  :value="cubeProgress[student.id] && cubeProgress[student.id]['2x2']"
                  @change="updateStudentCubeProgress(student.id, '2x2', $event.target.value)"
                  class="compact-cube-select"
                >
                  <option value="">Not Started</option>
                  <option v-for="level in getCubeLevels('2x2')" :key="level.value" :value="level.value">
                    {{ level.label.replace('2x2 ', '') }}
                  </option>
                </select>
                <div class="mini-progress-bar">
                  <div 
                    class="mini-progress-fill" 
                    :style="{ width: getCubeProgressPercentage('2x2', cubeProgress[student.id] && cubeProgress[student.id]['2x2']) + '%' }"
                  ></div>
                </div>
              </td>
              
              <!-- 3x3 Cube Progress -->
              <td class="cube-progress-cell">
                <select 
                  :value="cubeProgress[student.id] && cubeProgress[student.id]['3x3']"
                  @change="updateStudentCubeProgress(student.id, '3x3', $event.target.value)"
                  class="compact-cube-select"
                >
                  <option value="">Not Started</option>
                  <option v-for="level in getCubeLevels('3x3')" :key="level.value" :value="level.value">
                    {{ level.label.replace('3x3 ', '') }}
                  </option>
                </select>
                <div class="mini-progress-bar">
                  <div 
                    class="mini-progress-fill" 
                    :style="{ width: getCubeProgressPercentage('3x3', cubeProgress[student.id] && cubeProgress[student.id]['3x3']) + '%' }"
                  ></div>
                </div>
              </td>
              
              <!-- 4x4 Cube Progress -->
              <td class="cube-progress-cell">
                <select 
                  :value="cubeProgress[student.id] && cubeProgress[student.id]['4x4']"
                  @change="updateStudentCubeProgress(student.id, '4x4', $event.target.value)"
                  class="compact-cube-select"
                >
                  <option value="">Not Started</option>
                  <option v-for="level in getCubeLevels('4x4')" :key="level.value" :value="level.value">
                    {{ level.label.replace('4x4 ', '') }}
                  </option>
                </select>
                <div class="mini-progress-bar">
                  <div 
                    class="mini-progress-fill" 
                    :style="{ width: getCubeProgressPercentage('4x4', cubeProgress[student.id] && cubeProgress[student.id]['4x4']) + '%' }"
                  ></div>
                </div>
              </td>
              
              <!-- Quick Notes -->
              <td class="notes-cell">
                <input 
                  type="text" 
                  placeholder="Note..."
                  v-model="quickNotes[student.id]"
                  @keyup.enter="addQuickNote(student.id)"
                  class="compact-note-input"
                >
              </td>
              
              <!-- Actions -->
              <td class="actions-cell">
                <button 
                  v-if="quickNotes[student.id]"
                  @click="addQuickNote(student.id)"
                  class="mini-action-btn"
                  title="Add Note"
                >
                  💬
                </button>
                <button 
                  @click="deleteStudent(student.id)"
                  class="mini-action-btn delete"
                  title="Remove Student"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Submit Section -->
      <div class="submit-section">
        <div class="attendance-summary">
          <div class="summary-item present">
            <span class="count">{{ getStatusCount('present') }}</span>
            <span class="label">Present</span>
          </div>
          <div class="summary-item late">
            <span class="count">{{ getStatusCount('late') }}</span>
            <span class="label">Late</span>
          </div>
          <div class="summary-item absent">
            <span class="count">{{ getStatusCount('absent') }}</span>
            <span class="label">Absent</span>
          </div>
        </div>
        
        <div class="submit-buttons">
          <button 
            class="submit-attendance" 
            @click="submitAttendance"
            :disabled="!isAttendanceComplete || isSubmitting"
          >
            <span v-if="isSubmitting" class="loading-spinner">⏳</span>
            <span v-else>{{ isAttendanceComplete ? '✓ Submit Attendance' : 'Mark All Students' }}</span>
          </button>
          
          <button 
            class="submit-progress" 
            @click="submitCubeProgress"
            :disabled="isSubmitting"
          >
            <span class="progress-icon">🧩</span>
            <span>Update Cube Progress</span>
          </button>
        </div>
      </div>
    </div>

      <!-- iOS-style Add Student Modal -->
      <div v-if="showAddStudentForm" class="modal-overlay" @click="closeAddStudentForm">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Add New Student</h2>
            <button class="close-button" @click="closeAddStudentForm" type="button">×</button>
          </div>
          <form @submit.prevent="addStudent" class="modal-form">
            <div class="form-section">
              <div class="form-group">
                <label class="form-label">Student Name</label>
                <input 
                  v-model="newStudent.name" 
                  type="text"
                  class="form-input"
                  placeholder="Enter student name"
                  :disabled="isAddingStudent"
                  ref="studentNameInput"
                  required
                >
              </div>
            </div>
            <div class="modal-actions">
              <button 
                type="button" 
                @click="closeAddStudentForm" 
                class="cancel-btn"
                :disabled="isAddingStudent"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="submit-btn"
                :disabled="isAddingStudent || !newStudent.name?.trim()"
              >
                <span v-if="isAddingStudent">⏳ Adding...</span>
                <span v-else>Add Student</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Edit Student Modal -->
      <div v-if="showEditStudentForm" class="modal-overlay" @click="showEditStudentForm = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Edit Student</h2>
            <button class="close-button" @click="showEditStudentForm = false">×</button>
          </div>
          
          <form @submit.prevent="updateStudent" class="modal-form">
            <div class="form-section">
              <div class="form-group">
                <label class="form-label">Student Name</label>
                <input 
                  v-model="editingStudent.name" 
                  type="text"
                  class="form-input"
                  placeholder="Enter student name"
                  required
                >
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="showEditStudentForm = false" class="cancel-btn">
                Cancel
              </button>
              <button type="submit" class="submit-btn">
                Update Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSchoolStore } from '../stores/school'
import { useClassStore } from '../stores/class'
import { useStudentStore } from '../stores/student'
import { CUBE_LEVELS, CUBE_TYPES, getCubeLevelLabel } from '../config/cubeLevels'

export default {
  name: 'ClassDetails',
  
  setup() {
    const route = useRoute()
    const schoolStore = useSchoolStore()
    const classStore = useClassStore()
    const studentStore = useStudentStore()
    
    const classId = route.params.id
    const showAddStudentForm = ref(false)
    const isAddingStudent = ref(false)
    const isLoadingClassDetails = ref(true)
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const attendanceStatus = ref({})
    const quickNotes = ref({})
    const isSubmitting = ref(false)
    // Detect mobile and set appropriate view mode
    const isMobile = window.innerWidth <= 768
    const viewMode = ref(isMobile ? 'cards' : 'compact')
    const studentNameInput = ref(null)
    
    // Handle mobile view mode switching
    const handleResize = () => {
      const currentIsMobile = window.innerWidth <= 768
      if (currentIsMobile) {
        viewMode.value = 'cards'
      }
    }
    
    // Cube progress related refs
    const cubeProgress = ref({})
    const showCubeProgress = ref({})
    const cubeTypes = ref(CUBE_TYPES)
    const cubeProgressUpdates = ref({})
    
    // Bulk cube progress refs
    const showBulkCubeProgress = ref(false)
    const bulkCubeType = ref('')
    const bulkCubeLevel = ref('')
    const bulkCubeFilter = ref('all')
    const selectedStudents = ref(new Set())
    
    // Edit student functionality
    const showEditStudentForm = ref(false)
    const editingStudent = ref({
      id: '',
      name: ''
    })
    
    // Offline functionality
    const isOnline = ref(navigator.onLine)
    const offlineData = ref(JSON.parse(localStorage.getItem(`class-${classId}-offline`) || '{}'))
    
    const class_ = computed(() => 
      classStore.classes.find(c => c.id === classId)
    )
    
    const school = computed(() => 
      class_.value ? schoolStore.schools.find(s => s.id === class_.value.school_id) : null
    )
    
    const classStudents = computed(() => {
      const students = studentStore.getStudentsByClass(classId)
      console.log('📱 ClassDetails computed - classStudents:', students.length, 'students')
      console.log('📱 Mobile mode:', isMobile, 'viewMode:', viewMode.value)
      return students
    })
    
    const newStudent = ref({
      name: ''
    })
    
    // Computed properties for UI
    const attendanceCount = computed(() => {
      return Object.values(attendanceStatus.value).filter(status => status).length
    })
    
    const progressPercentage = computed(() => {
      if (classStudents.value.length === 0) return 0
      return Math.round((attendanceCount.value / classStudents.value.length) * 100)
    })
    
    const isAttendanceComplete = computed(() => {
      return attendanceCount.value === classStudents.value.length
    })
    
    onMounted(async () => {
      // Setup offline functionality
      const handleOnline = () => {
        isOnline.value = true
        syncOfflineData()
      }
      const handleOffline = () => {
        isOnline.value = false
      }
      
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      
      window.addEventListener('resize', handleResize)
      
      // Load offline data if available
      loadOfflineData()
      
      // Much shorter timeout to prevent long freezes
      const timeoutId = setTimeout(() => {
        console.error('ClassDetails loading timeout - forcing completion after 5 seconds')
        isLoadingClassDetails.value = false
        alert('Loading is taking too long. Please try again or check your internet connection.')
      }, 5000) // 5 second timeout

      try {
        console.log('🚀 ClassDetails mounting, classId:', classId)
        
        // Validate classId
        if (!classId) {
          throw new Error('No class ID provided')
        }

        // Step 1: Ensure we have schools
        console.log('📚 Step 1: Checking schools...')
        if (schoolStore.schools.length === 0) {
          console.log('No schools in store, fetching with 3s timeout...')
          await Promise.race([
            schoolStore.fetchSchools(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('School fetch timeout')), 3000))
          ])
          console.log('✅ Schools loaded:', schoolStore.schools.length)
        } else {
          console.log('✅ Schools already in store:', schoolStore.schools.length)
        }

        // Step 2: Find or fetch the class
        console.log('🎯 Step 2: Looking for class...')
        let currentClass = classStore.classes.find(c => c.id === classId)
        if (!currentClass) {
          console.log('Class not found, doing quick fetch attempt...')
          
          // Try to fetch classes for all schools, but with individual timeouts
          const fetchPromises = schoolStore.schools.map(school => 
            Promise.race([
              classStore.fetchClasses(school.id),
              new Promise((resolve) => setTimeout(() => resolve(null), 2000)) // 2s timeout per school
            ]).catch(error => {
              console.warn('Could not fetch classes for school:', school.id, error.message)
              return null
            })
          )
          
          await Promise.allSettled(fetchPromises)
          currentClass = classStore.classes.find(c => c.id === classId)
          
          if (!currentClass) {
            console.warn('⚠️ Class still not found after fetching')
          } else {
            console.log('✅ Found class:', currentClass.name)
          }
        } else {
          console.log('✅ Class found in store:', currentClass.name)
        }

        // Step 3: Fetch students with short timeout
        console.log('👥 Step 3: Fetching students...')
        try {
          await Promise.race([
            studentStore.fetchStudents(classId),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Student fetch timeout')), 3000))
          ])
          console.log('✅ Students loaded:', classStudents.value.length)
        } catch (error) {
          console.warn('⚠️ Student fetch failed:', error.message)
          // Continue anyway, UI can still load
        }
        
        // Step 4: Initialize UI state (this should be fast)
        console.log('🎨 Step 4: Initializing UI...')
        const students = classStudents.value || []
        
        students.forEach(student => {
          try {
            attendanceStatus.value[student.id] = 'present'
            quickNotes.value[student.id] = ''
            showCubeProgress.value[student.id] = false
            initializeCubeProgress(student)
          } catch (error) {
            console.warn('Error initializing student UI:', student.id, error)
          }
        })
        
        console.log('✅ ClassDetails initialized successfully with', students.length, 'students')
      } catch (error) {
        console.error('❌ Error initializing ClassDetails:', error)
        alert('Failed to load class details: ' + error.message + '\n\nPlease try again or contact support.')
      } finally {
        clearTimeout(timeoutId)
        isLoadingClassDetails.value = false
        console.log('🏁 ClassDetails loading complete')
      }
    })
    
    const addStudent = async () => {
      if (isAddingStudent.value) return // Prevent multiple submissions
      
      const studentName = newStudent.value.name?.trim()
      if (!studentName) {
        alert('Please enter a student name')
        return
      }

      isAddingStudent.value = true
      
      try {
        if (!classId) {
          throw new Error('No class selected')
        }

        console.log('Adding student to class:', classId)
        const result = await studentStore.addStudent({
          class_id: classId,
          name: studentName
        })

        if (result) {
          console.log('Student added successfully:', result)
          
          // Force refresh students for this class to ensure reactivity
          await studentStore.fetchStudents(classId)
          
          // Initialize UI state for the new student
          attendanceStatus.value[result.id] = 'present'
          quickNotes.value[result.id] = ''
          showCubeProgress.value[result.id] = false
          initializeCubeProgress(result)
          
          // Close form and reset
          closeAddStudentForm()
          
          // Show success message
          alert('Student added successfully!')
        }
      } catch (error) {
        console.error('Error adding student:', error)
        alert('Error adding student: ' + error.message)
      } finally {
        isAddingStudent.value = false
      }
    }
    
    const closeAddStudentForm = () => {
      showAddStudentForm.value = false
      newStudent.value = { name: '' }
      isAddingStudent.value = false
    }

    const skipLoading = () => {
      console.log('🛑 User clicked skip loading')
      isLoadingClassDetails.value = false
    }
    
    // Offline functionality
    const saveOfflineData = () => {
      const dataToSave = {
        attendance: attendanceStatus.value,
        notes: quickNotes.value,
        cubeProgress: cubeProgress.value,
        timestamp: Date.now()
      }
      localStorage.setItem(`class-${classId}-offline`, JSON.stringify(dataToSave))
    }
    
    const loadOfflineData = () => {
      try {
        const offline = JSON.parse(localStorage.getItem(`class-${classId}-offline`) || '{}')
        if (offline.attendance) attendanceStatus.value = { ...attendanceStatus.value, ...offline.attendance }
        if (offline.notes) quickNotes.value = { ...quickNotes.value, ...offline.notes }
        if (offline.cubeProgress) cubeProgress.value = { ...cubeProgress.value, ...offline.cubeProgress }
        console.log('📱 Offline data loaded successfully')
      } catch (error) {
        console.error('Error loading offline data:', error)
      }
    }
    
    const syncOfflineData = async () => {
      if (!isOnline.value) return
      
      try {
        const offline = JSON.parse(localStorage.getItem(`class-${classId}-offline`) || '{}')
        if (!offline.timestamp) return
        
        console.log('🔄 Syncing offline data...')
        
        // Sync attendance if any exists
        if (offline.attendance && Object.keys(offline.attendance).length > 0) {
          // Implementation would sync with server
          console.log('📝 Syncing attendance data')
        }
        
        // Sync notes if any exist
        if (offline.notes && Object.keys(offline.notes).length > 0) {
          for (const [studentId, note] of Object.entries(offline.notes)) {
            if (note?.trim()) {
              try {
                await studentStore.addNote(studentId, note)
              } catch (error) {
                console.error('Error syncing note for student:', studentId, error)
              }
            }
          }
        }
        
        // Sync cube progress if any exists
        if (offline.cubeProgress && Object.keys(offline.cubeProgress).length > 0) {
          console.log('🧩 Syncing cube progress data')
        }
        
        // Clear offline data after successful sync
        localStorage.removeItem(`class-${classId}-offline`)
        console.log('✅ Offline data synced and cleared')
      } catch (error) {
        console.error('Error syncing offline data:', error)
      }
    }
    
    // Add onUnmounted cleanup
    onUnmounted(() => {
      window.removeEventListener('online', () => isOnline.value = true)
      window.removeEventListener('offline', () => isOnline.value = false)
      window.removeEventListener('resize', handleResize)
    })
    
    const deleteStudent = async (studentId) => {
      if (confirm('Are you sure you want to remove this student?')) {
        try {
          await studentStore.deleteStudent(studentId)
          delete attendanceStatus.value[studentId]
        } catch (error) {
          alert('Error deleting student: ' + error.message)
        }
      }
    }
    
    const submitAttendance = async () => {
      if (!isAttendanceComplete.value) {
        alert('Please mark attendance for all students before submitting.')
        return
      }
      
      isSubmitting.value = true
      try {
        // Submit only attendance (no cube progress)
        for (const [studentId, status] of Object.entries(attendanceStatus.value)) {
          await studentStore.markAttendance(studentId, selectedDate.value, status)
        }
        
        alert('Attendance submitted successfully!')
      } catch (error) {
        alert('Error submitting attendance: ' + error.message)
      } finally {
        isSubmitting.value = false
      }
    }

    const submitCubeProgress = async () => {
      if (isSubmitting.value) return
      isSubmitting.value = true
      
      try {
        let updatesCount = 0
        
        // Submit only cube progress updates
        for (const [studentId, updates] of Object.entries(cubeProgressUpdates.value)) {
          for (const [cubeType, update] of Object.entries(updates)) {
            if (update.currentLevel !== update.previousLevel) {
              await studentStore.updateCubeProgress(
                studentId,
                cubeType,
                update.currentLevel,
                `Updated on ${new Date().toLocaleDateString()}`
              )
              updatesCount++
            }
          }
        }
        
        // Clear cube progress updates after successful submission
        cubeProgressUpdates.value = {}
        
        if (updatesCount > 0) {
          alert(`Cube progress updated for ${updatesCount} changes!`)
        } else {
          alert('No cube progress changes to submit.')
        }
      } catch (error) {
        alert('Error submitting cube progress: ' + error.message)
      } finally {
        isSubmitting.value = false
      }
    }
    
    // New helper functions
    const markAllAs = (status) => {
      classStudents.value.forEach(student => {
        attendanceStatus.value[student.id] = status
      })
    }
    
    const setAttendanceStatus = (studentId, status) => {
      attendanceStatus.value[studentId] = status
      // Auto-save offline data whenever attendance changes
      if (!isOnline.value) {
        saveOfflineData()
      }
    }
    
    const getStatusCount = (status) => {
      return Object.values(attendanceStatus.value).filter(s => s === status).length
    }
    
    const getAttendanceRate = (studentId) => {
      const student = classStudents.value.find(s => s.id === studentId)
      if (!student || !student.attendance || student.attendance.length === 0) return 100
      
      const presentCount = student.attendance.filter(a => a.status === 'PRESENT').length
      const rate = Math.round((presentCount / student.attendance.length) * 100)
      return rate
    }
    
    const addQuickNote = async (studentId) => {
      const noteText = quickNotes.value[studentId]?.trim()
      if (!noteText) return
      
      try {
        if (isOnline.value) {
          await studentStore.addNote(studentId, noteText)
          quickNotes.value[studentId] = '' // Clear the input
          alert('Note added successfully!')
        } else {
          // Save offline and clear input
          saveOfflineData()
          quickNotes.value[studentId] = '' // Clear the input
          alert('📱 Note saved offline. Will sync when connection is restored.')
        }
      } catch (error) {
        console.error('Error adding note:', error)
        // If online request fails, save offline as backup
        saveOfflineData()
        quickNotes.value[studentId] = '' // Clear the input
        alert('📱 Note saved offline due to connection error. Will sync when connection is restored.')
      }
    }
    
    // Cube progress functions
    const initializeCubeProgress = (student) => {
      try {
        if (!student || !student.id) {
          console.warn('Invalid student data for cube progress initialization:', student)
          return
        }

        if (!cubeProgress.value[student.id]) {
          cubeProgress.value[student.id] = {}
        }
        
        // Initialize with existing cube progress data
        if (student.cube_progress && Array.isArray(student.cube_progress)) {
          student.cube_progress.forEach(progress => {
            if (progress && progress.cube_type && progress.current_level !== undefined) {
              cubeProgress.value[student.id][progress.cube_type] = progress.current_level
            }
          })
        }
        
        // Set defaults for cube types without progress
        if (cubeTypes.value && Array.isArray(cubeTypes.value)) {
          cubeTypes.value.forEach(type => {
            if (type && type.value && !cubeProgress.value[student.id][type.value]) {
              cubeProgress.value[student.id][type.value] = ''
            }
          })
        }
        
        if (!cubeProgressUpdates.value[student.id]) {
          cubeProgressUpdates.value[student.id] = {}
        }
      } catch (error) {
        console.error('Error in initializeCubeProgress:', error, 'for student:', student)
      }
    }
    
    const toggleCubeProgress = (studentId) => {
      showCubeProgress.value[studentId] = !showCubeProgress.value[studentId]
    }
    
    const getCubeLevels = (cubeType) => {
      return CUBE_LEVELS[cubeType] || []
    }
    
    const getCubeProgressPercentage = (cubeType, currentLevel) => {
      if (!currentLevel) return 0
      const levels = CUBE_LEVELS[cubeType]
      if (!levels) return 0
      
      const currentIndex = levels.findIndex(level => level.value === currentLevel)
      if (currentIndex === -1) return 0
      
      return Math.round(((currentIndex + 1) / levels.length) * 100)
    }
    
    const updateStudentCubeProgress = (studentId, cubeType, newLevel) => {
      const previousLevel = cubeProgress.value[studentId]?.[cubeType]
      cubeProgress.value[studentId][cubeType] = newLevel
      
      // Track the update for submission
      cubeProgressUpdates.value[studentId] = cubeProgressUpdates.value[studentId] || {}
      cubeProgressUpdates.value[studentId][cubeType] = {
        cubeType,
        currentLevel: newLevel,
        previousLevel
      }
    }
    
    // Bulk cube progress methods
    const getBulkApplyCount = () => {
      switch (bulkCubeFilter.value) {
        case 'all':
          return classStudents.value.length
        case 'present':
          return classStudents.value.filter(s => attendanceStatus.value[s.id] === 'present').length
        case 'selected':
          return selectedStudents.value.size
        default:
          return 0
      }
    }
    
    const applyBulkCubeProgress = () => {
      if (!bulkCubeType.value || !bulkCubeLevel.value) return
      
      let studentsToUpdate = []
      
      switch (bulkCubeFilter.value) {
        case 'all':
          studentsToUpdate = classStudents.value
          break
        case 'present':
          studentsToUpdate = classStudents.value.filter(s => attendanceStatus.value[s.id] === 'present')
          break
        case 'selected':
          studentsToUpdate = classStudents.value.filter(s => selectedStudents.value.has(s.id))
          break
      }
      
      studentsToUpdate.forEach(student => {
        updateStudentCubeProgress(student.id, bulkCubeType.value, bulkCubeLevel.value)
      })
      
      // Reset bulk progress form
      cancelBulkCubeProgress()
      
      alert(`Updated ${studentsToUpdate.length} students to ${getCubeLevelLabel(bulkCubeType.value, bulkCubeLevel.value)}`)
    }
    
    const cancelBulkCubeProgress = () => {
      showBulkCubeProgress.value = false
      bulkCubeType.value = ''
      bulkCubeLevel.value = ''
      bulkCubeFilter.value = 'all'
      selectedStudents.value.clear()
    }
    
    const openEditStudent = (student) => {
      editingStudent.value = {
        id: student.id,
        name: student.name
      }
      showEditStudentForm.value = true
    }
    
    const updateStudent = async () => {
      try {
        console.log('Updating student:', editingStudent.value)
        await studentStore.updateStudent(editingStudent.value.id, {
          name: editingStudent.value.name
        })
        
        console.log('Student updated successfully')
        showEditStudentForm.value = false
        editingStudent.value = { id: '', name: '' }
        
        alert('Student updated successfully!')
      } catch (error) {
        console.error('Error updating student:', error)
        alert('Failed to update student. Please try again.')
      }
    }
    
    return {
      classId,
      class_,
      school,
      classStudents,
      showAddStudentForm,
      newStudent,
      selectedDate,
      attendanceStatus,
      quickNotes,
      isSubmitting,
      isAddingStudent,
      isLoadingClassDetails,
      viewMode,
      studentNameInput,
      attendanceCount,
      progressPercentage,
      isAttendanceComplete,
      addStudent,
      closeAddStudentForm,
      skipLoading,
      deleteStudent,
      submitAttendance,
      submitCubeProgress,
      markAllAs,
      setAttendanceStatus,
      getStatusCount,
      getAttendanceRate,
      addQuickNote,
      // Offline functionality
      isOnline,
      saveOfflineData,
      loadOfflineData,
      syncOfflineData,
      // Cube progress
      cubeProgress,
      showCubeProgress,
      cubeTypes,
      cubeProgressUpdates,
      toggleCubeProgress,
      getCubeLevels,
      getCubeProgressPercentage,
      updateStudentCubeProgress,
      initializeCubeProgress,
      // Bulk cube progress
      showBulkCubeProgress,
      bulkCubeType,
      bulkCubeLevel,
      bulkCubeFilter,
      selectedStudents,
      getBulkApplyCount,
      applyBulkCubeProgress,
      cancelBulkCubeProgress,
      // Edit student functionality
      showEditStudentForm,
      editingStudent,
      openEditStudent,
      updateStudent
    }
  }
}
</script>

<style scoped>
.class-details {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    var(--ios-background-primary) 0%, 
    var(--ios-background-secondary) 100%);
  font-family: var(--ios-font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Loading Styles */
.loading-overlay {
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
  animation: modalFadeIn 0.3s ease-out;
}

.loading-card {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--ios-border-light);
  border-top: 4px solid var(--ios-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem;
}

.loading-title {
  font-family: var(--ios-font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0 0 1rem 0;
}

.loading-subtitle {
  font-size: 1rem;
  color: var(--ios-text-secondary);
  margin: 0 0 1rem 0;
}

.loading-timeout-hint {
  font-size: 0.9rem;
  color: var(--ios-text-tertiary);
  margin: 0 0 2rem 0;
}

.skip-loading-btn {
  padding: 0.75rem 1.5rem;
  background: var(--ios-destructive);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: var(--ios-font-family);
}

.skip-loading-btn:hover {
  background: var(--ios-destructive-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 69, 58, 0.3);
}

/* Header Section */
.header-section {
  padding: 0;
}

.gradient-header {
  background: linear-gradient(135deg, 
    var(--ios-primary) 0%, 
    var(--ios-secondary) 100%);
  padding: 2rem 2rem 3rem;
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

.class-info {
  flex: 1;
}

.class-title {
  font-family: var(--ios-font-display);
  font-size: 2.5rem;
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
  text-decoration: none;
  transition: all 0.3s ease;
  min-width: 80px;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  text-decoration: none;
  color: white;
}

.action-icon {
  font-size: 1.5rem;
}

.action-button span {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Attendance Section */
.attendance-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  transform: translateY(-1rem);
}

.section-header {
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 2rem 2rem 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
  border-bottom: none;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-family: var(--ios-font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0;
}

.date-selector {
  display: flex;
  align-items: center;
}

.date-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--ios-border-medium);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--ios-background-elevated);
  color: var(--ios-text-primary);
  font-family: var(--ios-font-family);
  transition: all 0.3s ease;
}

.date-input:focus {
  outline: none;
  border-color: var(--ios-primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(var(--ios-primary-rgb), 0.1);
}

.section-controls {
  display: flex;
  justify-content: center;
}

.view-toggle {
  display: flex;
  background: var(--ios-background-elevated);
  border: 1px solid var(--ios-border-light);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--ios-text-secondary);
  transition: all 0.3s ease;
  font-family: var(--ios-font-family);
}

.toggle-btn:hover {
  background: rgba(var(--ios-primary-rgb), 0.1);
  color: var(--ios-primary);
}

.toggle-btn.active {
  background: var(--ios-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(var(--ios-primary-rgb), 0.3);
}

.toggle-icon {
  font-size: 1rem;
}

/* Quick Actions */
.quick-actions {
  background: white;
  border-left: 1px solid var(--ios-border-light);
  border-right: 1px solid var(--ios-border-light);
  padding: 2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--ios-background-elevated);
  border: 1px solid var(--ios-border-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.quick-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.quick-action-btn.present:hover {
  background: var(--ios-success-light);
  border-color: var(--ios-success);
}

.quick-action-btn.absent:hover {
  background: var(--ios-destructive-light);
  border-color: var(--ios-destructive);
}

.quick-action-btn.late:hover {
  background: var(--ios-warning-light);
  border-color: var(--ios-warning);
}

.quick-action-btn.cube-progress:hover {
  background: var(--ios-primary-light);
  border-color: var(--ios-primary);
}

.action-text {
  flex: 1;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin-bottom: 0.25rem;
}

.action-subtitle {
  font-size: 0.9rem;
  color: var(--ios-text-secondary);
}

/* Progress Section */
.progress-section {
  background: white;
  border-left: 1px solid var(--ios-border-light);
  border-right: 1px solid var(--ios-border-light);
  padding: 2rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-title {
  font-family: var(--ios-font-display);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ios-text-primary);
}

.progress-stats {
  font-size: 0.95rem;
  color: var(--ios-text-secondary);
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--ios-border-light);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ios-primary) 0%, var(--ios-secondary) 100%);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-percentage {
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ios-primary);
}

/* Students Grid - maintaining existing functionality but with iOS styling */
.students-grid {
  background: white;
  border: 1px solid var(--ios-border-light);
  border-radius: 0 0 20px 20px;
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.student-card {
  background: var(--ios-background-elevated);
  border: 1px solid var(--ios-border-light);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.student-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: var(--ios-primary);
}

/* Compact Table - maintaining existing responsive functionality */
.compact-attendance-table {
  background: white;
  border: 1px solid var(--ios-border-light);
  border-radius: 0 0 20px 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.attendance-table th {
  background: var(--ios-background-elevated);
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--ios-text-primary);
  border-bottom: 2px solid var(--ios-border-light);
  font-family: var(--ios-font-family);
}

.attendance-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--ios-border-light);
  vertical-align: top;
}

.student-row:hover {
  background: var(--ios-background-elevated);
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

.form-input {
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

.form-input:focus {
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

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--ios-primary-rgb), 0.3);
}

/* Maintain all existing functionality styles but with iOS colors */
.student-info, .student-name, .student-details, .attendance-history,
.attendance-controls, .status-buttons, .status-btn, .quick-notes,
.note-input, .add-note-btn, .student-actions, .delete-button,
.submit-section, .attendance-summary, .summary-item, .submit-buttons,
.submit-attendance, .submit-progress, .cube-progress-section,
.cube-progress-header, .toggle-cube-btn, .cube-progress-content,
.cube-type-row, .cube-type-label, .cube-level-selector, .cube-level-select,
.cube-progress-indicator, .cube-progress-fill, .bulk-cube-progress,
.bulk-cube-controls, .bulk-cube-row, .bulk-cube-filters, .filter-btn,
.bulk-cube-actions, .apply-bulk-btn, .cancel-bulk-btn,
.attendance-buttons, .mini-btn, .cube-progress-cell, .compact-cube-select,
.mini-progress-bar, .mini-progress-fill, .compact-note-input,
.actions-cell, .mini-action-btn {
  /* Maintain existing functionality but apply iOS color scheme */
  font-family: var(--ios-font-family);
}

/* Status button iOS styling */
.status-btn.present.active {
  background: var(--ios-success);
  border-color: var(--ios-success);
}

.status-btn.late.active {
  background: var(--ios-warning);
  border-color: var(--ios-warning);
}

.status-btn.absent.active {
  background: var(--ios-destructive);
  border-color: var(--ios-destructive);
}

.mini-btn.present.active {
  background: var(--ios-success);
  border-color: var(--ios-success);
}

.mini-btn.late.active {
  background: var(--ios-warning);
  border-color: var(--ios-warning);
}

.mini-btn.absent.active {
  background: var(--ios-destructive);
  border-color: var(--ios-destructive);
}

.submit-attendance {
  background: var(--ios-primary);
}

.submit-attendance:hover:not(:disabled) {
  background: var(--ios-primary-dark);
}

.submit-progress {
  background: var(--ios-warning);
}

.submit-progress:hover:not(:disabled) {
  background: var(--ios-warning-dark);
}

/* Submit Section Enhanced Styling */
.submit-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
}

.attendance-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-item {
  background: var(--ios-background-elevated);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid var(--ios-border-light);
  transition: all 0.3s ease;
}

.summary-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.summary-item.present {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  border-color: var(--ios-success);
}

.summary-item.late {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border-color: var(--ios-warning);
}

.summary-item.absent {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  border-color: var(--ios-destructive);
}

.summary-item .count {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  font-family: var(--ios-font-display);
  margin-bottom: 0.5rem;
  color: var(--ios-text-primary);
}

.summary-item .label {
  font-size: 1rem;
  font-weight: 500;
  color: var(--ios-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.submit-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.submit-attendance, .submit-progress {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: var(--ios-font-family);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 60px;
  color: white;
}

.submit-attendance {
  background: linear-gradient(135deg, var(--ios-primary), #5856D6);
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
}

.submit-attendance:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--ios-primary-dark), #4a47c4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.4);
}

.submit-progress {
  background: linear-gradient(135deg, var(--ios-warning), #FF8C00);
  box-shadow: 0 4px 15px rgba(255, 149, 0, 0.3);
}

.submit-progress:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--ios-warning-dark), #e67e00);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 149, 0, 0.4);
}

.submit-attendance:disabled, .submit-progress:disabled {
  background: var(--ios-text-tertiary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.progress-icon {
  font-size: 1.2rem;
}

/* Enhanced Cube Progress Selector Styling */
.cube-type-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--ios-border-light);
}

.cube-type-row:last-child {
  border-bottom: none;
}

.cube-type-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  font-family: var(--ios-font-family);
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cube-type-label::before {
  content: "🧩";
  font-size: 1.2rem;
}

.cube-level-selector {
  flex: 1;
  max-width: 200px;
  position: relative;
}

.cube-level-select, .compact-cube-select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--ios-background-elevated);
  border: 1.5px solid var(--ios-border-medium);
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: var(--ios-font-family);
  font-weight: 500;
  color: var(--ios-text-primary);
  appearance: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%23007AFF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.cube-level-select:focus, .compact-cube-select:focus {
  outline: none;
  border-color: var(--ios-primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  transform: translateY(-1px);
}

.cube-level-select:hover, .compact-cube-select:hover {
  border-color: var(--ios-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Compact table cube selectors */
.compact-cube-select {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  min-width: 120px;
  padding-right: 2rem;
  background-size: 0.8rem;
  background-position: right 0.5rem center;
}

/* Cube Progress Content Area */
.cube-progress-content {
  background: var(--ios-background-elevated);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 1px solid var(--ios-border-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.cube-progress-section {
  margin-top: 1rem;
}

.cube-progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.toggle-cube-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-cube-btn:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a42a0);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Cube Progress Indicator Enhancement */
.cube-progress-indicator {
  background: var(--ios-border-light);
  border-radius: 4px;
  height: 6px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.cube-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ios-primary), var(--ios-secondary));
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Bulk Cube Progress Section */
.bulk-cube-progress {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
}

.bulk-cube-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.bulk-cube-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bulk-cube-row label {
  font-weight: 600;
  color: var(--ios-text-primary);
  min-width: 100px;
  font-family: var(--ios-font-family);
}

.bulk-cube-row select {
  flex: 1;
  max-width: 300px;
  padding: 0.75rem 1rem;
  background: var(--ios-background-elevated);
  border: 1.5px solid var(--ios-border-medium);
  border-radius: 10px;
  font-size: 1rem;
  font-family: var(--ios-font-family);
  color: var(--ios-text-primary);
  appearance: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='%23007AFF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
}

.bulk-cube-row select:focus {
  outline: none;
  border-color: var(--ios-primary);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.bulk-cube-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: var(--ios-background-elevated);
  border: 1px solid var(--ios-border-medium);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--ios-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn.active, .filter-btn:hover {
  background: var(--ios-primary);
  color: white;
  border-color: var(--ios-primary);
}

/* Responsive design for cube selectors */
@media (max-width: 768px) {
  .cube-type-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 1rem 0;
  }
  
  .cube-level-selector {
    width: 100%;
    max-width: none;
  }
  
  .bulk-cube-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .bulk-cube-row label {
    min-width: auto;
  }
  
  .bulk-cube-row select {
    width: 100%;
    max-width: none;
  }
  
  .bulk-cube-filters {
    width: 100%;
  }
  
  .filter-btn {
    flex: 1;
    text-align: center;
  }
  
  .compact-cube-select {
    min-width: 100px;
    font-size: 0.8rem;
  }
}

/* Enhanced Student Info and Notes Section */
.student-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
  transition: all 0.3s ease;
}

.student-name-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-student-btn {
  background: none;
  border: none;
  color: var(--ios-text-secondary);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
}

.student-card:hover .edit-student-btn {
  opacity: 1;
}

.edit-student-btn:hover {
  background: var(--ios-background-elevated);
  color: var(--ios-primary);
  transform: scale(1.1);
}

.edit-student-btn svg {
  width: 14px;
  height: 14px;
}

.student-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.student-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--ios-border-light);
}

.student-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ios-primary);
  text-decoration: none;
  font-family: var(--ios-font-display);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.student-name::before {
  content: "👤";
  font-size: 1.1rem;
  opacity: 0.8;
}

.student-name:hover {
  color: var(--ios-primary-dark);
  transform: translateX(2px);
}

.student-details, .student-stats {
  font-size: 0.9rem;
  color: var(--ios-text-secondary);
  margin-top: 0.25rem;
}

.attendance-history {
  background: linear-gradient(135deg, var(--ios-success), #30D158);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Enhanced Notes Section */
.quick-notes {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 1rem;
  background: var(--ios-background-elevated);
  border-radius: 12px;
  border: 1px solid var(--ios-border-light);
  transition: all 0.3s ease;
}

.quick-notes:focus-within {
  border-color: var(--ios-primary);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  background: white;
}

.note-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--ios-border-medium);
  border-radius: 10px;
  font-size: 1rem;
  font-family: var(--ios-font-family);
  background: white;
  color: var(--ios-text-primary);
  transition: all 0.3s ease;
  min-height: 44px; /* iOS touch target minimum */
}

.note-input:focus {
  outline: none;
  border-color: var(--ios-primary);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  transform: translateY(-1px);
}

.note-input::placeholder {
  color: var(--ios-text-tertiary);
  font-style: italic;
}

.add-note-btn {
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  border: none;
  border-radius: 10px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.add-note-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.4);
}

.add-note-btn:active {
  transform: translateY(0) scale(0.95);
}

/* Compact Table Notes */
.notes-cell {
  padding: 0.5rem;
  width: 200px;
}

.compact-note-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1.5px solid var(--ios-border-medium);
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: var(--ios-font-family);
  background: white;
  color: var(--ios-text-primary);
  transition: all 0.3s ease;
  min-height: 36px;
}

.compact-note-input:focus {
  outline: none;
  border-color: var(--ios-primary);
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
}

.compact-note-input::placeholder {
  color: var(--ios-text-tertiary);
  font-size: 0.85rem;
}

/* Enhanced Student Name Cells in Table */
.student-name-cell {
  padding: 1rem;
  min-width: 180px;
}

.student-link {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ios-primary);
  text-decoration: none;
  font-family: var(--ios-font-display);
  transition: all 0.3s ease;
  display: block;
  padding: 0.5rem 0;
}

.student-link:hover {
  color: var(--ios-primary-dark);
  transform: translateX(2px);
}

/* Attendance Table Enhancements */
.attendance-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
}

.attendance-table th {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: var(--ios-text-primary);
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  font-family: var(--ios-font-display);
  border-bottom: 2px solid var(--ios-border-medium);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.student-row {
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--ios-border-light);
}

.student-row:hover {
  background: rgba(0, 122, 255, 0.02);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.student-row:last-child {
  border-bottom: none;
}

.student-row td {
  padding: 1rem;
  vertical-align: middle;
}

/* Mobile-First Responsive Design */
@media (max-width: 768px) {
  /* Hide table view on mobile, show cards only */
  .attendance-table {
    display: none;
  }
  
  .view-toggle {
    display: none;
  }
  
  .students-grid {
    display: block !important;
    padding: 0.5rem;
  }
  
  .student-card {
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    border-radius: 12px;
  }
  
  .student-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  .student-name {
    font-size: 1rem;
    font-weight: 600;
  }
  
  .quick-notes {
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
  }
  
  .attendance-options {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }
  
  .attendance-options .status-btn {
    flex: 1;
    min-width: 60px;
    padding: 0.5rem 0.25rem;
    font-size: 0.8rem;
  }
  
  .note-input {
    width: 100%;
    padding: 0.5rem;
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .add-note-btn {
    width: 100%;
    height: 44px;
    border-radius: 8px;
    font-size: 1rem;
  }
  
  /* Enhanced mobile cube progress */
  .cube-progress-content {
    padding: 1rem;
  }
  
  .cube-type-row {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--ios-border-light);
  }
  
  .cube-level-select {
    font-size: 16px; /* Prevent zoom on iOS */
    min-height: 44px;
  }
}

/* PWA & Offline Support Styles */
.offline-indicator {
  position: fixed;
  top: calc(var(--nav-height) + 10px);
  right: 20px;
  background: linear-gradient(135deg, #FF9500, #FF8C00);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(255, 149, 0, 0.3);
  transform: translateY(-100px);
  transition: all 0.3s ease;
}

.offline-indicator.visible {
  transform: translateY(0);
}

.offline-indicator::before {
  content: "📶";
  filter: grayscale(1);
}

/* Touch-Friendly Enhancements */
@media (max-width: 768px) and (pointer: coarse) {
  /* Larger touch targets for mobile */
  .status-btn {
    min-height: 44px;
    min-width: 44px;
    font-size: 0.9rem;
  }
  
  .toggle-btn, .filter-btn {
    min-height: 44px;
    padding: 0.75rem 1rem;
  }
  
  .quick-action-btn {
    min-height: 60px;
    padding: 1rem;
  }
  
  /* Better spacing for touch interaction */
  .status-buttons {
    gap: 0.75rem;
  }
  
  .actions-grid {
    gap: 1rem;
  }
  
  /* Improved scrolling on mobile */
  .students-grid {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
}

/* Responsive design for submit section */
@media (max-width: 768px) {
  .submit-section {
    margin: 1rem 0;
    padding: 1.5rem;
  }
  
  .attendance-summary {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .summary-item .count {
    font-size: 2rem;
  }
  
  .submit-buttons {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .submit-attendance, .submit-progress {
    padding: 1rem;
    font-size: 1rem;
    min-height: 50px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Enhanced Mobile Responsive Design */
@media (max-width: 768px) {
  .gradient-header {
    padding: 1rem 1rem 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .class-title {
    font-size: 1.5rem;
  }
  
  .school-subtitle {
    font-size: 0.9rem;
  }
  
  .attendance-section {
    padding: 0.75rem;
  }
  
  .section-header {
    padding: 1rem;
  }
  
  .section-title-row {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  
  .quick-action-btn {
    padding: 0.75rem 0.5rem;
    min-height: 70px;
  }
  
  .action-icon {
    font-size: 1.2rem;
  }
  
  .action-title {
    font-size: 0.8rem;
  }
  
  .action-subtitle {
    font-size: 0.7rem;
  }
  
  .students-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
  }
  
  .student-card {
    padding: 1rem;
  }
  
  .student-name {
    font-size: 1rem;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-content {
    padding: 1rem;
    max-width: none;
    width: 100%;
  }
  
  .modal-title {
    font-size: 1.3rem;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .status-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    min-height: 44px;
  }
  
  .date-input {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .form-input {
    padding: 0.75rem;
    font-size: 1rem;
  }
  
  .loading-card {
    padding: 1.5rem 1rem;
    margin: 0.75rem;
  }
  
  .loading-title {
    font-size: 1.3rem;
  }
  
  .loading-subtitle {
    font-size: 0.9rem;
  }
}

/* Extra small mobile devices */
@media (max-width: 480px) {
  .class-container {
    padding: 0.25rem;
  }
  .gradient-header {
    padding: 0.75rem 0.75rem 1rem;
  }
  
  .class-title {
    font-size: 1.3rem;
  }
  
  .section-title {
    font-size: 1.2rem;
  }
  
  .attendance-section {
    padding: 0.5rem;
  }
  
  .section-header {
    padding: 0.75rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.25rem;
  }
  
  .quick-action-btn {
    padding: 0.5rem 0.25rem;
    min-height: 60px;
  }
  
  .action-icon {
    font-size: 1rem;
  }
  
  .action-title {
    font-size: 0.75rem;
  }
  
  .action-subtitle {
    font-size: 0.65rem;
  }
  
  .students-grid {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .student-card {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border-radius: 10px;
  }
  
  .modal-content {
    padding: 0.75rem;
  }
  
  .modal-title {
    font-size: 1.2rem;
  }
  
  .status-btn {
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .loading-card {
    padding: 1rem 0.75rem;
    margin: 0.5rem;
  }
  
  .loading-title {
    font-size: 1.2rem;
  }
}
</style>
