'use client';

import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle2, Grid3x3 } from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade: number;
}

interface CompetitionEvent {
  id: string;
  display_name: string;
}

interface StudentEventMatrixProps {
  students: Student[];
  events: CompetitionEvent[];
  studentEventMap: Map<string, Set<string>>;
  onEventToggle: (studentId: string, eventId: string) => void;
  onAssignAllToStudent: (studentId: string, allEvents: boolean) => void;
  onAssignAllStudentsToEvent: (eventId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function StudentEventMatrix({
  students,
  events,
  studentEventMap,
  onEventToggle,
  onAssignAllToStudent,
  onAssignAllStudentsToEvent,
  onPrevious,
  onNext,
  isLoading = false,
}: StudentEventMatrixProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    let totalAssignments = 0;
    let studentsWithEvents = 0;

    for (const studentId of Array.from(studentEventMap.keys())) {
      const eventCount = studentEventMap.get(studentId)?.size || 0;
      totalAssignments += eventCount;
      if (eventCount > 0) {
        studentsWithEvents++;
      }
    }

    return {
      totalAssignments,
      studentsWithEvents,
      avgEventsPerStudent: students.length > 0
        ? (totalAssignments / students.length).toFixed(1)
        : 0,
    };
  }, [studentEventMap, students.length]);

  // Check if all students have at least one event
  const allStudentsHaveEvents = students.every(
    (s) => (studentEventMap.get(s.id)?.size || 0) > 0
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalAssignments}</div>
              <div className="text-sm text-gray-600">Total Assignments</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.studentsWithEvents}</div>
              <div className="text-sm text-gray-600">Students with Events</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.avgEventsPerStudent}</div>
              <div className="text-sm text-gray-600">Avg Events/Student</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Message */}
      {!allStudentsHaveEvents && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Some students have no events</p>
            <p className="text-sm text-amber-700 mt-1">
              Make sure each student is assigned at least one event before proceeding.
            </p>
          </div>
        </div>
      )}

      {/* Event Assignment Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            Assign Events to Students
          </CardTitle>
          <CardDescription>
            Each row is a student, each column is an event. Click to toggle assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No events configured for this competition</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No students selected</p>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48 sticky left-0 bg-gray-50 border-r">
                      Student
                    </TableHead>
                    {events.map((event) => (
                      <TableHead
                        key={event.id}
                        className="h-24 px-2 text-center border-r last:border-r-0"
                      >
                        <div className="flex flex-col items-center gap-2 h-full justify-end pb-2">
                          <div
                            className="text-sm font-medium text-gray-700 leading-tight text-center"
                            style={{ maxWidth: '80px' }}
                          >
                            {event.display_name}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAssignAllStudentsToEvent(event.id)}
                            className="text-xs h-6 w-full"
                          >
                            All
                          </Button>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="w-32 sticky right-0 bg-gray-50 border-l text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const studentEvents = studentEventMap.get(student.id) || new Set();
                    const eventCount = studentEvents.size;

                    return (
                      <TableRow key={student.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium sticky left-0 bg-white border-r">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs text-gray-500">Grade {student.grade}</p>
                          </div>
                        </TableCell>
                        {events.map((event) => (
                          <TableCell
                            key={`${student.id}-${event.id}`}
                            className="text-center border-r last:border-r-0 p-2"
                          >
                            <button
                              onClick={() => onEventToggle(student.id, event.id)}
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                                studentEvents.has(event.id)
                                  ? 'border-blue-500 bg-blue-100'
                                  : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                              }`}
                            >
                              {studentEvents.has(event.id) && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </button>
                          </TableCell>
                        ))}
                        <TableCell className="text-center sticky right-0 bg-white border-l">
                          <div className="flex items-center justify-center gap-2">
                            <Badge
                              variant={eventCount > 0 ? 'default' : 'secondary'}
                              className={eventCount > 0 ? 'bg-green-600' : ''}
                            >
                              {eventCount}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onAssignAllToStudent(student.id, true)}
                              className="text-xs h-6"
                              title="Assign all events"
                            >
                              All
                            </Button>
                            {eventCount > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onAssignAllToStudent(student.id, false)}
                                className="text-xs h-6 text-red-600 hover:text-red-700"
                                title="Clear all events"
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex-1 h-12"
        >
          ← Previous: Select Students
        </Button>
        <Button
          onClick={onNext}
          disabled={!allStudentsHaveEvents || isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-lg"
        >
          {isLoading ? 'Loading...' : 'Next: Review & Submit →'}
        </Button>
      </div>
    </div>
  );
}
