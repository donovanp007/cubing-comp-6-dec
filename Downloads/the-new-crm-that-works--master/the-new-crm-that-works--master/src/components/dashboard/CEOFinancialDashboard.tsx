'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  School,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Plus,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'

interface FinancialMetrics {
  company_monthly_revenue: number
  company_monthly_costs: number
  company_monthly_profit: number
  term_total_revenue: number
  total_active_students: number
  outstanding_payments: number
  total_areas: number
  total_active_teams: number
  total_schools: number
  top_area_by_revenue: string
  underperforming_areas: number
}

interface AreaFinancialPerformance {
  area_id: string
  area_name: string
  region: string
  current_month_revenue: number
  current_month_costs: number
  current_month_profit: number
  current_month_students: number
  ytd_revenue: number
  ytd_costs: number
  ytd_profit: number
  revenue_target: number
  cost_budget: number
  student_target: number
  target_achievement_pct: number
  profit_margin_pct: number
}

interface SchoolFinancialPerformance {
  school_id: string
  school_name: string
  area: string
  principal_name: string
  term_fee_per_student: number
  current_students: number
  active_students: number
  paid_students: number
  expected_term_revenue: number
  actual_term_revenue: number
  recorded_revenue: number
  recorded_costs: number
  recorded_profit: number
  payment_collection_pct: number
  revenue_realization_pct: number
}

