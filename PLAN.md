I see - the file is already staged. Let me provide the plan directly to you:

# Implementation Plan: Issue #145 - Fix Issue Number Display After Merge

## Problem
When PRs merge to `main`, the ChangeTracker banner shows "Issue #0" because issue extraction relies on branch name patterns (`issue-(\d+)`), which don't exist on `main`.

## Root Cause
- **route.ts:56-58**: Regex `branch.match(/issue-(\d+)/i)` fails on `main`
- **ChangeTracker.tsx:18-22**: Same pattern, defaults to `null`
- Post-merge: metadata lost, no fallback

## Solution: Commit Message Parsing
Extract issue numbers from GitHub PR merge commits (format: `"description (#123)"`).

### Minimal Diffs

**1. API route** (`src/app/api/last-update/route.ts:56-58`)
```typescript
// Before: const issueMatch = branch.match(/issue-(\d+)/i)
// After: Try branch, fallback to commit message
const branchMatch = branch.match(/issue[_-](\d+)/i)
const commitMatch = lastChange.match(/\(#(\d+)\)/)
const issueNumber = branchMatch?.[1] || commitMatch?.[1] || '0'
```

**2. Client fallback** (`src/components/ChangeTracker.tsx:24-28`)
```typescript
// Add commit parsing before final '0' fallback
const commitMatch = metadata.lastChange.match(/\(#(\d+)\)/)
const issueNumber = normalizedIssue && normalizedIssue !== '0'
  ? normalizedIssue
  : parseIssueFromBranch(metadata.branch) || commitMatch?.[1] || '0'
```

## Validation
```bash
npm test -- last-update  # Unit tests
npm run build            # TypeScript check
npm run dev              # Manual: check banner at localhost:3000
```

## Test Cases
- `sbl-145` branch → Issue #145 ✓
- `main` + commit "Refine Klimp placement (#143)" → Issue #143 ✓
- `main` + commit "chore: deps" → Issue #0 ✓

## Edge Cases
- Multiple `(#N)` in commit: First match wins
- No issue ref: Displays "Issue #0" (current behavior)
- Malformed patterns: Regex strict, no false positives

## Risks & Rollback
- **Risk**: Low - pure parsing, no schema changes
- **Rollback**: Single `git revert`, graceful degradation to Issue #0

**Plan: 250 words | Changes: 2 files, ~6 lines | Timeline: ~15min**
