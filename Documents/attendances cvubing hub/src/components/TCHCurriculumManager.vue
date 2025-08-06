<template>
  <div class="tch-curriculum-manager">
    <!-- Mobile Header -->
    <div class="curriculum-header">
      <div class="header-gradient">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">🧩 TCH Curriculum</h1>
            <p class="page-subtitle">{{ selectedClass?.name || 'Select a class to begin' }}</p>
          </div>
          <div class="header-actions">
            <button v-if="selectedClass" class="week-indicator" @click="showWeekSelector = !showWeekSelector">
              <span class="week-number">Week {{ currentWeek }}</span>
              <span class="week-theme">{{ getCurrentWeekTheme() }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Class Selector -->
    <div v-if="!selectedClass" class="class-selector-section">
      <div class="selector-card">
        <h2 class="selector-title">Choose Your Class</h2>
        <div class="classes-grid">
          <div 
            v-for="cls in availableClasses" 
            :key="cls.id" 
            @click="selectClass(cls)"
            class="class-option"
          >
            <div class="class-icon">🎓</div>
            <div class="class-info">
              <h3 class="class-name">{{ cls.name }}</h3>
              <p class="class-progress">Week {{ getClassProgress(cls.id) }} of 8</p>
            </div>
            <div class="class-arrow">→</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Week Selector Modal -->
    <div v-if="showWeekSelector && selectedClass" class="week-selector-overlay" @click="showWeekSelector = false">
      <div class="week-selector-modal" @click.stop>
        <div class="modal-header">
          <h3>Select Week</h3>
          <button @click="showWeekSelector = false" class="close-btn">×</button>
        </div>
        <div class="weeks-grid">
          <div 
            v-for="week in 8" 
            :key="week"
            @click="selectWeek(week)"
            class="week-option"
            :class="{ 
              'active': currentWeek === week,
              'completed': week < currentWeek,
              'upcoming': week > currentWeek
            }"
          >
            <div class="week-status-icon">
              <span v-if="week < currentWeek">✓</span>
              <span v-else-if="week === currentWeek">📍</span>
              <span v-else>🔒</span>
            </div>
            <div class="week-details">
              <h4>Week {{ week }}</h4>
              <p>{{ getWeekTheme(week) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Curriculum Content -->
    <div v-if="selectedClass" class="curriculum-content">
      
      <!-- Current Lesson Display -->
      <div class="lesson-card">
        <div class="lesson-header">
          <div class="lesson-title">
            <span class="week-badge">Week {{ currentWeek }}</span>
            <h2 class="lesson-theme">{{ getCurrentWeekData()?.theme || '' }}</h2>
          </div>
          <div class="lesson-controls">
            <button @click="prevWeek" :disabled="currentWeek <= 1" class="nav-btn prev">
              <span>← Prev</span>
            </button>
            <button @click="nextWeek" :disabled="currentWeek >= 8" class="nav-btn next">
              <span>Next →</span>
            </button>
          </div>
        </div>

        <div class="lesson-content">
          <!-- Magic Words Section -->
          <div class="lesson-section magic-words">
            <div class="section-icon">✨</div>
            <div class="section-content">
              <h3>Magic Words for the Week</h3>
              <p class="magic-phrase">{{ getCurrentWeekData()?.magicWords || '' }}</p>
            </div>
          </div>

          <!-- Story Time Section -->
          <div class="lesson-section story-time">
            <div class="section-icon">📚</div>
            <div class="section-content">
              <h3>{{ getCurrentWeekData()?.storyTitle || 'Story Time' }}</h3>
              <p class="story-text">{{ getCurrentWeekData()?.storyContent || '' }}</p>
            </div>
          </div>

          <!-- Cube Activities Section -->
          <div class="lesson-section activities">
            <div class="section-icon">🧩</div>
            <div class="section-content">
              <h3>Cube Activities (10 minutes)</h3>
              <ul class="activity-list">
                <li v-for="activity in getCurrentWeekData()?.cubeActivities || []" :key="activity">
                  {{ activity }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Movement Time Section -->
          <div class="lesson-section movement">
            <div class="section-icon">🕺</div>
            <div class="section-content">
              <h3>Movement & Dancing (5 minutes)</h3>
              <ul class="activity-list">
                <li v-for="movement in getCurrentWeekData()?.movementTime || []" :key="movement">
                  {{ movement }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Take Home Section -->
          <div class="lesson-section take-home">
            <div class="section-icon">🏠</div>
            <div class="section-content">
              <h3>Take Home</h3>
              <p class="take-home-text">{{ getCurrentWeekData()?.takeHome || '' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Character Development Scorecard -->
      <div class="character-scorecard">
        <div class="scorecard-header">
          <h3>📊 Character Development Scorecard</h3>
          <p>Rate each behavior (1-5 scale)</p>
        </div>

        <div class="scorecard-content">
          <div v-for="behavior in getCurrentWeekBehaviors()" :key="behavior.id" class="behavior-item">
            <div class="behavior-description">
              <p>{{ behavior.description }}</p>
            </div>
            <div class="behavior-rating">
              <div class="rating-buttons">
                <button 
                  v-for="rating in 5" 
                  :key="rating"
                  @click="setBehaviorRating(behavior.id, rating)"
                  class="rating-btn"
                  :class="{ 
                    'active': getBehaviorRating(behavior.id) >= rating,
                    'excellent': rating === 5 && getBehaviorRating(behavior.id) === 5,
                    'good': rating === 4 && getBehaviorRating(behavior.id) === 4,
                    'fair': rating === 3 && getBehaviorRating(behavior.id) === 3
                  }"
                >
                  {{ rating }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="scorecard-summary">
          <div class="total-score">
            <span class="score-label">Week {{ currentWeek }} Score:</span>
            <span class="score-value">{{ getTotalScore() }}/{{ getCurrentWeekBehaviors().length * 5 }}</span>
          </div>
          <button @click="saveProgress" class="save-btn" :disabled="isSaving">
            <span v-if="isSaving">💾 Saving...</span>
            <span v-else>💾 Save Progress</span>
          </button>
        </div>
      </div>

      <!-- Quick Notes Section -->
      <div class="quick-notes-section">
        <div class="notes-header">
          <h3>📝 Session Notes</h3>
        </div>
        <div class="notes-input">
          <textarea 
            v-model="sessionNotes"
            placeholder="Record observations, highlights, or areas for improvement..."
            class="notes-textarea"
            rows="4"
          ></textarea>
        </div>
      </div>

      <!-- Weekly Games Section -->
      <div class="games-section">
        <div class="games-header" @click="showGames = !showGames">
          <h3>🎮 Weekly Games & Activities</h3>
          <span class="expand-icon">{{ showGames ? '▼' : '▶' }}</span>
        </div>
        <div v-if="showGames" class="games-content">
          <div v-for="game in getCurrentWeekGames()" :key="game.name" class="game-card">
            <div class="game-header">
              <h4>{{ game.name }}</h4>
              <span class="game-duration">{{ game.duration }}</span>
            </div>
            <p class="game-description">{{ game.description }}</p>
            <div class="game-materials">
              <strong>Materials:</strong> {{ game.materials }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div v-if="selectedClass" class="bottom-nav">
      <button @click="goBackToClasses" class="nav-button secondary">
        <span class="nav-icon">← Classes</span>
      </button>
      <button @click="markWeekComplete" class="nav-button primary" :disabled="!canMarkComplete()">
        <span class="nav-icon">✓ Complete Week {{ currentWeek }}</span>
      </button>
    </div>

    <!-- Offline Indicator -->
    <div v-if="!isOnline" class="offline-indicator visible">
      <span>Working Offline</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useClassStore } from '../stores/class'
import { TCH_CURRICULUM_DATA } from '../config/tchCurriculum'

export default {
  name: 'TCHCurriculumManager',
  
  setup() {
    const classStore = useClassStore()
    
    // Reactive state
    const selectedClass = ref(null)
    const currentWeek = ref(1)
    const showWeekSelector = ref(false)
    const showGames = ref(false)
    const sessionNotes = ref('')
    const behaviorRatings = ref({})
    const isSaving = ref(false)
    const isOnline = ref(navigator.onLine)
    
    // Computed properties
    const availableClasses = computed(() => classStore.classes)
    
    // Methods
    const selectClass = (cls) => {
      selectedClass.value = cls
      currentWeek.value = getClassProgress(cls.id)
      loadClassData()
    }
    
    const getClassProgress = (classId) => {
      // Get from localStorage or default to week 1
      const stored = localStorage.getItem(`tch-progress-${classId}`)
      return stored ? JSON.parse(stored).currentWeek || 1 : 1
    }
    
    const selectWeek = (week) => {
      currentWeek.value = week
      showWeekSelector.value = false
      loadWeekData()
    }
    
    const getCurrentWeekTheme = () => {
      return TCH_CURRICULUM_DATA.weeks[currentWeek.value - 1]?.theme || ''
    }
    
    const getWeekTheme = (week) => {
      return TCH_CURRICULUM_DATA.weeks[week - 1]?.theme || ''
    }
    
    const getCurrentWeekData = () => {
      return TCH_CURRICULUM_DATA.weeks[currentWeek.value - 1] || {}
    }
    
    const getCurrentWeekBehaviors = () => {
      return TCH_CURRICULUM_DATA.characterMetrics[currentWeek.value - 1]?.behaviors || []
    }
    
    const getCurrentWeekGames = () => {
      return TCH_CURRICULUM_DATA.games[currentWeek.value - 1]?.activities || []
    }
    
    const prevWeek = () => {
      if (currentWeek.value > 1) {
        currentWeek.value--
        loadWeekData()
      }
    }
    
    const nextWeek = () => {
      if (currentWeek.value < 8) {
        currentWeek.value++
        loadWeekData()
      }
    }
    
    const setBehaviorRating = (behaviorId, rating) => {
      if (!behaviorRatings.value[currentWeek.value]) {
        behaviorRatings.value[currentWeek.value] = {}
      }
      behaviorRatings.value[currentWeek.value][behaviorId] = rating
      
      // Auto-save offline
      if (!isOnline.value) {
        saveOfflineData()
      }
    }
    
    const getBehaviorRating = (behaviorId) => {
      return behaviorRatings.value[currentWeek.value]?.[behaviorId] || 0
    }
    
    const getTotalScore = () => {
      const weekRatings = behaviorRatings.value[currentWeek.value] || {}
      return Object.values(weekRatings).reduce((sum, rating) => sum + rating, 0)
    }
    
    const canMarkComplete = () => {
      const behaviors = getCurrentWeekBehaviors()
      const weekRatings = behaviorRatings.value[currentWeek.value] || {}
      return behaviors.length > 0 && behaviors.every(b => weekRatings[b.id] > 0)
    }
    
    const markWeekComplete = () => {
      if (canMarkComplete()) {
        saveProgress()
        if (currentWeek.value < 8) {
          currentWeek.value++
          loadWeekData()
        }
        alert(`Week ${currentWeek.value - 1} completed! 🎉`)
      }
    }
    
    const saveProgress = async () => {
      isSaving.value = true
      
      try {
        const progressData = {
          classId: selectedClass.value.id,
          currentWeek: currentWeek.value,
          behaviorRatings: behaviorRatings.value,
          sessionNotes: sessionNotes.value,
          lastUpdated: new Date().toISOString()
        }
        
        // Save to localStorage (offline support)
        localStorage.setItem(`tch-progress-${selectedClass.value.id}`, JSON.stringify(progressData))
        
        // TODO: Save to Supabase when online
        if (isOnline.value) {
          // await saveTCHProgressToSupabase(progressData)
        }
        
        alert('Progress saved successfully! 💾')
      } catch (error) {
        console.error('Error saving progress:', error)
        alert('Progress saved offline. Will sync when connection restored.')
      } finally {
        isSaving.value = false
      }
    }
    
    const loadClassData = () => {
      const stored = localStorage.getItem(`tch-progress-${selectedClass.value.id}`)
      if (stored) {
        const data = JSON.parse(stored)
        behaviorRatings.value = data.behaviorRatings || {}
        sessionNotes.value = data.sessionNotes || ''
      }
      loadWeekData()
    }
    
    const loadWeekData = () => {
      // Load any week-specific data
      scrollToTop()
    }
    
    const saveOfflineData = () => {
      if (selectedClass.value) {
        const progressData = {
          classId: selectedClass.value.id,
          currentWeek: currentWeek.value,
          behaviorRatings: behaviorRatings.value,
          sessionNotes: sessionNotes.value,
          lastUpdated: new Date().toISOString(),
          offline: true
        }
        localStorage.setItem(`tch-progress-${selectedClass.value.id}`, JSON.stringify(progressData))
      }
    }
    
    const goBackToClasses = () => {
      selectedClass.value = null
      currentWeek.value = 1
      sessionNotes.value = ''
    }
    
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    // Offline functionality
    const handleOnline = () => {
      isOnline.value = true
      // Sync offline data when coming back online
    }
    
    const handleOffline = () => {
      isOnline.value = false
    }
    
    // Lifecycle hooks
    onMounted(() => {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      
      // Load classes
      if (classStore.classes.length === 0) {
        // Load classes from available schools
        console.log('Loading classes for TCH curriculum...')
      }
    })
    
    onUnmounted(() => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    })
    
    return {
      // State
      selectedClass,
      currentWeek,
      showWeekSelector,
      showGames,
      sessionNotes,
      behaviorRatings,
      isSaving,
      isOnline,
      
      // Computed
      availableClasses,
      
      // Methods
      selectClass,
      getClassProgress,
      selectWeek,
      getCurrentWeekTheme,
      getWeekTheme,
      getCurrentWeekData,
      getCurrentWeekBehaviors,
      getCurrentWeekGames,
      prevWeek,
      nextWeek,
      setBehaviorRating,
      getBehaviorRating,
      getTotalScore,
      canMarkComplete,
      markWeekComplete,
      saveProgress,
      goBackToClasses
    }
  }
}
</script>

<style scoped>
/* TCH Curriculum Manager Styles */
.tch-curriculum-manager {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  font-family: var(--ios-font-family);
  padding-bottom: 100px; /* Space for bottom nav */
}

/* Header Styles */
.curriculum-header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-gradient {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 2rem 1rem 3rem;
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  font-family: var(--ios-font-display);
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.week-indicator {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.week-indicator:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.week-number {
  display: block;
  font-weight: 700;
  font-size: 1.1rem;
}

.week-theme {
  display: block;
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

/* Class Selector Styles */
.class-selector-section {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.selector-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
}

.selector-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.classes-grid {
  display: grid;
  gap: 1rem;
}

.class-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--ios-background-elevated);
  border: 1px solid var(--ios-border-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.class-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--ios-primary);
}

.class-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.class-info {
  flex: 1;
}

.class-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0 0 0.25rem 0;
}

.class-progress {
  color: var(--ios-text-secondary);
  margin: 0;
}

.class-arrow {
  font-size: 1.2rem;
  color: var(--ios-primary);
  font-weight: bold;
}

/* Week Selector Modal */
.week-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.week-selector-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--ios-border-light);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--ios-text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--ios-text-secondary);
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weeks-grid {
  padding: 1rem;
  display: grid;
  gap: 0.5rem;
}

.week-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.week-option.active {
  background: var(--ios-primary);
  color: white;
  border-color: var(--ios-primary);
}

.week-option.completed {
  background: var(--ios-success);
  color: white;
  border-color: var(--ios-success);
}

.week-option.upcoming {
  background: var(--ios-background-elevated);
  color: var(--ios-text-secondary);
  border-color: var(--ios-border-light);
}

.week-status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.week-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
}

.week-details p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Curriculum Content Styles */
.curriculum-content {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.lesson-card {
  background: white;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
  overflow: hidden;
}

.lesson-header {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 1.5rem;
  border-bottom: 1px solid var(--ios-border-light);
}

.lesson-title {
  margin-bottom: 1rem;
}

.week-badge {
  background: var(--ios-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.lesson-theme {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ios-text-primary);
  margin: 0.5rem 0 0 0;
}

.lesson-controls {
  display: flex;
  gap: 0.5rem;
}

.nav-btn {
  padding: 0.75rem 1rem;
  border: 1px solid var(--ios-border-medium);
  border-radius: 8px;
  background: white;
  color: var(--ios-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.nav-btn:hover:not(:disabled) {
  background: var(--ios-primary);
  color: white;
  border-color: var(--ios-primary);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lesson-content {
  padding: 0;
}

.lesson-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid var(--ios-border-light);
}

.lesson-section:last-child {
  border-bottom: none;
}

.section-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-content {
  flex: 1;
}

.section-content h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.2rem;
  color: var(--ios-text-primary);
}

.magic-phrase {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ios-primary);
  font-style: italic;
  margin: 0;
}

.story-text {
  line-height: 1.6;
  color: var(--ios-text-primary);
  margin: 0;
}

.activity-list {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--ios-text-primary);
}

.activity-list li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.take-home-text {
  color: var(--ios-text-primary);
  margin: 0;
  line-height: 1.6;
}

/* Character Scorecard Styles */
.character-scorecard {
  background: white;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
}

.scorecard-header {
  background: linear-gradient(135deg, #f0fff4, #c6f6d5);
  padding: 1.5rem;
  border-bottom: 1px solid var(--ios-border-light);
}

.scorecard-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  color: var(--ios-text-primary);
}

.scorecard-header p {
  margin: 0;
  color: var(--ios-text-secondary);
}

.scorecard-content {
  padding: 1rem;
}

.behavior-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--ios-background-elevated);
  border-radius: 12px;
  border: 1px solid var(--ios-border-light);
}

.behavior-description {
  flex: 1;
  margin-right: 1rem;
}

.behavior-description p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
  color: var(--ios-text-primary);
}

