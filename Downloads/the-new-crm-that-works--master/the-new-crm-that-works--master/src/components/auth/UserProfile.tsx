'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  User, 
  Settings, 
  LogOut, 
  Edit3, 
  Save, 
  X,
  Shield,
  Briefcase,
  Mail,
  Calendar
} from 'lucide-react'

export function UserProfileButton() {
  const { user, profile, signOut } = useAuth()
  const [showProfile, setShowProfile] = useState(false)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'ceo': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!user || !profile) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{profile.full_name}</p>
              <p className="w-[200px] truncate text-sm text-gray-600">
                {profile.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfile(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              View and manage your profile information
            </DialogDescription>
          </DialogHeader>
          <UserProfileContent onClose={() => setShowProfile(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function UserProfileContent({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    department: profile?.department || ''
  })

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'ceo': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator'
      case 'ceo': return 'CEO'
      case 'manager': return 'Manager'
      case 'team_member': return 'Team Member'
      default: return role
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateProfile(formData)
      if (result.success) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profile?.full_name || '',
      department: profile?.department || ''
    })
    setIsEditing(false)
  }

  if (!profile) return null

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
          <AvatarFallback className="text-xl">{getInitials(profile.full_name)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{profile.full_name}</h3>
          <Badge className={getRoleBadgeColor(profile.role)}>
            <Shield className="h-3 w-3 mr-1" />
            {getRoleDisplayName(profile.role)}
          </Badge>
        </div>
      </div>

      {/* Profile Information */}
      <div className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Enter department"
                disabled={isLoading}
              />
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
            {profile.department && (
              <div className="flex items-center space-x-3">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{profile.department}</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Joined</p>
                <p className="font-medium">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  )
}