'use client'

import { Calendar } from 'lucide-react'
import { CompetitionCard } from './CompetitionCard'
import type { CompetitionListItem } from '@/lib/types/competition.types'

interface CompetitionListProps {
  competitions: CompetitionListItem[]
  onDelete?: (competitionId: string) => Promise<void>
}

export function CompetitionList({ competitions, onDelete }: CompetitionListProps) {
  if (competitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg text-gray-600 mb-2">No competitions found</p>
        <p className="text-sm text-gray-500">
          Create your first competition to get started
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {competitions.map((competition) => (
        <CompetitionCard
          key={competition.id}
          competition={competition}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
