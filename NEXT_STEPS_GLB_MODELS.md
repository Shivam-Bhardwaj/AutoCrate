# Next Steps: Adding 3D Models (GLB Files)

## Current Status

✅ **Coordinate system fixed** - Bounding boxes now render at correct positions
✅ **Components created** - Klimp, Stencil, Lag Screw, and Washer components ready
✅ **Test page created** - `/model-test` page for orientation debugging
✅ **Fallback system** - Automatically uses bounding boxes when GLB files not available
❌ **GLB files needed** - STEP files need to be converted to GLB format

## Quick Start: Convert and Test One File

### Step 1: Convert KLIMP_#4.stp to GLB

**Option A: Using Siemens NX (Recommended)**
1. Open `KLIMP_#4.stp` in NX
2. File → Export → 3D Model
3. Select **glTF 2.0** format
4. Choose **Binary (.glb)** option
5. Export settings:
   - Include materials: Yes
   - Include normals: Yes
   - Y-up orientation: Yes (or test both Y-up and Z-up)
6. Save as `klimp-4.glb`

**Option B: Using Online Converter**
1. Go to https://products.aspose.app/3d/conversion/step-to-glb
2. Upload `KLIMP_#4.stp`
3. Download the converted GLB file
4. Rename to `klimp-4.glb`

### Step 2: Place GLB File

```bash
# From workspace directory
cp /path/to/klimp-4.glb public/models/
```

###Step 3: Test the Model

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Open test page:
   ```
   http://localhost:3000/model-test
   ```

3. In the test page:
   - Select "Klimp" from Model Type dropdown
   - **Uncheck** "Use Bounding Box"
   - The GLB model should now load
   - Rotate the view to see the model orientation

### Step 4: Fix Orientation (if needed)

If the model appears rotated incorrectly:

1. Use the rotation sliders in the test page
2. Adjust X, Y, Z rotation until the model looks correct
3. Note the rotation values
4. Update `src/lib/orientation-detector.ts`:

```typescript
// In getKlimpOrientation function, update 'top' case:
case 'top':
  rotation = {
    x: YOUR_X_VALUE * Math.PI / 180,  // Convert degrees to radians
    y: YOUR_Y_VALUE * Math.PI / 180,
    z: YOUR_Z_VALUE * Math.PI / 180
  }
  break
```

### Step 5: Enable GLB in Main App

Once orientation is correct:

1. Open `src/components/KlimpModel.tsx`
2. Change line 18:
   ```typescript
   // OLD:
   export function KlimpModel({ box, scale = 0.1, onError, useBoundingBox = true }: KlimpModelProps) {

   // NEW:
   export function KlimpModel({ box, scale = 0.1, onError, useBoundingBox = false }: KlimpModelProps) {
   ```

3. Rebuild and test:
   ```bash
   npm run build
   npm run dev
   ```

## Converting All Files

### File Naming Convention

STEP file → GLB file mapping:

| STEP File | GLB Filename |
|-----------|--------------|
| KLIMP_#4.stp | klimp-4.glb |
| LAG SCREW_0.38 X 2.50.stp | lag-screw-0-38-x-2-50.glb |
| LAG SCREW_0.38 X 3.00.stp | lag-screw-0-38-x-3-00.glb |
| FLAT WASHER_0.38_INCH.stp | flat-washer-0-38-inch.glb |
| STENCIL - FRAGILE.stp | stencil-fragile.glb |
| STENCIL - VERTICAL HANDLING.stp | stencil-vertical-handling.glb |
| STENCIL - HORIZONTAL HANDLING.stp | stencil-horizontal-handling.glb |
| STENCIL - CG.stp | stencil-cg.glb |
| STENCIL - DO NOT STACK.stp | stencil-do-not-stack.glb |
| STENCIL - APPLIED IMPACT-A.stp | stencil-applied-impact-a.glb |

