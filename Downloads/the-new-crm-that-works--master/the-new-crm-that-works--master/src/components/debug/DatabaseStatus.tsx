'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface DatabaseStatus {
  supabaseUrl: string
  hasAnonymousKey: boolean
  connectionTest: 'pending' | 'success' | 'failed'
  connectionError?: string
  studentCount?: number
  schoolCount?: number
  sampleStudent?: any
}

export default function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
    hasAnonymousKey: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    connectionTest: 'pending'
  })

  useEffect(() => {
    async function testConnection() {
      try {
        console.log('🔍 Testing database connection...')
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('Has Anon Key:', !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
        
        // Test basic connection
        const { data: testData, error: testError } = await supabase
          .from('students')
          .select('count')
          .limit(1)

        if (testError) {
          console.error('❌ Connection test failed:', testError)
          setStatus(prev => ({
            ...prev,
            connectionTest: 'failed',
            connectionError: testError.message
          }))
          return
        }

        console.log('✅ Basic connection successful')

        // Get counts
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('*')

        const { data: schools, error: schoolsError } = await supabase
          .from('schools')
          .select('*')

        console.log('📊 Students:', students?.length || 0)
        console.log('🏫 Schools:', schools?.length || 0)
        
        if (students && students.length > 0) {
          console.log('👤 Sample student:', students[0])
        }

        setStatus(prev => ({
          ...prev,
          connectionTest: 'success',
          studentCount: students?.length || 0,
          schoolCount: schools?.length || 0,
          sampleStudent: students?.[0] || null
        }))

      } catch (error: any) {
        console.error('💥 Unexpected error:', error)
        setStatus(prev => ({
          ...prev,
          connectionTest: 'failed',
          connectionError: error.message
        }))
      }
    }

    testConnection()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md text-xs z-50">
      <h3 className="font-bold mb-2 text-yellow-400">🔧 Database Debug Info</h3>
      
      <div className="space-y-1">
        <div>
          <span className="text-gray-300">Supabase URL:</span> 
          <span className="text-blue-300 ml-1 break-all">
            {status.supabaseUrl}
          </span>
        </div>
        
        <div>
          <span className="text-gray-300">Has Anon Key:</span> 
          <span className={status.hasAnonymousKey ? 'text-green-300' : 'text-red-300'}>
            {status.hasAnonymousKey ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-300">Connection:</span> 
          <span className={
            status.connectionTest === 'success' ? 'text-green-300' : 
            status.connectionTest === 'failed' ? 'text-red-300' : 'text-yellow-300'
          }>
            {status.connectionTest === 'pending' ? '⏳ Testing...' :
             status.connectionTest === 'success' ? '✅ Success' : 
             '❌ Failed'}
          </span>
        </div>

        {status.connectionError && (
          <div className="text-red-300">
            <span className="text-gray-300">Error:</span> {status.connectionError}
          </div>
        )}

        {status.connectionTest === 'success' && (
          <>
            <div>
              <span className="text-gray-300">Students in DB:</span> 
              <span className="text-green-300">{status.studentCount}</span>
            </div>
            <div>
              <span className="text-gray-300">Schools in DB:</span> 
              <span className="text-green-300">{status.schoolCount}</span>
            </div>
            {status.sampleStudent && (
              <div>
                <span className="text-gray-300">Sample:</span> 
                <span className="text-blue-300">{status.sampleStudent.first_name} {status.sampleStudent.last_name}</span>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="mt-2 text-gray-400 text-xs">
        Check browser console for detailed logs
      </div>
    </div>
  )
}