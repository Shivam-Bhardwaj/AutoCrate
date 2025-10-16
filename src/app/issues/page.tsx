'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function IssuesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Check if already authenticated
  useEffect(() => {
    const authStatus = sessionStorage.getItem('issues_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
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
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl font-bold mb-6 text-center">GitHub Access Portal</h1>
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
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">← Back</Link>
              <h1 className="text-xl font-bold">GitHub Quick Access</h1>
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome Keelyn! 👋</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Use the quick links below to navigate to GitHub
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Create New Issue */}
          <a
            href="https://github.com/Shivam-Bhardwaj/AutoCrate/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-6 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">➕</span>
              <span className="text-green-600 dark:text-green-400 group-hover:underline">Open in GitHub →</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Create New Issue</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create a new issue for bugs, features, or improvements
            </p>
          </a>

          {/* View All Issues */}
          <a
            href="https://github.com/Shivam-Bhardwaj/AutoCrate/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg p-6 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📋</span>
              <span className="text-blue-600 dark:text-blue-400 group-hover:underline">Open in GitHub →</span>
            </div>
            <h3 className="text-xl font-bold mb-2">View All Issues</h3>
            <p className="text-gray-600 dark:text-gray-400">
              See all open and closed issues in the repository
            </p>
          </a>

          {/* View Pull Requests */}
          <a
            href="https://github.com/Shivam-Bhardwaj/AutoCrate/pulls"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 rounded-lg p-6 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🔀</span>
              <span className="text-purple-600 dark:text-purple-400 group-hover:underline">Open in GitHub →</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Pull Requests</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Review and manage pull requests
            </p>
          </a>

          {/* Repository Home */}
          <a
            href="https://github.com/Shivam-Bhardwaj/AutoCrate"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 rounded-lg p-6 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🏠</span>
              <span className="text-orange-600 dark:text-orange-400 group-hover:underline">Open in GitHub →</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Repository Home</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Go to the AutoCrate repository homepage
            </p>
          </a>
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Quick Tips for Creating Issues</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">📝</span>
              <span>Use clear, descriptive titles that explain the issue or feature</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🏷️</span>
              <span>Add labels like "bug", "enhancement", or "documentation"</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📸</span>
              <span>Include screenshots or error messages when reporting bugs</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>Provide steps to reproduce for bugs or acceptance criteria for features</span>
            </li>
          </ul>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>All links open in a new tab. You can safely close this page after navigating to GitHub.</p>
        </div>
      </div>
    </main>
  )
}