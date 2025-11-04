'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  MapPin,
  Target,
  DollarSign,
  School,
  UserCheck,
  AlertTriangle,
  GraduationCap,
  PhoneCall,
  Mail,
  Calendar,
  Star,
  TrendingUp
} from 'lucide-react';

import {
  fetchAllTeams,
  fetchAllCoaches,
  fetchAllSchools,
  fetchStudentsByTeam,
  fetchStudentsFromCRM,
  assignStudentToTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  createCoach,
  createStudent,
  fetchStudentNotes,
  createStudentNote,
  fetchIncomeBySchool,
  fetchTeamGoals,
  createTeamGoal,
  updateTeamGoal,
  calculateTeamPerformanceMetrics,
  type Team,
  type Coach,
  type School,
  type Student,
  type StudentNote,
  type TeamGoal,
  type PerformanceMetrics
} from '@/lib/db/teams';

interface TeamManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamsUpdate?: () => void;
  selectedTeam?: Team | null;
}

export default function TeamManagementModal({
  open,
  onOpenChange,
  onTeamsUpdate,
  selectedTeam
}: TeamManagementModalProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('teams');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeamForm, setNewTeamForm] = useState({
    name: '',
    area: '',
    school_id: '',
    coach_id: '',
    revenue_target: 0,
    status: 'active' as 'active' | 'inactive' | 'pending'
  });
  const [newCoachForm, setNewCoachForm] = useState({
    name: '',
    email: '',
    phone: '',
    area: '',
    school_id: '',
    role: 'head_coach' as 'head_coach' | 'assistant_coach',
    salary: 0
  });
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    age: 0,
    school_id: '',
    team_id: '',
    parent_email: '',
    parent_phone: '',
    skill_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    monthly_fee: 100
  });
  const [selectedStudentForNotes, setSelectedStudentForNotes] = useState<Student | null>(null);
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);
  const [newNote, setNewNote] = useState({
    note: '',
    skill_rating: 3,
    attendance_rating: 5,
    behavior_rating: 5
  });
  const [crmStudents, setCrmStudents] = useState<Student[]>([]);
  const [teamGoals, setTeamGoals] = useState<TeamGoal[]>([]);
  const [selectedTeamForGoals, setSelectedTeamForGoals] = useState<Team | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [newGoalForm, setNewGoalForm] = useState({
    title: '',
    description: '',
    target_value: 0,
    metric_type: 'students' as 'revenue' | 'students' | 'retention' | 'performance' | 'custom',
    deadline: ''
  });

  useEffect(() => {
    if (open) {
      fetchAllData();
    }
  }, [open]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [teamsData, coachesData, schoolsData, crmStudentsData] = await Promise.all([
        fetchAllTeams(),
        fetchAllCoaches(),
        fetchAllSchools(),
        fetchStudentsFromCRM()
      ]);

      setTeams(teamsData);
      setCoaches(coachesData);
      setSchools(schoolsData);
      setCrmStudents(crmStudentsData);

      if (selectedTeam) {
        const teamStudents = await fetchStudentsByTeam(selectedTeam.id);
        setStudents(teamStudents);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamForm.name || !newTeamForm.area) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const team = await createTeam({
        name: newTeamForm.name,
        area: newTeamForm.area,
        school_id: newTeamForm.school_id || undefined,
        coach_id: newTeamForm.coach_id || undefined,
        revenue_target: newTeamForm.revenue_target,
        status: newTeamForm.status
      });

      setTeams([team, ...teams]);
      setNewTeamForm({
        name: '',
        area: '',
        school_id: '',
        coach_id: '',
        revenue_target: 0,
        status: 'active'
      });
      onTeamsUpdate?.();
      alert('Team created successfully!');
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team. Please try again.');
    }
  };

  const handleCreateCoach = async () => {
    if (!newCoachForm.name || !newCoachForm.email || !newCoachForm.area) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const coach = await createCoach({
        name: newCoachForm.name,
        email: newCoachForm.email,
        phone: newCoachForm.phone,
        area: newCoachForm.area,
        school_id: newCoachForm.school_id || undefined,
        team_ids: [],
        hire_date: new Date().toISOString().split('T')[0],
        salary: newCoachForm.salary,
        role: newCoachForm.role,
        status: 'active'
      });

      setCoaches([coach, ...coaches]);
      setNewCoachForm({
        name: '',
        email: '',
        phone: '',
        area: '',
        school_id: '',
        role: 'head_coach',
        salary: 0
      });
      alert('Coach added successfully!');
    } catch (error) {
      console.error('Error creating coach:', error);
      alert('Failed to add coach. Please try again.');
    }
  };

  const handleCreateStudent = async () => {
    if (!newStudentForm.name || !newStudentForm.team_id) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const student = await createStudent({
        name: newStudentForm.name,
        age: newStudentForm.age || undefined,
        school_id: newStudentForm.school_id || undefined,
        team_id: newStudentForm.team_id,
        parent_email: newStudentForm.parent_email || undefined,
        parent_phone: newStudentForm.parent_phone || undefined,
        enrollment_date: new Date().toISOString().split('T')[0],
        skill_level: newStudentForm.skill_level,
        status: 'active',
        monthly_fee: newStudentForm.monthly_fee
      });

      setStudents([student, ...students]);
      setNewStudentForm({
        name: '',
        age: 0,
        school_id: '',
        team_id: '',
        parent_email: '',
        parent_phone: '',
        skill_level: 'beginner',
        monthly_fee: 100
      });
      alert('Student added successfully!');
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Failed to add student. Please try again.');
    }
  };

  const handleAddStudentNote = async () => {
    if (!selectedStudentForNotes || !newNote.note) {
      alert('Please enter a note');
      return;
    }

    try {
      const note = await createStudentNote({
        student_id: selectedStudentForNotes.id,
        coach_id: 'current-coach-id', // This should come from auth context
        coach_name: 'Current Coach', // This should come from auth context
        note: newNote.note,
        session_date: new Date().toISOString().split('T')[0],
        skill_rating: newNote.skill_rating,
        attendance_rating: newNote.attendance_rating,
        behavior_rating: newNote.behavior_rating
      });

      setStudentNotes([note, ...studentNotes]);
      setNewNote({
        note: '',
        skill_rating: 3,
        attendance_rating: 5,
        behavior_rating: 5
      });
      alert('Note added successfully!');
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  const handleViewStudentNotes = async (student: Student) => {
    setSelectedStudentForNotes(student);
    try {
      const notes = await fetchStudentNotes(student.id);
      setStudentNotes(notes);
    } catch (error) {
      console.error('Error fetching student notes:', error);
    }
  };

  const getCoachName = (coachId?: string) => {
    const coach = coaches.find(c => c.id === coachId);
    return coach?.name || 'Unassigned';
  };

  const getSchoolName = (schoolId?: string) => {
    const school = schools.find(s => s.id === schoolId);
    return school?.name || 'No School';
  };

  const areas = ['North', 'South', 'East', 'West', 'Central'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management Center
          </DialogTitle>
          <DialogDescription>
            Comprehensive team, coach, and student management system
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="goals">Goals & Targets</TabsTrigger>
            <TabsTrigger value="notes">Student Notes</TabsTrigger>
            <TabsTrigger value="income">Income Tracking</TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Teams ({teams.length})</h3>
              <Button onClick={() => setSelectedTab('new-team')} className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Team
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <Card key={team.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{team.name}</h4>
                      <p className="text-sm text-gray-600 capitalize flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {team.area}
                      </p>
                    </div>
                    <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                      {team.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coach:</span>
                      <span className="font-medium">{getCoachName(team.coach_id)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">School:</span>
                      <span className="font-medium">{getSchoolName(team.school_id)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{team.student_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">${(team.revenue || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => setEditingTeam(team)}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedTab('students');
                        fetchStudentsByTeam(team.id).then(setStudents);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                    >
                      <Users className="h-3 w-3" />
                      Students
                    </Button>
                  </div>
                </Card>
              ))}

              {/* Add New Team Card */}
              <Card className="p-4 border-dashed border-2 hover:border-blue-300 transition-colors">
                <div className="space-y-4">
                  <h4 className="font-semibold text-center">Add New Team</h4>

                  <div className="space-y-3">
                    <div>
                      <Label>Team Name</Label>
                      <Input
                        value={newTeamForm.name}
                        onChange={(e) => setNewTeamForm({...newTeamForm, name: e.target.value})}
                        placeholder="Team Alpha"
                      />
                    </div>

                    <div>
                      <Label>Area</Label>
                      <Select
                        value={newTeamForm.area}
                        onValueChange={(value) => setNewTeamForm({...newTeamForm, area: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map((area) => (
                            <SelectItem key={area} value={area}>{area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>School</Label>
                      <Select
                        value={newTeamForm.school_id}
                        onValueChange={(value) => setNewTeamForm({...newTeamForm, school_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select school" />
                        </SelectTrigger>
                        <SelectContent>
                          {schools.filter(s => s.area === newTeamForm.area).map((school) => (
                            <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Head Coach</Label>
                      <Select
                        value={newTeamForm.coach_id}
                        onValueChange={(value) => setNewTeamForm({...newTeamForm, coach_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select coach" />
                        </SelectTrigger>
                        <SelectContent>
                          {coaches.filter(c => c.area === newTeamForm.area && c.role === 'head_coach').map((coach) => (
                            <SelectItem key={coach.id} value={coach.id}>{coach.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Revenue Target</Label>
                      <Input
                        type="number"
                        value={newTeamForm.revenue_target}
                        onChange={(e) => setNewTeamForm({...newTeamForm, revenue_target: parseInt(e.target.value) || 0})}
                        placeholder="15000"
                      />
                    </div>
                  </div>

                  <Button onClick={handleCreateTeam} className="w-full gap-2">
                    <Save className="h-4 w-4" />
                    Create Team
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Coaches Tab */}
          <TabsContent value="coaches" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Coaches ({coaches.length})</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coaches.map((coach) => (
                <Card key={coach.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{coach.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{coach.role.replace('_', ' ')}</p>
                    </div>
                    <Badge variant={coach.status === 'active' ? 'default' : 'secondary'}>
                      {coach.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span>{coach.email}</span>
                    </div>
                    {coach.phone && (
                      <div className="flex items-center gap-2">
                        <PhoneCall className="h-3 w-3 text-gray-400" />
                        <span>{coach.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span>{coach.area}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 text-gray-400" />
                      <span>${(coach.salary || 0).toLocaleString()}/year</span>
                    </div>
                  </div>

                  {coach.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <strong>Notes:</strong> {coach.notes}
                    </div>
                  )}
                </Card>
              ))}

              {/* Add New Coach Card */}
              <Card className="p-4 border-dashed border-2 hover:border-green-300 transition-colors">
                <div className="space-y-4">
                  <h4 className="font-semibold text-center">Add New Coach</h4>

                  <div className="space-y-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={newCoachForm.name}
                        onChange={(e) => setNewCoachForm({...newCoachForm, name: e.target.value})}
                        placeholder="John Smith"
                      />
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newCoachForm.email}
                        onChange={(e) => setNewCoachForm({...newCoachForm, email: e.target.value})}
                        placeholder="john.smith@cubing.com"
                      />
                    </div>

                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={newCoachForm.phone}
                        onChange={(e) => setNewCoachForm({...newCoachForm, phone: e.target.value})}
                        placeholder="+1-555-0123"
                      />
                    </div>

                    <div>
                      <Label>Area</Label>
                      <Select
                        value={newCoachForm.area}
                        onValueChange={(value) => setNewCoachForm({...newCoachForm, area: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map((area) => (
                            <SelectItem key={area} value={area}>{area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Role</Label>
                      <Select
                        value={newCoachForm.role}
                        onValueChange={(value: 'head_coach' | 'assistant_coach') => setNewCoachForm({...newCoachForm, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="head_coach">Head Coach</SelectItem>
                          <SelectItem value="assistant_coach">Assistant Coach</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Annual Salary</Label>
                      <Input
                        type="number"
                        value={newCoachForm.salary}
                        onChange={(e) => setNewCoachForm({...newCoachForm, salary: parseInt(e.target.value) || 0})}
                        placeholder="55000"
                      />
                    </div>
                  </div>

                  <Button onClick={handleCreateCoach} className="w-full gap-2">
                    <Save className="h-4 w-4" />
                    Add Coach
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Students ({students.length})</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Card key={student.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{student.name}</h4>
                      <p className="text-sm text-gray-600">Age: {student.age || 'N/A'}</p>
                    </div>
                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Skill Level:</span>
                      <span className="font-medium capitalize">{student.skill_level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Fee:</span>
                      <span className="font-medium">${student.monthly_fee}</span>
                    </div>
                    {student.parent_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-xs">{student.parent_email}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleViewStudentNotes(student)}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 gap-2"
                  >
                    <GraduationCap className="h-3 w-3" />
                    View Notes
                  </Button>
                </Card>
              ))}

              {/* Add New Student Card */}
              <Card className="p-4 border-dashed border-2 hover:border-purple-300 transition-colors">
                <div className="space-y-4">
                  <h4 className="font-semibold text-center">Add New Student</h4>

                  <div className="space-y-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={newStudentForm.name}
                        onChange={(e) => setNewStudentForm({...newStudentForm, name: e.target.value})}
                        placeholder="Alex Chen"
                      />
                    </div>

                    <div>
                      <Label>Age</Label>
                      <Input
                        type="number"
                        value={newStudentForm.age}
                        onChange={(e) => setNewStudentForm({...newStudentForm, age: parseInt(e.target.value) || 0})}
                        placeholder="12"
                      />
                    </div>

                    <div>
                      <Label>Team</Label>
                      <Select
                        value={newStudentForm.team_id}
                        onValueChange={(value) => setNewStudentForm({...newStudentForm, team_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Parent Email</Label>
                      <Input
                        type="email"
                        value={newStudentForm.parent_email}
                        onChange={(e) => setNewStudentForm({...newStudentForm, parent_email: e.target.value})}
                        placeholder="parent@email.com"
                      />
                    </div>

                    <div>
                      <Label>Skill Level</Label>
                      <Select
                        value={newStudentForm.skill_level}
                        onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setNewStudentForm({...newStudentForm, skill_level: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Monthly Fee</Label>
                      <Input
                        type="number"
                        value={newStudentForm.monthly_fee}
                        onChange={(e) => setNewStudentForm({...newStudentForm, monthly_fee: parseInt(e.target.value) || 100})}
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <Button onClick={handleCreateStudent} className="w-full gap-2">
                    <Save className="h-4 w-4" />
                    Add Student
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Goals & Targets Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Team Goals & Performance Targets</h3>
                <div className="text-sm text-gray-600">
                  Set and track team performance goals
                </div>
              </div>

              {/* Team Selection for Goals */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Select Team to Manage Goals</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {teams.map((team) => (
                    <Button
                      key={team.id}
                      onClick={async () => {
                        setSelectedTeamForGoals(team);
                        const goals = await fetchTeamGoals(team.id);
                        setTeamGoals(goals);
                        const metrics = await calculateTeamPerformanceMetrics(team.id);
                        setPerformanceMetrics(metrics);
                      }}
                      variant={selectedTeamForGoals?.id === team.id ? "default" : "outline"}
                      className="p-4 h-auto flex-col items-start"
                    >
                      <div className="font-semibold">{team.name}</div>
                      <div className="text-sm opacity-70">{team.area}</div>
                      <div className="text-xs">
                        {team.student_count || 0} students • ${(team.revenue || 0).toLocaleString()} revenue
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>

              {selectedTeamForGoals && (
                <>
                  {/* Performance Metrics Dashboard */}
                  {performanceMetrics && (
                    <Card className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Performance Metrics for {selectedTeamForGoals.name}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round(performanceMetrics.student_retention_rate)}%
                          </div>
                          <div className="text-sm text-blue-700">Retention Rate</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round(performanceMetrics.average_skill_improvement)}%
                          </div>
                          <div className="text-sm text-green-700">Skill Improvement</div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(performanceMetrics.attendance_rate)}%
                          </div>
                          <div className="text-sm text-purple-700">Attendance Rate</div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            ${Math.round(performanceMetrics.revenue_per_student)}
                          </div>
                          <div className="text-sm text-orange-700">Revenue/Student</div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {performanceMetrics.parent_satisfaction_score}%
                          </div>
                          <div className="text-sm text-yellow-700">Parent Satisfaction</div>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-indigo-600">
                            +{performanceMetrics.monthly_growth_rate}%
                          </div>
                          <div className="text-sm text-indigo-700">Monthly Growth</div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Current Goals */}
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Active Goals ({teamGoals.filter(g => g.status === 'active').length})
                    </h4>
                    <div className="space-y-4">
                      {teamGoals.filter(g => g.status === 'active').map((goal) => {
                        const progressPct = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
                        const isOverdue = new Date(goal.deadline) < new Date();
                        return (
                          <div key={goal.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-semibold">{goal.title}</h5>
                                <p className="text-sm text-gray-600">{goal.description}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant={isOverdue ? "destructive" : progressPct >= 100 ? "default" : "secondary"}>
                                  {Math.round(progressPct)}%
                                </Badge>
                                <div className="text-xs text-gray-500 mt-1">
                                  Due: {new Date(goal.deadline).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="mb-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress: {goal.current_value} / {goal.target_value}</span>
                                <span className="capitalize">{goal.metric_type}</span>
                              </div>
                              <Progress value={Math.min(progressPct, 100)} className="h-2" />
                            </div>
                          </div>
                        );
                      })}

                      {teamGoals.filter(g => g.status === 'active').length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No active goals set for this team. Create a goal below to start tracking progress.
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Add New Goal */}
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Create New Goal</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Goal Title</Label>
                        <Input
                          value={newGoalForm.title}
                          onChange={(e) => setNewGoalForm({...newGoalForm, title: e.target.value})}
                          placeholder="e.g., Increase Student Enrollment"
                        />
                      </div>
                      <div>
                        <Label>Target Value</Label>
                        <Input
                          type="number"
                          value={newGoalForm.target_value}
                          onChange={(e) => setNewGoalForm({...newGoalForm, target_value: parseInt(e.target.value) || 0})}
                          placeholder="e.g., 30"
                        />
                      </div>
                      <div>
                        <Label>Metric Type</Label>
                        <Select
                          value={newGoalForm.metric_type}
                          onValueChange={(value: 'revenue' | 'students' | 'retention' | 'performance' | 'custom') =>
                            setNewGoalForm({...newGoalForm, metric_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="students">Students</SelectItem>
                            <SelectItem value="revenue">Revenue</SelectItem>
                            <SelectItem value="retention">Retention %</SelectItem>
                            <SelectItem value="performance">Performance %</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Deadline</Label>
                        <Input
                          type="date"
                          value={newGoalForm.deadline}
                          onChange={(e) => setNewGoalForm({...newGoalForm, deadline: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newGoalForm.description}
                          onChange={(e) => setNewGoalForm({...newGoalForm, description: e.target.value})}
                          placeholder="Describe the goal and how it will be measured..."
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={async () => {
                        if (!newGoalForm.title || !newGoalForm.deadline || newGoalForm.target_value <= 0) {
                          alert('Please fill in all required fields');
                          return;
                        }
                        try {
                          const goal = await createTeamGoal({
                            team_id: selectedTeamForGoals.id,
                            title: newGoalForm.title,
                            description: newGoalForm.description,
                            target_value: newGoalForm.target_value,
                            current_value: 0,
                            metric_type: newGoalForm.metric_type,
                            deadline: newGoalForm.deadline,
                            status: 'active',
                            created_by: 'current-user' // This should come from auth
                          });
                          setTeamGoals([goal, ...teamGoals]);
                          setNewGoalForm({
                            title: '',
                            description: '',
                            target_value: 0,
                            metric_type: 'students',
                            deadline: ''
                          });
                          alert('Goal created successfully!');
                        } catch (error) {
                          console.error('Error creating goal:', error);
                          alert('Failed to create goal. Please try again.');
                        }
                      }}
                      className="w-full mt-4 gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Create Goal
                    </Button>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* Student Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            {selectedStudentForNotes ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Notes for {selectedStudentForNotes.name}
                  </h3>
                  <Button
                    onClick={() => setSelectedStudentForNotes(null)}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                    Back to Students
                  </Button>
                </div>

                {/* Add New Note */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Add New Note</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Session Notes</Label>
                      <Textarea
                        value={newNote.note}
                        onChange={(e) => setNewNote({...newNote, note: e.target.value})}
                        placeholder="Enter notes about the student's progress, behavior, or any observations..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Skill Rating (1-5)</Label>
                        <Select
                          value={newNote.skill_rating.toString()}
                          onValueChange={(value) => setNewNote({...newNote, skill_rating: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                {rating} {rating === 5 ? '(Excellent)' : rating === 1 ? '(Needs Work)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Attendance (1-5)</Label>
                        <Select
                          value={newNote.attendance_rating.toString()}
                          onValueChange={(value) => setNewNote({...newNote, attendance_rating: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                {rating} {rating === 5 ? '(Perfect)' : rating === 1 ? '(Poor)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Behavior (1-5)</Label>
                        <Select
                          value={newNote.behavior_rating.toString()}
                          onValueChange={(value) => setNewNote({...newNote, behavior_rating: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                {rating} {rating === 5 ? '(Excellent)' : rating === 1 ? '(Disruptive)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={handleAddStudentNote} className="w-full gap-2">
                      <Save className="h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </Card>

                {/* Existing Notes */}
                <div className="space-y-3">
                  {studentNotes.map((note) => (
                    <Card key={note.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">{note.coach_name}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(note.session_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            <Star className="h-3 w-3 mr-1" />
                            Skill: {note.skill_rating}/5
                          </Badge>
                          <Badge variant="outline">Attendance: {note.attendance_rating}/5</Badge>
                          <Badge variant="outline">Behavior: {note.behavior_rating}/5</Badge>
                        </div>
                      </div>
                      <p className="text-gray-700">{note.note}</p>
                    </Card>
                  ))}

                  {studentNotes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No notes yet for this student. Add the first note above!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a student from the Students tab to view and add notes</p>
              </div>
            )}
          </TabsContent>

          {/* Income Tracking Tab */}
          <TabsContent value="income" className="space-y-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Income Tracking</h3>
                <div className="text-sm text-gray-600">
                  Real-time revenue analysis by school and area
                </div>
              </div>

              {/* Area Revenue Summary */}
              <Card className="p-6">
                <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Revenue by Area
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {areas.map((area) => {
                    const areaTeams = teams.filter(t => t.area === area);
                    const areaRevenue = areaTeams.reduce((sum, t) => sum + (t.revenue || 0), 0);
                    const areaStudents = areaTeams.reduce((sum, t) => sum + (t.student_count || 0), 0);
                    const avgRevenuePerStudent = areaStudents > 0 ? Math.round(areaRevenue / areaStudents) : 0;

                    return (
                      <div key={area} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold capitalize">{area}</span>
                          <Badge variant="outline">{areaTeams.length} teams</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Revenue:</span>
                            <span className="font-medium text-green-600">${areaRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Students:</span>
                            <span className="font-medium">{areaStudents}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Avg per Student:</span>
                            <span className="font-medium">${avgRevenuePerStudent}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* School Revenue Analysis */}
              <Card className="p-6">
                <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Revenue by School
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {schools.map((school) => {
                    const schoolTeams = teams.filter(t => t.school_id === school.id);
                    const schoolRevenue = schoolTeams.reduce((sum, t) => sum + (t.revenue || 0), 0);
                    const schoolStudents = schoolTeams.reduce((sum, t) => sum + (t.student_count || 0), 0);
                    const targetRevenue = schoolTeams.reduce((sum, t) => sum + (t.revenue_target || 0), 0);
                    const achievementPct = targetRevenue > 0 ? Math.round((schoolRevenue / targetRevenue) * 100) : 0;

                    return (
                      <div key={school.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-semibold">{school.name}</h5>
                            <p className="text-sm text-gray-600 capitalize">{school.area}</p>
                          </div>
                          <Badge variant={achievementPct >= 100 ? "default" : "secondary"}>
                            {achievementPct}%
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Current Revenue:</span>
                            <span className="font-medium text-green-600">${schoolRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Target Revenue:</span>
                            <span className="font-medium">${targetRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Students:</span>
                            <span className="font-medium">{schoolStudents}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Teams:</span>
                            <span className="font-medium">{schoolTeams.length}</span>
                          </div>
                        </div>

                        <Progress value={achievementPct} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Monthly Income Trends */}
              <Card className="p-6">
                <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Income Performance Overview
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${teams.reduce((sum, t) => sum + (t.revenue || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-700">Total Revenue</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${teams.reduce((sum, t) => sum + (t.revenue_target || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">Target Revenue</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {teams.reduce((sum, t) => sum + (t.student_count || 0), 0)}
                    </div>
                    <div className="text-sm text-purple-700">Total Students</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {teams.length > 0
                        ? Math.round(teams.reduce((sum, t) => sum + (t.target_achievement_pct || 0), 0) / teams.length)
                        : 0}%
                    </div>
                    <div className="text-sm text-orange-700">Avg Performance</div>
                  </div>
                </div>
              </Card>

              {/* Top Performing Revenue Centers */}
              <Card className="p-6">
                <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Top Revenue Performers
                </h4>
                <div className="space-y-3">
                  {teams
                    .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                    .slice(0, 5)
                    .map((team, index) => (
                      <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{team.name}</div>
                            <div className="text-sm text-gray-600">{team.area} • {getSchoolName(team.school_id)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">${(team.revenue || 0).toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{team.student_count || 0} students</div>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}