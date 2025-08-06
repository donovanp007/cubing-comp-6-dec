<template>
  <div class="gamification-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <h1>🎮 Gamification Dashboard</h1>
      <div class="header-actions">
        <button class="btn-primary" @click="showAchievementModal = true">
          <span class="icon">🏆</span>
          Award Achievement
        </button>
        <button class="btn-secondary" @click="generateParentReport">
          <span class="icon">📊</span>
          Generate Parent Report
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <h3>{{ totalAchievements }}</h3>
          <p>Total Achievements</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <h3>{{ totalPoints }}</h3>
          <p>Points Awarded</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <h3>{{ activeStudents }}</h3>
          <p>Active Students</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>{{ improvementRate }}%</h3>
          <p>Improvement Rate</p>
        </div>
      </div>
    </div>

    <!-- Leaderboard Section -->
    <div class="leaderboard-section">
      <div class="section-header">
        <h2>🏆 Leaderboard</h2>
        <div class="leaderboard-tabs">
          <button 
            v-for="tab in leaderboardTabs" 
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeLeaderboardTab === tab.id }"
            @click="activeLeaderboardTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>
      
      <div class="leaderboard-grid">
        <div 
          v-for="(student, index) in currentLeaderboard" 
          :key="student.id"
          class="leaderboard-card"
          :class="{ 
            'rank-1': index === 0, 
            'rank-2': index === 1, 
            'rank-3': index === 2 
          }"
        >
          <div class="rank-badge">{{ index + 1 }}</div>
          <div class="student-avatar">
            <img :src="student.avatar || '/default-avatar.png'" :alt="student.name">
          </div>
          <div class="student-info">
            <h4>{{ student.name }}</h4>
            <p class="student-class">{{ student.className }}</p>
            <div class="student-stats">
              <span class="points">{{ student.points }} pts</span>
              <span class="level">Level {{ student.level }}</span>
            </div>
          </div>
          <div class="achievements-preview">
            <div 
              v-for="achievement in student.recentAchievements.slice(0, 3)" 
              :key="achievement.id"
              class="achievement-icon"
              :title="achievement.name"
            >
              {{ achievement.icon }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Pillars Section -->
    <div class="pillars-section">
      <h2>🎯 Student Progress Pillars</h2>
      <div class="pillars-grid">
        <div 
          v-for="pillar in progressPillars" 
          :key="pillar.name"
          class="pillar-card"
        >
          <div class="pillar-header">
            <div class="pillar-icon">{{ pillar.icon }}</div>
            <h3>{{ pillar.name }}</h3>
          </div>
          <div class="pillar-stats">
            <div class="stat">
              <span class="label">Average Level</span>
              <span class="value">{{ pillar.averageLevel }}</span>
            </div>
            <div class="stat">
              <span class="label">Students Improving</span>
              <span class="value">{{ pillar.improvingCount }}</span>
            </div>
          </div>
          <div class="pillar-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: pillar.progressPercentage + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ pillar.progressPercentage }}% class average</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievement Gallery -->
    <div class="achievements-section">
      <h2>🏅 Achievement Gallery</h2>
      <div class="achievement-categories">
        <button 
          v-for="category in achievementCategories" 
          :key="category.id"
          class="category-button"
          :class="{ active: activeCategory === category.id }"
          @click="activeCategory = category.id"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-name">{{ category.name }}</span>
        </button>
      </div>
      
      <div class="achievements-grid">
        <div 
          v-for="achievement in filteredAchievements" 
          :key="achievement.id"
          class="achievement-card"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-content">
            <h4>{{ achievement.name }}</h4>
            <p>{{ achievement.description }}</p>
            <div class="achievement-stats">
              <span class="points">{{ achievement.points_required }} pts</span>
              <span class="earned">{{ achievement.earnedCount }} earned</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Parent Value Showcase -->
    <div class="parent-value-section">
      <h2>👨‍👩‍👧‍👦 Parent Value Dashboard</h2>
      <div class="value-metrics">
        <div class="metric-card">
          <div class="metric-icon">📚</div>
          <h4>Academic Growth</h4>
          <div class="metric-value">{{ academicGrowth }}%</div>
          <p>Improvement in problem-solving skills</p>
        </div>
        <div class="metric-card">
          <div class="metric-icon">💪</div>
          <h4>Confidence Building</h4>
          <div class="metric-value">{{ confidenceGrowth }}%</div>
          <p>Increased confidence in challenges</p>
        </div>
        <div class="metric-card">
          <div class="metric-icon">🤝</div>
          <h4>Leadership Skills</h4>
          <div class="metric-value">{{ leadershipGrowth }}%</div>
          <p>Development in leadership abilities</p>
        </div>
        <div class="metric-card">
          <div class="metric-icon">🎨</div>
          <h4>Creative Thinking</h4>
          <div class="metric-value">{{ creativityGrowth }}%</div>
          <p>Enhancement in creative problem-solving</p>
        </div>
      </div>
    </div>

    <!-- Achievement Award Modal -->
    <div v-if="showAchievementModal" class="modal-overlay" @click="showAchievementModal = false">
      <div class="modal-content" @click.stop>
        <h3>🏆 Award Achievement</h3>
        <div class="modal-body">
          <div class="form-group">
            <label>Select Student:</label>
            <select v-model="selectedStudent">
              <option value="">Choose a student...</option>
              <option v-for="student in students" :key="student.id" :value="student.id">
                {{ student.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Select Achievement:</label>
            <select v-model="selectedAchievement">
              <option value="">Choose an achievement...</option>
              <option v-for="achievement in achievements" :key="achievement.id" :value="achievement.id">
                {{ achievement.icon }} {{ achievement.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Additional Notes:</label>
            <textarea v-model="achievementNotes" placeholder="Add context about why this achievement was earned..."></textarea>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn-primary" @click="awardAchievement">Award Achievement</button>
          <button class="btn-secondary" @click="showAchievementModal = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStudentStore } from '../stores/student'

export default {
  name: 'GamificationDashboard',
  
  setup() {
    const studentStore = useStudentStore()
    
    // Reactive data
    const showAchievementModal = ref(false)
    const activeLeaderboardTab = ref('overall')
    const activeCategory = ref('all')
    const selectedStudent = ref('')
    const selectedAchievement = ref('')
    const achievementNotes = ref('')
    
    // Mock data - replace with actual API calls
    const students = ref([
      { id: '1', name: 'Alice Johnson', className: 'Grade 5A', points: 850, level: 8, avatar: null },
      { id: '2', name: 'Bob Smith', className: 'Grade 5A', points: 720, level: 7, avatar: null },
      { id: '3', name: 'Carol Davis', className: 'Grade 5B', points: 690, level: 6, avatar: null },
    ])
    
    const achievements = ref([
      { id: '1', name: 'Quick Learner', description: 'Mastered concept quickly', icon: '⚡', points_required: 50, earnedCount: 12 },
      { id: '2', name: 'Team Captain', description: 'Led team successfully', icon: '🏆', points_required: 75, earnedCount: 8 },
      { id: '3', name: 'Creative Thinker', description: 'Found unique solutions', icon: '💡', points_required: 100, earnedCount: 15 },
    ])
    
    const achievementCategories = ref([
      { id: 'all', name: 'All', icon: '🎯' },
      { id: 'academic', name: 'Academic', icon: '🎓' },
      { id: 'leadership', name: 'Leadership', icon: '👑' },
      { id: 'creativity', name: 'Creativity', icon: '🎨' },
      { id: 'confidence', name: 'Confidence', icon: '💪' },
    ])
    
    const progressPillars = ref([
      { name: 'Confidence', icon: '💪', averageLevel: 6.2, improvingCount: 24, progressPercentage: 78 },
      { name: 'Leadership', icon: '👑', averageLevel: 5.8, improvingCount: 19, progressPercentage: 72 },
      { name: 'Problem Solving', icon: '🧩', averageLevel: 7.1, improvingCount: 31, progressPercentage: 85 },
      { name: 'Creativity', icon: '🎨', averageLevel: 6.5, improvingCount: 27, progressPercentage: 81 },
    ])
    
    const leaderboardTabs = ref([
      { id: 'overall', name: 'Overall' },
      { id: 'weekly', name: 'This Week' },
      { id: 'monthly', name: 'This Month' },
      { id: 'confidence', name: 'Confidence' },
      { id: 'leadership', name: 'Leadership' },
    ])
    
    // Computed properties
    const totalAchievements = computed(() => 
      achievements.value.reduce((sum, achievement) => sum + achievement.earnedCount, 0)
    )
    
    const totalPoints = computed(() => 
      students.value.reduce((sum, student) => sum + student.points, 0)
    )
    
    const activeStudents = computed(() => students.value.length)
    
    const improvementRate = computed(() => 85) // Mock calculation
    
    const currentLeaderboard = computed(() => {
      return students.value
        .map(student => ({
          ...student,
          recentAchievements: achievements.value.slice(0, 3)
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 10)
    })
    
    const filteredAchievements = computed(() => {
      if (activeCategory.value === 'all') {
        return achievements.value
      }
      return achievements.value.filter(achievement => 
        achievement.category === activeCategory.value
      )
    })
    
    const academicGrowth = computed(() => 92)
    const confidenceGrowth = computed(() => 88)
    const leadershipGrowth = computed(() => 76)
    const creativityGrowth = computed(() => 83)
    
    // Methods
    const awardAchievement = async () => {
      if (!selectedStudent.value || !selectedAchievement.value) {
        alert('Please select both a student and an achievement')
        return
      }
      
      try {
        // In a real app, this would call an API
        console.log('Awarding achievement:', {
          studentId: selectedStudent.value,
          achievementId: selectedAchievement.value,
          notes: achievementNotes.value
        })
        
        alert('Achievement awarded successfully!')
        showAchievementModal.value = false
        selectedStudent.value = ''
        selectedAchievement.value = ''
        achievementNotes.value = ''
      } catch (error) {
        alert('Error awarding achievement: ' + error.message)
      }
    }
    
    const generateParentReport = () => {
      // In a real app, this would generate and send parent reports
      alert('Parent reports generated and sent!')
    }
    
    onMounted(() => {
      // Load initial data
      studentStore.fetchAllStudents()
    })
    
    return {
      showAchievementModal,
      activeLeaderboardTab,
      activeCategory,
      selectedStudent,
      selectedAchievement,
      achievementNotes,
      students,
      achievements,
      achievementCategories,
      progressPillars,
      leaderboardTabs,
      totalAchievements,
      totalPoints,
      activeStudents,
      improvementRate,
      currentLeaderboard,
      filteredAchievements,
      academicGrowth,
      confidenceGrowth,
      leadershipGrowth,
      creativityGrowth,
      awardAchievement,
      generateParentReport
    }
  }
}
</script>

<style scoped>
.gamification-dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #2d3748;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.stat-content p {
  color: #718096;
  margin: 4px 0 0 0;
  font-size: 0.9rem;
}

.leaderboard-section, .pillars-section, .achievements-section, .parent-value-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 1.8rem;
  color: #2d3748;
  margin: 0;
}

.leaderboard-tabs {
  display: flex;
  gap: 8px;
}

.tab-button {
  padding: 8px 16px;
  border: none;
  background: #f7fafc;
  color: #4a5568;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  background: #edf2f7;
}

.tab-button.active {
  background: #667eea;
  color: white;
}

.leaderboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.leaderboard-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
}

.leaderboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.leaderboard-card.rank-1 {
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  border-color: #ffd700;
}

.leaderboard-card.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #1e3c72 100%);
  border-color: #c0c0c0;
}

.leaderboard-card.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #8b4513 100%);
  border-color: #cd7f32;
}

.rank-badge {
  background: #667eea;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.student-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background: #e2e8f0;
}

.student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-info {
  flex: 1;
}

.student-info h4 {
  margin: 0 0 4px 0;
  color: #2d3748;
  font-size: 1.1rem;
}

.student-class {
  color: #718096;
  font-size: 0.9rem;
  margin: 0 0 8px 0;
}

.student-stats {
  display: flex;
  gap: 12px;
}

.student-stats span {
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.achievements-preview {
  display: flex;
  gap: 4px;
}

.achievement-icon {
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.pillar-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
}

.pillar-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pillar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pillar-icon {
  font-size: 2rem;
}

.pillar-header h3 {
  color: #2d3748;
  margin: 0;
}

.pillar-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pillar-stats .stat {
  text-align: center;
}

.pillar-stats .label {
  display: block;
  color: #718096;
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.pillar-stats .value {
  display: block;
  color: #2d3748;
  font-size: 1.2rem;
  font-weight: 600;
}

.pillar-progress {
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  color: #718096;
  font-size: 0.9rem;
}

.achievement-categories {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.category-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  background: #f7fafc;
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-button:hover {
  background: #edf2f7;
}

.category-button.active {
  background: #667eea;
  color: white;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.achievement-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.achievement-card .achievement-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.achievement-content {
  flex: 1;
}

.achievement-content h4 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 1.1rem;
}

.achievement-content p {
  color: #718096;
  margin: 0 0 12px 0;
  font-size: 0.9rem;
}

.achievement-stats {
  display: flex;
  gap: 12px;
}

.achievement-stats span {
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.value-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.metric-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.metric-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.metric-card h4 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 8px 0;
}

.metric-card p {
  opacity: 0.9;
  font-size: 0.9rem;
  margin: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin: 0 0 24px 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 600;
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .btn-primary, .btn-secondary {
    justify-content: center;
  }
  
  .leaderboard-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .achievement-categories {
    justify-content: center;
  }
  
  .modal-content {
    margin: 20px;
    padding: 24px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>