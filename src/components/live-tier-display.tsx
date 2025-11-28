/**
 * LiveTierDisplay Component
 * Shows real-time tier and points estimation for live competition entry
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TierBadge } from './tier-badge'

interface LiveTierDisplayProps {
  tier?: 'S' | 'A' | 'B' | 'C' | 'D' | null
  timeMs?: number | null
  basePoints?: number
  gradeMultiplier?: number
  estimatedPoints?: number
  isDNF?: boolean
  isPB?: boolean
  isClutch?: boolean
  className?: string
}

const tierDescriptions: Record<string, string> = {
  S: 'Excellent solve time!',
  A: 'Great solve time!',
  B: 'Good solve time',
  C: 'Average solve time',
  D: 'Below average solve time'
}

export function LiveTierDisplay({
  tier,
  timeMs,
  basePoints,
  gradeMultiplier = 1.0,
  estimatedPoints,
  isDNF = false,
  isPB = false,
  isClutch = false,
  className = ''
}: LiveTierDisplayProps) {
  const formatTime = (ms: number | null | undefined): string => {
    if (!ms) return '-'
    return (ms / 1000).toFixed(2) + 's'
  }

  if (isDNF) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-red-600">DNF</div>
            <p className="text-sm text-red-700">Did Not Finish</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!tier) {
    return null
  }

  return (
    <Card className={`border-gray-200 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Solve Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Tier Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tier</span>
          <TierBadge tier={tier} size="lg" showLabel={false} />
        </div>

        {/* Tier Description */}
        <p className="text-xs text-gray-600 italic">{tierDescriptions[tier]}</p>

        {/* Time */}
        {timeMs && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-gray-600">Time</span>
            <span className="font-mono font-bold text-blue-600">{formatTime(timeMs)}</span>
          </div>
        )}

        {/* Points Breakdown */}
        {basePoints !== undefined && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Base Points</span>
              <span className="font-bold">{basePoints}</span>
            </div>

            {gradeMultiplier !== 1.0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Grade Multiplier</span>
                <span className="font-bold text-green-600">{gradeMultiplier.toFixed(2)}x</span>
              </div>
            )}

            {estimatedPoints !== undefined && (
              <div className="flex items-center justify-between text-sm font-bold bg-blue-50 p-2 rounded">
                <span>Estimated Points</span>
                <span className="text-blue-600">{estimatedPoints.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}

        {/* Bonuses */}
        {(isPB || isClutch) && (
          <div className="space-y-1 pt-2 border-t">
            {isPB && (
              <div className="text-xs bg-orange-50 text-orange-700 p-2 rounded font-semibold">
                ⭐ Personal Best! +1 bonus
              </div>
            )}
            {isClutch && (
              <div className="text-xs bg-red-50 text-red-700 p-2 rounded font-semibold">
                🔥 Clutch Solve! +2 bonus
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * RealTimeScores Component
 * Displays live points as students complete rounds
 */

export interface StudentScore {
  studentId: string
  studentName: string
  currentRound: number
  roundPoints: number
  totalPoints: number
  school?: string
  isInProgress?: boolean
}

interface RealTimeScoresProps {
  scores: StudentScore[]
  maxDisplay?: number
  className?: string
}

export function RealTimeScores({
  scores,
  maxDisplay = 8,
  className = ''
}: RealTimeScoresProps) {
  const sorted = [...scores].sort((a, b) => b.totalPoints - a.totalPoints)
  const displayed = sorted.slice(0, maxDisplay)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <span className="relative inline-block">
            🏆
            <span className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          </span>
          Live Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayed.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No scores yet</p>
          ) : (
            displayed.map((score, index) => (
              <div
                key={score.studentId}
                className={`flex items-center justify-between p-2 rounded text-sm ${
                  score.isInProgress ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700 w-6">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{score.studentName}</p>
                      {score.school && <p className="text-xs text-gray-600">{score.school}</p>}
                    </div>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <p className="font-bold text-blue-600">{score.totalPoints.toFixed(1)}</p>
                  {score.roundPoints > 0 && (
                    <p className="text-xs text-gray-500">+{score.roundPoints.toFixed(1)}</p>
                  )}
                </div>
                {score.isInProgress && <span className="text-xs font-bold text-blue-600 ml-2">In Progress</span>}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * TierProgressBar Component
 * Visual representation of tier thresholds
 */

export interface TierThreshold {
  tier: 'S' | 'A' | 'B' | 'C' | 'D'
  min: number
  max: number
  color: string
}

interface TierProgressBarProps {
  timeMs: number
  thresholds: TierThreshold[]
  className?: string
}

export function TierProgressBar({ timeMs, thresholds, className = '' }: TierProgressBarProps) {
  const fastestThreshold = thresholds[0]?.min || 0
  const slowestThreshold = thresholds[thresholds.length - 1]?.max || 100

  const percentage = Math.min(100, ((timeMs - fastestThreshold) / (slowestThreshold - fastestThreshold)) * 100)

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700">Tier Progress</span>
        <span className="text-xs font-mono text-gray-600">{(timeMs / 1000).toFixed(2)}s</span>
      </div>

      {/* Threshold segments */}
      <div className="flex h-6 rounded-full overflow-hidden border border-gray-300 shadow-sm">
        {thresholds.map((t) => (
          <div
            key={t.tier}
            className="flex-1 flex items-center justify-center text-xs font-bold text-white"
            style={{
              backgroundColor: t.color,
              opacity: 0.8
            }}
            title={`${t.tier}: ${(t.min / 1000).toFixed(2)}s - ${(t.max / 1000).toFixed(2)}s`}
          >
            {t.tier}
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default LiveTierDisplay
