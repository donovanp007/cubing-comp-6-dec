'use client'

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import StudentsTableImproved from './StudentsTableImproved'
import StudentsFilter, { FilterOptions } from './StudentsFilter'
import HorizontalStudentsFilter from './HorizontalStudentsFilter'
import StatusQuickFilter from './StatusQuickFilter'
import FilterSummary from './FilterSummary'
import { StudentWithSchool, StudentInsert } from '@/types'
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents'
import { useSupabaseSchools } from '@/hooks/useSupabaseSchools'
import { useDebounce } from '@/hooks/useDebounce'

// Lazy load modals for better initial load performance
const AddStudentModal = lazy(() => import('./AddStudentModal'))
const QuickAddStudentModal = lazy(() => import('./QuickAddStudentModal'))
const EditStudentModal = lazy(() => import('./EditStudentModal'))
const ImportExportModal = lazy(() => import('./ImportExportModal'))

export default function StudentsPage() {
  const router = useRouter()
  
  // Use real database with localStorage fallback - data will persist!
  const { 
    students, 
    loading, 
    error,
    usingLocalStorage,
    createStudent,
    updateStudent,
    deleteStudent,
    importStudents
  } = useSupabaseStudents()

  // Use database-backed school storage
  const { schools: dbSchools, createSchool } = useSupabaseSchools()
  
  // Get dynamic schools from students data (like schools page does)
  const dynamicSchools = useMemo(() => {
    if (students.length === 0) {
      return dbSchools.map(s => ({ id: s.id, name: s.name }))
    }
    
    const schoolsMap = new Map<string, { id: string; name: string }>()
    
    // Process students only once with for...of loop for better performance
    for (const student of students) {
      const schoolId = student.school_id
      const schoolName = student.schools?.name
      
      if (schoolId && schoolName && !schoolsMap.has(schoolId)) {
        schoolsMap.set(schoolId, { id: schoolId, name: schoolName })
      }
    }
    
    // Combine with database schools efficiently
    const schoolsFromStudents = Array.from(schoolsMap.values())
    const dbSchoolsFormatted = dbSchools.map(s => ({ id: s.id, name: s.name }))
    
    // Use Set for O(1) lookups when deduplicating
    const seenNames = new Set<string>()
    const uniqueSchools: Array<{ id: string; name: string }> = []
    
    for (const school of [...schoolsFromStudents, ...dbSchoolsFormatted]) {
      const lowerName = school.name.toLowerCase()
      if (!seenNames.has(lowerName)) {
        seenNames.add(lowerName)
        uniqueSchools.push(school)
      }
    }
    
    return uniqueSchools.sort((a, b) => a.name.localeCompare(b.name))
  }, [students, dbSchools])

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [selectedStudent, setSelectedStudent] = useState<StudentWithSchool | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false)
  const [importExportModalOpen, setImportExportModalOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'school-asc' | 'grade-asc' | 'grade-desc' | 'created-desc' | 'created-asc'>('name-asc')
  const [filters, setFilters] = useState<FilterOptions>({
    schools: [],
    grades: [],
    paymentStatus: [],
    studentStatus: [],
    tags: [],
  })
  
  // Local state for invoice status (since it doesn't exist in database)
  const [invoiceStatuses, setInvoiceStatuses] = useState<Record<string, boolean>>({})

  // Log database connection status
  useEffect(() => {
    if (error) {
      console.warn('Database connection issue:', error)
    }
  }, [error])

  // Memoize filter predicates for better performance
  const schoolsSet = useMemo(() => new Set(filters.schools), [filters.schools])
  const gradesSet = useMemo(() => new Set(filters.grades), [filters.grades])
  const paymentStatusSet = useMemo(() => new Set(filters.paymentStatus), [filters.paymentStatus])
  const studentStatusSet = useMemo(() => new Set(filters.studentStatus), [filters.studentStatus])
  const tagsSet = useMemo(() => new Set(filters.tags), [filters.tags])

  const filteredAndSortedStudents = useMemo(() => {
    const query = debouncedSearchQuery?.toLowerCase()
    
    // Pre-filter early to reduce processing
    let filtered = students
    
    if (query) {
      filtered = filtered.filter(student => {
        // Early return for performance - check most common fields first
        return (
          student.first_name.toLowerCase().includes(query) ||
          student.last_name.toLowerCase().includes(query) ||
          (student.parent_name && student.parent_name.toLowerCase().includes(query)) ||
          (student.schools?.name && student.schools.name.toLowerCase().includes(query)) ||
          student.class_type.toLowerCase().includes(query) ||
          (student.parent_email && student.parent_email.toLowerCase().includes(query)) ||
          (student.parent_phone && student.parent_phone.includes(query))
        )
      })
    }
    
    // Apply other filters using Sets for O(1) lookup
    if (schoolsSet.size > 0) {
      filtered = filtered.filter(student => schoolsSet.has(student.schools?.name || ''))
    }
    
    if (gradesSet.size > 0) {
      filtered = filtered.filter(student => gradesSet.has(student.grade))
    }
    
    if (paymentStatusSet.size > 0) {
      filtered = filtered.filter(student => paymentStatusSet.has(student.payment_status))
    }
    
    if (studentStatusSet.size > 0) {
      filtered = filtered.filter(student => studentStatusSet.has(student.status))
    }
    
    if (tagsSet.size > 0) {
      filtered = filtered.filter(student => {
        const studentTags = student.tags || []
        return studentTags.some(tag => tagsSet.has(tag))
      })
    }
    
    // Optimize sorting with pre-computed values
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': {
          const nameA = `${a.first_name} ${a.last_name}`
          const nameB = `${b.first_name} ${b.last_name}`
          return nameA.localeCompare(nameB)
        }
        case 'name-desc': {
          const nameA = `${a.first_name} ${a.last_name}`
          const nameB = `${b.first_name} ${b.last_name}`
          return nameB.localeCompare(nameA)
        }
        case 'school-asc':
          return (a.schools?.name || '').localeCompare(b.schools?.name || '')
        case 'grade-asc':
          return a.grade - b.grade
        case 'grade-desc':
          return b.grade - a.grade
        case 'created-desc': {
          // Pre-compute dates to avoid repeated parsing
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()
          return dateB - dateA
        }
        case 'created-asc': {
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()
          return dateA - dateB
        }
        default:
          return 0
      }
    })
  }, [students, debouncedSearchQuery, schoolsSet, gradesSet, paymentStatusSet, studentStatusSet, tagsSet, sortBy])

  const handleViewStudent = useCallback((student: StudentWithSchool) => {
    router.push(`/students/${student.id}`)
  }, [router])

  const handleEditStudent = useCallback((student: StudentWithSchool) => {
    setSelectedStudent(student)
    setEditModalOpen(true)
  }, [])

  const handleDeleteStudent = useCallback(async (student: StudentWithSchool) => {
    const success = await deleteStudent(student.id)
    if (!success) {
      alert('Failed to delete student. Please try again.')
    }
  }, [deleteStudent])

  const handleAddStudent = () => {
    setQuickAddModalOpen(true)
  }

  const handleOpenFullForm = () => {
    setQuickAddModalOpen(false)
    setAddModalOpen(true)
  }

  const handleStudentAdded = async (studentData: StudentInsert) => {
    const success = await createStudent(studentData)
    if (success) {
      setAddModalOpen(false)
      setQuickAddModalOpen(false)
    } else {
      alert('Failed to add student. Please try again.')
    }
  }

  // Handler for adding new schools
  const handleAddSchool = (schoolName: string) => {
    // Create a temporary school entry immediately for the UI
    const tempSchool = { id: crypto.randomUUID(), name: schoolName }
    
    // Add to database in the background
    createSchool({
      name: schoolName,
      target_enrollment: 30,
      monthly_cost: 2500,
      program_fee_per_student: 450
    }).catch(error => {
      console.error('Error adding school to database:', error)
    })
    
    return tempSchool
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const toggleFilter = () => {
    setFilterOpen(!filterOpen)
  }

  const handleUpdateStudent = useCallback(async (studentId: string, updates: Partial<StudentWithSchool>) => {
    try {
      // Filter out properties that shouldn't be sent to database
      const { schools, invoice_sent, ...dbUpdates } = updates

      // Update invoice status locally if provided
      if (invoice_sent !== undefined) {
        setInvoiceStatuses(prev => ({
          ...prev,
          [studentId]: invoice_sent as boolean
        }))
      }

      // Only call database if there are updates beyond invoice_sent
      if (Object.keys(dbUpdates).length === 0) {
        return
      }

      const success = await updateStudent(studentId, dbUpdates)
      if (!success) {
        alert('Failed to update student. Please try again.')
      }
    } catch (error) {
      alert('Failed to update student. Please try again.')
    }
  }, [updateStudent])

  const handleImportStudents = async (importedStudents: StudentInsert[]) => {
    const result = await importStudents(importedStudents)
    if (result.errors > 0) {
      alert(`Import completed with ${result.errors} errors. ${result.success} students imported successfully.`)
    } else {
      alert(`Successfully imported ${result.success} students.`)
    }
    setImportExportModalOpen(false)
  }

  const handleQuickExport = () => {
    // Quick export of filtered students
    const CSV_HEADERS = [
      'Student Name',
      'Parent Name', 
      'Phone',
      'Parent email',
      'School Name',
      'photo consent'
    ]
    
    const csvContent = [
      CSV_HEADERS.join(','),
      ...filteredAndSortedStudents.map(student => [
        `"${student.first_name} ${student.last_name}"`,
        `"${student.parent_name}"`,
        `"${student.parent_phone}"`,
        `"${student.parent_email}"`,
        `"${student.schools?.name || ''}"`,
        student.consent_received ? 'Yes' : 'No'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `filtered_students_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSelectAllByStatus = (status: string) => {
    // This function will be called when the StatusQuickFilter wants to select all students of a specific status
    // The actual selection logic is handled in StudentsTable
    console.log(`Selecting all students with status: ${status}`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Managing {filteredAndSortedStudents.length} student{filteredAndSortedStudents.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleAddStudent} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          + Add Student
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search students..."
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="space-y-4">
        {/* Status indicator */}
        {(error || usingLocalStorage) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-800 text-sm font-medium">
                {usingLocalStorage ? 'Using local storage - data persists in browser' : 'Database temporarily unavailable - using local storage'}
              </span>
            </div>
          </div>
        )}

        <StatusQuickFilter
          students={students}
          currentFilters={filters}
          onFilterChange={handleFilterChange}
          onSelectAllByStatus={handleSelectAllByStatus}
        />
        
        <HorizontalStudentsFilter
          students={students}
          onFilterChange={handleFilterChange}
        />
        
        <FilterSummary
          filters={filters}
          onFilterChange={handleFilterChange}
          totalStudents={students.length}
          filteredCount={filteredAndSortedStudents.length}
        />
        
        <StudentsTableImproved
          students={filteredAndSortedStudents}
          loading={loading}
          onViewStudent={handleViewStudent}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
          onUpdateStudent={handleUpdateStudent}
          invoiceStatuses={invoiceStatuses}
          onImportExport={() => setImportExportModalOpen(true)}
          onQuickExport={handleQuickExport}
        />

        <Suspense fallback={null}>
          <QuickAddStudentModal
            open={quickAddModalOpen}
            onOpenChange={setQuickAddModalOpen}
            onAddStudent={handleStudentAdded}
            schools={dynamicSchools}
            onOpenFullForm={handleOpenFullForm}
            onAddSchool={handleAddSchool}
          />

          <AddStudentModal
            open={addModalOpen}
            onOpenChange={setAddModalOpen}
            onAddStudent={handleStudentAdded}
            schools={dynamicSchools}
            onAddSchool={handleAddSchool}
          />

          <EditStudentModal
            student={selectedStudent}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onUpdateStudent={handleUpdateStudent}
            schools={dynamicSchools}
            onAddSchool={handleAddSchool}
          />

          <ImportExportModal
            open={importExportModalOpen}
            onOpenChange={setImportExportModalOpen}
            students={filteredAndSortedStudents}
            allStudents={students}
            onImportStudents={handleImportStudents}
          />
        </Suspense>
      </div>
    </div>
  )
}