interface CEOFinancialDashboardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CEOFinancialDashboard({ open, onOpenChange }: CEOFinancialDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('current-month')

  // Data states
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [areaPerformance, setAreaPerformance] = useState<AreaFinancialPerformance[]>([])
  const [schoolPerformance, setSchoolPerformance] = useState<SchoolFinancialPerformance[]>([])

  useEffect(() => {
    if (open) {
      fetchFinancialData()
    }
  }, [open, selectedPeriod])

  const fetchFinancialData = async () => {
    setLoading(true)
    try {
      // Fetch CEO dashboard metrics
      const metricsResponse = await supabase
        .from('ceo_financial_dashboard')
        .select('*')
        .single()

      // Fetch area performance
      const areasResponse = await supabase
        .from('area_financial_performance')
        .select('*')
        .order('current_month_revenue', { ascending: false })

      // Fetch school performance
      const schoolsResponse = await supabase
        .from('school_financial_performance')
        .select('*')
        .order('expected_term_revenue', { ascending: false })

      if (metricsResponse.data) setMetrics(metricsResponse.data)
      if (areasResponse.data) setAreaPerformance(areasResponse.data)
      if (schoolsResponse.data) setSchoolPerformance(schoolsResponse.data)

    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-100 text-green-700 border-green-200'
    if (percentage >= 80) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading financial dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Financial Data</h3>
          <p className="text-gray-600 mb-4">
            Please ensure the financial architecture has been set up and data has been populated.
          </p>
          <Button onClick={fetchFinancialData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <DollarSign className="h-8 w-8" />
            CEO Financial Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Complete financial oversight - revenue, costs, and profitability across all operations
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="term">Current Term</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchFinancialData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Monthly Revenue</div>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics.company_monthly_revenue)}
              </div>
              <div className="text-xs text-green-600">Current month total</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Monthly Profit</div>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics.company_monthly_profit)}
              </div>
              <div className="text-xs text-blue-600">
                {metrics.company_monthly_revenue > 0
                  ? `${Math.round((metrics.company_monthly_profit / metrics.company_monthly_revenue) * 100)}% margin`
                  : '0% margin'
                }
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Term Revenue</div>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics.term_total_revenue)}
              </div>
              <div className="text-xs text-purple-600">Total this term</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Active Students</div>
              <div className="text-2xl font-bold">{metrics.total_active_students}</div>
              <div className="text-xs text-orange-600">
                {metrics.outstanding_payments} outstanding payments
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Company Performance Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-lg mb-2">
                <span className="font-medium">Revenue Performance</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(metrics.company_monthly_revenue)}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">Monthly revenue across all areas</div>
              <Progress value={85} className="h-3" />
            </div>

            <div>
              <div className="flex justify-between text-lg mb-2">
                <span className="font-medium">Cost Control</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(metrics.company_monthly_costs)}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">Total operational costs</div>
              <Progress value={72} className="h-3" />
            </div>

            <div>
              <div className="flex justify-between text-lg mb-2">
                <span className="font-medium">Profit Margin</span>
                <span className="font-bold text-purple-600">
                  {metrics.company_monthly_revenue > 0
                    ? `${Math.round((metrics.company_monthly_profit / metrics.company_monthly_revenue) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">Overall profitability</div>
              <Progress value={Math.round((metrics.company_monthly_profit / metrics.company_monthly_revenue) * 100)} className="h-3" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Areas:</span>
              <span className="font-bold">{metrics.total_areas}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Teams:</span>
              <span className="font-bold">{metrics.total_active_teams}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Schools:</span>
              <span className="font-bold">{metrics.total_schools}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="text-sm text-gray-600 mb-1">Top Performing Area:</div>
              <div className="font-semibold text-green-600">{metrics.top_area_by_revenue}</div>
            </div>
            {metrics.underperforming_areas > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">{metrics.underperforming_areas} areas need attention</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="areas">Area Performance</TabsTrigger>
          <TabsTrigger value="schools">School Analysis</TabsTrigger>
          <TabsTrigger value="targets">Targets & Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Financial Achievements
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="font-semibold text-lg">Monthly Revenue Target</div>
                  <div className="text-gray-600">
                    {formatCurrency(metrics.company_monthly_revenue)} achieved
                  </div>
                  <div className="text-sm text-green-600">On track for quarterly goals</div>
                </div>
                <div>
                  <div className="font-semibold text-lg">Student Enrollment</div>
                  <div className="text-gray-600">{metrics.total_active_students} active students</div>
                  <div className="text-sm text-blue-600">Healthy growth trajectory</div>
                </div>
                <div>
                  <div className="font-semibold text-lg">Operational Efficiency</div>
                  <div className="text-gray-600">
                    {Math.round((metrics.company_monthly_profit / metrics.company_monthly_revenue) * 100)}% profit margin
                  </div>
                  <div className="text-sm text-purple-600">Strong operational control</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Areas Requiring Attention
              </h3>
              <div className="space-y-3">
                {metrics.outstanding_payments > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="font-semibold text-red-700">Outstanding Payments</div>
                    <div className="text-red-600">{metrics.outstanding_payments} students with pending payments</div>
                  </div>
                )}

                {metrics.underperforming_areas > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="font-semibold text-yellow-700">Underperforming Areas</div>
                    <div className="text-yellow-600">{metrics.underperforming_areas} areas below 70% target</div>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-semibold text-blue-700">Growth Opportunities</div>
                  <div className="text-blue-600">Expand successful programs to new areas</div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="areas" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Area Financial Performance</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {areaPerformance.map((area) => (
              <Card key={area.area_id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{area.area_name}</h3>
                    <div className="text-gray-600">{area.region}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getPerformanceBadge(area.target_achievement_pct)}>
                      {area.target_achievement_pct}% Target Achievement
                    </Badge>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {formatCurrency(area.current_month_revenue)}
                      </div>
                      <div className="text-sm text-gray-600">Monthly Revenue</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="font-semibold text-green-800">Revenue</div>
                    <div className="text-2xl font-bold text-green-900">
                      {formatCurrency(area.current_month_revenue)}
                    </div>
                    <div className="text-sm text-green-600">
                      Target: {formatCurrency(area.revenue_target)}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-semibold text-blue-800">Costs</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(area.current_month_costs)}
                    </div>
                    <div className="text-sm text-blue-600">
                      Budget: {formatCurrency(area.cost_budget)}
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="font-semibold text-purple-800">Profit</div>
                    <div className="text-2xl font-bold text-purple-900">
                      {formatCurrency(area.current_month_profit)}
                    </div>
                    <div className="text-sm text-purple-600">
                      Margin: {area.profit_margin_pct}%
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="font-semibold text-orange-800">Students</div>
                    <div className="text-2xl font-bold text-orange-900">
                      {area.current_month_students}
                    </div>
                    <div className="text-sm text-orange-600">
                      Target: {area.student_target}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Target Achievement Progress</span>
                    <span className={`font-bold ${getPerformanceColor(area.target_achievement_pct)}`}>
                      {area.target_achievement_pct}%
                    </span>
                  </div>
                  <Progress value={area.target_achievement_pct} className="h-3" />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schools" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">School Financial Analysis</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schoolPerformance.map((school) => (
              <Card key={school.school_id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{school.school_name}</h3>
                    <div className="text-gray-600">{school.area}</div>
                    {school.principal_name && (
                      <div className="text-sm text-gray-500">Principal: {school.principal_name}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {formatCurrency(school.expected_term_revenue)}
                    </div>
                    <div className="text-sm text-gray-600">Expected Revenue</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm text-blue-600">Students</div>
                    <div className="font-bold text-blue-800">
                      {school.current_students}
                    </div>
                    <div className="text-xs text-blue-600">
                      {school.active_students} active
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-sm text-green-600">Paid Students</div>
                    <div className="font-bold text-green-800">
                      {school.paid_students}
                    </div>
                    <div className="text-xs text-green-600">
                      {school.payment_collection_pct}% collection
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Payment Collection</span>
                      <span className="font-medium">{school.payment_collection_pct}%</span>
                    </div>
                    <Progress value={school.payment_collection_pct} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Revenue Realization</span>
                      <span className="font-medium">{school.revenue_realization_pct}%</span>
                    </div>
                    <Progress value={school.revenue_realization_pct} className="h-2" />
                  </div>
                </div>

                <div className="pt-3 border-t mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Term Fee:</span>
                    <span className="font-medium">{formatCurrency(school.term_fee_per_student)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Actual Revenue:</span>
                    <span className="font-medium">{formatCurrency(school.actual_term_revenue)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="targets" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Revenue Targets & Goals</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Set New Target
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Company Targets</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Revenue Target:</span>
                  <span className="font-bold">{formatCurrency(500000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Achievement:</span>
                  <span className="font-bold text-green-600">
                    {Math.round((metrics.company_monthly_revenue / 500000) * 100)}%
                  </span>
                </div>
                <Progress value={Math.round((metrics.company_monthly_revenue / 500000) * 100)} className="h-3" />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Student Targets</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Student Target:</span>
                  <span className="font-bold">300</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Students:</span>
                  <span className="font-bold text-blue-600">{metrics.total_active_students}</span>
                </div>
                <Progress value={Math.round((metrics.total_active_students / 300) * 100)} className="h-3" />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Profitability Targets</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Margin:</span>
                  <span className="font-bold">25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Margin:</span>
                  <span className="font-bold text-purple-600">
                    {Math.round((metrics.company_monthly_profit / metrics.company_monthly_revenue) * 100)}%
                  </span>
                </div>
                <Progress
                  value={Math.round((metrics.company_monthly_profit / metrics.company_monthly_revenue) * 100) / 25 * 100}
                  className="h-3"
                />
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}