'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WorkTask, CRMTask, Project, User } from '@/types'
import { useSupabaseProjects } from '@/hooks/useSupabaseProjects'
import { useSupabaseCRMTasks } from '@/hooks/useSupabaseCRMTasks'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import TaskAssignmentModal from '@/components/tasks/TaskAssignmentModal'
import { 
  User as UserIcon,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  FolderKanban,
  MessageSquare,
  Star,
  Filter,
  TrendingUp,
  Target,
  Zap,
  Plus
} from 'lucide-react'

export default function MyTasksPage() {
  const { user, profile } = useAuth()
  // Get real data from Supabase
  const { 
    projects, 
    tasks: allWorkTasks, 
    users, 
    loading: projectsLoading, 
    error: projectsError, 
    updateTask 
  } = useSupabaseProjects()
  
  const { 
    tasks: allCrmTasks, 
    loading: crmLoading, 
    error: crmError, 
    updateTask: updateCrmTask 
  } = useSupabaseCRMTasks()

  // Filter tasks assigned to current user from REAL database data
  const workTasks = allWorkTasks.filter((task) => task.assigned_to === user?.id)
  const crmTasks = allCrmTasks.filter((task) => 
    task.assigned_to === user?.id || task.student_id // Show all CRM tasks for now
  )

  // Local state for filtering and UI
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateCRMTaskModal, setShowCreateCRMTaskModal] = useState(false)
  const [showCreateProjectTaskModal, setShowCreateProjectTaskModal] = useState(false)
  
  // Combine loading states
  const isLoading = projectsLoading || crmLoading
  
  // Helper functions
  const getProjectById = (id: string) => projects.find(p => p.id === id)
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': case 'pending': return 'text-gray-600 bg-gray-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'review': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'blocked': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleWorkTaskStatusChange = async (taskId: string, newStatus: WorkTask['status']) => {
    const updates = {
      status: newStatus,
      progress: newStatus === 'completed' ? 100 : undefined,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
    }
    await updateTask(taskId, updates)
  }

  const handleCrmTaskStatusChange = async (taskId: string, newStatus: CRMTask['status']) => {
    const updates = {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
    }
    await updateCrmTask(taskId, updates)
  }

  const handleCreateCRMTask = async (taskData: any) => {
    // This would use the CRM task creation hook
    // For now, just log the data
    console.log('Creating CRM task:', taskData)
    return true // Simulate success
  }

  const handleCreateProjectTask = async (taskData: any) => {
    // This would use the project task creation hook
    // For now, just log the data
    console.log('Creating project task:', taskData)
    return true // Simulate success
  }

  // Filter tasks
  const filteredWorkTasks = workTasks.filter(task => {
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    return matchesPriority && matchesStatus
  })

  const filteredCrmTasks = crmTasks.filter(task => {
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    return matchesPriority && matchesStatus
  })

  // Task statistics
  const stats = {
    total: workTasks.length + crmTasks.length,
    pending: workTasks.filter(t => t.status === 'todo').length + crmTasks.filter(t => t.status === 'pending').length,
    inProgress: workTasks.filter(t => t.status === 'in_progress').length + crmTasks.filter(t => t.status === 'in_progress').length,
    completed: workTasks.filter(t => t.status === 'completed').length + crmTasks.filter(t => t.status === 'completed').length,
    overdue: [...workTasks, ...crmTasks].filter(t => t.due_date && new Date(t.due_date) < new Date() && !['completed'].includes(t.status)).length
  }

  const WorkTaskCard = ({ task }: { task: WorkTask }) => {
    const project = getProjectById(task.project_id)
    const daysUntil = getDaysUntilDue(task.due_date)
    const isOverdue = daysUntil !== null && daysUntil < 0
    const isDueToday = daysUntil === 0

    return (
      <Card className={`border-l-4 ${getPriorityColor(task.priority)} ${isOverdue ? 'ring-2 ring-red-200' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={(checked) => 
                    handleWorkTaskStatusChange(task.id, checked ? 'completed' : 'todo')
                  }
                />
                <CardTitle className={`text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </CardTitle>
                <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
              
              {project && (
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm text-gray-600">{project.name}</span>
                </div>
              )}
              
              <CardDescription className="line-clamp-2">
                {task.description}
              </CardDescription>
            </div>
            
            <Select
              value={task.status}
              onValueChange={(value) => handleWorkTaskStatusChange(task.id, value as WorkTask['status'])}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {task.progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-500">{task.progress}%</span>
              </div>
              <Progress value={task.progress} className="h-2" />
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              {task.due_date && (
                <span className={`flex items-center ${isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-orange-600 font-medium' : ''}`}>
                  <Calendar className="h-4 w-4 mr-1" />
                  {isOverdue ? (
                    `Overdue by ${Math.abs(daysUntil!)} days`
                  ) : isDueToday ? (
                    'Due today'
                  ) : (
                    `Due ${new Date(task.due_date).toLocaleDateString()}`
                  )}
                </span>
              )}
              
              {task.estimated_hours && (
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {task.estimated_hours}h estimated
                </span>
              )}
            </div>
            
            <div className="flex space-x-1">
              {task.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const CRMTaskCard = ({ task }: { task: CRMTask }) => {
    const daysUntil = getDaysUntilDue(task.due_date)
    const isOverdue = daysUntil !== null && daysUntil < 0
    const isDueToday = daysUntil === 0

    return (
      <Card className={`border-l-4 ${getPriorityColor(task.priority)} ${isOverdue ? 'ring-2 ring-red-200' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={(checked) => 
                    handleCrmTaskStatusChange(task.id, checked ? 'completed' : 'pending')
                  }
                />
                <CardTitle className={`text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </CardTitle>
                <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                  {task.status}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  CRM - {task.task_type.replace('_', ' ')}
                </Badge>
              </div>
              
              <CardDescription className="line-clamp-2">
                {task.description}
              </CardDescription>
            </div>
            
            <Select
              value={task.status}
              onValueChange={(value) => handleCrmTaskStatusChange(task.id, value as CRMTask['status'])}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-gray-500">
            {task.due_date && (
              <span className={`flex items-center ${isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-orange-600 font-medium' : ''}`}>
                <Calendar className="h-4 w-4 mr-1" />
                {isOverdue ? (
                  `Overdue by ${Math.abs(daysUntil!)} days`
                ) : isDueToday ? (
                  'Due today'
                ) : (
                  `Due ${new Date(task.due_date).toLocaleDateString()}`
                )}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
            <UserIcon className="h-8 w-8 mr-3" />
            My Tasks
          </h2>
          <p className="text-gray-600 mt-1">Your assigned tasks and responsibilities</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <Button 
              onClick={() => setShowCreateCRMTaskModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              CRM Task
            </Button>
            <Button 
              onClick={() => setShowCreateProjectTaskModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Project Task
            </Button>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
              {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-gray-500">{profile?.department || 'Team Member'}</p>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">To be started</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Finished</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="flex space-x-2">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All Tasks ({filteredWorkTasks.length + filteredCrmTasks.length})
          </TabsTrigger>
          <TabsTrigger value="work">
            Project Tasks ({filteredWorkTasks.length})
          </TabsTrigger>
          <TabsTrigger value="crm">
            CRM Tasks ({filteredCrmTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filteredWorkTasks.map((task) => (
              <WorkTaskCard key={task.id} task={task} />
            ))}
            {filteredCrmTasks.map((task) => (
              <CRMTaskCard key={task.id} task={task} />
            ))}
            
            {filteredWorkTasks.length === 0 && filteredCrmTasks.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-gray-500">No tasks found</p>
                    <p className="text-xs text-gray-400 mt-1">All caught up! 🎉</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="work" className="space-y-4">
          <div className="grid gap-4">
            {filteredWorkTasks.map((task) => (
              <WorkTaskCard key={task.id} task={task} />
            ))}
            
            {filteredWorkTasks.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <FolderKanban className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No project tasks</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="crm" className="space-y-4">
          <div className="grid gap-4">
            {filteredCrmTasks.map((task) => (
              <CRMTaskCard key={task.id} task={task} />
            ))}
            
            {filteredCrmTasks.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No CRM tasks</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Assignment Modals */}
      <TaskAssignmentModal
        open={showCreateCRMTaskModal}
        onOpenChange={setShowCreateCRMTaskModal}
        onCreateTask={handleCreateCRMTask}
        taskType="crm"
      />
      
      <TaskAssignmentModal
        open={showCreateProjectTaskModal}
        onOpenChange={setShowCreateProjectTaskModal}
        onCreateTask={handleCreateProjectTask}
        taskType="project"
      />
      </div>
    </ProtectedRoute>
  )
}