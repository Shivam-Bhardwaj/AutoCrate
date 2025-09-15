'use client'

import { useState, useEffect } from 'react'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const [shortcuts, setShortcuts] = useState<Array<{
    key: string
    description: string
    category: string
  }>>([])

  useEffect(() => {
    if (isOpen) {
      // Define all available keyboard shortcuts
      const allShortcuts = [
        // Navigation
        { key: 'Tab', description: 'Move to next focusable element', category: 'Navigation' },
        { key: 'Shift + Tab', description: 'Move to previous focusable element', category: 'Navigation' },
        { key: 'Ctrl + Home', description: 'Go to main content', category: 'Navigation' },
        { key: 'Ctrl + End', description: 'Go to footer', category: 'Navigation' },
        { key: 'Escape', description: 'Close modal or cancel current action', category: 'Navigation' },
        
        // Panel Navigation
        { key: 'Alt + 1', description: 'Focus configuration panel', category: 'Panel Navigation' },
        { key: 'Alt + 2', description: 'Focus 3D viewer', category: 'Panel Navigation' },
        { key: 'Alt + 3', description: 'Focus validation panel', category: 'Panel Navigation' },
        { key: 'Alt + 4', description: 'Focus export panel', category: 'Panel Navigation' },
        { key: 'Ctrl + Left Arrow', description: 'Previous panel', category: 'Panel Navigation' },
        { key: 'Ctrl + Right Arrow', description: 'Next panel', category: 'Panel Navigation' },
        
        // Form Navigation
        { key: 'Up Arrow', description: 'Previous form field', category: 'Form Navigation' },
        { key: 'Down Arrow', description: 'Next form field', category: 'Form Navigation' },
        { key: 'Ctrl + Enter', description: 'Submit form', category: 'Form Navigation' },
        
        // 3D Viewer Controls
        { key: 'R', description: 'Reset camera view', category: '3D Viewer' },
        { key: 'F', description: 'Fit to screen', category: '3D Viewer' },
        { key: 'D', description: 'Toggle dimensions display', category: '3D Viewer' },
        { key: 'P', description: 'Toggle PMI annotations', category: '3D Viewer' },
        { key: 'E', description: 'Toggle exploded view', category: '3D Viewer' },
        { key: 'M', description: 'Toggle component metadata', category: '3D Viewer' },
        { key: 'Space', description: 'Pause/resume animation', category: '3D Viewer' },
        
        // Component Metadata
        { key: 'Hover over component', description: 'Show component metadata', category: 'Component Info' },
        { key: 'Click component indicator', description: 'Focus on component', category: 'Component Info' },
        
        // General
        { key: 'F1', description: 'Show this keyboard shortcuts help', category: 'General' },
        { key: 'Ctrl + S', description: 'Save configuration', category: 'General' },
        { key: 'Ctrl + Z', description: 'Undo last action', category: 'General' },
        { key: 'Ctrl + Y', description: 'Redo last action', category: 'General' },
      ]
      
      setShortcuts(allShortcuts)
    }
  }, [isOpen])

  if (!isOpen) return null

  const categories = [...new Set(shortcuts.map(s => s.category))]

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="shortcuts-title" className="text-xl font-semibold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Close keyboard shortcuts help"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {shortcuts
                    .filter(s => s.category === category)
                    .map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono text-gray-700">
                            {shortcut.key}
                          </kbd>
                        </div>
                        <span className="text-sm text-gray-600 text-right">
                          {shortcut.description}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Press <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">F1</kbd> or <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Escape</kbd> to close this help
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
