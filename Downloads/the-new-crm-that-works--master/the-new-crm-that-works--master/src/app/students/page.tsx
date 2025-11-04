'use client'

import StudentsPage from '@/components/students/StudentsPage'
import ErrorBoundary from '@/components/ErrorBoundary'

// Disable static generation for this page - updated
export const dynamic = 'force-dynamic'

export default function Students() {
  return (
    <ErrorBoundary>
      <StudentsPage />
    </ErrorBoundary>
  )
}