#!/bin/bash

# Multi-File Helper for AutoCrate Development
# This script helps open and work with multiple files simultaneously
# Usage: ./scripts/multi-file-helper.sh [command] [options]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Function to print usage
show_usage() {
    cat << EOF
${CYAN}AutoCrate Multi-File Helper${NC}

${GREEN}Usage:${NC}
  $0 [command] [options]

${GREEN}Commands:${NC}
  ${BLUE}core${NC}        Open core files (page.tsx, nx-generator, CrateVisualizer)
  ${BLUE}ui${NC}          Open all UI components
  ${BLUE}lib${NC}         Open all library files
  ${BLUE}tests${NC}       Open all test files
  ${BLUE}api${NC}         Open all API route files
  ${BLUE}hardware${NC}    Open hardware-related files (klimp, lag, cleat)
  ${BLUE}step${NC}        Open STEP export related files
  ${BLUE}plywood${NC}     Open plywood optimization files
  ${BLUE}search${NC}      Search for pattern across all files
  ${BLUE}recent${NC}      Show recently modified files
  ${BLUE}todo${NC}        Find all TODO/FIXME comments
  ${BLUE}issue${NC}       Quick issue setup (shortcut to issue-workflow.sh)
  ${BLUE}status${NC}      Show project status and current work

${GREEN}Examples:${NC}
  $0 core         # Open core files for editing
  $0 search "PMI" # Search for PMI across codebase
  $0 recent 10    # Show 10 most recently modified files
  $0 todo         # Find all TODO comments
  $0 issue 77     # Start working on issue #77

${GREEN}Quick File Groups:${NC}
  ${YELLOW}Core System:${NC}
    - src/app/page.tsx
    - src/lib/nx-generator.ts
    - src/components/CrateVisualizer.tsx

  ${YELLOW}Hardware:${NC}
    - src/lib/klimp-calculator.ts
    - src/lib/lag-step-integration.ts
    - src/lib/cleat-calculator.ts

  ${YELLOW}UI Components:${NC}
    - src/components/*.tsx

  ${YELLOW}Tests:${NC}
    - src/lib/__tests__/*.test.ts
    - src/components/__tests__/*.test.tsx
    - tests/e2e/*.spec.ts

EOF
}

# Function to open files in editor (customize based on your preference)
open_files() {
    local files="$@"
    echo -e "${BLUE}Files to open:${NC}"
    for file in $files; do
        if [ -f "$file" ] || [ -d "$file" ]; then
            echo "  ✓ $file"
        else
            echo "  ✗ $file (not found)"
        fi
    done

    echo ""
    echo -e "${GREEN}File paths ready for editing:${NC}"
    echo "$files"

    # Copy to clipboard if xclip is available
    if command -v xclip &> /dev/null; then
        echo "$files" | xclip -selection clipboard
        echo -e "${CYAN}Files copied to clipboard!${NC}"
    fi
}

# Function to search files
search_pattern() {
    local pattern="$1"
    echo -e "${BLUE}Searching for: ${YELLOW}$pattern${NC}"
    echo ""

    # Use grep with context
    grep -rn "$pattern" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | head -50 || true

    echo ""
    echo -e "${GREEN}To open files containing this pattern:${NC}"
    echo "grep -l \"$pattern\" src/**/*.{ts,tsx} | xargs"
}

# Function to show recent files
show_recent() {
    local count="${1:-20}"
    echo -e "${BLUE}$count most recently modified files:${NC}"
    echo ""

    find src/ tests/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec ls -lt {} + 2>/dev/null | head -"$count"
}

# Function to find TODOs
find_todos() {
    echo -e "${BLUE}TODO/FIXME/HACK comments in codebase:${NC}"
    echo ""

    grep -rn "TODO\|FIXME\|HACK\|XXX" src/ tests/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || true
}

# Function to show project status
show_status() {
    echo -e "${CYAN}=== AutoCrate Project Status ===${NC}"
    echo ""

    # Git status
    echo -e "${BLUE}Git Status:${NC}"
    git status --short
    echo ""

    # Current branch
    echo -e "${BLUE}Current Branch:${NC}"
    git branch --show-current
    echo ""

    # Recent commits
    echo -e "${BLUE}Recent Commits:${NC}"
    git log --oneline -5
    echo ""

    # Open issues (if gh CLI is available)
    if command -v gh &> /dev/null; then
        echo -e "${BLUE}Open Issues:${NC}"
        gh issue list --limit 5
    fi
}

# Main command handler
case "$1" in
    core)
        open_files "src/app/page.tsx src/lib/nx-generator.ts src/components/CrateVisualizer.tsx PROJECT_DNA.md"
        ;;

    ui)
        open_files src/components/*.tsx
        ;;

    lib)
        open_files src/lib/*.ts
        ;;

    tests)
        open_files "src/lib/__tests__/*.test.ts src/components/__tests__/*.test.tsx tests/e2e/*.spec.ts"
        ;;

    api)
        open_files src/app/api/*/route.ts
        ;;

    hardware)
        open_files "src/lib/klimp-calculator.ts src/lib/klimp-step-integration.ts src/lib/lag-step-integration.ts src/lib/cleat-calculator.ts src/components/KlimpModel.tsx"
        ;;

    step)
        open_files "src/lib/step-generator.ts src/lib/klimp-step-integration.ts src/lib/lag-step-integration.ts src/lib/__tests__/step-generator.test.ts"
        ;;

    plywood)
        open_files "src/lib/plywood-splicing.ts src/components/PlywoodPieceSelector.tsx src/components/PlywoodSpliceVisualization.tsx"
        ;;

    search)
        if [ -z "$2" ]; then
            echo -e "${RED}Please provide a search pattern${NC}"
            echo "Usage: $0 search \"pattern\""
            exit 1
        fi
        search_pattern "$2"
        ;;

    recent)
        show_recent "$2"
        ;;

    todo)
        find_todos
        ;;

    issue)
        if [ -z "$2" ]; then
            echo -e "${RED}Please provide an issue number${NC}"
            echo "Usage: $0 issue 77"
            exit 1
        fi
        ./scripts/issue-workflow.sh "$2"
        ;;

    status)
        show_status
        ;;

    *)
        show_usage
        ;;
esac