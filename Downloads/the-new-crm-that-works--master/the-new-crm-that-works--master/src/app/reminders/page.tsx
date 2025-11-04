'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PriorityBadge, Priority } from "@/components/ui/priority-badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupabaseReminders, ReminderWithStudent } from '@/hooks/useSupabaseReminders'
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents'
import {
  Bell,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  School,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react'

export default function RemindersPage() {
  const { 
    reminders, 
    loading, 
    error, 
    updateReminder, 
    deleteReminder, 
    markAsCompleted,
    createReminder
  } = useSupabaseReminders()
  
  const { students, loading: studentsLoading } = useSupabaseStudents()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [editingReminder, setEditingReminder] = useState<ReminderWithStudent | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    due_date: '',
    student_id: ''
  })

  // Filter reminders based on search and filters
  const filteredReminders = reminders.filter(reminder => {
    const studentName = `${reminder.students?.first_name || ''} ${reminder.students?.last_name || ''}`.trim()
    const schoolName = reminder.students?.schools?.name || ''
    
    const matchesSearch = reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reminder.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         schoolName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPriority = selectedPriority === 'all' || reminder.priority === selectedPriority
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'completed' && reminder.completed) ||
                         (selectedStatus === 'pending' && !reminder.completed)
    
    return matchesSearch && matchesPriority && matchesStatus
  })

  const urgentReminders = reminders.filter(r => r.priority === 'urgent' && !r.completed)
  const mediumReminders = reminders.filter(r => r.priority === 'medium' && !r.completed)  
  const lowReminders = reminders.filter(r => r.priority === 'low' && !r.completed)
  const completedToday = reminders.filter(r => {
    const today = new Date().toISOString().split('T')[0]
    return r.completed && r.due_date === today
  })

  const handleMarkComplete = async (reminderId: string) => {
    const success = await markAsCompleted(reminderId)
    if (!success) {
      alert('Failed to mark reminder as completed. Please try again.')
    }
  }

  const handleDeleteReminder = async (reminderId: string) => {
    if (confirm('Are you sure you want to delete this reminder? This action cannot be undone.')) {
      const success = await deleteReminder(reminderId)
      if (!success) {
        alert('Failed to delete reminder. Please try again.')
      }
    }
  }

  const handleEditReminder = (reminder: ReminderWithStudent) => {
    setEditingReminder({...reminder})
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (editingReminder) {
      const success = await updateReminder(editingReminder.id, {
        title: editingReminder.title,
        description: editingReminder.description,
        priority: editingReminder.priority,
        due_date: editingReminder.due_date
      })
      
      if (success) {
        setIsEditModalOpen(false)
        setEditingReminder(null)
      } else {
        alert('Failed to update reminder. Please try again.')
      }
    }
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditingReminder(null)
  }

  const handleCreateReminder = async () => {
    if (!newReminder.title.trim() || !newReminder.student_id) {
      alert('Please fill in all required fields.')
      return
    }

    const success = await createReminder({
      title: newReminder.title,
      description: newReminder.description,
      priority: newReminder.priority,
      due_date: newReminder.due_date,
      student_id: newReminder.student_id,
      completed: false
    })

    if (success) {
      setIsCreateModalOpen(false)
      setNewReminder({
        title: '',
        description: '',
        priority: 'medium' as Priority,
        due_date: '',
        student_id: ''
      })
    } else {
      alert('Failed to create reminder. Please try again.')
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const ReminderCard = ({ reminder }: { reminder: ReminderWithStudent }) => {
    const studentName = `${reminder.students?.first_name || ''} ${reminder.students?.last_name || ''}`.trim()
    const schoolName = reminder.students?.schools?.name || 'Unknown School'
    const daysUntil = getDaysUntilDue(reminder.due_date)
    const isOverdue = daysUntil < 0
    const isDueToday = daysUntil === 0
    
    return (
      <Card className={`transition-all duration-200 hover:shadow-lg ${
        reminder.completed 
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
                  {getInitials(studentName || 'Unknown')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-grow space-y-2">
                <div className="flex items-center space-x-2">
                  <h3 className={`font-semibold text-lg ${reminder.completed ? 'line-through text-gray-500' : ''}`}>
                    {reminder.title}
                  </h3>
                  <PriorityBadge priority={reminder.priority} size="sm" />
                </div>
                
                <p className={`text-sm ${reminder.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {reminder.description}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{studentName || 'Unknown Student'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <School className="h-4 w-4" />
                    <span>{schoolName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Due: {new Date(reminder.due_date).toLocaleDateString()}
                      {isOverdue && <span className="text-red-600 font-medium ml-1">(Overdue)</span>}
                      {isDueToday && <span className="text-orange-600 font-medium ml-1">(Due Today)</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              {!reminder.completed ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleMarkComplete(reminder.id)}
                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditReminder(reminder)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </>
              ) : (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDeleteReminder(reminder.id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Reminders</h1>
            <p className="text-gray-600 mt-1">Loading reminders...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reminders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Reminders</h1>
          <p className="text-gray-600 mt-1">Managing {filteredReminders.length} reminder{filteredReminders.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>
      <div className="space-y-6">
        {/* Status indicator for database connection */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-800 text-sm font-medium">
                Database Error: {error}
              </span>
            </div>
          </div>
        )}
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Reminders</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentReminders.length}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Priority</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{mediumReminders.length}</div>
            <p className="text-xs text-muted-foreground">Follow-up tasks</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Priority</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{lowReminders.length}</div>
            <p className="text-xs text-muted-foreground">General notes</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completedToday.length}</div>
            <p className="text-xs text-muted-foreground">Tasks finished</p>
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
                placeholder="Search reminders, students, or schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={selectedPriority === 'urgent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority(selectedPriority === 'urgent' ? 'all' : 'urgent')}
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              >
                Urgent
              </Button>
              <Button
                variant={selectedPriority === 'medium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority(selectedPriority === 'medium' ? 'all' : 'medium')}
                className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
              >
                Medium
              </Button>
              <Button
                variant={selectedPriority === 'low' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority(selectedPriority === 'low' ? 'all' : 'low')}
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              >
                Low
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

      {/* Reminders by Priority Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({filteredReminders.length})</TabsTrigger>
          <TabsTrigger value="urgent" className="text-red-600">Urgent ({urgentReminders.length})</TabsTrigger>
          <TabsTrigger value="medium" className="text-orange-600">Medium ({mediumReminders.length})</TabsTrigger>
          <TabsTrigger value="low" className="text-green-600">Low ({lowReminders.length})</TabsTrigger>
          <TabsTrigger value="completed" className="text-blue-600">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredReminders.length > 0 ? (
            filteredReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No reminders found</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="urgent" className="space-y-4">
          {urgentReminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </TabsContent>

        <TabsContent value="medium" className="space-y-4">
          {mediumReminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </TabsContent>

        <TabsContent value="low" className="space-y-4">
          {lowReminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {reminders.filter(r => r.completed).map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </TabsContent>
      </Tabs>

      {/* Edit Reminder Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Reminder</DialogTitle>
            <DialogDescription>
              Update the reminder details and priority.
            </DialogDescription>
          </DialogHeader>
          
          {editingReminder && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingReminder.title}
                  onChange={(e) => setEditingReminder({...editingReminder, title: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingReminder.description}
                  onChange={(e) => setEditingReminder({...editingReminder, description: e.target.value})}
                  className="mt-1 min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select 
                    value={editingReminder.priority} 
                    onValueChange={(value) => setEditingReminder({...editingReminder, priority: value as Priority})}
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
                  <Label htmlFor="edit-due-date">Due Date</Label>
                  <Input
                    id="edit-due-date"
                    type="date"
                    value={editingReminder.due_date}
                    onChange={(e) => setEditingReminder({...editingReminder, due_date: e.target.value})}
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

      {/* Create Reminder Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Reminder</DialogTitle>
            <DialogDescription>
              Add a new reminder for a student.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-title">Title *</Label>
              <Input
                id="new-title"
                value={newReminder.title}
                onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                placeholder="Enter reminder title..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={newReminder.description}
                onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                placeholder="Enter reminder description..."
                className="mt-1 min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-priority">Priority</Label>
                <Select 
                  value={newReminder.priority} 
                  onValueChange={(value) => setNewReminder({...newReminder, priority: value as Priority})}
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
                <Label htmlFor="new-due-date">Due Date</Label>
                <Input
                  id="new-due-date"
                  type="date"
                  value={newReminder.due_date}
                  onChange={(e) => setNewReminder({...newReminder, due_date: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="new-student">Student *</Label>
              <Select 
                value={newReminder.student_id} 
                onValueChange={(value) => setNewReminder({...newReminder, student_id: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a student..." />
                </SelectTrigger>
                <SelectContent>
                  {studentsLoading ? (
                    <SelectItem value="" disabled>Loading students...</SelectItem>
                  ) : (
                    students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {student.schools?.name || 'No School'} - Grade {student.grade || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleCreateReminder} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Create Reminder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}