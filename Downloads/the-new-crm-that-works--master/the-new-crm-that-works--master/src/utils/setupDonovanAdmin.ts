/**
 * Setup Donovan as admin user
 * Run this once to create admin account for donovan@thecubinghub.com
 */

import { supabase } from '@/lib/supabase'

export async function setupDonovanAsAdmin() {
  const adminEmail = 'donovan@thecubinghub.com'
  const adminName = 'Donovan Phillips'
  
  try {
    console.log('Setting up Donovan as admin user...')
    
    // First check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single()

    if (existingUser) {
      // User exists, just update role to admin
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: 'admin',
          name: adminName,
          status: 'active'
        })
        .eq('email', adminEmail)

      if (updateError) {
        console.error('Error updating user to admin:', updateError)
        return { success: false, error: updateError.message }
      }

      console.log('✅ Donovan updated to admin successfully!')
      return { 
        success: true, 
        message: 'User updated to admin role',
        action: 'updated'
      }
    } else {
      // User doesn't exist in users table, check if auth user exists
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      
      const authUser = authUsers.users.find(user => user.email === adminEmail)
      
      if (authUser) {
        // Auth user exists, create profile
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: authUser.id,
            email: adminEmail,
            name: adminName,
            role: 'admin',
            status: 'active',
            created_at: new Date().toISOString()
          }])

        if (insertError) {
          console.error('Error creating user profile:', insertError)
          return { success: false, error: insertError.message }
        }

        console.log('✅ Donovan profile created as admin!')
        return { 
          success: true, 
          message: 'Admin profile created for existing auth user',
          action: 'created'
        }
      } else {
        return { 
          success: false, 
          error: 'Auth user not found. Please create the auth user first in Supabase Dashboard.',
          instruction: `Go to Supabase Dashboard > Authentication > Users > Add user with email: ${adminEmail}`
        }
      }
    }

  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { success: false, error: error.message }
  }
}

// Console function to run this easily
export async function runDonovanSetup() {
  console.log('🚀 Starting Donovan admin setup...')
  const result = await setupDonovanAsAdmin()
  
  if (result.success) {
    console.log('🎉 Setup complete!')
    console.log('📧 Email:', 'donovan@thecubinghub.com')
    console.log('🔑 Role: admin')
    console.log('ℹ️  Action:', result.action)
  } else {
    console.error('❌ Setup failed:', result.error)
    if (result.instruction) {
      console.log('📝 Next step:', result.instruction)
    }
  }
  
  return result
}