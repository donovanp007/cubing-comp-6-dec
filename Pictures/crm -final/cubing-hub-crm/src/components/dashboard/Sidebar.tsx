'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  School, 
  Bell, 
  BarChart3, 
  Settings,
  Calendar,
  TrendingUp,
  Package
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'CEO Analytics', href: '/ceo', icon: TrendingUp },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Schools', href: '/schools', icon: School },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Reminders', href: '/reminders', icon: Bell },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn(
      "flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-gray-200 transition-all duration-300",
        collapsed ? "px-3 justify-center" : "px-6"
      )}>
        <div className="flex items-center">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TCH</span>
          </div>
          {!collapsed && (
            <span className="ml-3 text-lg font-semibold text-gray-900">
              The Cubing Hub
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 py-6 space-y-1 transition-all duration-300",
        collapsed ? "px-2" : "px-4"
      )}>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center text-sm font-medium rounded-lg transition-all duration-200',
                collapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  collapsed ? 'mr-0' : 'mr-3',
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-400 group-hover:text-gray-600'
                )}
                aria-hidden="true"
              />
              {!collapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t border-gray-200 transition-all duration-300",
        collapsed ? "p-2" : "p-4"
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : ""
        )}>
          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">A</span>
          </div>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Cubing Hub Manager</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}