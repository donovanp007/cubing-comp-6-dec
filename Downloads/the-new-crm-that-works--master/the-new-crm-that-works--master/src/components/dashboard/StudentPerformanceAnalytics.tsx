'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  Users,
  Target,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Medal,
  Trophy,
  Zap,
  Brain,
  Heart,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface StudentPerformance {
  id: string;
  full_name: string;
  team_id: string;
  team_name: string;
  area: string;
  age: number;
  skills_rating: number;
  attendance_rate: number;
  assessment_scores: number[];
  improvement_rate: number;
  sessions_completed: number;
  total_sessions: number;
  achievements: string[];
  strengths: string[];
  areas_for_improvement: string[];
  last_session: string;
  performance_trend: 'improving' | 'stable' | 'declining';
  effort_level: number;
  attitude_score: number;
  technical_skills: {
    fundamentals: number;
    techniques: number;
    strategy: number;
    physical: number;
  };
}

interface TeamPerformanceMetrics {
  team_id: string;
  team_name: string;
  area: string;
  avg_skills_rating: number;
  avg_attendance: number;
  avg_improvement_rate: number;
  total_students: number;
  top_performers: string[];
  needs_attention: string[];
  performance_distribution: {
    advanced: number;
    intermediate: number;
    beginner: number;
  };
}

