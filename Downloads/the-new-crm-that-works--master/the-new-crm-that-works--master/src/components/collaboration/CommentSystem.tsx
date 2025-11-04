'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  MessageSquare, 
  Send, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Reply,
  Heart,
  Pin,
  Flag
} from 'lucide-react'

export interface Comment {
  id: string
  content: string
  user_id: string
  user_name: string
  user_avatar?: string
  user_role: string
  created_at: string
  updated_at: string
  edited?: boolean
  parent_id?: string
  reactions?: CommentReaction[]
  is_pinned?: boolean
  mentions?: string[]
}

export interface CommentReaction {
  id: string
  user_id: string
  user_name: string
  type: 'like' | 'love' | 'helpful' | 'agree'
  created_at: string
}

interface CommentSystemProps {
  entityId: string
  entityType: 'project' | 'task' | 'goal' | 'school' | 'student'
  comments: Comment[]
  onAddComment: (content: string, parentId?: string, mentions?: string[]) => Promise<void>
  onUpdateComment: (commentId: string, content: string) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
  onReactToComment?: (commentId: string, type: CommentReaction['type']) => Promise<void>
  onPinComment?: (commentId: string, pinned: boolean) => Promise<void>
  allowPinning?: boolean
  placeholder?: string
}

export default function CommentSystem({
  entityId,
  entityType,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onReactToComment,
  onPinComment,
  allowPinning = false,
  placeholder = "Add a comment..."
}: CommentSystemProps) {
  const { user, profile } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'ceo': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment)
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return

    setIsSubmitting(true)
    try {
      await onAddComment(replyContent, parentId)
      setReplyContent('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Error adding reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      await onUpdateComment(commentId, editContent)
      setEditingComment(null)
      setEditContent('')
    } catch (error) {
      console.error('Error updating comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await onDeleteComment(commentId)
      } catch (error) {
        console.error('Error deleting comment:', error)
      }
    }
  }

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  const cancelEditing = () => {
    setEditingComment(null)
    setEditContent('')
  }

  const startReplying = (commentId: string) => {
    setReplyingTo(commentId)
    setReplyContent('')
  }

  const cancelReplying = () => {
    setReplyingTo(null)
    setReplyContent('')
  }

  // Sort comments: pinned first, then by date
  const sortedComments = [...comments].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Group comments by parent (top-level comments vs replies)
  const topLevelComments = sortedComments.filter(comment => !comment.parent_id)
  const getReplies = (parentId: string) => 
    sortedComments.filter(comment => comment.parent_id === parentId)

  if (!user) return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
              <AvatarFallback>{getInitials(profile?.full_name || 'U')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder={placeholder}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={getReplies(comment.id)}
            currentUserId={user.id}
            isEditing={editingComment === comment.id}
            editContent={editContent}
            onEditContentChange={setEditContent}
            onStartEditing={() => startEditing(comment)}
            onCancelEditing={cancelEditing}
            onSaveEdit={() => handleEditComment(comment.id)}
            onDelete={() => handleDeleteComment(comment.id)}
            onReact={onReactToComment}
            onPin={onPinComment}
            allowPinning={allowPinning}
            onReply={() => startReplying(comment.id)}
            isReplying={replyingTo === comment.id}
            replyContent={replyContent}
            onReplyContentChange={setReplyContent}
            onSubmitReply={() => handleSubmitReply(comment.id)}
            onCancelReply={cancelReplying}
            isSubmitting={isSubmitting}
          />
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  replies: Comment[]
  currentUserId: string
  isEditing: boolean
  editContent: string
  onEditContentChange: (content: string) => void
  onStartEditing: () => void
  onCancelEditing: () => void
  onSaveEdit: () => void
  onDelete: () => void
  onReact?: (commentId: string, type: CommentReaction['type']) => Promise<void>
  onPin?: (commentId: string, pinned: boolean) => Promise<void>
  allowPinning: boolean
  onReply: () => void
  isReplying: boolean
  replyContent: string
  onReplyContentChange: (content: string) => void
  onSubmitReply: () => void
  onCancelReply: () => void
  isSubmitting: boolean
}

function CommentItem({
  comment,
  replies,
  currentUserId,
  isEditing,
  editContent,
  onEditContentChange,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  onDelete,
  onReact,
  onPin,
  allowPinning,
  onReply,
  isReplying,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
  isSubmitting
}: CommentItemProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'ceo': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const canEdit = comment.user_id === currentUserId
  const canDelete = comment.user_id === currentUserId // Add admin check if needed

  return (
    <Card className={comment.is_pinned ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}>
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.user_avatar} alt={comment.user_name} />
            <AvatarFallback>{getInitials(comment.user_name)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">
                  {comment.user_name}
                </span>
                <Badge className={getRoleBadgeColor(comment.user_role)} variant="outline">
                  {comment.user_role}
                </Badge>
                {comment.is_pinned && (
                  <Badge variant="secondary" className="text-xs">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                  {comment.edited && ' (edited)'}
                </span>
              </div>
              
              {(canEdit || canDelete || allowPinning) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && (
                      <DropdownMenuItem onClick={onStartEditing}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {allowPinning && onPin && (
                      <DropdownMenuItem 
                        onClick={() => onPin(comment.id, !comment.is_pinned)}
                      >
                        <Pin className="h-4 w-4 mr-2" />
                        {comment.is_pinned ? 'Unpin' : 'Pin'}
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem 
                        onClick={onDelete}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Content */}
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => onEditContentChange(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={onSaveEdit}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={onCancelEditing}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 text-sm">
              <Button variant="ghost" size="sm" onClick={onReply}>
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
              
              {onReact && (
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onReact(comment.id, 'like')}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {comment.reactions?.filter(r => r.type === 'like').length || 0}
                  </Button>
                </div>
              )}
            </div>

            {/* Reply Form */}
            {isReplying && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                  className="min-h-[60px] resize-none bg-white"
                  disabled={isSubmitting}
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <Button size="sm" variant="outline" onClick={onCancelReply}>
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={onSubmitReply}
                    disabled={!replyContent.trim() || isSubmitting}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            )}

            {/* Replies */}
            {replies.length > 0 && (
              <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                {replies.map((reply) => (
                  <div key={reply.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reply.user_avatar} alt={reply.user_name} />
                      <AvatarFallback>{getInitials(reply.user_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm">{reply.user_name}</span>
                        <Badge 
                          className={getRoleBadgeColor(reply.user_role)} 
                          variant="outline"
                        >
                          {reply.user_role}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(reply.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}