.rating-buttons {
  display: flex;
  gap: 0.25rem;
}

.rating-btn {
  width: 40px;
  height: 40px;
  border: 2px solid var(--ios-border-medium);
  border-radius: 8px;
  background: white;
  color: var(--ios-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 1rem;
}

.rating-btn:hover {
  border-color: var(--ios-primary);
  transform: scale(1.05);
}

.rating-btn.active {
  background: var(--ios-primary);
  color: white;
  border-color: var(--ios-primary);
}

.rating-btn.excellent {
  background: var(--ios-success);
  border-color: var(--ios-success);
}

.rating-btn.good {
  background: #4299e1;
  border-color: #4299e1;
}

.rating-btn.fair {
  background: var(--ios-warning);
  border-color: var(--ios-warning);
}

.scorecard-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid var(--ios-border-light);
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.total-score {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.score-label {
  font-size: 0.9rem;
  color: var(--ios-text-secondary);
  margin-bottom: 0.25rem;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ios-primary);
}

.save-btn {
  background: linear-gradient(135deg, var(--ios-primary), var(--ios-secondary));
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.3);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Quick Notes Section */
.quick-notes-section {
  background: white;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
}

.notes-header {
  padding: 1.5rem 1.5rem 1rem;
}

.notes-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--ios-text-primary);
}

