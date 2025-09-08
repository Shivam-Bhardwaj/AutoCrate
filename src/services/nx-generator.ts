import { CrateConfiguration, NXExpression, VentilationConfig } from '@/types/crate';
import type { 
  NXExportOptions, 
  NXExpressionFile, 
  NXParameter, 
  NXExpression as NXExpr, 
  NXFeature 
} from '@/types/nx';
import { AppliedMaterialsStandardsService } from './appliedMaterialsStandards';

export class NXExpressionGenerator {
  config: CrateConfiguration;
  options: NXExportOptions;
  amatsService: AppliedMaterialsStandardsService;

  constructor(config: CrateConfiguration, options?: NXExportOptions) {
    this.config = config;
    this.options = options || this.getDefaultOptions();
    this.amatsService = new AppliedMaterialsStandardsService(config);
  }

  generateExpression(): NXExpression {
    const { dimensions, base, cap, fasteners, weight, vinyl } = this.config;

    const variables: Record<string, number | string> = {
      // Main dimensions
      crate_length: dimensions.length,
      crate_width: dimensions.width,
      crate_height: dimensions.height,

      // Base configuration
      base_type: base.type,
      floorboard_thickness: base.floorboardThickness,
      skid_height: base.skidHeight,
      skid_width: base.skidWidth,
      skid_count: base.skidCount,
      base_material: base.material,

      // Panel thicknesses
      top_panel_thickness: cap.topPanel.thickness,
      front_panel_thickness: cap.frontPanel.thickness,
      back_panel_thickness: cap.backPanel.thickness,
      left_panel_thickness: cap.leftPanel.thickness,
      right_panel_thickness: cap.rightPanel.thickness,

      // Fasteners
      fastener_type: fasteners.type,
      fastener_size: fasteners.size,
      fastener_spacing: fasteners.spacing,
      fastener_material: fasteners.material,

      // Weight
      product_weight: weight.product,

      // Center of Gravity
      cog_x: this.config.centerOfGravity?.combinedCoG?.x ?? 0,
      cog_y: this.config.centerOfGravity?.combinedCoG?.y ?? 0,
      cog_z: this.config.centerOfGravity?.combinedCoG?.z ?? 0,
      cog_product_x: this.config.centerOfGravity?.productCoG?.x ?? 0,
      cog_product_y: this.config.centerOfGravity?.productCoG?.y ?? 0,
      cog_product_z: this.config.centerOfGravity?.productCoG?.z ?? 0,

      // Header and Rail Configuration
      header_size: this.config.headerRailConfig?.headers.size ?? '2x6',
      header_count: this.config.headerRailConfig?.headers.count ?? 2,
      header_spacing: this.config.headerRailConfig?.headers.spacing ?? 0,
      rail_size: this.config.headerRailConfig?.rails.size ?? '2x6',
      rail_count: this.config.headerRailConfig?.rails.count ?? 3,
      rail_spacing: this.config.headerRailConfig?.rails.spacing ?? 24,

      // Vinyl
      vinyl_enabled: vinyl?.enabled ? 1 : 0,
      vinyl_thickness: vinyl?.thickness ?? 0,
      vinyl_type: vinyl?.type ?? 'none',
      vinyl_coverage: vinyl?.coverage ?? 'none',
    };

    const features = this.generateFeatures();
    const constraints = this.generateConstraints();
    const code = this.generateNXCode();

    return {
      variables,
      features,
      constraints,
      code,
    };
  }

