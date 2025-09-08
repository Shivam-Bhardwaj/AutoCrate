# AutoCrate NX Integration - Parallel Terminal Prompts

## Overview
Transform AutoCrate into a professional NX-integrated tool for Applied Materials engineering standards. These prompts are designed for 4 parallel terminal sessions.

---

## TERMINAL 1 - NX INTEGRATION & FILE EXPORT

```
You are the NX Integration Lead for AutoCrate's professional transformation for NX users.

PROJECT: AutoCrate - https://autocrate.vercel.app
BRANCH: feature/nx-integration-20250108
GOAL: Implement JT file export and NX 2022 compatibility

CRITICAL REQUIREMENTS:
- JT file format export for NX 2022
- Applied Materials part numbering (0205-XXXXX format)
- TC Engineering numbers (TC2-XXXXXXX)
- ASME Y14.5-2009 compliance
- Third angle projection drawings

IMPLEMENTATION TASKS:
1. Create branch: git checkout -b feature/nx-integration-20250108
2. Install JT format libraries: npm install jt-writer three-to-jt
3. Create NX integration services:
   - /src/services/jtExporter.ts - JT file format generator
   - /src/services/nxDrawingGenerator.ts - NX drawing creation
   - /src/services/appliedMaterialsStandards.ts - Company standards
   - /src/services/bomGenerator.ts - BOM with TC numbers
4. Update NX expression generator for 2022 syntax
5. Add export dialog with format options
6. Implement assembly structure hierarchy

KEY FILES TO CREATE/MODIFY:
- /src/services/jtExporter.ts (NEW)
- /src/services/nxDrawingGenerator.ts (NEW)
- /src/services/appliedMaterialsStandards.ts (NEW)
- /src/services/nxGenerator.ts (UPDATE)
- /src/components/ExportDialog.tsx (NEW)
- /src/types/nx.ts (NEW)

NX-SPECIFIC FEATURES:
- JT export with proper part hierarchy
- NX expression file (.exp) generation
- Part templates (.prt) with parameters
- Assembly constraints (.asm)
- Drawing templates with Applied Materials title blocks
- Material specifications matching lumber standards
- Fastener specifications (3/8" lag bolts per drawings)

VALIDATION:
- Export test JT file
- Verify with NX 2022 import
- Check expression syntax
- Validate part numbering
- Test assembly structure

COMMIT PATTERN: feat(nx): [description]
```

---

## TERMINAL 2 - PROFESSIONAL UI TRANSFORMATION

```
You are the UI Transformation Lead for AutoCrate's NX-focused professional interface.

PROJECT: AutoCrate - https://autocrate.vercel.app
BRANCH: feature/nx-integration-20250108
GOAL: Transform UI to match NX/Siemens professional aesthetic

CRITICAL REQUIREMENTS:
- NX 2022 color scheme and layout
- Professional CAD interface elements
- Applied Materials branding integration
- Remove all "consumer app" appearance
- Engineering-focused terminology

IMPLEMENTATION TASKS:
1. Wait for Terminal 1 to create branch, then pull:
   git fetch && git checkout feature/nx-integration-20250108
2. Redesign color scheme:
   - Background: #2B2B2B (NX dark gray)
   - Accent: #0078D4 (Siemens blue)
   - Grid: #3A3A3A with #4A4A4A major lines
3. Create NX-style components:
   - /src/components/layout/NXToolbar.tsx
   - /src/components/layout/ResourceBar.tsx
   - /src/components/viewport/ViewCube.tsx
   - /src/components/viewport/TriadManipulator.tsx
4. Implement professional panels:
   - Part Navigator (tree view)
   - Properties Panel
   - Layer Control
   - Selection Filter toolbar
5. Add engineering tooltips and help system

KEY FILES TO CREATE/MODIFY:
- /src/app/globals.css (UPDATE - NX colors)
- /src/components/layout/NXToolbar.tsx (NEW)
- /src/components/layout/ResourceBar.tsx (NEW)
- /src/components/panels/PartNavigator.tsx (NEW)
- /src/components/viewport/ViewCube.tsx (NEW)
- /src/components/InputSection.tsx (UPDATE - professional inputs)
- /src/components/CrateViewer3D.tsx (UPDATE - NX viewport style)

NX UI ELEMENTS:
- Top: Ribbon menu with tabs
- Left: Resource bar with part navigator
- Center: Graphics window with grid and axes
- Right: Properties panel (collapsible)
- Bottom: Cue/Status line with coordinates
- View cube in top-right corner
- Selection highlighting in orange
- Context menus on right-click

PROFESSIONAL FEATURES:
- Keyboard shortcuts (MB2 rotate, F8 fit, etc.)
- Snap indicators and inference lines
- Professional dimension display
- Technical grid with major/minor lines
- Triad for transformations
- Layer visibility controls
- Selection filters

VALIDATION:
- Compare with NX 2022 screenshots
- Test all keyboard shortcuts
- Verify professional appearance
- Check tooltip accuracy
- Validate color contrast

COMMIT PATTERN: feat(ui): [description]
```

