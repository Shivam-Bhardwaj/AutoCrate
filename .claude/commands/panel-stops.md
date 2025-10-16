Work on panel stops feature implementation (Issue #80):

**Context**: Panel stops are structural components that prevent panels from collapsing inward during packing.

**Specifications**:
- Material: 3/8" thick plywood, 2" wide
- Placement: 1.0625" (1-1/16") from panel edge
- Quantity: 2 on front cleated panel side edges, 1 on top panel front edge
- Length: Half the smallest cleated panel edge dimension, centered
- All panel stops face the removable front cleated panel

**Implementation Tasks**:

1. **Data Structures** (`src/lib/crate-constants.ts`):
   - Add PANEL_STOP_STANDARDS with thickness, width, and inset specifications

2. **Calculator** (`src/lib/panel-stop-calculator.ts` - NEW):
   - Calculate panel stop positions for front panel sides (2 stops)
   - Calculate panel stop position for top panel front edge (1 stop)
   - Determine length: half of smallest cleated panel edge, centered
   - Return positions as NXBox-compatible coordinates

3. **NX Generator Integration** (`src/lib/nx-generator.ts`):
   - Add panel stop generation in appropriate section
   - Create NXBox instances for each panel stop
   - Ensure proper coordinate positioning relative to panels

4. **STEP Export** (`src/lib/step-generator.ts`):
   - Add panel stops to appropriate assembly (likely CRATE_CAP)
   - Follow existing patterns for plywood components
   - Use proper naming: `panel_stop_front_left`, `panel_stop_front_right`, `panel_stop_top`

5. **3D Visualization** (`src/components/CrateVisualizer.tsx`):
   - Render panel stops as thin plywood strips
   - Use appropriate material/color (similar to plywood panels)
   - Add visibility toggle for panel stops

6. **Testing**:
   - Unit tests for panel stop calculator
   - Integration tests for NX generator
   - STEP export validation
   - E2E test for 3D visualization

**Success Criteria**:
- Panel stops appear in 3D visualization at correct positions
- STEP file includes properly positioned panel stops
- All tests pass (unit, integration, E2E)
- Panel stops respect crate dimensions and scale appropriately

**Usage**: Just say "implement panel stops" or ask for specific parts like "add panel stops calculator"
