import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `R${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `R${(amount / 1000).toFixed(1)}K`
  }
  return formatCurrency(amount)
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
}

export function formatPhoneNumber(phone: string | null): string {
  // Format South African phone numbers
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function formatPhoneForWhatsApp(phone: string | null): string {
  // Clean phone number and format for WhatsApp
  if (!phone) return ''
  let cleaned = phone.replace(/\D/g, '')
  
  // Handle different SA number formats
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    // Remove leading 0 and add country code
    cleaned = '27' + cleaned.slice(1)
  } else if (cleaned.startsWith('27') && cleaned.length === 11) {
    // Already in correct format
    return cleaned
  } else if (cleaned.length === 9) {
    // Missing country code and leading 0
    cleaned = '27' + cleaned
  }
  
  return cleaned
}

function showNotification(message: string, type: 'success' | 'error' = 'success'): void {
  const notification = document.createElement('div')
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#25D366' : '#dc2626'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-width: 300px;
    ">
      ${message}
    </div>
  `
  document.body.appendChild(notification)
  
  // Remove notification after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 4000)
}

export function openWhatsApp(phone: string | null, message?: string): void {
  if (!phone) return
  const formattedPhone = formatPhoneForWhatsApp(phone)
  if (!formattedPhone) return
  
  if (message) {
    // Use encodeURIComponent which should preserve emojis correctly
    const encodedMessage = encodeURIComponent(message)
    const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
    window.open(url, '_blank')
  } else {
    const url = `https://wa.me/${formattedPhone}`
    window.open(url, '_blank')
  }
}

export function openWhatsAppWithImage(phone: string | null, message?: string, imageUrl?: string): void {
  if (!phone) return
  const formattedPhone = formatPhoneForWhatsApp(phone)
  if (!formattedPhone) return
  
  if (message) {
    // Copy message to clipboard first, then open WhatsApp
    navigator.clipboard.writeText(message).then(() => {
      // Show notification
      showNotification('📋 Competition message copied! Paste it in WhatsApp chat.', 'success')
      
      // Open WhatsApp without the text parameter to avoid encoding issues
      const url = `https://wa.me/${formattedPhone}`
      window.open(url, '_blank')
      
      // If there's an image URL, copy it after a delay and show second notification
      if (imageUrl) {
        setTimeout(() => {
          navigator.clipboard.writeText(imageUrl).then(() => {
            showNotification('🖼️ Competition image URL copied! Paste to send the poster.', 'success')
          })
        }, 2000) // Wait 2 seconds before copying image URL
      }
    }).catch(() => {
      // Fallback if clipboard fails
      const params = new URLSearchParams()
      params.set('text', message)
      const url = `https://wa.me/${formattedPhone}?${params.toString()}`
      window.open(url, '_blank')
    })
  } else {
    const url = `https://wa.me/${formattedPhone}`
    window.open(url, '_blank')
  }
}

// Competition poster image URL - replace with your actual image URL
export const COMPETITION_POSTER_URL = 'https://your-image-host.com/competition-poster.jpg'

function processTemplatePlaceholders(template: string, data: Record<string, string>): string {
  let processed = template
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    processed = processed.replace(regex, data[key] || '')
  })
  return processed
}

export function getActiveTemplate(): any {
  if (typeof window === 'undefined') return null
  
  const templates = localStorage.getItem('messageTemplates')
  if (!templates) return null
  
  const parsedTemplates = JSON.parse(templates)
  return parsedTemplates.find((t: any) => t.isActive)
}

