<template>
  <nav class="breadcrumbs">
    <div class="breadcrumb-container">
      <div class="breadcrumb-items">
        <router-link 
          v-for="(item, index) in breadcrumbItems" 
          :key="index"
          :to="item.path"
          class="breadcrumb-item"
          :class="{ active: index === breadcrumbItems.length - 1 }"
        >
          <span class="breadcrumb-icon" v-if="item.icon">{{ item.icon }}</span>
          <span class="breadcrumb-text">{{ item.name }}</span>
        </router-link>
      </div>
      
      <div class="breadcrumb-actions" v-if="$slots.actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSchoolStore } from '../stores/school'
import { useClassStore } from '../stores/class'
import { useStudentStore } from '../stores/student'

export default {
  name: 'Breadcrumbs',
  
  setup() {
    const route = useRoute()
    const schoolStore = useSchoolStore()
    const classStore = useClassStore()
    const studentStore = useStudentStore()
    
    const breadcrumbItems = computed(() => {
      const items = [
        { name: 'Dashboard', path: '/', icon: '🏠' }
      ]
      
      const routeName = route.name
      const params = route.params
      
      if (routeName === 'SchoolDetails' || routeName === 'ClassDetails' || routeName === 'StudentProfile') {
        items.push({ name: 'Schools', path: '/schools', icon: '🏫' })
        
        if (params.id) {
          // For school details or when navigating through school context
          let schoolId = params.id
          
          if (routeName === 'ClassDetails') {
            const classItem = classStore.classes.find(c => c.id === params.id)
            if (classItem) {
              schoolId = classItem.school_id
            }
          } else if (routeName === 'StudentProfile') {
            const student = studentStore.students.find(s => s.id === params.id)
            if (student) {
              const classItem = classStore.classes.find(c => c.id === student.class_id)
              if (classItem) {
                schoolId = classItem.school_id
              }
            }
          }
          
          const school = schoolStore.schools.find(s => s.id === schoolId)
          if (school) {
            items.push({ 
              name: school.name, 
              path: `/schools/${school.id}`,
              icon: '🏫'
            })
          }
        }
        
        if (routeName === 'ClassDetails') {
          const classItem = classStore.classes.find(c => c.id === params.id)
          if (classItem) {
            items.push({ 
              name: classItem.name, 
              path: `/classes/${classItem.id}`,
              icon: '👥'
            })
          }
        }
        
        if (routeName === 'StudentProfile') {
          const student = studentStore.students.find(s => s.id === params.id)
          if (student) {
            const classItem = classStore.classes.find(c => c.id === student.class_id)
            if (classItem) {
              items.push({ 
                name: classItem.name, 
                path: `/classes/${classItem.id}`,
                icon: '👥'
              })
            }
            items.push({ 
              name: student.name, 
              path: `/students/${student.id}`,
              icon: '👤'
            })
          }
        }
      }
      
      return items
    })
    
    return {
      breadcrumbItems
    }
  }
}
</script>

<style scoped>
.breadcrumbs {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px 0;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.breadcrumb-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb-items {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 500;
}

.breadcrumb-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.breadcrumb-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.breadcrumb-item:not(:last-child)::after {
  content: '→';
  margin-left: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.breadcrumb-icon {
  font-size: 16px;
}

.breadcrumb-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.breadcrumb-actions {
  display: flex;
  gap: 8px;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .breadcrumb-container {
    flex-direction: column;
    gap: 12px;
  }
  
  .breadcrumb-items {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .breadcrumb-text {
    max-width: 100px;
  }
}
</style>