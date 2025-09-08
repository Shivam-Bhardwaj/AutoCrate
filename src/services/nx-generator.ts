import { CrateConfiguration, NXExpression, VentilationConfig } from '@/types/crate';

export class NXExpressionGenerator {
  config: CrateConfiguration;

  constructor(config: CrateConfiguration) {
    this.config = config;
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
}
