'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Filter, RotateCcw } from 'lucide-react'
import { FilterOptions } from './StudentsFilter'

interface FilterSummaryProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  totalStudents: number
  filteredCount: number
}

export default function FilterSummary({
  filters,
  onFilterChange,
  totalStudents,
  filteredCount
}: FilterSummaryProps) {
  const hasActiveFilters = 
    filters.schools.length > 0 ||
    filters.grades.length > 0 ||
    filters.paymentStatus.length > 0 ||
    filters.studentStatus.length > 0 ||
    filters.tags.length > 0

  const clearAllFilters = () => {
    onFilterChange({
      schools: [],
      grades: [],
      paymentStatus: [],
      studentStatus: [],
      tags: []
    })
  }

  const removeFilter = (type: keyof FilterOptions, value: string | number) => {
    onFilterChange({
      ...filters,
      [type]: filters[type].filter(item => item !== value)
    })
  }

  if (!hasActiveFilters) {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Active Filters ({filteredCount} of {totalStudents} students shown)
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="text-blue-700 border-blue-300 hover:bg-blue-100"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Schools */}
        {filters.schools.map(school => (
          <Badge
            key={`school-${school}`}
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            School: {school}
            <button
              onClick={() => removeFilter('schools', school)}
              className="ml-1 hover:text-blue-900"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        {/* Grades */}
        {filters.grades.map(grade => (
          <Badge
            key={`grade-${grade}`}
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-200"
          >
            Grade: {grade}
            <button
              onClick={() => removeFilter('grades', grade)}
              className="ml-1 hover:text-green-900"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        {/* Payment Status */}
        {filters.paymentStatus.map(status => (
          <Badge
            key={`payment-${status}`}
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          >
            Payment: {status.charAt(0).toUpperCase() + status.slice(1)}
            <button
              onClick={() => removeFilter('paymentStatus', status)}
              className="ml-1 hover:text-yellow-900"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        {/* Student Status */}
        {filters.studentStatus.map(status => (
          <Badge
            key={`status-${status}`}
            variant="secondary"
            className="bg-purple-100 text-purple-800 hover:bg-purple-200"
          >
            Status: {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
            <button
              onClick={() => removeFilter('studentStatus', status)}
              className="ml-1 hover:text-purple-900"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        {/* Tags */}
        {filters.tags.map(tag => (
          <Badge
            key={`tag-${tag}`}
            variant="secondary"
            className="bg-orange-100 text-orange-800 hover:bg-orange-200"
          >
            Tag: {tag}
            <button
              onClick={() => removeFilter('tags', tag)}
              className="ml-1 hover:text-orange-900"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}