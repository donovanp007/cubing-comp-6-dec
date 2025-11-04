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
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  School,
  Users,
  Target,
  DollarSign,
  TrendingUp,
  Building,
  UserCheck,
  Calendar,
  AlertTriangle,
  Settings
} from 'lucide-react'

interface Area {
  id: string
  area_name: string
  region: string
  status: 'active' | 'inactive' | 'planning'
  manager_id?: string
  manager_name?: string
  team_count: number
  school_count: number
  student_count: number
  revenue_target: number
  revenue_actual: number
  target_achievement_pct: number
  created_at: string
  updated_at: string
}

interface AreaDetail {
  id: string
  area_name: string
  region: string
  status: string
  manager_name?: string
  teams: {
    team_id: string
    team_name: string
    lead_coach: string
    current_students: number
    target_students: number
    schools_managed: number
    monthly_revenue: number
  }[]
  schools: {
    school_id: string
    school_name: string
    principal_name?: string
    contact_phone?: string
    student_count: number
    term_fee: number
  }[]
  performance_metrics: {
    total_students: number
    total_schools: number
    average_class_size: number
    retention_rate: number
    revenue_per_student: number
  }
}

interface Staff {
  id: string
  full_name: string
  role: string
  email: string
  status: 'active' | 'inactive'
}

interface AreaManagementPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAreasUpdate?: () => void
}

