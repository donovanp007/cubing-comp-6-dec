import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check user role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (
      !userProfile ||
      !['ceo', 'admin'].includes(userProfile.role)
    ) {
      return NextResponse.json(
        { error: 'Only CEO and Admin can create team members' },
        { status: 403 }
      )
    }

    // Get request body
    const body = await req.json()
    const { email, name, password, role, department } = body

    // Validate input
    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, password, role' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'team_member', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Create auth user using admin API
    const { data: authData, error: createAuthError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
      },
    })

    if (createAuthError) {
      console.error('Auth creation error:', createAuthError)
      return NextResponse.json(
        { error: createAuthError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create auth user' },
        { status: 500 }
      )
    }

    // Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          name,
          role,
          department: department || null,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    // Log audit event
    try {
      await supabase
        .from('audit_logs')
        .insert([
          {
            user_id: user.id,
            action: 'CREATE_USER',
            resource_type: 'user',
            resource_id: authData.user.id,
            new_values: {
              email,
              name,
              role,
              department,
            },
            timestamp: new Date().toISOString(),
          },
        ])
    } catch (auditError) {
      console.error('Audit logging error:', auditError)
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: authData.user.id,
          email,
          name,
          role,
        },
        message: `Team member ${name} created successfully`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
