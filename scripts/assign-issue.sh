#!/bin/bash

# Assign Issue to LLM
# Creates/updates an assignment tracker for who's working on what
#
# Usage: ./scripts/assign-issue.sh [issue-number] [llm-name] [--start]
#
# Examples:
#   ./scripts/assign-issue.sh 124 claude          # Assign issue
#   ./scripts/assign-issue.sh 124 claude --start  # Assign and launch
#   ./scripts/assign-issue.sh --list              # Show assignments
#   ./scripts/assign-issue.sh --free 124          # Free up issue

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ASSIGNMENTS_FILE="${PROJECT_ROOT}/.issue-assignments.json"

# Initialize assignments file if doesn't exist
if [ ! -f "$ASSIGNMENTS_FILE" ]; then
    echo '{}' > "$ASSIGNMENTS_FILE"
fi

# Function to list assignments
list_assignments() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}          Current Issue Assignments${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""

    if [ ! -s "$ASSIGNMENTS_FILE" ] || [ "$(cat "$ASSIGNMENTS_FILE")" = "{}" ]; then
        echo -e "${YELLOW}No issues currently assigned.${NC}"
        echo ""
        return
    fi

    # Parse JSON and display
    jq -r 'to_entries[] | "\(.key)|\(.value.llm)|\(.value.assigned_at)|\(.value.status)"' "$ASSIGNMENTS_FILE" | while IFS='|' read -r issue llm assigned_at status; do
        # Check if worktree exists
        if [ -d "${PROJECT_ROOT}/issues/${issue}" ]; then
            worktree_status="${GREEN}✓ Active${NC}"
        else
            worktree_status="${RED}✗ No worktree${NC}"
        fi

        # Check if issue still open
        if command -v gh &> /dev/null; then
            issue_state=$(gh issue view "$issue" --json state -q .state 2>&1 || echo "UNKNOWN")
            if [ "$issue_state" = "OPEN" ]; then
                github_status="${YELLOW}OPEN${NC}"
            elif [ "$issue_state" = "CLOSED" ]; then
                github_status="${GREEN}CLOSED${NC}"
            else
                github_status="${RED}ERROR${NC}"
            fi
        else
            github_status="${BLUE}N/A${NC}"
        fi

        echo -e "${BLUE}Issue #${issue}${NC}"
        echo "  Assigned to: ${CYAN}${llm}${NC}"
        echo "  Assigned: ${assigned_at}"
        echo "  Status: ${github_status} | ${worktree_status}"
        echo ""
    done
}

# Function to assign issue
assign_issue() {
    local issue=$1
    local llm=$2

    # Check if already assigned
    existing=$(jq -r ".\"${issue}\" // empty" "$ASSIGNMENTS_FILE")
    if [ -n "$existing" ]; then
        existing_llm=$(echo "$existing" | jq -r '.llm')
        echo -e "${YELLOW}Issue #${issue} is already assigned to ${existing_llm}${NC}"
        read -p "Reassign to ${llm}? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Cancelled."
            return 1
        fi
    fi

    # Add assignment
    jq ".\"${issue}\" = {\"llm\": \"${llm}\", \"assigned_at\": \"$(date -Iseconds)\", \"status\": \"assigned\"}" "$ASSIGNMENTS_FILE" > "${ASSIGNMENTS_FILE}.tmp"
    mv "${ASSIGNMENTS_FILE}.tmp" "$ASSIGNMENTS_FILE"

    echo -e "${GREEN}✓ Assigned issue #${issue} to ${llm}${NC}"
    return 0
}

# Function to free issue
free_issue() {
    local issue=$1

    existing=$(jq -r ".\"${issue}\" // empty" "$ASSIGNMENTS_FILE")
    if [ -z "$existing" ]; then
        echo -e "${RED}Issue #${issue} is not assigned${NC}"
        return 1
    fi

    jq "del(.\"${issue}\")" "$ASSIGNMENTS_FILE" > "${ASSIGNMENTS_FILE}.tmp"
    mv "${ASSIGNMENTS_FILE}.tmp" "$ASSIGNMENTS_FILE"

    echo -e "${GREEN}✓ Freed issue #${issue}${NC}"
}

# Function to update status
update_status() {
    local issue=$1
    local new_status=$2

    existing=$(jq -r ".\"${issue}\" // empty" "$ASSIGNMENTS_FILE")
    if [ -z "$existing" ]; then
        echo -e "${RED}Issue #${issue} is not assigned${NC}"
        return 1
    fi

    jq ".\"${issue}\".status = \"${new_status}\" | .\"${issue}\".updated_at = \"$(date -Iseconds)\"" "$ASSIGNMENTS_FILE" > "${ASSIGNMENTS_FILE}.tmp"
    mv "${ASSIGNMENTS_FILE}.tmp" "$ASSIGNMENTS_FILE"

    echo -e "${GREEN}✓ Updated issue #${issue} status to: ${new_status}${NC}"
}

# Parse arguments
case "${1:-}" in
    --list|-l)
        list_assignments
        exit 0
        ;;
    --free|-f)
        if [ -z "$2" ]; then
            echo "Usage: $0 --free [issue-number]"
            exit 1
        fi
        free_issue "$2"
        exit 0
        ;;
    --status|-s)
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Usage: $0 --status [issue-number] [status]"
            exit 1
        fi
        update_status "$2" "$3"
        exit 0
        ;;
    --help|-h)
        cat << EOF
Issue Assignment Tracker

Usage:
  $0 [issue-number] [llm-name] [--start]    Assign issue to LLM
  $0 --list                                  List all assignments
  $0 --free [issue-number]                   Free up issue
  $0 --status [issue-number] [status]        Update status
  $0 --help                                  Show this help

Examples:
  $0 124 claude                 # Assign issue #124 to Claude
  $0 124 claude --start         # Assign and launch Claude
  $0 147 codex --start          # Assign and launch Codex
  $0 --list                     # Show all assignments
  $0 --free 124                 # Free issue #124
  $0 --status 124 "in-progress" # Update status

Statuses: assigned, in-progress, testing, done
EOF
        exit 0
        ;;
    "")
        echo "Usage: $0 [issue-number] [llm-name] [--start]"
        echo "       $0 --list"
        echo "       $0 --help"
        exit 1
        ;;
esac

# Assign issue
ISSUE_NUMBER=$1
LLM_NAME=${2:-claude}
START_FLAG=$3

if ! assign_issue "$ISSUE_NUMBER" "$LLM_NAME"; then
    exit 1
fi

# Show updated assignments
echo ""
list_assignments

# Start working if requested
if [ "$START_FLAG" = "--start" ]; then
    echo ""
    echo -e "${BLUE}Launching ${LLM_NAME} on issue #${ISSUE_NUMBER}...${NC}"
    exec "${SCRIPT_DIR}/work-on-issue.sh" "$ISSUE_NUMBER" "$LLM_NAME"
fi
