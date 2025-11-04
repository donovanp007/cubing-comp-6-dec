'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserRole } from '@/types'
import { Loader2, Eye, EyeOff } from 'lucide-react'

interface CreateUserFormProps {
  onSubmit: (userData: {
    email: string
    name: string
    role: UserRole
    department?: string
    password?: string
  }) => Promise<{ success: boolean; error?: string; user?: any }>
  onClose: () => void
}

export function CreateUserForm({ onSubmit, onClose }: CreateUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'team_member' as UserRole,
    department: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [generatePassword, setGeneratePassword] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const userData = {
        ...formData,
        password: generatePassword ? undefined : formData.password || undefined
      }

      const result = await onSubmit(userData)
      
      if (result.success) {
        onClose()
        // Reset form
        setFormData({
          email: '',
          name: '',
          role: 'team_member',
          department: '',
          password: ''
        })
      } else {
        setError(result.error || 'Failed to create user')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, password }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="John Doe"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="john@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select 
          value={formData.role} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="team_member">Team Member</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="ceo">CEO</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department (Optional)</Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
          placeholder="Sales, Marketing, Operations, etc."
        />
      </div>

      <div className="space-y-3">
        <Label>Password</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="generatePassword"
              checked={generatePassword}
              onChange={(e) => setGeneratePassword(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="generatePassword" className="text-sm">
              Generate random password (recommended)
            </Label>
          </div>
          
          {!generatePassword && (
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter custom password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create User'
          )}
        </Button>
      </div>

      {generatePassword && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <p className="font-medium mb-1">Password Setup</p>
          <p>
            A secure random password will be generated automatically. The user will receive an email 
            with instructions to set up their account and choose their own password.
          </p>
        </div>
      )}
    </form>
  )
}