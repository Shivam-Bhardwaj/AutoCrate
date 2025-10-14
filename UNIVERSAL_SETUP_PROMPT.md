# Universal AutoCrate Setup Prompt

Use this prompt on **any Linux machine** (Ubuntu, Debian, Arch, WSL, RPi, etc.) to set up AutoCrate development environment.

---

## The Universal Prompt (Copy & Paste This)

```
Set up AutoCrate development environment on this Linux system:

REPOSITORY: https://github.com/Shivam-Bhardwaj/AutoCrate.git
TARGET: ~/AutoCrate

REQUIREMENTS:
1. Detect my Linux distribution and architecture
2. Install Node.js v20+ using the appropriate method for my distro
3. Install Git and build-essential (or equivalent)
4. Clone the repository to ~/AutoCrate
5. Configure Git globally:
   - user.name: Shivam-Bhardwaj
   - user.email: curious.antimony@gmail.com
   - credential.helper: store
   - GitHub token: YOUR_GITHUB_TOKEN
6. Optimize npm if on ARM architecture (maxsockets=5, fetch-retries=5)
7. Install project dependencies with appropriate memory settings
8. Install Vercel CLI globally
9. Configure Vercel token: YOUR_VERCEL_TOKEN (add to ~/.bashrc)
10. Verify installation: run type-check, build, and tests
11. Start development server and tell me the access URL

SPECIAL CONSIDERATIONS:
- If WSL: Check if I can access the dev server from Windows
- If ARM: Optimize for slower builds and longer npm installs
- If low memory: Increase swap or use NODE_OPTIONS for memory limits
- Detect and handle any platform-specific issues

Report progress after each major step and any issues encountered.
```

---

## Minimal Prompt (Quick Setup)

```
Set up AutoCrate from https://github.com/Shivam-Bhardwaj/AutoCrate.git

Git config: Shivam-Bhardwaj / curious.antimony@gmail.com
GitHub token: YOUR_GITHUB_TOKEN
Vercel token: YOUR_VERCEL_TOKEN

Install Node 20+, clone to ~/AutoCrate, install deps, verify with tests, start dev server.
Adapt to my Linux distro automatically.
```

---

## Platform-Specific Variations

### For WSL (Windows Subsystem for Linux)

```
Set up AutoCrate on WSL:

1. Detect WSL version (WSL1 or WSL2)
2. Install Node.js v20+ via NodeSource or nvm
3. Clone https://github.com/Shivam-Bhardwaj/AutoCrate.git to ~/AutoCrate
4. Configure Git:
   - user.name: Shivam-Bhardwaj
   - user.email: curious.antimony@gmail.com
   - GitHub token: YOUR_GITHUB_TOKEN
   - credential.helper: store
5. Install dependencies
6. Install Vercel CLI with token: YOUR_VERCEL_TOKEN
7. Start dev server
8. Tell me how to access it from Windows browser (localhost or WSL IP)

Handle WSL-specific issues like file permissions and network access.
```

### For Ubuntu/Debian

```
Set up AutoCrate on Ubuntu/Debian:

Use apt for system packages, NodeSource for Node.js v20+
Clone: https://github.com/Shivam-Bhardwaj/AutoCrate.git to ~/AutoCrate
Git: Shivam-Bhardwaj / curious.antimony@gmail.com
GitHub: YOUR_GITHUB_TOKEN
Vercel: YOUR_VERCEL_TOKEN
Install, test, run dev server.
```

### For Arch Linux

```
Set up AutoCrate on Arch Linux:

Use pacman for system packages, install nodejs and npm
Clone: https://github.com/Shivam-Bhardwaj/AutoCrate.git to ~/AutoCrate
Git: Shivam-Bhardwaj / curious.antimony@gmail.com
GitHub: YOUR_GITHUB_TOKEN
Vercel: YOUR_VERCEL_TOKEN
Install deps, test, run dev server.
```

### For Raspberry Pi (Armbian/Raspbian)

```
Set up AutoCrate on Raspberry Pi:

ARM64 optimizations: slower builds expected (30-45s)
Use NodeSource for Node.js v20+
Clone: https://github.com/Shivam-Bhardwaj/AutoCrate.git to ~/AutoCrate
Git: Shivam-Bhardwaj / curious.antimony@gmail.com
GitHub: YOUR_GITHUB_TOKEN
Vercel: YOUR_VERCEL_TOKEN
Optimize npm for ARM, increase swap if needed
Install deps (10-15 min first time), test, run dev server.
```

---

## What Claude Will Do

When you paste the universal prompt, Claude will:

