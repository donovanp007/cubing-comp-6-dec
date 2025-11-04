// This file now only exports types - API calls moved to /api/ai/process route
// for security (no more client-side API key exposure)

export interface TaskStructure {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimatedHours?: number
  dueDate?: string
  assignedTo?: string
  tags?: string[]
  subtasks?: Array<{
    title: string
    description?: string
    estimated_minutes?: number
  }>
}

export interface ProjectStructure {
  name: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimatedDuration?: string
  dueDate?: string
  tags?: string[]
  tasks: TaskStructure[]
}

export interface AIResponse {
  type: 'tasks' | 'project'
  projectId?: string
  projectName?: string
  tasks?: TaskStructure[]
  project?: ProjectStructure
}

// These functions have been moved to /api/ai/process for security
// Use fetch('/api/ai/process') instead of calling these directly

// Audio transcription moved to server - use PUT /api/ai/process

// File processing moved to server - use POST /api/ai/process

// API key validation happens server-side now