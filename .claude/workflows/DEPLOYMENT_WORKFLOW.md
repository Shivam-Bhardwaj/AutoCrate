# Deployment Workflow

## Overview

This document outlines the change management and deployment workflow for AutoCrate Codex. All changes follow a review-and-deploy process to ensure quality and prevent breaking changes in production.

## Workflow Steps

### 1. Discussion Phase

- User requests changes or new features
- LLM discusses requirements and proposes solutions
- User provides feedback and refinements

### 2. Feature Branch Creation

```bash
git checkout -b feature/<descriptive-name>
```

- All changes are made in a feature branch
- Branch naming convention: `feature/`, `fix/`, or `chore/` prefix

### 3. Implementation

- LLM implements changes in the feature branch
- All changes are tested locally
- Pre-commit hooks ensure code quality

### 4. Commit and Push

```bash
git add .
git commit -m "feat: <description>"
git push -u origin feature/<branch-name>
```

- Commits follow conventional commit format
- All tests must pass before commit

### 5. Preview Deployment

- Pushing to GitHub automatically triggers Vercel preview deployment
- Preview URL is generated for the feature branch
- Access via: `https://<project>-<branch>-<team>.vercel.app`

### 6. Review Process

- User reviews changes in the preview deployment
- Tests all functionality in live environment
- Provides feedback or approval

### 7. Merge to Main (if approved)

```bash
git checkout main
git merge feature/<branch-name>
git push origin main
```

OR create a Pull Request:

- Go to: https://github.com/Shivam-Bhardwaj/AutoCrate/pull/new/<branch-name>
- Review changes
- Merge PR when ready

### 8. Production Deployment

- Merging to main automatically triggers production deployment
- Vercel deploys to production URL
- Monitor for any issues

### 9. Cleanup

```bash
# Delete local feature branch
git branch -d feature/<branch-name>

# Delete remote feature branch
git push origin --delete feature/<branch-name>
```

## Quick Commands

### Start New Feature

```bash
git checkout main
git pull origin main
git checkout -b feature/new-feature
```

### Push Changes for Review

```bash
git add .
git commit -m "feat: implement new feature"
git push -u origin feature/new-feature
```

### Merge Approved Changes

```bash
git checkout main
git merge feature/new-feature
git push origin main
```

### Rollback if Issues

```bash
git revert HEAD
git push origin main
```

## Branch Protection Rules (Recommended)

For production safety, consider enabling these GitHub settings:

1. Require pull request reviews before merging
2. Dismiss stale pull request approvals
3. Require status checks to pass
4. Require branches to be up to date
5. Include administrators in restrictions

## Current Feature Branch

**Active Branch**: `feature/pmi-asme-standards`

- Status: Pushed to GitHub, awaiting review
- Changes: ASME Y14.5 PMI standards implementation
- PR URL: https://github.com/Shivam-Bhardwaj/AutoCrate/pull/new/feature/pmi-asme-standards

## Notes

- Always test in preview deployment before merging to main
- Use descriptive branch names and commit messages
- Keep feature branches focused on single features/fixes
- Delete branches after merging to keep repository clean
