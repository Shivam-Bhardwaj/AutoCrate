#!/bin/bash

# AutoCrate Worktree Issue Setup
# This script creates isolated worktrees for each issue to enable parallel work
# by multiple LLMs (Claude Code, OpenAI Codex, etc.) without conflicts
#
# Usage: ./scripts/worktree-issue.sh [issue-number-or-url]
#
# Examples:
#   ./scripts/worktree-issue.sh 124
#   ./scripts/worktree-issue.sh https://github.com/Shivam-Bhardwaj/AutoCrate/issues/124
#
# Features:
# - Creates git worktree in issues/NUMBER/ directory
# - Fetches issue details from GitHub
# - Creates branch for the issue
# - Sets up issue context file
# - Isolated workspace for parallel development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed or not configured"
    print_info "To install: https://cli.github.com/"
    print_info "To configure: gh auth login"
    exit 1
fi

# Parse input
if [ -z "$1" ]; then
    print_error "Please provide an issue number or URL"
    echo "Usage: $0 [issue-number-or-url]"
    echo "Example: $0 124"
    echo "Example: $0 https://github.com/Shivam-Bhardwaj/AutoCrate/issues/124"
    exit 1
fi

# Extract issue number from URL if provided
ISSUE_INPUT="$1"
if [[ "$ISSUE_INPUT" =~ ^https?://github.com/.*/issues/([0-9]+) ]]; then
    ISSUE_NUMBER="${BASH_REMATCH[1]}"
else
    ISSUE_NUMBER="$ISSUE_INPUT"
fi

print_info "Setting up worktree for issue #$ISSUE_NUMBER"

# Determine project root (where .git directory is)
if [ -f ".git" ]; then
    # This is already a worktree, find the main repo
    MAIN_REPO=$(cat .git | grep "gitdir:" | cut -d' ' -f2 | sed 's|/\.git/worktrees/.*||')
    cd "$MAIN_REPO"
fi

if [ ! -d ".git" ]; then
    print_error "Not in a git repository. Please run from project root."
    exit 1
fi

PROJECT_ROOT=$(pwd)
WORKTREE_DIR="${PROJECT_ROOT}/issues/${ISSUE_NUMBER}"

# Check if worktree already exists
if [ -d "$WORKTREE_DIR" ]; then
    print_warning "Worktree for issue #$ISSUE_NUMBER already exists at $WORKTREE_DIR"
    print_info "To work on this issue, cd to: $WORKTREE_DIR"

    # Show current status
    cd "$WORKTREE_DIR"
    CURRENT_BRANCH=$(git branch --show-current)
    print_info "Current branch: $CURRENT_BRANCH"

    exit 0
fi

# Fetch issue details from GitHub
print_info "Fetching issue details from GitHub..."
ISSUE_DATA=$(gh issue view "$ISSUE_NUMBER" --json title,body,state,labels,number 2>&1)
if [ $? -ne 0 ]; then
    print_error "Failed to fetch issue #$ISSUE_NUMBER. Does it exist?"
    print_error "$ISSUE_DATA"
    exit 1
fi

ISSUE_TITLE=$(echo "$ISSUE_DATA" | jq -r '.title')
ISSUE_BODY=$(echo "$ISSUE_DATA" | jq -r '.body')
ISSUE_STATE=$(echo "$ISSUE_DATA" | jq -r '.state')
ISSUE_URL="https://github.com/Shivam-Bhardwaj/AutoCrate/issues/$ISSUE_NUMBER"

print_success "Issue: $ISSUE_TITLE"
print_info "State: $ISSUE_STATE"

# Create branch name (sanitize title)
BRANCH_PREFIX="sbl"  # Shivam Bhardwaj Lumber or similar - adjust as needed
BRANCH_NAME="${BRANCH_PREFIX}-${ISSUE_NUMBER}"

print_info "Creating worktree with branch: $BRANCH_NAME"

# Ensure we're up to date with remote
git fetch origin

# Check if branch already exists remotely or locally
BRANCH_EXISTS_REMOTE=$(git ls-remote --heads origin "$BRANCH_NAME" | wc -l)
BRANCH_EXISTS_LOCAL=$(git branch --list "$BRANCH_NAME" | wc -l)

if [ "$BRANCH_EXISTS_REMOTE" -gt 0 ]; then
    print_info "Branch $BRANCH_NAME exists on remote, checking out..."
    git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"
elif [ "$BRANCH_EXISTS_LOCAL" -gt 0 ]; then
    print_info "Branch $BRANCH_NAME exists locally, checking out..."
    git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"
else
    print_info "Creating new branch $BRANCH_NAME from main..."
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" origin/main
fi

print_success "Worktree created at: $WORKTREE_DIR"

# Create issue context file in the worktree
cd "$WORKTREE_DIR"

ISSUE_CONTEXT_FILE=".issue-context.md"
cat > "$ISSUE_CONTEXT_FILE" << EOF
# Issue #${ISSUE_NUMBER}: ${ISSUE_TITLE}

**Repository:** Shivam-Bhardwaj/AutoCrate
**Issue URL:** ${ISSUE_URL}
**Branch:** ${BRANCH_NAME}
**Status:** ${ISSUE_STATE}

## Description

${ISSUE_BODY}

---

**Workspace:** ${WORKTREE_DIR}
**Created:** $(date +"%Y-%m-%d %H:%M:%S")
EOF

print_success "Created issue context file: $ISSUE_CONTEXT_FILE"

# Create .gitignore entry for issue context if not present
if [ ! -f ".gitignore" ] || ! grep -q "^\.issue-context\.md$" .gitignore; then
    echo "" >> .gitignore
    echo "# Issue context files" >> .gitignore
    echo ".issue-context.md" >> .gitignore
fi

# Display summary
echo ""
print_success "Worktree ready for issue #${ISSUE_NUMBER}!"
echo ""
echo "📋 Issue: #${ISSUE_NUMBER} - ${ISSUE_TITLE}"
echo "🌿 Branch: ${BRANCH_NAME}"
echo "📁 Worktree: ${WORKTREE_DIR}"
echo "📄 Context: ${ISSUE_CONTEXT_FILE}"
echo ""
echo "To start working:"
echo "  cd ${WORKTREE_DIR}"
echo ""
echo "To remove this worktree when done:"
echo "  git worktree remove ${WORKTREE_DIR}"
echo ""
echo "To list all worktrees:"
echo "  git worktree list"
echo ""

print_success "Ready to work!"
