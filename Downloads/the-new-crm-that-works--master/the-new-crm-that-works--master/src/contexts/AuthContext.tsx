'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

// DEV MODE: Set to true to bypass authentication
const DEV_MODE_BYPASS_AUTH = true

interface Profile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'editor' | 'viewer'
  department?: string
  is_active: boolean
  avatar_url?: string
  created_at?: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, profileData: any) => Promise<{ success: boolean; error?: string }>
  updateProfile: (profileData: any) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  isAdmin: () => boolean
  isManager: () => boolean
  canEdit: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // DEV MODE: Bypass authentication
    if (DEV_MODE_BYPASS_AUTH) {
      const mockUser = {
        id: 'dev-user-123',
        email: 'donovan@thecubinghub.com',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as User

      const mockProfile = {
        id: 'dev-user-123',
        email: 'donovan@thecubinghub.com',
        full_name: 'Donovan Phillips',
        role: 'admin' as const,
        department: 'Management',
        is_active: true,
        avatar_url: undefined,
        created_at: new Date().toISOString()
      }

      const mockSession = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh',
        user: mockUser
      } as Session

      setUser(mockUser)
      setProfile(mockProfile)
      setSession(mockSession)
      setLoading(false)
      return
    }

    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setSession(session)
          setUser(session.user)
          
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profileData) {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)
      
      if (session) {
        setSession(session)
        setUser(session.user)
        
        // Fetch updated profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
      } else {
        setSession(null)
        setUser(null)
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (DEV_MODE_BYPASS_AUTH) {
      return { success: true }
    }

    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user && data.session) {
        setUser(data.user)
        setSession(data.session)
        
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
        
        return { success: true }
      }

      return { success: false, error: 'Sign in failed' }
    } catch (error) {
      console.error('Error signing in:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, profileData: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            email: data.user.email,
            ...profileData
          }])

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Still consider it successful since the user was created
        }
        
        return { success: true }
      }

      return { success: false, error: 'Sign up failed' }
    } catch (error) {
      console.error('Error signing up:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (profileData: any) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' }
      }

      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      if (data) {
        setProfile(data)
        return { success: true }
      }

      return { success: false, error: 'Update failed' }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (DEV_MODE_BYPASS_AUTH) {
      // In dev mode, don't actually sign out - just redirect to login
      router.push('/login')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      setSession(null)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = () => profile?.role === 'admin'
  const isManager = () => profile?.role === 'admin' || profile?.role === 'manager'
  const canEdit = () => ['admin', 'manager', 'editor'].includes(profile?.role || '')

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    updateProfile,
    signOut,
    isAdmin,
    isManager,
    canEdit,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
