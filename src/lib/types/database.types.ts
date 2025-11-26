export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          school: string | null;
          grade: string | null;
          student_class: string | null;
          guardian_name: string | null;
          guardian_phone: string | null;
          guardian_email: string | null;
          profile_image_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          school?: string | null;
          grade?: string | null;
          student_class?: string | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          guardian_email?: string | null;
          profile_image_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          school?: string | null;
          grade?: string | null;
          student_class?: string | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          guardian_email?: string | null;
          profile_image_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_types: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          format: string;
          icon_url: string | null;
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          format?: string;
          icon_url?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          format?: string;
          icon_url?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
      };
      competitions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          location: string;
          competition_date: string;
          competition_time: string | null;
          registration_deadline: string | null;
          max_participants: number | null;
          status: string;
          is_public: boolean;
          created_by: string | null;
          is_live: boolean;
          live_event_id: string | null;
          live_round_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          location: string;
          competition_date: string;
          competition_time?: string | null;
          registration_deadline?: string | null;
          max_participants?: number | null;
          status?: string;
          is_public?: boolean;
          created_by?: string | null;
          is_live?: boolean;
          live_event_id?: string | null;
          live_round_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          location?: string;
          competition_date?: string;
          competition_time?: string | null;
          registration_deadline?: string | null;
          max_participants?: number | null;
          status?: string;
          is_public?: boolean;
          created_by?: string | null;
          is_live?: boolean;
          live_event_id?: string | null;
          live_round_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      competition_events: {
        Row: {
          id: string;
          competition_id: string;
          event_type_id: string;
          scheduled_time: string | null;
          max_participants: number | null;
          status: string;
          current_round: number;
          total_rounds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          competition_id: string;
          event_type_id: string;
          scheduled_time?: string | null;
          max_participants?: number | null;
          status?: string;
          current_round?: number;
          total_rounds?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          competition_id?: string;
          event_type_id?: string;
          scheduled_time?: string | null;
          max_participants?: number | null;
          status?: string;
          current_round?: number;
          total_rounds?: number;
          created_at?: string;
        };
      };
      rounds: {
        Row: {
          id: string;
          competition_event_id: string;
          round_number: number;
          round_name: string;
          cutoff_percentage: number | null;
          cutoff_count: number | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          competition_event_id: string;
          round_number: number;
          round_name: string;
          cutoff_percentage?: number | null;
          cutoff_count?: number | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          competition_event_id?: string;
          round_number?: number;
          round_name?: string;
          cutoff_percentage?: number | null;
          cutoff_count?: number | null;
          status?: string;
          created_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          competition_id: string;
          student_id: string;
          registration_date: string;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          competition_id: string;
          student_id: string;
          registration_date?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          competition_id?: string;
          student_id?: string;
          registration_date?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      results: {
        Row: {
          id: string;
          round_id: string;
          student_id: string;
          attempt_number: number;
          time_milliseconds: number | null;
          is_dnf: boolean;
          is_dns: boolean;
          penalty_seconds: number;
          scramble: string | null;
          recorded_at: string;
          recorded_by: string | null;
        };
        Insert: {
          id?: string;
          round_id: string;
          student_id: string;
          attempt_number: number;
          time_milliseconds?: number | null;
          is_dnf?: boolean;
          is_dns?: boolean;
          penalty_seconds?: number;
          scramble?: string | null;
          recorded_at?: string;
          recorded_by?: string | null;
        };
        Update: {
          id?: string;
          round_id?: string;
          student_id?: string;
          attempt_number?: number;
          time_milliseconds?: number | null;
          is_dnf?: boolean;
          is_dns?: boolean;
          penalty_seconds?: number;
          scramble?: string | null;
          recorded_at?: string;
          recorded_by?: string | null;
        };
      };
      final_scores: {
        Row: {
          id: string;
          round_id: string;
          student_id: string;
          best_time_milliseconds: number | null;
          average_time_milliseconds: number | null;
          final_ranking: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          round_id: string;
          student_id: string;
          best_time_milliseconds?: number | null;
          average_time_milliseconds?: number | null;
          final_ranking?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          round_id?: string;
          student_id?: string;
          best_time_milliseconds?: number | null;
          average_time_milliseconds?: number | null;
          final_ranking?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      personal_bests: {
        Row: {
          id: string;
          student_id: string;
          event_type_id: string;
          best_single_milliseconds: number | null;
          best_single_competition_id: string | null;
          best_single_date: string | null;
          best_average_milliseconds: number | null;
          best_average_competition_id: string | null;
          best_average_date: string | null;
          last_updated: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          event_type_id: string;
          best_single_milliseconds?: number | null;
          best_single_competition_id?: string | null;
          best_single_date?: string | null;
          best_average_milliseconds?: number | null;
          best_average_competition_id?: string | null;
          best_average_date?: string | null;
          last_updated?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          event_type_id?: string;
          best_single_milliseconds?: number | null;
          best_single_competition_id?: string | null;
          best_single_date?: string | null;
          best_average_milliseconds?: number | null;
          best_average_competition_id?: string | null;
          best_average_date?: string | null;
          last_updated?: string;
        };
      };
      weekly_competitions: {
        Row: {
          id: string;
          name: string;
          term: string;
          week_number: number;
          event_type_id: string;
          grade_filter: string[] | null;
          start_date: string;
          end_date: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          term: string;
          week_number: number;
          event_type_id: string;
          grade_filter?: string[] | null;
          start_date: string;
          end_date: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          term?: string;
          week_number?: number;
          event_type_id?: string;
          grade_filter?: string[] | null;
          start_date?: string;
          end_date?: string;
          status?: string;
          created_at?: string;
        };
      };
      weekly_results: {
        Row: {
          id: string;
          weekly_competition_id: string;
          student_id: string;
          attempt_1: number | null;
          attempt_2: number | null;
          attempt_3: number | null;
          attempt_4: number | null;
          attempt_5: number | null;
          dnf_1: boolean;
          dnf_2: boolean;
          dnf_3: boolean;
          dnf_4: boolean;
          dnf_5: boolean;
          best_time: number | null;
          average_time: number | null;
          ranking: number | null;
          is_pb: boolean;
          improvement_percent: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          weekly_competition_id: string;
          student_id: string;
          attempt_1?: number | null;
          attempt_2?: number | null;
          attempt_3?: number | null;
          attempt_4?: number | null;
          attempt_5?: number | null;
          dnf_1?: boolean;
          dnf_2?: boolean;
          dnf_3?: boolean;
          dnf_4?: boolean;
          dnf_5?: boolean;
          best_time?: number | null;
          average_time?: number | null;
          ranking?: number | null;
          is_pb?: boolean;
          improvement_percent?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          weekly_competition_id?: string;
          student_id?: string;
          attempt_1?: number | null;
          attempt_2?: number | null;
          attempt_3?: number | null;
          attempt_4?: number | null;
          attempt_5?: number | null;
          dnf_1?: boolean;
          dnf_2?: boolean;
          dnf_3?: boolean;
          dnf_4?: boolean;
          dnf_5?: boolean;
          best_time?: number | null;
          average_time?: number | null;
          ranking?: number | null;
          is_pb?: boolean;
          improvement_percent?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          requirement_type: string;
          requirement_value: number;
          rarity: string;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          requirement_type: string;
          requirement_value: number;
          rarity?: string;
          points?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          category?: string;
          requirement_type?: string;
          requirement_value?: number;
          rarity?: string;
          points?: number;
          created_at?: string;
        };
      };
      student_achievements: {
        Row: {
          id: string;
          student_id: string;
          badge_id: string;
          earned_at: string;
          weekly_competition_id: string | null;
          competition_id: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          badge_id: string;
          earned_at?: string;
          weekly_competition_id?: string | null;
          competition_id?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          badge_id?: string;
          earned_at?: string;
          weekly_competition_id?: string | null;
          competition_id?: string | null;
        };
      };
      student_streaks: {
        Row: {
          id: string;
          student_id: string;
          streak_type: string;
          current_streak: number;
          best_streak: number;
          last_updated: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          streak_type: string;
          current_streak?: number;
          best_streak?: number;
          last_updated?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          streak_type?: string;
          current_streak?: number;
          best_streak?: number;
          last_updated?: string;
        };
      };
      event_enrollments: {
        Row: {
          id: string;
          registration_id: string;
          competition_event_id: string;
          student_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          competition_event_id: string;
          student_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          registration_id?: string;
          competition_event_id?: string;
          student_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      overall_rankings: {
        Row: {
          id: string;
          competition_id: string;
          event_type_id: string | null;
          student_id: string;
          final_ranking: number;
          best_time_milliseconds: number | null;
          average_time_milliseconds: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          competition_id: string;
          event_type_id?: string | null;
          student_id: string;
          final_ranking: number;
          best_time_milliseconds?: number | null;
          average_time_milliseconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          competition_id?: string;
          event_type_id?: string | null;
          student_id?: string;
          final_ranking?: number;
          best_time_milliseconds?: number | null;
          average_time_milliseconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Student = Database["public"]["Tables"]["students"]["Row"];
export type EventType = Database["public"]["Tables"]["event_types"]["Row"];
export type Competition = Database["public"]["Tables"]["competitions"]["Row"];
export type CompetitionEvent = Database["public"]["Tables"]["competition_events"]["Row"];
export type Round = Database["public"]["Tables"]["rounds"]["Row"];
export type Registration = Database["public"]["Tables"]["registrations"]["Row"];
export type Result = Database["public"]["Tables"]["results"]["Row"];
export type FinalScore = Database["public"]["Tables"]["final_scores"]["Row"];
export type PersonalBest = Database["public"]["Tables"]["personal_bests"]["Row"];
export type WeeklyCompetition = Database["public"]["Tables"]["weekly_competitions"]["Row"];
export type WeeklyResult = Database["public"]["Tables"]["weekly_results"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type StudentAchievement = Database["public"]["Tables"]["student_achievements"]["Row"];
export type StudentStreak = Database["public"]["Tables"]["student_streaks"]["Row"];
export type EventEnrollment = Database["public"]["Tables"]["event_enrollments"]["Row"];
export type OverallRanking = Database["public"]["Tables"]["overall_rankings"]["Row"];
