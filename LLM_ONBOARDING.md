# LLM Onboarding Guide - AutoCrate Project

**For: Claude Code, OpenAI Codex, or any AI coding assistant**

## Important: You Are in an Isolated Workspace

This project uses **git worktrees** to allow multiple AI assistants to work simultaneously without conflicts.

### Current Environment

Check where you are:
```bash
pwd
git branch --show-current
```

**Expected output:**
- Directory: `/path/to/AutoCrate/issues/[NUMBER]/`
- Branch: `sbl-[NUMBER]` (e.g., `sbl-124`)

### Key Rules

1. ✅ **DO**: Work in your assigned issue directory (`issues/[NUMBER]/`)
2. ✅ **DO**: Only modify files in your current worktree
3. ✅ **DO**: Commit and push to your branch (`sbl-[NUMBER]`)
4. ❌ **DON'T**: Navigate to or modify files in other `issues/*/` directories
5. ❌ **DON'T**: Navigate to or modify files in `repo/` or `../` directories
6. ❌ **DON'T**: Switch branches - stay on your assigned branch

### Your Workflow

1. **Read the issue context:**
   ```bash
   cat .issue-context.md
   ```

2. **Make your changes** (only in current directory)

3. **Test your changes:**
   ```bash
   npm test
   npm run build
   ```

4. **Commit:**
   ```bash
   git add .
   git commit -m "fix: your commit message (#[ISSUE_NUMBER])"
   ```

5. **Push:**
   ```bash
   git push origin sbl-[NUMBER]
   ```

6. **Create PR:**
   ```bash
   gh pr create --title "Fix: Issue #[NUMBER]" --body "Closes #[NUMBER]" --base main
   ```

### What Are Worktrees?

Think of worktrees like parallel universes of the same repository:

```
AutoCrate/
├── repo/              # Main universe (main branch)
├── issues/124/        # Universe for issue #124 (sbl-124 branch)
├── issues/147/        # Universe for issue #147 (sbl-147 branch)
└── issues/151/        # Universe for issue #151 (sbl-151 branch)
```

- Each directory has the **full project** with all files
- Each has its **own branch**
- Changes in one **don't affect others**
- All share the **same git history**

### Example: Multiple LLMs Working Simultaneously

**Claude Code in issues/124/:**
```bash
pwd  # /path/to/AutoCrate/issues/124
git branch --show-current  # sbl-124
# Working on reset view bug
```

**Codex in issues/147/:**
```bash
pwd  # /path/to/AutoCrate/issues/147
git branch --show-current  # sbl-147
# Working on change tracker
```

**No conflicts!** Each has their own workspace and branch.

### Quick Reference

| Command | Purpose |
|---------|---------|
| `pwd` | Check your location |
| `git branch --show-current` | Check your branch |
| `cat .issue-context.md` | Read issue details |
| `git status` | See your changes |
| `git worktree list` | See all worktrees (from repo/) |
| `npm test` | Run tests |
| `npm run build` | Build project |

### Common Mistakes to Avoid

❌ **Wrong: Navigating to repo/**
```bash
cd ../repo  # DON'T DO THIS
```

❌ **Wrong: Navigating to another issue**
```bash
cd ../147  # DON'T DO THIS
```

❌ **Wrong: Switching branches**
```bash
git checkout main  # DON'T DO THIS
```

✅ **Right: Stay in your worktree**
```bash
pwd  # Check you're in /issues/[YOUR_NUMBER]/
# Make changes here
git add .
git commit -m "fix: ..."
git push origin sbl-[YOUR_NUMBER]
```

### If You Get Lost

1. Check where you are:
   ```bash
   pwd
   git branch --show-current
   ```

2. If you're in the wrong place, **stop immediately** and ask the user

3. Never make changes outside your assigned worktree

### Project-Specific Information

- **Language:** TypeScript, React, Next.js 14
- **Test Command:** `npm test`
- **Build Command:** `npm run build`
- **Lint:** `npm run lint`
- **Type Check:** `npm run type-check`

- **Main Source:** `src/` directory
- **Tests:** `src/**/__tests__/` directories
- **Configuration:** All constants in `src/lib/crate-constants.ts`

### Getting Help

- **Development Guide:** Read `CLAUDE.md` in your worktree
- **Worktree Details:** Read `WORKTREE_WORKFLOW.md`
- **Issue Context:** Read `.issue-context.md` in your worktree

### Summary

You are an AI assistant working on **one specific issue** in an **isolated workspace**. Stay in your workspace (`issues/[NUMBER]/`), make changes, test, commit, and push to your branch (`sbl-[NUMBER]`). Don't navigate to other directories or switch branches.

**You have your own sandbox - play in it safely!**
