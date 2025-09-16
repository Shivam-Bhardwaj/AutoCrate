# AutoCrate 2025 - Industrial Shipping Crate Design Tool

A production-ready, cloud-native system for automated industrial shipping crate design and validation. Built as a Progressive Web App (PWA), it seamlessly integrates with NX CAD workflows while delivering enterprise-grade 3D visualization, real-time constraint validation, and comprehensive engineering automation.

## 🚀 Features

- **Real-time 3D Visualization**: WebGL-powered industrial-grade rendering with Three.js
- **Applied Materials Standards Compliance**: Full implementation of AMAT-0251-70054 standards
- **Real-time Constraint Validation**: Instant feedback on design constraints and violations
- **Client-side State Management**: Pure browser-based with Zustand and localStorage persistence
- **NX CAD Integration**: Export NX expressions and STEP AP242 files
- **Progressive Web App**: Works offline after initial load
- **Vercel-optimized**: Serverless architecture with edge functions

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5+ (Strict mode)
- **3D Engine**: Three.js + React Three Fiber
- **State Management**: Zustand with localStorage persistence
- **UI Framework**: Tailwind CSS + Radix UI
- **Deployment**: Vercel Edge Functions
- **Testing**: Jest + Testing Library

### Architecture Principles
- ✅ **Client-Side State Management**: All application state managed in browser
- ✅ **Vercel Edge Functions**: Lightweight compute for NX expression generation  
- ✅ **Static Site Generation**: Pre-built pages for optimal performance
- ✅ **Zero Database Overhead**: No PostgreSQL, Redis, or persistent storage
- ✅ **Real-time Updates**: Instant validation without server round-trips

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/autocrate.git
   cd autocrate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Development Commands

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test
npm run test:watch
npm run test:coverage

# Production build
npm run build
npm run start
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js 14 App Router pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (Design Studio)
│   └── globals.css              # Global styles
├── components/                  # React components
│   ├── cad-viewer/             # 3D CAD visualization
│   │   ├── CrateVisualizer.tsx # Main 3D viewer
│   │   ├── CrateAssembly.tsx   # Crate assembly components
│   │   ├── CratePanel.tsx      # Individual panel components
│   │   ├── ProductModel.tsx    # Product visualization
│   │   └── SkidModel.tsx       # Skid visualization
│   └── design-studio/          # Design interface components
│       ├── DesignStudio.tsx    # Main design interface
│       ├── ConfigurationPanel.tsx # Parameter input forms
│       ├── ValidationPanel.tsx # Real-time validation display
│       └── ExportPanel.tsx     # Export functionality
├── lib/                        # Utility libraries
│   └── domain/                 # Core domain logic
│       ├── calculations.ts     # Crate dimension calculations
│       └── validation.ts       # Constraint validation engine
├── stores/                     # State management
│   └── crate-store.ts         # Zustand store for application state
└── types/                      # TypeScript definitions
    └── crate.ts               # Core domain types
