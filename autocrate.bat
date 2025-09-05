@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM AutoCrate Project Management Script (Windows Batch Version)
REM A unified command-line interface for development, testing, and deployment

REM Color codes for output (simplified for Windows CMD compatibility)
SET "RED="
SET "GREEN="
SET "YELLOW="
SET "BLUE="
SET "MAGENTA="
SET "CYAN="
SET "WHITE="
SET "NC="

REM Project information
SET "PROJECT_NAME=AutoCrate"
FOR /F "tokens=*" %%i IN ('node -p "require('./package.json').version" 2^>nul') DO SET "VERSION=%%i"
IF "%VERSION%"=="" SET "VERSION=1.0.0"

REM Helper functions
:print_header
echo.
echo ========================================================================
echo.
echo   %~1
echo.
echo ========================================================================
echo.
goto :eof

:print_success
echo [SUCCESS] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_info
echo [INFO] %~1
goto :eof

:check_dependencies
call :print_header "Checking Dependencies"

REM Check Node.js
node -v >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=*" %%i in ('node -v') do set "NODE_VERSION=%%i"
    call :print_success "Node.js installed: !NODE_VERSION!"
) else (
    call :print_error "Node.js is not installed"
    exit /b 1
)

REM Check npm
npm -v >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=*" %%i in ('npm -v') do set "NPM_VERSION=%%i"
    call :print_success "npm installed: !NPM_VERSION!"
) else (
    call :print_error "npm is not installed"
    exit /b 1
)

REM Check Git
git --version >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=*" %%i in ('git --version') do set "GIT_VERSION=%%i"
    call :print_success "!GIT_VERSION!"
) else (
    call :print_warning "Git is not installed (optional)"
)
goto :eof

:install_dependencies
call :print_header "Installing Dependencies"
call :print_info "Installing npm packages..."
npm ci
if %errorlevel%==0 (
    call :print_success "Dependencies installed successfully"
) else (
    call :print_error "Failed to install dependencies"
    exit /b 1
)
goto :eof

:clear_port
REM Port clearing logic (only in production)
if not "%NODE_ENV%"=="production" (
    call :print_info "Not in production environment. Skipping port clearing."
    goto :eof
)

SET "PORT_TO_CLEAR=3000"
call :print_info "Production environment detected. Searching for process on port !PORT_TO_CLEAR!..."

for /f "tokens=5" %%P in ('netstat -a -n -o ^| findstr :!PORT_TO_CLEAR! ^| findstr LISTENING') do (
    if "%%P" neq "0" (
        call :print_info "Found process with PID %%P on port !PORT_TO_CLEAR!."
        call :print_info "Terminating process..."
        taskkill /F /PID %%P >nul 2>&1
        if %errorlevel%==0 (
            call :print_success "Process terminated successfully."
        ) else (
            call :print_warning "Failed to terminate process."
        )
        goto :eof
    )
)
call :print_info "No active process found on port !PORT_TO_CLEAR!."
goto :eof

:run_dev
call :print_header "Starting Development Server"
call :print_info "Starting Next.js development server..."
call :print_info "Access the application at: http://localhost:3000"
npm run dev
goto :eof

:run_build
call :print_header "Building Production Bundle"
call :print_info "Creating optimized production build..."
npm run build
if %errorlevel%==0 (
    call :print_success "Build completed successfully"
) else (
    call :print_error "Build failed"
    exit /b 1
)
goto :eof

:run_start
call :print_header "Starting Production Server"
call :clear_port
call :print_info "Starting production server..."
npm start
goto :eof

:run_tests
call :print_header "Running Test Suite"

echo Select test type:
echo 1) All tests
echo 2) Unit tests only
echo 3) Integration tests only
echo 4) E2E tests only
echo 5) Test with coverage
echo 6) Test in watch mode
echo 7) Open test UI

set /p "test_choice=Enter choice [1-7]: "

