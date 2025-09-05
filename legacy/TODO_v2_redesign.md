# AutoCrate TODO - Production Ready

## 🚨 ACTIVE TASK: Professional UI Redesign

### IMMEDIATE ACTIONS REQUIRED
Execute the Professional UI Redesign Master Prompt below to transform the application from generic to enterprise-grade.

---

## 🚀 PROFESSIONAL UI REDESIGN - COMPREHENSIVE IMPLEMENTATION GUIDE

### PROJECT CONTEXT & BACKGROUND
You are implementing a complete UI/UX overhaul for AutoCrate, a Next.js 14 application that generates 3D shipping crate designs. The application currently functions but has received critical client feedback that it looks "generic and AI-generated". Your mission is to transform this into a premium, enterprise-grade application that looks like it was designed by a top-tier agency.

**Tech Stack You're Working With:**
- Next.js 14.0.4 (App Router)
- TypeScript (strict mode enabled)
- Three.js + React Three Fiber (3D rendering)
- Zustand (state management)
- Tailwind CSS (styling)
- Radix UI (base components)
- Vitest + Puppeteer (testing)

**Current File Structure:**
```
src/
├── app/           # Next.js app router pages
├── components/    # React components
│   ├── ui/       # Radix-based UI components
│   └── mobile/   # Mobile-specific components
├── services/     # Business logic
├── store/        # Zustand stores
├── utils/        # Utility functions
└── types/        # TypeScript definitions
```

### 🔴 CRITICAL ISSUES REQUIRING IMMEDIATE FIX

#### Issue #1: Floorboard Visualization Completely Broken
**Current State:** 
- Calculations exist in `src/utils/floorboard-calculations.ts`
- The `calculateFloorboardConfiguration()` function returns board widths, positions, and ISPM-15 compliance
- CrateViewer3D.tsx currently renders a solid floor panel instead of individual boards

**Required Implementation:**
```typescript
// In CrateViewer3D.tsx, replace the floor rendering with:
import { calculateFloorboardConfiguration } from '@/utils/floorboard-calculations';
import { calculateSkidConfiguration } from '@/utils/skid-calculations';

// Inside CrateModel component:
const skidConfig = calculateSkidConfiguration(config.dimensions, config.weight);
const floorboardConfig = calculateFloorboardConfiguration(config.dimensions, skidConfig);

// Render each floorboard individually:
{floorboardConfig.floorboards.map((board, index) => (
  <Box
    key={`floorboard-${index}`}
    args={[board.width * scaleFactor / 1000, floorThickness, length]}
    position={[
      (board.position * scaleFactor / 1000) - (width / 2) + (board.width * scaleFactor / 2000),
      skidHeight + floorThickness / 2,
      0
    ]}
  >
    <meshStandardMaterial 
      color={board.isNarrowBoard ? "#8B4513" : "#D2691E"}
      roughness={0.8}
      metalness={0.1}
    />
  </Box>
))}
```

#### Issue #2: UI Looks Like Every Other AI-Generated App
**Current Problems:**
- Using default shadcn/ui components with no customization
- Basic gray color scheme
- No visual hierarchy or brand identity
- Flat, lifeless interactions
- Generic button and input styles

**Required Professional Design System:**

```css
/* Add to src/styles/globals.css */
:root {
  --primary: 29 78 216;        /* #1d4ed8 - Premium blue */
  --primary-dark: 30 64 175;   /* #1e40af - Deeper blue */
  --accent: 16 185 129;        /* #10b981 - Emerald */
  --surface: 255 255 255;      /* White */
  --surface-elevated: 248 250 252;  /* Slight gray */
  --text-primary: 15 23 42;    /* Near black */
  --text-secondary: 100 116 139;    /* Muted */
  --border: 226 232 240;       /* Light border */
  --shadow-color: 0 0 0;       /* For shadows */
  
  /* Glass morphism variables */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  --backdrop-blur: 12px;
}

/* Premium glass panel style */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--backdrop-blur));
  -webkit-backdrop-filter: blur(var(--backdrop-blur));
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-panel:hover {
  box-shadow: 0 12px 48px 0 rgba(31, 38, 135, 0.25);
  transform: translateY(-2px);
}
```

### 📋 DETAILED IMPLEMENTATION PHASES

