'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronRight, Search, Users, CheckCircle2, AlertCircle } from 'lucide-react'

interface Student {
  id: string
  first_name: string
  last_name: string
  school: string
  grade: string
  email: string
  guardian_email: string
}

interface Event {
  id: string
  name: string
  displayName: string
}

interface StudentRegistrationFlowProps {
  competitionId: string
  events: Event[]
  onComplete?: (registrations: any[]) => void
}

type Step = 'search' | 'select-students' | 'select-events' | 'review' | 'confirm'

export function StudentRegistrationFlow({
  competitionId,
  events,
  onComplete,
}: StudentRegistrationFlowProps) {
  const [step, setStep] = useState<Step>('search')
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set(events.map(e => e.id)))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [schoolFilter, setSchoolFilter] = useState<string>('')

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [searchQuery, schoolFilter, students])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/students')
      if (!response.ok) throw new Error('Failed to fetch students')
      const data = await response.json()
      setStudents(data.students || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    if (searchQuery) {
      filtered = filtered.filter(s =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (schoolFilter) {
      filtered = filtered.filter(s => s.school === schoolFilter)
    }

    setFilteredStudents(filtered)
  }

  const handleSelectStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedStudents(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)))
    }
  }

  const handleSelectEvent = (eventId: string) => {
    const newSelected = new Set(selectedEvents)
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId)
    } else {
      newSelected.add(eventId)
    }
    setSelectedEvents(newSelected)
  }

  const handleSelectAllEvents = () => {
    if (selectedEvents.size === events.length) {
      setSelectedEvents(new Set())
    } else {
      setSelectedEvents(new Set(events.map(e => e.id)))
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const payload = {
        studentIds: Array.from(selectedStudents),
        eventIds: Array.from(selectedEvents),
      }

      const response = await fetch(`/api/competitions/${competitionId}/register-students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to register students')
      }

      const result = await response.json()
      setStep('confirm')
      onComplete?.(result.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register students')
    } finally {
      setSubmitting(false)
    }
  }

  const uniqueSchools = Array.from(new Set(students.map(s => s.school))).sort()
  const selectedStudentsList = students.filter(s => selectedStudents.has(s.id))
  const selectedEventsList = events.filter(e => selectedEvents.has(e.id))

  // Step 1: Search Students
  if (step === 'search') {
    return (
      <Card className="w-full bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Step 1: Find Students
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Search and filter students to register
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Search by Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Type student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* School Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Filter by School (Optional)
            </label>
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Schools</option>
              {uniqueSchools.map(school => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>

          {/* Results */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              Found <strong>{filteredStudents.length}</strong> student{filteredStudents.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setStep('select-students')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={filteredStudents.length === 0}
            >
              Continue to Selection
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Step 2: Select Students
  if (step === 'select-students') {
    return (
      <Card className="w-full bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Step 2: Select Students
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Choose which students will participate
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Select All */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Checkbox
              checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
              onCheckedChange={handleSelectAll}
              id="select-all-students"
            />
            <label htmlFor="select-all-students" className="flex-1 cursor-pointer">
              <div className="font-semibold text-gray-900">
                Select All ({selectedStudents.size}/{filteredStudents.length})
              </div>
              <div className="text-xs text-gray-600">Click to toggle all visible students</div>
            </label>
          </div>

          {/* Students List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                No students found. Try adjusting your search.
              </div>
            ) : (
              filteredStudents.map(student => (
                <div
                  key={student.id}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${
                    selectedStudents.has(student.id)
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectStudent(student.id)}
                >
                  <Checkbox
                    checked={selectedStudents.has(student.id)}
                    onCheckedChange={() => handleSelectStudent(student.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {student.first_name} {student.last_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {student.school} • {student.grade}
                    </div>
                    {student.guardian_email && (
                      <div className="text-xs text-gray-500 mt-1">
                        📧 {student.guardian_email}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep('search')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => setStep('select-events')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={selectedStudents.size === 0}
            >
              Continue ({selectedStudents.size} selected)
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Step 3: Select Events
  if (step === 'select-events') {
    return (
      <Card className="w-full bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏆 Step 3: Select Events
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Choose which events the students will participate in
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Select All Events */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Checkbox
              checked={selectedEvents.size === events.length && events.length > 0}
              onCheckedChange={handleSelectAllEvents}
              id="select-all-events"
            />
            <label htmlFor="select-all-events" className="flex-1 cursor-pointer">
              <div className="font-semibold text-gray-900">
                Select All Events ({selectedEvents.size}/{events.length})
              </div>
              <div className="text-xs text-gray-600">All students will compete in selected events</div>
            </label>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {events.map(event => (
              <div
                key={event.id}
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                  selectedEvents.has(event.id)
                    ? 'bg-purple-50 border-purple-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectEvent(event.id)}
              >
                <Checkbox
                  checked={selectedEvents.has(event.id)}
                  onCheckedChange={() => handleSelectEvent(event.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {event.displayName}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <p className="text-sm text-purple-900">
              💡 All selected students will be registered for the chosen events
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep('select-students')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => setStep('review')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={selectedEvents.size === 0}
            >
              Review Registration
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Step 4: Review
  if (step === 'review') {
    return (
      <Card className="w-full bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✓ Step 4: Review
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Verify your registration before confirming
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {selectedStudents.size}
              </div>
              <div className="text-sm text-blue-900 mt-1">
                Student{selectedStudents.size !== 1 ? 's' : ''} selected
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {selectedEvents.size}
              </div>
              <div className="text-sm text-purple-900 mt-1">
                Event{selectedEvents.size !== 1 ? 's' : ''} selected
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {selectedStudents.size * selectedEvents.size}
              </div>
              <div className="text-sm text-green-900 mt-1">
                Total registration{selectedStudents.size * selectedEvents.size !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Selected Students */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Selected Students</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedStudentsList.map(student => (
                <div key={student.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    {student.first_name} {student.last_name} - {student.school}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Events */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Selected Events</h3>
            <div className="space-y-2">
              {selectedEventsList.map(event => (
                <div key={event.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    {event.displayName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep('select-events')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? 'Registering...' : 'Confirm & Register'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Step 5: Confirmation
  if (step === 'confirm') {
    return (
      <Card className="w-full bg-white">
        <CardContent className="p-12 text-center">
          <div className="mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ✓ Registration Complete!
          </h2>
          <p className="text-gray-600 mb-8">
            Successfully registered <strong>{selectedStudents.size}</strong> student{selectedStudents.size !== 1 ? 's' : ''} for <strong>{selectedEvents.size}</strong> event{selectedEvents.size !== 1 ? 's' : ''}
          </p>

          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-8">
            <p className="text-sm text-green-900">
              📧 Confirmation emails have been sent to all guardians
            </p>
          </div>

          <Button
            onClick={() => window.location.href = '/dashboard/competitions'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            Back to Competitions
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}
