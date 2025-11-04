'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building, Plus, DollarSign, Users, Target } from 'lucide-react'

interface SchoolData {
  name: string
  target_enrollment: number
  monthly_cost: number
  program_fee_per_student: number
}

interface SchoolErrors {
  name?: string
  target_enrollment?: string
  monthly_cost?: string
  program_fee_per_student?: string
}

interface AddSchoolModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSchool: (schoolData: SchoolData) => Promise<boolean>
}

export default function AddSchoolModal({ open, onOpenChange, onAddSchool }: AddSchoolModalProps) {
  const [formData, setFormData] = useState<SchoolData>({
    name: '',
    target_enrollment: 30,
    monthly_cost: 2500,
    program_fee_per_student: 450
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<SchoolErrors>({})

  const validateForm = () => {
    const newErrors: SchoolErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'School name is required'
    }
    
    if (Number(formData.target_enrollment) < 1) {
      newErrors.target_enrollment = 'Target enrollment must be at least 1'
    }
    
    if (Number(formData.monthly_cost) < 0) {
      newErrors.monthly_cost = 'Monthly cost cannot be negative'
    }
    
    if (Number(formData.program_fee_per_student) < 0) {
      newErrors.program_fee_per_student = 'Program fee cannot be negative'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const success = await onAddSchool(formData)
      if (success) {
        // Reset form and close modal
        setFormData({
          name: '',
          target_enrollment: 30,
          monthly_cost: 2500,
          program_fee_per_student: 450
        })
        setErrors({})
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error adding school:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof SchoolData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const termFeePerStudent = formData.program_fee_per_student * 3 // 3 months

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <span>Add New School</span>
            </DialogTitle>
            <DialogDescription>
              Create a new school partnership. Fill in the details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="school-name" className="text-right">
                School Name *
              </Label>
              <Input
                id="school-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter school name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target-enrollment" className="text-right">
                  <div className="flex items-center space-x-1">
                    <Target className="h-3 w-3" />
                    <span>Target Enrollment</span>
                  </div>
                </Label>
                <Input
                  id="target-enrollment"
                  type="number"
                  min="1"
                  value={formData.target_enrollment}
                  onChange={(e) => handleInputChange('target_enrollment', parseInt(e.target.value) || 0)}
                  className={errors.target_enrollment ? 'border-red-500' : ''}
                />
                {errors.target_enrollment && (
                  <p className="text-sm text-red-600">{errors.target_enrollment}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly-cost" className="text-right">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>Monthly Cost (R)</span>
                  </div>
                </Label>
                <Input
                  id="monthly-cost"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.monthly_cost}
                  onChange={(e) => handleInputChange('monthly_cost', parseInt(e.target.value) || 0)}
                  className={errors.monthly_cost ? 'border-red-500' : ''}
                />
                {errors.monthly_cost && (
                  <p className="text-sm text-red-600">{errors.monthly_cost}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="program-fee" className="text-right">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Program Fee per Student (R/month)</span>
                </div>
              </Label>
              <Input
                id="program-fee"
                type="number"
                min="0"
                step="50"
                value={formData.program_fee_per_student}
                onChange={(e) => handleInputChange('program_fee_per_student', parseInt(e.target.value) || 0)}
                className={errors.program_fee_per_student ? 'border-red-500' : ''}
              />
              {errors.program_fee_per_student && (
                <p className="text-sm text-red-600">{errors.program_fee_per_student}</p>
              )}
              <p className="text-xs text-gray-500">
                Term fee: R{termFeePerStudent.toLocaleString()} (3 months)
              </p>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Max Term Revenue:</span>
                  <div className="text-green-600 font-semibold">
                    R{(formData.target_enrollment * termFeePerStudent).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Monthly Costs:</span>
                  <div className="text-red-600 font-semibold">
                    R{formData.monthly_cost.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add School
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}