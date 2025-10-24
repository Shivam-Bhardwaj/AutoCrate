# How to Assign Tasks to LLMs

## Quick Start

### Assign and Launch in One Command

```bash
# Assign issue #119 to Claude and launch immediately
./scripts/assign-issue.sh 119 claude --start

# Assign issue #128 to Codex and launch immediately
./scripts/assign-issue.sh 128 codex --start
```

This will:
1. ✅ Record the assignment
2. ✅ Create the worktree
3. ✅ Launch the LLM

### Just Assign (Don't Launch Yet)

```bash
# Plan assignments first
./scripts/assign-issue.sh 119 claude
./scripts/assign-issue.sh 128 codex
./scripts/assign-issue.sh 140 claude

# Then launch later
./scripts/work-on-issue.sh 119 claude
./scripts/work-on-issue.sh 128 codex
```

## View All Assignments

```bash
./scripts/assign-issue.sh --list
```

**Example output:**
```
═══════════════════════════════════════════════════════
          Current Issue Assignments
═══════════════════════════════════════════════════════

Issue #119
  Assigned to: claude
  Assigned: 2025-10-24T15:49:24+00:00
  Status: OPEN | ✓ Active

Issue #128
  Assigned to: codex
  Assigned: 2025-10-24T15:49:25+00:00
  Status: OPEN | ✓ Active

Issue #140
  Assigned to: claude
  Assigned: 2025-10-24T15:49:25+00:00
  Status: OPEN | ✗ No worktree
```

## Complete Workflow Example

### Scenario: 3 Open Issues, Assign to 2 LLMs

**Step 1: Check available issues**
```bash
gh issue list --state open
```

**Step 2: Assign tasks**
```bash
# Claude handles #119 and #140
./scripts/assign-issue.sh 119 claude
./scripts/assign-issue.sh 140 claude

# Codex handles #128
./scripts/assign-issue.sh 128 codex
```

**Step 3: View assignments**
```bash
./scripts/assign-issue.sh --list
```

**Step 4: Launch LLMs**

**Terminal 1 - Claude on #119:**
```bash
./scripts/work-on-issue.sh 119 claude
```

**Terminal 2 - Codex on #128:**
```bash
./scripts/work-on-issue.sh 128 codex
```

**Terminal 3 - Claude on #140 (after #119 is done):**
```bash
./scripts/work-on-issue.sh 140 claude
```

## Managing Assignments

### Free Up an Issue

When an issue is done:
```bash
./scripts/assign-issue.sh --free 119
```

### Update Status

Track progress:
```bash
# Mark as in progress
./scripts/assign-issue.sh --status 119 "in-progress"

# Mark as testing
./scripts/assign-issue.sh --status 119 "testing"

# Mark as done
./scripts/assign-issue.sh --status 119 "done"
```

### Reassign an Issue

```bash
# Try to assign already-assigned issue
./scripts/assign-issue.sh 119 codex

# It will ask: "Issue #119 is already assigned to claude. Reassign to codex? (y/n)"
```

## Assignment Strategies

### Strategy 1: Load Balancing

Distribute evenly:
```bash
./scripts/assign-issue.sh 119 claude
./scripts/assign-issue.sh 128 codex
./scripts/assign-issue.sh 140 claude
./scripts/assign-issue.sh 147 codex
```

### Strategy 2: By Issue Type

Assign by strengths:
```bash
# Claude: UI/Frontend issues
./scripts/assign-issue.sh 119 claude  # UI bug
./scripts/assign-issue.sh 140 claude  # Frontend feature

# Codex: Backend/API issues
./scripts/assign-issue.sh 128 codex   # API bug
./scripts/assign-issue.sh 147 codex   # Calculation fix
```

### Strategy 3: Sequential

One at a time per LLM:
```bash
# Claude does #119, then #140, then #151
./scripts/assign-issue.sh 119 claude --start
# ... wait for completion ...
./scripts/assign-issue.sh --free 119
./scripts/assign-issue.sh 140 claude --start
```

## Daily Workflow

### Morning: Plan the Day

```bash
# See what's open
gh issue list --state open

# Assign today's work
./scripts/assign-issue.sh 119 claude
./scripts/assign-issue.sh 128 codex
./scripts/assign-issue.sh 140 claude

# View plan
./scripts/assign-issue.sh --list
```

### During Day: Launch Work

```bash
# Terminal 1
./scripts/work-on-issue.sh 119 claude

# Terminal 2
./scripts/work-on-issue.sh 128 codex
```

### Evening: Cleanup

```bash
# Free completed issues
./scripts/assign-issue.sh --free 119
./scripts/assign-issue.sh --free 128

# Clean up worktrees
./scripts/cleanup-worktrees.sh
```

## Command Reference

| Command | Description |
|---------|-------------|
| `assign-issue.sh 119 claude` | Assign issue to LLM |
| `assign-issue.sh 119 claude --start` | Assign and launch |
| `assign-issue.sh --list` | View all assignments |
| `assign-issue.sh --free 119` | Free up issue |
| `assign-issue.sh --status 119 "testing"` | Update status |
| `work-on-issue.sh 119 claude` | Launch LLM on assigned issue |

## Integration with GitHub Issues

### Assign via GitHub Labels

Add labels to issues on GitHub, then assign:

```bash
# Check labels
gh issue view 119 --json labels

# Assign based on labels
if [[ $(gh issue view 119 --json labels -q '.labels[].name' | grep "ui") ]]; then
    ./scripts/assign-issue.sh 119 claude
fi
```

### Sync Assignments to GitHub

Manually add assignee to GitHub:
```bash
gh issue edit 119 --add-assignee @me
```

## Tracking File

Assignments are stored in `.issue-assignments.json`:

```json
{
  "119": {
    "llm": "claude",
    "assigned_at": "2025-10-24T15:49:24+00:00",
    "status": "assigned"
  },
  "128": {
    "llm": "codex",
    "assigned_at": "2025-10-24T15:49:25+00:00",
    "status": "in-progress"
  }
}
```

**Note:** This file is local only (in `.gitignore`)

## Tips

### See Who's Working on What

```bash
./scripts/assign-issue.sh --list | grep "claude"
./scripts/assign-issue.sh --list | grep "codex"
```

### Monitor Active Work

```bash
# Check git status in each worktree
watch -n 10 'git worktree list | grep issues'
```

### Prevent Conflicts

- ✅ **One issue per LLM at a time**
- ✅ **Don't assign same issue to multiple LLMs**
- ✅ **Use `--list` to see current assignments**

### Quick Assignment Board

Create a simple dashboard:
```bash
#!/bin/bash
clear
echo "=== AutoCrate Assignment Board ==="
echo ""
./scripts/assign-issue.sh --list
echo ""
echo "=== Active Worktrees ==="
git worktree list | grep issues
```

## Troubleshooting

### Issue shows "No worktree" but I launched it

The worktree was created in the wrong location. Fix:
```bash
./scripts/worktree-issue.sh 119
```

### Assignment file corrupted

Reset it:
```bash
echo '{}' > .issue-assignments.json
```

### Forgot who's assigned to what

Check anytime:
```bash
./scripts/assign-issue.sh --list
```

## Summary

**To assign tasks:**

1. **Simple:** `./scripts/assign-issue.sh 119 claude --start`
2. **View:** `./scripts/assign-issue.sh --list`
3. **Free:** `./scripts/assign-issue.sh --free 119`

**Best practice:**
- Assign at start of day
- View assignments often
- Free when done
- Clean up worktrees regularly

That's it! Now you can orchestrate multiple LLMs like a conductor. 🎼