export default function AreaManagementPanel({ open, onOpenChange, onAreasUpdate }: AreaManagementPanelProps) {
  const [areas, setAreas] = useState<Area[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedArea, setSelectedArea] = useState<AreaDetail | null>(null)
  const [editingArea, setEditingArea] = useState<Area | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    area_name: '',
    region: '',
    status: 'active' as const,
    manager_id: '',
    revenue_target: 50000
  })

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [areasResponse, staffResponse] = await Promise.all([
        supabase
          .from('area_performance')
          .select('*')
          .order('target_achievement_pct', { ascending: false }),
        supabase
          .from('staff')
          .select('*')
          .eq('status', 'active')
          .order('full_name')
      ])

      if (areasResponse.error) throw areasResponse.error
      if (staffResponse.error) throw staffResponse.error

      setAreas(areasResponse.data || [])
      setStaff(staffResponse.data || [])
    } catch (error) {
      console.error('Error fetching area data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAreaDetails = async (area: Area) => {
    try {
      const [teamsResponse, schoolsResponse] = await Promise.all([
        supabase
          .from('team_performance')
          .select('*')
          .eq('area', area.area_name),
        supabase
          .from('schools')
          .select(`
            id,
            school_name,
            principal_name,
            contact_phone,
            term_fee_per_student,
            students!school_id(count)
          `)
          .eq('area', area.area_name)
      ])

      if (teamsResponse.error) throw teamsResponse.error
      if (schoolsResponse.error) throw schoolsResponse.error

      const teams = teamsResponse.data?.map(t => ({
        team_id: t.team_id,
        team_name: t.team_name,
        lead_coach: t.lead_coach || 'Unassigned',
        current_students: t.current_students || 0,
        target_students: t.target_students || 0,
        schools_managed: t.schools_managed || 0,
        monthly_revenue: t.monthly_revenue_actual || 0
      })) || []

      const schools = schoolsResponse.data?.map(s => ({
        school_id: s.id,
        school_name: s.school_name,
        principal_name: s.principal_name,
        contact_phone: s.contact_phone,
        student_count: s.students?.[0]?.count || 0,
        term_fee: s.term_fee_per_student || 0
      })) || []

      const totalStudents = schools.reduce((sum, s) => sum + s.student_count, 0)
      const totalSchools = schools.length
      const averageClassSize = totalSchools > 0 ? totalStudents / totalSchools : 0
      const totalRevenue = schools.reduce((sum, s) => sum + (s.student_count * s.term_fee), 0)
      const revenuePerStudent = totalStudents > 0 ? totalRevenue / totalStudents : 0

      setSelectedArea({
        id: area.id,
        area_name: area.area_name,
        region: area.region,
        status: area.status,
        manager_name: area.manager_name,
        teams,
        schools,
        performance_metrics: {
          total_students: totalStudents,
          total_schools: totalSchools,
          average_class_size: Number(averageClassSize.toFixed(1)),
          retention_rate: 85, // Mock data - would come from retention analysis
          revenue_per_student: Number(revenuePerStudent.toFixed(0))
        }
      })
      setActiveTab('details')
    } catch (error) {
      console.error('Error fetching area details:', error)
    }
  }

  const handleCreateArea = () => {
    setIsCreating(true)
    setEditingArea(null)
    setFormData({
      area_name: '',
      region: '',
      status: 'active',
      manager_id: '',
      revenue_target: 50000
    })
    setActiveTab('edit')
  }

  const handleEditArea = (area: Area) => {
    setIsCreating(false)
    setEditingArea(area)
    setFormData({
      area_name: area.area_name,
      region: area.region,
      status: area.status,
      manager_id: area.manager_id || '',
      revenue_target: area.revenue_target
    })
    setActiveTab('edit')
  }

  const handleSaveArea = async () => {
    try {
      const manager = staff.find(s => s.id === formData.manager_id)

      const areaData = {
        area_name: formData.area_name,
        region: formData.region,
        status: formData.status,
        manager_id: formData.manager_id || null,
        manager_name: manager?.full_name || null,
        revenue_target: formData.revenue_target,
        updated_at: new Date().toISOString()
      }

      if (isCreating) {
        const { error } = await supabase.from('areas').insert([areaData])
        if (error) throw error
      } else if (editingArea) {
        const { error } = await supabase.from('areas').update(areaData).eq('id', editingArea.id)
        if (error) throw error
      }

      await fetchData()
      handleCancelEdit()
      onAreasUpdate?.()
    } catch (error) {
      console.error('Error saving area:', error)
      alert('Failed to save area. Please try again.')
    }
  }

  const handleDeleteArea = async (area: Area) => {
    if (!confirm(`Are you sure you want to delete area "${area.area_name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase.from('areas').delete().eq('id', area.id)
      if (error) throw error

      await fetchData()
      onAreasUpdate?.()
    } catch (error) {
      console.error('Error deleting area:', error)
      alert('Failed to delete area. Please try again.')
    }
  }

  const handleCancelEdit = () => {
    setIsCreating(false)
    setEditingArea(null)
    setFormData({
      area_name: '',
      region: '',
      status: 'active',
      manager_id: '',
      revenue_target: 50000
    })
    setActiveTab('overview')
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700 border-green-200',
      inactive: 'bg-gray-100 text-gray-700 border-gray-200',
      planning: 'bg-blue-100 text-blue-700 border-blue-200'
    }
    return styles[status as keyof typeof styles] || styles.active
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Loading Area Management Panel</DialogTitle>
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
            <MapPin className="h-5 w-5" />
            Area & Region Management Center
          </DialogTitle>
          <DialogDescription>
            Manage geographical areas, assign teams, track performance, and oversee regional operations.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Areas Overview</TabsTrigger>
            <TabsTrigger value="details">Area Details</TabsTrigger>
            <TabsTrigger value="edit">Create/Edit Area</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Regional Areas ({areas.length})</h3>
              <Button onClick={handleCreateArea} className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Area
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map((area) => (
                <Card key={area.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{area.area_name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="h-3 w-3" />
                        {area.region}
                      </div>
                    </div>
                    <Badge className={getStatusBadge(area.status)}>
                      {area.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Performance</span>
                      <span className={`font-bold ${getPerformanceColor(area.target_achievement_pct)}`}>
                        {area.target_achievement_pct || 0}%
                      </span>
                    </div>
                    <Progress value={area.target_achievement_pct || 0} className="h-2" />

                    <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Teams:</span>
                        <span className="font-medium">{area.team_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <School className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Schools:</span>
                        <span className="font-medium">{area.school_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Students:</span>
                        <span className="font-medium">{area.student_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium">R{Number(area.revenue_actual || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {area.manager_name && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-xs">
                          <UserCheck className="h-3 w-3 text-gray-500" />
                          <span className="text-gray-600">Manager:</span>
                          <span className="font-medium text-gray-700">{area.manager_name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fetchAreaDetails(area)}
                      className="flex-1 gap-1"
                    >
                      <Settings className="h-3 w-3" />
                      Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditArea(area)}
                      className="flex-1 gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteArea(area)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}

              {/* Add New Area Card */}
              <Card
                className="p-4 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-center min-h-[200px]"
                onClick={handleCreateArea}
              >
                <div className="text-center">
                  <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="font-semibold text-gray-600">Create New Area</div>
                  <div className="text-sm text-gray-500">Add geographical region</div>
                </div>
              </Card>
            </div>

            {areas.length === 0 && (
              <Card className="p-8 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Areas Defined</h3>
                <p className="text-gray-600 mb-4">Start by creating your first geographical area</p>
                <Button onClick={handleCreateArea} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Area
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {selectedArea ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedArea.area_name}</h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {selectedArea.region}
                      {selectedArea.manager_name && (
                        <span className="ml-4 flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Managed by {selectedArea.manager_name}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setActiveTab('overview')}>
                    <X className="h-4 w-4 mr-2" />
                    Back to Overview
                  </Button>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card className="p-4">
                    <div className="text-sm text-gray-600">Total Students</div>
                    <div className="text-2xl font-bold">{selectedArea.performance_metrics.total_students}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-gray-600">Active Schools</div>
                    <div className="text-2xl font-bold">{selectedArea.performance_metrics.total_schools}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-gray-600">Avg Class Size</div>
                    <div className="text-2xl font-bold">{selectedArea.performance_metrics.average_class_size}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-gray-600">Retention Rate</div>
                    <div className="text-2xl font-bold text-green-600">{selectedArea.performance_metrics.retention_rate}%</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-gray-600">Revenue/Student</div>
                    <div className="text-2xl font-bold">R{selectedArea.performance_metrics.revenue_per_student}</div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Teams in Area */}
                  <Card className="p-4">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Teams ({selectedArea.teams.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedArea.teams.map((team) => (
                        <div key={team.team_id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{team.team_name}</div>
                            <div className="text-sm text-gray-600">Lead: {team.lead_coach}</div>
                          </div>
                          <div className="text-right text-sm">
                            <div>{team.current_students}/{team.target_students} students</div>
                            <div className="text-gray-600">R{team.monthly_revenue.toLocaleString()}/month</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Schools in Area */}
                  <Card className="p-4">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <School className="h-5 w-5" />
                      Schools ({selectedArea.schools.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedArea.schools.map((school) => (
                        <div key={school.school_id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{school.school_name}</div>
                            {school.principal_name && (
                              <div className="text-sm text-gray-600">Principal: {school.principal_name}</div>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            <div>{school.student_count} students</div>
                            <div className="text-gray-600">R{school.term_fee}/term</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Area</h3>
                <p className="text-gray-600">Choose an area from the overview to see detailed information</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="edit" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {isCreating ? 'Create New Area' : `Edit ${editingArea?.area_name}`}
              </h3>
              {(isCreating || editingArea) && (
                <Button variant="outline" onClick={handleCancelEdit} className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>

            {(isCreating || editingArea) ? (
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="area_name">Area Name *</Label>
                      <Input
                        id="area_name"
                        value={formData.area_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, area_name: e.target.value }))}
                        placeholder="e.g., Northern Region"
                      />
                    </div>

                    <div>
                      <Label htmlFor="region">Region *</Label>
                      <Input
                        id="region"
                        value={formData.region}
                        onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                        placeholder="e.g., Gauteng North"
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="planning">Planning Phase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="manager">Area Manager</Label>
                      <Select value={formData.manager_id} onValueChange={(value) => setFormData(prev => ({ ...prev, manager_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select area manager" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No assignment</SelectItem>
                          {staff.map(member => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.full_name} ({member.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="revenue_target">Revenue Target (R)</Label>
                      <Input
                        id="revenue_target"
                        type="number"
                        value={formData.revenue_target}
                        onChange={(e) => setFormData(prev => ({ ...prev, revenue_target: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveArea} disabled={!formData.area_name || !formData.region}>
                    <Save className="h-4 w-4 mr-2" />
                    {isCreating ? 'Create Area' : 'Save Changes'}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Area to Edit</h3>
                <p className="text-gray-600 mb-4">Choose an area from the overview tab or create a new one</p>
                <Button onClick={handleCreateArea} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Area
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Top Performing Areas</span>
                  </div>
                  <div className="space-y-2">
                    {areas
                      .sort((a, b) => (b.target_achievement_pct || 0) - (a.target_achievement_pct || 0))
                      .slice(0, 5)
                      .map((area) => (
                        <div key={area.id} className="flex justify-between items-center">
                          <span className="text-sm">{area.area_name}</span>
                          <span className={`font-bold text-sm ${getPerformanceColor(area.target_achievement_pct || 0)}`}>
                            {area.target_achievement_pct || 0}%
                          </span>
                        </div>
                      ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold">Areas Needing Attention</span>
                  </div>
                  <div className="space-y-2">
                    {areas
                      .filter(area => (area.target_achievement_pct || 0) < 70)
                      .slice(0, 5)
                      .map((area) => (
                        <div key={area.id} className="flex justify-between items-center">
                          <span className="text-sm">{area.area_name}</span>
                          <span className="font-bold text-sm text-red-600">
                            {area.target_achievement_pct || 0}%
                          </span>
                        </div>
                      ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Revenue Summary</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Target:</span>
                      <span className="font-medium">
                        R{areas.reduce((sum, a) => sum + a.revenue_target, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Actual:</span>
                      <span className="font-medium">
                        R{areas.reduce((sum, a) => sum + (a.revenue_actual || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Overall Achievement:</span>
                      <span className="font-bold">
                        {Math.round(
                          areas.reduce((sum, a) => sum + (a.revenue_actual || 0), 0) /
                          areas.reduce((sum, a) => sum + a.revenue_target, 0) * 100
                        )}%
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}