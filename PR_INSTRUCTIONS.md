# PR Instructions: Prevent Duplicate Expression Declarations

## Summary

Changes have been committed to branch `fix/prevent-duplicate-expressions`. The following steps are needed to create the GitHub issue and PR.

## Files Changed

- `src/lib/nx-generator.ts` - Added exclusion mechanism for template-defined expressions
- `ISSUE_duplicate_expressions.md` - Issue documentation
- `.pr-description-duplicate-expressions.md` - PR description

## Next Steps

### 1. Push the Branch

```bash
git push -u origin fix/prevent-duplicate-expressions
```

### 2. Create GitHub Issue

Since GitHub CLI (`gh`) is not available, create the issue manually:

1. Go to the GitHub repository issues page
2. Click "New Issue"
3. Use the title: **"Prevent Duplicate Expression Declarations in NX Export"**
4. Copy the contents from `ISSUE_duplicate_expressions.md` into the issue body
5. Add labels: `bug`, `enhancement`
6. Create the issue and note the issue number (e.g., #XXX)

### 3. Create Pull Request

1. Go to the GitHub repository and you should see a banner suggesting to create a PR for the pushed branch
2. Click "Compare & pull request"
3. Use the title: **"Fix: Prevent Duplicate Expression Declarations in NX Export"**
4. Copy the contents from `.pr-description-duplicate-expressions.md` into the PR description
5. Replace `#[ISSUE_NUMBER]` with the actual issue number from step 2
6. Set base branch to `main`
7. Create the PR

### Alternative: Use GitHub Web Interface

If the banner doesn't appear:

1. Go to: `https://github.com/[OWNER]/[REPO]/compare/main...fix/prevent-duplicate-expressions`
2. Fill in the PR details as described above

## What Was Fixed

- Added `EXCLUDED_EXPRESSIONS` Set to filter template-defined expressions
- Excluded `skid_width` and `skid_height` from export to prevent "Rule already exists" errors
- Added comments in exported file listing excluded expressions
- Made exclusion list easily extensible for future additions

## Testing

- ✅ All tests pass
- ✅ Linting passes
- ✅ Type checking passes
- ✅ Excluded expressions are not in exported file
- ✅ Non-excluded expressions are still exported correctly

