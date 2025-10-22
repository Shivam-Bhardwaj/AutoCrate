/**
 * Centralized Configuration for AutoCrate System
 *
 * This file contains all configurable constants and standards used throughout the crate
 * generation system. All hardcoded values should be referenced from here to ensure
 * consistency and easy maintenance.
 */

// ============================================================================
// DISPLAY UTILITIES
// ============================================================================

/**
 * Convert decimal inches to fractional display (e.g., 0.25 -> "1/4", 0.0625 -> "1/16")
 * For values that don't have clean fractions, returns decimal with 3 places
 */
export function toFractionalInches(inches: number): string {
  const tolerance = 0.0001 // Comparison tolerance

  // Common fractions up to 1/16"
  const fractions: [number, string][] = [
    [1 / 16, '1/16'],
    [1 / 8, '1/8'],
    [3 / 16, '3/16'],
    [1 / 4, '1/4'],
    [5 / 16, '5/16'],
    [3 / 8, '3/8'],
    [7 / 16, '7/16'],
    [1 / 2, '1/2'],
    [9 / 16, '9/16'],
    [5 / 8, '5/8'],
    [11 / 16, '11/16'],
    [3 / 4, '3/4'],
    [13 / 16, '13/16'],
    [7 / 8, '7/8'],
    [15 / 16, '15/16'],
  ]

  // Check if it's a whole number
  if (Math.abs(inches - Math.round(inches)) < tolerance) {
    return Math.round(inches).toString()
  }

  // Split into whole and fractional parts
  const whole = Math.floor(inches)
  const fractional = inches - whole

  // Find matching fraction
  for (const [value, display] of fractions) {
    if (Math.abs(fractional - value) < tolerance) {
      return whole > 0 ? `${whole} ${display}` : display
    }
  }

  // No clean fraction, return decimal
  return inches.toFixed(3)
}

/**
 * Format dimension for display with optional fractional conversion
 * @param inches - dimension in inches
 * @param useFractions - whether to display as fractions (default: true)
 * @param suffix - optional suffix (default: '"')
 */
export function formatDimension(inches: number, useFractions = true, suffix = '"'): string {
  const value = useFractions ? toFractionalInches(inches) : inches.toFixed(3)
  return `${value}${suffix}`
}

// ============================================================================
// MATERIAL STANDARDS
// ============================================================================

/**
 * Standard plywood sheet dimensions (in inches)
 */
export const PLYWOOD_STANDARDS = {
  /** Standard plywood sheet width */
  SHEET_WIDTH: 48,
  /** Standard plywood sheet length */
  SHEET_LENGTH: 96,
  /** Default plywood thickness for panels */
  DEFAULT_THICKNESS: 0.25,
  /** Available plywood thicknesses */
  AVAILABLE_THICKNESSES: [0.25, 0.375, 0.5, 0.625, 0.75] as const,
} as const

/**
 * Lumber nominal vs actual dimensions mapping
 * Format: [nominal_height, nominal_width] -> [actual_height, actual_width]
 */
export const LUMBER_DIMENSIONS = {
  '1x4': { height: 0.75, width: 3.5 },
  '2x3': { height: 1.5, width: 2.5 },
  '2x4': { height: 1.5, width: 3.5 },
  '2x6': { height: 1.5, width: 5.5 },
  '2x8': { height: 1.5, width: 7.25 },
  '2x10': { height: 1.5, width: 9.25 },
  '2x12': { height: 1.5, width: 11.25 },
  '3x3': { height: 2.5, width: 2.5 },
  '3x4': { height: 3.5, width: 2.5 }, // Oriented for 3.5" forklift clearance
  '4x4': { height: 3.5, width: 3.5 },
  '4x6': { height: 3.5, width: 5.5 },
  '6x6': { height: 5.5, width: 5.5 },
  '8x8': { height: 7.25, width: 7.25 },
} as const

/**
 * Available lumber sizes for different applications
 */
export const LUMBER_CATEGORIES = {
  CLEAT_SIZES: ['1x4', '2x3', '2x4'] as const,
  SKID_SIZES: ['2x4', '3x3', '4x4', '4x6', '6x6', '8x8'] as const,
  FLOORBOARD_SIZES: ['2x6', '2x8', '2x10', '2x12'] as const,
  LIGHTWEIGHT_SKID_SIZES: ['3x4'] as const, // Special case for <4500 lbs
} as const

