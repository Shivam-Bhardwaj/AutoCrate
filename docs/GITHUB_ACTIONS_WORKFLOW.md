# GitHub Actions Workflow Guide

## Overview

AutoCrate uses **minimal GitHub Actions** to automate the development workflow. You only need to provide a GitHub issue link, and the system handles the rest.

## Quick Start

**Just provide a GitHub issue URL:**

```
https://github.com/Shivam-Bhardwaj/AutoCrate/issues/124
```

The system will:

1. Extract issue number
2. Create worktree and branch automatically
3. Set up development environment
4. Run GitHub Actions checks on PR

## Workflows

### 1. Issue Setup (`issue-setup.yml`)

**Purpose**: Automatically create branch for an issue

**Triggers**:

- Manual workflow dispatch (Actions tab → "Issue Setup Automation" → Run workflow)
- Issue labeled with "ready"

**What it does**:

- Creates branch `sbl-<issue-number>` from main
- Comments on issue with branch info
- Ready for development

**Usage**:

```bash
# Via GitHub UI:
# Actions → Issue Setup Automation → Run workflow → Enter issue number

# Or label issue with "ready" label
```

### 2. PR Checks (`pr-checks.yml`)

**Purpose**: Validate PRs before merge

**Triggers**: PR opened, updated, or reopened

**Checks**:

- ✅ Version bump validation (must differ from main)
- ✅ TypeScript type check
- ✅ ESLint
- ✅ Unit tests
- ✅ Production build

**Actions**:

- Comments on PR if version not bumped
- Fails if checks don't pass

### 3. CI (`ci.yml`)

**Purpose**: Fast feedback on all branches

**Triggers**:

- Push to `main`, `sbl-*`, `feature/*` branches
- Pull requests

**Checks**:

- Type check
- Lint
- Tests
- Build

**Timeout**: 15 minutes (minimal, fast feedback)

### 4. Auto Merge (`auto-merge.yml`)

**Purpose**: Automatically merge PRs after checks pass

**Triggers**: PR ready for review

**Requirements**:

- PR must have "auto-merge" label
- All checks must pass
- PR must not be draft

**Action**: Merges PR using squash merge

## Workflow Example

### Step 1: User Provides Issue Link

```
https://github.com/Shivam-Bhardwaj/AutoCrate/issues/124
```

### Step 2: Process Issue (Local)

```bash
./scripts/process-issue-link.sh https://github.com/Shivam-Bhardwaj/AutoCrate/issues/124
# Creates: issues/124/ with branch sbl-124
```

### Step 3: Work on Issue

```bash
cd issues/124
# Make changes
npm test
npm run build
npm run version:patch
npm run version:sync
# Update CHANGELOG.md
git add .
git commit -m "fix: description

Version: 13.3.2
Closes #124"
git push origin sbl-124
```

### Step 4: Create PR

```bash
gh pr create --title "Fix: Issue #124" --body "Closes #124" --base main
```

### Step 5: GitHub Actions Run Automatically

1. **CI workflow** runs (type check, lint, tests, build)
2. **PR Checks workflow** validates version bump
3. If all pass ✅ → Ready for merge
4. If version not bumped → Comment added to PR

### Step 6: Merge

**Option A**: Manual merge after review
**Option B**: Add "auto-merge" label → Auto-merges when checks pass

## Configuration

### Required Secrets

None! All workflows use `GITHUB_TOKEN` (automatically provided).

### Branch Protection (Optional)

To enable branch protection on `main`:

1. Settings → Branches → Add rule
2. Require PR reviews
3. Require status checks to pass:
   - `build-and-test` (from ci.yml)
   - `validate-pr` (from pr-checks.yml)

## Troubleshooting

### Workflow Not Running

- Check Actions tab for errors
- Verify workflow file syntax (YAML)
- Check branch names match patterns

### Version Check Failing

- Ensure version in `package.json` differs from main
- Run `npm run version:sync` after bumping
- Check PR checks workflow logs

### Auto Merge Not Working

- Verify PR has "auto-merge" label
- Check all checks passed
- Ensure PR is not draft
- Check auto-merge workflow logs

## Best Practices

1. **Always provide issue link** - enables automated setup
2. **Version bump required** - PR checks enforce this
3. **Test before push** - CI runs automatically but catch issues early
4. **Use auto-merge label** - for trusted changes
5. **Review PR checks** - GitHub Actions provides feedback

## Files

- `.github/workflows/issue-setup.yml` - Issue branch creation
- `.github/workflows/pr-checks.yml` - PR validation
- `.github/workflows/ci.yml` - Continuous integration
- `.github/workflows/auto-merge.yml` - Auto merge
- `scripts/process-issue-link.sh` - Local issue processing
