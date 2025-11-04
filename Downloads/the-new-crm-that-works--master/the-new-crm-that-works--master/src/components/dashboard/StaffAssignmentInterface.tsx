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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  Target,
  MapPin,
  School,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react'

interface Staff {
  id: string
  full_name: string
  email: string
  phone?: string
  role: 'lead_coach' | 'assistant_coach' | 'area_manager' | 'principal'
  status: 'active' | 'inactive'
  current_assignment?: {
    type: 'team' | 'area' | 'school'
    id: string
    name: string
    area?: string
  }
  skills?: string[]
  availability: 'available' | 'partial' | 'full'
  performance_score?: number
}

interface Team {
  id: string
  team_name: string
  area: string
  status: string
  lead_coach_id?: string
  lead_coach?: string
  assistant_1_id?: string
  assistant_1?: string
  assistant_2_id?: string
  assistant_2?: string
  target_students: number
  current_students: number
  schools_managed: number
}

interface School {
  id: string
  school_name: string
  area: string
  principal_name?: string
  contact_phone?: string
  assigned_team?: string
  student_count: number
}

interface Area {
  id: string
  area_name: string
  region: string
  manager_id?: string
  manager_name?: string
  team_count: number
  school_count: number
}

interface StaffAssignmentInterfaceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssignmentUpdate?: () => void
}