```

## 🎯 Core Features

### 1. Real-time 3D Visualization
- **WebGL-powered rendering** with Three.js and React Three Fiber
- **Parametric crate modeling** with real-time geometry updates
- **Interactive controls** with orbital camera and measurement tools
- **Mobile-optimized** touch controls and responsive viewport

### 2. Applied Materials Standards Compliance
- **AMAT-0251-70054 standards** fully implemented
- **Real-time validation** of lumber grades, clearances, and structural requirements
- **Automatic material selection** based on product weight and specifications
- **Comprehensive error reporting** with detailed explanations

### 3. Client-side Domain Logic
- **Pure JavaScript calculations** for all crate dimensions and BOM generation
- **Real-time constraint validation** without server dependencies
- **Applied Materials standards** as TypeScript constants and validation rules
- **Offline functionality** after initial load

### 4. State Management
- **Zustand store** for reactive state management
- **localStorage persistence** for session data
- **Real-time updates** across all UI components
- **Export queue management** for file generation

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Development
NEXT_PUBLIC_APP_ENV=development

# Production (for Vercel deployment)
NEXT_PUBLIC_APP_ENV=production
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
EDGE_CONFIG=your_edge_config_id
```

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npx vercel --prod
   ```

2. **Configure environment variables** in Vercel dashboard

3. **Deploy automatically** on git push to main branch

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Coverage
- **Domain logic**: >95% coverage required
- **Component testing**: React Testing Library
- **Integration tests**: State management and validation
- **E2E tests**: Critical user workflows

## 📊 Performance Targets

- **Initial Load Time**: <2 seconds from Vercel CDN
- **3D Render Time**: <500ms for typical models
- **Constraint Validation**: <100ms real-time updates
- **Mobile Compatibility**: iOS 14+, Chrome 90+
- **Offline Capability**: Full functionality after initial load

## 🏭 Applied Materials Standards

### AMAT-0251-70054 Compliance
- **Lumber Grade Requirements**: Automatic selection based on product weight
- **Skid Specifications**: Weight-based skid count and overhang requirements
- **Clearance Requirements**: Minimum clearances for handling and protection
- **Hardware Specifications**: Lag screw patterns and fastening requirements

### Validation Rules
- **Product Dimensions**: Positive values and realistic constraints
- **Weight-based Material Selection**: Automatic lumber grade selection
- **Structural Integrity**: Skid count and overhang validation
- **Manufacturing Feasibility**: Clearance and handling requirements

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### GitHub Actions (Automatic Deploys)

This repository includes a GitHub Actions workflow that deploys to Vercel whenever commits are pushed to the `main` branch (for example, after a pull request merge). To enable it, add the following repository secrets in GitHub → *Settings* → *Secrets and variables* → *Actions*:

| Secret Name | Description |
|-------------|-------------|
| `VERCEL_TOKEN` | A Vercel access token generated from your Vercel account settings. |
| `VERCEL_ORG_ID` | The organization ID for the Vercel team that owns the project. |
| `VERCEL_PROJECT_ID` | The unique project ID for the AutoCrate Vercel project. |

#### Where to find these values in Vercel

1. **Generate `VERCEL_TOKEN`**
   - Navigate to [vercel.com/account/tokens](https://vercel.com/account/tokens).
   - Click **Create Token**, give it a descriptive name (for example `autocrate-github-actions`), and copy the generated value—this is the secret you paste into GitHub.
   - Tokens are shown only once; store it in a password manager in case you need it again.
2. **Locate `VERCEL_ORG_ID`**
   - If the project lives in a team, open the team menu in the top-left of the Vercel dashboard and choose the correct team.
   - Go to **Settings → General** for that team; the **Team ID** value is the `VERCEL_ORG_ID`.
   - For personal accounts, visit [vercel.com/account](https://vercel.com/account) and copy the **User ID** shown under **Profile**.
3. **Locate `VERCEL_PROJECT_ID`**
   - From the dashboard, open the AutoCrate project and click **Settings → General**.
   - Scroll to the **Project ID** field and use the copy button; this string becomes the `VERCEL_PROJECT_ID` secret in GitHub.

Once the secrets are configured, every merge to `main` will build the app with the Vercel CLI and promote the deployment to production. You can also run the workflow manually from the *Actions* tab using the **Run workflow** button.

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- **TypeScript strict mode**: No `any` types allowed
- **Test coverage**: >95% for domain logic
- **Code style**: ESLint + Prettier
- **Commit messages**: Conventional commits format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Documentation**: [Project Wiki](https://github.com/yourusername/autocrate/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/autocrate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/autocrate/discussions)

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Next.js 14 PWA architecture
- [x] Three.js 3D visualization
- [x] Client-side state management
- [x] Applied Materials standards validation

### Phase 2: Core Features (In Progress)
- [ ] NX expression generation
- [ ] STEP AP242 export
- [ ] Material optimization algorithms
- [ ] Advanced 3D features

### Phase 3: Enterprise Features
- [ ] Multi-user collaboration
- [ ] Advanced security & compliance
- [ ] AI-assisted optimization
- [ ] Comprehensive audit logging

---

**AutoCrate 2025** - Industrial shipping crate design, reimagined for the modern web.