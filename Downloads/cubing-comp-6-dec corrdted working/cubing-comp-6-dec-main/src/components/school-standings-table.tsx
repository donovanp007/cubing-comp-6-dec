/**
 * SchoolStandingsTable Component
 * Reusable table for displaying school standings with sorting and actions
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export interface SchoolStandingRow {
  id: string
  school_id: string
  total_points: number
  best_time_points: number
  average_time_points: number
  bonus_points: number
  total_students: number
  average_points_per_student: number
  total_pb_count: number
  total_dnf_count: number
  overall_rank: number | null
  division_rank: number | null
  schools: {
    id: string
    name: string
    abbreviation: string
    division: string
    color_hex: string
  }
}

interface SchoolStandingsTableProps {
  standings: SchoolStandingRow[]
  title?: string
  description?: string
  maxRows?: number
  showDivision?: boolean
  onRowClick?: (standing: SchoolStandingRow) => void
  loading?: boolean
  emptyMessage?: string
  className?: string
}

const MEDAL_ICONS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉'
}

function getRankDisplay(rank: number | null): string {
  if (!rank) return '-'
  if (rank <= 3 && MEDAL_ICONS[rank]) {
    return MEDAL_ICONS[rank]
  }
  return `#${rank}`
}

export function SchoolStandingsTable({
  standings,
  title = 'School Standings',
  description = 'Overall team rankings',
  maxRows,
  showDivision = true,
  onRowClick,
  loading = false,
  emptyMessage = 'No standings available',
  className = ''
}: SchoolStandingsTableProps) {
  const displayStandings = maxRows ? standings.slice(0, maxRows) : standings

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading standings...</div>
        ) : displayStandings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Avg/Student</TableHead>
                  {showDivision && <TableHead className="text-center">Division</TableHead>}
                  <TableHead className="text-right text-xs">PBs/DNFs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayStandings.map((standing, index) => (
                  <TableRow
                    key={standing.id}
                    className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                    onClick={() => onRowClick?.(standing)}
                  >
                    {/* Rank */}
                    <TableCell className="font-bold text-lg">
                      {getRankDisplay(standing.overall_rank || standing.division_rank)}
                    </TableCell>

                    {/* School */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-8 rounded"
                          style={{ backgroundColor: standing.schools.color_hex || '#ccc' }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{standing.schools.name}</p>
                          <p className="text-xs text-gray-500">{standing.schools.abbreviation}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Points */}
                    <TableCell className="text-right">
                      <span className="text-xl font-bold text-blue-600">
                        {standing.total_points.toFixed(1)}
                      </span>
                    </TableCell>

                    {/* Students */}
                    <TableCell className="text-right">{standing.total_students}</TableCell>

                    {/* Avg per student */}
                    <TableCell className="text-right text-gray-700">
                      {standing.average_points_per_student.toFixed(1)}
                    </TableCell>

                    {/* Division */}
                    {showDivision && (
                      <TableCell className="text-center">
                        <Badge variant="outline">Div {standing.schools.division}</Badge>
                      </TableCell>
                    )}

                    {/* PBs / DNFs */}
                    <TableCell className="text-right text-xs">
                      <span className="text-orange-600 font-semibold">{standing.total_pb_count}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-red-600 font-semibold">{standing.total_dnf_count}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact version for dashboards
interface CompactSchoolStandingsProps {
  standings: SchoolStandingRow[]
  maxRows?: number
  className?: string
}

export function CompactSchoolStandings({
  standings,
  maxRows = 5,
  className = ''
}: CompactSchoolStandingsProps) {
  const displayStandings = standings.slice(0, maxRows)

  return (
    <div className={`space-y-2 ${className}`}>
      {displayStandings.map((standing) => (
        <div
          key={standing.id}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="font-bold text-lg w-8">
              {getRankDisplay(standing.overall_rank || standing.division_rank)}
            </span>
            <div
              className="w-2 h-6 rounded"
              style={{ backgroundColor: standing.schools.color_hex || '#ccc' }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{standing.schools.name}</p>
              <p className="text-xs text-gray-500">{standing.schools.abbreviation}</p>
            </div>
          </div>

          <div className="text-right ml-4">
            <p className="text-lg font-bold text-blue-600">{standing.total_points.toFixed(1)}</p>
            <p className="text-xs text-gray-500">{standing.total_students} students</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SchoolStandingsTable
