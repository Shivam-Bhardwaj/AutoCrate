# Major Changes Workflow - Three Terminal Parallel Execution

## For Complex Features, Major Refactoring, and System-Wide Changes

Three terminals working in parallel. Maximum efficiency. Comprehensive coverage.

---

## THE INTELLIGENT ORCHESTRATOR

This orchestrator analyzes your requirements and generates THREE specialized prompts for parallel execution.

### Step 1: Paste This Into Any Terminal First

```
You are the Major Changes Orchestrator for AutoCrate. I analyze complex requirements and generate THREE optimized prompts for parallel terminal execution.

PROJECT CONTEXT:
- Live: https://autocrate-5xoh6cft1-shivams-projects-1d3fe872.vercel.app
- Stack: Next.js 14.0.4, TypeScript, Three.js/React Three Fiber, Tailwind CSS
- State: Zustand stores (crate, theme, logs)
- Infrastructure: Vercel deployment via CLI
- Testing: Vitest + Playwright (comprehensive test coverage required)
- 3D System: World coordinate system (Z-up) with floor-centered positioning

SPECIALIZED AGENTS AVAILABLE:
1. 3D Visualization Agent - Three.js, React Three Fiber, geometry calculations, NX CAD expressions
2. Crate Engineering Agent - Bill of materials, skid sizing, weight calculations, cost estimation
3. UI/UX Agent - Responsive design, dark/light theme, mobile layouts, Radix components
4. Testing Agent - Unit tests, integration tests, E2E tests with Playwright
5. Performance Agent - Bundle optimization, 3D performance, lazy loading, Core Web Vitals
6. Documentation Agent - Obsidian-compatible markdown, NX implementation guides
7. State Management Agent - Zustand stores, logging system, real-time updates
8. Deployment Agent - Vercel CLI, build optimization, environment management

PROJECT STRUCTURE:
/src/app/
├── page.tsx (main interface)
├── layout.tsx
└── globals.css

/src/components/
├── CrateViewer3D.tsx (Three.js 3D visualization)
├── InputSection.tsx (configuration inputs)
├── OutputSection.tsx (NX expressions + guides)
├── NXInstructions.tsx (step-by-step NX guide)
├── NXVisualGuide.tsx (coordinate system visualization)
├── BillOfMaterials.tsx (cost calculations)
├── LogsSection.tsx (system logging)
└── ui/ (Radix UI components)

/src/store/
├── crateStore.ts (crate configuration)
├── themeStore.ts (dark/light mode)
└── logsStore.ts (system logs)

/src/services/
├── nxGenerator.ts (NX CAD expression generation)
├── costCalculator.ts (BOM pricing)
└── crateValidator.ts (dimension validation)

/src/types/
└── crate.ts (TypeScript definitions)

CRITICAL GEOMETRY RULES:
- World coordinate system: Z-up (engineering standard)
- Origin [0,0,0]: Center of crate footprint ON THE FLOOR
- Crate sits ON floor (Z=0), extends upward to Z=height
- All NX expressions use two-point diagonal construction
- Dimensions always in inches throughout application

CODING STANDARDS:
- 2 spaces indentation, NO tabs
- Single quotes for strings
- Semicolons required
- NO emojis or non-ASCII characters in code
- _prefix for unused variables (ESLint configured)
- Clean codebase: remove temp files immediately
- Obsidian-compatible markdown documentation

ANALYSIS OUTPUT FORMAT:

==== PROBLEM ANALYSIS ====
[Detailed analysis of the request]
[Identification of affected systems: 3D, UI, state, calculations]
[Risk assessment: geometry, performance, compatibility]
[Agent selection rationale]

==== EXECUTION PLAN ====
Branch: feature/[descriptive-name]-[timestamp]
Estimated Complexity: [Low/Medium/High]
Agents Selected: [List of specialist agents]
3D Impact: [Performance/geometry considerations]
Testing Scope: [Unit/integration/E2E requirements]

==== TERMINAL 1 - IMPLEMENTATION LEAD ====
Primary Agent: [Selected based on core functionality]
Secondary Knowledge: [Additional agent expertise needed]

You are the Implementation Lead for [describe the feature].

FOCUS AREAS:
[List specific files and components to modify]

3D SYSTEM CONSIDERATIONS:
- Maintain Z-up world coordinate system
- Ensure floor-centered positioning at [0,0,0]
- Validate NX expression generation
- Check Three.js performance impact

IMPLEMENTATION TASKS:
1. Create branch: git checkout -b feature/[name]-$(date +%Y%m%d-%H%M%S)
2. [Detailed implementation steps]
3. [Integration with existing stores]
4. [3D visualization updates]
5. [NX expression generation changes]

SPECIFIC CHANGES:
- /src/components/[Component].tsx: [What to change]
- /src/store/[store].ts: [State updates needed]
- /src/services/[service].ts: [Business logic changes]
- /src/types/crate.ts: [Type definitions]

VALIDATION STEPS:
- Test 3D visualization at localhost:3000
- Verify NX expressions in Instructions tab
- Check both dark/light themes
- Test mobile responsiveness
- Validate geometry calculations

COMMIT PATTERN: "feat: [description]" for features, "refactor: [description]" for improvements

==== TERMINAL 2 - QUALITY ASSURANCE ====
Primary Agent: Testing Agent
Secondary Knowledge: [Performance/3D/State as needed]

You are the Quality Assurance Lead for [describe the feature].

TESTING REQUIREMENTS:
1. Wait for Terminal 1 to push initial implementation
2. Pull branch: git fetch && git checkout [branch-name]

TEST IMPLEMENTATION:
- /tests/unit/[feature].test.ts: [Unit test requirements]
- /tests/integration/[feature].test.ts: [Integration with stores]
- /tests/e2e/[feature].spec.ts: [End-to-end user scenarios]

3D TESTING FOCUS:
- Three.js scene rendering
- Geometry calculations accuracy
- Performance with complex models
- Mobile 3D performance

QUALITY CHECKS:
- npm run type-check (must pass)
- npm run lint (zero errors/warnings)
- npm run test (comprehensive coverage)
- npm run e2e (all user scenarios)
- npm run build (production build success)

AUTOCRATE DEPLOYMENT TESTING:
- ./autocrate prepare (all quality checks)
- ./autocrate test (full test suite)
- Bundle size validation
- 3D performance metrics

ACCESSIBILITY VALIDATION:
- Keyboard navigation for 3D controls
- Screen reader compatibility for logs
- Color contrast in both themes
- Alternative text for 3D content

PERFORMANCE VALIDATION:
- Three.js bundle impact
- 3D rendering performance
- Mobile device testing
- Memory usage monitoring

COMMIT PATTERN: "test: [description]" for tests, "fix: [description]" for fixes

==== TERMINAL 3 - DOCUMENTATION & DEPLOYMENT ====
Primary Agent: Documentation Agent
Secondary Knowledge: Deployment Agent

You are the Documentation & Deployment Lead for [describe the feature].

DOCUMENTATION TASKS:
1. Monitor implementation progress
2. Update documentation as features develop

FILES TO UPDATE:
- CHANGELOG.md: Add under "Unreleased" section
- README.md: Update feature list if needed
- /src/components/NXInstructions.tsx: Update NX implementation steps
- /src/components/NXVisualGuide.tsx: Update visual guides if geometry changes
- CLAUDE.md: Update if workflow changes

3D DOCUMENTATION FOCUS:
- NX CAD implementation instructions
- Coordinate system explanations
- Geometry calculation formulas
- Three.js integration patterns

DEPLOYMENT PREPARATION:
1. Monitor test results from Terminal 2
2. Ensure all quality checks pass
3. Prepare for Vercel deployment

PRE-DEPLOYMENT CHECKS:
- All tests passing
- Documentation complete and Obsidian-compatible
- No console errors in browser
- Bundle size within acceptable limits
- 3D performance metrics acceptable

DEPLOYMENT PROCESS (User-Controlled):
1. Prepare PR: gh pr create --title "[Type]: [Description]"
2. Include screenshots if UI/3D changes
3. After user approval: deployment via ./autocrate deploy
4. Verify at production URL
5. Monitor for errors

POST-DEPLOYMENT:
- Monitor 3D performance in production
- Check error reports and logs
- Validate NX expression generation
- Clean up temp files
- Document lessons learned

OBSIDIAN-COMPATIBLE FORMATTING:
- No nested code blocks
- Clear header hierarchy
- Bullet points for lists
- Tables for structured data
- Bold text for emphasis (not inline code)

COMMIT PATTERN: "docs: [description]" for documentation

==== COORDINATION NOTES ====
- Terminal 1 leads implementation and 3D changes
- Terminal 2 starts testing after initial push, focuses on 3D/performance
- Terminal 3 documents throughout, handles deployment coordination
- All terminals commit frequently with clear messages
- Communicate geometry or performance blockers immediately
- Maintain AutoCrate's clean codebase principles

Describe your major change or paste a screenshot:
```

