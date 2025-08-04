'use client'

import { useState, useEffect } from 'react'
import Layout from './Layout'
import MetricsTiles from './MetricsTiles'
import SchoolProgressGrid from './SchoolProgressGrid'
import { DashboardMetrics, SchoolProgress } from '@/types'

// Mock data for development - replace with real data later
const mockMetrics: DashboardMetrics = {
  totalActiveStudents: 47,
  newSignUps: 8,
  outstandingPayments: 3,
  completionRate: 85.2,
}

const mockSchoolProgress: SchoolProgress[] = [
  {
    id: '1',
    name: 'Riverside Primary',
    current: 18,
    target: 30,
    distanceToTarget: 12,
    percentComplete: 60.0,
  },
  {
    id: '2',
    name: 'Mountain View High',
    current: 22,
    target: 25,
    distanceToTarget: 3,
    percentComplete: 88.0,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Oakwood Elementary',
    current: 31,
    target: 35,
    distanceToTarget: 4,
    percentComplete: 88.6,
  },
  {
    id: '4',
    name: 'Central Academy',
    current: 35,
    target: 40,
    distanceToTarget: 5,
    percentComplete: 87.5,
  },
  {
    id: '5',
    name: 'Sunrise School',
    current: 15,
    target: 20,
    distanceToTarget: 5,
    percentComplete: 75.0,
  },
]

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockMetrics)
  const [schoolProgress, setSchoolProgress] = useState<SchoolProgress[]>(mockSchoolProgress)
  const [loading, setLoading] = useState(false)

  // Using mock data for now
  useEffect(() => {
    // Simulate brief loading state
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }, [])

  const handleAddStudent = () => {
    // This will be implemented when we create the student modal
    console.log('Add student clicked')
  }

  return (
    <Layout
      title="Dashboard"
      subtitle="Welcome back! Here's what's happening with your cubing students."
      showAddButton={true}
      onAddClick={handleAddStudent}
    >
      <div className="space-y-8">
        <MetricsTiles metrics={metrics} loading={loading} />
        <SchoolProgressGrid schools={schoolProgress} loading={loading} />
      </div>
    </Layout>
  )
}