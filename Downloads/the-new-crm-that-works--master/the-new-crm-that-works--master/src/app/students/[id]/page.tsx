'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { StudentWithSchool, CRMTask } from '@/types'
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents'
import { useSupabaseCRMTasks } from '@/hooks/useSupabaseCRMTasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getInitials, openWhatsApp, openEmail } from '@/lib/utils'
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  MessageCircle, 
  Phone,
  MapPin,
  Calendar,
  School,
  User,
  CreditCard,
  FileText,
  Clock,
  Award,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react'

interface StudentNote {
  id: string
  content: string
  created_at: string
  type: 'note' | 'call' | 'meeting' | 'payment' | 'issue' | 'progress'
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  
  const { students, loading, updateStudent, fetchSchools } = useSupabaseStudents()
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([])
  
  const { 
    tasks: crmTasks, 
    loading: crmLoading, 
    createTask: createCrmTask,
    updateTask: updateCrmTask,
    deleteTask: deleteCrmTask 
  } = useSupabaseCRMTasks()
  const [student, setStudent] = useState<StudentWithSchool | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [notes, setNotes] = useState<StudentNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [newNoteType, setNewNoteType] = useState<StudentNote['type']>('note')
  const [invoiceStatus, setInvoiceStatus] = useState(false)
  const [schoolsLoading, setSchoolsLoading] = useState(true)
  
  // CRM Task/Reminder state
  const [studentCrmTasks, setStudentCrmTasks] = useState<CRMTask[]>([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as CRMTask['priority'],
    task_type: 'general' as CRMTask['task_type'],
    due_date: '',
    assigned_to: ''
  })

  const form = useForm<StudentWithSchool>({
    defaultValues: student || {}
  })

  useEffect(() => {
    const foundStudent = students.find(s => s.id === studentId)
    if (foundStudent) {
      setStudent(foundStudent)
      form.reset(foundStudent)
      setInvoiceStatus(foundStudent.invoice_sent || false)
      
      // Load mock notes (in real app, this would be from database)
      const mockNotes: StudentNote[] = [
        {
          id: '1',
          content: 'Initial enrollment meeting completed. Student shows great interest in mathematics.',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'meeting'
        },
        {
          id: '2', 
          content: 'Parent called to discuss schedule changes for next month.',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'call'
        },
        {
          id: '3',
          content: 'Payment received for monthly tuition.',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'payment'
        }
      ]
      setNotes(mockNotes)
    }
  }, [students, studentId, form])

  // Load schools for the dropdown
  useEffect(() => {
    const loadSchools = async () => {
      setSchoolsLoading(true)
      try {
        const schoolsData = await fetchSchools()
        setSchools(schoolsData)
      } catch (error) {
        console.error('Failed to load schools:', error)
      } finally {
        setSchoolsLoading(false)
      }
    }
    loadSchools()
  }, [fetchSchools])

  // Load CRM tasks for this student
  useEffect(() => {
    const studentTasks = crmTasks.filter(task => task.student_id === studentId)
    setStudentCrmTasks(studentTasks)
  }, [crmTasks, studentId])

