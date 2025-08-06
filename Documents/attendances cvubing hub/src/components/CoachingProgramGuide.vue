<template>
  <div class="coaching-program-guide">
    <div class="program-header">
      <h1>8-Week Coaching Program Guide</h1>
      <div class="class-selector">
        <label>Select Class:</label>
        <select v-model="selectedClassId" @change="loadClassProgress">
          <option value="">Choose a class...</option>
          <option v-for="class_ in classes" :key="class_.id" :value="class_.id">
            {{ class_.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="selectedClassId" class="program-content">
      <!-- Progress Overview -->
      <div class="progress-overview">
        <h2>Program Progress</h2>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: overallProgress + '%' }"></div>
        </div>
        <p>{{ completedWeeks }} of 8 weeks completed ({{ overallProgress }}%)</p>
      </div>

      <!-- Weekly Lessons -->
      <div class="weekly-lessons">
        <div v-for="week in coachingWeeks" :key="week.id" class="week-card">
          <div class="week-header" @click="toggleWeek(week.week_number)">
            <div class="week-title">
              <span class="week-number">Week {{ week.week_number }}</span>
              <h3>{{ week.title }}</h3>
              <span class="week-theme">{{ week.theme }}</span>
            </div>
            <div class="week-status">
              <span class="status-badge" :class="getWeekStatus(week.week_number)">
                {{ getWeekStatusText(week.week_number) }}
              </span>
              <span class="expand-icon">{{ expandedWeeks.includes(week.week_number) ? '▼' : '▶' }}</span>
            </div>
          </div>

          <div v-if="expandedWeeks.includes(week.week_number)" class="week-content">
            <!-- Opening Message -->
            <div class="lesson-section">
              <h4>🎯 Opening Message (5 minutes)</h4>
              <p class="lesson-text">{{ week.opening_message }}</p>
            </div>

            <!-- Character Story -->
            <div class="lesson-section">
              <h4>📖 Character Story: {{ week.character_story_title }}</h4>
              <p class="lesson-text">{{ week.character_story_content }}</p>
            </div>

            <!-- Cube Connection -->
            <div class="lesson-section">
              <h4>🧩 Cube Connection</h4>
              <p class="lesson-text">{{ week.cube_connection }}</p>
            </div>

            <!-- Technical Goals -->
            <div class="lesson-section">
              <h4>⚙️ Technical Goals</h4>
              <ul class="goals-list">
                <li v-for="goal in week.technical_goals" :key="goal">{{ goal }}</li>
              </ul>
            </div>

            <!-- Character Activity -->
            <div class="lesson-section">
              <h4>🎭 Character Activity</h4>
              <p class="lesson-text">{{ week.character_activity }}</p>
            </div>

            <!-- Coach Conversation Starters -->
            <div class="lesson-section">
              <h4>💬 Coach Conversation Starters</h4>
              <ul class="conversation-list">
                <li v-for="starter in week.coach_conversation_starters" :key="starter">{{ starter }}</li>
              </ul>
            </div>

            <!-- Weekly Affirmation -->
            <div class="lesson-section affirmation">
              <h4>✨ Weekly Affirmation</h4>
              <p class="affirmation-text">"{{ week.weekly_affirmation }}"</p>
            </div>

            <!-- Take-Home Challenge -->
            <div class="lesson-section">
              <h4>🏠 Take-Home Challenge</h4>
              <p class="lesson-text">{{ week.take_home_challenge }}</p>
            </div>

            <!-- Parent Communication -->
            <div class="lesson-section">
              <h4>👨‍👩‍👧‍👦 Parent Communication</h4>
              <p class="lesson-text">{{ week.parent_communication }}</p>
            </div>

            <!-- Lesson Actions -->
            <div class="lesson-actions">
              <textarea 
                v-model="lessonNotes[week.week_number]"
                placeholder="Add notes about this lesson..."
                class="lesson-notes"
              ></textarea>
              
              <div class="action-buttons">
                <button 
                  v-if="getWeekStatus(week.week_number) !== 'completed'"
                  @click="markLessonComplete(week.week_number)"
                  class="complete-btn"
                  :disabled="isUpdating"
                >
                  {{ isUpdating ? 'Updating...' : 'Mark Lesson Complete' }}
                </button>
                <button 
                  v-else
                  @click="reopenLesson(week.week_number)"
                  class="reopen-btn"
                >
                  Reopen Lesson
                </button>
                <button 
                  @click="sendParentNotification(week.week_number)"
                  class="notify-btn"
                  :disabled="getWeekStatus(week.week_number) !== 'completed'"
                >
                  Notify Parents
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Class Selected -->
    <div v-else class="no-class-selected">
      <h2>Select a class to view the coaching program</h2>
      <p>Choose a class from the dropdown above to access the 8-week coaching program guide.</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useClassStore } from '../stores/class'
import { useSchoolStore } from '../stores/school'
import { useCoachingStore } from '../stores/coaching'

