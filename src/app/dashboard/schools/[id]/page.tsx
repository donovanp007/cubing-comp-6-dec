'use client'

/**
 * School Profile Page
 * Displays school info, roster, competition history, and achievements
 */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface SchoolInfo {
  id: string
  name: string
  abbreviation: string
  division: string
  logo_url: string | null
  color_hex: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
}

interface RosterMember {
  id: string
  first_name: string
  last_name: string
  grade: string
  email: string | null
}

interface CompetitionRecord {
  competition_id: string
  competition_name: string
  competition_date: string
  total_points: number
  overall_rank: number | null
  division_rank: number | null
  total_students: number
}

export default function SchoolProfilePage() {
  const params = useParams()
  const schoolId = params.id as string
  const { toast } = useToast()

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null)
  const [roster, setRoster] = useState<RosterMember[]>([])
  const [competitionHistory, setCompetitionHistory] = useState<CompetitionRecord[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadSchoolData()
  }, [schoolId])

  async function loadSchoolData() {
    setLoading(true)
    try {
      // Load school info
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single()

      if (!schoolError && schoolData) {
        setSchoolInfo(schoolData)
      }

      // Load roster
      const { data: rosterData, error: rosterError } = await supabase
        .from('students')
        .select('id, first_name, last_name, grade, email')
        .eq('school_id', schoolId)
        .order('grade', { ascending: true })
        .order('last_name', { ascending: true })

      if (!rosterError && rosterData) {
        setRoster(rosterData)
      }

      // Load competition history
      const { data: historyData, error: historyError } = await supabase
        .from('school_standings')
        .select(`
          competition_id,
          total_points,
          overall_rank,
          division_rank,
          total_students,
          competitions!inner(name, competition_date)
        `)
        .eq('school_id', schoolId)
        .order('competitions(competition_date)', { ascending: false })

      if (!historyError && historyData) {
        setCompetitionHistory(
          (historyData as any[]).map((rec) => ({
            competition_id: rec.competition_id,
            competition_name: rec.competitions.name,
            competition_date: rec.competitions.competition_date,
            total_points: rec.total_points,
            overall_rank: rec.overall_rank,
            division_rank: rec.division_rank,
            total_students: rec.total_students
          }))
        )
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load school data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading school profile...</div>
  }

  if (!schoolInfo) {
    return <div className="p-6 text-center text-gray-500">School not found</div>
  }

  const gradeGroups = new Map<string, RosterMember[]>()
  roster.forEach((member) => {
    if (!gradeGroups.has(member.grade)) {
      gradeGroups.set(member.grade, [])
    }
    gradeGroups.get(member.grade)!.push(member)
  })

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r rounded-lg shadow-lg overflow-hidden" style={{
        background: `linear-gradient(135deg, ${schoolInfo.color_hex}DD 0%, ${schoolInfo.color_hex} 100%)`
      }}>
        <div className="px-6 py-8 text-white">
          <h1 className="text-4xl font-bold">{schoolInfo.name}</h1>
          <div className="mt-2 flex gap-4 text-sm">
            <span>Division {schoolInfo.division}</span>
            <span>•</span>
            <span>{schoolInfo.abbreviation}</span>
            <span>•</span>
            <span>{roster.length} Students</span>
          </div>
          {schoolInfo.contact_name && (
            <div className="mt-4 space-y-1 text-sm">
              <div>Contact: {schoolInfo.contact_name}</div>
              {schoolInfo.contact_email && <div>Email: {schoolInfo.contact_email}</div>}
              {schoolInfo.contact_phone && <div>Phone: {schoolInfo.contact_phone}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">{roster.length}</div>
          <div className="text-gray-600 mt-2">Total Students</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600">{competitionHistory.length}</div>
          <div className="text-gray-600 mt-2">Competitions</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">
            {competitionHistory.length > 0
              ? competitionHistory[0].total_points.toFixed(0)
              : '-'}
          </div>
          <div className="text-gray-600 mt-2">Latest Points</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-orange-600">
            {competitionHistory.length > 0 && competitionHistory[0].overall_rank
              ? `#${competitionHistory[0].overall_rank}`
              : '-'}
          </div>
          <div className="text-gray-600 mt-2">Latest Rank</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roster */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Team Roster</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {Array.from(gradeGroups.entries())
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([grade, members]) => (
                <div key={grade}>
                  <div className="bg-gray-50 px-6 py-3 font-semibold text-gray-900">
                    Grade {grade} ({members.length} students)
                  </div>
                  <div className="divide-y divide-gray-200">
                    {members.map((member) => (
                      <div key={member.id} className="px-6 py-3 hover:bg-gray-50">
                        <div className="font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                        {member.email && (
                          <div className="text-sm text-gray-600 mt-1">{member.email}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Competition History */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Competition History</h2>
          </div>

          {competitionHistory.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No competition history</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {competitionHistory.map((record) => (
                <div key={record.competition_id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{record.competition_name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {new Date(record.competition_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {record.total_points.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">points</div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 mt-3">
                    <span>
                      Overall: {record.overall_rank ? `#${record.overall_rank}` : '-'}
                    </span>
                    <span>
                      Division: {record.division_rank ? `#${record.division_rank}` : '-'}
                    </span>
                    <span>{record.total_students} students</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Trend */}
      {competitionHistory.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
          <div className="space-y-2">
            {competitionHistory.slice(0, 5).map((record, idx) => {
              const nextRecord = competitionHistory[idx + 1]
              const improvement =
                nextRecord && nextRecord.total_points > 0
                  ? (
                      ((record.total_points - nextRecord.total_points) /
                        nextRecord.total_points) *
                      100
                    ).toFixed(1)
                  : null

              return (
                <div key={record.competition_id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{record.competition_name}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-blue-600 min-w-16 text-right">
                      {record.total_points.toFixed(1)} pts
                    </span>
                    {improvement && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          parseFloat(improvement) > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {parseFloat(improvement) > 0 ? '+' : ''}
                        {improvement}%
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
