# ChangeTracker Data Pipeline

## Overview

The ChangeTracker component displays version, commit, contributor, and timestamp information at the top of the page. The issue badge has been removed per issue #179.

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. API Route: /api/last-update/route.ts                        │
│    (Server-side, runs on each request)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Data Sources:                                                   │
│                                                                 │
│ • package.json:                                                │
│   - version (e.g., "13.4.0")                                   │
│   - tiNumber (deprecated, e.g., "TI-124-QUICK-TEST")          │
│                                                                 │
│ • Git Repository:                                               │
│   - Branch name (git rev-parse --abbrev-ref HEAD)              │
│   - Last commit hash (git log -1 --format=%h)                  │
│   - Last commit message (git log -1 --format=%s)               │
│   - Commit timestamp (git log -1 --format=%cI)                │
│   - Author (git log -1 --format=%an <%ae>)                     │
│                                                                 │
│ • Vercel Environment Variables (if deployed):                  │
│   - VERCEL_GIT_COMMIT_REF (branch)                             │
│   - VERCEL_GIT_COMMIT_SHA (commit hash)                        │
│   - VERCEL_GIT_COMMIT_MESSAGE (commit message)                  │
│   - VERCEL_GIT_COMMIT_AUTHOR_DATE (timestamp)                  │
│   - VERCEL_GIT_COMMIT_AUTHOR_LOGIN/NAME/EMAIL (author)         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Processing:                                                     │
│                                                                 │
│ 1. Extract issue number (priority order):                       │
│    a) Commit message: (#179) → "179"                           │
│    b) Branch name: issue-179 → "179"                            │
│    c) package.json tiNumber: TI-124 → "124"                     │
│    d) Default: "0"                                              │
│                                                                 │
│ 2. Generate test instructions based on commit message keywords │
│                                                                 │
│ 3. Build ProjectMetadata object:                               │
│    {                                                            │
│      version: "13.4.0",                                         │
│      issueNumber: "179",                                        │
│      branch: "fix/issue-179-remove-left-issues",               │
│      lastCommit: "22fcf3d",                                    │
│      lastChange: "fix: ensure ChangeTracker...",               │
│      timestamp: "2025-11-12T14:27:46+01:00",                   │
│      updatedBy: "Shivam Bhardwaj <contact@...>",              │
│      testInstructions: [...]                                    │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. ChangeTracker Component (Client-side)                        │
│    src/components/ChangeTracker.tsx                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ useEffect Hook:                                                 │
│                                                                 │
│ fetch('/api/last-update')                                       │
│   .then(res => res.json())                                      │
│   .then((data: ProjectMetadata) => {                           │
│     setMetadata(data)                                           │
│     setChangeInfo(parseChangeInfo(data))                        │
│   })                                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ parseChangeInfo() Function:                                     │
│                                                                 │
│ • Extracts title from lastChange:                               │
│   "fix: ensure ChangeTracker..." → "ensure ChangeTracker..."   │
│                                                                 │
│ • Generates test items based on keywords                        │
│                                                                 │
│ • Returns ChangeInfo:                                           │
│   {                                                            │
│     issueNumber: "179",                                         │
│     title: "ensure ChangeTracker always shows...",              │
│     testItems: [...]                                            │
│   }                                                            │
│                                                                 │
│ Note: issueNumber is extracted but NOT displayed (removed)     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Render Logic:                                                   │
│                                                                 │
│ Build headerSegments array:                                     │
│                                                                 │
│ 1. Title (if available):                                        │
│    - From changeInfo.title OR                                  │
│    - Fallback to metadata.lastChange (cleaned)                 │
│                                                                 │
│ 2. Version (always shown):                                      │
│    - From metadata.version (e.g., "v13.4.0")                   │
│    - Fallback to "v1.0.0" if missing                           │
│                                                                 │
│ 3. Commit hash (if available):                                  │
│    - From metadata.lastCommit (e.g., "22fcf3d")                │
│                                                                 │
│ 4. Contributor (always shown):                                  │
│    - From metadata.updatedBy (e.g., "by shivam")               │
│    - Extracted from email: "contact@..." → "shivam"            │
│                                                                 │
│ 5. Timestamp (if available):                                    │
│    - From metadata.timestamp                                    │
│    - Formatted: "11/12/2025, 5:01:08 AM"                        │
│                                                                 │
│ ❌ Issue Badge: REMOVED (was showing issueNumber)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Display:                                                        │
│                                                                 │
│ Title • v13.4.0 • 22fcf3d • by shivam • 11/12/2025, 5:01:08 AM│
│                                                                 │
│ (Issue badge removed - no longer displays issue number)         │
└─────────────────────────────────────────────────────────────────┘
```

## Key Files

1. **API Route**: `src/app/api/last-update/route.ts`
   - Server-side endpoint
   - Reads git metadata and package.json
   - Returns JSON with ProjectMetadata

2. **Component**: `src/components/ChangeTracker.tsx`
   - Client-side React component
   - Fetches from API on mount
   - Renders change history (without issue badge)

3. **Usage**: `src/app/page.tsx`
   - Imports and renders `<ChangeTracker />` at top of page

## Current Behavior (After Issue #179 Fix)

✅ **Shows:**
- Commit message title
- Version number
- Commit hash
- Contributor name
- Timestamp

❌ **Does NOT show:**
- Issue badge (removed)

## Data Sources Priority

### Version
1. `package.json` → `version` field
2. Fallback: `"1.0.0"`

### Commit Hash
1. Vercel env: `VERCEL_GIT_COMMIT_SHA` (first 7 chars)
2. Git command: `git log -1 --format=%h`
3. Fallback: `"unknown"`

### Commit Message
1. Vercel env: `VERCEL_GIT_COMMIT_MESSAGE`
2. Git command: `git log -1 --format=%s`
3. Fallback: `"Git metadata unavailable"`

### Timestamp
1. Vercel env: `VERCEL_GIT_COMMIT_AUTHOR_DATE` or `VERCEL_GIT_COMMIT_COMMITTED_AT`
2. Git command: `git log -1 --format=%cI`
3. Fallback: Current ISO timestamp

### Contributor
1. `package.json` → `maintainer` field
2. Vercel env: `VERCEL_GIT_COMMIT_AUTHOR_LOGIN` / `NAME` / `EMAIL`
3. Fallback: `"unknown@designviz.com"`

## Testing the Pipeline

To verify the pipeline works:

1. **Check API response:**
   ```bash
   curl http://localhost:3000/api/last-update
   ```

2. **Check component renders:**
   - Open browser DevTools
   - Check Network tab for `/api/last-update` request
   - Verify ChangeTracker component renders above header

3. **Verify no issue badge:**
   - Should NOT see blue "Issue #XXX" badge
   - Should see: Title • Version • Commit • Contributor • Timestamp

