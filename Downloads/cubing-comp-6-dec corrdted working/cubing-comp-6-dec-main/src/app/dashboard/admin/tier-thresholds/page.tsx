'use client'

/**
 * Tier Thresholds Admin Configuration
 * Allows admins to customize time ranges and point values for each tier
 */

import { useEffect, useState } from 'react'
import { getAllEventTypes, getTierThresholdsForEvent, updateTierThreshold, resetTierThresholdsToDefaults, type TierThresholdRow } from '@/app/actions/tier-thresholds'
import { useToast } from '@/hooks/use-toast'

const TIER_COLORS = {
  S: { hex: '#FFD700', label: 'Elite (Gold)' },
  A: { hex: '#C0C0C0', label: 'Advanced (Silver)' },
  B: { hex: '#CD7F32', label: 'Intermediate (Bronze)' },
  C: { hex: '#4CAF50', label: 'Beginner (Green)' },
  D: { hex: '#9E9E9E', label: 'Attempt (Gray)' }
}

export default function TierThresholdsPage() {
  const { toast } = useToast()
  const [eventTypes, setEventTypes] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [thresholds, setThresholds] = useState<TierThresholdRow[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<any>({})

  // Load event types on mount
  useEffect(() => {
    loadEventTypes()
  }, [])

  // Load thresholds when event type changes
  useEffect(() => {
    if (selectedEventId) {
      loadThresholds(selectedEventId)
    }
  }, [selectedEventId])

  async function loadEventTypes() {
    try {
      const types = await getAllEventTypes()
      setEventTypes(types)
      if (types.length > 0) {
        setSelectedEventId(types[0].id)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load event types',
        variant: 'destructive'
      })
    }
  }

  async function loadThresholds(eventTypeId: string) {
    setLoading(true)
    try {
      const data = await getTierThresholdsForEvent(eventTypeId)
      setThresholds(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tier thresholds',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(id: string) {
    try {
      const result = await updateTierThreshold(id, editValues[id])
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Tier threshold updated'
        })
        setEditingId(null)
        loadThresholds(selectedEventId)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update tier threshold',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive'
      })
    }
  }

  async function handleReset() {
    if (!confirm('Reset all thresholds for this event to defaults? This cannot be undone.')) {
      return
    }

    try {
      const result = await resetTierThresholdsToDefaults(selectedEventId)
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Tiers reset to defaults'
        })
        loadThresholds(selectedEventId)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to reset tiers',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset tiers',
        variant: 'destructive'
      })
    }
  }

  function msToSeconds(ms: number | null): string {
    if (ms === null) return '∞'
    return (ms / 1000).toFixed(2)
  }

  function secondsToMs(seconds: string): number | null {
    if (seconds === '∞' || seconds === '') return null
    const num = parseFloat(seconds)
    return isNaN(num) ? null : num * 1000
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Tier Thresholds</h1>
        <p className="text-gray-600 mt-2">Configure time ranges and point values for each tier</p>
      </div>

      {/* Event Type Selector */}
      <div className="bg-white p-6 rounded-lg shadow">
        <label className="block text-sm font-medium mb-2">Select Event Type</label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          {eventTypes.map((event) => (
            <option key={event.id} value={event.id}>
              {event.display_name}
            </option>
          ))}
        </select>
      </div>

      {/* Tier Configuration Table */}
      {selectedEventId && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {eventTypes.find((e) => e.id === selectedEventId)?.display_name} - Tier Configuration
            </h2>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
            >
              Reset to Defaults
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading thresholds...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tier</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Color</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Min Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Max Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Base Points</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {thresholds.map((tier) => (
                    <tr key={tier.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{tier.tier_name}</div>
                          <div className="text-sm text-gray-600">{tier.tier_display_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: tier.color_hex }}
                          />
                          <span className="text-sm text-gray-600">{tier.color_hex}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === tier.id ? (
                          <input
                            type="text"
                            placeholder="0.00"
                            value={editValues[tier.id]?.min_time_milliseconds ?? msToSeconds(tier.min_time_milliseconds)}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                [tier.id]: {
                                  ...editValues[tier.id],
                                  min_time_milliseconds: secondsToMs(e.target.value)
                                }
                              })
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
                          />
                        ) : (
                          <span className="text-sm">{msToSeconds(tier.min_time_milliseconds)}s</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === tier.id ? (
                          <input
                            type="text"
                            placeholder="∞"
                            value={editValues[tier.id]?.max_time_milliseconds ?? msToSeconds(tier.max_time_milliseconds)}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                [tier.id]: {
                                  ...editValues[tier.id],
                                  max_time_milliseconds: secondsToMs(e.target.value)
                                }
                              })
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
                          />
                        ) : (
                          <span className="text-sm">{msToSeconds(tier.max_time_milliseconds)}s</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === tier.id ? (
                          <input
                            type="number"
                            value={editValues[tier.id]?.base_points ?? tier.base_points}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                [tier.id]: {
                                  ...editValues[tier.id],
                                  base_points: parseInt(e.target.value)
                                }
                              })
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm w-20"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-blue-600">{tier.base_points}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === tier.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(tier.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(tier.id)
                              setEditValues({
                                [tier.id]: {
                                  min_time_milliseconds: tier.min_time_milliseconds,
                                  max_time_milliseconds: tier.max_time_milliseconds,
                                  base_points: tier.base_points
                                }
                              })
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How Tiers Work</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tier S (Elite): Fastest times = most points</li>
          <li>• Tier D (Attempt): Over maximum time or DNF = no points</li>
          <li>• Students earn points for BOTH best time tier AND average time tier</li>
          <li>• Grade multiplier (2.0x for Grade 5, 1.0x for Grade 12) is applied to all points</li>
        </ul>
      </div>
    </div>
  )
}
