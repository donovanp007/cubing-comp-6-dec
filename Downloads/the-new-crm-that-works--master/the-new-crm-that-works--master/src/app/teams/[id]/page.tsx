'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  ArrowLeft,
  Edit,
  Settings
} from 'lucide-react'

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

interface Team {
  team_id: string
  team_name: string
  area: string
  status: string
  lead_coach?: string
  assistant_1?: string
  assistant_2?: string
  target_students: number
  current_students: number
  schools_managed: number
  target_achievement_pct: number
  monthly_revenue_actual: number
}

export default function TeamDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<Team | null>(null)
  const [students, setStudents] = useState<TeamStudent[]>([])
  const [schools, setSchools] = useState<TeamSchool[]>([])
  const [metrics, setMetrics] = useState<TeamPerformanceMetrics | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (teamId) {
      fetchTeamDetails()
    }
  }, [teamId])

  const fetchTeamDetails = async () => {
    if (!teamId) return

    setLoading(true)
    try {
      // Fetch team info
      const teamResponse = await supabase
        .from('team_performance')
        .select('*')
        .eq('team_id', teamId)
        .single()

      if (teamResponse.error) {
        console.error('Team not found:', teamResponse.error)
        return
      }

      const teamData = teamResponse.data

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
        .eq('team_id', teamId)

      // Fetch schools in the same area as this team
      const schoolsResponse = await supabase
        .from('schools')
        .select('*')
        .eq('area', teamData.area)

      // Process the data
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

      setTeam(teamData)
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading team details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Team Not Found</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8" />
              {team.team_name}
              <Badge variant={
                (team.target_achievement_pct || 0) >= 100 ? 'default' :
                (team.target_achievement_pct || 0) >= 80 ? 'secondary' :
                'destructive'
              } className="text-lg px-3 py-1">
                {team.target_achievement_pct || 0}% Target Achievement
              </Badge>
            </h1>
            <div className="flex items-center gap-6 mt-2 text-gray-600">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {team.area}
              </span>
              <span className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Lead: {team.lead_coach || 'Unassigned'}
              </span>
              <span className="flex items-center gap-2">
                <School className="h-4 w-4" />
                {schools.length} Schools
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {students.length} Students
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Team
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Manage
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Student Progress</div>
              <div className="text-2xl font-bold">
                {team.current_students || 0}/{team.target_students || 0}
              </div>
              <div className="text-xs text-gray-500">
                {Math.max(0, (team.target_students || 0) - (team.current_students || 0))} to target
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics?.total_revenue || 0)}
              </div>
              <div className="text-xs text-green-600">
                +{metrics?.revenue_growth || 0}% from last month
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Retention Rate</div>
              <div className="text-2xl font-bold">{metrics?.student_retention || 0}%</div>
              <div className="text-xs text-gray-500">Active students</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Attendance</div>
              <div className="text-2xl font-bold">{metrics?.attendance_rate || 0}%</div>
              <div className="text-xs text-gray-500">Average rate</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Visualization */}
      <Card className="p-8">
        <h2 className="text-2xl font-semibold mb-6">Team Progress Breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-lg mb-3">
                <span className="font-medium">Student Enrollment Progress</span>
                <span className="font-bold text-blue-600">
                  {Math.round(((team.current_students || 0) / (team.target_students || 1)) * 100)}%
                </span>
              </div>
              <Progress value={((team.current_students || 0) / (team.target_students || 1)) * 100} className="h-4" />
              <div className="text-sm text-gray-600 mt-1">
                {team.current_students} of {team.target_students} target students
              </div>
            </div>

            <div>
              <div className="flex justify-between text-lg mb-3">
                <span className="font-medium">Revenue Target Progress</span>
                <span className="font-bold text-green-600">{team.target_achievement_pct || 0}%</span>
              </div>
              <Progress value={team.target_achievement_pct || 0} className="h-4" />
              <div className="text-sm text-gray-600 mt-1">
                Current: {formatCurrency(team.monthly_revenue_actual || 0)}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-lg mb-3">
                <span className="font-medium">Student Retention</span>
                <span className="font-bold text-purple-600">{metrics?.student_retention || 0}%</span>
              </div>
              <Progress value={metrics?.student_retention || 0} className="h-4" />
              <div className="text-sm text-gray-600 mt-1">
                Active student retention rate
              </div>
            </div>

            <div>
              <div className="flex justify-between text-lg mb-3">
                <span className="font-medium">Payment Collection</span>
                <span className="font-bold text-orange-600">
                  {students.length > 0 ? Math.round(((students.length - (metrics?.pending_payments || 0)) / students.length) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={students.length > 0 ? ((students.length - (metrics?.pending_payments || 0)) / students.length) * 100 : 0}
                className="h-4"
              />
              <div className="text-sm text-gray-600 mt-1">
                {metrics?.pending_payments || 0} payments outstanding
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-lg py-3">Overview</TabsTrigger>
          <TabsTrigger value="students" className="text-lg py-3">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="schools" className="text-lg py-3">Schools ({schools.length})</TabsTrigger>
          <TabsTrigger value="staff" className="text-lg py-3">Team Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Recent Activity & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Recent Achievements
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="font-semibold text-lg">New Enrollments</div>
                  <div className="text-gray-600">{metrics?.recent_enrollments || 0} students in last 30 days</div>
                </div>
                <div>
                  <div className="font-semibold text-lg">Parent Satisfaction</div>
                  <div className="text-gray-600">{metrics?.parent_satisfaction || 0}% positive feedback</div>
                </div>
                <div>
                  <div className="font-semibold text-lg">Course Completion</div>
                  <div className="text-gray-600">{metrics?.completion_rate || 0}% completion rate</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Attention Required
              </h3>
              <div className="space-y-3">
                {!team.lead_coach && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="font-semibold text-red-700">No Lead Coach Assigned</div>
                    <div className="text-red-600">Team needs leadership</div>
                  </div>
                )}

                {(metrics?.pending_payments || 0) > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="font-semibold text-yellow-700">Pending Payments</div>
                    <div className="text-yellow-600">{metrics?.pending_payments} students outstanding</div>
                  </div>
                )}

                {(team.target_achievement_pct || 0) < 70 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="font-semibold text-red-700">Below Target</div>
                    <div className="text-red-600">Performance intervention needed</div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Performance Analytics */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Performance Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-lg mb-3">Financial Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Revenue:</span>
                    <span className="font-semibold text-lg">{formatCurrency(metrics?.total_revenue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth Rate:</span>
                    <span className="font-semibold text-lg text-green-600">+{metrics?.revenue_growth || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Payments:</span>
                    <span className="font-semibold text-lg text-red-600">{metrics?.pending_payments || 0}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3">Student Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retention Rate:</span>
                    <span className="font-semibold text-lg">{metrics?.student_retention || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attendance:</span>
                    <span className="font-semibold text-lg">{metrics?.attendance_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completion Rate:</span>
                    <span className="font-semibold text-lg">{metrics?.completion_rate || 0}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3">Satisfaction Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parent Satisfaction:</span>
                    <span className="font-semibold text-lg">{metrics?.parent_satisfaction || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recent Enrollments:</span>
                    <span className="font-semibold text-lg">{metrics?.recent_enrollments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target Achievement:</span>
                    <span className="font-semibold text-lg">{team.target_achievement_pct || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Team Students ({students.length})</h2>
            <Button className="gap-2">
              <Users className="h-4 w-4" />
              Add Student
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {students.map((student) => (
              <Card key={student.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-xl font-semibold">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-gray-600">
                        Grade {student.grade} • {student.school_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.class_type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-semibold text-lg">{student.attendance_rate}% Attendance</div>
                      <div className="text-gray-500">Last active: {formatDate(student.last_activity || '')}</div>
                    </div>

                    <div className="flex flex-col gap-2">
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
                  <div className="mt-4 pt-4 border-t text-gray-600">
                    <div className="flex items-center gap-6">
                      <span className="font-medium">Parent: {student.parent_name}</span>
                      {student.parent_phone && (
                        <span className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {student.parent_phone}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {students.length === 0 && (
              <Card className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Students Assigned</h3>
                <p className="text-gray-600">Students will appear here once assigned to this team</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schools" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Managed Schools ({schools.length})</h2>
            <Button className="gap-2">
              <School className="h-4 w-4" />
              Add School
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schools.map((school) => (
              <Card key={school.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{school.school_name}</h3>
                    <div className="text-gray-600">
                      {school.area}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {school.student_count} students
                  </Badge>
                </div>

                <div className="space-y-3">
                  {school.principal_name && (
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4 text-gray-500" />
                      <span>Principal: {school.principal_name}</span>
                    </div>
                  )}

                  {school.contact_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{school.contact_phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>Fee: {formatCurrency(school.term_fee_per_student)}/term</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Last visit: {formatDate(school.last_visit || '')}</span>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="text-lg font-semibold text-green-600">
                      Monthly Revenue: {formatCurrency(school.student_count * school.term_fee_per_student)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {schools.length === 0 && (
              <Card className="p-12 text-center col-span-2">
                <School className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Schools Assigned</h3>
                <p className="text-gray-600">Schools will appear here based on team area assignment</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6 mt-6">
          <h2 className="text-2xl font-semibold">Team Staff Assignment</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Lead Coach
              </h3>
              {team.lead_coach ? (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-xl font-semibold text-green-800">{team.lead_coach}</div>
                  <div className="text-green-600">Team Leader</div>
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-xl font-semibold text-red-800">Vacant Position</div>
                  <div className="text-red-600">Requires assignment</div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assistant Coach 1
              </h3>
              {team.assistant_1 ? (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-xl font-semibold text-blue-800">{team.assistant_1}</div>
                  <div className="text-blue-600">Assistant</div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xl font-semibold text-gray-800">Open Position</div>
                  <div className="text-gray-600">Available for assignment</div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assistant Coach 2
              </h3>
              {team.assistant_2 ? (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-xl font-semibold text-blue-800">{team.assistant_2}</div>
                  <div className="text-blue-600">Assistant</div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xl font-semibold text-gray-800">Open Position</div>
                  <div className="text-gray-600">Available for assignment</div>
                </div>
              )}
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Staffing Recommendations</h3>
            <div className="space-y-4">
              {!team.lead_coach && (
                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <div>
                    <div className="font-semibold text-red-800">Critical: No Lead Coach</div>
                    <div className="text-red-600">Team requires immediate leadership assignment</div>
                  </div>
                </div>
              )}

              {!team.assistant_1 && !team.assistant_2 && (
                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <div>
                    <div className="font-semibold text-yellow-800">No Assistant Coaches</div>
                    <div className="text-yellow-600">Consider assigning assistants for {students.length} students</div>
                  </div>
                </div>
              )}

              {students.length > 20 && (!team.assistant_1 || !team.assistant_2) && (
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-800">High Student Load</div>
                    <div className="text-blue-600">Recommend full assistant team for {students.length} students</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}