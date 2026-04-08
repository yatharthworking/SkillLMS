@echo off
setlocal

cd /d "%~dp0"
if not exist "logs" mkdir "logs"

set "BASE_DIR=c:\Users\YATHAR~1\Desktop\Projects\LMSFIN~2\BACKEN~1"
set "ARG_FILE=%BASE_DIR%\target\run-backend.args"

> "%ARG_FILE%" echo -cp
>> "%ARG_FILE%" <nul set /p =%BASE_DIR%\target\classes;
type "%BASE_DIR%\target\runtime-classpath-short.txt" >> "%ARG_FILE%"
>> "%ARG_FILE%" echo(
>> "%ARG_FILE%" echo com.soul.lms.LmsApplication

call java @"%ARG_FILE%" >> "%~dp0logs\backend-detached.log" 2>&1
