import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * Creates a Supabase client for server-side operations (Server Components, Route Handlers, etc.)
 * This client automatically handles cookie-based authentication
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Gets the current user from the server-side Supabase client
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * Checks if a user is authenticated on the server side
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Fetches data with proper error handling for server components
 */
export async function serverFetch<T>(
  queryBuilder: any
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await queryBuilder
    
    if (error) {
      console.error('Server fetch error:', error)
      return { data: null, error: error.message || 'An error occurred' }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Unexpected server fetch error:', err)
    return { data: null, error: 'An unexpected error occurred' }
  }
}

// Typed helper functions for common queries

export async function getStudentsWithSchools() {
  const supabase = await createServerSupabaseClient()
  
  return serverFetch(
    supabase
      .from('students')
      .select(`
        *,
        schools (
          id,
          name,
          target_enrollment,
          current_enrollment,
          monthly_cost,
          program_fee_per_student
        )
      `)
      .order('created_at', { ascending: false })
  )
}

export async function getSchools() {
  const supabase = await createServerSupabaseClient()
  
  return serverFetch(
    supabase
      .from('schools')
      .select('*')
      .order('name')
  )
}

export async function getProjects() {
  const supabase = await createServerSupabaseClient()
  
  return serverFetch(
    supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
  )
}

export async function getCRMTasks() {
  const supabase = await createServerSupabaseClient()
  
  return serverFetch(
    supabase
      .from('crm_tasks')
      .select(`
        *,
        students (
          id,
          first_name,
          last_name
        ),
        projects (
          id,
          name
        ),
        users!assigned_to (
          id,
          email
        )
      `)
      .order('priority', { ascending: false })
      .order('due_at', { ascending: true })
  )
}