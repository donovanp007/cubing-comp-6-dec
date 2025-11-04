'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { CRMTask, TaskTemplate } from '@/types'
import { useSupabaseCRMTasks } from '@/hooks/useSupabaseCRMTasks'
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar,
  User,
  Edit,
  Trash2,
  Phone,
  CreditCard,
  Award,
  Package,
  FileText
} from 'lucide-react'

interface CRMTaskManagerProps {
  studentId: string
  studentName: string
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

const quickTaskTemplates: TaskTemplate[] = [
  {
    id: 'payment-reminder',
    title: 'Payment Follow-up',
    description: 'Follow up with parent regarding outstanding payment',
    priority: 'high',
    task_type: 'payment'
  },
  {
    id: 'certificate-prep',
    title: 'Certificate Preparation',
    description: 'Prepare certificate for student completion',
    priority: 'medium',
    task_type: 'certificate'
  },
  {
    id: 'equipment-check',
    title: 'Equipment Distribution',
    description: 'Ensure student has received all required equipment',
    priority: 'medium',
    task_type: 'equipment'
  },
  {
    id: 'progress-check',
    title: 'Progress Check-in',
    description: 'Check on student progress and provide feedback',
    priority: 'low',
    task_type: 'follow_up'
  }
]

export default function CRMTaskManager({
  studentId,
  studentName
}: CRMTaskManagerProps) {
  const { 
    tasks: allTasks, 
    loading, 
    error, 
    createTask, 
    updateTask, 
    deleteTask, 
    getTasksForStudent 
  } = useSupabaseCRMTasks()
  
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as CRMTask['priority'],
    task_type: 'general' as CRMTask['task_type'],
    due_date: ''
  })

  // Get tasks for this specific student
  const localTasks = getTasksForStudent(studentId)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString()
    }
  }

  const getTaskBorderColor = (priority: CRMTask['priority'], status: CRMTask['status']) => {
    if (status === 'completed') return 'border-green-200 bg-green-50'
    
    switch (priority) {
      case 'urgent': return 'border-red-200 bg-red-50'
      case 'high': return 'border-orange-200 bg-orange-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

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

  const handleCreateTask = async () => {
    if (newTask.title.trim()) {
      const taskData = {
        ...newTask,
        student_id: studentId,
        status: 'pending' as const
      }
      
      const success = await createTask(taskData)
      if (success) {
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          task_type: 'general',
          due_date: ''
        })
        setIsAddingTask(false)
        console.log('Task created successfully')
      } else {
        console.error('Failed to create task')
      }
    }
  }

  const createFromTemplate = (template: TaskTemplate) => {
    setNewTask({
      title: template.title,
      description: template.description,
      priority: template.priority,
      task_type: template.task_type,
      due_date: ''
    })
    setIsAddingTask(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    const success = await deleteTask(taskId)
    if (success) {
      console.log(`Task ${taskId} deleted`)
    } else {
      console.error(`Failed to delete task ${taskId}`)
    }
  }

  const pendingTasks = localTasks.filter(task => task.status !== 'completed')
  const completedTasks = localTasks.filter(task => task.status === 'completed')

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading CRM tasks...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}
      {/* Quick Action Templates */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickTaskTemplates.map((template) => {
          const Icon = taskTypeIcons[template.task_type]
          return (
            <Button
              key={template.id}
              variant="outline"
              className={`h-auto py-3 px-4 text-left justify-start ${taskTypeColors[template.task_type]}`}
              onClick={() => createFromTemplate(template)}
            >
              <div className="flex items-center">
                <Icon className="h-4 w-4 mr-2" />
                <div className="text-xs font-medium truncate">{template.title}</div>
              </div>
            </Button>
          )
        })}
      </div>

      {/* Active Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Active Tasks</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {pendingTasks.length} pending
          </Badge>
        </div>
        
        <div className="space-y-3">
          {pendingTasks.map((task) => {
            const Icon = taskTypeIcons[task.task_type]
            const isOverdue = task.due_date && new Date(task.due_date) < new Date()
            
            return (
              <Card key={task.id} className={`p-4 ${getTaskBorderColor(task.priority, task.status)} border-l-4`}>
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center mb-2">
                      <Icon className="h-4 w-4 mr-2 text-gray-600" />
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <PriorityBadge priority={task.priority} showIcon size="sm" className="ml-2" />
                      {isOverdue && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500">
                      {task.due_date && (
                        <div className="flex items-center mr-4">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due: {formatDate(task.due_date)}
                        </div>
                      )}
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {task.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
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
                    
                    <Button variant="ghost" size="sm" onClick={() => setEditingTask(task.id)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
          
          {pendingTasks.length === 0 && (
            <Card className="p-8 text-center bg-gray-50">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No pending tasks for this student</p>
              <p className="text-xs text-gray-500 mt-1">All caught up! 🎉</p>
            </Card>
          )}
        </div>
      </div>

      {/* Add New Task */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Task
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task for {studentName}</DialogTitle>
            <DialogDescription>Create a new task to track for this student</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Enter task title..."
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Add task details..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value as CRMTask['priority']})}>
                  <SelectTrigger>
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
                <Label htmlFor="task_type">Task Type</Label>
                <Select value={newTask.task_type} onValueChange={(value) => setNewTask({...newTask, task_type: value as CRMTask['task_type']})}>
                  <SelectTrigger>
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
            </div>
            
            <div>
              <Label htmlFor="due_date">Due Date (Optional)</Label>
              <Input
                id="due_date"
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddingTask(false)}>Cancel</Button>
              <Button onClick={handleCreateTask} disabled={!newTask.title.trim()}>Create Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Completed Tasks</h3>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {completedTasks.length} completed
            </Badge>
          </div>
          
          <div className="space-y-2">
            {completedTasks.map((task) => {
              const Icon = taskTypeIcons[task.task_type]
              
              return (
                <Card key={task.id} className="p-3 bg-green-50 border-green-200 opacity-75">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    <Icon className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 line-through flex-grow">{task.title}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      Completed {task.completed_at ? formatDate(task.completed_at) : 'recently'}
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}