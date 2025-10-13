# Claude Prompts for RPi5 Setup

Copy and paste these prompts to Claude Code on your RPi5 to set up the AutoCrate development environment.

---

## Prompt 1: Initial System Check

```
I'm setting up AutoCrate development on a Raspberry Pi 5 running Armbian.
Can you check:
1. Current system architecture (should be ARM64/aarch64)
2. If Node.js v20+ is installed
3. If Git is installed
4. Available disk space

If anything is missing, install it.
```

---

## Prompt 2: Clone Repository

```
Clone the AutoCrate repository from GitHub:
https://github.com/Shivam-Bhardwaj/AutoCrate.git

Clone it to ~/AutoCrate and navigate into the directory.
```

---

## Prompt 3: Set Up Git Credentials

```
Configure Git with these credentials:
- Username: Shivam-Bhardwaj
- Email: curious.antimony@gmail.com

Then set up GitHub authentication using this token:
[USE YOUR GITHUB TOKEN HERE]

Use credential.helper store and save to ~/.git-credentials with proper permissions.
```

---

## Prompt 4: Optimize npm for ARM64

```
Optimize npm configuration for ARM64 architecture:
- Set maxsockets to 5
- Set fetch-retries to 5
- Set fetch-retry-mintimeout to 20000

This will make npm more reliable on RPi5.
```

---

## Prompt 5: Install Project Dependencies

```
Install all npm dependencies for AutoCrate.

Set NODE_OPTIONS="--max-old-space-size=2048" before installing to prevent out-of-memory issues.

This may take 10-15 minutes on first run as some packages compile native bindings for ARM64.
```

---

## Prompt 6: Verify Installation

```
Verify the installation by running:
1. TypeScript type check (npm run type-check)
2. Build test (npm run build)
3. Unit tests (npm test)

Report any errors if they occur.
```

---

## Prompt 7: Set Up Vercel CLI

```
Install Vercel CLI globally and configure it with this token:
[USE YOUR VERCEL TOKEN HERE]

Add the token to ~/.bashrc as VERCEL_TOKEN environment variable.
```

---

## Prompt 8: Start Development Server

```
Start the development server with npm run dev.

Tell me the local IP address so I can access it from my browser at http://<ip>:3000
```

---

## Prompt 9: Quick Test Development Workflow

```
Let's test the development workflow:

1. Make a small change to the README.md (add "Testing RPi5 setup" at the bottom)
2. Commit the change with message "test: Verify RPi5 development environment"
3. Push to GitHub main branch
4. Verify that Vercel auto-deploys the change

This will confirm the entire workflow is working.
```

---

## Prompt 10: Performance Check

```
Run a performance benchmark:
1. Measure dev server startup time
2. Measure production build time
3. Run full test suite and measure duration
4. Check available memory and CPU usage

Report the results so we can compare with expected RPi5 performance.
```

---

## All-in-One Prompt (If You Want to Do Everything at Once)

```
Set up AutoCrate development environment on this Raspberry Pi 5 running Armbian:

1. Check system (ARM64, disk space)
2. Install Node.js v20+ if needed
3. Clone https://github.com/Shivam-Bhardwaj/AutoCrate.git to ~/AutoCrate
4. Configure Git:
   - user.name: Shivam-Bhardwaj
   - user.email: curious.antimony@gmail.com
   - GitHub token: [USE YOUR GITHUB TOKEN]
5. Optimize npm for ARM64 (maxsockets=5, fetch-retries=5, fetch-retry-mintimeout=20000)
6. Install dependencies with NODE_OPTIONS="--max-old-space-size=2048"
7. Install Vercel CLI globally with token: [USE YOUR VERCEL TOKEN]
8. Run type-check, build, and tests to verify
9. Start dev server and tell me the IP address to access it

Take your time and report progress after each step.
```

---

## Troubleshooting Prompts

### If npm install fails:

```
npm install is failing. Check:
1. Available memory (free -h)
2. Swap space (should be 2GB+)
3. Disk space (df -h)

If memory is low, increase swap to 4GB and retry installation.
```

### If build is slow:

```
The build is taking too long. Optimize by:
1. Setting NEXT_DISABLE_SWC_NATIVE_WASM=1
2. Checking for unnecessary processes (htop)
3. Verifying we're not thermal throttling

Report CPU temperature and frequency.
```

### If port 3000 is occupied:

```
Port 3000 is already in use. Find and kill the process using it, then restart the dev server.
```

---

## Quick Reference Commands

After setup is complete, you can use these quick prompts:

```
Start dev server
```

```
Run all tests
```

```
Create a production build
```

```
Deploy a patch version update
```

```
Check git status and recent commits
```

```
Show me the latest Vercel deployment status
```

---

## Notes for Claude

- First npm install may take 10-15 minutes (compiling native modules)
- Expected build time: 30-45 seconds
- Expected test suite time: 15-20 seconds
- Dev server should start in 5-8 seconds
- All dependencies are ARM64 compatible
