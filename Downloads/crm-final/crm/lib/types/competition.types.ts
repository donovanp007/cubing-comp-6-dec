/**
 * Competition-specific types and interfaces
 */

import type { Database } from './database.types'

export type Competition = Database['public']['Tables']['competitions']['Row']
export type CompetitionInsert = Database['public']['Tables']['competitions']['Insert']
export type CompetitionUpdate = Database['public']['Tables']['competitions']['Update']

export type CompetitionEvent = Database['public']['Tables']['competition_events']['Row']
export type CompetitionEventInsert = Database['public']['Tables']['competition_events']['Insert']

export type Round = Database['public']['Tables']['rounds']['Row']
export type RoundInsert = Database['public']['Tables']['rounds']['Insert']

export type EventType = Database['public']['Tables']['event_types']['Row']
export type EventTypeInsert = Database['public']['Tables']['event_types']['Insert']

export type League = Database['public']['Tables']['leagues']['Row']
export type LeagueInsert = Database['public']['Tables']['leagues']['Insert']

export type Registration = Database['public']['Tables']['registrations']['Row']
export type RegistrationInsert = Database['public']['Tables']['registrations']['Insert']

// Extended competition with relationships
export interface CompetitionWithDetails extends Competition {
  league?: League | null
  events?: Array<CompetitionEvent & {
    event_type: EventType
    rounds: Round[]
  }>
  registrations_count?: number
  status_display?: string
}

// Competition list item (for tables/lists)
export interface CompetitionListItem {
  id: string
  name: string
  location: string
  competition_date: string
  competition_time: string | null
  status: Competition['status']
  is_public: boolean
  registrations_count: number
  events_count: number
  league?: {
    name: string
  } | null
  events?: Array<{
    id: string
    name: string
    displayName: string
  }>
}

// Competition search/filter params
export interface CompetitionSearchParams {
  query?: string
  status?: Competition['status']
  leagueId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  sortBy?: 'date' | 'name' | 'status'
  sortOrder?: 'asc' | 'desc'
}

// Competition dashboard view
export interface CompetitionDashboard {
  competition: Competition
  events: Array<{
    event: CompetitionEvent
    event_type: EventType
    rounds: Round[]
    current_registrations: number
    max_participants: number | null
  }>
  registrations: Array<{
    id: string
    student: {
      first_name: string
      last_name: string
      school: string | null
      grade: string | null
    }
    status: Registration['status']
    events: string[] // event type names
  }>
  statistics: {
    total_registrations: number
    confirmed_registrations: number
    total_events: number
    upcoming_events: number
    in_progress_events: number
    completed_events: number
  }
}

// Event configuration for competition
export interface EventConfiguration {
  event_type_id: string
  scheduled_time?: string
  max_participants?: number
  total_rounds: number
  rounds: RoundConfiguration[]
}

// Round configuration
export interface RoundConfiguration {
  round_number: number
  round_name: string
  cutoff_percentage?: number
  cutoff_count?: number
  advance_automatically: boolean
}

// Live competition view (public)
export interface LiveCompetitionView {
  competition: Competition
  events: Array<{
    event_type: EventType
    current_round: number
    total_rounds: number
    status: CompetitionEvent['status']
    leaderboard: Array<{
      student: {
        first_name: string
        last_name: string
        school: string | null
      }
      ranking: number
      best_time: number | null
      average_time: number | null
      round_name: string
    }>
  }>
}

// Registration form data
export interface RegistrationFormData {
  student_id: string
  event_ids: string[]
  payment_amount?: number
  notes?: string
}

// Competition creation wizard state
export interface CompetitionWizardState {
  step: 'basic' | 'events' | 'rounds' | 'review'
  basic: {
    name: string
    description?: string
    location: string
    competition_date: string
    competition_time?: string
    registration_deadline?: string
    max_participants?: number
    league_id?: string
    is_public: boolean
  }
  events: EventConfiguration[]
  completed: boolean
}
