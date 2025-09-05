@echo off
setlocal enabledelayedexpansion

REM AutoCrate Master Script - Complete Development Toolkit
REM ========================================================

REM Get version from package.json
for /f "tokens=*" %%i in ('node -p "require('./package.json').version" 2^>nul') do set VERSION=%%i
if "!VERSION!"=="" set VERSION=unknown

REM Check if command was provided
if "%~1" neq "" goto :direct_command

:menu
cls
echo ========================================================
echo              AutoCrate v!VERSION!
echo ========================================================
echo.
echo   WORKFLOW (Recommended Order):
echo   1. Local Development (dev + test)
echo   2. Prepare Production (lint + build + test)
echo   3. Deploy Production (git push to trigger CI/CD)
echo.
echo   TESTING:
echo   4. Run All Tests (unit + integration + e2e)
echo   5. Unit Tests Only
echo   6. Integration Tests Only
echo   7. E2E Tests (Puppeteer)
echo   8. Test Coverage Report
echo   9. Watch Tests (interactive)
echo.
echo   DEVELOPMENT:
echo   10. Dev Server
echo   11. Build Production
echo   12. Lint + Format + TypeCheck
echo.
echo   UTILITIES:
echo   13. View/Kill Ports
echo   14. Git Status
echo   15. Clean Build Cache
echo.
echo   QUEUE SYSTEM:
echo   16. Add Task to Queue
echo   17. View Queue
echo   18. Execute Queue
echo.
echo   0. Exit
echo.
echo ========================================================
set /p choice="Select option [0-18]: "

if "!choice!"=="1" goto :local_dev
if "!choice!"=="2" goto :prepare_prod
if "!choice!"=="3" goto :deploy_prod
if "!choice!"=="4" goto :test_all
if "!choice!"=="5" goto :test_unit
if "!choice!"=="6" goto :test_integration
if "!choice!"=="7" goto :test_e2e
if "!choice!"=="8" goto :test_coverage
if "!choice!"=="9" goto :test_watch
if "!choice!"=="10" goto :dev
if "!choice!"=="11" goto :build
if "!choice!"=="12" goto :quality_check
if "!choice!"=="13" goto :port_menu
if "!choice!"=="14" goto :git_status
if "!choice!"=="15" goto :clean
if "!choice!"=="16" goto :queue_add
if "!choice!"=="17" goto :queue_view
if "!choice!"=="18" goto :queue_execute
if "!choice!"=="0" goto :end

echo Invalid option. Try again.
ping -n 3 127.0.0.1 >nul 2>&1
goto :menu

:direct_command
REM Handle direct command execution
if /i "%~1"=="local" goto :local_dev
if /i "%~1"=="prepare" goto :prepare_prod
if /i "%~1"=="deploy" goto :deploy_prod
if /i "%~1"=="test" goto :test_all
if /i "%~1"=="test:unit" goto :test_unit
if /i "%~1"=="test:integration" goto :test_integration
if /i "%~1"=="test:e2e" goto :test_e2e
if /i "%~1"=="test:coverage" goto :test_coverage
if /i "%~1"=="test:watch" goto :test_watch
if /i "%~1"=="dev" goto :dev
if /i "%~1"=="build" goto :build
if /i "%~1"=="lint" goto :quality_check
if /i "%~1"=="check" goto :quality_check
if /i "%~1"=="clean" goto :clean
if /i "%~1"=="ports" goto :port_menu
if /i "%~1"=="git" goto :git_status
if /i "%~1"=="queue" goto :queue_menu
if /i "%~1"=="help" goto :help

echo Unknown command: %~1
goto :help

:local_dev
echo.
echo ========================================================
echo            LOCAL DEVELOPMENT WORKFLOW
echo ========================================================
echo.
echo Starting development server in new window...
start cmd /k "npm run dev"
ping -n 4 127.0.0.1 >nul 2>&1
echo.
echo Running all tests...
call npm run test:unit
call npm run test:integration
echo.
echo Local development environment ready!
echo Server: http://localhost:3000
echo.
pause
goto :menu

:prepare_prod
echo.
echo ========================================================
echo           PREPARE FOR PRODUCTION
echo ========================================================
echo.
echo Step 1: Code Quality Checks
echo -------------------------------
call npm run lint
if %errorlevel% neq 0 (
    echo [WARNING] Linting issues found - attempting auto-fix...
    call npm run lint -- --fix
)
call npm run type-check
call npm run format:check

