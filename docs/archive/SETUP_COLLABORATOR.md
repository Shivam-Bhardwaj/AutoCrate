# How to Add Keelyn as a Collaborator

## For Shivam: Quick Setup Steps

### 1. Add Keelyn to the Repository

1. Go to: https://github.com/Shivam-Bhardwaj/AutoCrate/settings/access
2. Click **"Add people"** (green button)
3. Enter Keelyn's GitHub username or email
4. Select **"Write"** permission level
5. Click **"Add to repository"**

### 2. Recommended Permission Level

**Give Keelyn "Write" access** which allows her to:

- [DONE] Create issues
- [DONE] Comment on pull requests
- [DONE] Review changes
- [DONE] Approve PRs
- [DONE] Create branches (if needed)
- [x] Can't delete the repository
- [x] Can't change critical settings

### 3. Set Up Branch Protection (Optional but Recommended)

To prevent accidental merges to main:

1. Go to: Settings → Branches
2. Click "Add branch protection rule"
3. Pattern: `main`
4. Check:
   - [DONE] Require pull request before merging
   - [DONE] Require approvals (1)
   - [DONE] Dismiss stale pull request approvals
   - [DONE] Require review from CODEOWNERS

This ensures:

- Keelyn can review and approve
- But changes must go through PR process
- No direct pushes to main branch

## For Keelyn: What You Can Do

### With Write Access You Can:

1. **Review & Approve Changes**
   - See all pull requests
   - Leave comments with your expertise
   - Approve changes when they're correct
   - Request changes when something's wrong

2. **Create Issues**
   - Report problems
   - Suggest new features
   - Document crate requirements

3. **Comment Everywhere**
   - On code (even if you don't understand it)
   - On pull requests
   - On issues
   - On commits

4. **View Everything**
   - All code (don't worry about understanding it)
   - All history
   - All discussions

### Review Process for Keelyn:

1. **Get email notification** about new PR
2. **Click the link** in email
3. **Look for preview link** in PR comments
4. **Test the preview** website
5. **Leave review**:
   - Click "Files changed" tab
   - Click "Review changes" button
   - Choose:
     - [DONE] **Approve** - Everything looks good
     - [COMMENT] **Comment** - Just leaving feedback
     - [x] **Request changes** - Something needs fixing

## Team Workflow

### The Three Roles:

**Shivam (Product Owner)**

- Requests features
- Final approval
- Strategic decisions

**Keelyn (Domain Expert)**

- Crate specifications
- Industry standards
- Technical accuracy
- Safety requirements

**Claude (Engineer)**

- Implements changes
- Handles all code
- Creates previews
- Deploys to production

### How It Works Together:

```
Shivam: "We need to fix skid calculations"
    ↓
Claude: Creates fix in feature branch
    ↓
Keelyn: Reviews preview, comments "Spacing should be 24 inches"
    ↓
Claude: Updates based on Keelyn's feedback
    ↓
Keelyn: Approves "Looks correct now!"
    ↓
Shivam: Final approval
    ↓
Claude: Merges and deploys
```

## Setting Up Notifications

### For Keelyn - Get Notified When Needed:

1. Go to: https://github.com/settings/notifications
2. Under "Participating" - turn ON:
   - Pull request reviews
   - Pull request updates
   - Issues
3. Choose email notifications
4. Optional: Download GitHub mobile app for push notifications

## Quick Tips for Non-Technical Reviews

### Keelyn Can Focus On:

```yaml
What to Review:
  - Dimensions and measurements
  - Weight calculations
  - Lumber specifications
  - Hardware requirements
  - Industry compliance
  - Safety factors

How to Comment:
  - "This dimension should be X"
  - "Wrong lumber size for this weight"
  - "Missing reinforcement here"
  - "This follows standard practice ✓"

What to Ignore:
  - Code syntax
  - Variable names
  - Technical implementation
  - Git history
```

## Common Scenarios

### Scenario 1: Reviewing a Lumber Change

```
Claude: "Changed skid lumber from 2x4 to 2x6"
Keelyn: "This is correct for 2000+ lb crates. Approved!"
```

### Scenario 2: Catching an Error

```
Claude: "Updated cleat spacing to 18 inches"
Keelyn: "This is wrong. For 72" crates, cleats should be 12" from corners"
Claude: "Fixed - now 12 inches from corners"
Keelyn: "Perfect, approved!"
```

### Scenario 3: Adding Domain Knowledge

```
Shivam: "Add support for refrigerated crates"
Keelyn: Comments with specifications:
  - "Need 2" foam insulation minimum"
  - "Vapor barrier required"
  - "Special corner protection needed"
Claude: Implements based on specs
```

## Security & Safety

### For Keelyn's Peace of Mind:

- **Can't break production** - Everything goes through review
- **Can't delete anything** - Only add comments
- **Changes are tracked** - Everything has history
- **Easy to revert** - If something goes wrong, we can undo
- **Test environment first** - Preview before production

## Next Steps

1. **Shivam**: Add Keelyn as collaborator with Write access
2. **Keelyn**: Accept invitation and create GitHub account
3. **Test**: Have Keelyn comment on the current PR
4. **Iterate**: Adjust process based on what works

---

## Quick Links

- **Add Collaborator**: https://github.com/Shivam-Bhardwaj/AutoCrate/settings/access
- **Current PR for Testing**: https://github.com/Shivam-Bhardwaj/AutoCrate/pulls
- **Create Issue**: https://github.com/Shivam-Bhardwaj/AutoCrate/issues/new

This setup gives Keelyn the perfect balance:

- [DONE] Can contribute her expertise
- [DONE] Can review all changes
- [DONE] Can't accidentally break anything
- [DONE] Doesn't need technical knowledge