export function createWhatsAppMessage(parentName: string, studentName: string, messageType: 'general' | 'progress' | 'payment' | 'competition' = 'general'): string {
  // Check for custom active template first
  const activeTemplate = getActiveTemplate()
  
  if (activeTemplate && activeTemplate.type === 'whatsapp') {
    // Use the active custom template
    return processTemplatePlaceholders(activeTemplate.message, {
      parentFirstName: parentName.split(' ')[0],
      parentFullName: parentName,
      studentFirstName: studentName.split(' ')[0],
      studentFullName: studentName,
      currentDate: new Date().toLocaleDateString(),
    })
  }
  
  // Fallback to default templates
  const templates = {
    general: `Hi ${parentName.split(' ')[0]},

Our Cubing Competition at Table Bay Mall is still on! 🎉
We're now gathering the list of students who'd like to join us.

We'll also be hosting a Cubing Boot Camp for any kids who aren't currently part of our Cubing Hub lessons this term — perfect for sharpening their skills before the big day.

📋 Please fill in this short form to register ${studentName.split(' ')[0]}:
https://forms.gle/KPxiAF17Y6mhG2oC8

Even if ${studentName.split(' ')[0]} is a past Cubing Hub student and has learned to solve the cube with us before, we'd love to have them compete. 🏆
The more solvers we have, the more exciting the event will be!

More event details coming soon — we can't wait to see our cubers in action! 🧩

Best regards,
The Cubing Team`,

    progress: `Hi ${parentName.split(' ')[0]}! 👋

Great news about ${studentName.split(' ')[0]}'s cubing progress! 🌟

🧩 ${studentName.split(' ')[0]}'s Achievement Update:
• Improved solving technique
• Better time management
• Growing confidence with the cube

We're so proud of ${studentName.split(' ')[0]}'s dedication and progress in our program!

Feel free to reach out if you have any questions.

Best regards,
The Cubing Team 🎯`,

    payment: `Hi ${parentName.split(' ')[0]}! 👋

This is a friendly reminder regarding ${studentName.split(' ')[0]}'s cubing classes.

💳 Payment Reminder
We hope ${studentName.split(' ')[0]} is enjoying the cubing sessions! 

Please let us know if you need any assistance with the payment process or have any questions about our program.

Thank you for your continued support!

Best regards,
The Cubing Team 🎯`,

    competition: `Hi ${parentName.split(' ')[0]}! 👋

Our Cubing Competition at Table Bay Mall is still on! 🎉
We're now gathering the list of students who'd like to join us.

We'll also be hosting a Cubing Boot Camp for any kids who aren't currently part of our Cubing Hub lessons this term — perfect for sharpening their skills before the big day.

📋 Please fill in this short form to register ${studentName.split(' ')[0]}:
https://forms.gle/KPxiAF17Y6mhG2oC8

Even if ${studentName.split(' ')[0]} is a past Cubing Hub student and has learned to solve the cube with us before, we'd love to have them compete. 🏆
The more solvers we have, the more exciting the event will be!

More event details coming soon — we can't wait to see our cubers in action! 🧩

Best regards,
The Cubing Team`
  }
  
  return templates[messageType]
}

export function createEmailContent(parentName: string, studentName: string): { subject: string; body: string } {
  // Check for custom active email template
  const templates = localStorage.getItem('messageTemplates')
  if (templates) {
    const parsedTemplates = JSON.parse(templates)
    const activeEmailTemplate = parsedTemplates.find((t: any) => t.isActive && t.type === 'email')
    
    if (activeEmailTemplate) {
      const data = {
        parentFirstName: parentName.split(' ')[0],
        parentFullName: parentName,
        studentFirstName: studentName.split(' ')[0],
        studentFullName: studentName,
        currentDate: new Date().toLocaleDateString(),
      }
      
      return {
        subject: processTemplatePlaceholders(activeEmailTemplate.subject || 'Update from The Cubing Hub', data),
        body: processTemplatePlaceholders(activeEmailTemplate.message, data)
      }
    }
  }
  
  // Default email template
  return {
    subject: `Update on ${studentName.split(' ')[0]}'s Cubing Progress`,
    body: `Dear ${parentName.split(' ')[0]},

I hope this email finds you well. I wanted to provide you with an update on ${studentName.split(' ')[0]}'s progress in our cubing program.

Best regards,
The Cubing Team`
  }
}

export function openEmail(email: string | null, subject?: string, body?: string): void {
  if (!email) return
  let url = `mailto:${email}`
  const params = new URLSearchParams()
  
  if (subject) params.append('subject', subject)
  if (body) params.append('body', body)
  
  if (params.toString()) {
    url += '?' + params.toString()
  }
  
  window.open(url, '_blank')
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-purple-100 text-purple-800'
    case 'concern':
      return 'bg-red-100 text-red-800'
    case 'inactive':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusBadgeVariant(status: string): "default" | "destructive" | "outline" | "secondary" | null {
  switch (status) {
    case 'active':
      return 'default'
    case 'in_progress':
      return 'secondary'
    case 'completed':
      return 'default'
    case 'concern':
      return 'destructive'
    case 'inactive':
      return 'outline'
    default:
      return 'default'
  }
}

export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'outstanding':
      return 'bg-yellow-100 text-yellow-800'
    case 'partial':
      return 'bg-orange-100 text-orange-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
