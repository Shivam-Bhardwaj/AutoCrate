# AutoCrate API Documentation - AMAT Compliance Features

## Table of Contents
1. [Overview](#overview)
2. [AMAT Specifications API](#amat-specifications-api)
3. [Material Specifications API](#material-specifications-api)
4. [ISPM-15 Compliance API](#ispm-15-compliance-api)
5. [Weight Calculations API](#weight-calculations-api)
6. [Component APIs](#component-apis)
7. [Store APIs](#store-apis)
8. [Type Definitions](#type-definitions)

## Overview

This document provides comprehensive API documentation for all AMAT compliance features implemented in AutoCrate. All APIs are written in TypeScript and provide full type safety.

## AMAT Specifications API

### Core Types

#### `AMATCrateStyle`
```typescript
type AMATCrateStyle = 'A' | 'B' | 'C' | 'D';
```

#### `AMATCrateStyleSpec`
```typescript
interface AMATCrateStyleSpec {
  style: AMATCrateStyle;
  name: string;
  description: string;
  weightRange: { min: number; max: number };
  features: string[];
  entryType: 'two-way' | 'four-way';
  hasFloatingDeck: boolean;
  requiresReinforcedJoists: boolean;
  panelType: 'cleated-plywood' | 'solid-lumber' | 'mixed';
  dropEndCap: boolean;
}
```

### Helper Functions

#### `determineAMATCrateStyle()`
**File**: [`src/types/amat-specifications.ts`](src/types/amat-specifications.ts:341)

Determines the appropriate AMAT crate style based on product weight and dimensions.

```typescript
function determineAMATCrateStyle(
  productWeight: number,
  dimensions: { length: number; width: number; height: number }
): AMATCrateStyle
```

**Parameters**:
- `productWeight`: Weight of the product in pounds
- `dimensions`: Crate dimensions in inches

**Returns**: AMAT crate style ('A', 'B', 'C', or 'D')

**Example**:
```typescript
const style = determineAMATCrateStyle(7500, { length: 48, width: 36, height: 24 });
// Returns: 'B'
```

#### `determineAMATSkidSize()`
**File**: [`src/types/amat-specifications.ts`](src/types/amat-specifications.ts:365)

Determines the appropriate skid size based on gross weight.

```typescript
function determineAMATSkidSize(grossWeight: number): AMATSkidSize
```

**Parameters**:
- `grossWeight`: Total weight including product and crate

**Returns**: Appropriate skid size specification

### MBB (Moisture Barrier Bag) Configuration

#### `MBBSpecification`
```typescript
interface MBBSpecification {
  enabled: boolean;
  semiE137Compliant: boolean;
  bagType: 'static-shielding' | 'moisture-barrier' | 'combination';
  sealType: 'heat-seal' | 'zipper' | 'fold-over';
  thickness: number; // mils
  materialType: 'polyethylene' | 'polyester' | 'aluminum-foil-laminate';
  moistureTransmissionRate: number; // g/m²/day
  sealIntegrityTest: boolean;
}
```

#### `determineMBBRequirements()`
**File**: [`src/types/amat-specifications.ts`](src/types/amat-specifications.ts:543)

Determines MBB requirements based on moisture sensitivity level.

```typescript
function determineMBBRequirements(msl: MoistureSensitivityLevel): SEMIE137Requirements
```

### Chamfer Configuration

#### `ChamferConfiguration`
```typescript
interface ChamferConfiguration {
  enabled: boolean;
  angle: number; // degrees
  depth: number; // inches
  airShipmentMode: boolean;
  weightReductionTarget: number; // percentage
}
```

#### `determineChamferConfiguration()`
**File**: [`src/types/amat-specifications.ts`](src/types/amat-specifications.ts:775)

Determines appropriate chamfer configuration for air shipment optimization.

```typescript
function determineChamferConfiguration(
  crateStyle: AMATCrateStyle,
  crateDimensions: { length: number; width: number; height: number },
  productWeight: number,
  isAirShipment: boolean = false
): ChamferConfiguration
```

## Material Specifications API

### Core Types

#### `MaterialSpecificationSet`
```typescript
interface MaterialSpecificationSet {
  wood: WoodSpecification[];
  hardware: HardwareSpecification[];
  treatments: TreatmentSpecification[];
  finishes: FinishSpecification[];
}
```

#### `MaterialValidation`
```typescript
interface MaterialValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  complianceScore: number; // 0-100
}
```

### Validation Functions

#### `validateWoodSpecification()`
**File**: [`src/types/material-specifications.ts`](src/types/material-specifications.ts:317)

Validates wood specifications against AMAT standards.

```typescript
function validateWoodSpecification(
  spec: WoodSpecification,
  requirements: Partial<WoodSpecification>
): MaterialValidation
```

#### `validateHardwareSpecification()`
**File**: [`src/types/material-specifications.ts`](src/types/material-specifications.ts:353)

Validates hardware specifications against AMAT standards.

```typescript
function validateHardwareSpecification(
  spec: HardwareSpecification,
  requirements: Partial<HardwareSpecification>
): MaterialValidation
```

#### `getRecommendedMaterials()`
**File**: [`src/types/material-specifications.ts`](src/types/material-specifications.ts:383)

Gets recommended materials based on crate style and shipping requirements.

```typescript
function getRecommendedMaterials(
  crateStyle: 'A' | 'B' | 'C' | 'D',
  isInternational: boolean,
  environmentalConditions: string
): MaterialSpecificationSet
```

## ISPM-15 Compliance API

### Core Types

#### `ISPM15TreatmentMethod`
```typescript
type ISPM15TreatmentMethod = 'heat-treatment' | 'chemical-treatment' | 'fumigation' | 'kiln-drying' | 'dielectric-heating';
```

#### `ISPM15ValidationResult`
```typescript
interface ISPM15ValidationResult {
  treatment: ISPM15TreatmentValidation;
  wood: { isValid: boolean; errors: string[]; warnings: string[] };
  marking: { isValid: boolean; errors: string[]; warnings: string[] };
  documentation: { isValid: boolean; errors: string[]; warnings: string[] };
  overall: ISPM15ComplianceStatus;
}
```

### Validation Functions

#### `validateISPM15HeatTreatment()`
**File**: [`src/types/ispm15-compliance.ts`](src/types/ispm15-compliance.ts:534)

Validates heat treatment parameters against ISPM-15 standards.

```typescript
function validateISPM15HeatTreatment(
  temperature: number,
  duration: number,
  coreTemperature?: number
): ISPM15TreatmentValidation
```

#### `validateISPM15ChemicalTreatment()`
**File**: [`src/types/ispm15-compliance.ts`](src/types/ispm15-compliance.ts:592)

Validates chemical treatment parameters against ISPM-15 standards.

```typescript
function validateISPM15ChemicalTreatment(
  chemical: ISPM15ChemicalType,
  concentration: number,
  temperature: number,
  duration: number
): ISPM15TreatmentValidation
```

#### `getCountrySpecificRequirements()`
**File**: [`src/types/ispm15-compliance.ts`](src/types/ispm15-compliance.ts:691)

Gets country-specific ISPM-15 requirements.

```typescript
function getCountrySpecificRequirements(country: CountryCode): CountrySpecificRequirements
```

## Weight Calculations API

### Core Types

#### `WeightBreakdown`
```typescript
interface WeightBreakdown {
  panels: {
    top: number; front: number; back: number; left: number; right: number; total: number;
  };
  framing: {
    cleats: number; reinforcements: number; total: number;
  };
  base: {
    skids: number; floorboards: number; total: number;
  };
  hardware: {
    fasteners: number; brackets: number; total: number;
  };
  protection: {
    foam: number; mbb: number; desiccant: number; total: number;
  };
  accessories: {
    shockIndicators: number; tiltIndicators: number; labels: number; total: number;
  };
  total: number;
}
```

#### `EnhancedWeightCalculationOptions`
```typescript
interface EnhancedWeightCalculationOptions {
  includeFoamCushioning?: boolean;
  includeMBB?: boolean;
  includeDesiccant?: boolean;
  includeHardware?: boolean;
  includeAccessories?: boolean;
  airShipmentMode?: boolean;
}
```

### Calculation Functions

#### `calculateEnhancedCrateWeight()`
**File**: [`src/services/weightCalculations.ts`](src/services/weightCalculations.ts:321)

Calculates comprehensive crate weight with all components.

```typescript
function calculateEnhancedCrateWeight(
  configuration: CrateConfiguration,
  options: EnhancedWeightCalculationOptions = {}
): WeightBreakdown
```

#### `calculatePanelWeight()`
**File**: [`src/services/weightCalculations.ts`](src/services/weightCalculations.ts:139)

Calculates weight of individual panels.

```typescript
function calculatePanelWeight(
  dimensions: { length: number; width: number; height: number },
  thickness: number,
  material: string
): number
```

#### `calculateDimensionalWeight()`
**File**: [`src/services/weightCalculations.ts`](src/services/weightCalculations.ts:469)

Calculates dimensional weight for air freight.

```typescript
function calculateDimensionalWeight(
  dimensions: CrateDimensions,
  dimensionalWeightFactor: number = 166
): number
```

## Component APIs

### AMATComplianceSection Component

**File**: [`src/components/AMATComplianceSection.tsx`](src/components/AMATComplianceSection.tsx:15)

**Purpose**: Main AMAT compliance configuration interface

**Props**: None (uses Zustand store)

**Features**:
- Auto-detection of crate style based on weight
- Manual style override options
- International shipping toggle
- Material validation display
- Comprehensive materials database

**Usage**:
```tsx
import { AMATComplianceSection } from '@/components/AMATComplianceSection';

function MyForm() {
  return (
    <form>
      {/* Other form sections */}
      <AMATComplianceSection />
    </form>
  );
}
```

### AirShipmentOptimization Component

**File**: [`src/components/AirShipmentOptimization.tsx`](src/components/AirShipmentOptimization.tsx:35)

**Purpose**: Air shipment optimization with chamfered design

**Props**: None (uses Zustand store)

**State**:
- Weight savings calculations
- Volume reduction tracking
- Cost savings estimation

**Usage**:
```tsx
import AirShipmentOptimization from '@/components/AirShipmentOptimization';

function MyForm() {
  return (
    <form>
      {/* Other form sections */}
      <AirShipmentOptimization />
    </form>
  );
}
```

### WeightBreakdown Component

**File**: [`src/components/WeightBreakdown.tsx`](src/components/WeightBreakdown.tsx:8)

**Purpose**: Detailed weight analysis by component

**Props**: None (uses Zustand store)

**Features**:
- Collapsible sections
- Weight percentage calculations
- Visual weight distribution chart
- Real-time updates

### ISPM15ComplianceSection Component

**File**: [`src/components/ISPM15ComplianceSection.tsx`](src/components/ISPM15ComplianceSection.tsx:1)

**Purpose**: ISPM-15 international shipping compliance

**Props**: None (uses Zustand store)

**Features**:
- Treatment method validation
- Country-specific requirements
- IPPC marking specifications
- Compliance scoring

## Store APIs

### CrateStore Interface

**File**: [`src/store/crate-store.ts`](src/store/crate-store.ts:1)

#### AMAT Compliance Actions

```typescript
interface CrateStore {
  // ... existing properties
  
  // AMAT Compliance
  updateAMATCompliance: (compliance: Partial<AMATCompliance>) => void;
  
  // Air Shipment
  updateAirShipment: (airShipment: Partial<AirShipmentConfig>) => void;
}
```

#### Usage Example

```typescript
import { useCrateStore } from '@/store/crate-store';

function MyComponent() {
  const { configuration, updateAMATCompliance, updateAirShipment } = useCrateStore();
  
  const handleStyleChange = (style: AMATCrateStyle) => {
    updateAMATCompliance({ style });
  };
  
  const handleAirShipmentToggle = (enabled: boolean) => {
    updateAirShipment({ enabled });
  };
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## Type Definitions

### Material Types

```typescript
type WoodGrade = 'Grade A' | 'Grade B' | 'Grade C' | 'Select Structural' | 'No.1' | 'No.2' | 'No.3' | 'Construction' | 'Standard';
type HardwareType = 'screws' | 'nails' | 'bolts' | 'brackets' | 'plates' | 'anchors';
type HardwareGrade = 'Grade 2' | 'Grade 5' | 'Grade 8' | 'Stainless' | 'Galvanized' | 'Zinc Plated';
type TreatmentType = 'heat-treatment' | 'chemical-treatment' | 'pressure-treatment' | 'fumigation';
type ComplianceStandard = 'ISPM-15' | 'ASTM' | 'ANSI' | 'AWPA' | 'NFPA' | 'AMAT-STD';
```

### Compliance Types

```typescript
type MoistureSensitivityLevel = 'MSL1' | 'MSL2' | 'MSL3' | 'MSL4' | 'MSL5' | 'MSL6';
type DesiccantType = 'silica-gel' | 'clay' | 'molecular-sieve' | 'calcium-oxide';
type CountryCode = 'US' | 'CA' | 'MX' | 'EU' | 'CN' | 'JP' | 'AU' | 'NZ' | 'BR' | 'AR' | 'CL' | 'OTHER';
```

## Error Handling

All APIs include comprehensive error handling:

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  complianceScore: number;
}
```

## Performance Considerations

- All calculations are memoized for performance
- Real-time updates are throttled to prevent excessive re-renders
- Heavy computations are performed in web workers when available
- Material databases are cached for quick access

## Security

- All inputs are validated against strict schemas
- Material specifications are verified against known standards
- Country-specific requirements are validated against official databases
- Treatment parameters are checked against regulatory limits

---
*Last Updated: September 2025*  
*Version: 2.1.0*