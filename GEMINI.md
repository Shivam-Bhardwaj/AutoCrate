# AutoCrate Project Instructions for Gemini

## CRITICAL DEPLOYMENT RULES - MUST FOLLOW
**Gemini will ONLY make local changes. NO automatic commits or pushes to GitHub.**

### Deployment Workflow (User Controlled):
1. **Option 1 (Local Test)**: User tests locally after Gemini makes changes
2. **Option 2 (Prepare)**: User validates with all checks and tests
3. **Option 3 (Deploy)**: User pushes to GitHub ONLY when ready

**Gemini is FORBIDDEN from:**
- Running `git commit` without explicit user request
- Running `git push` without explicit user request  
- Using Option 3 of autocrate.bat without user permission
- Automatically deploying or pushing code
- Making changes to files that are NOT directly related to the requested task
- Modifying configuration files, documentation, or tests unless specifically asked
- Creating new files unless absolutely necessary for the requested feature

## Project Overview
AutoCrate is a Next.js 14 application for designing shipping crates with 3D visualization and NX CAD integration for Applied Materials engineering standards.

**Live URL**: https://autocrate.vercel.app

## Current State (v3.0.0 - NX Professional Integration)
The application has been transformed into a professional NX-integrated tool with:
- JT file export for NX 2022 compatibility
- Applied Materials drawing standards and BOM generation
- Professional NX-style UI with dark theme
- Multi-sheet drawing generation system
- Comprehensive documentation in `/docs/` folder
- NX-compatible keyboard shortcuts and workflows

## Tech Stack
- **Frontend**: Next.js 14.0.4 with App Router, TypeScript, Tailwind CSS
- **3D Rendering**: Three.js/React Three Fiber with NX-style viewport
- **State Management**: Zustand stores (crate, theme, logs)
- **CAD Integration**: JT file format, NX expressions, Applied Materials standards
- **UI Components**: Radix UI with professional NX aesthetic
- **Testing**: Vitest + Playwright with comprehensive coverage
- **Deployment**: Vercel via CLI (NOT GitHub Actions)

## Key Features
- **NX Integration**: JT file export, NX 2022 compatibility, professional expressions
- **Applied Materials Standards**: ASME Y14.5-2009 compliance, company drawing formats
- **3D Visualization**: Professional CAD-style viewport with measurement tools
- **Drawing Generation**: Multi-sheet technical drawings with title blocks
- **Bill of Materials**: Automated BOM with TC engineering numbers
- **Professional UI**: NX-style interface with dark theme, ribbons, panels

## File Structure
```
/src/app/          - Next.js app router pages
/src/components/   - React components
  /layout/         - NX-style UI layout components
  /panels/         - Professional side panels
  /viewport/       - 3D viewport and controls
/src/services/     - Business logic and NX integration
  jtExporter.ts             - JT file format export
  nxGenerator.ts            - NX expression generation
  nxDrawingGenerator.ts     - Technical drawing creation
  appliedMaterialsStandards.ts - Company compliance
/src/store/        - Zustand state management
/src/types/        - TypeScript definitions including NX types
/docs/             - All documentation (moved from root)
/tests/            - Comprehensive test suites
```

## Documentation Structure
**Root Directory (4 files only):**
- `README.md` - Brief overview with link to full docs
- `CLAUDE.md` - Claude AI assistant instructions
- `GEMINI.md` - Gemini AI assistant instructions (this file)
- `CHANGELOG.md` - Version history and release notes

**All other documentation is in `/docs/`:**
- `getting-started.md` - Quick start guide
- `nx-integration.md` - NX workflow and JT export
- `applied-materials-standards.md` - Company specifications
- `api-reference.md` - Component and service APIs
- `keyboard-shortcuts.md` - NX-compatible shortcuts
- And more...

## Development Workflow
1. **Local Development**: `.\autocrate local` or `.\autocrate dev`
2. **Quality Checks**: `.\autocrate prepare` (lint, type-check, build, test)
3. **User-Controlled Deployment**: `.\autocrate deploy` (ONLY when user approves)

## Critical Geometry Rules
- **World Coordinate System**: Z-up (engineering standard)
- **Origin [0,0,0]**: Center of crate footprint ON THE FLOOR
- **Crate Positioning**: Bottom face at Z=0, extends upward to Z=height
- **NX Compatibility**: Two-point diagonal construction method

## Applied Materials Standards
- **Part Numbers**: 0205-XXXXX format
- **TC Numbers**: TC2-XXXXXXX format  
- **Drawing Size**: D (34" x 22")
- **Standards**: ASME Y14.5-2009, ASME Y14.38-1999
- **Materials**: Lumber specifications per 0251-XXXXX series

## Important Notes
- **NO Emojis**: Never use emojis or non-ASCII characters in code
- **Clean Codebase**: Only essential files, remove temporary scripts immediately
- **Obsidian-Compatible**: All markdown must be Obsidian-compatible
- **Professional Quality**: Target experienced NX engineers as users
- **Applied Materials Focus**: All standards must match company specifications

## Common Commands
```bash
.\autocrate dev        # Start development server
.\autocrate build      # Build for production  
.\autocrate test       # Run all tests
.\autocrate lint       # Run ESLint
.\autocrate typecheck  # TypeScript validation
.\autocrate deploy     # Deploy to production (user approval required)
```

## Testing
- **Unit Tests**: `/tests/unit/` - Component and service testing
- **Integration Tests**: `/tests/integration/` - NX compatibility testing
- **E2E Tests**: `/tests/e2e/` - Full workflow validation with Playwright

## Key Constraints
- **No Auto-Deployment**: All deployments require explicit user approval
- **Task-Focused Changes**: Only modify files directly related to the request
- **Professional Standards**: Match NX user expectations and Applied Materials compliance
- **Documentation in /docs/**: Keep root directory clean (4 files maximum)

## Version History
- **v1.0.0**: Initial crate design tool
- **v2.0.0**: Enhanced 3D visualization and mobile support
- **v3.0.0**: Complete NX integration with Applied Materials standards (current)

Remember: Focus on professional quality that experienced NX engineers will respect and use for actual production work.