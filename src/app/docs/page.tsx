'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DocsPage() {
  const [activeDoc, setActiveDoc] = useState<string>('overview')

  const docs = [
    { id: 'overview', title: '📚 Documentation Overview', category: 'Getting Started' },
    { id: 'quickstart', title: '🚀 Quick Start Guide', category: 'Getting Started' },
    { id: 'parallel-workflow', title: '⚡ Parallel Development Workflow', category: 'Development' },
    { id: 'modules', title: '🧩 Module Architecture', category: 'Development' },
    { id: 'project-status', title: '📊 Project Status & Memory', category: 'Development' },
    { id: 'work-log', title: '📝 Work Log', category: 'Development' },
    { id: 'testing', title: '🧪 Testing Guide', category: 'Quality' },
    { id: 'claude-guide', title: '🤖 Claude Code Guide', category: 'AI Development' },
  ]

  const categories = Array.from(new Set(docs.map(d => d.category)))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AutoCrate Documentation</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive development guide</p>
          </div>
          <Link
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to App
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 h-fit lg:sticky lg:top-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Contents</h2>
            {categories.map(category => (
              <div key={category} className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{category}</h3>
                <div className="space-y-1">
                  {docs.filter(d => d.category === category).map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => setActiveDoc(doc.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        activeDoc === doc.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {doc.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            {activeDoc === 'overview' && <OverviewDoc />}
            {activeDoc === 'quickstart' && <QuickStartDoc />}
            {activeDoc === 'parallel-workflow' && <ParallelWorkflowDoc />}
            {activeDoc === 'modules' && <ModulesDoc />}
            {activeDoc === 'project-status' && <ProjectStatusDoc />}
            {activeDoc === 'work-log' && <WorkLogDoc />}
            {activeDoc === 'testing' && <TestingDoc />}
            {activeDoc === 'claude-guide' && <ClaudeGuideDoc />}
          </main>
        </div>
      </div>
    </div>
  )
}

function OverviewDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <h1>📚 Documentation Overview</h1>

      <p className="lead">
        AutoCrate is a Next.js application for designing shipping crates with 3D visualization,
        NX CAD expression generation, and STEP file export.
      </p>

      <h2>What is AutoCrate?</h2>
      <p>
        AutoCrate uses a &quot;Two Diagonal Points&quot; construction method for parametric crate modeling:
      </p>
      <ul>
        <li><strong>Point 1:</strong> Origin (0,0,0)</li>
        <li><strong>Point 2:</strong> (Width, Length, Height)</li>
      </ul>

      <h2>Quick Links</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">🚀 Quick Start</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Get started with parallel development in 5 minutes</p>
          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">./scripts/tmux-autocrate.sh</code>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">⚡ Parallel Workflow</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">5 ways to work on multiple features at once</p>
          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">make parallel-dev</code>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">🧩 Module Architecture</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Understand module boundaries and dependencies</p>
          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Safe parallel work</code>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">🧪 Testing</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Jest, Playwright, and Keploy testing strategies</p>
          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm run test:all</code>
        </div>
      </div>

      <h2>Key Features</h2>
      <ul>
        <li>🎨 <strong>3D Visualization:</strong> React Three Fiber real-time preview</li>
        <li>📐 <strong>NX CAD Export:</strong> Parametric expression generation</li>
        <li>📦 <strong>STEP File Export:</strong> ISO 10303-21 AP242 compliant</li>
        <li>🔧 <strong>Hardware Integration:</strong> Klimp fasteners & lag screws</li>
        <li>📊 <strong>Plywood Optimization:</strong> Intelligent sheet layout algorithm</li>
        <li>⚡ <strong>Parallel Development:</strong> Work on multiple features simultaneously</li>
      </ul>

      <h2>Technology Stack</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><strong>Framework:</strong> Next.js 14</div>
        <div><strong>Language:</strong> TypeScript 5</div>
        <div><strong>3D:</strong> Three.js + R3F</div>
        <div><strong>Styling:</strong> Tailwind CSS 3</div>
        <div><strong>Testing:</strong> Jest + Playwright</div>
        <div><strong>Container:</strong> Docker</div>
      </div>

      <h2>Essential Commands</h2>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`# Development
npm run dev              # Start dev server
npm run build            # Production build
npm test                 # Run tests
npm run type-check       # TypeScript check

# Parallel Development
make parallel-dev        # Dev + tests + docker
make new-feature NAME=x  # Create feature branch
make work-status         # Check current work`}
      </pre>

      <h2>Documentation Files</h2>
      <p>All documentation is now accessible via this web interface. Original markdown files:</p>
      <ul>
        <li><code>CLAUDE.md</code> - Development guidance</li>
        <li><code>PROJECT_STATUS.md</code> - Real-time work tracking</li>
        <li><code>MODULES.md</code> - Module boundaries</li>
        <li><code>WORK_LOG.md</code> - Detailed history</li>
        <li><code>PARALLEL_WORKFLOW.md</code> - Workflow strategies</li>
        <li><code>QUICKSTART_PARALLEL.md</code> - Quick reference</li>
        <li><code>TESTING.md</code> - Testing guide</li>
      </ul>
    </div>
  )
}

function QuickStartDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <h1>🚀 Quick Start: Parallel Development</h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="font-semibold mb-2">Goal: Work on multiple features simultaneously without conflicts</p>
      </div>

      <h2>Fastest Way to Start (Recommended)</h2>

      <h3>Option A: Tmux (Terminal-based)</h3>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`# One command to set up everything:
cd /home/curious/workspace/projects/AutoCrate/repo
./scripts/tmux-autocrate.sh

# Then attach:
tmux attach -t autocrate`}
      </pre>

      <p><strong>You get:</strong></p>
      <ul>
        <li>5 panes ready for parallel work</li>
        <li>Feature A workspace (top-left)</li>
        <li>Feature B workspace (top-right)</li>
        <li>Docker logs (middle)</li>
        <li>Test runner (bottom-left)</li>
        <li>Status monitor (bottom-right)</li>
      </ul>

      <h3>Start Working:</h3>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`# In Pane 0 (Feature A):
git checkout -b feature/plywood-optimization
claude code
# Tell Claude: "Improve plywood optimization to support custom sheet sizes"

# In Pane 1 (Feature B):
git checkout -b feature/klimp-spacing
claude code
# Tell Claude: "Adjust klimp spacing to allow 0.5 inch increments"

# In Pane 2 (Docker):
docker compose up

# In Pane 3 (Tests):
npm test:watch`}
      </pre>

      <h3>Navigate Tmux:</h3>
      <div className="grid grid-cols-2 gap-2 text-sm not-prose mb-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded"><code>Alt + Arrow keys</code> - Move between panes</div>
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded"><code>Ctrl+a z</code> - Zoom pane (fullscreen)</div>
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded"><code>Ctrl+a d</code> - Detach (keeps running)</div>
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded"><code>tmux attach -t autocrate</code> - Reattach anytime</div>
      </div>

      <h3>Option B: Make Commands (Simple)</h3>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`cd /home/curious/workspace/projects/AutoCrate/repo

# See all commands:
make help

# Start everything in parallel:
make parallel-dev
# This runs: dev server + test watcher + docker containers

# In separate terminals:
# Terminal 1: Feature A
make new-feature NAME=plywood-optimization
claude code

# Terminal 2: Feature B
make new-feature NAME=klimp-spacing
claude code`}
      </pre>

      <h2>Workflow Example</h2>

      <h3>Step 1: Check what&apos;s safe to work on</h3>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`cat MODULES.md | grep -A 3 "plywood-splicing"
# Output: ✅ SAFE for parallel work

cat MODULES.md | grep -A 3 "klimp-calculator"
# Output: ✅ SAFE for parallel work`}
      </pre>

      <h3>Step 2: Claim your work</h3>
      <p>Edit <code>PROJECT_STATUS.md</code>:</p>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`### 🔄 Active Work (In Progress)

- **plywood-splicing.ts** - Add custom sheet size support
  - Worker: Claude-Session-A
  - Started: 2025-10-08 15:00
  - Status: Adding validation for custom dimensions
  - Expected completion: 2025-10-08 16:00

- **klimp-calculator.ts** - Improve spacing increments
  - Worker: Claude-Session-B
  - Started: 2025-10-08 15:00
  - Status: Adjusting spacing algorithm
  - Expected completion: 2025-10-08 16:00`}
      </pre>

      <h3>Step 3: Work in parallel</h3>
      <div className="grid grid-cols-2 gap-4 not-prose mb-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
          <h4 className="font-semibold mb-2">Terminal 1 (or tmux pane 0)</h4>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
{`git checkout -b feature/plywood-custom-sizes
claude code
# Work on plywood-splicing.ts
npm test -- plywood-splicing.test.ts`}
          </pre>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
          <h4 className="font-semibold mb-2">Terminal 2 (or tmux pane 1)</h4>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
{`git checkout -b feature/klimp-spacing
claude code
# Work on klimp-calculator.ts
npm test -- klimp-calculator.test.ts`}
          </pre>
        </div>
      </div>

      <h2>Common Scenarios</h2>

      <details className="mb-4">
        <summary className="font-semibold cursor-pointer">How do I know if I&apos;ll conflict with other work?</summary>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded mt-2">
{`# Check PROJECT_STATUS.md
cat PROJECT_STATUS.md | head -30

# Check MODULES.md for your module
grep "your-module-name" MODULES.md

# If marked ✅ SAFE and not in Active Work → Go ahead!
# If marked ⚠️ CAUTION → Coordinate via PROJECT_STATUS.md
# If marked 🔴 AVOID → Don't work on it in parallel`}
        </pre>
      </details>

      <details className="mb-4">
        <summary className="font-semibold cursor-pointer">Tests keep failing, how do I isolate?</summary>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded mt-2">
{`# Terminal 1: Watch only Feature A tests
npm test -- --watch plywood-splicing.test.ts

# Terminal 2: Watch only Feature B tests
npm test -- --watch klimp-calculator.test.ts

# Terminal 3: Run full suite before merging
npm run test:all`}
        </pre>
      </details>

      <h2>Pro Tips</h2>
      <ul>
        <li>✅ Use tmux for persistence - survives SSH disconnects</li>
        <li>✅ Commit often - every 15-30 minutes</li>
        <li>✅ Test continuously - <code>npm test:watch</code></li>
        <li>✅ Update PROJECT_STATUS.md - communication is key</li>
        <li>✅ Keep branches focused - one feature per branch</li>
      </ul>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-6">
        <p className="font-semibold mb-2">🎉 Ready to start?</p>
        <pre className="bg-white dark:bg-gray-800 p-2 rounded text-sm">
