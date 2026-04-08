@echo off
setlocal

cd /d "%~dp0"

set "APP_JAR=target\lms-0.0.1-SNAPSHOT.jar"
set "RUN_DIR=run"
set "RUNTIME_JAR=%RUN_DIR%\lms-runtime-%RANDOM%%RANDOM%.jar"

if not defined JAVA_HOME (
  for /f "delims=" %%D in ('dir /b /ad "C:\Program Files\Java\jdk-*" 2^>nul') do (
    if not defined JAVA_HOME set "JAVA_HOME=C:\Program Files\Java\%%D"
  )
  if exist "C:\Program Files\Java\latest\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Java\latest"
  )
)

:java_found
if not defined JAVA_HOME (
  echo [ERROR] JAVA_HOME is not set and no JDK was auto-detected.
  echo         Set JAVA_HOME first, then rerun this file.
  exit /b 1
)

if not exist "%JAVA_HOME%\bin\java.exe" (
  echo [ERROR] JAVA_HOME is set but invalid: %JAVA_HOME%
  exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%PATH%"
echo [INFO] Using JAVA_HOME=%JAVA_HOME%
java -version
if errorlevel 1 (
  echo [ERROR] Java is not callable from PATH.
  exit /b 1
)

set "PG_OK="
where powershell >nul 2>nul
if not errorlevel 1 (
  for /f %%A in ('powershell -NoProfile -Command "(Test-NetConnection localhost -Port 5432 -WarningAction SilentlyContinue).TcpTestSucceeded"') do set "PG_OK=%%A"
  if /I not "%PG_OK%"=="True" (
    echo [ERROR] PostgreSQL is not reachable on localhost:5432
    echo         Start PostgreSQL first and ensure DB lmsdb/user lms exists.
    echo         You can run: Backend-LMS\setup-postgres-local.sql in pgAdmin Query Tool.
    exit /b 1
  )
) else (
  echo [WARN] powershell was not found, so PostgreSQL reachability was not checked.
)

if not exist "%APP_JAR%" (
  echo [INFO] Packaged jar not found. Building backend first...
  call mvnw.cmd -q -DskipTests package
  if errorlevel 1 (
    echo [ERROR] Build failed, backend was not started.
    exit /b 1
  )
)

if not exist "%RUN_DIR%" mkdir "%RUN_DIR%"
copy /Y "%APP_JAR%" "%RUNTIME_JAR%" >nul
if errorlevel 1 (
  echo [ERROR] Failed to prepare runtime jar copy.
  exit /b 1
)

echo [INFO] Starting backend runtime jar on http://localhost:8901/soul
echo [INFO] Runtime jar: %RUNTIME_JAR%
call java -jar "%RUNTIME_JAR%"
