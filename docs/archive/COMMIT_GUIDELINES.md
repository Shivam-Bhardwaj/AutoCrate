# Commit Message Guidelines

> **Important**: Always work from a GitHub Issue! The issue number is automatically extracted and displayed in the UI.

## Quick Format

```
type: Short description (max 50 chars)

Closes #issue-number
```

## Examples

### Good Commit Messages ✅

```
fix: Correct lag screw placement on panels

Closes #53
```

```
feat: Add change tracking UI

Closes #69
```

```
chore: Update dependencies

Closes #70
```

### Bad Commit Messages ❌

```
fix: Correct lag screw placement on side panels to center on vertical cleats + comprehensive security improvements and environment variable configuration (#53)
```
❌ Too long and verbose

```
Updated files
```
❌ Not descriptive enough

```
feat: implement ASME Y14.5 PMI standards with dynamic scaling
- Add dynamic PMI scale factor based on crate dimensions
- Implement ASME Y14.5 datum plane visualization (A, B, C)
- Update PMI labels to follow ASME Y14.5 format
- Add datum plane visual components with proper symbols
- Remove redundant PMI snapshot section from UI
- Move PMI controls to right-side control panel
- Make offsets proportional to crate dimensions for better scaling
```
❌ Way too detailed - save this for PR description

## Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **chore**: Maintenance task
- **docs**: Documentation only
- **test**: Test additions or fixes
- **refactor**: Code restructuring
- **style**: Formatting only
- **perf**: Performance improvement

## Branch Naming

Always use issue numbers in branch names:

```
feature/issue-69-change-tracking
fix/issue-71-panel-alignment
chore/issue-72-update-deps
```

## Issue Number System

Issue numbers are automatically extracted from branch names:

- Branch `feature/issue-69-change-tracking` → Issue #69
- Branch `fix/issue-123-bug-fix` → Issue #123

Always work from a GitHub issue to maintain traceability!

## Workflow

1. **Create an issue** describing what you want to do
2. **Create a branch** named `type/issue-NUMBER-brief-description`
3. **Make changes** and commit with concise messages
4. **Reference the issue** with "Closes #NUMBER" in commit
5. **Create PR** that will automatically close the issue

## How It Works

The ChangeTracker UI shows the current issue number prominently and automatically suggests what to test based on your commit message:

- Commits with "UI" → Test UI rendering
- Commits with "3D" → Test visualization
- Commits with "export" → Test file downloads
- Commits with "fix" → Verify bug is resolved

Keep commit messages clear so the system can generate helpful test suggestions!