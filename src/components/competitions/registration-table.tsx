'use client';

import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { updateStudentEvents } from '@/app/actions/registrations';
import { Search, Edit2, Trash2, AlertCircle } from 'lucide-react';

interface Registration {
  id: string;
  student_id: string;
  student_name: string;
  grade: number;
  events: Array<{
    id: string;
    display_name: string;
  }>;
}

interface CompetitionEvent {
  id: string;
  display_name: string;
}

interface RegistrationTableProps {
  registrations: Registration[];
  events: CompetitionEvent[];
  onDeregister: (registrationIds: string[]) => void;
  isDeleting?: boolean;
}

export function RegistrationTable({
  registrations,
  events,
  onDeregister,
  isDeleting = false,
}: RegistrationTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editingRegistrationId, setEditingRegistrationId] = useState<string | null>(null);
  const [editingEvents, setEditingEvents] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Get unique grades
  const uniqueGrades = useMemo(() => {
    const grades = new Set(registrations.map((r) => r.grade));
    return Array.from(grades).sort((a, b) => a - b);
  }, [registrations]);

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesSearch =
        searchQuery === '' || reg.student_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = gradeFilter === 'all' || reg.grade.toString() === gradeFilter;
      return matchesSearch && matchesGrade;
    });
  }, [registrations, searchQuery, gradeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalEvents = 0;
    for (const reg of registrations) {
      totalEvents += reg.events.length;
    }
    return {
      totalRegistered: registrations.length,
      totalEvents,
      avgEventsPerStudent:
        registrations.length > 0 ? (totalEvents / registrations.length).toFixed(1) : 0,
    };
  }, [registrations]);

  const toggleRow = (registrationId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(registrationId)) {
      newSelected.delete(registrationId);
    } else {
      newSelected.add(registrationId);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllFiltered = () => {
    const filteredIds = new Set(filteredRegistrations.map((r) => r.id));
    if (filteredIds.size === 0) return;

    const allSelected = filteredRegistrations.every((r) => selectedRows.has(r.id));

    if (allSelected) {
      const newSelected = new Set(selectedRows);
      filteredIds.forEach((id) => newSelected.delete(id));
      setSelectedRows(newSelected);
    } else {
      const newSelected = new Set(selectedRows);
      filteredIds.forEach((id) => newSelected.add(id));
      setSelectedRows(newSelected);
    }
  };

  const startEditingEvents = (registrationId: string, currentEventIds: string[]) => {
    setEditingRegistrationId(registrationId);
    setEditingEvents(new Set(currentEventIds));
  };

  const toggleEventInEdit = (eventId: string) => {
    const newSet = new Set(editingEvents);
    if (newSet.has(eventId)) {
      newSet.delete(eventId);
    } else {
      newSet.add(eventId);
    }
    setEditingEvents(newSet);
  };

  const saveEventChanges = async () => {
    if (!editingRegistrationId) return;

    try {
      setIsSaving(true);

      const registration = registrations.find((r) => r.id === editingRegistrationId);
      if (!registration) return;

      const result = await updateStudentEvents(
        editingRegistrationId,
        registration.student_id,
        Array.from(editingEvents)
      );

      if (result.success) {
        toast({
          title: 'Success',
          description: `Events updated for ${registration.student_name}`,
        });
        setEditingRegistrationId(null);
        setEditingEvents(new Set());
        // Trigger parent refresh
        window.location.reload();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update events',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeregister = () => {
    if (selectedRows.size === 0) {
      toast({
        title: 'No students selected',
        description: 'Select students to deregister',
        variant: 'destructive',
      });
      return;
    }

    const selectedList = Array.from(selectedRows);
    const count = selectedList.length;

    if (window.confirm(`Remove ${count} student${count !== 1 ? 's' : ''}?`)) {
      onDeregister(selectedList);
      setSelectedRows(new Set());
    }
  };

  const allFilteredSelected = filteredRegistrations.every((r) => selectedRows.has(r.id));
  const someFilteredSelected = filteredRegistrations.some((r) => selectedRows.has(r.id));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalRegistered}</div>
              <div className="text-sm text-gray-600">Total Registered</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.avgEventsPerStudent}</div>
              <div className="text-sm text-gray-600">Avg per Student</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Manage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {uniqueGrades.map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllFiltered}
              disabled={filteredRegistrations.length === 0}
              className="flex-1"
            >
              {allFilteredSelected ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedRows.size > 0 && (
              <>
                <Badge variant="secondary" className="px-3">
                  {selectedRows.size} selected
                </Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeregister}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? 'Removing...' : 'Deregister Selected'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No registrations found</p>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allFilteredSelected}
                        onCheckedChange={toggleAllFiltered}
                      />
                    </TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(registration.id)}
                          onChange={() => toggleRow(registration.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{registration.student_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Grade {registration.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {registration.events.length === 0 ? (
                            <span className="text-sm text-gray-500">No events</span>
                          ) : (
                            registration.events.map((event) => (
                              <Badge key={event.id} className="bg-blue-100 text-blue-800">
                                {event.display_name}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          open={editingRegistrationId === registration.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingRegistrationId(null);
                              setEditingEvents(new Set());
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                startEditingEvents(
                                  registration.id,
                                  registration.events.map((e) => e.id)
                                )
                              }
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Events</DialogTitle>
                              <DialogDescription>
                                Update events for {registration.student_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-3 max-h-96 overflow-y-auto">
                                {events.map((event) => (
                                  <div key={event.id} className="flex items-center gap-3">
                                    <Checkbox
                                      id={`event-${event.id}`}
                                      checked={editingEvents.has(event.id)}
                                      onChange={() => toggleEventInEdit(event.id)}
                                    />
                                    <label
                                      htmlFor={`event-${event.id}`}
                                      className="text-sm font-medium cursor-pointer flex-1"
                                    >
                                      {event.display_name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2 pt-4 border-t">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setEditingRegistrationId(null);
                                    setEditingEvents(new Set());
                                  }}
                                  disabled={isSaving}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={saveEventChanges}
                                  disabled={isSaving || editingEvents.size === 0}
                                  className="flex-1"
                                >
                                  {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
