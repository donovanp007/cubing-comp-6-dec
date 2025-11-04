'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  School, 
  FolderKanban, 
  ClipboardList,
  TrendingUp,
  Calendar,
  Bell,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { profile } = useAuth()
  const router = useRouter()

  // Redirect based on role
  useEffect(() => {
    if (profile) {
      if (profile.role === 'admin') {
        router.push('/ceo')
      }
    }
  }, [profile, router])

  if (!profile) return null

  const quickStats = [
    { title: 'Active Students', value: '156', icon: Users, color: 'text-blue-600' },
    { title: 'Schools', value: '12', icon: School, color: 'text-green-600' },
    { title: 'Active Projects', value: '4', icon: FolderKanban, color: 'text-purple-600' },
    { title: 'Pending Tasks', value: '7', icon: ClipboardList, color: 'text-orange-600' }
  ]

  const recentActivities = [
    { action: 'New student enrolled', time: '2 hours ago', type: 'success' },
    { action: 'Project milestone completed', time: '4 hours ago', type: 'info' },
    { action: 'Payment reminder sent', time: '6 hours ago', type: 'warning' },
    { action: 'Task assigned to you', time: '1 day ago', type: 'info' }
  ]

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-4 p-4 md:p-6 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back, {profile.full_name}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your cubing programs
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {profile.role.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href="/students">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Students
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href="/projects">
                    <div className="flex items-center">
                      <FolderKanban className="h-4 w-4 mr-2" />
                      View Projects
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href="/tasks">
                    <div className="flex items-center">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      My Tasks
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href="/schools">
                    <div className="flex items-center">
                      <School className="h-4 w-4 mr-2" />
                      School Overview
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals & Targets Section for All Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Goals & Targets
            </CardTitle>
            <CardDescription>
              Track progress towards our objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Monthly Student Enrollment</p>
                  <p className="text-sm text-gray-500">Target: 30 new students</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">23</p>
                  <p className="text-sm text-gray-500">77% completed</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">School Partnerships</p>
                  <p className="text-sm text-gray-500">Target: 5 new schools</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">3</p>
                  <p className="text-sm text-gray-500">60% completed</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Program Completion Rate</p>
                  <p className="text-sm text-gray-500">Target: 85%</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">78%</p>
                  <p className="text-sm text-gray-500">92% of target</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}