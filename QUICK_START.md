# AutoCrate Multi-LLM Quick Start

## 🎯 Goal
Run multiple LLMs (Claude Code, OpenAI Codex, etc.) working on different issues simultaneously without conflicts.

## 📋 The Complete Workflow

### 1️⃣ Check What Needs Doing
```bash
cd /path/to/AutoCrate/repo
gh issue list --state open
```

### 2️⃣ Assign Tasks
```bash
# Assign issue #119 to Claude
./scripts/assign-issue.sh 119 claude

# Assign issue #128 to Codex
./scripts/assign-issue.sh 128 codex

# Assign issue #140 to Claude (sequential work)
./scripts/assign-issue.sh 140 claude
```

### 3️⃣ View Assignments
```bash
./scripts/assign-issue.sh --list
```

Output:
```
Issue #119
  Assigned to: claude
  Status: OPEN | ✗ No worktree

Issue #128
  Assigned to: codex
  Status: OPEN | ✗ No worktree
```

### 4️⃣ Launch the LLMs

**Terminal 1 - Claude on #119:**
```bash
ssh your-machine
cd /path/to/AutoCrate/repo
./scripts/work-on-issue.sh 119 claude
```

**Terminal 2 - Codex on #128:**
```bash
ssh your-machine
cd /path/to/AutoCrate/repo
./scripts/work-on-issue.sh 128 codex
```

When each LLM starts, paste:
```
Read LLM_ONBOARDING.md for complete instructions.

CRITICAL: You are in an isolated worktree.
- Stay in issues/[NUMBER]/ directory
- Don't navigate to ../repo/ or other directories
- Don't switch branches

Start by reading: cat .issue-context.md
```

### 5️⃣ They Work Independently

```
Claude in issues/119/           Codex in issues/128/
├── Reads .issue-context.md    ├── Reads .issue-context.md
├── Makes changes               ├── Makes changes
├── Runs tests                  ├── Runs tests
├── Commits to sbl-119          ├── Commits to sbl-128
└── Creates PR                  └── Creates PR

No conflicts! ✨
```

### 6️⃣ Clean Up When Done

```bash
# Free assignments
./scripts/assign-issue.sh --free 119
./scripts/assign-issue.sh --free 128

# Remove worktrees
./scripts/cleanup-worktrees.sh

# Or all in one
./scripts/cleanup-worktrees.sh 119 128
```

## ⚡ Super Quick Version

**Assign and launch in one command:**

```bash
# Terminal 1
./scripts/assign-issue.sh 119 claude --start

# Terminal 2
./scripts/assign-issue.sh 128 codex --start
```

Done! Both LLMs are now working.

## 📊 Monitor Progress

```bash
# See assignments
./scripts/assign-issue.sh --list

# See active worktrees
git worktree list

# Update status
./scripts/assign-issue.sh --status 119 "in-progress"
./scripts/assign-issue.sh --status 128 "testing"
```

## 🗂️ File Structure

```
AutoCrate/
├── repo/                      # Main worktree (you work here)
│   ├── scripts/
│   │   ├── assign-issue.sh    # ← Assign tasks
│   │   ├── work-on-issue.sh   # ← Launch LLM
│   │   └── cleanup-worktrees.sh
│   └── .issue-assignments.json # ← Tracks assignments (local)
│
├── issues/                    # LLM worktrees (isolated)
│   ├── 119/                   # Claude working here
│   │   ├── .issue-context.md
│   │   └── ... (full project)
│   └── 128/                   # Codex working here
│       ├── .issue-context.md
│       └── ... (full project)
```

## 📚 Documentation Guide

| File | What It's For |
|------|---------------|
| **QUICK_START.md** (this file) | Quick reference |
| **ASSIGNING_TASKS.md** | Detailed assignment guide |
| **HOW_TO_USE_MULTI_LLM.md** | Complete multi-LLM guide |
| **LLM_ONBOARDING.md** | For the LLMs to read |
| **WORKTREE_WORKFLOW.md** | Technical worktree details |
| **WORKTREE_CLEANUP.md** | Cleanup instructions |
| **CLAUDE.md** | Project development guide |

## 💡 Best Practices

### ✅ DO
- Assign issues before launching
- Use `--list` to see current assignments
- Free assignments when done
- Clean up worktrees regularly
- One issue per LLM at a time

### ❌ DON'T
- Assign same issue to multiple LLMs
- Launch without assigning
- Forget to clean up
- Work in the main `repo/` when LLMs are active

## 🎬 Example Session

```bash
# Morning planning
cd /path/to/AutoCrate/repo
gh issue list --state open
./scripts/assign-issue.sh 119 claude
./scripts/assign-issue.sh 128 codex
./scripts/assign-issue.sh --list

# Launch Terminal 1: Claude on #119
./scripts/work-on-issue.sh 119 claude

# Launch Terminal 2: Codex on #128
./scripts/work-on-issue.sh 128 codex

# Evening cleanup
./scripts/assign-issue.sh --free 119
./scripts/assign-issue.sh --free 128
./scripts/cleanup-worktrees.sh
```

## 🆘 Troubleshooting

### Problem: "Which issue should I work on?"
**Solution:** Run `./scripts/assign-issue.sh --list` to see assignments

### Problem: LLM is in wrong directory
**Solution:** It didn't follow instructions. Restart with `work-on-issue.sh`

### Problem: Can't remember what's assigned
**Solution:** `./scripts/assign-issue.sh --list` shows everything

### Problem: Forgot to assign before launching
**Solution:** Just assign it now: `./scripts/assign-issue.sh 119 claude`

## 🎯 Success Criteria

You're doing it right when:
- ✅ Each LLM has a different issue number
- ✅ Each LLM is in `issues/[DIFFERENT-NUMBER]/`
- ✅ No merge conflicts
- ✅ Both can commit and push independently
- ✅ PRs are created from different branches

## 🚀 Ready to Start!

**Pick a method:**

**Method 1 - Manual (More Control):**
```bash
./scripts/assign-issue.sh 119 claude
./scripts/work-on-issue.sh 119 claude
```

**Method 2 - Automatic (Fastest):**
```bash
./scripts/assign-issue.sh 119 claude --start
```

**Method 3 - Plan Everything First:**
```bash
./scripts/assign-issue.sh 119 claude
./scripts/assign-issue.sh 128 codex
./scripts/assign-issue.sh 140 claude
./scripts/assign-issue.sh --list
# Then launch when ready
```

**Choose your adventure and go! 🎮**

---

**Questions?**
- Read **ASSIGNING_TASKS.md** for detailed assignment guide
- Read **HOW_TO_USE_MULTI_LLM.md** for multi-LLM examples
- Read **LLM_ONBOARDING.md** to understand LLM perspective
