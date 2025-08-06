<template>
  <div class="dashboard">
    <!-- iOS-inspired header -->
    <div class="header-section">
      <div class="gradient-header">
        <div class="header-content">
          <div class="welcome-text">
            <h1 class="page-title">Dashboard Overview</h1>
            <p class="page-subtitle">Welcome to your school management center</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-section">
      <div class="loading-card">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading dashboard data...</div>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-section">
      <div class="error-card">
        <div class="error-icon">⚠️</div>
        <div class="error-message">{{ error }}</div>
      </div>
    </div>
    
    <template v-else>
      <!-- Stats overview section -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card schools">
            <div class="stat-icon">🏫</div>
            <div class="stat-content">
              <div class="stat-value">{{ schoolCount }}</div>
              <div class="stat-label">Schools</div>
            </div>
            <router-link to="/schools" class="stat-link">
              <span>View All</span>
              <div class="link-arrow">→</div>
            </router-link>
          </div>
          
          <div class="stat-card classes">
            <div class="stat-icon">🎓</div>
            <div class="stat-content">
              <div class="stat-value">{{ classCount }}</div>
              <div class="stat-label">Classes</div>
            </div>
            <router-link to="/schools" class="stat-link">
              <span>View All</span>
              <div class="link-arrow">→</div>
            </router-link>
          </div>
          
          <div class="stat-card students">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <div class="stat-value">{{ studentCount }}</div>
              <div class="stat-label">Students</div>
            </div>
            <router-link to="/students" class="stat-link">
              <span>View All</span>
              <div class="link-arrow">→</div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Rankings Section -->
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">Student Rankings</h2>
          <div class="section-subtitle">Top performing students across different categories</div>
        </div>
        
        <div class="rankings-grid">
          <!-- Merit Points Rankings -->
          <div class="ranking-card merit-points">
            <div class="card-header">
              <div class="card-icon">🏆</div>
              <div class="card-title">Merit Points Leaderboard</div>
            </div>
            <div class="rankings-list">
              <div v-for="(student, index) in topStudents" :key="student.id" class="ranking-item">
                <div class="rank-badge">{{ index + 1 }}</div>
                <div class="student-info">
                  <div class="student-name">{{ student.name }}</div>
                </div>
                <div class="student-score points">{{ student.totalPoints }}</div>
              </div>
              <div v-if="!topStudents.length" class="no-data">
                <div class="no-data-icon">📊</div>
                <div class="no-data-text">No merit points recorded yet</div>
              </div>
            </div>
          </div>

          <!-- Fastest Single Solves -->
          <div class="ranking-card fastest-solves">
            <div class="card-header">
              <div class="card-icon">⚡</div>
              <div class="card-title">Fastest Single Solves</div>
            </div>
            <div class="rankings-list">
              <div v-for="(student, index) in fastestSolves" :key="student.id" class="ranking-item">
                <div class="rank-badge">{{ index + 1 }}</div>
                <div class="student-info">
                  <div class="student-name">{{ student.name }}</div>
                </div>
                <div class="student-score time">{{ formatSolveTime(student.time) }}</div>
              </div>
              <div v-if="!fastestSolves.length" class="no-data">
                <div class="no-data-icon">⏱️</div>
                <div class="no-data-text">No solve times recorded yet</div>
              </div>
            </div>
          </div>

          <!-- Best Average of 5 -->
          <div class="ranking-card best-averages">
            <div class="card-header">
              <div class="card-icon">📈</div>
              <div class="card-title">Best Average of 5</div>
            </div>
            <div class="rankings-list">
              <div v-for="(student, index) in bestAverages" :key="student.id" class="ranking-item">
                <div class="rank-badge">{{ index + 1 }}</div>
                <div class="student-info">
                  <div class="student-name">{{ student.name }}</div>
                </div>
                <div class="student-score time">{{ formatSolveTime(student.average) }}</div>
              </div>
              <div v-if="!bestAverages.length" class="no-data">
                <div class="no-data-icon">📊</div>
                <div class="no-data-text">No averages available yet</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Merit Leaderboard Component -->
      <div class="merit-leaderboard-section">
        <MeritLeaderboard />
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useSchoolStore } from '../stores/school'
import { useClassStore } from '../stores/class'
import { useStudentStore } from '../stores/student'
import MeritLeaderboard from './MeritLeaderboard.vue'

