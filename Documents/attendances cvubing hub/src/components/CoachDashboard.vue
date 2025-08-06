<template>
  <div class="coach-dashboard">
    <!-- Welcome Header -->
    <div class="welcome-header">
      <div class="header-content">
        <div class="welcome-text">
          <h1>Welcome back, Coach! 👋</h1>
          <p class="welcome-subtitle">Today is {{ currentDate }} - Ready to inspire young minds?</p>
        </div>
        <div class="quick-actions">
          <button class="action-btn primary" @click="showAttendanceQuickTake = true">
            <div class="btn-icon">📋</div>
            <div class="btn-text">
              <span class="btn-title">Quick Attendance</span>
              <span class="btn-subtitle">Mark attendance fast</span>
            </div>
          </button>
          <button class="action-btn secondary" @click="showAchievementModal = true">
            <div class="btn-icon">🏆</div>
            <div class="btn-text">
              <span class="btn-title">Award Achievement</span>
              <span class="btn-subtitle">Recognize students</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card classes-stat">
        <div class="stat-icon">📚</div>
        <div class="stat-content">
          <div class="stat-value">{{ todaysClasses.length }}</div>
          <div class="stat-label">Classes Today</div>
        </div>
      </div>
      <div class="stat-card students-stat">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalStudents }}</div>
          <div class="stat-label">Total Students</div>
        </div>
      </div>
      <div class="stat-card achievements-stat">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <div class="stat-value">{{ weeklyAchievements }}</div>
          <div class="stat-label">This Week</div>
        </div>
      </div>
      <div class="stat-card progress-stat">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-value">{{ overallProgress }}%</div>
          <div class="stat-label">Progress</div>
        </div>
      </div>
    </div>

    <!-- Quick Navigation -->
    <div class="navigation-section">
      <h2>🚀 Quick Access</h2>
      <div class="nav-grid">
        <router-link to="/character-leaderboard" class="nav-card character-nav">
          <div class="nav-header">
            <div class="nav-icon">🏆</div>
            <div class="nav-badge">New</div>
          </div>
          <div class="nav-content">
            <h3>Character Leaderboard</h3>
            <p>View student character development progress and achievements</p>
          </div>
          <div class="nav-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </router-link>

        <router-link to="/tch-curriculum" class="nav-card tch-nav">
          <div class="nav-header">
            <div class="nav-icon">🧩</div>
            <div class="nav-badge featured">Featured</div>
          </div>
          <div class="nav-content">
            <h3>TCH Curriculum</h3>
            <p>Grade 1 "Little Cubers, Big Dreams" - 8-week character development program</p>
          </div>
          <div class="nav-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </router-link>

        <router-link to="/gamification" class="nav-card">
          <div class="nav-header">
            <div class="nav-icon">🎮</div>
          </div>
          <div class="nav-content">
            <h3>Gamification Hub</h3>
            <p>Student achievements, rewards, and engagement metrics</p>
          </div>
          <div class="nav-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </router-link>

        <router-link to="/workbook" class="nav-card">
          <div class="nav-header">
            <div class="nav-icon">📚</div>
          </div>
          <div class="nav-content">
            <h3>Coaching Workbook</h3>
            <p>Teaching resources, lesson plans, and guidance materials</p>
          </div>
          <div class="nav-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </router-link>

        <router-link to="/term-manager" class="nav-card">
          <div class="nav-header">
            <div class="nav-icon">📋</div>
          </div>
          <div class="nav-content">
            <h3>Term Manager</h3>
            <p>Manage student enrollment, terms, and status updates</p>
          </div>
          <div class="nav-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </router-link>

        <router-link to="/sales-flow" class="nav-card">
          <div class="nav-header">
            <div class="nav-icon">💼</div>
          </div>
          <div class="nav-content">
            <h3>Sales Flow</h3>
            <p>Manage student pipeline and enrollment process</p>
          </div>
          <div class="nav-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </router-link>

        <router-link to="/schools" class="nav-card">
          <div class="nav-header">
            <div class="nav-icon">🏫</div>
          </div>
          <div class="nav-content">
            <h3>Schools & Classes</h3>
            <p>View and manage all schools, classes, and students</p>
          </div>
          <div class="nav-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Today's Classes -->
      <div class="content-section">
        <div class="section-header">
          <h2>📚 Today's Classes</h2>
          <span class="section-count">{{ todaysClasses.length }} classes</span>
        </div>
        
        <div v-if="todaysClasses.length" class="classes-list">
          <div v-for="classItem in todaysClasses" :key="classItem.id" class="class-card">
            <div class="class-info">
              <div class="class-details">
                <h3 class="class-name">{{ classItem.name }}</h3>
                <p class="class-meta">{{ classItem.studentCount }} students • {{ classItem.school }}</p>
              </div>
              <div class="class-status">
                <div :class="['status-indicator', getStatusClass(classItem.attendanceStatus)]"></div>
                <span class="status-text">{{ formatStatus(classItem.attendanceStatus) }}</span>
              </div>
            </div>
            <router-link :to="'/class/' + classItem.id" class="class-action">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </router-link>
          </div>
        </div>
        <div v-else class="no-data">
          <div class="no-data-icon">📭</div>
          <p>No classes scheduled for today</p>
        </div>
      </div>

      <!-- Top Performers -->
      <div class="content-section">
        <div class="section-header">
          <h2>⭐ Top Performers</h2>
          <router-link to="/character-leaderboard" class="view-all-link">View All</router-link>
        </div>
        
        <div v-if="topPerformers.length" class="performers-list">
          <div v-for="(student, index) in topPerformers.slice(0, 5)" :key="student.id" class="performer-card">
            <div class="performer-rank">{{ index + 1 }}</div>
            <div class="performer-avatar">
              {{ student.name.charAt(0).toUpperCase() }}
            </div>
            <div class="performer-info">
              <h4 class="performer-name">{{ student.name }}</h4>
              <p class="performer-class">{{ student.className || 'Class N/A' }}</p>
            </div>
            <div class="performer-points">
              <span class="points-value">{{ student.totalPoints || 0 }}</span>
              <span class="points-label">pts</span>
            </div>
          </div>
        </div>
        <div v-else class="no-data small">
          <div class="no-data-icon">🏆</div>
          <p>No performance data yet</p>
        </div>
      </div>
    </div>

    <!-- Curriculum Progress -->
    <div class="curriculum-section">
      <div class="section-header">
        <h2>📖 Curriculum Progress</h2>
        <button class="refresh-btn" @click="loadData">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
          Refresh
        </button>
      </div>
      
      <div v-if="currentLessons.length" class="curriculum-grid">
        <div v-for="lesson in currentLessons" :key="lesson.id" class="lesson-card">
          <div class="lesson-header">
            <div class="lesson-icon">{{ lesson.icon || '📚' }}</div>
            <div class="lesson-info">
              <h4>{{ lesson.title }}</h4>
              <p class="lesson-description">{{ lesson.description }}</p>
            </div>
          </div>
          
          <div class="lesson-progress">
            <div class="progress-info">
              <span class="progress-label">Progress</span>
              <span class="progress-percentage">{{ lesson.progress || 0 }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (lesson.progress || 0) + '%' }"></div>
            </div>
          </div>
          
          <div class="lesson-actions">
            <button class="lesson-btn" @click="openLesson(lesson)">
              {{ (lesson.progress || 0) === 100 ? 'Review Lesson' : 'Continue Lesson' }}
            </button>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <div class="no-data-icon">📚</div>
        <p>No curriculum data available</p>
      </div>
    </div>

    <!-- Quick Attendance Modal -->
    <div v-if="showAttendanceQuickTake" class="modal-overlay" @click.self="closeQuickAttendance">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Quick Attendance</h3>
          <button @click="closeQuickAttendance" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>Select a class to take attendance:</p>
          <div class="class-options">
            <button v-for="classItem in todaysClasses" :key="classItem.id" 
                    @click="navigateToClass(classItem.id)" class="class-option">
              <div class="option-icon">📚</div>
              <div class="option-info">
                <span class="option-name">{{ classItem.name }}</span>
                <span class="option-meta">{{ classItem.studentCount }} students</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievement Modal -->
    <div v-if="showAchievementModal" class="modal-overlay" @click.self="closeAchievementModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Award Achievement</h3>
          <button @click="closeAchievementModal" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>Feature coming soon! Navigate to a student profile to award achievements.</p>
          <div class="modal-actions">
            <button @click="closeAchievementModal" class="btn-secondary">Close</button>
            <router-link to="/students" @click="closeAchievementModal" class="btn-primary">View Students</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '../stores/student'
