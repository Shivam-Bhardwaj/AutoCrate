#!/bin/bash

# Process GitHub Issue Link
# Usage: ./scripts/process-issue-link.sh <issue-url>
# Example: ./scripts/process-issue-link.sh https://github.com/Shivam-Bhardwaj/AutoCrate/issues/124

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if issue URL provided
if [ -z "$1" ]; then
    print_error "Please provide a GitHub issue URL"
    echo "Usage: $0 <issue-url>"
    echo "Example: $0 https://github.com/Shivam-Bhardwaj/AutoCrate/issues/124"
    exit 1
fi

ISSUE_URL="$1"

# Extract issue number from URL
if [[ "$ISSUE_URL" =~ github.com/.*/issues/([0-9]+) ]]; then
    ISSUE_NUMBER="${BASH_REMATCH[1]}"
else
    print_error "Invalid GitHub issue URL format"
    exit 1
fi

print_info "Processing issue #$ISSUE_NUMBER"
print_info "URL: $ISSUE_URL"

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed"
    print_info "Install: https://cli.github.com/"
    exit 1
fi

# Verify issue exists
if ! gh issue view "$ISSUE_NUMBER" &> /dev/null; then
    print_error "Issue #$ISSUE_NUMBER not found or not accessible"
    exit 1
fi

# Get issue details
ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title -q .title)
print_success "Found issue: #$ISSUE_NUMBER - $ISSUE_TITLE"

# Run worktree setup script
print_info "Setting up worktree..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"
./scripts/worktree-issue.sh "$ISSUE_NUMBER"

print_success "Ready to work on issue #$ISSUE_NUMBER!"
print_info "Worktree location: $PROJECT_ROOT/issues/$ISSUE_NUMBER"
print_info "To start: cd issues/$ISSUE_NUMBER"

