'use client'

/**
 * Grade Multipliers Admin Configuration
 * Configure point multipliers per grade (inverse scale: younger students = higher multiplier)
 */

import { useEffect, useState } from 'react'
import { getAllGradeMultipliers, updateGradeMultiplier, resetGradeMultipliersToDefaults, type GradeMultiplierRow } from '@/app/actions/grade-multipliers'
import { useToast } from '@/hooks/use-toast'

export default function GradeMultipliersPage() {
  const { toast } = useToast()
  const [multipliers, setMultipliers] = useState<GradeMultiplierRow[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(1.0)

  // Load multipliers on mount
  useEffect(() => {
    loadMultipliers()
  }, [])

  async function loadMultipliers() {
    setLoading(true)
    try {
      const data = await getAllGradeMultipliers()
      setMultipliers(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load grade multipliers',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(id: string) {
    if (editValue < 0.5 || editValue > 3.0) {
      toast({
        title: 'Validation Error',
        description: 'Multiplier must be between 0.5 and 3.0',
        variant: 'destructive'
      })
      return
    }

    try {
      const result = await updateGradeMultiplier(id, editValue)
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Multiplier updated'
        })
        setEditingId(null)
        loadMultipliers()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update multiplier',
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
    if (!confirm('Reset all multipliers to defaults? This cannot be undone.')) {
      return
    }

    try {
      const result = await resetGradeMultipliersToDefaults()
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Multipliers reset to defaults'
        })
        loadMultipliers()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to reset multipliers',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset multipliers',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Grade Multipliers</h1>
        <p className="text-gray-600 mt-2">Configure point multipliers per grade (inverse scale)</p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Inverse Scale Explanation</h3>
        <p className="text-sm text-blue-800 mb-3">
          Lower grades earn MORE points to encourage younger students to participate. Grade 5 (2.0x) earns twice
          the points as Grade 12 (1.0x) for the same achievement.
        </p>
        <p className="text-sm text-blue-800">
          <strong>Example:</strong> Grade 5 Sub-20s solve (Tier S, 10 base points) = 10 × 2.0 = <strong>20 points</strong>
          <br />
          Grade 12 Sub-20s solve (Tier S, 10 base points) = 10 × 1.0 = <strong>10 points</strong>
        </p>
      </div>

      {/* Multipliers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Grade Multipliers</h2>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
          >
            Reset to Defaults
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading multipliers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Grade</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Multiplier</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Points Preview</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {multipliers.map((item) => {
                  const previewTierSPoints = Math.round(10 * item.multiplier * 100) / 100
                  const previewTierAPoints = Math.round(5 * item.multiplier * 100) / 100

                  return (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">Grade {item.grade}</div>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.05"
                              min="0.5"
                              max="3.0"
                              value={editValue}
                              onChange={(e) => setEditValue(parseFloat(e.target.value))}
                              className="px-2 py-1 border border-gray-300 rounded w-20"
                            />
                            <span className="text-sm text-gray-600">x</span>
                          </div>
                        ) : (
                          <span className="text-lg font-semibold text-blue-600">{item.multiplier.toFixed(2)}x</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          <div>Tier S (10 pts): {previewTierSPoints}</div>
                          <div>Tier A (5 pts): {previewTierAPoints}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(item.id)}
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
                              setEditingId(item.id)
                              setEditValue(item.multiplier)
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Multiplier Scale Visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Multiplier Scale Visualization</h3>
        <div className="space-y-2">
          {multipliers.map((item) => {
            const percentage = (item.multiplier / 2.0) * 100
            return (
              <div key={item.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">Grade {item.grade}</span>
                  <span className="text-sm text-gray-600">{item.multiplier.toFixed(2)}x</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Default Values Reference */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-2">Default Multiplier Values</h3>
        <div className="text-sm text-green-800 space-y-1">
          <p>• Grade 5 (Youngest): 2.0x — Maximum encouragement</p>
          <p>• Grade 6-11: Scaled linearly from 1.85x to 1.1x</p>
          <p>• Grade 12 (Oldest): 1.0x — Baseline points</p>
        </div>
      </div>
    </div>
  )
}
