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
echo   MAIN WORKFLOW (Use in Order):
echo   ------------------------------
echo   1. Local Test    - Dev server + Browser + Basic tests
echo   2. Prepare       - Version update + Docs + Full tests + Build
echo   3. Deploy        - Git push to GitHub (triggers deployment)
echo.
echo   INDIVIDUAL TOOLS:
echo   -----------------
echo   4. Run All Tests (unit + integration + e2e)
echo   5. Unit Tests Only
echo   6. Integration Tests Only
echo   7. E2E Tests (Puppeteer)
echo   8. Test Coverage Report
echo   9. Watch Tests (interactive)
echo.
echo   10. Dev Server Only
echo   11. Build Production Only
echo   12. Lint + Format + TypeCheck
echo   13. View/Kill Ports
echo   14. Git Status
echo   15. Clean Build Cache
echo.
echo   QUEUE SYSTEM:
echo   -------------
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
if /i "%~1"=="version" goto :version_update
if /i "%~1"=="queue" goto :queue_menu
if /i "%~1"=="help" goto :help

echo Unknown command: %~1
goto :help

REM =================== OPTION 1: LOCAL DEVELOPMENT ===================
:local_dev
echo.
echo ========================================================
echo         OPTION 1: LOCAL DEVELOPMENT & TESTING
echo ========================================================
echo.

REM Check if ports 3000-3005 are in use and kill the processes
echo Checking for existing processes on ports 3000-3005...
for /l %%p in (3000,1,3005) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
        set PID=%%a
        if not "!PID!"=="" (
            echo Found process !PID! using port %%p, terminating...
            taskkill //PID !PID! //F >nul 2>&1
        )
    )
)
echo Port cleanup complete.
ping -n 2 127.0.0.1 >nul 2>&1

echo Starting development server...
start cmd /k "npm run dev"

echo Waiting for server to start...
ping -n 5 127.0.0.1 >nul 2>&1

echo Opening browser...
echo Note: Next.js will automatically find an available port (3000-3005)
echo Check the console output above for the actual port number.
ping -n 3 127.0.0.1 >nul 2>&1
start http://localhost:3000

echo.
echo Running basic tests...
echo -------------------------------
call npm run test:unit
if %errorlevel% neq 0 (
    echo [WARNING] Some unit tests failed - check the output above
) else (
    echo [SUCCESS] Unit tests passed!
)

echo.
echo ========================================================
echo Development server is running in separate window
echo Browser opened at http://localhost:3000
echo.
echo Test your changes manually in the browser
echo When done, close the dev server window
echo ========================================================
echo.
pause
goto :menu

REM =================== OPTION 2: PREPARE PRODUCTION ===================
:prepare_prod
echo.
echo ========================================================
echo       OPTION 2: PREPARE FOR PRODUCTION
echo ========================================================
echo.

REM Step 1: Version Update
echo Step 1: Version Update
echo -------------------------------
echo Current version: !VERSION!
echo.
echo Select version update type:
echo 1. Patch (bug fixes)     - !VERSION! to next patch
echo 2. Minor (new features)  - !VERSION! to next minor
echo 3. Major (breaking)      - !VERSION! to next major
echo 4. Skip version update
echo.
set /p version_choice="Select [1-4]: "

if "!version_choice!"=="1" (
    echo Updating patch version...
    call npm version patch --no-git-tag-version
    echo Version updated!
) else if "!version_choice!"=="2" (
    echo Updating minor version...
    call npm version minor --no-git-tag-version
    echo Version updated!
) else if "!version_choice!"=="3" (
    echo Updating major version...
    call npm version major --no-git-tag-version
    echo Version updated!
) else (
    echo Skipping version update...
)

REM Update version variable
for /f "tokens=*" %%i in ('node -p "require('./package.json').version" 2^>nul') do set VERSION=%%i

