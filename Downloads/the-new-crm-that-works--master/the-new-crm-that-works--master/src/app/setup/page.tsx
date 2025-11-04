'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function SetupPage() {
  const [adminExists, setAdminExists] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: 'donovan@thecubinghub.com',
    password: '',
    confirmPassword: '',
    fullName: 'Donovan Phillips'
  })

  // Check if admin user already exists
  useEffect(() => {
    checkAdminExists()
  }, [])

  const checkAdminExists = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('role', 'admin')
        .limit(1)

      if (error) {
        console.error('Error checking admin:', error)
        setError('Failed to check admin status')
        return
      }

      setAdminExists(data && data.length > 0)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Failed to check admin status')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCreating(true)

    // Validation
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all fields')
      setCreating(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setCreating(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setCreating(false)
      return
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'admin'
          }
        }
      })

      if (authError) {
        setError(authError.message)
        setCreating(false)
        return
      }

      if (!authData.user) {
        setError('Failed to create user account')
        setCreating(false)
        return
      }

      // Create user profile with admin role
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: formData.email,
          name: formData.fullName,
          role: 'admin',
          status: 'active',
          created_at: new Date().toISOString()
        }])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        setError('Failed to create user profile')
        setCreating(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/signin?message=Admin user created successfully. Please sign in.')
      }, 3000)

    } catch (err: any) {
      console.error('Unexpected error:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking system setup...</span>
        </div>
      </div>
    )
  }

  if (adminExists) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-600">Setup Complete</CardTitle>
            <CardDescription>
              Admin user already exists. Your system is ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/auth/signin')} 
              className="w-full"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-600">Admin Created Successfully!</CardTitle>
            <CardDescription>
              Your admin account has been created. You'll be redirected to the sign-in page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>System Setup</CardTitle>
          <CardDescription>
            Create the first admin user to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="System Administrator"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@yourcompany.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter secure password"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm password"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={creating}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Admin...
                </>
              ) : (
                'Create Admin User'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}