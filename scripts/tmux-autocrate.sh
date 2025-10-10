#!/bin/bash
# AutoCrate Tmux Development Environment
# Creates a tmux session with optimal layout for parallel development

SESSION_NAME="autocrate"
REPO_DIR="/home/curious/workspace/projects/AutoCrate/repo"
CONTAINER_DIR="/home/curious/workspace/projects/AutoCrate/container"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== AutoCrate Tmux Development Environment ===${NC}\n"

# Check if session exists
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo -e "${YELLOW}Session '$SESSION_NAME' already exists.${NC}"
    echo "Options:"
    echo "  1. Attach to existing session: tmux attach -t $SESSION_NAME"
    echo "  2. Kill and recreate: tmux kill-session -t $SESSION_NAME && $0"
    exit 0
fi

echo -e "${BLUE}Creating new tmux session: $SESSION_NAME${NC}"

# Create new session (detached)
tmux new-session -d -s $SESSION_NAME -c $REPO_DIR

# Rename first window
tmux rename-window -t $SESSION_NAME:0 'Development'

# Split into 5 panes
# Layout:
# ┌──────────────────────┬──────────────────────┐
# │  Pane 0: Feature A   │  Pane 1: Feature B   │
# │  (Claude Code #1)    │  (Claude Code #2)    │
# ├──────────────────────┴──────────────────────┤
# │  Pane 2: Docker Logs                        │
# ├──────────────────────┬──────────────────────┤
# │  Pane 3: Test Runner │  Pane 4: Status      │
# └──────────────────────┴──────────────────────┘

# Pane 0: Already created (Feature A)
tmux send-keys -t $SESSION_NAME:0.0 "cd $REPO_DIR" C-m
tmux send-keys -t $SESSION_NAME:0.0 "echo -e '${GREEN}Pane 0: Feature A - Ready for work${NC}'" C-m
tmux send-keys -t $SESSION_NAME:0.0 "echo 'Usage: git checkout -b feature/NAME && claude code'" C-m
tmux send-keys -t $SESSION_NAME:0.0 "echo 'Current branch:'" C-m
tmux send-keys -t $SESSION_NAME:0.0 "git branch --show-current" C-m

# Pane 1: Split vertically (Feature B)
tmux split-window -h -t $SESSION_NAME:0.0 -c $REPO_DIR
tmux send-keys -t $SESSION_NAME:0.1 "echo -e '${GREEN}Pane 1: Feature B - Ready for work${NC}'" C-m
tmux send-keys -t $SESSION_NAME:0.1 "echo 'Usage: git checkout -b feature/NAME && claude code'" C-m
tmux send-keys -t $SESSION_NAME:0.1 "git branch --show-current" C-m

# Pane 2: Split bottom (Docker logs)
tmux split-window -v -t $SESSION_NAME:0.0 -c $CONTAINER_DIR
tmux send-keys -t $SESSION_NAME:0.2 "echo -e '${BLUE}Pane 2: Docker Environment${NC}'" C-m
tmux send-keys -t $SESSION_NAME:0.2 "echo 'Start: docker compose up'" C-m
tmux send-keys -t $SESSION_NAME:0.2 "echo 'Stop: Ctrl+C'" C-m

# Pane 3: Split bottom-left (Test runner)
tmux split-window -v -t $SESSION_NAME:0.1 -c $REPO_DIR
tmux send-keys -t $SESSION_NAME:0.3 "echo -e '${YELLOW}Pane 3: Test Runner${NC}'" C-m
tmux send-keys -t $SESSION_NAME:0.3 "echo 'Watch all: npm test:watch'" C-m
tmux send-keys -t $SESSION_NAME:0.3 "echo 'Watch specific: npm test -- --watch MODULE.test.ts'" C-m

# Pane 4: Split bottom-right (Status monitor)
tmux split-window -h -t $SESSION_NAME:0.3 -c $REPO_DIR
tmux send-keys -t $SESSION_NAME:0.4 "echo -e '${GREEN}Pane 4: Status Monitor${NC}'" C-m
tmux send-keys -t $SESSION_NAME:0.4 "scripts/parallel-work.sh" C-m

# Resize panes for optimal layout
# Top panes (0, 1) get 50% of height
# Bottom section gets 50%, split between docker (2) and tests/status (3, 4)
tmux resize-pane -t $SESSION_NAME:0.0 -y 20
tmux resize-pane -t $SESSION_NAME:0.2 -y 10

# Select first pane
tmux select-pane -t $SESSION_NAME:0.0

# Create additional windows for reference
# Window 1: Main branch (for reviewing)
tmux new-window -t $SESSION_NAME:1 -n 'Main' -c $REPO_DIR
tmux send-keys -t $SESSION_NAME:1 "git checkout main" C-m
tmux send-keys -t $SESSION_NAME:1 "echo 'Main branch - use for reviewing and merging'" C-m
tmux send-keys -t $SESSION_NAME:1 "git log --oneline --graph --all -10" C-m

# Window 2: Documentation
tmux new-window -t $SESSION_NAME:2 -n 'Docs' -c $REPO_DIR
tmux send-keys -t $SESSION_NAME:2 "echo 'Quick Reference:'" C-m
tmux send-keys -t $SESSION_NAME:2 "echo '  - CLAUDE.md: Development guide'" C-m
tmux send-keys -t $SESSION_NAME:2 "echo '  - PROJECT_STATUS.md: Current work status'" C-m
tmux send-keys -t $SESSION_NAME:2 "echo '  - MODULES.md: Module boundaries'" C-m
tmux send-keys -t $SESSION_NAME:2 "echo '  - WORK_LOG.md: Work history'" C-m
tmux send-keys -t $SESSION_NAME:2 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:2 "echo 'View a file: cat FILENAME.md | less'" C-m

# Select first window
tmux select-window -t $SESSION_NAME:0

echo ""
echo -e "${GREEN}✓ Tmux session created successfully!${NC}"
echo ""
echo "Attach to session:"
echo -e "  ${BLUE}tmux attach -t $SESSION_NAME${NC}"
echo ""
echo "Layout:"
echo "  Window 0 (Development):"
echo "    ├─ Pane 0: Feature A workspace"
echo "    ├─ Pane 1: Feature B workspace"
echo "    ├─ Pane 2: Docker logs"
echo "    ├─ Pane 3: Test runner"
echo "    └─ Pane 4: Status monitor"
echo "  Window 1 (Main): Main branch for review/merge"
echo "  Window 2 (Docs): Documentation reference"
echo ""
echo "Quick commands (inside tmux):"
echo "  Ctrl+a n          - Next window"
echo "  Ctrl+a p          - Previous window"
echo "  Ctrl+a 0/1/2      - Switch to window 0/1/2"
echo "  Alt+Arrow         - Navigate panes"
echo "  Ctrl+a z          - Zoom current pane"
echo "  Ctrl+a d          - Detach session"
echo ""
echo "Reattach anytime:"
echo "  tmux attach -t $SESSION_NAME"
echo ""
