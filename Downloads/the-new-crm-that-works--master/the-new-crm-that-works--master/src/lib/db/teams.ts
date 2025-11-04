import { supabase } from '@/lib/supabase';

export interface Team {
  id: string;
  name: string;
  area: string;
  school_id?: string;
  coach_id?: string;
  assistant_coaches?: string[];
  student_count?: number;
  revenue?: number;
  revenue_target?: number;
  target_achievement_pct?: number;
  status: 'active' | 'inactive' | 'pending';
  goals?: TeamGoal[];
  performance_metrics?: PerformanceMetrics;
  created_at: string;
  updated_at: string;
}

export interface TeamGoal {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  metric_type: 'revenue' | 'students' | 'retention' | 'performance' | 'custom';
  deadline: string;
  status: 'active' | 'completed' | 'overdue' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetrics {
  student_retention_rate: number;
  average_skill_improvement: number;
  parent_satisfaction_score: number;
  attendance_rate: number;
  revenue_per_student: number;
  monthly_growth_rate: number;
}

export interface Coach {
  id: string;
  name: string;
  email: string;
  phone?: string;
  area: string;
  school_id?: string;
  team_ids: string[];
  hire_date: string;
  salary?: number;
  role: 'head_coach' | 'assistant_coach' | 'substitute';
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  name: string;
  age?: number;
  school_id?: string;
  team_id?: string;
  parent_email?: string;
  parent_phone?: string;
  enrollment_date: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  status: 'active' | 'inactive' | 'graduated';
  notes?: StudentNote[];
  monthly_fee?: number;
  created_at: string;
  updated_at: string;
}

export interface StudentNote {
  id: string;
  student_id: string;
  coach_id: string;
  coach_name: string;
  note: string;
  session_date: string;
  skill_rating?: number;
  attendance_rating?: number;
  behavior_rating?: number;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  address: string;
  area: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  contract_start: string;
  contract_end?: string;
  monthly_revenue?: number;
  student_capacity: number;
  current_students: number;
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Teams Operations
export async function fetchAllTeams(): Promise<Team[]> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teams:', error);
      // Return mock data as fallback
      return getMockTeams();
    }

    return data || getMockTeams();
  } catch (error) {
    console.error('Error in fetchAllTeams:', error);
    return getMockTeams();
  }
}


export async function createTeam(team: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<Team> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert([{
        ...team,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating team:', error);
      // Return mock success for development
      const mockTeam: Team = {
        ...team,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockTeam;
    }

    return data;
  } catch (error) {
    console.error('Error in createTeam:', error);
    throw new Error('Failed to create team');
  }
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team:', error);
      throw new Error('Failed to update team');
    }

    return data;
  } catch (error) {
    console.error('Error in updateTeam:', error);
    throw new Error('Failed to update team');
  }
}

export async function deleteTeam(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team:', error);
      throw new Error('Failed to delete team');
    }
  } catch (error) {
    console.error('Error in deleteTeam:', error);
    throw new Error('Failed to delete team');
  }
}

// Coaches Operations
export async function fetchAllCoaches(): Promise<Coach[]> {
  try {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coaches:', error);
      return getMockCoaches();
    }

    return data || getMockCoaches();
  } catch (error) {
    console.error('Error in fetchAllCoaches:', error);
    return getMockCoaches();
  }
}

export async function createCoach(coach: Omit<Coach, 'id' | 'created_at' | 'updated_at'>): Promise<Coach> {
  try {
    const { data, error } = await supabase
      .from('coaches')
      .insert([{
        ...coach,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating coach:', error);
      const mockCoach: Coach = {
        ...coach,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockCoach;
    }

    return data;
  } catch (error) {
    console.error('Error in createCoach:', error);
    throw new Error('Failed to create coach');
  }
}

// Students Operations
export async function fetchAllStudents(): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching students:', error);
      return getMockStudents();
    }

    return data || getMockStudents();
  } catch (error) {
    console.error('Error in fetchAllStudents:', error);
    return getMockStudents();
  }
}

export async function fetchStudentsByTeam(teamId: string): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team students:', error);
      return getMockStudents().filter(s => s.team_id === teamId);
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchStudentsByTeam:', error);
    return getMockStudents().filter(s => s.team_id === teamId);
  }
}

