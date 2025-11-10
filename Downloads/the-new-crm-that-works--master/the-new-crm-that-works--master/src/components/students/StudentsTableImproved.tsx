'use client'

import { useState, useCallback, memo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Input } from '@/components/ui/input'
import { StudentWithSchool } from '@/types'
import { 
  getInitials, 
  openWhatsApp, 
  openEmail 
} from '@/lib/utils'
import { 
  MoreHorizontal, 
  MessageCircle, 
  Mail,
  ChevronDown,
  ChevronUp,
  StickyNote,
  Save,
  X,
  Eye,
  Edit,
  Trash2,
  FileText,
  Upload,
  Download
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import StudentProfileModal from './StudentProfileModal'

interface StudentsTableImprovedProps {
  students: StudentWithSchool[]
  loading?: boolean
  onViewStudent: (student: StudentWithSchool) => void
  onEditStudent: (student: StudentWithSchool) => void
  onDeleteStudent: (student: StudentWithSchool) => void
  onUpdateStudent?: (studentId: string, updates: Partial<StudentWithSchool>) => void | Promise<void>
  invoiceStatuses?: Record<string, boolean>
  onImportExport?: () => void
  onQuickExport?: () => void
}

const StudentsTableImproved = memo(function StudentsTableImproved({
  students,
  loading = false,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onUpdateStudent,
  invoiceStatuses = {},
  onImportExport,
  onQuickExport,
}: StudentsTableImprovedProps) {
  const router = useRouter()
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())
  const [quickNotes, setQuickNotes] = useState<Record<string, string>>({})
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [invoiceStudent, setInvoiceStudent] = useState<StudentWithSchool | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [profileModalStudent, setProfileModalStudent] = useState<StudentWithSchool | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const dropdownRefs = useRef<Record<string, boolean>>({})

  // Handle dropdown open state
  const handleDropdownOpen = useCallback((studentId: string, field: string, isOpen: boolean) => {
    const key = `${studentId}-${field}`
    if (isOpen) {
      // Close all other dropdowns
      setOpenDropdowns(new Set([key]))
    } else {
      setOpenDropdowns(prev => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown-trigger]') && !target.closest('[role="listbox"]')) {
        setOpenDropdowns(new Set())
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleRowSelect = useCallback((studentId: string, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation()
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
  }, [selectedRows.size, students])

  const handleViewProfile = useCallback((student: StudentWithSchool, e: React.MouseEvent) => {
    e.stopPropagation()
    // Open fullscreen profile modal
    setProfileModalStudent(student)
    setShowProfileModal(true)
  }, [])

  const handleSaveNote = useCallback((studentId: string) => {
    const note = quickNotes[studentId]
    if (note && onUpdateStudent) {
      // Save note to student profile
      const student = students.find(s => s.id === studentId)
      if (student) {
        // For now, just store note text - implement proper note system later  
        onUpdateStudent(studentId, { 
          notes: note
        } as any)
      }
      setQuickNotes(prev => ({ ...prev, [studentId]: '' }))
      setEditingNote(null)
    }
  }, [quickNotes, onUpdateStudent, students])

  const handleInvoiceClick = useCallback((student: StudentWithSchool, e: React.MouseEvent) => {
    e.stopPropagation()
    setInvoiceStudent(student)
    setShowInvoiceModal(true)
  }, [])

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      active: 'bg-green-100 text-green-800 border-green-300 font-medium',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300 font-medium',
      completed: 'bg-purple-100 text-purple-800 border-purple-300 font-medium',
      concern: 'bg-red-100 text-red-800 border-red-300 font-medium',
      inactive: 'bg-gray-100 text-gray-800 border-gray-300 font-medium',
    }
    return statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-300'
  }

  const getPaymentBadge = (status: string) => {
    const paymentStyles: Record<string, string> = {
      paid: 'bg-green-100 text-green-800 border-green-300 font-medium',
      outstanding: 'bg-yellow-100 text-yellow-800 border-yellow-300 font-medium',
      partial: 'bg-orange-100 text-orange-800 border-orange-300 font-medium',
      overdue: 'bg-red-100 text-red-800 border-red-300 font-medium',
    }
    return paymentStyles[status] || 'bg-gray-100 text-gray-700 border-gray-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No students found</p>
      </div>
    )
  }

  return (
    <div className="w-full relative">
      {/* Table Actions Header */}
      {(onImportExport || onQuickExport) && (
        <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              {students.length} student{students.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {onQuickExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onQuickExport}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Export ({students.length})</span>
              </Button>
            )}
            {onImportExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onImportExport}
                className="flex items-center space-x-1"
              >
                <Upload className="h-4 w-4" />
                <Download className="h-4 w-4" />
                <span>Import/Export</span>
              </Button>
            )}
          </div>
        </div>
      )}
      <div className="overflow-auto max-h-[calc(100vh-300px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="w-[40px] font-semibold text-sm text-gray-700 bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedRows.size === students.length && students.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 focus:ring-primary"
                />
              </TableHead>
              <TableHead className="font-semibold text-sm text-gray-700 bg-gray-50">Student</TableHead>
              <TableHead className="font-semibold text-sm text-gray-700 bg-gray-50">School</TableHead>
              <TableHead className="font-semibold text-sm text-gray-700 bg-gray-50">Grade</TableHead>
              <TableHead className="font-semibold text-sm text-gray-700 bg-gray-50">Class</TableHead>
              <TableHead className="font-semibold text-sm text-gray-700 bg-gray-50">Status</TableHead>
              <TableHead className="font-semibold text-sm text-gray-700 bg-gray-50">Payment</TableHead>
              <TableHead className="font-semibold text-sm text-gray-700 bg-gray-50">Invoice Sent</TableHead>
              <TableHead className="font-semibold text-sm text-gray-700 bg-gray-50">Tags</TableHead>
              <TableHead className="font-semibold text-sm text-gray-700 bg-gray-50">Parent Contact</TableHead>
              <TableHead className="font-semibold text-sm text-gray-700 bg-gray-50">Quick Note</TableHead>
              <TableHead className="font-semibold text-sm text-gray-700 bg-gray-50">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const isNoteEditing = editingNote === student.id
              const statusDropdownKey = `${student.id}-status`
              const paymentDropdownKey = `${student.id}-payment`
              
              return (
                <TableRow 
                  key={student.id}
                  className="border-b hover:bg-gray-50/50"
                >
                  <TableCell className="py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(student.id)}
                      onChange={(e) => handleRowSelect(student.id, e)}
                      className="rounded border-gray-300 focus:ring-primary"
                    />
                  </TableCell>
                  
                  {/* Student Name - Only this is clickable */}
                  <TableCell className="py-3">
                    <button
                      onClick={(e) => handleViewProfile(student, e)}
                      className="flex items-center space-x-3 hover:text-blue-600 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {getInitials(student.first_name, student.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm underline">
                        {student.first_name} {student.last_name}
                      </span>
                    </button>
                  </TableCell>
                  
                  <TableCell className="py-3 text-sm">
                    {student.schools?.name || '-'}
                  </TableCell>
                  
                  <TableCell className="py-3 text-sm">
                    Grade {student.grade}
                  </TableCell>
                  
                  <TableCell className="py-3 text-sm">
                    {student.class_type}
                  </TableCell>
                  
                  {/* Status Dropdown */}
                  <TableCell className="py-3">
                    <Select
                      value={student.status}
                      onValueChange={(value) => {
                        if (onUpdateStudent) {
                          onUpdateStudent(student.id, { status: value as any })
                        }
                        setOpenDropdowns(new Set())
                      }}
                    >
                      <SelectTrigger 
                        className={cn(
                          "w-[120px] h-7 text-xs border-0",
                          getStatusBadge(student.status)
                        )}
                        data-dropdown-trigger
                      >
                        <SelectValue placeholder={
                          student.status === 'active' ? 'Active' :
                          student.status === 'in_progress' ? 'In Progress' :
                          student.status === 'completed' ? 'Completed' :
                          student.status === 'concern' ? 'Concern' :
                          student.status === 'inactive' ? 'Inactive' : student.status
                        } />
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
                  
                  {/* Payment Status Dropdown */}
                  <TableCell className="py-3">
                    <Select
                      value={student.payment_status}
                      onValueChange={(value) => {
                        if (onUpdateStudent) {
                          onUpdateStudent(student.id, { payment_status: value as any })
                        }
                        setOpenDropdowns(new Set())
                      }}
                    >
                      <SelectTrigger 
                        className={cn(
                          "w-[120px] h-7 text-xs border-0",
                          getPaymentBadge(student.payment_status)
                        )}
                        data-dropdown-trigger
                      >
                        <SelectValue placeholder={
                          student.payment_status === 'paid' ? 'Paid' :
                          student.payment_status === 'outstanding' ? 'Outstanding' :
                          student.payment_status === 'partial' ? 'Partial' :
                          student.payment_status === 'overdue' ? 'Overdue' : student.payment_status
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="outstanding">Outstanding</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  {/* Invoice Sent Dropdown */}
                  <TableCell className="py-3">
                    <Select
                      value={(invoiceStatuses[student.id] ?? student.invoice_sent ?? false) ? "yes" : "no"}
                      onValueChange={(value) => {
                        if (onUpdateStudent) {
                          onUpdateStudent(student.id, { invoice_sent: value === "yes" })
                        }
                      }}
                    >
                      <SelectTrigger 
                        className={cn(
                          "w-[80px] h-7 text-xs border-0",
                          (invoiceStatuses[student.id] ?? student.invoice_sent ?? false)
                            ? "bg-green-100 text-green-800 border-green-300 font-medium"
                            : "bg-gray-100 text-gray-800 border-gray-300 font-medium"
                        )}
                        data-dropdown-trigger
                      >
                        <SelectValue placeholder={
                          (invoiceStatuses[student.id] ?? student.invoice_sent ?? false) ? "Yes" : "No"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  {/* Tags */}
                  <TableCell className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {(student.tags || []).slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {student.tags && student.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{student.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  {/* Parent Contact */}
                  <TableCell className="py-3">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (student.parent_phone) {
                            openWhatsApp(student.parent_phone)
                          }
                        }}
                        disabled={!student.parent_phone}
                        title={student.parent_phone || 'No phone'}
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (student.parent_email) {
                            openEmail(student.parent_email)
                          }
                        }}
                        disabled={!student.parent_email}
                        title={student.parent_email || 'No email'}
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  
                  {/* Quick Note */}
                  <TableCell className="py-3">
                    {isNoteEditing ? (
                      <div className="flex items-center space-x-1">
                        <Input
                          value={quickNotes[student.id] || ''}
                          onChange={(e) => setQuickNotes(prev => ({
                            ...prev,
                            [student.id]: e.target.value
                          }))}
                          placeholder="Add note..."
                          className="h-7 text-xs w-24"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveNote(student.id)
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSaveNote(student.id)
                          }}
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingNote(null)
                            setQuickNotes(prev => ({ ...prev, [student.id]: '' }))
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingNote(student.id)
                        }}
                      >
                        <StickyNote className="h-3 w-3 mr-1" />
                        Note
                      </Button>
                    )}
                  </TableCell>
                  
                  {/* Actions */}
                  <TableCell className="py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewProfile(student, e as any)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditStudent(student)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Student
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteStudent(student)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* Invoice Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice - {invoiceStudent?.first_name} {invoiceStudent?.last_name}</DialogTitle>
            <DialogDescription>
              Generate and manage invoice for this student
            </DialogDescription>
          </DialogHeader>
          
          {invoiceStudent && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Student Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{invoiceStudent.first_name} {invoiceStudent.last_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">School:</span>
                    <p className="font-medium">{invoiceStudent.schools?.name || 'No school assigned'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Grade:</span>
                    <p className="font-medium">Grade {invoiceStudent.grade}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Class Type:</span>
                    <p className="font-medium">{invoiceStudent.class_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Parent:</span>
                    <p className="font-medium">{invoiceStudent.parent_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Status:</span>
                    <Badge className={getPaymentBadge(invoiceStudent.payment_status)}>
                      {invoiceStudent.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Invoice Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Invoice Details</h3>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Invoice Number:</span>
                    <span className="font-mono">#INV-{invoiceStudent.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Program Fee:</span>
                    <span className="font-medium">$450.00</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total Amount:</span>
                      <span>$450.00</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate PDF
                </Button>
                <Button variant="outline" className="flex-1">
                  Send via Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Student Profile Modal */}
      <StudentProfileModal
        student={profileModalStudent}
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        onEdit={onEditStudent}
        onDelete={onDeleteStudent}
        onUpdate={onUpdateStudent as any}
      />
    </div>
  )
})

export default StudentsTableImproved