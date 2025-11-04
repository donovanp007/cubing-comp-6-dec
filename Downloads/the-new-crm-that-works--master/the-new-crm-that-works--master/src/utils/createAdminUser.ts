/**
 * Utility to create an admin user
 * This should be run once during initial setup
 */

import { supabase } from '@/lib/supabase'

export async function createAdminUser(email: string, password: string, fullName: string) {
  try {
    console.log('Creating admin user...')
    
    // 1. Create auth user with admin role
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName,
        role: 'admin'
      },
      email_confirm: true // Auto-confirm email
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'No user data returned' }
    }

    // 2. Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        name: fullName,
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString()
      }])

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      return { success: false, error: profileError.message }
    }

    console.log('Admin user created successfully!')
    console.log('Email:', email)
    console.log('User ID:', authData.user.id)

    return { 
      success: true, 
      user: authData.user,
      message: `Admin user created with email: ${email}` 
    }

  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { success: false, error: error.message }
  }
}

// Example usage function (call this from a component or API route)
export async function setupInitialAdmin() {
  const adminEmail = 'admin@yourcompany.com' // Change this
  const adminPassword = 'YourSecurePassword123!' // Change this
  const adminName = 'System Administrator'

  const result = await createAdminUser(adminEmail, adminPassword, adminName)
  
  if (result.success) {
    console.log('✅ Admin user setup complete!')
  } else {
    console.error('❌ Admin user setup failed:', result.error)
  }
  
  return result
}