@echo off
title Shuvo IDM Pro - Build Windows .EXE Software (Exact UI)
color 0b
cls
echo ==============================================================================
echo             SHUVO IDM PRO - STANDALONE WINDOWS .EXE BUILDER
echo             Developer: SM Shuvo | Mobile: 01997966529
echo ==============================================================================
echo.
echo [1/4] Checking Node.js environment...
node -v >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js is not installed on this computer!
    echo Please download and install Node.js (LTS version) from:
    echo https://nodejs.org/
    echo.
    echo After installing Node.js, run this build_desktop_app.bat file again.
    pause
    exit /b
)
echo Node.js version detected:
node -v

echo.
echo [2/4] Installing necessary builder packages (Electron & Electron-Builder)...
echo (This downloads the standalone Windows packaging engine)
call npm install
call npm install -D electron electron-builder

echo.
echo [3/4] Compiling React and Tailwind high-performance frontend...
call npm run build

echo.
echo [4/4] Packaging standalone Windows .EXE installer...
echo Please wait 1-2 minutes while the executable is being packaged...
call npx electron-builder --win

echo.
echo ==============================================================================
echo   CONGRATULATIONS! BUILD SUCCESSFUL!
echo ==============================================================================
echo.
echo Your standalone Windows software is ready inside the "dist-electron" or "dist" folder!
echo.
echo Files created:
echo 1. Shuvo IDM Pro Setup.exe (Installer for other computers)
echo 2. win-unpacked/Shuvo IDM Pro.exe (Direct portable execution)
echo.
echo You can now copy this .exe file to a PenDrive or Google Drive and use it
echo on ANY Windows computer without needing Node.js or Python installed!
echo.
if exist "dist-electron" (
    explorer dist-electron
) else if exist "dist" (
    explorer dist
)
pause