echo.
echo Step 2: Update Documentation
echo -------------------------------
echo Generating version.ts file...
node -e "const fs=require('fs'); const pkg=require('./package.json'); fs.writeFileSync('./src/utils/version.ts', `export const APP_VERSION = '${pkg.version}';\n`);"
echo Version file updated!

echo.
echo Updating CHANGELOG.md...
set /p changelog="Enter changelog entry (or press Enter to skip): "
if not "!changelog!"=="" (
    echo.>> CHANGELOG.md
    echo ## v!VERSION! - !date! >> CHANGELOG.md
    echo - !changelog! >> CHANGELOG.md
    echo CHANGELOG updated!
) else (
    echo Skipped CHANGELOG update
)

echo.
echo Step 3: Code Quality Checks
echo -------------------------------
call npm run lint
if %errorlevel% neq 0 (
    echo [WARNING] Linting issues found - attempting auto-fix...
    call npm run lint -- --fix
)
call npm run type-check
call npm run format

echo.
echo Step 4: Running ALL Tests
echo -------------------------------
echo Running unit tests...
call npm run test:unit
if %errorlevel% neq 0 (
    echo [ERROR] Unit tests failed!
    pause
    goto :menu
)

echo Running integration tests...
call npm run test:integration
if %errorlevel% neq 0 (
    echo [ERROR] Integration tests failed!
    pause
    goto :menu
)

echo Running E2E tests...
call npm run e2e
if %errorlevel% neq 0 (
    echo [WARNING] E2E tests failed - but continuing...
)

echo.
echo Step 5: Building Production Bundle
echo -------------------------------
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    goto :menu
)

echo.
echo ========================================================
echo [SUCCESS] READY FOR PRODUCTION!
echo.
echo Version: !VERSION!
echo All tests passed
echo Build successful
echo Documentation updated
echo.
echo Run Option 3 to deploy to GitHub
echo ========================================================
echo.
pause
goto :menu

REM =================== OPTION 3: DEPLOY ===================
:deploy_prod
echo.
echo ========================================================
echo           OPTION 3: DEPLOY TO GITHUB
echo ========================================================
echo.
echo This will push all changes to GitHub and trigger deployment.
echo.
echo Analyzing changes...
echo -------------------------------

REM Get list of changed files
git status --short > temp_changes.txt

REM Initialize variables for smart commit message
set has_feat=0
set has_fix=0
set has_docs=0
set has_style=0
set has_refactor=0
set has_test=0
set has_chore=0
set files_changed=0

REM Analyze changes
for /f "tokens=1,2" %%a in (temp_changes.txt) do (
    set /a files_changed+=1
    echo %%b | findstr /i "\.tsx$ \.ts$ \.jsx$ \.js$" >nul && (
        echo %%b | findstr /i "test" >nul && set has_test=1
        echo %%b | findstr /i "components" >nul && set has_feat=1
        echo %%b | findstr /i "fix" >nul && set has_fix=1
        echo %%b | findstr /i "store" >nul && set has_feat=1
        echo %%b | findstr /i "utils" >nul && set has_refactor=1
    )
    echo %%b | findstr /i "\.md$ README CHANGELOG" >nul && set has_docs=1
    echo %%b | findstr /i "\.css$ \.scss$ styles" >nul && set has_style=1
    echo %%b | findstr /i "package\.json \.bat \.yml config" >nul && set has_chore=1
)

REM Generate smart commit message based on changes
set auto_message=
if !has_fix! equ 1 (
    set auto_message=fix: 
) else if !has_feat! equ 1 (
    set auto_message=feat: 
) else if !has_refactor! equ 1 (
    set auto_message=refactor: 
) else if !has_docs! equ 1 (
    set auto_message=docs: 
) else if !has_style! equ 1 (
    set auto_message=style: 
) else if !has_test! equ 1 (
    set auto_message=test: 
) else (
    set auto_message=chore: 
)

