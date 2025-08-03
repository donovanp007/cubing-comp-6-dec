import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For client-side usage
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// For server-side usage
export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}