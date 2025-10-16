# Quick Start: Parallel Development

**Goal**: Work on multiple features simultaneously without conflicts.

## [LAUNCH] Fastest Way to Start (Recommended)

### Option A: Tmux (Terminal-based)

```bash
# One command to set up everything:
cd /home/curious/workspace/projects/AutoCrate/repo
./scripts/tmux-autocrate.sh

# Then attach:
tmux attach -t autocrate
```

**You get**:

- 5 panes ready for parallel work
- Feature A workspace (top-left)
- Feature B workspace (top-right)
- Docker logs (middle)
- Test runner (bottom-left)
- Status monitor (bottom-right)

**Start working**:

```bash
# In Pane 0 (Feature A):
git checkout -b feature/plywood-optimization
claude code
# Tell Claude: "Improve plywood optimization to support custom sheet sizes"

# In Pane 1 (Feature B):
git checkout -b feature/klimp-spacing
claude code
# Tell Claude: "Adjust klimp spacing to allow 0.5 inch increments"

# In Pane 2 (Docker):
docker compose up

# In Pane 3 (Tests):
npm test:watch
```

**Navigate tmux**:

- `Alt + Arrow keys` - Move between panes
- `Ctrl+a z` - Zoom current pane (fullscreen)
- `Ctrl+a d` - Detach (keeps running in background)
- `tmux attach -t autocrate` - Reattach anytime

---

### Option B: Make Commands (Simple)

```bash
cd /home/curious/workspace/projects/AutoCrate/repo

# See all commands:
make help

# Start everything in parallel:
make parallel-dev
# This runs: dev server + test watcher + docker containers

# In separate terminals:
# Terminal 1: Feature A
make new-feature NAME=plywood-optimization
claude code

# Terminal 2: Feature B
make new-feature NAME=klimp-spacing
claude code
```

---

### Option C: VS Code Remote Containers (GUI)

```bash
# 1. Install VS Code with Remote-Containers extension
# 2. Open project:
code /home/curious/workspace/projects/AutoCrate/repo

# 3. When prompted, click "Reopen in Container"
# 4. Open multiple VS Code windows for parallel features
```

---

## 📋 Workflow Example

**Scenario**: You want to work on 2 features at once

### Step 1: Check what's safe to work on

```bash
cd /home/curious/workspace/projects/AutoCrate/repo
cat MODULES.md | grep -A 3 "plywood-splicing"
# Output: [DONE] SAFE for parallel work

cat MODULES.md | grep -A 3 "klimp-calculator"
# Output: [DONE] SAFE for parallel work
```

### Step 2: Claim your work

Edit `PROJECT_STATUS.md`:

```markdown
### [SYNC] Active Work (In Progress)

- **plywood-splicing.ts** - Add custom sheet size support
  - Worker: Claude-Session-A
  - Started: 2025-10-08 15:00
  - Status: Adding validation for custom dimensions
  - Expected completion: 2025-10-08 16:00

- **klimp-calculator.ts** - Improve spacing increments
  - Worker: Claude-Session-B
  - Started: 2025-10-08 15:00
  - Status: Adjusting spacing algorithm
  - Expected completion: 2025-10-08 16:00
```

### Step 3: Work in parallel

**Terminal 1 (or tmux pane 0)**:

```bash
git checkout -b feature/plywood-custom-sizes
claude code
# Work on plywood-splicing.ts
npm test -- plywood-splicing.test.ts
```

**Terminal 2 (or tmux pane 1)**:

```bash
git checkout -b feature/klimp-spacing
claude code
# Work on klimp-calculator.ts
npm test -- klimp-calculator.test.ts
```

### Step 4: Monitor progress

**Terminal 3** (or use `make work-status`):

```bash
# Watch status
watch -n 10 './scripts/parallel-work.sh'

# Or manually:
git log --all --oneline --graph -10
```

### Step 5: Complete and merge

When Feature A is done:

```bash
# Run full tests
npm run test:all

# Update work log
# Edit WORK_LOG.md (add entry at top)

# Update status
# Edit PROJECT_STATUS.md (move to Completed)

# Merge to main
git checkout main
git merge feature/plywood-custom-sizes
git push origin main
```

When Feature B is done (same process).

---

## [TARGET] Common Scenarios

### Scenario 1: "I want to work on 3 features at once"

