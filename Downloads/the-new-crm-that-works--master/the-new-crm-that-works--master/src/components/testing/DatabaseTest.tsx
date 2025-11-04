'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Database, Plus, RefreshCw } from 'lucide-react'
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents'
import { StudentInsert } from '@/types'

export default function DatabaseTest() {
  const { 
    students, 
    loading, 
    error, 
    createStudent, 
    testConnection, 
    fetchSchools,
    fetchStudents 
  } = useSupabaseStudents()

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([])

  const handleTestConnection = async () => {
    setTestLoading(true)
    const result = await testConnection()
    setTestResult(result)
    setTestLoading(false)

    if (result.success) {
      const schoolsData = await fetchSchools()
      setSchools(schoolsData)
    }
  }

  const handleCreateTestStudent = async () => {
    const testStudent: StudentInsert = {
      first_name: 'Test',
      last_name: 'Student',
      school_id: schools[0]?.id || '1',
      grade: 8,
      parent_name: 'Test Parent',
      parent_phone: '+27-82-TEST-123',
      parent_email: 'test@example.com',
      class_type: 'Database Test',
      status: 'active',
      payment_status: 'paid',
      consent_received: true,
      certificate_given: false,
      cube_received: false,
      items_purchased: ['Test Item'],
      tags: ['test', 'database'],
      notes: 'Test student created to verify database functionality'
    }

    const success = await createStudent(testStudent)
    if (success) {
      alert('Test student created successfully!')
    } else {
      alert('Failed to create test student. Check console for errors.')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Database Test
          </CardTitle>
          <CardDescription>
            Test the database connection and functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Test */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleTestConnection}
              disabled={testLoading}
              variant="outline"
            >
              {testLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>

            {testResult && (
              <div className={`flex items-center gap-2 ${
                testResult.success ? 'text-green-600' : 'text-red-600'
              }`}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Schools Data */}
          {schools.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Available Schools:</h4>
              <div className="flex flex-wrap gap-2">
                {schools.map(school => (
                  <Badge key={school.id} variant="secondary">
                    {school.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Students Data */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Current Students: {students.length}</h4>
              <Button
                onClick={fetchStudents}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>

            {loading && <p className="text-sm text-gray-500">Loading students...</p>}
            
            {error && (
              <div className="bg-red-50 p-3 rounded-md">
                <p className="text-sm text-red-600">Error: {error}</p>
              </div>
            )}

            {students.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600 mb-2">Recent students:</p>
                {students.slice(0, 3).map(student => (
                  <div key={student.id} className="text-sm">
                    • {student.first_name} {student.last_name} - {student.schools?.name}
                  </div>
                ))}
                {students.length > 3 && (
                  <p className="text-xs text-gray-500 mt-1">
                    +{students.length - 3} more students...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Create Test Student */}
          {testResult?.success && schools.length > 0 && (
            <div className="pt-4 border-t">
              <Button
                onClick={handleCreateTestStudent}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Test Student
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}