export default {
  name: 'Dashboard',
  
  components: {
    MeritLeaderboard
  },
  
  setup() {
    const schoolStore = useSchoolStore()
    const classStore = useClassStore()
    const studentStore = useStudentStore()
    
    const isLoading = ref(true)
    const error = ref(null)
    
    const loadDashboardData = async () => {
      isLoading.value = true
      error.value = null
      
      try {
        // First fetch schools
        await schoolStore.fetchSchools()
        
        // Then fetch classes for each school
        if (schoolStore.schools.length > 0) {
          const classPromises = schoolStore.schools.map(school => 
            classStore.fetchClasses(school.id).catch(err => {
              console.warn(`Failed to fetch classes for school ${school.id}:`, err)
              return [] // Return empty array on failure
            })
          )
          await Promise.allSettled(classPromises)
        }
        
        // Finally fetch all students
        await studentStore.fetchAllStudents()
      } catch (err) {
        console.error('Error loading dashboard:', err)
        error.value = 'Failed to load dashboard data. Please try refreshing the page.'
      } finally {
        isLoading.value = false
      }
    }
    
    onMounted(() => {
      loadDashboardData()
    })
    
    const schoolCount = computed(() => schoolStore.schools.length)
    const classCount = computed(() => classStore.classes.length)
    const studentCount = computed(() => studentStore.students.length)
    
    const topStudents = computed(() => studentStore.topStudents)
    const fastestSolves = computed(() => studentStore.fastestSolves)
    const bestAverages = computed(() => studentStore.bestAverages)

    const formatSolveTime = (time) => {
      if (typeof time !== 'number') return '--'
      return time.toFixed(2) + 's'
    }
    
    return {
      isLoading,
      error,
      schoolCount,
      classCount,
      studentCount,
      topStudents,
      fastestSolves,
      bestAverages,
      formatSolveTime
    }
  }
}
</script>

<style scoped>
.dashboard {
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
  position: relative;
  z-index: 1;
}

.welcome-text {
  text-align: center;
}

.page-title {
  font-family: var(--ios-font-display);
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 400;
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

/* Stats Section */
.stats-section {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  transform: translateY(-2rem);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
  transition: all 0.3s ease;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  width: 70px;
  height: 70px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.stat-content {
  text-align: center;
  margin-bottom: 1.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--ios-text-primary);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  color: var(--ios-text-secondary);
  font-weight: 600;
}

.stat-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: var(--ios-background-elevated);
  border: 1px solid var(--ios-border-light);
  border-radius: 12px;
  color: var(--ios-primary);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.stat-link:hover {
  background: var(--ios-primary);
  color: white;
  transform: translateX(4px);
  text-decoration: none;
}

.link-arrow {
  opacity: 0.7;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.stat-link:hover .link-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* Content Section */
.content-section {
  padding: 0 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-title {
  font-family: var(--ios-font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0 0 0.5rem 0;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--ios-text-secondary);
  margin: 0;
}

/* Rankings Grid */
.rankings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.ranking-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
  overflow: hidden;
  transition: all 0.3s ease;
}

.ranking-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 1.5rem 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  font-size: 1.5rem;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-family: var(--ios-font-display);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ios-text-primary);
}

.rankings-list {
  padding: 1.5rem;
  padding-top: 1rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--ios-border-light);
  transition: all 0.2s ease;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-item:hover {
  background: var(--ios-background-elevated);
  border-radius: 12px;
  padding: 1rem;
  margin: 0 -1rem;
}

.rank-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.student-info {
  flex: 1;
}

.student-name {
  font-weight: 600;
  color: var(--ios-text-primary);
  font-size: 1rem;
}

.student-score {
  font-weight: 700;
  font-size: 1rem;
}

.student-score.points {
  color: var(--ios-success);
}

.student-score.time {
  color: var(--ios-primary);
  font-family: var(--ios-font-mono);
}

.no-data {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--ios-text-tertiary);
}

.no-data-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-data-text {
  font-size: 0.95rem;
  font-weight: 500;
}

/* Merit Leaderboard Section */
.merit-leaderboard-section {
  padding: 0 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
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
  
  .page-title {
    font-size: 2.5rem;
  }
  
  .stats-section,
  .content-section,
  .merit-leaderboard-section {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .rankings-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1.5rem;
  }
  
  .stat-value {
    font-size: 2rem;
  }
}
</style>
