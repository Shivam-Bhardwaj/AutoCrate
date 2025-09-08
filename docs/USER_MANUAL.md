# AutoCrate User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Creating Your First Crate](#creating-your-first-crate)
4. [AMAT Compliance Features](#amat-compliance-features)
5. [Advanced Features](#advanced-features)
6. [Exporting to NX CAD](#exporting-to-nx-cad)
7. [Tips and Best Practices](#tips-and-best-practices)

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

## AMAT Compliance Features

### Overview
AutoCrate now includes comprehensive AMAT (Applied Materials) compliance features based on the AMAT Standard Packing and Crating Requirements (0251-70054 Rev. 08). These features ensure your crates meet the highest standards for shipping sensitive equipment.

### AMAT Crate Styles
The system automatically recommends the appropriate AMAT crate style based on your product weight:

#### Style A - Standard (0-5,000 lbs)
- Two-way entry design
- Cleated plywood or solid lumber panels
- Cost-effective for lightweight products
- Suitable for domestic shipping

#### Style B - Floating Deck (5,000-10,000 lbs)
- Drop-end design for easy loading
- Floating deck with foam cushioning
- Enhanced shock absorption
- Ideal for medium-weight equipment

#### Style C - Enhanced (10,000-20,000 lbs)
- Four-way forklift entry
- Enhanced structural support
- Improved handling flexibility
- Suitable for medium-heavy loads

#### Style D - Heavy Duty (20,000+ lbs)
- Reinforced joist construction
- Heavy-duty design for extreme loads
- Four-way entry for maximum flexibility
- Enhanced structural integrity

### AMAT Compliance Configuration

#### Accessing AMAT Settings
1. Complete your basic crate configuration
2. The system will auto-detect the recommended AMAT style
3. Click on "AMAT Compliance" section to customize settings
4. Override automatic selections if needed

#### International Shipping (ISPM-15)
When shipping internationally:
1. Toggle "International Shipping" to enable ISPM-15 compliance
2. The system will require heat-treated wood with IPPC stamps
3. Additional documentation will be generated
4. Country-specific requirements are automatically applied

#### Moisture Barrier Bag (MBB) - SEMI E137
For sensitive electronic components:
1. Toggle "Moisture Barrier Bag" to enable MBB protection
2. Select bag type based on your product requirements:
   - **Static-Shielding**: For ESD-sensitive components
   - **Moisture-Barrier**: For humidity protection
   - **Combination**: For comprehensive protection
3. The system calculates required desiccant quantity
4. Humidity indicator cards are automatically included

### Air Shipment Optimization

#### Chamfered Panel Design
For air freight cost reduction:
1. Enable "Air Shipment Mode" in the configuration
2. Toggle "Enable Chamfering" to activate corner rounding
3. Configure chamfer parameters:
   - **Angle**: Typically 45° (range: 15°-45°)
   - **Depth**: Based on crate size (0.5"-6")
4. The system calculates weight and volume savings
5. Cost savings are estimated based on freight rates

#### Weight and Volume Savings
The optimization system provides:
- **Weight Reduction**: 5-25% depending on crate size
- **Volume Reduction**: Reduced dimensional weight
- **Cost Savings**: Based on current air freight rates
- **Visual Comparison**: Standard vs. chamfered design

### Material Specifications

#### Comprehensive Materials Database
The system includes detailed specifications for:
- **Wood Materials**: Grade A, B, C lumber with strength properties
- **Hardware**: Screws, nails, bolts with corrosion resistance ratings
- **Treatments**: ISPM-15 heat treatment, pressure treatment
- **Finishes**: Exterior paints, sealants with performance metrics

#### Material Validation
The system validates all materials against AMAT standards:
- Moisture content limits (max 19%)
- Strength requirements (bending, compression, shear)
- Defect limitations (knots, splits, warp)
- Compliance certifications

### Weight Analysis

#### Detailed Weight Breakdown
Access comprehensive weight analysis:
1. Click on "Weight Breakdown" to view detailed analysis
2. Expand sections to see individual components:
   - **Panels**: Top, front, back, left, right
   - **Framing**: Cleats and reinforcements
   - **Base**: Skids and floorboards
   - **Hardware**: Fasteners and brackets
   - **Protection**: Foam, MBB, desiccant
   - **Accessories**: Indicators and labels

#### Accurate Calculations
The system uses real material densities:
- Pine: 28 lbs/cubic foot
- Oak: 45 lbs/cubic foot
- Plywood: 35 lbs/cubic foot
- OSB: 40 lbs/cubic foot

### ISPM-15 Compliance

#### International Shipping Requirements
For international shipments, the system ensures:
- **Heat Treatment**: 56°C minimum for 30 minutes
- **IPPC Marking**: Required stamps on all wood components
- **Documentation**: Treatment certificates
- **Country-Specific Rules**: Automatic application based on destination

#### Treatment Validation
The system validates:
- Temperature and duration compliance
- Chemical treatment concentrations
- Wood quality requirements
- Marking specifications

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