  private generateFeatures(): string[] {
    const features: string[] = [];
    const { dimensions, base, cap } = this.config;

    // Base features - Z-up coordinate system
    // BASE_SKID: X=length, Y=width, Z=skidHeight
    features.push(
      `BLOCK/BASE_SKID = BLOCK(0,0,0,${dimensions.length},${dimensions.width},${base.skidHeight})`
    );

    // FLOOR: X=length, Y=width, Z=floorboardThickness (positioned at skidHeight)
    features.push(
      `BLOCK/FLOOR = BLOCK(0,0,${base.skidHeight},${dimensions.length},${dimensions.width},${base.floorboardThickness})`
    );

    // Panel features
    const baseHeight = base.skidHeight + base.floorboardThickness;

    // Front panel - positioned at front edge (Y=-width/2+thickness/2, facing viewer)
    // X=length, Y=thickness, Z=height
    features.push(
      `BLOCK/FRONT_PANEL = BLOCK(0,${-dimensions.width / 2 + cap.frontPanel.thickness / 2},${baseHeight},${dimensions.length},${cap.frontPanel.thickness},${dimensions.height})`
    );

    // Back panel - positioned at back edge (Y=width/2-thickness/2, away from viewer)
    // X=length, Y=thickness, Z=height
    features.push(
      `BLOCK/BACK_PANEL = BLOCK(0,${dimensions.width / 2 - cap.backPanel.thickness / 2},${baseHeight},${dimensions.length},${cap.backPanel.thickness},${dimensions.height})`
    );

    // Left panel - positioned at left edge (X=-length/2+thickness/2)
    // X=thickness, Y=width, Z=height
    features.push(
      `BLOCK/LEFT_PANEL = BLOCK(${-dimensions.length / 2 + cap.leftPanel.thickness / 2},0,${baseHeight},${cap.leftPanel.thickness},${dimensions.width},${dimensions.height})`
    );

    // Right panel - positioned at right edge (X=length/2-thickness/2)
    // X=thickness, Y=width, Z=height
    features.push(
      `BLOCK/RIGHT_PANEL = BLOCK(${dimensions.length / 2 - cap.rightPanel.thickness / 2},0,${baseHeight},${cap.rightPanel.thickness},${dimensions.width},${dimensions.height})`
    );

    // Top panel - positioned at top (Z=baseHeight+height-thickness/2)
    // X=length, Y=width, Z=thickness
    features.push(
      `BLOCK/TOP_PANEL = BLOCK(0,0,${baseHeight + dimensions.height - cap.topPanel.thickness / 2},${dimensions.length},${dimensions.width},${cap.topPanel.thickness})`
    );

    // Cleat features
    const cleatSize = 2; // 2 inches
    const cleatHeight = dimensions.height * 0.8;
    features.push(
      `BLOCK/CLEAT_FL = BLOCK(0,0,${baseHeight},${cleatSize},${cleatSize},${cleatHeight})`
    );
    features.push(
      `BLOCK/CLEAT_FR = BLOCK(${dimensions.length - cleatSize},0,${baseHeight},${cleatSize},${cleatSize},${cleatHeight})`
    );
    features.push(
      `BLOCK/CLEAT_BL = BLOCK(0,${dimensions.width - cleatSize},${baseHeight},${cleatSize},${cleatSize},${cleatHeight})`
    );
    features.push(
      `BLOCK/CLEAT_BR = BLOCK(${dimensions.length - cleatSize},${dimensions.width - cleatSize},${baseHeight},${cleatSize},${cleatSize},${cleatHeight})`
    );

    // Ventilation features
    if (cap.frontPanel.ventilation?.enabled) {
      features.push(this.generateVentilationFeature('FRONT', cap.frontPanel.ventilation));
    }

    return features;
  }

  private generateVentilationFeature(panel: string, ventConfig: VentilationConfig): string {
    const { type, count, size } = ventConfig;
    if (type === 'holes') {
      return `HOLE/${panel}_VENT = SIMPLE_HOLE(${size}, ${count}, PATTERN=RECTANGULAR)`;
    } else if (type === 'slots') {
      return `SLOT/${panel}_VENT = RECTANGULAR_SLOT(${size}, ${size * 3}, ${count})`;
    }
    return '';
  }

  private generateConstraints(): string[] {
    const constraints: string[] = [];
    const { weight } = this.config;

    constraints.push(`CONSTRAINT/MIN_WALL_THICKNESS = 12`);
    constraints.push(`CONSTRAINT/PRODUCT_WEIGHT = ${weight.product}`);
    constraints.push(`CONSTRAINT/ESTIMATED_GROSS_WEIGHT = ${weight.product * 1.2}`);

    // Structural constraints
    constraints.push(`CONSTRAINT/MIN_SKID_HEIGHT = 75`);
    constraints.push(`CONSTRAINT/MIN_PANEL_THICKNESS = 9`);

    return constraints;
  }

