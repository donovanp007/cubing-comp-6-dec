'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Upload, File, X, FileText, AlertCircle, CheckCircle } from 'lucide-react'

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string) => void
  disabled?: boolean
  className?: string
}

interface ProcessedFile {
  name: string
  size: number
  content: string
  status: 'processing' | 'completed' | 'error'
  error?: string
}

const ACCEPTED_FILE_TYPES = {
  'text/plain': ['.txt'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/markdown': ['.md'],
  'application/json': ['.json'],
  'text/csv': ['.csv']
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function FileUploader({ 
  onFileContent, 
  disabled = false, 
  className = "" 
}: FileUploaderProps) {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const processFile = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result === 'string') {
          resolve(result)
        } else {
          reject(new Error('Failed to read file as text'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      // Handle different file types
      if (file.type === 'application/pdf') {
        // For PDF files, we'd need a PDF parser library like pdf-parse
        // For now, we'll show an error message
        reject(new Error('PDF parsing not yet implemented. Please use text files for now.'))
      } else {
        // Read as text for other file types
        reader.readAsText(file)
      }
    })
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return
    
    setIsProcessing(true)
    
    for (const file of acceptedFiles) {
      const newFile: ProcessedFile = {
        name: file.name,
        size: file.size,
        content: '',
        status: 'processing'
      }

      setProcessedFiles(prev => [...prev, newFile])

      try {
        const content = await processFile(file)
        
        setProcessedFiles(prev => 
          prev.map(f => 
            f.name === file.name && f.size === file.size
              ? { ...f, content, status: 'completed' }
              : f
          )
        )

        // Notify parent component
        onFileContent(content, file.name)

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        setProcessedFiles(prev => 
          prev.map(f => 
            f.name === file.name && f.size === file.size
              ? { ...f, status: 'error', error: errorMessage }
              : f
          )
        )
      }
    }
    
    setIsProcessing(false)
  }, [disabled, processFile, onFileContent])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled
  })

  const removeFile = (fileName: string, fileSize: number) => {
    setProcessedFiles(prev => 
      prev.filter(f => !(f.name === fileName && f.size === fileSize))
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 font-medium mb-1">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500">
              Supports: TXT, DOC, DOCX, MD, JSON, CSV (Max 5MB)
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {processedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
          
          {processedFiles.map((file, index) => (
            <div 
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {file.status === 'processing' && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-xs text-blue-600">Processing...</span>
                  </div>
                )}
                
                {file.status === 'completed' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                
                {file.status === 'error' && (
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-600" title={file.error}>
                      Error
                    </span>
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.name, file.size)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="flex items-center space-x-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Processing files...</span>
        </div>
      )}

      {/* Completed Files Summary */}
      {processedFiles.filter(f => f.status === 'completed').length > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ {processedFiles.filter(f => f.status === 'completed').length} file(s) processed successfully and ready for AI analysis.
          </p>
        </div>
      )}

      {/* Error Summary */}
      {processedFiles.filter(f => f.status === 'error').length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            ❌ {processedFiles.filter(f => f.status === 'error').length} file(s) failed to process.
          </p>
          <ul className="text-xs text-red-700 mt-1 list-disc list-inside">
            {processedFiles
              .filter(f => f.status === 'error')
              .map((file, index) => (
                <li key={index}>{file.name}: {file.error}</li>
              ))
            }
          </ul>
        </div>
      )}
    </div>
  )
}