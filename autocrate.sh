#!/bin/bash

# AutoCrate Project Management Script
# A unified command-line interface for development, testing, and deployment

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Project information
PROJECT_NAME="AutoCrate"
VERSION=$(node -p "require('./package.json').version")

# Helper functions
print_header() {
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${WHITE}  $1${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_dependencies() {
    print_header "Checking Dependencies"
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        print_success "npm installed: $NPM_VERSION"
    else
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git installed: $GIT_VERSION"
    else
        print_warning "Git is not installed (optional)"
    fi
}

install_dependencies() {
    print_header "Installing Dependencies"
    print_info "Installing npm packages..."
    npm ci
    print_success "Dependencies installed successfully"
}

run_dev() {
    print_header "Starting Development Server"
    print_info "Starting Next.js development server..."
    print_info "Access the application at: ${CYAN}http://localhost:3000${NC}"
    npm run dev
}

run_build() {
    print_header "Building Production Bundle"
    print_info "Creating optimized production build..."
    npm run build
    print_success "Build completed successfully"
}

run_start() {
    print_header "Starting Production Server"
    print_info "Starting production server..."
    npm start
}

run_tests() {
    print_header "Running Test Suite"
    
    echo -e "${MAGENTA}Select test type:${NC}"
    echo "1) All tests"
    echo "2) Unit tests only"
    echo "3) Integration tests only"
    echo "4) E2E tests only"
    echo "5) Test with coverage"
    echo "6) Test in watch mode"
    echo "7) Open test UI"
    
    read -p "Enter choice [1-7]: " test_choice
    
    case $test_choice in
        1)
            print_info "Running all tests..."
            npm run test:all
            ;;
        2)
            print_info "Running unit tests..."
            npm run test:unit
            ;;
        3)
            print_info "Running integration tests..."
            npm run test:integration
            ;;
        4)
            print_info "Running E2E tests..."
            npm run e2e
            ;;
        5)
            print_info "Running tests with coverage..."
            npm run test:coverage
            ;;
        6)
            print_info "Starting test watch mode..."
            npm run test:watch
            ;;
        7)
            print_info "Opening Vitest UI..."
            npm run test:ui
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

run_lint() {
    print_header "Running Code Quality Checks"
    
    print_info "Running ESLint..."
    npm run lint
    
    print_info "Checking TypeScript types..."
    npm run type-check
    
    print_info "Checking code formatting..."
    npm run format:check
    
    print_success "All quality checks passed"
}

run_format() {
    print_header "Formatting Code"
    print_info "Running Prettier..."
    npm run format
    print_success "Code formatted successfully"
}

run_security_check() {
    print_header "Security Audit"
    
    print_info "Running npm audit..."
    npm audit --audit-level=moderate || true
    
    print_info "Checking for known vulnerabilities..."
    npx better-npm-audit audit || true
    
    print_info "Checking dependencies licenses..."
    npx license-checker --summary || true
}

run_analyze() {
    print_header "Bundle Analysis"
    
    print_info "Analyzing bundle size..."
    npm run build
    
    # Check if next-bundle-analyzer is installed
    if [ -f ".next/analyze/client.html" ]; then
        print_info "Opening bundle analyzer..."
        open .next/analyze/client.html 2>/dev/null || xdg-open .next/analyze/client.html 2>/dev/null || print_warning "Please open .next/analyze/client.html manually"
    else
        print_warning "Bundle analyzer not configured. Install @next/bundle-analyzer to enable."
    fi
}

run_clean() {
    print_header "Cleaning Project"
    
    print_info "Removing node_modules..."
    rm -rf node_modules
    
    print_info "Removing .next build directory..."
    rm -rf .next
    
    print_info "Removing test results..."
    rm -rf test-results coverage
    
    print_info "Clearing npm cache..."
    npm cache clean --force
    
    print_success "Project cleaned successfully"
}

run_setup() {
    print_header "Setting Up Project"
    
    check_dependencies
    install_dependencies
    
    print_info "Setting up Git hooks..."
    npx husky install
    
    print_info "Running initial build..."
    npm run build
    
    print_success "Project setup completed successfully"
}

run_deploy() {
    print_header "Deployment"
    
    echo -e "${MAGENTA}Select deployment target:${NC}"
    echo "1) Vercel (Production)"
    echo "2) Vercel (Preview)"
    echo "3) Build Docker image"
    echo "4) Generate static export"
    
    read -p "Enter choice [1-4]: " deploy_choice
    
    case $deploy_choice in
        1)
            print_info "Deploying to Vercel (Production)..."
            npx vercel --prod
            ;;
        2)
            print_info "Deploying to Vercel (Preview)..."
            npx vercel
            ;;
        3)
            print_info "Building Docker image..."
            docker build -t autocrate:$VERSION .
            print_success "Docker image built: autocrate:$VERSION"
            ;;
        4)
            print_info "Generating static export..."
            npm run build
            npx next export
            print_success "Static files exported to 'out' directory"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

