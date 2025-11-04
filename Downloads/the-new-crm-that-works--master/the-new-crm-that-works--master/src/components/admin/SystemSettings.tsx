'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Settings,
  Save,
  RefreshCw,
  Database,
  Mail,
  Bell,
  Shield,
  Palette,
  Globe,
  Users,
  AlertTriangle
} from 'lucide-react'

export function SystemSettings() {
  const [settings, setSettings] = useState({
    // General Settings
    systemName: 'The Cubing Hub CRM',
    systemDescription: 'CRM system for managing cubing education programs',
    timezone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
    language: 'en',
    
    // Email Settings
    emailFrom: 'noreply@cubinghub.com',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    emailSignature: 'Best regards,\nThe Cubing Hub Team',
    
    // Notification Settings
    enableEmailNotifications: true,
    enableInAppNotifications: true,
    notifyOnNewUser: true,
    notifyOnNewComment: true,
    notifyOnTaskAssignment: true,
    
    // Security Settings
    requireStrongPasswords: true,
    sessionTimeout: '24',
    maxLoginAttempts: '5',
    requireEmailVerification: true,
    enableTwoFactor: false,
    
    // UI Settings
    defaultTheme: 'light',
    companyLogo: '',
    primaryColor: '#3B82F6',
    enableDarkMode: true,
    
    // System Limits
    maxUsersPerOrg: '100',
    maxProjectsPerUser: '50',
    maxTasksPerProject: '200',
    dataRetentionDays: '365'
  })
  
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      // In a real app, this would save to the database
      // await saveSystemSettings(settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    // Reset to default values
    setSettings({
      systemName: 'The Cubing Hub CRM',
      systemDescription: 'CRM system for managing cubing education programs',
      timezone: 'UTC',
      dateFormat: 'MM/dd/yyyy',
      language: 'en',
      emailFrom: 'noreply@cubinghub.com',
      smtpHost: '',
      smtpPort: '587',
      smtpUser: '',
      smtpPassword: '',
      emailSignature: 'Best regards,\nThe Cubing Hub Team',
      enableEmailNotifications: true,
      enableInAppNotifications: true,
      notifyOnNewUser: true,
      notifyOnNewComment: true,
      notifyOnTaskAssignment: true,
      requireStrongPasswords: true,
      sessionTimeout: '24',
      maxLoginAttempts: '5',
      requireEmailVerification: true,
      enableTwoFactor: false,
      defaultTheme: 'light',
      companyLogo: '',
      primaryColor: '#3B82F6',
      enableDarkMode: true,
      maxUsersPerOrg: '100',
      maxProjectsPerUser: '50',
      maxTasksPerProject: '200',
      dataRetentionDays: '365'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={settings.systemName}
                  onChange={(e) => setSettings(prev => ({ ...prev, systemName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemDescription">System Description</Label>
              <Textarea
                id="systemDescription"
                value={settings.systemDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, systemDescription: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={settings.dateFormat} onValueChange={(value) => setSettings(prev => ({ ...prev, dateFormat: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                    <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                    <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Default Language</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Settings
            </CardTitle>
            <CardDescription>Configure email server and templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emailFrom">From Address</Label>
                <Input
                  id="emailFrom"
                  type="email"
                  value={settings.emailFrom}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailFrom: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                  placeholder="smtp.gmail.com"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={settings.smtpUser}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailSignature">Email Signature</Label>
              <Textarea
                id="emailSignature"
                value={settings.emailSignature}
                onChange={(e) => setSettings(prev => ({ ...prev, emailSignature: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableEmailNotifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Send notifications via email</p>
              </div>
              <Switch
                id="enableEmailNotifications"
                checked={settings.enableEmailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableEmailNotifications: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableInAppNotifications">In-App Notifications</Label>
                <p className="text-sm text-gray-500">Show notifications within the app</p>
              </div>
              <Switch
                id="enableInAppNotifications"
                checked={settings.enableInAppNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableInAppNotifications: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifyOnNewUser">New User Notifications</Label>
                <p className="text-sm text-gray-500">Notify admins when new users register</p>
              </div>
              <Switch
                id="notifyOnNewUser"
                checked={settings.notifyOnNewUser}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifyOnNewUser: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifyOnNewComment">Comment Notifications</Label>
                <p className="text-sm text-gray-500">Notify users of new comments</p>
              </div>
              <Switch
                id="notifyOnNewComment"
                checked={settings.notifyOnNewComment}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifyOnNewComment: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifyOnTaskAssignment">Task Assignment Notifications</Label>
                <p className="text-sm text-gray-500">Notify users when tasks are assigned</p>
              </div>
              <Switch
                id="notifyOnTaskAssignment"
                checked={settings.notifyOnTaskAssignment}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifyOnTaskAssignment: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </CardTitle>
            <CardDescription>Configure security and access policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireStrongPasswords">Require Strong Passwords</Label>
                <p className="text-sm text-gray-500">Enforce strong password requirements</p>
              </div>
              <Switch
                id="requireStrongPasswords"
                checked={settings.requireStrongPasswords}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireStrongPasswords: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                <p className="text-sm text-gray-500">New users must verify their email</p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableTwoFactor">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Enable 2FA for all users</p>
              </div>
              <Switch
                id="enableTwoFactor"
                checked={settings.enableTwoFactor}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableTwoFactor: checked }))}
              />
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              System Limits
            </CardTitle>
            <CardDescription>Configure system resource limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxUsersPerOrg">Max Users Per Organization</Label>
                <Input
                  id="maxUsersPerOrg"
                  type="number"
                  value={settings.maxUsersPerOrg}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxUsersPerOrg: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxProjectsPerUser">Max Projects Per User</Label>
                <Input
                  id="maxProjectsPerUser"
                  type="number"
                  value={settings.maxProjectsPerUser}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxProjectsPerUser: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxTasksPerProject">Max Tasks Per Project</Label>
                <Input
                  id="maxTasksPerProject"
                  type="number"
                  value={settings.maxTasksPerProject}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxTasksPerProject: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataRetentionDays">Data Retention (days)</Label>
                <Input
                  id="dataRetentionDays"
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) => setSettings(prev => ({ ...prev, dataRetentionDays: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}