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

### Geometric Accuracy vs Visual Readability

AutoCrate maintains a clear distinction between **geometric accuracy** and **visual readability**:

#### Geometric Accuracy (Core Engineering)
- **Precise Coordinates**: All crate dimensions and positions maintain engineering precision
- **Manufacturing Compliance**: Exact measurements for NX CAD export
- **Structural Integrity**: Accurate representation of load-bearing elements
- **AMAT Standards**: Compliance with Applied Materials specifications

#### Visual Readability (User Experience)
- **Enhanced Labels**: Canvas stroke and text-shadow techniques for 3D labels
- **Optimized Positioning**: Labels may be offset for better visibility
- **Dynamic Scaling**: Text sizes adjust based on camera distance
- **Anti-aliasing**: Smooth rendering for professional appearance

#### Label Rendering Methods
```typescript
// Canvas stroke technique for enhanced visibility
const renderLabelWithStroke = (text: string, position: Vector3) => {
  // Render text with multiple stroke layers
  context.strokeStyle = '#000000';
  context.lineWidth = 3;
  context.strokeText(text, x, y);

  // Add text shadow for depth
  context.shadowColor = '#000000';
  context.shadowBlur = 2;
  context.fillText(text, x, y);
};
```

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

## Typography System

### Fluid Typography Scale
AutoCrate implements a responsive typography system using CSS `clamp()` functions for optimal readability across all device sizes:

#### Font Families
```typescript
fontFamily: {
  sans: 'Inter, system-ui, -apple-system, sans-serif',
  mono: 'JetBrains Mono, Monaco, Consolas, monospace',
  display: 'Cal Sans, Inter, sans-serif'
}
```

#### Clamp Function Examples
The typography scale uses fluid sizing that scales between minimum and maximum values based on viewport width:

```css
/* Base text sizes with fluid scaling */
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);    /* 12px → 14px */
--text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);      /* 14px → 16px */
--text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);      /* 16px → 18px */
--text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);     /* 18px → 20px */
--text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);      /* 20px → 24px */
--text-2xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);           /* 24px → 32px */
--text-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem);   /* 30px → 40px */
--text-4xl: clamp(2.25rem, 1.8rem + 2.25vw, 3.5rem);     /* 36px → 56px */

/* Display headings */
--text-5xl: clamp(3rem, 2.4rem + 3vw, 5rem);             /* 48px → 80px */
--text-6xl: clamp(3.75rem, 3rem + 3.75vw, 6.5rem);       /* 60px → 104px */
```

#### Semantic Typography Classes
```css
/* Display text styles */
.text-display-2xl { font-size: var(--text-6xl); font-weight: 700; line-height: 1.1; }
.text-display-xl { font-size: var(--text-5xl); font-weight: 700; line-height: 1.1; }
.text-display-lg { font-size: var(--text-4xl); font-weight: 600; line-height: 1.2; }
.text-display-md { font-size: var(--text-3xl); font-weight: 600; line-height: 1.2; }
.text-display-sm { font-size: var(--text-2xl); font-weight: 600; line-height: 1.3; }

/* Heading hierarchy */
.text-heading-xl { font-size: var(--text-xl); font-weight: 600; line-height: 1.4; }
.text-heading-lg { font-size: var(--text-lg); font-weight: 600; line-height: 1.4; }
.text-heading-md { font-size: var(--text-base); font-weight: 600; line-height: 1.5; }
.text-heading-sm { font-size: var(--text-sm); font-weight: 600; line-height: 1.5; }

/* Body text styles */
.text-body-lg { font-size: var(--text-lg); line-height: 1.6; }
.text-body-md { font-size: var(--text-base); line-height: 1.6; }
.text-body-sm { font-size: var(--text-sm); line-height: 1.6; }

/* Supporting text */
.text-caption { font-size: var(--text-xs); line-height: 1.5; color: var(--color-text-secondary); }
```

#### Design Token Implementation
Typography tokens are centralized in `src/styles/design-tokens.ts`:

```typescript
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Monaco, Consolas, monospace',
    display: 'Cal Sans, Inter, sans-serif'
  },
  fontSize: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
    base: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
    xl: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
    '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2rem)',
    '3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)',
    '4xl': 'clamp(2.25rem, 1.8rem + 2.25vw, 3.5rem)',
    '5xl': 'clamp(3rem, 2.4rem + 3vw, 5rem)',
    '6xl': 'clamp(3.75rem, 3rem + 3.75vw, 6.5rem)'
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  }
};
```

#### Responsive Breakpoint Behavior
- **Mobile (< 640px)**: Uses minimum values for optimal readability on small screens
- **Tablet (640px - 1024px)**: Scales fluidly based on viewport width
- **Desktop (> 1024px)**: Uses maximum values for enhanced readability on large screens
- **Accessibility**: Respects user's font size preferences and zoom settings

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