# Improve Test Coverage for AutoCrate Core Modules

## Summary

- Current Jest coverage thresholds hold the app at roughly mid-50% global coverage while enforcing higher bars for a few utilities, but there is no recent coverage report checked into the repo to confirm the actual numbers (`collectCoverageFrom` and `coverageThreshold` in `jest.config.js` show the intent without proof of compliance).  
- Several high-impact 3D helpers and visual components that ship user-facing geometry have no dedicated tests today (e.g. coordinate transforms, STEP parsing heuristics, orientation logic, and React-Three components).  
- Strengthening the test suite around these pieces reduces regressions when STEP assets, orientation rules, or renderer logic evolves.

```34:70:jest.config.js
  coverageThreshold: {
    global: {
      statements: 56,
      branches: 50,
      functions: 49,
      lines: 56,
    },
    'src/lib/nx-generator.ts': {
      statements: 90,
      branches: 70,
      functions: 95,
      lines: 90,
    },
    'src/lib/tutorial/schema.ts': {
      statements: 85,
      branches: 55,
      functions: 85,
      lines: 85,
    },
    'src/lib/crate-constants.ts': {
      statements: 70,
      branches: 60,
      functions: 25,
      lines: 70,
    },
    'src/components/tutorial/**/*.tsx': {
      statements: 50,
      branches: 30,
      functions: 40,
      lines: 50,
    },
    'src/components/VisualChecklist.tsx': {
      statements: 35,
      branches: 20,
      functions: 30,
      lines: 35,
    },
  },
```

```31:53:src/lib/coordinate-transform.ts
export function nxToThreeJS(nxPoint: { x: number; y: number; z: number }): [number, number, number] {
  return [
    nxPoint.x * SCALE_FACTOR,      // X → X
    nxPoint.z * SCALE_FACTOR,      // Z → Y
    -nxPoint.y * SCALE_FACTOR      // Y → -Z (NEGATIVE!)
  ]
}

export function threeJSToNX(threePos: [number, number, number]): { x: number; y: number; z: number } {
  return {
    x: threePos[0] / SCALE_FACTOR,
    y: -threePos[2] / SCALE_FACTOR,  // -Z → Y (reverse negative)
    z: threePos[1] / SCALE_FACTOR    // Y → Z
  }
}
```

```26:103:src/lib/step-parser.ts
  static parseBoundingBox(stepContent: string): StepBoundingBox {
    const points = this.extractCartesianPoints(stepContent)

    if (points.length === 0) {
      throw new Error('No CARTESIAN_POINT entities found in STEP file')
    }

    // Calculate bounding box from all points
    const min = {
      x: Math.min(...points.map(p => p.x)),
      y: Math.min(...points.map(p => p.y)),
      z: Math.min(...points.map(p => p.z)),
    }
    ...
    return { min, max, dimensions, center }
  }
```

```48:100:src/lib/orientation-detector.ts
  static getKlimpOrientation(context: PlacementContext): OrientationInfo {
    const klimp = this.catalog['KLIMP_#4.stp']

    if (!klimp) {
      throw new Error('Klimp not found in catalog')
    }

    // Klimp dimensions from STEP file:
    // Length: ~4.92" (longest dimension - vertical when mounted)
    // Width: ~3.92" (medium dimension - horizontal reach)
    // Height: ~1.15" (thickness)

    let rotation = { x: 0, y: 0, z: 0 }
    let offset = { x: 0, y: 0, z: 0 }

    switch (context.edge) {
      case 'top':
        ...
```

```19:60:src/components/VisualKlimp.tsx
  const center = nxCenter(box.point1, box.point2)
  const position = nxToThreeJS(center)

  const getRotation = (): [number, number, number] => {
    const edge = box.metadata?.includes('left edge') ? 'left' :
                 box.metadata?.includes('right edge') ? 'right' : 'top'

    const orientation = OrientationDetector.getKlimpOrientation({
      edge,
      surfaceNormal: { x: 0, y: 0, z: 1 }
    })

    return [orientation.rotation.x, orientation.rotation.y, orientation.rotation.z]
  }
```

```39:112:src/components/HardwareModel3D.tsx
  const center = nxCenter(box.point1, box.point2)
  const position = nxToThreeJS(center)

  const getRotation = (): [number, number, number] => {
    if (box.metadata?.includes('left edge')) {
      return [0, 0, Math.PI / 2]
    } else if (box.metadata?.includes('right edge')) {
      return [0, 0, -Math.PI / 2]
    }
    return [0, 0, 0]
  }

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulseScale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.02
      meshRef.current.scale.setScalar(scale * pulseScale)
    }
  })
```

## Proposed Work

1. **Unit-test coordinate transforms**  
   - Add Jest cases in `src/lib/__tests__/coordinate-transform.test.ts` that cover bidirectional conversion, scaling overrides, and size helpers.  
   - Validate round-tripping between `nxToThreeJS` and `threeJSToNX`, and ensure sign inversions stay consistent.

2. **Add STEP parsing fixtures**  
   - Craft lightweight STEP snippets in `tests/fixtures/` to exercise `StepParser.parseBoundingBox`, `parseStepFile`, `isFlatStencil`, and `isLShaped`.  
   - Assert that empty STEP content throws, and that orientation sorting returns the expected primary axis.

3. **Cover orientation heuristics**  
   - Introduce tests for `OrientationDetector.getKlimpOrientation` and `getStencilOrientation` across `top/left/right/front/back` edges, confirming rotation/offset pairs.  
   - Verify fallbacks (e.g. missing catalog entry) and helper utilities like `eulerToRotationMatrix`.

4. **Validate geometry factories**  
   - Add deterministic assertions for `createKlimpGeometry`, `createLagScrewGeometry`, `createSimpleKlimpGeometry`, etc., using bounding boxes or vertex counts to confirm dimensions match the catalog values.  
   - Ensure materials/constants can be instantiated in a node test environment (mocking WebGL as needed).

5. **Render layer smoke tests**  
   - Use React Testing Library with a mocked `@react-three/fiber` canvas to mount `HardwareModel3D` exports and `VisualKlimp`, asserting they compose expected sub-meshes and respect metadata-driven orientation.  
   - Stub `useFrame` to confirm animation callbacks do not throw when the component unmounts.

## Acceptance Criteria

- New tests cover the modules above, lifting global statement coverage to ≥65% and branches to ≥60% while keeping existing thresholds green.  
- Libraries and components listed gain direct test files with meaningful assertions (not just render-without-crash).  
- Any required mocks or fixtures live under `test/` or `tests/fixtures` with clear naming.  
- Documentation in `TESTING_GUIDE.md` updated if additional setup steps are required (e.g. jest canvas mocks).

## Verification

1. `npm install` (once)  
2. `npm run test:coverage`  
3. Inspect the generated `coverage/lcov-report/index.html` and attach a screenshot demonstrating improved module coverage.  
4. Capture the coverage summary from CLI and include it in the pull request.