run_release() {
    print_header "Creating Release"
    
    echo -e "${MAGENTA}Select release type:${NC}"
    echo "1) Patch release (bug fixes)"
    echo "2) Minor release (new features)"
    echo "3) Major release (breaking changes)"
    
    read -p "Enter choice [1-3]: " release_choice
    
    case $release_choice in
        1)
            print_info "Creating patch release..."
            npm run release:patch
            ;;
        2)
            print_info "Creating minor release..."
            npm run release:minor
            ;;
        3)
            print_info "Creating major release..."
            npm run release:major
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    print_info "Pushing tags to remote..."
    git push --follow-tags origin main
    print_success "Release created successfully"
}

run_doctor() {
    print_header "Project Health Check"
    
    check_dependencies
    
    print_info "Checking project structure..."
    required_files=("package.json" "tsconfig.json" "next.config.js" ".env.example")
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_warning "$file is missing"
        fi
    done
    
    print_info "Checking environment variables..."
    if [ -f ".env.local" ]; then
        print_success ".env.local exists"
    else
        print_warning ".env.local not found (using defaults)"
    fi
    
    run_security_check
    
    print_info "Checking Git status..."
    if git diff-index --quiet HEAD --; then
        print_success "Working directory is clean"
    else
        print_warning "You have uncommitted changes"
    fi
    
    print_success "Health check completed"
}

show_menu() {
    clear
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${WHITE}           AutoCrate Project Manager v${VERSION}                  ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${GREEN}Development:${NC}"
    echo "  1)  Start development server"
    echo "  2)  Build production bundle"
    echo "  3)  Start production server"
    echo
    echo -e "${YELLOW}Testing & Quality:${NC}"
    echo "  4)  Run tests"
    echo "  5)  Run linting & type checks"
    echo "  6)  Format code"
    echo "  7)  Security audit"
    echo
    echo -e "${MAGENTA}Project Management:${NC}"
    echo "  8)  Initial setup"
    echo "  9)  Clean project"
    echo "  10) Bundle analysis"
    echo "  11) Project health check"
    echo
    echo -e "${BLUE}Deployment:${NC}"
    echo "  12) Deploy project"
    echo "  13) Create release"
    echo
    echo -e "${RED}Other:${NC}"
    echo "  14) Exit"
    echo
}

# Main script logic
main() {
    # If no arguments, show interactive menu
    if [ $# -eq 0 ]; then
        while true; do
            show_menu
            read -p "Enter your choice [1-14]: " choice
            
            case $choice in
                1) run_dev ;;
                2) run_build ;;
                3) run_start ;;
                4) run_tests ;;
                5) run_lint ;;
                6) run_format ;;
                7) run_security_check ;;
                8) run_setup ;;
                9) run_clean ;;
                10) run_analyze ;;
                11) run_doctor ;;
                12) run_deploy ;;
                13) run_release ;;
                14) 
                    print_info "Goodbye!"
                    exit 0
                    ;;
                *)
                    print_error "Invalid choice. Please try again."
                    sleep 2
                    ;;
            esac
            
            if [ "$choice" != "14" ]; then
                echo
                read -p "Press Enter to continue..."
            fi
        done
    else
        # Handle command-line arguments
        case $1 in
            dev) run_dev ;;
            build) run_build ;;
            start) run_start ;;
            test) run_tests ;;
            lint) run_lint ;;
            format) run_format ;;
            security) run_security_check ;;
            setup) run_setup ;;
            clean) run_clean ;;
            analyze) run_analyze ;;
            doctor) run_doctor ;;
            deploy) run_deploy ;;
            release) run_release ;;
            help|--help|-h)
                echo "Usage: ./autocrate.sh [command]"
                echo
                echo "Commands:"
                echo "  dev       Start development server"
                echo "  build     Build production bundle"
                echo "  start     Start production server"
                echo "  test      Run tests"
                echo "  lint      Run linting and type checks"
                echo "  format    Format code"
                echo "  security  Run security audit"
                echo "  setup     Initial project setup"
                echo "  clean     Clean project"
                echo "  analyze   Analyze bundle"
                echo "  doctor    Project health check"
                echo "  deploy    Deploy project"
                echo "  release   Create release"
                echo "  help      Show this help message"
                echo
                echo "Run without arguments for interactive menu"
                ;;
            *)
                print_error "Unknown command: $1"
                echo "Run './autocrate.sh help' for usage information"
                exit 1
                ;;
        esac
    fi
}

# Run main function
main "$@"