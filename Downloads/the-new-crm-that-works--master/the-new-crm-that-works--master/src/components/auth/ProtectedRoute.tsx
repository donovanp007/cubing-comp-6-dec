'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requiredRoles?: string | string[]
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRoles,
  fallback,
  redirectTo = '/auth'
}: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin, isManager, canEdit } = useAuth()
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(false)

  // Helper function to check roles
  const checkRole = (roles: string | string[]) => {
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.some(role => {
      if (role === 'admin') return isAdmin()
      if (role === 'manager') return isManager()
      if (role === 'editor' || role === 'viewer') return canEdit() || profile?.role === role
      return profile?.role === role
    })
  }

  // Helper function to check permissions
  const checkPermissions = (permissions: string[]) => {
    if (permissions.length === 0) return true
    
    return permissions.every(permission => {
      if (permission === 'view_financials' || permission === 'view_ceo_dashboard' || permission === 'manage_users') {
        return isAdmin()
      }
      if (permission === 'view_analytics' || permission === 'view_basic_analytics') {
        return isManager()
      }
      return canEdit()
    })
  }

  useEffect(() => {
    if (loading) return

    // Not authenticated
    if (!user) {
      router.push(redirectTo)
      return
    }

    // Check role requirements
    if (requiredRoles && !checkRole(requiredRoles)) {
      setShouldRender(false)
      return
    }

    // Check permission requirements
    if (!checkPermissions(requiredPermissions)) {
      setShouldRender(false)
      return
    }

    setShouldRender(true)
  }, [user, profile, loading, requiredPermissions, requiredRoles, isAdmin, isManager, canEdit, router, redirectTo])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Redirecting to auth
  }

  if (!shouldRender) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Convenience components for specific access levels
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles="admin" fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}

export function CEOAdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['ceo', 'admin']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}

export function ManagerPlusOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['manager', 'ceo', 'admin']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}

export function WithPermission({ 
  permission, 
  children, 
  fallback 
}: { 
  permission: string; 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  return (
    <ProtectedRoute requiredPermissions={[permission]} fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}