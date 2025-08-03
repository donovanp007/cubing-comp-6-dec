'use client'

import { Search, Plus, Bell, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  title: string
  subtitle?: string
  showAddButton?: boolean
  onAddClick?: () => void
  showSearch?: boolean
  onSearch?: (query: string) => void
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
}

const quickNavTabs = [
  { name: 'Dashboard', href: '/', value: 'dashboard' },
  { name: 'Students', href: '/students', value: 'students' },
  { name: 'CEO Analytics', href: '/ceo', value: 'ceo' },
  { name: 'Inventory', href: '/inventory', value: 'inventory' },
]

export default function Header({ 
  title, 
  subtitle, 
  showAddButton = false, 
  onAddClick,
  showSearch = false,
  onSearch,
  onToggleSidebar,
  sidebarCollapsed = false
}: HeaderProps) {
  const pathname = usePathname()
  
  const getCurrentTab = () => {
    const currentTab = quickNavTabs.find(tab => tab.href === pathname)
    return currentTab?.value || 'dashboard'
  }

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Main Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onToggleSidebar}
                className="hover:bg-gray-100"
              >
                {sidebarCollapsed ? (
                  <Menu className="h-5 w-5" />
                ) : (
                  <X className="h-5 w-5" />
                )}
              </Button>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
              
              {showSearch && (
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search students, schools..."
                    className="pl-10 w-80"
                    onChange={(e) => onSearch?.(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Add Button */}
            {showAddButton && (
              <Button onClick={onAddClick} className="bg-primary hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation Tabs */}
      <div className="px-6 pb-3">
        <Tabs value={getCurrentTab()} className="w-full">
          <TabsList className="h-9 w-fit bg-gray-100">
            {quickNavTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                asChild
              >
                <Link href={tab.href}>
                  {tab.name}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}