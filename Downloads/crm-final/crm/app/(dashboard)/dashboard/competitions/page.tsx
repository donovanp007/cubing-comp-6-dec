'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { CompetitionWizard } from '@/components/competitions/CompetitionWizard'
import { CompetitionList } from '@/components/competitions/CompetitionList'
import type { CompetitionListItem, CompetitionSearchParams } from '@/lib/types/competition.types'

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<CompetitionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchParams, setSearchParams] = useState<CompetitionSearchParams>({})
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  // Fetch competitions
  const fetchCompetitions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      if (searchParams.query) queryParams.set('query', searchParams.query)
      if (searchParams.status) queryParams.set('status', searchParams.status)
      if (searchParams.leagueId) queryParams.set('leagueId', searchParams.leagueId)
      queryParams.set('page', pagination.page.toString())
      queryParams.set('limit', pagination.limit.toString())
      queryParams.set('sortBy', 'date')
      queryParams.set('sortOrder', 'desc')

      const response = await fetch(`/api/competitions?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch competitions')
      }

      const data = await response.json()
      setCompetitions(data.competitions)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [searchParams, pagination.page, pagination.limit])

  useEffect(() => {
    fetchCompetitions()
  }, [fetchCompetitions])

  const handleCreateSuccess = async (competitionId: string) => {
    setIsCreateDialogOpen(false)
    await fetchCompetitions()
    // TODO: Navigate to competition detail page
  }

  const handleDelete = async (competitionId: string) => {
    if (!confirm('Are you sure you want to delete this competition?')) return

    try {
      const response = await fetch(`/api/competitions/${competitionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete competition')
      }

      await fetchCompetitions()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete competition')
    }
  }

  // Calculate statistics
  const stats = {
    total: pagination.total,
    upcoming: competitions.filter(
      (c) => c.status === 'upcoming' || c.status === 'registration_open'
    ).length,
    inProgress: competitions.filter((c) => c.status === 'in_progress').length,
    completed: competitions.filter((c) => c.status === 'completed').length,
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
          <p className="text-muted-foreground">
            Manage competitions, events, and registrations
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Competition
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Competitions</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Upcoming</CardDescription>
            <CardTitle className="text-3xl">{stats.upcoming}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Competitions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Competitions</CardTitle>
          <CardDescription>
            {pagination.total} competitions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <p className="text-muted-foreground">Loading competitions...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive mb-2">Error: {error}</p>
              <Button onClick={fetchCompetitions} variant="outline">
                Retry
              </Button>
            </div>
          ) : (
            <CompetitionList
              competitions={competitions}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Competition Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <CompetitionWizard
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