1. **Detect your environment:**
   - Linux distribution (Ubuntu, Debian, Arch, etc.)
   - Architecture (x86_64, ARM64, aarch64)
   - WSL version if applicable
   - Available memory and disk space

2. **Install prerequisites:**
   - Node.js v20+ using appropriate method (apt, pacman, yum, nvm)
   - Git and build tools
   - Handle sudo permissions automatically

3. **Clone and configure:**
   - Git configuration with credentials
   - Repository clone to ~/AutoCrate
   - Secure credential storage

4. **Optimize for your platform:**
   - ARM: Slower builds, npm optimization, swap checks
   - WSL: Network access, file permissions
   - Low memory: NODE_OPTIONS, swap configuration

5. **Install and verify:**
   - npm install with appropriate settings
   - Vercel CLI setup
   - Run type-check, build, and tests
   - Start dev server

6. **Report results:**
   - Access URLs (localhost, WSL IP, network IP)
   - Performance expectations for your platform
   - Any platform-specific notes

---

## After Setup - Quick Development Prompts

```
Start dev server
```

```
Run all tests
```

```
Create production build
```

```
Deploy new patch version
```

```
Show git status and recent changes
```

```
What's my local IP to access dev server from another device?
```

```
Check Vercel deployment status
```

---

## Troubleshooting Prompts

### If something goes wrong:

```
AutoCrate setup failed. Diagnose the issue:
1. Check system resources (memory, disk, CPU)
2. Review error messages from the last step
3. Suggest fixes specific to my Linux distribution
4. Retry the failed step with fixes applied
```

### If port 3000 is busy:

```
Port 3000 is occupied. Find what's using it, kill it, and restart dev server.
Or use an alternate port.
```

### If builds are slow:

```
My builds are very slow. Analyze why and optimize:
- Check for memory issues
- Verify Node.js version
- Check for thermal throttling (if ARM)
- Suggest performance improvements
```

### If npm install fails:

```
npm install failed. Debug and fix:
- Check available memory and disk space
- Increase swap if needed
- Retry with memory-optimized settings
- Check for architecture-specific issues
```

---

## Environment Detection Examples

Claude will automatically detect and adapt to:

**WSL1 vs WSL2:**

- WSL2: Use localhost, better performance
- WSL1: May need WSL IP for Windows access

**Architecture:**

- x86_64: Fast builds (~20-30s)
- ARM64: Slower builds (~30-45s), optimize npm

**Memory:**

- 4GB+: Standard installation
- 2-4GB: Use NODE_OPTIONS="--max-old-space-size=2048"
- <2GB: Increase swap, optimize aggressively

**Distribution:**

- Debian/Ubuntu: Use apt and NodeSource
- Arch: Use pacman
- Fedora/RHEL: Use dnf/yum
- Alpine: Use apk

---

## File Transfer to New Machine

If you need to transfer this prompt to a new machine:

**Via GitHub:**

```bash
# On new machine
git clone https://github.com/Shivam-Bhardwaj/AutoCrate.git
cat ~/AutoCrate/UNIVERSAL_SETUP_PROMPT.md
```

**Via curl:**

```bash
curl -s https://raw.githubusercontent.com/Shivam-Bhardwaj/AutoCrate/main/UNIVERSAL_SETUP_PROMPT.md
```

**Via Claude:**
Just say: "Get the AutoCrate universal setup prompt from the repo and run it"

---

## Success Criteria

After running the prompt, you should have:

[DONE] Node.js v20+ installed
[DONE] Git configured with your credentials
[DONE] AutoCrate cloned to ~/AutoCrate
[DONE] All dependencies installed
[DONE] Tests passing
[DONE] Dev server running on port 3000
[DONE] Vercel CLI configured
[DONE] Know the URL to access the app

---

## Expected Timings by Platform

| Platform          | npm install | Build  | Test Suite | Dev Start |
| ----------------- | ----------- | ------ | ---------- | --------- |
| WSL2 Ubuntu x86   | 2-3 min     | 20-30s | 10-15s     | 3-5s      |
| Native Ubuntu x86 | 2-3 min     | 20-30s | 10-15s     | 3-5s      |
| RPi 5 ARM64       | 10-15 min   | 30-45s | 15-20s     | 5-8s      |
| RPi 4 ARM64       | 15-20 min   | 45-60s | 20-30s     | 8-10s     |
| Arch x86          | 2-3 min     | 20-30s | 10-15s     | 3-5s      |

---

## Notes

- First npm install always takes longer (compiling native modules)
- Subsequent installs are much faster (using cache)
- ARM platforms: First install may take 10-15 minutes, be patient
- WSL: Dev server accessible from Windows at localhost:3000
- All dependencies are cross-platform compatible
- The setup is fully automated - Claude handles everything
