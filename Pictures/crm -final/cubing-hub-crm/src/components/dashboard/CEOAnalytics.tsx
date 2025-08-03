'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  School, 
  Award,
  AlertTriangle,
  Clock,
  Target,
  Download,
  Filter
} from 'lucide-react'
import { FinancialMetrics, GrowthMetrics, OperationalMetrics, AlertItem, TrendData } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CEOAnalyticsProps {
  financial: FinancialMetrics
  growth: GrowthMetrics
  operational: OperationalMetrics
  trends: TrendData[]
  alerts: AlertItem[]
  loading?: boolean
}

export default function CEOAnalytics({
  financial,
  growth,
  operational,
  trends,
  alerts,
  loading = false
}: CEOAnalyticsProps) {
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`
  const formatNumber = (value: number) => value.toLocaleString()

  const getTrendIcon = (growth: number) => {
    return growth >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'success': return <Award className="h-4 w-4 text-green-600" />
      default: return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-md animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Export Options */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CEO Analytics</h2>
          <p className="text-gray-600">Comprehensive business intelligence dashboard</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter Period
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Priority Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <span className="text-xs text-gray-500">{alert.timestamp}</span>
                  </div>
                  {alert.actionRequired && (
                    <Badge variant="destructive" className="text-xs">Action Required</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              Monthly Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(financial.monthlyRecurringRevenue)}
              </span>
              {getTrendIcon(financial.monthOverMonthGrowth)}
              <span className={`text-sm ${financial.monthOverMonthGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(Math.abs(financial.monthOverMonthGrowth))}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-blue-600" />
              Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">
                {formatPercentage(financial.collectionRate)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(financial.outstandingPaymentAmount)} outstanding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-purple-600" />
              Revenue per Student
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-purple-600">
                {formatCurrency(financial.averageRevenuePerStudent)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">average monthly</p>
          </CardContent>
        </Card>
      </div>

      {/* Growth & Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Student Growth Rate</span>
              <span className="font-semibold text-green-600">
                {formatPercentage(growth.studentGrowthRate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Retention Rate</span>
              <span className="font-semibold">
                {formatPercentage(growth.retentionRate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Schools Enrolled</span>
              <span className="font-semibold">{formatNumber(growth.schoolsEnrolled)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Students/School</span>
              <span className="font-semibold">{growth.averageStudentsPerSchool.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Target Achievement</span>
              <Badge variant={growth.targetAchievementRate >= 80 ? "default" : "secondary"}>
                {formatPercentage(growth.targetAchievementRate)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <School className="h-5 w-5 mr-2 text-blue-600" />
              Operational Excellence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Instructor Utilization</span>
              <span className="font-semibold">
                {formatPercentage(operational.instructorUtilization)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Class Capacity</span>
              <span className="font-semibold">
                {formatPercentage(operational.classCapacityUtilization)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Certificates Issued</span>
              <span className="font-semibold">{formatNumber(operational.certificatesDistributed)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cubes Distributed</span>
              <span className="font-semibold">{formatNumber(operational.cubesDistributed)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Parent Satisfaction</span>
              <Badge variant={operational.parentSatisfactionScore >= 4.5 ? "default" : "secondary"}>
                {operational.parentSatisfactionScore.toFixed(1)}/5.0
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Revenue & Growth Trends (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">{trend.period}</span>
                  <span className="text-green-600 font-semibold">
                    {formatCurrency(trend.revenue)}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {formatNumber(trend.students)} students
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatNumber(trend.completions)} completions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}