// ============================================================================
// STRUCTURAL REQUIREMENTS
// ============================================================================

/**
 * Skid configuration and weight thresholds
 */
export const SKID_STANDARDS = {
  /** Minimum forklift clearance height */
  MIN_FORKLIFT_HEIGHT: 3.5,
  /** Weight threshold for allowing 3x4 lumber (pounds) */
  LIGHTWEIGHT_WEIGHT_THRESHOLD: 4500,
  /** Skid count thresholds by weight */
  WEIGHT_THRESHOLDS: {
    TWO_SKIDS_MAX: 3000,
    THREE_SKIDS_MAX: 10000,
    // Above 10000 uses 4 skids
  },
} as const

/**
 * Cleat spacing and positioning standards
 */
export const CLEAT_STANDARDS = {
  /** Default cleat lumber size */
  DEFAULT_SIZE: '1x4' as const,
  /** Maximum spacing between vertical cleats (inches) */
  MAX_VERTICAL_SPACING: 24,
  /** Typical cleat dimensions for 1x4 lumber */
  DEFAULT_DIMENSIONS: {
    width: LUMBER_DIMENSIONS['1x4'].width,
    thickness: LUMBER_DIMENSIONS['1x4'].height,
  },
} as const

/**
 * Hardware fastener spacing requirements
 */
export const FASTENER_STANDARDS = {
  /** Klimp fastener spacing */
  KLIMP: {
    /** Minimum spacing between edge klimps (inches) */
    EDGE_MIN_SPACING: 18,
    /** Maximum spacing between edge klimps (inches) */
    EDGE_MAX_SPACING: 24,
  },
  /** Lag screw configuration */
  LAG_SCREW: {
    /** Default spacing between lag screws (inches) */
    DEFAULT_SPACING: 21,
    /** Minimum allowable spacing (inches) */
    MIN_SPACING: 18,
    /** Maximum allowable spacing (inches) */
    MAX_SPACING: 24,
    /** Spacing adjustment increment (inches) */
    SPACING_INCREMENT: 0.0625, // 1/16 inch
    /** Standard lag screw specifications */
    SPECIFICATIONS: {
      diameter: 0.38,
      length: 3.0,
      partNumber: 'LAG SCREW_0.38 X 3.00',
    },
  },
} as const

/**
 * Panel stop specifications and positioning standards
 * Panel stops prevent panels from collapsing inward during packing
 */
export const PANEL_STOP_STANDARDS = {
  /** Material specifications */
  MATERIAL: {
    /** Plywood thickness (inches) */
    thickness: 0.375, // 3/8 inch
    /** Panel stop width (inches) */
    width: 2.0,
  },
  /** Positioning specifications */
  POSITIONING: {
    /** Inset from panel edge (inches) - clearance from front panel */
    edgeInset: 0.0625, // 1/16 inch clearance from cleated panel (1.0625" total from origin)
    /** Length calculation method: half of smallest cleated panel edge dimension */
    lengthFactor: 0.5,
  },
  /** Quantity and placement */
  PLACEMENT: {
    /** Number of stops on front panel side edges */
    frontPanelSides: 2,
    /** Number of stops on top panel front edge */
    topPanelFront: 1,
  },
  /** Part numbering */
  PART_NUMBERS: {
    frontLeft: 'PANEL_STOP_FRONT_LEFT',
    frontRight: 'PANEL_STOP_FRONT_RIGHT',
    topFront: 'PANEL_STOP_TOP_FRONT',
  },
} as const

// ============================================================================
// PART NUMBER STANDARDS
// ============================================================================

/**
 * Default part number templates
 */
export const PART_NUMBER_STANDARDS = {
  /** Placeholder format for new part numbers */
  PLACEHOLDER: '0205-XXXXX',
  /** Regex pattern for validating part numbers */
  VALIDATION_PATTERN: /^0205-[A-Z0-9]{5}$/,
  /** Part number prefixes by component type */
  PREFIXES: {
    BASE: '0205',
    CRATE: '0205',
    CAP: '0205',
  },
} as const

/**
 * Company and project identifiers
 *
 * IMPORTANT: Version number is ONLY stored in package.json
 * Never hardcode version anywhere else - always read from:
 * - Frontend: /api/last-update endpoint
 * - Backend: require('./package.json').version
 */
