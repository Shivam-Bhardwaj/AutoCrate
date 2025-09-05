@echo off
SETLOCAL

REM Set the port you want to clear
SET PORT_TO_CLEAR=3000

REM --- Script logic ---
ECHO Checking environment...

REM Only run this script in a production environment
IF NOT "%NODE_ENV%"=="production" (
    ECHO Not in production environment (NODE_ENV is not 'production'). Skipping port clearing.
    GOTO :EOF
)

ECHO Production environment detected. Searching for process on port %PORT_TO_CLEAR%...

REM Find the PID of the process using the specified port
FOR /F "tokens=5" %%P IN ('netstat -a -n -o ^| findstr :%PORT_TO_CLEAR% ^| findstr LISTENING') DO (
    IF "%%P" NEQ "0" (
        ECHO Found process with PID %%P on port %PORT_TO_CLEAR%.
        ECHO Terminating process...
        taskkill /F /PID %%P
        GOTO :SUCCESS
    )
)

ECHO No active process found on port %PORT_TO_CLEAR%.
GOTO :EOF

:SUCCESS
ECHO Process terminated successfully.

:EOF
ENDLOCAL
