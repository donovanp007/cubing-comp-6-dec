<template>
  <div class="merit-leaderboard">
    <h2>Merit Points Leaderboard</h2>
    
    <div class="leaderboard-filters">
      <select v-model="selectedClass" @change="updateLeaderboard">
        <option value="all">All Classes</option>
        <option v-for="class_ in classes" :key="class_.id" :value="class_.id">
          {{ class_.name }}
        </option>
      </select>
    </div>

    <div class="leaderboard-list">
      <div v-for="(student, index) in leaderboardStudents" :key="student.id" class="leaderboard-item">
        <div class="rank">{{ index + 1 }}</div>
        <div class="student-info">
          <router-link :to="{ name: 'StudentProfile', params: { id: student.id }}" class="student-name">
            {{ student.name }}
          </router-link>
          <span class="class-name" v-if="selectedClass === 'all'">
            {{ getClassName(student.classId) }}
          </span>
        </div>
        <div class="points">{{ student.totalPoints }} points</div>
      </div>
      <div v-if="!leaderboardStudents.length" class="no-data">
        No merit points awarded yet
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStudentStore } from '../stores/student'
import { useClassStore } from '../stores/class'

export default {
  name: 'MeritLeaderboard',
  
  setup() {
    const studentStore = useStudentStore()
    const classStore = useClassStore()
    const selectedClass = ref('all')

    const classes = computed(() => classStore.classes)

    const leaderboardStudents = computed(() => {
      if (selectedClass.value === 'all') {
        return studentStore.topStudents
      } else {
        return studentStore.studentRankingsByClass(parseInt(selectedClass.value))
      }
    })

    const getClassName = (classId) => {
      const class_ = classStore.classes.find(c => c.id === classId)
      return class_ ? class_.name : ''
    }

    const updateLeaderboard = () => {
      // This method exists to handle the change event
      // The computed property will automatically update
    }

    return {
      selectedClass,
      classes,
      leaderboardStudents,
      getClassName,
      updateLeaderboard
    }
  }
}
</script>

<style scoped>
.merit-leaderboard {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.leaderboard-filters {
  margin: 20px 0;
}

.leaderboard-filters select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  transition: transform 0.2s;
}

.leaderboard-item:hover {
  transform: translateX(5px);
}

.rank {
  width: 40px;
  height: 40px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
}

.leaderboard-item:nth-child(1) .rank {
  background: #FFD700;
}

.leaderboard-item:nth-child(2) .rank {
  background: #C0C0C0;
}

.leaderboard-item:nth-child(3) .rank {
  background: #CD7F32;
}

.student-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.student-name {
  color: #2c3e50;
  text-decoration: none;
  font-weight: bold;
}

.student-name:hover {
  color: #4CAF50;
}

.class-name {
  font-size: 0.9em;
  color: #666;
}

.points {
  font-weight: bold;
  color: #4CAF50;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>
