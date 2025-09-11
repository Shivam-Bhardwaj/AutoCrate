#!/bin/bash

# ====================================================================
# AutoCrate Agent Integration Script
# Integrates AI agents for development assistance
# ====================================================================

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Agent paths
AGENT_DIR="$HOME/agents/claude-agents"
RESEARCH_AGENT="$AGENT_DIR/research-agent.py"
TODO_AGENT="$AGENT_DIR/todo-agent.py"
AI_COMM="$AGENT_DIR/cli.py"
PROJECT_NAME="autocrate-web"

# Function to print colored text
print_color() {
    local color=$1
    shift
    echo -e "${color}$@${RESET}"
}

# Show interactive menu
show_menu() {
    clear
    print_color "$CYAN" "===================================================================="
    print_color "$BOLD$CYAN" "            AutoCrate Agent Integration System"
    print_color "$CYAN" "===================================================================="
    echo
    print_color "$YELLOW" "Quick Actions:"
    echo -e "  ${GREEN}[1]${RESET} Analyze Project Idea"
    echo -e "  ${GREEN}[2]${RESET} Manage TODOs"
    echo -e "  ${GREEN}[3]${RESET} Delegate to Qwen (Coding)"
    echo -e "  ${GREEN}[4]${RESET} Ask Gemini (Documentation)"
    echo -e "  ${GREEN}[5]${RESET} Check Agent Status"
    echo
    print_color "$YELLOW" "AutoCrate Specific:"
    echo -e "  ${GREEN}[6]${RESET} Plan New Feature"
    echo -e "  ${GREEN}[7]${RESET} Implement Feature"
    echo -e "  ${GREEN}[8]${RESET} Review Code Changes"
    echo -e "  ${GREEN}[9]${RESET} Generate Documentation"
    echo
    print_color "$YELLOW" "Utilities:"
    echo -e "  ${GREEN}[H]${RESET} Show Help"
    echo -e "  ${GREEN}[Q]${RESET} Quit"
    echo
    print_color "$CYAN" "===================================================================="
    echo
    read -p "Select option: " choice
    
    case $choice in
        1) analyze_interactive ;;
        2) todo_interactive ;;
        3) delegate_interactive ;;
        4) ask_interactive ;;
        5) status ;;
        6) plan_interactive ;;
        7) implement_interactive ;;
        8) review_interactive ;;
        9) docs_interactive ;;
        [Hh]) show_help; read -p "Press Enter to continue..." ;;
        [Qq]) exit 0 ;;
        *) show_menu ;;
    esac
}

# Research functions
research() {
    local idea="$*"
    if [[ -z "$idea" ]]; then
        print_color "$RED" "Error: Please provide an idea to research"
        return 1
    fi
    print_color "$CYAN" "Analyzing idea: $idea"
    python3 "$RESEARCH_AGENT" "{\"command\": \"analyze\", \"idea\": \"$idea\", \"project\": \"$PROJECT_NAME\"}"
}

analyze_interactive() {
    echo
    read -p "Enter idea to analyze: " idea
    research "$idea"
    read -p "Press Enter to continue..."
    show_menu
}

analyze_project() {
    print_color "$CYAN" "Analyzing AutoCrate project for improvements..."
    python3 "$RESEARCH_AGENT" "{\"command\": \"analyze\", \"idea\": \"Improve AutoCrate 3D visualization and NX CAD generation\", \"project\": \"$PROJECT_NAME\"}"
}

# TODO Management functions
todo() {
    local action="$1"
    shift
    
    case "$action" in
        add)
            local title="$*"
            if [[ -z "$title" ]]; then
                print_color "$RED" "Error: Please provide a task title"
                return 1
            fi
            python3 "$TODO_AGENT" "{\"action\": \"add\", \"params\": {\"title\": \"$title\", \"project\": \"$PROJECT_NAME\", \"priority\": \"medium\"}}"
            ;;
        list)
            print_color "$CYAN" "TODOs for $PROJECT_NAME:"
            python3 "$TODO_AGENT" "{\"action\": \"list\", \"params\": {\"project\": \"$PROJECT_NAME\"}}"
            ;;
        update)
            local id="$1"
            local status="$2"
            if [[ -z "$id" ]]; then
                print_color "$RED" "Error: Please provide TODO ID"
                return 1
            fi
            python3 "$TODO_AGENT" "{\"action\": \"update\", \"params\": {\"id\": $id, \"status\": \"$status\"}}"
            ;;
        report)
            print_color "$CYAN" "Generating TODO report..."
            python3 "$TODO_AGENT" "{\"action\": \"report\", \"params\": {\"project\": \"$PROJECT_NAME\"}}"
            ;;
        *)
            todo list
            ;;
    esac
}

