@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM HR-Eventtechnik Project Code Copier für Windows
REM Kopiert strukturiert alle Projektdateien in die Zwischenablage

set "PROJECT_PATH=."
set "OUTPUT_FILE=%temp%\project_code.txt"

echo 🚀 HR-Eventtechnik Code Copier
echo ================================

REM Überprüfen ob Ordner existiert
if not exist "%PROJECT_PATH%" (
    echo ❌ Ordner nicht gefunden: %PROJECT_PATH%
    echo 💡 Bitte den PROJECT_PATH in der ersten Zeile anpassen!
    pause
    exit /b 1
)

for %%i in ("%PROJECT_PATH%") do set "PROJECT_NAME=%%~nxi"
echo 📂 Analysiere Projekt: %PROJECT_NAME%
echo ============================================================

REM Output-Datei erstellen
echo === HR-EVENTTECHNIK PROJEKT CODE === > "%OUTPUT_FILE%"
echo Projekt: %PROJECT_NAME% >> "%OUTPUT_FILE%"
echo Pfad: %CD% >> "%OUTPUT_FILE%"
echo Erstellt: %date% %time% >> "%OUTPUT_FILE%"
echo ============================================================ >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"
echo 📁 PROJEKTSTRUKTUR: >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

REM Projektstruktur erstellen
echo 📁 PROJEKTSTRUKTUR: >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

REM Alle relevanten Dateien finden und sortiert auflisten
for /f "delims=" %%f in ('dir /b /s *.html *.css *.js *.json *.md *.txt 2^>nul ^| findstr /v /i "node_modules .git dist build" ^| sort') do (
    set "filepath=%%f"
    set "relpath=!filepath:%CD%=.!"
    echo !relpath! >> "%OUTPUT_FILE%"
)

echo. >> "%OUTPUT_FILE%"
echo ============================================================ >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

REM Dateien zählen
set "file_count=0"

REM Dateien verarbeiten
for /f "delims=" %%f in ('dir /b /s *.html *.css *.js *.json *.md *.txt 2^>nul ^| findstr /v /i "node_modules .git dist build" ^| sort') do (
    set "filepath=%%f"
    set "relpath=!filepath:%CD%=.!"
    
    echo 📄 DATEI: !relpath! >> "%OUTPUT_FILE%"
    echo ------------------------------------------------------------ >> "%OUTPUT_FILE%"
    
    REM Dateiinhalt hinzufügen
    if exist "%%f" (
        type "%%f" >> "%OUTPUT_FILE%" 2>nul || echo [FEHLER: Datei konnte nicht gelesen werden] >> "%OUTPUT_FILE%"
    ) else (
        echo [FEHLER: Datei nicht lesbar] >> "%OUTPUT_FILE%"
    )
    
    echo. >> "%OUTPUT_FILE%"
    echo ============================================================ >> "%OUTPUT_FILE%"
    echo. >> "%OUTPUT_FILE%"
    
    echo ✅ !relpath!
    set /a file_count+=1
)

REM In Zwischenablage kopieren (Windows)
type "%OUTPUT_FILE%" | clip

REM Statistiken
for %%A in ("%OUTPUT_FILE%") do set "file_size=%%~zA"

echo.
echo 🎉 ERFOLGREICH!
echo 📋 %file_count% Dateien in Zwischenablage kopiert
echo 📏 Gesamtgröße: %file_size% Zeichen
echo.
echo 💡 Du kannst jetzt Strg+V drücken um alles einzufügen!

REM Temporäre Datei aufräumen
del "%OUTPUT_FILE%" 2>nul

echo.
pause
