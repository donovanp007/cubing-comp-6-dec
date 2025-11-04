'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'

export type Priority = 'urgent' | 'high' | 'medium' | 'low'

interface PriorityBadgeProps {
  priority: Priority
  showIcon?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const priorityConfig = {
  urgent: {
    label: 'Urgent',
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
    icon: AlertCircle,
    color: 'text-red-600'
  },
  high: {
    label: 'High',
    className: 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100',
    icon: AlertCircle,
    color: 'text-red-500'
  },
  medium: {
    label: 'Medium',
    className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
    icon: Clock,
    color: 'text-orange-600'
  },
  low: {
    label: 'Low',
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    icon: CheckCircle2,
    color: 'text-green-600'
  }
}

export function PriorityBadge({ 
  priority, 
  showIcon = false, 
  className,
  size = 'md'
}: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.className,
        sizeClasses[size],
        'font-medium transition-colors duration-200',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        {showIcon && (
          <Icon className={cn(iconSizes[size], config.color)} />
        )}
        <span>{config.label}</span>
      </div>
    </Badge>
  )
}

// Utility function to get priority color classes
export function getPriorityColorClasses(priority: Priority) {
  return priorityConfig[priority].className
}

// Utility function to get priority text color
export function getPriorityTextColor(priority: Priority) {
  return priorityConfig[priority].color
}

export default PriorityBadge