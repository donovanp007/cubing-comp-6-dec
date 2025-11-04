'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents'
import { useSupabaseProjects } from '@/hooks/useSupabaseProjects'
import { Calendar, Users, AlertTriangle, Save, X } from 'lucide-react'

interface TaskAssignmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTask?: (taskData: any) => Promise<boolean>
  taskType: 'crm' | 'project'
  preselectedProjectId?: string
  preselectedStudentId?: string
}

export default function TaskAssignmentModal({
  open,
  onOpenChange,
  onCreateTask,
  taskType,
  preselectedProjectId,
  preselectedStudentId
}: TaskAssignmentModalProps) {
  const { students, loading: studentsLoading } = useSupabaseStudents()
  const { projects, users, loading: projectsLoading } = useSupabaseProjects()
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    due_date: '',
    assigned_to: '',
    project_id: preselectedProjectId || '',
    student_id: preselectedStudentId || '',
    task_type: 'general' as 'follow_up' | 'payment' | 'certificate' | 'equipment' | 'general',
    estimated_hours: 0
  })

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      alert('Please enter a task title.')
      return
    }

    if (taskType === 'crm' && !newTask.student_id) {
      alert('Please select a student for CRM tasks.')
      return
    }

    if (taskType === 'project' && !newTask.project_id) {
      alert('Please select a project for project tasks.')
      return
    }

    const success = await onCreateTask?.(newTask)
    if (success) {
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assigned_to: '',
        project_id: preselectedProjectId || '',
        student_id: preselectedStudentId || '',
        task_type: 'general',
        estimated_hours: 0
      })
      onOpenChange(false)
    } else {
      alert('Failed to create task. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create New {taskType === 'crm' ? 'CRM' : 'Project'} Task
          </DialogTitle>
          <DialogDescription>
            Assign a new task to a team member and track progress.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="task-title">Task Title *</Label>
            <Input
              id="task-title"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              placeholder="Enter task title..."
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              placeholder="Enter task description..."
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="task-priority">Priority</Label>
              <Select 
                value={newTask.priority} 
                onValueChange={(value) => setNewTask({...newTask, priority: value as any})}
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
              <Label htmlFor="task-due-date">Due Date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="task-assignee">Assign To</Label>
            <Select 
              value={newTask.assigned_to} 
              onValueChange={(value) => setNewTask({...newTask, assigned_to: value})}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a team member..." />
              </SelectTrigger>
              <SelectContent>
                {projectsLoading ? (
                  <SelectItem value="" disabled>Loading team members...</SelectItem>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.role} - {user.department}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {taskType === 'crm' && (
            <>
              <div>
                <Label htmlFor="task-student">Student *</Label>
                <Select 
                  value={newTask.student_id} 
                  onValueChange={(value) => setNewTask({...newTask, student_id: value})}
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

              <div>
                <Label htmlFor="task-type">Task Type</Label>
                <Select 
                  value={newTask.task_type} 
                  onValueChange={(value) => setNewTask({...newTask, task_type: value as any})}
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
            </>
          )}

          {taskType === 'project' && (
            <>
              <div>
                <Label htmlFor="task-project">Project *</Label>
                <Select 
                  value={newTask.project_id} 
                  onValueChange={(value) => setNewTask({...newTask, project_id: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projectsLoading ? (
                      <SelectItem value="" disabled>Loading projects...</SelectItem>
                    ) : (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: project.color }}
                            />
                            <div>
                              <div className="font-medium">{project.name}</div>
                              <div className="text-xs text-gray-500">{project.status}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimated-hours">Estimated Hours</Label>
                <Input
                  id="estimated-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={newTask.estimated_hours}
                  onChange={(e) => setNewTask({...newTask, estimated_hours: parseFloat(e.target.value) || 0})}
                  className="mt-1"
                  placeholder="0"
                />
              </div>
            </>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleCreateTask} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}