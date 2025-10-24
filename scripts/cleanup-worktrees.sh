#!/bin/bash

# Cleanup Worktrees Script
# Removes worktrees for closed/merged issues
# Usage: ./scripts/cleanup-worktrees.sh [--dry-run] [issue-number...]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

DRY_RUN=false
SPECIFIC_ISSUES=()

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [--dry-run] [issue-number...]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would be removed without actually removing"
            echo "  --help       Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Interactive: check all worktrees"
            echo "  $0 --dry-run          # Show what would be removed"
            echo "  $0 124 145 147        # Remove specific issues"
            exit 0
            ;;
        *)
            SPECIFIC_ISSUES+=("$1")
            shift
            ;;
    esac
done

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    print_warning "GitHub CLI (gh) not found. Will only check local git state."
    CHECK_GITHUB=false
else
    CHECK_GITHUB=true
fi

# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

if [ ! -d ".git" ]; then
    print_error "Not in a git repository"
    exit 1
fi

print_info "Scanning worktrees..."
echo ""

# Get all worktrees
WORKTREES=$(git worktree list | grep "issues/" | awk '{print $1}')

if [ -z "$WORKTREES" ]; then
    print_info "No issue worktrees found."
    exit 0
fi

TO_REMOVE=()

# Check each worktree
for worktree in $WORKTREES; do
    # Extract issue number
    if [[ "$worktree" =~ issues/([0-9]+)/?$ ]]; then
        ISSUE_NUM="${BASH_REMATCH[1]}"
    else
        continue
    fi

    # If specific issues provided, only process those
    if [ ${#SPECIFIC_ISSUES[@]} -gt 0 ]; then
        if [[ ! " ${SPECIFIC_ISSUES[@]} " =~ " ${ISSUE_NUM} " ]]; then
            continue
        fi
    fi

    BRANCH_NAME="sbl-${ISSUE_NUM}"

    echo -e "${BLUE}Issue #${ISSUE_NUM}${NC} (${worktree})"

    # Check GitHub status if available
    if [ "$CHECK_GITHUB" = true ]; then
        ISSUE_STATE=$(gh issue view "$ISSUE_NUM" --json state -q .state 2>&1 || echo "NOT_FOUND")

        if [ "$ISSUE_STATE" = "CLOSED" ]; then
            echo "  Status: ${GREEN}CLOSED${NC} ✓"
            TO_REMOVE+=("$ISSUE_NUM:$worktree:$BRANCH_NAME")
        elif [ "$ISSUE_STATE" = "OPEN" ]; then
            echo "  Status: ${YELLOW}OPEN${NC} (keeping)"
        elif [[ "$ISSUE_STATE" =~ "Could not resolve" ]]; then
            echo "  Status: ${RED}DELETED${NC} (issue doesn't exist)"
            TO_REMOVE+=("$ISSUE_NUM:$worktree:$BRANCH_NAME")
        else
            echo "  Status: ${YELLOW}UNKNOWN${NC} (error: $ISSUE_STATE)"
        fi
    fi

    # Check if branch is merged
    if git branch --merged main | grep -q "^[[:space:]]*${BRANCH_NAME}$"; then
        echo "  Branch: ${GREEN}MERGED${NC} into main"
        if [[ ! " ${TO_REMOVE[@]} " =~ " ${ISSUE_NUM}: " ]]; then
            TO_REMOVE+=("$ISSUE_NUM:$worktree:$BRANCH_NAME")
        fi
    else
        echo "  Branch: Not merged"
    fi

    # Check if remote branch exists
    if git ls-remote --heads origin "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
        echo "  Remote: ${YELLOW}EXISTS${NC} on origin"
    else
        echo "  Remote: ${GREEN}DELETED${NC} from origin"
    fi

    echo ""
done

# Summary
if [ ${#TO_REMOVE[@]} -eq 0 ]; then
    print_info "No worktrees to remove."
    exit 0
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Worktrees to remove:${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"

for item in "${TO_REMOVE[@]}"; do
    IFS=':' read -r issue_num worktree branch <<< "$item"
    echo "  - Issue #${issue_num}: ${worktree}"
done

echo ""

if [ "$DRY_RUN" = true ]; then
    print_warning "DRY RUN - No changes will be made"
    exit 0
fi

# Ask for confirmation unless specific issues were provided
if [ ${#SPECIFIC_ISSUES[@]} -eq 0 ]; then
    read -p "Remove these worktrees? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cancelled."
        exit 0
    fi
fi

# Remove worktrees
echo ""
print_info "Removing worktrees..."

for item in "${TO_REMOVE[@]}"; do
    IFS=':' read -r issue_num worktree branch <<< "$item"

    print_info "Removing worktree: issues/${issue_num}"

    # Remove worktree (with force in case of uncommitted changes)
    if git worktree remove "$worktree" --force 2>/dev/null; then
        print_success "Removed worktree: issues/${issue_num}"
    else
        print_error "Failed to remove worktree: issues/${issue_num}"
        continue
    fi

    # Delete local branch
    if git branch -D "$branch" 2>/dev/null; then
        print_success "Deleted local branch: ${branch}"
    else
        print_warning "Branch ${branch} may not exist or already deleted"
    fi

    # Ask about remote branch if it exists
    if git ls-remote --heads origin "$branch" | grep -q "$branch"; then
        print_warning "Remote branch ${branch} still exists"
        read -p "Delete remote branch ${branch}? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if git push origin --delete "$branch" 2>/dev/null; then
                print_success "Deleted remote branch: ${branch}"
            else
                print_error "Failed to delete remote branch: ${branch}"
            fi
        fi
    fi

    echo ""
done

# Prune worktrees
print_info "Pruning stale worktree references..."
git worktree prune

print_success "Cleanup complete!"
echo ""
print_info "Remaining worktrees:"
git worktree list
