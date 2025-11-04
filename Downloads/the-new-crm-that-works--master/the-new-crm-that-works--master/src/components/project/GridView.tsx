'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { WorkTask, User } from '@/types'
import { 
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  MoreVertical
} from 'lucide-react'

interface GridViewProps {
  tasks: WorkTask[]
  users: User[]
  onTaskClick: (task: WorkTask) => void
  onTaskStatusChange: (taskId: string, status: WorkTask['status']) => void
}

export function GridView({ 
  tasks, 
  users,
  onTaskClick,
  onTaskStatusChange 
}: GridViewProps) {
  const getUserById = (id: string) => users.find(user => user.id === id)
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase()
  
  const getPriorityColor = (priority: WorkTask['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-green-500 bg-green-50'
      default: return 'border-gray-300 bg-white'
    }
  }
  
  const getStatusIcon = (status: WorkTask['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress': return <Play className="h-4 w-4 text-blue-600" />
      case 'review': return <AlertCircle className="h-4 w-4 text-purple-600" />
      case 'blocked': return <Pause className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }
  
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tasks.map((task) => {
        const assignee = task.assigned_to ? getUserById(task.assigned_to) : null
        const daysUntilDue = task.due_date ? getDaysUntilDue(task.due_date) : null
        const isOverdue = daysUntilDue !== null && daysUntilDue < 0
        
        return (
          <Card 
            key={task.id}
            className={`hover:shadow-lg transition-all cursor-pointer border-2 ${getPriorityColor(task.priority)}`}
            onClick={() => onTaskClick(task)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(task.status)}
                  <Badge 
                    variant={task.status === 'completed' ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
              
              <h3 className="font-medium text-sm mt-2 line-clamp-2">
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Progress Bar */}
              {task.progress > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-1.5" />
                </div>
              )}
              
              {/* Due Date */}
              {task.due_date && (
                <div className={`flex items-center text-xs mb-2 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {isOverdue ? 'Overdue by' : 'Due in'} {Math.abs(daysUntilDue!)} days
                  </span>
                </div>
              )}
              
              {/* Estimated Hours */}
              {task.estimated_hours && (
                <div className="flex items-center text-xs text-gray-600 mb-2">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{task.estimated_hours} hours estimated</span>
                </div>
              )}
              
              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {task.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{task.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Assignee */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                {assignee ? (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                        {getInitials(assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600">{assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Unassigned</span>
                )}
                
                <Badge className="text-xs" variant="outline">
                  {task.priority}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
    )
  }

export default GridView
