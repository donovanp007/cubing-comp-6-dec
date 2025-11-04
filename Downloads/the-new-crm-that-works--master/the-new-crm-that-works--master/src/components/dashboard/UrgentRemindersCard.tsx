'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Mock urgent reminders - in real app this would come from API
const mockUrgentReminders = [
  {
    id: 1,
    title: "Follow up on payment",
    description: "Parent hasn't responded to payment reminder emails",
    priority: "urgent" as const,
    dueDate: "2025-01-09",
    studentName: "John Smith",
    schoolName: "Greenfield Primary",
    taskType: "payment"
  },
  {
    id: 2,
    title: "Certificate ceremony deadline", 
    description: "Schedule certificate presentation before Friday",
    priority: "urgent" as const,
    dueDate: "2025-01-10",
    studentName: "Sarah Johnson",
    schoolName: "Parktown High",
    taskType: "certificate"
  },
  {
    id: 3,
    title: "Equipment delivery overdue",
    description: "Cubes should have been delivered 3 days ago",
    priority: "urgent" as const,
    dueDate: "2025-01-06",
    studentName: "Mike Davis",
    schoolName: "Riverside Academy",
    taskType: "equipment"
  }
]

export default function UrgentRemindersCard() {
  const [urgentReminders, setUrgentReminders] = useState(mockUrgentReminders)
  const router = useRouter()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'payment': return 'bg-red-100 text-red-800 border-red-200'
      case 'certificate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'equipment': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleViewAllReminders = () => {
    router.push('/reminders')
  }

  if (urgentReminders.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-green-800">
              🎉 No Urgent Reminders
            </CardTitle>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              All caught up!
            </Badge>
          </div>
          <CardDescription className="text-green-600">
            Great job! All urgent tasks have been completed.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewAllReminders}
            className="w-full bg-white hover:bg-green-50 border-green-200 text-green-700"
          >
            View All Reminders
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-red-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Urgent Reminders
          </CardTitle>
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
            {urgentReminders.length} urgent
          </Badge>
        </div>
        <CardDescription className="text-red-600">
          Tasks requiring immediate attention
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {urgentReminders.slice(0, 3).map((reminder) => {
          const daysOverdue = getDaysOverdue(reminder.dueDate)
          
          return (
            <div key={reminder.id} className="bg-white rounded-lg p-3 border border-red-200 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-red-100 text-red-700 text-xs font-semibold">
                    {getInitials(reminder.studentName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {reminder.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {reminder.description}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0 ml-2">
                      <Badge 
                        className={`text-xs ${getTaskTypeColor(reminder.taskType)}`}
                        variant="outline"
                      >
                        {reminder.taskType}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-xs text-gray-500 space-x-3">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {reminder.studentName}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {daysOverdue > 0 ? (
                          <span className="text-red-600 font-medium">
                            {daysOverdue} days overdue
                          </span>
                        ) : (
                          <span className="text-orange-600 font-medium">
                            Due today
                          </span>
                        )}
                      </span>
                    </div>
                    <PriorityBadge priority={reminder.priority} size="sm" showIcon={false} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {urgentReminders.length > 3 && (
          <div className="text-center py-2">
            <p className="text-xs text-red-600">
              +{urgentReminders.length - 3} more urgent reminders
            </p>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewAllReminders}
          className="w-full bg-white hover:bg-red-50 border-red-200 text-red-700"
        >
          View All Reminders
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}