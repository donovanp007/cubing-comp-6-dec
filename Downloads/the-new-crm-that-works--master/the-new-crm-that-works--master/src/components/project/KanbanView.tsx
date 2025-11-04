'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { WorkTask, TaskList, User } from '@/types'
import { 
  Plus,
  Clock,
  Calendar,
  MessageSquare,
  MoreHorizontal,
  GripVertical
} from 'lucide-react'

interface KanbanViewProps {
  taskLists: TaskList[]
  tasks: WorkTask[]
  users: User[]
  onAddTask: (listId: string) => void
  onTaskClick: (task: WorkTask) => void
  onTaskStatusChange: (taskId: string, newListId: string) => void
}

export function KanbanView({ 
  taskLists, 
  tasks, 
  users,
  onAddTask, 
  onTaskClick,
  onTaskStatusChange 
}: KanbanViewProps) {
  const getUserById = (id: string) => users.find(user => user.id === id)
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase()
  
  const getPriorityColor = (priority: WorkTask['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  const getStatusColor = (status: WorkTask['status']) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'review': return 'bg-purple-100 text-purple-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'blocked': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  
  const handleDrop = (e: React.DragEvent, listId: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    onTaskStatusChange(taskId, listId)
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {taskLists.map((list) => {
        const listTasks = tasks.filter(task => task.task_list_id === list.id)
        
        return (
          <div 
            key={list.id} 
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, list.id)}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-base">{list.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {listTasks.length}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onAddTask(list.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {list.description && (
                  <p className="text-sm text-gray-500 mt-1">{list.description}</p>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {listTasks.map((task) => {
                    const assignee = task.assigned_to ? getUserById(task.assigned_to) : null
                    
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="bg-white border rounded-lg p-3 hover:shadow-md transition-all cursor-move"
                        onClick={() => onTaskClick(task)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium line-clamp-2">
                            {task.title}
                          </h4>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <GripVertical className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                            {task.status && (
                              <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                          
                          {assignee && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                {getInitials(assignee.name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                          {task.due_date && (
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                          
                          {task.estimated_hours && (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.estimated_hours}h
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {listTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">No tasks</p>
                      <p className="text-xs mt-1">Drop tasks here or click + to add</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
      
      {/* Add New List Button */}
      <div className="flex-shrink-0">
        <Card className="w-80 h-32 border-dashed border-2 hover:border-gray-400 transition-colors cursor-pointer">
          <CardContent className="flex items-center justify-center h-full">
            <Button variant="ghost" className="text-gray-500">
              <Plus className="h-5 w-5 mr-2" />
              Add List
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    )
  }

export default KanbanView
