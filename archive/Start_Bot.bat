@echo off
echo ===================================================
echo   HanChat - AI Ajan Modu Baslatiliyor...
echo ===================================================
echo.
echo 1. Gerekli kutuphaneler kontrol ediliyor...
echo.
echo 2. Backend Server (API) aciliyor...
echo    Lutfen bu pencereyi KAPATMAYIN. 
echo    Bu pencere kapanirsa sistem durur.
echo.

cd /d "%~dp0"
python -m uvicorn src.api:app --reload --host 127.0.0.1 --port 8000

echo.
echoServer kapandi veya bir hata olustu.
pause
