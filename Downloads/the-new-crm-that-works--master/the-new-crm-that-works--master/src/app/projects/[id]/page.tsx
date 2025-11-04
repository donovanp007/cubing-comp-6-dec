'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Project, User, TaskList, WorkTask, TaskComment } from '@/types'
import KanbanView from '@/components/project/KanbanView'
import GridView from '@/components/project/GridView'
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Users,
  MessageSquare,
  Paperclip,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  User as UserIcon,
  Tag,
  ChevronDown,
  ChevronRight,
  ListTodo,
  Target,
  Send,
  LayoutGrid,
  List,
  Columns3
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useSupabaseProjects } from '@/hooks/useSupabaseProjects'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  
  // Get real data from Supabase
  const { 
    projects, 
    tasks, 
    taskLists, 
    users, 
    loading, 
    error,
    createTask,
    updateTask,
    deleteTask,
    createTaskList,
    updateTaskList,
    deleteTaskList 
  } = useSupabaseProjects()
  
  // ALL STATE HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [currentTasks, setCurrentTasks] = useState<WorkTask[]>([])
  const [currentTaskLists, setCurrentTaskLists] = useState<TaskList[]>([])
  
  // Additional local state for UI (moved from later in component)
  const [selectedTask, setSelectedTask] = useState<WorkTask | null>(null)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'grid'>('list')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskListId, setNewTaskListId] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListDescription, setNewListDescription] = useState('')
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showAddListDialog, setShowAddListDialog] = useState(false)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [newTaskList, setNewTaskList] = useState({ name: '', description: '' })
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assigned_to: '',
    due_date: '',
    estimated_hours: '',
    task_list_id: ''
  })
  // Additional state for comments (moved from later in component)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<TaskComment[]>([])
  
  // Load project data when available
  useEffect(() => {
    if (projects.length > 0) {
      const project = projects.find(p => p.id === projectId)
      setCurrentProject(project || null)
    }
  }, [projects, projectId])
  
  // Load tasks for this project
  useEffect(() => {
    if (tasks.length > 0) {
      const projectTasks = tasks.filter(t => t.project_id === projectId)
      setCurrentTasks(projectTasks)
    }
  }, [tasks, projectId])
  
  // Load task lists for this project  
  useEffect(() => {
    if (taskLists.length > 0) {
      const projectTaskLists = taskLists.filter(tl => tl.project_id === projectId)
        .sort((a, b) => (a.position || 0) - (b.position || 0))
      setCurrentTaskLists(projectTaskLists)
    }
  }, [taskLists, projectId])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading project: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  // Show not found state
  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    )
  }

  
  // Helper functions for real data only
  const getUserById = (id: string) => users.find(user => user.id === id)
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase()

  const getStatusColor = (status: WorkTask['status']) => {
    switch (status) {
      case 'todo': return 'text-gray-600 bg-gray-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'review': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'blocked': return 'text-red-600 bg-red-100'
    }
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: WorkTask['status']) => {
    const updates = {
      status: newStatus,
      progress: newStatus === 'completed' ? 100 : undefined,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
    }
    
    const success = await updateTask(taskId, updates)
    if (!success) {
      alert('Failed to update task status. Please try again.')
    }
  }

  // Move a task to a different task list (used by Kanban view)
  const handleMoveTaskToList = (taskId: string, newListId: string) => {
    updateTask(taskId, { task_list_id: newListId }).then((success) => {
      if (!success) {
        alert('Failed to move task to the selected list. Please try again.')
      }
    })
  }

  const handleAddTask = async (listId: string) => {
    if (newTask.title.trim() && currentProject) {
      const taskData = {
        project_id: currentProject.id,
        task_list_id: listId,
        title: newTask.title,
        description: newTask.description,
        status: 'todo' as WorkTask['status'],
        priority: newTask.priority,
        assigned_to: newTask.assigned_to || undefined,
        created_by: users[0]?.id || 'user-1', // Use first user or fallback
        due_date: newTask.due_date || undefined,
        estimated_hours: newTask.estimated_hours ? parseInt(newTask.estimated_hours) : undefined,
        progress: 0,
        position: currentTasks.filter(t => t.task_list_id === listId).length + 1,
        tags: []
      }
      
      const success = await createTask(taskData)
      if (success) {
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          assigned_to: '',
          due_date: '',
          estimated_hours: '',
          task_list_id: ''
        })
        setShowTaskDialog(false)
      } else {
        alert('Failed to create task. Please try again.')
      }
    }
  }

  const handleAddTaskList = async () => {
    if (newTaskList.name.trim() && currentProject) {
      const taskListData = {
        project_id: currentProject.id,
        name: newTaskList.name,
        description: newTaskList.description,
        position: currentTaskLists.length + 1
      }
      
      const success = await createTaskList(taskListData)
      if (success) {
        setNewTaskList({ name: '', description: '' })
        setShowAddListDialog(false)
      } else {
        alert('Failed to create task list. Please try again.')
      }
    }
  }

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const handleAddComment = (taskId: string) => {
    if (newComment.trim()) {
      const comment: TaskComment = {
        id: crypto.randomUUID(),
        task_id: taskId,
        user_id: 'user-1',
        content: newComment,
        type: 'comment',
        created_at: new Date().toISOString()
      }
      setComments(prev => [...prev, comment])
      setNewComment('')
    }
  }

  const tasksByList = currentTaskLists.map(list => ({
    ...list,
    tasks: currentTasks.filter(task => task.task_list_id === list.id)
  }))

  const projectStats = {
    totalTasks: currentTasks.length,
    completedTasks: currentTasks.filter(t => t.status === 'completed').length,
    inProgressTasks: currentTasks.filter(t => t.status === 'in_progress').length,
    overdueTask: currentTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length
  }


  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-4">
      {/* Status indicator */}
      {error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-800 text-sm font-medium">
              Database temporarily unavailable - using local storage
            </span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          
          <div>
            <div className="flex items-center mb-2">
              <div
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: currentProject.color }}
              />
              <h1 className="text-3xl font-bold text-gray-900">{currentProject.name}</h1>
              <Badge className={`ml-3 ${getStatusColor('in_progress')}`}>
                <Play className="h-3 w-3 mr-1" />
                {currentProject.status}
              </Badge>
            </div>
            <p className="text-gray-600 max-w-2xl">{currentProject.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
          <Button variant="outline">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold">{currentProject.progress}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={currentProject.progress} className="mt-3" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-2xl font-bold">
                  {projectStats.completedTasks}/{projectStats.totalTasks}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {projectStats.inProgressTasks} in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team</p>
                <p className="text-2xl font-bold">{currentProject.team_members.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex -space-x-1 mt-2">
              {currentProject.team_members.slice(0, 3).map((memberId) => {
                const member = getUserById(memberId)
                return (
                  <Avatar key={memberId} className="h-6 w-6 border-2 border-white">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                      {member ? getInitials(member.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                )
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Date</p>
                <p className="text-lg font-bold">
                  {currentProject.due_date ? new Date(currentProject.due_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
            {projectStats.overdueTask > 0 && (
              <p className="text-xs text-red-600 mt-1">
                {projectStats.overdueTask} tasks overdue
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task Lists */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Task Lists</h2>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  title="List view"
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                  title="Kanban view"
                  className="h-8 w-8 p-0"
                >
                  <Columns3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Dialog open={showAddListDialog} onOpenChange={setShowAddListDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add List
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task List</DialogTitle>
                  <DialogDescription>
                    Create a new section to organize related tasks.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="list-name">List Name</Label>
                    <Input
                      id="list-name"
                      value={newTaskList.name}
                      onChange={(e) => setNewTaskList({...newTaskList, name: e.target.value})}
                      placeholder="e.g., Research & Planning"
                    />
                  </div>
                  <div>
                    <Label htmlFor="list-description">Description (Optional)</Label>
                    <Textarea
                      id="list-description"
                      value={newTaskList.description}
                      onChange={(e) => setNewTaskList({...newTaskList, description: e.target.value})}
                      placeholder="Brief description of this task list"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddListDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTaskList} disabled={!newTaskList.name.trim()}>
                      Create List
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Conditional View Rendering */}
          {viewMode === 'list' && (
            <div className="space-y-6">
              {tasksByList.map((list) => (
                <Card key={list.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{list.name}</CardTitle>
                        {list.description && (
                          <CardDescription className="mt-1">{list.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {list.tasks.length} tasks
                        </Badge>
                        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Task</DialogTitle>
                              <DialogDescription>
                                Create a new task in "{list.name}"
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="task-title">Task Title</Label>
                                <Input
                                  id="task-title"
                                  value={newTask.title}
                                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                  placeholder="What needs to be done?"
                                />
                              </div>

                              <div>
                                <Label htmlFor="task-description">Description</Label>
                                <Textarea
                                  id="task-description"
                                  value={newTask.description}
                                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                  placeholder="Add details about this task"
                                  rows={3}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="task-priority">Priority</Label>
                                  <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value as WorkTask['priority']})}>
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
                                  <Label htmlFor="task-assignee">Assign To</Label>
                                  <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask({...newTask, assigned_to: value})}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                          {user.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="task-due">Due Date</Label>
                                  <Input
                                    id="task-due"
                                    type="date"
                                    value={newTask.due_date}
                                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="task-hours">Estimated Hours</Label>
                                  <Input
                                    id="task-hours"
                                    type="number"
                                    value={newTask.estimated_hours}
                                    onChange={(e) => setNewTask({...newTask, estimated_hours: e.target.value})}
                                    placeholder="0"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={() => handleAddTask(list.id)} disabled={!newTask.title.trim()}>
                                  Create Task
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {list.tasks.map((task) => {
                        const assignee = task.assigned_to ? getUserById(task.assigned_to) : null
                        const isExpanded = expandedTasks.has(task.id)
                        const taskComments = comments.filter(c => c.task_id === task.id)

                        return (
                          <div key={task.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={task.status === 'completed'}
                                onCheckedChange={(checked) =>
                                  handleTaskStatusChange(task.id, checked ? 'completed' : 'todo')
                                }
                                className="mt-1"
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                      {task.title}
                                    </h4>
                                    <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                                      {task.status.replace('_', ' ')}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    {assignee && (
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                          {getInitials(assignee.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleTaskExpansion(task.id)}
                                    >
                                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                </div>

                                {task.description && !isExpanded && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
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

                                  {taskComments.length > 0 && (
                                    <span className="flex items-center">
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      {taskComments.length}
                                    </span>
                                  )}
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                  <div className="mt-4 space-y-4 border-t pt-4">
                                    {task.description && (
                                      <div>
                                        <h5 className="text-sm font-medium mb-2">Description</h5>
                                        <p className="text-sm text-gray-700">{task.description}</p>
                                      </div>
                                    )}

                                    {task.progress > 0 && (
                                      <div>
                                        <h5 className="text-sm font-medium mb-2">Progress</h5>
                                        <Progress value={task.progress} className="h-2" />
                                        <p className="text-xs text-gray-500 mt-1">{task.progress}% complete</p>
                                      </div>
                                    )}

                                    {/* Comments */}
                                    <div>
                                      <h5 className="text-sm font-medium mb-2">Comments</h5>
                                      <div className="space-y-2">
                                        {taskComments.map((comment) => {
                                          const commenter = getUserById(comment.user_id)
                                          return (
                                            <div key={comment.id} className="flex space-x-2">
                                              <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-xs bg-gray-100">
                                                  {commenter ? getInitials(commenter.name) : '?'}
                                                </AvatarFallback>
                                              </Avatar>
                                              <div className="flex-1">
                                                <div className="bg-gray-100 rounded-lg p-2">
                                                  <p className="text-sm">{comment.content}</p>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                  {commenter?.name} • {new Date(comment.created_at).toLocaleDateString()}
                                                </p>
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>

                                      {/* Add Comment */}
                                      <div className="flex space-x-2 mt-3">
                                        <Input
                                          placeholder="Add a comment..."
                                          value={newComment}
                                          onChange={(e) => setNewComment(e.target.value)}
                                          className="flex-1"
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                              handleAddComment(task.id)
                                            }
                                          }}
                                        />
                                        <Button
                                          size="sm"
                                          onClick={() => handleAddComment(task.id)}
                                          disabled={!newComment.trim()}
                                        >
                                          <Send className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {list.tasks.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <ListTodo className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No tasks yet</p>
                          <p className="text-xs">Click the + button to add your first task</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Kanban View */}
          {viewMode === 'kanban' && (
            <KanbanView
              taskLists={currentTaskLists}
              tasks={currentTasks}
              users={users}
              onTaskClick={setSelectedTask}
              onAddTask={handleAddTask}
              onTaskStatusChange={handleMoveTaskToList}
            />
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <GridView
              tasks={currentTasks}
              users={users}
              onTaskClick={setSelectedTask}
              onTaskStatusChange={handleTaskStatusChange}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Members</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {currentProject.team_members.map((memberId) => {
                  const member = getUserById(memberId)
                  if (!member) return null
                  
                  return (
                    <div key={member.id} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                      {member.id === currentProject.owner_id && (
                        <Badge variant="outline" className="text-xs">
                          Owner
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Project Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {currentProject.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
