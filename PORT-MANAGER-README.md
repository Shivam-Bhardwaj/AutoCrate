# AutoCrate Port Manager

A comprehensive PowerShell script to manage running ports and processes on Windows systems, specifically designed for development environments.

## Features

- 📋 **List all running ports** with process information
- 🎯 **Kill processes by port number**
- 🚀 **Kill common development ports** (3000, 3001, 8000, 8080, 5000, etc.)
- 📊 **Detailed process information** (CPU, memory, threads)
- 🎮 **Interactive menu** for easy navigation
- 🎨 **Color-coded output** for better readability

## Quick Start

### Method 1: Batch File (Recommended)
```bash
# Run the interactive menu
.\port-manager.bat

# Or run directly from PowerShell
.\port-manager.bat menu
```

### Method 2: PowerShell Script
```powershell
# List all running ports
.\port-manager.ps1

# Kill process on specific port
.\port-manager.ps1 -Action kill -Port 3000

# Kill with force (if process is stubborn)
.\port-manager.ps1 -Action kill -Port 3000 -Force

# Kill common development ports
.\port-manager.ps1 -Action common

# Show detailed process information
.\port-manager.ps1 -Action detailed

# Interactive menu
.\port-manager.ps1 -Action menu
```

## Usage Examples

### List All Running Ports
```powershell
.\port-manager.ps1
```
Shows all active network connections with:
- Port number
- Local address
- Connection state
- Process ID (PID)
- Process name
- Process path (truncated for readability)

### Kill Process by Port
```powershell
.\port-manager.ps1 -Action kill -Port 3000
```
Kills the process running on port 3000. Use `-Force` for stubborn processes.

### Kill Common Development Ports
```powershell
.\port-manager.ps1 -Action common
```
Automatically checks and kills processes on common development ports:
- 3000, 3001 (React, Next.js)
- 8000, 8080 (HTTP servers)
- 5000 (Flask, FastAPI)
- 4000 (Nuxt.js)
- 9000 (Various dev servers)
- 5173, 4173 (Vite)

### Interactive Menu
```powershell
.\port-manager.ps1 -Action menu
```
Provides a user-friendly menu with options to:
1. List all running ports
2. Kill process by port number
3. Kill common development ports
4. Show detailed process information
5. Exit

## Output Format

The script provides color-coded output:
- 🔵 **Blue**: Headers and section dividers
- 🟢 **Green**: Success messages and active connections
- 🟡 **Yellow**: Warnings and additional information
- 🔴 **Red**: Errors and failed operations
- 🟣 **Magenta**: Special information
- ⚪ **White**: Regular data

## Sample Output

```
╔══════════════════════════════════════════════╗
║              AutoCrate Port Manager         ║
║                v1.0.0                       ║
╚══════════════════════════════════════════════╝

Active Network Ports:
═══════════════════════════════════════════════════════════════════════════════
Port     Address         State        PID      Process              Path
═══════════════════════════════════════════════════════════════════════════════
3000     127.0.0.1      LISTENING    1234     node                 ...AutoCrate\next-server.js
3001     127.0.0.1      LISTENING    5678     node                 ...AutoCrate\dev-server.js
8080     0.0.0.0        LISTENING    9012     python               ...AutoCrate\server.py

Total unique ports: 3
```

## Requirements

- Windows 10 or later
- PowerShell 5.1 or later
- Administrator privileges (recommended for killing system processes)

## Security Notes

- The script only shows/kills processes that you have permission to access
- For system processes, you may need to run as Administrator
- The script cannot kill protected system processes
- Always verify the process before killing it

## Troubleshooting

### "Access Denied" Error
Run PowerShell as Administrator:
```powershell
# Right-click PowerShell and select "Run as Administrator"
# Then navigate to the script directory
```

### Process Won't Die
Use the `-Force` parameter:
```powershell
.\port-manager.ps1 -Action kill -Port 3000 -Force
```

### No Ports Showing
- Make sure you have active network connections
- Some ports may require Administrator privileges to view
- Check Windows Firewall settings

## Development

This script is part of the AutoCrate project and is designed to help developers manage their development environment more efficiently.

## License

Same as the AutoCrate project.