---

## TERMINAL 3 - DRAWING GENERATION & STANDARDS

```
You are the Drawing Standards Lead for AutoCrate's Applied Materials compliance.

PROJECT: AutoCrate - https://autocrate.vercel.app
BRANCH: feature/nx-integration-20250108
GOAL: Implement Applied Materials drawing standards and generation

CRITICAL REQUIREMENTS:
- Applied Materials drawing format (Size D: 34" x 22")
- ASME Y14.5-2009 dimensioning standards
- Multi-sheet drawing support
- Proper title blocks and BOM tables
- Third angle projection views

IMPLEMENTATION TASKS:
1. Pull branch: git fetch && git checkout feature/nx-integration-20250108
2. Create drawing generation system:
   - /src/services/drawingGenerator.ts
   - /src/services/titleBlockGenerator.ts
   - /src/services/dimensionGenerator.ts
3. Implement Applied Materials templates:
   - /src/templates/applied-materials/title-block.ts
   - /src/templates/applied-materials/bom-table.ts
   - /src/templates/applied-materials/drawing-border.ts
4. Add drawing viewer component:
   - /src/components/DrawingViewer.tsx
   - /src/components/DrawingSheet.tsx
5. Generate multi-sheet outputs

KEY FILES TO CREATE/MODIFY:
- /src/services/drawingGenerator.ts (NEW)
- /src/services/titleBlockGenerator.ts (NEW)
- /src/services/dimensionGenerator.ts (NEW)
- /src/components/DrawingViewer.tsx (NEW)
- /src/templates/applied-materials/ (NEW FOLDER)

DRAWING SPECIFICATIONS:
Title Block Fields:
- Part Number: 0205-XXXXX
- TC Number: TC2-XXXXXXX
- Title: CRATE ASSY, [PRODUCT NAME]
- Size: D
- Weight: -- LB REF
- Material: SEE BOM
- Finish: NONE
- Tolerances: .XX ±.01, .XXX ±.005
- Company: Applied Materials
- Address: 3050 Bowers Ave, Santa Clara, CA 95054

Sheet Organization:
- Sheet 1: Assembly view with BOM
- Sheet 2: Assembly layouts (top/front)
- Sheet 3: Product orientation
- Additional: Component details

BOM Structure:
| ITEM | QTY | PART NO. | DESCRIPTION | TC ENG NO. |
With proper lumber specifications

Drawing Elements:
- Third angle projection symbol
- Revision block
- ECO status field
- Applied Materials confidential notice
- Approval signatures block
- Date fields

VALIDATION:
- Generate sample drawing
- Check title block completeness
- Verify BOM accuracy
- Validate dimension standards
- Test multi-sheet generation

COMMIT PATTERN: feat(drawings): [description]
```

---

## TERMINAL 4 - TESTING, DOCUMENTATION & DEPLOYMENT

