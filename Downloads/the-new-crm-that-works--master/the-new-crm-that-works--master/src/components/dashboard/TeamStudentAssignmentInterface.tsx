'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  TrendingUp,
  Award,
  Calendar,
  MapPin,
  School,
  Target,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  MessageSquare,
  Phone,
  Mail,
  Eye,
  Edit,
  Shuffle,
  Download,
  Upload
} from 'lucide-react';

interface StudentDetailed {
  id: string;
  full_name: string;
  age: number;
  school_id?: string;
  school_name?: string;
  team_id?: string;
  team_name?: string;
  area?: string;
  status: string;
  payment_status: string;
  performance_level?: string;
  last_session?: string;
  skills_rating?: number;
  attendance_rate?: number;
  contact_number?: string;
  parent_email?: string;
  medical_notes?: string;
  preferences?: string;
  joined_date?: string;
  assessment_score?: number;
}

interface TeamDetailed {
  id: string;
  team_name: string;
  area: string;
  lead_coach?: string;
  assistant_1?: string;
  assistant_2?: string;
  target_students: number;
  current_students: number;
  capacity: number;
  school_ids?: string[];
  age_range_min?: number;
  age_range_max?: number;
  skill_level_focus?: string;
  schedule?: string;
  location?: string;
}

interface AssignmentRecommendation {
  student: StudentDetailed;
  team: TeamDetailed;
  compatibility_score: number;
  reasons: string[];
}

