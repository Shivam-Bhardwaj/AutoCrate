# Cursor Worktree Setup

This directory contains Cursor-specific configuration files that are executed when new worktrees are created.

## Files

- **`worktree-setup.sh`** - Automatically executed when Cursor creates a new worktree. Sets up:
  - Environment variables
  - Dependencies (npm install)
  - Issue context detection
  - GitHub CLI availability check

## Usage

### Automatic Setup

When Cursor creates a new worktree, `worktree-setup.sh` is automatically executed.

### Manual Workflow

To work on a GitHub issue and create a PR:

```bash
# From the main repository root
./scripts/issue-to-pr.sh 174

# Or with a GitHub URL
./scripts/issue-to-pr.sh https://github.com/Shivam-Bhardwaj/AutoCrate/issues/174
```

### Creating a PR

After implementing the solution:

```bash
# From within the worktree
./scripts/create-pr-from-worktree.sh
```

## Environment Variables

- `CURSOR_ISSUE_NUMBER` - Issue number if detected
- `CURSOR_WORKTREE_DIR` - Path to current worktree
- `CURSOR_WORKTREE_SETUP` - Set to "true" when setup completes
- `CURSOR_GH_AVAILABLE` - "true" if GitHub CLI is available

## Agent Workflow

When you paste a GitHub issue URL in Cursor, the agent should:

1. Run `./scripts/issue-to-pr.sh <issue-number>`
2. Read `.issue-context.md` if available
3. Implement solution
4. Test: `npm test` and `npm run build`
5. Commit changes
6. Create PR: `./scripts/create-pr-from-worktree.sh`
