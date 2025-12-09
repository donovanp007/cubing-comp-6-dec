'use client'

/**
 * Live Display Board - Projector View
 * Simple, large-text display for real-time competition leaderboards
 * Optimized for projecting during live competitions
 */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SchoolStanding {
  id: string
  school_id: string
  total_points: number
  total_students: number
  overall_rank: number | null
  division_rank: number | null
  average_points_per_student?: number
  schools: {
    id: string
    name: string
    abbreviation: string
    division: string
    color_hex: string
  }
}

interface StudentRanking {
  student_id: string
  name: string
  grade: string
  school: string
  best_time_milliseconds: number | null
  average_time_milliseconds: number | null
  final_ranking: number
}

interface DisplaySettings {
  mode: 'schools' | 'individuals'
  sortBy: 'points' | 'rank'
  showDivisions: boolean
  refreshInterval: number
}

export default function LiveDisplayPage() {
  const params = useParams()
  const competitionId = params.id as string

  const [settings, setSettings] = useState<DisplaySettings>({
    mode: 'schools',
    sortBy: 'points',
    showDivisions: true,
    refreshInterval: 3000
  })

  const [schoolStandings, setSchoolStandings] = useState<SchoolStanding[]>([])
  const [studentRankings, setStudentRankings] = useState<StudentRanking[]>([])
  const [competitionInfo, setCompetitionInfo] = useState<any>(null)
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [selectedRound, setSelectedRound] = useState<string>('')
  const [events, setEvents] = useState<any[]>([])
  const [rounds, setRounds] = useState<any[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadCompetitionData()
    const interval = setInterval(loadCompetitionData, settings.refreshInterval)
    return () => clearInterval(interval)
  }, [competitionId, settings.refreshInterval])

  useEffect(() => {
    if (selectedEvent) {
      loadRounds()
    }
  }, [selectedEvent])

  useEffect(() => {
    if (settings.mode === 'individuals' && selectedRound) {
      loadStudentRankings()
    } else if (settings.mode === 'schools') {
      loadSchoolStandings()
    }
  }, [settings.mode, selectedRound])

  async function loadCompetitionData() {
    try {
      const { data: comp } = await supabase
        .from('competitions')
        .select('id, name, location, competition_date')
        .eq('id', competitionId)
        .single()

      setCompetitionInfo(comp)

      const { data: eventsData } = await supabase
        .from('competition_events')
        .select('id, event_type_id, event_types!inner(name, display_name)')
        .eq('competition_id', competitionId)
        .order('event_types(sort_order)', { ascending: true })

      if (eventsData && eventsData.length > 0) {
        setEvents(eventsData)
        if (!selectedEvent) {
          setSelectedEvent(eventsData[0].id)
        }
      }

      await loadSchoolStandings()
    } catch (error) {
      console.error('Error loading competition data:', error)
    }
  }

  async function loadRounds() {
    try {
      const { data } = await supabase
        .from('rounds')
        .select('id, round_number, round_name')
        .eq('competition_event_id', selectedEvent)
        .order('round_number', { ascending: true })

      if (data && data.length > 0) {
        setRounds(data)
        setSelectedRound(data[data.length - 1].id)
      }
    } catch (error) {
      console.error('Error loading rounds:', error)
    }
  }

  async function loadSchoolStandings() {
    try {
      const { data } = await supabase
        .from('school_standings')
        .select(`
          *,
          schools!inner(
            id,
            name,
            abbreviation,
            division,
            color_hex
          )
        `)
        .eq('competition_id', competitionId)
        .order('overall_rank', { ascending: true })

      setSchoolStandings(data || [])
    } catch (error) {
      console.error('Error loading school standings:', error)
    }
  }

  async function loadStudentRankings() {
    try {
      const { data } = await supabase
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

      const rankings = (data || []).map((r: any) => ({
        student_id: r.student_id,
        name: `${r.students.first_name} ${r.students.last_name}`,
        grade: r.students.grade,
        school: r.students.school,
        best_time_milliseconds: r.best_time_milliseconds,
        average_time_milliseconds: r.average_time_milliseconds,
        final_ranking: r.final_ranking
      }))

      setStudentRankings(rankings)
    } catch (error) {
      console.error('Error loading student rankings:', error)
    }
  }

  const getRankDisplay = (rank: number | null) => {
    if (!rank) return '-'
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const formatTime = (ms: number | null): string => {
    if (!ms) return 'DNF'
    return (ms / 1000).toFixed(2) + 's'
  }

  const displayData =
    settings.mode === 'schools'
      ? schoolStandings
      : studentRankings.slice(0, 15)

  return (
    <div className={`bg-black text-white min-h-screen overflow-hidden ${isFullscreen ? 'fixed inset-0' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 border-b-4 border-yellow-400">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2">{competitionInfo?.name || 'Competition'}</h1>
            <p className="text-2xl text-gray-300">
              {competitionInfo?.location} •{' '}
              {competitionInfo?.competition_date
                ? new Date(competitionInfo.competition_date).toLocaleDateString()
                : ''}
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-4 py-2 bg-yellow-500 text-black font-bold rounded text-lg hover:bg-yellow-400 transition"
            >
              {isFullscreen ? '⛶ Exit Fullscreen' : '⛶ Fullscreen'}
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 flex items-center gap-6 border-b-2 border-gray-700 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setSettings({ ...settings, mode: 'schools' })}
            className={`px-4 py-2 text-lg font-bold rounded transition ${
              settings.mode === 'schools'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🏆 School Standings
          </button>
          <button
            onClick={() => setSettings({ ...settings, mode: 'individuals' })}
            className={`px-4 py-2 text-lg font-bold rounded transition ${
              settings.mode === 'individuals'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            👤 Individual Rankings
          </button>
        </div>

        {settings.mode === 'individuals' && rounds.length > 0 && (
          <div className="flex gap-2 items-center">
            <label className="text-sm font-bold text-gray-300">Round:</label>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="px-3 py-2 bg-gray-800 text-white text-lg font-bold rounded border border-gray-600"
            >
              {rounds.map((round) => (
                <option key={round.id} value={round.id}>
                  {round.round_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2 items-center ml-auto">
          <span className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="p-6 flex-1">
        {settings.mode === 'schools' ? (
          // School Standings Display
          <div className="space-y-3">
            {schoolStandings.slice(0, 12).map((standing, index) => (
              <div
                key={standing.id}
                className="flex items-center gap-4 p-4 rounded-lg border-l-8 transition hover:scale-105"
                style={{
                  borderLeftColor: standing.schools.color_hex,
                  backgroundColor: 'rgba(31, 41, 55, 0.8)'
                }}
              >
                {/* Rank */}
                <div className="w-20 text-center">
                  <div className="text-5xl font-black">
                    {getRankDisplay(standing.overall_rank)}
                  </div>
                </div>

                {/* School Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-3xl font-bold">{standing.schools.name}</h3>
                  <p className="text-xl text-gray-300">
                    Division {standing.schools.division} • {standing.schools.abbreviation} •{' '}
                    <span className="font-mono">{standing.total_students} students</span>
                  </p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="text-5xl font-black text-yellow-400">
                    {standing.total_points.toFixed(1)}
                  </div>
                  <p className="text-lg text-gray-400 font-bold">pts</p>
                </div>

                {/* Avg per student */}
                <div className="text-right min-w-max">
                  <div className="text-2xl font-bold text-green-400">
                    {(standing.average_points_per_student || 0).toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-400">avg/student</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Individual Rankings Display
          <div className="space-y-2">
            {studentRankings.slice(0, 15).map((student, index) => (
              <div
                key={student.student_id}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
              >
                {/* Rank */}
                <div className="w-16 text-center">
                  <div className="text-3xl font-black">
                    {getRankDisplay(student.final_ranking)}
                  </div>
                </div>

                {/* Name and School */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold">{student.name}</h3>
                  <p className="text-lg text-gray-400">
                    {student.school} • Grade {student.grade}
                  </p>
                </div>

                {/* Times */}
                <div className="text-right flex gap-8">
                  <div>
                    <p className="text-xs text-gray-400 font-bold">BEST</p>
                    <p className="text-2xl font-mono text-green-400 font-bold">
                      {formatTime(student.best_time_milliseconds)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold">AVG</p>
                    <p className="text-2xl font-mono text-blue-400 font-bold">
                      {formatTime(student.average_time_milliseconds)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 p-4 text-center border-t-2 border-gray-700">
        <p className="text-gray-400 text-sm">
          Press F11 for fullscreen • Auto-refreshes every {settings.refreshInterval / 1000}s
        </p>
      </div>
    </div>
  )
}
