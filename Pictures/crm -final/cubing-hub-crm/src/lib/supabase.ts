import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use anon key since RLS is disabled - this should work for development
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side usage
export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Alternative client using anon key (for when you get the right key)
export const supabaseAnon = createBrowserClient(supabaseUrl, supabaseAnonKey)