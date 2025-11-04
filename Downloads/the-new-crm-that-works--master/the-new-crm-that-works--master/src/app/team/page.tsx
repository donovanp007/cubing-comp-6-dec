'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User } from '@/types'
import { useSupabaseUsers } from '@/hooks/useSupabaseUsers'
import { 
  Users,
  Plus, 
  Search, 
  Calendar,
  Mail,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserPlus,
  Crown,
  Shield,
  User as UserIcon,
  Briefcase,
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

export default function TeamPage() {
  const { 
    users, 
    loading, 
    error, 
    createUser, 
    updateUser, 
    deleteUser 
  } = useSupabaseUsers()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'team_member' as User['role'],
    department: '',
    status: 'active' as User['status']
  })

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleInfo = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return { icon: Crown, color: 'text-red-600 bg-red-100', label: 'Admin' }
      case 'manager':
        return { icon: Shield, color: 'text-blue-600 bg-blue-100', label: 'Manager' }
      case 'team_member':
        return { icon: UserIcon, color: 'text-green-600 bg-green-100', label: 'Team Member' }
      default:
        return { icon: UserIcon, color: 'text-gray-600 bg-gray-100', label: 'Team Member' }
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleAddUser = async () => {
    if (newUser.name.trim() && newUser.email.trim()) {
      const success = await createUser(newUser)
      if (success) {
        setNewUser({
          name: '',
          email: '',
          role: 'team_member',
          department: '',
          status: 'active'
        })
        setShowAddUserDialog(false)
        console.log('User added successfully')
      } else {
        console.error('Failed to add user')
      }
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    const success = await updateUser(userId, updates)
    if (success) {
      setShowUserDialog(false)
      setSelectedUser(null)
      console.log('User updated successfully')
    } else {
      console.error('Failed to update user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId)
    if (success) {
      setShowDeleteDialog(null)
      console.log('User deleted successfully')
    } else {
      console.error('Failed to delete user')
    }
  }

  // Mock data for task counts (would come from task management system)
  const getUserTaskCount = (userId: string): number => {
    return Math.floor(Math.random() * 10) // Random for demo
  }

  const getUserCompletedTasks = (userId: string): number => {
    return Math.floor(Math.random() * 20) // Random for demo  
  }

  const getLastActiveText = (lastActive: string) => {
    const date = new Date(lastActive)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Active now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team members...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <div className="flex">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3" />
            Team Management
          </h2>
          <p className="text-gray-600 mt-1">Manage team members, roles, and assignments</p>
        </div>
        
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>
                Add a new team member to your organization.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter full name..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email address..."
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({...newUser, role: value as User['role']})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="team_member">Team Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={newUser.status} 
                    onValueChange={(value) => setNewUser({...newUser, status: value as User['status']})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  placeholder="Enter department..."
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser} disabled={!newUser.name.trim() || !newUser.email.trim()}>
                  Add Team Member
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Team members</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.managers}</div>
            <p className="text-xs text-muted-foreground">Management roles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Crown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">Administrator roles</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => {
          const roleInfo = getRoleInfo(user.role)
          const RoleIcon = roleInfo.icon
          const taskCount = getUserTaskCount(user.id)
          const completedTasks = getUserCompletedTasks(user.id)
          
          return (
            <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={`${roleInfo.color} border-0`}
                    >
                      <RoleIcon className="h-3 w-3 mr-1" />
                      {roleInfo.label}
                    </Badge>
                    
                    <Badge 
                      variant={user.status === 'active' ? 'default' : 'secondary'}
                      className={user.status === 'active' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                      }
                    >
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {user.department && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {user.department}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <Activity className="h-4 w-4 mr-2" />
                    Last active: {getLastActiveText(user.last_active || user.created_at)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-blue-600">{taskCount}</div>
                    <div className="text-xs text-gray-500">Active Tasks</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-green-600">{completedTasks}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user)
                      setShowUserDialog(true)
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setShowDeleteDialog(user.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No team members found</p>
              <p className="text-xs text-gray-400 mt-1">Add team members to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this team member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteDialog && handleDeleteUser(showDeleteDialog)}
            >
              Remove Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}