@echo off
echo ========================================
echo   Demarrage Projet Maintenance
echo ========================================
echo.

echo [1/2] Demarrage Backend Flask...
start cmd /k "cd backend && python app.py"

timeout /t 3

echo [2/2] Demarrage Frontend React...
start cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   Projet demarre !
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
pause
