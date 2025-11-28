/**
 * BadgeDisplay Component
 * Displays achievement badges with colors and information
 */

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface BadgeData {
  id: string
  badge_code: string
  badge_name: string
  badge_description: string
  badge_type: 'individual' | 'school'
  color_hex: string
  active: boolean
}

interface BadgeDisplayProps {
  badge: BadgeData
  showCode?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function BadgeDisplay({
  badge,
  showCode = false,
  size = 'md',
  className = ''
}: BadgeDisplayProps) {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  }

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <Card className={`${className} ${!badge.active ? 'opacity-50' : ''}`}>
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-start gap-3">
          {/* Color Indicator */}
          <div
            className={`${iconSizes[size]} rounded-full border-2 border-gray-200 flex-shrink-0`}
            style={{ backgroundColor: badge.color_hex }}
            title={badge.badge_name}
          />

          {/* Badge Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-gray-900 ${textSizes[size]}`}>
                {badge.badge_name}
              </h3>
              <Badge variant={badge.badge_type === 'individual' ? 'default' : 'secondary'}>
                {badge.badge_type === 'individual' ? '👤' : '🏆'}
              </Badge>
              {!badge.active && <Badge variant="outline">Inactive</Badge>}
            </div>

            <p className={`text-gray-600 ${textSizes[size]}`}>{badge.badge_description}</p>

            {showCode && (
              <code className={`text-gray-500 font-mono ${textSizes[size]} mt-1 block`}>
                {badge.badge_code}
              </code>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface BadgeGridProps {
  badges: BadgeData[]
  cols?: 1 | 2 | 3 | 4
  emptyMessage?: string
  className?: string
}

export function BadgeGrid({
  badges,
  cols = 3,
  emptyMessage = 'No badges',
  className = ''
}: BadgeGridProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }

  if (badges.length === 0) {
    return <p className="text-gray-500 text-center py-8">{emptyMessage}</p>
  }

  return (
    <div className={`grid ${colClasses[cols]} gap-4 ${className}`}>
      {badges.map((badge) => (
        <BadgeDisplay key={badge.id} badge={badge} />
      ))}
    </div>
  )
}

export default BadgeDisplay
