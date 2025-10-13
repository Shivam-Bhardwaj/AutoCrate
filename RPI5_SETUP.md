# RPi5 Setup Guide - AutoCrate Development

## Prerequisites

**Hardware**: Raspberry Pi 5
**OS**: Armbian (Debian-based)
**Architecture**: ARM64 (aarch64)

## Quick Setup (5 minutes)

### 1. Install Node.js (v20+)

```bash
# Using NodeSource repository for latest Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x
npm --version   # Should be 10.x
```

### 2. Install Git & Essential Tools

```bash
sudo apt-get update
sudo apt-get install -y git build-essential
```

### 3. Clone Repository

```bash
cd ~/
git clone https://github.com/Shivam-Bhardwaj/AutoCrate.git
cd AutoCrate
```

### 4. Install Dependencies

```bash
npm install
```

**Note**: First install on ARM64 may take 10-15 minutes as some packages compile native bindings.

### 5. Start Development Server

```bash
npm run dev
```

Access at: `http://localhost:3000` or `http://<rpi-ip>:3000`

## Git Configuration

```bash
# Set up Git credentials
git config --global user.name "Shivam-Bhardwaj"
git config --global user.email "curious.antimony@gmail.com"

# Set up GitHub authentication (use your GitHub token)
git config --global credential.helper store
echo "https://Shivam-Bhardwaj:YOUR_GITHUB_TOKEN@github.com" > ~/.git-credentials
chmod 600 ~/.git-credentials
```

## Performance Optimization for RPi5

### Increase Swap Space (Recommended)

```bash
# Check current swap
free -h

# Increase swap to 4GB for npm installs
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Set CONF_SWAPSIZE=4096
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### Optimize npm for ARM

```bash
# Use fewer parallel jobs during install
npm config set maxsockets 5
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run start            # Start production server

# Testing
npm test                 # Run Jest unit tests
npm run test:coverage    # Coverage report
npm run test:all         # Full test suite (skip E2E by default)

# Version Management
npm run deploy           # Patch version bump + deploy
npm run deploy:minor     # Minor version bump + deploy
npm run deploy:major     # Major version bump + deploy
```

## Known ARM64 Considerations

### ✅ Works Great

- Node.js 20+ (native ARM64 support)
- Next.js 14 (fully compatible)
- React 18 (no issues)
- Three.js (JavaScript-only, works perfectly)
- Jest testing (compatible)

### ⚠️ May Need Attention

- **Playwright**: ARM64 support improved but E2E tests may be slower
  - Skip with: `npm run test:all` (skips E2E by default)
  - Run separately: `npm run test:e2e` (may need chromium-browser installed)

### 🔧 Performance Tips

- First `npm install` takes longer (10-15 min) due to native module compilation
- Subsequent installs are fast (~2 min)
- Development server runs smoothly on RPi5
- Build times: ~30-45 seconds (vs ~20-30s on x86)

## VS Code Remote Development (Optional but Recommended)

**On your main machine:**

1. Install "Remote - SSH" extension in VS Code
2. Connect to RPi: `ssh curious@<rpi-ip>`
3. Open folder: `/home/curious/AutoCrate`
4. Develop with full IDE support while code runs on RPi

## Troubleshooting

### Issue: npm install fails with out of memory

```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=2048"
npm install
```

### Issue: Port 3000 already in use

```bash
# Kill process on port 3000
sudo lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 npm run dev
```

### Issue: Slow builds

```bash
# Disable SWC on ARM if issues occur
export NEXT_DISABLE_SWC_NATIVE_WASM=1
npm run build
```

## Vercel CLI Setup

```bash
# Install Vercel CLI globally
npm install -g vercel

# Authenticate (use token from main machine)
export VERCEL_TOKEN=XLFfhVZS3nlkcOGMuDoD1HvT
vercel whoami

# Link project (already configured in .vercel/)
vercel link --yes
```

## Quick Migration Checklist

- [ ] Install Node.js v20+
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Configure Git credentials
- [ ] Test dev server: `npm run dev`
- [ ] Verify builds: `npm run build`
- [ ] Run tests: `npm test`
- [ ] Push changes: `git push origin main` (triggers auto-deploy)

## Next Steps After Setup

1. **Verify Everything Works**

   ```bash
   npm run test:all
   npm run build
   ```

2. **Start Developing**

   ```bash
   npm run dev
   # Open http://<rpi-ip>:3000
   ```

3. **Make Changes & Deploy**
   ```bash
   # Make your changes
   git add .
   git commit -m "feat: your changes"
   git push origin main
   # Vercel auto-deploys to autocrate.vercel.app
   ```

## Performance Expectations

**RPi5 vs x86_64:**

- Dev server startup: ~5-8s (vs ~3-5s)
- Hot reload: ~1-2s (vs ~0.5-1s)
- Production build: ~30-45s (vs ~20-30s)
- Test suite: ~15-20s (vs ~10-15s)

**Bottom line**: RPi5 is perfectly capable for AutoCrate development!