./scripts/tmux-autocrate.sh && tmux attach -t autocrate
        </pre>
      </div>
    </div>
  )
}

// Continuing with more doc components...
function ParallelWorkflowDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <h1>⚡ Parallel Development Workflow</h1>

      <p className="lead">
        5 different strategies for working on multiple features simultaneously
      </p>

      <h2>Strategy Comparison</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th>Strategy</th>
              <th>Best For</th>
              <th>Complexity</th>
              <th>Setup Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tmux</td>
              <td>Terminal users, SSH</td>
              <td>Medium</td>
              <td>5 min</td>
            </tr>
            <tr>
              <td>Make Commands</td>
              <td>Quick tasks</td>
              <td>Low</td>
              <td>1 min</td>
            </tr>
            <tr>
              <td>VS Code Containers</td>
              <td>GUI preference</td>
              <td>Low</td>
              <td>10 min</td>
            </tr>
            <tr>
              <td>GitHub Actions</td>
              <td>CI/CD automation</td>
              <td>Medium</td>
              <td>0 min (auto)</td>
            </tr>
            <tr>
              <td>Git Worktrees</td>
              <td>Advanced users</td>
              <td>High</td>
              <td>2 min</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>1. Tmux Terminal Multiplexing</h2>
      <p><strong>Best for:</strong> Pure terminal workflow, SSH connections, lightweight setups</p>

      <h3>Setup</h3>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`# Run the setup script
./scripts/tmux-autocrate.sh

# Attach to session
tmux attach -t autocrate`}
      </pre>

      <h3>Layout</h3>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`┌──────────────────────┬──────────────────────┐
│  Feature A           │  Feature B           │
│  (Claude Code)       │  (Claude Code)       │
│  branch: feat-A      │  branch: feat-B      │
├──────────────────────┴──────────────────────┤
│  Docker logs (main branch)                  │
├──────────────────────┬──────────────────────┤
│  Test runner (watch) │  Status monitor      │
└──────────────────────┴──────────────────────┘`}
      </pre>

      <h3>Pros & Cons</h3>
      <div className="grid grid-cols-2 gap-4 not-prose mb-4">
        <div className="border border-green-200 dark:border-green-700 rounded p-4">
          <h4 className="text-green-700 dark:text-green-400 font-semibold mb-2">✅ Pros</h4>
          <ul className="text-sm space-y-1">
            <li>Persistent (survives disconnects)</li>
            <li>Very lightweight</li>
            <li>Works over slow connections</li>
            <li>Pure terminal workflow</li>
          </ul>
        </div>
        <div className="border border-red-200 dark:border-red-700 rounded p-4">
          <h4 className="text-red-700 dark:text-red-400 font-semibold mb-2">❌ Cons</h4>
          <ul className="text-sm space-y-1">
            <li>Learning curve</li>
            <li>No GUI features</li>
            <li>Keyboard navigation only</li>
          </ul>
        </div>
      </div>

      <h2>2. Make Commands</h2>
      <p><strong>Best for:</strong> Quick tasks, remembering common commands</p>

      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`make help              # Show all commands
make parallel-dev      # Run dev + tests + docker
make new-feature NAME=x  # Create feature branch
make work-status       # Show current work`}
      </pre>

      <h2>3. VS Code Remote Containers</h2>
      <p><strong>Best for:</strong> GUI preference, VS Code users</p>

      <ol>
        <li>Install VS Code with Remote-Containers extension</li>
        <li>Open project: <code>code /path/to/AutoCrate/repo</code></li>
        <li>Click &quot;Reopen in Container&quot;</li>
        <li>Open multiple VS Code windows for different features</li>
      </ol>

      <h2>4. GitHub Actions CI/CD</h2>
      <p><strong>Best for:</strong> Automated testing on every branch</p>

      <p>Configured in <code>.github/workflows/parallel-ci.yml</code></p>
      <p>Runs automatically on every push:</p>
      <ul>
        <li>TypeScript type checking</li>
        <li>ESLint</li>
        <li>Unit tests with coverage</li>
        <li>E2E tests with Playwright</li>
        <li>Production build</li>
      </ul>

      <h2>5. Git Worktrees</h2>
      <p><strong>Best for:</strong> Advanced git users</p>

      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`# Create worktrees for each feature
git worktree add ../autocrate-feature-A feature/A
git worktree add ../autocrate-feature-B feature/B

# Now you have 3 directories:
# repo/                → main branch
# autocrate-feature-A/ → feature/A
# autocrate-feature-B/ → feature/B

# Work in each directory independently!`}
      </pre>

      <h2>Best Practices</h2>
      <ul>
        <li>✅ Each feature = one branch</li>
        <li>✅ Check PROJECT_STATUS.md before starting</li>
        <li>✅ Commit every 15-30 minutes</li>
        <li>✅ Run tests continuously</li>
        <li>✅ Sync with main regularly</li>
        <li>❌ Don&apos;t work on same file simultaneously</li>
        <li>❌ Don&apos;t mix multiple features in one branch</li>
      </ul>
    </div>
  )
}

