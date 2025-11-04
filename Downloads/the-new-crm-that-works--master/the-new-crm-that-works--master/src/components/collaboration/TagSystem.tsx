'use client'

import { useState, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { 
  Tag, 
  Plus, 
  X, 
  Hash,
  Check,
  Search
} from 'lucide-react'

export interface TagType {
  id: string
  name: string
  color: string
  description?: string
  category?: string
}

export interface EntityTag {
  id: string
  tag_id: string
  entity_id: string
  entity_type: string
  created_at: string
  created_by: string
  tag: TagType
}

interface TagSystemProps {
  entityId: string
  entityType: 'project' | 'task' | 'goal' | 'school' | 'student'
  entityTags: EntityTag[]
  availableTags: TagType[]
  onAddTag: (tagId: string) => Promise<void>
  onRemoveTag: (entityTagId: string) => Promise<void>
  onCreateTag?: (name: string, color: string, category?: string) => Promise<TagType>
  allowTagCreation?: boolean
  maxTags?: number
  placeholder?: string
  compact?: boolean
}

const TAG_COLORS = [
  { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  { name: 'Green', value: '#10B981', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  { name: 'Yellow', value: '#F59E0B', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  { name: 'Red', value: '#EF4444', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  { name: 'Purple', value: '#8B5CF6', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  { name: 'Pink', value: '#EC4899', bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  { name: 'Gray', value: '#6B7280', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
]

const TAG_CATEGORIES = [
  'Priority',
  'Status',
  'Department',
  'Type',
  'Location',
  'Feature',
  'Bug',
  'Enhancement',
  'Other'
]

export default function TagSystem({
  entityId,
  entityType,
  entityTags,
  availableTags,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  allowTagCreation = false,
  maxTags = 10,
  placeholder = "Add tags...",
  compact = false
}: TagSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value)
  const [newTagCategory, setNewTagCategory] = useState('')

  const getTagColor = (color: string) => {
    const tagColor = TAG_COLORS.find(c => c.value === color)
    return tagColor || TAG_COLORS[7] // Default to gray
  }

  const getCurrentTagIds = () => {
    return entityTags.map(et => et.tag_id)
  }

  const getFilteredTags = () => {
    const currentTagIds = getCurrentTagIds()
    return availableTags.filter(tag => 
      !currentTagIds.includes(tag.id) &&
      tag.name.toLowerCase().includes(searchValue.toLowerCase())
    )
  }

  const handleAddTag = async (tagId: string) => {
    try {
      await onAddTag(tagId)
      setSearchValue('')
      if (compact) setIsOpen(false)
    } catch (error) {
      console.error('Error adding tag:', error)
    }
  }

  const handleRemoveTag = async (entityTagId: string) => {
    try {
      await onRemoveTag(entityTagId)
    } catch (error) {
      console.error('Error removing tag:', error)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !onCreateTag) return

    try {
      const newTag = await onCreateTag(newTagName.trim(), newTagColor, newTagCategory)
      await handleAddTag(newTag.id)
      setNewTagName('')
      setNewTagColor(TAG_COLORS[0].value)
      setNewTagCategory('')
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating tag:', error)
    }
  }

  const canAddMoreTags = entityTags.length < maxTags

  return (
    <div className="space-y-3">
      {/* Current Tags */}
      {entityTags.length > 0 && (
        <div className={`flex flex-wrap gap-2 ${compact ? 'gap-1' : 'gap-2'}`}>
          {entityTags.map((entityTag) => {
            const tagColor = getTagColor(entityTag.tag.color)
            return (
              <Badge
                key={entityTag.id}
                variant="outline"
                className={`${tagColor.bg} ${tagColor.text} ${tagColor.border} ${
                  compact ? 'text-xs px-2 py-0.5' : 'px-3 py-1'
                } flex items-center space-x-1`}
              >
                <Hash className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span>{entityTag.tag.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => handleRemoveTag(entityTag.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Add Tags */}
      {canAddMoreTags && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size={compact ? "sm" : "default"}
              className="h-8 border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              {placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search tags..." 
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandEmpty>
                {allowTagCreation && onCreateTag ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-500 mb-3">No tags found.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreating(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Tag
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No tags found.
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup>
                {getFilteredTags().map((tag) => {
                  const tagColor = getTagColor(tag.color)
                  return (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleAddTag(tag.id)}
                    >
                      <div className="flex items-center space-x-2 w-full">
                        <Badge
                          variant="outline"
                          className={`${tagColor.bg} ${tagColor.text} ${tagColor.border} text-xs`}
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          {tag.name}
                        </Badge>
                        {tag.description && (
                          <span className="text-xs text-gray-500 truncate">
                            {tag.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </Command>

            {/* Create Tag Form */}
            {isCreating && allowTagCreation && onCreateTag && (
              <div className="border-t p-4 space-y-3">
                <h4 className="font-semibold text-sm">Create New Tag</h4>
                
                <div className="space-y-2">
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="h-8"
                  />
                  
                  <select
                    value={newTagCategory}
                    onChange={(e) => setNewTagCategory(e.target.value)}
                    className="w-full h-8 px-3 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="">Select category (optional)</option>
                    {TAG_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Color:</p>
                    <div className="flex flex-wrap gap-1">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-6 h-6 rounded-full border-2 ${
                            newTagColor === color.value 
                              ? 'border-gray-900 ring-2 ring-gray-300' 
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setNewTagColor(color.value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                  >
                    Create
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false)
                      setNewTagName('')
                      setNewTagCategory('')
                      setNewTagColor(TAG_COLORS[0].value)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      )}

      {/* Max tags reached */}
      {!canAddMoreTags && (
        <p className="text-xs text-gray-500">
          Maximum {maxTags} tags reached
        </p>
      )}
    </div>
  )
}

// Compact version for use in tables/cards
export function CompactTagDisplay({ 
  entityTags, 
  maxVisible = 3 
}: { 
  entityTags: EntityTag[]
  maxVisible?: number 
}) {
  const visibleTags = entityTags.slice(0, maxVisible)
  const hiddenCount = Math.max(0, entityTags.length - maxVisible)

  const getTagColor = (color: string) => {
    const tagColor = TAG_COLORS.find(c => c.value === color)
    return tagColor || TAG_COLORS[7] // Default to gray
  }

  return (
    <div className="flex items-center space-x-1">
      {visibleTags.map((entityTag) => {
        const tagColor = getTagColor(entityTag.tag.color)
        return (
          <Badge
            key={entityTag.id}
            variant="outline"
            className={`${tagColor.bg} ${tagColor.text} ${tagColor.border} text-xs px-2 py-0.5`}
          >
            {entityTag.tag.name}
          </Badge>
        )
      })}
      {hiddenCount > 0 && (
        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50">
          +{hiddenCount}
        </Badge>
      )}
    </div>
  )
}