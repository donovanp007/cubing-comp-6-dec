'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PriorityBadge } from "@/components/ui/priority-badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CRMTask } from '@/types'
import { useSupabaseCRMTasks } from '@/hooks/useSupabaseCRMTasks'
import TaskKanbanBoard, { EnhancedTask } from '@/components/crm/TaskKanbanBoard'
import { 
  ClipboardList,
  Plus, 
  Search, 
  Filter, 
  Calendar,
  User,
  School,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Save,
  X,
  Phone,
  CreditCard,
  Award,
  Package,
  FileText,
  List,
  LayoutGrid
} from 'lucide-react'


// Mock student data for display
const mockStudents = {
  'student-1': { name: 'John Smith', school: 'Greenfield Primary' },
  'student-2': { name: 'Sarah Johnson', school: 'Parktown High' },
  'student-3': { name: 'Mike Davis', school: 'Riverside Academy' },
  'student-4': { name: 'Emma Wilson', school: 'Central High' },
  'student-5': { name: 'Alex Brown', school: 'Mountain View' },
}

const taskTypeIcons = {
  follow_up: Phone,
  payment: CreditCard,
  certificate: Award,
  equipment: Package,
  general: FileText,
}

const taskTypeColors = {
  follow_up: 'bg-blue-50 border-blue-200 text-blue-700',
  payment: 'bg-green-50 border-green-200 text-green-700',
  certificate: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  equipment: 'bg-purple-50 border-purple-200 text-purple-700',
  general: 'bg-gray-50 border-gray-200 text-gray-700',
}

