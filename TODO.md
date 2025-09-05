# AutoCrate TODO - Critical Fixes v2.0.0

## 🚨 CRITICAL ISSUES TO FIX IMMEDIATELY

### 1. ❌ COORDINATE SYSTEM IS WRONG
**Current Issue:** The 3D coordinate system is completely incorrect
**Required Fix:**
- **Z-axis** = UP (Height) - Currently wrong
- **X-axis** = Sideways (Width when viewing from front)
- **Y-axis** = Depth (going away from screen)

**Files to Fix:**
- `src/components/CoordinateAxes.tsx` - Update axis labels and colors
- `src/components/CrateViewer3D.tsx` - Fix all position calculations
- All Box components need position vectors updated

### 2. ❌ FLOORBOARDS ORIENTATION WRONG
**Current Issue:** Floorboards are rendered in wrong direction
**Required Fix:**
- Floorboards should run perpendicular to skids
- Fix the rotation/orientation in `FloorboardsGroup` component
- Update position calculations to match correct orientation

### 3. ❌ INPUT SYSTEM COMPLETELY WRONG
**Current Issue:** Inputs are for CRATE dimensions, should be PRODUCT dimensions
**Required Changes:**
```
REMOVE:
- Crate Length/Width/Height
- Max Gross Weight

ADD:
- Product Width (front view, X-axis) - in inches
- Product Depth (side view, Y-axis) - in inches  
- Product Height (Z-axis) - in inches
- Product Weight - in POUNDS (not kg!)
```

**Crate Calculation Logic:**
- Crate dimensions = Product dimensions + clearance + panel thickness
- Add 2-4 inches clearance on each side
- Calculate crate size FROM product size

### 4. ❌ MISSING EXPLODE BUTTON
**Required Implementation:**
- Add "Explode View" button in 3D viewer controls
- Implement exploded view with slider (0-100%)
- Panels should separate to show internal structure
- Must work with corrected coordinate system

### 5. 📋 TAB REORDERING REQUIRED
**Current Order:** Engineering → Formulas → Summary → BOM
**New Order:**
1. **Summary** (first) - Quick overview
2. **BOM** (second) - Bill of materials
3. **Analysis** (third) - Combine engineering + formulas into one tab
4. **NX Expression** (last) - Restore the NX CAD expression output

### 6. 🎨 UI/LAYOUT FIXES
**Center Alignment Required:**
- All section headers (Input Section, 3D Rendering, Output Section)
- Footer content (version and tech stack)
- Make everything center-aligned for professional look

**Professional Headers:**
- Replace generic labels with better names:
  - "Input Section" → "Product Configuration"
  - "3D Rendering" → "Crate Visualization"
  - "Output Section" → "Design Analysis"

### 7. 📁 FILE EXPORT CHANGES
**REMOVE:**
- JSON export functionality (not needed)

**FIX NX Expression Export:**
- Restore NX expression generation (was removed in recent changes)
- Filename format: `{ProductName}_{L}x{W}x{H}_{Weight}lbs_{YYYYMMDD}_{HHMMSS}_UTC.exp`
- Example: `Server_48x36x72_500lbs_20250105_143025_UTC.exp`
- Include all parameters in filename for easy identification

---

## 🔧 IMPLEMENTATION ORDER

### Phase 1: Fix Critical 3D Issues
1. Fix coordinate system (Z=up, X=width, Y=depth)
2. Fix floorboard orientation
3. Update all 3D calculations

### Phase 2: Fix Input System
1. Change inputs from crate to product dimensions
2. Change weight to pounds
3. Remove gross weight input
4. Add crate size calculation logic

### Phase 3: Add Missing Features
1. Add explode view button and functionality
2. Restore NX expression generation
3. Fix file naming convention

### Phase 4: UI Polish
1. Reorder tabs (Summary → BOM → Analysis → NX)
2. Center align all headers and footer
3. Rename sections professionally

---

## 📝 FILES TO MODIFY

1. **src/components/InputForms.tsx**
   - Change all inputs to product dimensions
   - Change weight units to pounds
   - Remove gross weight field

2. **src/components/CoordinateAxes.tsx**
   - Fix axis labels (Z=Height, X=Width, Y=Depth)
   - Update colors if needed

3. **src/components/CrateViewer3D.tsx**
   - Fix coordinate system in all calculations
   - Fix floorboard orientation
   - Add explode view functionality

4. **src/components/OutputSection.tsx**
   - Reorder tabs
   - Combine Engineering + Formulas → Analysis
   - Restore NX Expression tab
   - Fix export functionality

5. **src/services/nx-generator.ts**
   - Restore this service (currently missing!)
   - Update for new coordinate system
   - Fix filename generation

6. **src/app/page.tsx**
   - Center align section headers
   - Rename sections
   - Center align footer

---

## ✅ SUCCESS CRITERIA

- [ ] Z-axis points UP in 3D viewer
- [ ] Floorboards perpendicular to skids
- [ ] Inputs are for PRODUCT (not crate)
- [ ] Weight in POUNDS
- [ ] Explode button works
- [ ] Tabs in correct order: Summary → BOM → Analysis → NX
- [ ] NX expression file downloads with proper naming
- [ ] All headers center-aligned
- [ ] Professional section names

---

## ⚠️ TESTING CHECKLIST

1. Enter product dimensions (e.g., 48"W x 36"D x 72"H, 500 lbs)
2. Verify crate is LARGER than product
3. Check coordinate axes (Z should point up)
4. Test explode view
5. Download NX file and verify naming
6. Check all tabs display correctly
7. Verify center alignment throughout

---

## 🚫 DO NOT

- Don't break existing dark mode
- Don't remove logging functionality
- Don't break mobile responsiveness
- Don't change the core calculation logic (just fix orientation)
- Don't add features not requested

---

## 📌 NOTES

**Coordinate System Reference:**
- Industry standard: Z = vertical (up)
- Front view: X = horizontal, Z = vertical
- Side view: Y = horizontal, Z = vertical
- Top view: X = horizontal, Y = vertical

**Product vs Crate:**
- Product = what goes INSIDE the crate
- Crate = the shipping container we're designing
- Crate must be larger than product (add clearance)