```bash
# Use tmux with 3 panes for features:
tmux new-session -s autocrate

# Create 3 vertical panes
tmux split-window -h
tmux split-window -h

# In each pane:
# Pane 0: git checkout -b feature/A && claude code
# Pane 1: git checkout -b feature/B && claude code
# Pane 2: git checkout -b feature/C && claude code
```

### Scenario 2: "How do I know if I'll conflict with other work?"

```bash
# Check PROJECT_STATUS.md
cat PROJECT_STATUS.md | head -30

# Check MODULES.md for your module
grep "your-module-name" MODULES.md

# If marked [DONE] SAFE and not in Active Work → Go ahead!
# If marked [WARNING] CAUTION → Coordinate via PROJECT_STATUS.md
# If marked [AVOID] AVOID → Don't work on it in parallel
```

### Scenario 3: "I need to switch between features quickly"

```bash
# Use git worktrees (advanced):
git worktree add ../autocrate-feature-A feature/A
git worktree add ../autocrate-feature-B feature/B

# Now you have 3 directories:
# repo/           → main branch
# autocrate-feature-A/  → feature/A
# autocrate-feature-B/  → feature/B

# Work in each directory independently!
```

### Scenario 4: "Tests keep failing, how do I isolate?"

```bash
# Terminal 1: Watch only Feature A tests
npm test -- --watch plywood-splicing.test.ts

# Terminal 2: Watch only Feature B tests
npm test -- --watch klimp-calculator.test.ts

# Terminal 3: Run full suite before merging
npm run test:all
```

---

## 🛠️ Useful Commands Reference

### Git Operations

```bash
# Create feature branch
git checkout -b feature/NAME

# See all branches
git branch -v

# Switch branches
git checkout BRANCH_NAME

# Sync with main
git checkout main && git pull
git checkout feature/NAME && git rebase main

# Delete branch after merge
git branch -d feature/NAME
```

### Testing

```bash
# Watch all tests
npm test:watch

# Watch specific test
npm test -- --watch MODULE.test.ts

# Run specific test pattern
npm test -- --testNamePattern="should calculate"

# Full test suite
npm run test:all
```

### Status Checks

```bash
# Current work status
make work-status
# or
./scripts/parallel-work.sh

# Git status across branches
git log --all --oneline --graph -10

# See what changed
git diff main
```

### Tmux Operations

```bash
# Create session
tmux new -s autocrate

# List sessions
tmux ls

# Attach to session
tmux attach -t autocrate

# Kill session
tmux kill-session -t autocrate

# Inside tmux:
Ctrl+a |    # Split vertical
Ctrl+a -    # Split horizontal
Ctrl+a z    # Zoom pane
Ctrl+a d    # Detach
Alt+Arrow   # Navigate panes
```

---

## [FAST] Pro Tips

1. **Use tmux for persistence**: Your work survives SSH disconnects
2. **Commit often**: Every 15-30 minutes, easy to revert
3. **Test continuously**: `npm test:watch` catches issues early
4. **Update PROJECT_STATUS.md**: Communication is key
5. **Keep branches focused**: One feature per branch
6. **Sync regularly**: Rebase from main every hour
7. **Use Make**: `make help` shows all shortcuts

---

## 🚨 Troubleshooting

### "Tmux session already exists"

```bash
# Attach to it:
tmux attach -t autocrate

# Or kill and recreate:
tmux kill-session -t autocrate
./scripts/tmux-autocrate.sh
```

### "Port 3000 already in use"

```bash
# Find what's using it:
lsof -i :3000

# Kill it:
kill -9 <PID>

# Or use different port:
PORT=3001 npm run dev
```

### "Git conflicts when rebasing"

```bash
# Abort rebase
git rebase --abort

# Sync differently:
git merge main  # Use merge instead of rebase
```

### "Tests failing in parallel"

```bash
# Run tests serially:
npm test -- --maxWorkers=1

# Or isolate:
npm test -- MODULE.test.ts
```

---

## 📚 Next Steps

1. Read `PARALLEL_WORKFLOW.md` for detailed explanations
2. Check `MODULES.md` to understand module boundaries
3. Review `PROJECT_STATUS.md` before starting work
4. Log your work in `WORK_LOG.md` when done

**Start now**:

```bash
./scripts/tmux-autocrate.sh && tmux attach -t autocrate
```
