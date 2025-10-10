# Deployment Workflow

## Current Setup

**Platform**: Vercel
**Trigger**: Git push to `main` branch
**Auto-deploy**: Yes (automatic on push)
**Production URL**: https://autocrate.vercel.app

## Deployment Process

### Automatic Deployment

Every push to `main` triggers automatic deployment:

1. **Code pushed to GitHub**

   ```bash
   git push origin main
   ```

2. **Vercel detects push**
   - Webhook triggers build
   - Starts within seconds

3. **Build process**
   - npm install
   - npm run build
   - ~30-60 seconds total

4. **Deployment**
   - New version goes live
   - Old version remains available
   - Zero downtime

5. **DNS updates**
   - Production URL points to new deployment
   - Previous deployments archived

---

## Pre-Deployment Checklist

Before pushing to `main`:

### Required

- [ ] Version bumped in package.json
- [ ] Version synced (npm run version:sync)
- [ ] CHANGELOG.md updated
- [ ] Git commit created
- [ ] All files staged

### Recommended

- [ ] Type check passed (npm run type-check)
- [ ] Tests reviewed (npm test)
- [ ] No hardcoded values
- [ ] No sensitive data in commit

### If Changing UI

- [ ] Tested in dev mode (npm run dev)
- [ ] Checked responsive design
- [ ] Verified dark mode compatibility

---

## Deployment Commands

### Standard Deployment

```bash
# After making changes and bumping version
git add .
git commit -m "feat: description

Version: 13.2.0
TI-123"
git push origin main
```

### Monitor Deployment

Check Vercel status:

```bash
# Using Vercel API (requires token)
curl -H "Authorization: Bearer <token>" \
  "https://api.vercel.com/v6/deployments?limit=1"
```

Or visit Vercel dashboard:
https://vercel.com/shivams-projects-1d3fe872/autocrate

---

## Post-Deployment Verification

### 1. Wait for Build

- Build takes 30-60 seconds
- Check Vercel dashboard for status
- Green checkmark = success

### 2. Verify Production

Visit https://autocrate.vercel.app and check:

- [ ] **Metadata banner** shows correct version
- [ ] **Page loads** without errors
- [ ] **3D visualization** renders properly
- [ ] **Download buttons** work
- [ ] **Theme toggle** functions
- [ ] **Mobile view** displays correctly

### 3. Check Version Metadata

Banner should show:

```
v13.2.0 • TI-123 • main • [commit hash]
Updated by shivam@designviz.com • [timestamp]
Last change: [your commit message]
```

### 4. Test Core Features

- [ ] Change product dimensions
- [ ] Generate NX expressions
- [ ] Download STEP file
- [ ] Switch scenarios
- [ ] Toggle component visibility

---

## Deployment URLs

### Production

**Primary**: https://autocrate.vercel.app

**Alternates**:

- https://autocrate-shivams-projects-1d3fe872.vercel.app
- https://autocrate-git-main-shivams-projects-1d3fe872.vercel.app

### Preview Deployments

Each branch gets a preview URL:

- Feature branches: `autocrate-git-[branch-name]-[team].vercel.app`

---

## Rollback Procedures

### Quick Rollback (Vercel Dashboard)

1. Go to Vercel dashboard
2. Find previous deployment
3. Click "Promote to Production"
4. Instant rollback

### Git Rollback

```bash
# Revert to previous version tag
git revert HEAD
git push origin main

# Or rollback to specific version
git checkout v13.1.0
git checkout -b rollback-13-1-0
git push origin rollback-13-1-0
# Then promote in Vercel
```

See `.claude/workflows/REVERTING.md` for detailed rollback instructions.

---

## Deployment Troubleshooting

### Build Fails

**Check build logs**:

- Vercel dashboard → Deployments → Failed build → View logs

**Common issues**:

- TypeScript errors → Fix types, push again
- Missing dependencies → Update package.json
- Build timeout → Optimize build process

**Fix and redeploy**:

```bash
# Fix the issue
git add .
git commit -m "fix: build error"
git push origin main
```

### Build Succeeds but Site Broken

**Check browser console**:

- F12 → Console tab → Look for errors

**Common issues**:

- Runtime errors → Check component code
- API errors → Verify API routes
- Missing files → Check file paths

**Rollback immediately**:

```bash
# See REVERTING.md for instructions
```

### Slow Deployment

**Typical times**:

- Install: 10-20 seconds
- Build: 20-40 seconds
- Deploy: 5-10 seconds
- Total: 30-70 seconds

**If >2 minutes**:

- Check Vercel status: https://vercel-status.com
- Check build logs for hanging processes
- Cancel and retry deployment

---

## Environment Variables

Currently using:

- None (all config in code/package.json)

If adding environment variables:

1. Add in Vercel dashboard → Settings → Environment Variables
2. Redeploy to apply
3. Document in this file

---

## Deployment History

View all deployments:

```bash
git tag -l
# Shows: v13.0.0, v13.1.0, v13.2.0, etc.
```

Each tag = deployment bookmark.

---

## Manual Deployment (If Needed)

If automatic deployment fails:

### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Follow prompts
```

### From Different Branch

```bash
# Deploy feature branch for testing
git checkout feature-branch
vercel

# Deploy to production
vercel --prod
```

---

## Deployment Notifications

**Current setup**: None

**To add** (future):

- Slack notifications on deploy
- Email on failed builds
- Discord webhooks

---

## Best Practices

1. **Always deploy from main**
   - Feature branches for development
   - Merge to main when ready
   - Main = production-ready

2. **Never skip version bump**
   - Every commit must bump version
   - Enables rollback tracking
   - Shows in metadata banner

3. **Test before pushing**
   - Run locally: `npm run dev`
   - Check types: `npm run type-check`
   - Review changes: `git diff`

4. **Small, atomic commits**
   - One feature per commit
   - Easy to rollback
   - Clear history

5. **Monitor deployments**
   - Watch first 2 minutes after push
   - Verify on production URL
   - Check metadata banner

---

## Emergency Contacts

**If deployment fails and can't fix**:

- GitHub: https://github.com/Shivam-Bhardwaj/AutoCrate
- Vercel: https://vercel.com/shivams-projects-1d3fe872/autocrate
- Maintainer: shivam@designviz.com

---

## Deployment Checklist (Print This)

```
PRE-PUSH
[ ] Code changes complete
[ ] Version bumped (npm run version:patch/minor/major)
[ ] Version synced (npm run version:sync)
[ ] CHANGELOG.md updated
[ ] Type check passed
[ ] Git commit created
[ ] Ready to push

PUSH
[ ] git push origin main
[ ] Verify push succeeded

POST-DEPLOY (2-5 minutes)
[ ] Build started (check Vercel)
[ ] Build succeeded
[ ] Visit https://autocrate.vercel.app
[ ] Version banner correct
[ ] Page loads properly
[ ] Features work
[ ] No console errors

IF BROKEN
[ ] See REVERTING.md
[ ] Rollback immediately
[ ] Fix issue
[ ] Redeploy
```
