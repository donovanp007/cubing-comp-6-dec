'use client';

import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Search, X } from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade: number;
}

interface BulkStudentSelectorProps {
  students: Student[];
  selectedIds: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function BulkStudentSelector({
  students,
  selectedIds,
  onSelectionChange,
  onNext,
  isLoading = false,
}: BulkStudentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');

  // Get unique grades sorted
  const uniqueGrades = useMemo(() => {
    const grades = new Set(students.map((s) => s.grade));
    return Array.from(grades).sort((a, b) => a - b);
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        searchQuery === '' ||
        `${student.first_name} ${student.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesGrade = gradeFilter === 'all' || student.grade.toString() === gradeFilter;

      return matchesSearch && matchesGrade;
    });
  }, [students, searchQuery, gradeFilter]);

  // Toggle individual student
  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    onSelectionChange(newSelected);
  };

  // Select/deselect all filtered students
  const toggleAllFiltered = () => {
    const filteredIds = new Set(filteredStudents.map((s) => s.id));
    if (filteredIds.size === 0) return;

    // If all filtered are selected, deselect them. Otherwise, select all filtered.
    const allSelected = filteredStudents.every((s) => selectedIds.has(s.id));

    if (allSelected) {
      const newSelected = new Set(selectedIds);
      filteredIds.forEach((id) => newSelected.delete(id));
      onSelectionChange(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      filteredIds.forEach((id) => newSelected.add(id));
      onSelectionChange(newSelected);
    }
  };

  // Clear all selections
  const clearAll = () => {
    onSelectionChange(new Set());
  };

  const allFilteredSelected = filteredStudents.every((s) => selectedIds.has(s.id));
  const someFilteredSelected = filteredStudents.some((s) => selectedIds.has(s.id));

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{selectedIds.size}</div>
              <div className="text-sm text-gray-600">Students Selected</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{students.length}</div>
              <div className="text-sm text-gray-600">Available Students</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Select Students</CardTitle>
          <CardDescription>
            {filteredStudents.length} students match your filters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Grade Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Grade</label>
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

          {/* Select All / Clear All */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllFiltered}
              className="flex-1"
              disabled={filteredStudents.length === 0}
            >
              {allFilteredSelected ? 'Deselect All Filtered' : 'Select All Filtered'}
            </Button>
            {selectedIds.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="flex-1"
              >
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No students match your filters</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => toggleStudent(student.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition cursor-pointer ${
                      selectedIds.has(student.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <Checkbox
                      checked={selectedIds.has(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="h-5 w-5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm text-gray-500">Grade {student.grade}</p>
                    </div>
                    {selectedIds.has(student.id) && (
                      <Badge className="bg-blue-600 flex-shrink-0">Selected</Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onNext}
          disabled={selectedIds.size === 0 || isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-lg"
        >
          {isLoading ? 'Loading...' : `Next: Assign Events (${selectedIds.size} students) →`}
        </Button>
      </div>
    </div>
  );
}
