# NX Template Tutorial (Two-Point Boxes + Expressions)

Use this alongside the in-app Tutorial Mode. Enable it by opening the app with `?tutorial=1`:

- Example: http://localhost:3000/?tutorial=1

Build order
- Datum & Axes: Confirm A/B/C datums and coordinate system.
- SKID Block (Opposite Corners): Use SKID_X1..Z2.
- Pattern Skids: pattern_count, pattern_spacing (X direction, center-to-center).
- Floorboards: One Block per FLOORBOARD_n (X1..Z2). Suppress flagged boards.
- Panels (Plywood): For each panel piece, set NAME_X/Y/Z + NAME_WIDTH/LENGTH/HEIGHT + NAME_THICKNESS.
- Cleats: Same 7 parameters; THICKNESS = 0.750 (1x4).
- Hardware Guidance: Klimp + lag placement from expressions and counts; import STEP once.

Tips
- Always bind fields via fx to expressions; avoid raw numbers.
- Validate with overall_width/length/height.
- Keep origin/axes consistent for deterministic regeneration.

See also
- docs/workflow/TESTING_BROWSERLESS.md
- In-app Docs: NX: Recreate Crate Geometry
