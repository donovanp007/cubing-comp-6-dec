'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PriorityBadge } from '@/components/ui/priority-badge'
import {
  Plus,
  Clock,
  User,
  Calendar,
  MessageSquare,
  CheckSquare,
  AlertCircle,
  MoreVertical,
  Filter,
  Users,
  Tag
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Enhanced task type with new fields
export interface EnhancedTask {
  id: string
  title: string
  description?: string
  status: 'todo' | 'doing' | 'blocked' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  task_type: string
  student_id?: string
  student_name?: string
  project_id?: string
  project_name?: string
  assigned_to?: string
  assignee_name?: string
  assignee_email?: string
  due_at?: string
  start_at?: string
  completed_at?: string
  estimate_minutes?: number
  actual_minutes?: number
  labels?: string[]
  comment_count?: number
  checklist_total?: number
  checklist_done?: number
  created_at: string
  updated_at: string
}

interface TaskKanbanBoardProps {
  tasks: EnhancedTask[]
  onTaskMove: (taskId: string, newStatus: string) => Promise<void>
  onTaskClick: (task: EnhancedTask) => void
  onAddTask: (status: string) => void
  loading?: boolean
  swimlaneBy?: 'none' | 'assignee' | 'project' | 'priority'
}

const STATUS_COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100', limit: 20 },
  { id: 'doing', title: 'In Progress', color: 'bg-blue-100', limit: 5 },
  { id: 'blocked', title: 'Blocked', color: 'bg-red-100', limit: 10 },
  { id: 'done', title: 'Done', color: 'bg-green-100', limit: null },
] as const

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

const TYPE_ICONS = {
  general: '📝',
  admin: '🏢',
  coaching: '🎯',
  event: '🎉',
  billing: '💰',
  support: '🤝',
  follow_up: '☎️',
  payment: '💳',
  certificate: '🏆',
  equipment: '📦',
}

export default function TaskKanbanBoard({
  tasks,
  onTaskMove,
  onTaskClick,
  onAddTask,
  loading = false,
  swimlaneBy = 'none',
}: TaskKanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<EnhancedTask | null>(null)
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, EnhancedTask[]> = {
      todo: [],
      doing: [],
      blocked: [],
      done: [],
    }
    
    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    })

    // Sort tasks within each column
    Object.keys(grouped).forEach(status => {
      grouped[status].sort((a, b) => {
        // Sort by priority first (urgent > high > medium > low)
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (priorityDiff !== 0) return priorityDiff

        // Then by due date (earliest first)
        if (a.due_at && b.due_at) {
          return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
        }
        if (a.due_at) return -1
        if (b.due_at) return 1

        // Finally by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    })

    return grouped
  }, [tasks])

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over || active.id === over.id) return

    const taskId = active.id as string
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Determine new status based on drop target
    let newStatus = task.status
    STATUS_COLUMNS.forEach(col => {
      if (over.id === col.id || tasksByStatus[col.id].some(t => t.id === over.id)) {
        newStatus = col.id as typeof task.status
      }
    })

    if (newStatus !== task.status) {
      setMovingTaskId(taskId)
      try {
        await onTaskMove(taskId, newStatus)
      } finally {
        setMovingTaskId(null)
      }
    }
  }

  const TaskCard = ({ task }: { task: EnhancedTask }) => {
    const isMoving = movingTaskId === task.id
    const isOverdue = task.due_at && new Date(task.due_at) < new Date() && task.status !== 'done'
    const progress = task.checklist_total ? (task.checklist_done || 0) / task.checklist_total : 0

    return (
      <Card
        className={`p-3 cursor-pointer hover:shadow-md transition-all ${
          isMoving ? 'opacity-50' : ''
        } ${isOverdue ? 'border-red-500' : ''}`}
        onClick={() => onTaskClick(task)}
      >
        {/* Header with type and priority */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{TYPE_ICONS[task.task_type as keyof typeof TYPE_ICONS] || '📌'}</span>
            <Badge className={PRIORITY_COLORS[task.priority]} variant="secondary">
              {task.priority}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm mb-1 line-clamp-2">{task.title}</h4>

        {/* Student/Project info */}
        {(task.student_name || task.project_name) && (
          <p className="text-xs text-muted-foreground mb-2">
            {task.student_name && <span>👤 {task.student_name}</span>}
            {task.student_name && task.project_name && ' • '}
            {task.project_name && <span>📁 {task.project_name}</span>}
          </p>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.labels.slice(0, 3).map(label => (
              <Badge key={label} variant="outline" className="text-xs px-1 py-0">
                {label}
              </Badge>
            ))}
            {task.labels.length > 3 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{task.labels.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Progress bar for checklists */}
        {task.checklist_total && task.checklist_total > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                {task.checklist_done}/{task.checklist_total}
              </span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer with metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-2">
            {task.assignee_name && (
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[8px]">
                    {task.assignee_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{task.assignee_name.split(' ')[0]}</span>
              </div>
            )}
            {task.due_at && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                  {formatDistanceToNow(new Date(task.due_at), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {task.comment_count && task.comment_count > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{task.comment_count}</span>
              </div>
            )}
            {task.estimate_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{task.estimate_minutes}m</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map(column => {
          const columnTasks = tasksByStatus[column.id] || []
          const isOverLimit = column.limit && columnTasks.length > column.limit

          return (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className={`rounded-t-lg p-3 ${column.color}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    {column.title}
                    <Badge variant="secondary" className="ml-2">
                      {columnTasks.length}
                      {column.limit && ` / ${column.limit}`}
                    </Badge>
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onAddTask(column.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {isOverLimit && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>WIP limit exceeded</span>
                  </div>
                )}
              </div>

              <ScrollArea className="h-[calc(100vh-300px)] bg-gray-50 rounded-b-lg">
                <div className="p-2 space-y-2">
                  <SortableContext
                    items={columnTasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </SortableContext>
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No tasks
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  )
}