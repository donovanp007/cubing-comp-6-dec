'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import VoiceRecorder from './VoiceRecorder'
import FileUploader from './FileUploader'
// Import types only from openai lib, not the functions
import type { 
  AIResponse,
  TaskStructure,
  ProjectStructure 
} from '@/lib/openai'
import { 
  Mic, 
  Upload, 
  Type, 
  Wand2, 
  Edit, 
  Trash2, 
  Plus, 
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Grid3X3,
  List,
  LayoutGrid
} from 'lucide-react'

interface AITaskCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTasksCreated: (tasks: TaskStructure[], projectId?: string) => void
  onProjectCreated: (project: ProjectStructure) => void
  existingProjects: Array<{ id: string; name: string; description: string }>
  className?: string
}

type ViewMode = 'compact' | 'detailed' | 'grid'

export default function AITaskCreator({
  open,
  onOpenChange,
  onTasksCreated,
  onProjectCreated,
  existingProjects,
  className = ""
}: AITaskCreatorProps) {
  const [currentTab, setCurrentTab] = useState<'voice' | 'upload' | 'text'>('text')
  const [isProcessing, setIsProcessing] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('compact')
  // Editing states
  const [editedTasks, setEditedTasks] = useState<TaskStructure[]>([])
  const [editedProject, setEditedProject] = useState<ProjectStructure | null>(null)

  useEffect(() => {
    if (aiResponse) {
      if (aiResponse.type === 'tasks' && aiResponse.tasks) {
        setEditedTasks([...aiResponse.tasks])
      } else if (aiResponse.type === 'project' && aiResponse.project) {
        setEditedProject({ ...aiResponse.project })
        setEditedTasks([...aiResponse.project.tasks])
      }
    }
  }, [aiResponse])

  const processWithAI = async (input: string) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, existingProjects })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process with AI')
      }
      
      const data = await response.json() as AIResponse
      setAIResponse(data)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process with AI')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVoiceRecorded = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // Upload audio file to server for transcription
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.webm')
      
      const response = await fetch('/api/ai/process', {
        method: 'PUT',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to transcribe audio')
      }
      
      const { text } = await response.json()
      setTextInput(text)
      await processWithAI(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process voice input')
      setIsProcessing(false)
    }
  }

  const handleFileContent = async (content: string, fileName: string) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // Process file content through server API
      const fileTypeHint = fileName.toLowerCase().includes('.pdf') 
        ? 'This content is from a PDF document.'
        : fileName.toLowerCase().includes('.doc') 
        ? 'This content is from a Word document.'
        : 'This content is from a text file.'
      
      const enhancedText = `${fileTypeHint}\n\nFile: ${fileName}\n\nContent:\n${content}`
      await processWithAI(enhancedText)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      processWithAI(textInput)
    }
  }

  const handleSaveChanges = () => {
    if (editedProject) {
      onProjectCreated({ ...editedProject, tasks: editedTasks })
    } else {
      onTasksCreated(editedTasks, aiResponse?.projectId)
    }
    onOpenChange(false)
    resetState()
  }

  const resetState = () => {
    setTextInput('')
    setAIResponse(null)
    setError(null)
    setIsEditing(false)
    setEditedTasks([])
    setEditedProject(null)
  }

  const updateTask = (index: number, field: keyof TaskStructure, value: any) => {
    setEditedTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    ))
  }

  const removeTask = (index: number) => {
    setEditedTasks(prev => prev.filter((_, i) => i !== index))
  }

  const addTask = () => {
    const newTask: TaskStructure = {
      title: 'New Task',
      description: '',
      priority: 'medium'
    }
    setEditedTasks(prev => [...prev, newTask])
  }

  const TaskCard = ({ task, index }: { task: TaskStructure; index: number }) => {
    const cardClasses = {
      compact: "p-3 border rounded-lg space-y-2 bg-white hover:shadow-sm transition-shadow",
      detailed: "p-4 border rounded-lg space-y-3 bg-white hover:shadow-md transition-shadow", 
      grid: "p-3 border rounded-lg space-y-2 bg-white hover:shadow-sm transition-shadow"
    }

    return (
      <div className={cardClasses[viewMode]}>
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <Input
                value={task.title}
                onChange={(e) => updateTask(index, 'title', e.target.value)}
                className="font-medium flex-1 mr-2"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTask(index)}
                className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={task.description}
              onChange={(e) => updateTask(index, 'description', e.target.value)}
              placeholder="Task description..."
              className="text-sm"
              rows={viewMode === 'compact' ? 2 : 3}
            />
            <div className="flex items-center space-x-2">
              <Select
                value={task.priority}
                onValueChange={(value: string) => 
                  updateTask(index, 'priority', value as 'low' | 'medium' | 'high')
                }
              >
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {viewMode !== 'compact' && (
                <Input
                  type="number"
                  value={task.estimatedHours || ''}
                  onChange={(e) => updateTask(index, 'estimatedHours', parseFloat(e.target.value) || undefined)}
                  placeholder="Hours"
                  className="w-20 h-7 text-xs"
                />
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-2">
              <h4 className={`font-medium text-gray-900 ${
                viewMode === 'compact' ? 'text-sm' : 'text-base'
              }`}>
                {task.title}
              </h4>
              <Badge 
                variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                className={viewMode === 'compact' ? 'text-xs px-2 py-0' : ''}
              >
                {task.priority}
              </Badge>
            </div>
            <p className={`text-gray-600 ${
              viewMode === 'compact' ? 'text-xs' : 'text-sm'
            } mb-2`}>
              {task.description}
            </p>
            <div className="flex items-center justify-between">
              {task.estimatedHours && (
                <span className={`text-blue-600 font-medium ${
                  viewMode === 'compact' ? 'text-xs' : 'text-sm'
                }`}>
                  {task.estimatedHours}h
                </span>
              )}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.tags.slice(0, viewMode === 'compact' ? 2 : 4).map((tag, i) => (
                    <Badge key={i} variant="outline" className={
                      viewMode === 'compact' ? 'text-xs px-1 py-0' : 'text-xs'
                    }>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // OpenAI is now configured server-side, no need to check for key

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-blue-600" />
            <span>AI Task Creator</span>
          </DialogTitle>
          <DialogDescription>
            Create tasks and projects using voice, file upload, or text input with AI assistance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!aiResponse && (
            <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as typeof currentTab)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text" className="flex items-center space-x-2">
                  <Type className="h-4 w-4" />
                  <span>Text</span>
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex items-center space-x-2">
                  <Mic className="h-4 w-4" />
                  <span>Voice</span>
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div>
                  <Label htmlFor="text-input">Describe your tasks or project</Label>
                  <Textarea
                    id="text-input"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Example: I need to create a marketing campaign for our new product launch. It should include social media posts, email templates, and landing page content. The deadline is next Friday."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleTextSubmit} disabled={!textInput.trim() || isProcessing}>
                  {isProcessing ? 'Processing...' : 'Create Tasks with AI'}
                </Button>
              </TabsContent>

              <TabsContent value="voice" className="space-y-4">
                <div>
                  <Label>Record your task description</Label>
                  <VoiceRecorder
                    onAudioRecorded={handleVoiceRecorded}
                    disabled={isProcessing}
                    className="mt-2"
                  />
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div>
                  <Label>Upload documents containing task information</Label>
                  <FileUploader
                    onFileContent={handleFileContent}
                    disabled={isProcessing}
                    className="mt-2"
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center space-x-3 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-blue-600 font-medium">
                {currentTab === 'voice' ? 'Processing voice...' : 'Analyzing with AI...'}
              </span>
            </div>
          )}

          {aiResponse && editedTasks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editedProject ? `Project: ${editedProject.name}` : 'Generated Tasks'}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 border rounded-lg">
                    <Button
                      variant={viewMode === 'compact' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('compact')}
                      className="px-2"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'detailed' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('detailed')}
                      className="px-2"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="px-2"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>{isEditing ? 'Done Editing' : 'Edit Tasks'}</span>
                  </Button>
                </div>
              </div>

              {editedProject && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={editedProject.name}
                        onChange={(e) => setEditedProject(prev => prev ? {...prev, name: e.target.value} : null)}
                        className="font-semibold"
                      />
                      <Textarea
                        value={editedProject.description}
                        onChange={(e) => setEditedProject(prev => prev ? {...prev, description: e.target.value} : null)}
                        rows={2}
                      />
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold text-blue-900">{editedProject.name}</h4>
                      <p className="text-sm text-blue-700">{editedProject.description}</p>
                    </div>
                  )}
                </div>
              )}

              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                  : 'space-y-3'
                }
              `}>
                {editedTasks.map((task, index) => (
                  <TaskCard key={index} task={task} index={index} />
                ))}
              </div>

              {isEditing && (
                <Button onClick={addTask} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={resetState} variant="ghost">
            Start Over
          </Button>
          {aiResponse && editedTasks.length > 0 && (
            <Button onClick={handleSaveChanges} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>
                Create {editedProject ? 'Project' : 'Tasks'} ({editedTasks.length})
              </span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}