todo_interactive() {
    while true; do
        echo
        print_color "$YELLOW" "TODO Management:"
        echo "  [1] List TODOs"
        echo "  [2] Add TODO"
        echo "  [3] Update TODO"
        echo "  [4] Generate Report"
        echo "  [B] Back"
        echo
        read -p "Select option: " todo_choice
        
        case $todo_choice in
            1)
                todo list
                read -p "Press Enter to continue..."
                ;;
            2)
                read -p "Enter task: " task
                todo add "$task"
                read -p "Press Enter to continue..."
                ;;
            3)
                todo list
                echo
                read -p "Enter TODO ID: " id
                echo "Status options: todo, in_progress, done, blocked"
                read -p "Enter new status: " status
                todo update "$id" "$status"
                read -p "Press Enter to continue..."
                ;;
            4)
                todo report
                read -p "Press Enter to continue..."
                ;;
            [Bb])
                show_menu
                return
                ;;
        esac
    done
}

# AI Communication functions
delegate() {
    local agent="$1"
    local task="$2"
    local description="$3"
    
    if [[ -z "$agent" ]]; then
        print_color "$RED" "Error: Specify agent (qwen or gemini)"
        return 1
    fi
    if [[ -z "$task" ]]; then
        print_color "$RED" "Error: Provide task title"
        return 1
    fi
    
    print_color "$CYAN" "Delegating to $agent: $task"
    python3 "$AI_COMM" delegate "$agent" "$task" "$description" --priority high --project "$PROJECT_NAME"
}

ask() {
    local agent="$1"
    shift
    local question="$*"
    
    if [[ -z "$agent" ]]; then
        print_color "$RED" "Error: Specify agent (qwen or gemini)"
        return 1
    fi
    
    print_color "$CYAN" "Asking $agent: $question"
    python3 "$AI_COMM" ask "$agent" "$question"
}

status() {
    print_color "$CYAN" "Agent Communication Status:"
    python3 "$AI_COMM" status
}

delegate_interactive() {
    echo
    print_color "$YELLOW" "Delegate to AI Agent:"
    echo "  [1] Qwen (Coding tasks)"
    echo "  [2] Gemini (Documentation)"
    echo "  [B] Back"
    echo
    read -p "Select agent: " del_choice
    
    case $del_choice in
        1) agent="qwen" ;;
        2) agent="gemini" ;;
        [Bb]) show_menu; return ;;
        *) show_menu; return ;;
    esac
    
    read -p "Enter task title: " task
    read -p "Enter description: " desc
    delegate "$agent" "$task" "$desc"
    read -p "Press Enter to continue..."
    show_menu
}

ask_interactive() {
    echo
    print_color "$YELLOW" "Ask AI Agent:"
    echo "  [1] Qwen (Technical questions)"
    echo "  [2] Gemini (Documentation questions)"
    echo "  [B] Back"
    echo
    read -p "Select agent: " ask_choice
    
    case $ask_choice in
        1) agent="qwen" ;;
        2) agent="gemini" ;;
        [Bb]) show_menu; return ;;
        *) show_menu; return ;;
    esac
    
    read -p "Enter question: " question
    ask "$agent" "$question"
    read -p "Press Enter to continue..."
    show_menu
}

# AutoCrate specific features
plan_feature() {
    print_color "$CYAN" "Planning new AutoCrate feature..."
    echo
    echo "Delegating planning to Gemini..."
    python3 "$AI_COMM" delegate gemini "Plan AutoCrate Feature" "Create detailed plan for new feature: Enhanced 3D controls with touch gestures, material selection, and real-time dimension editing" --priority high
    echo
    echo "Creating research task..."
    python3 "$RESEARCH_AGENT" "{\"command\": \"analyze\", \"idea\": \"Add material selection and cost calculation to AutoCrate\", \"project\": \"$PROJECT_NAME\"}"
}

plan_interactive() {
    read -p "Enter feature to plan: " feature
    print_color "$CYAN" "Planning: $feature"
    python3 "$AI_COMM" delegate gemini "Plan: $feature" "Create detailed implementation plan for AutoCrate" --priority high
    read -p "Press Enter to continue..."
    show_menu
}

