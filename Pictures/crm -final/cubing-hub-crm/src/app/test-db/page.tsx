import DatabaseTest from '@/components/testing/DatabaseTest'

export default function TestDatabasePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Connection Test</h1>
          <p className="text-gray-600 mb-8">
            Test the Supabase database connection and verify student creation functionality.
          </p>
          <DatabaseTest />
        </div>
      </div>
    </div>
  )
}