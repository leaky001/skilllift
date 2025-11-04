@echo off
echo.
echo ========================================
echo    SETTING UP LOCAL REPLAY SYSTEM
echo ========================================
echo.

echo Step 1: Creating necessary folders...
if not exist "backend\recordings" (
    mkdir backend\recordings
    echo [OK] Created backend\recordings
) else (
    echo [OK] backend\recordings already exists
)

if not exist "backend\uploads" (
    mkdir backend\uploads
    echo [OK] Created backend\uploads
)

if not exist "backend\uploads\replays" (
    mkdir backend\uploads\replays
    echo [OK] Created backend\uploads\replays
) else (
    echo [OK] backend\uploads\replays already exists
)

echo.
echo Step 2: Checking .gitignore...
findstr /C:"uploads/replays/*.mp4" .gitignore >nul 2>&1
if %errorlevel% neq 0 (
    echo uploads/replays/*.mp4 >> .gitignore
    echo [OK] Added video files to .gitignore
) else (
    echo [OK] .gitignore already configured
)

echo.
echo Step 3: Verifying Puppeteer installation...
cd backend
call npm list puppeteer >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Puppeteer is installed
) else (
    echo [WARN] Puppeteer not found. Installing...
    call npm install puppeteer puppeteer-screen-recorder --legacy-peer-deps
)
cd ..

echo.
echo ========================================
echo    SETUP COMPLETE!
echo ========================================
echo.
echo Your local replay system is ready!
echo.
echo NEXT STEPS:
echo 1. Start your backend: cd backend ^&^& npm start
echo 2. Start a test live class
echo 3. End the class after 1-2 minutes
echo 4. Check backend\uploads\replays for the recording
echo.
echo TIP: Watch your backend terminal for bot messages!
echo.
pause

