#!/bin/bash

# Work on Issue Wrapper
# This script sets up a worktree and launches Claude Code or another LLM
# to work on a specific GitHub issue
#
# Usage: ./scripts/work-on-issue.sh [issue-number] [llm-command]
#
# Examples:
#   ./scripts/work-on-issue.sh 124 claude
#   ./scripts/work-on-issue.sh 147 codex
#   ./scripts/work-on-issue.sh https://github.com/Shivam-Bhardwaj/AutoCrate/issues/124 claude

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Parse arguments
if [ -z "$1" ]; then
    print_error "Please provide an issue number"
    echo "Usage: $0 [issue-number] [llm-command]"
    echo "Example: $0 124 claude"
    exit 1
fi

ISSUE_INPUT="$1"
LLM_COMMAND="${2:-claude}"  # Default to claude

# Extract issue number from URL if provided
if [[ "$ISSUE_INPUT" =~ ^https?://github.com/.*/issues/([0-9]+) ]]; then
    ISSUE_NUMBER="${BASH_REMATCH[1]}"
else
    ISSUE_NUMBER="$ISSUE_INPUT"
fi

# Get the project root directory (where this script's parent dir is)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

print_info "Setting up worktree for issue #$ISSUE_NUMBER"

# Run the worktree setup script
"${SCRIPT_DIR}/worktree-issue.sh" "$ISSUE_NUMBER"

# Change to the worktree directory
WORKTREE_DIR="${PROJECT_ROOT}/issues/${ISSUE_NUMBER}"

if [ ! -d "$WORKTREE_DIR" ]; then
    print_error "Worktree directory not found: $WORKTREE_DIR"
    exit 1
fi

cd "$WORKTREE_DIR"
print_success "Changed to worktree: $WORKTREE_DIR"

# Show context for the LLM
if [ -f "scripts/show-llm-context.sh" ]; then
    "${SCRIPT_DIR}/show-llm-context.sh"
else
    print_info "Context: You are in issues/$ISSUE_NUMBER on branch sbl-$ISSUE_NUMBER"
    print_info "Read .issue-context.md to understand the issue"
fi

echo ""
print_info "Launching $LLM_COMMAND..."
print_info "Paste this to the LLM when it starts:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat << 'EOF'
Read LLM_ONBOARDING.md for complete instructions.

CRITICAL: You are in an isolated worktree.
- Directory: issues/[NUMBER]/
- Branch: sbl-[NUMBER]
- DON'T navigate to ../repo/ or other directories
- DON'T switch branches

Start by reading: cat .issue-context.md
EOF
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Give user time to read
sleep 2

exec "$LLM_COMMAND"
