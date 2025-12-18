@echo off
echo ========================================
echo  Configurar Inicio Automatico
echo  Servidor - Agenda Eventos VRIN
echo ========================================
echo.

set SCRIPT_DIR=%~dp0
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo Creando acceso directo en carpeta de inicio...
echo.

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTUP_FOLDER%\Servidor Agenda VRIN.lnk'); $Shortcut.TargetPath = '%SCRIPT_DIR%iniciar-servidor.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'Servidor Local Agenda Eventos VRIN'; $Shortcut.Save()"

if %ERRORLEVEL% EQU 0 (
    echo [OK] Acceso directo creado exitosamente!
    echo.
    echo El servidor se iniciara automaticamente al encender Windows.
    echo.
    echo Ubicacion: %STARTUP_FOLDER%
    echo.
    echo Para desactivar: elimina el acceso directo "Servidor Agenda VRIN" de la carpeta de inicio.
) else (
    echo [ERROR] No se pudo crear el acceso directo.
)

echo.
pause
