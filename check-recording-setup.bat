@echo off
REM Quick Recording Setup Checker for Windows
REM This script helps you verify your Google Meet recording configuration

echo.
echo ========================================================================
echo                 GOOGLE MEET RECORDING SETUP CHECKER
echo ========================================================================
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo Error: Please run this script from the project root directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo Checking backend directory...
cd backend

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found in backend directory
    echo Please create a .env file with your Google OAuth credentials
    echo.
    pause
)

echo ========================================================================
echo Running verification script...
echo ========================================================================
echo.

REM Run the verification script
node verify-google-setup.js

echo.
echo ========================================================================
echo Verification Complete!
echo ========================================================================
echo.
echo Would you like to:
echo   1. Open the browser test page
echo   2. Check recording status
echo   3. Exit
echo.
choice /c 123 /n /m "Enter your choice (1-3): "

if errorlevel 3 goto end
if errorlevel 2 goto check_status
if errorlevel 1 goto open_browser

:open_browser
cd ..
start "" "test-google-meet-recording.html"
echo Browser test page opened!
goto end

:check_status
node check-recording-status.js
pause
goto end

:end
cd ..
echo.
echo Thank you for using the Recording Setup Checker!
echo For more information, read GOOGLE_MEET_RECORDING_GUIDE.md
echo.
pause