export default function TasksPage() {
  const { 
    tasks, 
    loading, 
    error, 
    updateTask, 
    deleteTask 
  } = useSupabaseCRMTasks()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedTaskType, setSelectedTaskType] = useState<string>('all')
  const [editingTask, setEditingTask] = useState<CRMTask | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')

  // Transform CRM tasks to match the Enhanced Task interface for Kanban
  const transformTasksForKanban = (): EnhancedTask[] => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: mapCRMStatusToKanbanStatus(task.status),
      priority: task.priority,
      task_type: task.task_type || 'general',
      student_id: task.student_id,
      student_name: getStudentName(task.student_id),
      project_id: undefined, // CRM tasks don't have projects
      project_name: undefined,
      assigned_to: task.assigned_to,
      assignee_name: 'Unassigned', // We'll need to get this from users
      assignee_email: undefined,
      due_at: task.due_date,
      start_at: undefined,
      completed_at: task.completed_at,
      estimate_minutes: undefined,
      actual_minutes: undefined,
      labels: [task.task_type],
      comment_count: 0,
      checklist_total: 0,
      checklist_done: 0,
      created_at: task.created_at,
      updated_at: task.updated_at
    }))
  }

  // Map CRM task status to Kanban status
  const mapCRMStatusToKanbanStatus = (crmStatus: CRMTask['status']): EnhancedTask['status'] => {
    switch (crmStatus) {
      case 'pending': return 'todo'
      case 'in_progress': return 'doing'
      case 'completed': return 'done'
      case 'cancelled': return 'blocked'
      default: return 'todo'
    }
  }

  // Map Kanban status back to CRM status
  const mapKanbanStatusToCRMStatus = (kanbanStatus: string): CRMTask['status'] => {
    switch (kanbanStatus) {
      case 'todo': return 'pending'
      case 'doing': return 'in_progress'
      case 'done': return 'completed'
      case 'blocked': return 'cancelled'
      default: return 'pending'
    }
  }

  // Get student name from mock data (this would come from database in real implementation)
  const getStudentName = (studentId: string): string => {
    const studentInfo = mockStudents[studentId as keyof typeof mockStudents]
    return studentInfo?.name || 'Unknown Student'
  }

  // Handle task move in Kanban
  const handleTaskMove = async (taskId: string, newStatus: string): Promise<void> => {
    const crmStatus = mapKanbanStatusToCRMStatus(newStatus)
    await handleStatusChange(taskId, crmStatus)
  }

  // Handle task click in Kanban
  const handleTaskClick = (task: EnhancedTask): void => {
    const crmTask = tasks.find(t => t.id === task.id)
    if (crmTask) {
      handleEditTask(crmTask)
    }
  }

  // Handle add task in Kanban
  const handleAddTask = (status: string): void => {
    // For now, we'll just show the edit modal with a new task
    // In a full implementation, this would open a "create task" modal
    console.log('Add task with status:', status)
  }

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const studentInfo = mockStudents[task.student_id as keyof typeof mockStudents]
    const studentName = studentInfo?.name || 'Unknown Student'
    const schoolName = studentInfo?.school || 'Unknown School'
    
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         schoolName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus
    const matchesTaskType = selectedTaskType === 'all' || task.task_type === selectedTaskType
    
    return matchesSearch && matchesPriority && matchesStatus && matchesTaskType
  })

  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed')
  const highTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed')
  const mediumTasks = tasks.filter(t => t.priority === 'medium' && t.status !== 'completed')
  const lowTasks = tasks.filter(t => t.priority === 'low' && t.status !== 'completed')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  const handleStatusChange = async (taskId: string, newStatus: CRMTask['status']) => {
    const updates = { 
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
    }
    
    const success = await updateTask(taskId, updates)
    if (success) {
      console.log(`Task ${taskId} status updated to ${newStatus}`)
    } else {
      console.error(`Failed to update task ${taskId}`)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      const success = await deleteTask(taskId)
      if (success) {
        console.log(`Task ${taskId} deleted`)
      } else {
        console.error(`Failed to delete task ${taskId}`)
      }
    }
  }

  const handleEditTask = (task: CRMTask) => {
    setEditingTask({...task})
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (editingTask) {
      const success = await updateTask(editingTask.id, editingTask)
      if (success) {
        setIsEditModalOpen(false)
        setEditingTask(null)
        console.log('Task updated successfully')
      } else {
        console.error('Failed to update task')
      }
    }
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditingTask(null)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const TaskCard = ({ task }: { task: CRMTask }) => {
    const studentInfo = mockStudents[task.student_id as keyof typeof mockStudents]
    const studentName = studentInfo?.name || 'Unknown Student'
    const schoolName = studentInfo?.school || 'Unknown School'
    const daysUntil = getDaysUntilDue(task.due_date)
    const isOverdue = daysUntil !== null && daysUntil < 0
    const isDueToday = daysUntil === 0
    const Icon = taskTypeIcons[task.task_type]
    
    return (
      <Card className={`transition-all duration-200 hover:shadow-lg ${
        task.status === 'completed'
          ? 'bg-green-50 border-green-200' 
          : isOverdue 
            ? 'bg-red-50 border-red-200'
            : isDueToday
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-white hover:shadow-md'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between space-x-4">
            <div className="flex items-start space-x-4 flex-grow">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                  {getInitials(studentName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-grow space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-gray-600" />
                  <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  <PriorityBadge priority={task.priority} size="sm" />
                  <Badge className={taskTypeColors[task.task_type]} variant="outline">
                    {task.task_type.replace('_', ' ')}
                  </Badge>
                </div>
                
                {task.description && (
                  <p className={`text-sm ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{studentName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <School className="h-4 w-4" />
                    <span>{schoolName}</span>
                  </div>
                  {task.due_date && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Due: {new Date(task.due_date).toLocaleDateString()}
                        {isOverdue && <span className="text-red-600 font-medium ml-1">(Overdue)</span>}
                        {isDueToday && <span className="text-orange-600 font-medium ml-1">(Due Today)</span>}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {task.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              {task.status !== 'completed' && (
                <Select
                  value={task.status}
                  onValueChange={(value) => handleStatusChange(task.id, value as CRMTask['status'])}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                        Completed
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEditTask(task)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading CRM tasks...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
            <ClipboardList className="h-8 w-8 mr-3" />
            CRM Task Center
          </h2>
          <p className="text-gray-600 mt-1">Centralized view of all student-related tasks and reminders</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Kanban
            </Button>
          </div>
          
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentTasks.length}</div>
            <p className="text-xs text-muted-foreground">Immediate attention</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highTasks.length}</div>
            <p className="text-xs text-muted-foreground">Important tasks</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Priority</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mediumTasks.length}</div>
            <p className="text-xs text-muted-foreground">Follow-up tasks</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Priority</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{lowTasks.length}</div>
            <p className="text-xs text-muted-foreground">General tasks</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">Finished tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks, students, or schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={selectedTaskType} onValueChange={setSelectedTaskType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Task Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant={selectedPriority === 'urgent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority(selectedPriority === 'urgent' ? 'all' : 'urgent')}
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              >
                Urgent
              </Button>
              <Button
                variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(selectedStatus === 'pending' ? 'all' : 'pending')}
              >
                Pending
              </Button>
              <Button
                variant={selectedStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(selectedStatus === 'completed' ? 'all' : 'completed')}
              >
                Completed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditional View Rendering */}
      {viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="mt-6">
          <TaskKanbanBoard
            tasks={transformTasksForKanban()}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
            loading={loading}
          />
        </div>
      ) : (
        /* List View */
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({filteredTasks.length})</TabsTrigger>
            <TabsTrigger value="urgent" className="text-red-600">Urgent ({urgentTasks.length})</TabsTrigger>
            <TabsTrigger value="high" className="text-orange-600">High ({highTasks.length})</TabsTrigger>
            <TabsTrigger value="medium" className="text-yellow-600">Medium ({mediumTasks.length})</TabsTrigger>
            <TabsTrigger value="low" className="text-blue-600">Low ({lowTasks.length})</TabsTrigger>
            <TabsTrigger value="completed" className="text-green-600">Completed</TabsTrigger>
          </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <ClipboardList className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No tasks found</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="urgent" className="space-y-4">
          {urgentTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          {highTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>

        <TabsContent value="medium" className="space-y-4">
          {mediumTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>

        <TabsContent value="low" className="space-y-4">
          {lowTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>
        </Tabs>
      )}

      {/* Edit Task Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the task details and priority.
            </DialogDescription>
          </DialogHeader>
          
          {editingTask && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  className="mt-1 min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select 
                    value={editingTask.priority} 
                    onValueChange={(value) => setEditingTask({...editingTask, priority: value as CRMTask['priority']})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-task-type">Task Type</Label>
                  <Select 
                    value={editingTask.task_type} 
                    onValueChange={(value) => setEditingTask({...editingTask, task_type: value as CRMTask['task_type']})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-due-date">Due Date</Label>
                  <Input
                    id="edit-due-date"
                    type="date"
                    value={editingTask.due_date || ''}
                    onChange={(e) => setEditingTask({...editingTask, due_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}