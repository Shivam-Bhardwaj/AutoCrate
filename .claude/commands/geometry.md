Work with crate geometry and dimensional calculations:

**Core Geometry System:**

Focus on the two-point diagonal construction method and geometric calculations:

**Key Files:**
- `src/lib/nx-generator.ts` - Core geometry engine, two-point construction
- `src/lib/cleat-calculator.ts` - Panel cleat positioning algorithms
- `src/lib/klimp-calculator.ts` - Klimp fastener placement geometry
- `src/lib/panel-stop-calculator.ts` - Panel stop positioning
- `src/lib/plywood-splicing.ts` - Plywood layout optimization
- `src/lib/crate-constants.ts` - Geometric constants and standards
- `src/components/CrateVisualizer.tsx` - 3D visualization of geometry

**Coordinate System:**
- Origin: (0, 0, 0) at center of crate floor
- X-axis: Width (left/right, symmetric about X=0)
- Y-axis: Length (front/back)
- Z-axis: Height (vertical, up from floor)

**Common Geometry Tasks:**

1. **Dimension Calculations:**
   - Overall crate dimensions (width, length, height)
   - Internal clearance spaces
   - Component sizing (skids, panels, cleats)
   - Lumber selection based on weight thresholds

2. **Component Positioning:**
   - Skid spacing patterns (2, 3, or 4 skids)
   - Floorboard layout and gaps
   - Panel alignment and ground clearance
   - Cleat placement on panels
   - Klimp fastener positioning (18-24" spacing)
   - Panel stop insets and lengths

3. **Geometric Constraints:**
   - SKID_STANDARDS.MIN_FORKLIFT_HEIGHT: 3.5"
   - CLEAT_STANDARDS.MAX_VERTICAL_SPACING: 24"
   - FASTENER_STANDARDS spacing ranges
   - GEOMETRY_STANDARDS clearances

4. **NX Expression Generation:**
   - Parametric modeling expressions
   - Two-point box construction
   - Assembly hierarchy relationships
   - Datum plane definitions (A, B, C per ASME Y14.5)

**Debugging Geometry Issues:**

When investigating geometry problems:
1. Check the NX expressions output for correct calculations
2. Verify 3D visualization matches expected positions
3. Review STEP export for proper component placement
4. Compare against crate-constants.ts standards
5. Test with different scenarios (lightweight, heavy, tall)

**Testing Geometry Changes:**
- Run unit tests in `src/lib/__tests__/`
- Check 3D visualization with multiple scenarios
- Verify STEP file exports correctly
- Review NX expressions for accuracy

Ask the user what specific geometry task or issue they need help with.
