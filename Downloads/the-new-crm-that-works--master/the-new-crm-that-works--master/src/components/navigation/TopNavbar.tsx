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
  LayoutDashboard,
  Users,
  School,
  Bell,
  ClipboardList,
  FolderKanban,
  User as UserIcon,
  Settings,
  ChevronRight,
  Home,
  LogIn,
  BarChart3,
  TrendingUp,
  Menu,
  X
} from 'lucide-react'

const getNavigationItems = (userRole: string) => {
  const baseItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Students', href: '/students', icon: Users, badge: '156' },
    { name: 'Schools', href: '/schools', icon: School },
    { name: 'Projects', href: '/projects', icon: FolderKanban, badge: '4' },
    { name: 'Tasks', href: '/tasks', icon: ClipboardList, badge: '5' },
    { name: 'Reminders', href: '/reminders', icon: Bell, badge: '3' },
    { name: 'Team', href: '/team', icon: UserIcon },
    { name: 'My Tasks', href: '/my-tasks', icon: UserIcon, badge: '7' }
  ]

  // Add CEO/Admin specific items
  if (userRole === 'ceo' || userRole === 'admin') {
    baseItems.splice(1, 0, { name: 'Analytics', href: '/analytics', icon: BarChart3 })
    baseItems.splice(2, 0, { name: 'CEO Dashboard', href: '/ceo', icon: TrendingUp })
  }

  // Add Admin-only items
  if (userRole === 'admin') {
    baseItems.splice(3, 0, { name: 'Admin', href: '/admin', icon: Settings })
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
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TCH</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">The Cubing Hub</h1>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                  {item.badge && (
                    <Badge 
                      variant={isActive ? "default" : "secondary"}
                      className={cn(
                        "ml-2 text-xs px-1.5 py-0.5",
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

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Settings & User Profile */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Quick Settings */}
                <Link href="/settings">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'text-gray-600 hover:text-gray-900',
                      pathname === '/settings' && 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:ml-2 sm:inline">Settings</span>
                  </Button>
                </Link>

                {/* User Profile */}
                <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
                  <UserProfileButton />
                  {profile && (
                    <div className="hidden sm:block text-sm">
                      <p className="font-medium text-gray-900">{profile.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              !loading && (
                <Button
                  onClick={() => router.push('/auth')}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )
            )}
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

      {/* Breadcrumb for current page */}
      {pathname !== '/' && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 font-medium">
              {navigationItems.find(item => item.href === pathname)?.name || 'Current Page'}
            </span>
          </div>
        </div>
      )}
    </nav>
  )
}