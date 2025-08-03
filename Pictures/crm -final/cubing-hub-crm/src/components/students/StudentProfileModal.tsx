'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StudentWithSchool } from '@/types'
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
  Trash2
} from 'lucide-react'

interface StudentProfileModalProps {
  student: StudentWithSchool | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (student: StudentWithSchool) => void
  onDelete?: (student: StudentWithSchool) => void
}

export default function StudentProfileModal({
  student,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: StudentProfileModalProps) {
  if (!student) return null

  const InfoCard = ({ icon: Icon, title, children }: { 
    icon: any, 
    title: string, 
    children: React.ReactNode 
  }) => (
    <Card className="p-4">
      <div className="flex items-center mb-3">
        <Icon className="h-5 w-5 text-primary mr-2" />
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      {children}
    </Card>
  )

  const StatusIndicator = ({ 
    label, 
    value, 
    isBoolean = false 
  }: { 
    label: string, 
    value: boolean | string, 
    isBoolean?: boolean 
  }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      {isBoolean ? (
        value ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )
      ) : (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-white text-lg font-bold">
                  {getInitials(student.first_name, student.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">
                  {student.first_name} {student.last_name}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Grade {student.grade} • {student.schools?.name}
                </DialogDescription>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit?.(student)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onDelete?.(student)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard icon={User} title="Student Information">
                <div className="space-y-2">
                  <StatusIndicator label="Full Name" value={`${student.first_name} ${student.last_name}`} />
                  <StatusIndicator label="Grade" value={`Grade ${student.grade}`} />
                  <StatusIndicator label="Class Type" value={student.class_type} />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </InfoCard>

              <InfoCard icon={School} title="School Details">
                <div className="space-y-2">
                  <StatusIndicator label="School" value={student.schools?.name || 'No School'} />
                  <StatusIndicator label="Student ID" value={student.id.slice(0, 8) + '...'} />
                  <StatusIndicator 
                    label="Enrolled" 
                    value={new Date(student.created_at).toLocaleDateString()} 
                  />
                </div>
              </InfoCard>

              <InfoCard icon={Phone} title="Parent Contact">
                <div className="space-y-2">
                  <StatusIndicator label="Parent Name" value={student.parent_name} />
                  <StatusIndicator label="Phone" value={formatPhoneNumber(student.parent_phone)} />
                  <StatusIndicator label="Email" value={student.parent_email} />
                </div>
              </InfoCard>

              <InfoCard icon={FileText} title="Documentation">
                <div className="space-y-2">
                  <StatusIndicator label="Consent Form" value={student.consent_received} isBoolean />
                  <StatusIndicator label="Certificate Given" value={student.certificate_given} isBoolean />
                  <StatusIndicator label="Cube Received" value={student.cube_received} isBoolean />
                </div>
              </InfoCard>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Achievements</h3>
                <p className="text-2xl font-bold text-primary">
                  {student.certificate_given ? '1' : '0'}
                </p>
                <p className="text-sm text-gray-600">Certificates Earned</p>
              </Card>

              <Card className="p-6 text-center">
                <Package className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Equipment</h3>
                <p className="text-2xl font-bold text-primary">
                  {student.cube_received ? '✓' : '✗'}
                </p>
                <p className="text-sm text-gray-600">Cube Status</p>
              </Card>

              <Card className="p-6 text-center">
                <Calendar className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Duration</h3>
                <p className="text-2xl font-bold text-primary">
                  {Math.floor((Date.now() - new Date(student.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                </p>
                <p className="text-sm text-gray-600">Days Enrolled</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Progress Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${student.consent_received ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Consent Form Received</p>
                    <p className="text-xs text-gray-500">
                      {student.consent_received ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${student.cube_received ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Cube Distributed</p>
                    <p className="text-xs text-gray-500">
                      {student.cube_received ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${student.certificate_given ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Certificate Awarded</p>
                    <p className="text-xs text-gray-500">
                      {student.certificate_given ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Payment Status</h3>
                  <Badge className={getPaymentStatusColor(student.payment_status)}>
                    {student.payment_status.toUpperCase()}
                  </Badge>
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

          <TabsContent value="notes" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Student Notes</h3>
              <div className="min-h-32">
                {student.notes ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{student.notes}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No notes available</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Notes
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}