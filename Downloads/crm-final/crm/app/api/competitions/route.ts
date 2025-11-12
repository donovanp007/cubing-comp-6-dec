import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { competitionSchema } from '@/lib/utils/validation'
import type { CompetitionSearchParams } from '@/lib/types/competition.types'

/**
 * GET /api/competitions
 * List competitions with search and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const params: CompetitionSearchParams = {
      query: searchParams.get('query') || undefined,
      status: (searchParams.get('status') as CompetitionSearchParams['status']) || undefined,
      leagueId: searchParams.get('leagueId') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: (searchParams.get('sortBy') as CompetitionSearchParams['sortBy']) || 'date',
      sortOrder: (searchParams.get('sortOrder') as CompetitionSearchParams['sortOrder']) || 'desc',
    }

    // Build query
    let query = supabase
      .from('competitions')
      .select(
        `
        id,
        name,
        location,
        competition_date,
        competition_time,
        status,
        is_public,
        league:leagues(name),
        registrations:registrations(count),
        events:competition_events(id, event_type:event_types(id, name, display_name)),
        competition_events(count)
      `,
        { count: 'exact' }
      )

    // Apply filters
    if (params.query) {
      query = query.or(`name.ilike.%${params.query}%,location.ilike.%${params.query}%`)
    }

    if (params.status) {
      query = query.eq('status', params.status)
    }

    if (params.leagueId) {
      query = query.eq('league_id', params.leagueId)
    }

    if (params.dateFrom) {
      query = query.gte('competition_date', params.dateFrom)
    }

    if (params.dateTo) {
      query = query.lte('competition_date', params.dateTo)
    }

    // Apply sorting
    const sortColumn = params.sortBy === 'date' ? 'competition_date' : params.sortBy
    query = query.order(sortColumn, { ascending: params.sortOrder === 'asc' })

    // Apply pagination
    const from = ((params.page || 1) - 1) * (params.limit || 20)
    const to = from + (params.limit || 20) - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format response
    const competitions = data?.map((comp: any) => ({
      id: comp.id,
      name: comp.name,
      location: comp.location,
      competition_date: comp.competition_date,
      competition_time: comp.competition_time,
      status: comp.status,
      is_public: comp.is_public,
      league: comp.league,
      registrations_count: comp.registrations[0]?.count || 0,
      events_count: (comp.competition_events && Array.isArray(comp.competition_events) ? comp.competition_events[0]?.count : 0) || 0,
      events: comp.events?.map((evt: any) => ({
        id: evt.id,
        name: evt.event_type?.name,
        displayName: evt.event_type?.display_name,
      })) || [],
    }))

    return NextResponse.json({
      competitions,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count,
        totalPages: Math.ceil((count || 0) / (params.limit || 20)),
      },
    })
  } catch (error) {
    console.error('Error fetching competitions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/competitions
 * Create a new competition
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate input
    const validation = competitionSchema.safeParse(body.competition)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const competitionData = validation.data

    // Insert competition
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .insert({
        name: competitionData.name,
        description: competitionData.description || null,
        location: competitionData.location,
        competition_date: competitionData.competitionDate,
        competition_time: competitionData.competitionTime || null,
        registration_deadline: competitionData.registrationDeadline || null,
        max_participants: competitionData.maxParticipants || null,
        league_id: competitionData.leagueId || null,
        is_public: competitionData.isPublic,
        status: 'upcoming',
      })
      .select()
      .single()

    if (compError) {
      console.error('Error creating competition:', compError)
      return NextResponse.json({ error: compError.message }, { status: 500 })
    }

    // Add events if provided
    if (body.events && Array.isArray(body.events)) {
      for (const event of body.events) {
        const { data: compEvent, error: eventError } = await supabase
          .from('competition_events')
          .insert({
            competition_id: competition.id,
            event_type_id: event.event_type_id,
            scheduled_time: event.scheduled_time || null,
            max_participants: event.max_participants || null,
            total_rounds: event.total_rounds || 1,
          })
          .select()
          .single()

        if (eventError) {
          console.error('Error adding event:', eventError)
          continue
        }

        // Add rounds for this event
        if (event.rounds && Array.isArray(event.rounds)) {
          const rounds = event.rounds.map((round: any) => ({
            competition_event_id: compEvent.id,
            round_number: round.round_number,
            round_name: round.round_name,
            cutoff_percentage: round.cutoff_percentage || null,
            cutoff_count: round.cutoff_count || null,
            advance_automatically: round.advance_automatically || false,
          }))

          await supabase.from('rounds').insert(rounds)
        }
      }
    }

    return NextResponse.json({ competition }, { status: 201 })
  } catch (error) {
    console.error('Error creating competition:', error)
    return NextResponse.json(
      { error: 'Failed to create competition' },
      { status: 500 }
    )
  }
}
