'use client'

import { Medal, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTime } from '@/lib/utils'
import type { RankingEntry } from '@/app/actions/rankings'

interface RankingsTableProps {
  rankings: RankingEntry[]
}

export default function RankingsTable({ rankings }: RankingsTableProps) {
  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-yellow-100 border-yellow-300'
      case 2:
        return 'bg-gray-100 border-gray-300'
      case 3:
        return 'bg-orange-100 border-orange-300'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-600" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-500" />
      case 3:
        return <Medal className="h-5 w-5 text-orange-600" />
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
    <div className="space-y-3">
      {rankings.map((entry, idx) => {
        const position = idx + 1
        const isMedal = position <= 3

        return (
          <Card
            key={entry.student_id}
            className={`border-2 ${getMedalColor(position)} transition-all hover:shadow-lg`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                {/* Rank and Student Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {isMedal ? (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {getMedalIcon(position)}
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold text-lg">
                        {position}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <p className="font-bold text-gray-900 truncate">
                        {entry.student_name}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {entry.grade && (
                          <Badge variant="outline" className="text-xs">
                            {entry.grade}
                          </Badge>
                        )}
                        {entry.school && (
                          <Badge variant="outline" className="text-xs">
                            {entry.school}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">
                          Best Single
                        </p>
                        <p className="font-mono font-bold text-gray-900">
                          {formatTime(entry.overall_best_single)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.best_single_event}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">
                          Best Average
                        </p>
                        <p className="font-mono font-bold text-gray-900">
                          {formatTime(entry.overall_best_average)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.best_average_event}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="flex-shrink-0 text-right">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        Events
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {entry.events_participated}
                      </p>
                    </div>
                    {entry.records_count > 0 && (
                      <div>
                        <p className="text-xs font-medium text-yellow-600 uppercase">
                          Records
                        </p>
                        <p className="text-lg font-bold text-yellow-600">
                          {entry.records_count}
                        </p>
                      </div>
                    )}
                    {entry.pbs_count > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-600 uppercase">
                          PBs
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {entry.pbs_count}
                        </p>
                      </div>
                    )}
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
