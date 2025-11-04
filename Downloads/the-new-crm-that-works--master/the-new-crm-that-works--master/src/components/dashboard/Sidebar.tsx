'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { 
  LayoutDashboard, 
  Users, 
  School, 
  Bell, 
  BarChart3, 
  Settings,
  Calendar,
  TrendingUp,
  Package,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  ClipboardList,
  FolderKanban,
  User as UserIcon,
  LogOut
} from 'lucide-react'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard, 
    description: 'Overview & insights',
    badge: null
  },
  { 
    name: 'CEO Analytics', 
    href: '/ceo', 
    icon: TrendingUp, 
    description: 'Performance metrics',
    badge: null
  },
  { 
    name: 'Students', 
    href: '/students', 
    icon: Users, 
    description: 'Manage students',
    badge: '156',
    badgeVariant: 'secondary'
  },
  { 
    name: 'Schools', 
    href: '/schools', 
    icon: School, 
    description: 'Partner schools',
    badge: '12',
    badgeVariant: 'secondary'
  },
  { 
    name: 'Projects', 
    href: '/projects', 
    icon: FolderKanban, 
    description: 'Project management',
    badge: '4',
    badgeVariant: 'secondary'
  },
  { 
    name: 'Inventory', 
    href: '/inventory', 
    icon: Package, 
    description: 'Stock management',
    badge: 'Low',
    badgeVariant: 'destructive'
  },
  { 
    name: 'Reminders', 
    href: '/reminders', 
    icon: Bell, 
    description: 'Follow-ups & tasks',
    badge: '3',
    badgeVariant: 'destructive'
  },
  { 
    name: 'CRM Tasks', 
    href: '/tasks', 
    icon: ClipboardList, 
    description: 'Central task management',
    badge: '5',
    badgeVariant: 'destructive'
  },
  { 
    name: 'Team', 
    href: '/team', 
    icon: Users, 
    description: 'Staff management',
    badge: '5',
    badgeVariant: 'secondary'
  },
  { 
    name: 'My Tasks', 
    href: '/my-tasks', 
    icon: UserIcon, 
    description: 'Your assigned tasks',
    badge: '7',
    badgeVariant: 'destructive'
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: BarChart3, 
    description: 'Reports & insights',
    badge: null
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings, 
    description: 'App preferences',
    badge: null
  },
]

const quickActions = [
  { name: 'Add Student', action: 'add-student', icon: Users },
  { name: 'Add School', action: 'add-school', icon: School },
  { name: 'Add Reminder', action: 'add-reminder', icon: Bell },
]

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export default function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  
  // Filter navigation items based on search
  const filteredNavigation = navigation.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className={cn(
      "flex h-full flex-col bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 transition-all duration-300 shadow-sm",
      collapsed ? "w-16" : "w-72"
    )}>
      {/* Header with Logo and Toggle */}
      <div className={cn(
        "flex h-16 items-center justify-between border-b border-gray-200 transition-all duration-300",
        collapsed ? "px-3" : "px-6"
      )}>
        <div className="flex items-center">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">TCH</span>
          </div>
          {!collapsed && (
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">The Cubing Hub</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          )}
        </div>
        
        {!collapsed && onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-gray-500 hover:text-gray-700 p-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        {collapsed && onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-gray-500 hover:text-gray-700 p-1.5 mx-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Bar (when not collapsed) */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Quick Actions (when not collapsed) */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Actions</p>
          <div className="space-y-1">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.action}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-8"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  <Icon className="h-3 w-3 mr-2" />
                  <span className="text-xs">{action.name}</span>
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        "flex-1 py-4 overflow-y-auto",
        collapsed ? "px-2" : "px-4"
      )}>
        {!collapsed && (
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">Navigation</p>
        )}
        
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center text-sm font-medium rounded-xl transition-all duration-200 relative',
                  collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-3',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-700 hover:bg-white hover:shadow-md hover:text-gray-900'
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors flex-shrink-0',
                    collapsed ? 'mr-0' : 'mr-3',
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-500 group-hover:text-gray-700'
                  )}
                />
                
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-600">
                        {item.description}
                      </div>
                    </div>
                    
                    {item.badge && (
                      <Badge 
                        variant={item.badgeVariant as any} 
                        className={cn(
                          "text-xs px-2 py-0.5 ml-2",
                          isActive 
                            ? "bg-white/20 text-white border-white/30" 
                            : ""
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
        
        {searchQuery && filteredNavigation.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">No results found</p>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t border-gray-200 bg-gray-50/50 transition-all duration-300",
        collapsed ? "p-3" : "p-4"
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : ""
        )}>
          <div className="h-10 w-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-gray-700 font-semibold text-sm">A</span>
          </div>
          {!collapsed && (
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Cubing Hub Manager</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 p-1">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 hover:text-red-600 p-1"
                    onClick={handleSignOut}
                    disabled={signingOut}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}