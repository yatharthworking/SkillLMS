@echo off
setlocal

set "PORT=8901"
set "PID="

for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
  set "PID=%%P"
  goto :kill_backend
)

echo [INFO] No backend process is listening on port %PORT%.
exit /b 0

:kill_backend
echo [INFO] Stopping backend process on port %PORT% with PID %PID%...
taskkill /PID %PID% /F
if errorlevel 1 (
  echo [ERROR] Failed to stop backend process %PID%.
  exit /b 1
)

echo [INFO] Backend process %PID% stopped.
