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