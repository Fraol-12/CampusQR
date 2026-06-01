@echo off
title CampusQR Server
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
set NODE_ENV=development
echo Starting CampusQR...
echo Open http://localhost:3000 in your browser after server starts.
echo.
if not exist "node_modules\" (
  echo Installing dependencies first...
  call npm install
  call npm run seed
)
echo.
echo ========================================
echo   Open: http://localhost:3000
echo   Login: admin@university.edu / admin123
echo ========================================
echo.
call npm start
pause
