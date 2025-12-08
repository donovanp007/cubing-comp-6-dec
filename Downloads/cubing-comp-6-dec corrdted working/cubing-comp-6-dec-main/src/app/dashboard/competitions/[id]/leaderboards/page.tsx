'use client'

/**
 * Dual Leaderboard View
 * Display both individual and school rankings side-by-side
 */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getCompetitionStandings, getCompetitionInfo, type SchoolStandingRow } from '@/app/actions/school-standings'
import { useToast } from '@/hooks/use-toast'
import EventPodium from '@/components/event-podium'

interface StudentRanking {
  student_id: string
  name: string
  grade: string
  school: string
  best_time_milliseconds: number | null
  average_time_milliseconds: number | null
  final_ranking: number
}

export default function LeaderboardsPage() {
  const params = useParams()
  const competitionId = params.id as string
  const { toast } = useToast()

  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [selectedRound, setSelectedRound] = useState<string>('')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')

  const [events, setEvents] = useState<any[]>([])
  const [rounds, setRounds] = useState<any[]>([])
  const [grades, setGrades] = useState<string[]>([])

  const [studentRankings, setStudentRankings] = useState<StudentRanking[]>([])
  const [schoolStandings, setSchoolStandings] = useState<SchoolStandingRow[]>([])
  const [loading, setLoading] = useState(false)
  const [competitionInfo, setCompetitionInfo] = useState<any>(null)

  const supabase = createClient()

  // Load initial data
  useEffect(() => {
    loadEvents()
    loadCompetitionInfo()
  }, [competitionId])

  // Load rounds when event changes
  useEffect(() => {
    if (selectedEvent) {
      loadRounds()
    }
  }, [selectedEvent])

  // Load rankings when round changes
  useEffect(() => {
    if (selectedRound) {
      loadStudentRankings()
    }
  }, [selectedRound, selectedGrade])

  // Always load school standings
  useEffect(() => {
    loadSchoolStandings()
  }, [competitionId])

  async function loadEvents() {
    try {
      const { data, error } = await supabase
        .from('competition_events')
        .select('id, event_type_id, event_types!inner(name, display_name)')
        .eq('competition_id', competitionId)
        .order('event_types(sort_order)', { ascending: true })

      if (!error && data) {
        setEvents(data)
        if (data.length > 0) {
          setSelectedEvent(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  async function loadRounds() {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select('id, round_number, round_name')
        .eq('competition_event_id', selectedEvent)
        .order('round_number', { ascending: true })

      if (!error && data) {
        setRounds(data)
        if (data.length > 0) {
          setSelectedRound(data[data.length - 1].id) // Select last round by default
        }
      }
    } catch (error) {
      console.error('Error loading rounds:', error)
    }
  }

  async function loadStudentRankings() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('final_scores')
        .select(`
          student_id,
          students!inner(first_name, last_name, grade, school),
          best_time_milliseconds,
          average_time_milliseconds,
          final_ranking
        `)
        .eq('round_id', selectedRound)
        .order('final_ranking', { ascending: true })

      if (!error && data) {
        let rankings = (data as any[]).map((r) => ({
          student_id: r.student_id,
          name: `${r.students.first_name} ${r.students.last_name}`,
          grade: r.students.grade,
          school: r.students.school,
          best_time_milliseconds: r.best_time_milliseconds,
          average_time_milliseconds: r.average_time_milliseconds,
          final_ranking: r.final_ranking
        }))

        // Filter by grade if selected
        if (selectedGrade !== 'all') {
          rankings = rankings.filter((r) => r.grade === selectedGrade)
        }

        setStudentRankings(rankings)

        // Extract unique grades
        const uniqueGrades = Array.from(
          new Set((data as any[]).map((r) => r.students.grade))
        ).sort()
        setGrades(uniqueGrades)
      }
    } catch (error) {
      console.error('Error loading student rankings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load student rankings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadSchoolStandings() {
    try {
      const data = await getCompetitionStandings(competitionId)
      setSchoolStandings(data)
    } catch (error) {
      console.error('Error loading school standings:', error)
    }
  }

  async function loadCompetitionInfo() {
    try {
      const info = await getCompetitionInfo(competitionId)
      setCompetitionInfo(info)
    } catch (error) {
      console.error('Error loading competition info:', error)
    }
  }

  function formatTime(ms: number | null): string {
    if (!ms) return 'DNF'
    return (ms / 1000).toFixed(2) + 's'
  }

  const currentEvent = events.find((e) => e.id === selectedEvent)
  const currentRound = rounds.find((r) => r.id === selectedRound)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Competition Leaderboards</h1>
        {competitionInfo && (
          <p className="text-gray-600 mt-2">
            {competitionInfo.name} • {competitionInfo.location}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Event Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.event_types.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Round Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Round</label>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {rounds.map((round) => (
                <option key={round.id} value={round.id}>
                  {round.round_name}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Grades</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dual Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual Leaderboard */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Individual Rankings</h2>
            {currentRound && <p className="text-blue-100 text-sm mt-1">{currentRound.round_name}</p>}
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading rankings...</div>
          ) : studentRankings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No rankings available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">School</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">Best</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRankings.map((student, idx) => (
                    <tr key={student.student_id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-bold text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{student.school}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatTime(student.best_time_milliseconds)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{formatTime(student.average_time_milliseconds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* School Leaderboard */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">School Rankings</h2>
            <p className="text-green-100 text-sm mt-1">Cumulative points across all rounds</p>
          </div>

          {schoolStandings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No school standings available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">School</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">Points</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolStandings.slice(0, 10).map((standing, idx) => (
                    <tr key={standing.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-bold text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-6 rounded"
                            style={{ backgroundColor: standing.schools.color_hex || '#ccc' }}
                          />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{standing.schools.name}</div>
                            <div className="text-xs text-gray-500">Div {standing.schools.division}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">{standing.total_points.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{standing.total_students}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Podium & Achievements Section */}
      {studentRankings.length > 0 && events.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Achievements & Podiums</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => {
              const eventName = event.event_types?.name || "Unknown Event"
              const topResults = studentRankings
                .slice(0, 3)
                .map((student) => ({
                  student_id: student.student_id,
                  student_name: student.name,
                  average_time: student.average_time_milliseconds || 0,
                  best_time: student.best_time_milliseconds || 0,
                  grade: student.grade,
                }))

              const fastestGirl = studentRankings[0]
                ? {
                    student_id: studentRankings[0].student_id,
                    student_name: studentRankings[0].name,
                    average_time: studentRankings[0].average_time_milliseconds || 0,
                    best_time: studentRankings[0].best_time_milliseconds || 0,
                    grade: studentRankings[0].grade,
                  }
                : undefined

              return (
                <EventPodium
                  key={event.id}
                  eventName={eventName}
                  podium={topResults}
                  fastestGirl={fastestGirl}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Comparison Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-600">{studentRankings.length}</div>
          <div className="text-sm text-blue-800 mt-1">Students Competing</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-600">{schoolStandings.length}</div>
          <div className="text-sm text-green-800 mt-1">Schools Participating</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-purple-600">
            {schoolStandings.reduce((sum, s) => sum + s.total_pb_count, 0)}
          </div>
          <div className="text-sm text-purple-800 mt-1">Personal Bests Set</div>
        </div>
      </div>
    </div>
  )
}
