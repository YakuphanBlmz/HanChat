@echo off
echo ===================================================
echo   HanChat Baslatiliyor...
echo ===================================================

:: Start Backend
start "HanChat Backend" cmd /k "python -m uvicorn src.api:app --reload --host 127.0.0.1 --port 8000"

:: Start Frontend
cd web-dashboard
start "HanChat Frontend" cmd /k "npm run dev"

echo.
echo Sistem baslatildi!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Pencereleri kapatmayin.
