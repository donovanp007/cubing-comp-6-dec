import { Database } from './database'

export type School = Database['public']['Tables']['schools']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Reminder = Database['public']['Tables']['reminders']['Row']
export type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
export type SalesOpportunity = Database['public']['Tables']['sales_opportunities']['Row']

export type StudentInsert = Database['public']['Tables']['students']['Insert']
export type StudentUpdate = Database['public']['Tables']['students']['Update']

// Extended type for import functionality that includes school_name for lookup/creation
export interface StudentImport extends StudentInsert {
  school_name?: string
}
export type SchoolInsert = Database['public']['Tables']['schools']['Insert']
export type SchoolUpdate = Database['public']['Tables']['schools']['Update']

export interface StudentWithSchool extends Student {
  schools: School
}

// Enhanced CRM Task types
export interface CRMTask {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date?: string
  assigned_to?: string
  student_id: string
  task_type: 'follow_up' | 'payment' | 'certificate' | 'equipment' | 'general'
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface TaskTemplate {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  task_type: 'follow_up' | 'payment' | 'certificate' | 'equipment' | 'general'
  auto_assign_days?: number // Days after enrollment to auto-assign
}

export interface DashboardMetrics {
  totalActiveStudents: number
  newSignUps: number
  outstandingPayments: number
  completionRate: number
}

export interface FinancialMetrics {
  monthlyRecurringRevenue: number
  totalRevenue: number
  outstandingPaymentAmount: number
  averageRevenuePerStudent: number
  collectionRate: number
  monthOverMonthGrowth: number
}

export interface GrowthMetrics {
  studentGrowthRate: number
  retentionRate: number
  churnRate: number
  schoolsEnrolled: number
  averageStudentsPerSchool: number
  targetAchievementRate: number
}

export interface OperationalMetrics {
  instructorUtilization: number
  classCapacityUtilization: number
  averageResponseTime: number
  certificatesDistributed: number
  cubesDistributed: number
  parentSatisfactionScore: number
}

export interface CEOAnalytics {
  financial: FinancialMetrics
  growth: GrowthMetrics
  operational: OperationalMetrics
  trends: TrendData[]
  alerts: AlertItem[]
}

export interface TrendData {
  period: string
  revenue: number
  students: number
  completions: number
}

export interface AlertItem {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  actionRequired: boolean
}

export interface SchoolProgress {
  id: string
  name: string
  current: number
  target: number
  distanceToTarget: number
  percentComplete: number
}

// Project Management System Types
export type UserRole = 'admin' | 'ceo' | 'manager' | 'team_member'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  avatar_url?: string
  role: UserRole
  department?: string
  created_at: string
  updated_at: string
  last_active?: string
  status: 'active' | 'inactive'
}

export interface Project {
  id: string
  name: string
  description?: string
  color: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  owner_id: string
  team_members: string[]
  start_date?: string
  due_date?: string
  progress: number
  created_at: string
  updated_at: string
  tags: string[]
  aiGenerated?: boolean
}

export interface TaskList {
  id: string
  project_id: string
  name: string
  description?: string
  position: number
  created_at: string
  updated_at: string
}

export interface WorkTask {
  id: string
  project_id: string
  task_list_id?: string
  parent_task_id?: string // For subtasks
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  created_by: string
  due_date?: string
  start_date?: string
  estimated_hours?: number
  actual_hours?: number
  progress: number
  position: number
  tags: string[]
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  content: string
  type: 'comment' | 'status_change' | 'assignment_change' | 'attachment'
  created_at: string
}

export interface TaskAttachment {
  id: string
  task_id: string
  user_id: string
  filename: string
  file_url: string
  file_size: number
  file_type: string
  created_at: string
}

export interface ProjectTemplate {
  id: string
  name: string
  description?: string
  task_lists: {
    name: string
    tasks: {
      title: string
      description?: string
      estimated_hours?: number
    }[]
  }[]
}

export interface TimeEntry {
  id: string
  task_id: string
  user_id: string
  description?: string
  hours: number
  date: string
  created_at: string
}