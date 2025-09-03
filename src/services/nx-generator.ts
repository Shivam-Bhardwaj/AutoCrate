import { CrateConfiguration, NXExpression } from '@/types/crate';

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
      dimension_unit: dimensions.unit,

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
    if (cap.frontPanel.ventilation.enabled) {
      features.push(this.generateVentilationFeature('FRONT', cap.frontPanel.ventilation));
    }

    return features;
  }

  private generateVentilationFeature(panel: string, ventConfig: any): string {
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
    const { dimensions, weight } = this.config;

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
// Generated for: ${this.config.projectName}
// Date: ${new Date().toISOString()}

// ===== PARAMETERS =====
// Dimensions
p0 = ${dimensions.length} // Length (${dimensions.unit})
p1 = ${dimensions.width} // Width (${dimensions.unit})
p2 = ${dimensions.height} // Height (${dimensions.unit})

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
// Create Base
BLOCK/CREATE_BASE
  HEIGHT = p13
  WIDTH = p1
  LENGTH = p0
  POSITION = (0, p10, 0)
END_BLOCK

// Create Skids
FOR i = 1 TO p12
  BLOCK/CREATE_SKID_#i
    HEIGHT = p10
    WIDTH = p11
    LENGTH = p0
    POSITION = (0, 0, (i-1) * (p1/p12))
  END_BLOCK
END_FOR

// Create Panels
BLOCK/CREATE_FRONT_PANEL
  HEIGHT = p2
  WIDTH = p21
  LENGTH = p0
  POSITION = (0, p10 + p13, p1 - p21)
END_BLOCK

BLOCK/CREATE_BACK_PANEL
  HEIGHT = p2
  WIDTH = p22
  LENGTH = p0
  POSITION = (0, p10 + p13, 0)
END_BLOCK

BLOCK/CREATE_LEFT_PANEL
  HEIGHT = p2
  WIDTH = p1
  LENGTH = p23
  POSITION = (0, p10 + p13, 0)
END_BLOCK

BLOCK/CREATE_RIGHT_PANEL
  HEIGHT = p2
  WIDTH = p1
  LENGTH = p24
  POSITION = (p0 - p24, p10 + p13, 0)
END_BLOCK

BLOCK/CREATE_TOP_PANEL
  HEIGHT = p20
  WIDTH = p1
  LENGTH = p0
  POSITION = (0, p10 + p13 + p2 - p20, 0)
END_BLOCK
`;

    // Add ventilation code if enabled
    if (cap.frontPanel.ventilation.enabled) {
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

// ===== END OF EXPRESSION FILE =====`;

    return code;
  }

  exportToFile(): Blob {
    const expression = this.generateExpression();
    const content = expression.code;
    return new Blob([content], { type: 'text/plain' });
  }
}
