// Auto-generated database types for AI Medical Scribe Platform
// Generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          phone: string | null
          email: string | null
          address: string | null
          medical_aid_number: string | null
          medical_aid_scheme: string | null
          allergies: string | null
          chronic_conditions: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          patient_number: string | null
          status: 'active' | 'inactive' | 'archived'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          phone?: string | null
          email?: string | null
          address?: string | null
          medical_aid_number?: string | null
          medical_aid_scheme?: string | null
          allergies?: string | null
          chronic_conditions?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          patient_number?: string | null
          status?: 'active' | 'inactive' | 'archived'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          phone?: string | null
          email?: string | null
          address?: string | null
          medical_aid_number?: string | null
          medical_aid_scheme?: string | null
          allergies?: string | null
          chronic_conditions?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          patient_number?: string | null
          status?: 'active' | 'inactive' | 'archived'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          specialty: string | null
          is_default: boolean
          is_active: boolean
          sort_order: number
          ai_categorization_enabled: boolean
          icd10_coding_enabled: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          specialty?: string | null
          is_default?: boolean
          is_active?: boolean
          sort_order?: number
          ai_categorization_enabled?: boolean
          icd10_coding_enabled?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          specialty?: string | null
          is_default?: boolean
          is_active?: boolean
          sort_order?: number
          ai_categorization_enabled?: boolean
          icd10_coding_enabled?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      template_sections: {
        Row: {
          id: string
          template_id: string
          name: string
          description: string | null
          section_type: 'text' | 'list' | 'structured' | 'medication' | 'vital_signs'
          is_required: boolean
          sort_order: number
          ai_keywords: string[] | null
          icd10_categories: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          name: string
          description?: string | null
          section_type?: 'text' | 'list' | 'structured' | 'medication' | 'vital_signs'
          is_required?: boolean
          sort_order?: number
          ai_keywords?: string[] | null
          icd10_categories?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          name?: string
          description?: string | null
          section_type?: 'text' | 'list' | 'structured' | 'medication' | 'vital_signs'
          is_required?: boolean
          sort_order?: number
          ai_keywords?: string[] | null
          icd10_categories?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          patient_id: string
          template_id: string | null
          session_type: string
          session_date: string
          duration_seconds: number | null
          audio_file_url: string | null
          audio_file_size: number | null
          audio_duration_seconds: number | null
          audio_format: string
          transcription_status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review'
          transcription_accuracy: number | null
          status: 'in_progress' | 'completed' | 'exported' | 'archived'
          chief_complaint: string | null
          diagnosis: string[] | null
          treatment_plan: string | null
          follow_up_required: boolean
          follow_up_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          template_id?: string | null
          session_type?: string
          session_date?: string
          duration_seconds?: number | null
          audio_file_url?: string | null
          audio_file_size?: number | null
          audio_duration_seconds?: number | null
          audio_format?: string
          transcription_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review'
          transcription_accuracy?: number | null
          status?: 'in_progress' | 'completed' | 'exported' | 'archived'
          chief_complaint?: string | null
          diagnosis?: string[] | null
          treatment_plan?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          template_id?: string | null
          session_type?: string
          session_date?: string
          duration_seconds?: number | null
          audio_file_url?: string | null
          audio_file_size?: number | null
          audio_duration_seconds?: number | null
          audio_format?: string
          transcription_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review'
          transcription_accuracy?: number | null
          status?: 'in_progress' | 'completed' | 'exported' | 'archived'
          chief_complaint?: string | null
          diagnosis?: string[] | null
          treatment_plan?: string | null
          follow_up_required?: boolean
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transcriptions: {
        Row: {
          id: string
          session_id: string
          raw_transcript: string | null
          processed_transcript: string | null
          categorized_content: any | null // JSONB
          icd10_codes: any | null // JSONB
          medical_entities: any | null // JSONB
          whisper_model_version: string | null
          claude_model_version: string | null
          processing_duration_seconds: number | null
          confidence_score: number | null
          word_count: number | null
          speaker_segments: any | null // JSONB
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          manual_corrections: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          raw_transcript?: string | null
          processed_transcript?: string | null
          categorized_content?: any | null
          icd10_codes?: any | null
          medical_entities?: any | null
          whisper_model_version?: string | null
          claude_model_version?: string | null
          processing_duration_seconds?: number | null
          confidence_score?: number | null
          word_count?: number | null
          speaker_segments?: any | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          manual_corrections?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          raw_transcript?: string | null
          processed_transcript?: string | null
          categorized_content?: any | null
          icd10_codes?: any | null
          medical_entities?: any | null
          whisper_model_version?: string | null
          claude_model_version?: string | null
          processing_duration_seconds?: number | null
          confidence_score?: number | null
          word_count?: number | null
          speaker_segments?: any | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          manual_corrections?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      session_notes: {
        Row: {
          id: string
          session_id: string
          template_section_id: string | null
          section_name: string | null
          content: string
          formatted_content: string | null
          content_type: 'text' | 'list' | 'structured'
          is_ai_generated: boolean
          confidence_score: number | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          template_section_id?: string | null
          section_name?: string | null
          content: string
          formatted_content?: string | null
          content_type?: 'text' | 'list' | 'structured'
          is_ai_generated?: boolean
          confidence_score?: number | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          template_section_id?: string | null
          section_name?: string | null
          content?: string
          formatted_content?: string | null
          content_type?: 'text' | 'list' | 'structured'
          is_ai_generated?: boolean
          confidence_score?: number | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      exports: {
        Row: {
          id: string
          session_id: string
          export_type: 'pdf' | 'docx' | 'html' | 'json'
          export_format: string | null
          file_url: string | null
          file_size: number | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          exported_by: string | null
          export_settings: any | null // JSONB
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          export_type?: 'pdf' | 'docx' | 'html' | 'json'
          export_format?: string | null
          file_url?: string | null
          file_size?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          exported_by?: string | null
          export_settings?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          export_type?: 'pdf' | 'docx' | 'html' | 'json'
          export_format?: string | null
          file_url?: string | null
          file_size?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          exported_by?: string | null
          export_settings?: any | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Derived types for the AI Medical Scribe Platform
export type Patient = Database['public']['Tables']['patients']['Row']
export type PatientInsert = Database['public']['Tables']['patients']['Insert']
export type PatientUpdate = Database['public']['Tables']['patients']['Update']

export type Template = Database['public']['Tables']['templates']['Row']
export type TemplateInsert = Database['public']['Tables']['templates']['Insert']
export type TemplateUpdate = Database['public']['Tables']['templates']['Update']

export type TemplateSection = Database['public']['Tables']['template_sections']['Row']
export type TemplateSectionInsert = Database['public']['Tables']['template_sections']['Insert']
export type TemplateSectionUpdate = Database['public']['Tables']['template_sections']['Update']

export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']
export type SessionUpdate = Database['public']['Tables']['sessions']['Update']

export type Transcription = Database['public']['Tables']['transcriptions']['Row']
export type TranscriptionInsert = Database['public']['Tables']['transcriptions']['Insert']
export type TranscriptionUpdate = Database['public']['Tables']['transcriptions']['Update']

export type SessionNote = Database['public']['Tables']['session_notes']['Row']
export type SessionNoteInsert = Database['public']['Tables']['session_notes']['Insert']
export type SessionNoteUpdate = Database['public']['Tables']['session_notes']['Update']

export type Export = Database['public']['Tables']['exports']['Row']
export type ExportInsert = Database['public']['Tables']['exports']['Insert']
export type ExportUpdate = Database['public']['Tables']['exports']['Update']

// Extended types with relationships
export interface PatientWithSessions extends Patient {
  sessions: Session[]
}

export interface SessionWithPatient extends Session {
  patients: Patient
}

export interface SessionWithTranscription extends Session {
  transcriptions: Transcription[]
}

export interface SessionWithNotes extends Session {
  session_notes: SessionNote[]
}

export interface TemplateWithSections extends Template {
  template_sections: TemplateSection[]
}

export interface SessionComplete extends Session {
  patients: Patient
  templates: Template | null
  transcriptions: Transcription[]
  session_notes: SessionNote[]
  exports: Export[]
}

// AI Processing Types
export interface CategorizedContent {
  [sectionName: string]: {
    content: string
    confidence: number
    keywords: string[]
  }
}

export interface ICD10Code {
  code: string
  description: string
  confidence: number
  category: string
}

export interface MedicalEntity {
  entity: string
  type: 'medication' | 'condition' | 'symptom' | 'allergy' | 'procedure' | 'anatomy'
  confidence: number
  startPos?: number
  endPos?: number
}

export interface SpeakerSegment {
  speaker: string
  startTime: number
  endTime: number
  text: string
  confidence: number
}

// Dashboard Analytics Types
export interface MedicalScribeDashboardMetrics {
  totalPatients: number
  activeSessions: number
  completedTranscriptions: number
  averageAccuracy: number
  sessionsToday: number
  patientsThisWeek: number
}

export interface TranscriptionMetrics {
  totalTranscriptions: number
  averageAccuracy: number
  averageProcessingTime: number
  successRate: number
  manualReviewRate: number
}

// Export and Template Types
export interface ExportSettings {
  includeSections: string[]
  format: 'clinical' | 'detailed' | 'summary'
  includeAIConfidence: boolean
  includeTimestamps: boolean
  includePatientInfo: boolean
}

export interface TemplateConfiguration {
  aiCategorization: boolean
  icd10Coding: boolean
  autoStructuring: boolean
  confidenceThreshold: number
}