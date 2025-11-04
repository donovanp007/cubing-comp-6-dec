'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Database } from 'lucide-react'

interface TestResult {
  name: string
  status: 'testing' | 'success' | 'error'
  error?: string
  result?: string
  data?: any
}

export default function TestDatabase() {
  // Only allow access in development mode
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResults([])

    const tests: TestResult[] = []

    try {
      // Test 1: Basic connection
      tests.push({ name: 'Supabase Connection', status: 'testing' })
      setResults([...tests])

      const { data, error: connError } = await supabase.from('users').select('count').limit(1)
      
      if (connError) {
        tests[0].status = 'error'
        tests[0].error = connError.message
        setError(`Connection failed: ${connError.message}`)
      } else {
        tests[0].status = 'success'
        tests[0].result = 'Connected successfully'
      }
      setResults([...tests])

      // Test 2: Check if users table exists
      tests.push({ name: 'Users Table', status: 'testing' })
      setResults([...tests])

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, name, role, status')
        .limit(5)

      if (usersError) {
        tests[1].status = 'error'
        tests[1].error = usersError.message
      } else {
        tests[1].status = 'success'
        tests[1].result = `Found ${usersData?.length || 0} users`
        tests[1].data = usersData
      }
      setResults([...tests])

      // Test 3: Check auth connection
      tests.push({ name: 'Auth Status', status: 'testing' })
      setResults([...tests])

      const { data: authData } = await supabase.auth.getSession()
      tests[2].status = 'success'
      tests[2].result = authData.session ? `User: ${authData.session.user.email}` : 'No active session'
      setResults([...tests])

      // Test 4: Check if tables exist
      tests.push({ name: 'Database Tables', status: 'testing' })
      setResults([...tests])

      const tableTests = ['users', 'projects', 'students', 'schools']
      const tableResults = []

      for (const table of tableTests) {
        const { error } = await supabase.from(table).select('*').limit(1)
        tableResults.push({
          table,
          exists: !error,
          error: error?.message
        })
      }

      tests[3].status = 'success'
      tests[3].result = `Checked ${tableTests.length} tables`
      tests[3].data = tableResults
      setResults([...tests])

    } catch (err: any) {
      console.error('Test error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-run test on mount
  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-6 w-6" />
              <span>Database Connection Test</span>
            </CardTitle>
            <CardDescription>
              Testing connection to Supabase database and checking table structure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Connection Tests</h3>
              <Button onClick={testConnection} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  'Run Tests'
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {results.map((test, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{test.name}</h4>
                    <div className="flex items-center space-x-2">
                      {test.status === 'testing' && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      )}
                      {test.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {test.status === 'error' && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium capitalize">{test.status}</span>
                    </div>
                  </div>
                  
                  {test.result && (
                    <p className="text-sm text-gray-600 mt-2">{test.result}</p>
                  )}
                  
                  {test.error && (
                    <p className="text-sm text-red-600 mt-2">Error: {test.error}</p>
                  )}
                  
                  {test.data && (
                    <details className="mt-3">
                      <summary className="text-sm font-medium cursor-pointer">View Data</summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Environment Check</h4>
              <div className="text-sm space-y-1">
                <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
                <p><strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}