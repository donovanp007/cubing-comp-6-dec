'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  School,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents'
import { useSupabaseSchools } from '@/hooks/useSupabaseSchools'
import SchoolDetailsModal from '@/components/schools/SchoolDetailsModal'
import AddSchoolModal from '@/components/schools/AddSchoolModal'

interface SchoolWithStats {
  id: string
  name: string
  target_enrollment: number
  current_enrollment: number
  monthly_cost: number
  program_fee_per_student: number
  term_fee_per_student: number
  active_students: number
  inactive_students: number
  total_students: number
  completion_rate: number
  created_at: string
}

export default function SchoolsPage() {
  const { students, loading: studentsLoading } = useSupabaseStudents()
  const { schools: allSchools, createSchool, loading: schoolsLoading } = useSupabaseSchools()
  const [searchQuery, setSearchQuery] = useState('')
  const [schools, setSchools] = useState<SchoolWithStats[]>([])
  const [addSchoolModalOpen, setAddSchoolModalOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<SchoolWithStats | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [schoolToDelete, setSchoolToDelete] = useState<SchoolWithStats | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Calculate school statistics from all schools and students data
  useEffect(() => {
    if (allSchools.length > 0) {
      const schoolsMap = new Map<string, SchoolWithStats>()

      // First, add all schools with default stats
      allSchools.forEach(school => {
        schoolsMap.set(school.id, {
          id: school.id,
          name: school.name,
          target_enrollment: school.target_enrollment ?? 0,
          current_enrollment: 0,
          monthly_cost: school.monthly_cost ?? 0,
          program_fee_per_student: school.program_fee_per_student ?? 0,
          term_fee_per_student: school.program_fee_per_student ?? 0,
          active_students: 0,
          inactive_students: 0,
          total_students: 0,
          completion_rate: 0,
          created_at: school.created_at ?? new Date().toISOString()
        })
      })

      // Then, calculate student stats for each school
      students.forEach(student => {
        const schoolId = student.school_id

        // Skip if schoolId is null or school not found
        if (!schoolId || !schoolsMap.has(schoolId)) return

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
  }, [allSchools, students])

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalStats = {
    totalSchools: schools.length,
    totalStudents: schools.reduce((sum, school) => sum + school.total_students, 0),
    totalActive: schools.reduce((sum, school) => sum + school.active_students, 0),
    totalTermRevenue: schools.reduce((sum, school) => sum + (school.active_students * school.term_fee_per_student), 0),
    avgEnrollment: schools.length > 0 ? Math.round(schools.reduce((sum, school) => sum + school.active_students, 0) / schools.length * 10) / 10 : 0
  }

  const handleViewSchool = (school: SchoolWithStats) => {
    setSelectedSchool(school)
    setModalOpen(true)
  }

  const handleDeleteSchool = (school: SchoolWithStats) => {
    setSchoolToDelete(school)
    setDeleteModalOpen(true)
  }

  const handleAddSchool = async (schoolData: { name: string; target_enrollment: number; monthly_cost: number; program_fee_per_student: number }) => {
    setLoading(true)
    try {
      const success = await createSchool(schoolData)
      if (success) {
        // School will be automatically refreshed by the useSupabaseSchools hook
        setAddSchoolModalOpen(false)
        return true
      }
      return false
    } catch (error) {
      console.error('Error adding school:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const confirmDeleteSchool = async () => {
    if (!schoolToDelete) return
    
    setIsDeleting(true)
    try {
      // In a real app, this would make an API call to delete the school
      // For now, we'll just simulate the deletion
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      // Remove school from local state
      setSchools(prev => prev.filter(school => school.id !== schoolToDelete.id))
      
      // Close modal and reset state
      setDeleteModalOpen(false)
      setSchoolToDelete(null)
    } catch (error) {
      console.error('Error deleting school:', error)
      // In a real app, show error message to user
    } finally {
      setIsDeleting(false)
    }
  }

  const canDeleteSchool = (school: SchoolWithStats) => {
    // Safety check: only allow deletion if no students are currently enrolled
    return school.active_students === 0
  }

  if (studentsLoading || schoolsLoading) {
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
        <Button onClick={() => {
          console.log('Add School button clicked')
          setAddSchoolModalOpen(true)
        }}>
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
            <CardTitle className="text-sm font-medium">Term Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{totalStats.totalTermRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Expected per term from active students</p>
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
                <TableHead className="text-right">Term Revenue</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => {
                const progressPercentage = Math.round((school.active_students / school.target_enrollment) * 100)
                const termRevenue = school.active_students * school.term_fee_per_student
                
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
                      R{termRevenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewSchool(school)}
                          title="View School Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          title="Edit School"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteSchool(school)}
                          disabled={!canDeleteSchool(school)}
                          title={canDeleteSchool(school) ? "Delete School" : "Cannot delete - school has active students"}
                          className={`${canDeleteSchool(school) 
                            ? "text-red-600 hover:text-red-800 hover:bg-red-50" 
                            : "text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
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

      <AddSchoolModal
        open={addSchoolModalOpen}
        onOpenChange={(open) => {
          console.log('Modal open state changed to:', open)
          setAddSchoolModalOpen(open)
        }}
        onAddSchool={handleAddSchool}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Delete School
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{schoolToDelete?.name}</span>?
            </p>
            
            {schoolToDelete && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• {schoolToDelete.total_students} total students enrolled</div>
                  <div>• {schoolToDelete.active_students} currently active students</div>
                  <div>• Created: {new Date(schoolToDelete.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            )}
            
            {schoolToDelete && !canDeleteSchool(schoolToDelete) && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">
                    Cannot delete this school because it has {schoolToDelete.active_students} active students. 
                    Please transfer or remove all active students before deleting.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteSchool}
              disabled={isDeleting || (schoolToDelete ? !canDeleteSchool(schoolToDelete) : false)}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete School
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
