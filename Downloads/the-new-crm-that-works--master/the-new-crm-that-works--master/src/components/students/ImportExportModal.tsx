'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye
} from 'lucide-react'
import { StudentWithSchool, StudentInsert, StudentImport } from '@/types'

interface ImportExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: StudentWithSchool[] // Filtered students
  allStudents?: StudentWithSchool[] // All students for comparison
  onImportStudents: (students: StudentInsert[]) => void
}

interface ImportValidation {
  valid: StudentImport[]
  errors: Array<{
    row: number
    field: string
    message: string
    data: any
  }>
}

const CSV_HEADERS = [
  'Student Name',
  'Parent Name',
  'Phone',
  'Parent email',
  'School Name',
  'photo consent'
]

export default function ImportExportModal({
  open,
  onOpenChange,
  students,
  allStudents,
  onImportStudents
}: ImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('export')
  const [dragActive, setDragActive] = useState(false)
  const [importData, setImportData] = useState<ImportValidation | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportToCSV = (studentsToExport: StudentWithSchool[], filename: string) => {
    const csvContent = [
      CSV_HEADERS.join(','),
      ...studentsToExport.map(student => [
        `"${student.first_name} ${student.last_name}"`,
        `"${student.parent_name}"`,
        `"${student.parent_phone}"`,
        `"${student.parent_email}"`,
        `"${student.schools?.name || ''}"`,
        student.consent_received ? 'Yes' : 'No'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportFilteredStudents = () => {
    const filename = `filtered_students_export_${new Date().toISOString().split('T')[0]}.csv`
    exportToCSV(students, filename)
  }

  const exportAllStudents = () => {
    const filename = `all_students_export_${new Date().toISOString().split('T')[0]}.csv`
    exportToCSV(allStudents || students, filename)
  }

  const validateImportData = (csvText: string): ImportValidation => {
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    const validation: ImportValidation = {
      valid: [],
      errors: []
    }

    // Check headers
    const requiredHeaders = ['Student Name', 'Parent Name', 'Phone', 'Parent email', 'School Name']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    
    if (missingHeaders.length > 0) {
      validation.errors.push({
        row: 0,
        field: 'headers',
        message: `Missing required headers: ${missingHeaders.join(', ')}`,
        data: headers
      })
      return validation
    }

    // Process data rows
    lines.slice(1).forEach((line, index) => {
      const row = index + 2 // +2 because we skipped header and arrays are 0-indexed
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      
      if (values.length !== headers.length) {
        validation.errors.push({
          row,
          field: 'structure',
          message: `Row has ${values.length} columns, expected ${headers.length}`,
          data: values
        })
        return
      }

      const studentData: any = {}
      headers.forEach((header, i) => {
        studentData[header] = values[i]
      })

      // Parse Student Name into first and last name
      const fullName = studentData['Student Name']?.trim() || ''
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || nameParts[0] || ''

      // Validate required fields
      const errors: string[] = []
      
      if (!fullName) errors.push('Student Name is required')
      if (!studentData['Parent Name']?.trim()) errors.push('Parent Name is required')
      if (!studentData['Phone']?.trim()) errors.push('Phone is required')
      if (!studentData['Parent email']?.trim()) errors.push('Parent email is required')
      if (!studentData['School Name']?.trim()) errors.push('School Name is required')
      
      // Validate email format
      if (studentData['Parent email'] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData['Parent email'])) {
        errors.push('Invalid email format')
      }

      if (errors.length > 0) {
        validation.errors.push({
          row,
          field: 'validation',
          message: errors.join('; '),
          data: studentData
        })
      } else {
        // Create valid student record
        const validStudent: StudentImport = {
          first_name: firstName,
          last_name: lastName,
          school_id: '', // Will be resolved from School Name
          school_name: studentData['School Name'].trim(), // Add this for school lookup/creation
          grade: 5, // Default grade since we don't collect it
          parent_name: studentData['Parent Name'].trim(),
          parent_phone: studentData['Phone'].trim(),
          parent_email: studentData['Parent email'].trim(),
          parent_notes: studentData['Parent Notes']?.trim() || null, // Optional parent notes field
          class_type: 'Beginner Cubing', // Default class type
          status: 'active', // Default status
          payment_status: 'outstanding', // Default payment status
          consent_received: studentData['photo consent'] === 'Yes',
          certificate_given: false,
          cube_received: false,
          invoice_sent: false, // New field - default to not sent
          cubing_competition_invited: false, // New field - default to not invited
          items_purchased: [],
          tags: [],
          notes: ''
        }
        validation.valid.push(validStudent)
      }
    })

    return validation
  }

  const handleFileUpload = (file: File) => {
    setIsProcessing(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const csvText = e.target?.result as string
      const validation = validateImportData(csvText)
      setImportData(validation)
      setIsProcessing(false)
    }
    
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find(file => file.name.endsWith('.csv'))
    
    if (csvFile) {
      handleFileUpload(csvFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleImport = () => {
    if (importData && importData.valid.length) {
      onImportStudents(importData.valid)
      setImportData(null)
      onOpenChange(false)
    }
  }

  const downloadTemplate = () => {
    const templateContent = [
      CSV_HEADERS.join(','),
      [
        '"John Doe"',
        '"Jane Doe"',
        '"+27-82-123-4567"',
        '"jane.doe@email.com"',
        '"Riverside Primary"',
        'Yes'
      ].join(',')
    ].join('\n')

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'student_import_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import / Export Students</DialogTitle>
          <DialogDescription>
            Import students from CSV or export current student data
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
          <Button
            variant={activeTab === 'export' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('export')}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant={activeTab === 'import' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('import')}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Export Student Data</h3>
              <p className="text-sm text-gray-600 mb-6">
                Choose which students to export as a CSV file
              </p>
              
              <div className="space-y-3">
                {/* Export Filtered Students */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-blue-900">Filtered Results</h4>
                      <p className="text-sm text-blue-700">
                        Export current filtered view ({students.length} students)
                      </p>
                    </div>
                    <Button onClick={exportFilteredStudents} variant="default">
                      <Download className="h-4 w-4 mr-2" />
                      Export Filtered
                    </Button>
                  </div>
                </div>
                
                {/* Export All Students */}
                {allStudents && allStudents.length > students.length && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">All Students</h4>
                        <p className="text-sm text-gray-700">
                          Export complete database ({allStudents.length} students)
                        </p>
                      </div>
                      <Button onClick={exportAllStudents} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export All
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            {!importData && (
              <>
                <div className="text-center mb-4">
                  <Button variant="outline" onClick={downloadTemplate} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                  onDragLeave={() => setDragActive(false)}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Select File'}
                  </Button>
                </div>
              </>
            )}

            {/* Import Results */}
            {importData && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Import Results</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setImportData(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Valid Records</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {importData.valid.length}
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="font-medium text-red-800">Errors</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {importData.errors.length}
                    </p>
                  </div>
                </div>

                {/* Error Details */}
                {importData.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Import Errors:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {importData.errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-sm text-red-700">
                          Row {error.row}: {error.message}
                        </div>
                      ))}
                      {importData.errors.length > 10 && (
                        <div className="text-sm text-red-600 italic">
                          +{importData.errors.length - 10} more errors...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Valid Records Preview */}
                {importData.valid.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">
                      Preview ({importData.valid.length} students):
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {importData.valid.slice(0, 5).map((student, index) => (
                        <div key={index} className="text-sm text-green-700">
                          {student.first_name} {student.last_name} - Grade {student.grade}
                        </div>
                      ))}
                      {importData.valid.length > 5 && (
                        <div className="text-sm text-green-600 italic">
                          +{importData.valid.length - 5} more students...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === 'import' && importData && importData.valid.length > 0 && (
            <Button onClick={handleImport}>
              Import {importData.valid.length} Students
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}