'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Users, Zap, Award } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import RankingsTable from '@/components/rankings-table'
import RankingsStickyHeader from '@/components/rankings-sticky-header'
import { getAllRankingsData, getEventTypesForRankings } from '@/app/actions/rankings'
import type { RankingEntry } from '@/app/actions/rankings'

export default function PublicRankingsPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFilter, setSelectedFilter] = useState('')
  const [selectedCube, setSelectedCube] = useState('all')
  const [rankingMetric, setRankingMetric] = useState<'average' | 'single'>(
    'average'
  )
  const [eventTypes, setEventTypes] = useState<any[]>([])

  // Fetch rankings and event types
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [rankingsData, eventTypesData] = await Promise.all([
          getAllRankingsData(),
          getEventTypesForRankings(),
        ])
        setRankings(rankingsData)
        setEventTypes(eventTypesData)
      } catch (error) {
        console.error('Error fetching rankings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  // Filter and sort rankings
  const filteredRankings = rankings.filter((entry) => {
    // Apply cube filter
    if (selectedCube !== 'all') {
      const matchesCube =
        entry.best_single_event === selectedCube ||
        entry.best_average_event === selectedCube
      if (!matchesCube) return false
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

  const sortedRankings = [...filteredRankings].sort((a, b) => {
    if (rankingMetric === 'average') {
      // Average First mode
      if (a.overall_best_average !== b.overall_best_average) {
        return a.overall_best_average - b.overall_best_average
      }
      if (a.overall_best_single !== b.overall_best_single) {
        return a.overall_best_single - b.overall_best_single
      }
    } else {
      // Single First mode
      if (a.overall_best_single !== b.overall_best_single) {
        return a.overall_best_single - b.overall_best_single
      }
      if (a.overall_best_average !== b.overall_best_average) {
        return a.overall_best_average - b.overall_best_average
      }
    }
    return a.student_name.localeCompare(b.student_name)
  })

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
    cubes: eventTypes,
  }

  // Calculate stats
  const totalChampions = sortedRankings.length > 0 ? 1 : 0
  const activeStudents = rankings.length
  const bestSingleEntry =
    rankings.length > 0
      ? rankings.reduce((best, curr) =>
          curr.overall_best_single < (best?.overall_best_single || Infinity)
            ? curr
            : best
        )
      : null
  const bestAverageEntry =
    rankings.length > 0
      ? rankings.reduce((best, curr) =>
          curr.overall_best_average < (best?.overall_best_average || Infinity)
            ? curr
            : best
        )
      : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-2xl">🧊</span>
            </div>
            <span className="text-2xl font-bold text-white">Cubing Hub</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/competitions"
              className="text-white/80 hover:text-white transition"
            >
              Competitions
            </Link>
            <Link href="/login">
              <Button
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30 backdrop-blur"
              >
                Coach Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Student Rankings
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          See who&apos;s leading the pack across all events and competitions
        </p>
      </section>

      {/* Stats Cards */}
      <section className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Total Champions</p>
                  <p className="text-2xl font-bold text-white">{totalChampions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Active Students</p>
                  <p className="text-2xl font-bold text-white">{activeStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Best Single</p>
                  <p className="text-2xl font-bold text-white font-mono">
                    {bestSingleEntry
                      ? formatTime(bestSingleEntry.overall_best_single)
                      : '-'}
                  </p>
                  {bestSingleEntry && (
                    <p className="text-xs text-white/60">
                      {bestSingleEntry.best_single_event}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Best Average</p>
                  <p className="text-2xl font-bold text-white font-mono">
                    {bestAverageEntry
                      ? formatTime(bestAverageEntry.overall_best_average)
                      : '-'}
                  </p>
                  {bestAverageEntry && (
                    <p className="text-xs text-white/60">
                      {bestAverageEntry.best_average_event}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Filter Header */}
      {!loading && rankings.length > 0 && (
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
      )}

      {/* Rankings Content */}
      <section className="container mx-auto px-4 py-8 pb-20">
        {loading ? (
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-12 text-center">
              <p className="text-white/60">Loading rankings...</p>
            </CardContent>
          </Card>
        ) : sortedRankings.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-12 text-center">
              <Trophy className="h-16 w-16 mx-auto text-white/30 mb-4" />
              <p className="text-white/60 text-lg">
                {rankings.length === 0
                  ? 'No rankings yet'
                  : 'No results for selected filters'}
              </p>
              <p className="text-white/40 text-sm mt-2">
                {rankings.length === 0
                  ? 'Rankings will appear once students participate in competitions'
                  : 'Try adjusting your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <RankingsTable rankings={sortedRankings} />
        )}
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="flex items-center justify-between text-white/60 text-sm">
          <p>© 2025 Cubing Hub. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <Link href="/competitions" className="hover:text-white transition">
              Competitions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
