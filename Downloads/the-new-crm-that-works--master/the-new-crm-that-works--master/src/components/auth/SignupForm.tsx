'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react'

interface SignupFormProps {
  onToggleMode?: () => void
  redirectTo?: string
  allowRoleSelection?: boolean
}

export default function SignupForm({ 
  onToggleMode, 
  redirectTo = '/dashboard',
  allowRoleSelection = false 
}: SignupFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'team_member' as UserRole
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const { signUp } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      return 'Please fill in all required fields'
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long'
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsSubmitting(false)
      return
    }

    try {
      const result = await signUp(
        formData.email,
        formData.password,
        {
          full_name: formData.fullName,
          role: formData.role,
          is_active: true
        }
      )
      
      if (result.success) {
        router.push('/auth/verify-email')
      } else {
        setError(result.error || 'Failed to create account')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Join the CubingHub team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              disabled={isSubmitting}
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
              required
            />
          </div>

          {allowRoleSelection && (
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team_member">Team Member</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="ceo">CEO</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={isSubmitting}
                autoComplete="new-password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                disabled={isSubmitting}
                autoComplete="new-password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account
              </>
            )}
          </Button>

          {onToggleMode && (
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={onToggleMode}
                disabled={isSubmitting}
                className="text-sm"
              >
                Already have an account? Sign in
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}