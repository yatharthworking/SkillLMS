@echo off
setlocal

cd /d "%~dp0"
if not exist "logs" mkdir "logs"

call mvnw.cmd spring-boot:run -DskipTests >> "%~dp0logs\backend-detached.log" 2>&1
