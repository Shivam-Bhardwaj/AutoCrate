# AMAT Compliance Guide - Technical Documentation

## Overview

AutoCrate now includes comprehensive AMAT (Applied Materials) compliance features based on the AMAT Standard Packing and Crating Requirements (0251-70054 Rev. 08) with SEMI E137 MBB compliance. This guide provides detailed technical documentation for all AMAT compliance features implemented in the system.

## Key AMAT Compliance Features

### 1. Fixed 3D Viewer with Chamfered Panels
- **Purpose**: Optimize crates for air shipment by reducing weight and volume
- **Implementation**: [`src/components/ChamferedPanel.tsx`](src/components/ChamferedPanel.tsx:1)
- **Features**:
  - Real-time chamfer geometry calculation
  - Material density-based weight reduction
  - Configurable chamfer angles (15°-45°)
  - Visual distinction in 3D viewer

### 2. Integrated MBB Configuration (SEMI E137)
- **Purpose**: Moisture barrier bag compliance for sensitive electronic components
- **Implementation**: [`src/types/amat-specifications.ts`](src/types/amat-specifications.ts:82)
- **Features**:
  - Multiple bag types (static-shielding, moisture-barrier, combination)
  - Automated desiccant quantity calculation
  - Humidity indicator card placement
  - Seal integrity validation

### 3. Enhanced Weight Calculations
- **Purpose**: Accurate weight calculations using real material densities
- **Implementation**: [`src/services/weightCalculations.ts`](src/services/weightCalculations.ts:1)
- **Features**:
  - Material-specific density calculations
  - Hardware weight calculations
  - Foam cushioning weight
  - Accessory weight (shock/tilt indicators)
  - Dimensional weight for air freight

### 4. Complete Material Specifications System
- **Purpose**: Comprehensive material database with AMAT-approved specifications
- **Implementation**: [`src/types/material-specifications.ts`](src/types/material-specifications.ts:1)
- **Features**:
  - Wood grades (Grade A, B, C) with strength properties
  - Hardware specifications (screws, nails, bolts, brackets)
  - Treatment specifications (ISPM-15, pressure treatment)
  - Finish specifications with performance metrics

### 5. Comprehensive ISPM-15 Compliance
- **Purpose**: International shipping compliance for wood packaging materials
- **Implementation**: [`src/types/ispm15-compliance.ts`](src/types/ispm15-compliance.ts:1)
- **Features**:
  - Heat treatment validation (56°C minimum for 30 minutes)
  - Chemical treatment specifications
  - Country-specific requirements database
  - IPPC marking requirements
  - Treatment certificate validation

## Technical Architecture

### AMAT Specifications System

The core AMAT specifications are defined in [`src/types/amat-specifications.ts`](src/types/amat-specifications.ts:1) with four main crate styles:

```typescript
export const AMATCrateStyles: Record<AMATCrateStyle, AMATCrateStyleSpec> = {
  A: { /* Standard two-way entry crate */ },
  B: { /* Floating deck with drop-end cap */ },
  C: { /* Four-way entry enhanced support */ },
  D: { /* Heavy-duty with reinforced joists */ }
};
```

Each style has specific requirements for:
- Weight capacity ranges
- Entry types (two-way vs four-way)
- Structural requirements
- Panel construction methods

### Material Validation System

The material validation system ensures compliance with AMAT standards:

```typescript
export interface MaterialValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  complianceScore: number; // 0-100
}
```

### Weight Calculation Engine

The enhanced weight calculation system provides accurate weight estimates:

```typescript
export interface WeightBreakdown {
  panels: { top: number; front: number; back: number; left: number; right: number; total: number };
  framing: { cleats: number; reinforcements: number; total: number };
  base: { skids: number; floorboards: number; total: number };
  hardware: { fasteners: number; brackets: number; total: number };
  protection: { foam: number; mbb: number; desiccant: number; total: number };
  accessories: { shockIndicators: number; tiltIndicators: number; labels: number; total: number };
  total: number;
}
```

## Component Documentation

### AMATComplianceSection Component

**File**: [`src/components/AMATComplianceSection.tsx`](src/components/AMATComplianceSection.tsx:1)

**Purpose**: Main AMAT compliance configuration interface

**Features**:
- Auto-detection of crate style based on weight
- Manual style override options
- International shipping toggle with ISPM-15 compliance
- Moisture barrier bag configuration
- Real-time material validation
- Comprehensive material specifications display

**Props**: None (uses Zustand store)

**Usage**:
```tsx
import { AMATComplianceSection } from '@/components/AMATComplianceSection';

// In your form
<AMATComplianceSection />
```

### AirShipmentOptimization Component

**File**: [`src/components/AirShipmentOptimization.tsx`](src/components/AirShipmentOptimization.tsx:1)

**Purpose**: Air shipment optimization with chamfered design

**Features**:
- Weight reduction calculations
- Volume reduction calculations
- Cost savings estimation
- Chamfer configuration (angle, depth)
- Real-time optimization results

**State Management**:
- Weight savings tracking
- Volume reduction tracking
- Cost savings calculation

**Usage**:
```tsx
import AirShipmentOptimization from '@/components/AirShipmentOptimization';

// In your form
<AirShipmentOptimization />
```

### WeightBreakdown Component

**File**: [`src/components/WeightBreakdown.tsx`](src/components/WeightBreakdown.tsx:1)

**Purpose**: Detailed weight analysis by component

**Features**:
- Collapsible sections for each component type
- Weight percentage calculations
- Material-specific breakdowns
- Visual weight distribution chart
- Real-time updates based on configuration changes

