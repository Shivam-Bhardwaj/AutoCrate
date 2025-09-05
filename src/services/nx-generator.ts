import { CrateConfiguration, NXExpression, VentilationConfig } from '@/types/crate';

export class NXExpressionGenerator {
  private config: CrateConfiguration;

  constructor(config: CrateConfiguration) {
    this.config = config;
  }

  generateExpression(): NXExpression {
    const { dimensions, base, cap, fasteners, vinyl } = this.config;

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

      // Vinyl
      vinyl_enabled: vinyl.enabled ? 1 : 0,
      vinyl_thickness: vinyl.thickness,
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

    // Base features
    features.push(
      `BLOCK/BASE_SKID = BLOCK(0,0,0,${dimensions.length},${base.skidHeight},${dimensions.width})`
    );
    features.push(
      `BLOCK/FLOOR = BLOCK(0,${base.skidHeight},0,${dimensions.length},${base.floorboardThickness},${dimensions.width})`
    );

    // Panel features
    const baseHeight = base.skidHeight + base.floorboardThickness;

    // Front panel
    features.push(
      `BLOCK/FRONT_PANEL = BLOCK(0,${baseHeight},${dimensions.width - cap.frontPanel.thickness},${dimensions.length},${dimensions.height},${cap.frontPanel.thickness})`
    );

    // Back panel
    features.push(
      `BLOCK/BACK_PANEL = BLOCK(0,${baseHeight},0,${dimensions.length},${dimensions.height},${cap.backPanel.thickness})`
    );

    // Left panel
    features.push(
      `BLOCK/LEFT_PANEL = BLOCK(0,${baseHeight},0,${cap.leftPanel.thickness},${dimensions.height},${dimensions.width})`
    );

    // Right panel
    features.push(
      `BLOCK/RIGHT_PANEL = BLOCK(${dimensions.length - cap.rightPanel.thickness},${baseHeight},0,${cap.rightPanel.thickness},${dimensions.height},${dimensions.width})`
    );

    // Top panel
    features.push(
      `BLOCK/TOP_PANEL = BLOCK(0,${baseHeight + dimensions.height - cap.topPanel.thickness},0,${dimensions.length},${cap.topPanel.thickness},${dimensions.width})`
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
    constraints.push(`CONSTRAINT/MAX_WEIGHT = ${weight.maxGross}`);
    constraints.push(`CONSTRAINT/PRODUCT_WEIGHT = ${weight.product}`);

    // Structural constraints
    constraints.push(`CONSTRAINT/MIN_SKID_HEIGHT = 75`);
    constraints.push(`CONSTRAINT/MIN_PANEL_THICKNESS = 9`);

    return constraints;
  }

  private generateNXCode(): string {
    const { base, cap, fasteners, vinyl } = this.config;
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
// Origin (0,0,0): Lower-left corner at base level
// X-axis: Length direction (left to right)
// Y-axis: Height direction (bottom to top)  
// Z-axis: Width direction (back to front)
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

// ===== FEATURE CREATION =====
// Each component is defined by two diagonal corner points for uniform construction
// This minimizes parameters and simplifies modifications

// Create Base (Floorboard)
// Point 1: (0, skid_height, 0) - Lower corner
// Point 2: (length, skid_height + floor_thickness, width) - Upper corner
BLOCK/CREATE_BASE
  HEIGHT = p13
  WIDTH = p1
  LENGTH = p0
  POSITION = (0, p10, 0)
END_BLOCK

// Create Skids (Support beams under base)
// Each skid uses two-point definition
// Point 1: (0, 0, skid_position) - Ground level
// Point 2: (length, skid_height, skid_position + skid_width)
FOR i = 1 TO p12
  BLOCK/CREATE_SKID_#i
    HEIGHT = p10
    WIDTH = p11
    LENGTH = p0
    POSITION = (0, 0, (i-1) * (p1/p12))
  END_BLOCK
END_FOR

// Create Panels using Two-Point Box Method
// Each panel is a box defined by diagonal corners

// Front Panel - Faces user/operator
BLOCK/CREATE_FRONT_PANEL
  HEIGHT = p2
  WIDTH = p21
  LENGTH = p0
  POSITION = (0, p10 + p13, p1 - p21)
END_BLOCK

// Back Panel - Opposite to front
// Point 1: (0, base_height, 0)
// Point 2: (length, total_height, back_thickness)
BLOCK/CREATE_BACK_PANEL
  HEIGHT = p2
  WIDTH = p22
  LENGTH = p0
  POSITION = (0, p10 + p13, 0)
END_BLOCK

// Left Panel - When facing front
// Point 1: (0, base_height, 0)
// Point 2: (left_thickness, total_height, width)
BLOCK/CREATE_LEFT_PANEL
  HEIGHT = p2
  WIDTH = p1
  LENGTH = p23
  POSITION = (0, p10 + p13, 0)
END_BLOCK

// Right Panel - When facing front
// Point 1: (length - right_thickness, base_height, 0)
// Point 2: (length, total_height, width)
BLOCK/CREATE_RIGHT_PANEL
  HEIGHT = p2
  WIDTH = p1
  LENGTH = p24
  POSITION = (p0 - p24, p10 + p13, 0)
END_BLOCK

// Top Panel - Lid/Cover
// Point 1: (0, total_height - top_thickness, 0)
// Point 2: (length, total_height, width)
BLOCK/CREATE_TOP_PANEL
  HEIGHT = p20
  WIDTH = p1
  LENGTH = p0
  POSITION = (0, p10 + p13 + p2 - p20, 0)
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

    // Add vinyl wrapping if enabled
    if (vinyl.enabled) {
      code += `
// Vinyl Wrapping
SHEET/VINYL_WRAP
  THICKNESS = ${vinyl.thickness}
  TYPE = ${vinyl.type.toUpperCase()}
  COVERAGE = ${vinyl.coverage.toUpperCase()}
END_SHEET
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

// ===== ASSEMBLY NOTES =====
// 1. Components automatically align due to parametric relationships
// 2. Modify parameters p0-p30 to adjust dimensions
// 3. All dimensions in inches
// 4. Use Expression Editor for quick iterations
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