export default {
  name: 'CoachingProgramGuide',
  
  setup() {
    const classStore = useClassStore()
    const schoolStore = useSchoolStore()
    const coachingStore = useCoachingStore()
    
    const selectedClassId = ref('')
    const expandedWeeks = ref([])
    const lessonNotes = ref({})
    const isUpdating = ref(false)
    
    const classes = computed(() => classStore.classes)
    const coachingWeeks = computed(() => coachingStore.coachingWeeks)
    const classProgress = computed(() => coachingStore.classProgress)
    
    const completedWeeks = computed(() => {
      return Object.values(classProgress.value).filter(progress => progress.status === 'completed').length
    })
    
    const overallProgress = computed(() => {
      return Math.round((completedWeeks.value / 8) * 100)
    })
    
    onMounted(async () => {
      try {
        // First fetch schools, then fetch classes for each school
        await schoolStore.fetchSchools()
        
        // Fetch classes for all schools
        for (const school of schoolStore.schools) {
          try {
            await classStore.fetchClasses(school.id)
          } catch (error) {
            console.warn(`Could not fetch classes for school ${school.id}:`, error)
          }
        }
        
        await coachingStore.fetchCoachingWeeks()
      } catch (error) {
        console.error('Error loading coaching program data:', error)
      }
    })
    
    const toggleWeek = (weekNumber) => {
      if (expandedWeeks.value.includes(weekNumber)) {
        expandedWeeks.value = expandedWeeks.value.filter(w => w !== weekNumber)
      } else {
        expandedWeeks.value.push(weekNumber)
      }
    }
    
    const loadClassProgress = async () => {
      if (selectedClassId.value) {
        await coachingStore.fetchClassProgress(selectedClassId.value)
      }
    }
    
    const getWeekStatus = (weekNumber) => {
      const progress = classProgress.value[weekNumber]
      return progress ? progress.status : 'not_started'
    }
    
    const getWeekStatusText = (weekNumber) => {
      const status = getWeekStatus(weekNumber)
      switch (status) {
        case 'completed': return 'Completed'
        case 'in_progress': return 'In Progress'
        default: return 'Not Started'
      }
    }
    
    const markLessonComplete = async (weekNumber) => {
      isUpdating.value = true
      try {
        await coachingStore.markLessonComplete(
          selectedClassId.value, 
          weekNumber, 
          lessonNotes.value[weekNumber] || ''
        )
        
        // Send parent notifications
        await coachingStore.sendParentNotifications(selectedClassId.value, weekNumber)
        
        alert('Lesson marked as complete! Parent notifications sent.')
      } catch (error) {
        alert('Error marking lesson complete: ' + error.message)
      } finally {
        isUpdating.value = false
      }
    }
    
    const reopenLesson = async (weekNumber) => {
      try {
        await coachingStore.reopenLesson(selectedClassId.value, weekNumber)
        alert('Lesson reopened successfully!')
      } catch (error) {
        alert('Error reopening lesson: ' + error.message)
      }
    }
    
    const sendParentNotification = async (weekNumber) => {
      try {
        await coachingStore.sendParentNotifications(selectedClassId.value, weekNumber)
        alert('Parent notifications sent successfully!')
      } catch (error) {
        alert('Error sending notifications: ' + error.message)
      }
    }
    
    return {
      selectedClassId,
      expandedWeeks,
      lessonNotes,
      isUpdating,
      classes,
      coachingWeeks,
      classProgress,
      completedWeeks,
      overallProgress,
      toggleWeek,
      loadClassProgress,
      getWeekStatus,
      getWeekStatusText,
      markLessonComplete,
      reopenLesson,
      sendParentNotification
    }
  }
}
</script>

<style scoped>
.coaching-program-guide {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.program-header h1 {
  color: #2d3748;
  margin: 0;
}

.class-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.class-selector label {
  font-weight: 500;
  color: #4a5568;
}

.class-selector select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  min-width: 200px;
}

.progress-overview {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.progress-overview h2 {
  margin: 0 0 15px 0;
  color: #2d3748;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
  transition: width 0.3s ease;
}

.weekly-lessons {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.week-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  transition: background 0.2s;
}

.week-header:hover {
  background: #edf2f7;
}

.week-title {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.week-number {
  font-size: 14px;
  font-weight: 500;
  color: #4299e1;
}

.week-title h3 {
  margin: 0;
  color: #2d3748;
  font-size: 18px;
}

.week-theme {
  font-size: 14px;
  color: #718096;
  font-style: italic;
}

.week-status {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.completed {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.in_progress {
  background: #feebc8;
  color: #7b341e;
}

.status-badge.not_started {
  background: #e2e8f0;
  color: #4a5568;
}

.expand-icon {
  font-size: 18px;
  color: #4a5568;
}

.week-content {
  padding: 20px;
}

.lesson-section {
  margin-bottom: 25px;
}

.lesson-section h4 {
  margin: 0 0 10px 0;
  color: #2d3748;
  font-size: 16px;
}

.lesson-text {
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

.goals-list, .conversation-list {
  margin: 0;
  padding-left: 20px;
  color: #4a5568;
}

.goals-list li, .conversation-list li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.affirmation {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 8px;
  padding: 15px;
}

.affirmation-text {
  font-size: 18px;
  font-weight: 500;
  color: #22543d;
  text-align: center;
  margin: 0;
}

.lesson-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.lesson-notes {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 15px;
}

.lesson-notes:focus {
  outline: none;
  border-color: #4299e1;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.complete-btn, .reopen-btn, .notify-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.complete-btn {
  background: #48bb78;
  color: white;
}

.complete-btn:hover:not(:disabled) {
  background: #38a169;
}

.complete-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.reopen-btn {
  background: #ed8936;
  color: white;
}

.reopen-btn:hover {
  background: #dd6b20;
}

.notify-btn {
  background: #4299e1;
  color: white;
}

.notify-btn:hover:not(:disabled) {
  background: #3182ce;
}

.notify-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.no-class-selected {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.no-class-selected h2 {
  color: #4a5568;
  margin-bottom: 10px;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .program-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .class-selector {
    justify-content: center;
  }
  
  .week-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .week-status {
    justify-content: space-between;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .complete-btn, .reopen-btn, .notify-btn {
    width: 100%;
  }
}
</style>