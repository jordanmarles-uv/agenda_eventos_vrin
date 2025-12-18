@echo off
echo ========================================
echo  Servidor Local - Agenda Eventos VRIN
echo ========================================
echo.
echo Iniciando servidor en http://localhost:8080
echo Presiona Ctrl+C para detener el servidor
echo.
cd /d "%~dp0"
npx http-server -p 8080 -c-1 .
