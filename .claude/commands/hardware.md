Add or modify hardware in AutoCrate:

Work with hardware systems (klimps, lag screws, etc.):

Existing hardware:

- Klimp fasteners: src/lib/klimp-calculator.ts, klimp-step-integration.ts, KlimpModel.tsx
- Lag screws: src/lib/lag-step-integration.ts

To add new hardware:

1. Create calculator in src/lib/ (placement algorithm with spacing rules)
2. Create STEP integration file for CAD export
3. Create 3D component in src/components/ for visualization
4. Add to STEP generator assembly structure
5. Add tests in src/lib/**tests**/
6. Update main visualizer to include new hardware
7. Test with different crate configurations

Ask the user what hardware they want to add or modify.