**Sections**:
- Panels (top, front, back, left, right)
- Framing & Cleats
- Base & Skids
- Hardware (fasteners, brackets)
- Protection materials (foam, MBB, desiccant)
- Accessories (indicators, labels)

### ISPM15ComplianceSection Component

**File**: [`src/components/ISPM15ComplianceSection.tsx`](src/components/ISPM15ComplianceSection.tsx:1)

**Purpose**: ISPM-15 international shipping compliance

**Features**:
- Treatment method validation
- Country-specific requirements
- IPPC marking specifications
- Treatment certificate validation
- Compliance scoring

## Service Documentation

### WeightCalculations Service

**File**: [`src/services/weightCalculations.ts`](src/services/weightCalculations.ts:1)

**Purpose**: Accurate weight calculations for all crate components

**Key Functions**:

```typescript
// Calculate enhanced crate weight with all components
export function calculateEnhancedCrateWeight(
  configuration: CrateConfiguration,
  options: EnhancedWeightCalculationOptions = {}
): WeightBreakdown

// Calculate dimensional weight for air freight
export function calculateDimensionalWeight(
  dimensions: CrateDimensions,
  dimensionalWeightFactor: number = 166
): number

// Calculate billable weight (actual vs dimensional)
export function calculateBillableWeight(
  actualWeight: number,
  dimensionalWeight: number
): number
```

**Material Densities** (lbs per cubic foot):
- Pine: 28
- Oak: 45
- Plywood: 35
- OSB: 40
- Steel: 490
- Stainless: 500

## Configuration API

### CrateConfiguration Interface

The main configuration interface includes AMAT compliance settings:

```typescript
interface CrateConfiguration {
  // ... existing properties
  amatCompliance?: {
    style: 'A' | 'B' | 'C' | 'D';
    isInternational: boolean;
    requiresMoistureBag: boolean;
    foamDensity: number;
    desiccantUnits: number;
    requiresShockIndicator: boolean;
    requiresTiltIndicator: boolean;
    comprehensiveMaterials: MaterialSpecificationSet;
    materialValidation: MaterialValidation;
    chamferConfiguration: ChamferConfiguration;
  };
  airShipment?: {
    enabled: boolean;
    chamfer: {
      enabled: boolean;
      angle: number;
      depth: number;
    };
    costPerPound: number;
    dimensionalWeightFactor: number;
  };
}
```

### Store Actions

**File**: [`src/store/crate-store.ts`](src/store/crate-store.ts:1)

**AMAT Compliance Actions**:
```typescript
updateAMATCompliance: (compliance: Partial<AMATCompliance>) => void
updateAirShipment: (airShipment: Partial<AirShipmentConfig>) => void
```

## Validation and Compliance

### Material Validation

The system validates materials against AMAT standards:

```typescript
export function validateMaterialCompliance(
  materials: MaterialSpecificationSet,
  requirements: { isInternational?: boolean; environmentalConditions?: string }
): MaterialValidation
```

### ISPM-15 Validation

Comprehensive ISPM-15 compliance checking:

```typescript
export function validateISPM15Compliance(
  treatmentMethod: ISPM15TreatmentMethod,
  treatmentData: any,
  woodData: any,
  destinationCountry: CountryCode
): ISPM15ValidationResult
```

## Testing

### Test Coverage

All AMAT compliance features include comprehensive tests:

- **Unit Tests**: [`src/services/__tests__/weightCalculations.test.ts`](src/services/__tests__/weightCalculations.test.ts:1)
- **Component Tests**: [`src/components/__tests__/MaterialSpecifications.test.tsx`](src/components/__tests__/MaterialSpecifications.test.tsx:1)
- **Integration Tests**: [`src/components/__tests__/AirShipmentIntegration.test.tsx`](src/components/__tests__/AirShipmentIntegration.test.tsx:1)
- **ISPM-15 Tests**: [`src/components/__tests__/ISPM15Compliance.test.tsx`](src/components/__tests__/ISPM15Compliance.test.tsx:1)

### Test Requirements

- Minimum 80% code coverage
- All validation functions tested
- Component interaction tests
- International compliance scenarios

## Performance Considerations

### Optimization Features

- **Lazy Loading**: Heavy components load on demand
- **Memoization**: Expensive calculations cached
- **Real-time Updates**: Efficient state management with Zustand
- **3D Performance**: Optimized Three.js rendering

### Bundle Size Management

- Tree-shaking for unused code
- Dynamic imports for large dependencies
- Code splitting by feature modules

## Security and Compliance

### Data Validation

- All inputs validated with Zod schemas
- Material specifications validated against standards
- Country-specific requirements enforced
- Treatment parameters validated

### International Standards

- ISPM-15 compliance for wood packaging
- SEMI E137 compliance for moisture barrier bags
- Country-specific import requirements
- Treatment certificate validation

## Future Enhancements

### Planned Features

- Advanced FEA integration for structural analysis
- Cloud storage for project configurations
- Collaborative editing capabilities
- Multi-language support
- API for third-party integrations

### Extensibility

The AMAT compliance system is designed for extensibility:
- Plugin architecture for new compliance standards
- Configurable validation rules
- Modular component system
- Extensible material database

## Support and Resources

### Documentation Links

- [Technical Guide](TECHNICAL_GUIDE.md)
- [User Manual](USER_MANUAL.md)
- [Testing Guide](TESTING.md)
- [Deployment Guide](DEPLOYMENT.md)

### Getting Help

- Create GitHub issue with `amat-compliance` label
- Contact engineering team
- Review implementation examples in test files
- Check type definitions for API details

---
*Last Updated: September 2025*  
*Version: 2.1.0*