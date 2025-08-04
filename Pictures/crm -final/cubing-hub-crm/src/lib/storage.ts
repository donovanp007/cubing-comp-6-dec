// Local Storage Database - Persistent data storage fallback
import { StudentWithSchool, StudentInsert, StudentUpdate } from '@/types'

const STUDENTS_KEY = 'cubing_crm_students'
const SCHOOLS_KEY = 'cubing_crm_schools'

// Generate consistent default UUID for default school
const DEFAULT_SCHOOL_ID = '550e8400-e29b-41d4-a716-446655440000'

// Default school data
const DEFAULT_SCHOOLS = [
  {
    id: DEFAULT_SCHOOL_ID,
    name: 'Default School',
    target_enrollment: 30,
    current_enrollment: 0,
    monthly_cost: 2000,
    program_fee_per_student: 400,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Default student data
const DEFAULT_STUDENTS = [
  {
    id: crypto.randomUUID(),
    first_name: 'John',
    last_name: 'Smith',
    school_id: DEFAULT_SCHOOL_ID,
    grade: 5,
    parent_name: 'Mary Smith',
    parent_phone: '+27-82-123-4567',
    parent_email: 'mary.smith@email.com',
    status: 'active' as const,
    class_type: 'Beginner Cubing',
    payment_status: 'paid' as const,
    consent_received: true,
    certificate_given: false,
    cube_received: false,
    items_purchased: [],
    tags: [],
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    schools: DEFAULT_SCHOOLS[0]
  }
]

export class LocalStorageDB {
  private isClient = typeof window !== 'undefined'

  private getStorageItem<T>(key: string, defaultValue: T): T {
    if (!this.isClient) return defaultValue
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (!this.isClient) return
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  async getStudents(): Promise<StudentWithSchool[]> {
    const students = this.getStorageItem(STUDENTS_KEY, DEFAULT_STUDENTS)
    const schools = this.getStorageItem(SCHOOLS_KEY, DEFAULT_SCHOOLS)
    
    // Ensure students have school data attached
    return students.map(student => ({
      ...student,
      schools: schools.find(school => school.id === student.school_id) || schools[0]
    }))
  }

  async createStudent(studentData: StudentInsert): Promise<StudentWithSchool> {
    const students = this.getStorageItem(STUDENTS_KEY, DEFAULT_STUDENTS)
    const schools = this.getStorageItem(SCHOOLS_KEY, DEFAULT_SCHOOLS)
    
    const newStudent = {
      ...studentData,
      id: crypto.randomUUID(),
      school_id: studentData.school_id || schools[0]?.id || crypto.randomUUID(),
      status: studentData.status || 'active',
      payment_status: studentData.payment_status || 'outstanding',
      consent_received: studentData.consent_received || false,
      certificate_given: studentData.certificate_given || false,
      cube_received: studentData.cube_received || false,
      items_purchased: studentData.items_purchased || [],
      tags: studentData.tags || [],
      notes: studentData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedStudents = [newStudent, ...students]
    this.setStorageItem(STUDENTS_KEY, updatedStudents)

    return {
      ...newStudent,
      schools: schools.find(school => school.id === newStudent.school_id) || schools[0]
    }
  }

  async updateStudent(id: string, updates: StudentUpdate): Promise<StudentWithSchool | null> {
    const students = this.getStorageItem(STUDENTS_KEY, DEFAULT_STUDENTS)
    const schools = this.getStorageItem(SCHOOLS_KEY, DEFAULT_SCHOOLS)
    
    const studentIndex = students.findIndex(s => s.id === id)
    if (studentIndex === -1) return null

    const updatedStudent = {
      ...students[studentIndex],
      ...updates,
      updated_at: new Date().toISOString()
    } as any

    students[studentIndex] = updatedStudent
    this.setStorageItem(STUDENTS_KEY, students)

    return {
      ...updatedStudent,
      schools: schools.find(school => school.id === updatedStudent.school_id) || schools[0]
    }
  }

  async deleteStudent(id: string): Promise<boolean> {
    const students = this.getStorageItem(STUDENTS_KEY, DEFAULT_STUDENTS)
    const updatedStudents = students.filter(s => s.id !== id)
    
    this.setStorageItem(STUDENTS_KEY, updatedStudents)
    return true
  }

  async getSchools() {
    return this.getStorageItem(SCHOOLS_KEY, DEFAULT_SCHOOLS)
  }

  // Import multiple students
  async importStudents(studentsData: StudentInsert[]): Promise<{ success: number; errors: number }> {
    let successCount = 0
    let errorCount = 0

    for (const studentData of studentsData) {
      try {
        await this.createStudent(studentData)
        successCount++
      } catch {
        errorCount++
      }
    }

    return { success: successCount, errors: errorCount }
  }
}

export const localDB = new LocalStorageDB()