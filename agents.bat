@echo off
REM ===================================================================
REM AutoCrate Agent Integration Script
REM Integrates AI agents for development assistance
REM ===================================================================

setlocal enabledelayedexpansion

REM Color codes for output
set RED=[31m
set GREEN=[32m
set YELLOW=[33m
set BLUE=[34m
set MAGENTA=[35m
set CYAN=[36m
set RESET=[0m
set BOLD=[1m

REM Agent paths
set AGENT_DIR=%USERPROFILE%\agents\claude-agents
set RESEARCH_AGENT=%AGENT_DIR%\research-agent.py
set TODO_AGENT=%AGENT_DIR%\todo-agent.py
set AI_COMM=%AGENT_DIR%\cli.py
set PROJECT_NAME=autocrate-web

REM Check if no arguments provided
if "%~1"=="" goto :show_menu

REM Parse command
set COMMAND=%1
shift

REM Route to appropriate handler
if /i "%COMMAND%"=="research" goto :research
if /i "%COMMAND%"=="todo" goto :todo
if /i "%COMMAND%"=="delegate" goto :delegate
if /i "%COMMAND%"=="ask" goto :ask
if /i "%COMMAND%"=="status" goto :status
if /i "%COMMAND%"=="analyze" goto :analyze_project
if /i "%COMMAND%"=="plan" goto :plan_feature
if /i "%COMMAND%"=="implement" goto :implement_feature
if /i "%COMMAND%"=="review" goto :review_code
if /i "%COMMAND%"=="help" goto :show_help
goto :invalid_command

REM ===================================================================
REM Interactive Menu
REM ===================================================================
:show_menu
cls
echo %CYAN%====================================================================%RESET%
echo %BOLD%%CYAN%            AutoCrate Agent Integration System%RESET%
echo %CYAN%====================================================================%RESET%
echo.
echo %YELLOW%Quick Actions:%RESET%
echo   %GREEN%[1]%RESET% Analyze Project Idea
echo   %GREEN%[2]%RESET% Manage TODOs
echo   %GREEN%[3]%RESET% Delegate to Qwen (Coding)
echo   %GREEN%[4]%RESET% Ask Gemini (Documentation)
echo   %GREEN%[5]%RESET% Check Agent Status
echo.
echo %YELLOW%AutoCrate Specific:%RESET%
echo   %GREEN%[6]%RESET% Plan New Feature
echo   %GREEN%[7]%RESET% Implement Feature
echo   %GREEN%[8]%RESET% Review Code Changes
echo   %GREEN%[9]%RESET% Generate Documentation
echo.
echo %YELLOW%Utilities:%RESET%
echo   %GREEN%[H]%RESET% Show Help
echo   %GREEN%[Q]%RESET% Quit
echo.
echo %CYAN%====================================================================%RESET%

set /p choice="Select option: "

if "%choice%"=="1" goto :analyze_interactive
if "%choice%"=="2" goto :todo_interactive
if "%choice%"=="3" goto :delegate_interactive
if "%choice%"=="4" goto :ask_interactive
if "%choice%"=="5" goto :status
if "%choice%"=="6" goto :plan_interactive
if "%choice%"=="7" goto :implement_interactive
if "%choice%"=="8" goto :review_interactive
if "%choice%"=="9" goto :docs_interactive
if /i "%choice%"=="H" goto :show_help
if /i "%choice%"=="Q" exit /b 0
goto :show_menu

REM ===================================================================
REM Research Agent Commands
REM ===================================================================
:research
set "idea=%*"
if "%idea%"=="" (
    echo %RED%Error: Please provide an idea to research%RESET%
    exit /b 1
)
echo %CYAN%Analyzing idea: %idea%%RESET%
python "%RESEARCH_AGENT%" "{\"command\": \"analyze\", \"idea\": \"%idea%\", \"project\": \"%PROJECT_NAME%\"}"
exit /b 0

:analyze_interactive
echo.
set /p idea="Enter idea to analyze: "
call :research %idea%
pause
goto :show_menu

:analyze_project
echo %CYAN%Analyzing AutoCrate project for improvements...%RESET%
python "%RESEARCH_AGENT%" "{\"command\": \"analyze\", \"idea\": \"Improve AutoCrate 3D visualization and NX CAD generation\", \"project\": \"%PROJECT_NAME%\"}"
exit /b 0

REM ===================================================================
REM TODO Management
REM ===================================================================
:todo
set "action=%1"
shift
set "params=%*"

if "%action%"=="" goto :todo_list
if /i "%action%"=="add" goto :todo_add
if /i "%action%"=="list" goto :todo_list
if /i "%action%"=="update" goto :todo_update
if /i "%action%"=="report" goto :todo_report
goto :todo_list

:todo_add
set "title=%*"
if "%title%"=="" (
    echo %RED%Error: Please provide a task title%RESET%
    exit /b 1
)
python "%TODO_AGENT%" "{\"action\": \"add\", \"params\": {\"title\": \"%title%\", \"project\": \"%PROJECT_NAME%\", \"priority\": \"medium\"}}"
exit /b 0

:todo_list
echo %CYAN%TODOs for %PROJECT_NAME%:%RESET%
python "%TODO_AGENT%" "{\"action\": \"list\", \"params\": {\"project\": \"%PROJECT_NAME%\"}}"
exit /b 0

:todo_update
set "id=%1"
shift
set "status=%1"
if "%id%"=="" (
    echo %RED%Error: Please provide TODO ID%RESET%
    exit /b 1
)
python "%TODO_AGENT%" "{\"action\": \"update\", \"params\": {\"id\": %id%, \"status\": \"%status%\"}}"
exit /b 0

:todo_report
echo %CYAN%Generating TODO report...%RESET%
python "%TODO_AGENT%" "{\"action\": \"report\", \"params\": {\"project\": \"%PROJECT_NAME%\"}}"
exit /b 0

:todo_interactive
echo.
echo %YELLOW%TODO Management:%RESET%
echo   [1] List TODOs
echo   [2] Add TODO
echo   [3] Update TODO
echo   [4] Generate Report
echo   [B] Back
echo.
set /p todo_choice="Select option: "

if "%todo_choice%"=="1" (
    call :todo_list
    pause
    goto :todo_interactive
)
if "%todo_choice%"=="2" (
    set /p task="Enter task: "
    call :todo_add !task!
    pause
    goto :todo_interactive
)
if "%todo_choice%"=="3" (
    call :todo_list
    echo.
    set /p id="Enter TODO ID: "
    echo Status options: todo, in_progress, done, blocked
    set /p status="Enter new status: "
    call :todo_update !id! !status!
    pause
    goto :todo_interactive
)
if "%todo_choice%"=="4" (
    call :todo_report
    pause
    goto :todo_interactive
)
if /i "%todo_choice%"=="B" goto :show_menu
goto :todo_interactive

REM ===================================================================
REM AI Communication
REM ===================================================================
:delegate
set "agent=%1"
shift
set "task=%1"
shift
set "description=%*"

if "%agent%"=="" (
    echo %RED%Error: Specify agent (qwen or gemini)%RESET%
    exit /b 1
)
if "%task%"=="" (
    echo %RED%Error: Provide task title%RESET%
    exit /b 1
)

echo %CYAN%Delegating to %agent%: %task%%RESET%
python "%AI_COMM%" delegate %agent% "%task%" "%description%" --priority high --project %PROJECT_NAME%
exit /b 0

:ask
set "agent=%1"
shift
set "question=%*"

if "%agent%"=="" (
    echo %RED%Error: Specify agent (qwen or gemini)%RESET%
    exit /b 1
)

echo %CYAN%Asking %agent%: %question%%RESET%
python "%AI_COMM%" ask %agent% "%question%"
exit /b 0

:status
echo %CYAN%Agent Communication Status:%RESET%
python "%AI_COMM%" status
exit /b 0

:delegate_interactive
echo.
echo %YELLOW%Delegate to AI Agent:%RESET%
echo   [1] Qwen (Coding tasks)
echo   [2] Gemini (Documentation)
echo   [B] Back
echo.
set /p del_choice="Select agent: "

if "%del_choice%"=="1" set "agent=qwen"
if "%del_choice%"=="2" set "agent=gemini"
if /i "%del_choice%"=="B" goto :show_menu

set /p task="Enter task title: "
set /p desc="Enter description: "
call :delegate %agent% "%task%" "%desc%"
pause
goto :show_menu

:ask_interactive
echo.
echo %YELLOW%Ask AI Agent:%RESET%
echo   [1] Qwen (Technical questions)
echo   [2] Gemini (Documentation questions)
echo   [B] Back
echo.
set /p ask_choice="Select agent: "

if "%ask_choice%"=="1" set "agent=qwen"
if "%ask_choice%"=="2" set "agent=gemini"
if /i "%ask_choice%"=="B" goto :show_menu

set /p question="Enter question: "
call :ask %agent% "%question%"
pause
goto :show_menu

REM ===================================================================
REM AutoCrate Specific Features
REM ===================================================================
:plan_feature
echo %CYAN%Planning new AutoCrate feature...%RESET%
echo.
echo Delegating planning to Gemini...
python "%AI_COMM%" delegate gemini "Plan AutoCrate Feature" "Create detailed plan for new feature: Enhanced 3D controls with touch gestures, material selection, and real-time dimension editing" --priority high
echo.
echo Creating research task...
python "%RESEARCH_AGENT%" "{\"command\": \"analyze\", \"idea\": \"Add material selection and cost calculation to AutoCrate\", \"project\": \"%PROJECT_NAME%\"}"
exit /b 0

:plan_interactive
set /p feature="Enter feature to plan: "
echo %CYAN%Planning: %feature%%RESET%
python "%AI_COMM%" delegate gemini "Plan: %feature%" "Create detailed implementation plan for AutoCrate" --priority high
pause
goto :show_menu

:implement_feature
echo %CYAN%Starting feature implementation workflow...%RESET%
echo.
echo Step 1: Delegating backend to Qwen...
python "%AI_COMM%" delegate qwen "Implement AutoCrate Backend" "Add API endpoints for material selection and cost calculation" --priority high
echo.
echo Step 2: Adding TODO items...
python "%TODO_AGENT%" "{\"action\": \"add\", \"params\": {\"title\": \"Implement material selection UI\", \"project\": \"%PROJECT_NAME%\", \"priority\": \"high\"}}"
python "%TODO_AGENT%" "{\"action\": \"add\", \"params\": {\"title\": \"Add cost calculation service\", \"project\": \"%PROJECT_NAME%\", \"priority\": \"high\"}}"
python "%TODO_AGENT%" "{\"action\": \"add\", \"params\": {\"title\": \"Update 3D viewer for materials\", \"project\": \"%PROJECT_NAME%\", \"priority\": \"medium\"}}"
exit /b 0

:implement_interactive
set /p feature="Enter feature to implement: "
echo %CYAN%Implementing: %feature%%RESET%
python "%AI_COMM%" delegate qwen "Implement: %feature%" "Write code for AutoCrate feature" --priority high
python "%TODO_AGENT%" "{\"action\": \"add\", \"params\": {\"title\": \"Implement %feature%\", \"project\": \"%PROJECT_NAME%\", \"priority\": \"high\"}}"
pause
goto :show_menu

:review_code
echo %CYAN%Reviewing AutoCrate code changes...%RESET%
git status --short
echo.
echo Analyzing changes...
python "%RESEARCH_AGENT%" "{\"command\": \"analyze\", \"idea\": \"Review recent code changes for performance and best practices\", \"project\": \"%PROJECT_NAME%\"}"
exit /b 0

:review_interactive
call :review_code
pause
goto :show_menu

:docs_interactive
echo.
set /p component="Enter component to document: "
echo %CYAN%Generating documentation for: %component%%RESET%
python "%AI_COMM%" delegate gemini "Document %component%" "Create comprehensive documentation for AutoCrate %component%" --priority medium
pause
goto :show_menu

REM ===================================================================
REM Help Section
REM ===================================================================
:show_help
echo.
echo %CYAN%AutoCrate Agent Integration System - Help%RESET%
echo %CYAN%=========================================%RESET%
echo.
echo %YELLOW%Available Commands:%RESET%
echo.
echo %GREEN%Research & Analysis:%RESET%
echo   agents research "idea"           - Analyze a project idea
echo   agents analyze                   - Analyze AutoCrate for improvements
echo.
echo %GREEN%TODO Management:%RESET%
echo   agents todo                      - List all TODOs
echo   agents todo add "task"           - Add a new TODO
echo   agents todo update ID STATUS     - Update TODO status
echo   agents todo report               - Generate markdown report
echo.
echo %GREEN%AI Delegation:%RESET%
echo   agents delegate qwen "task" "description"    - Delegate coding to Qwen
echo   agents delegate gemini "task" "description"  - Delegate docs to Gemini
echo   agents ask qwen "question"                   - Ask Qwen a question
echo   agents ask gemini "question"                 - Ask Gemini a question
echo   agents status                                 - Check delegation status
echo.
echo %GREEN%AutoCrate Features:%RESET%
echo   agents plan                      - Plan new feature
echo   agents implement                 - Start implementation workflow
echo   agents review                    - Review code changes
echo.
echo %YELLOW%Interactive Mode:%RESET%
echo   agents                           - Launch interactive menu
echo.
echo %CYAN%Agent Specializations:%RESET%
echo   - Claude: Orchestration, analysis, coordination
echo   - Qwen: Coding, implementation, testing
echo   - Gemini: Documentation, planning, strategy
echo.
pause
if "%~1"=="" goto :show_menu
exit /b 0

REM ===================================================================
REM Error Handling
REM ===================================================================
:invalid_command
echo %RED%Error: Unknown command '%COMMAND%'%RESET%
echo Use 'agents help' for available commands
exit /b 1

:end
endlocal
exit /b 0