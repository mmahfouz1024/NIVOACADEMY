@echo off
cd /d "%~dp0"
set "PATH=%~dp0.tools\node-v22.12.0-win-x64;%PATH%"
echo Starting NIVO Academy on http://localhost:3000 ...
start "" "http://localhost:3000"
call npm.cmd run dev
pause
