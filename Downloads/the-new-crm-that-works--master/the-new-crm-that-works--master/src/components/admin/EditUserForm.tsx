'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, UserRole } from '@/types'
import { Loader2 } from 'lucide-react'

interface EditUserFormProps {
  user: User
  onSubmit: (userId: string, updates: {
    name?: string
    role?: UserRole
    department?: string
    status?: 'active' | 'inactive'
  }) => Promise<{ success: boolean; error?: string }>
  onClose: () => void
}

export function EditUserForm({ user, onSubmit, onClose }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    role: user.role,
    department: user.department || '',
    status: user.status || 'active'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const updates: any = {}
      
      // Only include changed fields
      if (formData.name !== user.name) updates.name = formData.name
      if (formData.role !== user.role) updates.role = formData.role
      if (formData.department !== (user.department || '')) updates.department = formData.department
      if (formData.status !== (user.status || 'active')) updates.status = formData.status

      // Only submit if there are changes
      if (Object.keys(updates).length === 0) {
        onClose()
        return
      }

      const result = await onSubmit(user.id, updates)
      
      if (result.success) {
        onClose()
      } else {
        setError(result.error || 'Failed to update user')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* User Info (Read-only) */}
      <div className="p-3 bg-gray-50 rounded-lg space-y-2">
        <div>
          <Label className="text-sm font-medium text-gray-700">Email</Label>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Created</Label>
          <p className="text-sm text-gray-600">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

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
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
          placeholder="Sales, Marketing, Operations, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Summary */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <Label className="text-sm font-medium text-blue-700">Activity Summary</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">0</p>
            <p className="text-xs text-blue-600">Comments</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">0</p>
            <p className="text-xs text-blue-600">Projects</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">0</p>
            <p className="text-xs text-blue-600">Tasks</p>
          </div>
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
              Updating...
            </>
          ) : (
            'Update User'
          )}
        </Button>
      </div>
    </form>
  )
}