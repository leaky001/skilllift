@echo off
echo Starting WebSocket Server...
cd /d "%~dp0"
node websocket-server.js
pause
