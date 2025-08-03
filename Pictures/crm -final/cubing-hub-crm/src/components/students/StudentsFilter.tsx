'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Filter, RotateCcw } from 'lucide-react'
import { StudentWithSchool } from '@/types'

export interface FilterOptions {
  schools: string[]
  grades: number[]
  paymentStatus: string[]
  studentStatus: string[]
  tags: string[]
}

interface StudentsFilterProps {
  students: StudentWithSchool[]
  onFilterChange: (filters: FilterOptions) => void
  isOpen: boolean
  onToggle: () => void
}

export default function StudentsFilter({
  students,
  onFilterChange,
  isOpen,
  onToggle,
}: StudentsFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    schools: [],
    grades: [],
    paymentStatus: [],
    studentStatus: [],
    tags: [],
  })

  // Get unique values for filter options
  const uniqueSchools = Array.from(new Set(students.map(s => s.schools?.name).filter(Boolean)))
  const uniqueGrades = Array.from(new Set(students.map(s => s.grade))).sort((a, b) => a - b)
  const uniqueTags = Array.from(new Set(students.flatMap(s => s.tags || []))).sort()
  const paymentStatuses = ['paid', 'outstanding', 'partial', 'overdue']
  const studentStatuses = ['active', 'in_progress', 'completed', 'concern', 'inactive']

  const updateFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSchoolChange = (school: string, checked: boolean) => {
    const newSchools = checked
      ? [...filters.schools, school]
      : filters.schools.filter(s => s !== school)
    
    updateFilters({ ...filters, schools: newSchools })
  }

  const handleGradeChange = (grade: number, checked: boolean) => {
    const newGrades = checked
      ? [...filters.grades, grade]
      : filters.grades.filter(g => g !== grade)
    
    updateFilters({ ...filters, grades: newGrades })
  }

  const handlePaymentStatusChange = (status: string, checked: boolean) => {
    const newPaymentStatus = checked
      ? [...filters.paymentStatus, status]
      : filters.paymentStatus.filter(s => s !== status)
    
    updateFilters({ ...filters, paymentStatus: newPaymentStatus })
  }

  const handleStudentStatusChange = (status: string, checked: boolean) => {
    const newStudentStatus = checked
      ? [...filters.studentStatus, status]
      : filters.studentStatus.filter(s => s !== status)
    
    updateFilters({ ...filters, studentStatus: newStudentStatus })
  }

  const handleTagChange = (tag: string, checked: boolean) => {
    const newTags = checked
      ? [...filters.tags, tag]
      : filters.tags.filter(t => t !== tag)
    
    updateFilters({ ...filters, tags: newTags })
  }

  const clearAllFilters = () => {
    const emptyFilters: FilterOptions = {
      schools: [],
      grades: [],
      paymentStatus: [],
      studentStatus: [],
      tags: [],
    }
    updateFilters(emptyFilters)
  }

  const getActiveFilterCount = () => {
    return filters.schools.length + 
           filters.grades.length + 
           filters.paymentStatus.length + 
           filters.studentStatus.length +
           filters.tags.length
  }

  const removeFilter = (type: keyof FilterOptions, value: string | number) => {
    const newFilters = {
      ...filters,
      [type]: filters[type].filter(item => item !== value)
    }
    updateFilters(newFilters)
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={onToggle}
        className="mb-4"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {getActiveFilterCount() > 0 && (
          <Badge variant="secondary" className="ml-2">
            {getActiveFilterCount()}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <div className="mb-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
            <div className="flex items-center space-x-2">
              {getActiveFilterCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Active Filters */}
          {getActiveFilterCount() > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {filters.schools.map(school => (
                  <Badge key={school} variant="secondary" className="flex items-center">
                    School: {school}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => removeFilter('schools', school)}
                    />
                  </Badge>
                ))}
                {filters.grades.map(grade => (
                  <Badge key={grade} variant="secondary" className="flex items-center">
                    Grade {grade}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => removeFilter('grades', grade)}
                    />
                  </Badge>
                ))}
                {filters.paymentStatus.map(status => (
                  <Badge key={status} variant="secondary" className="flex items-center">
                    Payment: {status}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => removeFilter('paymentStatus', status)}
                    />
                  </Badge>
                ))}
                {filters.studentStatus.map(status => (
                  <Badge key={status} variant="secondary" className="flex items-center">
                    Status: {status}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => removeFilter('studentStatus', status)}
                    />
                  </Badge>
                ))}
                {filters.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center">
                    Tag: {tag}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => removeFilter('tags', tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Schools Filter */}
          <div>
            <h4 className="text-sm font-medium mb-3">Schools</h4>
            <div className="space-y-2">
              {uniqueSchools.map(school => (
                <div key={school} className="flex items-center space-x-2">
                  <Checkbox
                    id={`school-${school}`}
                    checked={filters.schools.includes(school)}
                    onCheckedChange={(checked) => 
                      handleSchoolChange(school, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`school-${school}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {school}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Grades Filter */}
          <div>
            <h4 className="text-sm font-medium mb-3">Grades</h4>
            <div className="grid grid-cols-3 gap-2">
              {uniqueGrades.map(grade => (
                <div key={grade} className="flex items-center space-x-2">
                  <Checkbox
                    id={`grade-${grade}`}
                    checked={filters.grades.includes(grade)}
                    onCheckedChange={(checked) => 
                      handleGradeChange(grade, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`grade-${grade}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    Grade {grade}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status Filter */}
          <div>
            <h4 className="text-sm font-medium mb-3">Payment Status</h4>
            <div className="space-y-2">
              {paymentStatuses.map(status => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`payment-${status}`}
                    checked={filters.paymentStatus.includes(status)}
                    onCheckedChange={(checked) => 
                      handlePaymentStatusChange(status, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`payment-${status}`}
                    className="text-sm font-normal cursor-pointer capitalize"
                  >
                    {status}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Student Status Filter */}
          <div>
            <h4 className="text-sm font-medium mb-3">Student Status</h4>
            <div className="space-y-2">
              {studentStatuses.map(status => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`student-${status}`}
                    checked={filters.studentStatus.includes(status)}
                    onCheckedChange={(checked) => 
                      handleStudentStatusChange(status, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`student-${status}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {status.replace('_', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <h4 className="text-sm font-medium mb-3">Tags</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {uniqueTags.map(tag => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={filters.tags.includes(tag)}
                    onCheckedChange={(checked) => 
                      handleTagChange(tag, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`tag-${tag}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    <Badge variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  </label>
                </div>
              ))}
              {uniqueTags.length === 0 && (
                <p className="text-sm text-gray-500 italic">No tags found</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}