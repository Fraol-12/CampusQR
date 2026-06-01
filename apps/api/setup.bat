@echo off
title CampusQR Setup
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
echo Installing Node packages...
call npm install
if errorlevel 1 goto fail
echo.
echo Seeding database...
call npm run seed
if errorlevel 1 goto fail
echo.
echo Setup complete! Double-click start.bat or run: npm start
pause
exit /b 0
:fail
echo Setup failed. Make sure Node.js is installed from https://nodejs.org
pause
exit /b 1