export async function createStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert([{
        ...student,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating student:', error);
      const mockStudent: Student = {
        ...student,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockStudent;
    }

    return data;
  } catch (error) {
    console.error('Error in createStudent:', error);
    throw new Error('Failed to create student');
  }
}

// Student Notes Operations
export async function fetchStudentNotes(studentId: string): Promise<StudentNote[]> {
  try {
    const { data, error } = await supabase
      .from('student_notes')
      .select('*')
      .eq('student_id', studentId)
      .order('session_date', { ascending: false });

    if (error) {
      console.error('Error fetching student notes:', error);
      return getMockStudentNotes().filter(n => n.student_id === studentId);
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchStudentNotes:', error);
    return getMockStudentNotes().filter(n => n.student_id === studentId);
  }
}

export async function createStudentNote(note: Omit<StudentNote, 'id' | 'created_at'>): Promise<StudentNote> {
  try {
    const { data, error } = await supabase
      .from('student_notes')
      .insert([{
        ...note,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating student note:', error);
      const mockNote: StudentNote = {
        ...note,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      return mockNote;
    }

    return data;
  } catch (error) {
    console.error('Error in createStudentNote:', error);
    throw new Error('Failed to create student note');
  }
}

// Schools Operations
export async function fetchAllSchools(): Promise<School[]> {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching schools:', error);
      return getMockSchools();
    }

    return data || getMockSchools();
  } catch (error) {
    console.error('Error in fetchAllSchools:', error);
    return getMockSchools();
  }
}

export async function fetchSchoolsByArea(area: string): Promise<School[]> {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('area', area)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching schools by area:', error);
      return getMockSchools().filter(s => s.area.toLowerCase() === area.toLowerCase());
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchSchoolsByArea:', error);
    return getMockSchools().filter(s => s.area.toLowerCase() === area.toLowerCase());
  }
}

export async function createSchool(school: Omit<School, 'id' | 'created_at' | 'updated_at'>): Promise<School> {
  try {
    const { data, error } = await supabase
      .from('schools')
      .insert([{
        ...school,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating school:', error);
      const mockSchool: School = {
        ...school,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockSchool;
    }

    return data;
  } catch (error) {
    console.error('Error in createSchool:', error);
    throw new Error('Failed to create school');
  }
}

// Income Tracking
export async function fetchIncomeBySchool(schoolId: string, year?: number): Promise<any[]> {
  try {
    const targetYear = year || new Date().getFullYear();
    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .eq('school_id', schoolId)
      .gte('month_year', `${targetYear}-01`)
      .lte('month_year', `${targetYear}-12`)
      .order('month_year', { ascending: true });

    if (error) {
      console.error('Error fetching school income:', error);
      return getMockIncomeData().filter(i => i.school_id === schoolId);
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchIncomeBySchool:', error);
    return getMockIncomeData().filter(i => i.school_id === schoolId);
  }
}

export async function fetchIncomeByArea(area: string, year?: number): Promise<any[]> {
  try {
    const targetYear = year || new Date().getFullYear();
    // This would need a view or join with schools table
    const schools = await fetchSchoolsByArea(area);
    const schoolIds = schools.map(s => s.id);

    const incomeData = [];
    for (const schoolId of schoolIds) {
      const schoolIncome = await fetchIncomeBySchool(schoolId, targetYear);
      incomeData.push(...schoolIncome);
    }

    return incomeData;
  } catch (error) {
    console.error('Error in fetchIncomeByArea:', error);
    return getMockIncomeData().filter(i => {
      const schools = getMockSchools().filter(s => s.area.toLowerCase() === area.toLowerCase());
      return schools.some(s => s.id === i.school_id);
    });
  }
}

// Mock Data Functions
function getMockTeams(): Team[] {
  return [
    {
      id: '1',
      name: 'Team Alpha',
      area: 'North',
      school_id: 'school-1',
      coach_id: 'coach-1',
      assistant_coaches: ['coach-2'],
      student_count: 25,
      revenue: 12500,
      revenue_target: 15000,
      target_achievement_pct: 83,
      status: 'active',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-02-20T00:00:00Z'
    },
    {
      id: '2',
      name: 'Team Beta',
      area: 'South',
      school_id: 'school-2',
      coach_id: 'coach-3',
      assistant_coaches: ['coach-4', 'coach-5'],
      student_count: 32,
      revenue: 18500,
      revenue_target: 18000,
      target_achievement_pct: 103,
      status: 'active',
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-02-18T00:00:00Z'
    },
    {
      id: '3',
      name: 'Team Gamma',
      area: 'East',
      school_id: 'school-3',
      coach_id: 'coach-6',
      assistant_coaches: [],
      student_count: 18,
      revenue: 9200,
      revenue_target: 12000,
      target_achievement_pct: 77,
      status: 'active',
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-25T00:00:00Z'
    }
  ];
}

function getMockCoaches(): Coach[] {
  return [
    {
      id: 'coach-1',
      name: 'John Smith',
      email: 'john.smith@cubing.com',
      phone: '+1-555-0101',
      area: 'North',
      school_id: 'school-1',
      team_ids: ['1'],
      hire_date: '2023-08-15',
      salary: 55000,
      role: 'head_coach',
      status: 'active',
      notes: 'Excellent with beginners, great communication skills',
      created_at: '2023-08-15T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z'
    },
    {
      id: 'coach-2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@cubing.com',
      phone: '+1-555-0102',
      area: 'North',
      school_id: 'school-1',
      team_ids: ['1'],
      hire_date: '2023-09-01',
      salary: 35000,
      role: 'assistant_coach',
      status: 'active',
      notes: 'Strong technical background, helps with advanced students',
      created_at: '2023-09-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'coach-3',
      name: 'Mike Wilson',
      email: 'mike.wilson@cubing.com',
      phone: '+1-555-0103',
      area: 'South',
      school_id: 'school-2',
      team_ids: ['2'],
      hire_date: '2023-07-20',
      salary: 58000,
      role: 'head_coach',
      status: 'active',
      notes: 'Competitive background, motivates students well',
      created_at: '2023-07-20T00:00:00Z',
      updated_at: '2024-02-10T00:00:00Z'
    }
  ];
}

function getMockStudents(): Student[] {
  return [
    {
      id: 'student-1',
      name: 'Alex Chen',
      age: 12,
      school_id: 'school-1',
      team_id: '1',
      parent_email: 'parent.chen@email.com',
      parent_phone: '+1-555-1001',
      enrollment_date: '2024-01-15',
      skill_level: 'intermediate',
      status: 'active',
      monthly_fee: 120,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-02-20T00:00:00Z'
    },
    {
      id: 'student-2',
      name: 'Emma Rodriguez',
      age: 10,
      school_id: 'school-1',
      team_id: '1',
      parent_email: 'rodriguez.family@email.com',
      parent_phone: '+1-555-1002',
      enrollment_date: '2024-01-20',
      skill_level: 'beginner',
      status: 'active',
      monthly_fee: 100,
      created_at: '2024-01-20T00:00:00Z',
      updated_at: '2024-02-15T00:00:00Z'
    },
    {
      id: 'student-3',
      name: 'David Kim',
      age: 14,
      school_id: 'school-2',
      team_id: '2',
      parent_email: 'kim.family@email.com',
      parent_phone: '+1-555-1003',
      enrollment_date: '2024-02-01',
      skill_level: 'advanced',
      status: 'active',
      monthly_fee: 150,
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-25T00:00:00Z'
    }
  ];
}

function getMockStudentNotes(): StudentNote[] {
  return [
    {
      id: 'note-1',
      student_id: 'student-1',
      coach_id: 'coach-1',
      coach_name: 'John Smith',
      note: 'Alex is improving rapidly with 3x3 solving. Working on F2L now. Great attitude and focus.',
      session_date: '2024-02-20',
      skill_rating: 4,
      attendance_rating: 5,
      behavior_rating: 5,
      created_at: '2024-02-20T18:00:00Z'
    },
    {
      id: 'note-2',
      student_id: 'student-2',
      coach_id: 'coach-1',
      coach_name: 'John Smith',
      note: 'Emma learned the daisy pattern today. Very excited and engaged. Parents are supportive.',
      session_date: '2024-02-20',
      skill_rating: 2,
      attendance_rating: 5,
      behavior_rating: 5,
      created_at: '2024-02-20T18:15:00Z'
    },
    {
      id: 'note-3',
      student_id: 'student-3',
      coach_id: 'coach-3',
      coach_name: 'Mike Wilson',
      note: 'David is working on advanced algorithms. Considering him for competition team.',
      session_date: '2024-02-25',
      skill_rating: 5,
      attendance_rating: 4,
      behavior_rating: 4,
      created_at: '2024-02-25T17:30:00Z'
    }
  ];
}

function getMockSchools(): School[] {
  return [
    {
      id: 'school-1',
      name: 'Lincoln Elementary',
      address: '123 Main St, Springfield, IL',
      area: 'North',
      contact_person: 'Principal Johnson',
      contact_email: 'principal@lincoln.edu',
      contact_phone: '+1-555-2001',
      contract_start: '2023-09-01',
      contract_end: '2024-06-30',
      monthly_revenue: 3500,
      student_capacity: 50,
      current_students: 25,
      status: 'active',
      notes: 'Very supportive administration. Program running smoothly.',
      created_at: '2023-09-01T00:00:00Z',
      updated_at: '2024-02-15T00:00:00Z'
    },
    {
      id: 'school-2',
      name: 'Washington Middle School',
      address: '456 Oak Ave, Springfield, IL',
      area: 'South',
      contact_person: 'Vice Principal Davis',
      contact_email: 'vp.davis@washington.edu',
      contact_phone: '+1-555-2002',
      contract_start: '2023-08-15',
      contract_end: '2024-05-31',
      monthly_revenue: 4200,
      student_capacity: 60,
      current_students: 32,
      status: 'active',
      notes: 'Great facilities. Students are very engaged.',
      created_at: '2023-08-15T00:00:00Z',
      updated_at: '2024-02-20T00:00:00Z'
    },
    {
      id: 'school-3',
      name: 'Roosevelt High School',
      address: '789 Pine St, Springfield, IL',
      area: 'East',
      contact_person: 'Activities Director Smith',
      contact_email: 'activities@roosevelt.edu',
      contact_phone: '+1-555-2003',
      contract_start: '2024-01-15',
      contract_end: '2024-12-31',
      monthly_revenue: 2800,
      student_capacity: 40,
      current_students: 18,
      status: 'active',
      notes: 'New partnership. Building momentum slowly.',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-02-10T00:00:00Z'
    }
  ];
}

function getMockIncomeData(): any[] {
  return [
    {
      id: '1',
      school_id: 'school-1',
      month_year: '2024-01',
      revenue_amount: 3500,
      student_count: 25,
      cost_salaries: 2200,
      cost_operations: 300,
      cost_marketing: 200,
      profit: 800
    },
    {
      id: '2',
      school_id: 'school-1',
      month_year: '2024-02',
      revenue_amount: 3500,
      student_count: 25,
      cost_salaries: 2200,
      cost_operations: 280,
      cost_marketing: 150,
      profit: 870
    },
    {
      id: '3',
      school_id: 'school-2',
      month_year: '2024-01',
      revenue_amount: 4200,
      student_count: 30,
      cost_salaries: 2800,
      cost_operations: 350,
      cost_marketing: 250,
      profit: 800
    },
    {
      id: '4',
      school_id: 'school-2',
      month_year: '2024-02',
      revenue_amount: 4500,
      student_count: 32,
      cost_salaries: 2800,
      cost_operations: 380,
      cost_marketing: 200,
      profit: 1120
    }
  ];
}

// Team Goals Management
export async function fetchTeamGoals(teamId: string): Promise<TeamGoal[]> {
  try {
    const { data, error } = await supabase
      .from('team_goals')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team goals:', error);
      return getMockTeamGoals().filter(g => g.team_id === teamId);
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchTeamGoals:', error);
    return getMockTeamGoals().filter(g => g.team_id === teamId);
  }
}

export async function createTeamGoal(goal: Omit<TeamGoal, 'id' | 'created_at' | 'updated_at'>): Promise<TeamGoal> {
  try {
    const { data, error } = await supabase
      .from('team_goals')
      .insert([{
        ...goal,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating team goal:', error);
      const mockGoal: TeamGoal = {
        ...goal,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockGoal;
    }

    return data;
  } catch (error) {
    console.error('Error in createTeamGoal:', error);
    throw new Error('Failed to create team goal');
  }
}

export async function updateTeamGoal(goalId: string, updates: Partial<TeamGoal>): Promise<TeamGoal> {
  try {
    const { data, error } = await supabase
      .from('team_goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) {
      console.error('Error updating team goal:', error);
      throw new Error('Failed to update team goal');
    }

    return data;
  } catch (error) {
    console.error('Error in updateTeamGoal:', error);
    throw new Error('Failed to update team goal');
  }
}

// Connect with existing Students CRM
export async function fetchStudentsFromCRM(): Promise<Student[]> {
  try {
    // Try to fetch from the main students table first
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching students from CRM:', error);
      return getMockStudents();
    }

    return data || getMockStudents();
  } catch (error) {
    console.error('Error in fetchStudentsFromCRM:', error);
    return getMockStudents();
  }
}

export async function assignStudentToTeam(studentId: string, teamId: string): Promise<Student> {
  try {
    const { data, error } = await supabase
      .from('students')
      .update({
        team_id: teamId,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      console.error('Error assigning student to team:', error);
      throw new Error('Failed to assign student to team');
    }

    return data;
  } catch (error) {
    console.error('Error in assignStudentToTeam:', error);
    throw new Error('Failed to assign student to team');
  }
}

export async function calculateTeamPerformanceMetrics(teamId: string): Promise<PerformanceMetrics> {
  try {
    const teamStudents = await fetchStudentsByTeam(teamId);
    const studentNotes = await Promise.all(
      teamStudents.map(student => fetchStudentNotes(student.id))
    );

    const allNotes = studentNotes.flat();
    const activeStudents = teamStudents.filter(s => s.status === 'active');

    // Calculate metrics
    const totalStudents = teamStudents.length;
    const retainedStudents = activeStudents.length;
    const student_retention_rate = totalStudents > 0 ? (retainedStudents / totalStudents) * 100 : 0;

    const skillRatings = allNotes.map(note => note.skill_rating);
    const average_skill_improvement = skillRatings.length > 0
      ? skillRatings.reduce((sum, rating) => sum + rating, 0) / skillRatings.length * 20 // Convert to percentage
      : 0;

    const attendanceRatings = allNotes.map(note => note.attendance_rating);
    const attendance_rate = attendanceRatings.length > 0
      ? attendanceRatings.reduce((sum, rating) => sum + rating, 0) / attendanceRatings.length * 20 // Convert to percentage
      : 0;

    // Mock values for metrics that would require more complex calculations
    const parent_satisfaction_score = 85; // Would come from surveys

    const team = await fetchTeamById(teamId);
    const revenue_per_student = team && team.revenue && activeStudents.length > 0
      ? team.revenue / activeStudents.length
      : 0;

    const monthly_growth_rate = 5.2; // Would be calculated from historical data

    return {
      student_retention_rate,
      average_skill_improvement,
      parent_satisfaction_score,
      attendance_rate,
      revenue_per_student,
      monthly_growth_rate
    };
  } catch (error) {
    console.error('Error calculating team performance metrics:', error);
    return {
      student_retention_rate: 0,
      average_skill_improvement: 0,
      parent_satisfaction_score: 0,
      attendance_rate: 0,
      revenue_per_student: 0,
      monthly_growth_rate: 0
    };
  }
}

export async function fetchTeamById(teamId: string): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (error) {
      console.error('Error fetching team by ID:', error);
      const mockTeams = getMockTeams();
      return mockTeams.find(t => t.id === teamId) || null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchTeamById:', error);
    const mockTeams = getMockTeams();
    return mockTeams.find(t => t.id === teamId) || null;
  }
}

function getMockTeamGoals(): TeamGoal[] {
  return [
    {
      id: 'goal-1',
      team_id: '1',
      title: 'Increase Student Enrollment',
      description: 'Reach 30 active students by end of quarter',
      target_value: 30,
      current_value: 25,
      metric_type: 'students',
      deadline: '2024-03-31',
      status: 'active',
      created_by: 'coach-1',
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-20T00:00:00Z'
    },
    {
      id: 'goal-2',
      team_id: '1',
      title: 'Revenue Target Q1',
      description: 'Achieve $18,000 monthly recurring revenue',
      target_value: 18000,
      current_value: 12500,
      metric_type: 'revenue',
      deadline: '2024-03-31',
      status: 'active',
      created_by: 'admin',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-02-25T00:00:00Z'
    },
    {
      id: 'goal-3',
      team_id: '2',
      title: 'Student Retention Goal',
      description: 'Maintain 95% student retention rate',
      target_value: 95,
      current_value: 87,
      metric_type: 'retention',
      deadline: '2024-06-30',
      status: 'active',
      created_by: 'coach-3',
      created_at: '2024-02-10T00:00:00Z',
      updated_at: '2024-02-28T00:00:00Z'
    }
  ];
}
