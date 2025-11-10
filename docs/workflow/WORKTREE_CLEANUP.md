# Worktree Cleanup Guide

## What Happens to Local Issue Folders?

When you delete branches on GitHub or close/merge PRs, the **local worktrees remain on your machine**. They don't automatically disappear.

### Example

```
You on GitHub:                  Your Machine:
- Merge PR #124 ✓              - issues/124/ ❌ Still exists
- Close issue #124 ✓           - sbl-124 branch ❌ Still exists
- Delete branch sbl-124 ✓      - All files ❌ Still there
```

**Why?** Git worktrees are local working directories. Git doesn't know if you're done with them.

## When to Clean Up

Clean up worktrees when:

- ✅ Issue is closed
- ✅ PR is merged
- ✅ You're done with the work
- ✅ Branch is deleted on GitHub

Keep worktrees when:

- ❌ Issue is still open
- ❌ You're still working on it
- ❌ PR is pending review

## How to Clean Up

### Option 1: Automated Script (Recommended)

```bash
# See what would be removed
./scripts/cleanup-worktrees.sh --dry-run

# Interactive cleanup (asks for confirmation)
./scripts/cleanup-worktrees.sh

# Clean specific issues
./scripts/cleanup-worktrees.sh 124 145 147
```

The script automatically:

- Checks GitHub issue status
- Identifies closed/merged issues
- Removes worktrees safely
- Deletes local branches
- Offers to delete remote branches

### Option 2: Manual Cleanup

```bash
# Remove worktree
git worktree remove issues/124

# Delete local branch
git branch -d sbl-124

# Delete remote branch (if exists)
git push origin --delete sbl-124

# Clean up stale references
git worktree prune
```

## What Gets Removed

When you run cleanup, these are removed:

```bash
issues/124/              # ← Worktree directory deleted
  ├── src/
  ├── package.json
  └── ... all files     # ← All files deleted

sbl-124                  # ← Local branch deleted
origin/sbl-124          # ← Remote branch deleted (if you confirm)
```

**Important:** The Git history remains! The commits are still in your repo.

## What Gets Kept

These are **NOT** removed:

- ✅ Git commit history (always preserved)
- ✅ The main `repo/` worktree
- ✅ Open issue worktrees
- ✅ Worktrees you're actively using

## Checking Current Status

### See all worktrees

```bash
git worktree list
```

### See which can be cleaned

```bash
./scripts/cleanup-worktrees.sh --dry-run
```

### See all local branches

```bash
git branch -a | grep sbl-
```

### See which issues are closed

```bash
gh issue list --state closed
```

## Example Cleanup Session

```bash
$ ./scripts/cleanup-worktrees.sh --dry-run

Issue #119: OPEN (keeping)
Issue #124: CLOSED ✓
Issue #128: OPEN (keeping)
Issue #144: CLOSED ✓
Issue #145: CLOSED ✓

Worktrees to remove:
  - Issue #124
  - Issue #144
  - Issue #145

$ ./scripts/cleanup-worktrees.sh 124 144 145

Removing worktrees...
✓ Removed worktree: issues/124
✓ Deleted local branch: sbl-124
✓ Removed worktree: issues/144
✓ Deleted local branch: sbl-144
✓ Removed worktree: issues/145
✓ Deleted local branch: sbl-145

Cleanup complete!

Remaining worktrees:
  repo/        main
  issues/119   sbl-119
  issues/128   sbl-128
```

## Regular Maintenance

Run cleanup regularly:

```bash
# Weekly or after merging PRs
./scripts/cleanup-worktrees.sh --dry-run

# Remove closed issues
./scripts/cleanup-worktrees.sh
```

## Safety Notes

- The script uses `--force` to remove worktrees even with uncommitted changes
- **Before cleanup:** Ensure you've pushed any important changes
- **After cleanup:** You can always recreate the worktree if needed
- Git history is never lost - commits remain in the repo

## Recovering Deleted Worktrees

If you need the worktree back:

```bash
# Recreate worktree from branch
git worktree add issues/124 sbl-124

# Or create fresh worktree for the issue
./scripts/worktree-issue.sh 124
```

## Disk Space

Each worktree is a full copy of the repo:

```bash
# Check size
du -sh issues/*

# Example output:
# 250M  issues/119
# 250M  issues/124
# 250M  issues/128
```

Cleaning up 3 worktrees = ~750MB freed!

## Common Scenarios

### Scenario 1: Just merged PR #124

```bash
# Clean it up
./scripts/cleanup-worktrees.sh 124
```

### Scenario 2: Closed multiple issues

```bash
# See what's closed
./scripts/cleanup-worktrees.sh --dry-run

# Clean all closed
./scripts/cleanup-worktrees.sh
```

### Scenario 3: Want to start fresh

```bash
# Remove all except open issues
./scripts/cleanup-worktrees.sh
```

### Scenario 4: Accidentally removed

```bash
# Recreate
./scripts/worktree-issue.sh 124
```

## Quick Commands

| Task                  | Command                                    |
| --------------------- | ------------------------------------------ |
| Preview cleanup       | `./scripts/cleanup-worktrees.sh --dry-run` |
| Interactive cleanup   | `./scripts/cleanup-worktrees.sh`           |
| Clean specific issues | `./scripts/cleanup-worktrees.sh 124 145`   |
| List all worktrees    | `git worktree list`                        |
| Check issue status    | `gh issue view 124`                        |
| Recreate worktree     | `./scripts/worktree-issue.sh 124`          |

## Summary

**Key Points:**

1. Local worktrees don't auto-delete when you clean up GitHub
2. Use the cleanup script regularly to free disk space
3. Cleaning up is safe - Git history is preserved
4. You can always recreate worktrees if needed

**Best Practice:**

```bash
# After merging/closing issues
./scripts/cleanup-worktrees.sh --dry-run  # Check
./scripts/cleanup-worktrees.sh            # Clean
```

That's it! Keep your local workspace tidy. 🧹