#### PHASE 1: Premium UI Foundation (Priority: CRITICAL)

**Step 1.1 - Create Custom Design Tokens**
```typescript
// Create new file: src/styles/design-tokens.ts
export const designTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#1d4ed8',
      600: '#1e40af',
      700: '#1e3a8a',
    },
    accent: {
      500: '#10b981',
      600: '#059669',
    },
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      500: '#64748b',
      900: '#0f172a',
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  },
  animations: {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  }
};
```

**Step 1.2 - Enhance All UI Components**
```typescript
// Update src/components/ui/button.tsx
const buttonVariants = cva(
  `inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium
   transition-all duration-300 ease-out transform-gpu
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 
   focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
   active:scale-95 hover:scale-105 hover:shadow-lg`,
  {
    variants: {
      variant: {
        default: `bg-gradient-to-r from-primary-600 to-primary-500 text-white 
                  hover:from-primary-700 hover:to-primary-600 
                  shadow-md hover:shadow-xl`,
        glass: `glass-panel hover:bg-white/80 text-gray-900 
                border border-white/20`,
        ghost: `hover:bg-gray-100/50 hover:backdrop-blur-sm 
                text-gray-700 hover:text-gray-900`,
      }
    }
  }
);
```

**Step 1.3 - Create Floating Label Inputs**
```typescript
// Create src/components/ui/floating-input.tsx
export const FloatingInput = ({ label, value, onChange, ...props }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  
  return (
    <div className="relative">
      <input
        {...props}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          peer w-full px-4 pt-6 pb-2 text-gray-900 
          bg-white/70 backdrop-blur-md
          border-2 border-gray-200 rounded-lg
          transition-all duration-300
          focus:border-primary-500 focus:bg-white
          hover:border-gray-300
        `}
      />
      <label
        className={`
          absolute left-4 transition-all duration-300 pointer-events-none
          ${focused || hasValue 
            ? 'top-2 text-xs text-primary-600' 
            : 'top-4 text-base text-gray-500'}
        `}
      >
        {label}
      </label>
    </div>
  );
};
```

#### PHASE 2: Fix Floorboard Visualization (Priority: HIGH)

**Step 2.1 - Update CrateViewer3D Component**
```typescript
// In src/components/CrateViewer3D.tsx, add these imports:
import { calculateFloorboardConfiguration } from '@/utils/floorboard-calculations';
import { calculateSkidConfiguration } from '@/utils/skid-calculations';
import { Html } from '@react-three/drei'; // For hover labels

