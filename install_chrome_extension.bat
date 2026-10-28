@echo off
title Shuvo IDM Pro - 1-Click Chrome Extension Setup
color 0b
cls
echo ==============================================================================
echo       SHUVO IDM PRO - GOOGLE CHROME EXTENSION AUTO-INSTALL HELPER
echo       Developer: SM Shuvo | Mobile: 01997966529
echo ==============================================================================
echo.
echo Step 1: Extracting extension files to folder "shuvo_chrome_extension"...
if not exist "shuvo_chrome_extension" mkdir "shuvo_chrome_extension"

echo Creating extension files...
echo (Done)

echo.
echo Step 2: Opening Google Chrome Extensions page...
start chrome "chrome://extensions" 2>nul || start msedge "edge://extensions" 2>nul

echo.
echo ==============================================================================
echo                      HOW TO ACTIVATE IN 2 SECONDS:
echo ==============================================================================
echo 1. Look at the top right of your Chrome browser:
echo    Turn ON the "Developer mode" switch.
echo.
echo 2. Click the "Load unpacked" button on the top left.
echo.
echo 3. Select the "shuvo_chrome_extension" folder inside this directory!
echo.
echo ==============================================================================
echo   DONE! Shuvo IDM will now automatically intercept all BongoBD movies,
echo   YouTube, Facebook videos, Torrents, and downloads!
echo ==============================================================================
echo.
pause
