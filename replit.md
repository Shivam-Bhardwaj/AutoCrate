# AutoCrate - Replit Project Setup

## Project Overview
AutoCrate is a professional web application for designing industrial shipping crates with integrated NX CAD workflow and 3D visualization capabilities. This is a Next.js 14 application with TypeScript, React, and Three.js for 3D rendering.

## Recent Changes
- **2025-09-11**: Successfully imported and configured the project for Replit environment
- Fixed Next.js SWC native binary issues by forcing WebAssembly fallback
- Configured development server to run on port 5000 with proper host binding
- **UI Transformation**: Completely redesigned interface with modern glass morphism effects
- **Dual Deployment**: Set up both Vercel and Replit deployment configurations
- **Modern Styling**: Added gradient backgrounds, smooth animations, and beautiful components
- **Theme Enhancement**: Improved dark/light mode with purple/blue gradient themes

## Project Architecture
- **Frontend Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **3D Graphics**: Three.js with React Three Fiber
- **UI Components**: Radix UI with Tailwind CSS
- **State Management**: Zustand with persistence
- **Testing**: Vitest, Playwright, Testing Library
- **Build System**: Next.js with Webpack 5 (Turbopack disabled for compatibility)

## Key Configuration for Replit

### Environment Variables Required
```bash
NEXT_SWC_DISABLE_NATIVE=1          # Forces WebAssembly SWC (prevents SIGBUS crashes)
NEXT_DISABLE_TURBOPACK=1           # Uses Webpack 5 instead of Turbopack
WATCHPACK_POLLING=true             # File watching in container environment  
CHOKIDAR_USEPOLLING=1             # Alternative file watcher polling
```

### Development Server
- **Port**: 5000 (configured for Replit workflow)
- **Host**: 0.0.0.0 (allows external access)
- **Replit Command**: `npm run dev:replit` (includes required environment variables)
- **Standard Command**: `npm run dev` (runs on port 3000, local development)

### Exact Development Command Used in Replit
```bash
NEXT_SWC_DISABLE_NATIVE=1 NEXT_DISABLE_TURBOPACK=1 WATCHPACK_POLLING=true CHOKIDAR_USEPOLLING=1 next dev --port 5000 --hostname 0.0.0.0
```

### Production Deployment
- **Type**: Autoscale (stateless web application)  
- **Build Command**: `npm run build` (includes NEXT_SWC_DISABLE_NATIVE=1)
- **Start Command**: `npm start` (includes NEXT_SWC_DISABLE_NATIVE=1)
- **Health Check Path**: `/` (homepage)
- **Scaling**: Auto-scales based on traffic demand
- **Required Environment Variables for Production**:
  - `NEXT_SWC_DISABLE_NATIVE=1` (prevents build crashes)
  - `PORT` (automatically set by Replit)
  - `HOSTNAME=0.0.0.0` (set in start command)

## Project Structure
```
src/
├── app/                  # Next.js App Router pages and layouts
├── components/           # React components (UI, 3D, layout)
├── lib/                  # Utility functions and constants  
├── services/             # Business logic and calculations
├── store/                # Zustand state management
├── styles/               # CSS and design tokens
├── types/                # TypeScript type definitions
└── utils/                # Helper functions and calculations

tests/                    # Test suites (unit, integration, e2e)
docs/                     # Documentation and guides
config/                   # Configuration files
scripts/                  # Build and development scripts
```

## Key Features
- **Interactive 3D Visualization**: Real-time crate rendering with Three.js
- **NX CAD Integration**: Generate parametric expressions for Siemens NX
- **Applied Materials Standards**: ASME Y14.5-2009 compliant drawings
- **Bill of Materials**: Automatic cost estimates and material specifications
- **Mobile-First Design**: Responsive interface optimized for all devices

## Development Commands
```bash
npm run dev              # Start development server (port 3000)
npm run dev:replit       # Start Replit development server (port 5000 with env vars)
npm run build           # Build for production (includes NEXT_SWC_DISABLE_NATIVE=1)
npm start               # Start production server (includes SWC fallback)
npm run start:replit     # Build and start for Replit production testing
npm run lint            # Run ESLint
npm run type-check      # TypeScript validation
npm test                # Run unit tests
npm run test:e2e        # Run end-to-end tests
```

## Troubleshooting

### Common Issues
1. **SIGBUS Errors**: Ensure `NEXT_SWC_DISABLE_NATIVE=1` is set
2. **File Watching Issues**: Verify polling environment variables are set
3. **3D Rendering Issues**: All Three.js components use `dynamic` imports with `ssr: false`
4. **Memory Issues**: Large project with 2000+ modules, may need longer compile times

### Cross-Origin Warnings
Cross-origin request warnings from Replit domains are expected and non-critical. They do not affect functionality but indicate the proxy nature of the Replit environment.

## User Preferences
- The project uses professional-grade development practices
- Comprehensive testing suite with 80% code coverage target
- Applied Materials corporate standards compliance
- Performance-optimized with responsive design principles

## Dependencies Status
- **Next.js**: 14.2.32 (latest stable)
- **React**: 18.2.0
- **Three.js**: 0.159.0 + React Three Fiber 8.15.11
- **TypeScript**: 5.3.3
- **Node.js**: 20.19.3 (Replit environment)

## Dual Platform Deployment

### Vercel Deployment (Client-Approved Domain)
- **Configuration**: `vercel.json` with optimized settings
- **Domain**: Client-approved custom domain
- **Deploy Command**: `npm run deploy:vercel`  
- **Environment**: Production-optimized with WebAssembly SWC
- **Features**: Edge network, built-in analytics, automatic scaling

### Replit Deployment (Development & Backup)  
- **Configuration**: Built into deployment settings (autoscale type)
- **Domain**: `your-app.your-username.repl.co`
- **Deploy**: Automatic on git push to main branch
- **Environment**: Container-based with file polling
- **Features**: Real-time development, integrated database, automatic restarts

### Quick Deployment Commands
```bash
npm run deploy:vercel    # Deploy to Vercel production
npm run deploy:preview   # Deploy to Vercel staging  
npm run deploy:dual      # Deploy to both platforms
```

---

**Last Updated**: September 11, 2025  
**Environment**: Replit NixOS  
**Status**: ✅ Fully Configured and Running