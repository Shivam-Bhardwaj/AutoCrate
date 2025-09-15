import { useEffect, useRef, useCallback, useState } from 'react'
import { announceToScreenReader, trapFocus, handleKeyboardNavigation } from '@/lib/accessibility'

/**
 * Custom hook for accessibility features
 * Provides common accessibility patterns for React components
 */

export interface UseAccessibilityOptions {
  // Screen reader announcements
  announceOnMount?: string
  announceOnUnmount?: string
  
  // Focus management
  trapFocusOnMount?: boolean
  restoreFocusOnUnmount?: boolean
  
  // Keyboard navigation
  onEnter?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onSpace?: () => void
  
  // ARIA attributes
  role?: string
  ariaLabel?: string
  ariaDescribedBy?: string
  ariaLive?: 'off' | 'polite' | 'assertive'
}

export const useAccessibility = (options: UseAccessibilityOptions = {}) => {
  const containerRef = useRef<HTMLElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Announce to screen reader on mount
  useEffect(() => {
    if (options.announceOnMount) {
      announceToScreenReader(options.announceOnMount, options.ariaLive || 'polite')
    }
  }, [options.announceOnMount, options.ariaLive])

  // Trap focus on mount
  useEffect(() => {
    if (options.trapFocusOnMount && containerRef.current) {
      previousActiveElement.current = document.activeElement as HTMLElement
      cleanupRef.current = trapFocus(containerRef.current)
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [options.trapFocusOnMount])

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (options.restoreFocusOnUnmount && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
      
      if (options.announceOnUnmount) {
        announceToScreenReader(options.announceOnUnmount, options.ariaLive || 'polite')
      }
    }
  }, [options.announceOnUnmount, options.restoreFocusOnUnmount, options.ariaLive])

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    handleKeyboardNavigation(event, {
      onEnter: options.onEnter,
      onEscape: options.onEscape,
      onArrowUp: options.onArrowUp,
      onArrowDown: options.onArrowDown,
      onArrowLeft: options.onArrowLeft,
      onArrowRight: options.onArrowRight,
      onSpace: options.onSpace,
    })
  }, [options])

  // Add keyboard event listener
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('keydown', handleKeyDown)
      
      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener('keydown', handleKeyDown)
        }
      }
    }
  }, [handleKeyDown])

  // Get ARIA attributes
  const getAriaAttributes = useCallback(() => {
    const attrs: Record<string, string> = {}
    
    if (options.role) {
      attrs.role = options.role
    }
    
    if (options.ariaLabel) {
      attrs['aria-label'] = options.ariaLabel
    }
    
    if (options.ariaDescribedBy) {
      attrs['aria-describedby'] = options.ariaDescribedBy
    }
    
    if (options.ariaLive) {
      attrs['aria-live'] = options.ariaLive
    }
    
    return attrs
  }, [options])

  return {
    containerRef,
    getAriaAttributes,
    announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => 
      announceToScreenReader(message, priority)
  }
}

/**
 * Hook for form field accessibility
 */
export const useFormFieldAccessibility = (fieldId: string, errorMessage?: string) => {
  const fieldRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(null)
  
  useEffect(() => {
    if (fieldRef.current) {
      if (errorMessage) {
        fieldRef.current.setAttribute('aria-invalid', 'true')
        fieldRef.current.setAttribute('aria-describedby', `${fieldId}-error`)
      } else {
        fieldRef.current.removeAttribute('aria-invalid')
        fieldRef.current.removeAttribute('aria-describedby')
      }
    }
  }, [fieldId, errorMessage])

  return {
    fieldRef,
    fieldProps: {
      id: fieldId,
      'aria-invalid': errorMessage ? 'true' : 'false',
      'aria-describedby': errorMessage ? `${fieldId}-error` : undefined,
    },
    errorProps: errorMessage ? {
      id: `${fieldId}-error`,
      role: 'alert',
      'aria-live': 'polite' as const,
    } : undefined
  }
}

/**
 * Hook for modal accessibility
 */
export const useModalAccessibility = (isOpen: boolean, onClose: () => void) => {
  const modalRef = useRef<HTMLDivElement>(null)
  
  const { containerRef, getAriaAttributes } = useAccessibility({
    trapFocusOnMount: isOpen,
    restoreFocusOnUnmount: true,
    onEscape: onClose,
    role: 'dialog',
    ariaLive: 'polite'
  })

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return {
    modalRef: containerRef,
    modalProps: {
      ...getAriaAttributes(),
      'aria-modal': 'true',
      tabIndex: -1,
    },
    backdropProps: {
      onClick: onClose,
      'aria-hidden': 'true',
    }
  }
}

/**
 * Hook for button accessibility
 */
export const useButtonAccessibility = (options: {
  loading?: boolean
  disabled?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const getButtonProps = useCallback(() => {
    const props: Record<string, any> = {
      ref: buttonRef,
      disabled: options.loading || options.disabled,
    }
    
    if (options.ariaLabel) {
      props['aria-label'] = options.ariaLabel
    }
    
    if (options.ariaDescribedBy) {
      props['aria-describedby'] = options.ariaDescribedBy
    }
    
    if (options.loading) {
      props['aria-busy'] = 'true'
    }
    
    return props
  }, [options])

  return {
    buttonRef,
    getButtonProps
  }
}

/**
 * Hook for list accessibility
 */
export const useListAccessibility = (options: {
  role?: 'listbox' | 'menu' | 'tablist' | 'list'
  ariaLabel?: string
  multiSelect?: boolean
}) => {
  const listRef = useRef<HTMLUListElement | HTMLOListElement>(null)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  
  const getListProps = useCallback(() => {
    const props: Record<string, any> = {
      ref: listRef,
      role: options.role || 'list',
    }
    
    if (options.ariaLabel) {
      props['aria-label'] = options.ariaLabel
    }
    
    if (options.multiSelect) {
      props['aria-multiselectable'] = 'true'
    }
    
    return props
  }, [options])

  const getItemProps = useCallback((index: number) => {
    const props: Record<string, any> = {
      role: options.role === 'listbox' ? 'option' : 'listitem',
      tabIndex: focusedIndex === index ? 0 : -1,
    }
    
    if (options.role === 'listbox' || options.role === 'menu') {
      props['aria-selected'] = selectedItems.has(index)
    }
    
    return props
  }, [options.role, selectedItems, focusedIndex])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const items = listRef.current?.querySelectorAll('[role="option"], [role="listitem"]')
    if (!items) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocusedIndex(prev => Math.min(prev + 1, items.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setFocusedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Home':
        event.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        event.preventDefault()
        setFocusedIndex(items.length - 1)
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        if (options.multiSelect) {
          setSelectedItems(prev => {
            const newSet = new Set(prev)
            if (newSet.has(focusedIndex)) {
              newSet.delete(focusedIndex)
            } else {
              newSet.add(focusedIndex)
            }
            return newSet
          })
        }
        break
    }
  }, [options.multiSelect, focusedIndex])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.addEventListener('keydown', handleKeyDown)
      return () => {
        if (listRef.current) {
          listRef.current.removeEventListener('keydown', handleKeyDown)
        }
      }
    }
  }, [handleKeyDown])

  return {
    listRef,
    getListProps,
    getItemProps,
    selectedItems,
    focusedIndex,
    setFocusedIndex
  }
}

export default useAccessibility