  private generateNXCode(): string {
    const { base, cap, fasteners, weight } = this.config;
    const dimensions = this.config.dimensions;

    let code = `// AutoCrate NX Expression File
// Generated: ${new Date().toISOString()}

// ===============================================================
// IMPLEMENTATION GUIDE:
// 1. Import this file in NX: Tools -> Expression -> Import
// 2. Create components using Insert -> Design Feature -> Block
// 3. Use the two-point diagonal method for each component:
//    Point 1: Lower-left-back corner (x1, y1, z1)
//    Point 2: Upper-right-front corner (x2, y2, z2)
// 
// COORDINATE SYSTEM:
// Origin (0,0,0): Center of base at ground level
// X-axis: Length direction (left to right)
// Y-axis: Width direction (back to front)  
// Z-axis: Height direction (bottom to top)
// ===============================================================

// ===== PARAMETERS =====
// Dimensions (inches)
p0 = ${dimensions.length} // Length (inches)
p1 = ${dimensions.width} // Width (inches)
p2 = ${dimensions.height} // Height (inches)

// Base Configuration
p10 = ${base.skidHeight} // Skid Height
p11 = ${base.skidWidth} // Skid Width
p12 = ${base.skidCount} // Number of Skids
p13 = ${base.floorboardThickness} // Floorboard Thickness

// Panel Thicknesses
p20 = ${cap.topPanel.thickness} // Top Panel
p21 = ${cap.frontPanel.thickness} // Front Panel
p22 = ${cap.backPanel.thickness} // Back Panel
p23 = ${cap.leftPanel.thickness} // Left Panel
p24 = ${cap.rightPanel.thickness} // Right Panel

// Fastener Configuration
p30 = ${fasteners.spacing} // Fastener Spacing

// Product Weight
p40 = ${weight.product} // Product Weight (lbs)

// Center of Gravity
p41 = ${this.config.centerOfGravity?.combinedCoG?.x ?? 0} // Combined CoG X (inches)
p42 = ${this.config.centerOfGravity?.combinedCoG?.y ?? 0} // Combined CoG Y (inches)
p43 = ${this.config.centerOfGravity?.combinedCoG?.z ?? 0} // Combined CoG Z (inches)
p44 = ${this.config.centerOfGravity?.productCoG?.x ?? 0} // Product CoG X (inches)
p45 = ${this.config.centerOfGravity?.productCoG?.y ?? 0} // Product CoG Y (inches)
p46 = ${this.config.centerOfGravity?.productCoG?.z ?? 0} // Product CoG Z (inches)

// Header and Rail Configuration
p47 = ${this.config.headerRailConfig?.headers.count ?? 2} // Header Count
p48 = ${this.config.headerRailConfig?.rails.count ?? 3} // Rail Count
p49 = ${this.config.headerRailConfig?.rails.spacing ?? 24} // Rail Spacing (inches)

// ===== EXPRESSIONS =====
// Calculated Values
total_height = p2 + p10 + p13
interior_length = p0 - p23 - p24
interior_width = p1 - p21 - p22
interior_height = p2 - p13 - p20

// Material Volume Calculations
base_volume = p0 * p1 * p13
skid_volume = p12 * p0 * p11 * p10
panel_volume = (2 * p0 * p2 * p21) + (2 * p1 * p2 * p23) + (p0 * p1 * p20)

total_wood_volume = base_volume + skid_volume + panel_volume

// Center of Gravity Calculations
cog_stability_ratio = p43 / p2 // CoG height as ratio of total height
cog_center_offset_x = abs(p41 - p0/2) / (p0/2) // X offset from center as ratio
cog_center_offset_y = abs(p42 - p1/2) / (p1/2) // Y offset from center as ratio

// CoG Marking Positions (for labeling on crate surfaces)
cog_mark_top_x = p41 // Top surface projection
cog_mark_top_y = p42
cog_mark_front_x = p41 // Front surface projection
cog_mark_front_y = p43
cog_mark_side_x = p42 // Side surface projection
cog_mark_side_y = p43

// Header and Rail Calculations
header_positions = for i = 1 to p47
  header_pos_#i = (i-1) * (p0 / (p47 - 1))
end_for

rail_positions = for i = 1 to p48
  rail_pos_#i = (i-1) * p49
end_for

// ===== FEATURE CREATION =====
// Each component is defined by two diagonal corner points for uniform construction
// This minimizes parameters and simplifies modifications

// Create Base (Floorboard) - Z-up coordinate system
// Point 1: (0, 0, skid_height) - Lower corner
// Point 2: (length, width, skid_height + floor_thickness) - Upper corner
BLOCK/CREATE_BASE
  LENGTH = p0
  WIDTH = p1
  HEIGHT = p13
  POSITION = (0, 0, p10)
END_BLOCK

// Create Skids (Support beams under base) - Z-up coordinate system
// Each skid uses two-point definition
// Point 1: (0, skid_position, 0) - Ground level
// Point 2: (length, skid_position + skid_width, skid_height)
FOR i = 1 TO p12
  BLOCK/CREATE_SKID_#i
    LENGTH = p0
    WIDTH = p11
    HEIGHT = p10
    POSITION = (0, (i-1) * (p1/p12), 0)
  END_BLOCK
END_FOR

// Create Panels using Two-Point Box Method
// Each panel is a box defined by diagonal corners

// Front Panel - Faces user/operator (Z-up coordinate system)
// Point 1: (0, width/2 - thickness/2, base_height)
// Point 2: (length, width/2 + thickness/2, base_height + height)
BLOCK/CREATE_FRONT_PANEL
  LENGTH = p0
  WIDTH = p21
  HEIGHT = p2
  POSITION = (0, p1/2 - p21/2, p10 + p13)
END_BLOCK

// Back Panel - Opposite to front (Z-up coordinate system)
// Point 1: (0, -width/2 + thickness/2, base_height)
// Point 2: (length, -width/2 + thickness/2 + thickness, base_height + height)
BLOCK/CREATE_BACK_PANEL
  LENGTH = p0
  WIDTH = p22
  HEIGHT = p2
  POSITION = (0, -p1/2 + p22/2, p10 + p13)
END_BLOCK

// Left Panel - When facing front (Z-up coordinate system)
// Point 1: (-length/2 + thickness/2, 0, base_height)
// Point 2: (-length/2 + thickness/2 + thickness, width, base_height + height)
BLOCK/CREATE_LEFT_PANEL
  LENGTH = p23
  WIDTH = p1
  HEIGHT = p2
  POSITION = (-p0/2 + p23/2, 0, p10 + p13)
END_BLOCK

// Right Panel - When facing front (Z-up coordinate system)
// Point 1: (length/2 - thickness/2, 0, base_height)
// Point 2: (length/2 - thickness/2 + thickness, width, base_height + height)
BLOCK/CREATE_RIGHT_PANEL
  LENGTH = p24
  WIDTH = p1
  HEIGHT = p2
  POSITION = (p0/2 - p24/2, 0, p10 + p13)
END_BLOCK

// Top Panel - Lid/Cover (Z-up coordinate system)
// Point 1: (0, 0, base_height + height - thickness/2)
// Point 2: (length, width, base_height + height - thickness/2 + thickness)
BLOCK/CREATE_TOP_PANEL
  LENGTH = p0
  WIDTH = p1
  HEIGHT = p20
  POSITION = (0, 0, p10 + p13 + p2 - p20/2)
END_BLOCK
`;

    // Add ventilation code if enabled
    if (cap.frontPanel.ventilation?.enabled) {
      code += `
 // Ventilation Features
 PATTERN/FRONT_VENTILATION
   TYPE = ${cap.frontPanel.ventilation.type.toUpperCase()}
   COUNT = ${cap.frontPanel.ventilation.count}
   SIZE = ${cap.frontPanel.ventilation.size}
   TARGET = FRONT_PANEL
 END_PATTERN
 `;
    }

    // Add vinyl wrap if enabled
    if (this.config.vinyl?.enabled) {
      code += `
 // Vinyl Wrap
 VINYL_WRAP
   THICKNESS = ${this.config.vinyl?.thickness ?? 0}
   TYPE = ${this.config.vinyl?.type?.toUpperCase() ?? 'NONE'}
   COVERAGE = ${this.config.vinyl?.coverage?.toUpperCase() ?? 'NONE'}
   APPLY_TO = EXTERIOR_SURFACES
 END_VINYL_WRAP
 `;
    }

    // Add fastener placement
    code += `
 // Fastener Placement
 PATTERN/FASTENER_LAYOUT
   TYPE = ${fasteners.type.toUpperCase()}
   SIZE = ${fasteners.size}
   SPACING = p30
   MATERIAL = ${fasteners.material.toUpperCase()}
   APPLY_TO = ALL_EDGES
 END_PATTERN

 // ===== CENTER OF GRAVITY INFORMATION =====
 // Combined CoG: (p41, p42, p43) inches from origin
 // Product CoG: (p44, p45, p46) inches from origin
 // Stability Ratio: cog_stability_ratio (should be < 0.6 for stability)
 // Center Offsets: cog_center_offset_x, cog_center_offset_y (should be < 0.1 for stability)
 // Marking Positions:
 //   Top: (cog_mark_top_x, cog_mark_top_y)
 //   Front: (cog_mark_front_x, cog_mark_front_y)
 //   Side: (cog_mark_side_x, cog_mark_side_y)

 // ===== HEADER AND RAIL CONFIGURATION =====
 // Headers: p47 total, positioned at header_pos_1 through header_pos_#p47
 // Rails: p48 total, spaced p49 inches apart, positioned at rail_pos_1 through rail_pos_#p48
 // Header Size: Based on crate dimensions and weight per AMAT specifications
 // Rail Spacing: Maximum 24" centers per AMAT standards

 // ===== ASSEMBLY NOTES =====
 // 1. Components automatically align due to parametric relationships
 // 2. Modify parameters p0-p49 to adjust dimensions, CoG, and header/rail config
 // 3. All dimensions in inches
 // 4. Use Expression Editor for quick iterations
 // 5. CoG parameters update automatically when product position changes
 // 6. Header/rail configuration follows AMAT standards for structural integrity
 //
 // For detailed instructions, see the Instructions tab in AutoCrate
 // ===== END OF EXPRESSION FILE =====`;

    return code;
  }