echo.
echo Step 2: Running All Tests
echo -------------------------------
call npm run test:unit
if %errorlevel% neq 0 (
    echo [ERROR] Unit tests failed!
    pause
    goto :menu
)
call npm run test:integration
if %errorlevel% neq 0 (
    echo [ERROR] Integration tests failed!
    pause
    goto :menu
)

echo.
echo Step 3: Building Production Bundle
echo -------------------------------
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    goto :menu
)

echo.
echo [SUCCESS] Ready for production deployment!
echo Run option 3 or 'autocrate deploy' to push to GitHub
echo.
pause
goto :menu

:deploy_prod
echo.
echo ========================================================
echo           DEPLOY TO PRODUCTION
echo ========================================================
echo.
echo This will:
echo - Commit all changes
echo - Push to GitHub
echo - Trigger automatic Vercel deployment via GitHub Actions
echo.
set /p confirm="Continue with deployment? [Y/N]: "
if /i not "!confirm!"=="Y" (
    echo Deployment cancelled.
    pause
    goto :menu
)

echo.
echo Checking git status...
git status --short
echo.
set /p message="Enter commit message (or press Enter for default): "
if "!message!"=="" set message=chore: production deployment

echo.
echo Committing changes...
git add -A
git commit -m "!message!"

echo.
echo Pushing to GitHub (main branch)...
git push origin main

echo.
echo [SUCCESS] Code pushed to GitHub!
echo Vercel deployment will trigger automatically.
echo Check GitHub Actions for deployment status.
echo.
pause
goto :menu

:test_all
echo.
echo ========================================================
echo              RUNNING ALL TESTS
echo ========================================================
echo.
echo Running Unit Tests...
call npm run test:unit
echo.
echo Running Integration Tests...
call npm run test:integration
echo.
echo Running E2E Tests (this may take a moment)...
call npm run e2e
echo.
echo All tests completed!
pause
goto :menu

:test_unit
echo.
echo Running Unit Tests...
npm run test:unit
pause
goto :menu

:test_integration
echo.
echo Running Integration Tests...
npm run test:integration
pause
goto :menu

:test_e2e
echo.
echo ========================================================
echo            E2E TESTS (PUPPETEER)
echo ========================================================
echo.
echo Select mode:
echo 1. Headless (faster)
echo 2. Headed (see browser)
echo 3. Debug mode
echo.
set /p e2e_choice="Select [1-3]: "

if "!e2e_choice!"=="1" npm run e2e
if "!e2e_choice!"=="2" npm run e2e:headed
if "!e2e_choice!"=="3" npm run e2e:debug

pause
goto :menu

:test_coverage
echo.
echo Generating Test Coverage Report...
npm run test:coverage
echo.
echo Coverage report generated in /coverage directory
pause
goto :menu

:test_watch
echo.
echo Starting Test Watch Mode...
echo (Press Ctrl+C to stop)
echo.
npm run test:watch
goto :menu

:dev
echo.
echo Starting Development Server...
echo.
npm run dev
goto :end

:build
echo.
echo Building for Production...
npm run build
if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Build completed!
    echo Output in .next directory
) else (
    echo.
    echo [ERROR] Build failed!
)
pause
goto :menu

:quality_check
echo.
echo ========================================================
echo           CODE QUALITY CHECKS
echo ========================================================
echo.
echo Running ESLint...
call npm run lint
echo.
echo Checking TypeScript types...
call npm run type-check
echo.
echo Checking code formatting...
call npm run format:check
echo.
set /p fix="Auto-fix issues? [Y/N]: "
if /i "!fix!"=="Y" (
    echo.
    echo Auto-fixing...
    call npm run lint -- --fix
    call npm run format
    echo Fixed!
)
pause
goto :menu

:port_menu
echo.
echo ========================================================
echo           PORT MANAGEMENT
echo ========================================================
echo.
echo Common ports status:
echo ---------------------
netstat -aon | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo Port 3000: IN USE
) else (
    echo Port 3000: FREE
)

netstat -aon | findstr :3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo Port 3001: IN USE
) else (
    echo Port 3001: FREE
)

echo.
set /p port="Enter port to kill (or 0 to skip): "
if not "!port!"=="0" (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :!port! ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
        echo Port !port! cleared!
    )
)
pause
goto :menu

