@echo off
title Shuvo IDM Pro - 1-Click Python to Windows EXE Compiler
color 0b
cls
echo ==============================================================================
echo             SHUVO IDM PRO - PYTHON WINDOWS STANDALONE EXE COMPILER
echo             Developer: SM Shuvo | Mobile: 01997966529
echo ==============================================================================
echo.
echo Step 1: Checking Python 3...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in your PATH!
    echo Please download and install Python 3.10+ from: https://www.python.org/downloads/
    echo Remember to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b
)
python --version

echo.
echo Step 2: Upgrading pip and installing required packages...
pip install --upgrade pip
pip install -r requirements.txt

echo.
echo Step 3: Compiling Shuvo IDM to a Standalone Windows .EXE...
echo (This may take 1-2 minutes to package all libraries and ffmpeg engines)
pyinstaller --noconsole --onefile --clean --add-data "dist;dist" --name="Shuvo_IDM_Pro" shuvo_idm_desktop.py

echo.
if exist "dist\Shuvo_IDM_Pro.exe" (
    echo ==============================================================================
    echo  SUCCESS! Your standalone software has been created!
    echo  Executable Location: dist\Shuvo_IDM_Pro.exe
    echo ==============================================================================
    echo.
    echo You can now send "Shuvo_IDM_Pro.exe" to any Windows computer.
    echo It runs without needing Python or any dependencies installed!
    explorer dist
) else (
    echo [ERROR] Compilation failed. Please inspect logs above.
)
echo.
pause
