# SkillLift Backend Server Starter
Write-Host "🚀 Starting SkillLift Backend Server..." -ForegroundColor Green

# Change to backend directory
Set-Location -Path "$PSScriptRoot\backend"
Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Check if server is already running
$portCheck = netstat -ano | findstr :3001
if ($portCheck) {
    Write-Host "⚠️  Port 3001 is already in use. Server might be running." -ForegroundColor Yellow
    Write-Host "🔍 Checking if server is responding..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Server is already running and responding!" -ForegroundColor Green
            Write-Host "🌐 Health check: http://localhost:3001/health" -ForegroundColor Cyan
            Write-Host "🔐 Admin login: http://localhost:3001/api/auth" -ForegroundColor Cyan
            exit 0
        }
    } catch {
        Write-Host "❌ Server is not responding. Starting new instance..." -ForegroundColor Red
    }
}

# Start the server
Write-Host "🚀 Starting server on port 3001..." -ForegroundColor Green
Write-Host "📊 Health check will be available at: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host "🔐 Admin API will be available at: http://localhost:3001/api/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

node server.js
