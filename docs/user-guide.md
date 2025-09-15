# AutoCrate User Guide

## Getting Started

### First Time Setup
1. **Open AutoCrate**: Navigate to the application URL
2. **Review Default Configuration**: The application loads with a sample crate configuration
3. **Explore 3D View**: Use mouse/touch to rotate, zoom, and pan the 3D model
4. **Check Validation**: Review the validation panel for any issues

### Interface Overview
- **Left Panel**: Configuration controls for crate parameters
- **Center Panel**: 3D visualization with interactive controls
- **Right Panel**: Validation results, optimization, and export options

## Configuration

### Product Specifications
Configure the product that will be shipped in the crate:

- **Length (in)**: Product length in inches
- **Width (in)**: Product width in inches  
- **Height (in)**: Product height in inches
- **Weight (lbs)**: Product weight in pounds

**Tips:**
- Use actual product dimensions for accurate crate sizing
- Weight affects lumber grade requirements per Applied Materials standards
- Center of gravity is automatically calculated but can be adjusted

### Clearances
Set internal clearances for handling and protection:

- **Width Clearance**: Minimum 1" per Applied Materials standards
- **Length Clearance**: Minimum 1" per Applied Materials standards
- **Height Clearance**: Minimum 1" per Applied Materials standards

**Best Practices:**
- Use 2" clearances for easier handling
- Increase clearances for fragile products
- Consider forklift access requirements

### Skid Configuration
Configure the skid support system:

