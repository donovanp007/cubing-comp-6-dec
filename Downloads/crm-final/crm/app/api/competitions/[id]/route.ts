import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { competitionSchema } from '@/lib/utils/validation'

/**
 * GET /api/competitions/[id]
 * Get a single competition with all details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get competition with related data
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select(
        `
        *,
        league:leagues(*),
        events:competition_events(
          *,
          event_type:event_types(*),
          rounds:rounds(*)
        ),
        registrations:registrations(
          *,
          student:students(id, first_name, last_name, school, grade),
          event_registrations:event_registrations(
            *,
            competition_event:competition_events(
              event_type:event_types(name, display_name)
            )
          )
        )
      `
      )
      .eq('id', id)
      .single()

    if (compError) {
      if (compError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Competition not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ error: compError.message }, { status: 500 })
    }

    return NextResponse.json({ competition })
  } catch (error) {
    console.error('Error fetching competition:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competition' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/competitions/[id]
 * Update a competition
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    // Validate input
    const validation = competitionSchema.partial().safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const competitionData = validation.data

    // Check if competition exists
    const { data: existing } = await supabase
      .from('competitions')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      )
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (competitionData.name) updateData.name = competitionData.name
    if (competitionData.description !== undefined)
      updateData.description = competitionData.description || null
    if (competitionData.location) updateData.location = competitionData.location
    if (competitionData.competitionDate)
      updateData.competition_date = competitionData.competitionDate
    if (competitionData.competitionTime !== undefined)
      updateData.competition_time = competitionData.competitionTime || null
    if (competitionData.registrationDeadline !== undefined)
      updateData.registration_deadline =
        competitionData.registrationDeadline || null
    if (competitionData.maxParticipants !== undefined)
      updateData.max_participants = competitionData.maxParticipants || null
    if (competitionData.leagueId !== undefined)
      updateData.league_id = competitionData.leagueId || null
    if (competitionData.isPublic !== undefined)
      updateData.is_public = competitionData.isPublic

    // Update competition
    const { data, error } = await supabase
      .from('competitions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating competition:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ competition: data })
  } catch (error) {
    console.error('Error updating competition:', error)
    return NextResponse.json(
      { error: 'Failed to update competition' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/competitions/[id]
 * Delete a competition
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check if competition exists
    const { data: existing } = await supabase
      .from('competitions')
      .select('id, status')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      )
    }

    // Don't allow deletion if competition is in progress or completed
    if (existing.status === 'in_progress' || existing.status === 'completed') {
      return NextResponse.json(
        {
          error:
            'Cannot delete a competition that is in progress or completed. Consider cancelling it instead.',
        },
        { status: 400 }
      )
    }

    // Check for registrations
    const { count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('competition_id', id)

    if ((count || 0) > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete a competition with existing registrations. Consider cancelling it instead.',
        },
        { status: 400 }
      )
    }

    // Safe to delete (cascades will handle related records)
    const { error } = await supabase.from('competitions').delete().eq('id', id)

    if (error) {
      console.error('Error deleting competition:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Competition deleted successfully' })
  } catch (error) {
    console.error('Error deleting competition:', error)
    return NextResponse.json(
      { error: 'Failed to delete competition' },
      { status: 500 }
    )
  }
}
