@echo off
setlocal

cd /d "%~dp0"
start "LMS Backend" /min cmd.exe /c "%~dp0run-backend-classes.cmd"