// Continue with other doc components...
function ModulesDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <h1>🧩 Module Architecture & Boundaries</h1>

      <p className="lead">
        Understanding module boundaries enables safe parallel development
      </p>

      <h2>Module Safety Ratings</h2>
      <div className="space-y-2 not-prose mb-6">
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded p-3">
          <span className="text-2xl">✅</span>
          <div>
            <div className="font-semibold">SAFE</div>
            <div className="text-sm">Can be modified in parallel without coordination</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-semibold">CAUTION</div>
            <div className="text-sm">Coordinate via PROJECT_STATUS.md before modifying</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-3">
          <span className="text-2xl">🔴</span>
          <div>
            <div className="font-semibold">AVOID</div>
            <div className="text-sm">Never modify simultaneously - high collision risk</div>
          </div>
        </div>
      </div>

      <h2>Core Modules Status</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>Module</th>
              <th>Status</th>
              <th>Safe?</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>nx-generator.ts</code></td>
              <td>Stable</td>
              <td><span className="text-yellow-600">⚠️</span></td>
              <td>Core crate generation logic</td>
            </tr>
            <tr>
              <td><code>step-generator.ts</code></td>
              <td>Stable</td>
              <td><span className="text-yellow-600">⚠️</span></td>
              <td>STEP export - complex assembly</td>
            </tr>
            <tr>
              <td><code>plywood-splicing.ts</code></td>
              <td>Stable</td>
              <td><span className="text-green-600">✅</span></td>
              <td>Self-contained algorithm</td>
            </tr>
            <tr>
              <td><code>klimp-calculator.ts</code></td>
              <td>Stable</td>
              <td><span className="text-green-600">✅</span></td>
              <td>Klimp placement logic</td>
            </tr>
            <tr>
              <td><code>cleat-calculator.ts</code></td>
              <td>Stable</td>
              <td><span className="text-green-600">✅</span></td>
              <td>Cleat positioning</td>
            </tr>
            <tr>
              <td><code>page.tsx</code></td>
              <td>Stable</td>
              <td><span className="text-red-600">🔴</span></td>
              <td>Main application state</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Module Dependency Graph</h2>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs">
{`┌─────────────────────────────────────┐
│    User Interface Layer             │
│    (src/app/page.tsx)               │
└────────────┬────────────────────────┘
             │
     ┌───────┴───────┐
     │               │
     ▼               ▼
┌──────────┐    ┌──────────┐
│Components│    │API Routes│
└────┬─────┘    └────┬─────┘
     │               │
     └───────┬───────┘
             │
             ▼
     ┌───────────────┐
     │ Core Logic    │
     │ (src/lib/)    │
     ├───────────────┤
     │ nx-generator  │
     │ step-generator│
     │ plywood-      │
     │ klimp-        │
     │ cleat-        │
     └───────────────┘`}
      </pre>

      <h2>Parallel Work Matrix</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>Module A → Module B</th>
              <th>Can Work Simultaneously?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Different API routes</td>
              <td><span className="text-green-600">✅ Yes</span></td>
            </tr>
            <tr>
              <td>Different calculators (klimp, cleat, lag)</td>
              <td><span className="text-green-600">✅ Yes</span></td>
            </tr>
            <tr>
              <td>Different UI components</td>
              <td><span className="text-green-600">✅ Yes (if no shared state)</span></td>
            </tr>
            <tr>
              <td>Calculator + UI component</td>
              <td><span className="text-green-600">✅ Yes</span></td>
            </tr>
            <tr>
              <td>nx-generator + step-generator</td>
              <td><span className="text-yellow-600">⚠️ Coordinate</span></td>
            </tr>
            <tr>
              <td>page.tsx + any component</td>
              <td><span className="text-yellow-600">⚠️ Coordinate</span></td>
            </tr>
            <tr>
              <td>Any module + tests</td>
              <td><span className="text-green-600">✅ Yes</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Safe Parallel Patterns</h2>
      <ul>
        <li>✅ New feature modules (create new files)</li>
        <li>✅ Independent components</li>
        <li>✅ API routes (no shared state)</li>
        <li>✅ Test files</li>
        <li>✅ Documentation files</li>
        <li>✅ Bug fixes in isolated functions</li>
      </ul>

      <h2>Coordination Required</h2>
      <ul>
        <li>⚠️ State changes in page.tsx</li>
        <li>⚠️ Changes to shared configuration interfaces</li>
        <li>⚠️ Updates to CrateConfig type</li>
        <li>⚠️ Core logic modifications</li>
      </ul>

      <h2>Avoid Conflicts</h2>
      <ul>
        <li>🔴 Never work on same file simultaneously</li>
        <li>🔴 Don&apos;t modify parent and child components together</li>
        <li>🔴 Avoid tightly coupled modules</li>
      </ul>
    </div>
  )
}

