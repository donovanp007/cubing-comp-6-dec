'use client'

import { useState, useCallback, memo } from 'react'
import { Virtuoso } from 'react-virtuoso'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StudentWithSchool } from '@/types'
import { 
  getInitials, 
  getStatusColor, 
  getPaymentStatusColor, 
  formatPhoneNumber,
  openWhatsApp,
  createWhatsAppMessage
} from '@/lib/utils'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  MessageCircle, 
  Mail,
  CheckSquare,
  Square
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface VirtualizedStudentsTableProps {
  students: StudentWithSchool[]
  loading?: boolean
  onViewStudent: (student: StudentWithSchool) => void
  onEditStudent: (student: StudentWithSchool) => void
  onDeleteStudent: (student: StudentWithSchool) => void
  onUpdateStudent?: (studentId: string, updates: Partial<StudentWithSchool>) => void
  sortBy?: 'name-asc' | 'name-desc' | 'school-asc' | 'grade-asc' | 'grade-desc' | 'created-desc' | 'created-asc'
  onSortChange?: (sort: 'name-asc' | 'name-desc' | 'school-asc' | 'grade-asc' | 'grade-desc' | 'created-desc' | 'created-asc') => void
}

const VirtualizedStudentsTable = memo(function VirtualizedStudentsTable({
  students,
  loading = false,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onUpdateStudent,
  sortBy = 'name-asc',
  onSortChange,
}: VirtualizedStudentsTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const handleRowSelect = useCallback((studentId: string) => {
    const newSelection = new Set(selectedRows)
    if (selectedRows.has(studentId)) {
      newSelection.delete(studentId)
    } else {
      newSelection.add(studentId)
    }
    setSelectedRows(newSelection)
  }, [selectedRows])

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === students.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(students.map(s => s.id)))
    }
  }, [selectedRows, students])

  const handleStatusChange = useCallback((studentId: string, newStatus: string) => {
    if (onUpdateStudent) {
      onUpdateStudent(studentId, { status: newStatus as any })
    }
  }, [onUpdateStudent])

  const handlePaymentStatusChange = useCallback((studentId: string, newStatus: string) => {
    if (onUpdateStudent) {
      onUpdateStudent(studentId, { payment_status: newStatus as any })
    }
  }, [onUpdateStudent])

  const StudentRow = ({ student }: { student: StudentWithSchool }) => (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="w-[50px]">
        <button
          onClick={() => handleRowSelect(student.id)}
          className="p-1 hover:bg-accent rounded"
        >
          {selectedRows.has(student.id) ? (
            <CheckSquare className="h-4 w-4 text-primary" />
          ) : (
            <Square className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(student.first_name, student.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <button
              onClick={() => onViewStudent(student)}
              className="font-medium hover:underline text-left"
            >
              {student.first_name} {student.last_name}
            </button>
            {student.parent_name && (
              <p className="text-xs text-muted-foreground">
                Parent: {student.parent_name}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>{student.schools?.name || 'No School'}</TableCell>
      <TableCell>Grade {student.grade}</TableCell>
      <TableCell>
        <Select
          value={student.status}
          onValueChange={(value) => handleStatusChange(student.id, value)}
        >
          <SelectTrigger className={`w-[130px] h-8 ${getStatusColor(student.status)}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="concern">Concern</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={student.payment_status}
          onValueChange={(value) => handlePaymentStatusChange(student.id, value)}
        >
          <SelectTrigger className={`w-[120px] h-8 ${getPaymentStatusColor(student.payment_status)}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="outstanding">Outstanding</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {student.parent_phone && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const message = createWhatsAppMessage(
                  student.parent_name || 'Parent',
                  `${student.first_name} ${student.last_name}`,
                  'payment'
                )
                openWhatsApp(student.parent_phone, message)
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
          {student.parent_email && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.location.href = `mailto:${student.parent_email}`}
            >
              <Mail className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewStudent(student)}>
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditStudent(student)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDeleteStudent(student)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading students...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      {/* Fixed Header */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <button
                onClick={handleSelectAll}
                className="p-1 hover:bg-accent rounded"
              >
                {selectedRows.size === students.length && students.length > 0 ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </TableHead>
            <TableHead>Student</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      {/* Virtualized Body */}
      <div style={{ height: '600px' }}>
        <Virtuoso
          data={students}
          itemContent={(index, student) => (
            <Table>
              <TableBody>
                <StudentRow student={student} />
              </TableBody>
            </Table>
          )}
          components={{
            EmptyPlaceholder: () => (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No students found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or add a new student
                </p>
              </div>
            ),
          }}
        />
      </div>
    </div>
  )
})

export default VirtualizedStudentsTable