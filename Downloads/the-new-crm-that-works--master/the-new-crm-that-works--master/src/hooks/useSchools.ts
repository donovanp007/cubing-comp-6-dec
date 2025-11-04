'use client'

import { useState, useEffect } from 'react'

export interface School {
  id: string
  name: string
  target_enrollment?: number
  current_enrollment?: number
  monthly_cost?: number
  program_fee_per_student?: number
  created_at?: string
  updated_at?: string
}

// Default schools that come with the system - Cape Town area schools
const DEFAULT_SCHOOLS: School[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Panorama Primary',
    target_enrollment: 30,
    current_enrollment: 18,
    monthly_cost: 2500,
    program_fee_per_student: 450,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Table Bay High',
    target_enrollment: 25,
    current_enrollment: 22,
    monthly_cost: 3200,
    program_fee_per_student: 520,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Goodwood Primary',
    target_enrollment: 35,
    current_enrollment: 31,
    monthly_cost: 2800,
    program_fee_per_student: 480,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Bellville High',
    target_enrollment: 40,
    current_enrollment: 35,
    monthly_cost: 3500,
    program_fee_per_student: 600,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Parow Primary',
    target_enrollment: 20,
    current_enrollment: 15,
    monthly_cost: 2200,
    program_fee_per_student: 400,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Durbanville Primary',
    target_enrollment: 32,
    current_enrollment: 28,
    monthly_cost: 2600,
    program_fee_per_student: 470,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'Brackenfell High',
    target_enrollment: 35,
    current_enrollment: 30,
    monthly_cost: 3000,
    program_fee_per_student: 550,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const STORAGE_KEY = 'cubing-hub-schools-v2'

export function useSchools() {
  const [schools, setSchools] = useState<School[]>(DEFAULT_SCHOOLS)
  const [loading, setLoading] = useState(true)

  // Load schools from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedSchools = JSON.parse(stored)
        // Merge with defaults to ensure we have the default schools
        const mergedSchools = mergeSchools(DEFAULT_SCHOOLS, parsedSchools)
        setSchools(mergedSchools)
      }
    } catch (error) {
      console.error('Error loading schools from localStorage:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save schools to localStorage whenever schools change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schools))
      } catch (error) {
        console.error('Error saving schools to localStorage:', error)
      }
    }
  }, [schools, loading])

  // Helper function to merge default schools with stored schools
  const mergeSchools = (defaultSchools: School[], storedSchools: School[]): School[] => {
    const schoolMap = new Map<string, School>()
    
    // Add all default schools first
    defaultSchools.forEach(school => schoolMap.set(school.id, school))
    
    // Add/update with stored schools (this preserves any new schools added by users)
    storedSchools.forEach(school => schoolMap.set(school.id, school))
    
    return Array.from(schoolMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }

  const addSchool = (schoolData: Omit<School, 'id' | 'created_at' | 'updated_at'>): School => {
    const newSchool: School = {
      id: crypto.randomUUID(),
      ...schoolData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setSchools(prev => {
      // Check if school with this name already exists
      const existingSchool = prev.find(s => s.name.toLowerCase() === schoolData.name.toLowerCase())
      if (existingSchool) {
        return prev // Don't add duplicate
      }
      
      return [...prev, newSchool].sort((a, b) => a.name.localeCompare(b.name))
    })

    return newSchool
  }

  const updateSchool = (schoolId: string, updates: Partial<School>): boolean => {
    setSchools(prev => {
      const updated = prev.map(school =>
        school.id === schoolId
          ? { ...school, ...updates, updated_at: new Date().toISOString() }
          : school
      )
      return updated.sort((a, b) => a.name.localeCompare(b.name))
    })
    return true
  }

  const deleteSchool = (schoolId: string): boolean => {
    // Don't allow deleting default schools
    const isDefaultSchool = DEFAULT_SCHOOLS.some(school => school.id === schoolId)
    if (isDefaultSchool) {
      return false
    }

    setSchools(prev => prev.filter(school => school.id !== schoolId))
    return true
  }

  const getSchoolById = (schoolId: string): School | undefined => {
    return schools.find(school => school.id === schoolId)
  }

  const getSchoolByName = (schoolName: string): School | undefined => {
    return schools.find(school => school.name.toLowerCase() === schoolName.toLowerCase())
  }

  return {
    schools,
    loading,
    addSchool,
    updateSchool,
    deleteSchool,
    getSchoolById,
    getSchoolByName
  }
}