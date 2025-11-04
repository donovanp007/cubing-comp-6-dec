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
import { Button } from '@/components/ui/button'
import { StudentInsert } from '@/types'
import { UserPlus, Zap, Plus, Building } from 'lucide-react'

interface QuickAddStudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddStudent: (student: StudentInsert) => void
  schools: Array<{ id: string; name: string }>
  onOpenFullForm?: () => void
  onAddSchool?: (schoolName: string) => { id: string; name: string }
}

interface QuickStudentFormData {
  first_name: string
  last_name: string
  school_id: string
  grade: number
  parent_name?: string
  parent_phone?: string
  parent_email?: string
}

const defaultValues: QuickStudentFormData = {
  first_name: '',
  last_name: '',
  school_id: '',
  grade: 5,
  parent_name: '',
  parent_phone: '',
  parent_email: '',
}

const grades = Array.from({ length: 12 }, (_, i) => i + 1)

export default function QuickAddStudentModal({
  open,
  onOpenChange,
  onAddStudent,
  schools,
  onOpenFullForm,
  onAddSchool,
}: QuickAddStudentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addAnother, setAddAnother] = useState(false)

  const form = useForm<QuickStudentFormData>({
    defaultValues,
  })

  const onSubmit = async (data: QuickStudentFormData) => {
    setIsSubmitting(true)
    
    // Create the student with smart defaults
    const studentData: StudentInsert = {
      first_name: data.first_name,
      last_name: data.last_name,
      school_id: data.school_id || null, // Allow null for "Unassigned"
      grade: data.grade,
      parent_name: data.parent_name || 'TBD',
      parent_phone: data.parent_phone || '',
      parent_email: data.parent_email || '',
      status: 'active', // Default to active
      class_type: 'Beginner Cubing', // Default class type
      payment_status: 'outstanding', // Default payment status
      consent_received: false,
      certificate_given: false,
      cube_received: false,
      invoice_sent: false,
      items_purchased: [],
      tags: ['quick-add'], // Tag to identify quick-added students
      notes: 'Added via Quick Add - details may need completion',
    }

    try {
      await onAddStudent(studentData)
      
      if (addAnother) {
        // Keep the form open but reset fields except school and grade
        form.reset({
          ...defaultValues,
          school_id: data.school_id, // Keep school selection
          grade: data.grade, // Keep grade selection
        })
        // Reset form and keep focus on first name field
        setTimeout(() => {
          const firstNameInput = document.querySelector('[name="first_name"]') as HTMLInputElement
          if (firstNameInput) firstNameInput.focus()
        }, 100)
      } else {
        form.reset()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error adding student:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setAddAnother(false)
    onOpenChange(false)
  }

  // Check if minimal data is provided - only first name required now
  const watchedValues = form.watch()
  const hasMinimalData = watchedValues.first_name && watchedValues.first_name.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Quick Add Student
          </DialogTitle>
          <DialogDescription>
            Add a new student with just the essentials. You can always add more details later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Student Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="first_name"
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* School and Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="school_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select school" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="!bg-white !text-gray-900">
                        <SelectItem value="">Unassigned</SelectItem>
                        {schools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                        {onAddSchool && (
                          <>
                            <div className="border-t my-2"></div>
                            <button
                              type="button"
                              className="w-full px-2 py-1.5 text-sm text-left text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                              onClick={(e) => {
                                e.preventDefault()
                                const schoolName = prompt('Enter new school name:')
                                if (schoolName?.trim()) {
                                  onAddSchool(schoolName.trim())
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                              Add New School
                            </button>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString() || "5"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="!bg-white !text-gray-900">
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Parent Contact (at least one required) */}
            <div className="space-y-3">
              <FormLabel>Parent/Guardian Contact (Optional)</FormLabel>
              <FormField
                control={form.control}
                name="parent_name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Parent/Guardian Name" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parent_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Phone Number" type="tel" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parent_email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Email Address" type="email" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {!hasMinimalData && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  💡 Please provide a first name to continue.
                </p>
              </div>
            )}
          </form>
        </Form>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onOpenFullForm}
                className="text-blue-600 hover:text-blue-700"
              >
                <Building className="h-4 w-4 mr-1" />
                Full Form
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit((data) => {
                  setAddAnother(true)
                  onSubmit(data)
                })}
                disabled={!hasMinimalData || isSubmitting}
                variant="ghost"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Another
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit((data) => {
                  setAddAnother(false)
                  onSubmit(data)
                })}
                disabled={!hasMinimalData || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {isSubmitting ? 'Adding...' : 'Add Student'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}