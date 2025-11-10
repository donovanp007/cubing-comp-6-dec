'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  School,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Target,
  TrendingUp,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  UserCheck,
  BookOpen,
  MessageCircle,
  AlertCircle
} from 'lucide-react'

interface SchoolDetails {
  id: string
  name: string
  team_id?: string
  school_type?: string
  school_status?: string
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  principal_name?: string
  principal_phone?: string
  principal_email?: string
  address?: string
  area: string
  target_enrollment: number
  current_enrollment: number
  monthly_cost: number
  program_fee_per_student: number
  term_fee_per_student: number
  notes?: string
  created_at: string
  updated_at: string
  // Computed fields
  active_students?: number
  inactive_students?: number
  completion_rate?: number
  revenue_this_month?: number
  team_name?: string
}

interface Student {
  id: string
  first_name: string
  last_name: string
  grade: number
  status: string
  payment_status: string
  parent_name?: string
  parent_phone?: string
  created_at: string
}

interface ClassSchedule {
  id: string
  school_id: string
  day_of_week: string
  start_time: string
  end_time: string
  grade_level?: string
  teacher_name?: string
  room?: string
  max_students?: number
  current_students?: number
  created_at: string
}

interface SchoolDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string | null
  onSchoolUpdate?: () => void
}

export default function SchoolDetailsModal({ open, onOpenChange, schoolId, onSchoolUpdate }: SchoolDetailsModalProps) {
  const [school, setSchool] = useState<SchoolDetails | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [teams, setTeams] = useState<{ id: string; team_name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<SchoolDetails>>({})
  const [newSchedule, setNewSchedule] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    grade_level: '',
    teacher_name: '',
    room: '',
    max_students: 15
  })

  useEffect(() => {
    if (open && schoolId) {
      fetchSchoolData()
    }
  }, [open, schoolId])

  const fetchSchoolData = async () => {
    if (!schoolId) return

    setLoading(true)
    try {
      // Fetch school details
      const schoolResponse = await supabase
        .from('schools')
        .select(`
          *,
          teams (
            id,
            team_name
          )
        `)
        .eq('id', schoolId)
        .single()

      if (schoolResponse.error) throw schoolResponse.error

      // Fetch students for this school
      const studentsResponse = await supabase
        .from('students')
        .select('id, first_name, last_name, grade, status, payment_status, parent_name, parent_phone, created_at')
        .eq('school_id', schoolId)

      // Fetch class schedules (this table might not exist yet, so we handle gracefully)
      let schedulesResponse: any = { data: [], error: null }
      try {
        schedulesResponse = await supabase
          .from('class_schedules')
          .select('*')
          .eq('school_id', schoolId)
      } catch (error) {
        console.log('Class schedules table not found, skipping...')
      }

      // Fetch teams for dropdown
      const teamsResponse = await supabase
        .from('teams')
        .select('id, team_name')
        .order('team_name')

      const schoolData = schoolResponse.data
      const studentsData = studentsResponse.data || []

      // Calculate school statistics
      const activeStudents = studentsData.filter(s => s.status === 'active' || s.status === 'in_progress').length
      const inactiveStudents = studentsData.length - activeStudents
      const completedStudents = studentsData.filter(s => s.status === 'completed').length
      const completionRate = studentsData.length > 0 ? Math.round((completedStudents / studentsData.length) * 100) : 0
      const revenueThisMonth = activeStudents * (schoolData.program_fee_per_student || 0)

      setSchool({
        ...schoolData,
        active_students: activeStudents,
        inactive_students: inactiveStudents,
        completion_rate: completionRate,
        revenue_this_month: revenueThisMonth,
        team_name: schoolData.teams?.team_name
      })
      setStudents(studentsData)
      setSchedules(schedulesResponse.data || [])
      setTeams(teamsResponse.data || [])
      setEditForm(schoolData)

    } catch (error) {
      console.error('Error fetching school data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSchool = async () => {
    if (!school || !editForm) return

    try {
      const { error } = await supabase
        .from('schools')
        .update({
          ...editForm,
          updated_at: new Date().toISOString()
        })
        .eq('id', school.id)

      if (error) throw error

      await fetchSchoolData()
      setIsEditing(false)
      onSchoolUpdate?.()
    } catch (error) {
      console.error('Error updating school:', error)
      alert('Failed to update school. Please try again.')
    }
  }

  const handleAddSchedule = async () => {
    if (!school || !newSchedule.day_of_week || !newSchedule.start_time || !newSchedule.end_time) return

    try {
      // First, create the class_schedules table if it doesn't exist
      const { error: createError } = await supabase.rpc('exec', {
        sql: `
          CREATE TABLE IF NOT EXISTS class_schedules (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
            day_of_week TEXT NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            grade_level TEXT,
            teacher_name TEXT,
            room TEXT,
            max_students INTEGER DEFAULT 15,
            current_students INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      })

      if (createError) {
        console.log('Table creation not needed or failed, continuing...')
      }

      const { error } = await supabase
        .from('class_schedules')
        .insert([{
          school_id: school.id,
          ...newSchedule
        }])

      if (error) throw error

      setNewSchedule({
        day_of_week: '',
        start_time: '',
        end_time: '',
        grade_level: '',
        teacher_name: '',
        room: '',
        max_students: 15
      })

      await fetchSchoolData()
    } catch (error) {
      console.error('Error adding schedule:', error)
      alert('Schedule feature is not yet fully implemented in the database.')
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this class schedule?')) return

    try {
      const { error } = await supabase
        .from('class_schedules')
        .delete()
        .eq('id', scheduleId)

      if (error) throw error

      await fetchSchoolData()
    } catch (error) {
      console.error('Error deleting schedule:', error)
      alert('Failed to delete schedule.')
    }
  }

  const openWhatsApp = (phone: string, message: string = '') => {
    const cleanPhone = phone.replace(/[^\d]/g, '')
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const openEmail = (email: string, subject: string = '') => {
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`
    window.location.href = url
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700 border-green-200',
      inactive: 'bg-gray-100 text-gray-700 border-gray-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      concern: 'bg-red-100 text-red-700 border-red-200'
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const getDayAbbreviation = (day: string) => {
    const days: Record<string, string> = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    }
    return days[day] || day
  }

  if (loading || !school) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            {school.name}
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Complete school management and operations center</span>
            <div className="flex items-center gap-2">
              <Badge className={getStatusBadge(school.school_status || 'active')}>
                {school.school_status || 'Active'}
              </Badge>
              <Badge variant="outline" className="text-blue-600">
                {school.team_name || 'Unassigned Team'}
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Active Students</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{school.active_students}</div>
                <div className="text-xs text-gray-500">Target: {school.target_enrollment}</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Monthly Revenue</span>
                </div>
                <div className="text-2xl font-bold text-green-600">R{school.revenue_this_month?.toLocaleString()}</div>
                <div className="text-xs text-gray-500">This month</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Completion Rate</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">{school.completion_rate}%</div>
                <div className="text-xs text-gray-500">Program completion</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Classes</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">{schedules.length}</div>
                <div className="text-xs text-gray-500">Weekly schedule</div>
              </Card>
            </div>

            {/* Quick Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location & Team
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-medium">{school.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Team:</span>
                    <Badge variant="outline">{school.team_name || 'Unassigned'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{school.school_type || 'Public'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{school.address || 'Not provided'}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enrollment Progress:</span>
                    <span className="font-medium">{Math.round(((school.active_students || 0) / school.target_enrollment) * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Fee per Student:</span>
                    <span className="font-medium">R{school.program_fee_per_student}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Term Fee per Student:</span>
                    <span className="font-medium">R{school.term_fee_per_student}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inactive Students:</span>
                    <span className="font-medium">{school.inactive_students}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Notes */}
            {school.notes && (
              <Card className="p-4">
                <h3 className="font-semibold mb-2">School Notes</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{school.notes}</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Students at {school.name}</h3>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>

            <div className="space-y-2">
              {students.map((student) => (
                <Card key={student.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{student.first_name} {student.last_name}</div>
                      <div className="text-sm text-gray-600">
                        Grade {student.grade} • {student.parent_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Enrolled: {new Date(student.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadge(student.status)}>
                        {student.status}
                      </Badge>
                      <Badge variant="outline">
                        {student.payment_status}
                      </Badge>
                      {student.parent_phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openWhatsApp(student.parent_phone!, `Hi ${student.parent_name}, regarding ${student.first_name}'s progress at ${school.name}.`)}
                        >
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {students.length === 0 && (
                <Card className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Students Enrolled</h3>
                  <p className="text-gray-600 mb-4">This school doesn't have any students yet</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Student
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Class Schedules</h3>
            </div>

            {/* Add New Schedule */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Add New Class</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Day</Label>
                  <Select value={newSchedule.day_of_week} onValueChange={(value) => setNewSchedule(prev => ({ ...prev, day_of_week: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={newSchedule.start_time}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={newSchedule.end_time}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Grade Level</Label>
                  <Input
                    value={newSchedule.grade_level}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, grade_level: e.target.value }))}
                    placeholder="e.g., Grade 4-6"
                  />
                </div>
                <div>
                  <Label>Teacher</Label>
                  <Input
                    value={newSchedule.teacher_name}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, teacher_name: e.target.value }))}
                    placeholder="Teacher name"
                  />
                </div>
                <div>
                  <Label>Room</Label>
                  <Input
                    value={newSchedule.room}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, room: e.target.value }))}
                    placeholder="Room/Location"
                  />
                </div>
                <div>
                  <Label>Max Students</Label>
                  <Input
                    type="number"
                    value={newSchedule.max_students}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, max_students: parseInt(e.target.value) || 15 }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddSchedule} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Class
                  </Button>
                </div>
              </div>
            </Card>

            {/* Existing Schedules */}
            <div className="grid md:grid-cols-2 gap-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {getDayAbbreviation(schedule.day_of_week)}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {schedule.start_time} - {schedule.end_time}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1 text-sm">
                    {schedule.grade_level && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Grade:</span>
                        <span>{schedule.grade_level}</span>
                      </div>
                    )}
                    {schedule.teacher_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Teacher:</span>
                        <span>{schedule.teacher_name}</span>
                      </div>
                    )}
                    {schedule.room && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room:</span>
                        <span>{schedule.room}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span>{schedule.current_students || 0}/{schedule.max_students}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {schedules.length === 0 && (
              <Card className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Class Schedules</h3>
                <p className="text-gray-600">Add your first class schedule above</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  School Contact
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label>Contact Person</Label>
                    <div className="text-sm font-medium">{school.contact_name || 'Not provided'}</div>
                  </div>
                  {school.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{school.contact_phone}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openWhatsApp(school.contact_phone!, `Hi ${school.contact_name}, this is regarding ${school.name}.`)}
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {school.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{school.contact_email}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEmail(school.contact_email!, `Regarding ${school.name}`)}
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Principal
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label>Principal Name</Label>
                    <div className="text-sm font-medium">{school.principal_name || 'Not provided'}</div>
                  </div>
                  {school.principal_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{school.principal_phone}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openWhatsApp(school.principal_phone!, `Hi ${school.principal_name}, this is regarding our program at ${school.name}.`)}
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {school.principal_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{school.principal_email}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEmail(school.principal_email!, `Program Update - ${school.name}`)}
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2 text-green-600">Revenue</h3>
                <div className="text-2xl font-bold text-green-600">R{school.revenue_this_month?.toLocaleString()}</div>
                <div className="text-xs text-gray-500">This month</div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-2 text-red-600">Monthly Costs</h3>
                <div className="text-2xl font-bold text-red-600">R{school.monthly_cost?.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Operational costs</div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-2 text-blue-600">Net Profit</h3>
                <div className={`text-2xl font-bold ${((school.revenue_this_month || 0) - (school.monthly_cost || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R{((school.revenue_this_month || 0) - (school.monthly_cost || 0)).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">This month</div>
              </Card>
            </div>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Fee Structure</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Fee per Student:</span>
                  <span className="font-medium">R{school.program_fee_per_student}</span>
                </div>
                <div className="flex justify-between">
                  <span>Term Fee per Student:</span>
                  <span className="font-medium">R{school.term_fee_per_student}</span>
                </div>
                <div className="flex justify-between">
                  <span>Projected Monthly Revenue (at capacity):</span>
                  <span className="font-medium">R{(school.target_enrollment * school.program_fee_per_student).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">School Settings</h3>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSchool}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit School
                  </Button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <Label>School Name</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm font-medium">{school.name}</div>
                    )}
                  </div>

                  <div>
                    <Label>Area/Region</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.area || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, area: e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm font-medium">{school.area}</div>
                    )}
                  </div>

                  <div>
                    <Label>Team Assignment</Label>
                    {isEditing ? (
                      <Select value={editForm.team_id || ''} onValueChange={(value) => setEditForm(prev => ({ ...prev, team_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No team</SelectItem>
                          {teams.map(team => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.team_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm font-medium">{school.team_name || 'Unassigned'}</div>
                    )}
                  </div>

                  <div>
                    <Label>Address</Label>
                    {isEditing ? (
                      <Textarea
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm font-medium">{school.address || 'Not provided'}</div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div>
                    <Label>Contact Name</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.contact_name || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, contact_name: e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm font-medium">{school.contact_name || 'Not provided'}</div>
                    )}
                  </div>

                  <div>
                    <Label>Contact Phone</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.contact_phone || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm font-medium">{school.contact_phone || 'Not provided'}</div>
                    )}
                  </div>

                  <div>
                    <Label>Contact Email</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.contact_email || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, contact_email: e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm font-medium">{school.contact_email || 'Not provided'}</div>
                    )}
                  </div>

                  <div>
                    <Label>Principal Name</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.principal_name || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, principal_name: e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm font-medium">{school.principal_name || 'Not provided'}</div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Financial Settings</h4>
                <div className="space-y-3">
                  <div>
                    <Label>Target Enrollment</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editForm.target_enrollment || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, target_enrollment: parseInt(e.target.value) || 0 }))}
                      />
                    ) : (
                      <div className="text-sm font-medium">{school.target_enrollment}</div>
                    )}
                  </div>

                  <div>
                    <Label>Monthly Cost (R)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editForm.monthly_cost || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, monthly_cost: parseInt(e.target.value) || 0 }))}
                      />
                    ) : (
                      <div className="text-sm font-medium">R{school.monthly_cost?.toLocaleString()}</div>
                    )}
                  </div>

                  <div>
                    <Label>Program Fee per Student (R/month)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editForm.program_fee_per_student || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, program_fee_per_student: parseInt(e.target.value) || 0 }))}
                      />
                    ) : (
                      <div className="text-sm font-medium">R{school.program_fee_per_student}</div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Notes</h4>
                {isEditing ? (
                  <Textarea
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add notes about this school..."
                    rows={5}
                  />
                ) : (
                  <div className="text-sm text-gray-700 whitespace-pre-wrap min-h-[100px]">
                    {school.notes || 'No notes added'}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}