.notes-input {
  padding: 0 1.5rem 1.5rem;
}

.notes-textarea {
  width: 100%;
  padding: 1rem;
  border: 1.5px solid var(--ios-border-medium);
  border-radius: 12px;
  font-family: var(--ios-font-family);
  font-size: 1rem;
  color: var(--ios-text-primary);
  resize: vertical;
  min-height: 100px;
  background: var(--ios-background-elevated);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.notes-textarea:focus {
  outline: none;
  border-color: var(--ios-primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.notes-textarea::placeholder {
  color: var(--ios-text-tertiary);
}

/* Games Section */
.games-section {
  background: white;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--ios-border-light);
}

.games-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--ios-border-light);
}

.games-header:hover {
  background: var(--ios-background-elevated);
}

.games-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--ios-text-primary);
}

.expand-icon {
  font-size: 1.2rem;
  color: var(--ios-primary);
  font-weight: bold;
}

.games-content {
  padding: 1rem;
}

.game-card {
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--ios-background-elevated);
  border-radius: 12px;
  border: 1px solid var(--ios-border-light);
}

.game-card:last-child {
  margin-bottom: 0;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.game-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--ios-text-primary);
}

.game-duration {
  background: var(--ios-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.game-description {
  margin: 0 0 0.75rem 0;
  color: var(--ios-text-primary);
  line-height: 1.5;
}

.game-materials {
  font-size: 0.9rem;
  color: var(--ios-text-secondary);
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem;
  border-top: 1px solid var(--ios-border-light);
  display: flex;
  gap: 1rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 50;
}

.nav-button {
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
}

.nav-button.secondary {
  background: var(--ios-background-elevated);
  color: var(--ios-text-primary);
  border: 1px solid var(--ios-border-medium);
}

.nav-button.secondary:hover {
  background: var(--ios-border-light);
}

.nav-button.primary {
  background: linear-gradient(135deg, var(--ios-success), #30D158);
  color: white;
}

.nav-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 199, 89, 0.3);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Offline Indicator */
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

/* Mobile Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .week-indicator {
    width: 100%;
    padding: 1rem;
  }
  
  .lesson-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .section-icon {
    margin-bottom: 0.5rem;
  }
  
  .behavior-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .behavior-description {
    margin-right: 0;
    text-align: center;
  }
  
  .rating-buttons {
    justify-content: center;
  }
  
  .rating-btn {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }
  
  .scorecard-summary {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
  
  .total-score {
    align-items: center;
    text-align: center;
  }
  
  .bottom-nav {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .nav-button {
    padding: 1.25rem;
  }
  
  .curriculum-content {
    padding: 0.5rem;
    padding-bottom: 150px;
  }
}

/* Touch-friendly enhancements */
@media (pointer: coarse) {
  .rating-btn {
    min-width: 48px;
    min-height: 48px;
  }
  
  .nav-btn {
    min-height: 48px;
  }
  
  .class-option {
    min-height: 80px;
  }
  
  .week-option {
    min-height: 70px;
  }
}
</style>