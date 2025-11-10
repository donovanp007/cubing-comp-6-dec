'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Shield,
  AlertCircle,
  Eye,
  Edit,
  Trash,
  UserPlus,
  LogOut,
  Download,
  Filter,
  Search,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format } from 'date-fns'

interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: string
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  CREATE_USER: 'bg-green-100 text-green-800',
  UPDATE_USER: 'bg-blue-100 text-blue-800',
  DELETE_USER: 'bg-red-100 text-red-800',
  LOGIN: 'bg-purple-100 text-purple-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
  VIEW_STUDENT: 'bg-yellow-100 text-yellow-800',
  CREATE_STUDENT: 'bg-green-100 text-green-800',
  UPDATE_STUDENT: 'bg-blue-100 text-blue-800',
  DELETE_STUDENT: 'bg-red-100 text-red-800',
  VIEW_PAYMENT: 'bg-yellow-100 text-yellow-800',
  CREATE_PAYMENT: 'bg-green-100 text-green-800',
  UPDATE_PAYMENT: 'bg-blue-100 text-blue-800',
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREATE_USER: <UserPlus className="h-4 w-4" />,
  UPDATE_USER: <Edit className="h-4 w-4" />,
  DELETE_USER: <Trash className="h-4 w-4" />,
  LOGIN: <Shield className="h-4 w-4" />,
  LOGOUT: <LogOut className="h-4 w-4" />,
  VIEW_STUDENT: <Eye className="h-4 w-4" />,
}

export function SecurityAuditLog() {
  const { profile } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Check if user has permission
  const canViewAuditLogs = ['ceo', 'admin'].includes(profile?.role || '')

  useEffect(() => {
    if (canViewAuditLogs) {
      fetchAuditLogs()
    }
  }, [canViewAuditLogs])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('audit_logs')
        .select(
          `
          id,
          user_id,
          action,
          resource_type,
          resource_id,
          old_values,
          new_values,
          ip_address,
          user_agent,
          timestamp,
          created_at
        `
        )
        .order('timestamp', { ascending: false })
        .limit(500)

      if (err) throw err

      setLogs(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'User ID',
      'Action',
      'Resource Type',
      'Resource ID',
      'Details',
    ]
    const rows = filteredLogs.map(log => [
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.user_id,
      log.action,
      log.resource_type,
      log.resource_id || '-',
      JSON.stringify(log.new_values || {}),
    ])

    const csv =
      [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === 'all' || log.action === actionFilter

    return matchesSearch && matchesAction
  })

  if (!canViewAuditLogs) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">Access Denied</h3>
              <p className="text-sm text-orange-700 mt-1">
                Only CEO and Admin roles can view audit logs.
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
        <h1 className="text-3xl font-bold tracking-tight">Security Audit Log</h1>
        <p className="text-gray-600 mt-1">
          Monitor all system activity and user actions for security and compliance.
        </p>
      </div>

      {/* Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Events</span>
            </div>
            <p className="text-2xl font-bold mt-1">{logs.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">User Creates</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {logs.filter(l => l.action === 'CREATE_USER').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Updates</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-blue-600">
              {logs.filter(l => l.action.includes('UPDATE')).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trash className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Deletes</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-600">
              {logs.filter(l => l.action === 'DELETE_USER').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Activity Log</span>
              </CardTitle>
              <CardDescription>
                Every action is logged for security and audit purposes
              </CardDescription>
            </div>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by user or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE_USER">Create User</SelectItem>
                <SelectItem value="UPDATE_USER">Update User</SelectItem>
                <SelectItem value="DELETE_USER">Delete User</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedLog(log)
                          setShowDetails(true)
                        }}
                      >
                        <td className="px-6 py-4 text-sm">
                          <span className="text-gray-900">
                            {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {log.user_id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}>
                            <span className="mr-2">
                              {ACTION_ICONS[log.action] || <Eye className="h-3 w-3" />}
                            </span>
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.resource_type}
                          {log.resource_id && (
                            <span className="ml-1 text-gray-400">
                              ({log.resource_id.slice(0, 8)}...)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedLog(log)
                              setShowDetails(true)
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredLogs.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500">No audit logs found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information about this system action
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Timestamp</p>
                  <p className="mt-1 font-mono text-sm">
                    {format(new Date(selectedLog.timestamp), 'PPpp')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Action</p>
                  <p className="mt-1">
                    <Badge className={ACTION_COLORS[selectedLog.action] || 'bg-gray-100 text-gray-800'}>
                      {selectedLog.action}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">User ID</p>
                  <p className="mt-1 font-mono text-sm">{selectedLog.user_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Resource Type</p>
                  <p className="mt-1 text-sm">{selectedLog.resource_type}</p>
                </div>
              </div>

              {selectedLog.ip_address && (
                <div>
                  <p className="text-sm font-medium text-gray-600">IP Address</p>
                  <p className="mt-1 font-mono text-sm">{selectedLog.ip_address}</p>
                </div>
              )}

              {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Old Values</p>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">New Values</p>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
