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
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  School,
  Target,
  DollarSign,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  BookOpen,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react'

interface TeamDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: any
}

interface TeamStudent {
  id: string
  first_name: string
  last_name: string
  grade: number
  school_name: string
  parent_name?: string
  parent_phone?: string
  status: string
  payment_status: string
  class_type: string
  attendance_rate?: number
  last_activity?: string
}

interface TeamSchool {
  id: string
  school_name: string
  principal_name?: string
  contact_phone?: string
  student_count: number
  term_fee_per_student: number
  area?: string
  last_visit?: string
}

interface TeamPerformanceMetrics {
  total_revenue: number
  revenue_growth: number
  student_retention: number
  attendance_rate: number
  completion_rate: number
  parent_satisfaction: number
  recent_enrollments: number
  pending_payments: number
}

export default function TeamDetailsModal({ open, onOpenChange, team }: TeamDetailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<TeamStudent[]>([])
  const [schools, setSchools] = useState<TeamSchool[]>([])
  const [metrics, setMetrics] = useState<TeamPerformanceMetrics | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (open && team) {
      fetchTeamDetails()
    }
  }, [open, team])

  const fetchTeamDetails = async () => {
    if (!team) return

    setLoading(true)
    try {
      // Fetch students assigned to this team
      const studentsResponse = await supabase
        .from('students')
        .select(`
          *,
          schools!inner(
            school_name,
            principal_name,
            contact_phone
          )
        `)
        .eq('team_id', team.team_id)

      // Fetch schools managed by this team
      const schoolsResponse = await supabase
        .from('schools')
        .select('*')
        .eq('area', team.area)

      // Calculate performance metrics
      const studentData = studentsResponse.data || []
      const schoolData = schoolsResponse.data || []

      const enrichedStudents: TeamStudent[] = studentData.map(student => ({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name || '',
        grade: student.grade,
        school_name: student.schools?.school_name || 'Unknown School',
        parent_name: student.parent_name,
        parent_phone: student.parent_phone,
        status: student.status,
        payment_status: student.payment_status,
        class_type: student.class_type,
        attendance_rate: Math.floor(Math.random() * 30) + 70, // Mock data
        last_activity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }))

      const enrichedSchools: TeamSchool[] = schoolData.map(school => ({
        id: school.id,
        school_name: school.school_name,
        principal_name: school.principal_name,
        contact_phone: school.contact_phone,
        student_count: studentData.filter(s => s.school_id === school.id).length,
        term_fee_per_student: school.term_fee_per_student || 0,
        area: school.area,
        last_visit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }))

      // Calculate metrics
      const totalRevenue = enrichedSchools.reduce((sum, school) =>
        sum + (school.student_count * school.term_fee_per_student), 0
      )

      const activeStudents = enrichedStudents.filter(s => s.status === 'active').length
      const totalStudents = enrichedStudents.length
      const paidStudents = enrichedStudents.filter(s => s.payment_status === 'paid').length

      const performanceMetrics: TeamPerformanceMetrics = {
        total_revenue: totalRevenue,
        revenue_growth: Math.floor(Math.random() * 20) + 5, // Mock data
        student_retention: totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0,
        attendance_rate: enrichedStudents.length > 0 ?
          Math.round(enrichedStudents.reduce((sum, s) => sum + (s.attendance_rate || 0), 0) / enrichedStudents.length) : 0,
        completion_rate: Math.floor(Math.random() * 25) + 75, // Mock data
        parent_satisfaction: Math.floor(Math.random() * 15) + 85, // Mock data
        recent_enrollments: enrichedStudents.filter(s =>
          new Date(s.last_activity || 0) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        pending_payments: totalStudents - paidStudents
      }

      setStudents(enrichedStudents)
      setSchools(enrichedSchools)
      setMetrics(performanceMetrics)

    } catch (error) {
      console.error('Error fetching team details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700'
    }
    return colors[status as keyof typeof colors] || colors.active
  }

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-700',
      outstanding: 'bg-red-100 text-red-700',
      partial: 'bg-yellow-100 text-yellow-700'
    }
    return colors[status as keyof typeof colors] || colors.outstanding
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!team) return null

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Loading Team Details</DialogTitle>
          </DialogHeader>
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
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <Users className="h-6 w-6" />
                {team.team_name}
                <Badge variant={
                  (team.target_achievement_pct || 0) >= 100 ? 'default' :
                  (team.target_achievement_pct || 0) >= 80 ? 'secondary' :
                  'destructive'
                }>
                  {team.target_achievement_pct || 0}% Target Achievement
                </Badge>
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {team.area}
                </span>
                <span className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  Lead: {team.lead_coach || 'Unassigned'}
                </span>
                <span className="flex items-center gap-1">
                  <School className="h-4 w-4" />
                  {schools.length} Schools
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {students.length} Students
                </span>
              </DialogDescription>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
            <TabsTrigger value="schools">Schools ({schools.length})</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="staff">Team Staff</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Student Progress</div>
                    <div className="text-xl font-bold">
                      {team.current_students || 0}/{team.target_students || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.max(0, (team.target_students || 0) - (team.current_students || 0))} to target
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                    <div className="text-xl font-bold">
                      {formatCurrency(metrics?.total_revenue || 0)}
                    </div>
                    <div className="text-xs text-green-600">
                      +{metrics?.revenue_growth || 0}% from last month
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Retention Rate</div>
                    <div className="text-xl font-bold">{metrics?.student_retention || 0}%</div>
                    <div className="text-xs text-gray-500">Active students</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Attendance</div>
                    <div className="text-xl font-bold">{metrics?.attendance_rate || 0}%</div>
                    <div className="text-xs text-gray-500">Average rate</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Progress Visualization */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Team Progress Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Student Enrollment Progress</span>
                    <span className="font-medium">
                      {Math.round(((team.current_students || 0) / (team.target_students || 1)) * 100)}%
                    </span>
                  </div>
                  <Progress value={((team.current_students || 0) / (team.target_students || 1)) * 100} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Revenue Target Progress</span>
                    <span className="font-medium">{team.target_achievement_pct || 0}%</span>
                  </div>
                  <Progress value={team.target_achievement_pct || 0} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Student Retention</span>
                    <span className="font-medium">{metrics?.student_retention || 0}%</span>
                  </div>
                  <Progress value={metrics?.student_retention || 0} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Payment Collection</span>
                    <span className="font-medium">
                      {students.length > 0 ? Math.round(((students.length - (metrics?.pending_payments || 0)) / students.length) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={students.length > 0 ? ((students.length - (metrics?.pending_payments || 0)) / students.length) * 100 : 0}
                    className="h-3"
                  />
                </div>
              </div>
            </Card>

            {/* Recent Activity & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Recent Achievements
                </h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">New Enrollments</div>
                    <div className="text-gray-600">{metrics?.recent_enrollments || 0} students in last 30 days</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Parent Satisfaction</div>
                    <div className="text-gray-600">{metrics?.parent_satisfaction || 0}% positive feedback</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Course Completion</div>
                    <div className="text-gray-600">{metrics?.completion_rate || 0}% completion rate</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Attention Required
                </h4>
                <div className="space-y-2">
                  {!team.lead_coach && (
                    <div className="text-sm bg-red-50 p-2 rounded">
                      <div className="font-medium text-red-700">No Lead Coach Assigned</div>
                      <div className="text-red-600">Team needs leadership</div>
                    </div>
                  )}

                  {(metrics?.pending_payments || 0) > 0 && (
                    <div className="text-sm bg-yellow-50 p-2 rounded">
                      <div className="font-medium text-yellow-700">Pending Payments</div>
                      <div className="text-yellow-600">{metrics?.pending_payments} students outstanding</div>
                    </div>
                  )}

                  {(team.target_achievement_pct || 0) < 70 && (
                    <div className="text-sm bg-red-50 p-2 rounded">
                      <div className="font-medium text-red-700">Below Target</div>
                      <div className="text-red-600">Performance intervention needed</div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Team Students ({students.length})</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {students.map((student) => (
                <Card key={student.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Grade {student.grade} • {student.school_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.class_type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="font-medium">{student.attendance_rate}% Attendance</div>
                        <div className="text-gray-500">Last active: {formatDate(student.last_activity || '')}</div>
                      </div>

                      <div className="flex gap-2">
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                        <Badge className={getPaymentStatusColor(student.payment_status)}>
                          {student.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {student.parent_name && (
                    <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>Parent: {student.parent_name}</span>
                        {student.parent_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {student.parent_phone}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}

              {students.length === 0 && (
                <Card className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Students Assigned</h3>
                  <p className="text-gray-600">Students will appear here once assigned to this team</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schools" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Managed Schools ({schools.length})</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schools.map((school) => (
                <Card key={school.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{school.school_name}</h4>
                      <div className="text-sm text-gray-600">
                        {school.area}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {school.student_count} students
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    {school.principal_name && (
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-3 w-3 text-gray-500" />
                        <span>Principal: {school.principal_name}</span>
                      </div>
                    )}

                    {school.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span>{school.contact_phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 text-gray-500" />
                      <span>Fee: {formatCurrency(school.term_fee_per_student)}/term</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      <span>Last visit: {formatDate(school.last_visit || '')}</span>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-xs text-gray-600">
                        Monthly Revenue: {formatCurrency(school.student_count * school.term_fee_per_student)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {schools.length === 0 && (
                <Card className="p-8 text-center col-span-2">
                  <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Schools Assigned</h3>
                  <p className="text-gray-600">Schools will appear here based on team area assignment</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <h3 className="text-lg font-semibold">Performance Analytics</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Financial Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Revenue:</span>
                    <span className="font-medium">{formatCurrency(metrics?.total_revenue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Growth Rate:</span>
                    <span className="font-medium text-green-600">+{metrics?.revenue_growth || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending Payments:</span>
                    <span className="font-medium text-red-600">{metrics?.pending_payments || 0}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Student Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Retention Rate:</span>
                    <span className="font-medium">{metrics?.student_retention || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Attendance:</span>
                    <span className="font-medium">{metrics?.attendance_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completion Rate:</span>
                    <span className="font-medium">{metrics?.completion_rate || 0}%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Satisfaction Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Parent Satisfaction:</span>
                    <span className="font-medium">{metrics?.parent_satisfaction || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Recent Enrollments:</span>
                    <span className="font-medium">{metrics?.recent_enrollments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Target Achievement:</span>
                    <span className="font-medium">{team.target_achievement_pct || 0}%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <h3 className="text-lg font-semibold">Team Staff Assignment</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Lead Coach
                </h4>
                {team.lead_coach ? (
                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-medium text-green-800">{team.lead_coach}</div>
                    <div className="text-sm text-green-600">Team Leader</div>
                  </div>
                ) : (
                  <div className="bg-red-50 p-3 rounded">
                    <div className="font-medium text-red-800">Vacant Position</div>
                    <div className="text-sm text-red-600">Requires assignment</div>
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Assistant Coach 1
                </h4>
                {team.assistant_1 ? (
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="font-medium text-blue-800">{team.assistant_1}</div>
                    <div className="text-sm text-blue-600">Assistant</div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-800">Open Position</div>
                    <div className="text-sm text-gray-600">Available for assignment</div>
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Assistant Coach 2
                </h4>
                {team.assistant_2 ? (
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="font-medium text-blue-800">{team.assistant_2}</div>
                    <div className="text-sm text-blue-600">Assistant</div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-800">Open Position</div>
                    <div className="text-sm text-gray-600">Available for assignment</div>
                  </div>
                )}
              </Card>
            </div>

            <Card className="p-4">
              <h4 className="font-semibold mb-3">Staffing Recommendations</h4>
              <div className="space-y-3">
                {!team.lead_coach && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium text-red-800">Critical: No Lead Coach</div>
                      <div className="text-sm text-red-600">Team requires immediate leadership assignment</div>
                    </div>
                  </div>
                )}

                {!team.assistant_1 && !team.assistant_2 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-medium text-yellow-800">No Assistant Coaches</div>
                      <div className="text-sm text-yellow-600">Consider assigning assistants for {students.length} students</div>
                    </div>
                  </div>
                )}

                {students.length > 20 && (!team.assistant_1 || !team.assistant_2) && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-800">High Student Load</div>
                      <div className="text-sm text-blue-600">Recommend full assistant team for {students.length} students</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}