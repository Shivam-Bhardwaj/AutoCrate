Add or modify crate scenarios:

Work with predefined crate configurations:

File: src/components/ScenarioSelector.tsx

Current scenarios:

- Default Production
- Lightweight Electronics
- Heavy Industrial
- Tall Precision Module

To add a new scenario:

1. Ask user for scenario details:
   - Name and description
   - Product dimensions (width, length, height, weight)
   - Material specifications
   - Lumber size restrictions
   - Special requirements
2. Add to SCENARIO_PRESETS in ScenarioSelector.tsx
3. Test that scenario loads correctly
4. Verify 3D visualization
5. Check STEP and NX exports work
6. Document the use case

Ask the user what scenario they want to add or modify.
