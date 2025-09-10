@echo off
echo ========================================
echo    AutoCrate Port Manager
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0port-manager.ps1" %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Press any key to exit...
    pause >nul
)