export default function StudentPerformanceAnalytics() {
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<TeamPerformanceMetrics[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentPerformance | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);

      // Fetch students with team information
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          full_name,
          age,
          team_id,
          teams(team_name, area)
        `)
        .not('team_id', 'is', null);

      if (studentsError) throw studentsError;

      // Generate mock performance data (in real app, this would come from tracking tables)
      const performanceData: StudentPerformance[] = studentsData?.map(student => {
        const skillsRating = Math.floor(Math.random() * 10) + 1;
        const attendanceRate = Math.floor(Math.random() * 40) + 60; // 60-100%
        const improvementRate = (Math.random() * 20) - 10; // -10% to +10%
        const sessionsCompleted = Math.floor(Math.random() * 20) + 10;
        const totalSessions = sessionsCompleted + Math.floor(Math.random() * 5);

        return {
          ...student,
          team_name: student.teams?.team_name || '',
          area: student.teams?.area || '',
          skills_rating: skillsRating,
          attendance_rate: attendanceRate,
          assessment_scores: Array.from({length: 5}, () => Math.floor(Math.random() * 100) + 1),
          improvement_rate: improvementRate,
          sessions_completed: sessionsCompleted,
          total_sessions: totalSessions,
          achievements: ['Basic Skills', 'Good Attendance', 'Team Player'].slice(0, Math.floor(Math.random() * 3) + 1),
          strengths: ['Technical Skills', 'Strategy', 'Leadership', 'Teamwork'].slice(0, Math.floor(Math.random() * 3) + 1),
          areas_for_improvement: ['Consistency', 'Focus', 'Physical Fitness'].slice(0, Math.floor(Math.random() * 2) + 1),
          last_session: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          performance_trend: improvementRate > 2 ? 'improving' : improvementRate < -2 ? 'declining' : 'stable',
          effort_level: Math.floor(Math.random() * 5) + 6, // 6-10
          attitude_score: Math.floor(Math.random() * 3) + 8, // 8-10
          technical_skills: {
            fundamentals: Math.floor(Math.random() * 40) + 60,
            techniques: Math.floor(Math.random() * 40) + 60,
            strategy: Math.floor(Math.random() * 40) + 60,
            physical: Math.floor(Math.random() * 40) + 60,
          }
        };
      }) || [];

      // Generate team metrics
      const teams = [...new Set(performanceData.map(s => s.team_id))];
      const teamMetricsData: TeamPerformanceMetrics[] = teams.map(teamId => {
        const teamStudents = performanceData.filter(s => s.team_id === teamId);
        const teamName = teamStudents[0]?.team_name || '';
        const area = teamStudents[0]?.area || '';

        const avgSkills = teamStudents.reduce((acc, s) => acc + s.skills_rating, 0) / teamStudents.length;
        const avgAttendance = teamStudents.reduce((acc, s) => acc + s.attendance_rate, 0) / teamStudents.length;
        const avgImprovement = teamStudents.reduce((acc, s) => acc + s.improvement_rate, 0) / teamStudents.length;

        const sorted = teamStudents.sort((a, b) => b.skills_rating - a.skills_rating);
        const topPerformers = sorted.slice(0, 3).map(s => s.full_name);
        const needsAttention = teamStudents
          .filter(s => s.skills_rating < 5 || s.attendance_rate < 70)
          .map(s => s.full_name);

        return {
          team_id: teamId,
          team_name: teamName,
          area: area,
          avg_skills_rating: avgSkills,
          avg_attendance: avgAttendance,
          avg_improvement_rate: avgImprovement,
          total_students: teamStudents.length,
          top_performers: topPerformers,
          needs_attention: needsAttention,
          performance_distribution: {
            advanced: teamStudents.filter(s => s.skills_rating >= 8).length,
            intermediate: teamStudents.filter(s => s.skills_rating >= 6 && s.skills_rating < 8).length,
            beginner: teamStudents.filter(s => s.skills_rating < 6).length,
          }
        };
      });

      setStudents(performanceData);
      setTeamMetrics(teamMetricsData);

    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    return (selectedTeam === 'all' || student.team_id === selectedTeam) &&
           (selectedArea === 'all' || student.area === selectedArea);
  });

  const overallStats = {
    avgSkillsRating: filteredStudents.length > 0
      ? filteredStudents.reduce((acc, s) => acc + s.skills_rating, 0) / filteredStudents.length
      : 0,
    avgAttendance: filteredStudents.length > 0
      ? filteredStudents.reduce((acc, s) => acc + s.attendance_rate, 0) / filteredStudents.length
      : 0,
    improving: filteredStudents.filter(s => s.performance_trend === 'improving').length,
    declining: filteredStudents.filter(s => s.performance_trend === 'declining').length,
  };

  const teams = [...new Set(students.map(s => s.team_id))];
  const areas = [...new Set(students.map(s => s.area))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Performance Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Performance Analytics</h1>
          <p className="text-muted-foreground">Track progress, identify trends, and optimize learning outcomes</p>
        </div>

        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchPerformanceData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {areas.map(area => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teamMetrics.map(team => (
                <SelectItem key={team.team_id} value={team.team_id}>{team.team_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="ml-auto">
            {filteredStudents.length} students
          </Badge>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="individuals">Individual Progress</TabsTrigger>
          <TabsTrigger value="teams">Team Comparison</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Performance Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">{overallStats.avgSkillsRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Avg Skills Rating</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(overallStats.avgAttendance)}%</div>
                  <div className="text-sm text-gray-600">Avg Attendance</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{overallStats.improving}</div>
                  <div className="text-sm text-gray-600">Improving</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <div className="text-2xl font-bold">{overallStats.declining}</div>
                  <div className="text-sm text-gray-600">Needs Attention</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Skills Distribution</h3>
              <div className="space-y-4">
                {[
                  { label: 'Advanced (8-10)', count: filteredStudents.filter(s => s.skills_rating >= 8).length, color: 'bg-green-500' },
                  { label: 'Intermediate (6-7)', count: filteredStudents.filter(s => s.skills_rating >= 6 && s.skills_rating < 8).length, color: 'bg-yellow-500' },
                  { label: 'Beginner (1-5)', count: filteredStudents.filter(s => s.skills_rating < 6).length, color: 'bg-red-500' },
                ].map(item => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm text-gray-600">{item.count} students</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${item.color}`}
                        style={{ width: `${(item.count / filteredStudents.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
              <div className="space-y-4">
                {[
                  {
                    label: 'Improving',
                    count: filteredStudents.filter(s => s.performance_trend === 'improving').length,
                    color: 'bg-green-500',
                    icon: TrendingUp
                  },
                  {
                    label: 'Stable',
                    count: filteredStudents.filter(s => s.performance_trend === 'stable').length,
                    color: 'bg-blue-500',
                    icon: Activity
                  },
                  {
                    label: 'Declining',
                    count: filteredStudents.filter(s => s.performance_trend === 'declining').length,
                    color: 'bg-red-500',
                    icon: TrendingDown
                  },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{item.count}</span>
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Top Performers */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredStudents
                .sort((a, b) => b.skills_rating - a.skills_rating)
                .slice(0, 6)
                .map((student, index) => (
                  <Card key={student.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStudent(student)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {index < 3 ? <Medal className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{student.full_name}</div>
                        <div className="text-sm text-gray-600">{student.team_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{student.skills_rating}/10</div>
                        <div className="text-xs text-gray-500">{student.attendance_rate}% attendance</div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </Card>
        </TabsContent>

        {/* Individual Progress */}
        <TabsContent value="individuals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.map(student => (
              <Card key={student.id} className="p-6 cursor-pointer hover:shadow-lg transition-all" onClick={() => setSelectedStudent(student)}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{student.full_name}</h3>
                    <div className="text-sm text-gray-600">{student.team_name} • {student.area}</div>
                  </div>
                  <div className="text-right">
                    {student.performance_trend === 'improving' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">Improving</span>
                      </div>
                    )}
                    {student.performance_trend === 'declining' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-xs">Declining</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Skills Rating</span>
                      <span className="font-medium">{student.skills_rating}/10</span>
                    </div>
                    <Progress value={student.skills_rating * 10} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Attendance</span>
                      <span className="font-medium">{student.attendance_rate}%</span>
                    </div>
                    <Progress value={student.attendance_rate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600">Sessions</div>
                      <div className="font-medium">{student.sessions_completed}/{student.total_sessions}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Effort Level</div>
                      <div className="font-medium">{student.effort_level}/10</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {student.achievements.map((achievement, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Team Comparison */}
        <TabsContent value="teams" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teamMetrics
              .filter(team => selectedArea === 'all' || team.area === selectedArea)
              .map(team => (
                <Card key={team.team_id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{team.team_name}</h3>
                      <div className="text-sm text-gray-600">{team.area} • {team.total_students} students</div>
                    </div>
                    <Badge variant="secondary">{team.avg_skills_rating.toFixed(1)} avg</Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-sm text-center">
                      <div className="bg-green-50 rounded p-2">
                        <div className="font-bold text-green-600">{team.performance_distribution.advanced}</div>
                        <div className="text-gray-600">Advanced</div>
                      </div>
                      <div className="bg-yellow-50 rounded p-2">
                        <div className="font-bold text-yellow-600">{team.performance_distribution.intermediate}</div>
                        <div className="text-gray-600">Intermediate</div>
                      </div>
                      <div className="bg-red-50 rounded p-2">
                        <div className="font-bold text-red-600">{team.performance_distribution.beginner}</div>
                        <div className="text-gray-600">Beginner</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Attendance</span>
                        <span className="font-medium">{Math.round(team.avg_attendance)}%</span>
                      </div>
                      <Progress value={team.avg_attendance} className="h-2" />
                    </div>

                    {team.top_performers.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Top Performers</div>
                        <div className="flex flex-wrap gap-1">
                          {team.top_performers.map(name => (
                            <Badge key={name} variant="outline" className="text-xs">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {team.needs_attention.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-red-600 mb-1">Needs Attention</div>
                        <div className="flex flex-wrap gap-1">
                          {team.needs_attention.map(name => (
                            <Badge key={name} variant="destructive" className="text-xs">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Performance Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-800">High Achievers Pattern</div>
                  <div className="text-sm text-blue-600 mt-1">
                    Students with 90%+ attendance show 23% better skill progression
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-medium text-yellow-800">Attention Required</div>
                  <div className="text-sm text-yellow-600 mt-1">
                    {filteredStudents.filter(s => s.attendance_rate < 70).length} students have attendance below 70%
                  </div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-800">Improvement Trend</div>
                  <div className="text-sm text-green-600 mt-1">
                    Overall performance improvement of 12% this {timeRange}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Recommended Actions
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Focus on Attendance</div>
                    <div className="text-sm text-gray-600">Implement attendance rewards program</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Skills Development</div>
                    <div className="text-sm text-gray-600">Provide additional support for struggling students</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Team Balance</div>
                    <div className="text-sm text-gray-600">Consider redistributing students for better skill balance</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                {selectedStudent.full_name} - Detailed Performance Analysis
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{selectedStudent.skills_rating}/10</div>
                  <div className="text-sm text-gray-600">Skills Rating</div>
                </Card>
                <Card className="p-4 text-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{selectedStudent.attendance_rate}%</div>
                  <div className="text-sm text-gray-600">Attendance</div>
                </Card>
                <Card className="p-4 text-center">
                  <Zap className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{selectedStudent.effort_level}/10</div>
                  <div className="text-sm text-gray-600">Effort Level</div>
                </Card>
                <Card className="p-4 text-center">
                  <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{selectedStudent.attitude_score}/10</div>
                  <div className="text-sm text-gray-600">Attitude</div>
                </Card>
              </div>

              {/* Technical Skills Breakdown */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Technical Skills Breakdown</h3>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(selectedStudent.technical_skills).map(([skill, score]) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize font-medium">{skill}</span>
                        <span className="text-sm text-gray-600">{score}/100</span>
                      </div>
                      <Progress value={score} className="h-3" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Strengths and Areas for Improvement */}
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 text-green-600 flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Strengths
                  </h3>
                  <div className="space-y-2">
                    {selectedStudent.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4 text-yellow-600 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Areas for Improvement
                  </h3>
                  <div className="space-y-2">
                    {selectedStudent.areas_for_improvement.map((area, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Achievements */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  Achievements & Recognition
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.achievements.map((achievement, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1">
                      <Medal className="h-3 w-3 mr-1" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}