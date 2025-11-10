'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: ('ceo' | 'admin' | 'manager' | 'team_member' | 'viewer')[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredRoles = ['ceo', 'admin', 'manager', 'team_member', 'viewer'],
  fallback
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return fallback || (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Access Denied</h3>
              <p className="text-sm text-red-700 mt-1">
                You need to be logged in to access this page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Check if user has required role
  if (!requiredRoles.includes(profile.role)) {
    return fallback || (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">Insufficient Permissions</h3>
              <p className="text-sm text-orange-700 mt-1">
                Your role ({profile.role}) does not have access to this section.
                Only {requiredRoles.join(', ')} roles can access this.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
