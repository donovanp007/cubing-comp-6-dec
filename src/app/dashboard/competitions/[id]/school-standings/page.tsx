'use client'

/**
 * School Standings Leaderboard
 * Displays overall and division-based school rankings with points breakdown
 */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  getCompetitionStandings,
  getDivisionStandings,
  getCompetitionInfo,
  getSchoolStats,
  type SchoolStandingRow
} from '@/app/actions/school-standings'
import { useToast } from '@/hooks/use-toast'

const DIVISION_COLORS = {
  A: { bg: '#EF4444', text: 'Division A (8+ students)' },
  B: { bg: '#F97316', text: 'Division B (4-7 students)' },
  C: { bg: '#EAB308', text: 'Division C (0-3 students)' }
}

const MEDAL_ICONS = {
  1: '🥇',
  2: '🥈',
  3: '🥉'
}

export default function SchoolStandingsPage() {
  const params = useParams()
  const competitionId = params.id as string
  const { toast } = useToast()

  const [standings, setStandings] = useState<SchoolStandingRow[]>([])
  const [divisionFilter, setDivisionFilter] = useState<'all' | 'A' | 'B' | 'C'>('all')
  const [loading, setLoading] = useState(true)
  const [competitionInfo, setCompetitionInfo] = useState<any>(null)
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null)
  const [schoolDetails, setSchoolDetails] = useState<any>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Load standings on mount
  useEffect(() => {
    loadStandings()
    loadCompetitionInfo()
  }, [competitionId])

  // Load division standings when filter changes
  useEffect(() => {
    if (divisionFilter !== 'all') {
      loadDivisionStandings()
    }
  }, [divisionFilter])

  async function loadStandings() {
    setLoading(true)
    try {
      const data = await getCompetitionStandings(competitionId)
      setStandings(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load standings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadDivisionStandings() {
    setLoading(true)
    try {
      if (divisionFilter !== 'all') {
        const data = await getDivisionStandings(competitionId, divisionFilter)
        setStandings(data)
      } else {
        await loadStandings()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load division standings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadCompetitionInfo() {
    try {
      const info = await getCompetitionInfo(competitionId)
      setCompetitionInfo(info)
    } catch (error) {
      console.error('Failed to load competition info:', error)
    }
  }

  async function loadSchoolDetails(schoolId: string) {
    setDetailsLoading(true)
    try {
      const details = await getSchoolStats(competitionId, schoolId)
      setSchoolDetails(details)
      setSelectedSchoolId(schoolId)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load school details',
        variant: 'destructive'
      })
    } finally {
      setDetailsLoading(false)
    }
  }

  function getRankDisplay(rank: number | null) {
    if (!rank) return '-'
    if (rank <= 3) {
      return MEDAL_ICONS[rank as keyof typeof MEDAL_ICONS]
    }
    return `#${rank}`
  }

  const filteredStandings =
    divisionFilter === 'all'
      ? standings
      : standings.filter((s) => s.schools.division === divisionFilter)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">School Standings</h1>
        {competitionInfo && (
          <p className="text-gray-600 mt-2">
            {competitionInfo.name} • {competitionInfo.location}
          </p>
        )}
      </div>

      {/* Division Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b border-gray-200">
          {(['all', 'A', 'B', 'C'] as const).map((division) => (
            <button
              key={division}
              onClick={() => setDivisionFilter(division)}
              className={`flex-1 px-4 py-3 font-medium text-center transition-colors ${
                divisionFilter === division
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {division === 'all' ? 'All Divisions' : DIVISION_COLORS[division].text}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Standings Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading standings...</div>
            ) : filteredStandings.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No standings available</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">School</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Points</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Students</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Avg/Student</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStandings.map((standing, index) => (
                      <tr
                        key={standing.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => loadSchoolDetails(standing.school_id)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-2xl font-bold">
                            {getRankDisplay(standing.overall_rank || standing.division_rank)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-8 rounded"
                              style={{ backgroundColor: standing.schools.color_hex || '#ccc' }}
                            />
                            <div>
                              <div className="font-semibold text-gray-900">{standing.schools.name}</div>
                              <div className="text-xs text-gray-500">{standing.schools.abbreviation}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xl font-bold text-blue-600">
                            {standing.total_points.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-gray-900 font-medium">{standing.total_students}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-gray-700">{standing.average_points_per_student.toFixed(1)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              loadSchoolDetails(standing.school_id)
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* School Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedSchoolId && schoolDetails ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">{schoolDetails.standing.schools.name}</h3>
                <p className="text-blue-100 text-sm mt-1">{schoolDetails.standing.schools.division}</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Points Breakdown */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Points Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Best Time Points:</span>
                      <span className="font-semibold">{schoolDetails.standing.best_time_points.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Points:</span>
                      <span className="font-semibold">{schoolDetails.standing.average_time_points.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bonus Points:</span>
                      <span className="font-semibold text-green-600">{schoolDetails.standing.bonus_points.toFixed(1)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-lg text-blue-600">{schoolDetails.standing.total_points.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Team Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Students:</span>
                      <span className="font-semibold">{schoolDetails.standing.total_students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Personal Bests:</span>
                      <span className="font-semibold text-orange-600">{schoolDetails.standing.total_pb_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DNFs:</span>
                      <span className="font-semibold text-red-600">{schoolDetails.standing.total_dnf_count}</span>
                    </div>
                  </div>
                </div>

                {/* Top Students */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Top Students</h4>
                  {detailsLoading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {schoolDetails.studentBreakdown.slice(0, 5).map((student: any, idx: number) => (
                        <div key={student.student_id} className="flex justify-between text-xs p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-gray-900">{student.name}</div>
                            <div className="text-gray-500">Grade {student.grade}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-blue-600">{student.total_points.toFixed(1)}</div>
                            {student.pb_count > 0 && (
                              <div className="text-orange-600 text-xs">{student.pb_count} PB</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Click on a school to view details
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Scoring Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Points Calculation:</strong>
            <ul className="mt-2 space-y-1 ml-4">
              <li>• Best Time: Time tier points × Grade multiplier</li>
              <li>• Average Time: Average tier points × Grade multiplier</li>
              <li>• PB Bonus: +1 × Grade multiplier (set new personal best)</li>
              <li>• Clutch Bonus: +2 × Grade multiplier (PB in finals)</li>
              <li>• Streak Bonus: +3 × Grade multiplier (3+ consecutive improvements)</li>
            </ul>
          </div>
          <div>
            <strong>School Metrics:</strong>
            <ul className="mt-2 space-y-1 ml-4">
              <li>• Total Points: Sum of all student points</li>
              <li>• Avg/Student: Fair comparison for different team sizes</li>
              <li>• Division: Based on number of competitors</li>
              <li>• Rank: Overall and within division</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
