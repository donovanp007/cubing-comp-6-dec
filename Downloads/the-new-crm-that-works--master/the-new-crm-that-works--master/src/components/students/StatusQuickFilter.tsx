'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StudentWithSchool } from '@/types'
import { Users, CheckSquare } from 'lucide-react'
import { FilterOptions } from './StudentsFilter'

interface StatusQuickFilterProps {
  students: StudentWithSchool[]
  currentFilters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  onSelectAllByStatus: (status: string) => void
}

export default function StatusQuickFilter({
  students,
  currentFilters,
  onFilterChange,
  onSelectAllByStatus,
}: StatusQuickFilterProps) {
  const statusConfig = [
    { 
      value: 'active', 
      label: 'Active', 
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      count: students.filter(s => s.status === 'active').length
    },
    { 
      value: 'in_progress', 
      label: 'In Progress', 
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      count: students.filter(s => s.status === 'in_progress').length
    },
    { 
      value: 'completed', 
      label: 'Completed', 
      color: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      count: students.filter(s => s.status === 'completed').length
    },
    { 
      value: 'concern', 
      label: 'Concern', 
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      count: students.filter(s => s.status === 'concern').length
    },
    { 
      value: 'inactive', 
      label: 'Inactive', 
      color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      count: students.filter(s => s.status === 'inactive').length
    },
  ]

  const handleStatusClick = (status: string) => {
    const isCurrentlyFiltered = currentFilters.studentStatus.includes(status)
    
    if (isCurrentlyFiltered) {
      // Remove this status filter
      const newStudentStatus = currentFilters.studentStatus.filter(s => s !== status)
      onFilterChange({
        ...currentFilters,
        studentStatus: newStudentStatus
      })
    } else {
      // Set filter to only this status (replace all others)
      onFilterChange({
        ...currentFilters,
        studentStatus: [status]
      })
    }
  }

  const handleShowAll = () => {
    onFilterChange({
      ...currentFilters,
      studentStatus: []
    })
  }

  const totalStudents = students.length
  const hasStatusFilter = currentFilters.studentStatus.length > 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Quick Status Filter
          </h3>
          {hasStatusFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowAll}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Show All ({totalStudents})
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {statusConfig.map((status) => {
            const isActive = currentFilters.studentStatus.includes(status.value)
            const isOnlyFilter = currentFilters.studentStatus.length === 1 && isActive
            
            return (
              <div key={status.value} className="flex items-center gap-1">
                <Badge
                  className={`cursor-pointer transition-all ${status.color} ${
                    isActive 
                      ? 'ring-2 ring-offset-1 ring-blue-500 font-semibold' 
                      : 'hover:shadow-sm'
                  }`}
                  onClick={() => handleStatusClick(status.value)}
                >
                  {status.label} ({status.count})
                </Badge>
                
                {/* Select All button for this status */}
                {isOnlyFilter && status.count > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSelectAllByStatus(status.value)}
                    className="h-6 px-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title={`Select all ${status.label.toLowerCase()} students`}
                  >
                    <CheckSquare className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {hasStatusFilter && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                Showing {currentFilters.studentStatus.length === 1 
                  ? statusConfig.find(s => s.value === currentFilters.studentStatus[0])?.count || 0
                  : students.filter(s => currentFilters.studentStatus.includes(s.status)).length
                } of {totalStudents} students
              </span>
              {currentFilters.studentStatus.length === 1 && (
                <span className="text-blue-600 font-medium">
                  ← Click 📋 to select all {statusConfig.find(s => s.value === currentFilters.studentStatus[0])?.label.toLowerCase()} students
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}