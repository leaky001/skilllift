# SkillLift Server Stop Script
# This script stops all Node.js processes

Write-Host "🛑 Stopping SkillLift Servers..." -ForegroundColor Red

# Stop all Node.js processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "nodemon" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "✅ All servers stopped successfully!" -ForegroundColor Green
