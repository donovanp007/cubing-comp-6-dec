'use client'

import { Card } from '@/components/ui/card'
import { Users, UserPlus, AlertCircle, TrendingUp } from 'lucide-react'
import { DashboardMetrics } from '@/types'

interface MetricsTilesProps {
  metrics: DashboardMetrics
  loading?: boolean
}

const tiles: Array<{
  title: string
  key: keyof DashboardMetrics
  icon: any
  color: string
  bgColor: string
  iconBg: string
  format: (value: number) => string
  description: string
}> = [
  {
    title: 'Active Students',
    key: 'totalActiveStudents' as keyof DashboardMetrics,
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    format: (value: number) => value.toString(),
    description: 'Currently enrolled',
  },
  {
    title: 'New Sign-Ups',
    key: 'newSignUps' as keyof DashboardMetrics,
    icon: UserPlus,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    iconBg: 'bg-green-100',
    format: (value: number) => `+${value}`,
    description: 'This month',
  },
  {
    title: 'Outstanding Payments',
    key: 'outstandingPayments' as keyof DashboardMetrics,
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    iconBg: 'bg-red-100',
    format: (value: number) => `${value}`,
    description: 'Need follow-up',
  },
  {
    title: 'Completion Rate',
    key: 'completionRate' as keyof DashboardMetrics,
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    format: (value: number) => `${value.toFixed(1)}%`,
    description: 'Program success',
  },
]

export default function MetricsTiles({ metrics, loading = false }: MetricsTilesProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {tiles.map((tile) => {
        const Icon = tile.icon
        const value = metrics[tile.key]
        
        return (
          <Card 
            key={tile.title} 
            className={`p-6 ${tile.bgColor} border-0 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${tile.iconBg}`}>
                <Icon className={`h-6 w-6 ${tile.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{tile.title}</p>
              <p className={`text-3xl font-bold ${tile.color}`}>
                {tile.format(value)}
              </p>
              <p className="text-xs text-gray-500">{tile.description}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}