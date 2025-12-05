'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BulkStudentSelector } from '@/components/competitions/bulk-student-selector';
import { StudentEventMatrix } from '@/components/competitions/student-event-matrix';
import { RegistrationSummary } from '@/components/competitions/registration-summary';
import { bulkRegisterStudents } from '@/app/actions/registrations';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

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

interface RegistrationItem {
  studentId: string;
  name: string;
  success: boolean;
  error?: string;
}

type Step = 'select' | 'assign' | 'review' | 'processing' | 'complete';

export default function BulkRegisterPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('select');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [events, setEvents] = useState<CompetitionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Wizard state
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [studentEventMap, setStudentEventMap] = useState<Map<string, Set<string>>>(new Map());

  // Results state
  const [results, setResults] = useState<{
    successful: RegistrationItem[];
    failed: RegistrationItem[];
    total: number;
  } | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchData();
  }, [competitionId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get all students
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, first_name, last_name, grade')
        .eq('status', 'active')
        .order('last_name');

      // Get already registered students
      const { data: registeredData } = await supabase
        .from('registrations')
        .select('student_id')
        .eq('competition_id', competitionId);

      const registeredIds = new Set(registeredData?.map((r: any) => r.student_id) || []);
      const available = (studentsData || []).filter((s: any) => !registeredIds.has(s.id));

      setAllStudents(available);

      // Get competition events
      const { data: eventData } = await supabase
        .from('competition_events')
        .select('id, event_type_id, event_types(display_name)')
        .eq('competition_id', competitionId);

      const mappedEvents: CompetitionEvent[] = (eventData || []).map((e: any) => ({
        id: e.id,
        display_name: e.event_types?.display_name || `Event ${e.id.slice(0, 4)}`,
      }));

      setEvents(mappedEvents);

      if (mappedEvents.length === 0) {
        toast({
          title: 'No events configured',
          description: 'Please configure events for this competition first',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students or events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize student event map when students are selected
  useEffect(() => {
    const selectedStudents = allStudents.filter((s) => selectedStudentIds.has(s.id));
    const newMap = new Map<string, Set<string>>();

    selectedStudents.forEach((student) => {
      if (!studentEventMap.has(student.id)) {
        newMap.set(student.id, new Set());
      } else {
        newMap.set(student.id, studentEventMap.get(student.id)!);
      }
    });

    setStudentEventMap(newMap);
  }, [selectedStudentIds]);

  const toggleEvent = (studentId: string, eventId: string) => {
    const newMap = new Map(studentEventMap);
    const studentEvents = newMap.get(studentId) || new Set();

    if (studentEvents.has(eventId)) {
      studentEvents.delete(eventId);
    } else {
      studentEvents.add(eventId);
    }

    newMap.set(studentId, studentEvents);
    setStudentEventMap(newMap);
  };

  const assignAllToStudent = (studentId: string, assign: boolean) => {
    const newMap = new Map(studentEventMap);

    if (assign) {
      newMap.set(studentId, new Set(events.map((e) => e.id)));
    } else {
      newMap.set(studentId, new Set());
    }

    setStudentEventMap(newMap);
  };

  const assignAllStudentsToEvent = (eventId: string) => {
    const newMap = new Map(studentEventMap);
    const selectedStudents = Array.from(selectedStudentIds);

    selectedStudents.forEach((studentId) => {
      const studentEvents = newMap.get(studentId) || new Set();

      if (studentEvents.has(eventId)) {
        studentEvents.delete(eventId);
      } else {
        studentEvents.add(eventId);
      }

      newMap.set(studentId, studentEvents);
    });

    setStudentEventMap(newMap);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setStep('processing');
      setProgress(0);

      const selectedStudents = allStudents.filter((s) => selectedStudentIds.has(s.id));
      const registrations = selectedStudents.map((student) => ({
        studentId: student.id,
        eventIds: Array.from(studentEventMap.get(student.id) || new Set()) as string[],
      }));

      const studentNames = Object.fromEntries(
        selectedStudents.map((s) => [s.id, `${s.first_name} ${s.last_name}`])
      );

      const response = await bulkRegisterStudents(competitionId, registrations, studentNames);

      // Simulate progress for better UX
      setProgress(100);

      setResults({
        successful: response.successful,
        failed: response.failed,
        total: response.totalAttempted,
      });

      setStep('complete');
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to register students',
        variant: 'destructive',
      });
      setStep('review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const selectedStudentList = allStudents.filter((s) => selectedStudentIds.has(s.id));
  const successCount = results?.successful.length || 0;
  const failCount = results?.failed.length || 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/competitions/${competitionId}`}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Competition
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Register Students</h1>
        <p className="text-gray-500 mt-2">Quickly add multiple students and assign them to events</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                ['select', 'assign', 'review', 'processing', 'complete'].indexOf(step) >= 0
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}
            >
              1
            </div>
            <span
              className={`text-sm font-medium ${
                ['select', 'assign', 'review', 'processing', 'complete'].indexOf(step) >= 0
                  ? 'text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              Select Students
            </span>
          </div>

          <div
            className={`flex-1 h-1 mx-2 ${
              ['assign', 'review', 'processing', 'complete'].indexOf(step) >= 0
                ? 'bg-blue-600'
                : 'bg-gray-300'
            }`}
          />

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                ['assign', 'review', 'processing', 'complete'].indexOf(step) >= 0
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}
            >
              2
            </div>
            <span
              className={`text-sm font-medium ${
                ['assign', 'review', 'processing', 'complete'].indexOf(step) >= 0
                  ? 'text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              Assign Events
            </span>
          </div>

          <div
            className={`flex-1 h-1 mx-2 ${
              ['review', 'processing', 'complete'].indexOf(step) >= 0 ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                ['review', 'processing', 'complete'].indexOf(step) >= 0
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}
            >
              3
            </div>
            <span
              className={`text-sm font-medium ${
                ['review', 'processing', 'complete'].indexOf(step) >= 0
                  ? 'text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              Review & Submit
            </span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl">
        {/* Step 1: Select Students */}
        {step === 'select' && (
          <BulkStudentSelector
            students={allStudents}
            selectedIds={selectedStudentIds}
            onSelectionChange={setSelectedStudentIds}
            onNext={() => setStep('assign')}
          />
        )}

        {/* Step 2: Assign Events */}
        {step === 'assign' && (
          <StudentEventMatrix
            students={selectedStudentList}
            events={events}
            studentEventMap={studentEventMap}
            onEventToggle={toggleEvent}
            onAssignAllToStudent={assignAllToStudent}
            onAssignAllStudentsToEvent={assignAllStudentsToEvent}
            onPrevious={() => setStep('select')}
            onNext={() => setStep('review')}
          />
        )}

        {/* Step 3: Review & Submit */}
        {step === 'review' && (
          <RegistrationSummary
            students={selectedStudentList}
            events={events}
            studentEventMap={studentEventMap}
            onPrevious={() => setStep('assign')}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6">
                <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Registering students...</h2>
                  <p className="text-gray-600">This may take a moment</p>
                </div>
                <Progress value={progress} className="w-full h-2" />
                <p className="text-sm text-gray-500">{progress}%</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {step === 'complete' && results && (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Registration Complete</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{successCount}</div>
                    <div className="text-sm text-green-700">Successful</div>
                  </div>
                  {failCount > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{failCount}</div>
                      <div className="text-sm text-red-700">Failed</div>
                    </div>
                  )}
                </div>

                {results.failed.length > 0 && (
                  <div className="text-left bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-red-900 mb-2">Failed Registrations</h3>
                        <ul className="text-sm text-red-700 space-y-1">
                          {results.failed.slice(0, 5).map((item) => (
                            <li key={item.studentId}>
                              • {item.name}: {item.error}
                            </li>
                          ))}
                        </ul>
                        {results.failed.length > 5 && (
                          <p className="text-sm text-red-700 mt-2">
                            ...and {results.failed.length - 5} more
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => router.push(`/dashboard/competitions/${competitionId}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                  >
                    Back to Competition
                  </Button>
                  {failCount > 0 && (
                    <Button
                      onClick={() => {
                        setStep('select');
                        setSelectedStudentIds(
                          new Set(results.failed.map((r) => r.studentId))
                        );
                      }}
                      variant="outline"
                      className="flex-1 h-12 text-lg"
                    >
                      Retry Failed
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
