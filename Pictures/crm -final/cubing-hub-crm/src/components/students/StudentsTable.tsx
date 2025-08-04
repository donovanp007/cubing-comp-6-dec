'use client'

import { useState } from 'react'
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
import { getInitials, getStatusColor, getPaymentStatusColor, formatPhoneNumber, openWhatsApp, openEmail } from '@/lib/utils'
import { MoreHorizontal, Edit, Trash2, Eye, MessageCircle, Mail, Tag, Plus, X, Upload, Download, CheckSquare, Square, Users } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import QuickProfileModal from './QuickProfileModal'

interface StudentsTableProps {
  students: StudentWithSchool[]
  loading?: boolean
  onViewStudent: (student: StudentWithSchool) => void
  onEditStudent: (student: StudentWithSchool) => void
  onDeleteStudent: (student: StudentWithSchool) => void
  onUpdateStudent?: (studentId: string, updates: Partial<StudentWithSchool>) => void
  onImportExport?: () => void
}

export default function StudentsTable({
  students,
  loading = false,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onUpdateStudent,
  onImportExport,
}: StudentsTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [editingTags, setEditingTags] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')
  const [quickViewStudent, setQuickViewStudent] = useState<StudentWithSchool | null>(null)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })

  const handleRowSelect = (studentId: string) => {
    const newSelection = new Set(selectedRows)
    if (selectedRows.has(studentId)) {
      newSelection.delete(studentId)
    } else {
      newSelection.add(studentId)
    }
    setSelectedRows(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedRows.size === students.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(students.map(s => s.id)))
    }
  }

  const handleStatusChange = (student: StudentWithSchool, newStatus: string) => {
    if (onUpdateStudent) {
      onUpdateStudent(student.id, { status: newStatus as any })
    }
  }

  const handlePaymentStatusChange = (student: StudentWithSchool, newStatus: string) => {
    if (onUpdateStudent) {
      onUpdateStudent(student.id, { payment_status: newStatus as any })
    }
  }

  const handleAddTag = (student: StudentWithSchool) => {
    if (newTag.trim() && onUpdateStudent) {
      const currentTags = student.tags || []
      const updatedTags = [...currentTags, newTag.trim()]
      onUpdateStudent(student.id, { tags: updatedTags })
      setNewTag('')
      setEditingTags(null)
    }
  }

  const handleRemoveTag = (student: StudentWithSchool, tagToRemove: string) => {
    if (onUpdateStudent) {
      const currentTags = student.tags || []
      const updatedTags = currentTags.filter(tag => tag !== tagToRemove)
      onUpdateStudent(student.id, { tags: updatedTags })
    }
  }

  // Bulk update functions
  const handleBulkStatusUpdate = (newStatus: string) => {
    if (onUpdateStudent && selectedRows.size > 0) {
      selectedRows.forEach(studentId => {
        onUpdateStudent(studentId, { status: newStatus as any })
      })
      setSelectedRows(new Set()) // Clear selection after update
    }
  }

  const handleBulkPaymentStatusUpdate = (newPaymentStatus: string) => {
    if (onUpdateStudent && selectedRows.size > 0) {
      selectedRows.forEach(studentId => {
        onUpdateStudent(studentId, { payment_status: newPaymentStatus as any })
      })
      setSelectedRows(new Set()) // Clear selection after update
    }
  }

  const handleBulkAddTag = (tag: string) => {
    if (onUpdateStudent && selectedRows.size > 0 && tag.trim()) {
      selectedRows.forEach(studentId => {
        const student = students.find(s => s.id === studentId)
        if (student) {
          const currentTags = student.tags || []
          if (!currentTags.includes(tag.trim())) {
            const updatedTags = [...currentTags, tag.trim()]
            onUpdateStudent(studentId, { tags: updatedTags })
          }
        }
      })
      setSelectedRows(new Set()) // Clear selection after update
    }
  }

  const handleRowClick = (student: StudentWithSchool, event: React.MouseEvent) => {
    // Get click position for modal placement
    const rect = event.currentTarget.getBoundingClientRect()
    setModalPosition({
      x: rect.left + 50,
      y: rect.top + 10
    })
    setQuickViewStudent(student)
  }

  if (loading) {
    return (
      <div className="rounded-md border bg-white">
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-white shadow-sm">
      {/* Action Bar */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              {students.length} student{students.length !== 1 ? 's' : ''}
            </span>
            {selectedRows.size > 0 && (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                {selectedRows.size} selected
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
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
        
        {/* Bulk Actions Bar */}
        {selectedRows.size > 0 && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Bulk Actions:</span>
            
            {/* Bulk Status Update */}
            <Select onValueChange={handleBulkStatusUpdate}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="concern">Concern</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Bulk Payment Status Update */}
            <Select onValueChange={handleBulkPaymentStatusUpdate}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="outstanding">Outstanding</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Bulk Add Tag */}
            <div className="flex items-center gap-1">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-24 h-8"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleBulkAddTag(newTag)
                    setNewTag('')
                  }
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  handleBulkAddTag(newTag)
                  setNewTag('')
                }}
                className="h-8 px-2"
              >
                <Tag className="h-3 w-3" />
              </Button>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedRows(new Set())}
              className="h-8 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedRows.size === students.length && students.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
            </TableHead>
            <TableHead>Student</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Parent Contact</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow 
              key={student.id}
              className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedRows.has(student.id) ? 'bg-blue-50' : ''
              }`}
              onClick={(e) => handleRowClick(student, e)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedRows.has(student.id)}
                  onChange={() => handleRowSelect(student.id)}
                  className="rounded border-gray-300"
                />
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {getInitials(student.first_name, student.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {student.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-gray-900">{student.schools?.name || 'No School'}</div>
              </TableCell>
              
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  Grade {student.grade}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-gray-900">{student.class_type}</div>
              </TableCell>
              
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Select
                  value={student.status}
                  onValueChange={(value: string) => handleStatusChange(student, value)}
                >
                  <SelectTrigger className={`h-8 w-auto border-0 bg-transparent px-2 ${getStatusColor(student.status)}`}>
                    <SelectValue>
                      <Badge className={getStatusColor(student.status)}>
                        {student.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                    </SelectItem>
                    <SelectItem value="in_progress">
                      <Badge className="bg-blue-100 text-blue-800">IN PROGRESS</Badge>
                    </SelectItem>
                    <SelectItem value="completed">
                      <Badge className="bg-purple-100 text-purple-800">COMPLETED</Badge>
                    </SelectItem>
                    <SelectItem value="concern">
                      <Badge className="bg-red-100 text-red-800">CONCERN</Badge>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <Badge className="bg-gray-100 text-gray-800">INACTIVE</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Select
                  value={student.payment_status}
                  onValueChange={(value: string) => handlePaymentStatusChange(student, value)}
                >
                  <SelectTrigger className={`h-8 w-auto border-0 bg-transparent px-2 ${getPaymentStatusColor(student.payment_status)}`}>
                    <SelectValue>
                      <Badge className={getPaymentStatusColor(student.payment_status)}>
                        {student.payment_status.toUpperCase()}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">
                      <Badge className="bg-green-100 text-green-800">PAID</Badge>
                    </SelectItem>
                    <SelectItem value="outstanding">
                      <Badge className="bg-yellow-100 text-yellow-800">OUTSTANDING</Badge>
                    </SelectItem>
                    <SelectItem value="partial">
                      <Badge className="bg-orange-100 text-orange-800">PARTIAL</Badge>
                    </SelectItem>
                    <SelectItem value="overdue">
                      <Badge className="bg-red-100 text-red-800">OVERDUE</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>

              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center flex-wrap gap-1">
                  {(student.tags || []).map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="text-xs flex items-center space-x-1 cursor-pointer hover:bg-red-100"
                      onClick={() => handleRemoveTag(student, tag)}
                    >
                      <span>{tag}</span>
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                  
                  {editingTags === student.id ? (
                    <div className="flex items-center space-x-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag"
                        className="h-6 w-20 text-xs"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleAddTag(student)
                          if (e.key === 'Escape') setEditingTags(null)
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleAddTag(student)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setEditingTags(student.id)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  <div className="text-gray-900 mb-1">{student.parent_name}</div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openWhatsApp(student.parent_phone, `Hi ${student.parent_name}, this is regarding ${student.first_name}'s cubing classes.`)
                      }}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                      title="Send WhatsApp message"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span className="font-mono text-xs">
                        {formatPhoneNumber(student.parent_phone)}
                      </span>
                    </button>
                  </div>
                  <div className="mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEmail(
                          student.parent_email, 
                          `Update on ${student.first_name}'s Cubing Progress`,
                          `Dear ${student.parent_name},\n\nI hope this email finds you well. I wanted to provide you with an update on ${student.first_name}'s progress in our cubing program.\n\nBest regards,\n[Your Name]`
                        )
                      }}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                      title="Send email"
                    >
                      <Mail className="h-3 w-3" />
                      <span className="text-xs truncate max-w-[120px]">
                        {student.parent_email}
                      </span>
                    </button>
                  </div>
                </div>
              </TableCell>
              
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onViewStudent(student)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEditStudent(student)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                    onClick={() => onDeleteStudent(student)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {students.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-sm text-gray-600">Get started by adding your first student.</p>
        </div>
      )}

      {selectedRows.size > 0 && (
        <div className="border-t bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {selectedRows.size} student{selectedRows.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
              <Button variant="destructive" size="sm">
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      <QuickProfileModal
        student={quickViewStudent}
        isOpen={!!quickViewStudent}
        onClose={() => setQuickViewStudent(null)}
        onUpdate={onUpdateStudent || (() => {})}
        position={modalPosition}
      />
    </div>
  )
}