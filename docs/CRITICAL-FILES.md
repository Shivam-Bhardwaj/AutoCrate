# AutoCrate Critical Files Documentation

This document tracks the critical files in the AutoCrate codebase that are essential for making any changes. Understanding these files and their relationships will help you identify what gets affected when making modifications.

## File Categories by Impact Level

### 🔴 CRITICAL - Core System Files
**Changes to these files affect the entire application**

| File | Purpose | Change Impact | Dependencies |
|------|---------|---------------|-------------|
| `package.json` | Project dependencies, scripts, version | Breaking changes, deployment issues | All npm dependencies |
| `tsconfig.json` | TypeScript compilation settings | Type checking, build process | All TypeScript files |
| `next.config.js` | Next.js framework configuration | Routing, building, performance | Entire Next.js app |
| `src/app/layout.tsx` | Root HTML layout and metadata | Site-wide UI, SEO, theming | All pages and components |
| `src/types/crate.ts` | Core type definitions | Type safety across entire app | All stores, services, components |

### 🟠 HIGH IMPACT - Core Application Logic
**Changes to these files affect major application features**

| File | Purpose | Change Impact | Dependencies |
|------|---------|---------------|-------------|
| `src/store/crate-store.ts` | Main application state management | Configuration data, UI updates | InputForms, OutputSection, 3D viewer |
| `src/services/nx-generator.ts` | NX CAD expression generation | Output generation, export functionality | CrateConfiguration types |
| `src/app/page.tsx` | Main desktop homepage | Overall UI layout and behavior | All major components |
| `src/app/mobile-layout.tsx` | Mobile-specific layout wrapper | Mobile user experience | Mobile components |
| `src/components/CrateViewer3D.tsx` | 3D visualization engine | Visual representation | Three.js, React Three Fiber |

### 🟡 MEDIUM IMPACT - Feature Components
**Changes to these files affect specific features**

| File | Purpose | Change Impact | Dependencies |
|------|---------|---------------|-------------|
| `src/components/InputForms.tsx` | User input interface | Data entry, form validation | crate-store, UI components |
| `src/components/OutputSection.tsx` | Results display and export with NX guides | Output presentation, file downloads, NX instructions | nx-generator, stores, NX guide components |
| `src/components/NXInstructions.tsx` | Step-by-step NX CAD implementation guide | User guidance for CAD workflow | OutputSection integration |
| `src/components/NXVisualGuide.tsx` | Visual coordinate system and construction guide | Interactive visual CAD reference | OutputSection integration |
| `src/components/LogsSection.tsx` | System logging with hydration-safe rendering | Debug information, user feedback | logs-store, client-only timestamps |
| `src/store/theme-store.ts` | Theme/dark mode management | Visual theming across app | All components with dark mode |
| `src/store/logs-store.ts` | System logging functionality | Debug information, user feedback | Components that log actions |
| `src/utils/skid-calculations.ts` | Automated crate sizing logic | Skid dimension calculations | crate-store updates |
| `src/utils/format-inches.ts` | Inch dimension formatting utility | Consistent dimension display | Input/output components |

### 🟢 LOW IMPACT - Configuration & Styling
**Changes to these files have localized effects**

| File | Purpose | Change Impact | Dependencies |
|------|---------|---------------|-------------|
| `tailwind.config.ts` | Styling framework configuration | Visual appearance, CSS classes | All styled components |
| `vercel.json` | Deployment and hosting settings | Production deployment behavior | Build process |
| `src/app/globals.css` | Global CSS styles | Site-wide styling | All components |
| `src/lib/utils.ts` | Utility functions | Helper functions for components | Components using utilities |

## Component Relationships

### State Flow
```
User Input → InputForms → crate-store → CrateViewer3D
                     ↓
                OutputSection ← nx-generator
```

### Mobile Layout Structure
```
mobile-layout.tsx → MobileWrapper → SwipeableCard → BottomNavigation
```

### Theme System
```
theme-store → All Components (via isDarkMode)
           → HTML class manipulation
```

## Critical Change Scenarios

### 🚨 When changing core types (`src/types/crate.ts`):
**Files that will need updates:**
- `src/store/crate-store.ts` - State interface changes
- `src/services/nx-generator.ts` - Type usage in generation
- `src/components/InputForms.tsx` - Form field types
- `src/components/OutputSection.tsx` - Display logic
- `src/utils/skid-calculations.ts` - Calculation parameters

### 🚨 When adding new configuration options:
**Files that will need updates:**
1. `src/types/crate.ts` - Add to CrateConfiguration interface
2. `src/store/crate-store.ts` - Add to state and update functions
3. `src/components/InputForms.tsx` - Add input controls
4. `src/services/nx-generator.ts` - Include in NX expression generation
5. `src/components/CrateViewer3D.tsx` - Update 3D visualization if needed

### 🚨 When modifying the 3D visualization:
**Files that might need updates:**
- `src/components/CrateViewer3D.tsx` - Main 3D component
- `package.json` - If adding new Three.js dependencies
- `src/store/crate-store.ts` - If visualization needs new state data

### 🚨 When changing mobile layout:
**Files that will need updates:**
- `src/app/mobile-layout.tsx` - Layout structure
- `src/components/mobile/*.tsx` - Mobile-specific components
- `src/app/page.tsx` - Mobile detection logic
- Responsive CSS in components

## Build & Deployment Dependencies

### Critical Build Files
- `package.json` - Dependencies and build scripts
- `next.config.js` - Build configuration
- `tsconfig.json` - TypeScript compilation
- `tailwind.config.ts` - CSS generation
- `vercel.json` - Production deployment settings

### Environment Variables (vercel.json)
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_APP_VERSION` - Version display
- `NEXT_PUBLIC_API_URL` - API endpoint configuration

## Testing Impact

### When making changes, test these areas:
1. **Configuration Changes**: Verify all input forms work correctly
2. **Type Changes**: Run `npm run type-check` to ensure type safety
3. **3D Visualization**: Test crate rendering with various configurations
4. **Mobile Layout**: Test responsive behavior on different screen sizes
5. **Export Functionality**: Verify NX expression generation works
6. **NX Guide Components**: Test Instructions and Visual Guide tabs
7. **Theme System**: Test dark/light mode switching
8. **Logging System**: Test hydration-safe timestamp rendering
9. **Build Process**: Run `npm run build` before deployment

## Version Control Notes

### Files to monitor for unintended changes:
- `package-lock.json` - Can be regenerated unexpectedly
- `.next/` directory - Generated build files (not tracked)
- `node_modules/` - Dependencies (not tracked)
- Auto-generated files from scripts

### Critical commit patterns:
- Always test locally before committing changes to core files
- Changes to `src/types/crate.ts` require comprehensive testing (unit system now fixed to inches)
- State store changes should be tested with various configurations
- Mobile layout changes need testing across device sizes
- LogsSection changes need hydration safety verification
- NX guide component changes need CAD workflow validation

---

**Last Updated**: Updated with recent architectural changes (NX guides, unit system, hydration fixes)
**Version**: 2.2.0
**Recent Changes**: Added NX instruction components, fixed unit system to inches, implemented hydration-safe logging
**Note**: This document should be updated when major architectural changes are made to the codebase.