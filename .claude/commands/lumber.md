Add or modify lumber sizes in AutoCrate:

Work with lumber size configuration:

Key files:

- Constants: src/lib/crate-constants.ts (ACTUAL_LUMBER_DIMENSIONS)
- NX Generator: src/lib/nx-generator.ts (types and logic)
- Visualizer: src/components/CrateVisualizer.tsx (3D rendering)
- Cut List: src/components/LumberCutList.tsx (display)

Workflow for adding new lumber size:

1. Add dimensions to crate-constants.ts
2. Update TypeScript types
3. Update NX expression generation logic
4. Update 3D visualization
5. Update cut list display
6. Add tests
7. Verify with different crate scenarios

Ask the user what lumber size changes they need.
