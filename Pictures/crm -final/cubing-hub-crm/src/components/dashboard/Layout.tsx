'use client'

import { ReactNode, useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  showAddButton?: boolean
  onAddClick?: () => void
  showSearch?: boolean
  onSearch?: (query: string) => void
}

export default function Layout({
  children,
  title,
  subtitle,
  showAddButton,
  onAddClick,
  showSearch,
  onSearch,
}: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          showAddButton={showAddButton}
          onAddClick={onAddClick}
          showSearch={showSearch}
          onSearch={onSearch}
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}