// Inside CrateModel component, replace floor rendering:
function FloorboardsGroup({ config }) {
  const skidConfig = calculateSkidConfiguration(config.dimensions, config.weight);
  const floorboardConfig = calculateFloorboardConfiguration(config.dimensions, skidConfig);
  
  const scaleFactor = 25.4; // inches to mm
  const [hoveredBoard, setHoveredBoard] = useState(null);
  
  return (
    <group name="floorboards">
      {floorboardConfig.floorboards.map((board, index) => {
        const boardWidth = (board.width * scaleFactor) / 1000;
        const boardLength = (config.dimensions.length * scaleFactor) / 1000;
        const thickness = 0.038; // 1.5 inches in meters
        
        // Calculate X position based on board position and width
        const xOffset = floorboardConfig.floorboards
          .slice(0, index)
          .reduce((sum, b) => sum + b.width, 0);
        const xPos = ((xOffset + board.width / 2 - config.dimensions.width / 2) * scaleFactor) / 1000;
        
        return (
          <group key={`floorboard-${index}`}>
            <Box
              args={[boardWidth, thickness, boardLength]}
              position={[xPos, skidHeight + thickness / 2, 0]}
              onPointerOver={() => setHoveredBoard(index)}
              onPointerOut={() => setHoveredBoard(null)}
            >
              <meshStandardMaterial
                color={board.isNarrowBoard ? "#6B3410" : "#8B4513"}
                roughness={0.9}
                metalness={0.05}
                emissive={hoveredBoard === index ? "#ff6600" : "#000000"}
                emissiveIntensity={hoveredBoard === index ? 0.2 : 0}
              />
            </Box>
            
            {/* Add gap between boards (1/8 inch) */}
            {index < floorboardConfig.floorboards.length - 1 && (
              <Box
                args={[0.003, thickness, boardLength]}
                position={[xPos + boardWidth / 2 + 0.0015, skidHeight + thickness / 2, 0]}
              >
                <meshBasicMaterial color="#000000" opacity={0.3} transparent />
              </Box>
            )}
            
            {/* Show dimensions on hover */}
            {hoveredBoard === index && (
              <Html position={[xPos, skidHeight + 0.2, 0]}>
                <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
                  {board.nominalSize} ({board.width.toFixed(2)}")
                  {board.isNarrowBoard && " - Narrow Board"}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
```

**Step 2.2 - Add Visual Warnings for ISPM-15 Compliance**
```typescript
// Display warnings if floorboard configuration has issues
{floorboardConfig.warnings.length > 0 && (
  <div className="absolute top-4 right-4 bg-yellow-500/90 backdrop-blur-sm p-3 rounded-lg max-w-xs">
    <h4 className="font-semibold text-yellow-900 mb-1">ISPM-15 Notice</h4>
    {floorboardConfig.warnings.map((warning, idx) => (
      <p key={idx} className="text-sm text-yellow-800">{warning}</p>
    ))}
  </div>
)}
```

#### PHASE 3: Advanced 3D Visualization Features (Priority: HIGH)

**Step 3.1 - Add World Coordinate System**
```typescript
// Create src/components/CoordinateAxes.tsx
import { Line, Text } from '@react-three/drei';

export function CoordinateAxes({ size = 5 }) {
  return (
    <group name="coordinate-axes">
      {/* X Axis - Red */}
      <Line points={[[0, 0, 0], [size, 0, 0]]} color="red" lineWidth={2} />
      <Text position={[size + 0.5, 0, 0]} color="red" fontSize={0.3}>
        X (Length)
      </Text>
      
      {/* Y Axis - Green */}
      <Line points={[[0, 0, 0], [0, size, 0]]} color="green" lineWidth={2} />
      <Text position={[0, size + 0.5, 0]} color="green" fontSize={0.3}>
        Y (Height)
      </Text>
      
      {/* Z Axis - Blue */}
      <Line points={[[0, 0, 0], [0, 0, size]]} color="blue" lineWidth={2} />
      <Text position={[0, 0, size + 0.5]} color="blue" fontSize={0.3}>
        Z (Width)
      </Text>
    </group>
  );
}
```

**Step 3.2 - Implement Multiple Camera Views**
```typescript
// Create src/components/ViewControls.tsx
const CAMERA_POSITIONS = {
  isometric: { position: [5, 5, 5], target: [0, 0, 0] },
  top: { position: [0, 8, 0], target: [0, 0, 0] },
  front: { position: [0, 0, 8], target: [0, 0, 0] },
  right: { position: [8, 0, 0], target: [0, 0, 0] }
};

// Use TWEEN.js for smooth transitions
npm install @tweenjs/tween.js
```

**Step 3.3 - Add Exploded View with Slider**
```typescript
// In CrateModel component
function CrateModel({ config, explodeFactor = 0 }) {
  const offset = explodeFactor * 2; // Max 2 meters explosion
  
  return (
    <group>
      <Box position={[0, baseY + offset, 0]} /> {/* Top moves up */}
      <Box position={[0, baseY - offset, 0]} /> {/* Floor moves down */}
      <Box position={[baseX - offset, 0, 0]} /> {/* Left moves left */}
      <Box position={[baseX + offset, 0, 0]} /> {/* Right moves right */}
    </group>
  );
}
```

#### PHASE 4: Replace NX with Engineering Calculations (Priority: CRITICAL)

**Step 4.1 - Remove NX Expression Tab**
```typescript
// In src/components/OutputSection.tsx
// DELETE the Expression tab completely from TabsList and TabsContent
<TabsList className="grid w-full grid-cols-4"> {/* Was 5, now 4 */}
  {/* Remove: <TabsTrigger value="expression">Expression</TabsTrigger> */}
  <TabsTrigger value="engineering">Engineering</TabsTrigger>
  <TabsTrigger value="formulas">Formulas</TabsTrigger>
  <TabsTrigger value="summary">Summary</TabsTrigger>
  <TabsTrigger value="bom">BOM</TabsTrigger>
</TabsList>
```

**Step 4.2 - Create Engineering Calculations Service**
```typescript
// Create src/services/engineeringCalculations.ts
export class EngineeringCalculator {
  calculateLoadCapacity(dimensions: CrateDimensions, material: Material) {
    // Calculate maximum load based on panel strength
    const panelThickness = material.thickness;
    const area = dimensions.length * dimensions.width;
    const momentOfInertia = (dimensions.width * Math.pow(panelThickness, 3)) / 12;
    const maxStress = material.yieldStrength * 0.6; // 60% safety factor
    
    return {
      maxLoad: (maxStress * momentOfInertia) / (dimensions.height / 2),
      safetyFactor: 1.67,
      loadDistribution: this.calculateLoadDistribution(dimensions),
      stressPoints: this.identifyStressPoints(dimensions)
    };
  }
  
  calculateWeightDistribution(config: CrateConfiguration) {
    // Generate heat map data for weight distribution
    const gridSize = 10;
    const heatmap = [];
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const weight = this.calculatePointLoad(x, y, config);
        heatmap.push({ x, y, weight, color: this.getHeatColor(weight) });
      }
    }
    
    return {
      heatmap,
      centerOfGravity: this.calculateCOG(config),
      maxLoadZone: this.findMaxLoadZone(heatmap)
    };
  }
  
  performStressAnalysis(config: CrateConfiguration) {
    return {
      vonMisesStress: this.calculateVonMises(config),
      shearStress: this.calculateShear(config),
      bendingMoment: this.calculateBendingMoment(config),
      criticalPoints: [
        { location: 'Corner joints', stress: 'High', recommendation: 'Reinforce with brackets' },
        { location: 'Center floor', stress: 'Medium', recommendation: 'Add center support for heavy loads' }
      ]
    };
  }
}
```

**Step 4.3 - Create Engineering Tab Component**
```typescript
// Create src/components/EngineeringTab.tsx
export function EngineeringTab({ configuration }) {
  const calculator = new EngineeringCalculator();
  const loadCapacity = calculator.calculateLoadCapacity(configuration);
  const weightDist = calculator.calculateWeightDistribution(configuration);
  
  return (
    <div className="space-y-6">
      {/* Load Capacity Card */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            Load Capacity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Maximum Load</label>
              <p className="text-2xl font-bold text-primary-600">
                {loadCapacity.maxLoad.toFixed(0)} kg
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Safety Factor</label>
              <p className="text-2xl font-bold text-green-600">
                {loadCapacity.safetyFactor}x
              </p>
            </div>
          </div>
          
          {/* Visual Load Distribution */}
          <div className="mt-4">
            <HeatmapGrid data={weightDist.heatmap} />
          </div>
        </CardContent>
      </Card>
      
      {/* Stress Analysis Card */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Structural Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stressAnalysis.criticalPoints.map((point, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{point.location}</p>
                  <p className="text-sm text-gray-600">{point.recommendation}</p>
                </div>
                <StressIndicator level={point.stress} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### PHASE 5: Add Formulas & Documentation Tab (Priority: MEDIUM)

**Step 5.1 - Install Math Rendering Library**
```bash
npm install katex react-katex
```

**Step 5.2 - Create Formulas Display Component**
```typescript
// Create src/components/FormulasTab.tsx
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export function FormulasTab() {
  const formulas = [
    {
      name: 'Moment of Inertia',
      formula: 'I = \\frac{b \\cdot h^3}{12}',
      description: 'For rectangular beam cross-section'
    },
    {
      name: 'Maximum Bending Stress',
      formula: '\\sigma_{max} = \\frac{M \\cdot c}{I}',
      description: 'Where M is moment, c is distance from neutral axis'
    },
    {
      name: 'Safety Factor',
      formula: 'SF = \\frac{\\sigma_{yield}}{\\sigma_{working}}',
      description: 'Ratio of material yield strength to working stress'
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Formulas Grid */}
      <div className="grid grid-cols-2 gap-4">
        {formulas.map((item, idx) => (
          <Card key={idx} className="glass-panel hover:scale-105 transition-transform">
            <CardHeader>
              <CardTitle className="text-lg">{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <BlockMath math={item.formula} />
              </div>
              <p className="text-sm text-gray-600">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* ISPM-15 Compliance Checklist */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>ISPM-15 Compliance Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <ChecklistComponent items={[
            { label: 'Heat treatment (56°C for 30 min)', checked: true },
            { label: 'Moisture content < 20%', checked: true },
            { label: 'Debarked wood', checked: true },
            { label: 'IPPC marking applied', checked: false },
            { label: 'Documentation complete', checked: false }
          ]} />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### PHASE 6: Enhanced Tech Stack Display (Priority: LOW)

**Step 6.1 - Create Tech Stack Logo Component**
```typescript
// Create src/components/TechStackDisplay.tsx
const TECH_LOGOS = {
  'Next.js': '/logos/nextjs.svg',
  'React': '/logos/react.svg',
  'TypeScript': '/logos/typescript.svg',
  'Three.js': '/logos/threejs.svg',
  'Tailwind CSS': '/logos/tailwind.svg',
  'Zustand': '/logos/zustand.png'
};

export function TechStackDisplay() {
  const techStack = getTechStack(); // From utils/tech-stack.ts
  
  return (
    <div className="flex items-center gap-4">
      {techStack.map((tech) => (
        <div
          key={tech.key}
          className="group relative"
        >
          <img
            src={TECH_LOGOS[tech.name]}
            alt={tech.name}
            className="h-6 w-6 grayscale hover:grayscale-0 transition-all duration-300
                      hover:scale-125 cursor-pointer"
          />
          
          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200
                          pointer-events-none">
            <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              {tech.name} v{tech.version}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2
                            border-4 border-transparent border-t-black" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 6.2 - Update Footer in Main Layout**
```typescript
// In src/app/page.tsx footer section
<footer className="border-t px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Built with</span>
      <TechStackDisplay />
    </div>
    <div className="flex items-center gap-4">
      <span className="text-xs text-gray-400">v{APP_VERSION}</span>
      <a href="/about" className="text-xs text-primary-600 hover:underline">
        About
      </a>
    </div>
  </div>
</footer>
```

### 🔧 TESTING & VALIDATION REQUIREMENTS

#### Testing Checklist
1. **Unit Tests Required:**
   - [ ] Test floorboard calculation logic
   - [ ] Test engineering calculations accuracy
   - [ ] Test camera position transitions
   - [ ] Test explosion factor calculations
   - [ ] Test formula rendering

2. **Integration Tests Required:**
   - [ ] Test 3D viewer with all new features
   - [ ] Test tab switching in OutputSection
   - [ ] Test responsive behavior on mobile
   - [ ] Test dark mode with glass morphism

3. **E2E Tests Required:**
   - [ ] Test complete user workflow with new UI
   - [ ] Test export functionality
   - [ ] Test all camera views
   - [ ] Test exploded view slider

4. **Performance Validation:**
   - [ ] 60 FPS minimum in 3D viewer
   - [ ] < 3 second initial load time
   - [ ] < 100ms UI interaction response
   - [ ] < 500ms calculation updates

### 📦 DEPENDENCIES TO INSTALL

```bash
# Required npm packages
npm install @tweenjs/tween.js    # For camera animations
npm install katex react-katex    # For formula rendering
npm install jspdf                # For PDF export
npm install xlsx                 # For Excel export
npm install react-icons          # For professional icons

# Dev dependencies
npm install -D @types/three      # TypeScript types
npm install -D @types/katex      # TypeScript types
```

### 🚀 DEPLOYMENT CHECKLIST

Before deployment, ensure:
- [ ] All lint errors fixed (`.\autocrate lint`)
- [ ] TypeScript compilation successful (`.\autocrate typecheck`)
- [ ] All tests passing (`.\autocrate test`)
- [ ] Build successful (`.\autocrate build`)
- [ ] Mobile responsiveness verified
- [ ] Dark mode fully functional
- [ ] No console errors in production build
- [ ] Performance metrics meet targets
- [ ] ISPM-15 compliance validated
- [ ] All formulas render correctly

### 💡 IMPLEMENTATION TIPS

1. **Start with UI Foundation** - Get the glass morphism and design tokens right first
2. **Test Incrementally** - Run `.\autocrate local` and test after each component
3. **Use Existing Patterns** - Follow patterns in existing codebase for consistency
4. **Preserve Functionality** - Don't break existing features while adding new ones
5. **Document Changes** - Update component comments with new props/features
6. **Optimize Imports** - Use dynamic imports for heavy libraries (Three.js components)
7. **Handle Edge Cases** - Test with extreme dimensions and empty configurations
8. **Maintain Type Safety** - Never use `any` type; create proper interfaces

### ⚠️ COMMON PITFALLS TO AVOID

1. **Don't hardcode colors** - Use CSS variables for theming
2. **Don't ignore mobile** - Test on small screens frequently
3. **Don't skip animations** - Smooth transitions are key to premium feel
4. **Don't overuse effects** - Glass morphism should be subtle
5. **Don't break dark mode** - Test both themes after each change
6. **Don't ignore performance** - Profile 3D rendering regularly
7. **Don't skip error handling** - Add try-catch for calculations
8. **Don't forget logging** - Use LogsStore for all user actions

### SPECIFIC CODE PATTERNS TO FOLLOW

For glass morphism panels:
```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

For camera positions:
```javascript
const views = {
  isometric: [5, 5, 5],
  top: [0, 10, 0],
  front: [0, 0, 10],
  right: [10, 0, 0]
}
```

For exploded view:
```javascript
const explodeFactor = slider.value / 100;
topPanel.position.y += explodeFactor * 2;
bottomPanel.position.y -= explodeFactor * 2;
```

### SUCCESS CRITERIA
- [ ] UI looks professional and unique, not generic
- [ ] Floorboards render correctly with individual boards visible
- [ ] Multiple camera views work with smooth transitions
- [ ] Engineering calculations replace NX expressions
- [ ] Formulas and compliance info are clearly displayed
- [ ] Tech stack has visual appeal with logos
- [ ] Exploded view animates smoothly
- [ ] All existing tests pass
- [ ] Production build completes successfully

### FILES TO MODIFY
1. `src/components/CrateViewer3D.tsx` - Add floorboards, axes, views
2. `src/components/OutputSection.tsx` - Replace NX with calculations
3. `src/styles/globals.css` - Add glass morphism styles
4. `src/components/ui/*` - Enhance all components
5. Create: `src/components/ViewControls.tsx`
6. Create: `src/components/ExplodedView.tsx`
7. Create: `src/services/engineeringCalculations.ts`
8. Create: `src/components/FormulaDisplay.tsx`

### IMPORTANT NOTES
- Maintain dark mode support throughout
- Log all actions to LogsSection
- Keep mobile layout functional
- Use existing Zustand stores
- Follow TypeScript strict mode
- No emojis in code
- Test after each phase

---

## ✅ COMPLETED TASKS

### Testing Infrastructure
- ✅ Migrated E2E testing from Playwright to Puppeteer
- ✅ Enhanced autocrate.bat with full testing capabilities
- ✅ Implemented queue system for batch testing
- ✅ Set up 80% coverage target with Vitest

---

## 📋 FUTURE ENHANCEMENTS (After UI Redesign)

### Authentication & User Management
- Implement secure login/registration system
- Add session management and JWT tokens
- Create user profile and settings pages

### Export Capabilities
- Add PDF export with professional formatting
- Implement STL export for 3D printing
- Create shareable design links

### API Development
- Create RESTful endpoints for design persistence
- Implement design versioning
- Add collaborative editing support

### Material Expansion
- Add metal and composite material options
- Include material property database
- Implement cost calculations per material type

### Templates & Presets
- Create industry-standard crate templates
- Add quick-start wizard for common use cases
- Implement design history and favorites

---

## 📊 PROJECT STATUS

**Current Phase**: UI Redesign & Professional Polish
**Priority**: Critical - Client Feedback Implementation
**Timeline**: Immediate execution required
**Testing**: Run `.\autocrate prepare` after each phase

---

## 🎯 SUCCESS METRICS

1. **UI Quality**: No longer looks AI-generated or generic
2. **Feature Completeness**: All 5 critical issues resolved
3. **Performance**: 60 FPS in 3D viewer, <3s load time
4. **Test Coverage**: Maintain 80% coverage
5. **Production Ready**: Clean build with zero errors

---

## 📝 NOTES FOR DEVELOPER

When executing the master prompt:
1. Start with Phase 1 (UI Foundation) - this is critical
2. Test thoroughly after each phase completion
3. Commit changes incrementally with clear messages
4. Run `.\autocrate prepare` before final deployment
5. Document any breaking changes encountered

Remember: The goal is to make this look like a $100K enterprise application, not a weekend project.