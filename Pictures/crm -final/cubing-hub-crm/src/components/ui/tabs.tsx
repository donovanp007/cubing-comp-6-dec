"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Simple tabs implementation without Radix UI
const Tabs = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string; value?: string; onValueChange?: (value: string) => void }>(
  ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
    const [activeTab, setActiveTab] = React.useState(value || defaultValue || '')

    const handleTabChange = (newValue: string) => {
      setActiveTab(newValue)
      onValueChange?.(newValue)
    }

    return (
      <div
        ref={ref}
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              activeTab,
              onTabChange: handleTabChange
            })
          }
          return child
        })}
      </div>
    )
  }
)
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

const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; activeTab?: string; onTabChange?: (value: string) => void }>(
  ({ className, value, activeTab, onTabChange, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        activeTab === value ? "bg-background text-foreground shadow-sm" : "",
        className
      )}
      onClick={() => onTabChange?.(value)}
      {...props}
    >
      {children}
    </button>
  )
)
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string; activeTab?: string }>(
  ({ className, value, activeTab, children, ...props }, ref) => {
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
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }