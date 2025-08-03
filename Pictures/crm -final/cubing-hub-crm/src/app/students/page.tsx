'use client'

import StudentsPage from '@/components/students/StudentsPage'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function Students() {
  return <StudentsPage />
}