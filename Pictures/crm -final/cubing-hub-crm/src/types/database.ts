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
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          first_name: string
          last_name: string
          school_id: string
          grade: number
          parent_name: string
          parent_phone: string
          parent_email: string
          status: 'active' | 'in_progress' | 'completed' | 'concern' | 'inactive'
          class_type: string
          payment_status: 'paid' | 'outstanding' | 'partial' | 'overdue'
          consent_received: boolean
          certificate_given: boolean
          cube_received: boolean
          items_purchased: string[]
          tags: string[]
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          school_id: string
          grade: number
          parent_name: string
          parent_phone: string
          parent_email: string
          status?: 'active' | 'in_progress' | 'completed' | 'concern' | 'inactive'
          class_type: string
          payment_status?: 'paid' | 'outstanding' | 'partial' | 'overdue'
          consent_received?: boolean
          certificate_given?: boolean
          cube_received?: boolean
          items_purchased?: string[]
          tags?: string[]
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          school_id?: string
          grade?: number
          parent_name?: string
          parent_phone?: string
          parent_email?: string
          status?: 'active' | 'in_progress' | 'completed' | 'concern' | 'inactive'
          class_type?: string
          payment_status?: 'paid' | 'outstanding' | 'partial' | 'overdue'
          consent_received?: boolean
          certificate_given?: boolean
          cube_received?: boolean
          items_purchased?: string[]
          tags?: string[]
          notes?: string
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
          priority: 'low' | 'medium' | 'high'
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
          priority?: 'low' | 'medium' | 'high'
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
          priority?: 'low' | 'medium' | 'high'
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