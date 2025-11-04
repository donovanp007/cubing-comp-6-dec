'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { 
  Activity,
  Search,
  Filter,
  RefreshCw,
  MessageCircle,
  FolderKanban,
  ClipboardList,
  Tag,
  User,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'

interface ActivityEntry {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  metadata: any
  created_at: string
  user?: {
    name: string
    email: string
    role: string
  }
}

export function ActivityMonitor() {
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [users, setUsers] = useState<any[]>([])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          user:users!inner(name, email, role)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .order('name')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  useEffect(() => {
    fetchActivities()
    fetchUsers()
  }, [])

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.entity_type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = actionFilter === 'all' || activity.action === actionFilter
    const matchesUser = userFilter === 'all' || activity.user_id === userFilter

    return matchesSearch && matchesAction && matchesUser
  })

  const getActionIcon = (action: string) => {
    if (action.includes('comment')) return MessageCircle
    if (action.includes('project')) return FolderKanban
    if (action.includes('task')) return ClipboardList
    if (action.includes('tag')) return Tag
    return Activity
  }

  const getActionColor = (action: string) => {
    if (action.includes('comment')) return 'bg-blue-100 text-blue-800'
    if (action.includes('project')) return 'bg-purple-100 text-purple-800'
    if (action.includes('task')) return 'bg-green-100 text-green-800'
    if (action.includes('tag')) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
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

  const getActionDescription = (activity: ActivityEntry) => {
    const { action, entity_type, metadata } = activity
    const entityName = metadata?.name || metadata?.title || `${entity_type} ${activity.entity_id.substring(0, 8)}`
    
    switch (action) {
      case 'commented':
        return `commented on ${entity_type}: ${entityName}`
      case 'tagged':
        return `tagged ${entity_type}: ${entityName}`
      case 'created_project':
        return `created project: ${entityName}`
      case 'created_task':
        return `created task: ${entityName}`
      case 'updated_project':
        return `updated project: ${entityName}`
      case 'updated_task':
        return `updated task: ${entityName}`
      default:
        return `${action.replace('_', ' ')} ${entity_type}: ${entityName}`
    }
  }

  // Get unique actions for filter
  const uniqueActions = Array.from(new Set(activities.map(a => a.action)))

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
          <h2 className="text-2xl font-bold text-gray-900">Activity Monitor</h2>
          <p className="text-gray-600">Real-time system activity and user actions</p>
        </div>
        <Button onClick={fetchActivities} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Activities</span>
            </div>
            <p className="text-2xl font-bold mt-1">{activities.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Comments</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {activities.filter(a => a.action.includes('comment')).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FolderKanban className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Projects</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {activities.filter(a => a.action.includes('project')).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Tasks</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {activities.filter(a => a.action.includes('task')).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Activity Feed
          </CardTitle>
          <CardDescription>
            Recent user activities across the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Activity List */}
          <div className="space-y-3">
            {filteredActivities.map((activity) => {
              const ActionIcon = getActionIcon(activity.action)
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ActionIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {activity.user?.name || 'Unknown User'}
                      </span>
                      <Badge className={getRoleColor(activity.user?.role || 'team_member')}>
                        {(activity.user?.role || 'team_member').replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={getActionColor(activity.action)}>
                        {activity.action.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {getActionDescription(activity)}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {activity.user?.email}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No activities found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}