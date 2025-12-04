'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { RegistrationTable } from '@/components/competitions/registration-table';
import { bulkDeregisterStudents } from '@/app/actions/registrations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Registration {
  id: string;
  student_id: string;
  student_name: string;
  grade: number;
  events: Array<{
    id: string;
    display_name: string;
  }>;
}

interface CompetitionEvent {
  id: string;
  display_name: string;
}

export default function ManageRegistrationsPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<CompetitionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [competitionId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch registrations with joined data
      const { data: registrationsData, error: regError } = await supabase
        .from('registrations')
        .select(`
          id,
          student_id,
          students(first_name, last_name, grade),
          event_enrollments(
            competition_event_id,
            competition_events(id, event_type_id, event_types(display_name))
          )
        `)
        .eq('competition_id', competitionId)
        .order('students(last_name)');

      if (regError) throw regError;

      // Transform data
      const transformed: Registration[] = (registrationsData || []).map((reg: any) => ({
        id: reg.id,
        student_id: reg.student_id,
        student_name: `${reg.students.first_name} ${reg.students.last_name}`,
        grade: reg.students.grade,
        events: (reg.event_enrollments || []).map((ee: any) => ({
          id: ee.competition_event_id,
          display_name: ee.competition_events?.event_types?.display_name || 'Unknown Event',
        })),
      }));

      setRegistrations(transformed);

      // Fetch competition events
      const { data: eventsData, error: evError } = await supabase
        .from('competition_events')
        .select('id, event_type_id, event_types(display_name)')
        .eq('competition_id', competitionId);

      if (evError) throw evError;

      const mappedEvents: CompetitionEvent[] = (eventsData || []).map((e: any) => ({
        id: e.id,
        display_name: e.event_types?.display_name || `Event ${e.id.slice(0, 4)}`,
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load registrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeregister = async (registrationIds: string[]) => {
    try {
      setDeleting(true);

      // Get student IDs from registrations
      const studentIds = registrations
        .filter((r) => registrationIds.includes(r.id))
        .map((r) => r.student_id);

      const result = await bulkDeregisterStudents(competitionId, studentIds);

      if (result.success) {
        toast({
          title: 'Success',
          description: `Removed ${result.count} student${result.count !== 1 ? 's' : ''}`,
        });

        // Refresh data
        await fetchData();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to deregister students',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Deregister error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to deregister students',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Manage Registrations</h1>
        <p className="text-gray-500 mt-2">View and edit all student registrations</p>
      </div>

      {/* Table */}
      <RegistrationTable
        registrations={registrations}
        events={events}
        onDeregister={handleDeregister}
        isDeleting={deleting}
      />
    </div>
  );
}
