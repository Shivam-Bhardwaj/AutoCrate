# AutoCrate User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Creating Your First Crate](#creating-your-first-crate)
4. [Advanced Features](#advanced-features)
5. [Exporting to NX CAD](#exporting-to-nx-cad)
6. [Tips and Best Practices](#tips-and-best-practices)

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- WebGL support for 3D visualization
- Minimum screen resolution: 1280x720

### Accessing AutoCrate
1. Navigate to https://autocrate.vercel.app/
2. The application loads automatically
3. No installation required

## Interface Overview

### Main Layout Sections

#### 1. Input Section (Left Panel)
- Project name field
- Configuration tabs
- Parameter inputs
- Material selections

#### 2. 3D Rendering (Center)
- Real-time 3D preview
- Interactive camera controls
- Grid reference system
- Component visualization

#### 3. Output Section (Right Panel)
- NX expression code
- Summary information
- Bill of materials
- Export controls

#### 4. Login Section (Bottom Center - when not logged in)
- Authentication options
- Account management

## Creating Your First Crate

### Step 1: Project Setup
1. Enter a project name in the input section
2. This name will be used for file exports

### Step 2: Define Dimensions
1. Click the "Dimensions" tab
2. Enter crate measurements:
   - **Length**: Distance along X-axis
   - **Width**: Distance along Z-axis  
   - **Height**: Distance along Y-axis
3. Select unit system (mm or inches)
4. Specify weights:
   - **Product Weight**: Weight of contents
   - **Max Gross Weight**: Total capacity

### Step 3: Configure Base
1. Click the "Base" tab
2. Select base type:
   - **Standard**: General purpose
   - **Heavy-Duty**: Reinforced for heavy loads
   - **Export Grade**: International shipping compliant
3. Set parameters:
   - **Floorboard Thickness**: Base panel thickness
   - **Skid Height**: Clearance for forklift access
   - **Skid Width**: Support beam width
   - **Number of Skids**: Typically 2-4
4. Choose material (Pine, Oak, Plywood, OSB)

### Step 4: Design Panels
1. Click the "Panels" tab
2. Configure each panel individually:
   - **Thickness**: Panel material thickness
   - **Material**: Wood type selection
   - **Reinforcement**: Toggle for extra strength
   - **Ventilation**: Enable air circulation holes
3. Repeat for all five panels (Top, Front, Back, Left, Right)

### Step 5: Select Fasteners
1. Click the "Fasteners" tab
2. Choose fastener type:
   - **Klimp Connectors**: Quick assembly
   - **Nails**: Traditional fastening
   - **Screws**: Removable option
   - **Bolts**: Heavy-duty connection
3. Set specifications:
   - **Size**: Fastener dimensions
   - **Spacing**: Distance between fasteners
   - **Material**: Steel, Stainless, or Galvanized

### Step 6: Add Vinyl (Optional)
1. Click the "Vinyl" tab
2. Toggle "Enable Vinyl Wrapping"
3. Select vinyl type:
   - **Waterproof**: Moisture protection
   - **Vapor Barrier**: Humidity control
   - **Cushion**: Impact protection
4. Configure:
   - **Thickness**: Vinyl sheet thickness
   - **Coverage**: Full or partial wrapping

## Advanced Features

### 3D Viewer Controls
- **Rotate**: Left-click and drag
- **Zoom**: Scroll wheel or pinch
- **Pan**: Right-click and drag
- **Reset View**: Double-click

### Real-time Updates
- Changes instantly reflect in 3D view
- Automatic recalculation of materials
- Dynamic cost estimation

### Configuration Templates
Save common configurations:
1. Configure crate parameters
2. Use "New Project" to reset
3. Reapply saved settings

## Exporting to NX CAD

### Generating Expression File
1. Review configuration in Output Section
2. Check the NX Expression tab
3. Verify code syntax
4. Click "Download" button

### File Format
- Extension: `.exp`
- Encoding: UTF-8
- Compatible with NX 10.0+

### Importing to Siemens NX
1. Open Siemens NX
2. Navigate to Tools → Expressions
3. Select "Import from File"
4. Choose the downloaded `.exp` file
5. Apply expressions to model

### Expression Structure
```
// Parameters section
p0 = 1200 // Length
p1 = 1000 // Width
p2 = 1000 // Height

// Features section
BLOCK/CREATE_BASE
  HEIGHT = p13
  WIDTH = p1
  LENGTH = p0
END_BLOCK
```

## Tips and Best Practices

### Design Guidelines

#### Dimensional Considerations
- Maintain aspect ratios for stability
- Allow 10-15% clearance for contents
- Consider forklift entry points (min 100mm skid height)

#### Material Selection
- **Pine**: Cost-effective for light loads
- **Oak**: Durable for heavy items
- **Plywood**: Smooth surface, consistent strength
- **OSB**: Budget option for dry conditions

#### Structural Integrity
- Use reinforcement for panels > 2000mm
- Increase thickness for heavy loads
- Add center skids for lengths > 2400mm

### Weight Distribution
- Center heavy items
- Use adequate skid count
- Consider dynamic loading during transport

### Ventilation Planning
- Required for organic materials
- Prevents moisture buildup
- Follow ISPM-15 standards

### Cost Optimization
- Standardize dimensions when possible
- Use common material thicknesses
- Minimize custom fastener requirements
- Consider reusability for return logistics

### Common Configurations

#### Small Parts Crate
- Dimensions: 600 x 400 x 400 mm
- Base: Standard with 2 skids
- Panels: 12mm plywood
- Fasteners: Nails at 150mm spacing

#### Heavy Machinery Crate
- Dimensions: 2400 x 1800 x 1800 mm
- Base: Heavy-duty with 4 skids
- Panels: 18mm OSB with reinforcement
- Fasteners: Bolts at 200mm spacing

#### Export Shipping Crate
- Dimensions: 1200 x 1000 x 1000 mm
- Base: Export grade with 3 skids
- Panels: 15mm treated plywood
- Vinyl: Full waterproof coverage

## Troubleshooting

### 3D Viewer Issues
- **Black screen**: Enable WebGL in browser
- **Slow performance**: Reduce browser tabs
- **Missing textures**: Clear cache and reload

### Export Problems
- **Download fails**: Check popup blocker
- **Invalid expression**: Verify all inputs
- **Import errors in NX**: Check NX version compatibility

### Input Validation
- **Red fields**: Value out of valid range
- **Warnings**: Non-optimal configurations
- **Locked options**: Dependencies not met

## Keyboard Shortcuts
- `Ctrl/Cmd + S`: Download expression
- `Ctrl/Cmd + C`: Copy code
- `Ctrl/Cmd + N`: New project
- `Space`: Reset 3D view

## Support Resources
- Technical documentation: `/docs`
- Video tutorials: Coming soon
- Contact: engineering@company.com

## Glossary

- **Expression**: Parametric code for NX CAD
- **Skid**: Base support beam for forklift access
- **Panel**: Flat surface component of crate
- **Klimp**: Metal corner connector system
- **ISPM-15**: International wood packaging standard
- **Bill of Materials (BOM)**: Component list with quantities