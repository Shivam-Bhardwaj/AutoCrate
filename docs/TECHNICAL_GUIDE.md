# AutoCrate Technical Guide

## Architecture Overview

AutoCrate is built using a modern React-based architecture with real-time 3D rendering capabilities and parametric CAD generation.

### Core Technologies

- **Next.js 14**: Server-side rendering and routing
- **React 18**: Component-based UI architecture  
- **TypeScript**: Type safety and better developer experience
- **Three.js/React Three Fiber**: 3D visualization engine
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first styling

## Component Architecture

### 1. Input Forms Component
Located in `src/components/InputForms.tsx`

Handles all user input for crate configuration:
- Dimension inputs with unit conversion
- Material selection dropdowns
- Panel configuration tabs
- Fastener and vinyl options

### 2. 3D Viewer Component
Located in `src/components/CrateViewer3D.tsx`

Provides real-time 3D visualization:
- Dynamic mesh generation based on configuration
- OrbitControls for camera manipulation
- Material textures and transparency
- Grid helper for spatial reference

### 3. Output Section Component
Located in `src/components/OutputSection.tsx`

Displays generated NX expressions and summaries:
- Syntax-highlighted code display
- Bill of materials calculation
- Export functionality
- Cost estimation

## State Management

### Zustand Store Structure
Located in `src/store/crate-store.ts`

```typescript
interface CrateStore {
  configuration: CrateConfiguration;
  updateDimensions: (dimensions) => void;
  updateBase: (base) => void;
  updatePanel: (panelKey, panel) => void;
  updateFasteners: (fasteners) => void;
  updateVinyl: (vinyl) => void;
  updateWeight: (weight) => void;
  updateProjectName: (name) => void;
  resetConfiguration: () => void;
}
```

## NX Expression Generation

### Generator Service
Located in `src/services/nx-generator.ts`

The NX expression generator creates parametric CAD code through several steps:

1. **Variable Declaration**: Converts configuration to NX parameters
2. **Feature Generation**: Creates BLOCK commands for each component
3. **Constraint Application**: Adds structural and weight constraints
4. **Pattern Creation**: Generates fastener and ventilation patterns
5. **Export Formatting**: Produces NX-compatible expression syntax

### Expression Syntax

```
// Parameters
p0 = 1200 // Length (mm)
p1 = 1000 // Width (mm)
p2 = 1000 // Height (mm)

// Feature Creation
BLOCK/CREATE_BASE
  HEIGHT = p13
  WIDTH = p1
  LENGTH = p0
  POSITION = (0, p10, 0)
END_BLOCK
```

## 3D Rendering Pipeline

### Mesh Generation Process

1. **Dimension Scaling**: Converts user units to Three.js world units
2. **Geometry Creation**: Generates BoxGeometry for each panel
3. **Material Application**: Applies wood textures and transparency
4. **Scene Composition**: Assembles all components in 3D space
5. **Lighting Setup**: Ambient and directional lights for realism

### Performance Optimization

- Geometry instancing for repeated elements
- Level-of-detail (LOD) for complex models
- Efficient material reuse
- Viewport culling for off-screen elements

## Data Flow

```
User Input → Zustand Store → Components → NX Generator
     ↓            ↓              ↓            ↓
  Validation   3D Update    UI Update    Expression
```

### AMAT Compliance Data Flow

```
Product Weight → Style Detection → Material Selection → Compliance Validation
      ↓               ↓                 ↓                    ↓
   Crate Style    Specifications    Validation        AMAT Status
      ↓               ↓                 ↓                    ↓
   Skid Sizing    MBB Requirements   Weight Calc       Final Config
```

## AMAT Compliance Architecture

### Core Specifications System

The AMAT compliance system is built around comprehensive specifications defined in [`src/types/amat-specifications.ts`](src/types/amat-specifications.ts:1):

