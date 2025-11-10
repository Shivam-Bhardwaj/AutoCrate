# AutoCrate Development Scripts

Essential scripts for the AutoCrate multi-LLM development workflow.

## 🚀 Quick Start - Multi-LLM Workflow

### Working on a GitHub Issue

```bash
# Create worktree for issue #123
./scripts/worktree-issue.sh 123

# Or work on it with specific LLM
./scripts/work-on-issue.sh 123 claude
./scripts/work-on-issue.sh 123 codex

# Assign to LLM
./scripts/assign-issue.sh 123 claude

# View assignments
./scripts/assign-issue.sh --list

# Clean up closed issues
./scripts/cleanup-worktrees.sh
```

## 📁 Scripts Overview

### Multi-LLM Workflow Scripts

#### worktree-issue.sh

**Purpose**: Create isolated git worktree for an issue.

**Usage**:

```bash
./scripts/worktree-issue.sh [issue-number]
./scripts/worktree-issue.sh 123
```

**What it does**:

- Fetches issue details from GitHub
- Creates worktree in `issues/[NUMBER]/`
- Creates branch `sbl-[NUMBER]`
- Generates `.issue-context.md` with issue details

#### work-on-issue.sh

**Purpose**: Launch LLM in specific issue worktree.

**Usage**:

```bash
./scripts/work-on-issue.sh [issue-number] [llm-name]
./scripts/work-on-issue.sh 123 claude
./scripts/work-on-issue.sh 123 codex
```

**What it does**:

- Changes to issue worktree
- Shows context (branch, issue info)
- Launches specified LLM

#### assign-issue.sh

**Purpose**: Track which LLM is working on which issue.

**Usage**:

```bash
# Assign issue to LLM
./scripts/assign-issue.sh 123 claude

# List assignments
./scripts/assign-issue.sh --list

# Free/unassign issue
./scripts/assign-issue.sh 123 --free

# Mark as in-progress or done
./scripts/assign-issue.sh 123 --status in-progress
./scripts/assign-issue.sh 123 --status done
```

#### cleanup-worktrees.sh

**Purpose**: Remove worktrees for closed GitHub issues.

**Usage**:

```bash
# Interactive cleanup (asks for confirmation)
./scripts/cleanup-worktrees.sh

# Dry run (see what would be removed)
./scripts/cleanup-worktrees.sh --dry-run

# Clean specific issue
./scripts/cleanup-worktrees.sh 123

# Force cleanup (no confirmation)
./scripts/cleanup-worktrees.sh --force
```

#### show-llm-context.sh

**Purpose**: Display context information for LLMs.

**Usage**:

```bash
./scripts/show-llm-context.sh
```

**Shows**:

- Current directory location
- Git branch
- Issue number (if in worktree)
- Issue context file location

---

### Development & Deployment Scripts

#### deploy.sh

**Purpose**: Bump version and deploy to Vercel.

**Usage**:

```bash
./scripts/deploy.sh patch  # 1.0.0 → 1.0.1
./scripts/deploy.sh minor  # 1.0.0 → 1.1.0
./scripts/deploy.sh major  # 1.0.0 → 2.0.0
```

#### create-pr.sh

**Purpose**: Create pull request for current branch.

**Usage**:

```bash
./scripts/create-pr.sh
```

---

### Build & Test Scripts (Used by pre-commit hooks)

#### run-tsc.js

**Purpose**: TypeScript type checking for pre-commit hook.

**Usage**: Automatically run by Husky pre-commit hook.

#### test-runner.js

**Purpose**: Comprehensive test suite runner.

**Usage**: Automatically run by pre-commit hook.

```bash
node scripts/test-runner.js
```

**Runs**:

- TypeScript type check
- Next.js production build
- Jest unit tests
- STEP file validation
- npm security audit

#### security-agent.js

**Purpose**: Scan for secrets in commits.

**Usage**: Automatically run by pre-commit hook.

#### sync-version.js

**Purpose**: Sync version number across all files.

**Usage**:

```bash
node scripts/sync-version.js
```

---

### Utility Scripts

#### multi-file-helper.sh

**Purpose**: Open groups of related files.

**Usage**:

```bash
# File groups
./scripts/multi-file-helper.sh core      # Core system files
./scripts/multi-file-helper.sh ui        # UI components
./scripts/multi-file-helper.sh lib       # Library files
./scripts/multi-file-helper.sh tests     # Test files
./scripts/multi-file-helper.sh api       # API routes
./scripts/multi-file-helper.sh hardware  # Hardware files
./scripts/multi-file-helper.sh step      # STEP export files

# Search operations
./scripts/multi-file-helper.sh search "PMI"
./scripts/multi-file-helper.sh todo
./scripts/multi-file-helper.sh recent
./scripts/multi-file-helper.sh status
```

---

## 🔧 Setup Requirements

### GitHub CLI

All worktree scripts require GitHub CLI:

```bash
# Install
sudo apt install gh          # Ubuntu/Debian
brew install gh              # macOS

# Authenticate
gh auth login
```

### Make Scripts Executable

```bash
chmod +x scripts/*.sh
```

---

## 📂 Archive

Platform-specific and obsolete scripts are in `scripts/archive/`:

- `rpi5-setup.sh` - Raspberry Pi 5 setup (rarely needed)

---

## 💡 Workflow Tips

### Parallel Development

Multiple LLMs can work simultaneously:

```bash
# Terminal 1: Claude on issue 140
./scripts/work-on-issue.sh 140 claude

# Terminal 2: Codex on issue 149
./scripts/work-on-issue.sh 149 codex
```

### Monitoring Active Work

```bash
./scripts/assign-issue.sh --list
```

### Regular Cleanup

After merging PRs:

```bash
./scripts/cleanup-worktrees.sh
```

---

## 🐛 Troubleshooting

### "gh: command not found"

Install GitHub CLI (see Setup Requirements).

### "Permission denied"

```bash
chmod +x scripts/*.sh
```

### Can't fetch issue details

```bash
gh auth login
```

### Worktree already exists

```bash
# Remove existing worktree
git worktree remove issues/123 --force

# Or clean up all closed issues
./scripts/cleanup-worktrees.sh
```

---

## 📝 Script Development

When adding new scripts:

1. Follow naming convention: `kebab-case.sh` or `kebab-case.js`
2. Add execute permissions: `chmod +x script-name.sh`
3. Include usage documentation at top of script
4. Update this README
5. Use shellcheck for bash scripts: `shellcheck script-name.sh`

---

## 📄 Related Documentation

- [Worktree Workflow](../docs/workflow/WORKTREE_WORKFLOW.md)
- [LLM Onboarding](../docs/workflow/LLM_ONBOARDING.md)
- [Assigning Tasks](../docs/workflow/ASSIGNING_TASKS.md)
- [Quick Start](../docs/workflow/QUICK_START.md)
