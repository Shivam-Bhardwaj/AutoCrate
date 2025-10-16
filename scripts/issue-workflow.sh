#!/bin/bash

# AutoCrate Issue Workflow Script
# This script helps quickly set up and work on GitHub issues
# Usage: ./scripts/issue-workflow.sh [issue-number-or-url]
#
# Examples:
#   ./scripts/issue-workflow.sh 77
#   ./scripts/issue-workflow.sh https://github.com/Shivam-Bhardwaj/AutoCrate/issues/77
#
# Features:
# - Fetches issue details from GitHub
# - Creates feature branch automatically
# - Opens multiple files for editing
# - Sets up environment for the issue
# - Creates issue context file

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
    echo "Example: $0 77"
    echo "Example: $0 https://github.com/Shivam-Bhardwaj/AutoCrate/issues/77"
    exit 1
fi

# Extract issue number from URL if provided
ISSUE_INPUT="$1"
if [[ "$ISSUE_INPUT" =~ ^https?://github.com/.*/issues/([0-9]+) ]]; then
    ISSUE_NUMBER="${BASH_REMATCH[1]}"
else
    ISSUE_NUMBER="$ISSUE_INPUT"
fi

print_info "Working on issue #$ISSUE_NUMBER"

# Ensure we're in the project root
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    print_warning "You have uncommitted changes"
    read -p "Do you want to stash them? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash push -m "Stashed before working on issue #$ISSUE_NUMBER"
        print_success "Changes stashed"
    else
        print_error "Please commit or stash your changes first"
        exit 1
    fi
fi

# Ensure we're on main and up to date
print_info "Switching to main branch and pulling latest changes..."
git checkout main
git pull origin main

# Fetch issue details
print_info "Fetching issue details..."
ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title -q .title)
ISSUE_BODY=$(gh issue view "$ISSUE_NUMBER" --json body -q .body)
ISSUE_LABELS=$(gh issue view "$ISSUE_NUMBER" --json labels -q '.labels[].name' | tr '\n' ',' | sed 's/,$//')
ISSUE_URL="https://github.com/Shivam-Bhardwaj/AutoCrate/issues/$ISSUE_NUMBER"

print_success "Issue: $ISSUE_TITLE"

# Create branch name (sanitize title for branch name)
BRANCH_NAME=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
BRANCH_NAME="issue-${ISSUE_NUMBER}-${BRANCH_NAME}"
# Truncate if too long
if [ ${#BRANCH_NAME} -gt 50 ]; then
    BRANCH_NAME="${BRANCH_NAME:0:50}"
    BRANCH_NAME="${BRANCH_NAME%-}"  # Remove trailing dash if any
fi

print_info "Creating branch: $BRANCH_NAME"

# Create and switch to feature branch
git checkout -b "$BRANCH_NAME"

# Create issue context file
ISSUE_CONTEXT_FILE=".issue-context-${ISSUE_NUMBER}.md"
cat > "$ISSUE_CONTEXT_FILE" << EOF
# Issue #${ISSUE_NUMBER}: ${ISSUE_TITLE}

**URL**: ${ISSUE_URL}
**Branch**: ${BRANCH_NAME}
**Labels**: ${ISSUE_LABELS}
**Created**: $(date)

## Description

${ISSUE_BODY}

## Implementation Notes

_Add your implementation notes here as you work on the issue..._

## Files Modified

_List files as you modify them..._

## Testing

_Document your testing approach..._

## Checklist

- [ ] Code implementation complete
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Commit messages follow guidelines
- [ ] Ready for PR

## Commands

\`\`\`bash
# View this issue
gh issue view ${ISSUE_NUMBER}

# Create PR when ready
gh pr create --title "fix: ${ISSUE_TITLE}" --body "Closes #${ISSUE_NUMBER}" --assignee @me

# Run tests
npm test
npm run test:e2e

# Build project
npm run build
\`\`\`
EOF

print_success "Created issue context file: $ISSUE_CONTEXT_FILE"

# Determine which files to open based on issue labels
FILES_TO_OPEN=""

# Always open the issue context file
FILES_TO_OPEN="$ISSUE_CONTEXT_FILE"

# Add files based on labels
if [[ "$ISSUE_LABELS" == *"ui"* ]] || [[ "$ISSUE_LABELS" == *"frontend"* ]]; then
    FILES_TO_OPEN="$FILES_TO_OPEN src/app/page.tsx src/components/CrateVisualizer.tsx"
fi

if [[ "$ISSUE_LABELS" == *"calculation"* ]] || [[ "$ISSUE_LABELS" == *"backend"* ]]; then
    FILES_TO_OPEN="$FILES_TO_OPEN src/lib/nx-generator.ts"
fi

if [[ "$ISSUE_LABELS" == *"test"* ]]; then
    FILES_TO_OPEN="$FILES_TO_OPEN src/lib/__tests__/"
fi

if [[ "$ISSUE_LABELS" == *"step"* ]] || [[ "$ISSUE_LABELS" == *"export"* ]]; then
    FILES_TO_OPEN="$FILES_TO_OPEN src/lib/step-generator.ts"
fi

if [[ "$ISSUE_LABELS" == *"api"* ]]; then
    FILES_TO_OPEN="$FILES_TO_OPEN src/app/api/"
fi

# If no specific files determined, open common ones
if [ "$FILES_TO_OPEN" == "$ISSUE_CONTEXT_FILE" ]; then
    FILES_TO_OPEN="$FILES_TO_OPEN PROJECT_DNA.md src/app/page.tsx src/lib/nx-generator.ts"
fi

# Create a quick access script for this issue
QUICK_ACCESS_SCRIPT=".issue-${ISSUE_NUMBER}-quick.sh"
cat > "$QUICK_ACCESS_SCRIPT" << 'SCRIPT'
#!/bin/bash
# Quick access script for issue #ISSUE_NUMBER_PLACEHOLDER

echo "Loading issue #ISSUE_NUMBER_PLACEHOLDER context..."

# Show issue details
echo ""
gh issue view ISSUE_NUMBER_PLACEHOLDER

# Show current status
echo ""
echo "Current branch: $(git branch --show-current)"
echo "Modified files:"
git status --short

# Show recent commits
echo ""
echo "Recent commits for this issue:"
git log --oneline -5 --grep="#ISSUE_NUMBER_PLACEHOLDER"

echo ""
echo "Commands:"
echo "  npm test         - Run tests"
echo "  npm run build    - Build project"
echo "  gh pr create     - Create PR"
SCRIPT

sed -i "s/ISSUE_NUMBER_PLACEHOLDER/${ISSUE_NUMBER}/g" "$QUICK_ACCESS_SCRIPT"
chmod +x "$QUICK_ACCESS_SCRIPT"

print_success "Created quick access script: $QUICK_ACCESS_SCRIPT"

# Display summary
echo ""
print_success "Issue workspace ready!"
echo ""
echo "📋 Issue: #${ISSUE_NUMBER} - ${ISSUE_TITLE}"
echo "🌿 Branch: ${BRANCH_NAME}"
echo "📁 Context: ${ISSUE_CONTEXT_FILE}"
echo "🔧 Quick: ${QUICK_ACCESS_SCRIPT}"
echo ""
echo "Files to review:"
for file in $FILES_TO_OPEN; do
    echo "  - $file"
done
echo ""
echo "Next steps:"
echo "1. Review the issue context in ${ISSUE_CONTEXT_FILE}"
echo "2. Make your changes"
echo "3. Run tests: npm test"
echo "4. Commit with: git commit -m \"fix: ${ISSUE_TITLE} (#${ISSUE_NUMBER})\""
echo "5. Create PR: gh pr create --title \"fix: ${ISSUE_TITLE}\" --body \"Closes #${ISSUE_NUMBER}\""
echo ""
echo "To return to this issue context later:"
echo "  ./${QUICK_ACCESS_SCRIPT}"

# Add to gitignore if not already there
if ! grep -q "^.issue-context-" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Issue context files" >> .gitignore
    echo ".issue-context-*.md" >> .gitignore
    echo ".issue-*-quick.sh" >> .gitignore
    print_info "Added issue context files to .gitignore"
fi

print_success "Ready to work on issue #${ISSUE_NUMBER}!"