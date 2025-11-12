'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StudentRegistrationFlow } from './StudentRegistrationFlow'

interface Event {
  id: string
  name: string
  displayName: string
}

interface AddStudentsModalProps {
  competitionId: string
  competitionName: string
  events: Event[]
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddStudentsModal({
  competitionId,
  competitionName,
  events,
  isOpen,
  onClose,
  onSuccess,
}: AddStudentsModalProps) {
  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Add Students to "{competitionName}"</DialogTitle>
        </DialogHeader>

        <StudentRegistrationFlow
          competitionId={competitionId}
          events={events}
          onComplete={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