  exportToFile(): Blob {
    const expression = this.generateExpression();
    const content = expression.code;
    return new Blob([content], { type: 'text/plain' });
  }

  exportToString(): string {
    const expression = this.generateExpression();
    const { variables, features, constraints, code } = expression;

    let output = '// NX Expression Export\n';
    output += '// Generated by AutoCrate\n\n';

    output += '// ===== Variables =====\n';
    for (const [key, value] of Object.entries(variables)) {
      output += `${key} = ${value}\n`;
    }

    output += '\n// ===== Features =====\n';
    features.forEach((feature) => {
      output += `${feature}\n`;
    });

    output += '\n// ===== Constraints =====\n';
    constraints.forEach((constraint) => {
      output += `${constraint}\n`;
    });

    output += '\n// ===== Full NX Code =====\n';
    output += code;

    return output;
  }

  generateNX2022ExpressionFile(): NXExpressionFile {
    const parameters = this.generateNX2022Parameters();
    const expressions = this.generateNX2022Expressions();
    const features = this.generateNX2022Features();

    return {
      parameters,
      expressions,
      features
    };
  }

  private getDefaultOptions(): NXExportOptions {
    return {
      format: 'exp',
      version: '2022',
      includeAssembly: true,
      includeDrawings: false,
      applyMaterialsStandards: true,
      partNumberPrefix: '0205'
    };
  }

