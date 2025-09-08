# AMAT Implementation Tasks - Parallel Execution Guide

## Overview
These tasks can be executed independently in parallel terminals. Each task is self-contained with clear deliverables.

---

## Task 1: Header and Rail Specifications for Shipping Bases
**Priority: High**
**Estimated Time: 30 minutes**

### Prompt:
"Implement header and rail specifications for shipping bases in the AutoCrate application according to AMAT standards (0251-70054 Rev. 08).

### Requirements:
1. Add to `src/types/amat-specifications.ts`:
   - Header specifications (2x4, 2x6, 2x8 based on crate size)
   - Rail specifications for structural support
   - Spacing requirements (max 24" centers)

2. Update `src/store/crate-store.ts`:
   - Add header and rail configuration to CrateConfiguration
   - Auto-calculate header size based on crate dimensions

3. Create UI component `src/components/HeaderRailConfig.tsx`:
   - Header size selection (auto-recommended)
   - Rail count and spacing configuration
   - Visual preview of header/rail placement

4. Update NX generator to include header/rail parameters

### Acceptance Criteria:
- Headers auto-size based on crate weight/dimensions
- Rails properly spaced per AMAT standards
- NX expressions include header/rail geometry"

---

## Task 2: Moisture Barrier Bag (MBB) Requirements
**Priority: High**
**Estimated Time: 45 minutes**

### Prompt:
"Implement moisture barrier bag (MBB) requirements per SEMI E137 specification for the AutoCrate application.

### Requirements:
1. Add MBB specifications to `src/types/amat-specifications.ts`:
   ```typescript
   interface MBBSpecification {
     material: 'aluminum-polyethylene' | 'aluminum-polyester';
     thickness: number; // mils
     sealWidth: number; // inches
     humidityIndicator: boolean;
     desiccantType: 'silica-gel' | 'clay' | 'molecular-sieve';
     targetRH: number; // target relative humidity percentage
   }
   ```

2. Create `src/components/MBBConfiguration.tsx`:
   - MBB material selection
   - Desiccant calculator based on:
     * Crate volume
     * Wood moisture content
     * Target humidity level
     * Shipping duration
   - Humidity indicator card placement
   - Seal integrity requirements display

3. Add MBB validation rules:
   - Minimum seal width 1/2 inch
   - Maximum humidity 50% RH
   - Desiccant quantity formula: Units = (Volume × 0.01) × (Days/30) × MoistureFactor

4. Update OutputSection to show MBB specifications when enabled

### Acceptance Criteria:
- Desiccant calculations match AMAT formula
- MBB specs included in BOM
- Clear installation instructions generated"

---

## Task 3: Chamfered Crate Cap Design
**Priority: Medium**
**Estimated Time: 40 minutes**

### Prompt:
"Implement chamfered crate cap design for air shipment optimization in the AutoCrate application.

### Requirements:
1. Add chamfer specifications to `src/types/amat-specifications.ts`:
   - Chamfer angle (typically 45°)
   - Chamfer depth based on crate size
   - Weight reduction calculations

2. Update 3D visualization (`src/components/CrateViewer3D.tsx`):
   - Show chamfered corners when air shipment mode selected
   - Visual difference between standard and chamfered cap

3. Create `src/components/AirShipmentOptimization.tsx`:
   - Toggle for air shipment mode
   - Chamfer configuration options
   - Weight savings display
   - Volume reduction calculations

4. Update NX generator:
   - Add chamfer parameters
   - Include chamfer cutting instructions
   - Calculate material savings

### Acceptance Criteria:
- 3D model shows chamfered design
- Weight reduction >5% for large crates
- NX expressions include chamfer geometry"

---

## Task 4: Crate Marking Requirements
**Priority: Medium**
**Estimated Time: 35 minutes**

### Prompt:
"Implement crate marking requirements including AMAT logo, fragile stencils, and handling symbols per AMAT standards.

### Requirements:
1. Create `src/types/marking-specifications.ts`:
   ```typescript
   interface MarkingRequirement {
     type: 'logo' | 'fragile' | 'arrows' | 'cog' | 'custom';
     position: 'all-sides' | 'front-back' | 'specific';
     size: { width: number; height: number };
     color: string;
     specification: string;
   }
   ```

2. Create `src/components/CrateMarkingDesigner.tsx`:
   - Marking type selection
   - Position configuration (which faces)
   - Size specifications
   - Preview of crate with markings
   - Export marking template

3. Add marking validation:
   - AMAT logo required on all sides
   - Fragile stencils for sensitive equipment
   - This-way-up arrows minimum 4 inches
   - Shock/tilt indicators for >150 lbs

4. Generate marking instructions in OutputSection

### Acceptance Criteria:
- Visual preview shows marking placement
- Marking checklist generated
- Templates exportable for printing"

---

## Task 5: Center of Gravity (CoG) Calculations
**Priority: High**
**Estimated Time: 50 minutes**

### Prompt:
"Implement center of gravity (CoG) calculation and marking specifications for the AutoCrate application.

### Requirements:
1. Create `src/services/cog-calculator.ts`:
   ```typescript
   function calculateCoG(
     productWeight: number,
     productCoG: { x: number; y: number; z: number },
     crateDimensions: CrateDimensions,
     crateWeight: number
   ): { x: number; y: number; z: number }
   ```

2. Create `src/components/CoGConfiguration.tsx`:
   - Product CoG input (x, y, z from origin)
   - Auto-calculate combined CoG
   - Visual indicator on 3D model
   - CoG marking position calculator

3. Add CoG validation:
   - Warn if CoG > 60% of height
   - Alert if off-center > 10%
   - Recommend stabilization if needed

4. Update 3D visualization:
   - Show CoG point as sphere
   - Color coding: green (stable), yellow (caution), red (unstable)
   - Display CoG coordinates

5. Add to NX generator:
   - CoG coordinates in expressions
   - Marking location calculations

### Acceptance Criteria:
- CoG visible in 3D view
- Stability warnings functional
- Marking instructions include CoG location"

---

## Task 6: Bill of Materials with AMAT Suppliers
**Priority: Low**
**Estimated Time: 30 minutes**

### Prompt:
"Create comprehensive Bill of Materials with AMAT-approved suppliers for the AutoCrate application.

### Requirements:
1. Create `src/services/bom-generator.ts`:
   - Calculate material quantities
   - Include all components (wood, fasteners, foam, MBB, indicators)
   - Add AMAT-approved supplier codes

2. Update `src/components/BillOfMaterials.tsx`:
   - Detailed material list with quantities
   - Supplier information and part numbers
   - Cost estimates (if available)
   - Export to CSV/PDF

3. Add AMAT supplier database:
   ```typescript
   const AMATSuppliers = {
     lumber: ['Supplier A - Code 1234', 'Supplier B - Code 5678'],
     plywood: ['Supplier C - Code 9012'],
     foam: ['Supplier D - Code 3456'],
     indicators: ['ShockWatch - SW50', 'TiltWatch - TW25']
   }
   ```

4. Include special requirements:
   - ISPM-15 treated wood sources
   - MIL-SPEC fasteners for critical loads
   - Certified desiccant suppliers

### Acceptance Criteria:
- Complete BOM with all materials
- Supplier codes included
- Export functionality working"

---

## Task 7: Integration Testing
**Priority: Critical**
**Estimated Time: 20 minutes**

### Prompt:
"Create integration tests for all AMAT compliance features in the AutoCrate application.

### Requirements:
1. Create `tests/integration/amat-compliance.test.tsx`:
   - Test style selection logic
   - Verify skid sizing calculations
   - Check desiccant calculations
   - Validate CoG calculations

2. Create `tests/unit/amat-specifications.test.ts`:
   - Test all helper functions
   - Verify weight thresholds
   - Check ISPM-15 logic

3. Update existing tests to include AMAT features

### Acceptance Criteria:
- All tests passing
- >80% code coverage for new features
- No regression in existing tests"

---

## Execution Instructions

### For Parallel Execution:
1. Open 6 separate terminals
2. Each terminal handles one task
3. All tasks work on the same codebase (coordinate git commits)
4. Run `npm run type-check` after each task
5. Run `npm run lint` to ensure code quality

### Recommended Order (if sequential):
1. Task 5 (CoG) - Critical for safety
2. Task 2 (MBB) - Critical for product protection  
3. Task 1 (Headers/Rails) - Structural requirement
4. Task 4 (Markings) - Shipping requirement
5. Task 3 (Chamfer) - Optimization feature
6. Task 6 (BOM) - Documentation
7. Task 7 (Testing) - Final validation

### Git Branch Strategy:
```bash
# Create feature branches for each task
git checkout -b feature/amat-headers-rails
git checkout -b feature/amat-mbb
git checkout -b feature/amat-chamfer
git checkout -b feature/amat-markings
git checkout -b feature/amat-cog
git checkout -b feature/amat-bom
```

### Success Metrics:
- All TypeScript types properly defined
- UI components responsive and intuitive
- 3D visualization updates correctly
- NX expressions include all parameters
- No linting or type errors
- Tests passing

---

## Notes
- The AMAT specifications document (0251-70054 Rev. 08) should be referenced for exact requirements
- All measurements should be in inches (imperial units)
- Coordinate with team if working in parallel to avoid merge conflicts
- Test each feature in isolation before integration