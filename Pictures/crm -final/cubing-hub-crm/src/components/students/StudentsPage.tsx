'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/dashboard/Layout'
import StudentsTable from './StudentsTable'
import StudentProfileModal from './StudentProfileModal'
import StudentsFilter, { FilterOptions } from './StudentsFilter'
import AddStudentModal from './AddStudentModal'
import EditStudentModal from './EditStudentModal'
import ImportExportModal from './ImportExportModal'
import { StudentWithSchool, StudentInsert } from '@/types'
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents'

export default function StudentsPage() {
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

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentWithSchool | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [importExportModalOpen, setImportExportModalOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    schools: [],
    grades: [],
    paymentStatus: [],
    studentStatus: [],
    tags: [],
  })

  // Log database connection status
  useEffect(() => {
    if (error) {
      console.warn('Database connection issue:', error)
    }
  }, [error])

  const filteredStudents = students.filter(student => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = (
        student.first_name.toLowerCase().includes(query) ||
        student.last_name.toLowerCase().includes(query) ||
        student.parent_name.toLowerCase().includes(query) ||
        student.schools?.name.toLowerCase().includes(query) ||
        student.class_type.toLowerCase().includes(query) ||
        student.parent_email.toLowerCase().includes(query) ||
        student.parent_phone.includes(query)
      )
      if (!matchesSearch) return false
    }

    // School filter
    if (filters.schools.length > 0 && !filters.schools.includes(student.schools?.name || '')) {
      return false
    }

    // Grade filter
    if (filters.grades.length > 0 && !filters.grades.includes(student.grade)) {
      return false
    }

    // Payment status filter
    if (filters.paymentStatus.length > 0 && !filters.paymentStatus.includes(student.payment_status)) {
      return false
    }

    // Student status filter
    if (filters.studentStatus.length > 0 && !filters.studentStatus.includes(student.status)) {
      return false
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const studentTags = student.tags || []
      const hasMatchingTag = filters.tags.some(tag => studentTags.includes(tag))
      if (!hasMatchingTag) return false
    }

    return true
  })

  const handleViewStudent = (student: StudentWithSchool) => {
    setSelectedStudent(student)
    setProfileModalOpen(true)
  }

  const handleEditStudent = (student: StudentWithSchool) => {
    setSelectedStudent(student)
    setEditModalOpen(true)
  }

  const handleDeleteStudent = async (student: StudentWithSchool) => {
    const success = await deleteStudent(student.id)
    if (!success) {
      alert('Failed to delete student. Please try again.')
    }
  }

  const handleAddStudent = () => {
    setAddModalOpen(true)
  }

  const handleStudentAdded = async (studentData: StudentInsert) => {
    const success = await createStudent(studentData)
    if (success) {
      setAddModalOpen(false)
    } else {
      alert('Failed to add student. Please try again.')
    }
  }

  // Get unique schools for the add modal
  const uniqueSchools = [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Riverside Primary', target_enrollment: 30, current_enrollment: 18, monthly_cost: 2500, program_fee_per_student: 450, created_at: '', updated_at: '' },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Mountain View High', target_enrollment: 25, current_enrollment: 22, monthly_cost: 3200, program_fee_per_student: 520, created_at: '', updated_at: '' },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Oakwood Elementary', target_enrollment: 35, current_enrollment: 31, monthly_cost: 2800, program_fee_per_student: 480, created_at: '', updated_at: '' },
    { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Central Academy', target_enrollment: 40, current_enrollment: 35, monthly_cost: 3500, program_fee_per_student: 600, created_at: '', updated_at: '' },
    { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Sunrise School', target_enrollment: 20, current_enrollment: 15, monthly_cost: 2200, program_fee_per_student: 400, created_at: '', updated_at: '' },
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const toggleFilter = () => {
    setFilterOpen(!filterOpen)
  }

  const handleUpdateStudent = async (studentId: string, updates: Partial<StudentWithSchool>) => {
    const success = await updateStudent(studentId, updates)
    if (!success) {
      alert('Failed to update student. Please try again.')
    }
  }

  const handleImportStudents = async (importedStudents: StudentInsert[]) => {
    const result = await importStudents(importedStudents)
    if (result.errors > 0) {
      alert(`Import completed with ${result.errors} errors. ${result.success} students imported successfully.`)
    } else {
      alert(`Successfully imported ${result.success} students.`)
    }
    setImportExportModalOpen(false)
  }

  return (
    <Layout
      title="Students"
      subtitle={`Managing ${filteredStudents.length} student${filteredStudents.length !== 1 ? 's' : ''}`}
      showAddButton={true}
      onAddClick={handleAddStudent}
      showSearch={true}
      onSearch={handleSearch}
    >
      <div className="space-y-6">
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

        <StudentsFilter
          students={students}
          onFilterChange={handleFilterChange}
          isOpen={filterOpen}
          onToggle={toggleFilter}
        />
        
        <StudentsTable
          students={filteredStudents}
          loading={loading}
          onViewStudent={handleViewStudent}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
          onUpdateStudent={handleUpdateStudent}
          onImportExport={() => setImportExportModalOpen(true)}
        />
        
        <StudentProfileModal
          student={selectedStudent}
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
        />

        <AddStudentModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          onAddStudent={handleStudentAdded}
          schools={uniqueSchools}
        />

        <EditStudentModal
          student={selectedStudent}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onUpdateStudent={handleUpdateStudent}
          schools={uniqueSchools}
        />

        <ImportExportModal
          open={importExportModalOpen}
          onOpenChange={setImportExportModalOpen}
          students={students}
          onImportStudents={handleImportStudents}
        />
      </div>
    </Layout>
  )
}