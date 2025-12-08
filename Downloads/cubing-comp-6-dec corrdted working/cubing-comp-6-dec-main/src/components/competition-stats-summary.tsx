'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Zap, Target, Users, TrendingDown, Award } from 'lucide-react'
import { formatTime } from '@/lib/utils'

interface CompetitionStatsSummaryProps {
  competitionName: string
  competitionDate: string
  totalParticipants: number
  totalEvents: number
  recordsSet: number
  pbsAchieved: number
  bestSingleTime: number
  bestAverageTime: string
  mostCompetitors: string
  participationRate: number
}

export default function CompetitionStatsSummary({
  competitionName,
  competitionDate,
  totalParticipants,
  totalEvents,
  recordsSet,
  pbsAchieved,
  bestSingleTime,
  bestAverageTime,
  mostCompetitors,
  participationRate,
}: CompetitionStatsSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Competition Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">{competitionName}</h1>
        <p className="text-blue-100">{competitionDate}</p>
      </div>

      {/* Key Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Records Set */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-yellow-800 font-medium">Records Set</p>
                <p className="text-3xl font-bold text-yellow-900 mt-2">{recordsSet}</p>
                <p className="text-xs text-yellow-700 mt-1">Baseline records established</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-500 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Bests */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-green-800 font-medium">Personal Bests</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{pbsAchieved}</p>
                <p className="text-xs text-green-700 mt-1">Students improved their PB</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Single Time */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-blue-800 font-medium">Best Single</p>
                <p className="text-3xl font-bold text-blue-900 mt-2 font-mono">
                  {formatTime(bestSingleTime)}
                </p>
                <p className="text-xs text-blue-700 mt-1">Fastest single solve</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Average */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-purple-800 font-medium">Best Average</p>
                <p className="text-3xl font-bold text-purple-900 mt-2 font-mono">
                  {bestAverageTime}
                </p>
                <p className="text-xs text-purple-700 mt-1">Best 5-solve average</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participation */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-orange-800 font-medium">Participants</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">{totalParticipants}</p>
                <p className="text-xs text-orange-700 mt-1">
                  {participationRate}% participation rate
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events */}
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-300">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-pink-800 font-medium">Events</p>
                <p className="text-3xl font-bold text-pink-900 mt-2">{totalEvents}</p>
                <p className="text-xs text-pink-700 mt-1">Competition events held</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-pink-500 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Highlights */}
      <Card className="bg-white">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Competition Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Most Active Event */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-semibold text-gray-900">Most Active Event</p>
                <p className="text-sm text-gray-600">{mostCompetitors} competitors</p>
              </div>
              <Badge className="bg-blue-600">{mostCompetitors}</Badge>
            </div>

            {/* Records vs PBs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">Records</p>
                <p className="text-2xl font-bold text-yellow-900 mt-2">{recordsSet}</p>
                <p className="text-xs text-yellow-700 mt-1">New baselines set</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Personal Bests</p>
                <p className="text-2xl font-bold text-green-900 mt-2">{pbsAchieved}</p>
                <p className="text-xs text-green-700 mt-1">Improvements made</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Text */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
        <h3 className="font-semibold text-gray-900 mb-3">Competition Summary</h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          This competition established <span className="font-bold">{recordsSet} new baseline records</span> across
          various events and grades. With <span className="font-bold">{pbsAchieved} personal bests</span> achieved and{' '}
          <span className="font-bold">{totalParticipants} competitors</span> participating, it was a successful event.
          The fastest single time recorded was <span className="font-mono font-bold">{formatTime(bestSingleTime)}</span>,
          setting a new target for future competitions.
        </p>
      </div>
    </div>
  )
}