  const handleSaveField = useCallback(async (field: string, value: any) => {
    if (!student) return
    
    try {
      const success = await updateStudent(student.id, { [field]: value })
      if (success) {
        setStudent(prev => prev ? { ...prev, [field]: value } : null)
        setEditingSection(null)
      } else {
        alert('Failed to update student. Please try again.')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Failed to update student. Please try again.')
    }
  }, [student, updateStudent])

  const handleAddNote = useCallback(() => {
    if (!newNote.trim()) return
    
    const note: StudentNote = {
      id: Date.now().toString(),
      content: newNote.trim(),
      created_at: new Date().toISOString(),
      type: newNoteType
    }
    
    setNotes(prev => [note, ...prev])
    setNewNote('')
    setNewNoteType('note')
  }, [newNote, newNoteType])

  const handleDeleteNote = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId))
  }, [])

  const handleInvoiceStatusChange = useCallback((value: boolean) => {
    setInvoiceStatus(value)
    // Note: This only updates local state since invoice_sent doesn't exist in database
  }, [])

  const handleCreateTask = useCallback(async () => {
    if (!newTask.title.trim() || !student) return
    
    const taskData: Omit<CRMTask, 'id' | 'created_at' | 'updated_at'> = {
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      priority: newTask.priority,
      task_type: newTask.task_type,
      status: 'pending',
      due_date: newTask.due_date || undefined,
      assigned_to: newTask.assigned_to || undefined,
      student_id: student.id
    }
    
    try {
      const success = await createCrmTask(taskData)
      if (success) {
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          task_type: 'general',
          due_date: '',
          assigned_to: ''
        })
        setShowTaskModal(false)
      } else {
        alert('Failed to create task. Please try again.')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task. Please try again.')
    }
  }, [newTask, student, createCrmTask])

  const handleUpdateTaskStatus = useCallback(async (taskId: string, status: CRMTask['status']) => {
    try {
      const updates = {
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : undefined
      }
      await updateCrmTask(taskId, updates)
    } catch (error) {
      console.error('Error updating task status:', error)
      alert('Failed to update task status.')
    }
  }, [updateCrmTask])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await deleteCrmTask(taskId)
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task.')
    }
  }, [deleteCrmTask])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Student not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      active: 'bg-green-100 text-green-700 border-green-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-purple-100 text-purple-700 border-purple-200',
      concern: 'bg-red-100 text-red-700 border-red-200',
      inactive: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return statusStyles[status] || 'bg-gray-100 text-gray-700'
  }

  const getPaymentBadge = (status: string) => {
    const paymentStyles: Record<string, string> = {
      paid: 'bg-green-100 text-green-700 border-green-200',
      outstanding: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      partial: 'bg-orange-100 text-orange-700 border-orange-200',
      overdue: 'bg-red-100 text-red-700 border-red-200',
    }
    return paymentStyles[status] || 'bg-gray-100 text-gray-700'
  }

  const getNoteTypeBadge = (type: StudentNote['type']) => {
    const typeStyles: Record<string, { class: string; label: string }> = {
      note: { class: 'bg-blue-100 text-blue-700', label: 'Note' },
      call: { class: 'bg-green-100 text-green-700', label: 'Call' },
      meeting: { class: 'bg-purple-100 text-purple-700', label: 'Meeting' },
      payment: { class: 'bg-yellow-100 text-yellow-700', label: 'Payment' },
      issue: { class: 'bg-red-100 text-red-700', label: 'Issue' },
      progress: { class: 'bg-indigo-100 text-indigo-700', label: 'Progress' }
    }
    return typeStyles[type] || typeStyles.note
  }

  const EditableField = ({ 
    label, 
    value, 
    field, 
    type = 'text', 
    options 
  }: { 
    label: string; 
    value: string | undefined; 
    field: string; 
    type?: 'text' | 'select'; 
    options?: { value: string; label: string }[] 
  }) => {
    const isEditing = editingSection === field
    
    return (
      <div className="flex justify-between items-center group">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              {type === 'select' && options ? (
                <Select 
                  defaultValue={value}
                  onValueChange={(newValue) => handleSaveField(field, newValue)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  defaultValue={value}
                  className="w-32"
                  onBlur={(e) => {
                    if (e.target.value !== value) {
                      handleSaveField(field, e.target.value)
                    } else {
                      setEditingSection(null)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if ((e.target as HTMLInputElement).value !== value) {
                        handleSaveField(field, (e.target as HTMLInputElement).value)
                      } else {
                        setEditingSection(null)
                      }
                    } else if (e.key === 'Escape') {
                      setEditingSection(null)
                    }
                  }}
                  autoFocus
                />
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingSection(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{value || '-'}</span>
              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setEditingSection(field)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold">Student Profile</h1>
            </div>
            <div className="text-sm text-gray-500">
              Click any field to edit inline
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">
                    {getInitials(student.first_name, student.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">
                    {student.first_name} {student.last_name}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <School className="h-4 w-4 mr-1" />
                      {student.schools?.name || 'No school'}
                    </div>
                    <div>Grade {student.grade}</div>
                    <div>{student.class_type}</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge className={getStatusBadge(student.status)}>
                      {student.status}
                    </Badge>
                    <Badge className={getPaymentBadge(student.payment_status)}>
                      Payment: {student.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => student.parent_phone && openWhatsApp(student.parent_phone)}
                  disabled={!student.parent_phone}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => student.parent_email && openEmail(student.parent_email)}
                  disabled={!student.parent_email}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="payment">Payment History</TabsTrigger>
            <TabsTrigger value="notes">Notes & Activities</TabsTrigger>
            <TabsTrigger value="tasks">Tasks & Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <EditableField 
                    label="First Name" 
                    value={student.first_name} 
                    field="first_name" 
                  />
                  <EditableField 
                    label="Last Name" 
                    value={student.last_name} 
                    field="last_name" 
                  />
                  <EditableField 
                    label="Grade" 
                    value={student.grade?.toString()} 
                    field="grade" 
                    type="select"
                    options={[
                      { value: '1', label: 'Grade 1' },
                      { value: '2', label: 'Grade 2' },
                      { value: '3', label: 'Grade 3' },
                      { value: '4', label: 'Grade 4' },
                      { value: '5', label: 'Grade 5' },
                      { value: '6', label: 'Grade 6' },
                      { value: '7', label: 'Grade 7' },
                      { value: '8', label: 'Grade 8' },
                      { value: '9', label: 'Grade 9' },
                      { value: '10', label: 'Grade 10' },
                      { value: '11', label: 'Grade 11' },
                      { value: '12', label: 'Grade 12' }
                    ]}
                  />
                  <EditableField 
                    label="Class Type" 
                    value={student.class_type} 
                    field="class_type"
                    type="select"
                    options={[
                      { value: 'individual', label: 'Individual' },
                      { value: 'group', label: 'Group' },
                      { value: 'online', label: 'Online' },
                      { value: 'hybrid', label: 'Hybrid' }
                    ]}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Created</span>
                    <span className="text-sm font-medium">{new Date(student.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Status & Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <EditableField 
                    label="Status" 
                    value={student.status} 
                    field="status"
                    type="select"
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'concern', label: 'Concern' },
                      { value: 'inactive', label: 'Inactive' }
                    ]}
                  />
                  <EditableField 
                    label="Payment Status" 
                    value={student.payment_status} 
                    field="payment_status"
                    type="select"
                    options={[
                      { value: 'paid', label: 'Paid' },
                      { value: 'outstanding', label: 'Outstanding' },
                      { value: 'partial', label: 'Partial' },
                      { value: 'overdue', label: 'Overdue' }
                    ]}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Invoice Sent</span>
                    <Select 
                      value={invoiceStatus ? 'yes' : 'no'}
                      onValueChange={(value) => handleInvoiceStatusChange(value === 'yes')}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-gray-500">School</span>
                    <div className="flex items-center gap-2">
                      {editingSection === 'school_id' ? (
                        <div className="flex items-center gap-2">
                          <Select
                            value={student.school_id || ''}
                            onValueChange={(newValue) => {
                              if (newValue) {
                                handleSaveField('school_id', newValue)
                              } else {
                                setEditingSection(null)
                              }
                            }}
                          >
                            <SelectTrigger className={`w-48 ${schoolsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              <SelectValue placeholder={schoolsLoading ? 'Loading...' : 'Select school'} />
                            </SelectTrigger>
                            <SelectContent>
                              {schools.map(school => (
                                <SelectItem key={school.id} value={school.id}>
                                  {school.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingSection(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{student.schools?.name || 'Not assigned'}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setEditingSection('school_id')}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags */}
            {student.tags && student.tags.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {student.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Parent/Guardian Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <EditableField
                      label="Parent Name"
                      value={student.parent_name || ''}
                      field="parent_name"
                    />
                    <EditableField
                      label="Phone Number"
                      value={student.parent_phone || ''}
                      field="parent_phone"
                    />
                  </div>
                  <div className="space-y-3">
                    <EditableField
                      label="Email Address"
                      value={student.parent_email || ''}
                      field="parent_email"
                    />
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Relationship</span>
                      <span className="text-sm font-medium">Parent/Guardian</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => student.parent_phone && openWhatsApp(student.parent_phone)}
                    disabled={!student.parent_phone}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => student.parent_email && openEmail(student.parent_email)}
                    disabled={!student.parent_email}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Academic records and performance tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Payment history and invoices coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notes & Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new note */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex gap-2 items-start">
                    <Select value={newNoteType} onValueChange={(value) => setNewNoteType(value as StudentNote['type'])}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="issue">Issue</SelectItem>
                        <SelectItem value="progress">Progress</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Add a note about this student..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="min-h-20"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </div>

                {/* Notes list */}
                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No notes yet</p>
                    </div>
                  ) : (
                    notes.map((note) => {
                      const typeBadge = getNoteTypeBadge(note.type)
                      return (
                        <div key={note.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={typeBadge.class}>
                                {typeBadge.label}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{note.content}</p>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Tasks & Reminders</CardTitle>
                  <Button onClick={() => setShowTaskModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tasks list */}
                <div className="space-y-3">
                  {studentCrmTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No tasks or reminders yet</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowTaskModal(true)}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Task
                      </Button>
                    </div>
                  ) : (
                    studentCrmTasks.map((task) => (
                      <div key={task.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={
                              task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }>
                              {task.priority}
                            </Badge>
                            <Badge className={
                              task.task_type === 'payment' ? 'bg-green-100 text-green-700' :
                              task.task_type === 'follow_up' ? 'bg-purple-100 text-purple-700' :
                              task.task_type === 'certificate' ? 'bg-indigo-100 text-indigo-700' :
                              task.task_type === 'equipment' ? 'bg-pink-100 text-pink-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {task.task_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Created {new Date(task.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select 
                              value={task.status} 
                              onValueChange={(status) => handleUpdateTaskStatus(task.id, status as CRMTask['status'])}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
                        {task.description && (
                          <p className="text-gray-600 mb-2">{task.description}</p>
                        )}
                        
                        {task.due_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className={
                              new Date(task.due_date) < new Date() && task.status !== 'completed'
                                ? 'text-red-600 font-medium'
                                : 'text-gray-600'
                            }>
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>

    {/* Task Creation Modal */}
    {showTaskModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Create New Task</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTaskModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title..."
              />
            </div>

            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as CRMTask['priority'] }))}
                >
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
                <Label htmlFor="task-type">Type</Label>
                <Select
                  value={newTask.task_type}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, task_type: value as CRMTask['task_type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="task-due-date">Due Date (Optional)</Label>
              <Input
                id="task-due-date"
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowTaskModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                disabled={!newTask.title.trim() || crmLoading}
              >
                {crmLoading ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}