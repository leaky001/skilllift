@echo off
echo Starting SkillLift Backend Server...
cd /d "%~dp0backend"
echo Current directory: %CD%
echo Starting server on port 3001...
node server.js
pause