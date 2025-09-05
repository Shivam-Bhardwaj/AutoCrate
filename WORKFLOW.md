# Streamlined Development Workflow

## Overview
A unified, intelligent development pipeline that leverages multiple LLMs for maximum efficiency:
- **Claude** handles all code changes
- **Gemini** handles all documentation
- **GitHub Actions** handles all deployments
- **Vercel** only deploys when GitHub triggers it

## Key Principles

### 1. Single Source of Truth
- GitHub is the ONLY deployment trigger
- Vercel auto-deployments are DISABLED
- All changes flow through GitHub

### 2. Parallel Processing
- Submit multiple changes at once
- Claude and Gemini work in parallel
- Each change gets its own feature branch
- Auto-merge when tests pass

### 3. Zero Manual Steps
- Automatic testing
- Automatic fixing
- Automatic documentation
- Automatic deployment

## Quick Start

### Submit Changes (Recommended)
```cmd
.\a changes
```
Enter multiple changes separated by `---` or as numbered list:
```
1. Add user authentication
2. Fix mobile responsive issues
3. Update API documentation
---
```

### Process Everything
```cmd
.\a process
```
Processes all queued changes in parallel.

### Check Status
```cmd
.\a queue
```
Shows pending changes and processing status.

## Workflows

### 1. Simplified Daily Workflow

```cmd
# Morning: Submit all your planned changes
.\a changes
> 1. Fix bug in crate calculation
> 2. Add export to PDF feature
> 3. Update README with new features

# Claude handles code (1,2), Gemini handles docs (3)
# Everything runs in parallel
# Auto-creates PRs, auto-merges, auto-deploys
```

### 2. Traditional Workflow (Still Supported)

```cmd
# Step 1: Local development
.\a local

# Step 2: Prepare for production
.\a prepare

# Step 3: Deploy
.\a deploy
```

### 3. Documentation Updates

```cmd
# Update all docs with Gemini
.\a docs
> Select: 5 (All Documentation)

# Or specific docs
node scripts/gemini-docs.js update changelog
```

## How It Works

### Change Queue System
1. **Submit** - Add changes to queue via `.\a changes`
2. **Categorize** - System identifies code vs documentation
3. **Route** - Code to Claude, docs to Gemini
4. **Process** - Create branches, make changes, run tests
5. **Merge** - Auto-merge when all checks pass
6. **Deploy** - GitHub Actions deploys to Vercel

### Parallel Branch Strategy
- Each change gets branch: `auto/feature-name-timestamp`
- Up to 3 changes processed simultaneously
- No merge conflicts (separate branches)
- Queue additional changes if busy

### Automatic Error Handling
- Linting errors: Auto-fixed
- Type errors: Auto-resolved
- Test failures: Auto-updated
- Build failures: Auto-retry (3x)
- Deploy failures: Auto-rollback

## File Structure

```
/scripts/
  process-changes.js   - Change queue processor
  smart-prompt.js      - Intelligent prompt router
  gemini-docs.js       - Documentation handler

/.github/workflows/
  unified.yml          - Single workflow (replaces all others)

/changes.json          - Change queue storage
/.prompts/            - Temporary prompt storage
```

## Configuration

### changes.json
```json
{
  "config": {
    "autoProcess": true,      // Process on add
    "parallelBranches": true, // Parallel processing
    "autoMerge": true,        // Auto-merge PRs
    "useLLMs": {
      "claude": "code",
      "gemini": "documentation"
    }
  }
}
```

### vercel.json
```json
{
  "github": {
    "enabled": false  // Disabled to prevent double deploys
  },
  "git": {
    "deploymentEnabled": false  // Only deploy via API
  }
}
```

## Commands Reference

### Master Script (a.bat)
```
.\a changes    - Submit multiple changes
.\a docs       - Update documentation
.\a queue      - View queue status  
.\a process    - Process pending changes
.\a local      - Local development
.\a prepare    - Prepare for production
.\a deploy     - Deploy to production
```

### Direct Scripts
```
node scripts/smart-prompt.js          - Interactive prompt handler
node scripts/process-changes.js add   - Add single change
node scripts/process-changes.js process - Process queue
node scripts/gemini-docs.js all       - Update all docs
```

## Best Practices

### 1. Batch Changes
Instead of:
```
Fix bug -> commit -> Fix another -> commit
```

Do:
```
.\a changes
> 1. Fix calculation bug
> 2. Fix responsive bug
> 3. Fix login bug
[All processed in parallel]
```

### 2. Let LLMs Specialize
- Don't ask Claude to update README
- Don't ask Gemini to write code
- System automatically routes to the right LLM

### 3. Trust Automation
- Don't manually fix linting
- Don't manually update tests
- Don't manually merge PRs
- System handles everything

## Troubleshooting

### Changes not processing?
```cmd
.\a queue         # Check status
.\a process       # Force process
```

### Deployment not triggered?
- Check GitHub Actions: `gh workflow list`
- Check secrets are configured
- Ensure on main branch

### Port conflicts?
```cmd
.\a ports         # View active ports
.\a killport      # Kill specific port
```

## Migration from Old Workflows

### Old workflows to disable/delete:
- `.github/workflows/ci.yml` (replaced by unified.yml)
- `.github/workflows/auto-deploy.yml` (replaced by unified.yml)
- `.github/workflows/claude*.yml` (no longer needed)
- `.github/workflows/release.yml` (integrated into unified.yml)

### Keep only:
- `.github/workflows/unified.yml` - The single workflow

## Summary

This workflow eliminates:
- Manual PR creation
- Manual testing
- Manual documentation updates
- Manual deployments
- Waiting for CI/CD

You just:
1. Submit changes
2. Continue working
3. Everything happens automatically

The system is designed to let you focus on describing what you want, while Claude codes, Gemini documents, and GitHub deploys.