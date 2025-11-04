import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check .env.local file.')
}

// Singleton pattern to ensure only one Supabase client instance
let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'cubing-hub-auth',
      },
    })
  }
  return supabaseInstance
}

export const supabase = getSupabaseClient()