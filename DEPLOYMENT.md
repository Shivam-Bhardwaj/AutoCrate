# Deployment Guide

## Quick Deploy (Migrating to New Machine)

### 1. Clone Repository

```bash
# On new machine
git clone <your-repo-url>
cd AutoCrate

# If using workspace
cd /path/to/workspace/projects/AutoCrate/repo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Server

```bash
# Local development
npm run dev
# Access at http://localhost:3000

# Or with Docker
cd ../container
docker compose up --build
```

### 4. Access Documentation

Once server is running:

- Main app: `http://localhost:3000`
- Documentation: `http://localhost:3000/docs`
- Console: `http://localhost:3000/console`

---

## Production Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

**Environment Setup:**

- Vercel automatically detects Next.js
- No environment variables needed for base app
- Auto-deploys on git push (if connected to GitHub)

### Option 2: Docker Production

```bash
cd /path/to/AutoCrate/container
docker compose -f docker-compose.prod.yml up --build -d
```

### Option 3: Manual Build

```bash
# Build
npm run build

# Start production server
npm run start

# Or with PM2 for persistence
npm install -g pm2
pm2 start npm --name "autocrate" -- start
pm2 save
pm2 startup
```

---

## Migrating to New Machine

### Complete Migration Checklist

1. **Prerequisites on New Machine**

   ```bash
   # Install Node.js 20+
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install Git
   sudo apt-get install git

   # Install Docker (optional)
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh

   # Install tmux (for parallel development)
   sudo apt-get install tmux
   ```

2. **Clone and Setup**

   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd AutoCrate

   # Install dependencies
   npm install

   # Verify installation
   npm run type-check
   npm test
   ```

3. **Start Development**

   ```bash
   # Quick start with tmux
   ./scripts/tmux-autocrate.sh
   tmux attach -t autocrate

   # Or simple start
   npm run dev
   ```

4. **Access Documentation**
   - Open browser: `http://localhost:3000/docs`
   - All guides now accessible via web interface
   - No need for markdown readers

---

## Environment Variables

Current app doesn't require environment variables for core functionality.

If adding features that need secrets:

```bash
# Create .env.local
cp .env.example .env.local
# Edit with your values
```

**Never commit:**

- `.env.local`
- `.env.production`
- Any files with secrets

---

## Continuous Deployment

### GitHub Actions (Automatic)

Already configured in `.github/workflows/parallel-ci.yml`

**On every push:**

- ✅ TypeScript type checking
- ✅ ESLint
- ✅ Unit tests
- ✅ E2E tests
- ✅ Production build

**To enable:**

1. Push code to GitHub
2. Actions run automatically
3. View results in GitHub Actions tab

### Vercel (Automatic)

**Setup once:**

```bash
# Connect repository to Vercel
vercel link

# Configure auto-deployment
# Settings → Git → Enable auto-deploy on push
```

**Result:**

- Push to `main` → deploys to production
- Push to any branch → deploys to preview URL
- Pull requests → automatic preview deployments

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Docker Issues

```bash
# Clean rebuild
cd ../container
docker compose down -v
docker compose up --build

# Check logs
docker compose logs -f
```

### Dependencies Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

### Tests Failing

```bash
# Clear Jest cache
npx jest --clearCache

# Install Playwright browsers
npx playwright install --with-deps

# Run tests
npm run test:all
```

---

## File Locations Reference

### Documentation (Web-based)

- **Access:** `http://localhost:3000/docs`
- **Source:** `src/app/docs/page.tsx`

### Documentation (Markdown - for reference)

- `CLAUDE.md` - Development guide
- `PROJECT_STATUS.md` - Work tracking
- `MODULES.md` - Module architecture
- `WORK_LOG.md` - History
- `PARALLEL_WORKFLOW.md` - Workflow strategies
- `QUICKSTART_PARALLEL.md` - Quick reference
- `TESTING.md` - Testing guide
- `DEPLOYMENT.md` - This file

### Development Tools

- `scripts/tmux-autocrate.sh` - Tmux environment setup
- `scripts/parallel-work.sh` - Status checker
- `Makefile` - Command shortcuts
- `.devcontainer/devcontainer.json` - VS Code container config
- `.github/workflows/parallel-ci.yml` - CI/CD pipeline

---

## Quick Commands Reference

```bash
# Development
make dev                 # Start dev server
make parallel-dev        # Dev + tests + docker in parallel
make tmux               # Launch tmux environment

# Testing
make test               # Run all tests
make test:watch         # Watch mode
make test:e2e          # E2E tests

# Status
make work-status        # Check current work
git log --oneline -5    # Recent commits
git branch -v          # All branches

# Deployment
npm run build          # Production build
vercel --prod          # Deploy to Vercel
docker compose -f docker-compose.prod.yml up  # Docker production
```

---

## Support

### Getting Help

- **Documentation:** `http://localhost:3000/docs`
- **GitHub Issues:** Create issue in repository
- **Direct:** Contact project maintainer

### Useful Links

- Next.js Docs: https://nextjs.org/docs
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- Playwright: https://playwright.dev
- Vercel Deployment: https://vercel.com/docs

---

## Checklist for New Machine

- [ ] Install Node.js 20+
- [ ] Install Git
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Run `npm test` (verify setup)
- [ ] Start dev server `npm run dev`
- [ ] Access docs at `/docs`
- [ ] (Optional) Install Docker
- [ ] (Optional) Install tmux
- [ ] (Optional) Setup VS Code with devcontainer

**You're ready to develop! 🚀**

Access documentation at: `http://localhost:3000/docs`
