# Version Bumping Guide

## Version Format: OVERALL.CURRENT.CHANGE

Example: **13.1.0**

- **13** = Overall major version (milestones)
- **1** = Current iteration (features)
- **0** = Change number (patches)

## When to Bump Each Number

### Bump CHANGE (X.X.?) - Small Updates

Increment the third digit for:

- 🐛 Bug fixes
- 📝 Documentation updates
- 🎨 Minor UI tweaks
- ✅ Test additions
- ⚙️ Configuration changes
- 🔧 Small refactors

**Examples:**

- `13.1.0 → 13.1.1` - Fixed banner spacing issue
- `13.1.1 → 13.1.2` - Updated README
- `13.1.2 → 13.1.3` - Added test for API route

**Command:**

```bash
npm run version:patch
npm run version:sync
```

---

### Bump CURRENT (X.?.0) - New Features

Increment the second digit for:

- ✨ New features
- 🚀 New API endpoints
- 🧩 New components
- 🎨 Significant UI changes
- ⚡ Performance improvements
- 📊 New visualizations

**Examples:**

- `13.1.3 → 13.2.0` - Added klimp calculator
- `13.2.0 → 13.3.0` - New STEP export feature
- `13.3.0 → 13.4.0` - Added dark mode

**Command:**

```bash
npm run version:minor
npm run version:sync
```

**Note**: Reset CHANGE to 0 automatically.

---

### Bump OVERALL (?.0.0) - Major Changes

Increment the first digit for:

- 💥 Breaking API changes
- 🏗️ Architecture overhauls
- 🎯 Major milestones
- 🔄 Complete redesigns
- 📦 Framework upgrades (Next.js 14 → 15)
- 🚨 Incompatible changes

**Examples:**

- `13.4.5 → 14.0.0` - Migrated to new CAD format
- `14.3.2 → 15.0.0` - Complete UI redesign
- `15.1.0 → 16.0.0` - Upgraded to Next.js 15

**Command:**

```bash
npm run version:major
npm run version:sync
```

**Note**: Reset CURRENT and CHANGE to 0 automatically.

---

## Files Auto-Updated by Version Sync

When you run `npm run version:sync`, these files update automatically:

1. **package.json**

   ```json
   {
     "version": "13.2.0"
   }
   ```

2. **.claude/version-config.json**

   ```json
   {
     "version": "13.2.0",
     "versionScheme": {
       "overall": 13,
       "current": 2,
       "change": 0
     }
   }
   ```

3. **.claude/project-status.json**

   ```json
   {
     "currentVersion": "13.2.0"
   }
   ```

4. **Git Tag** (on commit)
   - Creates tag: `v13.2.0`
   - Allows easy rollback

---

## Manual Updates Required

You must manually update:

### 1. CHANGELOG.md

Add entry describing the changes:

```markdown
## [13.2.0] - 2025-10-08

### Added

- Klimp fastener calculation system
- 3D visualization for klimps

### Changed

- Updated banner styling

### Fixed

- Fixed spacing issue in banner
```

### 2. Git Commit Message

Include version in commit:

```bash
git commit -m "feat: add klimp calculator

Complete klimp placement algorithm with 18-24 inch spacing.

Version: 13.2.0
TI-123"
```

---

## Quick Decision Tree

```
┌─ Is it a bug fix or documentation?
│  └─ YES → version:patch (13.1.0 → 13.1.1)
│
├─ Is it a new feature or significant change?
│  └─ YES → version:minor (13.1.0 → 13.2.0)
│
└─ Is it a breaking change or major milestone?
   └─ YES → version:major (13.1.0 → 14.0.0)
```

---

## Version History Tracking

### Check Current Version

```bash
cat package.json | grep version
# or
node -p "require('./package.json').version"
```

### Check Version History

```bash
git tag -l
# Shows: v13.0.0, v13.1.0, v13.1.1, etc.
```

### See What Changed in a Version

```bash
git show v13.2.0
```

---

## Pre-Commit Hook

A pre-commit hook enforces version bumping:

- ✅ Checks if version changed
- ✅ Prevents commits without version bump
- ✅ Ensures version sync ran

To bypass (NOT RECOMMENDED):

```bash
git commit --no-verify
```

---

## Common Scenarios

### Scenario 1: Fixed a Small Bug

```bash
# Fix the bug in code
npm run version:patch      # 13.1.0 → 13.1.1
npm run version:sync       # Sync across files
# Update CHANGELOG.md
git add .
git commit -m "fix: corrected banner spacing"
git push
```

### Scenario 2: Added New Feature

```bash
# Add feature code
npm run version:minor      # 13.1.1 → 13.2.0
npm run version:sync
# Update CHANGELOG.md
git add .
git commit -m "feat: klimp calculator system"
git push
```

### Scenario 3: Major Architecture Change

```bash
# Make breaking changes
npm run version:major      # 13.2.0 → 14.0.0
npm run version:sync
# Update CHANGELOG.md with migration guide
git add .
git commit -m "BREAKING: new CAD format"
git push
```

---

## Rollback to Previous Version

If you need to undo a version bump before committing:

```bash
# Undo changes
git checkout package.json .claude/version-config.json .claude/project-status.json

# Or revert to specific version
git checkout v13.1.0 -- package.json
npm run version:sync
```

If already committed, see `.claude/workflows/REVERTING.md`.

---

## Version Metadata

The metadata banner on the website automatically displays:

- Current version from package.json
- TI number
- Branch name
- Commit hash
- Last update timestamp

After version bump and deployment, verify the banner shows the new version.