  private generateNX2022Parameters(): NXParameter[] {
    const params: NXParameter[] = [];
    const { dimensions, weight, cap } = this.config;
    const { width, height, length } = dimensions;
    const depth = length; // CrateDimensions uses 'length' for depth
    const weightCapacity = weight.product;
    const hasTop = cap.topPanel ? true : false;

    // Primary dimensions
    params.push(
      { name: 'CRATE_WIDTH', type: 'length', value: width, units: 'inches', description: 'Overall crate width' },
      { name: 'CRATE_DEPTH', type: 'length', value: depth, units: 'inches', description: 'Overall crate depth' },
      { name: 'CRATE_HEIGHT', type: 'length', value: height, units: 'inches', description: 'Overall crate height' },
      { name: 'WEIGHT_CAPACITY', type: 'real', value: weightCapacity, units: 'pounds', description: 'Maximum weight capacity' },
      { name: 'HAS_TOP', type: 'integer', value: hasTop ? 1 : 0, description: 'Top panel enabled (1=yes, 0=no)' }
    );

    // Material specifications
    params.push(
      { name: 'LUMBER_THICKNESS', type: 'length', value: 1.5, units: 'inches', description: '2x4 actual thickness' },
      { name: 'LUMBER_WIDTH', type: 'length', value: 3.5, units: 'inches', description: '2x4 actual width' },
      { name: 'PLYWOOD_THICKNESS', type: 'length', value: 0.75, units: 'inches', description: '3/4" plywood thickness' }
    );

    // Applied Materials specific parameters
    if (this.options.applyMaterialsStandards) {
      const partNumber = this.amatsService.generatePartNumber();
      const tcNumber = this.amatsService.generateTCNumber();

      params.push(
        { name: 'PART_NUMBER', type: 'string', value: partNumber, description: 'Applied Materials part number' },
        { name: 'TC_NUMBER', type: 'string', value: tcNumber.fullNumber, description: 'TC Engineering number' },
        { name: 'DRAWING_SCALE', type: 'string', value: this.calculateOptimalScale(), description: 'Drawing scale' }
      );
    }

    // Center of gravity parameters
    if (this.config.centerOfGravity?.combinedCoG) {
      const cog = this.config.centerOfGravity.combinedCoG;
      params.push(
        { name: 'COG_X', type: 'length', value: cog.x, units: 'inches', description: 'Center of gravity X coordinate' },
        { name: 'COG_Y', type: 'length', value: cog.y, units: 'inches', description: 'Center of gravity Y coordinate' },
        { name: 'COG_Z', type: 'length', value: cog.z, units: 'inches', description: 'Center of gravity Z coordinate' }
      );
    }

    return params;
  }

  private generateNX2022Expressions(): NXExpr[] {
    const expressions: NXExpr[] = [];

    // Interior dimensions
    expressions.push(
      { name: 'INTERIOR_WIDTH', formula: 'CRATE_WIDTH - 2 * PLYWOOD_THICKNESS', description: 'Internal width' },
      { name: 'INTERIOR_DEPTH', formula: 'CRATE_DEPTH - 2 * PLYWOOD_THICKNESS', description: 'Internal depth' },
      { name: 'INTERIOR_HEIGHT', formula: 'CRATE_HEIGHT - 2 * PLYWOOD_THICKNESS', description: 'Internal height' }
    );

    // Volume calculations
    expressions.push(
      { name: 'INTERIOR_VOLUME', formula: 'INTERIOR_WIDTH * INTERIOR_DEPTH * INTERIOR_HEIGHT', description: 'Internal cubic inches' },
      { name: 'LUMBER_VOLUME', formula: 'this.calculateLumberVolume()', description: 'Total lumber volume' },
      { name: 'PLYWOOD_AREA', formula: 'this.calculatePlywoodArea()', description: 'Total plywood area' }
    );

    // Weight calculations
    expressions.push(
      { name: 'ESTIMATED_CRATE_WEIGHT', formula: '(LUMBER_VOLUME * 32) + (PLYWOOD_AREA * 2.25)', description: 'Estimated crate weight in pounds' },
      { name: 'TOTAL_WEIGHT', formula: 'ESTIMATED_CRATE_WEIGHT + WEIGHT_CAPACITY', description: 'Total loaded weight' }
    );

    // Stability calculations
    if (this.config.centerOfGravity?.combinedCoG) {
      expressions.push(
        { name: 'COG_HEIGHT_RATIO', formula: 'COG_Z / CRATE_HEIGHT', description: 'CoG height as ratio of total height' },
        { name: 'COG_OFFSET_X', formula: 'abs(COG_X - CRATE_WIDTH/2) / (CRATE_WIDTH/2)', description: 'X offset from center' },
        { name: 'COG_OFFSET_Y', formula: 'abs(COG_Y - CRATE_DEPTH/2) / (CRATE_DEPTH/2)', description: 'Y offset from center' },
        { name: 'STABILITY_FACTOR', formula: '1 / (COG_HEIGHT_RATIO + COG_OFFSET_X + COG_OFFSET_Y)', description: 'Overall stability factor' }
      );
    }

    return expressions;
  }

