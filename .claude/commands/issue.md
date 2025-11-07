# Issue Workflow Command

Process a GitHub issue link and set up the development environment automatically.

## Usage

Just provide a GitHub issue URL or number:

```
https://github.com/Shivam-Bhardwaj/AutoCrate/issues/124
```

or

```
124
```

## Automated Workflow

When you provide an issue link/number, the system will:

1. **Extract issue number** from the URL
2. **Fetch issue details** from GitHub (title, description, labels)
3. **Create worktree** using `./scripts/worktree-issue.sh <number>`
   - Creates isolated workspace in `issues/<number>/`
   - Creates branch `sbl-<number>` if it doesn't exist
   - Sets up `.issue-context.md` with issue details
4. **Change directory** to the worktree: `cd issues/<number>`
5. **Read context** from `.issue-context.md`
6. **Analyze and implement** the fix or feature
7. **Test changes**: Run `npm test` and `npm run build`
8. **Commit** with proper message format
9. **Push branch** and create PR that closes the issue

## GitHub Actions Integration

The repository includes minimal GitHub Actions workflows:

- **Issue Setup** (`.github/workflows/issue-setup.yml`): Can be triggered manually or when an issue is labeled "ready"
- **PR Checks** (`.github/workflows/pr-checks.yml`): Validates version bumps, runs tests on PRs
- **CI** (`.github/workflows/ci.yml`): Minimal CI pipeline for all branches
- **Auto Merge** (`.github/workflows/auto-merge.yml`): Auto-merges PRs with "auto-merge" label after checks pass

## Local Setup

To work on an issue locally:

```bash
# Method 1: Use the script directly
./scripts/process-issue-link.sh https://github.com/Shivam-Bhardwaj/AutoCrate/issues/124

# Method 2: Use worktree script
./scripts/worktree-issue.sh 124
cd issues/124
```

## Workflow Steps

1. **Setup**: Worktree created automatically
2. **Work**: Make changes in `issues/<number>/`
3. **Test**: `npm test` and `npm run build`
4. **Version**: Bump version (`npm run version:patch/minor/major` + `npm run version:sync`)
5. **CHANGELOG**: Update `CHANGELOG.md`
6. **Commit**: Use conventional commit format
7. **Push**: `git push origin sbl-<number>`
8. **PR**: Create PR that closes the issue: `Closes #<number>`
9. **GitHub Actions**: Automatically runs checks on PR
10. **Merge**: After approval, merge PR (or use auto-merge label)

## Benefits

- **Minimal setup**: Just provide issue link
- **Isolated work**: Each issue has its own workspace
- **Parallel work**: Multiple issues can be worked on simultaneously
- **Automated checks**: GitHub Actions validates PRs
- **Easy cleanup**: Remove worktree when done
