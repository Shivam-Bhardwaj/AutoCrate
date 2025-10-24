# Worktree Workflow for Multi-LLM Development

This repository supports parallel development by multiple LLMs (Claude Code, OpenAI Codex, etc.) using git worktrees. Each issue gets its own isolated workspace.

## Quick Start

### From SSH Session

```bash
# SSH into your machine
ssh your-machine

# Navigate to project
cd /path/to/AutoCrate

# Work on an issue (replace 124 with your issue number)
./scripts/work-on-issue.sh 124 claude

# Or for Codex
./scripts/work-on-issue.sh 124 codex
```

This will:
1. Create a worktree in `issues/124/`
2. Set up the branch and context
3. Launch Claude Code (or Codex) in that directory
4. You can then use `/issue 124` or provide the issue URL

### Manual Worktree Setup

```bash
# Create worktree for issue #124
./scripts/worktree-issue.sh 124

# Change to the worktree
cd issues/124

# Launch your LLM
claude
# or
codex
```

## Architecture

```
AutoCrate/
├── .git/                    # Main git repository
├── issues/                  # Worktrees for each issue
│   ├── 124/                # Worktree for issue #124
│   │   ├── .git            # Points to main .git/worktrees/124
│   │   ├── .issue-context.md
│   │   └── ... (full project files)
│   ├── 147/                # Worktree for issue #147
│   └── 151/                # Worktree for issue #151
├── scripts/
│   ├── worktree-issue.sh   # Creates worktrees
│   └── work-on-issue.sh    # Wrapper script
└── CLAUDE.md               # Development guide
```

## How It Works

### Git Worktrees

Git worktrees allow multiple working directories from a single repository:

- **Main repo**: `/path/to/AutoCrate` (usually on `main` branch)
- **Issue worktrees**: `issues/124/`, `issues/147/`, etc. (each on their own branch)

Each worktree:
- Has its own working directory with full project files
- Has its own branch (e.g., `sbl-124`, `sbl-147`)
- Shares the same `.git` repository
- Can be worked on independently without conflicts

### Benefits

1. **Parallel Development**: Multiple LLMs can work on different issues simultaneously
2. **No Conflicts**: Each issue has its own workspace and branch
3. **Easy Cleanup**: `git worktree remove issues/124` when done
4. **Shared History**: All worktrees share the same git history

## Workflow

### 1. Start Working on Issue

```bash
./scripts/work-on-issue.sh 124 claude
```

### 2. LLM Works in Isolation

The LLM:
- Reads `.issue-context.md` for context
- Makes changes in `issues/124/`
- Runs tests: `npm test`
- Commits changes
- Pushes to `sbl-124` branch

### 3. Create PR

```bash
cd issues/124
gh pr create --title "Fix: Issue #124" --body "Closes #124" --base main
```

### 4. Clean Up When Merged

```bash
# From main repo directory
git worktree remove issues/124

# Delete local branch
git branch -d sbl-124

# Delete remote branch (after PR merged)
git push origin --delete sbl-124
```

## Multiple LLMs Working Simultaneously

### Example: 3 Issues, 3 LLMs

**Terminal 1 - Claude on Issue #124**:
```bash
cd /path/to/AutoCrate
./scripts/work-on-issue.sh 124 claude
# Claude works in issues/124/ on branch sbl-124
```

**Terminal 2 - Codex on Issue #147**:
```bash
cd /path/to/AutoCrate
./scripts/work-on-issue.sh 147 codex
# Codex works in issues/147/ on branch sbl-147
```

**Terminal 3 - Claude on Issue #151**:
```bash
cd /path/to/AutoCrate
./scripts/work-on-issue.sh 151 claude
# Claude works in issues/151/ on branch sbl-151
```

All three can:
- Run tests independently
- Make commits independently
- Push to their own branches
- Create separate PRs

**No conflicts!**

## Commands Reference

### Create Worktree

```bash
./scripts/worktree-issue.sh <issue-number>
```

### List All Worktrees

```bash
git worktree list
```

### Remove Worktree

```bash
# From main repo
git worktree remove issues/124

# Or with force if there are uncommitted changes
git worktree remove --force issues/124
```

### Move Between Worktrees

```bash
# From main repo to issue worktree
cd issues/124

# From issue worktree back to main
cd ../..
```

## Integration with Claude Code

The `/issue` slash command has been updated to automatically:

1. Check if a worktree exists for the issue
2. If not, create one using `worktree-issue.sh`
3. Change to the worktree directory
4. Read the issue context
5. Begin working

Just run:
```
/issue 124
```

Or provide the GitHub URL directly.

## Troubleshooting

### Worktree Already Exists

If you get "worktree already exists":
```bash
cd issues/124
git branch --show-current  # Check current branch
git status                  # Check status
```

### Clean Up Stale Worktrees

```bash
# Prune removed worktrees
git worktree prune

# List all worktrees
git worktree list
```

### Conflict During Push

If there's a conflict with remote:
```bash
cd issues/124
git pull origin sbl-124 --rebase
# Resolve conflicts
git push origin sbl-124
```

## Best Practices

1. **One Issue Per Worktree**: Don't work on multiple issues in the same worktree
2. **Clean Commits**: Use conventional commit messages
3. **Test Before PR**: Always run `npm test` and `npm run build`
4. **Remove After Merge**: Clean up worktrees after PR is merged
5. **Sync Main**: Regularly `git fetch` in main repo to stay updated

## Script Locations

- **Worktree Setup**: `scripts/worktree-issue.sh`
- **Work Wrapper**: `scripts/work-on-issue.sh`
- **Slash Command**: `.claude/commands/issue.md`

## See Also

- [CLAUDE.md](CLAUDE.md) - Development guide
- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