  private generateNX2022Features(): NXFeature[] {
    const features: NXFeature[] = [];

    // Base/Floor feature
    features.push({
      type: 'block',
      parameters: {
        name: 'CRATE_FLOOR',
        origin: [0, 0, 0],
        dimensions: ['CRATE_WIDTH', 'CRATE_DEPTH', 'PLYWOOD_THICKNESS'],
        material: 'CDX_PLYWOOD'
      },
      constraints: [
        { type: 'distance', entities: ['ORIGIN', 'FLOOR_CORNER'], value: 0 }
      ]
    });

    // Wall features
    const walls = [
      { name: 'FRONT_WALL', position: [0, 'CRATE_DEPTH - PLYWOOD_THICKNESS', 'PLYWOOD_THICKNESS'], size: ['CRATE_WIDTH', 'PLYWOOD_THICKNESS', 'CRATE_HEIGHT - PLYWOOD_THICKNESS'] },
      { name: 'BACK_WALL', position: [0, 0, 'PLYWOOD_THICKNESS'], size: ['CRATE_WIDTH', 'PLYWOOD_THICKNESS', 'CRATE_HEIGHT - PLYWOOD_THICKNESS'] },
      { name: 'LEFT_WALL', position: [0, 'PLYWOOD_THICKNESS', 'PLYWOOD_THICKNESS'], size: ['PLYWOOD_THICKNESS', 'CRATE_DEPTH - 2 * PLYWOOD_THICKNESS', 'CRATE_HEIGHT - PLYWOOD_THICKNESS'] },
      { name: 'RIGHT_WALL', position: ['CRATE_WIDTH - PLYWOOD_THICKNESS', 'PLYWOOD_THICKNESS', 'PLYWOOD_THICKNESS'], size: ['PLYWOOD_THICKNESS', 'CRATE_DEPTH - 2 * PLYWOOD_THICKNESS', 'CRATE_HEIGHT - PLYWOOD_THICKNESS'] }
    ];

    walls.forEach(wall => {
      features.push({
        type: 'block',
        parameters: {
          name: wall.name,
          origin: wall.position,
          dimensions: wall.size,
          material: 'CDX_PLYWOOD'
        },
        constraints: [
          { type: 'distance', entities: [wall.name, 'CRATE_FLOOR'], value: 0 }
        ]
      });
    });

    // Top feature (if enabled)
    if ((this.config.cap.topPanel ? true : false)) {
      features.push({
        type: 'block',
        parameters: {
          name: 'CRATE_TOP',
          origin: [0, 0, 'CRATE_HEIGHT - PLYWOOD_THICKNESS'],
          dimensions: ['CRATE_WIDTH', 'CRATE_DEPTH', 'PLYWOOD_THICKNESS'],
          material: 'CDX_PLYWOOD'
        },
        constraints: [
          { type: 'distance', entities: ['CRATE_TOP', 'CRATE_FLOOR'], value: this.config.dimensions.height - 0.75 }
        ]
      });
    }

    // Skid features
    const skidSpacing = this.calculateSkidSpacing();
    const skidCount = this.calculateSkidCount();
    
    for (let i = 0; i < skidCount; i++) {
      const skidPosition = i * skidSpacing;
      features.push({
        type: 'block',
        parameters: {
          name: `SKID_${i + 1}`,
          origin: [0, skidPosition, -3.5],
          dimensions: ['CRATE_WIDTH', 'LUMBER_WIDTH', 'LUMBER_THICKNESS'],
          material: 'DOUGLAS_FIR_LUMBER'
        },
        constraints: [
          { type: 'distance', entities: [`SKID_${i + 1}`, 'GROUND_PLANE'], value: 0 }
        ]
      });
    }

    return features;
  }

