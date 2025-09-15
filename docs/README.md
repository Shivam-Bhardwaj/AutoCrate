# AutoCrate - Industrial Shipping Crate Design Tool

AutoCrate is a modern, web-based application for designing industrial shipping crates with NX CAD integration. Built with Next.js 14, TypeScript, and Three.js, it provides real-time 3D visualization, constraint validation, and automated NX expression generation.

## 🚀 Features

### Advanced Crate Design
- **Parametric Design**: Real-time configuration of crate dimensions, materials, and specifications
- **Applied Materials Standards**: Built-in compliance with AMAT-0251-70054 standards
- **Material Optimization**: AI-assisted optimization for cost, weight, and material waste
- **Real-time Validation**: Instant constraint checking and validation feedback

### 3D Visualization
- **WebGL-powered Rendering**: High-performance 3D visualization using Three.js
- **Interactive Controls**: Orbit, zoom, pan, and measurement tools
- **PMI Annotations**: Product Manufacturing Information with dimensional annotations
- **Exploded Views**: Component separation for detailed analysis
- **Mobile Support**: Touch controls for mobile devices

### CAD Integration
- **NX Expression Generation**: Automated generation of NX CAD expressions
- **STEP AP242 Export**: Industry-standard CAD file export with semantic PMI
- **Template Management**: Version-controlled NX template library
- **Validation Engine**: Real-time NX model health monitoring

### User Experience
- **Progressive Web App**: Works offline after initial load
- **Real-time Collaboration**: Multi-user design sessions
- **Export Queue**: Batch processing of CAD exports
- **Material Planning**: Automated Bill of Materials generation

## 🏗️ Architecture

### Frontend Stack
- **Next.js 14**: App Router with Server Components
- **TypeScript 5**: Strict mode with advanced types
- **Three.js + React Three Fiber**: 3D rendering and WebGL
- **Zustand**: Client-side state management
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives

### Backend Services
- **Vercel Edge Functions**: Serverless compute for exports
- **Vercel Blob Storage**: File storage for CAD exports
- **Client-side Processing**: All domain logic runs in browser

### Domain Model
- **CrateConfiguration**: Core configuration interface
- **Validation Engine**: Applied Materials standards compliance
- **Calculation Engine**: Dimensional and material calculations
- **NX Integration**: Expression generation and validation

## 📦 Installation

### Prerequisites
- Node.js 20+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd autocrate-final

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
```env
# Optional: Vercel Blob Storage for file exports
BLOB_READ_WRITE_TOKEN=your_blob_token

# Optional: Edge Config for global settings
EDGE_CONFIG=your_edge_config_id
```

## 🎯 Usage

### Basic Workflow
1. **Configure Product**: Set product dimensions, weight, and center of gravity
2. **Set Clearances**: Define internal clearances for handling
3. **Configure Skids**: Set skid count, pitch, and overhang
4. **Select Materials**: Choose lumber grade, plywood, and hardware
5. **Validate Design**: Review constraint validation and warnings
6. **Optimize Materials**: Use AI-assisted optimization for cost/weight
7. **Export CAD**: Generate NX expressions or STEP files

### Advanced Features
- **Measurement Tools**: Click-to-measure distances in 3D view
- **PMI Annotations**: Toggle dimensional annotations on/off
- **Exploded Views**: Separate components for detailed analysis
- **Material Optimization**: Get suggestions for cost and weight reduction

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (Edge Functions)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── cad-viewer/        # 3D visualization components
│   ├── design-studio/     # Design interface components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── domain/            # Business logic
│   ├── nx/                # NX integration
│   └── validation/        # Constraint validation
├── stores/                # Zustand state stores
└── types/                 # TypeScript definitions
```

### Key Components

#### CrateVisualizer
The main 3D visualization component with WebGL rendering, interactive controls, and PMI annotations.

#### ConfigurationPanel
Form interface for configuring crate parameters with real-time validation.

#### MaterialOptimizer
AI-assisted optimization for material selection, cost reduction, and weight optimization.

#### NXExpressionGenerator
Generates NX CAD expressions with Applied Materials standards compliance.

### Testing
```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Code Quality
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

## 📊 Performance

### Optimization Features
- **Lazy Loading**: Components loaded on demand
- **Progressive Enhancement**: Works without JavaScript
- **Edge Caching**: Static assets served from CDN
- **Client-side Processing**: No server round-trips for calculations

### Performance Targets
- **Initial Load**: <2 seconds from CDN
- **3D Rendering**: 60fps on typical hardware
- **Validation**: <100ms for constraint checking
- **Export Generation**: <10 seconds for complex models

## 🔒 Security

### Data Protection
- **Client-side Processing**: No sensitive data sent to servers
- **Local Storage**: Configuration persisted locally
- **No Authentication**: Designed for internal use
- **Audit Trail**: Complete change tracking

### Compliance
- **Applied Materials Standards**: AMAT-0251-70054 compliance
- **Data Residency**: US-only data processing
- **Export Controls**: ITAR-compliant design

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Docker Deployment
```bash
# Build Docker image
docker build -t autocrate .

# Run container
docker run -p 3000:3000 autocrate
```

## 📚 API Reference

### Configuration Interface
```typescript
interface CrateConfiguration {
  product: {
    length: number
    width: number
    height: number
    weight: number
    centerOfGravity: { x: number; y: number; z: number }
  }
  clearances: {
    width: number
    length: number
    height: number
  }
  skids: {
    overhang: { front: number; back: number }
    count: number
    pitch: number
  }
  materials: {
    lumber: { grade: string; treatment: string; thickness: number; width: number }
    plywood: { grade: string; thickness: number }
    hardware: { coating: string }
  }
  standards: {
    appliedMaterials: boolean
    version: string
  }
}
```

### API Endpoints
- `POST /api/generate-nx` - Generate NX expressions
- `POST /api/export-step` - Export STEP AP242 file
- `POST /api/export-pdf` - Export PDF drawing

## 🤝 Contributing

### Development Guidelines
1. **TypeScript**: Use strict mode, no `any` types
2. **Testing**: >95% test coverage required
3. **Performance**: Maintain 60fps 3D rendering
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Standards**: Applied Materials compliance required

### Code Style
- **ESLint**: Enforced code formatting
- **Prettier**: Consistent code style
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Standardized commit messages

## 📄 License

This project is proprietary software for Applied Materials. All rights reserved.

## 🆘 Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Reference](docs/api-reference.md)
- [Troubleshooting](docs/troubleshooting.md)

### Contact
- **Engineering Team**: [team-email]
- **Support Portal**: [support-url]
- **Issue Tracker**: [github-issues]

---

**AutoCrate v2.0.0** - Industrial shipping crate design with NX CAD integration
