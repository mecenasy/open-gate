@echo off
rem Wrapper - odpala scripts\zrok-tunnels.ps1 z domyslnymi parametrami.
rem Argumenty z linii polecen (-Reserved, -SyncEnv itd.) sa przekazywane dalej.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0zrok-tunnels.ps1" %*
