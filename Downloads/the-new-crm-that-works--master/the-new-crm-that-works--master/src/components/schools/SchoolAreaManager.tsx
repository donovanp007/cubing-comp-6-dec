'use client'

import { useState, useEffect } from 'react'
import { School as SchoolIcon, MapPin, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'

interface Area {
  id: string
  name: string
  region?: string
  description?: string
}

interface SchoolWithArea {
  id: string
  name: string
  area?: string
  target_enrollment: number
  current_enrollment: number
  term_fee_per_student: number
}

interface SchoolAreaManagerProps {
  schools: SchoolWithArea[]
  onSchoolSelect?: (school: SchoolWithArea) => void
  onAreaChange?: (schoolId: string, area: string) => void
  readOnly?: boolean
}

export default function SchoolAreaManager({
  schools,
  onSchoolSelect,
  onAreaChange,
  readOnly = false,
}: SchoolAreaManagerProps) {
  const supabase = createClient()
  const [areas, setAreas] = useState<Area[]>([])
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch available areas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.from('areas').select('*').order('name')

        if (error) throw error
        setAreas(data || [])
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load areas'
        setError(message)
        console.error('Error loading areas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAreas()
  }, [])

  const handleAreaChange = async (schoolId: string, newArea: string) => {
    try {
      const { error } = await supabase.from('schools').update({ area: newArea }).eq('id', schoolId)

      if (error) throw error

      onAreaChange?.(schoolId, newArea)
    } catch (err) {
      console.error('Error updating school area:', err)
      alert('Failed to update school area')
    }
  }

  // Group schools by area
  const schoolsByArea = areas.reduce(
    (acc, area) => {
      acc[area.name] = schools.filter((s) => s.area === area.name)
      return acc
    },
    {} as Record<string, SchoolWithArea[]>
  )

  // Add unassigned schools
  const unassignedSchools = schools.filter((s) => !s.area)
  if (unassignedSchools.length > 0) {
    schoolsByArea['Unassigned'] = unassignedSchools
  }

  // Filter by selected area
  const displaySchools = selectedArea && selectedArea !== 'all' ? schoolsByArea[selectedArea] || [] : schools

  const getAreaColor = (area?: string) => {
    if (!area) return 'bg-gray-100'
    const colors: Record<string, string> = {
      Milnerton: 'bg-blue-100',
      Durbanville: 'bg-green-100',
      Sunningdale: 'bg-purple-100',
      Other: 'bg-yellow-100',
    }
    return colors[area] || 'bg-gray-100'
  }

  const areaStats = Object.entries(schoolsByArea).map(([area, areaSchools]) => ({
    area,
    count: areaSchools.length,
    totalStudents: areaSchools.reduce((sum, s) => sum + s.current_enrollment, 0),
    totalRevenue: areaSchools.reduce((sum, s) => sum + s.current_enrollment * s.term_fee_per_student, 0),
  }))

  return (
    <div className="space-y-6">
      {/* Area Statistics */}
      {areaStats.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Area Overview</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {areaStats.map((stat) => (
              <div
                key={stat.area}
                className={`p-4 rounded-lg border ${getAreaColor(stat.area === 'Unassigned' ? undefined : stat.area)}`}
              >
                <div className="text-sm font-medium text-gray-600 mb-2">{stat.area}</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Schools:</span>
                    <span className="font-semibold">{stat.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Students:</span>
                    <span className="font-semibold">{stat.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Potential Revenue:</span>
                    <span className="font-semibold text-green-600">R{stat.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Area Filter */}
      <div className="flex items-center space-x-2">
        <Filter className="h-5 w-5 text-gray-500" />
        <span className="text-sm font-medium">Filter by Area:</span>
        <Select
          value={selectedArea || 'all'}
          onValueChange={(value) => setSelectedArea(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All Areas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area.id} value={area.name}>
                {area.name}
              </SelectItem>
            ))}
            {unassignedSchools.length > 0 && <SelectItem value="Unassigned">Unassigned</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      {/* Schools List Grouped by Area */}
      <div className="space-y-6">
        {Object.entries(schoolsByArea).map(([area, areaSchools]) => {
          // Skip if filtering and this area isn't selected
          if (selectedArea && selectedArea !== 'all' && area !== selectedArea) {
            return null
          }

          if (areaSchools.length === 0) {
            return null
          }

          return (
            <div key={area}>
              <h4 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>{area}</span>
                <Badge variant="outline">{areaSchools.length} schools</Badge>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {areaSchools.map((school) => (
                  <Card key={school.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div
                      onClick={() => onSchoolSelect?.(school)}
                      className="space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                          <SchoolIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <h5 className="font-semibold text-gray-900 truncate">{school.name}</h5>
                            {school.area && <p className="text-sm text-gray-500">{school.area}</p>}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded">
                        <div>
                          <div className="text-xs text-gray-500">Current</div>
                          <div className="font-semibold">{school.current_enrollment}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Target</div>
                          <div className="font-semibold">{school.target_enrollment}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Fee</div>
                          <div className="font-semibold text-sm">
                            R{Math.round(school.term_fee_per_student).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {!readOnly && (
                        <div className="border-t pt-3">
                          <label className="text-xs font-medium text-gray-600 mb-2 block">Change Area:</label>
                          <Select
                            value={school.area || ''}
                            onValueChange={(newArea) => handleAreaChange(school.id, newArea)}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Select area" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No Area</SelectItem>
                              {areas.map((a) => (
                                <SelectItem key={a.id} value={a.name}>
                                  {a.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Loading & Error States */}
      {loading && <div className="text-center text-gray-500">Loading areas...</div>}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {!loading && schools.length === 0 && (
        <div className="text-center text-gray-500">No schools to display</div>
      )}
    </div>
  )
}
