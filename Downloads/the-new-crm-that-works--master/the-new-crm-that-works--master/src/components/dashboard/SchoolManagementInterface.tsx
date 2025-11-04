'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building,
  MapPin,
  Users,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  Save,
  X,
  School as SchoolIcon,
  Target,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';

import {
  fetchAllSchools,
  fetchSchoolsByArea,
  fetchIncomeBySchool,
  fetchAllTeams,
  fetchStudentsByTeam,
  createSchool,
  type School,
  type Team,
  type Student
} from '@/lib/db/teams';

export default function SchoolManagementInterface() {
  const [schools, setSchools] = useState<School[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolStudents, setSchoolStudents] = useState<Student[]>([]);
  const [schoolIncome, setSchoolIncome] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [newSchoolOpen, setNewSchoolOpen] = useState(false);
  const [newSchoolForm, setNewSchoolForm] = useState({
    name: '',
    address: '',
    area: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    contract_start: '',
    contract_end: '',
    student_capacity: 50,
    monthly_revenue: 0,
    notes: ''
  });

  const areas = ['North', 'South', 'East', 'West', 'Central'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schoolsData, teamsData] = await Promise.all([
        fetchAllSchools(),
        fetchAllTeams()
      ]);

      setSchools(schoolsData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchoolDetails = async (school: School) => {
    setSelectedSchool(school);
    setDetailsOpen(true);

    try {
      // Get teams and students for this school
      const schoolTeams = teams.filter(t => t.school_id === school.id);
      const studentsPromises = schoolTeams.map(team => fetchStudentsByTeam(team.id));
      const studentsArrays = await Promise.all(studentsPromises);
      const allStudents = studentsArrays.flat();

      setSchoolStudents(allStudents);

      // Get income data
      const incomeData = await fetchIncomeBySchool(school.id);
      setSchoolIncome(incomeData);
    } catch (error) {
      console.error('Error fetching school details:', error);
    }
  };

  const handleCreateSchool = async () => {
    if (!newSchoolForm.name || !newSchoolForm.area || !newSchoolForm.contact_person) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const school = await createSchool({
        name: newSchoolForm.name,
        address: newSchoolForm.address,
        area: newSchoolForm.area,
        contact_person: newSchoolForm.contact_person,
        contact_email: newSchoolForm.contact_email,
        contact_phone: newSchoolForm.contact_phone,
        contract_start: newSchoolForm.contract_start,
        contract_end: newSchoolForm.contract_end || undefined,
        student_capacity: newSchoolForm.student_capacity,
        current_students: 0,
        monthly_revenue: newSchoolForm.monthly_revenue,
        status: 'active',
        notes: newSchoolForm.notes || undefined
      });

      setSchools([school, ...schools]);
      setNewSchoolForm({
        name: '',
        address: '',
        area: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        contract_start: '',
        contract_end: '',
        student_capacity: 50,
        monthly_revenue: 0,
        notes: ''
      });
      setNewSchoolOpen(false);
      alert('School added successfully!');
    } catch (error) {
      console.error('Error creating school:', error);
      alert('Failed to add school. Please try again.');
    }
  };

  const getSchoolTeams = (schoolId: string) => {
    return teams.filter(t => t.school_id === schoolId);
  };

  const getSchoolStats = (school: School) => {
    const schoolTeams = getSchoolTeams(school.id);
    const totalStudents = schoolTeams.reduce((sum, team) => sum + (team.student_count || 0), 0);
    const totalRevenue = schoolTeams.reduce((sum, team) => sum + (team.revenue || 0), 0);
    const avgPerformance = schoolTeams.length > 0
      ? Math.round(schoolTeams.reduce((sum, team) => sum + (team.target_achievement_pct || 0), 0) / schoolTeams.length)
      : 0;

    return {
      totalStudents,
      totalRevenue,
      avgPerformance,
      teamCount: schoolTeams.length,
      utilizationRate: Math.round((totalStudents / school.student_capacity) * 100)
    };
  };

  const filteredSchools = selectedArea === 'all'
    ? schools
    : schools.filter(school => school.area === selectedArea);

  const areaStats = areas.map(area => {
    const areaSchools = schools.filter(s => s.area === area);
    const totalRevenue = areaSchools.reduce((sum, school) => {
      const stats = getSchoolStats(school);
      return sum + stats.totalRevenue;
    }, 0);
    const totalStudents = areaSchools.reduce((sum, school) => {
      const stats = getSchoolStats(school);
      return sum + stats.totalStudents;
    }, 0);

    return {
      area,
      schoolCount: areaSchools.length,
      totalRevenue,
      totalStudents,
      avgRevenue: areaSchools.length > 0 ? Math.round(totalRevenue / areaSchools.length) : 0
    };
  });

  if (loading) return <div className="p-6">Loading schools...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Building className="h-8 w-8 text-blue-600" />
            School Management
          </h1>
          <p className="text-gray-600">Manage school partnerships and track performance</p>
        </div>
        <Button
          onClick={() => setNewSchoolOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New School
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="analytics">Area Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{schools.length}</div>
                  <div className="text-sm text-gray-600">Total Schools</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {schools.reduce((sum, school) => {
                      const stats = getSchoolStats(school);
                      return sum + stats.totalStudents;
                    }, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    ${schools.reduce((sum, school) => {
                      const stats = getSchoolStats(school);
                      return sum + stats.totalRevenue;
                    }, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {schools.length > 0
                      ? Math.round(schools.reduce((sum, school) => {
                          const stats = getSchoolStats(school);
                          return sum + stats.avgPerformance;
                        }, 0) / schools.length)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Performance</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Area Performance Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Area Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {areaStats.map((area) => (
                <div key={area.area} className="border rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{area.area}</h4>
                    <Badge variant="outline">{area.schoolCount} schools</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{area.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">${area.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg/School:</span>
                      <span className="font-medium">${area.avgRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Schools Tab */}
        <TabsContent value="schools" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Schools ({filteredSchools.length})</h3>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school) => {
              const stats = getSchoolStats(school);
              return (
                <Card key={school.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{school.name}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {school.area}
                      </p>
                    </div>
                    <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                      {school.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium">{school.contact_person}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">
                        {stats.totalStudents}/{school.student_capacity}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{stats.utilizationRate}%</span>
                      </div>
                      <Progress value={stats.utilizationRate} className="h-2" />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Teams:</span>
                      <span className="font-medium">{stats.teamCount}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">${stats.totalRevenue.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Performance:</span>
                      <span className="font-medium">{stats.avgPerformance}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleViewSchoolDetails(school)}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Details
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
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue by Area</h3>
            <div className="space-y-4">
              {areaStats.map((area) => (
                <div key={area.area} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <div className="font-semibold">{area.area}</div>
                    <div className="text-sm text-gray-600">{area.schoolCount} schools</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${area.totalRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{area.totalStudents} students</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* School Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {selectedSchool?.name} - School Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive information and performance metrics
            </DialogDescription>
          </DialogHeader>

          {selectedSchool && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="h-3 w-3 text-gray-400" />
                      <span>{selectedSchool.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span>{selectedSchool.contact_person}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span>{selectedSchool.contact_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{selectedSchool.contact_phone}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Contract Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span>{new Date(selectedSchool.contract_start).toLocaleDateString()}</span>
                    </div>
                    {selectedSchool.contract_end && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span>{new Date(selectedSchool.contract_end).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Revenue:</span>
                      <span>${(selectedSchool.monthly_revenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span>{selectedSchool.student_capacity} students</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Teams at this school */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Teams ({getSchoolTeams(selectedSchool.id).length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getSchoolTeams(selectedSchool.id).map((team) => (
                    <div key={team.id} className="border rounded p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{team.name}</div>
                          <div className="text-sm text-gray-600">{team.student_count || 0} students</div>
                        </div>
                        <Badge variant={team.target_achievement_pct >= 100 ? 'default' : 'secondary'}>
                          {team.target_achievement_pct || 0}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Students */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Students ({schoolStudents.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {schoolStudents.map((student) => (
                    <div key={student.id} className="border rounded p-3">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-600">
                        Age: {student.age || 'N/A'} • {student.skill_level}
                      </div>
                      <div className="text-sm text-gray-600">
                        Fee: ${student.monthly_fee}/month
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {selectedSchool.notes && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Notes</h4>
                  <p className="text-gray-700">{selectedSchool.notes}</p>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add New School Modal */}
      <Dialog open={newSchoolOpen} onOpenChange={setNewSchoolOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New School Partnership</DialogTitle>
            <DialogDescription>
              Create a new school partnership and set up initial details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>School Name *</Label>
                <Input
                  value={newSchoolForm.name}
                  onChange={(e) => setNewSchoolForm({...newSchoolForm, name: e.target.value})}
                  placeholder="Lincoln Elementary School"
                />
              </div>

              <div>
                <Label>Area *</Label>
                <Select
                  value={newSchoolForm.area}
                  onValueChange={(value) => setNewSchoolForm({...newSchoolForm, area: value})}
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
            </div>

            <div>
              <Label>Address</Label>
              <Input
                value={newSchoolForm.address}
                onChange={(e) => setNewSchoolForm({...newSchoolForm, address: e.target.value})}
                placeholder="123 Main St, Springfield, IL"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Contact Person *</Label>
                <Input
                  value={newSchoolForm.contact_person}
                  onChange={(e) => setNewSchoolForm({...newSchoolForm, contact_person: e.target.value})}
                  placeholder="Principal Johnson"
                />
              </div>

              <div>
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={newSchoolForm.contact_email}
                  onChange={(e) => setNewSchoolForm({...newSchoolForm, contact_email: e.target.value})}
                  placeholder="principal@school.edu"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={newSchoolForm.contact_phone}
                  onChange={(e) => setNewSchoolForm({...newSchoolForm, contact_phone: e.target.value})}
                  placeholder="+1-555-0123"
                />
              </div>

              <div>
                <Label>Student Capacity</Label>
                <Input
                  type="number"
                  value={newSchoolForm.student_capacity}
                  onChange={(e) => setNewSchoolForm({...newSchoolForm, student_capacity: parseInt(e.target.value) || 50})}
                  placeholder="50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Contract Start Date</Label>
                <Input
                  type="date"
                  value={newSchoolForm.contract_start}
                  onChange={(e) => setNewSchoolForm({...newSchoolForm, contract_start: e.target.value})}
                />
              </div>

              <div>
                <Label>Contract End Date (Optional)</Label>
                <Input
                  type="date"
                  value={newSchoolForm.contract_end}
                  onChange={(e) => setNewSchoolForm({...newSchoolForm, contract_end: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label>Expected Monthly Revenue</Label>
              <Input
                type="number"
                value={newSchoolForm.monthly_revenue}
                onChange={(e) => setNewSchoolForm({...newSchoolForm, monthly_revenue: parseInt(e.target.value) || 0})}
                placeholder="3500"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={newSchoolForm.notes}
                onChange={(e) => setNewSchoolForm({...newSchoolForm, notes: e.target.value})}
                placeholder="Additional notes about this partnership..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={() => setNewSchoolOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleCreateSchool} className="gap-2">
                <Save className="h-4 w-4" />
                Add School
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}