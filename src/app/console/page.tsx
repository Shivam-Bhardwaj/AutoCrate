'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Mock data for pending changes - in production this would come from an API
const PENDING_CHANGES = [
  {
    id: 'pmi-standards',
    title: 'PMI Standards & Documentation Update',
    description: 'Added ASME Y14.5 datum planes, fixed scaling, and created team documentation',
    author: 'Claude',
    date: new Date().toISOString(),
    status: 'pending',
    previewUrl: 'https://auto-crate-feature-pmi-asme-standards-shivam-bhardwajs-projects.vercel.app',
    rejectionReason: undefined as string | undefined,
    changes: [
      { type: 'feature', description: 'Dynamic PMI scaling based on crate size' },
      { type: 'feature', description: 'ASME Y14.5 datum planes (A, B, C) visualization' },
      { type: 'feature', description: 'Team documentation page with password protection' },
      { type: 'feature', description: 'Mobile review workflow for Keelyn' },
      { type: 'improvement', description: 'Fixed PMI labels to follow standards' },
      { type: 'improvement', description: 'Removed redundant PMI snapshot panel' },
    ],
    screenshots: [
      { label: 'PMI Datum Planes', status: 'New datum plane visualization' },
      { label: 'Team Docs Page', status: 'Password-protected documentation' },
      { label: 'Mobile Workflow', status: 'Easy review process' }
    ]
  }
]

export default function ConsolePage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [changes, setChanges] = useState(PENDING_CHANGES)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'deployed'>('pending')
  const router = useRouter()

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem('console_auth')
    if (auth === 'pazz_keelyn') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'pazz_keelyn') {
      setIsAuthenticated(true)
      sessionStorage.setItem('console_auth', 'pazz_keelyn')
    } else {
      alert('Incorrect password. Please contact Shivam for access.')
    }
  }

  const handleApprove = (changeId: string) => {
    setChanges(prev => prev.map(c =>
      c.id === changeId ? { ...c, status: 'approved' } : c
    ))
    alert('Changes approved! Deploying to production...')
    // In production, this would trigger actual deployment
    setTimeout(() => {
      setChanges(prev => prev.map(c =>
        c.id === changeId ? { ...c, status: 'deployed' } : c
      ))
    }, 3000)
  }

  const handleReject = (changeId: string) => {
    const reason = prompt('Why are you rejecting these changes?')
    if (reason) {
      setChanges(prev => prev.map(c =>
        c.id === changeId ? { ...c, status: 'rejected', rejectionReason: reason } : c
      ))
      alert('Changes rejected. Claude will be notified to make adjustments.')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            AutoCrate Console
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Manage changes and deployments visually
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Access Console
            </button>
          </form>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to AutoCrate
          </button>
        </div>
      </div>
    )
  }

  const pendingChanges = changes.filter(c => c.status === 'pending')
  const approvedChanges = changes.filter(c => c.status === 'approved')
  const deployedChanges = changes.filter(c => c.status === 'deployed')
  const rejectedChanges = changes.filter(c => c.status === 'rejected')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AutoCrate Console
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage changes without touching code
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/terminal')}
                className="text-green-600 dark:text-green-400 hover:underline"
              >
                Terminal →
              </button>
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Back to App →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'pending'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Pending ({pendingChanges.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'approved'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Approved ({approvedChanges.length})
          </button>
          <button
            onClick={() => setActiveTab('deployed')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'deployed'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Deployed ({deployedChanges.length})
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {pendingChanges.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <span className="text-4xl mb-4 block">-</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Pending Changes
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All changes have been reviewed and deployed!
                </p>
              </div>
            ) : (
              pendingChanges.map(change => (
                <div key={change.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  {/* Change Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {change.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {change.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Author: {change.author}</span>
                          <span>Date: {new Date(change.date).toLocaleDateString()}</span>
                          <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-semibold">
                            PENDING REVIEW
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Changes List */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      What Changed:
                    </h3>
                    <ul className="space-y-2">
                      {change.changes.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">{item.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual Preview */}
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Visual Changes:
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      {change.screenshots.map((screenshot, idx) => (
                        <div key={idx} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                          <div className="aspect-video bg-gray-200 dark:bg-gray-600 rounded mb-2 flex items-center justify-center">
                            <span className="text-2xl">[IMG]</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {screenshot.label}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {screenshot.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={change.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold"
                      >
                        View Live Preview
                      </a>
                      <button
                        onClick={() => handleApprove(change.id)}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        Approve & Deploy
                      </button>
                      <button
                        onClick={() => handleReject(change.id)}
                        className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                      >
                        Request Changes
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                      Test in preview first, then approve to deploy to production
                    </p>
                  </div>
                </div>
              ))
            )}

            {rejectedChanges.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Rejected Changes
                </h3>
                <div className="space-y-4">
                  {rejectedChanges.map(change => (
                    <div key={change.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-red-900 dark:text-red-200">
                            {change.title}
                          </h4>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            Reason: {change.rejectionReason || 'No reason provided'}
                          </p>
                        </div>
                        <button className="text-sm text-red-600 dark:text-red-400 hover:underline">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'approved' && (
          <div className="space-y-4">
            {approvedChanges.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <span className="text-lg mb-4 block">...</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Approved Changes Pending Deployment
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Approved changes will appear here before deployment
                </p>
              </div>
            ) : (
              approvedChanges.map(change => (
                <div key={change.id} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-200">
                        {change.title}
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Approved • Deploying to production...
                      </p>
                    </div>
                    <div className="animate-spin h-5 w-5 border-2 border-green-600 border-t-transparent rounded-full"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'deployed' && (
          <div className="space-y-4">
            {deployedChanges.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <span className="text-lg mb-4 block">[DEPLOYED]</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Deployments Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Successfully deployed changes will appear here
                </p>
              </div>
            ) : (
              deployedChanges.map(change => (
                <div key={change.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {change.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Deployed successfully • Live in production
                      </p>
                    </div>
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold">[DONE]</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}