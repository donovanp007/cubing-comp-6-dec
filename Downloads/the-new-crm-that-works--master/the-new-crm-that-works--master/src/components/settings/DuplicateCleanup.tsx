'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StudentWithSchool } from '@/types'
import { getInitials } from '@/lib/utils'
import { Trash2, Users, AlertTriangle, CheckSquare, Square, RefreshCw } from 'lucide-react'

interface DuplicateGroup {
  id: string
  students: StudentWithSchool[]
  matchType: 'exact_name' | 'similar_name' | 'same_parent_phone' | 'same_parent_email'
  confidence: number
}

interface DuplicateCleanupProps {
  students: StudentWithSchool[]
  onDeleteStudent: (studentId: string) => Promise<void>
  onMergeStudents?: (keepStudentId: string, deleteStudentIds: string[]) => Promise<void>
}

export default function DuplicateCleanup({ students, onDeleteStudent, onMergeStudents }: DuplicateCleanupProps) {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([])
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(new Set())
  const [isScanning, setIsScanning] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Duplicate detection algorithm
  const findDuplicates = (): DuplicateGroup[] => {
    const groups: DuplicateGroup[] = []
    const processed = new Set<string>()

    students.forEach(student => {
      if (processed.has(student.id)) return

      const duplicates: StudentWithSchool[] = []
      let matchType: DuplicateGroup['matchType'] = 'exact_name'
      let confidence = 0

      students.forEach(otherStudent => {
        if (student.id === otherStudent.id || processed.has(otherStudent.id)) return

        // Exact name match
        if (student.first_name.toLowerCase() === otherStudent.first_name.toLowerCase() &&
            student.last_name.toLowerCase() === otherStudent.last_name.toLowerCase()) {
          duplicates.push(otherStudent)
          matchType = 'exact_name'
          confidence = 95
        }
        // Similar name match (Levenshtein distance)
        else if (calculateSimilarity(student.first_name, otherStudent.first_name) > 0.8 &&
                 calculateSimilarity(student.last_name, otherStudent.last_name) > 0.8) {
          duplicates.push(otherStudent)
          if (matchType === 'exact_name') matchType = 'similar_name'
          confidence = Math.max(confidence, 75)
        }
        // Same parent phone
        else if (student.parent_phone && otherStudent.parent_phone &&
                 normalizePhone(student.parent_phone) === normalizePhone(otherStudent.parent_phone)) {
          duplicates.push(otherStudent)
          if (!['exact_name', 'similar_name'].includes(matchType)) matchType = 'same_parent_phone'
          confidence = Math.max(confidence, 85)
        }
        // Same parent email
        else if (student.parent_email && otherStudent.parent_email &&
                 student.parent_email.toLowerCase() === otherStudent.parent_email.toLowerCase()) {
          duplicates.push(otherStudent)
          if (!['exact_name', 'similar_name', 'same_parent_phone'].includes(matchType)) matchType = 'same_parent_email'
          confidence = Math.max(confidence, 90)
        }
      })

      if (duplicates.length > 0) {
        const allStudents = [student, ...duplicates]
        groups.push({
          id: `group-${student.id}`,
          students: allStudents,
          matchType,
          confidence
        })
        allStudents.forEach(s => processed.add(s.id))
      }
    })

    return groups.sort((a, b) => b.confidence - a.confidence)
  }

  // Similarity calculation using Levenshtein distance
  const calculateSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length
    const len2 = str2.length
    const matrix = Array(len2 + 1).fill(0).map(() => Array(len1 + 1).fill(0))

    for (let i = 0; i <= len1; i++) matrix[0][i] = i
    for (let j = 0; j <= len2; j++) matrix[j][0] = j

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1]
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1,
            matrix[j][i - 1] + 1,
            matrix[j - 1][i - 1] + 1
          )
        }
      }
    }

    const maxLen = Math.max(len1, len2)
    return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen
  }

  // Normalize phone numbers for comparison
  const normalizePhone = (phone: string): string => {
    return phone.replace(/\D/g, '').replace(/^27/, '0')
  }

  const scanForDuplicates = () => {
    setIsScanning(true)
    setTimeout(() => {
      const groups = findDuplicates()
      setDuplicateGroups(groups)
      setIsScanning(false)
    }, 1000)
  }

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedForDeletion)
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId)
    } else {
      newSelection.add(studentId)
    }
    setSelectedForDeletion(newSelection)
  }

  const selectAllInGroup = (group: DuplicateGroup, keepOne: boolean = true) => {
    const newSelection = new Set(selectedForDeletion)
    const studentsToSelect = keepOne ? group.students.slice(1) : group.students
    studentsToSelect.forEach(student => newSelection.add(student.id))
    setSelectedForDeletion(newSelection)
  }

  const deleteSelected = async () => {
    if (selectedForDeletion.size === 0) return
    
    setIsDeleting(true)
    try {
      const studentIds = Array.from(selectedForDeletion)
      for (const studentId of studentIds) {
        await onDeleteStudent(studentId)
      }
      setSelectedForDeletion(new Set())
      // Refresh the duplicate scan
      scanForDuplicates()
    } catch (error) {
      console.error('Error deleting students:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getMatchTypeLabel = (matchType: DuplicateGroup['matchType']) => {
    switch (matchType) {
      case 'exact_name': return 'Exact Name Match'
      case 'similar_name': return 'Similar Name'
      case 'same_parent_phone': return 'Same Phone'
      case 'same_parent_email': return 'Same Email'
    }
  }

  const getMatchTypeColor = (matchType: DuplicateGroup['matchType']) => {
    switch (matchType) {
      case 'exact_name': return 'bg-red-100 text-red-800'
      case 'similar_name': return 'bg-orange-100 text-orange-800'
      case 'same_parent_phone': return 'bg-yellow-100 text-yellow-800'
      case 'same_parent_email': return 'bg-blue-100 text-blue-800'
    }
  }

  useEffect(() => {
    if (students.length > 0) {
      scanForDuplicates()
    }
  }, [students])

  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <Users className="h-5 w-5" />
              <span>Duplicate Student Cleanup</span>
            </CardTitle>
            <CardDescription className="text-orange-600">
              Find and remove duplicate student records to clean up your database
            </CardDescription>
          </div>
          <Button onClick={scanForDuplicates} disabled={isScanning} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan Again'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-orange-800">
              <strong>Warning:</strong> This is a destructive operation. Please review duplicates carefully before deleting. 
              Always keep the most complete record and delete the others.
            </div>
          </div>
        </div>

        {duplicateGroups.length === 0 && !isScanning && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No duplicates found!</p>
            <p className="text-sm">Your student database is clean.</p>
          </div>
        )}

        {isScanning && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-orange-500" />
            <p className="text-lg font-medium">Scanning for duplicates...</p>
          </div>
        )}

        {duplicateGroups.map((group) => (
          <Card key={group.id} className="border-2 border-dashed border-orange-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getMatchTypeColor(group.matchType)}>
                    {getMatchTypeLabel(group.matchType)}
                  </Badge>
                  <Badge variant="outline">
                    {group.confidence}% confidence
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {group.students.length} students
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => selectAllInGroup(group, true)}
                >
                  Select All Except First
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {group.students.map((student, index) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      selectedForDeletion.has(student.id)
                        ? 'bg-red-50 border-red-200'
                        : index === 0
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedForDeletion.has(student.id)}
                        onCheckedChange={() => toggleStudentSelection(student.id)}
                        className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-sm">
                          {getInitials(student.first_name, student.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">
                            {student.first_name} {student.last_name}
                          </h4>
                          {index === 0 && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              SUGGESTED KEEPER
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div>School: {student.schools?.name || 'No School'} | Grade: {student.grade}</div>
                          <div>Parent: {student.parent_name} | Phone: {student.parent_phone}</div>
                          <div>Email: {student.parent_email || 'No email'}</div>
                          <div>Status: {student.status} | Payment: {student.payment_status}</div>
                          <div className="text-xs">ID: {student.id}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {selectedForDeletion.size > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-800">
                    {selectedForDeletion.size} student{selectedForDeletion.size !== 1 ? 's' : ''} selected for deletion
                  </p>
                  <p className="text-sm text-red-600">
                    This action cannot be undone. Please review carefully.
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedForDeletion(new Set())}
                    disabled={isDeleting}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={deleteSelected}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : `Delete Selected (${selectedForDeletion.size})`}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}