# AutoCrate Quick Start Guide

## 🚀 For New Claude Code Sessions

### Starting Work on an Issue

```bash
# Method 1: Direct issue number
./scripts/claude-quick-start.sh 77

# Method 2: Using issue workflow directly
./scripts/issue-workflow.sh 77

# Method 3: GitHub URL
./scripts/issue-workflow.sh https://github.com/Shivam-Bhardwaj/AutoCrate/issues/77
```

This will:
1. Fetch issue details from GitHub
2. Create a feature branch
3. Generate `.issue-context-77.md` with all details
4. Open relevant files based on issue labels
5. Provide ready commands for testing and PR creation

### Quick File Access

```bash
# Open core files (90% of work happens here)
./scripts/multi-file-helper.sh core
# Opens: page.tsx, nx-generator.ts, CrateVisualizer.tsx, PROJECT_DNA.md

# Search for something
./scripts/multi-file-helper.sh search "PMI"

# Find all TODOs
./scripts/multi-file-helper.sh todo

# View project status
./scripts/multi-file-helper.sh status
```

## 📝 Essential Reading Order

1. **PROJECT_DNA.md** - ALWAYS read first (saves 50-100K tokens)
2. **Issue context file** - `.issue-context-XX.md` (if working on issue)
3. **Only the specific files you need** - Use grep to find exact locations

## 🎯 Common Tasks

### Fix a Bug
```bash
# 1. Start with issue
./scripts/claude-quick-start.sh [issue-number]

# 2. Read context
Read PROJECT_DNA.md
Read .issue-context-[number].md

# 3. Find the bug location
grep -n "error keyword" src/

# 4. Fix, test, commit
npm test
git commit -m "fix: Description (#issue)"
gh pr create
```

### Add a Feature
```bash
# 1. Setup workspace
./scripts/issue-workflow.sh [issue-number]

# 2. Open relevant files
./scripts/multi-file-helper.sh core  # or ui, lib, etc.

# 3. Implement with TDD
# Write tests first
# Implement feature
# Run tests

# 4. Create PR
gh pr create --title "feat: Title" --body "Closes #issue"
```

### Quick Research
```bash
# Find where something is implemented
./scripts/multi-file-helper.sh search "pattern"

# Open related files
./scripts/multi-file-helper.sh [core|ui|lib|hardware|step]

# Check recent changes
git log --oneline -10
```

## 🔧 Project Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests
npm run build            # Production build

# Git workflow
git status               # Check changes
git add .                # Stage changes
git commit -m "type: description"  # Commit
git push origin [branch] # Push changes
gh pr create             # Create pull request

# Version management
npm run version:patch    # Bug fix (13.1.0 → 13.1.1)
npm run version:minor    # Feature (13.1.0 → 13.2.0)
npm run version:major    # Breaking (13.1.0 → 14.0.0)
```

## 💡 Pro Tips

1. **Always use TodoWrite tool** for tracking multiple tasks
2. **Read PROJECT_DNA.md first** - contains all gotchas and patterns
3. **Use grep before reading files** - find exact line numbers
4. **Commit with --no-verify** if tests are failing due to unrelated issues
5. **Use multi-file-helper** to quickly access related files

## 🚨 Known Test Failures (Pre-existing)

These tests are expected to fail (not your problem):
- `security.test.ts` - 5 failures (rate limiting, bcrypt)
- `nx-export/route.test.ts` - 4 failures (headers mocking)
- `calculate-crate/route.test.ts` - 3 failures (headers mocking)

## 📁 Key Files

- **PROJECT_DNA.md** - Essential knowledge (READ FIRST)
- **src/app/page.tsx** - Main UI and state
- **src/lib/nx-generator.ts** - Core calculations
- **src/components/CrateVisualizer.tsx** - 3D visualization

## 🔄 Workflow Summary

```bash
# Start session
./scripts/claude-quick-start.sh [issue-number]

# Work on issue
Read PROJECT_DNA.md
Make changes
npm test

# Finish work
git commit -m "type: description (#issue)"
gh pr create --title "Type: Title" --body "Closes #issue"

# Clean up
git checkout main
git pull origin main
```

## 🆘 Help

- **Scripts not working?** → `chmod +x scripts/*.sh`
- **Can't fetch issues?** → `gh auth login`
- **Tests failing?** → Check "Known Test Failures" above
- **Need context?** → Read PROJECT_DNA.md

---

**Remember**: This project is production-ready and actively used. Always test your changes!