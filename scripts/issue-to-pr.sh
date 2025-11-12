#!/bin/bash

# AutoCrate Issue-to-PR Workflow
# Usage: ./scripts/issue-to-pr.sh [issue-url-or-number] [--create-issue]

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

CREATE_ISSUE=false
ISSUE_INPUT=""

for arg in "$@"; do
    case $arg in
        --create-issue)
            CREATE_ISSUE=true
            shift
            ;;
        *)
            ISSUE_INPUT="$arg"
            ;;
    esac
done

if [ "$CREATE_ISSUE" = true ]; then
    if [ -z "$ISSUE_INPUT" ]; then
        print_error "Please provide an issue title when using --create-issue"
        exit 1
    fi
    
    print_step "Creating new GitHub issue..."
    ISSUE_TITLE="$ISSUE_INPUT"
    
    echo "Enter issue description (press Ctrl+D when done):"
    ISSUE_BODY=$(cat)
    
    ISSUE_OUTPUT=$(gh issue create --title "$ISSUE_TITLE" --body "$ISSUE_BODY" --json number,url)
    ISSUE_NUMBER=$(echo "$ISSUE_OUTPUT" | jq -r '.number')
    ISSUE_URL=$(echo "$ISSUE_OUTPUT" | jq -r '.url')
    
    print_success "Created issue #$ISSUE_NUMBER: $ISSUE_URL"
else
    if [ -z "$ISSUE_INPUT" ]; then
        print_error "Please provide an issue number or URL"
        exit 1
    fi
    
    if [[ "$ISSUE_INPUT" =~ ^https?://github.com/.*/issues/([0-9]+) ]]; then
        ISSUE_NUMBER="${BASH_REMATCH[1]}"
    else
        ISSUE_NUMBER="$ISSUE_INPUT"
    fi
    
    ISSUE_URL="https://github.com/Shivam-Bhardwaj/AutoCrate/issues/$ISSUE_NUMBER"
fi

print_step "Working on issue #$ISSUE_NUMBER"

# Determine project root
if [ -f ".git" ]; then
    MAIN_REPO=$(cat .git | grep "gitdir:" | cut -d' ' -f2 | sed 's|/\.git/worktrees/.*||')
    cd "$MAIN_REPO"
elif [ -d ".git" ]; then
    MAIN_REPO=$(pwd)
else
    print_error "Not in a git repository"
    exit 1
fi

PROJECT_ROOT="$MAIN_REPO"
SCRIPT_DIR="${PROJECT_ROOT}/scripts"
WORKTREE_DIR="${PROJECT_ROOT}/issues/${ISSUE_NUMBER}"

# Step 1: Create or use existing worktree
print_step "Step 1: Setting up worktree for issue #$ISSUE_NUMBER"

if [ -d "$WORKTREE_DIR" ]; then
    print_warning "Worktree already exists at $WORKTREE_DIR"
    cd "$WORKTREE_DIR"
else
    print_info "Creating worktree..."
    "${SCRIPT_DIR}/worktree-issue.sh" "$ISSUE_NUMBER"
    cd "$WORKTREE_DIR"
fi

# Step 2: Run worktree setup script
print_step "Step 2: Running worktree setup..."
if [ -f "${PROJECT_ROOT}/.cursor/worktree-setup.sh" ]; then
    bash "${PROJECT_ROOT}/.cursor/worktree-setup.sh"
else
    print_warning "Worktree setup script not found, skipping..."
fi

# Step 3: Display issue context
print_step "Step 3: Issue context"
echo ""
if [ -f ".issue-context.md" ]; then
    cat .issue-context.md
    echo ""
else
    print_info "Fetching issue details..."
    gh issue view "$ISSUE_NUMBER" --json title,body,state,labels | jq -r '
        "# Issue #\(.number): \(.title)\n\n**State:** \(.state)\n\n## Description\n\n\(.body)"
    '
    echo ""
fi

# Step 4: Instructions for the agent
print_step "Step 4: Ready for development"
echo ""
print_success "Worktree is ready!"
echo ""
echo "📋 Issue: #$ISSUE_NUMBER"
echo "🌿 Branch: $(git branch --show-current)"
echo "📁 Worktree: $WORKTREE_DIR"
echo ""
echo "Next steps:"
echo "1. The agent will now analyze the issue and implement the solution"
echo "2. Run tests: npm test"
echo "3. Build: npm run build"
echo "4. When ready, run: ./scripts/create-pr-from-worktree.sh"
echo ""

export CURSOR_ISSUE_NUMBER="$ISSUE_NUMBER"
export CURSOR_ISSUE_URL="$ISSUE_URL"
export CURSOR_WORKTREE_DIR="$WORKTREE_DIR"
export CURSOR_AUTO_PR="true"

print_info "Environment variables set for agent"
echo "  CURSOR_ISSUE_NUMBER=$CURSOR_ISSUE_NUMBER"
echo "  CURSOR_ISSUE_URL=$CURSOR_ISSUE_URL"
echo "  CURSOR_WORKTREE_DIR=$CURSOR_WORKTREE_DIR"
echo ""

print_success "Setup complete! Agent can now work on the issue."