  generateNX2022Code(): string {
    const expressionFile = this.generateNX2022ExpressionFile();
    const partNumber = this.options.applyMaterialsStandards ? this.amatsService.generatePartNumber() : 'AUTOCRATE-001';
    const tcNumber = this.options.applyMaterialsStandards ? this.amatsService.generateTCNumber().fullNumber : 'TC-AUTOCRATE';

    const code = [
      '! NX 2022 Expression File',
      '! Generated by AutoCrate Professional',
      `! Part Number: ${partNumber}`,
      `! TC Number: ${tcNumber}`,
      `! Generated: ${new Date().toISOString()}`,
      '! ASME Y14.5-2009 Compliant',
      '! Applied Materials Standards',
      '',
      '! ===============================================',
      '! NX 2022 SPECIFIC FEATURES:',
      '! - Enhanced parametric modeling',
      '! - Improved expression syntax',
      '! - Advanced constraint handling',
      '! - Multi-body part support',
      '! - Synchronous technology integration',
      '! ===============================================',
      '',
      '! VERSION COMPATIBILITY',
      'NX_VERSION = 2022',
      'TEMPLATE_VERSION = "2022.0.0"',
      'UNITS = INCHES',
      'MODELING_SPACE = "SYNCHRONOUS"',
      '',
      '! PART INFORMATION',
      `PART_NAME = "${partNumber}"`,
      `TC_NUMBER = "${tcNumber}"`,
      'MATERIAL_STANDARD = "APPLIED_MATERIALS"',
      'DRAWING_STANDARD = "ASME_Y14_5_2009"',
      '',
      '! ===== PARAMETERS =====',
      ...expressionFile.parameters.map(param => 
        `${param.name} = ${param.value} ! ${param.description || ''}`
      ),
      '',
      '! ===== EXPRESSIONS =====',
      ...expressionFile.expressions.map(expr => 
        `${expr.name} = ${expr.formula} ! ${expr.description || ''}`
      ),
      '',
      '! ===== FEATURE DEFINITIONS =====',
      '! Using NX 2022 enhanced block creation syntax',
      '',
      '! Base Structure',
      'FEATURE CRATE_BASE',
      '  TYPE = BLOCK',
      '  METHOD = "TWO_POINT_DIAGONAL"',
      '  POINT_1 = (0, 0, 0)',
      '  POINT_2 = (CRATE_WIDTH, CRATE_DEPTH, PLYWOOD_THICKNESS)',
      '  MATERIAL = "CDX_PLYWOOD_3_4"',
      '  COLOR = RGB(139, 115, 85) ! Wood brown',
      'END_FEATURE',
      '',
      '! Wall Structures',
      'FEATURE FRONT_WALL',
      '  TYPE = BLOCK',
      '  METHOD = "TWO_POINT_DIAGONAL"',
      '  POINT_1 = (0, CRATE_DEPTH - PLYWOOD_THICKNESS, PLYWOOD_THICKNESS)',
      '  POINT_2 = (CRATE_WIDTH, CRATE_DEPTH, CRATE_HEIGHT)',
      '  MATERIAL = "CDX_PLYWOOD_3_4"',
      '  COLOR = RGB(139, 115, 85)',
      '  CONSTRAINT = MATE_TO(CRATE_BASE)',
      'END_FEATURE',
      '',
      'FEATURE BACK_WALL',
      '  TYPE = BLOCK',
      '  METHOD = "TWO_POINT_DIAGONAL"',
      '  POINT_1 = (0, 0, PLYWOOD_THICKNESS)',
      '  POINT_2 = (CRATE_WIDTH, PLYWOOD_THICKNESS, CRATE_HEIGHT)',
      '  MATERIAL = "CDX_PLYWOOD_3_4"',
      '  COLOR = RGB(139, 115, 85)',
      '  CONSTRAINT = MATE_TO(CRATE_BASE)',
      'END_FEATURE',
      '',
      'FEATURE LEFT_WALL',
      '  TYPE = BLOCK',
      '  METHOD = "TWO_POINT_DIAGONAL"',
      '  POINT_1 = (0, PLYWOOD_THICKNESS, PLYWOOD_THICKNESS)',
      '  POINT_2 = (PLYWOOD_THICKNESS, CRATE_DEPTH - PLYWOOD_THICKNESS, CRATE_HEIGHT)',
      '  MATERIAL = "CDX_PLYWOOD_3_4"',
      '  COLOR = RGB(139, 115, 85)',
      '  CONSTRAINT = MATE_TO(CRATE_BASE)',
      'END_FEATURE',
      '',
      'FEATURE RIGHT_WALL',
      '  TYPE = BLOCK',
      '  METHOD = "TWO_POINT_DIAGONAL"',
      '  POINT_1 = (CRATE_WIDTH - PLYWOOD_THICKNESS, PLYWOOD_THICKNESS, PLYWOOD_THICKNESS)',
      '  POINT_2 = (CRATE_WIDTH, CRATE_DEPTH - PLYWOOD_THICKNESS, CRATE_HEIGHT)',
      '  MATERIAL = "CDX_PLYWOOD_3_4"',
      '  COLOR = RGB(139, 115, 85)',
      '  CONSTRAINT = MATE_TO(CRATE_BASE)',
      'END_FEATURE'
    ];

    // Add top panel if enabled
    if ((this.config.cap.topPanel ? true : false)) {
      code.push(
        '',
        'FEATURE CRATE_TOP',
        '  TYPE = BLOCK',
        '  METHOD = "TWO_POINT_DIAGONAL"',
        '  POINT_1 = (0, 0, CRATE_HEIGHT - PLYWOOD_THICKNESS)',
        '  POINT_2 = (CRATE_WIDTH, CRATE_DEPTH, CRATE_HEIGHT)',
        '  MATERIAL = "CDX_PLYWOOD_3_4"',
        '  COLOR = RGB(139, 115, 85)',
        '  CONSTRAINT = DISTANCE_TO(CRATE_BASE, CRATE_HEIGHT - PLYWOOD_THICKNESS)',
        'END_FEATURE'
      );
    }

    // Add skid structures
    const skidCount = this.calculateSkidCount();
    const skidSpacing = this.calculateSkidSpacing();
    
    code.push('', '! Skid Structure (Support Beams)');
    for (let i = 0; i < skidCount; i++) {
      const yPosition = i * skidSpacing;
      code.push(
        `FEATURE SKID_RUNNER_${i + 1}`,
        '  TYPE = BLOCK',
        '  METHOD = "TWO_POINT_DIAGONAL"',
        `  POINT_1 = (0, ${yPosition}, -LUMBER_THICKNESS)`,
        `  POINT_2 = (CRATE_WIDTH, ${yPosition + 3.5}, 0)`,
        '  MATERIAL = "DOUGLAS_FIR_2X4"',
        '  COLOR = RGB(160, 130, 98) ! Natural lumber',
        '  CONSTRAINT = MATE_TO(GROUND_PLANE)',
        'END_FEATURE',
        ''
      );
    }

    // Add material definitions
    code.push(
      '! ===== MATERIAL DEFINITIONS =====',
      'MATERIAL CDX_PLYWOOD_3_4',
      '  DENSITY = 36.0 ! lb/ft³',
      '  GRADE = "CDX Exterior"',
      '  THICKNESS = 0.75 ! inches',
      '  SPECIES = "Douglas Fir"',
      '  STANDARD = "PS1-19"',
      '  SUPPLIER = "Pre-approved supplier"',
      'END_MATERIAL',
      '',
      'MATERIAL DOUGLAS_FIR_2X4',
      '  DENSITY = 32.0 ! lb/ft³',
      '  GRADE = "Construction"',
      '  ACTUAL_SIZE = "1.5 x 3.5 inches"',
      '  SPECIES = "Douglas Fir"',
      '  MOISTURE_CONTENT = "19% max"',
      '  TREATMENT = "Kiln Dried"',
      '  STANDARD = "WWPA Grading Rules"',
      'END_MATERIAL'
    );

    // Add Applied Materials specific information
    if (this.options.applyMaterialsStandards) {
      code.push(
        '',
        '! ===== APPLIED MATERIALS STANDARDS =====',
        'COMPLIANCE_STANDARDS = [',
        '  "ASME Y14.5-2009",',
        '  "ISPM-15",',
        '  "Applied Materials Packaging Spec",',
        '  "RoHS Directive 2011/65/EU"',
        ']',
        '',
        'QUALITY_REQUIREMENTS = [',
        '  "Material certifications required",',
        '  "ISPM-15 heat treatment stamp",',
        '  "Supplier quality audits",',
        '  "Incoming inspection required"',
        ']',
        '',
        '! Drawing Information',
        'TITLE_BLOCK_INFO = [',
        `  PART_NUMBER: "${partNumber}",`,
        `  TC_NUMBER: "${tcNumber}",`,
        '  DRAWN_BY: "AutoCrate Engineering",',
        '  CHECKED_BY: "AMAT Quality",',
        '  APPROVED_BY: "AMAT Engineering Manager",',
        `  SCALE: "${this.calculateOptimalScale()}",`,
        '  PROJECTION: "Third Angle",',
        '  STANDARD: "ASME Y14.5-2009"',
        ']'
      );
    }

    // Add center of gravity information
    if (this.config.centerOfGravity?.combinedCoG) {
      const cog = this.config.centerOfGravity.combinedCoG;
      code.push(
        '',
        '! ===== CENTER OF GRAVITY INFORMATION =====',
        `COG_POSITION = (${cog.x}, ${cog.y}, ${cog.z}) ! inches from origin`,
        'COG_STABILITY_CHECK = (COG_HEIGHT_RATIO < 0.6) ! Stability requirement',
        'COG_MARKING_REQUIRED = TRUE ! Mark CoG on finished crate',
        '',
        '! CoG Marking Positions',
        `COG_TOP_MARK = (${cog.x}, ${cog.y}) ! Top surface`,
        `COG_FRONT_MARK = (${cog.x}, ${cog.z}) ! Front surface`,
        `COG_SIDE_MARK = (${cog.y}, ${cog.z}) ! Side surface`
      );
    }

    code.push(
      '',
      '! ===== ASSEMBLY NOTES =====',
      '! 1. All features use synchronous modeling for flexibility',
      '! 2. Parameters automatically update related features',
      '! 3. Constraints maintain design intent during modifications',
      '! 4. Materials follow Applied Materials specifications',
      '! 5. All dimensions in inches per AMAT standards',
      '',
      '! ===== MANUFACTURING INSTRUCTIONS =====',
      '! 1. Cut lumber to length with square ends',
      '! 2. Pre-drill fastener holes to prevent splitting',
      '! 3. Apply construction adhesive at all joints',
      '! 4. Install fasteners per drawing specifications',
      '! 5. Sand all exposed surfaces to 120 grit',
      '! 6. Apply ISPM-15 heat treatment stamp',
      '! 7. Mark center of gravity location on finished crate',
      '',
      `! Generated by AutoCrate Professional on ${new Date().toLocaleDateString()}`,
      '! ===== END OF NX 2022 EXPRESSION FILE ====='
    );

    return code.join('\n');
  }

  exportNX2022(): Blob {
    const code = this.generateNX2022Code();
    return new Blob([code], { type: 'text/plain' });
  }

  private calculateOptimalScale(): string {
    const maxDimension = Math.max(this.config.dimensions.width, this.config.dimensions.length, this.config.dimensions.height);
    
    if (maxDimension <= 24) return '1:2';
    if (maxDimension <= 48) return '1:4';
    if (maxDimension <= 72) return '1:6';
    if (maxDimension <= 96) return '1:8';
    return '1:10';
  }

  private calculateSkidCount(): number {
    const depth = this.config.dimensions.length;
    if (depth <= 24) return 2;
    if (depth <= 48) return 3;
    if (depth <= 72) return 4;
    return Math.ceil(depth / 24);
  }

  private calculateSkidSpacing(): number {
    const skidCount = this.calculateSkidCount();
    return (this.config.dimensions.length - 3.5) / (skidCount - 1); // Account for skid width
  }
}