export const PROJECT_IDENTIFIERS = {
  /** Default maintainer email domain */
  DEFAULT_EMAIL_DOMAIN: 'designviz.com',
  /** TI number prefix */
  TI_PREFIX: 'TI-',
  /** Default TI number placeholder */
  DEFAULT_TI: 'TI-000',
} as const

// ============================================================================
// GEOMETRY STANDARDS
// ============================================================================

/**
 * Panel and component positioning standards
 */
export const GEOMETRY_STANDARDS = {
  /** Default ground clearance for side panels (inches) - 1/4" standard */
  SIDE_PANEL_GROUND_CLEARANCE: 0.25,
  /** Side panel edge clearance from floorboard edges (inches) */
  SIDE_PANEL_EDGE_CLEARANCE: 0.0625, // 1/16 inch
  /** Total panel thickness including cleats (inches) */
  DEFAULT_PANEL_THICKNESS: 1.0,
  /** Standard tolerance for wood fabrication (inches) - 1/16" */
  STANDARD_TOLERANCE: 0.0625,
  /** Default clearances if not specified */
  DEFAULT_CLEARANCES: {
    side: 2,
    end: 2,
    top: 3,
  },
} as const

// ============================================================================
// MARKING AND LABELING STANDARDS
// ============================================================================

/**
 * Stencil and marking dimensions
 */
export const MARKING_STANDARDS = {
  /** Fragile stencil dimensions */
  FRAGILE_STENCIL: {
    width: 8,
    height: 8,
    partNumber: 'FRAGILE_STENCIL',
    quantity: 4, // Per crate
  },
  /** Handling symbols dimensions */
  HANDLING_SYMBOLS: {
    width: 6,
    height: 6,
    types: ['glass', 'umbrella', 'up_arrow'] as const,
    maxQuantity: 4, // Per crate
  },
  /** AUTOCRATE text marking dimensions by crate size */
  AUTOCRATE_TEXT: {
    /** Small crates (overall height ≤ 37 inches) */
    SMALL: {
      width: 12.00,
      height: 3.00,
      partNumber: 'AUTOCRATE-SM',
      heightThreshold: 37,
    },
    /** Medium crates (overall height ≤ 73 inches) */
    MEDIUM: {
      width: 18.00,
      height: 4.50,
      partNumber: 'AUTOCRATE-MD',
      heightThreshold: 73,
    },
    /** Large crates (overall height > 73 inches) */
    LARGE: {
      width: 24.00,
      height: 6.00,
      partNumber: 'AUTOCRATE-LG',
    },
    quantity: 4, // Per crate
  },
  /** Marking positioning standards */
  POSITIONING: {
    /** Offset from panel edges for corner markings (inches) */
    EDGE_OFFSET: 2,
    /** Additional vertical offset to avoid overlap between markings (inches) */
    VERTICAL_SEPARATION: 2,
    /** Rotation angle for FRAGILE stencil (radians) */
    FRAGILE_ROTATION: Math.PI / 18, // 10 degrees
  },
  /** Marking color standards (hex codes) */
  COLORS: {
    /** FRAGILE stencil color */
    FRAGILE: '#FF0000',
    /** Handling symbols color */
    HANDLING: '#000000',
    /** AUTOCRATE text color */
    AUTOCRATE: '#0066CC',
    /** White background for marking planes */
    BACKGROUND: '#FFFFFF',
    /** Border/edge color for markings */
    BORDER: '#666666',
  },
} as const

// ============================================================================
// FILE FORMAT STANDARDS
// ============================================================================

/**
 * Export file format specifications
 */
export const FILE_FORMAT_STANDARDS = {
  /** STEP file format version */
  STEP: {
    VERSION: 'AP242',
    SCHEMA: 'AUTOMOTIVE_DESIGN',
    PROTOCOL: 'ISO-10303-21',
  },
  /** NX expressions file format */
  NX_EXPRESSIONS: {
    FILE_EXTENSION: '.exp',
    ENCODING: 'UTF-8',
  },
  /** CAD file references */
  CAD_REFERENCES: {
    LAG_SCREW_PATH: '/CAD FILES/LAG SCREW_0.38 X 3.00.stp',
    KLIMP_MODEL_PATH: '/CAD FILES/Klimp 4.glb',
  },
} as const

// ============================================================================
// UI AND VISUALIZATION CONSTANTS
// ============================================================================

/**
 * User interface and 3D visualization constants
 */
