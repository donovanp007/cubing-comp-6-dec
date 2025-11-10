'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TeamMember {
  id: string
  email: string
  name: string
  role: 'ceo' | 'admin' | 'manager' | 'team_member' | 'viewer'
  department?: string
  status: 'active' | 'inactive'
  last_active?: string
  created_at: string
}

interface CreateTeamMemberData {
  email: string
  name: string
  password: string
  role: 'admin' | 'manager' | 'team_member' | 'viewer'
  department?: string
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ceo: 'Full system access. Can create users, manage teams, view all financial data.',
  admin: 'Administrative access. Can manage users, teams, and access financial reports.',
  manager: 'Manager access. Can view assigned schools, manage students and finances.',
  team_member: 'Team member access. Can create and manage records assigned to them.',
  viewer: 'Read-only access. Can view records but cannot make changes.',
}

const ROLE_COLORS: Record<string, string> = {
  ceo: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  team_member: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
}

export function TeamManagement() {
  const { profile } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Check if user has permission
  const canManageTeam = ['ceo', 'admin'].includes(profile?.role || '')

  // Fetch team members
  useEffect(() => {
    if (canManageTeam) {
      fetchTeamMembers()
    }
  }, [canManageTeam])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err

      setTeamMembers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMember = async (formData: CreateTeamMemberData) => {
    try {
      setError(null)
      setSuccess(null)

      // Call API to create user
      const response = await fetch('/api/admin/create-team-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create team member')
      }

      setSuccess(`Team member ${formData.name} created successfully`)
      setShowDialog(false)
      fetchTeamMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team member')
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      setError(null)
      setSuccess(null)

      const { error: err } = await supabase
        .from('users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', memberId)

      if (err) throw err

      setSuccess('Role updated successfully')
      fetchTeamMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    }
  }

  const handleDeactivate = async (memberId: string) => {
    try {
      setError(null)
      setSuccess(null)

      const { error: err } = await supabase
        .from('users')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', memberId)

      if (err) throw err

      setSuccess('Team member deactivated')
      fetchTeamMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate')
    }
  }

  const handleActivate = async (memberId: string) => {
    try {
      setError(null)
      setSuccess(null)

      const { error: err } = await supabase
        .from('users')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', memberId)

      if (err) throw err

      setSuccess('Team member activated')
      fetchTeamMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate')
    }
  }

  // Filter members
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter

    return matchesSearch && matchesRole
  })

  if (!canManageTeam) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">Access Denied</h3>
              <p className="text-sm text-orange-700 mt-1">
                Only CEO and Admin roles can manage team members.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-gray-600 mt-1">
          Create, manage, and assign roles to your team members securely.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Members</span>
            </div>
            <p className="text-2xl font-bold mt-1">{teamMembers.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Administrators</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-purple-600">
              {teamMembers.filter(m => m.role === 'admin').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {teamMembers.filter(m => m.status === 'active').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Inactive</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-gray-600">
              {teamMembers.filter(m => m.status === 'inactive').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Members</span>
              </CardTitle>
              <CardDescription>
                Manage your team's access and permissions securely
              </CardDescription>
            </div>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="team_member">Team Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Department</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{member.name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                      <td className="px-6 py-4">
                        <Badge className={ROLE_COLORS[member.role]}>
                          {member.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.department || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            member.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {member.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingMember(member)
                                setShowDialog(true)
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild>
                              <Select onValueChange={(role) => handleUpdateRole(member.id, role)}>
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Change role..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Make Admin</SelectItem>
                                  <SelectItem value="manager">Make Manager</SelectItem>
                                  <SelectItem value="team_member">Make Team Member</SelectItem>
                                  <SelectItem value="viewer">Make Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {member.status === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => handleDeactivate(member.id)}
                                className="text-orange-600"
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleActivate(member.id)}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredMembers.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500">No team members found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Reference Card */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions Guide</CardTitle>
          <CardDescription>
            Understand what each role can do in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
              <div key={role} className="p-4 border rounded-lg">
                <Badge className={ROLE_COLORS[role]} className="mb-2">
                  {role.replace('_', ' ').toUpperCase()}
                </Badge>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? 'Update team member details'
                : 'Create a new team member account'}
            </DialogDescription>
          </DialogHeader>
          <CreateTeamMemberForm
            onSubmit={handleCreateMember}
            onClose={() => {
              setShowDialog(false)
              setEditingMember(null)
            }}
            initialData={editingMember || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Create Team Member Form Component
function CreateTeamMemberForm({
  onSubmit,
  onClose,
  initialData,
}: {
  onSubmit: (data: CreateTeamMemberData) => Promise<void>
  onClose: () => void
  initialData?: TeamMember
}) {
  const [formData, setFormData] = useState<CreateTeamMemberData>({
    email: initialData?.email || '',
    name: initialData?.name || '',
    password: '',
    role: initialData?.role || 'team_member',
    department: initialData?.department || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email || !formData.name || !formData.password) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@example.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Secure password"
          required
        />
      </div>

      <div>
        <Label htmlFor="role">Role *</Label>
        <Select value={formData.role} onValueChange={(role) =>
          setFormData({ ...formData, role: role as CreateTeamMemberData['role'] })
        }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="team_member">Team Member</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="department">Department (Optional)</Label>
        <Input
          id="department"
          value={formData.department || ''}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          placeholder="Sales, Finance, etc."
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button disabled={loading}>
          {loading ? 'Saving...' : 'Save Team Member'}
        </Button>
      </div>
    </form>
  )
}
