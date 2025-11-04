'use client'

import { useState } from 'react'
import { useSupabaseUsers } from '@/hooks/useSupabaseUsers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, UserRole } from '@/types'
import { CreateUserForm } from './CreateUserForm'
import { EditUserForm } from './EditUserForm'
import { UserActivityModal } from './UserActivityModal'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Activity
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from 'date-fns'

export function UserManagement() {
  const { 
    users, 
    loading, 
    error, 
    createUser, 
    updateUser, 
    deleteUser
  } = useSupabaseUsers()

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewingActivity, setViewingActivity] = useState<User | null>(null)

  // Placeholder functions for features not yet implemented
  const bulkUpdateUsers = async (userIds: string[], updates: any) => {
    // TODO: Implement bulk user updates
    console.log('Bulk update not yet implemented', userIds, updates)
    return { success: false, error: 'Feature not implemented' }
  }

  const sendPasswordReset = async (email: string) => {
    // TODO: Implement password reset
    console.log('Password reset not yet implemented for', email)
  }

  const getUserActivity = async (userId: string) => {
    // TODO: Implement user activity tracking
    console.log('User activity tracking not yet implemented for', userId)
    return { comments: [], projects: [], tasks: [] }
  }

  // Wrapper function to handle CreateUserForm interface
  const handleCreateUser = async (userData: {
    email: string;
    name: string;
    role: UserRole;
    department?: string;
    password?: string;
  }) => {
    const success = await createUser({
      ...userData,
      status: 'active' // Default status
    })
    return {
      success,
      error: success ? undefined : 'Failed to create user'
    }
  }

  // Wrapper function to handle EditUserForm interface  
  const handleUpdateUser = async (userId: string, updates: {
    name?: string;
    role?: UserRole;
    department?: string;
    status?: 'active' | 'inactive';
  }) => {
    const success = await updateUser(userId, updates)
    return {
      success,
      error: success ? undefined : 'Failed to update user'
    }
  }

  // Filter users based on search term, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'role-change', value?: UserRole) => {
    if (selectedUsers.length === 0) return

    const updates: any = {}
    if (action === 'activate') updates.status = 'active'
    if (action === 'deactivate') updates.status = 'inactive'
    if (action === 'role-change' && value) updates.role = value

    const result = await bulkUpdateUsers(selectedUsers, updates)
    if (result.success) {
      setSelectedUsers([])
    }
  }

  const handleDeleteUser = async (userId: string, permanent: boolean = false) => {
    const success = await deleteUser(userId)
    if (success) {
      // Success handled by hook
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'ceo': return 'bg-purple-100 text-purple-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'team_member': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <p className="text-2xl font-bold mt-1">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {users.filter(u => u.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Inactive</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-gray-600">
              {users.filter(u => u.status === 'inactive').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Avg Activity</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-purple-600">
              0
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>
                Create, edit, and manage user accounts and permissions
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateUser(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="ceo">CEO</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedUsers.length} users selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                  Deactivate
                </Button>
                <Select onValueChange={(value) => handleBulkAction('role-change', value as UserRole)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Change Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="team_member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={() => setSelectedUsers([])}>
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">User</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Role</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Activity</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Last Active</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status?.toUpperCase() || 'ACTIVE'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <p>Score: 0</p>
                          <p className="text-gray-500">
                            0c • 0p • 0t
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-500">
                          {user.last_active ? format(new Date(user.last_active), 'MMM d, yyyy') : 'Never'}
                        </span>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingActivity(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Activity
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => sendPasswordReset(user.email)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id, false)}
                              className="text-orange-600"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id, true)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system with role-based permissions
            </DialogDescription>
          </DialogHeader>
          <CreateUserForm 
            onSubmit={handleCreateUser}
            onClose={() => setShowCreateUser(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <EditUserForm 
              user={editingUser}
              onSubmit={handleUpdateUser}
              onClose={() => setEditingUser(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* User Activity Modal */}
      {viewingActivity && (
        <UserActivityModal
          user={viewingActivity}
          onClose={() => setViewingActivity(null)}
          getUserActivity={getUserActivity}
        />
      )}
    </div>
  )
}