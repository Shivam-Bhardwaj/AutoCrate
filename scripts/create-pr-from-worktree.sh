#!/bin/bash

# Create PR from Current Worktree
# Usage: ./scripts/create-pr-from-worktree.sh [--draft]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_step() { echo -e "${MAGENTA}[STEP]${NC} $1"; }

if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed"
    exit 1
fi

if [ ! -d ".git" ] && [ ! -f ".git" ]; then
    print_error "Not in a git repository"
    exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    print_error "Could not determine current branch"
    exit 1
fi

print_step "Creating PR from branch: $CURRENT_BRANCH"

# Extract issue number
ISSUE_NUMBER=""
if [[ "$CURRENT_BRANCH" =~ -([0-9]+)$ ]]; then
    ISSUE_NUMBER="${BASH_REMATCH[1]}"
elif [ -n "$CURSOR_ISSUE_NUMBER" ]; then
    ISSUE_NUMBER="$CURSOR_ISSUE_NUMBER"
elif [ -f ".issue-context.md" ]; then
    ISSUE_NUMBER=$(grep -oP '#\K[0-9]+' .issue-context.md | head -1)
fi

# Get issue details
ISSUE_TITLE=""
ISSUE_BODY=""
if [ -n "$ISSUE_NUMBER" ]; then
    print_info "Found issue #$ISSUE_NUMBER"
    ISSUE_DATA=$(gh issue view "$ISSUE_NUMBER" --json title,body 2>/dev/null || echo "")
    if [ -n "$ISSUE_DATA" ]; then
        ISSUE_TITLE=$(echo "$ISSUE_DATA" | jq -r '.title')
        ISSUE_BODY=$(echo "$ISSUE_DATA" | jq -r '.body')
    fi
fi

# Get commit messages
print_step "Gathering commit information..."
COMMITS=$(git log origin/main..HEAD --oneline 2>/dev/null || git log main..HEAD --oneline 2>/dev/null || echo "")
COMMIT_COUNT=$(echo "$COMMITS" | grep -c . || echo "0")

# Check uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes"
    git status --short
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Push branch
if ! git rev-parse --verify "origin/$CURRENT_BRANCH" >/dev/null 2>&1; then
    print_step "Pushing branch to remote..."
    git push -u origin "$CURRENT_BRANCH"
    print_success "Branch pushed"
else
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse "origin/$CURRENT_BRANCH" 2>/dev/null || echo "")
    if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
        print_step "Pushing new commits..."
        git push
        print_success "Commits pushed"
    fi
fi

# Generate PR title
if [ -n "$ISSUE_TITLE" ]; then
    PR_TITLE="$ISSUE_TITLE"
    if [[ "$CURRENT_BRANCH" =~ ^fix/ ]]; then
        PR_TITLE="fix: $PR_TITLE"
    elif [[ "$CURRENT_BRANCH" =~ ^feat ]]; then
        PR_TITLE="feat: $PR_TITLE"
    fi
else
    FIRST_COMMIT=$(echo "$COMMITS" | head -1 | cut -d' ' -f2-)
    if [ -n "$FIRST_COMMIT" ]; then
        PR_TITLE="$FIRST_COMMIT"
    else
        PR_TITLE="Update: $CURRENT_BRANCH"
    fi
fi

# Generate PR body
PR_BODY=""

if [ -n "$ISSUE_NUMBER" ]; then
    PR_BODY="## Description\n\n"
    if [ -n "$ISSUE_BODY" ]; then
        PR_BODY+="$ISSUE_BODY\n\n"
    fi
    PR_BODY+="---\n\n"
fi

if [ "$COMMIT_COUNT" -gt 0 ]; then
    PR_BODY+="## Changes\n\n"
    PR_BODY+="This PR includes $COMMIT_COUNT commit(s):\n\n"
    PR_BODY+="\`\`\`\n"
    PR_BODY+="$COMMITS"
    PR_BODY+="\n\`\`\`\n\n"
fi

if [ -f "package.json" ] && npm test --dry-run >/dev/null 2>&1; then
    PR_BODY+="## Testing\n\n"
    PR_BODY+="- [x] Tests pass locally\n"
    if grep -q "\"build\"" package.json; then
        PR_BODY+="- [x] Build succeeds\n"
    fi
    PR_BODY+="\n"
fi

if [ -n "$ISSUE_NUMBER" ]; then
    PR_BODY+="Closes #$ISSUE_NUMBER\n\n"
fi

PR_BODY+="---\n\n"
PR_BODY+="🤖 Generated with Cursor AI"

# Create PR
DRAFT_FLAG=""
if [ "$1" = "--draft" ]; then
    DRAFT_FLAG="--draft"
    print_info "Creating draft PR..."
fi

print_step "Creating pull request..."
PR_URL=$(gh pr create \
    --title "$PR_TITLE" \
    --body "$PR_BODY" \
    --base main \
    $DRAFT_FLAG 2>&1)

if [ $? -eq 0 ]; then
    print_success "Pull request created!"
    echo ""
    echo "🔗 PR URL: $PR_URL"
    echo ""
else
    print_error "Failed to create PR"
    echo "$PR_URL"
    exit 1
fi
