# Rollback & Revert Guide

## Emergency Rollback

**Something broke on production? Follow this immediately:**

### Quick Rollback (1 minute)

```bash
# Find the last working version
git tag -l

# Revert to it (example: v13.1.0)
git revert HEAD --no-edit
git push origin main
```

This reverts the last commit and triggers automatic redeployment with the previous working code.

---

## When to Rollback

Rollback immediately if:

- ❌ Site doesn't load
- ❌ Critical feature broken
- ❌ Console shows errors
- ❌ Data loss possible
- ❌ Security issue introduced

Don't rollback for:

- ✅ Minor UI glitch (fix forward)
- ✅ Documentation error (fix forward)
- ✅ Small styling issue (fix forward)

---

## Rollback Methods

### Method 1: Git Revert (Recommended)

**Best for**: Most situations, preserves history

```bash
# Revert last commit
git revert HEAD

# Adds message explaining revert
git commit -m "revert: rollback broken deployment

Reverting to v13.1.0 due to [issue].

Version: 13.1.1"

# Push triggers new deployment
git push origin main
```

**Result**:

- Creates new commit that undoes changes
- History preserved
- Safe and traceable

---

### Method 2: Checkout Tag (Use with caution)

**Best for**: Need exact previous state

```bash
# Find tag of working version
git tag -l
# Example output: v13.0.0, v13.1.0, v13.2.0

# Checkout that version
git checkout v13.1.0

# Create new branch from it
git checkout -b rollback-to-13-1-0

# Force update main (CAUTION)
git branch -f main
git push origin main --force
```

**Warning**: This rewrites history. Only use if revert doesn't work.

---

### Method 3: Vercel Dashboard (Instant)

**Best for**: Immediate rollback while fixing

1. Go to Vercel dashboard: https://vercel.com/shivams-projects-1d3fe872/autocrate
2. Click "Deployments"
3. Find previous working deployment (green checkmark)
4. Click "..." → "Promote to Production"
5. Confirm

**Result**:

- Instant rollback (seconds)
- No git changes yet
- Temporary fix while you repair code

**Important**: Still need to fix in git, or next push will break again.

---

## Step-by-Step Rollback Workflow

### Step 1: Identify the Problem

```bash
# Check what broke
git log --oneline -5

# See what changed
git show HEAD

# Find last working version
git tag -l
```

### Step 2: Decide Rollback Point

```bash
# Check when it broke
git log --oneline --all

# Identify commit/tag to revert to
# Usually the previous tag (e.g., v13.1.0)
```

### Step 3: Execute Rollback

Choose a method above, typically:

```bash
# Simple revert
git revert HEAD
git push origin main
```

### Step 4: Verify Rollback

```bash
# Check Vercel deployed
# Visit https://autocrate.vercel.app
# Verify version banner shows previous version
# Test that site works
```

### Step 5: Update Version

```bash
# Bump patch version
npm run version:patch  # 13.2.0 → 13.2.1 (after reverting 13.2.0)
npm run version:sync

# Update CHANGELOG
# Add entry: "Reverted v13.2.0 due to [issue]"

# Commit
git add .
git commit -m "chore: update version after rollback"
git push origin main
```

---

## Partial Rollback (Single File)

If only one file broke:

```bash
# Rollback just that file
git checkout HEAD~1 -- path/to/broken-file.ts

# Bump patch version
npm run version:patch
npm run version:sync

# Commit
git add .
git commit -m "fix: rollback broken file

Reverted [file] to working state.

Version: 13.2.1"
git push origin main
```

---

## Rollback by Version Number

### To Specific Version

```bash
# Rollback to exact version
git checkout v13.1.0

# Make it the current state
git checkout -b temp-rollback
git branch -D main
git checkout -b main
git push origin main --force
```

### To N Commits Ago

```bash
# Rollback 3 commits
git revert HEAD~3..HEAD

# Or one by one
git revert HEAD~3
git revert HEAD~2
git revert HEAD~1
git revert HEAD

# Push
git push origin main
```

---

## Finding the Breaking Commit

### Use Git Bisect

```bash
# Start bisect
git bisect start

# Mark current as bad
git bisect bad

# Mark last known good version
git bisect good v13.1.0

# Git will checkout middle commit
# Test if it works
npm run dev
# Check if broken

# If broken
git bisect bad

# If works
git bisect good

# Repeat until found
# Git will tell you the breaking commit

# End bisect
git bisect reset
```

---

## After Rollback: Fix & Redeploy

### 1. Fix the Issue

```bash
# Create fix branch
git checkout -b fix/broken-feature

# Fix the code
# Test thoroughly
npm run dev
npm run type-check
npm test

# Commit fix
git add .
git commit -m "fix: resolve issue from v13.2.0"
```

### 2. Bump Version

```bash
npm run version:patch  # or minor if big fix
npm run version:sync
```

### 3. Update CHANGELOG

```markdown
## [13.2.2] - 2025-10-08

### Fixed

- Resolved issue that caused rollback from v13.2.0
- [Description of fix]
```

### 4. Redeploy

```bash
git checkout main
git merge fix/broken-feature
git push origin main
```

---

## Rollback Checklist

```
IMMEDIATE (If site broken)
[ ] Identify last working version
[ ] Execute rollback (git revert or Vercel dashboard)
[ ] Verify production works
[ ] Notify team if applicable

AFTER ROLLBACK
[ ] Identify root cause
[ ] Create fix branch
[ ] Implement fix
[ ] Test thoroughly
[ ] Bump version
[ ] Update CHANGELOG
[ ] Redeploy

VERIFY FIX
[ ] Check production
[ ] Verify version banner
[ ] Test affected features
[ ] Monitor for 10 minutes
```

---

## Prevention

To avoid needing rollbacks:

1. **Test locally first**

   ```bash
   npm run dev
   npm run type-check
   npm test
   ```

2. **Small commits**
   - Easier to identify issues
   - Easier to rollback

3. **Check build logs**
   - Watch Vercel build
   - Catch errors early

4. **Use feature branches**
   - Test in preview deployments
   - Merge to main when stable

5. **Monitor post-deploy**
   - Watch for 2-5 minutes after push
   - Check version banner
   - Test core features

---

## Git Tags for Rollback

### List All Tags

```bash
git tag -l
```

### See Tag Details

```bash
git show v13.1.0
```

### Rollback to Tag

```bash
git checkout v13.1.0
```

### Create Recovery Tag

```bash
# Mark recovery point
git tag -a v13.1.0-recovery -m "Recovery point after rollback"
git push origin v13.1.0-recovery
```

---

## Common Rollback Scenarios

### Scenario 1: Build Fails

```bash
# Revert immediately
git revert HEAD
git push origin main
# Fix locally, test, redeploy
```

### Scenario 2: Runtime Error

```bash
# Quick rollback via Vercel
# Use dashboard to promote previous deployment
# Fix code
# Bump version
# Redeploy
```

### Scenario 3: Multiple Broken Commits

```bash
# Revert range
git revert HEAD~5..HEAD
git push origin main
# Or revert to tag
git checkout v13.0.0
# Make it main
# Force push
```

---

## Recovery Documentation

After any rollback, document:

- What broke
- Why it broke
- How you fixed it
- How to prevent it

Add to CHANGELOG.md under the fix version.

---

## Emergency Contacts

**If can't resolve**:

- Check GitHub Issues: https://github.com/Shivam-Bhardwaj/AutoCrate/issues
- Email maintainer: shivam@designviz.com
- Vercel support: https://vercel.com/support
