'use client'

import { useState, useEffect } from 'react'
import Layout from './Layout'
import CEOAnalytics from './CEOAnalytics'
import GrowthKPIs from './GrowthKPIs'
import { CEOAnalytics as CEOAnalyticsType, FinancialMetrics, GrowthMetrics, OperationalMetrics, TrendData, AlertItem } from '@/types'

// Mock data for CEO analytics - this would come from your backend
const mockFinancialMetrics: FinancialMetrics = {
  monthlyRecurringRevenue: 48750,
  totalRevenue: 293250,
  outstandingPaymentAmount: 8420,
  averageRevenuePerStudent: 520,
  collectionRate: 94.2,
  monthOverMonthGrowth: 12.3,
}

const mockGrowthMetrics: GrowthMetrics = {
  studentGrowthRate: 15.8,
  retentionRate: 87.5,
  churnRate: 12.5,
  schoolsEnrolled: 12,
  averageStudentsPerSchool: 24.3,
  targetAchievementRate: 86.7,
}

const mockOperationalMetrics: OperationalMetrics = {
  instructorUtilization: 78.5,
  classCapacityUtilization: 82.3,
  averageResponseTime: 4.2, // hours
  certificatesDistributed: 67,
  cubesDistributed: 234,
  parentSatisfactionScore: 4.7,
}

const mockTrends: TrendData[] = [
  { period: 'January 2025', revenue: 42500, students: 285, completions: 45 },
  { period: 'December 2024', revenue: 39800, students: 267, completions: 52 },
  { period: 'November 2024', revenue: 37200, students: 251, completions: 38 },
  { period: 'October 2024', revenue: 35600, students: 243, completions: 41 },
  { period: 'September 2024', revenue: 33900, students: 228, completions: 36 },
  { period: 'August 2024', revenue: 31200, students: 215, completions: 29 },
]

const mockAlerts: AlertItem[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Outstanding Payments',
    message: '3 students have payments overdue by more than 30 days',
    timestamp: '2 hours ago',
    actionRequired: true,
  },
  {
    id: '2',
    type: 'info',
    title: 'New School Partnership',
    message: 'Greenfield Academy is ready to start their cubing program next week',
    timestamp: '5 hours ago',
    actionRequired: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Monthly Target Achieved',
    message: 'Congratulations! You\'ve exceeded this month\'s enrollment target by 8%',
    timestamp: '1 day ago',
    actionRequired: false,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Instructor Capacity',
    message: 'Sarah Johnson is approaching maximum class capacity. Consider additional support.',
    timestamp: '2 days ago',
    actionRequired: true,
  },
]

export default function CEODashboard() {
  const [analytics, setAnalytics] = useState<CEOAnalyticsType>({
    financial: mockFinancialMetrics,
    growth: mockGrowthMetrics,
    operational: mockOperationalMetrics,
    trends: mockTrends,
    alerts: mockAlerts,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Simulate loading analytics data
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const handleExportReport = () => {
    // This would generate and download a comprehensive CEO report
    console.log('Exporting CEO report...')
  }

  const handleFilterPeriod = () => {
    // This would open a date range picker to filter analytics
    console.log('Filtering analytics period...')
  }

  return (
    <Layout
      title="CEO Dashboard"
      subtitle="Strategic insights and business intelligence for informed decision-making"
      showAddButton={false}
    >
      <div className="space-y-8">
        <CEOAnalytics
          financial={analytics.financial}
          growth={analytics.growth}
          operational={analytics.operational}
          trends={analytics.trends}
          alerts={analytics.alerts}
          loading={loading}
        />
        
        <GrowthKPIs loading={loading} />
      </div>
    </Layout>
  )
}