'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'

interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  labels: Array<{ name: string; color: string }>
  created_at: string
  updated_at: string
  html_url: string
  user: {
    login: string
    avatar_url: string
  }
}

export default function IssuesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [newIssue, setNewIssue] = useState({ title: '', body: '', labels: '' })
  const [editingIssue, setEditingIssue] = useState({ title: '', body: '' })
  const [githubToken, setGithubToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)

  // Check if already authenticated
  useEffect(() => {
    const authStatus = sessionStorage.getItem('issues_authenticated')
    const savedToken = sessionStorage.getItem('github_token')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      if (savedToken) {
        setGithubToken(savedToken)
      }
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'pazz_keelyn') {
      setIsAuthenticated(true)
      sessionStorage.setItem('issues_authenticated', 'true')
      setPassword('')
      setError(null)
    } else {
      setError('Invalid password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('issues_authenticated')
    sessionStorage.removeItem('github_token')
    setGithubToken('')
    setIssues([])
  }

  const saveGithubToken = () => {
    if (githubToken.trim()) {
      sessionStorage.setItem('github_token', githubToken)
      setShowTokenInput(false)
      loadIssues()
    }
  }

  const loadIssues = useCallback(async () => {
    setLoading(true)
    setError(null)

    const token = githubToken || sessionStorage.getItem('github_token')

    try {
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('https://api.github.com/repos/Shivam-Bhardwaj/AutoCrate/issues?state=all&per_page=100', {
        headers
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid GitHub token. Please update your token.')
        } else if (response.status === 403) {
          throw new Error('API rate limit exceeded. Please add a GitHub token.')
        }
        throw new Error(`Failed to fetch issues: ${response.statusText}`)
      }

      const data = await response.json()
      setIssues(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issues')
    } finally {
      setLoading(false)
    }
  }, [githubToken])

  useEffect(() => {
    if (isAuthenticated && (githubToken || sessionStorage.getItem('github_token'))) {
      loadIssues()
    }
  }, [isAuthenticated, loadIssues])

  const createIssue = async () => {
    const token = githubToken || sessionStorage.getItem('github_token')
    if (!token) {
      setError('GitHub token required to create issues')
      setShowTokenInput(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('https://api.github.com/repos/Shivam-Bhardwaj/AutoCrate/issues', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newIssue.title,
          body: newIssue.body,
          labels: newIssue.labels ? newIssue.labels.split(',').map(l => l.trim()) : []
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create issue: ${response.statusText}`)
      }

      setNewIssue({ title: '', body: '', labels: '' })
      await loadIssues()
      alert('Issue created successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue')
    } finally {
      setLoading(false)
    }
  }

  const updateIssue = async () => {
    if (!selectedIssue) return

    const token = githubToken || sessionStorage.getItem('github_token')
    if (!token) {
      setError('GitHub token required to update issues')
      setShowTokenInput(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://api.github.com/repos/Shivam-Bhardwaj/AutoCrate/issues/${selectedIssue.number}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editingIssue.title,
          body: editingIssue.body
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to update issue: ${response.statusText}`)
      }

      setEditMode(false)
      setSelectedIssue(null)
      await loadIssues()
      alert('Issue updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update issue')
    } finally {
      setLoading(false)
    }
  }

  const closeIssue = async (issueNumber: number) => {
    const token = githubToken || sessionStorage.getItem('github_token')
    if (!token) {
      setError('GitHub token required to close issues')
      setShowTokenInput(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://api.github.com/repos/Shivam-Bhardwaj/AutoCrate/issues/${issueNumber}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          state: 'closed'
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to close issue: ${response.statusText}`)
      }

      await loadIssues()
      alert('Issue closed successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close issue')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl font-bold mb-6 text-center">GitHub Issues Manager</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password for Keelyn
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  autoFocus
                />
              </div>
              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
              )}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">← Back</a>
              <h1 className="text-xl font-bold">GitHub Issues Manager</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Token Setup */}
      {(showTokenInput || !githubToken && !sessionStorage.getItem('github_token')) && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">GitHub Token Required</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              To create or edit issues, you need to provide a GitHub personal access token with repo scope.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder="ghp_..."
              />
              <button
                onClick={saveGithubToken}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Token
              </button>
              <button
                onClick={() => setShowTokenInput(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Issues List */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Issues</h2>
              <button
                onClick={loadIssues}
                disabled={loading}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {issues.map(issue => (
                <div
                  key={issue.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedIssue(issue)
                    setEditingIssue({ title: issue.title, body: issue.body || '' })
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">
                        #{issue.number} - {issue.title}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          issue.state === 'open'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {issue.state}
                        </span>
                        {issue.labels.map(label => (
                          <span
                            key={label.name}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `#${label.color}30`,
                              color: `#${label.color}`
                            }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Form */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <h2 className="text-lg font-semibold mb-4">
              {selectedIssue ? (editMode ? 'Edit Issue' : 'Issue Details') : 'Create New Issue'}
            </h2>

            {selectedIssue && !editMode ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedIssue.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    #{selectedIssue.number} - {selectedIssue.state}
                  </p>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{selectedIssue.body || 'No description'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  {selectedIssue.state === 'open' && (
                    <button
                      onClick={() => closeIssue(selectedIssue.number)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Close Issue
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedIssue(null)
                      setEditMode(false)
                    }}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <a
                    href={selectedIssue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={editMode ? editingIssue.title : newIssue.title}
                    onChange={(e) => editMode
                      ? setEditingIssue({ ...editingIssue, title: e.target.value })
                      : setNewIssue({ ...newIssue, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="Issue title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editMode ? editingIssue.body : newIssue.body}
                    onChange={(e) => editMode
                      ? setEditingIssue({ ...editingIssue, body: e.target.value })
                      : setNewIssue({ ...newIssue, body: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    rows={8}
                    placeholder="Issue description (supports Markdown)"
                  />
                </div>
                {!editMode && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Labels (comma-separated)</label>
                    <input
                      type="text"
                      value={newIssue.labels}
                      onChange={(e) => setNewIssue({ ...newIssue, labels: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      placeholder="bug, enhancement, documentation"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={editMode ? updateIssue : createIssue}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editMode ? 'Update Issue' : 'Create Issue')}
                  </button>
                  {(editMode || selectedIssue) && (
                    <button
                      onClick={() => {
                        setSelectedIssue(null)
                        setEditMode(false)
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Instructions for Keelyn</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Click on any issue in the left panel to view details</li>
            <li>Use the Edit button to modify existing issues</li>
            <li>Create new issues using the form on the right</li>
            <li>Your GitHub token is saved in this session only</li>
            <li>For security, the token will be cleared when you logout</li>
          </ul>
        </div>
      </div>
    </main>
  )
}