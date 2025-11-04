'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Filter, X, RotateCcw, ChevronDown } from 'lucide-react'
import { StudentWithSchool } from '@/types'
import { FilterOptions } from './StudentsFilter'

interface HorizontalStudentsFilterProps {
  students: StudentWithSchool[]
  onFilterChange: (filters: FilterOptions) => void
}

export default function HorizontalStudentsFilter({
  students,
  onFilterChange,
}: HorizontalStudentsFilterProps) {
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

  return (
    <div className="space-y-4">
      {/* Horizontal Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg border">
        {/* Schools Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Schools
              {filters.schools.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-2">
                  {filters.schools.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Select Schools</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {uniqueSchools.map(school => (
              <DropdownMenuCheckboxItem
                key={school}
                checked={filters.schools.includes(school)}
                onCheckedChange={(checked) => handleSchoolChange(school, checked)}
              >
                {school}
              </DropdownMenuCheckboxItem>
            ))}
            {uniqueSchools.length === 0 && (
              <div className="px-2 py-1 text-sm text-gray-500">No schools found</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Grades Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Grades
              {filters.grades.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-2">
                  {filters.grades.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Select Grades</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {uniqueGrades.map(grade => (
              <DropdownMenuCheckboxItem
                key={grade}
                checked={filters.grades.includes(grade)}
                onCheckedChange={(checked) => handleGradeChange(grade, checked)}
              >
                Grade {grade}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Payment Status Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Payment
              {filters.paymentStatus.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-2">
                  {filters.paymentStatus.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {paymentStatuses.map(status => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filters.paymentStatus.includes(status)}
                onCheckedChange={(checked) => handlePaymentStatusChange(status, checked)}
              >
                <div className="capitalize">{status}</div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Student Status Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Status
              {filters.studentStatus.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-2">
                  {filters.studentStatus.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Student Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {studentStatuses.map(status => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filters.studentStatus.includes(status)}
                onCheckedChange={(checked) => handleStudentStatusChange(status, checked)}
              >
                <div className="capitalize">{status.replace('_', ' ')}</div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tags Dropdown */}
        {uniqueTags.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Tags
                {filters.tags.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-2">
                    {filters.tags.length}
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
              <DropdownMenuLabel>Select Tags</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {uniqueTags.map(tag => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={filters.tags.includes(tag)}
                  onCheckedChange={(checked) => handleTagChange(tag, checked)}
                >
                  <Badge variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Clear All Button */}
        {getActiveFilterCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}

        {/* Filter Summary */}
        <div className="text-xs text-gray-500 ml-auto">
          {getActiveFilterCount() > 0 ? `${getActiveFilterCount()} filter${getActiveFilterCount() > 1 ? 's' : ''} active` : 'No filters applied'}
        </div>
      </div>

      {/* Active Filter Tags */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.schools.map(school => (
            <Badge key={school} variant="secondary" className="flex items-center gap-1 text-xs">
              School: {school}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-200 rounded" 
                onClick={() => removeFilter('schools', school)}
              />
            </Badge>
          ))}
          {filters.grades.map(grade => (
            <Badge key={grade} variant="secondary" className="flex items-center gap-1 text-xs">
              Grade {grade}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-200 rounded" 
                onClick={() => removeFilter('grades', grade)}
              />
            </Badge>
          ))}
          {filters.paymentStatus.map(status => (
            <Badge key={status} variant="secondary" className="flex items-center gap-1 text-xs">
              Payment: {status}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-200 rounded" 
                onClick={() => removeFilter('paymentStatus', status)}
              />
            </Badge>
          ))}
          {filters.studentStatus.map(status => (
            <Badge key={status} variant="secondary" className="flex items-center gap-1 text-xs">
              Status: {status}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-200 rounded" 
                onClick={() => removeFilter('studentStatus', status)}
              />
            </Badge>
          ))}
          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
              Tag: {tag}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-200 rounded" 
                onClick={() => removeFilter('tags', tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}