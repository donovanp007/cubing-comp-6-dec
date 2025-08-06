import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard.vue'
import CoachDashboard from '../components/CoachDashboard.vue'
import SchoolList from '../components/SchoolList.vue'
import SchoolDetails from '../components/SchoolDetails.vue'
import ClassDetails from '../components/ClassDetails.vue'
import StudentList from '../components/StudentList.vue'
import StudentProfile from '../components/StudentProfile.vue'
import GamificationDashboard from '../components/GamificationDashboard.vue'
import CoachingWorkbook from '../components/CoachingWorkbook.vue'
import CoachingProgramGuide from '../components/CoachingProgramGuide.vue'
import TCHCurriculumManager from '../components/TCHCurriculumManager.vue'
import StudentTermManager from '../components/StudentTermManager.vue'
import CharacterLeaderboard from '../components/CharacterLeaderboard.vue'
import QuickStudentRegistration from '../components/QuickStudentRegistration.vue'
import WebhookSettings from '../components/WebhookSettings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Overview',
      component: Dashboard
    },
    {
      path: '/coach-dashboard',
      name: 'CoachDashboard', 
      component: CoachDashboard
    },
    {
      path: '/schools',
      name: 'Schools',
      component: SchoolList
    },
    {
      path: '/school/:id',
      name: 'SchoolDetails',
      component: SchoolDetails,
      props: true
    },
    {
      path: '/class/:id',
      name: 'ClassDetails',
      component: ClassDetails,
      props: true
    },
    {
      path: '/students',
      name: 'Students',
      component: StudentList
    },
    {
      path: '/student/:id',
      name: 'StudentProfile',
      component: StudentProfile,
      props: true
    },
    {
      path: '/gamification',
      name: 'Gamification',
      component: GamificationDashboard
    },
    {
      path: '/workbook',
      name: 'CoachingWorkbook',
      component: CoachingWorkbook
    },
    {
      path: '/coaching-program/:classId',
      name: 'CoachingProgramGuide',
      component: CoachingProgramGuide,
      props: true
    },
    {
      path: '/tch-curriculum',
      name: 'TCHCurriculumManager',
      component: TCHCurriculumManager
    },
    {
      path: '/term-manager',
      name: 'StudentTermManager',
      component: StudentTermManager
    },
    {
      path: '/character-leaderboard',
      name: 'CharacterLeaderboard',
      component: CharacterLeaderboard
    },
    {
      path: '/quick-registration',
      name: 'QuickStudentRegistration',
      component: QuickStudentRegistration
    },
    {
      path: '/webhook-settings',
      name: 'WebhookSettings',
      component: WebhookSettings
    }
  ]
})

export default router
