'use client'

import { useAuth } from '@/contexts/AuthContext'

interface ConditionalRenderProps {
  children: React.ReactNode
  permissions?: string[]
  roles?: string | string[]
  fallback?: React.ReactNode
  requireAll?: boolean // If true, user must have ALL permissions/roles. If false, user needs ANY one.
}

export default function ConditionalRender({
  children,
  permissions = [],
  roles,
  fallback = null,
  requireAll = true
}: ConditionalRenderProps) {
  const { profile, isAdmin, isManager, canEdit } = useAuth()

  let hasAccess = true

  // Check roles
  if (roles && hasAccess) {
    const roleArray = Array.isArray(roles) ? roles : [roles]
    if (requireAll) {
      hasAccess = roleArray.every(role => {
        if (role === 'admin') return isAdmin()
        if (role === 'manager') return isManager()
        if (role === 'editor' || role === 'viewer') return canEdit() || profile?.role === role
        if (role === 'ceo') return profile?.role === 'admin' // Map CEO to admin for now
        return profile?.role === role
      })
    } else {
      hasAccess = roleArray.some(role => {
        if (role === 'admin') return isAdmin()
        if (role === 'manager') return isManager()
        if (role === 'editor' || role === 'viewer') return canEdit() || profile?.role === role
        if (role === 'ceo') return profile?.role === 'admin' // Map CEO to admin for now
        return profile?.role === role
      })
    }
  }

  // Check permissions (simplified for now since we don't have permission system)
  if (permissions.length > 0) {
    // Map permissions to role-based checks for now
    const permissionChecks = permissions.map(permission => {
      if (permission === 'view_financials' || permission === 'view_ceo_dashboard' || permission === 'manage_users') {
        return isAdmin()
      }
      if (permission === 'view_analytics' || permission === 'view_basic_analytics') {
        return isManager()
      }
      return canEdit()
    })
    
    if (requireAll) {
      hasAccess = hasAccess && permissionChecks.every(check => check)
    } else {
      hasAccess = hasAccess && permissionChecks.some(check => check)
    }
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Specific permission components for common use cases
export function ShowForAdmin({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ConditionalRender roles="admin" fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function ShowForCEOAdmin({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ConditionalRender roles={['ceo', 'admin']} requireAll={false} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function ShowForManagerPlus({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ConditionalRender roles={['manager', 'ceo', 'admin']} requireAll={false} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function HideFinancials({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['view_financials']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function ShowCEOFeatures({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['view_ceo_dashboard']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function CanManageUsers({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['manage_users']} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}

export function CanViewAnalytics({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ConditionalRender permissions={['view_analytics', 'view_basic_analytics']} requireAll={false} fallback={fallback}>
      {children}
    </ConditionalRender>
  )
}