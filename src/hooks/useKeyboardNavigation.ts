import { useEffect, useCallback, useRef } from 'react'
import { announceToScreenReader } from '@/lib/accessibility'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  preventDefault?: boolean
}

export interface UseKeyboardNavigationOptions {
  shortcuts?: KeyboardShortcut[]
  enableGlobalShortcuts?: boolean
  enableFormNavigation?: boolean
  enablePanelNavigation?: boolean
  announceShortcuts?: boolean
}

export const useKeyboardNavigation = (options: UseKeyboardNavigationOptions = {}) => {
  const shortcutsRef = useRef<KeyboardShortcut[]>(options.shortcuts || [])
  const isEnabledRef = useRef(true)

  // Update shortcuts when they change
  useEffect(() => {
    shortcutsRef.current = options.shortcuts || []
  }, [options.shortcuts])

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabledRef.current) return

    const { key, ctrlKey, shiftKey, altKey, metaKey } = event

    // Find matching shortcut
    const shortcut = shortcutsRef.current.find(s => 
      s.key.toLowerCase() === key.toLowerCase() &&
      !!s.ctrlKey === ctrlKey &&
      !!s.shiftKey === shiftKey &&
      !!s.altKey === altKey &&
      !!s.metaKey === metaKey
    )

    if (shortcut) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault()
      }
      
      if (options.announceShortcuts) {
        announceToScreenReader(`Shortcut activated: ${shortcut.description}`)
      }
      
      shortcut.action()
    }

    // Global shortcuts
    if (options.enableGlobalShortcuts) {
      handleGlobalShortcuts(event)
    }

    // Form navigation
    if (options.enableFormNavigation) {
      handleFormNavigation(event)
    }

    // Panel navigation
    if (options.enablePanelNavigation) {
      handlePanelNavigation(event)
    }
  }, [options])

  // Global shortcuts
  const handleGlobalShortcuts = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, altKey } = event

    switch (key) {
      case 'F1':
        event.preventDefault()
        announceToScreenReader('Keyboard shortcuts help')
        showKeyboardShortcutsHelp()
        break
      
      case 'Escape':
        // Close any open modals or panels
        const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]')
        if (activeModal) {
          const closeButton = activeModal.querySelector('[aria-label*="close"], [aria-label*="Close"]')
          if (closeButton instanceof HTMLElement) {
            closeButton.click()
          }
        }
        break
      
      case 'Tab':
        // Enhanced tab navigation with skip links
        if (event.shiftKey) {
          // Shift+Tab - go to previous focusable element
          handleSkipToPrevious(event)
        } else {
          // Tab - go to next focusable element
          handleSkipToNext(event)
        }
        break
      
      case 'Home':
        if (ctrlKey) {
          event.preventDefault()
          // Ctrl+Home - go to main content
          const mainContent = document.querySelector('main, [role="main"]')
          if (mainContent instanceof HTMLElement) {
            mainContent.focus()
            announceToScreenReader('Moved to main content')
          }
        }
        break
      
      case 'End':
        if (ctrlKey) {
          event.preventDefault()
          // Ctrl+End - go to footer or last element
          const footer = document.querySelector('footer, [role="contentinfo"]')
          if (footer instanceof HTMLElement) {
            footer.focus()
            announceToScreenReader('Moved to footer')
          }
        }
        break
    }
  }, [])

  // Form navigation
  const handleFormNavigation = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey } = event
    const activeElement = document.activeElement as HTMLElement

    if (!activeElement || !['INPUT', 'SELECT', 'TEXTAREA'].includes(activeElement.tagName)) {
      return
    }

    switch (key) {
      case 'ArrowUp':
        event.preventDefault()
        // Move to previous form field
        const prevField = findPreviousFormField(activeElement)
        if (prevField) {
          prevField.focus()
          announceToScreenReader(`Moved to ${getFieldLabel(prevField)}`)
        }
        break
      
      case 'ArrowDown':
        event.preventDefault()
        // Move to next form field
        const nextField = findNextFormField(activeElement)
        if (nextField) {
          nextField.focus()
          announceToScreenReader(`Moved to ${getFieldLabel(nextField)}`)
        }
        break
      
      case 'Enter':
        if (ctrlKey) {
          event.preventDefault()
          // Ctrl+Enter - submit form
          const form = activeElement.closest('form')
          if (form) {
            const submitButton = form.querySelector('button[type="submit"]')
            if (submitButton instanceof HTMLElement) {
              submitButton.click()
              announceToScreenReader('Form submitted')
            }
          }
        }
        break
    }
  }, [])

  // Panel navigation
  const handlePanelNavigation = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, altKey } = event

    switch (key) {
      case '1':
        if (altKey) {
          event.preventDefault()
          // Alt+1 - focus configuration panel
          focusPanel('configuration')
        }
        break
      
      case '2':
        if (altKey) {
          event.preventDefault()
          // Alt+2 - focus 3D viewer
          focusPanel('viewer')
        }
        break
      
      case '3':
        if (altKey) {
          event.preventDefault()
          // Alt+3 - focus validation panel
          focusPanel('validation')
        }
        break
      
      case '4':
        if (altKey) {
          event.preventDefault()
          // Alt+4 - focus export panel
          focusPanel('export')
        }
        break
      
      case 'ArrowLeft':
        if (ctrlKey) {
          event.preventDefault()
          // Ctrl+Left - previous panel
          navigateToPreviousPanel()
        }
        break
      
      case 'ArrowRight':
        if (ctrlKey) {
          event.preventDefault()
          // Ctrl+Right - next panel
          navigateToNextPanel()
        }
        break
    }
  }, [])

  // Helper functions
  const findPreviousFormField = (currentElement: HTMLElement): HTMLElement | null => {
    const formFields = Array.from(document.querySelectorAll('input, select, textarea, button'))
    const currentIndex = formFields.indexOf(currentElement)
    return currentIndex > 0 ? formFields[currentIndex - 1] as HTMLElement : null
  }

  const findNextFormField = (currentElement: HTMLElement): HTMLElement | null => {
    const formFields = Array.from(document.querySelectorAll('input, select, textarea, button'))
    const currentIndex = formFields.indexOf(currentElement)
    return currentIndex < formFields.length - 1 ? formFields[currentIndex + 1] as HTMLElement : null
  }

  const getFieldLabel = (field: HTMLElement): string => {
    const id = field.id
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`)
      if (label) return label.textContent || 'form field'
    }
    
    const ariaLabel = field.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel
    
    const placeholder = field.getAttribute('placeholder')
    if (placeholder) return placeholder
    
    return 'form field'
  }

  const focusPanel = (panelType: string) => {
    const panelSelectors = {
      configuration: '[aria-label*="Configuration Panel"], aside:first-of-type',
      viewer: '[aria-label*="3D Crate Visualization"], section',
      validation: '[aria-label*="Validation"], aside:last-of-type',
      export: '[aria-label*="Export Panel"], aside:last-of-type'
    }
    
    const selector = panelSelectors[panelType as keyof typeof panelSelectors]
    if (selector) {
      const panel = document.querySelector(selector)
      if (panel instanceof HTMLElement) {
        panel.focus()
        announceToScreenReader(`Focused ${panelType} panel`)
      }
    }
  }

  const navigateToPreviousPanel = () => {
    const panels = Array.from(document.querySelectorAll('aside, section'))
    const currentPanel = document.activeElement?.closest('aside, section')
    
    if (currentPanel) {
      const currentIndex = panels.indexOf(currentPanel)
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : panels.length - 1
      const prevPanel = panels[prevIndex] as HTMLElement
      prevPanel.focus()
      announceToScreenReader('Moved to previous panel')
    }
  }

  const navigateToNextPanel = () => {
    const panels = Array.from(document.querySelectorAll('aside, section'))
    const currentPanel = document.activeElement?.closest('aside, section')
    
    if (currentPanel) {
      const currentIndex = panels.indexOf(currentPanel)
      const nextIndex = currentIndex < panels.length - 1 ? currentIndex + 1 : 0
      const nextPanel = panels[nextIndex] as HTMLElement
      nextPanel.focus()
      announceToScreenReader('Moved to next panel')
    }
  }

  const handleSkipToNext = (event: KeyboardEvent) => {
    const focusableElements = Array.from(document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )) as HTMLElement[]
    
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    if (currentIndex < focusableElements.length - 1) {
      const nextElement = focusableElements[currentIndex + 1]
      nextElement.focus()
    }
  }

  const handleSkipToPrevious = (event: KeyboardEvent) => {
    const focusableElements = Array.from(document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )) as HTMLElement[]
    
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    if (currentIndex > 0) {
      const prevElement = focusableElements[currentIndex - 1]
      prevElement.focus()
    }
  }

  const showKeyboardShortcutsHelp = () => {
    const shortcuts = shortcutsRef.current
    const helpText = shortcuts.map(s => 
      `${s.key}${s.ctrlKey ? '+Ctrl' : ''}${s.shiftKey ? '+Shift' : ''}${s.altKey ? '+Alt' : ''}${s.metaKey ? '+Meta' : ''}: ${s.description}`
    ).join(', ')
    
    announceToScreenReader(`Available shortcuts: ${helpText}`)
  }

  // Add event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Enable/disable functionality
  const enable = useCallback(() => {
    isEnabledRef.current = true
  }, [])

  const disable = useCallback(() => {
    isEnabledRef.current = false
  }, [])

  const addShortcut = useCallback((shortcut: KeyboardShortcut) => {
    shortcutsRef.current.push(shortcut)
  }, [])

  const removeShortcut = useCallback((key: string) => {
    shortcutsRef.current = shortcutsRef.current.filter(s => s.key !== key)
  }, [])

  return {
    enable,
    disable,
    addShortcut,
    removeShortcut,
    isEnabled: isEnabledRef.current
  }
}

export default useKeyboardNavigation
