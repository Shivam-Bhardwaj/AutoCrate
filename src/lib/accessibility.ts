/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 * Provides consistent accessibility patterns across the application
 */

// ARIA live region announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Focus management utilities
export const focusElement = (selector: string) => {
  const element = document.querySelector(selector) as HTMLElement
  if (element) {
    element.focus()
  }
}

export const trapFocus = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
  }
  
  container.addEventListener('keydown', handleTabKey)
  
  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

// Keyboard navigation utilities
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  options: {
    onEnter?: () => void
    onEscape?: () => void
    onArrowUp?: () => void
    onArrowDown?: () => void
    onArrowLeft?: () => void
    onArrowRight?: () => void
    onSpace?: () => void
  }
) => {
  switch (event.key) {
    case 'Enter':
      options.onEnter?.()
      break
    case 'Escape':
      options.onEscape?.()
      break
    case 'ArrowUp':
      options.onArrowUp?.()
      break
    case 'ArrowDown':
      options.onArrowDown?.()
      break
    case 'ArrowLeft':
      options.onArrowLeft?.()
      break
    case 'ArrowRight':
      options.onArrowRight?.()
      break
    case ' ':
      event.preventDefault()
      options.onSpace?.()
      break
  }
}

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color)
    if (!rgb) return 0
    
    const { r, g, b } = rgb
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// WCAG 2.1 AA compliance checkers
export const isWCAGCompliant = (color1: string, color2: string): boolean => {
  const ratio = getContrastRatio(color1, color2)
  return ratio >= 4.5 // AA standard for normal text
}

export const isWCAGCompliantLarge = (color1: string, color2: string): boolean => {
  const ratio = getContrastRatio(color1, color2)
  return ratio >= 3 // AA standard for large text
}

// Screen reader utilities
export const createScreenReaderOnly = (text: string): HTMLElement => {
  const element = document.createElement('span')
  element.className = 'sr-only'
  element.textContent = text
  return element
}

// Form accessibility utilities
export const createFieldError = (fieldId: string, errorMessage: string): void => {
  const field = document.getElementById(fieldId)
  if (!field) return
  
  // Remove existing error
  const existingError = document.getElementById(`${fieldId}-error`)
  if (existingError) {
    existingError.remove()
  }
  
  // Add new error
  const errorElement = document.createElement('div')
  errorElement.id = `${fieldId}-error`
  errorElement.className = 'text-red-600 text-sm mt-1'
  errorElement.setAttribute('role', 'alert')
  errorElement.setAttribute('aria-live', 'polite')
  errorElement.textContent = errorMessage
  
  field.setAttribute('aria-invalid', 'true')
  field.setAttribute('aria-describedby', `${fieldId}-error`)
  
  field.parentNode?.insertBefore(errorElement, field.nextSibling)
}

export const clearFieldError = (fieldId: string): void => {
  const field = document.getElementById(fieldId)
  if (!field) return
  
  const errorElement = document.getElementById(`${fieldId}-error`)
  if (errorElement) {
    errorElement.remove()
  }
  
  field.removeAttribute('aria-invalid')
  field.removeAttribute('aria-describedby')
}

// Skip links for keyboard navigation
export const createSkipLink = (targetId: string, text: string): HTMLElement => {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.textContent = text
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50'
  return skipLink
}

// High contrast mode detection
export const isHighContrastMode = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches
}

// Reduced motion detection
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Dark mode detection
export const prefersDarkMode = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Accessibility testing utilities
export const validateAccessibility = (element: HTMLElement): string[] => {
  const issues: string[] = []
  
  // Check for missing alt text on images
  const images = element.querySelectorAll('img')
  images.forEach((img, index) => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push(`Image ${index + 1} is missing alt text or aria-label`)
    }
  })
  
  // Check for missing labels on form inputs
  const inputs = element.querySelectorAll('input, select, textarea')
  inputs.forEach((input, index) => {
    const id = input.id
    const label = id ? document.querySelector(`label[for="${id}"]`) : null
    const ariaLabel = input.getAttribute('aria-label')
    const ariaLabelledBy = input.getAttribute('aria-labelledby')
    
    if (!label && !ariaLabel && !ariaLabelledBy) {
      issues.push(`Form input ${index + 1} is missing label or aria-label`)
    }
  })
  
  // Check for missing heading hierarchy
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let previousLevel = 0
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1))
    if (level > previousLevel + 1) {
      issues.push(`Heading ${index + 1} (${heading.tagName}) skips heading levels`)
    }
    previousLevel = level
  })
  
  return issues
}

// Export all utilities
export default {
  announceToScreenReader,
  focusElement,
  trapFocus,
  handleKeyboardNavigation,
  getContrastRatio,
  isWCAGCompliant,
  isWCAGCompliantLarge,
  createScreenReaderOnly,
  createFieldError,
  clearFieldError,
  createSkipLink,
  isHighContrastMode,
  prefersReducedMotion,
  prefersDarkMode,
  validateAccessibility
}