- **Count**: Number of skids (auto-calculated based on weight)
- **Pitch**: Distance between skids (typically 16")
- **Front Overhang**: Overhang beyond product front (1-4")
- **Back Overhang**: Overhang beyond product back (1-4")

**Applied Materials Standards:**
- Maximum 1000 lbs per skid
- Minimum 1" overhang, maximum 4" overhang
- Skid size automatically selected based on weight

### Material Specifications
Select materials for construction:

#### Lumber Grade
- **Standard**: For products under 1000 lbs
- **#2**: For products 1000-2000 lbs
- **#1**: For products 2000-3000 lbs
- **Select**: For products over 3000 lbs

#### Plywood Grade
- **CDX**: Standard construction grade
- **BC**: Higher quality, better appearance
- **AC**: Premium grade, smooth finish

#### Hardware Coating
- **Galvanized**: Standard corrosion protection
- **Stainless Steel**: Maximum corrosion resistance
- **Zinc Plated**: Good corrosion protection

## 3D Visualization

### Navigation Controls
- **Rotate**: Left-click and drag to rotate view
- **Zoom**: Mouse wheel or pinch to zoom
- **Pan**: Right-click and drag to pan view
- **Auto Fit**: Click "Auto Fit" button to reset view

### View Options
- **Dimensions**: Toggle dimensional annotations on/off
- **PMI**: Toggle Product Manufacturing Information
- **Exploded**: Separate components for detailed view
- **Measure**: Click-to-measure distances (press Escape to clear)

### Measurement Tools
1. **Enable Measurement**: Check the "Measure" checkbox
2. **Click First Point**: Click on any surface to start measurement
3. **Click Second Point**: Click on another surface to complete measurement
4. **View Distance**: Distance is displayed in inches
5. **Clear Measurements**: Press Escape key to clear all measurements

## Validation

### Real-time Validation
The system continuously validates your configuration against Applied Materials standards:

- **Green Status**: All constraints satisfied
- **Red Status**: Critical issues that must be fixed
- **Warnings**: Recommendations for improvement

### Common Validation Issues

#### Insufficient Clearance
- **Issue**: Clearance below minimum requirement
- **Solution**: Increase clearance to at least 1"

#### Excessive Overhang
- **Issue**: Skid overhang exceeds 4" maximum
- **Solution**: Reduce overhang to 4" or less

#### Insufficient Lumber Grade
- **Issue**: Lumber grade too low for product weight
- **Solution**: Upgrade to required lumber grade

#### Heavy Product Single Skid
- **Warning**: Product weight exceeds single skid capacity
- **Solution**: Increase skid count or use higher grade lumber

## Material Optimization

### Running Optimization
1. **Click "Run Optimization"**: Analyzes current configuration
2. **Review Suggestions**: See cost, weight, and waste improvements
3. **Apply Changes**: Click "Apply" to implement suggestions
4. **Verify Results**: Check validation and 3D view

### Optimization Types

#### Cost Optimization
- **Downgrade Lumber Grade**: Use lower grade for lighter products
- **Reduce Plywood Thickness**: Use thinner plywood when appropriate
- **Optimize Hardware**: Select cost-effective hardware options

#### Weight Optimization
- **Reduce Material Thickness**: Use minimum required thickness
- **Optimize Dimensions**: Minimize overall crate size
- **Efficient Material Usage**: Reduce waste and over-engineering

#### Waste Optimization
- **Standard Dimensions**: Use standard lumber and plywood sizes
- **Efficient Cutting**: Optimize panel dimensions for minimal waste
- **Material Planning**: Plan cuts to maximize material usage

## Export Options

### NX Expressions
Generate NX CAD expressions for parametric modeling:

1. **Click "Export NX Expressions"**
2. **Wait for Generation**: Process takes 2-5 seconds
3. **Download File**: File automatically downloads as .txt
4. **Import to NX**: Use expressions in NX CAD system

**File Contents:**
- Product specifications
- Calculated dimensions
- Skid specifications
- Panel specifications
- Hardware requirements
- Material specifications

### STEP AP242 Export
Export industry-standard CAD file with PMI:

1. **Click "Export STEP File"**
2. **Wait for Processing**: Complex models may take 10-30 seconds
3. **Download File**: File downloads as .stp
4. **Import to CAD**: Use in any STEP-compatible CAD system

**Features:**
- Complete 3D geometry
- Dimensional annotations
- Material specifications
- Manufacturing information

### PDF Drawing
Generate 2D technical drawings:

1. **Click "Export PDF Drawing"**
2. **Wait for Generation**: Process takes 5-10 seconds
3. **Download File**: File downloads as .pdf
4. **Print or Share**: Use for manufacturing or approval

**Contents:**
- Assembly views
- Detail drawings
- Bill of materials
- Manufacturing notes

## Best Practices

### Design Guidelines
1. **Start with Product**: Always begin with accurate product dimensions
2. **Use Standards**: Follow Applied Materials standards for compliance
3. **Optimize Materials**: Use optimization tools to reduce cost and weight
4. **Validate Continuously**: Check validation panel for issues
5. **Review 3D Model**: Use 3D view to verify design

### Performance Tips
1. **Close Unused Tabs**: Keep only necessary browser tabs open
2. **Use Modern Browser**: Chrome, Firefox, or Safari for best performance
3. **Stable Internet**: Ensure stable connection for exports
4. **Regular Saves**: Configuration is auto-saved locally

### Troubleshooting

#### 3D Model Not Loading
- **Refresh Page**: Reload the application
- **Check Browser**: Ensure WebGL is supported
- **Clear Cache**: Clear browser cache and cookies

#### Export Fails
- **Check Validation**: Ensure all constraints are satisfied
- **Try Again**: Retry the export operation
- **Contact Support**: If issues persist

#### Performance Issues
- **Close Other Tabs**: Free up browser memory
- **Restart Browser**: Clear memory and restart
- **Check Internet**: Ensure stable connection

## Advanced Features

### Keyboard Shortcuts
- **Escape**: Clear measurements
- **R**: Reset 3D view
- **F**: Auto-fit view
- **M**: Toggle measurement mode

### Mobile Usage
- **Touch Controls**: Pinch to zoom, drag to rotate
- **Responsive Design**: Optimized for mobile devices
- **Offline Support**: Works without internet after initial load

### Collaboration
- **Share Configuration**: Export and share configuration files
- **Version Control**: Track changes and iterations
- **Team Review**: Use validation results for team review

## Support

### Getting Help
1. **Check Validation**: Review validation messages for guidance
2. **Use Optimization**: Let AI suggest improvements
3. **Review Documentation**: Check this guide for best practices
4. **Contact Support**: Reach out to engineering team

### Common Questions

**Q: Why is my lumber grade automatically changing?**
A: The system enforces Applied Materials standards based on product weight. Heavier products require higher grade lumber.

**Q: Can I override the automatic skid count?**
A: Yes, but the system will warn if the count is insufficient for the product weight.

**Q: How accurate are the material calculations?**
A: Calculations are based on Applied Materials standards and industry best practices. Always verify critical dimensions.

**Q: Can I save my configuration?**
A: Yes, configurations are automatically saved locally in your browser.

**Q: What CAD systems support the exports?**
A: NX expressions work with Siemens NX. STEP files work with most major CAD systems including SolidWorks, Inventor, and Fusion 360.

---

For additional support, contact the AutoCrate engineering team.
