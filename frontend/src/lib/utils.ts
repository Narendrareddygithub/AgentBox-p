// AgentBox v3.0 - Utility Functions
// Phase 1: Foundation & Test Infrastructure
// Based on PRD v3.0 utility requirements

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes safely
 * Combines clsx and tailwind-merge for optimal class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to human-readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), delay)
    }
  }
}

/**
 * Generate unique ID
 */
export function generateId(prefix?: string): string {
  const id = Math.random().toString(36).substring(2, 9)
  return prefix ? `${prefix}-${id}` : id
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Get test coverage color class based on percentage
 */
export function getCoverageColorClass(coverage: number): string {
  if (coverage >= 80) return 'text-green-400'
  if (coverage >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

/**
 * Get status color class
 */
export function getStatusColorClass(status: string): string {
  switch (status) {
    case 'completed':
    case 'ready':
    case 'passed':
      return 'text-green-400'
    case 'running':
    case 'testing':
    case 'pending':
      return 'text-yellow-400'
    case 'failed':
    case 'error':
      return 'text-red-400'
    default:
      return 'text-slate-400'
  }
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  }
}

/**
 * Check if current environment is development
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV
}

/**
 * Check if current environment is production
 */
export function isProduction(): boolean {
  return import.meta.env.PROD
}

/**
 * Get app version
 */
export function getAppVersion(): string {
  return import.meta.env.VITE_APP_VERSION || '3.0.0'
}