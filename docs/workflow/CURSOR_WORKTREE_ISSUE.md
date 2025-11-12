# Cursor Worktree Location Issue

## Problem

When working on multiple projects on the same server, Cursor creates worktrees in a shared location:
```
/root/.cursor/worktrees/AutoCrate__SSH__root_66.94.123.205_/[RANDOM]/
```

This can cause conflicts when:
- Multiple projects use the same server
- Worktrees from different projects mix in the same directory
- Random worktree names make it hard to identify which project/issue they belong to

## Expected Behavior

AutoCrate's workflow expects worktrees to be created in:
```
/root/repos/AutoCrate/issues/[ISSUE_NUMBER]/
```

This keeps worktrees:
- Project-specific
- Organized by issue number
- Easy to identify and manage

## Solution

### Option 1: Use Project Scripts (Recommended)

Instead of letting Cursor auto-create worktrees, use the project's scripts:

```bash
# From the main repo
cd /root/repos/AutoCrate

# Create worktree for issue #179
./scripts/worktree-issue.sh 179

# Then open Cursor in that directory
cd issues/179
cursor .
```

### Option 2: Manual Worktree Creation

```bash
# From main repo
cd /root/repos/AutoCrate

# Create worktree in project-specific location
git worktree add -b fix/issue-179 issues/179 main

# Open Cursor there
cd issues/179
cursor .
```

### Option 3: Move Existing Cursor Worktrees

If Cursor already created a worktree in the wrong location:

```bash
# From main repo
cd /root/repos/AutoCrate

# Remove Cursor's worktree
git worktree remove /root/.cursor/worktrees/AutoCrate__SSH__root_66.94.123.205_/Ac3JJ

# Create in correct location
./scripts/worktree-issue.sh 179
```

## Best Practice

**Always use project-specific worktree locations:**
- ✅ `issues/[NUMBER]/` - Project-specific, organized
- ❌ `/root/.cursor/worktrees/` - Shared, can conflict

## Current Worktree Locations

Check current worktrees:
```bash
git worktree list
```

Clean up old Cursor worktrees:
```bash
# List all worktrees
git worktree list

# Remove Cursor-created worktrees
git worktree remove /root/.cursor/worktrees/AutoCrate__SSH__root_66.94.123.205_/[NAME]
```

## Related Files

- `scripts/worktree-issue.sh` - Creates worktrees in `issues/` directory
- `scripts/work-on-issue.sh` - Wrapper script for issue workflow
- `docs/workflow/WORKTREE_WORKFLOW.md` - Complete worktree documentation