import { useSchoolStore } from '../stores/school'
import { useClassStore } from '../stores/class'

export default {
  name: 'CoachDashboard',
  
  setup() {
    const router = useRouter()
    const studentStore = useStudentStore()
    const schoolStore = useSchoolStore()
    const classStore = useClassStore()
    
    const showAttendanceQuickTake = ref(false)
    const showAchievementModal = ref(false)
    const isLoading = ref(true)
    
    // Computed properties
    const currentDate = computed(() => {
      return new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    })

    const todaysClasses = computed(() => {
      // Mock data for demo - replace with real data
      return [
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Beginners Cubing',
          studentCount: 5,
          school: 'Demo School',
          attendanceStatus: 'pending'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003', 
          name: 'Advanced Techniques',
          studentCount: 3,
          school: 'Demo School',
          attendanceStatus: 'completed'
        }
      ]
    })

    const totalStudents = computed(() => {
      return studentStore.students?.length || 0
    })

    const weeklyAchievements = computed(() => {
      // Calculate from student merit points this week
      if (!studentStore.students) return 0
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      return studentStore.students.reduce((total, student) => {
        if (student.merit_points) {
          const recentMerits = student.merit_points.filter(merit => 
            new Date(merit.created_at) > oneWeekAgo
          )
          return total + recentMerits.length
        }
        return total
      }, 0)
    })

    const overallProgress = computed(() => {
      // Calculate based on cube progress
      if (!studentStore.students || studentStore.students.length === 0) return 0
      
      let totalProgress = 0
      let studentCount = 0
      
      studentStore.students.forEach(student => {
        if (student.cube_progress && student.cube_progress.length > 0) {
          const avgProgress = student.cube_progress.reduce((sum, progress) => {
            const levels = ['beginner', 'intermediate', 'advanced', 'expert']
            const levelIndex = levels.indexOf(progress.current_level?.toLowerCase() || '')
            return sum + (levelIndex >= 0 ? ((levelIndex + 1) / levels.length) * 100 : 0)
          }, 0) / student.cube_progress.length
          
          totalProgress += avgProgress
          studentCount++
        }
      })
      
      return studentCount > 0 ? Math.round(totalProgress / studentCount) : 0
    })

    const topPerformers = computed(() => {
      if (!studentStore.students) return []
      
      return studentStore.students
        .map(student => ({
          id: student.id,
          name: student.name,
          totalPoints: student.merit_points ? 
            student.merit_points.reduce((sum, merit) => sum + merit.points, 0) : 0,
          className: student.class?.name,
          class_id: student.class_id
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 10)
    })

    const currentLessons = computed(() => {
      // Mock curriculum data - replace with real curriculum system
      return [
        {
          id: 1,
          title: 'Building Confidence Through Cubing',
          description: 'Help students overcome fear and build self-confidence',
          icon: '💪',
          progress: 75
        },
        {
          id: 2,
          title: 'Problem-Solving Techniques',
          description: 'Teach systematic approaches to complex challenges',
          icon: '🧠',
          progress: 45
        },
        {
          id: 3,
          title: 'Leadership Development',
          description: 'Foster leadership skills through peer mentoring',
          icon: '⭐',
          progress: 30
        }
      ]
    })

    // Methods
    const loadData = async () => {
      isLoading.value = true
      try {
        // Load all necessary data
        await Promise.all([
          schoolStore.fetchSchools(),
          studentStore.fetchAllStudents()
        ])
        
        // Load classes for all schools
        for (const school of schoolStore.schools) {
          try {
            await classStore.fetchClasses(school.id)
          } catch (error) {
            console.warn('Could not load classes for school:', school.id)
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        isLoading.value = false
      }
    }

    const navigateToClass = (classId) => {
      router.push(`/class/${classId}`)
      closeQuickAttendance()
    }

    const openLesson = (lesson) => {
      console.log('Opening lesson:', lesson.title)
      // Implement lesson opening logic
    }

    const closeQuickAttendance = () => {
      showAttendanceQuickTake.value = false
    }

    const closeAchievementModal = () => {
      showAchievementModal.value = false
    }

    const getStatusClass = (status) => {
      const statusMap = {
        'pending': 'warning',
        'completed': 'success',
        'in-progress': 'info'
      }
      return statusMap[status] || 'default'
    }

    const formatStatus = (status) => {
      const statusMap = {
        'pending': 'Pending',
        'completed': 'Complete',
        'in-progress': 'In Progress'
      }
      return statusMap[status] || 'Unknown'
    }

    // Lifecycle
    onMounted(() => {
      loadData()
      console.log('Coach dashboard loaded')
    })

    return {
      currentDate,
      todaysClasses,
      totalStudents,
      weeklyAchievements,
      overallProgress,
      topPerformers,
      currentLessons,
      showAttendanceQuickTake,
      showAchievementModal,
      isLoading,
      navigateToClass,
      openLesson,
      closeQuickAttendance,
      closeAchievementModal,
      getStatusClass,
      formatStatus,
      loadData
    }
  }
}
</script>

<style scoped>
.coach-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--background-light);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

/* Welcome Header */
.welcome-header {
  background: linear-gradient(135deg, #007AFF, #5856D6);
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.welcome-text h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.quick-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 180px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.5rem;
}

.btn-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.btn-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.btn-subtitle {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-top: 0.1rem;
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

.classes-stat .stat-icon {
  background: linear-gradient(135deg, #007AFF, #0056CC);
}

.students-stat .stat-icon {
  background: linear-gradient(135deg, #34C759, #30D158);
}

.achievements-stat .stat-icon {
  background: linear-gradient(135deg, #FF9500, #FF9F0A);
}

.progress-stat .stat-icon {
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

/* Navigation Section */
.navigation-section {
  margin-bottom: 3rem;
}

.navigation-section h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1.5rem;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.nav-card {
  background: var(--background-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.nav-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-icon {
  font-size: 1.75rem;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--primary-color), #5856D6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-badge {
  background: var(--success-color);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
}

.nav-content {
  flex: 1;
}

.nav-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.nav-content p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

.nav-arrow {
  color: var(--text-light);
}

.character-nav {
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.05), rgba(255, 159, 10, 0.05));
  border: 1px solid rgba(255, 149, 0, 0.2);
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
  margin-bottom: 3rem;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* Content Sections */
.content-section {
  background: var(--background-secondary);
  border-radius: 16px;
  padding: 2rem;
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

.section-count {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.view-all-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
}

.view-all-link:hover {
  text-decoration: underline;
}

/* Classes List */
.classes-list {
  space-y: 1rem;
}

.class-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background: var(--background-light);
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: background-color 0.2s ease;
}

.class-card:hover {
  background: var(--border-color);
}

.class-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.class-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.25rem 0;
}

.class-meta {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.class-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.success {
  background: #34C759;
}

.status-indicator.warning {
  background: #FF9500;
}

.status-indicator.info {
  background: #007AFF;
}

.status-indicator.default {
  background: var(--text-light);
}

.status-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.class-action {
  color: var(--text-light);
  transition: color 0.2s ease;
}

.class-action:hover {
  color: var(--primary-color);
}

/* Performers List */
.performers-list {
  space-y: 1rem;
}

.performer-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--background-light);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.performer-rank {
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.performer-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #FF9500, #FF9F0A);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.performer-info {
  flex: 1;
}

.performer-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.25rem 0;
}

.performer-class {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin: 0;
}

.performer-points {
  text-align: right;
}

.points-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}

.points-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-left: 0.25rem;
}

/* Curriculum Section */
.curriculum-section {
  background: var(--background-secondary);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--background-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: var(--border-color);
  color: var(--text-color);
}

.curriculum-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.lesson-card {
  background: var(--background-light);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  transition: border-color 0.2s ease;
}

.lesson-card:hover {
  border-color: var(--primary-color);
}

.lesson-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.lesson-icon {
  font-size: 1.5rem;
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, var(--primary-color), #5856D6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lesson-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.lesson-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

.lesson-progress {
  margin-bottom: 1.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.progress-percentage {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-color);
}

.progress-bar {
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), #5856D6);
  transition: width 0.3s ease;
}

.lesson-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.lesson-btn:hover {
  background: var(--primary-dark);
}

/* No Data States */
.no-data {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-light);
}

.no-data.small {
  padding: 2rem 1rem;
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

.modal-body p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.class-options {
  space-y: 1rem;
}

.class-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--background-light);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.class-option:hover {
  background: var(--border-color);
  border-color: var(--primary-color);
}

.option-icon {
  font-size: 1.5rem;
}

.option-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.option-name {
  font-weight: 600;
  color: var(--text-color);
}

.option-meta {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
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
  .coach-dashboard {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .welcome-text {
    text-align: center;
  }
  
  .welcome-text h1 {
    font-size: 2rem;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .action-btn {
    min-width: unset;
  }
  
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .nav-grid {
    grid-template-columns: 1fr;
  }
  
  .curriculum-grid {
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