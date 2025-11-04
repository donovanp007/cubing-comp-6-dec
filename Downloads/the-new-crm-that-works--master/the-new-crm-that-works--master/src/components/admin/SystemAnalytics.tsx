'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSupabaseUsers } from '@/hooks/useSupabaseUsers'
import { 
  Users, 
  TrendingUp, 
  MessageCircle, 
  FolderKanban, 
  ClipboardList,
  Calendar,
  BarChart3,
  Activity,
  Target,
  Award
} from 'lucide-react'
import { format, startOfWeek, startOfMonth, startOfYear, subDays } from 'date-fns'

export function SystemAnalytics() {
  const { users, loading } = useSupabaseUsers()
  const [timeRange, setTimeRange] = useState('30days')

  // Calculate analytics data
  const analytics = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalActivity: 0, // TODO: Implement activity tracking
    avgActivityPerUser: 0, // TODO: Implement activity tracking
    totalComments: 0, // TODO: Implement comment tracking
    totalProjects: 0, // TODO: Count actual projects from projects table
    totalTasks: 0, // TODO: Count actual tasks from work_tasks table
    roleDistribution: users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    departmentDistribution: users.reduce((acc, user) => {
      const dept = user.department || 'Unassigned'
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    topPerformers: users
      .sort((a, b) => a.name.localeCompare(b.name)) // Sort by name for now
      .slice(0, 5),
    recentlyActive: users
      .filter(u => u.last_active)
      .sort((a, b) => new Date(b.last_active!).getTime() - new Date(a.last_active!).getTime())
      .slice(0, 5)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'ceo': return 'bg-purple-100 text-purple-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'team_member': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Analytics</h2>
          <p className="text-gray-600">Overview of system usage and user activity</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <p className="text-3xl font-bold mt-2">{analytics.totalUsers}</p>
            <p className="text-sm text-green-600 mt-1">
              {analytics.activeUsers} active ({Math.round((analytics.activeUsers / analytics.totalUsers) * 100) || 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Total Activity</span>
            </div>
            <p className="text-3xl font-bold mt-2">{analytics.totalActivity}</p>
            <p className="text-sm text-purple-600 mt-1">
              {analytics.avgActivityPerUser} avg per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Comments</span>
            </div>
            <p className="text-3xl font-bold mt-2">{analytics.totalComments}</p>
            <p className="text-sm text-green-600 mt-1">
              {analytics.totalComments > 0 ? Math.round(analytics.totalComments / analytics.activeUsers) : 0} per active user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FolderKanban className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Projects & Tasks</span>
            </div>
            <p className="text-3xl font-bold mt-2">{analytics.totalProjects + analytics.totalTasks}</p>
            <p className="text-sm text-orange-600 mt-1">
              {analytics.totalProjects}p • {analytics.totalTasks}t
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Role Distribution
            </CardTitle>
            <CardDescription>Users by role in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.roleDistribution).map(([role, count]) => {
                const percentage = Math.round((count / analytics.totalUsers) * 100)
                return (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(role)}`}>
                        {role.replace('_', ' ').toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-600">{count} users</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Department Distribution
            </CardTitle>
            <CardDescription>Users by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.departmentDistribution).map(([dept, count]) => {
                const percentage = Math.round((count / analytics.totalUsers) * 100)
                return (
                  <div key={dept} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{dept}</span>
                      <span className="text-sm text-gray-600">{count} users</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Top Performers
            </CardTitle>
            <CardDescription>Users with highest activity scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPerformers.map((user, index) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">0</p>
                    <p className="text-xs text-gray-500">activity score</p>
                  </div>
                </div>
              ))}
              {analytics.topPerformers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No activity data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recently Active */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recently Active
            </CardTitle>
            <CardDescription>Users who have been active recently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentlyActive.map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(user.last_active!), 'MMM d')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(user.last_active!), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              {analytics.recentlyActive.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}