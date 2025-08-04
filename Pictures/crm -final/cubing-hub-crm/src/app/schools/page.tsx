'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Building, 
  Users, 
  Search, 
  Plus,
  Eye,
  Edit,
  TrendingUp,
  School
} from 'lucide-react'
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents'
import SchoolDetailsModal from '@/components/schools/SchoolDetailsModal'

interface SchoolWithStats {
  id: string
  name: string
  target_enrollment: number
  current_enrollment: number
  monthly_cost: number
  program_fee_per_student: number
  active_students: number
  inactive_students: number
  total_students: number
  completion_rate: number
  created_at: string
}

export default function SchoolsPage() {
  const { students, loading } = useSupabaseStudents()
  const [searchQuery, setSearchQuery] = useState('')
  const [schools, setSchools] = useState<SchoolWithStats[]>([])
  const [selectedSchool, setSelectedSchool] = useState<SchoolWithStats | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Calculate school statistics from students data
  useEffect(() => {
    if (students.length > 0) {
      const schoolsMap = new Map<string, SchoolWithStats>()
      
      students.forEach(student => {
        const schoolId = student.school_id
        const schoolName = student.schools?.name || 'Unknown School'
        
        if (!schoolsMap.has(schoolId)) {
          schoolsMap.set(schoolId, {
            id: schoolId,
            name: schoolName,
            target_enrollment: student.schools?.target_enrollment || 30,
            current_enrollment: 0,
            monthly_cost: student.schools?.monthly_cost || 2500,
            program_fee_per_student: student.schools?.program_fee_per_student || 450,
            active_students: 0,
            inactive_students: 0,
            total_students: 0,
            completion_rate: 0,
            created_at: student.schools?.created_at || new Date().toISOString()
          })
        }
        
        const school = schoolsMap.get(schoolId)!
        school.total_students++
        
        if (student.status === 'active' || student.status === 'in_progress') {
          school.active_students++
        } else {
          school.inactive_students++
        }
        
        if (student.status === 'completed') {
          school.completion_rate++
        }
      })
      
      // Calculate completion rates
      schoolsMap.forEach(school => {
        school.current_enrollment = school.active_students
        school.completion_rate = school.total_students > 0 
          ? Math.round((school.completion_rate / school.total_students) * 100) 
          : 0
      })
      
      setSchools(Array.from(schoolsMap.values()).sort((a, b) => a.name.localeCompare(b.name)))
    }
  }, [students])

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalStats = {
    totalSchools: schools.length,
    totalStudents: schools.reduce((sum, school) => sum + school.total_students, 0),
    totalActive: schools.reduce((sum, school) => sum + school.active_students, 0),
    totalRevenue: schools.reduce((sum, school) => sum + (school.active_students * school.program_fee_per_student), 0),
    avgEnrollment: schools.length > 0 ? Math.round(schools.reduce((sum, school) => sum + school.active_students, 0) / schools.length * 10) / 10 : 0
  }

  const handleViewSchool = (school: SchoolWithStats) => {
    setSelectedSchool(school)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading schools...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Schools Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add School
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalSchools}</div>
            <p className="text-xs text-muted-foreground">Active partnerships</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across all schools</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalActive}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{totalStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From active students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Enrollment</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.avgEnrollment}</div>
            <p className="text-xs text-muted-foreground">Students per school</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle>School Details</CardTitle>
          <CardDescription>
            Overview of all schools with student enrollment and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead className="text-center">Active Students</TableHead>
                <TableHead className="text-center">Total Students</TableHead>
                <TableHead className="text-center">Target</TableHead>
                <TableHead className="text-center">Progress</TableHead>
                <TableHead className="text-center">Completion Rate</TableHead>
                <TableHead className="text-right">Monthly Revenue</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => {
                const progressPercentage = Math.round((school.active_students / school.target_enrollment) * 100)
                const monthlyRevenue = school.active_students * school.program_fee_per_student
                
                return (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {school.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {school.active_students}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {school.total_students}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{school.target_enrollment}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              progressPercentage >= 100 ? 'bg-green-500' : 
                              progressPercentage >= 75 ? 'bg-blue-500' : 
                              progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[3rem]">
                          {progressPercentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={school.completion_rate >= 80 ? "default" : "secondary"}>
                        {school.completion_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R{monthlyRevenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewSchool(school)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {filteredSchools.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No schools found matching your search.' : 'No schools found.'}
            </div>
          )}
        </CardContent>
      </Card>

      <SchoolDetailsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        school={selectedSchool}
        students={students}
      />
    </div>
  )
}