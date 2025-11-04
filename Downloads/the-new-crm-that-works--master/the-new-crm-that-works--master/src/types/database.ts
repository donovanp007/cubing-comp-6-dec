export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          target_enrollment: number
          current_enrollment: number
          monthly_cost: number
          program_fee_per_student: number
          term_fee_per_student: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          target_enrollment: number
          current_enrollment?: number
          monthly_cost: number
          program_fee_per_student: number
          term_fee_per_student: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          target_enrollment?: number
          current_enrollment?: number
          monthly_cost?: number
          program_fee_per_student?: number
          term_fee_per_student?: number
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          first_name: string
          last_name: string
          school_id: string | null
          grade: number
          parent_name: string | null
          parent_phone: string | null
          parent_email: string | null
          parent_notes: string | null
          status: 'active' | 'in_progress' | 'completed' | 'concern' | 'inactive'
          class_type: string
          payment_status: 'paid' | 'outstanding' | 'partial' | 'overdue'
          consent_received: boolean
          certificate_given: boolean
          cube_received: boolean
          invoice_sent: boolean
          cubing_competition_invited: boolean
          items_purchased: string[]
          tags: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name?: string
          school_id?: string | null
          grade: number
          parent_name?: string | null
          parent_phone?: string | null
          parent_email?: string | null
          parent_notes?: string | null
          status?: 'active' | 'in_progress' | 'completed' | 'concern' | 'inactive'
          class_type: string
          payment_status?: 'paid' | 'outstanding' | 'partial' | 'overdue'
          consent_received?: boolean
          certificate_given?: boolean
          cube_received?: boolean
          invoice_sent?: boolean
          cubing_competition_invited?: boolean
          items_purchased?: string[]
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          school_id?: string | null
          grade?: number
          parent_name?: string | null
          parent_phone?: string | null
          parent_email?: string | null
          parent_notes?: string | null
          status?: 'active' | 'in_progress' | 'completed' | 'concern' | 'inactive'
          class_type?: string
          payment_status?: 'paid' | 'outstanding' | 'partial' | 'overdue'
          consent_received?: boolean
          certificate_given?: boolean
          cube_received?: boolean
          invoice_sent?: boolean
          cubing_competition_invited?: boolean
          items_purchased?: string[]
          tags?: string[]
          notes?: string | null
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          student_id: string
          amount: number
          due_date: string
          paid_date: string | null
          status: 'pending' | 'paid' | 'overdue' | 'partial'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          amount: number
          due_date: string
          paid_date?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'partial'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          amount?: number
          due_date?: string
          paid_date?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'partial'
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          student_id: string
          title: string
          description: string
          due_date: string
          completed: boolean
          priority: 'low' | 'medium' | 'high' | 'urgent'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          description: string
          due_date: string
          completed?: boolean
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          description?: string
          due_date?: string
          completed?: boolean
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          updated_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          category: 'cube' | 'accessory' | 'educational' | 'other'
          sku: string
          cost_price: number
          selling_price: number
          current_stock: number
          minimum_stock: number
          supplier: string
          description: string
          image_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'cube' | 'accessory' | 'educational' | 'other'
          sku: string
          cost_price: number
          selling_price: number
          current_stock: number
          minimum_stock?: number
          supplier: string
          description: string
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'cube' | 'accessory' | 'educational' | 'other'
          sku?: string
          cost_price?: number
          selling_price?: number
          current_stock?: number
          minimum_stock?: number
          supplier?: string
          description?: string
          image_url?: string
          updated_at?: string
        }
      }
      sales_opportunities: {
        Row: {
          id: string
          student_id: string
          item_id: string
          priority: 'high' | 'medium' | 'low'
          status: 'pending' | 'contacted' | 'sold' | 'not_interested'
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          item_id: string
          priority?: 'high' | 'medium' | 'low'
          status?: 'pending' | 'contacted' | 'sold' | 'not_interested'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          item_id?: string
          priority?: 'high' | 'medium' | 'low'
          status?: 'pending' | 'contacted' | 'sold' | 'not_interested'
          notes?: string
          updated_at?: string
        }
      }
      crm_tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent' | 'urgent'
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date: string | null
          assigned_to: string | null
          student_id: string
          task_type: 'follow_up' | 'payment' | 'certificate' | 'equipment' | 'general'
          created_at: string
          updated_at: string
          completed_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
          assigned_to?: string | null
          student_id: string
          task_type?: 'follow_up' | 'payment' | 'certificate' | 'equipment' | 'general'
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
          assigned_to?: string | null
          student_id?: string
          task_type?: 'follow_up' | 'payment' | 'certificate' | 'equipment' | 'general'
          updated_at?: string
          completed_at?: string | null
          created_by?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: 'active' | 'paused' | 'completed' | 'archived'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          color: string
          start_date: string | null
          end_date: string | null
          team_members: string[]
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: 'active' | 'paused' | 'completed' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          color?: string
          start_date?: string | null
          end_date?: string | null
          team_members?: string[]
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: 'active' | 'paused' | 'completed' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          color?: string
          start_date?: string | null
          end_date?: string | null
          team_members?: string[]
          created_by?: string | null
          updated_at?: string
        }
      }
      task_lists: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          position?: number
          updated_at?: string
        }
      }
      work_tasks: {
        Row: {
          id: string
          project_id: string
          task_list_id: string | null
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to: string | null
          due_date: string | null
          start_date: string | null
          completed_at: string | null
          estimate_hours: number
          actual_hours: number
          progress: number
          position: number
          labels: string[]
          dependencies: string[]
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          task_list_id?: string | null
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to?: string | null
          due_date?: string | null
          start_date?: string | null
          completed_at?: string | null
          estimate_hours?: number
          actual_hours?: number
          progress?: number
          position?: number
          labels?: string[]
          dependencies?: string[]
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          task_list_id?: string | null
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to?: string | null
          due_date?: string | null
          start_date?: string | null
          completed_at?: string | null
          estimate_hours?: number
          actual_hours?: number
          progress?: number
          position?: number
          labels?: string[]
          dependencies?: string[]
          created_by?: string | null
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          role: 'admin' | 'manager' | 'team_member'
          department: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
          last_active: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'team_member'
          department?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
          last_active?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'team_member'
          department?: string | null
          status?: 'active' | 'inactive'
          updated_at?: string
          last_active?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent' | 'urgent'
          owner_id: string
          start_date: string | null
          due_date: string | null
          progress: number
          created_at: string
          updated_at: string
          tags: string[]
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          owner_id: string
          start_date?: string | null
          due_date?: string | null
          progress?: number
          created_at?: string
          updated_at?: string
          tags?: string[]
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          owner_id?: string
          start_date?: string | null
          due_date?: string | null
          progress?: number
          updated_at?: string
          tags?: string[]
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          added_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: string
          added_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
        }
      }
      work_tasks: {
        Row: {
          id: string
          project_id: string
          task_list_id: string | null
          parent_task_id: string | null
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked'
          priority: 'low' | 'medium' | 'high' | 'urgent' | 'urgent'
          assigned_to: string | null
          created_by: string
          due_date: string | null
          start_date: string | null
          estimated_hours: number | null
          actual_hours: number | null
          progress: number
          position: number
          tags: string[]
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          task_list_id?: string | null
          parent_task_id?: string | null
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to?: string | null
          created_by: string
          due_date?: string | null
          start_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          progress?: number
          position?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          task_list_id?: string | null
          parent_task_id?: string | null
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to?: string | null
          due_date?: string | null
          start_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          progress?: number
          position?: number
          tags?: string[]
          updated_at?: string
          completed_at?: string | null
        }
      }
      task_lists: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          position?: number
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          task_id: string
          user_id: string
          description: string | null
          hours: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          description?: string | null
          hours: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          description?: string | null
          hours?: number
          date?: string
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
