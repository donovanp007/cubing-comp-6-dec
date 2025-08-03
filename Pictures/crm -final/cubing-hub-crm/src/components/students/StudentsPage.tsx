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

// Mock data for development
const mockStudents: StudentWithSchool[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Smith',
    school_id: '1',
    grade: 5,
    parent_name: 'Mary Smith',
    parent_phone: '+27-82-123-4567',
    parent_email: 'mary.smith@email.com',
    status: 'active',
    class_type: 'Beginner Cubing',
    payment_status: 'paid',
    consent_received: true,
    certificate_given: false,
    cube_received: true,
    items_purchased: ['3x3 Cube'],
    tags: ['beginner', 'enthusiastic'],
    notes: '',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    schools: { id: '1', name: 'Riverside Primary', target_enrollment: 30, current_enrollment: 18, created_at: '', updated_at: '', monthly_cost: 2500, program_fee_per_student: 450 }
  },
  {
    id: '2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    school_id: '1',
    grade: 6,
    parent_name: 'David Johnson',
    parent_phone: '+27-83-234-5678',
    parent_email: 'david.johnson@email.com',
    status: 'active',
    class_type: 'Intermediate Cubing',
    payment_status: 'outstanding',
    consent_received: true,
    certificate_given: false,
    cube_received: false,
    items_purchased: [],
    tags: ['needs-follow-up', 'payment-issue'],
    notes: 'Needs follow-up on payment',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    schools: { id: '1', name: 'Riverside Primary', target_enrollment: 30, current_enrollment: 18, created_at: '', updated_at: '', monthly_cost: 2500, program_fee_per_student: 450 }
  },
  {
    id: '3',
    first_name: 'Mike',
    last_name: 'Williams',
    school_id: '2',
    grade: 9,
    parent_name: 'Lisa Williams',
    parent_phone: '+27-84-345-6789',
    parent_email: 'lisa.williams@email.com',
    status: 'in_progress',
    class_type: 'Advanced Cubing',
    payment_status: 'paid',
    consent_received: true,
    certificate_given: false,
    cube_received: true,
    items_purchased: ['3x3 Cube', 'Timer'],
    tags: ['advanced', 'promising'],
    notes: 'Progressing well',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    schools: { id: '2', name: 'Mountain View High', target_enrollment: 25, current_enrollment: 22, created_at: '', updated_at: '', monthly_cost: 3200, program_fee_per_student: 520 }
  },
  {
    id: '4',
    first_name: 'Emma',
    last_name: 'Davis',
    school_id: '3',
    grade: 7,
    parent_name: 'Robert Davis',
    parent_phone: '+27-85-456-7890',
    parent_email: 'robert.davis@email.com',
    status: 'completed',
    class_type: 'Beginner Cubing',
    payment_status: 'paid',
    consent_received: true,
    certificate_given: true,
    cube_received: true,
    items_purchased: ['3x3 Cube', 'Certificate Frame', 'Carrying Case'],
    tags: ['completed', 'excellent', 'graduate'],
    notes: 'Excellent student, completed program',
    created_at: '2023-11-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    schools: { id: '3', name: 'Oakwood Elementary', target_enrollment: 35, current_enrollment: 31, created_at: '', updated_at: '', monthly_cost: 2800, program_fee_per_student: 480 }
  },
  {
    id: '5',
    first_name: 'Alex',
    last_name: 'Thompson',
    school_id: '2',
    grade: 10,
    parent_name: 'Jennifer Thompson',
    parent_phone: '+27-86-567-8901',
    parent_email: 'jennifer.thompson@email.com',
    status: 'concern',
    class_type: 'Intermediate Cubing',
    payment_status: 'overdue',
    consent_received: true,
    certificate_given: false,
    cube_received: false,
    items_purchased: [],
    tags: ['at-risk', 'payment-overdue', 'attendance-issues'],
    notes: 'Payment overdue, attendance issues',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-02-05T10:00:00Z',
    schools: { id: '2', name: 'Mountain View High', target_enrollment: 25, current_enrollment: 22, created_at: '', updated_at: '', monthly_cost: 3200, program_fee_per_student: 520 }
  },
  {
    id: '6',
    first_name: 'Zoe',
    last_name: 'Brown',
    school_id: '4',
    grade: 8,
    parent_name: 'Michael Brown',
    parent_phone: '+27-87-678-9012',
    parent_email: 'michael.brown@email.com',
    status: 'inactive',
    class_type: 'Advanced Cubing',
    payment_status: 'partial',
    consent_received: false,
    certificate_given: false,
    cube_received: false,
    items_purchased: [],
    tags: ['inactive', 'dropped-out'],
    notes: 'Dropped out mid-program',
    created_at: '2023-12-01T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    schools: { id: '4', name: 'Central Academy', target_enrollment: 40, current_enrollment: 35, created_at: '', updated_at: '', monthly_cost: 3500, program_fee_per_student: 600 }
  },
]

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentWithSchool[]>(mockStudents)
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    // Simulate brief loading for mock data
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }, [])

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

  const handleDeleteStudent = (student: StudentWithSchool) => {
    console.log('Delete student:', student)
    // This will show a confirmation dialog
  }

  const handleAddStudent = () => {
    setAddModalOpen(true)
  }

  const handleStudentAdded = (studentData: StudentInsert) => {
    // Convert StudentInsert to StudentWithSchool by finding the school
    const school = uniqueSchools.find(s => s.id === studentData.school_id)
    const newStudent: StudentWithSchool = {
      id: studentData.id || `student_${Date.now()}`,
      first_name: studentData.first_name,
      last_name: studentData.last_name,
      school_id: studentData.school_id,
      grade: studentData.grade,
      parent_name: studentData.parent_name,
      parent_phone: studentData.parent_phone,
      parent_email: studentData.parent_email,
      status: studentData.status || 'active',
      class_type: studentData.class_type,
      payment_status: studentData.payment_status || 'outstanding',
      consent_received: studentData.consent_received || false,
      certificate_given: studentData.certificate_given || false,
      cube_received: studentData.cube_received || false,
      items_purchased: studentData.items_purchased || [],
      tags: studentData.tags || [],
      notes: studentData.notes || '',
      created_at: studentData.created_at || new Date().toISOString(),
      updated_at: studentData.updated_at || new Date().toISOString(),
      schools: school || { id: studentData.school_id, name: 'Unknown School', target_enrollment: 0, current_enrollment: 0, monthly_cost: 0, program_fee_per_student: 0, created_at: '', updated_at: '' }
    }
    
    setStudents(prev => [newStudent, ...prev])
  }

  // Get unique schools for the add modal
  const uniqueSchools = [
    { id: '1', name: 'Riverside Primary', target_enrollment: 30, current_enrollment: 18, monthly_cost: 2500, program_fee_per_student: 450, created_at: '', updated_at: '' },
    { id: '2', name: 'Mountain View High', target_enrollment: 25, current_enrollment: 22, monthly_cost: 3200, program_fee_per_student: 520, created_at: '', updated_at: '' },
    { id: '3', name: 'Oakwood Elementary', target_enrollment: 35, current_enrollment: 31, monthly_cost: 2800, program_fee_per_student: 480, created_at: '', updated_at: '' },
    { id: '4', name: 'Central Academy', target_enrollment: 40, current_enrollment: 35, monthly_cost: 3500, program_fee_per_student: 600, created_at: '', updated_at: '' },
    { id: '5', name: 'Sunrise School', target_enrollment: 20, current_enrollment: 15, monthly_cost: 2200, program_fee_per_student: 400, created_at: '', updated_at: '' },
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

  const handleUpdateStudent = (studentId: string, updates: Partial<StudentWithSchool>) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, ...updates, updated_at: new Date().toISOString() }
        : student
    ))
  }

  const handleImportStudents = (importedStudents: StudentInsert[]) => {
    const newStudents: StudentWithSchool[] = importedStudents.map(studentData => {
      const school = uniqueSchools.find(s => s.id === studentData.school_id) || uniqueSchools[0]!
      return {
        id: studentData.id || `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        school_id: studentData.school_id,
        grade: studentData.grade,
        parent_name: studentData.parent_name,
        parent_phone: studentData.parent_phone,
        parent_email: studentData.parent_email,
        status: studentData.status || 'active',
        class_type: studentData.class_type,
        payment_status: studentData.payment_status || 'outstanding',
        consent_received: studentData.consent_received || false,
        certificate_given: studentData.certificate_given || false,
        cube_received: studentData.cube_received || false,
        items_purchased: studentData.items_purchased || [],
        tags: studentData.tags || [],
        notes: studentData.notes || '',
        created_at: studentData.created_at || new Date().toISOString(),
        updated_at: studentData.updated_at || new Date().toISOString(),
        schools: school
      }
    })
    
    setStudents(prev => [...newStudents, ...prev])
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