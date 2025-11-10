# How to Use Multiple LLMs on AutoCrate

## Quick Start

### Starting Claude Code on Issue #124

```bash
ssh your-machine
cd /path/to/AutoCrate/repo
./scripts/work-on-issue.sh 124 claude
```

This will:

1. Create/open worktree in `issues/124/`
2. Show context information
3. Launch Claude Code
4. Display a prompt to paste to Claude

**When Claude starts**, it will see the context and can begin with:

```
cat .issue-context.md
```

### Starting Codex on Issue #147 (Simultaneously!)

```bash
# In a different terminal
ssh your-machine
cd /path/to/AutoCrate/repo
./scripts/work-on-issue.sh 147 codex
```

**When Codex starts**, paste this:

```
Read LLM_ONBOARDING.md for complete instructions.

CRITICAL: You are in an isolated worktree.
- Directory: issues/147/
- Branch: sbl-147
- DON'T navigate to ../repo/ or other directories
- DON'T switch branches

Start by reading: cat .issue-context.md
```

## Complete Workflow Example

### Scenario: 3 Issues, 2 LLMs

**You want:**

- Claude to fix issue #124 (reset view bug)
- Codex to fix issue #147 (change tracker)
- Claude to add feature #151 (new export format)

**Terminal 1 - Claude on #124:**

```bash
cd /path/to/AutoCrate/repo
./scripts/work-on-issue.sh 124 claude
```

**Terminal 2 - Codex on #147:**

```bash
cd /path/to/AutoCrate/repo
./scripts/work-on-issue.sh 147 codex
# Paste the onboarding prompt when Codex starts
```

**Terminal 3 - Claude on #151:**

```bash
cd /path/to/AutoCrate/repo
./scripts/work-on-issue.sh 151 claude
```

All three work simultaneously with **zero conflicts**!

## What to Tell Codex (or any LLM)

### Option 1: Paste this at session start

```
Read LLM_ONBOARDING.md immediately. You are in an isolated worktree for one specific issue.

DO:
- Stay in issues/[NUMBER]/ directory
- Work on branch sbl-[NUMBER]
- Read .issue-context.md first

DON'T:
- Navigate to ../repo/ or other directories
- Switch branches
- Modify files outside your worktree

Start: cat .issue-context.md
```

### Option 2: Have Codex read the onboarding doc

```
Before starting any work, read and fully understand LLM_ONBOARDING.md.
Then read .issue-context.md to understand your assigned issue.
```

### Option 3: Use the starter prompt file

```
Read CODEX_STARTER_PROMPT.txt and follow all instructions there.
Then read .issue-context.md.
```

## How They Know Where They Are

Both Claude and Codex should immediately run:

```bash
pwd
git branch --show-current
cat .issue-context.md
```

**Expected output for issue #124:**

```
/path/to/AutoCrate/issues/124
sbl-124
[Issue details...]
```

## Monitoring Multiple LLMs

### Check what each is doing

**Terminal 1 (monitoring):**

```bash
# Watch Claude's work on #124
watch -n 5 "cd /path/to/AutoCrate/issues/124 && git status --short"
```

**Terminal 2 (monitoring):**

```bash
# Watch Codex's work on #147
watch -n 5 "cd /path/to/AutoCrate/issues/147 && git status --short"
```

### See all active worktrees

```bash
cd /path/to/AutoCrate/repo
git worktree list
```

## Complete File Guide for Explaining to LLMs

| File                       | Purpose            | When to Use                       |
| -------------------------- | ------------------ | --------------------------------- |
| `LLM_ONBOARDING.md`        | Complete guide     | Always have them read this first  |
| `CODEX_STARTER_PROMPT.txt` | Quick paste prompt | Copy-paste when starting Codex    |
| `WORKTREE_WORKFLOW.md`     | Technical details  | If they need deeper understanding |
| `CLAUDE.md`                | Development guide  | For general project info          |
| `.issue-context.md`        | Issue details      | Auto-generated in each worktree   |

## Common Questions

### Q: Codex keeps trying to navigate to other directories

**A:** Paste this firmly:

