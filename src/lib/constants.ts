/**
 * AutoCrate Constants
 *
 * Centralized location for all magic numbers and constants used throughout the application.
 * This helps maintain consistency and makes updates easier.
 */

// ============================================================================
// UNIT CONVERSIONS
// ============================================================================

/** Inches to millimeter conversion factor */
export const INCHES_TO_MM = 25.4;

/** Millimeters to meters conversion factor */
export const MM_TO_METERS = 1000;

// ============================================================================
// MATERIAL THICKNESSES (in inches)
// ============================================================================

/** Standard floorboard thickness - 2" nominal = 1.5" actual */
export const FLOORBOARD_THICKNESS = 1.5;

/** Standard panel thickness - 3/4 inch plywood */
export const PANEL_THICKNESS = 0.75;

/** Light duty panel thickness for low weight crates */
export const LIGHT_PANEL_THICKNESS = 0.5;

/** Heavy duty panel thickness for high weight crates */
export const HEAVY_PANEL_THICKNESS = 1.5;

/** Minimum edge distance for floorboard placement */
export const MIN_EDGE_DISTANCE = 0.75;

// ============================================================================
// WEIGHT THRESHOLDS (in pounds)
// ============================================================================

/** Weight threshold for light duty construction */
export const LIGHT_WEIGHT_THRESHOLD = 100;

/** Weight threshold for medium duty construction */
export const MEDIUM_WEIGHT_THRESHOLD = 500;

/** Weight threshold for heavy duty construction */
export const HEAVY_WEIGHT_THRESHOLD = 1000;

/** Weight threshold for extra heavy duty construction */
export const EXTRA_HEAVY_WEIGHT_THRESHOLD = 2000;

// ============================================================================
// SKID SPECIFICATIONS
// ============================================================================

/** Standard skid dimensions for different weight ranges */
export const SKID_SPECS = {
  /** Light duty skids (≤500 lbs) */
  LIGHT: {
    width: 4,
    height: 4,
    quantity: 2,
  },
  /** Medium duty skids (≤1000 lbs) */
  MEDIUM: {
    width: 4,
    height: 6,
    quantity: 2,
  },
  /** Heavy duty skids (≤2000 lbs) */
  HEAVY: {
    width: 6,
    height: 6,
    quantity: 2,
  },
  /** Extra heavy skids (≤4000 lbs) */
  EXTRA_HEAVY_ONE: {
    width: 6,
    height: 8,
    quantity: 3,
  },
  /** Maximum duty skids (>4000 lbs) */
  EXTRA_HEAVY_TWO: {
    width: 8,
    height: 8,
    quantity: 4,
  },
} as const;

// ============================================================================
// LUMBER SPECIFICATIONS
// ============================================================================

/** Standard lumber board length in feet */
export const STANDARD_BOARD_LENGTH = 8;

/** Standard screws per lumber piece ratio */
export const SCREWS_PER_LUMBER_PIECE = 10;

// ============================================================================
// PRICING CONSTANTS
// ============================================================================

/** Standard lumber price per board foot */
export const LUMBER_UNIT_PRICE = 8.5;

/** Standard screw box price */
export const SCREW_BOX_PRICE = 12.0;

// ============================================================================
// DIMENSIONAL LIMITS
// ============================================================================

/** Maximum reasonable dimension in inches */
export const MAX_DIMENSION = 1000;

/** Minimum wall thickness in millimeters for NX constraints */
export const MIN_WALL_THICKNESS_MM = 12;

/** Minimum panel thickness in millimeters for NX constraints */
export const MIN_PANEL_THICKNESS_MM = 9;

// ============================================================================
// UI/UX CONSTANTS
// ============================================================================

/** Maximum number of log entries to keep in memory */
export const MAX_LOG_ENTRIES = 500;

/** Copy notification timeout in milliseconds */
export const COPY_NOTIFICATION_TIMEOUT = 2000;

/** Mobile swipe threshold for card dismissal */
export const MOBILE_SWIPE_THRESHOLD = 500;

// ============================================================================
// 3D VISUALIZATION
// ============================================================================

/** Surface area calculation coefficient for panels */
export const SURFACE_AREA_COEFFICIENT = 2;

/** Default vent slot aspect ratio (width:height) */
export const VENT_SLOT_ASPECT_RATIO = 3;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/** Default product weight in pounds */
export const DEFAULT_PRODUCT_WEIGHT = 500;

/** Default maximum gross weight in pounds */
export const DEFAULT_MAX_GROSS_WEIGHT = 1000;

/** Default clearance added to product dimensions (inches) */
export const DEFAULT_CLEARANCE = 2;

/** Default clearance range for crate sizing */
export const CLEARANCE_RANGE = {
  MIN: 2,
  MAX: 4,
} as const;
