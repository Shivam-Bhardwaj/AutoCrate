#!/bin/bash

# Show LLM Context
# Displays important context information for AI assistants
# Run this at the start of any LLM session

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}          AutoCrate - LLM Development Context${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check where we are
CURRENT_DIR=$(pwd)
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

echo -e "${BLUE}📍 Current Location:${NC}"
echo "   Directory: $CURRENT_DIR"
echo "   Branch: $CURRENT_BRANCH"
echo ""

# Detect if in worktree
if [[ "$CURRENT_DIR" =~ /issues/([0-9]+)/?$ ]]; then
    ISSUE_NUMBER="${BASH_REMATCH[1]}"
    echo -e "${GREEN}✓ You are in an ISSUE WORKTREE${NC}"
    echo "   Issue Number: #$ISSUE_NUMBER"
    echo "   Expected Branch: sbl-$ISSUE_NUMBER"

    if [ "$CURRENT_BRANCH" == "sbl-$ISSUE_NUMBER" ]; then
        echo -e "   ${GREEN}✓ On correct branch${NC}"
    else
        echo -e "   ${YELLOW}⚠ Branch mismatch! Expected sbl-$ISSUE_NUMBER, got $CURRENT_BRANCH${NC}"
    fi
    echo ""

    # Check for issue context file
    if [ -f ".issue-context.md" ]; then
        echo -e "${BLUE}📋 Issue Context:${NC}"
        echo "   File: .issue-context.md"
        echo ""
        echo -e "${CYAN}   First, read your issue:${NC}"
        echo "   $ cat .issue-context.md"
        echo ""
    fi

    echo -e "${BLUE}📖 Quick Start:${NC}"
    echo "   1. Read issue:     cat .issue-context.md"
    echo "   2. Make changes:   (edit files)"
    echo "   3. Test:           npm test"
    echo "   4. Commit:         git add . && git commit -m 'fix: ...'"
    echo "   5. Push:           git push origin sbl-$ISSUE_NUMBER"
    echo "   6. Create PR:      gh pr create --base main"
    echo ""

elif [[ "$CURRENT_DIR" =~ /repo/?$ ]] || [ "$CURRENT_BRANCH" == "main" ]; then
    echo -e "${YELLOW}⚠ You are in the MAIN WORKTREE${NC}"
    echo "   This is for general maintenance, not issue work."
    echo ""
    echo -e "${BLUE}To work on an issue:${NC}"
    echo "   $ ./scripts/work-on-issue.sh [issue-number] [llm-name]"
    echo "   Example: ./scripts/work-on-issue.sh 124 codex"
    echo ""
else
    echo -e "${YELLOW}⚠ Unknown location${NC}"
    echo "   You may not be in the correct directory."
    echo ""
fi

echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - Complete guide:     LLM_ONBOARDING.md"
echo "   - Worktree workflow:  WORKTREE_WORKFLOW.md"
echo "   - Development guide:  CLAUDE.md"
echo ""

echo -e "${BLUE}❗ Important Rules:${NC}"
echo "   ${GREEN}✓${NC} Stay in your current worktree directory"
echo "   ${GREEN}✓${NC} Only modify files in your worktree"
echo "   ${GREEN}✓${NC} Stay on your assigned branch"
echo "   ${YELLOW}✗${NC} Don't navigate to other worktrees"
echo "   ${YELLOW}✗${NC} Don't navigate to ../repo/ or ../"
echo "   ${YELLOW}✗${NC} Don't switch branches"
echo ""

echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
