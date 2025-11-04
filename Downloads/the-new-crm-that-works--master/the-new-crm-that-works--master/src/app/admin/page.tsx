'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { ShowForAdmin } from '@/components/auth/ConditionalRender'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserManagement } from '@/components/admin/UserManagement'
import { SystemSettings } from '@/components/admin/SystemSettings'
import { SystemAnalytics } from '@/components/admin/SystemAnalytics'
import { ActivityMonitor } from '@/components/admin/ActivityMonitor'
import { 
  Users, 
  Settings, 
  BarChart3, 
  Activity,
  Shield,
  Database
} from 'lucide-react'

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <ShowForAdmin>
        <div className="flex-1 space-y-4 p-4 md:p-6 pt-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Manage users, settings, and monitor system activity
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Administrator</span>
            </div>
          </div>

          {/* Admin Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>User Management</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Activity</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <SystemAnalytics />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <ActivityMonitor />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <SystemSettings />
            </TabsContent>
          </Tabs>
        </div>
      </ShowForAdmin>
    </ProtectedRoute>
  )
}