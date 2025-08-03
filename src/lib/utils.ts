import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: Date | string): string {
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) {
      return 'Invalid Date'
    }
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'Invalid Date'
  }
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}일 전`
  } else if (hours > 0) {
    return `${hours}시간 전`
  } else if (minutes > 0) {
    return `${minutes}분 전`
  } else {
    return '방금 전'
  }
}

// Text utilities
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, '') // 한글 포함
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Validation utilities
export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return ['http:', 'https:', 'ftp:'].includes(u.protocol)
  } catch {
    return false
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// User utilities
export function generateUsername(email: string): string {
  if (!email || !email.includes('@')) {
    return `user${Math.floor(Math.random() * 100000)}`
  }
  
  const [localPart] = email.split('@')
  const cleanLocal = localPart.split('+')[0] // Remove + tags
  
  // If the local part is just numbers or empty, generate random
  if (!cleanLocal || /^\d+$/.test(cleanLocal)) {
    return `user${Math.floor(Math.random() * 100000)}`
  }
  
  return cleanLocal
}
