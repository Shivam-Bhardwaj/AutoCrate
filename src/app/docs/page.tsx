'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DocsPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem('docs_auth')
    if (auth === 'pazz_keelyn') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'pazz_keelyn') {
      setIsAuthenticated(true)
      sessionStorage.setItem('docs_auth', 'pazz_keelyn')
    } else {
      alert('Incorrect password. Please contact Shivam for access.')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🔐 Team Documentation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enter the password to access team guides and documentation
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
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Access Documentation
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📚 AutoCrate Team Documentation
            </h1>
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to App →
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <a
            href="#keelyn-guide"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              👩‍💼 Keelyn's Guide
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Step-by-step instructions for reviewing crate specifications
            </p>
          </a>
          <a
            href="#workflow"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              🔄 Team Workflow
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              How we work together: roles and responsibilities
            </p>
          </a>
          <a
            href="#mobile"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              📱 Mobile Review
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Review changes from your phone - no coding needed
            </p>
          </a>
        </div>

        {/* Keelyn's Guide Section */}
        <section id="keelyn-guide" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            👩‍💼 Keelyn's Guide to AutoCrate
          </h2>

          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mt-6 mb-4">Quick Start (5 Minutes)</h3>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h4 className="font-bold mb-2">Step 1: Create GitHub Account</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to <a href="https://github.com/signup" target="_blank" className="text-blue-600 dark:text-blue-400 underline">github.com/signup</a></li>
                <li>Enter your email</li>
                <li>Create a password</li>
                <li>Pick a username (like: keelyn-autocrate)</li>
                <li>Send username to Shivam</li>
              </ol>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <h4 className="font-bold mb-2">Step 2: Your Review Process</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Get email when changes are made</li>
                <li>Click the preview link</li>
                <li>Test the crate specifications</li>
                <li>Comment if something's wrong</li>
                <li>Approve if it's correct</li>
              </ol>
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-4">What You Review</h3>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">✅ Focus On:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Lumber sizes for weight</li>
                  <li>Skid configuration & spacing</li>
                  <li>Cleat placement</li>
                  <li>Panel thickness</li>
                  <li>Weight calculations</li>
                  <li>Industry standards</li>
                  <li>Safety requirements</li>
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">❌ Ignore:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Code syntax</li>
                  <li>Variable names</li>
                  <li>Technical implementation</li>
                  <li>Git commands</li>
                  <li>Build processes</li>
                  <li>File structures</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-4">Example Comments</h3>

            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="font-mono text-sm text-green-600 dark:text-green-400">✅ Good:</p>
                <p className="italic">"The skid spacing should be 24 inches for this weight, not 18 inches"</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="font-mono text-sm text-green-600 dark:text-green-400">✅ Good:</p>
                <p className="italic">"This needs 2x6 lumber because it's over 1500 lbs"</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="font-mono text-sm text-green-600 dark:text-green-400">✅ Good:</p>
                <p className="italic">"Perfect! This matches our standard for 1000 lb crates"</p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🔄 Team Workflow
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">👨‍💼</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Shivam</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Product Owner</p>
              <ul className="text-sm mt-3 space-y-1">
                <li>• Requests features</li>
                <li>• Final approval</li>
                <li>• Strategic decisions</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">👩‍💼</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Keelyn</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Domain Expert</p>
              <ul className="text-sm mt-3 space-y-1">
                <li>• Crate specifications</li>
                <li>• Industry standards</li>
                <li>• Technical accuracy</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Claude</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Engineer</p>
              <ul className="text-sm mt-3 space-y-1">
                <li>• Writes all code</li>
                <li>• Creates previews</li>
                <li>• Deploys changes</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="font-bold mb-4">How It Works:</h3>
            <ol className="space-y-3">
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                <span>Shivam: "We need to fix skid calculations"</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                <span>Claude: Creates fix and preview link</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                <span>Keelyn: "Spacing should be 24 inches for this weight"</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                <span>Claude: Updates based on feedback</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">5</span>
                <span>Keelyn: "Perfect now!" ✅</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">6</span>
                <span>Shivam: Approves and deploys</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Mobile Review Section */}
        <section id="mobile" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            📱 Mobile Review Guide
          </h2>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-2">📲 Download GitHub App (Optional but Easier!)</h3>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <a href="https://apps.apple.com/app/github/id1477376905" target="_blank" className="bg-black text-white rounded-lg px-4 py-2 text-center hover:bg-gray-800 transition-colors">
                📱 Download for iPhone
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.github.android" target="_blank" className="bg-green-600 text-white rounded-lg px-4 py-2 text-center hover:bg-green-700 transition-colors">
                🤖 Download for Android
              </a>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Review Process on Mobile:</h3>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-4 mt-1">1</div>
              <div>
                <h4 className="font-bold">Open GitHub app or email</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">You'll get notified when changes are made</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-4 mt-1">2</div>
              <div>
                <h4 className="font-bold">Tap the Pull Request</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">See what changed in plain English</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-4 mt-1">3</div>
              <div>
                <h4 className="font-bold">Click the preview link</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Opens the live test version</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-4 mt-1">4</div>
              <div>
                <h4 className="font-bold">Test the changes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Check if crate specs are correct</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-4 mt-1">5</div>
              <div>
                <h4 className="font-bold">Leave your review</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approve ✅ or Request Changes ❌</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🔗 Quick Links
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3">GitHub Links:</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://github.com/Shivam-Bhardwaj/AutoCrate" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">
                    📂 AutoCrate Repository
                  </a>
                </li>
                <li>
                  <a href="https://github.com/Shivam-Bhardwaj/AutoCrate/pulls" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">
                    🔄 Pull Requests (Review Changes)
                  </a>
                </li>
                <li>
                  <a href="https://github.com/Shivam-Bhardwaj/AutoCrate/issues" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">
                    📝 Issues (Report Problems)
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3">Getting Started:</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://github.com/signup" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">
                    👤 Create GitHub Account
                  </a>
                </li>
                <li>
                  <a href="https://vercel.com/dashboard" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">
                    🚀 Vercel Dashboard (Deployments)
                  </a>
                </li>
                <li className="text-gray-600 dark:text-gray-400">
                  📧 Contact Shivam for access
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-center text-green-800 dark:text-green-200">
              <strong>Remember:</strong> You can't break anything! Feel free to explore and comment. Your crate expertise makes this product better! 🎯
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}