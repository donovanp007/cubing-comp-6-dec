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

export function formatPhoneNumber(phone: string): string {
  // Format South African phone numbers
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function formatPhoneForWhatsApp(phone: string): string {
  // Clean phone number and format for WhatsApp
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

export function openWhatsApp(phone: string, message?: string): void {
  const formattedPhone = formatPhoneForWhatsApp(phone)
  const encodedMessage = message ? encodeURIComponent(message) : ''
  const url = `https://wa.me/${formattedPhone}${message ? `?text=${encodedMessage}` : ''}`
  window.open(url, '_blank')
}

export function openEmail(email: string, subject?: string, body?: string): void {
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