```
You are the Testing, Documentation & Deployment Lead for AutoCrate's NX professional release.

PROJECT: AutoCrate - https://autocrate.vercel.app
BRANCH: feature/nx-integration-20250108
GOAL: Validate NX integration, reorganize documentation, and prepare production deployment

CRITICAL REQUIREMENTS:
- Comprehensive NX compatibility testing
- Documentation cleanup and reorganization
- In-app documentation section
- Applied Materials standards validation
- Production deployment preparation

IMPLEMENTATION TASKS:
1. Pull latest: git fetch && git checkout feature/nx-integration-20250108
2. Create test suites:
   - /tests/integration/nx-import.test.ts
   - /tests/integration/jt-export.test.ts
   - /tests/unit/drawing-standards.test.ts
   - /tests/e2e/nx-workflow.spec.ts

3. DOCUMENTATION REORGANIZATION:
   ROOT FILES (keep minimal):
   - README.md (brief project overview, link to docs)
   - CLAUDE.md (AI instructions only)
   - CHANGELOG.md (version history)
   
   MOVE TO /docs/:
   - /docs/getting-started.md
   - /docs/nx-integration.md
   - /docs/applied-materials-standards.md
   - /docs/api-reference.md
   - /docs/keyboard-shortcuts.md
   - /docs/troubleshooting.md
   - /docs/contributing.md
   - Any other documentation files

4. CREATE IN-APP DOCUMENTATION:
   - /src/app/docs/page.tsx (main docs page)
   - /src/app/docs/[slug]/page.tsx (individual doc pages)
   - /src/components/DocsLayout.tsx (documentation layout)
   - /src/components/DocsNavigation.tsx (sidebar navigation)
   - /src/services/markdownLoader.ts (load .md files)
   - Add "Documentation" link to main navigation

5. Performance optimization:
   - Bundle size analysis
   - JT export performance
   - 3D rendering optimization
6. Prepare deployment

KEY FILES TO CREATE/MODIFY:
- /tests/integration/nx-import.test.ts (NEW)
- /tests/integration/jt-export.test.ts (NEW)
- /tests/e2e/nx-workflow.spec.ts (NEW)
- /src/app/docs/page.tsx (NEW - docs section)
- /src/app/docs/[slug]/page.tsx (NEW - doc viewer)
- /docs/ folder reorganization (MOVE existing docs)
- README.md (SIMPLIFY - link to /docs)
- package.json (UPDATE version to 3.0.0)

DOCUMENTATION STRUCTURE:
Root Level (4 files only):
- README.md: Brief overview with "View Full Documentation" button linking to /docs
- CLAUDE.md: Claude AI assistant instructions and project context
- GEMINI.md: Gemini AI assistant instructions and project context
- CHANGELOG.md: Version history and release notes

/docs/ Folder:
- getting-started.md: Quick start guide
- nx-integration.md: NX workflow and JT export
- applied-materials-standards.md: Company specifications
- api-reference.md: Component and service APIs
- keyboard-shortcuts.md: NX-compatible shortcuts
- troubleshooting.md: Common issues and solutions
- contributing.md: Development guidelines
- architecture.md: System design and structure

In-App Documentation Section:
- Accessible via main navigation "Docs" link
- Markdown rendering with syntax highlighting
- Searchable documentation
- Table of contents sidebar
- Mobile responsive design
- Dark/light theme support

TESTING REQUIREMENTS:
NX Validation:
- JT file import to NX 2022
- Expression evaluation accuracy
- Assembly constraint validation
- Drawing dimension accuracy
- Material property transfer

Performance Metrics:
- JT export: <3 seconds
- Drawing generation: <2 seconds/sheet
- 3D rendering: 60 FPS minimum
- Memory usage: <1GB
- Bundle size: <5MB

Standards Compliance:
- Part number format (0205-XXXXX)
- TC number format (TC2-XXXXXXX)
- ASME Y14.5-2009 compliance
- Applied Materials specifications
- Drawing format validation

DEPLOYMENT CHECKLIST:
1. Documentation reorganized (4 root files only)
2. In-app docs section working
3. All tests passing (npm test)
4. Lint clean (npm run lint)
5. Type check success (npm run type-check)
6. Build successful (npm run build)
7. Bundle size acceptable
8. Performance benchmarks met
9. CHANGELOG updated
10. Version bumped to 3.0.0
11. Deploy: ./autocrate deploy

POST-DEPLOYMENT:
- Verify at https://autocrate.vercel.app
- Test JT export functionality
- Validate drawing generation
- Check documentation section
- Monitor error logs
- Announce release

COMMIT PATTERN: test: [description] / docs: [description] / deploy: [description]
```

---

## COORDINATION WORKFLOW

### Parallel Execution Timeline

**Phase 1 (0-30 min):**
- Terminal 1: Creates branch, sets up JT export foundation
- Terminal 2: Waits 5 min, then starts UI transformation
- Terminal 3: Waits 5 min, then begins drawing system
- Terminal 4: Waits 10 min, then starts test creation

**Phase 2 (30-90 min):**
- All terminals work in parallel on their domains
- Frequent commits to avoid conflicts
- Focus on core functionality first

**Phase 3 (90-120 min):**
- Terminal 1: Completes JT export, helps others
- Terminal 2: Finalizes UI, assists with integration
- Terminal 3: Completes drawing system
- Terminal 4: Runs comprehensive tests

**Phase 4 (120-150 min):**
- Terminal 4 leads final integration
- All terminals fix issues found in testing
- Documentation updates
- Deployment preparation

### Key Success Factors
1. Terminal 1 must create branch first
2. Frequent commits (every 15-20 min)
3. Clear file ownership to avoid conflicts
4. Terminal 4 coordinates final deployment
5. All terminals focus on NX/Applied Materials requirements

### Expected Outcome
A professional NX-integrated AutoCrate that:
- Exports JT files importable to NX 2022
- Matches NX UI aesthetics exactly
- Generates Applied Materials compliant drawings
- Provides seamless NX workflow integration
- Maintains 60 FPS performance
- Clean documentation structure (4 root files only)
- In-app documentation section at /docs
- Deploys successfully to production

### Documentation Cleanup Goals
**Root Directory (4 files maximum):**
- `README.md` - Brief overview with link to full docs
- `CLAUDE.md` - Claude AI instructions and context
- `GEMINI.md` - Gemini AI instructions and context
- `CHANGELOG.md` - Version history

**Everything else moves to `/docs/`:**
- All technical documentation
- All guides and tutorials
- API references
- Contributing guidelines

**In-App Documentation:**
- Professional docs section matching NX aesthetic
- Searchable and indexed
- Mobile responsive
- Integrated with main navigation