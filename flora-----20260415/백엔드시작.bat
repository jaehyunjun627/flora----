@echo off
cd /d "%~dp0backend"
echo 백엔드 시작 중...
call gradlew.bat bootRun
pause
