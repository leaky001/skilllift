Write-Host "🚀 Starting WebSocket Server..." -ForegroundColor Green
Set-Location $PSScriptRoot
node websocket-server.js
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
