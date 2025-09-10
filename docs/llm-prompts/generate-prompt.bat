@echo off
REM LLM Prompt Generator - Windows Batch Script
REM Quick way to generate structured prompts for lightweight LLMs

echo.
echo === LLM Prompt Generator ===
echo.

REM Check if we're in the right directory
if not exist "llm-prompts" mkdir llm-prompts
cd /d "%~dp0"

REM Run the Node.js script
node prompt-generator.js

pause