implement_feature() {
    print_color "$CYAN" "Starting feature implementation workflow..."
    echo
    echo "Step 1: Delegating backend to Qwen..."
    python3 "$AI_COMM" delegate qwen "Implement AutoCrate Backend" "Add API endpoints for material selection and cost calculation" --priority high
    echo
    echo "Step 2: Adding TODO items..."
    python3 "$TODO_AGENT" "{\"action\": \"add\", \"params\": {\"title\": \"Implement material selection UI\", \"project\": \"$PROJECT_NAME\", \"priority\": \"high\"}}"
    python3 "$TODO_AGENT" "{\"action\": \"add\", \"params\": {\"title\": \"Add cost calculation service\", \"project\": \"$PROJECT_NAME\", \"priority\": \"high\"}}"
    python3 "$TODO_AGENT" "{\"action\": \"add\", \"params\": {\"title\": \"Update 3D viewer for materials\", \"project\": \"$PROJECT_NAME\", \"priority\": \"medium\"}}"
}

implement_interactive() {
    read -p "Enter feature to implement: " feature
    print_color "$CYAN" "Implementing: $feature"
    python3 "$AI_COMM" delegate qwen "Implement: $feature" "Write code for AutoCrate feature" --priority high
    python3 "$TODO_AGENT" "{\"action\": \"add\", \"params\": {\"title\": \"Implement $feature\", \"project\": \"$PROJECT_NAME\", \"priority\": \"high\"}}"
    read -p "Press Enter to continue..."
    show_menu
}

review_code() {
    print_color "$CYAN" "Reviewing AutoCrate code changes..."
    git status --short
    echo
    echo "Analyzing changes..."
    python3 "$RESEARCH_AGENT" "{\"command\": \"analyze\", \"idea\": \"Review recent code changes for performance and best practices\", \"project\": \"$PROJECT_NAME\"}"
}

review_interactive() {
    review_code
    read -p "Press Enter to continue..."
    show_menu
}

docs_interactive() {
    echo
    read -p "Enter component to document: " component
    print_color "$CYAN" "Generating documentation for: $component"
    python3 "$AI_COMM" delegate gemini "Document $component" "Create comprehensive documentation for AutoCrate $component" --priority medium
    read -p "Press Enter to continue..."
    show_menu
}

# Help function
show_help() {
    echo
    print_color "$CYAN" "AutoCrate Agent Integration System - Help"
    print_color "$CYAN" "========================================="
    echo
    print_color "$YELLOW" "Available Commands:"
    echo
    print_color "$GREEN" "Research & Analysis:"
    echo "  ./agents.sh research \"idea\"           - Analyze a project idea"
    echo "  ./agents.sh analyze                   - Analyze AutoCrate for improvements"
    echo
    print_color "$GREEN" "TODO Management:"
    echo "  ./agents.sh todo                      - List all TODOs"
    echo "  ./agents.sh todo add \"task\"           - Add a new TODO"
    echo "  ./agents.sh todo update ID STATUS     - Update TODO status"
    echo "  ./agents.sh todo report               - Generate markdown report"
    echo
    print_color "$GREEN" "AI Delegation:"
    echo "  ./agents.sh delegate qwen \"task\" \"description\"    - Delegate coding to Qwen"
    echo "  ./agents.sh delegate gemini \"task\" \"description\"  - Delegate docs to Gemini"
    echo "  ./agents.sh ask qwen \"question\"                   - Ask Qwen a question"
    echo "  ./agents.sh ask gemini \"question\"                 - Ask Gemini a question"
    echo "  ./agents.sh status                                 - Check delegation status"
    echo
    print_color "$GREEN" "AutoCrate Features:"
    echo "  ./agents.sh plan                      - Plan new feature"
    echo "  ./agents.sh implement                 - Start implementation workflow"
    echo "  ./agents.sh review                    - Review code changes"
    echo
    print_color "$YELLOW" "Interactive Mode:"
    echo "  ./agents.sh                           - Launch interactive menu"
    echo
    print_color "$CYAN" "Agent Specializations:"
    echo "  - Claude: Orchestration, analysis, coordination"
    echo "  - Qwen: Coding, implementation, testing"
    echo "  - Gemini: Documentation, planning, strategy"
    echo
}

# Main script logic
main() {
    if [[ $# -eq 0 ]]; then
        show_menu
        exit 0
    fi
    
    COMMAND="$1"
    shift
    
    case "$COMMAND" in
        research)
            research "$@"
            ;;
        todo)
            todo "$@"
            ;;
        delegate)
            delegate "$@"
            ;;
        ask)
            ask "$@"
            ;;
        status)
            status
            ;;
        analyze)
            analyze_project
            ;;
        plan)
            plan_feature
            ;;
        implement)
            implement_feature
            ;;
        review)
            review_code
            ;;
        help)
            show_help
            ;;
        *)
            print_color "$RED" "Error: Unknown command '$COMMAND'"
            echo "Use './agents.sh help' for available commands"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"