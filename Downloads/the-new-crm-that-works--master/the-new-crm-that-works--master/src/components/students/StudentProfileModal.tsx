'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StudentWithSchool } from '@/types'
import { PriorityBadge, Priority } from '@/components/ui/priority-badge'
import CRMTaskManager from './CRMTaskManager'
import { 
  getInitials, 
  getStatusColor, 
  getPaymentStatusColor, 
  formatPhoneNumber, 
  formatCurrency 
} from '@/lib/utils'
import {
  User,
  School,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Trophy,
  Package,
  Edit,
  Trash2,
  Bell,
  Plus,
  Clock,
  X,
  Save
} from 'lucide-react'

interface StudentProfileModalProps {
  student: StudentWithSchool | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (student: StudentWithSchool) => void
  onDelete?: (student: StudentWithSchool) => void
  onUpdate?: (studentId: string, updates: any) => Promise<boolean>
}

export default function StudentProfileModal({
  student,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onUpdate,
}: StudentProfileModalProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Close modal if student becomes null while modal is open
  useEffect(() => {
    if (!student && open) {
      onOpenChange(false)
    }
  }, [student, open, onOpenChange])

  const handleEditField = (field: string, currentValue: string | null) => {
    setIsEditing(field)
    setEditValue(currentValue || '')
  }

  const handleSaveEdit = async () => {
    if (!student || !isEditing || !onUpdate) return

    setIsSaving(true)
    const updates = { [isEditing]: editValue }
    const success = await onUpdate(student.id, updates)

    if (success) {
      setIsEditing(null)
      setEditValue('')
    }
    setIsSaving(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(null)
    setEditValue('')
  }

  const handleToggleBooleanField = async (fieldName: string) => {
    if (!student || !onUpdate) return

    setIsSaving(true)
    const currentValue = (student as any)[fieldName] ?? false
    const updates = { [fieldName]: !currentValue }
    const success = await onUpdate(student.id, updates)

    if (success) {
      // Success - state will update from parent component
    }
    setIsSaving(false)
  }

  const handleAddNote = async () => {
    if (!student || !newNote.trim() || !onUpdate) return

    const currentNotes = student.notes || ''
    const timestamp = new Date().toLocaleString()
    const noteWithTimestamp = `[${timestamp}] ${newNote.trim()}`
    const updatedNotes = currentNotes ? `${currentNotes}\n${noteWithTimestamp}` : noteWithTimestamp

    const success = await onUpdate(student.id, { notes: updatedNotes })

    if (success) {
      setNewNote('')
      setIsAddingNote(false)
    }
  }

  if (!student) return null

  const InfoCard = ({ icon: Icon, title, children, className = "" }: {
    icon: any,
    title: string,
    children: React.ReactNode,
    className?: string
  }) => (
    <Card className={`p-3 rounded-lg border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white border-t-4 border-t-blue-500 ${className}`}>
      <div className="flex items-center mb-2">
        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded mr-2">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </Card>
  )

  const StatusIndicator = ({
    label,
    value,
    isBoolean = false,
    fieldName,
    onEdit,
    onToggle
  }: {
    label: string,
    value: boolean | string | null,
    isBoolean?: boolean,
    fieldName?: string,
    onEdit?: (field: string, currentValue: string | null) => void,
    onToggle?: (field: string) => void
  }) => (
    <div className="flex items-center justify-between py-1.5 px-1 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 rounded transition-colors group">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        {isBoolean ? (
          <button
            type="button"
            onClick={() => onToggle?.(fieldName || '')}
            className="flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity"
            title={onToggle ? "Click to toggle" : undefined}
          >
            {value ? (
              <div className="flex items-center space-x-1">
                <div className="p-1 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-700" />
                </div>
                <span className="text-xs font-semibold text-green-700">Yes</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <div className="p-1 bg-red-100 rounded-full">
                  <XCircle className="h-3 w-3 text-red-700" />
                </div>
                <span className="text-xs font-semibold text-red-700">No</span>
              </div>
            )}
          </button>
        ) : (
          <span className="text-xs font-semibold text-gray-900 bg-blue-50 px-2 py-1 rounded-full">{value || 'Not provided'}</span>
        )}
        {!isBoolean && fieldName && onEdit && (
          <button
            type="button"
            onClick={() => onEdit(fieldName, value as string | null)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-100 rounded"
            title="Edit this field"
          >
            <Edit className="h-3 w-3 text-blue-600" />
          </button>
        )}
      </div>
    </div>
  )

  if (!open) return null

  // Show edit panel when editing a field
  const showEditPanel = isEditing !== null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50"
        onClick={() => {
          if (!showEditPanel) onOpenChange(false)
        }}
      />

      {/* Fullscreen Modal Content */}
      <div className="fixed inset-0 z-[9999] overflow-hidden flex flex-col">
        {/* Accessibility Headers */}
        <div className="sr-only">
          <h1>
            {student.first_name} {student.last_name} - Student Profile
          </h1>
          <p>
            Comprehensive student profile and CRM management interface
          </p>
        </div>
        {/* Header Section with Background - Fullscreen Mode */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-8 shadow-xl border-b-4 border-blue-900">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/10 z-10"
              type="button"
              title="Go back to students list"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/10 z-10"
              type="button"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-white/30 shadow-2xl">
                  <AvatarFallback className="bg-gradient-to-br from-white/20 to-white/10 text-white text-2xl font-bold backdrop-blur-sm">
                    {getInitials(student.first_name, student.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <Badge className={`${getStatusColor(student.status || 'active')} px-3 py-1 text-sm shadow-lg border-2 border-white`}>
                    {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1).replace('_', ' ') : 'Active'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white drop-shadow-sm">
                  {student.first_name} {student.last_name}
                </h1>
                <div className="flex items-center space-x-4 text-blue-100">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="text-lg">Grade {student.grade}</span>
                  </div>
                  <span className="text-blue-300">•</span>
                  <div className="flex items-center space-x-2">
                    <School className="h-5 w-5" />
                    <span className="text-lg">{student.schools?.name || 'Unassigned School'}</span>
                  </div>
                  <span className="text-blue-300">•</span>
                  <Badge className={`${getPaymentStatusColor(student.payment_status)} text-sm border-white/20`}>
                    {student.payment_status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-6 text-blue-200 text-sm">
                  <span>Student ID: {student.id.slice(0, 8).toUpperCase()}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Enrolled: {new Date(student.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => onEdit?.(student)} 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm shadow-lg"
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Student
              </Button>
              <Button 
                variant="destructive" 
                size="lg" 
                onClick={() => onDelete?.(student)}
                className="bg-red-600/80 border-red-500/30 hover:bg-red-700/90 backdrop-blur-sm shadow-lg"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 overflow-y-auto bg-gradient-to-br from-white via-gray-50 to-blue-50">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6 h-12 bg-white rounded-xl p-1 border border-blue-100 shadow-sm">
              <TabsTrigger value="overview" className="text-sm font-semibold text-gray-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all">
                Overview
              </TabsTrigger>
              <TabsTrigger value="tasks" className="text-sm font-semibold text-gray-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all">
                CRM Tasks
              </TabsTrigger>
              <TabsTrigger value="progress" className="text-sm font-semibold text-gray-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all">
                Progress
              </TabsTrigger>
              <TabsTrigger value="payments" className="text-sm font-semibold text-gray-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all">
                Payments
              </TabsTrigger>
              <TabsTrigger value="parent" className="text-sm font-semibold text-gray-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all">
                Parent Info
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-sm font-semibold text-gray-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all">
                Notes
              </TabsTrigger>
            </TabsList>

          <TabsContent value="tasks" className="space-y-6 mt-8">
            <CRMTaskManager
              studentId={student.id}
              studentName={`${student.first_name} ${student.last_name}`}
            />
          </TabsContent>

          <TabsContent value="overview" className="space-y-4 mt-4 pr-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InfoCard icon={User} title="Student Information">
                <div className="space-y-1">
                  <StatusIndicator label="First Name" value={student.first_name} fieldName="first_name" onEdit={handleEditField} />
                  <StatusIndicator label="Last Name" value={student.last_name} fieldName="last_name" onEdit={handleEditField} />
                  <StatusIndicator label="Grade" value={String(student.grade)} fieldName="grade" onEdit={handleEditField} />
                  <div className="flex items-center justify-between py-3 px-1 border-b border-gray-100 hover:bg-gray-50 rounded transition-colors group cursor-pointer">
                    <span className="text-sm font-medium text-gray-600">Enrollment Status</span>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(student.status || 'active')} px-3 py-1 text-sm`}>
                        {(student.status || 'active').replace('_', ' ').toUpperCase()}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => handleEditField('status', student.status || 'active')}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-100 rounded"
                        title="Edit this field"
                      >
                        <Edit className="h-3 w-3 text-blue-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </InfoCard>

              <InfoCard icon={School} title="School Details">
                <div className="space-y-1">
                  <StatusIndicator label="School" value={student.schools?.name} />
                  <StatusIndicator label="Student ID" value={student.id.slice(0, 8).toUpperCase()} />
                  <StatusIndicator 
                    label="Enrollment Date" 
                    value={new Date(student.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} 
                  />
                </div>
              </InfoCard>

              <InfoCard icon={FileText} title="Documentation Status">
                <div className="space-y-1">
                  <StatusIndicator
                    label="Consent Form Received"
                    value={student.consent_received}
                    isBoolean
                    fieldName="consent_received"
                    onToggle={handleToggleBooleanField}
                  />
                  <StatusIndicator
                    label="Certificate Awarded"
                    value={student.certificate_given}
                    isBoolean
                    fieldName="certificate_given"
                    onToggle={handleToggleBooleanField}
                  />
                  <StatusIndicator
                    label="Cube Distributed"
                    value={student.cube_received}
                    isBoolean
                    fieldName="cube_received"
                    onToggle={handleToggleBooleanField}
                  />
                  <StatusIndicator
                    label="Invoice Sent"
                    value={student.invoice_sent}
                    isBoolean
                    fieldName="invoice_sent"
                    onToggle={handleToggleBooleanField}
                  />
                </div>
              </InfoCard>

              <InfoCard icon={Package} title="Payment Information">
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Payment Status</span>
                    <Badge className={`${getPaymentStatusColor(student.payment_status)} px-3 py-1 text-sm`}>
                      {student.payment_status.toUpperCase()}
                    </Badge>
                  </div>
                  <StatusIndicator label="Program Fee" value="R 500.00" />
                  <StatusIndicator label="Items Purchased" value={student.items_purchased?.length ? `${student.items_purchased.length} items` : 'None'} />
                </div>
              </InfoCard>
            </div>

            {/* Tags Section */}
            {student.tags && student.tags.length > 0 && (
              <Card className="p-3 rounded-lg border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white border-t-4 border-t-purple-500">
                <div className="flex items-center mb-2">
                  <div className="p-1.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded mr-2 shadow-md">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">Student Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.tags.map((tag, index) => (
                    <Badge key={index} className="bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 hover:from-purple-200 hover:to-purple-100 px-3 py-1 text-xs font-semibold border border-purple-200 shadow-sm">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="parent" className="space-y-4 mt-4 pr-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InfoCard icon={Phone} title="Parent Contact Information">
                <div className="space-y-1">
                  <StatusIndicator label="Parent/Guardian Name" value={student.parent_name} fieldName="parent_name" onEdit={handleEditField} />
                  <StatusIndicator label="Phone Number" value={student.parent_phone} fieldName="parent_phone" onEdit={handleEditField} />
                  <StatusIndicator label="Email Address" value={student.parent_email} fieldName="parent_email" onEdit={handleEditField} />
                </div>
              </InfoCard>

              <InfoCard icon={FileText} title="Parent Notes">
                <div className="min-h-32">
                  {isEditing === 'parent_notes' ? (
                    <div className="space-y-3">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full p-3 border rounded-md resize-none h-32 text-sm"
                        placeholder="Add notes about parent communication, preferences, etc..."
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Save className="h-3 w-3 mr-2" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="h-3 w-3 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {student.parent_notes ? (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{student.parent_notes}</p>
                      ) : (
                        <div className="flex items-center justify-center h-32 text-center">
                          <div>
                            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 italic">No parent notes available</p>
                            <p className="text-xs text-gray-400 mt-1">Add notes about parent communication, preferences, etc.</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {!isEditing && (
                  <div className="mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleEditField('parent_notes', student.parent_notes)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {student.parent_notes ? 'Edit Notes' : 'Add Notes'}
                    </Button>
                  </div>
                )}
              </InfoCard>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <div className="bg-yellow-100 rounded-full p-3 w-fit mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Achievements</h3>
                <p className="text-3xl font-bold text-yellow-600 mb-1">
                  {student.certificate_given ? '1' : '0'}
                </p>
                <p className="text-sm text-gray-600">Certificates Earned</p>
                {student.certificate_given && (
                  <Badge className="mt-2 bg-yellow-100 text-yellow-800">Completed</Badge>
                )}
              </Card>

              <Card className="p-6 text-center shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Equipment</h3>
                <div className="text-3xl font-bold mb-1">
                  {student.cube_received ? (
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500 mx-auto" />
                  )}
                </div>
                <p className="text-sm text-gray-600">Cube Status</p>
                <Badge className={`mt-2 ${student.cube_received ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {student.cube_received ? 'Received' : 'Pending'}
                </Badge>
              </Card>

              <Card className="p-6 text-center shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Duration</h3>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {Math.floor((Date.now() - new Date(student.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                </p>
                <p className="text-sm text-gray-600">Days Enrolled</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Progress Timeline</h3>
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => handleToggleBooleanField('consent_received')}
                  disabled={isSaving}
                  className="w-full flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group disabled:opacity-50"
                >
                  <div className={`w-3 h-3 rounded-full ${student.consent_received ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">Consent Form Received</p>
                    <p className="text-xs text-gray-500">
                      {student.consent_received ? 'Completed' : 'Pending'} (Click to toggle)
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleBooleanField('cube_received')}
                  disabled={isSaving}
                  className="w-full flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group disabled:opacity-50"
                >
                  <div className={`w-3 h-3 rounded-full ${student.cube_received ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">Cube Distributed</p>
                    <p className="text-xs text-gray-500">
                      {student.cube_received ? 'Completed' : 'Pending'} (Click to toggle)
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleBooleanField('certificate_given')}
                  disabled={isSaving}
                  className="w-full flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group disabled:opacity-50"
                >
                  <div className={`w-3 h-3 rounded-full ${student.certificate_given ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">Certificate Awarded</p>
                    <p className="text-xs text-gray-500">
                      {student.certificate_given ? 'Completed' : 'Pending'} (Click to toggle)
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleBooleanField('invoice_sent')}
                  disabled={isSaving}
                  className="w-full flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group disabled:opacity-50"
                >
                  <div className={`w-3 h-3 rounded-full ${student.invoice_sent ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">Invoice Sent</p>
                    <p className="text-xs text-gray-500">
                      {student.invoice_sent ? 'Completed' : 'Pending'} (Click to toggle)
                    </p>
                  </div>
                </button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Payment Status</h3>
                  <button
                    type="button"
                    onClick={() => handleEditField('payment_status', student.payment_status)}
                    className="group flex items-center space-x-1 hover:opacity-80 transition-opacity"
                  >
                    <Badge className={getPaymentStatusColor(student.payment_status)}>
                      {student.payment_status.toUpperCase()}
                    </Badge>
                    <Edit className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Class Fee</span>
                    <span className="text-sm font-medium">R 350.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Equipment Fee</span>
                    <span className="text-sm font-medium">R 150.00</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>R 500.00</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">Payment History</h3>
                <div className="space-y-3">
                  {student.payment_status === 'paid' ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-900">Payment Received</p>
                        <p className="text-xs text-green-600">
                          {new Date(student.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-green-900">R 500.00</span>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-sm">No payments recorded</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Student Notes Section */}
              <InfoCard icon={FileText} title="Student Notes">
                <div className="min-h-32">
                  {isEditing === 'notes' ? (
                    <div className="space-y-3">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full p-3 border rounded-md resize-none h-32 text-sm"
                        placeholder="Add notes about the student..."
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Save className="h-3 w-3 mr-2" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="h-3 w-3 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {student.notes ? (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{student.notes}</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32 text-center">
                          <div>
                            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 italic">No student notes available</p>
                            <p className="text-xs text-gray-400 mt-1">Add general notes about the student</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {!isEditing && (
                  <div className="mt-6 pt-4 border-t space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleEditField('notes', student.notes)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {student.notes ? 'Edit Notes' : 'Add Notes'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setIsAddingNote(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Quick Add Note
                    </Button>
                  </div>
                )}
              </InfoCard>

              {/* Quick Add Reminder */}
              <InfoCard icon={Bell} title="Quick Actions">
                {isAddingNote ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Add Quick Note</label>
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="w-full p-3 border rounded-md resize-none h-20 text-sm"
                        placeholder="Enter your note here..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                        <Save className="h-3 w-3 mr-2" />
                        Save Note
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setIsAddingNote(false)
                        setNewNote('')
                      }}>
                        <X className="h-3 w-3 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        variant="outline"
                        className="justify-start h-auto py-3 px-4 text-left"
                        onClick={() => {
                          setNewNote('URGENT: ')
                          setIsAddingNote(true)
                        }}
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-red-50 rounded-lg mr-3">
                            <Bell className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Add Urgent Note</div>
                            <div className="text-xs text-gray-500">High priority follow-up</div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="justify-start h-auto py-3 px-4 text-left"
                        onClick={() => {
                          setNewNote('FOLLOW-UP: ')
                          setIsAddingNote(true)
                        }}
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-orange-50 rounded-lg mr-3">
                            <Clock className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Add Follow-up</div>
                            <div className="text-xs text-gray-500">Medium priority reminder</div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="justify-start h-auto py-3 px-4 text-left"
                        onClick={() => {
                          setNewNote('NOTE: ')
                          setIsAddingNote(true)
                        }}
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-green-50 rounded-lg mr-3">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Add General Note</div>
                            <div className="text-xs text-gray-500">General information</div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}
              </InfoCard>
            </div>

            {/* Student Reminders Section */}
            <InfoCard icon={Bell} title="Student Notes History" className="col-span-full">
              <div className="space-y-4">
                {student.notes ? (
                  <div className="space-y-3">
                    {student.notes.split('\n').filter(note => note.trim()).map((note, index) => {
                      const isTimestamped = note.match(/^\[(.+?)\]/)
                      const timestamp = isTimestamped ? isTimestamped[1] : null
                      const content = isTimestamped ? note.replace(/^\[.+?\]\s*/, '') : note

                      return (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 leading-relaxed">{content}</p>
                            </div>
                          </div>
                          {timestamp && (
                            <p className="text-xs text-gray-500">{timestamp}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No notes for this student yet</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button
                    className="w-full"
                    onClick={() => setIsAddingNote(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Note
                  </Button>
                </div>
              </div>
            </InfoCard>
          </TabsContent>
        </Tabs>
        </div>

        {/* Inline Edit Panel */}
        {showEditPanel && (
          <div className="fixed bottom-0 left-0 right-0 z-[10000] bg-white border-t-2 border-blue-500 shadow-2xl">
            <div className="max-w-2xl mx-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Edit {isEditing?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {['parent_phone', 'email', 'parent_email'].includes(isEditing || '') ? (
                  <input
                    type={isEditing?.includes('email') ? 'email' : 'tel'}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                    placeholder="Enter value..."
                    autoFocus
                  />
                ) : (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none h-24 text-lg"
                    placeholder="Enter value..."
                    autoFocus
                  />
                )}

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="px-6"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}