"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Create a context for tabs
interface TabsContextValue {
  activeTab: string
  onTabChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

const useTabsContext = () => {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

// Simple tabs implementation without Radix UI
const Tabs = React.forwardRef<
  HTMLDivElement, 
  React.HTMLAttributes<HTMLDivElement> & { 
    defaultValue?: string; 
    value?: string; 
    onValueChange?: (value: string) => void 
  }
>(({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || '')

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue)
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
      <div
        ref={ref}
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
)
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement, 
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, children, ...props }, ref) => {
  const { activeTab, onTabChange } = useTabsContext()
  
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        activeTab === value ? "bg-background text-foreground shadow-sm" : "",
        className
      )}
      onClick={() => onTabChange(value)}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement, 
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => {
  const { activeTab } = useTabsContext()
  
  if (activeTab !== value) return null
  
  return (
    <div
      ref={ref}
      className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }