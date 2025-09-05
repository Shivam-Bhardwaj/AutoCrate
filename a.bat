@echo off
setlocal enabledelayedexpansion

REM AutoCrate Master Script - Simple and Fast
REM ==========================================

REM Get version from package.json
for /f "tokens=*" %%i in ('node -p "require('./package.json').version" 2^>nul') do set VERSION=%%i
if "!VERSION!"=="" set VERSION=unknown

REM Check if command was provided
if "%~1" neq "" goto :direct_command

:menu
cls
echo ==========================================
echo         AutoCrate v!VERSION!
echo ==========================================
echo.
echo   Workflow:
echo   1. Local Development (dev server + test)
echo   2. Prepare for Production (checks + docs)
echo   3. Deploy to Production (git push)
echo.
echo   Individual Commands:
echo   4. Dev Server Only
echo   5. Build Only
echo   6. Run Tests
echo   7. Lint and Format
echo   8. Type Check
echo.
echo   Build with Logging:
echo   9. Build with Detailed Logging
echo   10. Dev Server with Logging
echo.
echo   Port Management:
echo   11. View Active Ports
echo   12. Kill Port Process
echo.
echo   0. Exit
echo.
echo ==========================================
set /p choice="Select option [0-12]: "

if "!choice!"=="1" goto :local_dev
if "!choice!"=="2" goto :prepare_prod
if "!choice!"=="3" goto :deploy_prod
if "!choice!"=="4" goto :dev
if "!choice!"=="5" goto :build
if "!choice!"=="6" goto :test
if "!choice!"=="7" goto :lint_format
if "!choice!"=="8" goto :typecheck
if "!choice!"=="9" goto :build_logged
if "!choice!"=="10" goto :dev_logged
if "!choice!"=="11" goto :view_ports
if "!choice!"=="12" goto :kill_port
if "!choice!"=="0" goto :end

echo Invalid option. Try again.
timeout /t 2 >nul
goto :menu

:direct_command
REM Handle command line arguments
if /i "%~1"=="local" goto :local_dev
if /i "%~1"=="prepare" goto :prepare_prod
if /i "%~1"=="deploy" goto :deploy_prod
if /i "%~1"=="dev" goto :dev
if /i "%~1"=="build" goto :build
if /i "%~1"=="test" goto :test
if /i "%~1"=="lint" goto :lint_format
if /i "%~1"=="typecheck" goto :typecheck
if /i "%~1"=="check" goto :prepare_prod
if /i "%~1"=="ports" goto :view_ports
if /i "%~1"=="killport" goto :kill_port
if /i "%~1"=="build:logged" goto :build_logged
if /i "%~1"=="dev:logged" goto :dev_logged
if /i "%~1"=="help" goto :help

echo Unknown command: %~1
goto :help

:local_dev
echo.
echo ==========================================
echo     LOCAL DEVELOPMENT WORKFLOW
echo ==========================================
echo.
echo Starting development server and tests...
echo.
start cmd /k "npm run dev"
echo Development server started in new window.
echo.
echo Running tests...
call npm test
echo.
echo Local development ready!
echo.
pause
goto :menu

:prepare_prod
echo.
echo ==========================================
echo     PREPARE FOR PRODUCTION
echo ==========================================
echo.
echo Step 1: Running all quality checks...
echo --------------------------------------
call npm run lint
call npm run type-check
call npm run format:check
echo.
echo Step 2: Building production bundle with logging...
echo --------------------------------------
call npm run build:logged
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed! Fix issues before deploying.
    pause
    goto :menu
)
echo.
echo Step 3: Running tests...
echo --------------------------------------
call npm test
echo.
echo [SUCCESS] Ready for production deployment!
echo Run option 3 or 'a deploy' to push to production.
echo.
pause
goto :menu

:deploy_prod
echo.
echo ==========================================
echo     DEPLOY TO PRODUCTION
echo ==========================================
echo.
echo This will push to GitHub and trigger automatic deployment.
echo.
set /p confirm="Are you ready to deploy? [Y/N]: "
if /i not "!confirm!"=="Y" (
    echo Deployment cancelled.
    pause
    goto :menu
)
echo.
echo Adding all changes...
git add -A
echo.
echo Creating commit...
git commit -m "chore: production deployment"
echo.
echo Pushing to GitHub (this triggers deployment)...
git push origin main
echo.
echo [SUCCESS] Code pushed to GitHub!
echo Deployment will be triggered automatically via GitHub Actions.
echo.
pause
goto :menu

:lint_format
echo.
echo Running ESLint and Prettier...
echo ===============================
call npm run lint
call npm run format
echo.
echo Code linted and formatted!
goto :end

:dev
echo.
echo Starting development server...
echo ==============================
npm run dev
goto :end

:build
echo.
echo Building for production...
echo ==========================
npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    pause
)
goto :end

:build_logged
echo.
echo ==========================================
echo     BUILD WITH DETAILED LOGGING
echo ==========================================
echo.
echo This will create a detailed build log file.
echo.
npm run build:logged
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed! Check the build-logs directory for details.
    pause
)
goto :end

:dev_logged
echo.
echo ==========================================
echo     DEV SERVER WITH DETAILED LOGGING
echo ==========================================
echo.
echo Starting development server with detailed logging...
echo Logs will be saved to build-logs directory.
echo.
npm run dev:logged
goto :end