- **Crate Styles**: Four distinct styles (A, B, C, D) with specific weight ranges and features
- **Skid Sizing**: Automatic skid size determination based on load requirements
- **Material Specifications**: AMAT-approved materials with validation
- **MBB Configuration**: SEMI E137 compliant moisture barrier bags
- **Chamfer Optimization**: Air shipment weight reduction calculations

### Material Validation Pipeline

The material validation system ensures all components meet AMAT standards:

1. **Input Validation**: User inputs validated against AMAT specifications
2. **Material Database**: Comprehensive database of AMAT-approved materials
3. **Compliance Scoring**: Real-time compliance scoring (0-100%)
4. **Recommendation Engine**: Suggests improvements for non-compliant selections

### Weight Calculation Engine

The enhanced weight calculation system ([`src/services/weightCalculations.ts`](src/services/weightCalculations.ts:1)) provides:

- **Material-Specific Densities**: Accurate densities for all materials
- **Component Breakdown**: Detailed weight analysis by component type
- **Hardware Calculations**: Precise hardware weight calculations
- **Protection Materials**: Foam, MBB, desiccant weight calculations
- **Dimensional Weight**: Air freight dimensional weight calculations

### ISPM-15 Compliance System

International shipping compliance is handled through [`src/types/ispm15-compliance.ts`](src/types/ispm15-compliance.ts:1):

- **Treatment Validation**: Heat treatment and chemical treatment validation
- **Country-Specific Requirements**: Database of country-specific import rules
- **Documentation Requirements**: Treatment certificates and phytosanitary certificates
- **Marking Specifications**: IPPC stamp requirements and placement

## Type System

### Core Types
Located in `src/types/crate.ts`

- `CrateDimensions`: Length, width, height with units
- `ShippingBase`: Skid and floorboard configuration
- `CrateCap`: Five-panel system specifications
- `Fasteners`: Connector types and spacing
- `VinylConfig`: Protective coating options
- `NXExpression`: Generated CAD code structure

## Build and Deployment

### Development Build
```bash
npm run dev
# Starts development server on http://localhost:3000
# Hot module replacement enabled
# Source maps for debugging
```

### Production Build
```bash
npm run build
# Optimizes bundles
# Minifies code
# Generates static assets
```

### Deployment to Vercel
```bash
vercel --prod
# Automatic deployment
# Environment variables configured
# CDN distribution
```

## Performance Metrics

- **Initial Load**: < 2 seconds
- **3D Render**: 60 FPS target
- **Expression Generation**: < 100ms
- **Bundle Size**: ~500KB gzipped

## Security Considerations

- Input validation on all user entries
- XSS protection through React
- CORS headers configured
- Authentication ready (OAuth integration points)

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- WebGL 2.0 required for 3D rendering

## API Endpoints (Future)

Prepared for backend integration:
- `POST /api/crates` - Save configuration
- `GET /api/crates/:id` - Load configuration
- `POST /api/export` - Generate NX file
- `GET /api/materials` - Material database

## Testing Strategy

### Unit Tests
- Component rendering tests
- Store action tests
- NX generator logic tests

### Integration Tests
- Form submission flow
- 3D viewer interactions
- Export functionality

### E2E Tests
- Complete user workflows
- Cross-browser testing
- Performance benchmarks

## Troubleshooting

### Common Issues

1. **3D Viewer Not Loading**
   - Check WebGL support
   - Clear browser cache
   - Update graphics drivers

2. **Expression Generation Errors**
   - Validate input ranges
   - Check for special characters
   - Verify unit consistency

3. **Performance Issues**
   - Reduce model complexity
   - Enable hardware acceleration
   - Close other browser tabs

## Future Enhancements

- Cloud storage for projects
- Collaborative editing
- Advanced materials database
- FEA integration for structural analysis
- AR/VR visualization
- Multi-language support
- API for third-party integration
- Advanced AMAT compliance features
- Machine learning for optimization
- IoT sensor integration
- Blockchain traceability