'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Users, Zap, Award, X, ChevronDown } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import RankingsTable from '@/components/rankings-table'
import RankingsStickyHeader from '@/components/rankings-sticky-header'
import { getAllRankingsData, getEventTypesForRankings, getStudentProfileData } from '@/app/actions/rankings'
import type { RankingEntry, StudentProfileData } from '@/app/actions/rankings'

export default function PublicRankingsPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFilter, setSelectedFilter] = useState('')
  const [selectedCube, setSelectedCube] = useState('3x3x3 Cube') // Default to 3x3
  const [rankingMetric, setRankingMetric] = useState<'average' | 'single'>(
    'average'
  )
  const [eventTypes, setEventTypes] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<RankingEntry | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentProfileData | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileTab, setProfileTab] = useState<'overview' | 'events'>('overview')
  const [competitionFilter, setCompetitionFilter] = useState<'all' | 'current' | 'past'>('all')
  const [showHistory, setShowHistory] = useState(true)

  // Fetch rankings and event types
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[Client] Starting fetch of rankings data...')
        const startTime = Date.now()

        const [rankingsData, eventTypesData] = await Promise.all([
          getAllRankingsData(),
          getEventTypesForRankings(),
        ])

        const elapsed = Date.now() - startTime
        console.log(`[Client] Fetch completed in ${elapsed}ms`)
        console.log(`[Client] Rankings data received:`, {
          count: rankingsData?.length,
          firstEntry: rankingsData?.[0],
          allEntries: rankingsData
        })
        console.log(`[Client] Event types received:`, eventTypesData)

        console.log(`[Client] Setting rankings state with ${rankingsData?.length} entries`)
        setRankings(rankingsData || [])

        console.log(`[Client] Setting event types state`)
        setEventTypes(eventTypesData || [])

        console.log(`[Client] Setting loading to false`)
      } catch (error) {
        console.error('[Client] Error fetching rankings:', error)
        console.error('[Client] Error stack:', error instanceof Error ? error.stack : 'No stack')
      } finally {
        console.log('[Client] Setting loading to false in finally block')
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  // Filter and sort rankings by CUBE CATEGORY
  const filteredRankings = rankings.filter((entry: any) => {
    // Only include students who have times
    const hasCubeStats = Object.keys(entry.cube_stats || {}).length > 0

    if (!hasCubeStats) {
      return false
    }

    // Only include students who have VALID times (> 0) for the selected cube
    if (selectedCube !== 'all') {
      const cubeStats = entry.cube_stats[selectedCube]
      if (!cubeStats || (cubeStats.best_single <= 0 && cubeStats.best_average <= 0)) {
        return false
      }
    } else {
      // For 'all' cubes, ensure at least one cube has valid times
      const hasValidTimes = Object.values(entry.cube_stats || {}).some((stats: any) =>
        stats && (stats.best_single > 0 || stats.best_average > 0)
      )
      if (!hasValidTimes) {
        return false
      }
    }

    // Apply category filter
    switch (selectedCategory) {
      case 'schools':
        return entry.school === selectedFilter
      case 'grades':
        return entry.grade === selectedFilter
      case 'ages':
        return entry.age_range === selectedFilter
      default:
        return true
    }
  })

  // Helper to find best times across all cubes
  const getBestStats = (cubeStats: any) => {
    let bestAverage = Infinity
    let bestSingle = Infinity
    Object.values(cubeStats).forEach((stats: any) => {
      if (stats.best_average > 0 && stats.best_average < bestAverage) {
        bestAverage = stats.best_average
      }
      if (stats.best_single > 0 && stats.best_single < bestSingle) {
        bestSingle = stats.best_single
      }
    })
    return { best_average: bestAverage, best_single: bestSingle }
  }

  const sortedRankings = [...filteredRankings].sort((a: any, b: any) => {
    if (selectedCube === 'all') {
      // If showing all cubes, sort by best overall across all cubes
      const aStats = getBestStats(a.cube_stats)
      const bStats = getBestStats(b.cube_stats)

      if (rankingMetric === 'average') {
        if (aStats.best_average !== bStats.best_average) {
          return aStats.best_average - bStats.best_average
        }
        return aStats.best_single - bStats.best_single
      } else {
        if (aStats.best_single !== bStats.best_single) {
          return aStats.best_single - bStats.best_single
        }
        return aStats.best_average - bStats.best_average
      }
    } else {
      // Sort by selected cube's stats
      const aStats = a.cube_stats[selectedCube] || { best_average: Infinity, best_single: Infinity }
      const bStats = b.cube_stats[selectedCube] || { best_average: Infinity, best_single: Infinity }

      if (rankingMetric === 'average') {
        // Average First mode
        if (aStats.best_average !== bStats.best_average) {
          return aStats.best_average - bStats.best_average
        }
        return aStats.best_single - bStats.best_single
      } else {
        // Single First mode
        if (aStats.best_single !== bStats.best_single) {
          return aStats.best_single - bStats.best_single
        }
        return aStats.best_average - bStats.best_average
      }
    }
  })

  // Handle student selection with profile data fetching
  const handleSelectStudent = async (entry: RankingEntry) => {
    setSelectedStudent(entry)
    setProfileLoading(true)
    try {
      console.log(`[Client] Fetching profile for student ${entry.student_id}`)
      const profile = await getStudentProfileData(entry.student_id)
      console.log(`[Client] Profile fetch result:`, profile)
      if (profile) {
        setStudentProfile(profile)
      } else {
        console.warn(`[Client] Profile data was null for student ${entry.student_id}`)
        // Still set a minimal profile so user sees student info at least
        setStudentProfile({
          student_id: entry.student_id,
          student_name: entry.student_name,
          grade: entry.grade || null,
          school: entry.school || null,
          age: entry.age || null,
          age_range: entry.age_range || '',
          profile_image_url: null,
          competitions_participated: 0,
          events_participated: 0,
          records_count: 0,
          pbs_count: 0,
          cube_stats: entry.cube_stats || {},
          competitions: [],
        } as StudentProfileData)
      }
    } catch (error) {
      console.error('Error fetching student profile:', error)
      // Show at least basic student info from the ranking entry
      setStudentProfile({
        student_id: entry.student_id,
        student_name: entry.student_name,
        grade: entry.grade || null,
        school: entry.school || null,
        age: entry.age || null,
        age_range: entry.age_range || '',
        profile_image_url: null,
        competitions_participated: 0,
        events_participated: 0,
        records_count: 0,
        pbs_count: 0,
        cube_stats: entry.cube_stats || {},
        competitions: [],
      } as StudentProfileData)
    } finally {
      setProfileLoading(false)
    }
  }

  // Calculate available filters
  const availableSchools = Array.from(
    new Set(rankings.filter((r) => r.school).map((r) => r.school!))
  ).sort()
  const availableGrades = Array.from(
    new Set(rankings.filter((r) => r.grade).map((r) => r.grade!))
  ).sort()

  const availableFilters = {
    schools: availableSchools,
    grades: availableGrades,
    cubes: eventTypes.map((et) => ({ id: et.id, name: et.display_name })),
  }

  // Calculate stats - filtered by selected cube
  const topStudent = sortedRankings.length > 0 ? sortedRankings[0] : null
  const activeStudents = filteredRankings.length

  let bestSingle: number | null = null
  let bestAverage: number | null = null

  if (filteredRankings.length > 0) {
    if (selectedCube === 'all') {
      // Find best single and average across all cubes
      filteredRankings.forEach((student: any) => {
        Object.values(student.cube_stats || {}).forEach((stats: any) => {
          if (stats && typeof stats === 'object') {
            if (stats.best_single > 0 && (!bestSingle || stats.best_single < bestSingle)) {
              bestSingle = stats.best_single
            }
            if (stats.best_average > 0 && (!bestAverage || stats.best_average < bestAverage)) {
              bestAverage = stats.best_average
            }
          }
        })
      })
    } else {
      // Find best single and average for this specific cube
      filteredRankings.forEach((student: any) => {
        const stats = student.cube_stats[selectedCube]
        if (stats) {
          if (stats.best_single > 0 && (!bestSingle || stats.best_single < bestSingle)) {
            bestSingle = stats.best_single
          }
          if (stats.best_average > 0 && (!bestAverage || stats.best_average < bestAverage)) {
            bestAverage = stats.best_average
          }
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">🧊</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Cubing Hub</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/competitions"
                className="text-gray-600 hover:text-gray-900 transition font-medium"
              >
                Competitions
              </Link>
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Coach Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Student Rankings
          </h1>
          <p className="text-lg text-gray-600">
            See who&apos;s leading the pack across all events and competitions
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-600">
              Showing: <span className="text-blue-600 font-bold">{selectedCube}</span>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* #1 Ranked Card */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">🏆 #1 Ranked</p>
              {topStudent ? (
                <>
                  <p className="text-xl font-bold text-gray-900 mb-1">{topStudent.student_name}</p>
                  <p className="text-sm text-gray-600">
                    {rankingMetric === 'average'
                      ? formatTime(topStudent.cube_stats?.[selectedCube]?.best_average || 0)
                      : formatTime(topStudent.cube_stats?.[selectedCube]?.best_single || 0)}
                  </p>
                </>
              ) : (
                <p className="text-xl font-bold text-gray-400">-</p>
              )}
            </div>

            {/* Competitors Card */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">👥 Competitors</p>
              <p className="text-3xl font-bold text-gray-900">{activeStudents}</p>
              <p className="text-xs text-gray-600 mt-1">active in {selectedCube}</p>
            </div>

            {/* Best Single Card */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">⚡ Best Single</p>
              <p className="text-2xl font-bold text-green-600 font-mono">
                {bestSingle ? formatTime(bestSingle) : '-'}
              </p>
              <p className="text-xs text-gray-600 mt-1">for {selectedCube}</p>
            </div>

            {/* Best Average Card */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">📊 Best Average</p>
              <p className="text-2xl font-bold text-blue-600 font-mono">
                {bestAverage ? formatTime(bestAverage) : '-'}
              </p>
              <p className="text-xs text-gray-600 mt-1">for {selectedCube}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Header */}
      {rankings.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <RankingsStickyHeader
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              selectedCube={selectedCube}
              onCubeChange={setSelectedCube}
              rankingMetric={rankingMetric}
              onMetricToggle={() =>
                setRankingMetric(rankingMetric === 'average' ? 'single' : 'average')
              }
              availableFilters={availableFilters}
            />
          </div>
        </div>
      )}

      {/* Rankings Content */}
      <section className="container mx-auto px-4 py-8 pb-20">
        {sortedRankings.length > 0 ? (
          <RankingsTable
            rankings={sortedRankings}
            onSelectStudent={handleSelectStudent}
            selectedCube={selectedCube}
          />
        ) : loading ? (
          <Card className="border border-gray-200">
            <CardContent className="p-12 text-center">
              <p className="text-gray-600">Loading rankings...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-gray-200">
            <CardContent className="p-12 text-center">
              <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-700 text-lg font-semibold">
                {rankings.length === 0
                  ? 'No rankings yet'
                  : 'No results for selected filters'}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                {rankings.length === 0
                  ? 'Rankings will appear once students participate in competitions'
                  : 'Try adjusting your filters'}
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-4xl my-8">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 sticky top-0 bg-white border-b z-10">
              <div className="p-6 pb-0">
                <CardTitle className="text-3xl">{selectedStudent.student_name}</CardTitle>
                <CardDescription className="mt-2 space-y-1">
                  {selectedStudent.grade && <p>Grade: {selectedStudent.grade}</p>}
                  {selectedStudent.school && <p>School: {selectedStudent.school}</p>}
                  {selectedStudent.age && <p>Age: {selectedStudent.age} ({selectedStudent.age_range})</p>}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setSelectedStudent(null)
                  setStudentProfile(null)
                  setProfileTab('overview')
                  setCompetitionFilter('all')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            {/* Tabs */}
            {studentProfile && (
              <div className="border-b border-gray-200 bg-white sticky top-[80px] z-10">
                <div className="flex gap-0 px-6">
                  <button
                    onClick={() => setProfileTab('overview')}
                    className={`px-0 py-3 font-medium border-b-2 transition ${
                      profileTab === 'overview'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📊 Overview & Competitions
                  </button>
                  <button
                    onClick={() => setProfileTab('events')}
                    className={`px-0 py-3 font-medium border-b-2 transition ml-6 ${
                      profileTab === 'events'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🧩 All Event Types
                  </button>
                </div>
              </div>
            )}

            <CardContent className="space-y-6 py-6">
              {profileLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading profile...</p>
                </div>
              ) : studentProfile ? (
                <>
                  {profileTab === 'overview' ? (
                    <>
                      {/* Stats Overview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <p className="text-xs font-semibold text-gray-600 uppercase">Competitions</p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">
                            {studentProfile.competitions_participated}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Participated</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <p className="text-xs font-semibold text-gray-600 uppercase">Events</p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">
                            {studentProfile.events_participated}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Types</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <p className="text-xs font-semibold text-gray-600 uppercase">Records</p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">
                            {studentProfile.records_count}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Set</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <p className="text-xs font-semibold text-gray-600 uppercase">PBs</p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">
                            {studentProfile.pbs_count}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Achieved</p>
                        </div>
                      </div>

                      {/* Competition Filter */}
                      <div className="flex gap-2 py-2">
                        <button
                          onClick={() => setCompetitionFilter('all')}
                          className={`px-4 py-2 rounded text-sm font-medium transition ${
                            competitionFilter === 'all'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          All Competitions
                        </button>
                        <button
                          onClick={() => setCompetitionFilter('current')}
                          className={`px-4 py-2 rounded text-sm font-medium transition ${
                            competitionFilter === 'current'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Current
                        </button>
                        <button
                          onClick={() => setCompetitionFilter('past')}
                          className={`px-4 py-2 rounded text-sm font-medium transition ${
                            competitionFilter === 'past'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Past
                        </button>
                      </div>

                      {/* Competition History */}
                      <div>
                        <button
                          onClick={() => setShowHistory(!showHistory)}
                          className="flex items-center gap-2 font-semibold text-gray-900 mb-2 text-lg hover:text-blue-600 transition"
                        >
                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${
                              showHistory ? 'rotate-0' : '-rotate-90'
                            }`}
                          />
                          Competition History - {selectedCube} ({studentProfile.competitions.filter(c => c.rounds.some(r => r.event_name === selectedCube)).length})
                        </button>
                        {showHistory && studentProfile.competitions.length > 0 ? (
                          <div className="space-y-2">
                            {studentProfile.competitions.map((comp) => {
                              // Filter rounds for selected cube
                              const filteredRounds = comp.rounds.filter(r => r.event_name === selectedCube)
                              if (filteredRounds.length === 0) return null // Hide competitions with no rounds for this cube

                              return (
                              <div
                                key={comp.competition_id}
                                className="border border-gray-200 rounded-lg p-2 bg-white hover:shadow-md transition"
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{comp.competition_name}</h4>
                                    <p className="text-xs text-gray-500">
                                      {new Date(comp.competition_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    {filteredRounds.length}R
                                  </span>
                                </div>

                                {/* Rounds with Solves */}
                                <div className="space-y-1">
                                  {filteredRounds.map((round) => (
                                    <div key={round.round_id} className="border border-gray-200 rounded p-1.5 bg-gray-50">
                                      <div className="flex justify-between items-center mb-1">
                                        <div>
                                          <p className="font-semibold text-gray-900 text-xs">
                                            {round.round_name || `Rd${round.round_number}`}
                                          </p>
                                          <p className="text-xs text-gray-500">{round.event_name}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs text-gray-500">PB: {formatTime(round.best_single)}</p>
                                          <p className="text-xs text-gray-500">Avg: {formatTime(round.best_average)}</p>
                                        </div>
                                      </div>

                                      {/* 5 Solves */}
                                      <div className="grid grid-cols-5 gap-1">
                                        {round.solves && round.solves.length > 0 ? (
                                          round.solves.map((solve, solveIdx) => (
                                            <div
                                              key={solveIdx}
                                              className={`p-1 rounded text-center text-xs font-mono relative ${
                                                solve.isPB
                                                  ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-400 font-bold'
                                                  : solve.penalty === 'DNF'
                                                  ? 'bg-red-100 text-red-800'
                                                  : solve.penalty === '+2'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-white border border-gray-200 text-gray-900'
                                              }`}
                                            >
                                              {solve.isPB && (
                                                <span className="absolute -top-1.5 -right-1 text-sm">⭐</span>
                                              )}
                                              <p className="font-bold">{formatTime(solve.solve_time)}</p>
                                              {solve.penalty && solve.penalty !== 'OK' && (
                                                <p className="text-xs">{solve.penalty}</p>
                                              )}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="col-span-5 text-center text-xs text-gray-500 py-1">
                                            No solves
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-2">No competition history for {selectedCube}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* All Event Types Tab */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Performance Across All Events</h3>
                        {Object.keys(studentProfile.cube_stats).length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(studentProfile.cube_stats).map(([cubeName, stats]) => (
                              <div key={cubeName} className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-bold text-gray-900 mb-3">{cubeName}</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Best Single:</span>
                                    <span className="font-mono font-bold text-gray-900">{formatTime(stats.best_single)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Best Average:</span>
                                    <span className="font-mono font-bold text-gray-900">{formatTime(stats.best_average)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No event data yet</p>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Unable to load profile data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-gray-600 text-sm">
          <p>© 2025 Cubing Hub. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-gray-900 transition">
              Home
            </Link>
            <Link href="/competitions" className="hover:text-gray-900 transition">
              Competitions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
