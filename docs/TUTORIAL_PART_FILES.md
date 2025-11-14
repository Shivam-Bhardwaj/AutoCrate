# Tutorial Part Files List

This document lists all part files that need to be created when following the tutorials in AutoCrate.

## Overview

There are two tutorial modes:

1. **Full Tutorial** (`?tutorial=1`) - Creates individual part files for each component
2. **Assembly Tutorial** (`?tutorial=assemblies`) - Creates assembly files that group related components

---

## Full Tutorial Mode - Individual Part Files

When following the full tutorial, you create one part file per component. The tutorial guides you through creating these in order:

### 1. Base Components

#### SKID
- **skid** (base skid block, then patterned)
  - Patterned using `pattern_count` and `pattern_spacing` expressions
  - Creates multiple skid instances along X direction

#### Floorboards
- **floorboard_1** through **floorboard_40** (up to 40 floorboards)
  - Each floorboard is a separate part file
  - Some may be suppressed based on crate size
  - Uses expressions: `FLOORBOARD_n_X1/Y1/Z1/X2/Y2/Z2` and `FLOORBOARD_n_SUPPRESSED`

### 2. Panel Plywood Pieces

Each panel can have up to 6 plywood pieces. All 6 are always defined (some may be suppressed):

#### Front Panel
- **front_end_panel_ply_1**
- **front_end_panel_ply_2**
- **front_end_panel_ply_3**
- **front_end_panel_ply_4**
- **front_end_panel_ply_5**
- **front_end_panel_ply_6**

#### Back Panel
- **back_panel_ply_1**
- **back_panel_ply_2**
- **back_panel_ply_3**
- **back_panel_ply_4**
- **back_panel_ply_5**
- **back_panel_ply_6**

#### Left End Panel
- **left_end_panel_ply_1**
- **left_end_panel_ply_2**
- **left_end_panel_ply_3**
- **left_end_panel_ply_4**
- **left_end_panel_ply_5**
- **left_end_panel_ply_6**

#### Right End Panel
- **right_side_panel_ply_1**
- **right_side_panel_ply_2**
- **right_side_panel_ply_3**
- **right_side_panel_ply_4**
- **right_side_panel_ply_5**
- **right_side_panel_ply_6**

#### Top Panel
- **top_panel_ply_1**
- **top_panel_ply_2**
- **top_panel_ply_3**
- **top_panel_ply_4**
- **top_panel_ply_5**
- **top_panel_ply_6**

**Total Plywood Pieces**: Up to 30 pieces (5 panels × 6 pieces each)

### 3. Cleats

Cleats are generated dynamically based on panel layout. Each cleat is a separate part file. Cleat names follow patterns like:

- **{panel}_cleat_{n}** (e.g., `front_end_panel_cleat_1`, `front_end_panel_cleat_2`, etc.)
- Cleats can be:
  - Vertical cleats
  - Horizontal cleats
  - Splice cleats
  - Horizontal splice cleats (cleat_h_inter)

**Note**: The exact number of cleats varies by panel size and configuration. Check the tutorial expressions for the specific cleat names for your crate.

### 4. Hardware (Guidance Only)

Hardware parts are imported from STEP files, not created as new parts:

- **Klimp clamps** - Import STEP file once, reuse instances
- **Lag screws** - Import STEP file once, reuse instances

---

## Assembly Tutorial Mode - Assembly Part Files

When following the assembly tutorial, you create assembly files that group related components. Create files in this order:

### 1. Template File

#### _TEMPLATE
- Template/starting point for assembly structure
- Create this first as a base template

### 2. Top-Level Assemblies

#### CRATE_CAP
Top-level assembly containing all cap components.

**Sub-Assemblies:**

##### FRONT_PANEL_ASSEMBLY
- Contains all front panel components
- Individual parts:
  - front_end_panel_ply_1 through front_end_panel_ply_6
  - front_end_panel cleats (all cleats for front panel)

##### BACK_PANEL_ASSEMBLY
- Contains all back panel components
- Individual parts:
  - back_panel_ply_1 through back_panel_ply_6
  - back_panel cleats (all cleats for back panel)