**Rules:**
- Lowercase
- Spaces → hyphens (-)
- Underscores → hyphens (-)
- Remove special characters (#, periods in middle, etc.)
- Keep numbers and descriptive text

### Batch Conversion Script (NX)

If you have NX with scripting/journaling:

```javascript
// nx_export_glb.js
// Run in NX Journal Editor

const files = [
  "KLIMP_#4.stp",
  "LAG SCREW_0.38 X 2.50.stp",
  // ... add all files
];

files.forEach(file => {
  Session.Parts.Open(file);
  const outputName = file.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace('#', '')
    .replace('.stp', '.glb');

  Session.Parts.Work.Export(outputName, "GLTF2", {
    binary: true,
    materials: true,
    normals: true,
    yUp: true
  });

  Session.Parts.CloseAll();
});
```

## Orientation Reference

### Expected Orientations

**Klimp (L-shaped bracket):**
- **Top edge**: Longer leg (4.92") should point upward (Z+), shorter leg (3.92") points toward crate interior
- **Left edge**: Rotated 90°, bridging left panel to front panel
- **Right edge**: Rotated -90°, bridging right panel to front panel

**Stencils (Flat decals):**
- Should face outward from panels
- Text should be readable from outside the crate
- Flat surface parallel to panel surface

**Lag Screws:**
- Head should be visible on panel exterior
- Shaft points inward toward crate
- Aligned with fastening direction

## Troubleshooting

### Model doesn't appear
1. Check browser console for errors
2. Verify GLB file exists in `/public/models/`
3. Check filename matches exactly (case-sensitive on Linux)
4. Try with "Use Bounding Box" checked to see if position is correct

### Model is blank/invisible
1. Check that materials were exported
2. Try exporting with different settings (normals, materials)
3. Inspect GLB in Blender or online viewer first

### Model is too large/small
1. Check units in CAD export (should be inches)
2. STEP files are in inches, GLB should match
3. Adjust `scale` prop if needed (default is 0.1)

### Wrong orientation
1. Use `/model-test` page to find correct rotation
2. Update `orientation-detector.ts` with correct values
3. Remember: rotations in code are in **radians** (multiply degrees by π/180)

## Component Usage

Once GLB files are in place:

```typescript
// Klimp
<KlimpModel
  box={klimpBox}
  useBoundingBox={false}  // Use actual GLB model
/>

// Stencil
<StencilModel
  stencilType="fragile"
  position={[x, y, z]}
  rotation={[rx, ry, rz]}
  useBoundingBox={false}  // Use actual GLB model
/>

// Hardware
<HardwareModel
  type="lag-screw"
  position={[x, y, z]}
  rotation={[rx, ry, rz]}
/>
```

## Benefits of GLB Models

✅ **Accurate visualization** - See actual component geometry
✅ **Better UX** - More professional appearance
✅ **Materials/colors** - Proper material rendering with metallic surfaces
✅ **File size** - GLB is optimized and compressed for web
✅ **Performance** - Faster loading than other 3D formats

## Alternative: Keep Using Bounding Boxes

If GLB conversion is difficult, you can continue using the dark bounding boxes:

**Pros:**
- Already working and positioned correctly
- Simple, clean visualization
- No conversion needed
- Very small file size (just JSON)

**Cons:**
- Less detailed/realistic
- Can't see actual component shape
- No material/texture information

The choice is yours! The system supports both modes seamlessly.

## Getting Help

If you encounter issues:

1. Check `/model-test` page for visual debugging
2. Review `docs/STEP_TO_GLB_CONVERSION.md` for detailed conversion steps
3. Inspect STEP file catalog: `src/lib/step-file-catalog.json`
4. Check orientation detector: `src/lib/orientation-detector.ts`

## Summary

**Current state:**
- ✅ Coordinates fixed
- ✅ Bounding boxes rendering correctly
- ✅ All components created and ready for GLB
- ✅ Test page available at `/model-test`
- ❌ Need to convert STEP → GLB

**To get full 3D models:**
1. Convert one STEP file to GLB (start with klimp)
2. Test in `/model-test` page
3. Fix orientation if needed
4. Convert remaining files
5. Enable GLB mode in components
6. Deploy!

**Estimated time:**
- First file: 30-60 minutes (learning + testing)
- Remaining files: 5-10 minutes each
- Total: 2-3 hours for all 10 files
