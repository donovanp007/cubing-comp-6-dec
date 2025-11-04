'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Copy, Check, MessageCircle, Mail, Star } from 'lucide-react'

interface MessageTemplate {
  id: string
  name: string
  type: 'whatsapp' | 'email'
  category: 'general' | 'progress' | 'payment' | 'competition' | 'custom'
  subject?: string // For email templates
  message: string
  isActive: boolean
  placeholders: string[]
  createdAt: string
  updatedAt: string
}

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: '1',
    name: 'Competition Invitation',
    type: 'whatsapp',
    category: 'competition',
    message: `Hi {{parentFirstName}},

Our Cubing Competition at Table Bay Mall is still on! 🎉
We're now gathering the list of students who'd like to join us.

We'll also be hosting a Cubing Boot Camp for any kids who aren't currently part of our Cubing Hub lessons this term — perfect for sharpening their skills before the big day.

📋 Please fill in this short form to register {{studentFirstName}}:
https://forms.gle/KPxiAF17Y6mhG2oC8

Even if {{studentFirstName}} is a past Cubing Hub student and has learned to solve the cube with us before, we'd love to have them compete. 🏆
The more solvers we have, the more exciting the event will be!

More event details coming soon — we can't wait to see our cubers in action! 🧩

Best regards,
The Cubing Team`,
    isActive: true,
    placeholders: ['parentFirstName', 'studentFirstName'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Progress Update',
    type: 'whatsapp',
    category: 'progress',
    message: `Hi {{parentFirstName}}! 👋

Great news about {{studentFirstName}}'s cubing progress! 🌟

🧩 {{studentFirstName}}'s Achievement Update:
• Improved solving technique
• Better time management
• Growing confidence with the cube

We're so proud of {{studentFirstName}}'s dedication and progress in our program!

Feel free to reach out if you have any questions.

Best regards,
The Cubing Team 🎯`,
    isActive: false,
    placeholders: ['parentFirstName', 'studentFirstName'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Payment Reminder',
    type: 'whatsapp',
    category: 'payment',
    message: `Hi {{parentFirstName}}! 👋

This is a friendly reminder regarding {{studentFirstName}}'s cubing classes.

💳 Payment Reminder
We hope {{studentFirstName}} is enjoying the cubing sessions! 

Please let us know if you need any assistance with the payment process or have any questions about our program.

Thank you for your continued support!

Best regards,
The Cubing Team 🎯`,
    isActive: false,
    placeholders: ['parentFirstName', 'studentFirstName'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const PLACEHOLDER_OPTIONS = [
  { value: 'parentFirstName', label: 'Parent First Name' },
  { value: 'parentFullName', label: 'Parent Full Name' },
  { value: 'studentFirstName', label: 'Student First Name' },
  { value: 'studentFullName', label: 'Student Full Name' },
  { value: 'schoolName', label: 'School Name' },
  { value: 'grade', label: 'Grade' },
  { value: 'classType', label: 'Class Type' },
  { value: 'currentDate', label: 'Current Date' },
  { value: 'programFee', label: 'Program Fee' },
]

export default function MessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState<Partial<MessageTemplate>>({
    name: '',
    type: 'whatsapp',
    category: 'general',
    subject: '',
    message: '',
    placeholders: []
  })

  useEffect(() => {
    // Load templates from localStorage
    const storedTemplates = localStorage.getItem('messageTemplates')
    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates))
    } else {
      // Initialize with default templates
      setTemplates(DEFAULT_TEMPLATES)
      localStorage.setItem('messageTemplates', JSON.stringify(DEFAULT_TEMPLATES))
    }
  }, [])

  const saveTemplates = (newTemplates: MessageTemplate[]) => {
    setTemplates(newTemplates)
    localStorage.setItem('messageTemplates', JSON.stringify(newTemplates))
    
    // Also save the active template selection
    const activeTemplate = newTemplates.find(t => t.isActive)
    if (activeTemplate) {
      localStorage.setItem('activeTemplateId', activeTemplate.id)
    }
  }

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.message) return

    const newTemplate: MessageTemplate = {
      id: isEditing && selectedTemplate ? selectedTemplate.id : Date.now().toString(),
      name: formData.name!,
      type: formData.type as 'whatsapp' | 'email',
      category: formData.category as any,
      subject: formData.subject,
      message: formData.message!,
      isActive: false,
      placeholders: extractPlaceholders(formData.message!),
      createdAt: isEditing && selectedTemplate ? selectedTemplate.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (isEditing) {
      saveTemplates(templates.map(t => t.id === newTemplate.id ? newTemplate : t))
    } else {
      saveTemplates([...templates, newTemplate])
    }

    setShowDialog(false)
    setIsEditing(false)
    setSelectedTemplate(null)
    setFormData({
      name: '',
      type: 'whatsapp',
      category: 'general',
      subject: '',
      message: '',
      placeholders: []
    })
  }

  const extractPlaceholders = (text: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g
    const matches: string[] = []
    let match: RegExpExecArray | null
    
    while ((match = regex.exec(text)) !== null) {
      const placeholder = match[1]
      if (placeholder && !matches.includes(placeholder)) {
        matches.push(placeholder)
      }
    }
    return matches
  }

  const handleEditTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      type: template.type,
      category: template.category,
      subject: template.subject,
      message: template.message,
      placeholders: template.placeholders
    })
    setIsEditing(true)
    setShowDialog(true)
  }

  const handleDeleteTemplate = (templateId: string) => {
    saveTemplates(templates.filter(t => t.id !== templateId))
  }

  const handleSetActive = (templateId: string) => {
    saveTemplates(templates.map(t => ({
      ...t,
      isActive: t.id === templateId
    })))
  }

  const handleDuplicateTemplate = (template: MessageTemplate) => {
    const newTemplate: MessageTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    saveTemplates([...templates, newTemplate])
  }

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('template-message') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = formData.message || ''
      const newText = text.substring(0, start) + `{{${placeholder}}}` + text.substring(end)
      setFormData({ ...formData, message: newText })
      
      // Set cursor position after inserted placeholder
      setTimeout(() => {
        textarea.focus()
        const newPosition = start + placeholder.length + 4
        textarea.setSelectionRange(newPosition, newPosition)
      }, 0)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Create and manage templates for WhatsApp and Email communications
              </CardDescription>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    name: '',
                    type: 'whatsapp',
                    category: 'general',
                    subject: '',
                    message: '',
                    placeholders: []
                  })
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit Template' : 'Create New Template'}</DialogTitle>
                  <DialogDescription>
                    Create a reusable message template with dynamic placeholders
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Welcome Message"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                      >
                        <SelectTrigger id="template-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                    >
                      <SelectTrigger id="template-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="progress">Progress Update</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.type === 'email' && (
                    <div className="space-y-2">
                      <Label htmlFor="template-subject">Email Subject</Label>
                      <Input
                        id="template-subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g., Update on {{studentFirstName}}'s Progress"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="template-message">Message</Label>
                      <div className="text-sm text-muted-foreground">
                        Available placeholders:
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {PLACEHOLDER_OPTIONS.map(placeholder => (
                        <Badge
                          key={placeholder.value}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => insertPlaceholder(placeholder.value)}
                        >
                          {placeholder.label}
                        </Badge>
                      ))}
                    </div>
                    <Textarea
                      id="template-message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Type your message here. Use {{placeholders}} for dynamic content."
                      rows={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      Click on placeholders above to insert them at cursor position
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveTemplate}>
                      {isEditing ? 'Update' : 'Create'} Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No templates yet. Create your first template to get started.
              </p>
            ) : (
              <div className="grid gap-4">
                {templates.map(template => (
                  <Card key={template.id} className={template.isActive ? 'border-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{template.name}</h4>
                            {template.isActive && (
                              <Badge variant="default" className="text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {template.type === 'whatsapp' ? (
                                <MessageCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <Mail className="h-3 w-3 mr-1" />
                              )}
                              {template.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.message}
                          </p>
                          {template.placeholders.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">Placeholders:</span>
                              {template.placeholders.map(p => (
                                <Badge key={p} variant="outline" className="text-xs">
                                  {p}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {!template.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetActive(template.id)}
                              title="Set as active template"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateTemplate(template)}
                            title="Duplicate template"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                            title="Edit template"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                            title="Delete template"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}