```
STOP. You are in an ISOLATED WORKSPACE.
Run: pwd
You must STAY in issues/[NUMBER]/.
DO NOT run: cd ../ or cd ../repo/ or cd ../issues/
ALL your work happens in your current directory only.
```

### Q: How do I know both are working correctly?

**A:** Check their branches:

```bash
# What Claude is working on
cd issues/124 && git branch --show-current  # Should show: sbl-124

# What Codex is working on
cd issues/147 && git branch --show-current  # Should show: sbl-147

# List all worktrees
git worktree list
```

### Q: Can they work on the same issue?

**A:** No, each issue should have only ONE LLM working on it. If you want multiple LLMs to collaborate, have them work on different aspects in different issues, then manually merge.

### Q: What if one finishes before the other?

**A:** They can create their PRs independently:

```bash
# In issues/124/
gh pr create --title "Fix: Reset view bug" --body "Closes #124" --base main

# In issues/147/
gh pr create --title "Fix: Change tracker" --body "Closes #147" --base main
```

Both PRs can be reviewed and merged independently.

## Cleaning Up After Work

### When PR is merged for issue #124

```bash
cd /path/to/AutoCrate/repo

# Remove worktree
git worktree remove issues/124

# Delete local branch
git branch -d sbl-124

# Delete remote branch (if not auto-deleted by GitHub)
git push origin --delete sbl-124
```

### Clean up all merged worktrees

```bash
cd /path/to/AutoCrate/repo

# See what's merged
git branch --merged main

# Prune stale worktrees
git worktree prune
```

## Architecture Diagram

```
Your Machine
├── Terminal 1: ssh → claude → issues/124/ → sbl-124
├── Terminal 2: ssh → codex → issues/147/ → sbl-147
└── Terminal 3: ssh → claude → issues/151/ → sbl-151

Each terminal:
- Isolated workspace
- Own branch
- Own changes
- No conflicts!
```

## Scripts Reference

| Script                | Purpose                      | Example                                 |
| --------------------- | ---------------------------- | --------------------------------------- |
| `worktree-issue.sh`   | Create worktree only         | `./scripts/worktree-issue.sh 124`       |
| `work-on-issue.sh`    | Create worktree + launch LLM | `./scripts/work-on-issue.sh 124 claude` |
| `show-llm-context.sh` | Display context info         | `./scripts/show-llm-context.sh`         |

## Best Practices

1. **Always use the scripts** - Don't manually create worktrees
2. **One issue per LLM** - Don't have multiple LLMs on same issue
3. **Monitor their work** - Check git status occasionally
4. **Clean up after merge** - Remove worktrees when done
5. **Keep main updated** - `git fetch` regularly in repo/

## Troubleshooting

### LLM is in wrong directory

**Symptom:** `pwd` shows `/path/to/AutoCrate/repo` instead of `issues/124/`

**Fix:**

```bash
# Exit the LLM session
exit

# Restart properly
./scripts/work-on-issue.sh 124 claude
```

### LLM switched branches

**Symptom:** `git branch --show-current` shows `main` instead of `sbl-124`

**Fix:** Tell the LLM:

```
You switched branches incorrectly. Run:
git checkout sbl-[YOUR_ISSUE_NUMBER]

And never switch branches again. Stay on your assigned branch.
```

### LLM wants to push but branch doesn't exist on remote

**Fix:** First push creates the remote branch:

```bash
git push -u origin sbl-124
```

## Success Indicators

✅ **Working correctly:**

- `pwd` shows `issues/[NUMBER]/`
- `git branch --show-current` shows `sbl-[NUMBER]`
- Each LLM only modifies files in their worktree
- PRs created from different branches

❌ **Something wrong:**

- LLM navigates to `../repo/` or other directories
- LLM switches branches
- Conflicts between LLMs
- Changes appearing in wrong worktrees

## Summary

The key to explaining to Codex (or any LLM):

1. **They are in a sandbox** - `issues/[NUMBER]/` is their playground
2. **They must stay there** - No `cd ../` ever
3. **They have their own branch** - `sbl-[NUMBER]`
4. **They work independently** - Other LLMs exist but are isolated

It's like giving each LLM their own copy of the repository to play with, but all copies share the same Git history under the hood.
