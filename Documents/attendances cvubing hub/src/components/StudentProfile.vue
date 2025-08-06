<template>
  <div class="student-profile">
    <!-- Loading State -->
    <div v-if="!student" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading student profile...</p>
    </div>

    <template v-else>
      <!-- Header Section -->
      <div class="profile-header">
        <div class="header-content">
          <div class="student-info">
            <div class="avatar-section">
              <div class="student-avatar">
                {{ student.name.charAt(0).toUpperCase() }}
              </div>
              <div class="student-details">
                <h1 class="student-name">{{ student.name }}</h1>
                <div class="meta-info">
                  <span class="class-info">{{ student.class?.name || 'N/A' }}</span>
                  <span class="separator">•</span>
                  <span class="school-info">{{ student.class?.school?.name || 'N/A' }}</span>
                </div>
              </div>
            </div>
            <div class="header-actions">
              <button 
                @click="$router.push({ name: 'ClassDetails', params: { id: student.class_id }})" 
                class="back-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Back to Class
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stat-card attendance-stat">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-value">{{ attendanceRate }}%</div>
            <div class="stat-label">Attendance Rate</div>
          </div>
        </div>
        <div class="stat-card merits-stat">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalMerits }}</div>
            <div class="stat-label">Merit Points</div>
          </div>
        </div>
        <div class="stat-card progress-stat">
          <div class="stat-icon">🧩</div>
          <div class="stat-content">
            <div class="stat-value">{{ cubeProgress.length }}</div>
            <div class="stat-label">Cube Types</div>
          </div>
        </div>
        <div class="stat-card notes-stat">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <div class="stat-value">{{ sortedNotes.length }}</div>
            <div class="stat-label">Notes</div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        
        <!-- Left Column -->
        <div class="left-column">
          
          <!-- Attendance Section -->
          <section class="content-section">
            <div class="section-header">
              <h2>📅 Attendance History</h2>
            </div>
            
            <div class="attendance-breakdown">
              <div class="attendance-item present">
                <span class="count">{{ presentCount }}</span>
                <span class="label">Present</span>
              </div>
              <div class="attendance-item absent">
                <span class="count">{{ absentCount }}</span>
                <span class="label">Absent</span>
              </div>
              <div class="attendance-item late">
                <span class="count">{{ lateCount }}</span>
                <span class="label">Late</span>
              </div>
            </div>

            <div class="attendance-records">
              <div v-if="sortedAttendance.length" class="records-list">
                <div v-for="record in sortedAttendance.slice(0, 10)" :key="record.id" class="attendance-record">
                  <div class="record-date">{{ formatDate(record.date) }}</div>
                  <div :class="['record-status', record.status.toLowerCase()]">
                    <div class="status-indicator"></div>
                    {{ record.status }}
                  </div>
                </div>
                <div v-if="sortedAttendance.length > 10" class="show-more">
                  +{{ sortedAttendance.length - 10 }} more records
                </div>
              </div>
              <div v-else class="no-data">
                <div class="no-data-icon">📭</div>
                <p>No attendance records yet</p>
              </div>
            </div>
          </section>

          <!-- Cube Progress Section -->
          <section class="content-section">
            <div class="section-header">
              <h2>🧩 Cube Progress</h2>
            </div>
            
            <div v-if="cubeProgress.length" class="cube-progress-list">
              <div v-for="progress in cubeProgress" :key="progress.cube_type" class="cube-item">
                <div class="cube-type">{{ progress.cube_type }}</div>
                <div class="cube-level">{{ progress.current_level || 'Not Started' }}</div>
                <div class="cube-progress-bar">
                  <div class="progress-fill" :style="{ width: getCubeProgressPercentage(progress.cube_type, progress.current_level) + '%' }"></div>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <div class="no-data-icon">🧩</div>
              <p>No cube progress recorded</p>
            </div>
          </section>

        </div>

        <!-- Right Column -->
        <div class="right-column">

          <!-- Notes Section -->
          <section class="content-section">
            <div class="section-header">
              <h2>📝 Notes</h2>
              <button @click="showAddNoteForm = true" class="add-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14m-7-7h14"/>
                </svg>
                Add Note
              </button>
            </div>
            
            <div class="notes-container">
              <div v-if="sortedNotes.length" class="notes-list">
                <div v-for="note in sortedNotes" :key="note.id" class="note-item">
                  <div class="note-content">{{ note.text }}</div>
                  <div class="note-meta">
                    <span class="note-time">{{ formatTime(note.created_at) }}</span>
                    <button @click="deleteNote(note.id)" class="delete-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="no-data">
                <div class="no-data-icon">💬</div>
                <p>No notes added yet</p>
              </div>
            </div>
          </section>

          <!-- Character Merit System -->
          <section class="content-section character-section">
            <div class="section-header">
              <h2>🎯 Character Development</h2>
              <div class="merit-actions">
                <button @click="showCharacterStickerForm = true" class="add-btn">Award Sticker</button>
                <button @click="showCustomMeritForm = true" class="add-btn secondary">Custom Points</button>
              </div>
            </div>

            <div class="character-summary">
              <div class="total-stats">
                <div class="total-item">
                  <span class="total-value">{{ totalMerits }}</span>
                  <span class="total-label">Total Points</span>
                </div>
                <div class="total-item">
                  <span class="total-value">{{ totalStickers }}</span>
                  <span class="total-label">Stickers</span>
                </div>
              </div>

              <div class="character-categories">
                <div class="category-item persistence">
                  <div class="category-header">
                    <span class="category-icon">🎯</span>
                    <span class="category-name">Persistence Power</span>
                  </div>
                  <span class="category-points">{{ getPersistencePoints }} pts</span>
                </div>
                <div class="category-item leadership">
                  <div class="category-header">
                    <span class="category-icon">⭐</span>
                    <span class="category-name">Leadership Light</span>
                  </div>
                  <span class="category-points">{{ getLeadershipPoints }} pts</span>
                </div>
                <div class="category-item problem-solving">
                  <div class="category-header">
                    <span class="category-icon">🧠</span>
                    <span class="category-name">Problem Solver</span>
                  </div>
                  <span class="category-points">{{ getProblemSolverPoints }} pts</span>
                </div>
                <div class="category-item community">
                  <div class="category-header">
                    <span class="category-icon">❤️</span>
                    <span class="category-name">Community Builder</span>
                  </div>
                  <span class="category-points">{{ getCommunityBuilderPoints }} pts</span>
                </div>
              </div>
            </div>

            <!-- Recent Merit Activity -->
            <div class="merit-activity">
              <h3>Recent Activity</h3>
              <div v-if="recentMerits.length" class="activity-list">
                <div v-for="merit in recentMerits.slice(0, 5)" :key="merit.id" class="activity-item">
                  <div class="activity-content">
                    <div class="activity-description">{{ merit.description || merit.category }}</div>
                    <div class="activity-meta">
                      <span class="activity-points" :class="{ positive: merit.points > 0, negative: merit.points < 0 }">
                        {{ merit.points > 0 ? '+' : '' }}{{ merit.points }} pts
                      </span>
                      <span class="activity-time">{{ formatTime(merit.created_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-data small">
                <p>No recent activity</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </template>

    <!-- Modals -->
    <!-- Add Note Modal -->
    <div v-if="showAddNoteForm" class="modal-overlay" @click.self="closeAddNoteForm">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Note</h3>
          <button @click="closeAddNoteForm" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="addNote">
          <div class="form-group">
            <label>Note</label>
            <textarea v-model="newNoteText" required placeholder="Enter note..." rows="4"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeAddNoteForm" class="btn-secondary">Cancel</button>
            <button type="submit" :disabled="isSubmittingNote" class="btn-primary">
              <span v-if="isSubmittingNote">Adding...</span>
              <span v-else>Add Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Character Sticker Modal -->
    <div v-if="showCharacterStickerForm" class="modal-overlay" @click.self="closeCharacterStickerForm">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Award Character Sticker</h3>
          <button @click="closeCharacterStickerForm" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="addCharacterSticker">
          <div class="form-group">
            <label>Category</label>
            <select v-model="newSticker.category" required>
              <option value="">Select Category</option>
              <option value="persistence_power">🎯 Persistence Power</option>
              <option value="leadership_light">⭐ Leadership Light</option>
              <option value="problem_solver">🧠 Problem Solver</option>
              <option value="community_builder">❤️ Community Builder</option>
            </select>
          </div>
          <div class="form-group" v-if="newSticker.category">
            <label>Sticker Type</label>
            <select v-model="newSticker.type" required>
              <option value="">Select Sticker</option>
              <option v-for="sticker in availableStickers" :key="sticker.type" :value="sticker.type">
                {{ sticker.emoji }} {{ sticker.name }} ({{ sticker.points }} pts)
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Description (Optional)</label>
            <textarea v-model="newSticker.description" placeholder="Add specific details..."></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeCharacterStickerForm" class="btn-secondary">Cancel</button>
            <button type="submit" :disabled="isSubmittingSticker" class="btn-primary">
              <span v-if="isSubmittingSticker">Awarding...</span>
              <span v-else>Award Sticker</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Custom Merit Modal -->
    <div v-if="showCustomMeritForm" class="modal-overlay" @click.self="closeCustomMeritForm">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Custom Merit Points</h3>
          <button @click="closeCustomMeritForm" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="addCustomMerit">
          <div class="form-group">
            <label>Points</label>
            <input type="number" v-model="newCustomMerit.points" required placeholder="Points (positive or negative)">
          </div>
          <div class="form-group">
            <label>Category</label>
            <input type="text" v-model="newCustomMerit.category" required placeholder="e.g., Homework, Behavior">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newCustomMerit.description" required placeholder="Reason for points..."></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeCustomMeritForm" class="btn-secondary">Cancel</button>
            <button type="submit" :disabled="isSubmittingCustomMerit" class="btn-primary">
              <span v-if="isSubmittingCustomMerit">Adding...</span>
              <span v-else>Add Points</span>
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentStore } from '../stores/student'

export default {
  name: 'StudentProfile',
  
  setup() {
    const route = useRoute()
    const studentStore = useStudentStore()
    const studentId = route.params.id
    
    const student = ref(null)
    const showAddNoteForm = ref(false)
    const newNoteText = ref('')
    const isSubmittingNote = ref(false)
    
    // Character sticker form
    const showCharacterStickerForm = ref(false)
    const isSubmittingSticker = ref(false)
    const newSticker = ref({
      category: '',
      type: '',
      description: ''
    })
    
    // Custom merit form
    const showCustomMeritForm = ref(false)
    const isSubmittingCustomMerit = ref(false)
    const newCustomMerit = ref({
      points: '',
      category: '',
      description: ''
    })

    const characterStickers = {
      persistence_power: [
        { type: 'never_give_up', name: 'Never Give Up', emoji: '🎯', points: 3 },
        { type: 'try_again_champion', name: 'Try Again Champion', emoji: '🏆', points: 2 },
        { type: 'breakthrough_moment', name: 'Breakthrough Moment', emoji: '💡', points: 5 }
      ],
      leadership_light: [
        { type: 'helper_hero', name: 'Helper Hero', emoji: '🤝', points: 4 },
        { type: 'teaching_star', name: 'Teaching Star', emoji: '⭐', points: 5 },
        { type: 'encourager_award', name: 'Encourager Award', emoji: '💪', points: 3 }
      ],
      problem_solver: [
        { type: 'detective_cube', name: 'Detective Cube', emoji: '🧠', points: 4 },
        { type: 'creative_solution', name: 'Creative Solution', emoji: '🎨', points: 5 },
        { type: 'calm_under_pressure', name: 'Calm Under Pressure', emoji: '🧘', points: 4 }
      ],
      community_builder: [
        { type: 'kindness_cube', name: 'Kindness Cube', emoji: '❤️', points: 3 },
        { type: 'team_player', name: 'Team Player', emoji: '🤝', points: 4 },
        { type: 'celebration_champion', name: 'Celebration Champion', emoji: '🎉', points: 3 }
      ]
    }

    // Load student data
    onMounted(async () => {
      try {
        const studentData = await studentStore.fetchStudent(studentId)
        student.value = studentData
      } catch (error) {
        console.error('Error loading student:', error)
        alert('Error loading student profile: ' + error.message)
      }
    })

    // Computed properties
    const sortedAttendance = computed(() => {
      if (!student.value?.attendance) return []
      return [...student.value.attendance].sort((a, b) => new Date(b.date) - new Date(a.date))
    })

    const sortedNotes = computed(() => {
      if (!student.value?.notes) return []
      return [...student.value.notes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    })

    const cubeProgress = computed(() => {
      return student.value?.cube_progress || []
    })

    const totalMerits = computed(() => {
      if (!student.value?.merit_points) return 0
      return student.value.merit_points.reduce((total, merit) => total + merit.points, 0)
    })

    const totalStickers = computed(() => {
      if (!student.value?.merit_points) return 0
      return student.value.merit_points.filter(merit => 
        merit.category?.includes('persistence') || 
        merit.category?.includes('leadership') || 
        merit.category?.includes('problem') || 
        merit.category?.includes('community')
      ).length
    })

    const recentMerits = computed(() => {
      if (!student.value?.merit_points) return []
      return [...student.value.merit_points]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
    })

    const attendanceRate = computed(() => {
      if (!student.value?.attendance || student.value.attendance.length === 0) return 100
      const present = student.value.attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length
      return Math.round((present / student.value.attendance.length) * 100)
    })

    const presentCount = computed(() => {
      return student.value?.attendance?.filter(a => a.status === 'PRESENT').length || 0
    })

    const absentCount = computed(() => {
      return student.value?.attendance?.filter(a => a.status === 'ABSENT').length || 0
    })

    const lateCount = computed(() => {
      return student.value?.attendance?.filter(a => a.status === 'LATE').length || 0
    })

    const availableStickers = computed(() => {
      if (!newSticker.value.category) return []
      return characterStickers[newSticker.value.category] || []
    })

    const getPersistencePoints = computed(() => {
      if (!student.value?.merit_points) return 0
      return student.value.merit_points
        .filter(m => m.category?.toLowerCase().includes('persistence'))
        .reduce((sum, m) => sum + m.points, 0)
    })

    const getLeadershipPoints = computed(() => {
      if (!student.value?.merit_points) return 0
      return student.value.merit_points
        .filter(m => m.category?.toLowerCase().includes('leadership'))
        .reduce((sum, m) => sum + m.points, 0)
    })

    const getProblemSolverPoints = computed(() => {
      if (!student.value?.merit_points) return 0
      return student.value.merit_points
        .filter(m => m.category?.toLowerCase().includes('problem'))
        .reduce((sum, m) => sum + m.points, 0)
    })

    const getCommunityBuilderPoints = computed(() => {
      if (!student.value?.merit_points) return 0
      return student.value.merit_points
        .filter(m => m.category?.toLowerCase().includes('community'))
        .reduce((sum, m) => sum + m.points, 0)
    })

    // Methods
    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      })
    }

    const formatTime = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }

    const getCubeProgressPercentage = (cubeType, currentLevel) => {
      const levels = {
        '2x2': ['beginner', 'intermediate', 'advanced'],
        '3x3': ['beginner', 'intermediate', 'advanced', 'expert'],
        '4x4': ['beginner', 'intermediate', 'advanced']
      }
      
      if (!currentLevel || !levels[cubeType]) return 0
      const levelIndex = levels[cubeType].indexOf(currentLevel.toLowerCase())
      return levelIndex >= 0 ? ((levelIndex + 1) / levels[cubeType].length) * 100 : 0
    }

    // Form actions
    const addNote = async () => {
      if (!newNoteText.value.trim()) return
      
      isSubmittingNote.value = true
      try {
        await studentStore.addNote(studentId, newNoteText.value.trim())
        closeAddNoteForm()
        // Refresh student data
        student.value = await studentStore.fetchStudent(studentId)
      } catch (error) {
        alert('Error adding note: ' + error.message)
      } finally {
        isSubmittingNote.value = false
      }
    }

    const deleteNote = async (noteId) => {
      if (!confirm('Are you sure you want to delete this note?')) return
      
      try {
        await studentStore.deleteNote(studentId, noteId)
        // Refresh student data
        student.value = await studentStore.fetchStudent(studentId)
      } catch (error) {
        alert('Error deleting note: ' + error.message)
      }
    }

    const addCharacterSticker = async () => {
      if (!newSticker.value.category || !newSticker.value.type) return
      
      isSubmittingSticker.value = true
      try {
        await studentStore.addCharacterSticker(studentId, {
          stickerCategory: newSticker.value.category,
          stickerType: newSticker.value.type,
          description: newSticker.value.description
        })
        closeCharacterStickerForm()
        // Refresh student data
        student.value = await studentStore.fetchStudent(studentId)
      } catch (error) {
        alert('Error awarding sticker: ' + error.message)
      } finally {
        isSubmittingSticker.value = false
      }
    }

    const addCustomMerit = async () => {
      if (!newCustomMerit.value.points || !newCustomMerit.value.description) return
      
      isSubmittingCustomMerit.value = true
      try {
        await studentStore.addCustomMerit(studentId, {
          points: parseInt(newCustomMerit.value.points),
          category: newCustomMerit.value.category,
          description: newCustomMerit.value.description
        })
        closeCustomMeritForm()
        // Refresh student data
        student.value = await studentStore.fetchStudent(studentId)
      } catch (error) {
        alert('Error adding custom merit: ' + error.message)
      } finally {
        isSubmittingCustomMerit.value = false
      }
    }

    const closeAddNoteForm = () => {
      showAddNoteForm.value = false
      newNoteText.value = ''
    }

    const closeCharacterStickerForm = () => {
      showCharacterStickerForm.value = false
      newSticker.value = {
        category: '',
        type: '',
        description: ''
      }
    }

    const closeCustomMeritForm = () => {
      showCustomMeritForm.value = false
      newCustomMerit.value = {
        points: '',
        category: '',
        description: ''
      }
    }

    return {
      student,
      sortedAttendance,
      sortedNotes,
      cubeProgress,
      totalMerits,
      totalStickers,
      recentMerits,
      attendanceRate,
      presentCount,
      absentCount,
      lateCount,
      formatDate,
      formatTime,
      getCubeProgressPercentage,
      
      // Character metrics
      getPersistencePoints,
      getLeadershipPoints,
      getProblemSolverPoints,
      getCommunityBuilderPoints,
      
      // Note form
      showAddNoteForm,
      newNoteText,
      isSubmittingNote,
      addNote,
      deleteNote,
      closeAddNoteForm,
      
      // Character sticker form
      showCharacterStickerForm,
      isSubmittingSticker,
      newSticker,
      availableStickers,
      addCharacterSticker,
      closeCharacterStickerForm,
      
      // Custom merit form
      showCustomMeritForm,
      isSubmittingCustomMerit,
      newCustomMerit,
      addCustomMerit,
      closeCustomMeritForm
    }
  }
}
</script>

