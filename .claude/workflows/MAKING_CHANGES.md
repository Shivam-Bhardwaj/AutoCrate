# LLM Workflow: Making Changes to AutoCrate

## Overview

This document provides a step-by-step workflow for making ANY change to the AutoCrate codebase. Follow this workflow for every commit to ensure proper versioning, testing, and deployment.

## Pre-Change Checklist

### 1. Check Current State

```bash
# Check current version
cat package.json | grep version

# Check git status
git status

# Check what changed recently
git log --oneline -5
```

### 2. Read Context

- Read `CLAUDE.md` for architecture overview
- Read `CHANGELOG.md` for recent changes
- Check `.claude/project-status.json` for current state
- Review `.claude/version-config.json` for version rules

## Making Changes Workflow

### Step 1: Understand the Change Type

Determine what you're changing:

- 🐛 **Bug fix** → Bump CHANGE number (13.1.0 → 13.1.1)
- ✨ **New feature** → Bump CURRENT number (13.1.0 → 13.2.0)
- 💥 **Breaking change** → Bump OVERALL number (13.1.0 → 14.0.0)
- 📝 **Documentation only** → Bump CHANGE number (13.1.0 → 13.1.1)

### Step 2: Make Code Changes

1. Modify the necessary files
2. Follow existing code patterns
3. Maintain TypeScript type safety
4. Update tests if needed

### Step 3: Update Version (REQUIRED FOR EVERY COMMIT)

```bash
# For bug fixes/small changes
npm run version:patch    # 13.1.0 → 13.1.1

# For new features
npm run version:minor    # 13.1.0 → 13.2.0

# For breaking changes
npm run version:major    # 13.1.0 → 14.0.0

# Then sync version across all files
npm run version:sync
```

**IMPORTANT**: Version sync updates:

- `package.json` → version field
- `.claude/version-config.json` → all version fields
- `.claude/project-status.json` → currentVersion

### Step 4: Update CHANGELOG.md

Add entry under `## [Unreleased]` section:

```markdown
### Added

- New feature description

### Changed

- What was modified

### Fixed

- Bug fix description
```

### Step 5: Test Changes

```bash
# Type check
npm run type-check

# Run unit tests (if dependencies installed)
npm test

# Build check
npm run build
```

**Note**: If tests fail, fix issues before committing.

### Step 6: Commit Changes

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: your feature description

Detailed explanation of changes.

Version: 13.2.0
TI-123

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to trigger deployment
git push origin main
```

## Post-Commit Actions

### Auto-Generated Git Tag

The system automatically creates a git tag (e.g., `v13.2.0`) on commit.

### Deployment

- Vercel automatically deploys from `main` branch
- Wait 30-60 seconds for build
- Check https://autocrate.vercel.app
- Verify version in metadata banner

### If Something Breaks

See `.claude/workflows/REVERTING.md` for rollback instructions.

## Quick Reference

| Change Type     | Version Bump    | Command                 |
| --------------- | --------------- | ----------------------- |
| Bug fix         | 13.1.0 → 13.1.1 | `npm run version:patch` |
| New feature     | 13.1.0 → 13.2.0 | `npm run version:minor` |
| Breaking change | 13.1.0 → 14.0.0 | `npm run version:major` |

## Files to ALWAYS Update

1. ✅ Version in `package.json` (via npm script)
2. ✅ `.claude/version-config.json` (via sync script)
3. ✅ `CHANGELOG.md` (manual entry)
4. ✅ Git commit with proper message

## Common Mistakes to Avoid

- ❌ Committing without bumping version
- ❌ Forgetting to update CHANGELOG.md
- ❌ Not syncing version across files
- ❌ Pushing directly without testing
- ❌ Hardcoding values instead of using config

## Need Help?

- Architecture: Read `CLAUDE.md`
- Version rules: Read `.claude/version-config.json`
- Deployment: Read `.claude/workflows/DEPLOYMENT.md`
- Reverting: Read `.claude/workflows/REVERTING.md`
