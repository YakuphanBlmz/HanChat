@echo off
echo WIA-Bot Baslatiliyor...

echo 1. Backend (API) Baslatiliyor...
start "WIA-Bot Backend" cmd /k "python -m uvicorn src.api:app --reload"

echo 2. Frontend (Arayuz) Baslatiliyor...
cd web-dashboard
start "WIA-Bot Frontend" cmd /k "npm run dev"

echo Islem tamamlandi! Acilan yeni pencereleri kapatmayin.
pause
