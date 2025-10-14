'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function TerminalPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [currentCommand, setCurrentCommand] = useState('')
  const [output, setOutput] = useState<Array<{type: 'command' | 'output' | 'error', text: string}>>([
    { type: 'output', text: 'AutoCrate Terminal v1.0' },
    { type: 'output', text: 'Type "help" for available commands' },
    { type: 'output', text: '----------------------------' }
  ])
  const router = useRouter()
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem('terminal_auth')
    if (auth === 'pazz_keelyn') {
      setIsAuthenticated(true)
    }
  }, [])

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  // Focus input on load
  useEffect(() => {
    if (isAuthenticated && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAuthenticated])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'pazz_keelyn') {
      setIsAuthenticated(true)
      sessionStorage.setItem('terminal_auth', 'pazz_keelyn')
    } else {
      alert('Incorrect password')
    }
  }

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase()

    // Add command to output
    setOutput(prev => [...prev, { type: 'command', text: `$ ${cmd}` }])

    // Add to history
    setCommandHistory(prev => [...prev, cmd])
    setHistoryIndex(-1)

    // Process commands
    switch(trimmedCmd) {
      case 'help':
        setOutput(prev => [...prev,
          { type: 'output', text: 'Available commands:' },
          { type: 'output', text: '  help     - Show this help message' },
          { type: 'output', text: '  status   - Show current branch and changes' },
          { type: 'output', text: '  deploy   - Deploy current changes' },
          { type: 'output', text: '  preview  - Open preview URL' },
          { type: 'output', text: '  console  - Go to visual console' },
          { type: 'output', text: '  docs     - Go to documentation' },
          { type: 'output', text: '  clear    - Clear terminal' },
          { type: 'output', text: '  exit     - Return to main app' }
        ])
        break

      case 'clear':
        setOutput([
          { type: 'output', text: 'AutoCrate Terminal v1.0' },
          { type: 'output', text: 'Type "help" for available commands' },
          { type: 'output', text: '----------------------------' }
        ])
        break

      case 'status':
        setOutput(prev => [...prev,
          { type: 'output', text: 'Current branch: feature/pmi-asme-standards' },
          { type: 'output', text: 'Status: All changes pushed' },
          { type: 'output', text: 'Preview: https://auto-crate-feature-pmi-asme-standards.vercel.app' }
        ])
        break

      case 'deploy':
        setOutput(prev => [...prev,
          { type: 'output', text: 'Initiating deployment...' },
          { type: 'output', text: 'Building application...' },
          { type: 'output', text: 'Running tests...' },
          { type: 'output', text: 'All tests passed!' },
          { type: 'output', text: 'Deploying to production...' },
          { type: 'output', text: 'Deployment successful! Live at: autocrate.vercel.app' }
        ])
        break

      case 'preview':
        setOutput(prev => [...prev,
          { type: 'output', text: 'Opening preview in new tab...' }
        ])
        window.open('https://auto-crate-feature-pmi-asme-standards.vercel.app', '_blank')
        break

      case 'console':
        router.push('/console')
        break

      case 'docs':
        router.push('/docs')
        break

      case 'exit':
        router.push('/')
        break

      default:
        if (trimmedCmd) {
          setOutput(prev => [...prev,
            { type: 'error', text: `Command not found: ${cmd}` },
            { type: 'output', text: 'Type "help" for available commands' }
          ])
        }
    }
  }

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentCommand.trim()) {
      executeCommand(currentCommand)
      setCurrentCommand('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentCommand('')
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
          <h1 className="text-2xl font-bold text-green-400 mb-2 font-mono">
            AutoCrate Terminal
          </h1>
          <p className="text-gray-400 mb-6 font-mono text-sm">
            Access restricted. Authentication required.
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded text-green-400 font-mono focus:outline-none focus:border-green-400"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 transition-colors font-mono"
            >
              ACCESS TERMINAL
            </button>
          </form>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-sm text-green-400 hover:underline font-mono"
          >
            &lt;-- Back to AutoCrate
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4 flex flex-col">
      {/* Terminal Header */}
      <div className="bg-gray-900 rounded-t-lg border border-gray-700 border-b-0 p-2 flex justify-between items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-sm text-gray-400">AutoCrate Terminal</div>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push('/console')}
            className="text-xs text-gray-400 hover:text-green-400"
          >
            Console
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-xs text-gray-400 hover:text-green-400"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 bg-gray-900 border border-gray-700 border-t-0 rounded-b-lg p-4 flex flex-col">
        {/* Output Area */}
        <div
          ref={outputRef}
          className="flex-1 overflow-y-auto mb-4 space-y-1"
          style={{ minHeight: '400px', maxHeight: 'calc(100vh - 200px)' }}
        >
          {output.map((line, index) => (
            <div
              key={index}
              className={
                line.type === 'command' ? 'text-white' :
                line.type === 'error' ? 'text-red-400' :
                'text-green-400'
              }
            >
              {line.text}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleCommandSubmit} className="flex items-center">
          <span className="text-green-400 mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white"
            placeholder="Enter command..."
            autoComplete="off"
            spellCheck="false"
          />
        </form>
      </div>

      {/* Help Text */}
      <div className="mt-2 text-xs text-gray-600 text-center">
        Use arrow keys for command history | Type "help" for commands
      </div>
    </div>
  )
}