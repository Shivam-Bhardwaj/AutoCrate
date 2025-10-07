@echo off
REM Keploy Test Runner for Windows
REM Executes recorded Keploy tests

echo ========================================
echo Keploy Test Runner for AutoCrate
echo ========================================

set APP_NAME=autocrate-nx-generator
set APP_PORT=3000
set TEST_PATH=./keploy-tests

REM Check if Docker is running
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker is not installed or not running
    exit /b 1
)

REM Check if application is running
echo Checking application status...
curl -s http://localhost:%APP_PORT% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Application not running. Starting...
    start /b npm run dev
    timeout /t 10 /nobreak >nul
)

REM Run Keploy tests
echo Running Keploy tests...
echo.

REM Test standard crate calculations
echo [1/4] Testing standard crate calculations...
docker run --rm ^
    --name keploy-tester ^
    --network host ^
    -v "%CD%/keploy-tests:/app/tests" ^
    -v "%CD%/keploy-mocks:/app/mocks" ^
    ghcr.io/keploy/keploy:latest ^
    test ^
    --path "./tests/standard" ^
    --app-name "%APP_NAME%" ^
    --test-set "standard-crates"

REM Test plywood optimization
echo [2/4] Testing plywood optimization...
docker run --rm ^
    --name keploy-tester ^
    --network host ^
    -v "%CD%/keploy-tests:/app/tests" ^
    -v "%CD%/keploy-mocks:/app/mocks" ^
    ghcr.io/keploy/keploy:latest ^
    test ^
    --path "./tests/optimization" ^
    --app-name "%APP_NAME%" ^
    --test-set "optimization"

REM Test cleat placement
echo [3/4] Testing cleat placement...
docker run --rm ^
    --name keploy-tester ^
    --network host ^
    -v "%CD%/keploy-tests:/app/tests" ^
    -v "%CD%/keploy-mocks:/app/mocks" ^
    ghcr.io/keploy/keploy:latest ^
    test ^
    --path "./tests/cleats" ^
    --app-name "%APP_NAME%" ^
    --test-set "cleat-placement"

REM Test NX export
echo [4/4] Testing NX export functionality...
docker run --rm ^
    --name keploy-tester ^
    --network host ^
    -v "%CD%/keploy-tests:/app/tests" ^
    -v "%CD%/keploy-mocks:/app/mocks" ^
    ghcr.io/keploy/keploy:latest ^
    test ^
    --path "./tests/nx-export" ^
    --app-name "%APP_NAME%" ^
    --test-set "nx-export"

echo.
echo ========================================
echo Test execution completed!
echo Check ./test-results for detailed reports
echo ========================================

pause