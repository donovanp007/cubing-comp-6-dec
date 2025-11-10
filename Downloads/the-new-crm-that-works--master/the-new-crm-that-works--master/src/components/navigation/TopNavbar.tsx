'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { UserProfileButton } from '@/components/auth/UserProfile'
import { ShowForCEOAdmin, ShowForAdmin, HideFinancials } from '@/components/auth/ConditionalRender'
import {
  Users,
  School,
  ClipboardList,
  FolderKanban,
  Settings,
  LogIn,
  TrendingUp,
  Menu,
  X,
  Users2
} from 'lucide-react'

const getNavigationItems = (userRole: string) => {
  const baseItems = [
    { name: 'Students', href: '/students', icon: Users, badge: '156' },
    { name: 'Schools', href: '/schools', icon: School },
    { name: 'Teams', href: '/team', icon: Users2 },
    { name: 'Projects', href: '/projects', icon: FolderKanban, badge: '4' },
    { name: 'Tasks', href: '/tasks', icon: ClipboardList, badge: '5' },
    { name: 'My Tasks', href: '/my-tasks', icon: Users2, badge: '7' }
  ]

  // Add CEO/Admin specific items
  if (userRole === 'ceo' || userRole === 'admin') {
    baseItems.push({ name: 'Executive Control', href: '/executive-control', icon: TrendingUp })
  }

  // Add Admin-only items
  if (userRole === 'admin') {
    baseItems.push({ name: 'Admin', href: '/admin', icon: Settings })
  }

  return baseItems
}

export default function TopNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Don't show navigation on auth pages
  if (pathname?.startsWith('/auth')) {
    return null
  }

  const navigationItems = profile ? getNavigationItems(profile.role) : []

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left Side */}
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TCH</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">The Cubing Hub</h1>
          </Link>

          {/* Navigation Links - Center (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center px-8">
            {navigationItems.slice(0, 4).map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-1 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            {/* Additional Nav Items (Desktop) */}
            <div className="hidden xl:flex items-center gap-6">
              {navigationItems.slice(4).map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-1 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden 2xl:inline">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* User Section */}
            {user ? (
              <div className="flex items-center gap-4">
                {/* Settings Icon */}
                <Link href="/settings" title="Settings">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-9 w-9 p-0 text-gray-600 hover:text-gray-900',
                      pathname === '/settings' && 'bg-gray-100'
                    )}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="hidden sm:block text-right text-sm">
                    <p className="font-medium text-gray-900">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{profile?.role || ''}</p>
                  </div>
                  <UserProfileButton />
                </div>
              </div>
            ) : (
              !loading && (
                <Button
                  onClick={() => router.push('/auth')}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              )
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-9 w-9 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden">
          <div className="py-2 space-y-1 max-h-0 overflow-hidden transition-all duration-300" id="mobile-menu">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4 mr-3" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={cn(
                      "text-xs px-1.5 py-0.5",
                      isActive ? "bg-blue-700 text-white" : ""
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>
      )}

    </nav>
  )
}