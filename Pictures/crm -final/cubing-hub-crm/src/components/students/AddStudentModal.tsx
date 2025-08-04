'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { StudentWithSchool, StudentInsert } from '@/types'
import { Plus, Save, X, Building } from 'lucide-react'

interface AddStudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddStudent: (student: StudentInsert) => void
  schools: Array<{ id: string; name: string }>
}

interface StudentFormData {
  first_name: string
  last_name: string
  school_id: string
  grade: number
  parent_name: string
  parent_phone: string
  parent_email: string
  status: 'active' | 'in_progress' | 'completed' | 'concern' | 'inactive'
  class_type: string
  payment_status: 'paid' | 'outstanding' | 'partial' | 'overdue'
  consent_received: boolean
  certificate_given: boolean
  cube_received: boolean
  items_purchased: string[]
  tags: string[]
  notes: string
}

const defaultValues: StudentFormData = {
  first_name: '',
  last_name: '',
  school_id: '',
  grade: 5,
  parent_name: '',
  parent_phone: '',
  parent_email: '',
  status: 'active',
  class_type: 'Beginner Cubing',
  payment_status: 'outstanding',
  consent_received: false,
  certificate_given: false,
  cube_received: false,
  items_purchased: [],
  tags: [],
  notes: '',
}

const classTypes = [
  'Beginner Cubing',
  'Intermediate Cubing',
  'Advanced Cubing',
  'Speed Cubing',
  'Blind Cubing',
]

const grades = Array.from({ length: 12 }, (_, i) => i + 1)

export default function AddStudentModal({
  open,
  onOpenChange,
  onAddStudent,
  schools,
}: AddStudentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddingSchool, setIsAddingSchool] = useState(false)
  const [newSchoolName, setNewSchoolName] = useState('')
  const [localSchools, setLocalSchools] = useState(schools)

  const form = useForm<StudentFormData>({
    defaultValues,
  })

  // Update local schools when prop changes
  React.useEffect(() => {
    setLocalSchools(schools)
  }, [schools])

  const handleAddSchool = () => {
    if (newSchoolName.trim()) {
      const newSchool = {
        id: crypto.randomUUID(),
        name: newSchoolName.trim()
      }
      setLocalSchools(prev => [...prev, newSchool])
      form.setValue('school_id', newSchool.id)
      setNewSchoolName('')
      setIsAddingSchool(false)
    }
  }

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true)
    try {
      // Find the selected school to get the name for potential creation
      const selectedSchool = localSchools.find(school => school.id === data.school_id)
      
      // Convert form data to StudentInsert format
      const studentData: any = {
        ...data,
        id: crypto.randomUUID(), // Generate proper UUID
        school_name: selectedSchool?.name, // Add school name for lookup/creation
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      onAddStudent(studentData)
      
      // Reset form and close modal
      form.reset(defaultValues)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding student:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Auto-format SA phone numbers as user types
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    if (cleaned.length <= 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Student</span>
          </DialogTitle>
          <DialogDescription>
            Add a new student to the cubing program. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="school_id"
                rules={{ required: 'Please select a school' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School *</FormLabel>
                    <div className="space-y-2">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select school" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {localSchools.map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Add new school inline form */}
                      {isAddingSchool ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter school name"
                            value={newSchoolName}
                            onChange={(e) => setNewSchoolName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSchool()}
                          />
                          <Button size="sm" onClick={handleAddSchool} disabled={!newSchoolName.trim()}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setIsAddingSchool(false)
                              setNewSchoolName('')
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddingSchool(true)}
                          className="w-full"
                        >
                          <Building className="h-4 w-4 mr-2" />
                          Add New School
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                rules={{ required: 'Please select a grade' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade *</FormLabel>
                    <Select onValueChange={(value: string) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Parent/Guardian Information</h4>
              
              <FormField
                control={form.control}
                name="parent_name"
                rules={{ required: 'Parent/guardian name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent/Guardian Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Mary Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="parent_phone"
                  rules={{ 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[\d\-+\s()]+$/,
                      message: 'Please enter a valid phone number'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="082-123-4567" 
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value)
                            field.onChange(formatted)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parent_email"
                  rules={{ 
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="mary.smith@email.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Program Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="class_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="outstanding">Outstanding</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex space-x-6 mt-4">
                <FormField
                  control={form.control}
                  name="consent_received"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Consent received</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cube_received"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Cube received</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about the student..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Adding...' : 'Add Student'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}