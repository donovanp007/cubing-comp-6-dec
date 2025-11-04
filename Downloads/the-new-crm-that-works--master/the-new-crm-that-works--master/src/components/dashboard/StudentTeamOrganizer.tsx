'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import {
  Users,
  UserPlus,
  UserMinus,
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
  AlertCircle
} from 'lucide-react';

interface Student {
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
}

interface Team {
  id: string;
  team_name: string;
  area: string;
  lead_coach?: string;
  target_students: number;
  current_students: number;
  capacity: number;
  school_ids?: string[];
  age_range_min?: number;
  age_range_max?: number;
}

export default function StudentTeamOrganizer() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [draggedStudent, setDraggedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch students with team and school info
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          schools(school_name),
          teams(team_name, area)
        `);

      if (studentsError) throw studentsError;

      // Fetch teams with student counts
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          students(count)
        `);

      if (teamsError) throw teamsError;

      // Process students data
      const processedStudents = studentsData?.map(student => ({
        ...student,
        school_name: student.schools?.school_name,
        team_name: student.teams?.team_name,
        area: student.teams?.area,
        skills_rating: Math.floor(Math.random() * 10) + 1, // Mock data
        attendance_rate: Math.floor(Math.random() * 100) + 1, // Mock data
        performance_level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)]
      })) || [];

      // Process teams data
      const processedTeams = teamsData?.map(team => ({
        ...team,
        current_students: team.students?.[0]?.count || 0,
        capacity: team.target_students + Math.floor(team.target_students * 0.2) // 20% buffer
      })) || [];

      setStudents(processedStudents);
      setTeams(processedTeams);
      setUnassignedStudents(processedStudents.filter(s => !s.team_id));

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (student: Student) => {
    setDraggedStudent(student);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, teamId: string) => {
    e.preventDefault();

    if (!draggedStudent) return;

    try {
      // Update student's team assignment
      const { error } = await supabase
        .from('students')
        .update({ team_id: teamId })
        .eq('id', draggedStudent.id);

      if (error) throw error;

      // Refresh data
      await fetchData();
      setDraggedStudent(null);
    } catch (error) {
      console.error('Error assigning student:', error);
    }
  };

  const handleRemoveFromTeam = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ team_id: null })
        .eq('id', studentId);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = filterArea === 'all' || student.area === filterArea;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesArea && matchesStatus;
  });

  const areas = [...new Set(teams.map(t => t.area))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Student Team Organizer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Team Organization</h1>
        <p className="text-muted-foreground">Manage student assignments and team composition with drag-and-drop</p>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
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

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Unassigned Students Pool */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Unassigned Students
            </h3>
            <Badge variant="secondary">{unassignedStudents.length}</Badge>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {unassignedStudents.filter(s =>
              s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map(student => (
              <Card
                key={student.id}
                className="p-3 cursor-grab hover:shadow-md transition-all border-dashed border-2"
                draggable
                onDragStart={() => handleDragStart(student)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{student.full_name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <School className="h-3 w-3" />
                      {student.school_name || 'No School'}
                    </div>
                    <div className="text-xs text-gray-500">Age: {student.age}</div>
                  </div>
                  <Badge variant={
                    student.status === 'active' ? 'default' :
                    student.status === 'pending' ? 'secondary' : 'outline'
                  } className="text-xs">
                    {student.status}
                  </Badge>
                </div>

                {/* Performance Indicators */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Skills</span>
                    <span>{student.skills_rating}/10</span>
                  </div>
                  <Progress value={(student.skills_rating || 0) * 10} className="h-1" />
                </div>
              </Card>
            ))}

            {unassignedStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>All students assigned to teams!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Teams Grid */}
        <div className="xl:col-span-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams.map(team => {
              const teamStudents = filteredStudents.filter(s => s.team_id === team.id);
              const isOverCapacity = teamStudents.length > team.capacity;
              const isNearCapacity = teamStudents.length > team.capacity * 0.8;

              return (
                <Card
                  key={team.id}
                  className={`p-4 transition-all min-h-[500px] ${
                    isOverCapacity ? 'ring-2 ring-red-300 bg-red-50/30' :
                    isNearCapacity ? 'ring-2 ring-yellow-300 bg-yellow-50/30' :
                    'hover:shadow-lg'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, team.id)}
                >
                  {/* Team Header */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{team.team_name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {teamStudents.length}/{team.capacity}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" />
                      {team.area}
                    </div>

                    {team.lead_coach && (
                      <div className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                        <Award className="h-3 w-3" />
                        Coach: {team.lead_coach}
                      </div>
                    )}

                    {/* Capacity Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Capacity</span>
                        <span className={isOverCapacity ? 'text-red-600 font-medium' : ''}>
                          {Math.round((teamStudents.length / team.capacity) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min((teamStudents.length / team.capacity) * 100, 100)}
                        className={`h-2 ${isOverCapacity ? 'bg-red-100' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Drop Zone */}
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 mb-4 min-h-[40px] flex items-center justify-center bg-gray-50/50">
                    <div className="text-xs text-gray-500 text-center">
                      <UserPlus className="h-4 w-4 mx-auto mb-1" />
                      Drop students here
                    </div>
                  </div>

                  {/* Team Students */}
                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {teamStudents.map(student => (
                      <Card key={student.id} className="p-2 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{student.full_name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <span>Age: {student.age}</span>
                              <Badge variant="outline" className="text-xs px-1">
                                {student.performance_level}
                              </Badge>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveFromTeam(student.id)}
                            className="h-6 w-6 p-0 hover:bg-red-50"
                          >
                            <UserMinus className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>

                        {/* Student Performance Metrics */}
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{student.attendance_rate}% attendance</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-blue-500" />
                            <span>{student.skills_rating}/10 skills</span>
                          </div>
                        </div>

                        <div className="mt-1">
                          <Progress
                            value={(student.skills_rating || 0) * 10}
                            className="h-1"
                          />
                        </div>
                      </Card>
                    ))}

                    {teamStudents.length === 0 && (
                      <div className="text-center py-6 text-gray-400">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No students assigned</p>
                      </div>
                    )}
                  </div>

                  {/* Team Analytics Summary */}
                  <div className="mt-4 pt-3 border-t">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          {teamStudents.filter(s => s.performance_level === 'Advanced').length}
                        </div>
                        <div className="text-gray-500">Advanced</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-yellow-600">
                          {teamStudents.filter(s => s.performance_level === 'Intermediate').length}
                        </div>
                        <div className="text-gray-500">Intermediate</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-600">
                          {teamStudents.filter(s => s.performance_level === 'Beginner').length}
                        </div>
                        <div className="text-gray-500">Beginner</div>
                      </div>
                    </div>

                    {isOverCapacity && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
                        <div className="flex items-center gap-1 text-red-700 text-xs">
                          <AlertCircle className="h-3 w-3" />
                          Over capacity - consider redistributing students
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm text-gray-600">Total Students</div>
              <div className="text-xl font-bold">{students.length}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-sm text-gray-600">Assigned</div>
              <div className="text-xl font-bold">{students.length - unassignedStudents.length}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <div className="text-sm text-gray-600">Unassigned</div>
              <div className="text-xl font-bold">{unassignedStudents.length}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <div>
              <div className="text-sm text-gray-600">Avg Team Fill</div>
              <div className="text-xl font-bold">
                {teams.length > 0
                  ? Math.round((students.filter(s => s.team_id).length / teams.reduce((acc, t) => acc + t.capacity, 0)) * 100)
                  : 0}%
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}