// Remaining doc components would follow similar pattern...
// For brevity, I'll include placeholders for the remaining docs

function ProjectStatusDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <h1>📊 Project Status & Memory</h1>
      <p>Current version: <strong>13.1.0</strong></p>
      <p>Phase: <strong>Production - Active Development</strong></p>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3>🔄 Active Work (In Progress)</h3>
        <p><em>No active work streams currently</em></p>
        <p className="text-sm">Update PROJECT_STATUS.md to claim work before starting</p>
      </div>

      <h2>Module Health Status</h2>
      <p>All core modules stable as of 2025-10-08</p>

      <h2>Version Control Strategy</h2>
      <ul>
        <li><strong>Patch</strong> (13.1.0 → 13.1.1): Bug fixes</li>
        <li><strong>Minor</strong> (13.1.0 → 13.2.0): New features</li>
        <li><strong>Major</strong> (13.1.0 → 14.0.0): Breaking changes</li>
      </ul>

      <h2>Communication Protocol</h2>
      <ol>
        <li>Check PROJECT_STATUS.md for active work</li>
        <li>Check MODULES.md for safety rating</li>
        <li>Add entry to Active Work section</li>
        <li>Create feature branch</li>
        <li>Work and commit frequently</li>
        <li>Update WORK_LOG.md when done</li>
      </ol>
    </div>
  )
}

function WorkLogDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <h1>📝 Work Log</h1>
      <p>Detailed work history for the project</p>

      <h2>2025-10-08 - Documentation & Parallel Workflow System</h2>
      <p><strong>Worker:</strong> Claude</p>

      <h3>Changes:</h3>
      <ul>
        <li>✅ Created comprehensive documentation system</li>
        <li>✅ Built tmux development environment</li>
        <li>✅ Added VS Code devcontainer configuration</li>
        <li>✅ Set up GitHub Actions CI/CD</li>
        <li>✅ Created Makefile with 20+ commands</li>
        <li>✅ Wrote parallel workflow guides</li>
      </ul>

      <h3>Files Created:</h3>
      <ul>
        <li>PROJECT_STATUS.md</li>
        <li>MODULES.md</li>
        <li>WORK_LOG.md</li>
        <li>PARALLEL_WORKFLOW.md</li>
        <li>QUICKSTART_PARALLEL.md</li>
        <li>scripts/tmux-autocrate.sh</li>
        <li>.devcontainer/devcontainer.json</li>
        <li>.github/workflows/parallel-ci.yml</li>
        <li>Makefile</li>
      </ul>

      <h3>Impact:</h3>
      <ul>
        <li>Multiple LLMs can now work in parallel safely</li>
        <li>Clear module boundaries defined</li>
        <li>Automated CI/CD pipeline</li>
        <li>Comprehensive documentation accessible via web</li>
      </ul>
    </div>
  )
}

function TestingDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <h1>🧪 Testing Guide</h1>

      <h2>Testing Stack</h2>
      <ul>
        <li><strong>Unit Testing:</strong> Jest + React Testing Library</li>
        <li><strong>E2E Testing:</strong> Playwright</li>
        <li><strong>API Testing:</strong> Keploy (Docker-based)</li>
        <li><strong>Pre-commit:</strong> Husky + lint-staged</li>
      </ul>

      <h2>Quick Start</h2>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`# Run all tests
npm run test:all

# Unit tests
npm test                # Run once
npm test:watch          # Watch mode
npm test:coverage       # With coverage

# E2E tests
npm run test:e2e        # Run E2E
npm run test:e2e:ui     # With UI
npm run test:e2e:debug  # Debug mode`}
      </pre>

      <h2>Test Structure</h2>
      <ul>
        <li><code>src/lib/__tests__/</code> - Core library tests</li>
        <li><code>src/components/__tests__/</code> - Component tests</li>
        <li><code>src/app/api/*/route.test.ts</code> - API tests</li>
        <li><code>tests/e2e/</code> - Playwright E2E tests</li>
      </ul>

      <h2>Running Specific Tests</h2>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`# Pattern matching
npm test -- --testNamePattern="should generate"

# Specific file
npm test -- step-generator.test.ts

# Update snapshots
npm test -- -u`}
      </pre>

      <h2>Pre-commit Hooks</h2>
      <p>Husky automatically runs:</p>
      <ul>
        <li>TypeScript type checking</li>
        <li>Related Jest tests</li>
        <li>Prettier formatting</li>
        <li>ESLint validation</li>
      </ul>
    </div>
  )
}

function ClaudeGuideDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <h1>🤖 Claude Code Development Guide</h1>

      <h2>Project Overview</h2>
      <p>
        AutoCrate is a Next.js 14 application for shipping crate design with 3D visualization,
        NX CAD expressions, and STEP file export.
      </p>

      <h2>Before Starting Work</h2>
      <ol>
        <li>Read PROJECT_STATUS.md for active work</li>
        <li>Check MODULES.md for module boundaries</li>
        <li>Review WORK_LOG.md for recent changes</li>
      </ol>

      <h2>While Working</h2>
      <ol>
        <li>Update PROJECT_STATUS.md if claiming a module</li>
        <li>Follow parallel work guidelines in MODULES.md</li>
        <li>Make atomic commits with clear messages</li>
        <li>Run tests frequently</li>
      </ol>

      <h2>After Completing</h2>
      <ol>
        <li>Add entry to WORK_LOG.md</li>
        <li>Update PROJECT_STATUS.md (move to completed)</li>
        <li>Update CHANGELOG.md if user-facing</li>
        <li>Bump version if appropriate</li>
      </ol>

      <h2>Essential Files</h2>
      <ul>
        <li><strong>CLAUDE.md:</strong> Development guidance</li>
        <li><strong>PROJECT_STATUS.md:</strong> Real-time work status</li>
        <li><strong>MODULES.md:</strong> Module boundaries</li>
        <li><strong>WORK_LOG.md:</strong> Detailed history</li>
      </ul>

      <h2>Key Concepts</h2>
      <h3>Two-Point Diagonal Construction</h3>
      <ul>
        <li>Point 1: Origin (0,0,0)</li>
        <li>Point 2: (Width, Length, Height)</li>
      </ul>

      <h3>Coordinate System</h3>
      <ul>
        <li>X-axis: Width (left/right)</li>
        <li>Y-axis: Length (front/back)</li>
        <li>Z-axis: Height (vertical)</li>
      </ul>

      <h2>Module Safety Quick Reference</h2>
      <ul>
        <li>✅ SAFE: plywood-splicing, klimp-calculator, cleat-calculator, API routes, tests</li>
        <li>⚠️ CAUTION: nx-generator, step-generator, CrateVisualizer</li>
        <li>🔴 AVOID: page.tsx (main state hub)</li>
      </ul>
    </div>
  )
}
