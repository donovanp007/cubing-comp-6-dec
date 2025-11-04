'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  Users,
  Award,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Trophy,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'team' | 'individual' | 'organizational';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'overdue';
  progress: number;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  end_date: string;
  assigned_to?: string;
  team_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  milestones?: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  target_date: string;
  completed: boolean;
  completed_date?: string;
  progress: number;
}

export default function GoalTrackingAnalytics() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [goalDetailsOpen, setGoalDetailsOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchData = async () => {
    try {
      // Generate mock data for goals
      const mockGoals: Goal[] = [
        {
          id: '1',
          title: 'Q1 Revenue Target',
          description: 'Achieve $100,000 in revenue for Q1 2024',
          type: 'organizational',
          priority: 'critical',
          status: 'active',
          progress: 75,
          target_value: 100000,
          current_value: 75000,
          unit: '$',
          start_date: '2024-01-01',
          end_date: '2024-03-31',
          created_by: 'CEO',
          created_at: '2024-01-01',
          updated_at: '2024-02-15',
          milestones: [
            {
              id: '1',
              title: 'Month 1 Target',
              description: 'Reach $25,000 in revenue',
              target_date: '2024-01-31',
              completed: true,
              completed_date: '2024-01-30',
              progress: 100
            },
            {
              id: '2',
              title: 'Month 2 Target',
              description: 'Reach $50,000 in revenue',
              target_date: '2024-02-29',
              completed: true,
              completed_date: '2024-02-28',
              progress: 100
            },
            {
              id: '3',
              title: 'Month 3 Target',
              description: 'Reach $75,000 in revenue',
              target_date: '2024-03-31',
              completed: false,
              progress: 80
            }
          ]
        },
        {
          id: '2',
          title: 'Team Alpha Performance',
          description: 'Increase team performance to 95%',
          type: 'team',
          priority: 'high',
          status: 'active',
          progress: 85,
          target_value: 95,
          current_value: 85,
          unit: '%',
          start_date: '2024-01-15',
          end_date: '2024-06-15',
          team_id: 'team-alpha',
          created_by: 'Team Manager',
          created_at: '2024-01-15',
          updated_at: '2024-02-20'
        },
        {
          id: '3',
          title: 'Student Completion Rate',
          description: 'Achieve 90% course completion rate',
          type: 'organizational',
          priority: 'high',
          status: 'active',
          progress: 60,
          target_value: 90,
          current_value: 60,
          unit: '%',
          start_date: '2024-02-01',
          end_date: '2024-12-31',
          created_by: 'Academic Director',
          created_at: '2024-02-01',
          updated_at: '2024-02-25'
        },
        {
          id: '4',
          title: 'New Student Enrollment',
          description: 'Enroll 500 new students this semester',
          type: 'organizational',
          priority: 'medium',
          status: 'active',
          progress: 45,
          target_value: 500,
          current_value: 225,
          unit: 'students',
          start_date: '2024-01-01',
          end_date: '2024-05-31',
          created_by: 'Enrollment Manager',
          created_at: '2024-01-01',
          updated_at: '2024-02-28'
        },
        {
          id: '5',
          title: 'Team Beta Certification',
          description: 'Complete advanced certification program',
          type: 'team',
          priority: 'medium',
          status: 'completed',
          progress: 100,
          target_value: 100,
          current_value: 100,
          unit: '%',
          start_date: '2023-10-01',
          end_date: '2024-01-31',
          team_id: 'team-beta',
          created_by: 'Training Manager',
          created_at: '2023-10-01',
          updated_at: '2024-01-31'
        }
      ];

      setGoals(mockGoals);
      setTeams([
        { id: 'team-alpha', name: 'Team Alpha', area: 'North' },
        { id: 'team-beta', name: 'Team Beta', area: 'South' },
        { id: 'team-gamma', name: 'Team Gamma', area: 'East' }
      ]);
      setStudents([
        { id: '1', name: 'John Doe', team_id: 'team-alpha' },
        { id: '2', name: 'Jane Smith', team_id: 'team-beta' }
      ]);
    } catch (error) {
      console.error('Error fetching goal data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredGoals = goals.filter(goal => {
    const typeMatch = filterType === 'all' || goal.type === filterType;
    const statusMatch = filterStatus === 'all' || goal.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const goalStats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    overdue: goals.filter(g => g.status === 'overdue').length,
    avgProgress: goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-full overflow-x-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Goal Tracking & Analytics</h1>
            <p className="text-gray-600">Monitor and track organizational, team, and individual goals</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setNewGoalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Goal Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{goalStats.total}</div>
                <div className="text-sm text-gray-600">Total Goals</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{goalStats.active}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Trophy className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{goalStats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{goalStats.overdue}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{goalStats.avgProgress}%</div>
                <div className="text-sm text-gray-600">Avg Progress</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Milestones
          </TabsTrigger>
        </TabsList>

        {/* Goals Overview Tab */}
        <TabsContent value="goals" className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Label>Filters:</Label>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="organizational">Organizational</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <Card key={goal.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-1 h-16 rounded ${getPriorityColor(goal.priority)}`} />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{goal.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize">
                          {goal.type}
                        </Badge>
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-semibold">{goal.progress}%</span>
                    </div>
                    <Progress
                      value={goal.progress}
                      className="h-2"
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-semibold">
                      {goal.current_value.toLocaleString()}/{goal.target_value.toLocaleString()} {goal.unit}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-semibold">
                      {new Date(goal.end_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <Button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setGoalDetailsOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Goal Completion Trends
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-gray-600">Overall Success Rate</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 rounded p-3">
                    <div className="text-lg font-bold text-blue-600">12</div>
                    <div className="text-xs text-gray-600">This Month</div>
                  </div>
                  <div className="bg-green-50 rounded p-3">
                    <div className="text-lg font-bold text-green-600">45</div>
                    <div className="text-xs text-gray-600">This Quarter</div>
                  </div>
                  <div className="bg-purple-50 rounded p-3">
                    <div className="text-lg font-bold text-purple-600">178</div>
                    <div className="text-xs text-gray-600">This Year</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Performance
              </h3>
              <div className="space-y-4">
                {teams.map((team) => {
                  const teamGoals = goals.filter(g => g.team_id === team.id);
                  const avgProgress = teamGoals.length > 0
                    ? Math.round(teamGoals.reduce((sum, g) => sum + g.progress, 0) / teamGoals.length)
                    : 0;

                  return (
                    <div key={team.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{team.name}</div>
                        <div className="text-sm text-gray-600">{teamGoals.length} goals</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{avgProgress}%</div>
                        <Progress value={avgProgress} className="w-20 h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">On Track</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}} />
                    </div>
                    <span className="font-semibold">75%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">At Risk</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '20%'}} />
                    </div>
                    <span className="font-semibold">20%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Overdue</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: '5%'}} />
                    </div>
                    <span className="font-semibold">5%</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Goal Categories
              </h3>
              <div className="space-y-3">
                {['Organizational', 'Team', 'Individual'].map((category) => {
                  const categoryGoals = goals.filter(g =>
                    g.type === category.toLowerCase()
                  );
                  const percentage = goals.length > 0
                    ? Math.round((categoryGoals.length / goals.length) * 100)
                    : 0;

                  return (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-gray-600">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{width: `${percentage}%`}}
                          />
                        </div>
                        <span className="font-semibold">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Upcoming Milestones
            </h3>
            <div className="space-y-4">
              {goals
                .filter(goal => goal.milestones && goal.milestones.length > 0)
                .flatMap(goal =>
                  goal.milestones!.map(milestone => ({
                    ...milestone,
                    goal_title: goal.title,
                    goal_type: goal.type
                  }))
                )
                .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())
                .slice(0, 10)
                .map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-full ${
                      milestone.completed ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {milestone.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{milestone.title}</div>
                      <div className="text-sm text-gray-600">{milestone.goal_title}</div>
                      <div className="text-xs text-gray-500 capitalize">{milestone.goal_type} goal</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {new Date(milestone.target_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {milestone.completed ? 'Completed' : 'Due'}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Goal Details Modal */}
      <Dialog open={goalDetailsOpen} onOpenChange={setGoalDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Goal Details</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{selectedGoal.title}</h3>
                  <p className="text-gray-600 mb-4">{selectedGoal.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <Badge variant="outline" className="capitalize">{selectedGoal.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <Badge className={`${getPriorityColor(selectedGoal.priority)} text-white`}>
                        {selectedGoal.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedGoal.status)}>
                        {selectedGoal.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-semibold">{selectedGoal.progress}%</span>
                      </div>
                      <Progress value={selectedGoal.progress} className="h-3" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Current Value:</span>
                        <div className="font-semibold">
                          {selectedGoal.current_value.toLocaleString()} {selectedGoal.unit}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Target Value:</span>
                        <div className="font-semibold">
                          {selectedGoal.target_value.toLocaleString()} {selectedGoal.unit}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Start Date:</span>
                        <div className="font-semibold">
                          {new Date(selectedGoal.start_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">End Date:</span>
                        <div className="font-semibold">
                          {new Date(selectedGoal.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedGoal.milestones && selectedGoal.milestones.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Milestones
                  </h4>
                  <div className="space-y-3">
                    {selectedGoal.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center gap-3 p-3 border rounded">
                        <div className={`p-1 rounded-full ${
                          milestone.completed ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {milestone.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{milestone.title}</div>
                          <div className="text-sm text-gray-600">{milestone.description}</div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-semibold">
                            {new Date(milestone.target_date).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">
                            {milestone.completed ? 'Completed' : `${milestone.progress}%`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Goal Modal */}
      <Dialog open={newGoalOpen} onOpenChange={setNewGoalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input id="title" placeholder="Enter goal title" />
              </div>
              <div>
                <Label htmlFor="type">Goal Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organizational">Organizational</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the goal" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target">Target Value</Label>
                <Input id="target" type="number" placeholder="100" />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" placeholder="%" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewGoalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setNewGoalOpen(false)}>
                Create Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}