REM Get last commit message for context
for /f "tokens=*" %%i in ('git log -1 --pretty^=format:"%%s" 2^>nul') do set last_commit=%%i

REM Show analysis
echo.
echo Changes detected:
echo - Files modified: !files_changed!
if !has_feat! equ 1 echo - Feature changes detected
if !has_fix! equ 1 echo - Bug fixes detected
if !has_docs! equ 1 echo - Documentation changes detected
if !has_test! equ 1 echo - Test changes detected
if !has_style! equ 1 echo - Style changes detected
if !has_refactor! equ 1 echo - Code refactoring detected
if !has_chore! equ 1 echo - Configuration changes detected
echo.
echo Last commit: !last_commit!
echo.

REM Show detailed changes
echo File changes:
echo -------------------------------
git status --short
echo.

set /p confirm="Ready to deploy? [Y/N]: "
if /i not "!confirm!"=="Y" (
    echo Deployment cancelled.
    del temp_changes.txt 2>nul
    pause
    goto :menu
)

echo.
echo Suggested commit type: !auto_message!
echo.
echo Choose commit message option:
echo 1. Auto-generated based on changes
echo 2. Custom message
echo 3. Use default (production deployment)
echo.
set /p msg_choice="Select [1-3]: "

if "!msg_choice!"=="1" (
    REM Build detailed auto message
    if !has_fix! equ 1 (
        set message=fix: resolve issues and improve stability
    ) else if !has_feat! equ 1 (
        set message=feat: enhance functionality and user experience
    ) else if !has_refactor! equ 1 (
        set message=refactor: improve code structure and maintainability
    ) else if !has_docs! equ 1 (
        set message=docs: update documentation
    ) else if !has_test! equ 1 (
        set message=test: update test coverage
    ) else (
        set message=chore: update configuration and dependencies
    )
) else if "!msg_choice!"=="2" (
    set /p custom_msg="Enter commit message: "
    set message=!custom_msg!
) else (
    set message=chore: production deployment v!VERSION!
)

REM Clean up temp file
del temp_changes.txt 2>nul

echo.
echo Committing changes...
echo Commit message: !message!
git add -A
git commit -m "!message!"

echo.
echo Pushing to GitHub (branch: main)...
git push origin main

echo.
echo ========================================================
echo [SUCCESS] Deployed to GitHub!
echo.
echo GitHub Actions will now:
echo - Run CI/CD pipeline
echo - Deploy to Vercel automatically
echo.
echo Check deployment at:
echo https://github.com/Shivam-Bhardwaj/AutoCrate/actions
echo ========================================================
echo.
pause
goto :menu

REM =================== TEST COMMANDS ===================
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
echo Running E2E Tests (will auto-start dev server if needed)...
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
echo 1. Headless (auto-start server)
echo 2. Headed (see browser, auto-start server)
echo 3. Debug mode (verbose output)
echo 4. No server (assumes server already running)
echo.
set /p e2e_choice="Select [1-4]: "

if "!e2e_choice!"=="1" npm run e2e
if "!e2e_choice!"=="2" npm run e2e:headed
if "!e2e_choice!"=="3" npm run e2e:debug
if "!e2e_choice!"=="4" npm run e2e:no-server

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

REM Check if ports 3000-3005 are in use and kill the processes
echo Checking for existing processes on ports 3000-3005...
for /l %%p in (3000,1,3005) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
        set PID=%%a
        if not "!PID!"=="" (
            echo Found process !PID! using port %%p, terminating...
            taskkill //PID !PID! //F >nul 2>&1
        )
    )
)
echo Port cleanup complete.
ping -n 2 127.0.0.1 >nul 2>&1

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
echo MAIN WORKFLOW (Use in Order):
echo   1. local     - Test locally with dev server and browser
echo   2. prepare   - Update version, docs, run all tests, build
echo   3. deploy    - Push to GitHub (triggers auto-deployment)
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
echo   version            Update version number
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