// Financial and Enrollment Related Types

// ============================================================================
// TERMS / PERIODS
// ============================================================================
export interface Term {
  id: string
  name: string
  year: number
  quarter_or_term: string
  start_date: string
  end_date: string
  status: 'upcoming' | 'active' | 'completed' | 'archived'
  description?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// STUDENT ENROLLMENTS
// ============================================================================
export interface StudentEnrollment {
  id: string
  student_id: string
  term_id: string
  school_id?: string
  term_fee: number
  status: 'enrolled' | 'completed' | 'withdrawn' | 'transferred'
  started_date?: string
  completed_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// INVOICES
// ============================================================================
export interface Invoice {
  id: string
  student_id: string
  term_id: string
  amount: number
  due_date: string
  sent_date?: string
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled'
  description?: string
  zoho_invoice_id?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// PAYMENT TRANSACTIONS
// ============================================================================
export interface PaymentTransaction {
  id: string
  invoice_id?: string
  student_id: string
  amount: number
  payment_date: string
  payment_method?: 'cash' | 'card' | 'transfer' | 'cheque' | 'other'
  reference_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// PROGRESS LOGS
// ============================================================================
export interface ProgressLog {
  id: string
  student_id: string
  term_id?: string
  log_date: string
  progress_note: string
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  milestone_achieved?: string
  created_by?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// LEARNING MODULES
// ============================================================================
export interface LearningModule {
  id: string
  name: string
  description?: string
  course_type: string
  display_order?: number
  created_at: string
  updated_at: string
}

// ============================================================================
// MODULE COMPLETIONS
// ============================================================================
export interface ModuleCompletion {
  id: string
  student_id: string
  module_id: string
  term_id?: string
  completed_date: string
  completion_status: 'in_progress' | 'completed'
  notes?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// AREAS
// ============================================================================
export interface Area {
  id: string
  name: string
  region?: string
  description?: string
  created_at: string
}

// ============================================================================
// ATTENDANCE RECORDS
// ============================================================================
export interface AttendanceRecord {
  id: string
  student_id: string
  class_date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
  marked_by?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// FINANCIAL DASHBOARD SUMMARIES (From Views)
// ============================================================================
export interface CEOFinancialSummary {
  total_active_students: number
  total_schools: number
  total_areas: number
  company_monthly_revenue: number
  recorded_revenue: number
  outstanding_payments: number
  payment_collection_pct: number
  active_terms: number
  current_term?: string
}

// ============================================================================
// SCHOOL FINANCIAL PERFORMANCE
// ============================================================================
export interface SchoolFinancialPerformance {
  id: string
  name: string
  area?: string
  term_fee_per_student: number
  current_students: number
  active_students: number
  paid_students: number
  expected_term_revenue: number
  recorded_revenue: number
  outstanding_amount: number
  revenue_realization_pct: number
}

// ============================================================================
// AREA FINANCIAL PERFORMANCE
// ============================================================================
export interface AreaFinancialPerformance {
  id: string
  name: string
  total_students: number
  total_schools: number
  current_month_revenue: number
  recorded_revenue: number
  outstanding_amount: number
  payment_collection_pct: number
}

// ============================================================================
// TERM ENROLLMENT SUMMARY
// ============================================================================
export interface TermEnrollmentSummary {
  term_id: string
  term_name: string
  year: number
  status: 'upcoming' | 'active' | 'completed' | 'archived'
  total_enrollments: number
  schools_participating: number
  projected_revenue: number
}

// ============================================================================
// COMBINED FINANCIAL DASHBOARD DATA
// ============================================================================
export interface FinancialDashboardData {
  summary: CEOFinancialSummary
  schoolPerformance: SchoolFinancialPerformance[]
  areaPerformance: AreaFinancialPerformance[]
  termSummary?: TermEnrollmentSummary[]
}

// ============================================================================
// BULK OPERATION TYPES
// ============================================================================
export type BulkActionType = 'update_status' | 'send_message' | 'mark_attendance' | 'update_payment' | 'export'

export interface BulkActionRequest {
  action: BulkActionType
  studentIds: string[]
  data?: Record<string, any>
}
