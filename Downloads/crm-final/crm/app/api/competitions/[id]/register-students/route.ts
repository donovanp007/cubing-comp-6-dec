import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RegisterStudentsRequest {
  studentIds: string[]
  eventIds: string[]
}

/**
 * POST /api/competitions/[id]/register-students
 * Register multiple students to a competition and its events
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id: competitionId } = await params
    const body: RegisterStudentsRequest = await request.json()

    // Validate request
    if (!body.studentIds || !Array.isArray(body.studentIds) || body.studentIds.length === 0) {
      return NextResponse.json(
        { error: 'studentIds must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!body.eventIds || !Array.isArray(body.eventIds) || body.eventIds.length === 0) {
      return NextResponse.json(
        { error: 'eventIds must be a non-empty array' },
        { status: 400 }
      )
    }

    // Verify competition exists
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('id, name, max_participants')
      .eq('id', competitionId)
      .single()

    if (compError || !competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      )
    }

    // Verify all students exist
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id')
      .in('id', body.studentIds)

    if (studentError || !students || students.length !== body.studentIds.length) {
      return NextResponse.json(
        { error: 'One or more students not found' },
        { status: 404 }
      )
    }

    // Verify all events exist and belong to this competition
    const { data: compEvents, error: eventError } = await supabase
      .from('competition_events')
      .select('id')
      .eq('competition_id', competitionId)
      .in('id', body.eventIds)

    if (eventError || !compEvents || compEvents.length !== body.eventIds.length) {
      return NextResponse.json(
        { error: 'One or more events not found or do not belong to this competition' },
        { status: 404 }
      )
    }

    // Check current registration count
    const { count: currentCount } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('competition_id', competitionId)

    const newCount = (currentCount || 0) + body.studentIds.length
    if (competition.max_participants && newCount > competition.max_participants) {
      return NextResponse.json(
        {
          error: `Registration would exceed maximum participants (${competition.max_participants})`,
          current: currentCount || 0,
          requested: body.studentIds.length,
          max: competition.max_participants,
        },
        { status: 400 }
      )
    }

    // Register each student
    const registrationResults = []
    const errors = []

    for (const studentId of body.studentIds) {
      try {
        // Create registration
        const { data: registration, error: regError } = await supabase
          .from('registrations')
          .insert({
            competition_id: competitionId,
            student_id: studentId,
            status: 'registered',
          })
          .select()
          .single()

        if (regError) {
          errors.push({ studentId, error: regError.message })
          continue
        }

        // Register for each event
        for (const eventId of body.eventIds) {
          const { error: eventRegError } = await supabase
            .from('event_registrations')
            .insert({
              registration_id: registration.id,
              competition_event_id: eventId,
              status: 'registered',
            })

          if (eventRegError) {
            errors.push({
              studentId,
              eventId,
              error: `Event registration failed: ${eventRegError.message}`,
            })
          }
        }

        registrationResults.push({
          studentId,
          registrationId: registration.id,
          status: 'success',
        })
      } catch (error) {
        errors.push({
          studentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Return results
    const success = registrationResults.length > 0
    return NextResponse.json(
      {
        message: `Successfully registered ${registrationResults.length} student(s)`,
        registered: registrationResults.length,
        failed: errors.length,
        results: registrationResults,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: success ? 200 : 400 }
    )
  } catch (error) {
    console.error('Error registering students:', error)
    return NextResponse.json(
      { error: 'Failed to register students' },
      { status: 500 }
    )
  }
}
