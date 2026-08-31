@echo off
echo Starting NGO Connect Full-Stack Application...
echo.
start "NGO Connect Server" cmd /k "cd server && npm start"
timeout /t 2 /nobreak >nul
start "NGO Connect Client" cmd /k "cd client && npm run dev"
echo.
echo Both Server (http://localhost:5000) and Client (http://localhost:3000) are launching!
pause
