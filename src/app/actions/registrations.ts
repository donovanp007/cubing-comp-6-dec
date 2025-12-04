'use server';

import { createClient } from '@/lib/supabase/server';

export interface StudentRegistration {
  studentId: string;
  eventIds: string[];
}

export interface RegistrationResult {
  studentId: string;
  name: string;
  success: boolean;
  error?: string;
}

export interface BulkRegistrationResult {
  successful: RegistrationResult[];
  failed: RegistrationResult[];
  totalAttempted: number;
}

/**
 * Bulk register multiple students for a competition with their selected events
 * Processes each student individually with rollback on failure
 */
export async function bulkRegisterStudents(
  competitionId: string,
  registrations: StudentRegistration[],
  studentNames: Record<string, string>
): Promise<BulkRegistrationResult> {
  const supabase = await createClient();
  const successful: RegistrationResult[] = [];
  const failed: RegistrationResult[] = [];

  for (const reg of registrations) {
    try {
      // Validate at least one event is selected
      if (!reg.eventIds || reg.eventIds.length === 0) {
        failed.push({
          studentId: reg.studentId,
          name: studentNames[reg.studentId] || `Student ${reg.studentId.slice(0, 4)}`,
          success: false,
          error: 'No events selected',
        });
        continue;
      }

      // Check if student is already registered for this competition
      const { data: existingReg, error: checkError } = await supabase
        .from('registrations')
        .select('id')
        .eq('competition_id', competitionId)
        .eq('student_id', reg.studentId)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Failed to check existing registration: ${checkError.message}`);
      }

      if (existingReg) {
        failed.push({
          studentId: reg.studentId,
          name: studentNames[reg.studentId] || `Student ${reg.studentId.slice(0, 4)}`,
          success: false,
          error: 'Already registered for this competition',
        });
        continue;
      }

      // Create registration
      const { data: registration, error: regError } = await supabase
        .from('registrations')
        .insert({
          competition_id: competitionId,
          student_id: reg.studentId,
          status: 'confirmed',
          registration_date: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (regError) {
        throw new Error(`Failed to create registration: ${regError.message}`);
      }

      if (!registration) {
        throw new Error('No registration ID returned');
      }

      // Create event enrollments
      const enrollments = reg.eventIds.map((eventId) => ({
        registration_id: registration.id,
        competition_event_id: eventId,
        student_id: reg.studentId,
        status: 'confirmed',
      }));

      const { error: enrollError } = await supabase
        .from('event_enrollments')
        .insert(enrollments);

      if (enrollError) {
        // Rollback: delete the registration
        await supabase
          .from('registrations')
          .delete()
          .eq('id', registration.id);

        throw new Error(`Failed to create event enrollments: ${enrollError.message}`);
      }

      successful.push({
        studentId: reg.studentId,
        name: studentNames[reg.studentId] || `Student ${reg.studentId.slice(0, 4)}`,
        success: true,
      });
    } catch (error) {
      failed.push({
        studentId: reg.studentId,
        name: studentNames[reg.studentId] || `Student ${reg.studentId.slice(0, 4)}`,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  return {
    successful,
    failed,
    totalAttempted: registrations.length,
  };
}

/**
 * Bulk deregister students from a competition
 */
export async function bulkDeregisterStudents(
  competitionId: string,
  studentIds: string[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const supabase = await createClient();

    // Get registration IDs for these students
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('id')
      .eq('competition_id', competitionId)
      .in('student_id', studentIds);

    if (regError) {
      throw new Error(`Failed to fetch registrations: ${regError.message}`);
    }

    if (!registrations || registrations.length === 0) {
      return { success: true, count: 0 };
    }

    const registrationIds = registrations.map((r) => r.id);

    // Delete event enrollments first (due to FK constraint)
    const { error: enrollDeleteError } = await supabase
      .from('event_enrollments')
      .delete()
      .in('registration_id', registrationIds);

    if (enrollDeleteError) {
      throw new Error(`Failed to delete event enrollments: ${enrollDeleteError.message}`);
    }

    // Delete registrations
    const { error: regDeleteError } = await supabase
      .from('registrations')
      .delete()
      .eq('competition_id', competitionId)
      .in('student_id', studentIds);

    if (regDeleteError) {
      throw new Error(`Failed to delete registrations: ${regDeleteError.message}`);
    }

    return { success: true, count: registrations.length };
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Update events for a registered student
 */
export async function updateStudentEvents(
  registrationId: string,
  studentId: string,
  eventIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Delete existing enrollments
    const { error: deleteError } = await supabase
      .from('event_enrollments')
      .delete()
      .eq('registration_id', registrationId);

    if (deleteError) {
      throw new Error(`Failed to delete existing enrollments: ${deleteError.message}`);
    }

    // Insert new enrollments if events are provided
    if (eventIds && eventIds.length > 0) {
      const enrollments = eventIds.map((eventId) => ({
        registration_id: registrationId,
        competition_event_id: eventId,
        student_id: studentId,
        status: 'confirmed',
      }));

      const { error: insertError } = await supabase
        .from('event_enrollments')
        .insert(enrollments);

      if (insertError) {
        throw new Error(`Failed to create enrollments: ${insertError.message}`);
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
