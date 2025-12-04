'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, AlertCircle } from 'lucide-react';

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

interface RegistrationSummaryProps {
  students: Student[];
  events: CompetitionEvent[];
  studentEventMap: Map<string, Set<string>>;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function RegistrationSummary({
  students,
  events,
  studentEventMap,
  onPrevious,
  onSubmit,
  isSubmitting = false,
}: RegistrationSummaryProps) {
  // Calculate summary statistics
  const summary = useMemo(() => {
    let totalEvents = 0;
    let minEvents = Infinity;
    let maxEvents = 0;

    for (const student of students) {
      const count = studentEventMap.get(student.id)?.size || 0;
      totalEvents += count;
      minEvents = Math.min(minEvents, count);
      maxEvents = Math.max(maxEvents, count);
    }

    return {
      totalStudents: students.length,
      totalEvents,
      avgEvents: students.length > 0 ? (totalEvents / students.length).toFixed(1) : 0,
      minEvents: minEvents === Infinity ? 0 : minEvents,
      maxEvents,
    };
  }, [students, studentEventMap]);

  // Create event map for quick lookup
  const eventMap = useMemo(
    () => new Map(events.map((e) => [e.id, e.display_name])),
    [events]
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Assignments</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.avgEvents}</div>
              <div className="text-sm text-gray-600">Avg per Student</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {summary.minEvents}-{summary.maxEvents}
              </div>
              <div className="text-sm text-gray-600">Range</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Review Registrations
          </CardTitle>
          <CardDescription>
            Review the registrations below. Click "Register All" to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="sticky top-0 bg-gray-50">
                  <TableHead>Student</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Events</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const eventIds = studentEventMap.get(student.id) || new Set();
                  const eventNames = Array.from(eventIds)
                    .map((id) => eventMap.get(id))
                    .filter(Boolean);

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="text-sm font-semibold">
                            {student.first_name} {student.last_name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Grade {student.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {eventNames.map((name) => (
                            <Badge key={name} className="bg-blue-100 text-blue-800">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Confirmation Message */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Ready to register</p>
              <p className="text-sm text-blue-700 mt-1">
                {summary.totalStudents} student{summary.totalStudents !== 1 ? 's' : ''} will be
                registered for a total of {summary.totalEvents} event
                {summary.totalEvents !== 1 ? 's' : ''}. You can modify these assignments later.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="flex-1 h-12"
        >
          ← Previous: Assign Events
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || summary.totalStudents === 0}
          className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-lg"
        >
          {isSubmitting ? 'Registering...' : `Register All Students →`}
        </Button>
      </div>
    </div>
  );
}
