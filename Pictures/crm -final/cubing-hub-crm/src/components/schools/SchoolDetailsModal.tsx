'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Building, 
  Users, 
  Target,
  TrendingUp,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { StudentWithSchool } from '@/types'
import { getInitials, getStatusBadgeVariant } from '@/lib/utils'

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

interface SchoolDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  school: SchoolWithStats | null
  students: StudentWithSchool[]
}

export default function SchoolDetailsModal({
  open,
  onOpenChange,
  school,
  students
}: SchoolDetailsModalProps) {
  if (!school) return null

  // Get students for this school
  const schoolStudents = students.filter(student => student.school_id === school.id)
  
  const progressPercentage = Math.round((school.active_students / school.target_enrollment) * 100)
  const monthlyRevenue = school.active_students * school.program_fee_per_student

  // Status counts
  const statusCounts = {
    active: schoolStudents.filter(s => s.status === 'active').length,
    in_progress: schoolStudents.filter(s => s.status === 'in_progress').length,
    completed: schoolStudents.filter(s => s.status === 'completed').length,
    concern: schoolStudents.filter(s => s.status === 'concern').length,
    inactive: schoolStudents.filter(s => s.status === 'inactive').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'concern': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'inactive': return <XCircle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {school.name}
          </DialogTitle>
          <DialogDescription>
            Detailed overview and student management for this school
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{school.active_students}</div>
                <p className="text-xs text-muted-foreground">Currently enrolled</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Target</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{school.target_enrollment}</div>
                <p className="text-xs text-muted-foreground">{progressPercentage}% reached</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R{monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From active students</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{school.completion_rate}%</div>
                <p className="text-xs text-muted-foreground">Students completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current: {school.active_students}</span>
                  <span>Target: {school.target_enrollment}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-300 ${
                      progressPercentage >= 100 ? 'bg-green-500' : 
                      progressPercentage >= 75 ? 'bg-blue-500' : 
                      progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {progressPercentage}% of target reached
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Student Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getStatusIcon(status)}
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle>Students ({schoolStudents.length})</CardTitle>
              <CardDescription>
                All students enrolled at {school.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Parent Contact</TableHead>
                    <TableHead>Enrolled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-white text-xs">
                              {getInitials(student.first_name, student.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.first_name} {student.last_name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.payment_status === 'paid' ? 'default' : 'destructive'}>
                          {student.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{student.parent_name}</div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <Mail className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(student.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {schoolStudents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No students enrolled at this school yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
