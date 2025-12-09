'use client'

import { Medal, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTime } from '@/lib/utils'
import type { RankingEntry } from '@/app/actions/rankings'

interface RankingsTableProps {
  rankings: RankingEntry[]
  onSelectStudent?: (student: RankingEntry) => void
  selectedCube?: string
}

export default function RankingsTable({ rankings, onSelectStudent, selectedCube = '3x3x3 Cube' }: RankingsTableProps) {
  // Helper to find best stats for a student across all cubes
  const getBestCubeStats = (cubeStats: any, forCube?: string) => {
    if (forCube && forCube !== 'all') {
      return cubeStats[forCube] || { best_single: 0, best_average: 0 }
    }
    // Find best times across all cubes
    let bestAverage = 0
    let bestSingle = 0
    let bestCubeName = 'Unknown'
    Object.entries(cubeStats).forEach(([cubeName, stats]: any) => {
      if (stats.best_average > 0 && (!bestAverage || stats.best_average < bestAverage)) {
        bestAverage = stats.best_average
      }
      if (stats.best_single > 0 && (!bestSingle || stats.best_single < bestSingle)) {
        bestSingle = stats.best_single
      }
    })
    return { best_single: bestSingle, best_average: bestAverage }
  }
  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300'
      case 2:
        return 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-300'
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-amber-500" />
      case 2:
        return <Medal className="h-5 w-5 text-slate-400" />
      case 3:
        return <Medal className="h-5 w-5 text-orange-500" />
      default:
        return null
    }
  }

  if (rankings.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">No rankings available</p>
        <p className="text-gray-400 text-sm mt-2">
          Rankings will appear once students participate in competitions
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {rankings.map((entry, idx) => {
        const position = idx + 1
        const isMedal = position <= 3

        return (
          <Card
            key={entry.student_id}
            className={`border-2 ${getMedalColor(position)} transition-all hover:shadow-lg cursor-pointer hover:scale-101`}
            onClick={() => onSelectStudent?.(entry)}
          >
            <div className="p-1.5 sm:p-2">
              <div className="flex items-start justify-between gap-4">
                {/* Rank and Student Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {position === 1 ? (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {getMedalIcon(position)}
                      </div>
                    ) : position === 2 ? (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {getMedalIcon(position)}
                      </div>
                    ) : position === 3 ? (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {getMedalIcon(position)}
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold text-sm">
                        {position}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5">
                      <p className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                        {entry.student_name}
                      </p>
                      <div className="flex flex-wrap gap-0.5">
                        {entry.grade && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {entry.grade}
                          </Badge>
                        )}
                        {entry.school && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0 hidden sm:inline-flex">
                            {entry.school.substring(0, 10)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1 mt-0.5 text-xs text-gray-600">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase leading-tight">
                          Single
                        </p>
                        <p className="font-mono font-bold text-xs text-gray-900">
                          {formatTime(getBestCubeStats((entry.cube_stats as any), selectedCube).best_single || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase leading-tight">
                          Average
                        </p>
                        <p className="font-mono font-bold text-xs text-gray-900">
                          {formatTime(getBestCubeStats((entry.cube_stats as any), selectedCube).best_average || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="flex-shrink-0 text-right">
                  <div className="space-y-0 text-right">
                    <p className="text-xs font-medium text-gray-500 uppercase leading-tight">
                      Events
                    </p>
                    <p className="text-xs font-bold text-gray-900">
                      {entry.events_participated}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
