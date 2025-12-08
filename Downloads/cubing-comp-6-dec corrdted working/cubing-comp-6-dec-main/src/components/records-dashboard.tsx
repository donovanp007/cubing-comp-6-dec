'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, TrendingUp, Target, Zap, Award, Crown } from 'lucide-react'
import { formatTime } from '@/lib/utils'

interface RecordsData {
  studentName: string
  grade: string
  school: string
  event: string
  recordSingle: number
  recordAverage: number
  previousSingle?: number
  previousAverage?: number
}

interface CoachDashboardRecordsProps {
  allTimeRecords: RecordsData[]
  studentAchievements: {
    studentId: string
    name: string
    grade: string
    recordCount: number
    pbCount: number
    bestEvents: string[]
  }[]
}

export default function RecordsDashboard({
  allTimeRecords,
  studentAchievements,
}: CoachDashboardRecordsProps) {
  const [activeTab, setActiveTab] = useState<'records' | 'targets' | 'leaders'>('records')

  // Calculate statistics
  const totalRecords = allTimeRecords.length
  const uniqueStudents = new Set(allTimeRecords.map((r) => r.studentName)).size
  const uniqueEvents = new Set(allTimeRecords.map((r) => r.event)).size

  // Sort by fastest single
  const recordsBySingle = [...allTimeRecords].sort((a, b) => a.recordSingle - b.recordSingle)

  // Sort by fastest average
  const recordsByAverage = [...allTimeRecords].sort((a, b) => a.recordAverage - b.recordAverage)

  // Top achievers
  const topAchievers = [...studentAchievements].sort((a, b) => b.recordCount - a.recordCount)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">Total Records</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{totalRecords}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-800">Record Holders</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">{uniqueStudents}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">Events Covered</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{uniqueEvents}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-800">Top Achiever</p>
                <p className="text-2xl font-bold text-orange-900 mt-2">
                  {topAchievers[0]?.recordCount || 0} records
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'records'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Trophy className="inline h-4 w-4 mr-2" />
          Current Records
        </button>
        <button
          onClick={() => setActiveTab('targets')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'targets'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="inline h-4 w-4 mr-2" />
          Targets to Beat
        </button>
        <button
          onClick={() => setActiveTab('leaders')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'leaders'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Crown className="inline h-4 w-4 mr-2" />
          Top Achievers
        </button>
      </div>

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          {/* Fastest Singles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Fastest Singles (By Event)
              </CardTitle>
              <CardDescription>Top single solve times across all events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead className="text-right">Record Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recordsBySingle.slice(0, 10).map((record, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-50">
                        <TableCell>
                          <Badge variant="outline">{record.event}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{record.studentName}</TableCell>
                        <TableCell>{record.grade}</TableCell>
                        <TableCell>{record.school}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono font-bold text-yellow-600">
                            {formatTime(record.recordSingle)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Fastest Averages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Fastest Averages (By Event)
              </CardTitle>
              <CardDescription>Top 5-solve averages across all events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead className="text-right">Record Average</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recordsByAverage.slice(0, 10).map((record, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-50">
                        <TableCell>
                          <Badge variant="outline">{record.event}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{record.studentName}</TableCell>
                        <TableCell>{record.grade}</TableCell>
                        <TableCell>{record.school}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono font-bold text-green-600">
                            {formatTime(record.recordAverage)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Targets Tab */}
      {activeTab === 'targets' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Targets to Beat for Next Competitions
            </CardTitle>
            <CardDescription>
              These are the baseline records from the first competition. Students must beat these times to earn
              record badges at future competitions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recordsBySingle.slice(0, 15).map((record, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {record.event} - {record.studentName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {record.grade} • {record.school}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold font-mono text-blue-600">
                        {formatTime(record.recordSingle)}
                      </p>
                      <p className="text-xs text-gray-500">Single</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{
                        width: `${Math.min((record.recordSingle / 60000) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaders Tab */}
      {activeTab === 'leaders' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Top Record Holders
            </CardTitle>
            <CardDescription>Students with the most records and personal bests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topAchievers.slice(0, 15).map((achiever, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{achiever.name}</p>
                        <p className="text-sm text-gray-600">{achiever.grade}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <span className="font-bold text-gray-900">{achiever.recordCount} records</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-gray-900">{achiever.pbCount} PBs</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {achiever.bestEvents.map((event) => (
                      <Badge key={event} variant="secondary" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