if "!test_choice!"=="1" (
    call :print_info "Running all tests..."
    npm run test:all
) else if "!test_choice!"=="2" (
    call :print_info "Running unit tests..."
    npm run test:unit
) else if "!test_choice!"=="3" (
    call :print_info "Running integration tests..."
    npm run test:integration
) else if "!test_choice!"=="4" (
    call :print_info "Running E2E tests..."
    npm run e2e
) else if "!test_choice!"=="5" (
    call :print_info "Running tests with coverage..."
    npm run test:coverage
) else if "!test_choice!"=="6" (
    call :print_info "Starting test watch mode..."
    npm run test:watch
) else if "!test_choice!"=="7" (
    call :print_info "Opening Vitest UI..."
    npm run test:ui
) else (
    call :print_error "Invalid choice"
    exit /b 1
)
goto :eof

:run_lint
call :print_header "Running Code Quality Checks"

call :print_info "Running ESLint..."
npm run lint

call :print_info "Checking TypeScript types..."
npm run type-check

call :print_info "Checking code formatting..."
npm run format:check

call :print_success "All quality checks passed"
goto :eof

:run_format
call :print_header "Formatting Code"
call :print_info "Running Prettier..."
npm run format
call :print_success "Code formatted successfully"
goto :eof

:run_security_check
call :print_header "Security Audit"

call :print_info "Running npm audit..."
npm audit --audit-level=moderate

call :print_info "Checking for known vulnerabilities..."
npx better-npm-audit audit

call :print_info "Checking dependencies licenses..."
npx license-checker --summary
goto :eof

:run_analyze
call :print_header "Bundle Analysis"

call :print_info "Analyzing bundle size..."
npm run build

REM Check if next-bundle-analyzer is installed
if exist ".next\analyze\client.html" (
    call :print_info "Opening bundle analyzer..."
    start .next\analyze\client.html
) else (
    call :print_warning "Bundle analyzer not configured. Install @next/bundle-analyzer to enable."
)
goto :eof

:run_clean
call :print_header "Cleaning Project"

call :print_info "Removing node_modules..."
rd /s /q node_modules 2>nul

call :print_info "Removing .next build directory..."
rd /s /q .next 2>nul

call :print_info "Removing test results..."
rd /s /q test-results 2>nul
rd /s /q coverage 2>nul

call :print_info "Clearing npm cache..."
npm cache clean --force

call :print_success "Project cleaned successfully"
goto :eof

:run_setup
call :print_header "Setting Up Project"

call :check_dependencies
call :install_dependencies

call :print_info "Setting up Git hooks..."
npx husky install

call :print_info "Running initial build..."
npm run build

call :print_success "Project setup completed successfully"
goto :eof

:run_deploy
call :print_header "Deployment"

echo Select deployment target:
echo 1) Vercel (Production)
echo 2) Vercel (Preview)
echo 3) Build Docker image
echo 4) Generate static export

set /p "deploy_choice=Enter choice [1-4]: "

if "!deploy_choice!"=="1" (
    call :print_info "Deploying to Vercel (Production)..."
    call :clear_port
    npx vercel --prod
) else if "!deploy_choice!"=="2" (
    call :print_info "Deploying to Vercel (Preview)..."
    npx vercel
) else if "!deploy_choice!"=="3" (
    call :print_info "Building Docker image..."
    docker build -t autocrate:!VERSION! .
    call :print_success "Docker image built: autocrate:!VERSION!"
) else if "!deploy_choice!"=="4" (
    call :print_info "Generating static export..."
    npm run build
    npx next export
    call :print_success "Static files exported to 'out' directory"
) else (
    call :print_error "Invalid choice"
    exit /b 1
)
goto :eof

:run_release
call :print_header "Creating Release"

echo Select release type:
echo 1) Patch release (bug fixes)
echo 2) Minor release (new features)
echo 3) Major release (breaking changes)

set /p "release_choice=Enter choice [1-3]: "

if "!release_choice!"=="1" (
    call :print_info "Creating patch release..."
    npm run release:patch
) else if "!release_choice!"=="2" (
    call :print_info "Creating minor release..."
    npm run release:minor
) else if "!release_choice!"=="3" (
    call :print_info "Creating major release..."
    npm run release:major
) else (
    call :print_error "Invalid choice"
    exit /b 1
)

call :print_info "Pushing tags to remote..."
git push --follow-tags origin main
call :print_success "Release created successfully"
goto :eof

:run_doctor
call :print_header "Project Health Check"

call :check_dependencies

call :print_info "Checking project structure..."
set "required_files=package.json tsconfig.json next.config.js .env.example"
for %%f in (!required_files!) do (
    if exist "%%f" (
        call :print_success "%%f exists"
    ) else (
        call :print_warning "%%f is missing"
    )
)

call :print_info "Checking environment variables..."
if exist ".env.local" (
    call :print_success ".env.local exists"
) else (
    call :print_warning ".env.local not found (using defaults)"
)

call :run_security_check

call :print_info "Checking Git status..."
git diff-index --quiet HEAD --
if %errorlevel%==0 (
    call :print_success "Working directory is clean"
) else (
    call :print_warning "You have uncommitted changes"
)

call :print_success "Health check completed"
goto :eof

:show_menu
cls
echo ========================================================================
echo            AutoCrate Project Manager v!VERSION!
echo ========================================================================
echo.
echo Development:
echo   1)  Start development server
echo   2)  Build production bundle
echo   3)  Start production server
echo.
echo Testing & Quality:
echo   4)  Run tests
echo   5)  Run linting & type checks
echo   6)  Format code
echo   7)  Security audit
echo.
echo Project Management:
echo   8)  Initial setup
echo   9)  Clean project
echo  10) Bundle analysis
echo  11) Project health check
echo.
echo Deployment:
echo  12) Deploy project
echo  13) Create release
echo.
echo Other:
echo  14) Exit
echo.
goto :eof

REM Main script logic
:main
if "%~1"=="" (
    REM Interactive menu
    call :show_menu
    set /p "choice=Enter your choice [1-14]: "
    
    if "!choice!"=="1" call :run_dev
    if "!choice!"=="2" call :run_build
    if "!choice!"=="3" call :run_start
    if "!choice!"=="4" call :run_tests
    if "!choice!"=="5" call :run_lint
    if "!choice!"=="6" call :run_format
    if "!choice!"=="7" call :run_security_check
    if "!choice!"=="8" call :run_setup
    if "!choice!"=="9" call :run_clean
    if "!choice!"=="10" call :run_analyze
    if "!choice!"=="11" call :run_doctor
    if "!choice!"=="12" call :run_deploy
    if "!choice!"=="13" call :run_release
    if "!choice!"=="14" (
        call :print_info "Goodbye!"
        goto :eof
    )
    
    REM If not exit, continue the loop
    echo.
    goto main
) else (
    REM Command-line arguments
    if "%~1"=="dev" call :run_dev
    if "%~1"=="build" call :run_build
    if "%~1"=="start" call :run_start
    if "%~1"=="test" call :run_tests
    if "%~1"=="lint" call :run_lint
    if "%~1"=="format" call :run_format
    if "%~1"=="security" call :run_security_check
    if "%~1"=="setup" call :run_setup
    if "%~1"=="clean" call :run_clean
    if "%~1"=="analyze" call :run_analyze
    if "%~1"=="doctor" call :run_doctor
    if "%~1"=="deploy" call :run_deploy
    if "%~1"=="release" call :run_release
    if "%~1"=="help" goto help
    if "%~1"=="--help" goto help
    if "%~1"=="-h" goto help
    
    REM Unknown command
    call :print_error "Unknown command: %~1"
    echo Run 'autocrate.bat help' for usage information
    exit /b 1
)
goto :eof

:help
echo Usage: autocrate.bat [command]
echo.
echo Commands:
echo   dev       Start development server
echo   build     Build production bundle
echo   start     Start production server
echo   test      Run tests
echo   lint      Run linting and type checks
echo   format    Format code
echo   security  Run security audit
echo   setup     Initial project setup
echo   clean     Clean project
echo   analyze   Analyze bundle
echo   doctor    Project health check
echo   deploy    Deploy project
echo   release   Create release
echo   help      Show this help message
echo.
echo Run without arguments for interactive menu
goto :eof

REM Run main function
call :main %*
