# SkillLift Server Startup Script
# This script properly starts both backend and frontend servers

Write-Host "🚀 Starting SkillLift Servers..." -ForegroundColor Green

# Kill any existing Node.js processes
Write-Host "🛑 Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "nodemon" -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment for processes to stop
Start-Sleep -Seconds 2

# Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Yellow
$env:MONGO_URI = "mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift"
$env:JWT_SECRET = "skilllift_jwt_secret_key_2024_very_secure_and_long_enough_for_production_use"

# Start backend server
Write-Host "🔙 Starting backend server..." -ForegroundColor Cyan
Set-Location "backend"
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden
Start-Sleep -Seconds 3

# Check if backend is running
$backendRunning = netstat -an | findstr ":5000"
if ($backendRunning) {
    Write-Host "✅ Backend server is running on port 5000" -ForegroundColor Green
} else {
    Write-Host "❌ Backend server failed to start" -ForegroundColor Red
    exit 1
}

# Start frontend server
Write-Host "🎨 Starting frontend server..." -ForegroundColor Cyan
Set-Location "../frontend"
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
Start-Sleep -Seconds 5

# Check if frontend is running
$frontendRunning = netstat -an | findstr ":5173"
if ($frontendRunning) {
    Write-Host "✅ Frontend server is running on port 5173" -ForegroundColor Green
} else {
    Write-Host "⚠️ Frontend server may still be starting..." -ForegroundColor Yellow
}

Write-Host "🎉 Servers started successfully!" -ForegroundColor Green
Write-Host "🌐 Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🎨 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow

# Keep script running
while ($true) {
    Start-Sleep -Seconds 10
}
