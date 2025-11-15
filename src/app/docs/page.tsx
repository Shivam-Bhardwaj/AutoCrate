'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'web' | 'nx'>('web')
  const [activeDoc, setActiveDoc] = useState<string>('overview')
  const webTabRef = useRef<HTMLButtonElement>(null)
  const nxTabRef = useRef<HTMLButtonElement>(null)

  const webDocs = [
    { id: 'overview', title: 'Documentation Overview', category: 'Getting Started' },
    { id: 'quickstart', title: 'Issue Workflow (LLM)', category: 'Getting Started' },
    { id: 'parallel-workflow', title: 'Parallel Development Workflow', category: 'Development' },
    { id: 'modules', title: 'Module Architecture', category: 'Development' },
    { id: 'testing', title: 'Testing Guide', category: 'Quality' },
    { id: 'claude-guide', title: 'Claude Code Guide', category: 'AI Development' },
  ]

  const nxDocs = [
    { id: 'nx-instructions', title: 'NX: Recreate Crate Geometry', category: 'Guides' },
    { id: 'nx-expressions', title: 'Expressions Reference', category: 'Reference' },
    { id: 'nx-assembly', title: 'Assembly Structure', category: 'Reference' },
    { id: 'nx-troubleshooting', title: 'Troubleshooting', category: 'Guides' },
  ]

  const currentDocs = activeTab === 'web' ? webDocs : nxDocs
  const categories = Array.from(new Set(currentDocs.map(d => d.category)))

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-gray-50 dark:bg-gray-950">
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
        {/* Tabs (ARIA) */}
        <div
          className="max-w-7xl mx-auto mt-3 flex items-center gap-2"
          role="tablist"
          aria-label="Documentation Tabs"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
              e.preventDefault()
              const next = activeTab === 'web' ? 'nx' : 'web'
              setActiveTab(next)
              setActiveDoc(next === 'web' ? 'overview' : 'nx-instructions')
              const ref = next === 'web' ? webTabRef.current : nxTabRef.current
              ref?.focus()
            }
            if (e.key === 'Home') {
              e.preventDefault()
              setActiveTab('web')
              setActiveDoc('overview')
              webTabRef.current?.focus()
            }
            if (e.key === 'End') {
              e.preventDefault()
              setActiveTab('nx')
              setActiveDoc('nx-instructions')
              nxTabRef.current?.focus()
            }
          }}
        >
          <button
            id="tab-web"
            ref={webTabRef}
            role="tab"
            aria-selected={activeTab === 'web'}
            aria-controls="panel-web"
            tabIndex={activeTab === 'web' ? 0 : -1}
            onClick={() => { setActiveTab('web'); setActiveDoc('overview') }}
            className={`px-3 py-1.5 rounded border text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${activeTab === 'web' ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'}`}
          >
            Web App
          </button>
          <button
            id="tab-nx"
            ref={nxTabRef}
            role="tab"
            aria-selected={activeTab === 'nx'}
            aria-controls="panel-nx"
            tabIndex={activeTab === 'nx' ? 0 : -1}
            onClick={() => { setActiveTab('nx'); setActiveDoc('nx-instructions') }}
            className={`px-3 py-1.5 rounded border text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${activeTab === 'nx' ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'}`}
          >
            NX
          </button>
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
                  {currentDocs.filter(d => d.category === category).map(doc => (
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
            {/* Web App Docs Panel */}
            <div
              id="panel-web"
              role="tabpanel"
              aria-labelledby="tab-web"
              hidden={activeTab !== 'web'}
            >
              {activeTab === 'web' && (
                <>
                  {activeDoc === 'overview' && <OverviewDoc />}
                  {activeDoc === 'quickstart' && <QuickStartDoc />}
                  {activeDoc === 'parallel-workflow' && <ParallelWorkflowDoc />}
                  {activeDoc === 'modules' && <ModulesDoc />}
                  {activeDoc === 'testing' && <TestingDoc />}
                  {activeDoc === 'claude-guide' && <ClaudeGuideDoc />}
                </>
              )}
            </div>

            {/* NX Docs Panel */}
            <div
              id="panel-nx"
              role="tabpanel"
              aria-labelledby="tab-nx"
              hidden={activeTab !== 'nx'}
            >
              {activeTab === 'nx' && (
                <>
                  {activeDoc === 'nx-instructions' && <NXInstructionsDoc />}
                  {activeDoc === 'nx-expressions' && <NXExpressionsReferenceDoc />}
                  {activeDoc === 'nx-assembly' && <NXAssemblyStructureDoc />}
                  {activeDoc === 'nx-troubleshooting' && <NXTroubleshootingDoc />}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
  </div>
  )
}

// Modern Issue-first Quick Start (replaces legacy tmux content)
// Archived tmux-based quick start (kept for reference, not linked)
function QuickStartTmuxDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none docs-content leading-relaxed">
      <h1>Issue Workflow (Multi‑LLM)</h1>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="font-semibold mb-2">Goal: Isolated worktrees per GitHub issue using project scripts.</p>
      </div>

      <h2>1) Setup Worktree</h2>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">{`# Create/use worktree for issue #140
./scripts/worktree-issue.sh 140
cd issues/140

# Read the issue context
cat .issue-context.md`}</pre>

      <h2>2) Assign to Yourself</h2>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">{`# Track assignment (example: Codex)
./scripts/assign-issue.sh 140 codex

# View all assignments
./scripts/assign-issue.sh --list`}</pre>

      <h2>3) Implement & Test</h2>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">{`npm test               # Jest unit tests
npm run type-check     # TypeScript type check`}</pre>

      <h2>4) Commit, Push, PR</h2>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">{`git add -A
git commit -m "docs(nx): add in-app NX build instructions (#140)"
git push -u origin sbl-140
gh pr create --fill`}</pre>
    </div>
  )
}

// New in-app documentation: Siemens NX instructions
function NXInstructionsDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none docs-content leading-relaxed">
      <h1>NX: Recreate Crate Geometry</h1>

      <p className="lead">Build the AutoCrate model in Siemens NX using imported expressions and the two‑diagonal‑points method.</p>

      <h2>Prerequisites</h2>
      <ul>
        <li>NX 12.0 or newer</li>
        <li>Units: Inches</li>
        <li>Origin at crate center bottom (X=0, Y=0, Z=0)</li>
      </ul>

      <h3>Coordinate System (Diagram)</h3>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">{`graph LR
  O[(Origin 0,0,0)] -->|+X| XR[Right]
  O -->|+Y| YB[Back]
  O -. out of plane .-> ZU[+Z (Up)]`}</pre>

      <h2>1) Get NX Expressions</h2>
      <ul>
        <li>In the app, click <strong>Export NX</strong> to generate expressions.</li>
        <li>Or call API <code>POST /api/nx-export</code> and save <code>export.content</code> to <code>crate.exp</code>:</li>
      </ul>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">{`{
  "dimensions": { "length": 48, "width": 32, "height": 36 },
  "weight": 1200,
  "exportFormat": "expressions",
  "units": "inch"
}`}</pre>

      <h2>2) Import in NX</h2>
      <ol>
        <li>File → New → Model (Inches).</li>
        <li>Tools → Expressions → Import… → select <code>crate.exp</code>.</li>
        <li>Verify: <code>overall_width/length/height</code>, <code>pattern_count</code>, <code>pattern_spacing</code>, and per‑piece parameters are present.</li>
        <li>Tip: Use the filter/search box in Expressions to find parts like <code>FLOORBOARD_</code>, <code>SKID</code>, <code>SIDE_PANEL</code>.</li>
      </ol>

      <h2>3) Datum & Axes</h2>
      <ul>
        <li>XY at Z=0 (bottom), YZ at X=0 (center), XZ at Y=0 (front).</li>
      </ul>

      <h2>4) Create Geometry (Two Diagonal Points)</h2>
      <p>Use Insert → Design Feature → Block → Type: Opposite Corners. Enter expressions directly (click the <strong>fx</strong> icon to bind each field to an expression).</p>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">{`flowchart TB
  P1((P1: X1,Y1,Z1)) --- P2((P2: X2,Y2,Z2))
  P1 -->|WIDTH| W[WIDTH = X2 - X1]
  P1 -->|LENGTH| L[LENGTH = Y2 - Y1]
  P1 -->|HEIGHT| H[HEIGHT = Z2 - Z1]`}</pre>
      <ul>
        <li><strong>Generic boxes</strong> (e.g., <code>SKID</code>, <code>FLOORBOARD_1</code>): bind the corner coordinates for the specific name, such as <code>SKID_X1</code>/<code>SKID_X2</code>, <code>FLOORBOARD_1_X1</code>/<code>FLOORBOARD_1_X2</code> (repeat for Y and Z).</li>
        <li><strong>Plywood panels</strong>: expressions follow <code>{'{PANEL}_PLY_{N}_*'}</code>. Example: <code>FRONT_PANEL_PLY_1_X</code>, <code>FRONT_PANEL_PLY_1_Y</code>, <code>FRONT_PANEL_PLY_1_WIDTH</code>, <code>FRONT_PANEL_PLY_1_LENGTH</code>, <code>FRONT_PANEL_PLY_1_HEIGHT</code>, <code>FRONT_PANEL_PLY_1_THICKNESS</code>.</li>
        <li><strong>Cleats</strong>: expressions follow <code>{'{PANEL}_CLEAT_{N}_*'}</code>, using 8 parameters (same as plywood): <code>FRONT_PANEL_CLEAT_BOTTOM_SUPPRESSED</code>, <code>FRONT_PANEL_CLEAT_BOTTOM_X1/Y1/Z1</code>, <code>FRONT_PANEL_CLEAT_BOTTOM_X2/Y2/Z2</code>. Use Opposite Corners method with two diagonal points.</li>
      </ul>

      <h3>Recommended Block Setup (Example)</h3>
      <pre>{`Insert → Design Feature → Block → Type: Opposite Corners

Corner 1 (X, Y, Z):  = SKID_X1,  = SKID_Y1,  = SKID_Z1
Corner 2 (X, Y, Z):  = SKID_X2,  = SKID_Y2,  = SKID_Z2

Tip: Click fx next to each field, type the expression name, press Enter.`}</pre>

      <h3>4.1 Skids</h3>
      <ol>
        <li>Create one <code>SKID</code> Block from <code>SKID_X1..Z1</code> and <code>SKID_X2..Z2</code>.</li>
        <li>Pattern (direction X): Count = <code>pattern_count</code>, Spacing = <code>pattern_spacing</code> (center‑to‑center).</li>
        <li>Name the patterned feature <code>PATTERN_SKID</code> for clarity.</li>
      </ol>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">{`flowchart LR\n  S1[SKID#1] --- S2[SKID#2] --- S3[SKID#3] --- S4[SKID#4]\n  classDef note fill:#eef,stroke:#99f,color:#246\n  note:::note--> meta((pattern_count, pattern_spacing))`}</pre>

      <h3>4.2 Floorboards</h3>
      <ul>
        <li>Create Blocks for each <code>FLOORBOARD_n</code> using their <code>_X1.._Z1</code> and <code>_X2.._Z2</code> expressions.</li>
        <li>Suppress features where the export marks them as suppressed.</li>
      </ul>

      <h3>4.3 Panels (Plywood)</h3>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">{`Corner: FRONT_PANEL_PLY_1_X, FRONT_PANEL_PLY_1_Y, FRONT_PANEL_PLY_1_Z
Extents: FRONT_PANEL_PLY_1_WIDTH, FRONT_PANEL_PLY_1_LENGTH
Thickness: FRONT_PANEL_PLY_1_THICKNESS`}</pre>
      <p>Each panel piece follows the pattern <code>{'{PANEL}_PLY_{N}'}</code>; bind the exact names such as <code>FRONT_PANEL_PLY_1</code>, <code>BACK_PANEL_PLY_2</code>, <code>RIGHT_END_PANEL_PLY_1</code>.</p>

      <h3>4.4 Cleats</h3>
      <p>Use the 7 parameters; thickness fixed at 0.750.</p>

      <h3>4.5 Klimp Fasteners</h3>
      <ol>
        <li>Import <code>CAD FILES/Crate Spring Clamp.STEP</code> once.</li>
        <li>For each <code>KLIMP_n</code> with <code>KLIMP_n_ACTIVE=TRUE</code>, place at <code>KLIMP_n_POS_X/Y/Z</code> and rotate by <code>KLIMP_n_ROT_X/Y/Z</code>.</li>
      </ol>

      <h3>4.6 Lag Screws</h3>
      <ul>
        <li>Import <code>CAD FILES/LAG SCREW_0.38 X 2.50.stp</code>.</li>
        <li>Place under intermediate vertical cleats; use <code>lag_screw_count</code> as quantity guidance.</li>
      </ul>

      <h3>4.7 Panel Splicing Layout</h3>
      <p>When a panel exceeds sheet limits, pieces are split and positioned per the export. Vertical splices go to the right; horizontal splices go to the bottom.</p>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">{`flowchart LR\n  subgraph SIDE_PANEL\n    P1[Piece 1] --- P2[Piece 2] --- P3[Piece 3]\n  end\n  note1((vertical_splice_right)):::note\n  note2((horizontal_splice_bottom)):::note\n  classDef note fill:#eef,stroke:#99f,color:#246`}</pre>
      <ul>
        <li>Follow exported <code>{'{PANEL}_PLY_{N}_X/Y/Z'}</code> and <code>{'{PANEL}_PLY_{N}_WIDTH/LENGTH/HEIGHT'}</code> to size/locate each piece.</li>
        <li>Respect suppression flags for unused pieces.</li>
      </ul>

      <h3>4.8 Cleat Spacing Rules</h3>
      <p>Cleats respect edge clearance and maximum spacing. Use expression guidance to place and pattern if needed.</p>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">{`flowchart TB\n  Start[Edge Clearance] --> S1[First Cleat]\n  S1 -->|<= 16\"| S2[Next Cleat]\n  S2 -->|<= 16\"| S3[Next Cleat]\n  S3 --> End[End Clearance]\n  classDef rule fill:#ecfeff,stroke:#06b6d4,color:#0e7490`}</pre>
      <ul>
        <li>Max spacing: 16" (unless otherwise specified in expressions).</li>
        <li>Maintain minimum edge clearances around openings and edges.</li>
        <li>Keep minimum 1" clearance from Klimp placements.</li>
      </ul>

      <h2>5) Validate</h2>
      <ul>
        <li>Overall dims match <code>overall_width/length/height</code>.</li>
        <li>Skid count/spacing match <code>pattern_count</code>/<code>pattern_spacing</code>.</li>
        <li>Panels and cleats align; clearances respected.</li>
        <li>Klimp instances only where <code>_ACTIVE=TRUE</code>.</li>
      </ul>

      <h2>Tips</h2>
      <ul>
        <li>Always reference expressions in dialogs (avoid raw numbers).</li>
        <li>Use feature suppression to reflect <code>_SUPPRESSED</code> flags.</li>
        <li>Keep origin/axes per export header for predictable placement.</li>
      </ul>
    </div>
  )
}

function NXExpressionsReferenceDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none docs-content leading-relaxed">
      <h1>NX Expressions Reference</h1>

      <h2>Global</h2>
      <ul>
        <li><code>overall_width</code>, <code>overall_length</code>, <code>overall_height</code> — Overall crate envelope</li>
        <li><code>pattern_count</code>, <code>pattern_spacing</code> — Skid array along X</li>
        <li><code>plywood_thickness</code> — Panel piece thickness</li>
        <li><code>lag_screw_count</code> — Total lag screws (guidance)</li>
      </ul>

      <h2>Boxes (Two Corners)</h2>
      <p>Generic solids use two diagonal points:</p>
      <pre>{`SKID_X1, SKID_Y1, SKID_Z1
SKID_X2, SKID_Y2, SKID_Z2`}</pre>
      <p>Floorboards follow the same pattern, e.g., <code>FLOORBOARD_1_X1</code>/<code>FLOORBOARD_1_X2</code>.</p>

      <h2>Plywood Pieces (7 parameters)</h2>
      <pre>{`FRONT_PANEL_PLY_1_X, FRONT_PANEL_PLY_1_Y, FRONT_PANEL_PLY_1_Z
FRONT_PANEL_PLY_1_WIDTH, FRONT_PANEL_PLY_1_LENGTH, FRONT_PANEL_PLY_1_HEIGHT
FRONT_PANEL_PLY_1_THICKNESS`}</pre>
      <p>Replace the panel/id to match each piece, e.g., <code>BACK_PANEL_PLY_2</code>, <code>LEFT_END_PANEL_PLY_3</code>.</p>

      <h2>Cleats (7 parameters)</h2>
      <pre>{`FRONT_PANEL_CLEAT_1_X, FRONT_PANEL_CLEAT_1_Y, FRONT_PANEL_CLEAT_1_Z
FRONT_PANEL_CLEAT_1_WIDTH, FRONT_PANEL_CLEAT_1_LENGTH, FRONT_PANEL_CLEAT_1_HEIGHT
FRONT_PANEL_CLEAT_1_THICKNESS = 0.750`}</pre>
      <p>Cleat expressions follow <code>{'{PANEL}_CLEAT_{N}_*'}</code>.</p>

      <h2>Klimp Instances</h2>
      <pre>{`KLIMP_n_ACTIVE (TRUE/FALSE)
KLIMP_n_EDGE (TOP/LEFT/RIGHT)
KLIMP_n_POS_X/Y/Z
KLIMP_n_ROT_X/Y/Z`}</pre>
    </div>
  )
}

function NXAssemblyStructureDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none docs-content leading-relaxed">
      <h1>NX Assembly Structure</h1>

      <p>Recommended naming and grouping for clarity:</p>
      <ul>
        <li>Part: <code>CRATE_ASM</code></li>
        <li>Groups: <code>SKIDS</code>, <code>FLOORBOARDS</code>, <code>PANELS</code>, <code>CLEATS</code>, <code>KLIMPS</code>, <code>HARDWARE</code></li>
        <li>Feature names mirror expression owners (e.g., <code>SIDE_PANEL_PIECE_1</code>)</li>
      </ul>

      <h2>Layering (optional)</h2>
      <ul>
        <li>Layer 1: Datums & reference</li>
        <li>Layer 10–19: Skids & floorboards</li>
        <li>Layer 20–39: Panels</li>
        <li>Layer 40–49: Cleats</li>
        <li>Layer 50+: Hardware (Klimps, lag screws)</li>
      </ul>
    </div>
  )
}

function NXTroubleshootingDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none docs-content leading-relaxed">
      <h1>NX Troubleshooting</h1>

      <h2>Units mismatch</h2>
      <p>Ensure the NX part is in Inches, and expressions values match inches.</p>

      <h2>Expressions not updating</h2>
      <ul>
        <li>Confirm fields are bound via <strong>fx</strong> (not hard values).</li>
        <li>Reimport or update expressions in Tools → Expressions.</li>
        <li>Check for name typos (use the Expressions filter).</li>
      </ul>

      <h2>Flipped directions</h2>
      <p>Verify origin and axis directions (X right, Y back, Z up). If needed, swap corners so X2≥X1, etc.</p>

      <h2>Suppressed parts</h2>
      <p>Pieces flagged as suppressed in the export should be suppressed or omitted in NX.</p>
    </div>
  )
}

function OverviewDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none docs-content leading-relaxed">
      <h1>Documentation Overview</h1>

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
          <h3 className="font-semibold text-lg mb-2">NX Instructions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Build the crate in Siemens NX</p>
          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Use the NX tab above</code>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Parallel Workflow</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">5 ways to work on multiple features at once</p>
          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">make parallel-dev</code>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Module Architecture</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Understand module boundaries and dependencies</p>
          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Safe parallel work</code>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Testing</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Jest and Playwright testing strategies</p>
          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm run test:all</code>
        </div>
      </div>

      <h2>Key Features</h2>
      <ul>
        <li>ART: <strong>3D Visualization:</strong> React Three Fiber real-time preview</li>
        <li>CAD: <strong>NX CAD Export:</strong> Parametric expression generation</li>
        <li>EXPORT: <strong>STEP File Export:</strong> ISO 10303-21 AP242 compliant</li>
        <li>HARDWARE: <strong>Hardware Integration:</strong> Klimp fasteners & lag screws</li>
        <li>OPTIMIZE: <strong>Plywood Optimization:</strong> Intelligent sheet layout algorithm</li>
        <li>PARALLEL: <strong>Parallel Development:</strong> Work on multiple features simultaneously</li>
      </ul>

      <h2>Technology Stack</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><strong>Framework:</strong> Next.js 14</div>
        <div><strong>Language:</strong> TypeScript 5</div>
        <div><strong>3D:</strong> Three.js + R3F</div>
        <div><strong>Styling:</strong> Tailwind CSS 3</div>
        <div><strong>Testing:</strong> Jest + Playwright</div>
      </div>

      <h2>Essential Commands</h2>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`# Development
npm run dev              # Start dev server
npm run build            # Production build
npm test                 # Run tests
npm run type-check       # TypeScript check

# Issue workflow (multi-LLM)
./scripts/worktree-issue.sh 140         # Create worktree issues/140
./scripts/assign-issue.sh 140 codex     # Assign to Codex
cd issues/140 && cat .issue-context.md  # Read context`}
      </pre>

      <h2>Documentation Files</h2>
      <p>Primary references in repo:</p>
      <ul>
        <li><code>docs/START_HERE.md</code> - Getting started</li>
        <li><code>docs/ARCHITECTURE.md</code> - System overview</li>
        <li><code>docs/TESTING_GUIDE.md</code> - Testing guide</li>
        <li><code>CLAUDE.md</code> - Dev workflow and commands</li>
      </ul>
    </div>
  )
}

function QuickStartDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none docs-content leading-relaxed">
      <h1>Quick Start: Parallel Development</h1>

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
        <li>4 panes ready for parallel work</li>
        <li>Feature A workspace (top-left)</li>
        <li>Feature B workspace (top-right)</li>
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

# In Pane 2 (Tests):
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
# This runs: dev server + test watcher

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
# Output: [DONE] SAFE for parallel work

cat MODULES.md | grep -A 3 "klimp-calculator"
# Output: [DONE] SAFE for parallel work`}
      </pre>

      <h3>Step 2: Claim your work</h3>
      <p>Edit <code>PROJECT_STATUS.md</code>:</p>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`### Active Work (In Progress)

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

# If marked [DONE] SAFE and not in Active Work → Go ahead!
# If marked [WARNING] CAUTION → Coordinate via PROJECT_STATUS.md
# If marked [AVOID] AVOID → Don't work on it in parallel`}
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
        <li>[DONE] Use tmux for persistence - survives SSH disconnects</li>
        <li>[DONE] Commit often - every 15-30 minutes</li>
        <li>[DONE] Test continuously - <code>npm test:watch</code></li>
        <li>[DONE] Update PROJECT_STATUS.md - communication is key</li>
        <li>[DONE] Keep branches focused - one feature per branch</li>
      </ul>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-6">
        <p className="font-semibold mb-2">Ready to start?</p>
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
    <div className="prose prose-gray dark:prose-invert max-w-none docs-content leading-relaxed">
      <h1>Parallel Development Workflow</h1>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <p className="font-semibold">Archived strategies</p>
        <p className="text-sm">Use the Issue Workflow and NX docs for the current process. Prefer <code>./scripts/worktree-issue.sh</code> and <code>./scripts/assign-issue.sh</code>.</p>
      </div>

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
├──────────────────────┬──────────────────────┤
│  Test runner (watch) │  Status monitor      │
└──────────────────────┴──────────────────────┘`}
      </pre>

      <h3>Pros & Cons</h3>
      <div className="grid grid-cols-2 gap-4 not-prose mb-4">
        <div className="border border-green-200 dark:border-green-700 rounded p-4">
          <h4 className="text-green-700 dark:text-green-400 font-semibold mb-2">[DONE] Pros</h4>
          <ul className="text-sm space-y-1">
            <li>Persistent (survives disconnects)</li>
            <li>Very lightweight</li>
            <li>Works over slow connections</li>
            <li>Pure terminal workflow</li>
          </ul>
        </div>
        <div className="border border-red-200 dark:border-red-700 rounded p-4">
          <h4 className="text-red-700 dark:text-red-400 font-semibold mb-2">[X] Cons</h4>
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
make parallel-dev      # Run dev + tests in parallel
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
        <li>[DONE] Each feature = one branch</li>
        <li>[DONE] Confirm your issue worktree/branch before starting</li>
        <li>[DONE] Commit every 15-30 minutes</li>
        <li>[DONE] Run tests continuously</li>
        <li>[DONE] Sync with main regularly</li>
        <li>[X] Don&apos;t work on same file simultaneously</li>
        <li>[X] Don&apos;t mix multiple features in one branch</li>
      </ul>
    </div>
  )
}

// Continue with other doc components...
function ModulesDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none docs-content leading-relaxed">
      <h1>Module Architecture & Boundaries</h1>

      <p className="lead">
        Understanding module boundaries enables safe parallel development
      </p>

      <h2>Module Safety Ratings</h2>
      <div className="space-y-2 not-prose mb-6">
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded p-3">
          <span className="text-2xl">[OK]</span>
          <div>
            <div className="font-semibold">SAFE</div>
            <div className="text-sm">Can be modified in parallel without coordination</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-3">
          <span className="text-2xl">[!]</span>
          <div>
            <div className="font-semibold">CAUTION</div>
            <div className="text-sm">Coordinate via issue comments/PR before modifying</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-3">
          <span className="text-2xl">[X]</span>
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
              <td><span className="text-yellow-600">[!]</span></td>
              <td>Core crate generation logic</td>
            </tr>
            <tr>
              <td><code>step-generator.ts</code></td>
              <td>Stable</td>
              <td><span className="text-yellow-600">[!]</span></td>
              <td>STEP export - complex assembly</td>
            </tr>
            <tr>
              <td><code>plywood-splicing.ts</code></td>
              <td>Stable</td>
              <td><span className="text-green-600">[OK]</span></td>
              <td>Self-contained algorithm</td>
            </tr>
            <tr>
              <td><code>klimp-calculator.ts</code></td>
              <td>Stable</td>
              <td><span className="text-green-600">[OK]</span></td>
              <td>Klimp placement logic</td>
            </tr>
            <tr>
              <td><code>cleat-calculator.ts</code></td>
              <td>Stable</td>
              <td><span className="text-green-600">[OK]</span></td>
              <td>Cleat positioning</td>
            </tr>
            <tr>
              <td><code>page.tsx</code></td>
              <td>Stable</td>
              <td><span className="text-red-600">[X]</span></td>
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
              <td><span className="text-green-600">[DONE] Yes</span></td>
            </tr>
            <tr>
              <td>Different calculators (klimp, cleat, lag)</td>
              <td><span className="text-green-600">[DONE] Yes</span></td>
            </tr>
            <tr>
              <td>Different UI components</td>
              <td><span className="text-green-600">[DONE] Yes (if no shared state)</span></td>
            </tr>
            <tr>
              <td>Calculator + UI component</td>
              <td><span className="text-green-600">[DONE] Yes</span></td>
            </tr>
            <tr>
              <td>nx-generator + step-generator</td>
              <td><span className="text-yellow-600">[WARNING] Coordinate</span></td>
            </tr>
            <tr>
              <td>page.tsx + any component</td>
              <td><span className="text-yellow-600">[WARNING] Coordinate</span></td>
            </tr>
            <tr>
              <td>Any module + tests</td>
              <td><span className="text-green-600">[DONE] Yes</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Safe Parallel Patterns</h2>
      <ul>
        <li>[DONE] New feature modules (create new files)</li>
        <li>[DONE] Independent components</li>
        <li>[DONE] API routes (no shared state)</li>
        <li>[DONE] Test files</li>
        <li>[DONE] Documentation files</li>
        <li>[DONE] Bug fixes in isolated functions</li>
      </ul>

      <h2>Coordination Required</h2>
      <ul>
        <li>[WARNING] State changes in page.tsx</li>
        <li>[WARNING] Changes to shared configuration interfaces</li>
        <li>[WARNING] Updates to CrateConfig type</li>
        <li>[WARNING] Core logic modifications</li>
      </ul>

      <h2>Avoid Conflicts</h2>
      <ul>
        <li>[AVOID] Never work on same file simultaneously</li>
        <li>[AVOID] Don&apos;t modify parent and child components together</li>
        <li>[AVOID] Avoid tightly coupled modules</li>
      </ul>
    </div>
  )
}

// Remaining doc components would follow similar pattern...
// For brevity, I'll include placeholders for the remaining docs

function ProjectStatusDoc() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none docs-content leading-relaxed">
      <h1>Project Status & Memory</h1>
      <p>Current version: <strong>13.1.0</strong></p>
      <p>Phase: <strong>Production - Active Development</strong></p>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3>Active Work (In Progress)</h3>
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
    <div className="prose prose-gray dark:prose-invert max-w-none docs-content leading-relaxed">
      <h1>Work Log</h1>
      <p>Detailed work history for the project</p>

      <h2>2025-10-08 - Documentation & Parallel Workflow System</h2>
      <p><strong>Worker:</strong> Claude</p>

      <h3>Changes:</h3>
      <ul>
        <li>[DONE] Created comprehensive documentation system</li>
        <li>[DONE] Built tmux development environment</li>
        <li>[DONE] Added VS Code devcontainer configuration</li>
        <li>[DONE] Set up GitHub Actions CI/CD</li>
        <li>[DONE] Created Makefile with 20+ commands</li>
        <li>[DONE] Wrote parallel workflow guides</li>
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
    <div className="prose prose-gray dark:prose-invert max-w-none docs-content leading-relaxed">
      <h1>Testing Guide</h1>

      <h2>Testing Stack</h2>
      <ul>
        <li><strong>Unit Testing:</strong> Jest + React Testing Library</li>
        <li><strong>E2E Testing:</strong> Playwright</li>
        <li><strong>Pre-commit:</strong> Husky + lint-staged</li>
      </ul>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4">
        <p className="font-semibold">Modern Testing Infrastructure</p>
        <p className="text-sm">This project uses industry-standard tools for professional-grade test coverage:</p>
        <ul className="text-sm mt-2">
          <li>[DONE] 95+ unit tests with Jest</li>
          <li>[DONE] E2E tests with Playwright</li>
          <li>[DONE] 76%+ overall code coverage</li>
          <li>[DONE] Pre-commit validation with Husky</li>
        </ul>
      </div>

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
    <div className="prose prose-gray dark:prose-invert max-w-none docs-content leading-relaxed">
      <h1>Claude Code Development Guide</h1>

      <h2>Project Overview</h2>
      <p>
        AutoCrate is a Next.js 14 application for shipping crate design with 3D visualization,
        NX CAD expressions, and STEP file export.
      </p>

      <h2>Before Starting Work</h2>
      <ol>
        <li>Read <code>.issue-context.md</code> in your worktree (<code>issues/[NUMBER]/</code>).</li>
        <li>Open <code>/docs</code> and read “Issue Workflow (LLM)” and “NX: Recreate Crate Geometry”.</li>
        <li>Confirm you are on branch <code>sbl-[NUMBER]</code>.</li>
      </ol>

      <h2>While Working</h2>
      <ol>
        <li>Make atomic commits with clear messages</li>
        <li>Run tests frequently</li>
        <li>Keep changes scoped to the issue branch</li>
      </ol>

      <h2>After Completing</h2>
      <ol>
        <li>Open a pull request with the issue number in title/body.</li>
        <li>Ensure NX instructions remain accurate for tested parameters.</li>
        <li>Update CHANGELOG.md if user-facing.</li>
      </ol>

      <h2>Essential Files</h2>
      <ul>
        <li><strong>CLAUDE.md:</strong> Development workflow and commands</li>
        <li><strong>docs/NX_INSTRUCTIONS.md:</strong> Standalone Siemens NX guide</li>
        <li><strong>docs/START_HERE.md:</strong> Getting started</li>
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
        <li>[DONE] SAFE: plywood-splicing, klimp-calculator, cleat-calculator, API routes, tests</li>
        <li>[WARNING] CAUTION: nx-generator, step-generator, CrateVisualizer</li>
        <li>[AVOID] AVOID: page.tsx (main state hub)</li>
      </ul>
    </div>
  )
}
