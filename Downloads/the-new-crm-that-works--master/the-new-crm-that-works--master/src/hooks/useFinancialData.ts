'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  CEOFinancialSummary,
  SchoolFinancialPerformance,
  AreaFinancialPerformance,
  TermEnrollmentSummary,
  FinancialDashboardData,
  Term,
  Invoice,
  PaymentTransaction,
  ProgressLog,
  StudentEnrollment,
  AttendanceRecord,
} from '@/types/financial'

interface UseFinancialDataResult {
  dashboardData: FinancialDashboardData | null
  terms: Term[]
  invoices: Invoice[]
  payments: PaymentTransaction[]
  progressLogs: ProgressLog[]
  enrollments: StudentEnrollment[]
  attendance: AttendanceRecord[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  selectedTerm: string
  setSelectedTerm: (termId: string) => void
}

export function useFinancialData(): UseFinancialDataResult {
  const supabase = createClient()
  const [dashboardData, setDashboardData] = useState<FinancialDashboardData | null>(null)
  const [terms, setTerms] = useState<Term[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<PaymentTransaction[]>([])
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([])
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTerm, setSelectedTerm] = useState<string>('')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch terms
      const { data: termsData, error: termsError } = await supabase
        .from('terms')
        .select('*')
        .order('start_date', { ascending: false })

      if (termsError) throw termsError
      setTerms(termsData as Term[])

      // Set selected term to current active term
      const activeTerm = termsData?.find((t: any) => t.status === 'active')
      if (activeTerm && !selectedTerm) {
        setSelectedTerm(activeTerm.id)
      }

      // Fetch financial dashboard data (from views)
      const { data: summaryData, error: summaryError } = await supabase
        .from('ceo_financial_dashboard')
        .select('*')
        .single()

      if (summaryError && summaryError.code !== 'PGRST116') {
        console.error('Summary error:', summaryError)
      }

      const { data: schoolData, error: schoolError } = await supabase
        .from('school_financial_performance')
        .select('*')

      if (schoolError && schoolError.code !== 'PGRST116') {
        console.error('School error:', schoolError)
      }

      const { data: areaData, error: areaError } = await supabase
        .from('area_financial_performance')
        .select('*')

      if (areaError && areaError.code !== 'PGRST116') {
        console.error('Area error:', areaError)
      }

      setDashboardData({
        summary: (summaryData as CEOFinancialSummary) || {
          total_active_students: 0,
          total_schools: 0,
          total_areas: 0,
          company_monthly_revenue: 0,
          recorded_revenue: 0,
          outstanding_payments: 0,
          payment_collection_pct: 0,
          active_terms: 0,
        },
        schoolPerformance: (schoolData as SchoolFinancialPerformance[]) || [],
        areaPerformance: (areaData as AreaFinancialPerformance[]) || [],
      })

      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

      if (invoicesError) throw invoicesError
      setInvoices(invoicesData as Invoice[])

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('payment_date', { ascending: false })

      if (paymentsError) throw paymentsError
      setPayments(paymentsData as PaymentTransaction[])

      // Fetch progress logs
      const { data: progressData, error: progressError } = await supabase
        .from('progress_logs')
        .select('*')
        .order('log_date', { ascending: false })

      if (progressError) throw progressError
      setProgressLogs(progressData as ProgressLog[])

      // Fetch enrollments
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('student_enrollments')
        .select('*')
        .order('created_at', { ascending: false })

      if (enrollmentError) throw enrollmentError
      setEnrollments(enrollmentData as StudentEnrollment[])

      // Fetch attendance
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .order('class_date', { ascending: false })

      if (attendanceError) throw attendanceError
      setAttendance(attendanceData as AttendanceRecord[])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch financial data'
      setError(message)
      console.error('Error fetching financial data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    dashboardData,
    terms,
    invoices,
    payments,
    progressLogs,
    enrollments,
    attendance,
    loading,
    error,
    refetch: fetchData,
    selectedTerm,
    setSelectedTerm,
  }
}
