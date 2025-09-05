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
echo   Development:
echo   1. Development Server (npm run dev)
echo   2. Build Production (npm run build)
echo   3. Deploy to Vercel (npm run deploy)
echo.
echo   Testing:
echo   4. Run Tests (npm test)
echo   5. Lint Code (npm run lint)
echo   6. Format Code (npm run format)
echo   7. Type Check (npm run type-check)
echo   8. Full Check (lint + type + format)
echo.
echo   Port Management:
echo   9. View Active Ports
echo   10. Kill Port Process
echo.
echo   0. Exit
echo.
echo ==========================================
set /p choice="Select option [0-10]: "

if "!choice!"=="1" goto :dev
if "!choice!"=="2" goto :build
if "!choice!"=="3" goto :deploy
if "!choice!"=="4" goto :test
if "!choice!"=="5" goto :lint
if "!choice!"=="6" goto :format
if "!choice!"=="7" goto :typecheck
if "!choice!"=="8" goto :fullcheck
if "!choice!"=="9" goto :view_ports
if "!choice!"=="10" goto :kill_port
if "!choice!"=="0" goto :end

echo Invalid option. Try again.
timeout /t 2 >nul
goto :menu

:direct_command
REM Handle command line arguments
if /i "%~1"=="dev" goto :dev
if /i "%~1"=="build" goto :build
if /i "%~1"=="deploy" goto :deploy
if /i "%~1"=="test" goto :test
if /i "%~1"=="lint" goto :lint
if /i "%~1"=="format" goto :format
if /i "%~1"=="typecheck" goto :typecheck
if /i "%~1"=="check" goto :fullcheck
if /i "%~1"=="ports" goto :view_ports
if /i "%~1"=="killport" goto :kill_port
if /i "%~1"=="help" goto :help

echo Unknown command: %~1
goto :help

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
echo Commands:
echo   dev        - Start development server
echo   build      - Build for production
echo   deploy     - Deploy to Vercel (builds first)
echo   test       - Run tests
echo   lint       - Run ESLint
echo   format     - Format code with Prettier
echo   typecheck  - Run TypeScript type check
echo   check      - Run all checks (lint + type + format)
echo   ports      - View active ports
echo   killport   - Kill a port process
echo   help       - Show this help
echo.
echo Run without arguments for interactive menu
echo.
goto :end

:end
endlocal
exit /b 0