:git_status
echo.
echo ========================================================
echo              GIT STATUS
echo ========================================================
echo.
git status
echo.
echo -------------------------------
echo Recent commits:
echo -------------------------------
git log --oneline -5
echo.
pause
goto :menu

:clean
echo.
echo ========================================================
echo           CLEAN BUILD CACHE
echo ========================================================
echo.
echo Cleaning .next directory...
if exist .next rmdir /s /q .next
echo Cleaning node_modules/.cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo Cleaning test-results...
if exist test-results rmdir /s /q test-results
echo.
echo Cache cleaned!
pause
goto :menu

REM =================== QUEUE SYSTEM ===================
:queue_menu
if "%~2"=="add" goto :queue_add
if "%~2"=="view" goto :queue_view
if "%~2"=="run" goto :queue_execute
if "%~2"=="clear" goto :queue_clear
echo.
echo Queue commands:
echo   autocrate queue add    - Add task to queue
echo   autocrate queue view   - View current queue
echo   autocrate queue run    - Execute queue
echo   autocrate queue clear  - Clear queue
goto :end

:queue_add
if not exist .queue mkdir .queue
echo.
echo Available tasks to queue:
echo 1. test:unit
echo 2. test:integration
echo 3. test:e2e
echo 4. lint
echo 5. type-check
echo 6. format
echo 7. build
echo 8. Custom command
echo.
set /p task_choice="Select task [1-8]: "

set task=
if "!task_choice!"=="1" set task=npm run test:unit
if "!task_choice!"=="2" set task=npm run test:integration
if "!task_choice!"=="3" set task=npm run e2e
if "!task_choice!"=="4" set task=npm run lint
if "!task_choice!"=="5" set task=npm run type-check
if "!task_choice!"=="6" set task=npm run format
if "!task_choice!"=="7" set task=npm run build
if "!task_choice!"=="8" (
    set /p task="Enter custom command: "
)

if defined task (
    echo !task! >> .queue\tasks.txt
    echo Task added to queue: !task!
)
pause
goto :menu

:queue_view
echo.
echo ========================================================
echo              CURRENT QUEUE
echo ========================================================
echo.
if exist .queue\tasks.txt (
    type .queue\tasks.txt
) else (
    echo Queue is empty.
)
echo.
pause
goto :menu

:queue_execute
echo.
echo ========================================================
echo            EXECUTING QUEUE
echo ========================================================
echo.
if not exist .queue\tasks.txt (
    echo Queue is empty!
    pause
    goto :menu
)

for /f "tokens=*" %%i in (.queue\tasks.txt) do (
    echo.
    echo Executing: %%i
    echo -------------------------------
    call %%i
    if !errorlevel! neq 0 (
        echo [ERROR] Task failed: %%i
        set /p continue="Continue with remaining tasks? [Y/N]: "
        if /i not "!continue!"=="Y" goto :queue_failed
    )
)

echo.
echo [SUCCESS] All queued tasks completed!
del .queue\tasks.txt
pause
goto :menu

:queue_failed
echo.
echo Queue execution stopped.
echo Remaining tasks preserved in queue.
pause
goto :menu

:queue_clear
if exist .queue\tasks.txt del .queue\tasks.txt
echo Queue cleared!
pause
goto :menu

:help
echo.
echo AutoCrate Development Toolkit v!VERSION!
echo =========================================
echo.
echo USAGE: autocrate [command] [options]
echo.
echo WORKFLOW COMMANDS:
echo   local              Start dev server and run tests
echo   prepare            Run all checks and build
echo   deploy             Push to GitHub (triggers deployment)
echo.
echo TESTING COMMANDS:
echo   test               Run all tests
echo   test:unit          Run unit tests only
echo   test:integration   Run integration tests only
echo   test:e2e           Run E2E tests with Puppeteer
echo   test:coverage      Generate coverage report
echo   test:watch         Run tests in watch mode
echo.
echo DEVELOPMENT COMMANDS:
echo   dev                Start development server
echo   build              Build for production
echo   lint               Run linting and formatting checks
echo   check              Same as lint
echo   clean              Clean build cache
echo.
echo UTILITY COMMANDS:
echo   ports              View/manage ports
echo   git                Show git status
echo   queue add          Add task to queue
echo   queue view         View task queue
echo   queue run          Execute queued tasks
echo   queue clear        Clear task queue
echo   help               Show this help
echo.
echo Run without arguments for interactive menu.
echo.
goto :end

:end
endlocal
exit /b 0