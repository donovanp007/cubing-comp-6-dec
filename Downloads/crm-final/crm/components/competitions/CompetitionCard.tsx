'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, MapPin, Users, Trash2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { AddStudentsModal } from './AddStudentsModal'
import type { CompetitionListItem } from '@/lib/types/competition.types'

interface CompetitionCardProps {
  competition: CompetitionListItem
  onDelete?: (competitionId: string) => Promise<void>
}

export function CompetitionCard({ competition, onDelete }: CompetitionCardProps) {
  const [isAddStudentsOpen, setIsAddStudentsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this competition?')) return
    setIsDeleting(true)
    try {
      await onDelete?.(competition.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
      case 'registration_open':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'in_progress':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'Registration Open'
      case 'in_progress':
        return 'In Progress'
      default:
        return status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border border-gray-200">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

        <div className="p-6 space-y-4">
          {/* Header with status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                {competition.name}
              </h3>
              {competition.league && (
                <p className="text-sm text-gray-600 mt-1">
                  📅 {competition.league.name}
                </p>
              )}
            </div>
            <Badge className={`whitespace-nowrap border ${getStatusColor(competition.status)}`}>
              {getStatusLabel(competition.status)}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-2 py-2">
            {competition.competition_date && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{format(new Date(competition.competition_date), 'MMM dd, yyyy')}</span>
              </div>
            )}
            {competition.location && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{competition.location}</span>
              </div>
            )}
            {competition.max_participants && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Users className="w-4 h-4 text-gray-500" />
                <span>Max {competition.max_participants} participants</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <Button
              onClick={() => setIsAddStudentsOpen(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              size="sm"
            >
              <UserPlus className="w-4 h-4" />
              Add Students
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Add Students Modal */}
      <AddStudentsModal
        competitionId={competition.id}
        competitionName={competition.name}
        events={competition.events || []}
        isOpen={isAddStudentsOpen}
        onClose={() => setIsAddStudentsOpen(false)}
      />
    </>
  )
}