##### LEFT_PANEL_ASSEMBLY
- Contains all left end panel components
- Individual parts:
  - left_end_panel_ply_1 through left_end_panel_ply_6
  - left_end_panel cleats (all cleats for left end panel)

##### RIGHT_PANEL_ASSEMBLY
- Contains all right end panel components
- Individual parts:
  - right_side_panel_ply_1 through right_side_panel_ply_6
  - right_side_panel cleats (all cleats for right end panel)

##### TOP_PANEL_ASSEMBLY
- Contains all top panel components
- Individual parts:
  - top_panel_ply_1 through top_panel_ply_6
  - top_panel cleats (all cleats for top panel)

##### CAP_MISC_ASSEMBLY
- Contains miscellaneous cap components
- Individual parts: Any components not belonging to specific panels

#### SHIPPING_BASE
Top-level assembly containing the base components.

**Sub-Assemblies:**

##### SKID_ASSEMBLY
- Contains all skid components
- Individual parts:
  - **skid** (base skid block, then patterned instances)
  - Patterned using `pattern_count` and `pattern_spacing` expressions
  - Creates multiple skid instances along X direction

##### FLOORBOARD_ASSEMBLY
- Contains all floorboard components
- Individual parts:
  - **floorboard_1** through **floorboard_40** (up to 40 floorboards)
  - Each floorboard is a separate part file
  - Some may be suppressed based on crate size
  - Uses expressions: `FLOORBOARD_n_X1/Y1/Z1/X2/Y2/Z2` and `FLOORBOARD_n_SUPPRESSED`

#### STENCILS
- Top-level assembly (no sub-assemblies)
- Contains all stencil/decal components
- Individual parts: All marking/stencil components

#### KLIMP_FASTENERS
- Top-level assembly (no sub-assemblies)
- Contains all Klimp fastener components
- Individual parts: All Klimp instances

---

## Summary

### Full Tutorial Mode
- **Total Part Files**: Variable, depends on crate size
  - 1 skid (base, then patterned)
  - Up to 40 floorboards
  - Up to 30 plywood pieces (5 panels × 6 pieces)
  - Variable number of cleats (depends on panel configuration)
  - Hardware imported from STEP files

### Assembly Tutorial Mode
- **Total Assembly Files**: 10-12 files
  - 1 template file (_TEMPLATE)
  - 4 top-level assemblies (CRATE_CAP, SHIPPING_BASE, STENCILS, KLIMP_FASTENERS)
  - 6-7 sub-assemblies under CRATE_CAP
  - 2 sub-assemblies under SHIPPING_BASE (SKID_ASSEMBLY, FLOORBOARD_ASSEMBLY)
  - Individual parts within assemblies (skids, floorboards, plywood pieces, cleats)

---

## Notes

1. **Suppressed Components**: Some parts may be marked as suppressed (e.g., unused plywood pieces, floorboards beyond the needed count). These still need part files created, but should be suppressed in NX.

2. **Expression Binding**: All part dimensions and positions should be bound to expressions, not hardcoded values. The tutorial provides all necessary expression names.

3. **Hardware**: Klimp and lag screws are imported from STEP files rather than created as new parts. The tutorial provides guidance on placement and counts.

4. **Dynamic Components**: The exact number of cleats and which floorboards/plywood pieces are active depends on the crate configuration. Always check the tutorial expressions for your specific crate.

5. **Naming Convention**: Individual part file names should be lowercase (e.g., `floorboard_1`, `front_end_panel_ply_1`, `right_side_panel_ply_1`, `skid`, etc.). Assembly file names are uppercase (e.g., `CRATE_CAP`, `SHIPPING_BASE`, `FRONT_PANEL_ASSEMBLY`, etc.).

---

## Related Documentation

- [NX Template Tutorial](./NX_TEMPLATE_TUTORIAL.md) - Build order and tips
- [Architecture Documentation](./ARCHITECTURE.md) - System design details
- Tutorial Mode: Enable with `?tutorial=1` or `?tutorial=assemblies` in the app URL

