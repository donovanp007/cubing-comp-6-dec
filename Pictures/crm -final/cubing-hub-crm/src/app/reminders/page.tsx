'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function RemindersPage() {
  const reminders = [
    {
      id: 1,
      title: "Follow up with Greenfield Primary",
      description: "Check on enrollment progress for Q2",
      priority: "high",
      dueDate: "2025-01-15",
      status: "pending"
    },
    {
      id: 2,
      title: "Certificate ceremony - Parktown High",
      description: "Organize certificate presentation for completed students",
      priority: "medium",
      dueDate: "2025-01-20",
      status: "pending"
    },
    {
      id: 3,
      title: "Inventory restock",
      description: "Order new cube sets for upcoming programs",
      priority: "low",
      dueDate: "2025-01-25",
      status: "pending"
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reminders</h2>
        <Button>Add Reminder</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminders.length}</div>
            <p className="text-xs text-muted-foreground">
              Active tasks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reminders.filter(r => r.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Urgent tasks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Due This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Coming up soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Tasks finished
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Reminders</CardTitle>
          <CardDescription>
            Your upcoming tasks and follow-ups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{reminder.title}</h4>
                    <Badge variant={getPriorityColor(reminder.priority) as any}>
                      {reminder.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{reminder.description}</p>
                  <p className="text-xs text-muted-foreground">Due: {reminder.dueDate}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button size="sm">Complete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}