<style scoped>
.student-profile {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--background-light);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: var(--text-light);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Header Section */
.profile-header {
  background: var(--background-secondary);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.student-avatar {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #007AFF, #5856D6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
}

.student-details {
  flex: 1;
}

.student-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 1rem;
}

.separator {
  color: var(--text-light);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--background-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attendance-stat .stat-icon {
  background: linear-gradient(135deg, #34C759, #30D158);
}

.merits-stat .stat-icon {
  background: linear-gradient(135deg, #FF9500, #FF9F0A);
}

.progress-stat .stat-icon {
  background: linear-gradient(135deg, #5856D6, #007AFF);
}

.notes-stat .stat-icon {
  background: linear-gradient(135deg, #AF52DE, #BF5AF2);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

/* Content Sections */
.content-section {
  background: var(--background-secondary);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

/* Attendance Section */
.attendance-breakdown {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.attendance-item {
  text-align: center;
  padding: 1rem;
  border-radius: 12px;
  background: var(--background-light);
}

.attendance-item.present {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), rgba(48, 209, 88, 0.1));
}

.attendance-item.absent {
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.1), rgba(255, 69, 58, 0.1));
}

.attendance-item.late {
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.1), rgba(255, 159, 10, 0.1));
}

.attendance-item .count {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.attendance-item .label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.records-list {
  space-y: 0.75rem;
}

.attendance-record {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--background-light);
  border-radius: 12px;
  margin-bottom: 0.75rem;
}

.record-date {
  font-weight: 500;
  color: var(--text-color);
}

.record-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.record-status.present .status-indicator {
  background: #34C759;
}

.record-status.absent .status-indicator {
  background: #FF3B30;
}

.record-status.late .status-indicator {
  background: #FF9500;
}

.show-more {
  text-align: center;
  padding: 1rem;
  color: var(--text-light);
  font-style: italic;
}

/* Cube Progress */
.cube-progress-list {
  space-y: 1rem;
}

.cube-item {
  padding: 1rem;
  background: var(--background-light);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.cube-type {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.cube-level {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.cube-progress-bar {
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #5856D6);
  transition: width 0.3s ease;
}

/* Notes Section */
.notes-container {
  max-height: 500px;
  overflow-y: auto;
}

.notes-list {
  space-y: 1rem;
}

.note-item {
  padding: 1.25rem;
  background: var(--background-light);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.note-content {
  color: var(--text-color);
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-time {
  font-size: 0.85rem;
  color: var(--text-light);
}

.delete-btn {
  padding: 0.25rem;
  background: none;
  border: none;
  color: var(--danger-color);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.delete-btn:hover {
  background: rgba(255, 59, 48, 0.1);
}

/* Character Section */
.character-section {
  background: linear-gradient(135deg, rgba(88, 86, 214, 0.05), rgba(175, 82, 222, 0.05));
  border: 1px solid rgba(88, 86, 214, 0.1);
}

.merit-actions {
  display: flex;
  gap: 0.75rem;
}

.total-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.total-item {
  text-align: center;
  padding: 1rem;
  background: var(--background-secondary);
  border-radius: 12px;
}

.total-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
}

.total-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.character-categories {
  space-y: 1rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--background-secondary);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-icon {
  font-size: 1.25rem;
}

.category-name {
  font-weight: 500;
  color: var(--text-color);
}

.category-points {
  font-weight: 600;
  color: var(--primary-color);
}

/* Merit Activity */
.merit-activity h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 2rem 0 1rem 0;
}

.activity-list {
  space-y: 1rem;
}

.activity-item {
  padding: 1rem;
  background: var(--background-light);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.activity-description {
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-points {
  font-weight: 600;
  font-size: 0.9rem;
}

.activity-points.positive {
  color: #34C759;
}

.activity-points.negative {
  color: #FF3B30;
}

.activity-time {
  font-size: 0.85rem;
  color: var(--text-light);
}

/* Buttons */
.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.add-btn.secondary {
  background: var(--warning-color);
}

.add-btn.secondary:hover {
  background: #E6750A;
}

/* No Data States */
.no-data {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-light);
}

.no-data.small {
  padding: 1.5rem;
}

.no-data-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: var(--background-secondary);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.close-btn {
  padding: 0.5rem;
  background: var(--background-light);
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--border-color);
  color: var(--text-color);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--background-light);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--background-secondary);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: var(--text-light);
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--background-light);
  color: var(--text-color);
}

.btn-secondary:hover {
  background: var(--border-color);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .student-profile {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .student-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }
  
  .avatar-section {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .attendance-breakdown {
    grid-template-columns: 1fr;
  }
  
  .merit-actions {
    flex-direction: column;
  }
  
  .total-stats {
    grid-template-columns: 1fr;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>