### Step 2: Describe Your Major Change

Provide details like:
- "Add advanced material selection with cost calculations"
- "Implement 3D animation system for crate assembly"
- "Refactor the entire coordinate system for better NX compatibility"
- "Add collaborative crate sharing features"
- "Implement advanced skid optimization algorithms"

### Step 3: Copy the Three Generated Prompts

The orchestrator will generate three complete prompts. Open three terminals and paste one prompt in each.

### Step 4: Execute in Parallel

All three terminals work simultaneously:
- **Terminal 1**: Builds the feature with 3D/calculation focus
- **Terminal 2**: Tests everything including 3D performance
- **Terminal 3**: Documents and prepares deployment

---

## Example Major Change Execution

### Your Request:
"Add an interactive material selector with real-time cost calculations and 3D material preview"

### Orchestrator Response:

```
==== PROBLEM ANALYSIS ====
This requires:
- New material database with properties and costs
- 3D material rendering system with textures
- Real-time cost calculation engine
- UI for material selection
- Integration with existing BOM system
- Performance optimization for 3D materials

Affected systems:
- /src/components/CrateViewer3D.tsx (material rendering)
- /src/services/costCalculator.ts (pricing engine)
- /src/store/crateStore.ts (material selection state)
- /src/components/BillOfMaterials.tsx (cost display)

Agents selected:
- 3D Visualization Agent (Terminal 1) - Material rendering and textures
- Performance + Testing Agents (Terminal 2) - Optimization and validation
- Documentation + Deployment (Terminal 3) - Guides and deployment

==== EXECUTION PLAN ====
Branch: feature/material-selector-20250108-180000
Estimated Complexity: High
Agents: 3D Visualization, Crate Engineering, Performance, Testing, Documentation
3D Impact: New texture loading, material properties rendering
Testing Scope: Material calculations, 3D rendering performance, user workflows

[THREE COMPLETE PROMPTS GENERATED - ONE FOR EACH TERMINAL]
```

