'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Project, User } from '@/types'
import { useSupabaseProjects } from '@/hooks/useSupabaseProjects'
import { 
  FolderKanban,
  Plus, 
  Search, 
  Calendar,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  Target,
  TrendingUp,
  Grid3x3,
  List,
  LayoutGrid,
  Wand2
} from 'lucide-react'
import Link from 'next/link'
import AITaskCreator from '@/components/ai/AITaskCreator'
import { TaskStructure, ProjectStructure } from '@/lib/openai'


export default function ProjectsPage() {
  const { 
    projects, 
    users, 
    loading, 
    error, 
    createProject, 
    updateProject, 
    deleteProject 
  } = useSupabaseProjects()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid')
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
  const [showAICreator, setShowAICreator] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    start_date: '',
    due_date: '',
    team_members: [] as string[]
  })

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusInfo = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Planning' }
      case 'active':
        return { icon: Play, color: 'text-blue-600 bg-blue-100', label: 'Active' }
      case 'on_hold':
        return { icon: Pause, color: 'text-gray-600 bg-gray-100', label: 'On Hold' }
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Completed' }
      case 'cancelled':
        return { icon: AlertCircle, color: 'text-red-600 bg-red-100', label: 'Cancelled' }
    }
  }

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-blue-500 bg-blue-50'
    }
  }

  const getUserById = (id: string) => users.find(user => user.id === id)
  
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

  const handleCreateProject = async () => {
    if (newProject.name.trim()) {
      const project = {
        ...newProject,
        owner_id: users[0]?.id || 'default-user', // Use first available user or default
        team_members: newProject.team_members.length > 0 ? newProject.team_members : (users[0]?.id ? [users[0].id] : []),
        progress: 0,
        tags: [] as string[]
      }
      
      const success = await createProject(project)
      if (success) {
        setNewProject({
          name: '',
          description: '',
          color: '#3B82F6',
          status: 'planning',
          priority: 'medium',
          start_date: '',
          due_date: '',
          team_members: []
        })
        setShowCreateDialog(false)
        // Reset form
        setNewProject({
          name: '',
          description: '',
          color: '#3B82F6',
          status: 'planning' as Project['status'],
          priority: 'medium' as Project['priority'],
          start_date: '',
          due_date: '',
          team_members: []
        })
        console.log('Project created successfully')
      } else {
        console.error('Failed to create project')
      }
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    const success = await deleteProject(projectId)
    if (success) {
      setShowDeleteDialog(null)
      console.log('Project deleted successfully')
    } else {
      console.error('Failed to delete project')
    }
  }

  const handleAIProjectCreated = async (projectData: ProjectStructure) => {
    const project: Project = {
      id: crypto.randomUUID(),
      name: projectData.name,
      description: projectData.description,
      color: '#8B5CF6', // Purple color for AI projects
      status: 'planning',
      priority: projectData.priority,
      owner_id: 'user-1', // Current user
      team_members: ['user-1'],
      start_date: new Date().toISOString().split('T')[0],
      due_date: projectData.dueDate || '',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: projectData.tags || [],
      aiGenerated: true
    }
    await createProject(project)
    console.log('✅ AI Project Created Successfully:', project.name, 'with', projectData.tasks?.length || 0, 'tasks')
  }

  const handleAITasksCreated = (tasks: TaskStructure[], projectId?: string) => {
    // For now, we'll just log the tasks since we don't have a task management system yet
    console.log('AI generated tasks:', tasks, 'for project:', projectId)
    // In the future, this would integrate with a task management system
  }

  const handleStatusChange = async (projectId: string, newStatus: Project['status']) => {
    const success = await updateProject(projectId, { status: newStatus })
    if (success) {
      console.log(`Project ${projectId} status updated to ${newStatus}`)
    } else {
      console.error(`Failed to update project ${projectId}`)
    }
  }

  // Stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    overdue: projects.filter(p => {
      if (!p.due_date) return false
      return new Date(p.due_date) < new Date() && p.status !== 'completed'
    }).length
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 pt-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-4">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
            <FolderKanban className="h-8 w-8 mr-3" />
            Projects
          </h2>
          <p className="text-gray-600 mt-1">Manage projects, assign tasks, and track progress</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setShowAICreator(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            AI Create
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Start a new project to organize tasks and collaborate with your team.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  placeholder="Enter project name..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Project description..."
                  className="mt-1 min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newProject.priority} 
                    onValueChange={(value) => setNewProject({...newProject, priority: value as Project['priority']})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                          Urgent
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Initial Status</Label>
                  <Select 
                    value={newProject.status} 
                    onValueChange={(value) => setNewProject({...newProject, status: value as Project['status']})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                          Planning
                        </div>
                      </SelectItem>
                      <SelectItem value="active">
                        <div className="flex items-center">
                          <Play className="w-4 h-4 mr-2 text-blue-600" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="on_hold">
                        <div className="flex items-center">
                          <Pause className="w-4 h-4 mr-2 text-gray-600" />
                          On Hold
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newProject.start_date}
                    onChange={(e) => setNewProject({...newProject, start_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={newProject.due_date}
                    onChange={(e) => setNewProject({...newProject, due_date: e.target.value})}
                    className="mt-1"
                    min={newProject.start_date || undefined}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="color">Project Color</Label>
                <div className="flex gap-2 mt-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewProject({...newProject, color})}
                      className={`w-8 h-8 rounded-full border-2 ${newProject.color === color ? 'border-gray-400' : 'border-gray-200'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="team">Team Members</Label>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newProject.team_members.map((memberId) => {
                      const user = getUserById(memberId)
                      return user ? (
                        <Badge key={memberId} variant="secondary">
                          {user.name}
                          <button
                            onClick={() => setNewProject({
                              ...newProject,
                              team_members: newProject.team_members.filter(id => id !== memberId)
                            })}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !newProject.team_members.includes(value)) {
                        setNewProject({
                          ...newProject,
                          team_members: [...newProject.team_members, value]
                        })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team members..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(user => !newProject.team_members.includes(user.id)).map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-xs font-medium text-blue-700">
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.role} - {user.department}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject} disabled={!newProject.name.trim()}>
                  Create Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All projects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Mode Toggle */}
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-x-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                  className="rounded-l-none"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Display */}
      <div className={`${
        viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' :
        viewMode === 'list' ? 'space-y-4' :
        'grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      }`}>
        {filteredProjects.map((project) => {
          const owner = getUserById(project.owner_id)
          const statusInfo = getStatusInfo(project.status)
          const StatusIcon = statusInfo.icon
          const daysUntilDue = getDaysUntilDue(project.due_date)
          const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && project.status !== 'completed'
          const aiGlowClass = project.aiGenerated 
            ? 'shadow-lg shadow-purple-500/30 border-purple-200 bg-gradient-to-br from-purple-50/50 to-white' 
            : ''
          
          if (viewMode === 'list') {
            return (
              <Card key={project.id} className={`transition-all duration-200 hover:shadow-lg cursor-pointer border-l-4 ${getPriorityColor(project.priority)} ${isOverdue ? 'ring-2 ring-red-200' : ''} ${aiGlowClass}`}>
                <Link href={`/projects/${project.id}`} className="block">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
                            {project.aiGenerated && (
                              <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                                <Wand2 className="h-3 w-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{project.description}</p>
                        </div>
                        <Badge className={`${statusInfo.color} border-0`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        <div className="w-32">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Progress</span>
                            <span className="text-xs text-gray-500">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-1" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-1">
                            {project.team_members.slice(0, 2).map((memberId) => {
                              const member = getUserById(memberId)
                              return (
                                <Avatar key={memberId} className="h-6 w-6 border-2 border-white">
                                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                    {member ? getInitials(member.name) : '?'}
                                  </AvatarFallback>
                                </Avatar>
                              )
                            })}
                            {project.team_members.length > 2 && (
                              <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                <span className="text-xs text-gray-600">+{project.team_members.length - 2}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {project.due_date && (
                          <div className={`flex items-center text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {isOverdue ? `Overdue` : daysUntilDue === 0 ? 'Today' : daysUntilDue === 1 ? 'Tomorrow' : `${daysUntilDue}d`}
                          </div>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.preventDefault()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.preventDefault(); window.location.href = `/projects/${project.id}` }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Project
                            </DropdownMenuItem>
                            
                            {/* Status Change Options */}
                            {project.status !== 'active' && (
                              <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleStatusChange(project.id, 'active') }}>
                                <Play className="h-4 w-4 mr-2" />
                                Mark as Active
                              </DropdownMenuItem>
                            )}
                            {project.status !== 'on_hold' && (
                              <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleStatusChange(project.id, 'on_hold') }}>
                                <Pause className="h-4 w-4 mr-2" />
                                Put on Hold
                              </DropdownMenuItem>
                            )}
                            {project.status !== 'completed' && (
                              <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleStatusChange(project.id, 'completed') }}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Completed
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem>
                              <Star className="h-4 w-4 mr-2" />
                              Add to Favorites
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={(e) => { e.preventDefault(); setShowDeleteDialog(project.id) }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          }
          
          if (viewMode === 'compact') {
            return (
              <Card key={project.id} className={`transition-all duration-200 hover:shadow-lg cursor-pointer border-l-4 ${getPriorityColor(project.priority)} ${isOverdue ? 'ring-2 ring-red-200' : ''} ${aiGlowClass}`}>
                <Link href={`/projects/${project.id}`} className="block">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <div className="flex items-center">
                            <h3 className="font-medium text-sm truncate">{project.name}</h3>
                            {project.aiGenerated && (
                              <Badge className="ml-1 bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                <Wand2 className="h-2 w-2 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.preventDefault()}>
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.preventDefault(); window.location.href = `/projects/${project.id}` }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            
                            {/* Status Change Options */}
                            {project.status !== 'active' && (
                              <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleStatusChange(project.id, 'active') }}>
                                <Play className="h-4 w-4 mr-2" />
                                Active
                              </DropdownMenuItem>
                            )}
                            {project.status !== 'completed' && (
                              <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleStatusChange(project.id, 'completed') }}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={(e) => { e.preventDefault(); setShowDeleteDialog(project.id) }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <Badge className={`${statusInfo.color} border-0 text-xs`}>
                        <StatusIcon className="h-2 w-2 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-1" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex -space-x-1">
                          {project.team_members.slice(0, 2).map((memberId) => {
                            const member = getUserById(memberId)
                            return (
                              <Avatar key={memberId} className="h-5 w-5 border border-white">
                                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                  {member ? getInitials(member.name) : '?'}
                                </AvatarFallback>
                              </Avatar>
                            )
                          })}
                          {project.team_members.length > 2 && (
                            <div className="h-5 w-5 rounded-full bg-gray-200 border border-white flex items-center justify-center">
                              <span className="text-xs text-gray-600">+{project.team_members.length - 2}</span>
                            </div>
                          )}
                        </div>
                        
                        {project.due_date && (
                          <div className={`flex items-center text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                            <Calendar className="h-2 w-2 mr-1" />
                            {isOverdue ? 'Overdue' : daysUntilDue === 0 ? 'Today' : `${daysUntilDue}d`}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          }
          
          // Default grid view with entire card clickable
          return (
            <Card key={project.id} className={`transition-all duration-200 hover:shadow-lg cursor-pointer border-l-4 ${getPriorityColor(project.priority)} ${isOverdue ? 'ring-2 ring-red-200' : ''} ${aiGlowClass}`}>
              <Link href={`/projects/${project.id}`} className="block">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: project.color }}
                        />
                        <CardTitle className="text-lg truncate flex items-center">
                          {project.name}
                          {project.aiGenerated && (
                            <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                              <Wand2 className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </CardTitle>
                      </div>
                      <CardDescription className="line-clamp-2 text-sm">
                        {project.description}
                      </CardDescription>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-2" onClick={(e) => e.preventDefault()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.preventDefault(); window.location.href = `/projects/${project.id}` }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Project
                        </DropdownMenuItem>
                        
                        {/* Status Change Options */}
                        {project.status !== 'active' && (
                          <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleStatusChange(project.id, 'active') }}>
                            <Play className="h-4 w-4 mr-2" />
                            Mark as Active
                          </DropdownMenuItem>
                        )}
                        {project.status !== 'on_hold' && (
                          <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleStatusChange(project.id, 'on_hold') }}>
                            <Pause className="h-4 w-4 mr-2" />
                            Put on Hold
                          </DropdownMenuItem>
                        )}
                        {project.status !== 'completed' && (
                          <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleStatusChange(project.id, 'completed') }}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Completed
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem>
                          <Star className="h-4 w-4 mr-2" />
                          Add to Favorites
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => { e.preventDefault(); setShowDeleteDialog(project.id) }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={`${statusInfo.color} border-0`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Target className="h-3 w-3 mr-1" />
                      {project.priority}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-500">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  {/* Team Members */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="flex -space-x-1">
                        {project.team_members.slice(0, 3).map((memberId) => {
                          const member = getUserById(memberId)
                          return (
                            <Avatar key={memberId} className="h-6 w-6 border-2 border-white">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                {member ? getInitials(member.name) : '?'}
                              </AvatarFallback>
                            </Avatar>
                          )
                        })}
                        {project.team_members.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{project.team_members.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {project.due_date && (
                      <div className={`flex items-center text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        <Calendar className="h-3 w-3 mr-1" />
                        {isOverdue ? (
                          <span>Overdue by {Math.abs(daysUntilDue!)} days</span>
                        ) : daysUntilDue === 0 ? (
                          <span>Due today</span>
                        ) : daysUntilDue === 1 ? (
                          <span>Due tomorrow</span>
                        ) : (
                          <span>Due in {daysUntilDue} days</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>
          )
        })}
      </div>
      
      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <FolderKanban className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No projects found</p>
              <p className="text-xs text-gray-400 mt-1">Create your first project to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Rapid Task Addition Floating Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 h-14 w-14"
          onClick={() => {
            // Open task creation for active projects
            const activeProjects = projects.filter(p => p.status === 'active')
            if (activeProjects.length > 0) {
              // For now, just scroll to create project dialog
              setShowCreateDialog(true)
            }
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteDialog && handleDeleteProject(showDeleteDialog)}
            >
              Delete Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Task Creator Modal */}
      <AITaskCreator
        open={showAICreator}
        onOpenChange={setShowAICreator}
        onTasksCreated={handleAITasksCreated}
        onProjectCreated={handleAIProjectCreated}
        existingProjects={projects.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || ''
        }))}
      />
    </div>
  )
}