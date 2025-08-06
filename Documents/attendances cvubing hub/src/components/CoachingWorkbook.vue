<template>
  <div class="coaching-workbook">
    <!-- Header -->
    <div class="workbook-header">
      <div class="header-content">
        <h1>📚 Coaching Workbook</h1>
        <p>Your comprehensive guide to developing young minds through the 4 pillars</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="showLessonPlan = true">
          <span class="icon">📝</span>
          Create Lesson Plan
        </button>
        <button class="btn-secondary" @click="showStoryModal = true">
          <span class="icon">📖</span>
          Browse Stories
        </button>
      </div>
    </div>

    <!-- Curriculum Modules -->
    <div class="curriculum-modules">
      <h2>🎯 Curriculum Modules</h2>
      <div class="modules-grid">
        <div 
          v-for="module in curriculumModules" 
          :key="module.id"
          class="module-card"
          @click="selectModule(module)"
        >
          <div class="module-header">
            <div class="module-icon">{{ module.icon }}</div>
            <div class="module-info">
              <h3>{{ module.title }}</h3>
              <p class="module-description">{{ module.description }}</p>
            </div>
          </div>
          <div class="module-stats">
            <div class="stat">
              <span class="stat-value">{{ module.lessonsCount }}</span>
              <span class="stat-label">Lessons</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ module.completionRate }}%</span>
              <span class="stat-label">Complete</span>
            </div>
          </div>
          <div class="module-pillar">
            <span class="pillar-badge" :class="module.pillar_focus">
              {{ formatPillarName(module.pillar_focus) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Lesson Plan -->
    <div v-if="selectedModule" class="lesson-plan-section">
      <h2>📋 {{ selectedModule.title }} - Lesson Plans</h2>
      <div class="lessons-container">
        <div 
          v-for="lesson in selectedModuleLessons" 
          :key="lesson.id"
          class="lesson-card"
          :class="{ completed: lesson.status === 'completed' }"
        >
          <div class="lesson-header">
            <div class="lesson-number">{{ lesson.lesson_order }}</div>
            <div class="lesson-info">
              <h4>{{ lesson.title }}</h4>
              <p class="lesson-duration">{{ lesson.estimated_duration_minutes }} minutes</p>
            </div>
            <div class="lesson-status">
              <span class="status-badge" :class="lesson.status">
                {{ formatStatus(lesson.status) }}
              </span>
            </div>
          </div>
          
          <div class="lesson-content">
            <div class="lesson-objectives">
              <h5>🎯 Learning Objectives:</h5>
              <ul>
                <li v-for="objective in lesson.learning_objectives" :key="objective">
                  {{ objective }}
                </li>
              </ul>
            </div>
            
            <div class="lesson-materials">
              <h5>📦 Materials Needed:</h5>
              <div class="materials-list">
                <span 
                  v-for="material in lesson.materials_needed" 
                  :key="material"
                  class="material-tag"
                >
                  {{ material }}
                </span>
              </div>
            </div>
            
            <div class="lesson-activities">
              <h5>🎪 Activities:</h5>
              <div class="activities-grid">
                <div 
                  v-for="activity in lesson.activities" 
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-header">
                    <strong>{{ activity.activity_name }}</strong>
                    <span class="activity-time">{{ activity.time_allocation_minutes }}min</span>
                  </div>
                  <p class="activity-description">{{ activity.activity_description }}</p>
                  <div class="activity-type">
                    <span class="type-badge" :class="activity.activity_type">
                      {{ activity.activity_type }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="coaching-notes">
              <h5>💡 Coaching Notes:</h5>
              <p class="notes-content">{{ lesson.coaching_notes }}</p>
            </div>
          </div>
          
          <div class="lesson-actions">
            <button class="btn-lesson-start" @click="startLesson(lesson)">
              <span class="icon">▶️</span>
              {{ lesson.status === 'completed' ? 'Review' : 'Start Lesson' }}
            </button>
            <button class="btn-lesson-plan" @click="viewDetailedPlan(lesson)">
              <span class="icon">📝</span>
              View Plan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Coaching Stories Library -->
    <div class="stories-library">
      <h2>📖 Coaching Stories Library</h2>
      <div class="stories-filters">
        <div class="filter-group">
          <label>Pillar Focus:</label>
          <select v-model="selectedPillarFilter">
            <option value="">All Pillars</option>
            <option value="confidence">Confidence</option>
            <option value="leadership">Leadership</option>
            <option value="problem_solving">Problem Solving</option>
            <option value="creativity">Creativity</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Story Type:</label>
          <select v-model="selectedStoryType">
            <option value="">All Types</option>
            <option value="inspirational">Inspirational</option>
            <option value="educational">Educational</option>
            <option value="problem_solving">Problem Solving</option>
            <option value="confidence_building">Confidence Building</option>
          </select>
        </div>
      </div>
      
      <div class="stories-grid">
        <div 
          v-for="story in filteredStories" 
          :key="story.id"
          class="story-card"
        >
          <div class="story-header">
            <h4>{{ story.title }}</h4>
            <div class="story-meta">
              <span class="story-type">{{ formatStoryType(story.story_type) }}</span>
              <span class="story-pillar" :class="story.pillar_focus">
                {{ formatPillarName(story.pillar_focus) }}
              </span>
            </div>
          </div>
          <div class="story-content">
            <p class="story-preview">{{ story.content.substring(0, 150) }}...</p>
            <div class="story-key-message">
              <strong>Key Message:</strong> {{ story.key_message }}
            </div>
          </div>
          <div class="story-actions">
            <button class="btn-story-read" @click="readStory(story)">
              <span class="icon">👁️</span>
              Read Story
            </button>
            <button class="btn-story-use" @click="useStoryInClass(story)">
              <span class="icon">🎯</span>
              Use in Class
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Story Modal -->
    <div v-if="showStoryModal" class="modal-overlay" @click="showStoryModal = false">
      <div class="modal-content story-modal" @click.stop>
        <div class="modal-header">
          <h3>📖 {{ selectedStory?.title || 'Story Library' }}</h3>
          <button class="btn-close" @click="showStoryModal = false">&times;</button>
        </div>
        <div v-if="selectedStory" class="story-full-content">
          <div class="story-meta-full">
            <span class="meta-item">
              <strong>Type:</strong> {{ formatStoryType(selectedStory.story_type) }}
            </span>
            <span class="meta-item">
              <strong>Pillar:</strong> {{ formatPillarName(selectedStory.pillar_focus) }}
            </span>
            <span class="meta-item">
              <strong>Recommended:</strong> {{ selectedStory.recommended_timing }}
            </span>
          </div>
          
          <div class="story-content-full">
            <p>{{ selectedStory.content }}</p>
          </div>
          
          <div class="story-key-message-full">
            <h4>🎯 Key Message:</h4>
            <p>{{ selectedStory.key_message }}</p>
          </div>
          
          <div class="discussion-questions">
            <h4>💭 Discussion Questions:</h4>
            <ul>
              <li v-for="question in selectedStory.discussion_questions" :key="question">
                {{ question }}
              </li>
            </ul>
          </div>
        </div>
        <div v-else class="story-selection">
          <p>Select a story to read its full content.</p>
        </div>
      </div>
    </div>

    <!-- Lesson Plan Modal -->
    <div v-if="showLessonPlan" class="modal-overlay" @click="showLessonPlan = false">
      <div class="modal-content lesson-plan-modal" @click.stop>
        <div class="modal-header">
          <h3>📝 Create Custom Lesson Plan</h3>
          <button class="btn-close" @click="showLessonPlan = false">&times;</button>
        </div>
        <div class="lesson-plan-form">
          <div class="form-group">
            <label>Lesson Title:</label>
            <input type="text" v-model="newLesson.title" placeholder="Enter lesson title">
          </div>
          <div class="form-group">
            <label>Pillar Focus:</label>
            <select v-model="newLesson.pillar_focus">
              <option value="">Select pillar</option>
              <option value="confidence">Confidence</option>
              <option value="leadership">Leadership</option>
              <option value="problem_solving">Problem Solving</option>
              <option value="creativity">Creativity</option>
            </select>
          </div>
          <div class="form-group">
            <label>Learning Objectives:</label>
            <textarea v-model="newLesson.objectives" placeholder="List learning objectives (one per line)"></textarea>
          </div>
          <div class="form-group">
            <label>Lesson Content:</label>
            <textarea v-model="newLesson.content" placeholder="Detailed lesson content and instructions"></textarea>
          </div>
          <div class="form-group">
            <label>Duration (minutes):</label>
            <input type="number" v-model="newLesson.duration" min="15" max="120">
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="createLesson">Create Lesson</button>
          <button class="btn-secondary" @click="showLessonPlan = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'CoachingWorkbook',
  
  setup() {
    // Reactive data
    const selectedModule = ref(null)
    const selectedStory = ref(null)
    const showStoryModal = ref(false)
    const showLessonPlan = ref(false)
    const selectedPillarFilter = ref('')
    const selectedStoryType = ref('')
    
    const newLesson = ref({
      title: '',
      pillar_focus: '',
      objectives: '',
      content: '',
      duration: 45
    })
    
    // Mock data - replace with actual API calls
    const curriculumModules = ref([
      {
        id: '1',
        title: 'Introduction to Confidence Building',
        description: 'Building self-assurance and overcoming fear of failure',
        icon: '💪',
        pillar_focus: 'confidence',
        lessonsCount: 5,
        completionRate: 80,
        estimated_duration_minutes: 45,
        difficulty_level: 'beginner'
      },
      {
        id: '2',
        title: 'Leadership Fundamentals',
        description: 'Teaching basic leadership principles and team guidance',
        icon: '👑',
        pillar_focus: 'leadership',
        lessonsCount: 6,
        completionRate: 60,
        estimated_duration_minutes: 60,
        difficulty_level: 'beginner'
      },
      {
        id: '3',
        title: 'Problem-Solving Strategies',
        description: 'Developing systematic approaches to challenges',
        icon: '🧩',
        pillar_focus: 'problem_solving',
        lessonsCount: 7,
        completionRate: 45,
        estimated_duration_minutes: 50,
        difficulty_level: 'intermediate'
      },
      {
        id: '4',
        title: 'Creative Thinking Workshop',
        description: 'Encouraging innovative and out-of-the-box thinking',
        icon: '🎨',
        pillar_focus: 'creativity',
        lessonsCount: 6,
        completionRate: 30,
        estimated_duration_minutes: 55,
        difficulty_level: 'intermediate'
      }
    ])
    
    const lessons = ref([
      {
        id: '1',
        module_id: '1',
        title: 'Understanding Fear and Failure',
        lesson_order: 1,
        estimated_duration_minutes: 20,
        learning_objectives: [
          'Identify different types of fears',
          'Understand the learning value of failure',
          'Develop a growth mindset'
        ],
        materials_needed: ['Rubiks cubes', 'Whiteboard', 'Confidence cards'],
        coaching_notes: 'Start with a personal story about overcoming failure. Be vulnerable to create connection.',
        status: 'completed',
        activities: [
          {
            id: '1',
            activity_name: 'Fear Face-Off Challenge',
            activity_description: 'Students identify their fears and work through them systematically',
            activity_type: 'individual',
            time_allocation_minutes: 15
          }
        ]
      },
      {
        id: '2',
        module_id: '1',
        title: 'Building Self-Confidence',
        lesson_order: 2,
        estimated_duration_minutes: 25,
        learning_objectives: [
          'Practice positive self-talk',
          'Recognize personal strengths',
          'Set achievable goals'
        ],
        materials_needed: ['Mirrors', 'Strength cards', 'Goal worksheets'],
        coaching_notes: 'Use mirror exercise to help students see their own potential.',
        status: 'in_progress',
        activities: [
          {
            id: '2',
            activity_name: 'Mirror Affirmations',
            activity_description: 'Students practice positive self-talk using mirrors',
            activity_type: 'individual',
            time_allocation_minutes: 10
          }
        ]
      }
    ])
    
    const coachingStories = ref([
      {
        id: '1',
        title: 'The Cube That Taught Me Courage',
        content: 'When I was 12, I received my first Rubiks cube. I was terrified to even scramble it because I thought I would never solve it again. But one day, I decided to take the risk. I scrambled it completely and spent the next three hours trying to solve it. I failed. But in that failure, I learned something important about courage - it\'s not about never being scared, it\'s about doing something despite being scared.',
        story_type: 'confidence_building',
        pillar_focus: 'confidence',
        age_group: 'elementary',
        recommended_timing: 'Beginning of confidence module',
        key_message: 'Taking the first step is often the hardest, but it leads to growth',
        discussion_questions: [
          'What stops you from trying new things?',
          'How do you feel when you make a mistake?',
          'What would you attempt if you knew you could not fail?'
        ]
      },
      {
        id: '2',
        title: 'The Team That Wouldn\'t Give Up',
        content: 'There was once a team of young cubers who entered a competition. They were the youngest team and everyone expected them to lose. During the competition, they made many mistakes and fell behind. But instead of giving up, they supported each other, learned from their mistakes, and kept trying. They didn\'t win first place, but they won something more valuable - they learned that persistence and teamwork can overcome any challenge.',
        story_type: 'inspirational',
        pillar_focus: 'leadership',
        age_group: 'elementary',
        recommended_timing: 'When discussing teamwork',
        key_message: 'Leadership means lifting others up, especially when things get tough',
        discussion_questions: [
          'How do you help your teammates when they\'re struggling?',
          'What does it mean to be a good leader?',
          'How can we support each other during challenges?'
        ]
      }
    ])
    
    // Computed properties
    const selectedModuleLessons = computed(() => {
      if (!selectedModule.value) return []
      return lessons.value.filter(lesson => lesson.module_id === selectedModule.value.id)
    })
    
    const filteredStories = computed(() => {
      let filtered = coachingStories.value
      
      if (selectedPillarFilter.value) {
        filtered = filtered.filter(story => story.pillar_focus === selectedPillarFilter.value)
      }
      
      if (selectedStoryType.value) {
        filtered = filtered.filter(story => story.story_type === selectedStoryType.value)
      }
      
      return filtered
    })
    
    // Methods
    const selectModule = (module) => {
      selectedModule.value = module
    }
    
    const formatPillarName = (pillar) => {
      return pillar.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
    
    const formatStatus = (status) => {
      return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
    
    const formatStoryType = (type) => {
      return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
    
    const startLesson = (lesson) => {
      console.log('Starting lesson:', lesson.title)
      // In a real app, this would open the lesson execution interface
      alert(`Starting lesson: ${lesson.title}`)
    }
    
    const viewDetailedPlan = (lesson) => {
      console.log('Viewing detailed plan for:', lesson.title)
      // In a real app, this would open a detailed lesson plan view
      alert(`Viewing detailed plan for: ${lesson.title}`)
    }
    
    const readStory = (story) => {
      selectedStory.value = story
      showStoryModal.value = true
    }
    
    const useStoryInClass = (story) => {
      console.log('Using story in class:', story.title)
      // In a real app, this would add the story to the current lesson plan
      alert(`Added "${story.title}" to your lesson plan!`)
    }
    
    const createLesson = () => {
      if (!newLesson.value.title || !newLesson.value.pillar_focus) {
        alert('Please fill in all required fields')
        return
      }
      
      console.log('Creating lesson:', newLesson.value)
      // In a real app, this would save the lesson to the database
      alert('Lesson created successfully!')
      
      // Reset form
      newLesson.value = {
        title: '',
        pillar_focus: '',
        objectives: '',
        content: '',
        duration: 45
      }
      showLessonPlan.value = false
    }
    
    onMounted(() => {
      // Load curriculum data
      console.log('Coaching workbook loaded')
    })
    
    return {
      selectedModule,
      selectedStory,
      showStoryModal,
      showLessonPlan,
      selectedPillarFilter,
      selectedStoryType,
      newLesson,
      curriculumModules,
      lessons,
      coachingStories,
      selectedModuleLessons,
      filteredStories,
      selectModule,
      formatPillarName,
      formatStatus,
      formatStoryType,
      startLesson,
      viewDetailedPlan,
      readStory,
      useStoryInClass,
      createLesson
    }
  }
}
</script>

<style scoped>
.coaching-workbook {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.workbook-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 2.5rem;
  margin: 0 0 8px 0;
}

.header-content p {
  font-size: 1.1rem;
  opacity: 0.9;
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
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.curriculum-modules, .lesson-plan-section, .stories-library {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.curriculum-modules h2, .lesson-plan-section h2, .stories-library h2 {
  color: #2d3748;
  margin: 0 0 24px 0;
  font-size: 1.8rem;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.module-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.module-icon {
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

.module-info h3 {
  color: #2d3748;
  margin: 0 0 4px 0;
  font-size: 1.2rem;
}

.module-description {
  color: #718096;
  margin: 0;
  font-size: 0.9rem;
}

.module-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-label {
  color: #718096;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.module-pillar {
  display: flex;
  justify-content: center;
}

.pillar-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pillar-badge.confidence {
  background: #e6fffa;
  color: #234e52;
}

.pillar-badge.leadership {
  background: #fef5e7;
  color: #744210;
}

.pillar-badge.problem_solving {
  background: #ebf8ff;
  color: #2a69ac;
}

.pillar-badge.creativity {
  background: #fbb6ce;
  color: #97266d;
}

.lessons-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.lesson-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
}

.lesson-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.lesson-card.completed {
  border-color: #48bb78;
  background: #f0fff4;
}

.lesson-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.lesson-number {
  width: 40px;
  height: 40px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.lesson-info {
  flex: 1;
}

.lesson-info h4 {
  color: #2d3748;
  margin: 0 0 4px 0;
  font-size: 1.2rem;
}

.lesson-duration {
  color: #718096;
  margin: 0;
  font-size: 0.9rem;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.completed {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.in_progress {
  background: #bee3f8;
  color: #2b6cb0;
}

.status-badge.not_started {
  background: #fed7d7;
  color: #742a2a;
}

.lesson-content {
  margin-bottom: 20px;
}

.lesson-content h5 {
  color: #2d3748;
  margin: 0 0 12px 0;
  font-size: 1rem;
}

.lesson-objectives ul {
  margin: 0;
  padding-left: 20px;
}

.lesson-objectives li {
  color: #4a5568;
  margin-bottom: 4px;
}

.materials-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.material-tag {
  background: #e2e8f0;
  color: #4a5568;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.activity-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.activity-time {
  color: #718096;
  font-size: 0.8rem;
  font-weight: 500;
}

.activity-description {
  color: #4a5568;
  margin: 0 0 8px 0;
  font-size: 0.9rem;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.type-badge.individual {
  background: #e6fffa;
  color: #234e52;
}

.type-badge.group {
  background: #fef5e7;
  color: #744210;
}

.type-badge.pair {
  background: #ebf8ff;
  color: #2a69ac;
}

.notes-content {
  background: #fffbeb;
  border-left: 4px solid #f6e05e;
  padding: 12px 16px;
  margin: 0;
  color: #744210;
  font-style: italic;
}

.lesson-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-lesson-start, .btn-lesson-plan {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-lesson-start {
  background: #667eea;
  color: white;
}

.btn-lesson-start:hover {
  background: #5a67d8;
}

.btn-lesson-plan {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-lesson-plan:hover {
  background: #cbd5e0;
}

.stories-filters {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  color: #4a5568;
  font-weight: 600;
  font-size: 0.9rem;
}

.filter-group select {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  min-width: 150px;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.story-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.story-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.story-header {
  margin-bottom: 16px;
}

.story-header h4 {
  color: #2d3748;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.story-meta {
  display: flex;
  gap: 8px;
}

.story-type, .story-pillar {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.story-type {
  background: #e2e8f0;
  color: #4a5568;
}

.story-content {
  margin-bottom: 16px;
}

.story-preview {
  color: #4a5568;
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.story-key-message {
  background: #fffbeb;
  border-left: 4px solid #f6e05e;
  padding: 8px 12px;
  color: #744210;
  font-size: 0.9rem;
}

.story-actions {
  display: flex;
  gap: 8px;
}

.btn-story-read, .btn-story-use {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
}

.btn-story-read {
  background: #667eea;
  color: white;
}

.btn-story-read:hover {
  background: #5a67d8;
}

.btn-story-use {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-story-use:hover {
  background: #cbd5e0;
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
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  color: #2d3748;
  margin: 0;
  font-size: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #718096;
  padding: 4px;
}

.btn-close:hover {
  color: #4a5568;
}

.story-full-content {
  padding: 32px;
}

.story-meta-full {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.meta-item {
  color: #4a5568;
  font-size: 0.9rem;
}

.story-content-full {
  margin-bottom: 24px;
}

.story-content-full p {
  color: #4a5568;
  line-height: 1.7;
  font-size: 1rem;
}

.story-key-message-full {
  background: #fffbeb;
  border-left: 4px solid #f6e05e;
  padding: 16px 20px;
  margin-bottom: 24px;
  border-radius: 0 8px 8px 0;
}

.story-key-message-full h4 {
  color: #744210;
  margin: 0 0 8px 0;
}

.story-key-message-full p {
  color: #744210;
  margin: 0;
}

.discussion-questions {
  background: #f0fff4;
  border-left: 4px solid #48bb78;
  padding: 16px 20px;
  border-radius: 0 8px 8px 0;
}

.discussion-questions h4 {
  color: #22543d;
  margin: 0 0 12px 0;
}

.discussion-questions ul {
  margin: 0;
  padding-left: 20px;
}

.discussion-questions li {
  color: #22543d;
  margin-bottom: 8px;
}

.lesson-plan-form {
  padding: 32px;
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

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus,
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
  padding: 24px 32px;
  border-top: 1px solid #e2e8f0;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .workbook-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .stories-grid {
    grid-template-columns: 1fr;
  }
  
  .activities-grid {
    grid-template-columns: 1fr;
  }
  
  .stories-filters {
    flex-direction: column;
  }
  
  .lesson-actions {
    flex-direction: column;
  }
  
  .story-actions {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .story-full-content {
    padding: 20px;
  }
  
  .lesson-plan-form {
    padding: 20px;
  }
  
  .modal-actions {
    padding: 20px;
    flex-direction: column;
  }
}
</style>