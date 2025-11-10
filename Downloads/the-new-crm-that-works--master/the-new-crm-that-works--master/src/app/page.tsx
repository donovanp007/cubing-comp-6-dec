'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect authenticated users to students list
        router.replace('/students')
      } else {
        // Redirect unauthenticated users to auth page
        router.replace('/auth')
      }
    }
  }, [router, user, loading])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {loading ? 'Loading...' : user ? 'Redirecting to Dashboard...' : 'Redirecting to Sign In...'}
        </p>
      </div>
    </div>
  )
}