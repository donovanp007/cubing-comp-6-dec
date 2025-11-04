"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple fallback Select implementation without Radix UI
interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

const Select = ({ children, value, onValueChange, defaultValue }: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentValue, setCurrentValue] = React.useState(value || defaultValue || '')

  const handleValueChange = (newValue: string) => {
    setCurrentValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            setIsOpen,
            currentValue,
            onValueChange: handleValueChange
          })
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, any>(
  ({ className, children, isOpen, setIsOpen, currentValue, ...props }, ref) => {
    // Filter out non-DOM props
    const { onValueChange: _, ...domProps } = props
    
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setIsOpen?.(!isOpen)}
        {...domProps}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = ({ className, children, isOpen, onValueChange, ...props }: any) => {
  if (!isOpen) return null
  
  // Filter out non-DOM props
  const { setIsOpen: _, currentValue: __, ...domProps } = props
  
  return (
    <div
      className={cn(
        "absolute top-full left-0 z-50 min-w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        className
      )}
      {...domProps}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onValueChange
          })
        }
        return child
      })}
    </div>
  )
}

const SelectItem = ({ className, children, value, onValueChange, ...props }: SelectItemProps & any) => {
  // Filter out non-DOM props
  const { setIsOpen: _, currentValue: __, ...domProps } = props
  
  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={() => onValueChange?.(value)}
      {...domProps}
    >
      {children}
    </div>
  )
}

const SelectValue = ({ placeholder, currentValue, ...props }: any) => {
  // Filter out non-DOM props
  const { setIsOpen: _, onValueChange: __, ...domProps } = props
  
  return (
    <span {...domProps}>
      {currentValue || placeholder}
    </span>
  )
}

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
}