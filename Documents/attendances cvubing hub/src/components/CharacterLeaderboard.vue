<template>
  <div class="character-leaderboard">
    <div class="header">
      <h1>🏆 TCH Character Development Leaderboard</h1>
      <p class="description">Celebrating character growth and balanced development</p>
    </div>

    <!-- Overall Leaderboard -->
    <div class="leaderboard-section">
      <div class="section-header">
        <h2>🌟 Overall Character Champions</h2>
        <div class="filter-controls">
          <select v-model="selectedClass" @change="filterStudents">
            <option value="">All Classes</option>
            <option v-for="classItem in availableClasses" :key="classItem.id" :value="classItem.id">
              {{ classItem.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="leaderboard-grid">
        <div v-for="(student, index) in topStudents" :key="student.id" class="leaderboard-card" :class="getRankClass(index)">
          <div class="rank-badge">
            <span class="rank-number">{{ index + 1 }}</span>
            <div class="rank-icon">{{ getRankIcon(index) }}</div>
          </div>
          
          <div class="student-info">
            <h3>{{ student.name }}</h3>
            <p class="class-name">{{ getClassName(student.class_id) }}</p>
          </div>
          
          <div class="character-stats">
            <div class="total-points">
              <span class="points-number">{{ student.totalPoints }}</span>
              <span class="points-label">Points</span>
            </div>
            <div class="sticker-count">
              <span class="sticker-number">{{ student.totalStickers }}</span>
              <span class="sticker-label">Stickers</span>
            </div>
          </div>
          
          <div class="character-breakdown">
            <div class="character-categories">
              <div class="category-mini persistence" :title="`Persistence Power: ${student.persistencePoints} points`">
                <span class="category-emoji">🎯</span>
                <span class="category-points">{{ student.persistencePoints }}</span>
              </div>
              <div class="category-mini leadership" :title="`Leadership Light: ${student.leadershipPoints} points`">
                <span class="category-emoji">🤝</span>
                <span class="category-points">{{ student.leadershipPoints }}</span>
              </div>
              <div class="category-mini problem-solver" :title="`Problem Solver: ${student.problemSolverPoints} points`">
                <span class="category-emoji">🧠</span>
                <span class="category-points">{{ student.problemSolverPoints }}</span>
              </div>
              <div class="category-mini community" :title="`Community Builder: ${student.communityBuilderPoints} points`">
                <span class="category-emoji">❤️</span>
                <span class="category-points">{{ student.communityBuilderPoints }}</span>
              </div>
            </div>
          </div>
          
          <div class="balance-indicator">
            <div class="balance-circle" :class="getBalanceClass(student.balanceScore)">
              <span class="balance-score">{{ student.balanceScore }}</span>
            </div>
            <span class="balance-label">Balance</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Champions -->
    <div class="category-champions">
      <h2>🏅 Category Champions</h2>
      <div class="champions-grid">
        <div class="champion-card persistence">
          <div class="champion-header">
            <span class="champion-emoji">🎯</span>
            <h3>Persistence Power Champion</h3>
          </div>
          <div class="champion-student" v-if="persistenceChampion">
            <h4>{{ persistenceChampion.name }}</h4>
            <p>{{ persistenceChampion.persistencePoints }} points</p>
          </div>
          <div class="champion-student" v-else>
            <p>No data yet</p>
          </div>
        </div>

        <div class="champion-card leadership">
          <div class="champion-header">
            <span class="champion-emoji">🤝</span>
            <h3>Leadership Light Champion</h3>
          </div>
          <div class="champion-student" v-if="leadershipChampion">
            <h4>{{ leadershipChampion.name }}</h4>
            <p>{{ leadershipChampion.leadershipPoints }} points</p>
          </div>
          <div class="champion-student" v-else>
            <p>No data yet</p>
          </div>
        </div>

        <div class="champion-card problem-solver">
          <div class="champion-header">
            <span class="champion-emoji">🧠</span>
            <h3>Problem Solver Champion</h3>
          </div>
          <div class="champion-student" v-if="problemSolverChampion">
            <h4>{{ problemSolverChampion.name }}</h4>
            <p>{{ problemSolverChampion.problemSolverPoints }} points</p>
          </div>
          <div class="champion-student" v-else>
            <p>No data yet</p>
          </div>
        </div>

        <div class="champion-card community">
          <div class="champion-header">
            <span class="champion-emoji">❤️</span>
            <h3>Community Builder Champion</h3>
          </div>
          <div class="champion-student" v-if="communityChampion">
            <h4>{{ communityChampion.name }}</h4>
            <p>{{ communityChampion.communityBuilderPoints }} points</p>
          </div>
          <div class="champion-student" v-else>
            <p>No data yet</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Most Balanced Students -->
    <div class="balanced-students">
      <h2>⚖️ Most Balanced Character Development</h2>
      <p class="section-description">Students who show excellent growth across all character areas</p>
      
      <div class="balanced-grid">
        <div v-for="student in mostBalancedStudents" :key="student.id" class="balanced-card">
          <div class="student-avatar">
            <span class="avatar-initial">{{ student.name.charAt(0) }}</span>
          </div>
          <div class="student-details">
            <h3>{{ student.name }}</h3>
            <p class="class-name">{{ getClassName(student.class_id) }}</p>
            <div class="balance-info">
              <span class="balance-score-large">{{ student.balanceScore }}%</span>
              <span class="balance-description">{{ getBalanceDescription(student.balanceScore) }}</span>
            </div>
          </div>
          <div class="category-distribution">
            <div class="distribution-item">
              <span class="category-emoji">🎯</span>
              <span class="category-count">{{ student.persistenceStickers }}</span>
            </div>
            <div class="distribution-item">
              <span class="category-emoji">🤝</span>
              <span class="category-count">{{ student.leadershipStickers }}</span>
            </div>
            <div class="distribution-item">
              <span class="category-emoji">🧠</span>
              <span class="category-count">{{ student.problemSolverStickers }}</span>
            </div>
            <div class="distribution-item">
              <span class="category-emoji">❤️</span>
              <span class="category-count">{{ student.communityBuilderStickers }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStudentStore } from '../stores/student'

export default {
  name: 'CharacterLeaderboard',
  
  setup() {
    const studentStore = useStudentStore()
    const selectedClass = ref('')
    
    // Fetch all students on component mount
    onMounted(async () => {
      try {
        await studentStore.fetchAllStudents()
      } catch (error) {
        console.error('Error loading students:', error)
      }
    })

    // Available classes for filtering
    const availableClasses = computed(() => {
      const classes = []
      studentStore.students.forEach(student => {
        if (student.class && !classes.find(c => c.id === student.class.id)) {
          classes.push(student.class)
        }
      })
      return classes
    })

    // Filtered students based on selected class
    const filteredStudents = computed(() => {
      if (!selectedClass.value) return studentStore.characterLeaderboard
      return studentStore.characterLeaderboard.filter(student => student.class_id === selectedClass.value)
    })

    // Top 10 students for overall leaderboard
    const topStudents = computed(() => {
      return filteredStudents.value.slice(0, 10)
    })

    // Category champions
    const persistenceChampion = computed(() => {
      return filteredStudents.value.reduce((prev, current) => 
        (prev.persistencePoints > current.persistencePoints) ? prev : current
      )
    })

    const leadershipChampion = computed(() => {
      return filteredStudents.value.reduce((prev, current) => 
        (prev.leadershipPoints > current.leadershipPoints) ? prev : current
      )
    })

    const problemSolverChampion = computed(() => {
      return filteredStudents.value.reduce((prev, current) => 
        (prev.problemSolverPoints > current.problemSolverPoints) ? prev : current
      )
    })

    const communityChampion = computed(() => {
      return filteredStudents.value.reduce((prev, current) => 
        (prev.communityBuilderPoints > current.communityBuilderPoints) ? prev : current
      )
    })

    // Most balanced students (top 6 with highest balance score)
    const mostBalancedStudents = computed(() => {
      return filteredStudents.value
        .filter(student => student.totalStickers >= 4) // Must have at least 4 stickers
        .sort((a, b) => b.balanceScore - a.balanceScore)
        .slice(0, 6)
    })

    // Helper methods
    const getRankClass = (index) => {
      if (index === 0) return 'rank-first'
      if (index === 1) return 'rank-second'
      if (index === 2) return 'rank-third'
      return 'rank-other'
    }

    const getRankIcon = (index) => {
      if (index === 0) return '🥇'
      if (index === 1) return '🥈'
      if (index === 2) return '🥉'
      return '🏅'
    }

    const getBalanceClass = (score) => {
      if (score >= 80) return 'balance-excellent'
      if (score >= 60) return 'balance-good'
      if (score >= 40) return 'balance-fair'
      return 'balance-needs-work'
    }

    const getBalanceDescription = (score) => {
      if (score >= 80) return 'Excellent Balance'
      if (score >= 60) return 'Good Balance'
      if (score >= 40) return 'Fair Balance'
      return 'Needs Balance'
    }

    const getClassName = (classId) => {
      const classItem = availableClasses.value.find(c => c.id === classId)
      return classItem ? classItem.name : 'Unknown Class'
    }

    const filterStudents = () => {
      // This method is called when the filter changes
      // The computed properties will automatically update
    }

    return {
      selectedClass,
      availableClasses,
      topStudents,
      persistenceChampion,
      leadershipChampion,
      problemSolverChampion,
      communityChampion,
      mostBalancedStudents,
      getRankClass,
      getRankIcon,
      getBalanceClass,
      getBalanceDescription,
      getClassName,
      filterStudents
    }
  }
}
</script>

<style scoped>
.character-leaderboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.description {
  font-size: 1.1rem;
  color: #718096;
  margin: 0;
}

.leaderboard-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.filter-controls select {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.leaderboard-grid {
  display: grid;
  gap: 1.5rem;
}

.leaderboard-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.leaderboard-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.leaderboard-card.rank-first {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  border-color: #ffd700;
}

.leaderboard-card.rank-second {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
  border-color: #c0c0c0;
}

.leaderboard-card.rank-third {
  background: linear-gradient(135deg, #cd7f32 0%, #b5651d 100%);
  border-color: #cd7f32;
}

.rank-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
}

.rank-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.rank-icon {
  font-size: 2rem;
}

.student-info {
  flex: 1;
}

.student-info h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.class-name {
  color: #718096;
  margin: 0;
  font-size: 0.9rem;
}

.character-stats {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.total-points, .sticker-count {
  text-align: center;
}

.points-number, .sticker-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.points-label, .sticker-label {
  font-size: 0.8rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.character-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.character-categories {
  display: flex;
  gap: 0.5rem;
}

.category-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  min-width: 50px;
}

.category-mini.persistence {
  border-left: 3px solid #ffd700;
}

.category-mini.leadership {
  border-left: 3px solid #40e0d0;
}

.category-mini.problem-solver {
  border-left: 3px solid #ff6b6b;
}

.category-mini.community {
  border-left: 3px solid #4ecdc4;
}

.category-emoji {
  font-size: 1.2rem;
}

.category-points {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.balance-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.balance-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid;
}

.balance-circle.balance-excellent {
  background: #2ecc71;
  border-color: #27ae60;
  color: white;
}

.balance-circle.balance-good {
  background: #f39c12;
  border-color: #e67e22;
  color: white;
}

.balance-circle.balance-fair {
  background: #e74c3c;
  border-color: #c0392b;
  color: white;
}

.balance-circle.balance-needs-work {
  background: #95a5a6;
  border-color: #7f8c8d;
  color: white;
}

.balance-score {
  font-size: 0.9rem;
  font-weight: bold;
}

.balance-label {
  font-size: 0.8rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-champions {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.category-champions h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.champions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.champion-card {
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.champion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.champion-card.persistence {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
}

.champion-card.leadership {
  background: linear-gradient(135deg, #40e0d0 0%, #48d1cc 100%);
}

.champion-card.problem-solver {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
}

.champion-card.community {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.champion-header {
  margin-bottom: 1rem;
}

.champion-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.champion-header h3 {
  color: white;
  margin: 0;
  font-size: 1.1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.champion-student h4 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.champion-student p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.balanced-students {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.balanced-students h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.section-description {
  text-align: center;
  color: #718096;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.balanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.balanced-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  transition: all 0.3s ease;
}

.balanced-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.student-avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.student-details {
  flex: 1;
}

.student-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: white;
}

.student-details .class-name {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.5rem 0;
}

.balance-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.balance-score-large {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
}

.balance-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.category-distribution {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
}

.distribution-item .category-emoji {
  font-size: 1rem;
}

.category-count {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

@media (max-width: 768px) {
  .leaderboard-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .character-categories {
    justify-content: center;
  }
  
  .champions-grid {
    grid-template-columns: 1fr;
  }
  
  .balanced-card {
    flex-direction: column;
    text-align: center;
  }
  
  .category-distribution {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>