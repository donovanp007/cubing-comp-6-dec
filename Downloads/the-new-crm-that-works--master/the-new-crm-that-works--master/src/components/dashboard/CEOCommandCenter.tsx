'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchCeoDashboard, fetchTeamPerformance } from '@/lib/db/kpis'
import { KPIStat } from './KPIStat'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TeamManagementModal from './TeamManagementModal'
import AreaManagementPanel from './AreaManagementPanel'
import StaffAssignmentInterface from './StaffAssignmentInterface'
import CEOFinancialDashboard from './CEOFinancialDashboard'
import SchoolManagementInterface from './SchoolManagementInterface'
import {
  Users,
  Settings,
  Edit,
  Eye,
  Plus,
  TrendingUp,
  Target,
  School,
  DollarSign,
  BarChart3,
  MapPin,
  UserCheck,
  Calculator,
  PieChart,
  Building,
  Crown
} from 'lucide-react'

interface CEODashboard {
  total_revenue: number
  revenue_growth: number
  active_teams: number
  team_growth: number
  total_students: number
  student_growth: number
  avg_performance: number
  performance_trend: number
  revenue_target: number
  active_schools: number
}

interface TeamData {
  id: string
  name: string
  area: string
  target_achievement_pct: number
  student_count: number
  revenue: number
  revenue_target: number
}

