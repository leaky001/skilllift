@echo off
echo.
echo ========================================
echo    BOT STATUS DIAGNOSTIC
echo ========================================
echo.
echo 1. Checking if Backend is running...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Backend server is running
) else (
    echo [ERROR] Backend server is NOT running!
    echo        Please run: start-backend.bat
)
echo.

echo 2. Checking if MongoDB is running...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] MongoDB should be connected
) else (
    echo [ERROR] MongoDB is NOT running!
    echo        Please start MongoDB service
)
echo.

echo 3. Checking for recording files...
if exist "backend\recordings\*.mp4" (
    echo [OK] Found recording files:
    dir /B backend\recordings\*.mp4
) else (
    echo [INFO] No recording files found yet
)
echo.

echo 4. Checking for bot logs...
if exist "backend\recordings.json" (
    echo [OK] Found recordings metadata:
    type backend\recordings.json
) else (
    echo [INFO] No recording metadata yet
)
echo.

echo ========================================
echo    HOW TO VERIFY BOT IN GOOGLE MEET:
echo ========================================
echo.
echo When the bot joins your meeting, you will see:
echo   - A NEW Chrome window appears (headless browser)
echo   - A participant joins with YOUR NAME
echo   - This is the BOT recording!
echo.
echo In your backend terminal, look for:
echo   [32m[OK] Starting automated recording bot...[0m
echo   [32m[OK] Bot initialized successfully[0m
echo   [32m[OK] Joining meeting: https://meet.google.com/...[0m
echo   [32m[OK] Recording started[0m
echo.
echo ========================================
echo.
pause

