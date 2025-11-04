'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  School, 
  Target,
  Calendar,
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react'

interface KPIMetric {
  label: string
  value: string | number
  previousValue?: string | number
  change?: number
  trend: 'up' | 'down' | 'neutral'
  target?: number
  unit?: string
  icon: React.ElementType
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray'
}

interface GrowthKPIsProps {
  loading?: boolean
}

export default function GrowthKPIs({ loading = false }: GrowthKPIsProps) {
  const kpiMetrics: KPIMetric[] = [
    {
      label: 'Student Acquisition Rate',
      value: 24,
      previousValue: 18,
      change: 33.3,
      trend: 'up',
      target: 30,
      unit: 'students/month',
      icon: Users,
      color: 'green'
    },
    {
      label: 'School Partnership Growth',
      value: 12,
      previousValue: 10,
      change: 20.0,
      trend: 'up',
      target: 15,
      unit: 'partnerships',
      icon: School,
      color: 'blue'
    },
    {
      label: 'Program Completion Rate',
      value: '87.5%',
      previousValue: '82.1%',
      change: 5.4,
      trend: 'up',
      target: 90,
      unit: '%',
      icon: Award,
      color: 'purple'
    },
    {
      label: 'Student Retention (90 days)',
      value: '92.3%',
      previousValue: '89.7%',
      change: 2.6,
      trend: 'up',
      target: 95,
      unit: '%',
      icon: Target,
      color: 'green'
    },
    {
      label: 'Average Time to Complete',
      value: 6.2,
      previousValue: 7.1,
      change: -12.7,
      trend: 'up', // Decreasing time is good
      target: 5.5,
      unit: 'weeks',
      icon: Clock,
      color: 'orange'
    },
    {
      label: 'Revenue per School',
      value: 'R4,063',
      previousValue: 'R3,742',
      change: 8.6,
      trend: 'up',
      target: 4500,
      unit: 'ZAR',
      icon: TrendingUp,
      color: 'blue'
    }
  ]

  const quarterlyTargets = [
    { quarter: 'Q1 2025', target: 'R180K', actual: 'R173K', status: 'on-track' },
    { quarter: 'Q2 2025', target: 'R220K', actual: '-', status: 'future' },
    { quarter: 'Q3 2025', target: 'R260K', actual: '-', status: 'future' },
    { quarter: 'Q4 2025', target: 'R300K', actual: '-', status: 'future' },
  ]

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral', change?: number) => {
    if (trend === 'up') return <ArrowUpRight className="h-3 w-3 text-green-600" />
    if (trend === 'down') return <ArrowDownRight className="h-3 w-3 text-red-600" />
    return <Info className="h-3 w-3 text-gray-400" />
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.gray
  }

  const formatValue = (value: string | number, unit?: string) => {
    if (typeof value === 'string') return value
    if (unit === '%') return `${value.toFixed(1)}%`
    if (unit === 'weeks') return `${value.toFixed(1)} weeks`
    return value.toLocaleString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h3>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Change Period
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiMetrics.map((metric, index) => {
            const IconComponent = metric.icon
            const progressPercentage = metric.target && typeof metric.value === 'number' 
              ? Math.min((metric.value / metric.target) * 100, 100)
              : undefined

            return (
              <Card key={index} className={`border-l-4 ${getColorClasses(metric.color)}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center">
                      <IconComponent className="h-4 w-4 mr-2" />
                      {metric.label}
                    </div>
                    {metric.change && getTrendIcon(metric.trend, metric.change)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">
                      {formatValue(metric.value, metric.unit)}
                    </span>
                    {metric.change && (
                      <Badge 
                        variant={metric.trend === 'up' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  
                  {metric.target && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Progress to target</span>
                        <span>{progressPercentage?.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-current rounded-full h-1.5 transition-all duration-300" 
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Target: {formatValue(metric.target, metric.unit)}
                      </div>
                    </div>
                  )}
                  
                  {metric.previousValue && (
                    <div className="text-xs text-gray-500 mt-1">
                      vs {formatValue(metric.previousValue, metric.unit)} last period
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quarterly Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            2025 Quarterly Revenue Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {quarterlyTargets.map((quarter, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{quarter.quarter}</h4>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-blue-600">{quarter.target}</div>
                  <div className="text-sm text-gray-600">Target</div>
                  {quarter.actual !== '-' && (
                    <>
                      <div className="text-lg font-semibold text-green-600">{quarter.actual}</div>
                      <div className="text-sm text-gray-600">Actual</div>
                    </>
                  )}
                  <Badge 
                    variant={
                      quarter.status === 'on-track' ? 'default' : 
                      quarter.status === 'at-risk' ? 'destructive' : 
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {quarter.status === 'on-track' ? 'On Track' : 
                     quarter.status === 'at-risk' ? 'At Risk' : 
                     'Future'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Strong Student Acquisition</h4>
                <p className="text-sm text-green-700">
                  Student acquisition rate is 33% above last month and 80% towards quarterly target.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <School className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">School Partnership Growth</h4>
                <p className="text-sm text-blue-700">
                  Added 2 new school partnerships this month. On track to reach 15 partnerships by Q2.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Improved Program Efficiency</h4>
                <p className="text-sm text-orange-700">
                  Average completion time decreased by 12.7%, showing improved program delivery.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}