export default function CEOCommandCenter() {
  const router = useRouter()
  const [ceo, setCeo] = useState<CEODashboard | null>(null)
  const [teams, setTeams] = useState<TeamData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamManagementOpen, setTeamManagementOpen] = useState(false)
  const [areaManagementOpen, setAreaManagementOpen] = useState(false)
  const [staffAssignmentOpen, setStaffAssignmentOpen] = useState(false)
  const [schoolManagementOpen, setSchoolManagementOpen] = useState(false)
  const [financialDashboardOpen, setFinancialDashboardOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [ceoData, teamsData] = await Promise.all([
        fetchCeoDashboard(),
        fetchTeamPerformance()
      ])
      // Provide defaults for CEO data if not available
      const defaultCeoData: CEODashboard = {
        total_revenue: 0,
        revenue_growth: 0,
        active_teams: 0,
        team_growth: 0,
        total_students: 0,
        student_growth: 0,
        avg_performance: 0,
        performance_trend: 0,
        revenue_target: 0,
        active_schools: 0
      }
      setCeo(ceoData || defaultCeoData)
      setTeams(teamsData || [])
    } catch (e: any) {
      console.error('Dashboard fetch error:', e)
      setError(e.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleTeamsUpdate = () => {
    fetchDashboardData()
  }

  const handleViewTeam = (team: TeamData) => {
    router.push(`/teams/${team.id}`)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={fetchDashboardData} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  if (!ceo) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No dashboard data available</p>
        <Button onClick={fetchDashboardData} variant="outline" className="mt-2">
          Load Data
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-full overflow-x-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">CEO Command Center</h1>
        <p className="text-gray-600">Complete organizational oversight and control</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="schools" className="flex items-center gap-2">
            <School className="h-4 w-4" />
            Schools
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financials
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Operations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPIStat
              label="Total Revenue"
              value={`$${(ceo.total_revenue || 0).toLocaleString()}`}
              hint={ceo.revenue_growth ? `${ceo.revenue_growth > 0 ? '+' : ''}${ceo.revenue_growth}%` : undefined}
            />
            <KPIStat
              label="Active Teams"
              value={String(ceo.active_teams || 0)}
              hint={ceo.team_growth ? `${ceo.team_growth > 0 ? '+' : ''}${ceo.team_growth}%` : undefined}
            />
            <KPIStat
              label="Student Enrollment"
              value={String(ceo.total_students || 0)}
              hint={ceo.student_growth ? `${ceo.student_growth > 0 ? '+' : ''}${ceo.student_growth}%` : undefined}
            />
            <KPIStat
              label="Performance Score"
              value={`${ceo.avg_performance || 0}%`}
              hint={ceo.performance_trend ? `${ceo.performance_trend > 0 ? '+' : ''}${ceo.performance_trend}%` : undefined}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Financial Health
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenue Target</span>
                  <span className="font-semibold text-green-600">
                    ${(ceo.revenue_target || 0).toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={((ceo.total_revenue || 0) / (ceo.revenue_target || 1)) * 100}
                  className="h-2"
                />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Current: ${(ceo.total_revenue || 0).toLocaleString()}</span>
                  <span className="text-gray-500">
                    {Math.round(((ceo.total_revenue || 0) / (ceo.revenue_target || 1)) * 100)}% achieved
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Regional Distribution
              </h3>
              <div className="space-y-3">
                {Array.from(new Set(teams.map(t => t.area))).map((area: string) => {
                  const areaTeams = teams.filter(t => t.area === area)
                  const areaRevenue = areaTeams.reduce((sum, t) => sum + (t.revenue || 0), 0)
                  return (
                    <div key={`area-${area}`} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">{area}</span>
                      <div className="text-right">
                        <div className="font-semibold">${areaRevenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{areaTeams.length} teams</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Teams
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams
                .sort((a, b) => (b.target_achievement_pct || 0) - (a.target_achievement_pct || 0))
                .slice(0, 6)
                .map((team) => (
                  <div key={`top-team-${team.id}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{team.name}</h4>
                      <Badge variant={team.target_achievement_pct >= 100 ? "default" : "secondary"}>
                        {team.target_achievement_pct || 0}%
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {team.area} • {team.student_count || 0} students
                    </div>
                    <Progress value={team.target_achievement_pct || 0} className="h-2 mb-3" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Revenue: ${(team.revenue || 0).toLocaleString()}</span>
                      <Button
                        onClick={() => handleViewTeam(team)}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-dashed border-2"
              onClick={() => setTeamManagementOpen(true)}
            >
              <div className="text-center">
                <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <div className="font-semibold text-gray-600">Add New Team</div>
                <div className="text-sm text-gray-500">Create and manage teams</div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">All Teams</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setStaffAssignmentOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  Staff Assignment
                </Button>
                <Button
                  onClick={() => setAreaManagementOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Area Management
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Card key={`team-card-${team.id}`} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{team.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{team.area}</p>
                    </div>
                    <Badge variant={team.target_achievement_pct >= 100 ? "default" : "secondary"}>
                      {team.target_achievement_pct || 0}%
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{team.student_count || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">${(team.revenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-medium">${(team.revenue_target || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <Progress value={team.target_achievement_pct || 0} className="h-2 mb-4" />

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewTeam(team)}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedTeam(team)
                        setTeamManagementOpen(true)
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="schools" className="space-y-6">
          <SchoolManagementInterface />
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <CEOFinancialDashboard open={financialDashboardOpen} onOpenChange={setFinancialDashboardOpen} />
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Executive Control Center
            </h3>
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Ultimate command interface with real-time alerts, strategic analytics, and comprehensive organizational oversight.
              </p>
              <Button
                onClick={() => router.push('/executive-control')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2"
                size="lg"
              >
                <Crown className="h-5 w-5" />
                Launch Executive Control Center
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <School className="h-5 w-5" />
                School Operations
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded p-4">
                  <div className="text-sm font-medium text-gray-700">Active Schools</div>
                  <div className="text-2xl font-bold">{ceo.active_schools || 0}</div>
                </div>
                <Button
                  onClick={() => setSchoolManagementOpen(true)}
                  className="w-full gap-2"
                >
                  <Building className="h-4 w-4" />
                  Manage All Schools
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Management
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded p-4">
                  <div className="text-sm font-medium text-gray-700">Total Students</div>
                  <div className="text-2xl font-bold">{ceo.total_students || 0}</div>
                </div>
                <Button
                  onClick={() => router.push('/students')}
                  className="w-full gap-2"
                >
                  <Users className="h-4 w-4" />
                  View All Students
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <TeamManagementModal
        open={teamManagementOpen}
        onOpenChange={setTeamManagementOpen}
        onTeamsUpdate={handleTeamsUpdate}
      />

      <AreaManagementPanel
        open={areaManagementOpen}
        onOpenChange={setAreaManagementOpen}
        onAreasUpdate={fetchDashboardData}
      />

      <StaffAssignmentInterface
        open={staffAssignmentOpen}
        onOpenChange={setStaffAssignmentOpen}
        onAssignmentUpdate={fetchDashboardData}
      />

      {schoolManagementOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">School Management</h2>
              <Button onClick={() => setSchoolManagementOpen(false)} variant="outline">
                Close
              </Button>
            </div>
            <div className="p-4">
              <SchoolManagementInterface />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}