export default function StaffAssignmentInterface({ open, onOpenChange, onAssignmentUpdate }: StaffAssignmentInterfaceProps) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [draggedStaff, setDraggedStaff] = useState<Staff | null>(null)

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch data with graceful error handling for missing tables
      let staffData = []
      let teamsData = []
      let schoolsData = []
      let areasData = []

      // Fetch staff data with fallback
      try {
        const staffResponse = await supabase.from('staff').select('*').order('full_name')
        if (!staffResponse.error && staffResponse.data) {
          staffData = staffResponse.data
        } else {
          console.warn('Staff table error or empty:', staffResponse.error)
        }
      } catch (staffError) {
        console.warn('Staff table not accessible, using mock data')
        // Create mock staff data
        staffData = [
          { id: '1', full_name: 'John Coach', role: 'Lead Coach', specialization: 'Advanced Training', experience_years: 5, status: 'active' },
          { id: '2', full_name: 'Sarah Assistant', role: 'Assistant Coach', specialization: 'Beginner Training', experience_years: 2, status: 'active' },
          { id: '3', full_name: 'Mike Trainer', role: 'Lead Coach', specialization: 'Competition Prep', experience_years: 8, status: 'active' },
        ]
      }

      // Fetch teams data with fallback
      try {
        const teamsResponse = await supabase.from('teams').select('*').order('team_name')
        if (!teamsResponse.error && teamsResponse.data) {
          teamsData = teamsResponse.data
        } else {
          console.warn('Teams table error or empty:', teamsResponse.error)
        }
      } catch (teamsError) {
        console.warn('Teams table not accessible')
        teamsData = []
      }

      // Fetch schools data with fallback
      try {
        const schoolsResponse = await supabase.from('schools').select('*').order('school_name')
        if (!schoolsResponse.error && schoolsResponse.data) {
          schoolsData = schoolsResponse.data
        } else {
          console.warn('Schools table error or empty:', schoolsResponse.error)
        }
      } catch (schoolsError) {
        console.warn('Schools table not accessible')
        schoolsData = []
      }

      // Create areas from teams if areas table doesn't exist
      try {
        const areasResponse = await supabase.from('areas').select('*').order('area_name')
        if (!areasResponse.error && areasResponse.data) {
          areasData = areasResponse.data
        } else {
          throw new Error('Areas table not found or empty')
        }
      } catch (areasError) {
        console.warn('Areas table not accessible, creating from teams data')
        // Create mock areas from teams
        const uniqueAreas = [...new Set(teamsData.map(t => t.area).filter(Boolean))]
        if (uniqueAreas.length > 0) {
          areasData = uniqueAreas.map((areaName, index) => ({
            id: `area-${index}`,
            area_name: areaName,
            region: `${areaName} Region`,
            manager_id: null,
            manager_name: null,
            team_count: teamsData.filter(t => t.area === areaName).length,
            school_count: schoolsData.filter(s => s.area === areaName).length
          }))
        } else {
          // Default areas if no teams exist
          areasData = [
            { id: 'area-1', area_name: 'Central', region: 'Central Region', manager_id: null, manager_name: null, team_count: 0, school_count: 0 },
            { id: 'area-2', area_name: 'North', region: 'North Region', manager_id: null, manager_name: null, team_count: 0, school_count: 0 },
            { id: 'area-3', area_name: 'South', region: 'South Region', manager_id: null, manager_name: null, team_count: 0, school_count: 0 }
          ]
        }
      }

      const enrichedStaff = await enrichStaffData(staffData)
      setStaff(enrichedStaff)
      setTeams(teamsData)
      setSchools(schoolsData)
      setAreas(areasData)

    } catch (error) {
      console.error('Error fetching staff assignment data:', error?.message || error)
      // Set fallback data to prevent app crash
      setStaff([])
      setTeams([])
      setSchools([])
      setAreas([
        { id: 'area-1', area_name: 'Central', region: 'Central Region', manager_id: null, manager_name: null, team_count: 0, school_count: 0 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const enrichStaffData = async (staffList: any[]): Promise<Staff[]> => {
    return staffList.map(member => {
      // Mock data for current assignment and performance
      const assignment = getCurrentAssignment(member)
      const availability = getAvailabilityStatus(member)
      const performanceScore = Math.floor(Math.random() * 30) + 70 // Mock 70-100 score

      return {
        ...member,
        current_assignment: assignment,
        availability,
        performance_score: performanceScore,
        skills: getSkillsForRole(member.role)
      }
    })
  }

  const getCurrentAssignment = (member: any) => {
    // Check if assigned as lead coach
    const leadTeam = teams.find(t => t.lead_coach_id === member.id)
    if (leadTeam) {
      return {
        type: 'team' as const,
        id: leadTeam.id,
        name: leadTeam.team_name,
        area: leadTeam.area
      }
    }

    // Check if assigned as assistant
    const assistantTeam = teams.find(t =>
      t.assistant_1_id === member.id || t.assistant_2_id === member.id
    )
    if (assistantTeam) {
      return {
        type: 'team' as const,
        id: assistantTeam.id,
        name: `${assistantTeam.team_name} (Assistant)`,
        area: assistantTeam.area
      }
    }

    // Check if assigned as area manager
    const managedArea = areas.find(a => a.manager_id === member.id)
    if (managedArea) {
      return {
        type: 'area' as const,
        id: managedArea.id,
        name: managedArea.area_name,
        area: managedArea.region
      }
    }

    return undefined
  }

  const getAvailabilityStatus = (member: any) => {
    const hasAssignment = getCurrentAssignment(member)
    if (!hasAssignment) return 'available'

    // Mock availability based on workload
    const workload = Math.random()
    if (workload < 0.7) return 'partial'
    return 'full'
  }

  const getSkillsForRole = (role: string): string[] => {
    const skillSets = {
      lead_coach: ['Team Leadership', 'Student Management', 'Performance Tracking'],
      assistant_coach: ['Student Support', 'Class Management', 'Administrative Tasks'],
      area_manager: ['Regional Oversight', 'Team Coordination', 'Strategic Planning'],
      principal: ['School Administration', 'Student Affairs', 'Educational Management']
    }
    return skillSets[role as keyof typeof skillSets] || []
  }

  const handleDragStart = (staff: Staff) => {
    setDraggedStaff(staff)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnTeam = async (e: React.DragEvent, team: Team, position: 'lead' | 'assistant1' | 'assistant2') => {
    e.preventDefault()
    if (!draggedStaff) return

    // Validate role compatibility
    if (position === 'lead' && draggedStaff.role !== 'lead_coach') {
      alert('Only Lead Coaches can be assigned as team leads')
      return
    }

    if (position !== 'lead' && draggedStaff.role !== 'assistant_coach') {
      alert('Only Assistant Coaches can be assigned as assistants')
      return
    }

    try {
      const updateData: any = {}

      if (position === 'lead') {
        updateData.lead_coach_id = draggedStaff.id
        updateData.lead_coach = draggedStaff.full_name
      } else if (position === 'assistant1') {
        updateData.assistant_1_id = draggedStaff.id
        updateData.assistant_1 = draggedStaff.full_name
      } else if (position === 'assistant2') {
        updateData.assistant_2_id = draggedStaff.id
        updateData.assistant_2 = draggedStaff.full_name
      }

      const { error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', team.id)

      if (error) throw error

      await fetchData()
      onAssignmentUpdate?.()
      setDraggedStaff(null)

    } catch (error) {
      console.error('Error assigning staff:', error)
      alert('Failed to assign staff member')
    }
  }

  const handleDropOnArea = async (e: React.DragEvent, area: Area) => {
    e.preventDefault()
    if (!draggedStaff) return

    if (draggedStaff.role !== 'area_manager' && draggedStaff.role !== 'lead_coach') {
      alert('Only Area Managers or Lead Coaches can be assigned to areas')
      return
    }

    try {
      const { error } = await supabase
        .from('areas')
        .update({
          manager_id: draggedStaff.id,
          manager_name: draggedStaff.full_name
        })
        .eq('id', area.id)

      if (error) throw error

      await fetchData()
      onAssignmentUpdate?.()
      setDraggedStaff(null)

    } catch (error) {
      console.error('Error assigning area manager:', error)
      alert('Failed to assign area manager')
    }
  }

  const removeAssignment = async (staffId: string, assignmentType: 'team' | 'area') => {
    try {
      if (assignmentType === 'team') {
        // Find and clear team assignments
        const team = teams.find(t =>
          t.lead_coach_id === staffId ||
          t.assistant_1_id === staffId ||
          t.assistant_2_id === staffId
        )

        if (team) {
          const updateData: any = {}
          if (team.lead_coach_id === staffId) {
            updateData.lead_coach_id = null
            updateData.lead_coach = null
          }
          if (team.assistant_1_id === staffId) {
            updateData.assistant_1_id = null
            updateData.assistant_1 = null
          }
          if (team.assistant_2_id === staffId) {
            updateData.assistant_2_id = null
            updateData.assistant_2 = null
          }

          const { error } = await supabase
            .from('teams')
            .update(updateData)
            .eq('id', team.id)

          if (error) throw error
        }
      } else if (assignmentType === 'area') {
        const area = areas.find(a => a.manager_id === staffId)
        if (area) {
          const { error } = await supabase
            .from('areas')
            .update({
              manager_id: null,
              manager_name: null
            })
            .eq('id', area.id)

          if (error) throw error
        }
      }

      await fetchData()
      onAssignmentUpdate?.()

    } catch (error) {
      console.error('Error removing assignment:', error)
      alert('Failed to remove assignment')
    }
  }

  const getAvailabilityBadge = (availability: string) => {
    const styles = {
      available: 'bg-green-100 text-green-700 border-green-200',
      partial: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      full: 'bg-red-100 text-red-700 border-red-200'
    }
    return styles[availability as keyof typeof styles] || styles.available
  }

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700'
    if (score >= 75) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  const filteredStaff = staff.filter(member => {
    const roleMatch = selectedRole === 'all' || member.role === selectedRole
    const areaMatch = selectedArea === 'all' || member.current_assignment?.area === selectedArea
    return roleMatch && areaMatch
  })

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Loading Staff Assignment Interface</DialogTitle>
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
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Assignment Interface
          </DialogTitle>
          <DialogDescription>
            Drag and drop staff members to assign them to teams, areas, and schools. View performance metrics and manage workloads.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="lead_coach">Lead Coaches</SelectItem>
              <SelectItem value="assistant_coach">Assistant Coaches</SelectItem>
              <SelectItem value="area_manager">Area Managers</SelectItem>
              <SelectItem value="principal">Principals</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {areas.map(area => (
                <SelectItem key={area.id} value={area.area_name}>
                  {area.area_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={fetchData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Staff Overview</TabsTrigger>
            <TabsTrigger value="teams">Team Assignments</TabsTrigger>
            <TabsTrigger value="areas">Area Assignments</TabsTrigger>
            <TabsTrigger value="performance">Performance View</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Staff Members ({filteredStaff.length})</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((member) => (
                <Card
                  key={member.id}
                  className="p-4 cursor-move hover:shadow-lg transition-shadow"
                  draggable
                  onDragStart={() => handleDragStart(member)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{member.full_name}</h4>
                        <Badge className={getAvailabilityBadge(member.availability)}>
                          {member.availability}
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        <div className="capitalize">{member.role.replace('_', ' ')}</div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {member.phone}
                          </div>
                        )}
                      </div>

                      {member.current_assignment && (
                        <div className="mb-2 p-2 bg-blue-50 rounded text-sm">
                          <div className="flex items-center gap-2">
                            {member.current_assignment.type === 'team' && <Users className="h-3 w-3" />}
                            {member.current_assignment.type === 'area' && <MapPin className="h-3 w-3" />}
                            {member.current_assignment.type === 'school' && <School className="h-3 w-3" />}
                            <span className="font-medium">{member.current_assignment.name}</span>
                          </div>
                          <div className="text-gray-600">{member.current_assignment.area}</div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeAssignment(member.id, member.current_assignment!.type)}
                            className="mt-1 h-6 text-xs"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      )}

                      {member.performance_score && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Performance:</span>
                          <Badge className={getPerformanceBadge(member.performance_score)}>
                            {member.performance_score}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <h3 className="text-lg font-semibold">Team Assignment Slots</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <Card key={team.id} className="p-4">
                  <div className="mb-3">
                    <h4 className="font-semibold text-lg">{team.team_name}</h4>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {team.area}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Lead Coach Slot */}
                    <div
                      className={`p-3 border-2 border-dashed rounded ${
                        team.lead_coach
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnTeam(e, team, 'lead')}
                    >
                      <div className="text-sm font-medium mb-1">Lead Coach</div>
                      {team.lead_coach ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{team.lead_coach}</span>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Drop lead coach here</div>
                      )}
                    </div>

                    {/* Assistant 1 Slot */}
                    <div
                      className={`p-3 border-2 border-dashed rounded ${
                        team.assistant_1
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnTeam(e, team, 'assistant1')}
                    >
                      <div className="text-sm font-medium mb-1">Assistant Coach 1</div>
                      {team.assistant_1 ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{team.assistant_1}</span>
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Drop assistant here</div>
                      )}
                    </div>

                    {/* Assistant 2 Slot */}
                    <div
                      className={`p-3 border-2 border-dashed rounded ${
                        team.assistant_2
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnTeam(e, team, 'assistant2')}
                    >
                      <div className="text-sm font-medium mb-1">Assistant Coach 2</div>
                      {team.assistant_2 ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{team.assistant_2}</span>
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Drop assistant here</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                    <div>Students: {team.current_students}/{team.target_students}</div>
                    <div>Schools: {team.schools_managed}</div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="areas" className="space-y-4">
            <h3 className="text-lg font-semibold">Area Management Assignments</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map((area) => (
                <Card key={area.id} className="p-4">
                  <div className="mb-3">
                    <h4 className="font-semibold text-lg">{area.area_name}</h4>
                    <div className="text-sm text-gray-600">{area.region}</div>
                  </div>

                  <div
                    className={`p-4 border-2 border-dashed rounded ${
                      area.manager_name
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnArea(e, area)}
                  >
                    <div className="text-sm font-medium mb-2">Area Manager</div>
                    {area.manager_name ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{area.manager_name}</span>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Drop manager here</div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                    <div>Teams: {area.team_count}</div>
                    <div>Schools: {area.school_count}</div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <h3 className="text-lg font-semibold">Staff Performance Dashboard</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Top Performers</span>
                </div>
                {filteredStaff
                  .filter(s => s.performance_score)
                  .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
                  .slice(0, 5)
                  .map((staff) => (
                    <div key={staff.id} className="flex justify-between items-center py-1">
                      <span className="text-sm truncate">{staff.full_name}</span>
                      <Badge className={getPerformanceBadge(staff.performance_score!)}>
                        {staff.performance_score}%
                      </Badge>
                    </div>
                  ))}
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Available Staff</span>
                </div>
                {filteredStaff
                  .filter(s => s.availability === 'available')
                  .slice(0, 5)
                  .map((staff) => (
                    <div key={staff.id} className="flex justify-between items-center py-1">
                      <span className="text-sm truncate">{staff.full_name}</span>
                      <span className="text-xs text-gray-600 capitalize">
                        {staff.role.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold">Needs Attention</span>
                </div>
                {filteredStaff
                  .filter(s =>
                    s.availability === 'full' ||
                    (s.performance_score && s.performance_score < 75)
                  )
                  .slice(0, 5)
                  .map((staff) => (
                    <div key={staff.id} className="flex justify-between items-center py-1">
                      <span className="text-sm truncate">{staff.full_name}</span>
                      <div className="flex gap-1">
                        {staff.availability === 'full' && (
                          <Badge variant="outline" className="text-xs">
                            Overloaded
                          </Badge>
                        )}
                        {staff.performance_score && staff.performance_score < 75 && (
                          <Badge variant="destructive" className="text-xs">
                            Low Performance
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}