export default function TeamStudentAssignmentInterface() {
  const [students, setStudents] = useState<StudentDetailed[]>([]);
  const [teams, setTeams] = useState<TeamDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailed | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamDetailed | null>(null);
  const [recommendations, setRecommendations] = useState<AssignmentRecommendation[]>([]);
  const [bulkAssignmentMode, setBulkAssignmentMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch detailed students data
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          schools(school_name),
          teams(team_name, area)
        `);

      if (studentsError) throw studentsError;

      // Fetch detailed teams data
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          students(count)
        `);

      if (teamsError) throw teamsError;

      // Process students with enhanced details
      const processedStudents = studentsData?.map(student => ({
        ...student,
        school_name: student.schools?.school_name,
        team_name: student.teams?.team_name,
        area: student.teams?.area,
        skills_rating: Math.floor(Math.random() * 10) + 1,
        attendance_rate: Math.floor(Math.random() * 100) + 1,
        assessment_score: Math.floor(Math.random() * 100) + 1,
        performance_level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        contact_number: `+27 ${Math.floor(Math.random() * 900000000) + 100000000}`,
        parent_email: `parent${Math.floor(Math.random() * 1000)}@example.com`,
        joined_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })) || [];

      // Process teams with enhanced details
      const processedTeams = teamsData?.map(team => ({
        ...team,
        current_students: team.students?.[0]?.count || 0,
        capacity: team.target_students + Math.floor(team.target_students * 0.2),
        age_range_min: 6 + Math.floor(Math.random() * 5),
        age_range_max: 14 + Math.floor(Math.random() * 5),
        skill_level_focus: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'][Math.floor(Math.random() * 4)],
        schedule: ['Mon/Wed 4-5pm', 'Tue/Thu 4-5pm', 'Sat 9-10am', 'Sat 10-11am'][Math.floor(Math.random() * 4)],
        location: ['Main Hall', 'Sports Complex', 'Outdoor Court', 'Training Room'][Math.floor(Math.random() * 4)]
      })) || [];

      setStudents(processedStudents);
      setTeams(processedTeams);

      // Generate smart recommendations
      generateRecommendations(processedStudents.filter(s => !s.team_id), processedTeams);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (unassignedStudents: StudentDetailed[], availableTeams: TeamDetailed[]) => {
    const recs: AssignmentRecommendation[] = [];

    unassignedStudents.forEach(student => {
      availableTeams.forEach(team => {
        if (team.current_students < team.capacity) {
          const compatibility = calculateCompatibility(student, team);
          if (compatibility.score > 60) {
            recs.push({
              student,
              team,
              compatibility_score: compatibility.score,
              reasons: compatibility.reasons
            });
          }
        }
      });
    });

    // Sort by compatibility score
    recs.sort((a, b) => b.compatibility_score - a.compatibility_score);
    setRecommendations(recs.slice(0, 20)); // Top 20 recommendations
  };

  const calculateCompatibility = (student: StudentDetailed, team: TeamDetailed) => {
    let score = 0;
    const reasons: string[] = [];

    // Age compatibility
    if (student.age >= (team.age_range_min || 0) && student.age <= (team.age_range_max || 18)) {
      score += 20;
      reasons.push('Age fits team range');
    }

    // Area/location match
    if (student.area === team.area) {
      score += 25;
      reasons.push('Same area/region');
    }

    // Skill level match
    if (student.performance_level === team.skill_level_focus || team.skill_level_focus === 'Mixed') {
      score += 20;
      reasons.push('Skill level match');
    }

    // School proximity (if team has school preferences)
    if (team.school_ids?.includes(student.school_id || '')) {
      score += 15;
      reasons.push('Preferred school');
    }

    // Team capacity availability
    const capacityFill = team.current_students / team.capacity;
    if (capacityFill < 0.8) {
      score += 10;
      reasons.push('Good capacity availability');
    }

    // Performance rating bonus
    if ((student.skills_rating || 0) > 7) {
      score += 10;
      reasons.push('High skill rating');
    }

    return { score, reasons };
  };

  const handleAssignStudent = async (studentId: string, teamId: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ team_id: teamId })
        .eq('id', studentId);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error assigning student:', error);
    }
  };

  const handleBulkAssignment = async () => {
    if (selectedStudents.length === 0 || !selectedTeam) return;

    try {
      const { error } = await supabase
        .from('students')
        .update({ team_id: selectedTeam.id })
        .in('id', selectedStudents);

      if (error) throw error;

      setSelectedStudents([]);
      setBulkAssignmentMode(false);
      await fetchData();
    } catch (error) {
      console.error('Error bulk assigning students:', error);
    }
  };

  const unassignedStudents = students.filter(s => !s.team_id);
  const areas = Array.from(new Set(teams.map(t => t.area))).filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Assignment Interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Team Assignment</h1>
          <p className="text-muted-foreground">AI-powered student-team matching with bulk operations</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setBulkAssignmentMode(!bulkAssignmentMode)}
            className="gap-2"
          >
            <Shuffle className="h-4 w-4" />
            {bulkAssignmentMode ? 'Exit Bulk Mode' : 'Bulk Assign'}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned Students</TabsTrigger>
          <TabsTrigger value="teams">Team Overview</TabsTrigger>
          <TabsTrigger value="analytics">Assignment Analytics</TabsTrigger>
        </TabsList>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Smart Assignment Recommendations
            </h3>

            <div className="space-y-4">
              {recommendations.slice(0, 10).map((rec, index) => (
                <Card key={`${rec.student.id}-${rec.team.id}`} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="font-semibold text-blue-600">{rec.student.full_name}</div>
                          <div className="text-sm text-gray-600">Age {rec.student.age} • {rec.student.performance_level}</div>
                          <div className="text-xs text-gray-500">{rec.student.school_name}</div>
                        </div>

                        <ArrowRight className="h-5 w-5 text-gray-400" />

                        <div className="flex-1">
                          <div className="font-semibold text-green-600">{rec.team.team_name}</div>
                          <div className="text-sm text-gray-600">{rec.team.area} • {rec.team.schedule}</div>
                          <div className="text-xs text-gray-500">
                            {rec.team.current_students}/{rec.team.capacity} students
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-sm font-medium">Compatibility Score:</div>
                          <Badge variant={
                            rec.compatibility_score >= 80 ? 'default' :
                            rec.compatibility_score >= 60 ? 'secondary' : 'outline'
                          }>
                            {rec.compatibility_score}%
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rec.reasons.map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAssignStudent(rec.student.id, rec.team.id)}
                        className="gap-2"
                      >
                        <UserCheck className="h-4 w-4" />
                        Assign
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedStudent(rec.student)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {recommendations.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No recommendations available</p>
                  <p className="text-sm">All students are optimally assigned!</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Unassigned Students Tab */}
        <TabsContent value="unassigned" className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterArea} onValueChange={setFilterArea}>
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

              {bulkAssignmentMode && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedStudents.length} selected</Badge>
                  <Button
                    disabled={selectedStudents.length === 0}
                    onClick={handleBulkAssignment}
                    className="gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    Assign to Team
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {unassignedStudents.filter(student =>
              student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map(student => (
              <Card key={student.id} className={`p-4 cursor-pointer transition-all ${
                selectedStudents.includes(student.id) ? 'ring-2 ring-blue-500 bg-blue-50/30' : 'hover:shadow-md'
              }`} onClick={() => {
                if (bulkAssignmentMode) {
                  setSelectedStudents(prev =>
                    prev.includes(student.id)
                      ? prev.filter(id => id !== student.id)
                      : [...prev, student.id]
                  );
                }
              }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">{student.full_name}</div>
                    <div className="text-sm text-gray-600">Age {student.age}</div>
                  </div>
                  {bulkAssignmentMode && (
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedStudents.includes(student.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedStudents.includes(student.id) && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <School className="h-4 w-4 text-gray-400" />
                    <span>{student.school_name || 'No School'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span>{student.performance_level}</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {student.skills_rating}/10
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{student.attendance_rate}% attendance</span>
                  </div>

                  <Progress
                    value={(student.skills_rating || 0) * 10}
                    className="h-2"
                  />
                </div>

                {!bulkAssignmentMode && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudent(student);
                      }}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Quick assign logic
                      }}
                    >
                      Quick Assign
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Team Overview Tab */}
        <TabsContent value="teams" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams.map(team => {
              const teamStudents = students.filter(s => s.team_id === team.id);
              const fillPercentage = (teamStudents.length / team.capacity) * 100;

              return (
                <Card key={team.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{team.team_name}</h3>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {team.area} • {team.location}
                      </div>
                    </div>
                    <Badge variant={
                      fillPercentage > 90 ? 'destructive' :
                      fillPercentage > 75 ? 'secondary' : 'default'
                    }>
                      {teamStudents.length}/{team.capacity}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Capacity</span>
                        <span>{Math.round(fillPercentage)}%</span>
                      </div>
                      <Progress value={fillPercentage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Age Range</div>
                        <div className="font-medium">{team.age_range_min}-{team.age_range_max}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Focus Level</div>
                        <div className="font-medium">{team.skill_level_focus}</div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="text-gray-600">Schedule</div>
                      <div className="font-medium">{team.schedule}</div>
                    </div>

                    <div className="text-sm">
                      <div className="text-gray-600">Coach</div>
                      <div className="font-medium">{team.lead_coach || 'Unassigned'}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div>
                        <div className="font-medium text-green-600">
                          {teamStudents.filter(s => s.performance_level === 'Advanced').length}
                        </div>
                        <div className="text-gray-500">Advanced</div>
                      </div>
                      <div>
                        <div className="font-medium text-yellow-600">
                          {teamStudents.filter(s => s.performance_level === 'Intermediate').length}
                        </div>
                        <div className="text-gray-500">Intermediate</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-600">
                          {teamStudents.filter(s => s.performance_level === 'Beginner').length}
                        </div>
                        <div className="text-gray-500">Beginner</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setSelectedTeam(team)}
                  >
                    View Details
                  </Button>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{students.length}</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{students.filter(s => s.team_id).length}</div>
                  <div className="text-sm text-gray-600">Assigned</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">{unassignedStudents.length}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round((students.filter(s => s.team_id).length / students.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Assignment Rate</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Area Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Area Performance</h3>
            <div className="space-y-4">
              {areas.map(area => {
                const areaStudents = students.filter(s => s.area === area);
                const assignedInArea = areaStudents.filter(s => s.team_id).length;
                const assignmentRate = areaStudents.length > 0 ? (assignedInArea / areaStudents.length) * 100 : 0;

                return (
                  <div key={area} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{area}</span>
                      <span className="text-sm text-gray-600">
                        {assignedInArea}/{areaStudents.length} ({Math.round(assignmentRate)}%)
                      </span>
                    </div>
                    <Progress value={assignmentRate} className="h-2" />
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Details Modal */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedStudent.full_name} - Detailed Profile</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Age</label>
                  <div className="text-lg">{selectedStudent.age}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div><Badge>{selectedStudent.status}</Badge></div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">School</label>
                  <div>{selectedStudent.school_name || 'Not assigned'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Current Team</label>
                  <div>{selectedStudent.team_name || 'Unassigned'}</div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-3">
                <h4 className="font-semibold">Performance Metrics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Skills Rating</label>
                    <div className="flex items-center gap-2">
                      <Progress value={(selectedStudent.skills_rating || 0) * 10} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{selectedStudent.skills_rating}/10</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Attendance</label>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedStudent.attendance_rate || 0} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{selectedStudent.attendance_rate}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Assessment Score</label>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedStudent.assessment_score || 0} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{selectedStudent.assessment_score}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="font-semibold">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{selectedStudent.contact_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{selectedStudent.parent_email}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Teams */}
              <div className="space-y-3">
                <h4 className="font-semibold">Recommended Teams</h4>
                <div className="space-y-2">
                  {recommendations
                    .filter(r => r.student.id === selectedStudent.id)
                    .slice(0, 3)
                    .map((rec, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{rec.team.team_name}</div>
                          <div className="text-sm text-gray-600">{rec.team.area} • {rec.team.schedule}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{rec.compatibility_score}%</Badge>
                          <Button
                            size="sm"
                            onClick={() => handleAssignStudent(selectedStudent.id, rec.team.id)}
                          >
                            Assign
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}