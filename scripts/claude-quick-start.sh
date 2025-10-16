#!/bin/bash

# Claude Code Quick Start Script
# This script provides a quick way to start working on issues with Claude Code
# Usage: ./scripts/claude-quick-start.sh [issue-number]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     AutoCrate Claude Code Quick Start    ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# If issue number provided, use the issue workflow
if [ -n "$1" ]; then
    echo -e "${BLUE}Starting work on issue #$1...${NC}"
    ./scripts/issue-workflow.sh "$1"
    echo ""
    echo -e "${GREEN}✓ Issue workspace ready!${NC}"
    echo ""
    echo -e "${YELLOW}Quick commands for Claude Code:${NC}"
    echo "  Read PROJECT_DNA.md     # Get project context"
    echo "  Read .issue-context-$1.md  # Review issue details"
    echo "  npm test                # Run tests"
    echo "  npm run build           # Build project"
    echo ""
else
    # No issue specified, show general setup
    echo -e "${BLUE}Project Status:${NC}"
    git branch --show-current
    echo ""

    echo -e "${BLUE}Recent Issues (if available):${NC}"
    if command -v gh &> /dev/null; then
        gh issue list --limit 5 2>/dev/null || echo "  GitHub CLI not configured"
    else
        echo "  GitHub CLI not installed"
    fi
    echo ""

    echo -e "${YELLOW}Quick Start Options:${NC}"
    echo ""
    echo "1. Work on a specific issue:"
    echo "   ${GREEN}./scripts/claude-quick-start.sh [issue-number]${NC}"
    echo ""
    echo "2. Open core files for general work:"
    echo "   ${GREEN}./scripts/multi-file-helper.sh core${NC}"
    echo ""
    echo "3. Search for something specific:"
    echo "   ${GREEN}./scripts/multi-file-helper.sh search \"pattern\"${NC}"
    echo ""
    echo "4. Find TODOs in the codebase:"
    echo "   ${GREEN}./scripts/multi-file-helper.sh todo${NC}"
    echo ""
    echo "5. View project status:"
    echo "   ${GREEN}./scripts/multi-file-helper.sh status${NC}"
    echo ""

    # Show important files
    echo -e "${BLUE}Important Files for Claude Code:${NC}"
    echo "  • PROJECT_DNA.md - Essential project knowledge (READ FIRST)"
    echo "  • CLAUDE.md - AI assistant guidelines"
    echo "  • PROJECT_STATUS.md - Current work tracking"
    echo "  • WORK_LOG.md - Work history"
    echo ""

    # Check if dev server is running
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Dev server is running at http://localhost:3000${NC}"
    else
        echo -e "${YELLOW}ℹ Dev server not running. Start with: npm run dev${NC}"
    fi
    echo ""
fi

echo -e "${CYAN}Happy coding! 🚀${NC}"