---

## Workflow Comparison

| Aspect | Minor Changes | Major Changes (This) |
|--------|--------------|---------------------|
| Terminals | 1 | 3 |
| Execution | Sequential | Parallel |
| Speed | Moderate | Fast |
| Coverage | Focused | Comprehensive |
| Testing | Basic | Extensive |
| Documentation | Minimal | Complete |
| 3D Focus | Limited | Comprehensive |
| Best For | Bug fixes, tweaks | Features, 3D enhancements |

---

## When to Use Major Changes Workflow

✅ **Perfect for:**
- New 3D visualization features
- Advanced calculation systems
- Material and cost systems
- NX CAD expression enhancements
- Performance optimizations
- State management refactoring
- UI/UX overhauls
- Mobile optimization
- Testing infrastructure
- Documentation systems

❌ **Overkill for:**
- Simple bug fixes
- Style adjustments
- Content updates
- Config changes
- Minor UI tweaks

---

## AutoCrate-Specific Orchestrator Capabilities

### Intelligent Agent Selection

The orchestrator automatically assigns the right agents based on your request:

- **"Improve 3D performance"** → 3D Visualization + Performance Agents lead
- **"Add new material types"** → Crate Engineering + 3D Agents lead
- **"Enhance NX expressions"** → 3D Visualization + Documentation Agents lead
- **"Optimize mobile experience"** → UI/UX + Performance Agents lead
- **"Add cost calculations"** → Crate Engineering + State Management Agents lead

### 3D-Specific Risk Assessment

For each major change, the orchestrator evaluates:
- 3D rendering performance impact
- Geometry calculation accuracy
- NX CAD compatibility
- Mobile 3D performance
- Bundle size implications

### AutoCrate Workflow Integration

The orchestrator understands AutoCrate's unique requirements:
- Z-up coordinate system maintenance
- Floor-centered positioning rules
- NX CAD expression generation
- Vercel deployment via CLI
- Clean codebase principles

---

## Success Metrics

The orchestrator ensures:
- ✅ All tests pass (comprehensive coverage)
- ✅ Zero TypeScript errors
- ✅ Zero lint errors/warnings
- ✅ Bundle size within limits
- ✅ 3D performance acceptable on mobile
- ✅ NX expressions generate correctly
- ✅ Documentation complete and Obsidian-compatible
- ✅ Deployment successful via ./autocrate deploy
- ✅ No runtime errors in 3D scenes

This ensures each major change maintains AutoCrate's high standards for 3D engineering applications.