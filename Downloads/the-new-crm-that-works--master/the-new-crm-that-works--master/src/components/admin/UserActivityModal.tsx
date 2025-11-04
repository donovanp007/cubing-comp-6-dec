'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User } from '@/types'
import { 
  MessageCircle, 
  FolderKanban, 
  ClipboardList, 
  Calendar,
  Activity,
  TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'

interface UserActivityModalProps {
  user: User
  onClose: () => void
  getUserActivity: (userId: string) => Promise<any>
}

export function UserActivityModal({ user, onClose, getUserActivity }: UserActivityModalProps) {
  const [activityData, setActivityData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await getUserActivity(user.id)
        setActivityData(data)
      } catch (error) {
        console.error('Failed to fetch user activity:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [user.id, getUserActivity])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'ceo': return 'bg-purple-100 text-purple-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'team_member': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div>
              <span>User Activity: {user.name}</span>
              <Badge className={`ml-2 ${getRoleColor(user.role)}`}>
                {user.role.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Detailed activity overview for {user.email}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  User Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-500">Activity Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-500">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-gray-500">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-gray-500">Tasks</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Department:</span> {user.department || 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <Badge className={`ml-1 ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {(user.status || 'active').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Joined:</span> {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Last Active:</span> {user.last_active ? format(new Date(user.last_active), 'MMM d, yyyy') : 'Never'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {activityData && (
              <Tabs defaultValue="comments" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="comments" className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Recent Comments</span>
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="flex items-center space-x-2">
                    <FolderKanban className="h-4 w-4" />
                    <span>Projects Owned</span>
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="flex items-center space-x-2">
                    <ClipboardList className="h-4 w-4" />
                    <span>Assigned Tasks</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="comments" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Comments</CardTitle>
                      <CardDescription>Latest comments by {user.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {activityData.recent_comments?.length > 0 ? (
                        <div className="space-y-3">
                          {activityData.recent_comments.map((comment: any) => (
                            <div key={comment.id} className="border-l-4 border-blue-200 pl-4">
                              <div className="text-sm text-gray-600 mb-1">
                                On {comment.entity_type} • {format(new Date(comment.created_at), 'MMM d, yyyy')}
                              </div>
                              <div className="text-gray-900">{comment.content}</div>
                              {comment.edited && (
                                <div className="text-xs text-gray-500 mt-1">(edited)</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No comments found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="projects" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Owned Projects</CardTitle>
                      <CardDescription>Projects created and managed by {user.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {activityData.owned_projects?.length > 0 ? (
                        <div className="space-y-3">
                          {activityData.owned_projects.map((project: any) => (
                            <div key={project.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{project.name}</h4>
                                <Badge variant="outline">
                                  {project.status || 'Active'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                              <div className="text-xs text-gray-500">
                                Created {format(new Date(project.created_at), 'MMM d, yyyy')}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FolderKanban className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No projects found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Assigned Tasks</CardTitle>
                      <CardDescription>Tasks assigned to {user.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {activityData.assigned_tasks?.length > 0 ? (
                        <div className="space-y-3">
                          {activityData.assigned_tasks.map((task: any) => (
                            <div key={task.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{task.title}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">
                                    {task.priority || 'Medium'}
                                  </Badge>
                                  <Badge className={
                                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }>
                                    {task.status || 'Pending'}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Created {format(new Date(task.created_at), 'MMM d, yyyy')}</span>
                                {task.due_date && (
                                  <span>Due {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No tasks found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}