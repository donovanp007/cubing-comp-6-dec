'use client'

import { useState, useRef, useEffect } from 'react'
import { StudentWithSchool } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  X, 
  Edit, 
  Save, 
  MessageCircle, 
  Mail, 
  Phone, 
  School,
  User,
  Calendar,
  CreditCard,
  Package,
  Tag,
  Plus
} from 'lucide-react'
import { 
  getStatusColor, 
  getPaymentStatusColor, 
  formatPhoneNumber, 
  openWhatsApp, 
  openEmail,
  getInitials 
} from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface QuickProfileModalProps {
  student: StudentWithSchool | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (studentId: string, updates: Partial<StudentWithSchool>) => void
  position?: { x: number; y: number }
}

export default function QuickProfileModal({
  student,
  isOpen,
  onClose,
  onUpdate,
  position = { x: 0, y: 0 }
}: QuickProfileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<StudentWithSchool>>({})
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (student) {
      setEditForm({
        first_name: student.first_name,
        last_name: student.last_name,
        parent_name: student.parent_name,
        parent_phone: student.parent_phone,
        parent_email: student.parent_email,
        status: student.status,
        payment_status: student.payment_status,
        class_type: student.class_type,
        grade: student.grade,
        notes: student.notes,
        tags: student.tags || [],
        items_purchased: student.items_purchased || []
      })
    }
  }, [student])

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsEditing(false)
    setNewTag('')
    onClose()
  }

  const handleSave = () => {
    if (student && onUpdate) {
      onUpdate(student.id, editForm)
      setIsEditing(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && editForm.tags) {
      const updatedTags = [...editForm.tags, newTag.trim()]
      setEditForm(prev => ({ ...prev, tags: updatedTags }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    if (editForm.tags) {
      const updatedTags = editForm.tags.filter(tag => tag !== tagToRemove)
      setEditForm(prev => ({ ...prev, tags: updatedTags }))
    }
  }

  if (!isOpen || !student) return null

  const modalStyle = {
    position: 'fixed' as const,
    left: `${Math.min(position.x, window.innerWidth - 400)}px`,
    top: `${Math.min(position.y, window.innerHeight - 600)}px`,
    zIndex: 1000,
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-start">
      <div
        ref={modalRef}
        style={modalStyle}
        className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto border"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-white">
                {getInitials(student.first_name, student.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {student.first_name} {student.last_name}
              </h3>
              <p className="text-sm text-gray-500">{student.schools?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-green-600"
              >
                <Save className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status and Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
              {isEditing ? (
                <Select
                  value={editForm.status}
                  onValueChange={(value: string) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="h-8">
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
              ) : (
                <Badge className={getStatusColor(student.status)}>
                  {student.status.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Payment</label>
              {isEditing ? (
                <Select
                  value={editForm.payment_status}
                  onValueChange={(value: string) => handleInputChange('payment_status', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="outstanding">Outstanding</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getPaymentStatusColor(student.payment_status)}>
                  {student.payment_status.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>

          {/* Student Info */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">First Name</label>
                {isEditing ? (
                  <Input
                    value={editForm.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="h-8"
                  />
                ) : (
                  <p className="text-sm">{student.first_name}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Last Name</label>
                {isEditing ? (
                  <Input
                    value={editForm.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="h-8"
                  />
                ) : (
                  <p className="text-sm">{student.last_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Grade</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editForm.grade}
                    onChange={(e) => handleInputChange('grade', parseInt(e.target.value))}
                    className="h-8"
                  />
                ) : (
                  <p className="text-sm">Grade {student.grade}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Class</label>
                {isEditing ? (
                  <Input
                    value={editForm.class_type}
                    onChange={(e) => handleInputChange('class_type', e.target.value)}
                    className="h-8"
                  />
                ) : (
                  <p className="text-sm">{student.class_type}</p>
                )}
              </div>
            </div>
          </div>

          {/* Parent Contact */}
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Parent Contact</h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
                {isEditing ? (
                  <Input
                    value={editForm.parent_name}
                    onChange={(e) => handleInputChange('parent_name', e.target.value)}
                    className="h-8"
                  />
                ) : (
                  <p className="text-sm">{student.parent_name}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <Input
                    value={editForm.parent_phone}
                    onChange={(e) => handleInputChange('parent_phone', e.target.value)}
                    className="h-8 flex-1"
                  />
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openWhatsApp(student.parent_phone, `Hi ${student.parent_name}, regarding ${student.first_name}'s cubing progress.`)}
                      className="flex items-center space-x-1"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span className="text-xs">{formatPhoneNumber(student.parent_phone)}</span>
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <Input
                    value={editForm.parent_email}
                    onChange={(e) => handleInputChange('parent_email', e.target.value)}
                    className="h-8 flex-1"
                  />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEmail(student.parent_email, `Update on ${student.first_name}'s Progress`)}
                    className="flex items-center space-x-1"
                  >
                    <Mail className="h-3 w-3" />
                    <span className="text-xs truncate max-w-[200px]">{student.parent_email}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1 mb-2">
              {(editForm.tags || []).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="text-xs flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  {isEditing && (
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex items-center space-x-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  className="h-7 text-xs flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddTag()
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleAddTag}
                  className="h-7 w-7 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Items Purchased */}
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Items Purchased</h4>
            <div className="space-y-1">
              {(student.items_purchased || []).length > 0 ? (
                (student.items_purchased || []).map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Package className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No items purchased yet</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-3">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Notes</label>
            {isEditing ? (
              <Textarea
                value={editForm.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="min-h-[60px] text-sm"
                placeholder="Add notes about this student..."
              />
            ) : (
              <p className="text-sm text-gray-600">
                {student.notes || 'No notes added'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}