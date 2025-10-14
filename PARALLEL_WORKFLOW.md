# Parallel Development Workflow Guide

This guide shows how to work on multiple features simultaneously using various tools and strategies.

## Table of Contents

- [Quick Start: Multi-Terminal Workflow](#quick-start-multi-terminal-workflow)
- [Option 1: VS Code Remote - Containers](#option-1-vs-code-remote---containers-recommended)
- [Option 2: Tmux/Screen (Terminal Multiplexing)](#option-2-tmuxscreen-terminal-multiplexing)
- [Option 3: Multiple Claude Code Sessions](#option-3-multiple-claude-code-sessions)
- [Option 4: GitHub Actions + Branch Strategy](#option-4-github-actions--branch-strategy)
- [Option 5: Task Runner (Make/Just)](#option-5-task-runner-makejust)
- [Best Practices](#best-practices)

---

## Quick Start: Multi-Terminal Workflow

**The simplest approach** - multiple terminals, each working on a different feature:

```bash
# Terminal 1: Feature A (plywood optimization)
cd /home/curious/workspace/projects/AutoCrate/repo
git checkout -b feature/plywood-custom-sizes
# Edit PROJECT_STATUS.md to claim this work
code src/lib/plywood-splicing.ts
npm test -- plywood-splicing.test.ts

# Terminal 2: Feature B (klimp spacing)
cd /home/curious/workspace/projects/AutoCrate/repo
git checkout -b feature/klimp-spacing-adjustment
# Edit PROJECT_STATUS.md to claim this work
code src/lib/klimp-calculator.ts
npm test -- klimp-calculator.test.ts

# Terminal 3: Docker dev server
cd /home/curious/workspace/projects/AutoCrate/container
docker compose up

# Terminal 4: Test runner (watch mode)
cd /home/curious/workspace/projects/AutoCrate/repo
npm test:watch
```

**Pros**: Simple, no setup needed
**Cons**: Hard to manage many terminals

---

## Option 1: VS Code Remote - Containers (RECOMMENDED)

**Best for**: Working with Docker-based projects like yours

### Setup

1. **Install VS Code Extensions**:

   ```bash
   # On your local machine, install:
   # - Remote - Containers (ms-vscode-remote.remote-containers)
   # - Remote - SSH (ms-vscode-remote.remote-ssh)
   # - Claude Code extension
   ```

2. **Create devcontainer.json** for AutoCrate:

   ```bash
   mkdir -p /home/curious/workspace/projects/AutoCrate/repo/.devcontainer
   ```

   I'll create this file for you below.

3. **Open in VS Code**:
   - `Ctrl+Shift+P` → "Remote-Containers: Open Folder in Container"
   - Select `/home/curious/workspace/projects/AutoCrate/repo`
   - VS Code will build and connect to the container

4. **Multiple Claude Code Sessions**:
   - Each VS Code window can have its own Claude Code instance
   - Open multiple VS Code windows for different features
   - Each can work on different branches

### Workflow

```bash
# Window 1: Feature A
git checkout -b feature/plywood-optimization
# Use Claude Code: "Improve plywood optimization algorithm"

# Window 2: Feature B (different VS Code window)
git checkout -b feature/klimp-spacing
# Use Claude Code: "Adjust klimp spacing algorithm"

# Window 3: Main branch (review/merge)
git checkout main
# Use for reviewing and merging work
```

**Pros**:

- Native Docker integration
- Each window is isolated
- Claude Code works perfectly
- Hot reload works
- Terminal per window

**Cons**:

- Requires VS Code setup
- More resource intensive

---

## Option 2: Tmux/Screen (Terminal Multiplexing)

**Best for**: Staying in pure terminal, working over SSH

### Setup Tmux

```bash
# Install tmux (if not already)
sudo apt-get update && sudo apt-get install -y tmux

# Create tmux configuration
cat > ~/.tmux.conf << 'EOF'
# Better prefix key
set -g prefix C-a
unbind C-b
bind C-a send-prefix

# Split panes using | and -
bind | split-window -h
bind - split-window -v
unbind '"'
unbind %

# Switch panes using Alt-arrow without prefix
bind -n M-Left select-pane -L
bind -n M-Right select-pane -R
bind -n M-Up select-pane -U
bind -n M-Down select-pane -D

# Enable mouse
set -g mouse on

# Status bar
set -g status-bg colour234
set -g status-fg colour137
EOF
```

### Workflow with Tmux

```bash
# Start tmux session for AutoCrate
tmux new-session -s autocrate

# Create panes (Ctrl+a then |)
# Layout:
# ┌─────────────┬─────────────┐
# │   Feature A │  Feature B  │
# │   (branch1) │  (branch2)  │
# ├─────────────┼─────────────┤
# │ Docker logs │  Tests      │
# └─────────────┴─────────────┘

# Pane 1 (top-left): Feature A
git checkout -b feature/plywood-optimization
code src/lib/plywood-splicing.ts

# Pane 2 (top-right): Feature B
git checkout -b feature/klimp-spacing
code src/lib/klimp-calculator.ts

# Pane 3 (bottom-left): Docker
cd ../container && docker compose up

# Pane 4 (bottom-right): Tests
npm test:watch
```

**Tmux Cheat Sheet**:

```bash
# Session management
tmux new -s autocrate        # New session
tmux attach -t autocrate     # Attach to session
Ctrl+a d                     # Detach from session
tmux ls                      # List sessions

# Pane management
Ctrl+a |                     # Split vertically
Ctrl+a -                     # Split horizontally
Alt+Arrow                    # Navigate panes
Ctrl+a x                     # Close pane
Ctrl+a z                     # Zoom/unzoom pane

# Window management
Ctrl+a c                     # New window
Ctrl+a n                     # Next window
Ctrl+a p                     # Previous window
Ctrl+a 0-9                   # Switch to window number
```

**Pros**:

- Pure terminal workflow
- Persists across SSH disconnects
- Very lightweight
- Can work over slow connections

**Cons**:

- Learning curve
- No GUI features

---

## Option 3: Multiple Claude Code Sessions

**Best for**: Using Claude Code from command line with multiple tasks

### Setup

```bash
# You can run Claude Code in multiple terminals simultaneously
# Each terminal = one feature

# Terminal 1
cd /home/curious/workspace/projects/AutoCrate/repo
git checkout -b feature/plywood-optimization
claude code
# In chat: "Improve plywood optimization to support custom sheet sizes"

# Terminal 2 (new terminal session)
cd /home/curious/workspace/projects/AutoCrate/repo
git checkout -b feature/klimp-spacing
claude code
# In chat: "Adjust klimp spacing to allow 0.5 inch increments"

# Terminal 3 (monitoring)
cd /home/curious/workspace/projects/AutoCrate/repo
git checkout main
watch -n 5 'git branch -v'  # Monitor all branches
```

### Coordination Script

Create a helper script:

```bash
cat > /home/curious/workspace/projects/AutoCrate/repo/scripts/parallel-work.sh << 'EOF'
#!/bin/bash
# Helper script for parallel development

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== AutoCrate Parallel Work Helper ===${NC}\n"

# Check active branches
echo -e "${YELLOW}Active branches:${NC}"
git branch -v | grep -v "main\|master"

echo ""

# Check PROJECT_STATUS.md for active work
echo -e "${YELLOW}Active work streams:${NC}"
grep -A 10 "Active Work" PROJECT_STATUS.md | grep -v "^$"

echo ""

# Show recent commits across branches
echo -e "${YELLOW}Recent commits (all branches):${NC}"
git log --all --oneline --graph -10

echo ""

# Check for conflicts
echo -e "${YELLOW}Checking for potential conflicts...${NC}"
current_branch=$(git branch --show-current)
git fetch origin main 2>/dev/null
if git merge-base --is-ancestor origin/main HEAD; then
    echo -e "${GREEN}✓ Branch is up to date with main${NC}"
else
    echo -e "${RED}⚠ Branch needs rebasing from main${NC}"
fi

echo ""

# Available actions
echo -e "${GREEN}Quick actions:${NC}"
echo "1. Start new feature: git checkout -b feature/NAME"
echo "2. Switch branches: git checkout BRANCH_NAME"
echo "3. Update from main: git rebase main"
echo "4. Check status: git status"
echo "5. View changes: git diff main"
EOF

chmod +x /home/curious/workspace/projects/AutoCrate/repo/scripts/parallel-work.sh
```

**Usage**:

```bash
./scripts/parallel-work.sh
```

**Pros**:

- Native Claude Code experience
- Each session is independent
- Can coordinate via PROJECT_STATUS.md

**Cons**:

- Need to manage terminals manually
- Can lose context between sessions

---

## Option 4: GitHub Actions + Branch Strategy

**Best for**: Automated testing and CI/CD while developing in parallel

### Setup GitHub Actions

Create `.github/workflows/parallel-ci.yml`:

```yaml
name: Parallel CI

on:
  push:
    branches: ["**"] # All branches
  pull_request:
    branches: [main]

jobs:
  # Job 1: Type checking (fast)
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run type-check

  # Job 2: Linting (fast)
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint

  # Job 3: Unit tests (medium)
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        if: always()

  # Job 4: E2E tests (slow)
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e

  # Job 5: Build check
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run build
```

### Branch Strategy

```bash
# Main branch protection rules (set in GitHub):
# - Require PR reviews
# - Require status checks (all jobs above)
# - Require branches to be up to date

# Development workflow:
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Work on feature (push regularly)
git add .
git commit -m "feat: description"
git push origin feature/my-feature

# 3. GitHub Actions runs automatically
# - View results: https://github.com/USER/REPO/actions

# 4. If tests pass, create PR
gh pr create --title "Add feature" --body "Description"

# 5. Merge when ready (automatic deployment possible)
```

### Auto-merge Script

For trusted changes:

```bash
cat > scripts/auto-merge.sh << 'EOF'
#!/bin/bash
# Auto-merge when CI passes

BRANCH=$1
if [ -z "$BRANCH" ]; then
    echo "Usage: ./auto-merge.sh BRANCH_NAME"
    exit 1
fi

echo "Waiting for CI to pass on $BRANCH..."
gh pr checks $BRANCH --watch

echo "CI passed! Creating and merging PR..."
gh pr create --fill --head $BRANCH || true
gh pr merge $BRANCH --auto --squash
EOF

chmod +x scripts/auto-merge.sh
```

**Pros**:

- Automatic testing
- Prevents breaking changes
- Works with any git client
- Great for team collaboration

**Cons**:

- Requires GitHub setup
- CI time can be slow
- Costs for private repos (free for public)

---

## Option 5: Task Runner (Make/Just)

**Best for**: Running multiple development tasks in parallel

### Setup with Make

Create `Makefile`:

```makefile
.PHONY: help dev test watch-tests docker-up parallel-dev

help:
	@echo "AutoCrate Development Tasks"
	@echo ""
	@echo "  make dev           - Start development server"
	@echo "  make test          - Run tests once"
	@echo "  make watch-tests   - Run tests in watch mode"
	@echo "  make docker-up     - Start Docker containers"
	@echo "  make parallel-dev  - Run dev server + tests in parallel"
	@echo "  make work-status   - Show current work status"

dev:
	npm run dev

test:
	npm test

watch-tests:
	npm run test:watch

docker-up:
	cd ../container && docker compose up

# Run multiple tasks in parallel
parallel-dev:
	@echo "Starting parallel development..."
	@make -j3 dev watch-tests docker-up

# Show current work status
work-status:
	@./scripts/parallel-work.sh

# Start work on new feature
# Usage: make new-feature NAME=plywood-optimization
new-feature:
	@echo "Creating branch feature/$(NAME)..."
	git checkout -b feature/$(NAME)
	@echo "Add your work to PROJECT_STATUS.md"
	code PROJECT_STATUS.md
```

**Usage**:

```bash
# Run dev server + tests + docker in parallel
make parallel-dev

# Start new feature
make new-feature NAME=plywood-optimization

# Check work status
make work-status
```

### Using `just` (Modern Alternative to Make)

```bash
# Install just
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin

# Create justfile
cat > justfile << 'EOF'
# AutoCrate development tasks

# Default recipe (shows help)
default:
    @just --list

# Start development server
dev:
    npm run dev

# Run tests in watch mode
test-watch:
    npm run test:watch

# Start Docker containers
docker:
    cd ../container && docker compose up

# Run everything in parallel
parallel: (parallel-exec "just dev" "just test-watch" "just docker")

# Create new feature branch
new-feature NAME:
    git checkout -b feature/{{NAME}}
    echo "Add to PROJECT_STATUS.md: feature/{{NAME}}"

# Helper for running commands in parallel
parallel-exec *COMMANDS:
    #!/usr/bin/env bash
    pids=()
    for cmd in "{{COMMANDS}}"; do
        eval "$cmd" &
        pids+=($!)
    done
    trap "kill ${pids[*]}" EXIT
    wait
EOF
```

**Pros**:

- Single command for complex workflows
- Documented tasks
- Easy to remember

**Cons**:

- Another tool to learn
- Not as flexible as scripts

---

## Best Practices

### 1. **Work Isolation Strategy**

```bash
# Each feature = one branch
feature/plywood-optimization    → plywood-splicing.ts only
feature/klimp-spacing           → klimp-calculator.ts only
feature/ui-theme                → ThemeProvider.tsx, ThemeToggle.tsx only

# Avoid:
feature/multiple-changes        → nx-generator.ts, page.tsx, CrateVisualizer.tsx [X]
```

### 2. **Communication Protocol**

Before starting ANY work:

```bash
# 1. Check what's active
cat PROJECT_STATUS.md | head -30

# 2. Claim your work
# Edit PROJECT_STATUS.md → Add to "Active Work"

# 3. Create branch
git checkout -b feature/YOUR_FEATURE

# 4. Work in isolation
# Don't touch files marked as "In Progress" by others
```

### 3. **Sync Strategy**

```bash
# Sync with main regularly (every hour or after major commits)
git checkout main
git pull origin main
git checkout feature/YOUR_FEATURE
git rebase main

# Or use merge if you prefer
git merge main
```

### 4. **Testing Strategy**

```bash
# Terminal 1: Watch tests for your module
npm test -- --watch plywood-splicing.test.ts

# Terminal 2: Run full suite before merging
npm run test:all

# Terminal 3: E2E tests before PR
npm run test:e2e
```

### 5. **Commit Frequency**

```bash
# Commit often (every 15-30 minutes)
git add src/lib/plywood-splicing.ts
git commit -m "feat(plywood): add custom sheet size support"
git push origin feature/plywood-optimization

# Why: Easy to revert, others can see progress, checkpoint for context
```

---

## Recommended Setup for Your Use Case

Based on your Antimony Workspace + Docker setup, I recommend:

### **Best Option: Tmux + Multiple Claude Code Sessions**

```bash
# Setup (once)
tmux new-session -s autocrate

# Layout:
# ┌──────────────────────┬──────────────────────┐
# │  Feature A           │  Feature B           │
# │  (Claude Code)       │  (Claude Code)       │
# │  branch: feat-A      │  branch: feat-B      │
# ├──────────────────────┴──────────────────────┤
# │  Docker logs (main branch)                  │
# ├──────────────────────┬──────────────────────┤
# │  Test runner (watch) │  Status monitor      │
# └──────────────────────┴──────────────────────┘

# Use it:
1. Pane 1: git checkout -b feature/A && claude code
2. Pane 2: git checkout -b feature/B && claude code
3. Pane 3: cd ../container && docker compose up
4. Pane 4: npm test:watch
5. Pane 5: watch -n 10 './scripts/parallel-work.sh'
```

This gives you:

- [DONE] Multiple Claude Code sessions (parallel AI work)
- [DONE] Persistent sessions (survive SSH disconnects)
- [DONE] Live Docker logs
- [DONE] Auto-running tests
- [DONE] Status monitoring
- [DONE] Pure terminal (works in your environment)

Would you like me to create the tmux session script and helper tools for this workflow?
