/**
 * TierBadge Component
 * Displays a cubing tier (S/A/B/C/D) with styling based on performance
 */

interface TierBadgeProps {
  tier: 'S' | 'A' | 'B' | 'C' | 'D'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const tierColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
  S: {
    bg: 'bg-gradient-to-br from-yellow-300 to-yellow-400',
    text: 'text-yellow-900',
    border: 'border-yellow-500',
    label: 'Excellent'
  },
  A: {
    bg: 'bg-gradient-to-br from-green-300 to-green-400',
    text: 'text-green-900',
    border: 'border-green-500',
    label: 'Great'
  },
  B: {
    bg: 'bg-gradient-to-br from-blue-300 to-blue-400',
    text: 'text-blue-900',
    border: 'border-blue-500',
    label: 'Good'
  },
  C: {
    bg: 'bg-gradient-to-br from-purple-300 to-purple-400',
    text: 'text-purple-900',
    border: 'border-purple-500',
    label: 'Average'
  },
  D: {
    bg: 'bg-gradient-to-br from-gray-300 to-gray-400',
    text: 'text-gray-900',
    border: 'border-gray-500',
    label: 'Below Average'
  }
}

export function TierBadge({ tier, size = 'md', showLabel = true, className = '' }: TierBadgeProps) {
  const colors = tierColors[tier]

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          ${colors.bg}
          ${colors.text}
          ${colors.border}
          border-2
          rounded font-bold
          flex items-center justify-center
          shadow-md
        `}
      >
        {tier}
      </div>
      {showLabel && <span className="text-xs text-gray-600 font-medium">{colors.label}</span>}
    </div>
  )
}

export default TierBadge
