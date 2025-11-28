'use client'

/**
 * Badge Management Admin Page
 * Configure and manage achievement badges for students and schools
 */

import { useEffect, useState } from 'react'
import { getAllBadges, toggleBadgeActive, type BadgeRow } from '@/app/actions/badges'
import { useToast } from '@/hooks/use-toast'

export default function BadgesPage() {
  const { toast } = useToast()
  const [badges, setBadges] = useState<BadgeRow[]>([])
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'school'>('all')

  // Load badges on mount
  useEffect(() => {
    loadBadges()
  }, [])

  async function loadBadges() {
    setLoading(true)
    try {
      const data = await getAllBadges()
      setBadges(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load badges',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    try {
      const result = await toggleBadgeActive(id, !currentActive)
      if (result.success) {
        toast({
          title: 'Success',
          description: `Badge ${!currentActive ? 'activated' : 'deactivated'}`
        })
        loadBadges()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update badge',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update badge',
        variant: 'destructive'
      })
    }
  }

  const filteredBadges =
    filterType === 'all' ? badges : badges.filter((b) => b.badge_type === filterType)

  const individualBadges = badges.filter((b) => b.badge_type === 'individual')
  const schoolBadges = badges.filter((b) => b.badge_type === 'school')

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Achievement Badges</h1>
        <p className="text-gray-600 mt-2">
          Configure badges that are awarded to students and schools for exceptional performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">{badges.length}</div>
          <div className="text-gray-600 mt-2">Total Badges</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600">{individualBadges.length}</div>
          <div className="text-gray-600 mt-2">Individual Badges</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">{schoolBadges.length}</div>
          <div className="text-gray-600 mt-2">School Badges</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b border-gray-200">
          {(['all', 'individual', 'school'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 px-6 py-3 font-medium text-center transition-colors ${
                filterType === type
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} Badges
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading badges...</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredBadges.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No badges found</div>
            ) : (
              filteredBadges.map((badge) => (
                <div key={badge.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Badge Color Circle */}
                      <div
                        className="w-12 h-12 rounded-full border-2 border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: badge.color_hex }}
                      />

                      {/* Badge Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{badge.badge_name}</h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              badge.badge_type === 'individual'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {badge.badge_type === 'individual' ? 'Individual' : 'School'}
                          </span>
                          {!badge.active && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                              Inactive
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mt-1">{badge.badge_description}</p>

                        <div className="mt-2 text-xs text-gray-500">
                          <span>Code: </span>
                          <code className="bg-gray-100 px-2 py-1 rounded">{badge.badge_code}</code>
                        </div>

                        {/* Criteria Preview */}
                        <div className="mt-3 bg-gray-50 p-3 rounded text-xs">
                          <div className="font-medium text-gray-700">Criteria:</div>
                          <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                            {JSON.stringify(JSON.parse(badge.criteria_json), null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(badge.id, badge.active)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          badge.active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {badge.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Badge Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-blue-900">Badge Categories</h3>

        <div>
          <h4 className="font-medium text-blue-900 mb-2">Individual Badges</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Speed Demon:</strong> Achieved sub-20 second solve</li>
            <li>• <strong>Consistency King:</strong> Completed competition with zero DNFs</li>
            <li>• <strong>PB Breaker:</strong> Set a new personal best</li>
            <li>• <strong>Clutch Performer:</strong> Achieved PB in finals round</li>
            <li>• <strong>Streak Master:</strong> 3+ consecutive solve improvements</li>
            <li>• <strong>First Timer:</strong> Competed in first competition</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-blue-900 mb-2">School Badges</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Full Force:</strong> All registered students competed and completed solves</li>
            <li>• <strong>Zero DNF:</strong> School had zero DNFs across all students</li>
            <li>• <strong>Growth Warriors:</strong> School improved 15%+ from previous competition</li>
            <li>• <strong>Podium Sweep:</strong> School took 1st, 2nd, 3rd in a grade</li>
            <li>• <strong>Champion School:</strong> School champion (highest points)</li>
            <li>• <strong>Rising Stars:</strong> School had 5+ personal bests</li>
          </ul>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 mb-2">Configuration Notes</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Badges are automatically awarded at the end of each competition</li>
          <li>• Deactivating a badge prevents it from being awarded in future competitions</li>
          <li>• Criteria are JSON-based and determine badge eligibility</li>
          <li>• Color codes help visual identification across the app</li>
        </ul>
      </div>
    </div>
  )
}
