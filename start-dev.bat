@echo off
echo ============================================
echo AutoCrate Development Server
echo ============================================
echo.
echo IMPORTANT: OneDrive Sync Issue
echo ------------------------------
echo This project is in a OneDrive folder which causes
echo "readlink" errors with Next.js. These errors are
echo cosmetic - the server will still work.
echo.
echo To avoid these errors completely, consider:
echo 1. Pausing OneDrive sync while developing
echo 2. Moving the project outside OneDrive
echo 3. Using WSL2 for development
echo.
echo ============================================
echo.
echo Cleaning any corrupted build files...
if exist .next\server\chunks (
    rmdir /s /q .next\server\chunks 2>nul
)
if exist .next\static (
    rmdir /s /q .next\static 2>nul
)

echo Starting server (ignore readlink errors)...
echo.
echo Server will be available at:
echo   http://localhost:3000 or http://localhost:3001
echo.
npm run dev 2>&1 | findstr /v "readlink"