:deploy
echo.
echo Deploying to Vercel...
echo ======================
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed! Cannot deploy.
    pause
    goto :end
)
npm run deploy
goto :end

:test
echo.
echo Running tests...
echo ================
npm test
goto :end

:lint
echo.
echo Running ESLint...
echo =================
npm run lint
goto :end

:format
echo.
echo Formatting code with Prettier...
echo =================================
npm run format
echo.
echo Done! Code formatted.
goto :end

:typecheck
echo.
echo Running TypeScript type check...
echo =================================
npm run type-check
goto :end

:fullcheck
echo.
echo Running full code quality check...
echo ===================================
echo.
echo Step 1/3: ESLint
echo -----------------
call npm run lint
if %errorlevel% neq 0 (
    echo [WARNING] Linting issues found
)

echo.
echo Step 2/3: TypeScript
echo --------------------
call npm run type-check
if %errorlevel% neq 0 (
    echo [WARNING] Type errors found
)

echo.
echo Step 3/3: Prettier
echo ------------------
call npm run format:check
if %errorlevel% neq 0 (
    echo [WARNING] Formatting issues found
    echo Run 'a format' to fix
)

echo.
echo ===================================
echo Code quality check complete!
goto :end

:view_ports
echo.
echo ==========================================
echo        ACTIVE PORTS AND PROCESSES
echo ==========================================
echo.
echo Common development ports:
echo ------------------------------------------
echo Port    Process                 PID
echo ------------------------------------------

REM Check common development ports
set "ports=3000 3001 3002 4000 5000 5173 8000 8080 8081 9000"

for %%p in (!ports!) do (
    set "found="
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING 2^>nul') do (
        if not "%%a"=="0" (
            set "pid=%%a"
            set "found=1"
            
            REM Get process name
            for /f "tokens=1" %%b in ('tasklist /fi "PID eq %%a" /fo csv ^| findstr /v "Image Name" 2^>nul') do (
                set "procname=%%~b"
            )
            
            if defined procname (
                echo %%p     !procname!     !pid!
            ) else (
                echo %%p     Unknown Process     !pid!
            )
        )
    )
)

echo ------------------------------------------
echo.
echo To see ALL listening ports, press A
echo To return to menu, press M
echo To kill a specific port, press K
echo.
set /p portchoice="Select option [A/M/K]: "

if /i "!portchoice!"=="A" goto :view_all_ports
if /i "!portchoice!"=="M" goto :menu
if /i "!portchoice!"=="K" goto :kill_port

goto :menu

:view_all_ports
echo.
echo ==========================================
echo        ALL LISTENING PORTS
echo ==========================================
echo.
echo Port    Protocol    PID    Process
echo ------------------------------------------

for /f "tokens=2,5" %%a in ('netstat -aon ^| findstr LISTENING') do (
    set "port=%%a"
    set "pid=%%b"
    
    REM Extract just the port number
    for /f "tokens=2 delims=:" %%c in ("!port!") do set "portnum=%%c"
    
    if not "!pid!"=="0" (
        REM Get process name
        set "procname="
        for /f "tokens=1" %%d in ('tasklist /fi "PID eq !pid!" /fo csv ^| findstr /v "Image Name" 2^>nul') do (
            set "procname=%%~d"
        )
        
        if defined procname (
            echo !portnum!    TCP    !pid!    !procname!
        )
    )
)

echo ------------------------------------------
echo.
pause
goto :menu

:kill_port
echo.
echo ==========================================
echo        KILL PORT PROCESS
echo ==========================================
echo.
set /p portkill="Enter port number to kill (or 0 to cancel): "

if "!portkill!"=="0" goto :menu

REM Find PID for the port
set "foundpid="
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :!portkill! ^| findstr LISTENING 2^>nul') do (
    if not "%%a"=="0" (
        set "foundpid=%%a"
    )
)

if not defined foundpid (
    echo.
    echo [ERROR] No process found on port !portkill!
    echo.
    pause
    goto :menu
)

REM Get process name
set "procname="
for /f "tokens=1" %%b in ('tasklist /fi "PID eq !foundpid!" /fo csv ^| findstr /v "Image Name" 2^>nul') do (
    set "procname=%%~b"
)

echo.
echo Found process: !procname! (PID: !foundpid!)
echo.
set /p confirm="Kill this process? [Y/N]: "

if /i "!confirm!"=="Y" (
    taskkill /F /PID !foundpid! >nul 2>&1
    if !errorlevel! equ 0 (
        echo.
        echo [SUCCESS] Process killed successfully!
    ) else (
        echo.
        echo [ERROR] Failed to kill process. You may need administrator privileges.
    )
) else (
    echo.
    echo Operation cancelled.
)

echo.
pause
goto :menu

:help
echo.
echo Usage: a [command]
echo.
echo Workflow Commands (Recommended):
echo   local      - Local development (dev server + tests)
echo   prepare    - Prepare for production (all checks + build)
echo   deploy     - Deploy to production (git push triggers deployment)
echo.
echo Individual Commands:
echo   dev        - Start development server only
echo   build      - Build for production only
echo   test       - Run tests only
echo   lint       - Run linting and formatting
echo   typecheck  - Run TypeScript type check only
echo.
echo Utilities:
echo   ports      - View active ports
echo   killport   - Kill a port process
echo   help       - Show this help
echo.
echo Recommended workflow: local -> prepare -> deploy
echo Run without arguments for interactive menu
echo.
goto :end

:end
endlocal
exit /b 0