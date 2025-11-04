'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useSupabaseStudents } from '@/hooks/useSupabaseStudents'
import DuplicateCleanup from '@/components/settings/DuplicateCleanup'
import MessageTemplates from '@/components/settings/MessageTemplates'

export default function SettingsPage() {
  const [showDuplicateCleanup, setShowDuplicateCleanup] = useState(false)
  const { students, deleteStudent, testConnection } = useSupabaseStudents()

  const handleTestConnection = async () => {
    const result = await testConnection()
    console.log(result)
  }

  const handleDeleteStudent = async (studentId: string) => {
    await deleteStudent(studentId)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Configure your organization's basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input id="org-name" defaultValue="The Cubing Hub" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" type="email" defaultValue="admin@thecubinghub.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="123 Cubing Street, Johannesburg, 2000" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Program Settings</CardTitle>
              <CardDescription>
                Configure default program parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-fee">Default Program Fee (R)</Label>
                  <Input id="default-fee" type="number" defaultValue="150" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program-duration">Program Duration (weeks)</Label>
                  <Input id="program-duration" type="number" defaultValue="8" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <MessageTemplates />
        </TabsContent>
        
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>
                Manage your Supabase database connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supabase-url">Supabase URL</Label>
                <Input 
                  id="supabase-url" 
                  defaultValue="https://xhwurctmoubmzsgybpmu.supabase.co"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connection-status">Connection Status</Label>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Connected</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Database Actions</Label>
                {/* Database action buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleTestConnection}>
                    Test Connection
                  </Button>
                  <Button variant="outline">Backup Data</Button>
                  <Button variant="outline">View Logs</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDuplicateCleanup(!showDuplicateCleanup)}
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    {showDuplicateCleanup ? 'Hide' : 'Find'} Duplicates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {showDuplicateCleanup && (
            <DuplicateCleanup
              students={students}
              onDeleteStudent={handleDeleteStudent}
            />
          )}
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Notification settings coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage team members and access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                User management features coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}