export const UI_CONSTANTS = {
  /** 3D Visualization settings */
  VISUALIZATION: {
    /** Scale factor for converting inches to Three.js scene units */
    SCALE_FACTOR: 0.1,
    /** Datum plane opacity (0-1) */
    DATUM_PLANE_OPACITY: 0.15,
    /** Highlighted plane opacity when selected (0-1) */
    HIGHLIGHT_PLANE_OPACITY: 0.5,
    /** Debounce delay for input changes (milliseconds) */
    DEBOUNCE_DELAY_MS: 500,
    /** Label offset multiplier for datum plane labels */
    LABEL_OFFSET_FACTOR: 0.1,
    /** Multiplier for center calculations */
    CENTER_MULTIPLIER: 0.5,
    /** Datum plane size multiplier relative to max crate dimension */
    DATUM_PLANE_SIZE_MULTIPLIER: 0.4,
    /** Datum label offset multiplier relative to max crate dimension */
    DATUM_LABEL_OFFSET_MULTIPLIER: 0.15,
  },
  /** 3D Scene lighting configuration */
  LIGHTING: {
    /** Ambient light intensity (0-1) */
    AMBIENT_INTENSITY: 0.5,
    /** Directional light intensity (0-1) */
    DIRECTIONAL_INTENSITY: 1.0,
    /** Point light intensity (0-1) */
    POINT_LIGHT_INTENSITY: 0.5,
  },
  /** Camera configuration */
  CAMERA: {
    /** Near clipping plane distance */
    NEAR_PLANE: 0.1,
    /** Far clipping plane distance */
    FAR_PLANE: 1000,
    /** Field of view in degrees */
    FOV: 45,
  },
  /** Default product dimensions for new projects (inches) */
  DEFAULT_PRODUCT: {
    length: 135,
    width: 135,
    height: 135,
    weight: 10000,
  },
} as const

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Input validation constraints
 */
export const VALIDATION_RULES = {
  /** Product dimension constraints (inches) */
  DIMENSIONS: {
    MIN_LENGTH: 12,
    MAX_LENGTH: 150,
    MIN_WIDTH: 12,
    MAX_WIDTH: 150,
    MIN_HEIGHT: 12,
    MAX_HEIGHT: 150,
  },
  /** Weight constraints (pounds) */
  WEIGHT: {
    MIN: 50,
    MAX: 60000,
  },
  /** Clearance constraints (inches) */
  CLEARANCES: {
    MIN_SIDE: 1,
    MAX_SIDE: 12,
    MIN_END: 1,
    MAX_END: 12,
    MIN_TOP: 2,
    MAX_TOP: 24,
  },
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get actual lumber dimensions from nominal size
 */
export function getLumberDimensions(nominalSize: keyof typeof LUMBER_DIMENSIONS) {
  return LUMBER_DIMENSIONS[nominalSize]
}

/**
 * Check if a weight qualifies for lightweight lumber options
 */
export function isLightweightCrate(weight: number): boolean {
  return weight < SKID_STANDARDS.LIGHTWEIGHT_WEIGHT_THRESHOLD
}

/**
 * Get recommended number of skids based on weight
 */
export function getRecommendedSkidCount(weight: number): 2 | 3 | 4 {
  if (weight <= SKID_STANDARDS.WEIGHT_THRESHOLDS.TWO_SKIDS_MAX) return 2
  if (weight <= SKID_STANDARDS.WEIGHT_THRESHOLDS.THREE_SKIDS_MAX) return 3
  return 4
}

/**
 * Validate part number format
 */
export function isValidPartNumber(partNumber: string): boolean {
  return PART_NUMBER_STANDARDS.VALIDATION_PATTERN.test(partNumber)
}

/**
 * Create a default part number placeholder
 */
export function getDefaultPartNumber(): string {
  return PART_NUMBER_STANDARDS.PLACEHOLDER
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LumberSize = keyof typeof LUMBER_DIMENSIONS
export type CleatSize = typeof LUMBER_CATEGORIES.CLEAT_SIZES[number]
export type SkidSize = typeof LUMBER_CATEGORIES.SKID_SIZES[number]
export type FloorboardSize = typeof LUMBER_CATEGORIES.FLOORBOARD_SIZES[number]
export type PlywoodThickness = typeof PLYWOOD_STANDARDS.AVAILABLE_THICKNESSES[number]
