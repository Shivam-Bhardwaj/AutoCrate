import { CrateConfiguration } from '@/types/crate';

export interface DimensionSet {
  overall: Dimension[];
  detail: Dimension[];
  reference: Dimension[];
  notes: DimensionNote[];
}

export interface Dimension {
  id: string;
  type: 'linear' | 'angular' | 'radial' | 'diameter' | 'arc-length';
  value: number;
  tolerance?: Tolerance;
  precision: number; // decimal places
  unit: 'inch' | 'degree';
  startPoint: Point2D;
  endPoint: Point2D;
  textPosition: Point2D;
  extensionLines: boolean;
  dimensionLine: {
    position: Point2D[];
    arrowStyle: 'closed' | 'open' | 'dot' | 'tick';
    arrowSize: number;
  };
  style: DimensionStyle;
  layer: string;
  isReference?: boolean; // Reference dimensions in parentheses
  isBaseline?: boolean; // Baseline dimensioning
  chainParent?: string; // For chain dimensioning
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Tolerance {
  type: 'bilateral' | 'unilateral' | 'limit' | 'geometric';
  upperLimit: number;
  lowerLimit: number;
  notation: string; // e.g., "±.01", "+.02/-.01"
}

export interface DimensionStyle {
  textSize: number;
  textColor: string;
  lineWeight: number;
  lineColor: string;
  arrowSize: number;
  extensionLineOffset: number;
  extensionLineExtension: number;
  textGap: number;
  suppressZeros?: 'leading' | 'trailing' | 'both';
}

export interface DimensionNote {
  id: string;
  text: string;
  position: Point2D;
  leader?: {
    startPoint: Point2D;
    endPoint: Point2D;
    arrowType: 'arrow' | 'dot' | 'none';
  };
  style: {
    textSize: number;
    textColor: string;
    fontWeight: 'normal' | 'bold';
  };
}

/**
 * ASME Y14.5-2009 compliant dimension styles
 */
const STANDARD_DIMENSION_STYLE: DimensionStyle = {
  textSize: 0.125, // 1/8" text height standard
  textColor: 'black',
  lineWeight: 0.5,
  lineColor: 'black',
  arrowSize: 0.125,
  extensionLineOffset: 0.0625, // 1/16" offset from object
  extensionLineExtension: 0.125, // 1/8" beyond dimension line
  textGap: 0.03125, // 1/32" gap around text
  suppressZeros: 'trailing'
};

/**
 * Standard tolerances for Applied Materials crating
 */
const STANDARD_TOLERANCES = {
  lumber: { upperLimit: 0.0625, lowerLimit: -0.0625, notation: '±1/16"' }, // Wood tolerances
  overall: { upperLimit: 0.0625, lowerLimit: -0.0625, notation: '±1/16"' }, // Overall assembly
  critical: { upperLimit: 0.03125, lowerLimit: -0.03125, notation: '±1/32"' }, // Critical fits
  reference: { upperLimit: 0, lowerLimit: 0, notation: 'REF' } // Reference only
};

/**
 * Generate complete dimension set for different drawing types
 */
export function generateDimensions(
  config: CrateConfiguration,
  drawingType: 'assembly' | 'layout' | 'product' | 'detail'
): DimensionSet {
  switch (drawingType) {
    case 'assembly':
      return generateAssemblyDimensions(config);
    case 'layout':
      return generateLayoutDimensions(config);
    case 'product':
      return generateProductDimensions(config);
    case 'detail':
      return generateDetailDimensions(config);
    default:
      return { overall: [], detail: [], reference: [], notes: [] };
  }
}

/**
 * Generate dimensions for assembly drawings (Sheet 1)
 */
function generateAssemblyDimensions(config: CrateConfiguration): DimensionSet {
  const dimensions: DimensionSet = {
    overall: [],
    detail: [],
    reference: [],
    notes: []
  };

  // Overall crate dimensions (with tolerances)
  dimensions.overall.push(
    createLinearDimension(
      'overall-length',
      config.dimensions.length,
      { x: 0, y: -1 },
      { x: config.dimensions.length, y: -1 },
      { x: config.dimensions.length / 2, y: -1.5 },
      STANDARD_TOLERANCES.overall
    )
  );

  dimensions.overall.push(
    createLinearDimension(
      'overall-width',
      config.dimensions.width,
      { x: -1, y: 0 },
      { x: -1, y: config.dimensions.width },
      { x: -1.5, y: config.dimensions.width / 2 },
      STANDARD_TOLERANCES.overall
    )
  );

  dimensions.overall.push(
    createLinearDimension(
      'overall-height',
      config.dimensions.height + config.base.skidHeight,
      { x: config.dimensions.length + 1, y: 0 },
      { x: config.dimensions.length + 1, y: config.dimensions.height + config.base.skidHeight },
      { x: config.dimensions.length + 1.5, y: (config.dimensions.height + config.base.skidHeight) / 2 },
      STANDARD_TOLERANCES.overall
    )
  );

  // Skid height detail
  dimensions.detail.push(
    createLinearDimension(
      'skid-height',
      config.base.skidHeight,
      { x: config.dimensions.length + 0.5, y: 0 },
      { x: config.dimensions.length + 0.5, y: config.base.skidHeight },
      { x: config.dimensions.length + 1, y: config.base.skidHeight / 2 },
      STANDARD_TOLERANCES.lumber
    )
  );

  // Weight annotation
  dimensions.notes.push({
    id: 'weight-note',
    text: `TOTAL WEIGHT: ${config.weight.product + 50} LB (EST.)`,
    position: { x: 2, y: config.dimensions.height + config.base.skidHeight + 1 },
    style: {
      textSize: 0.125,
      textColor: 'black',
      fontWeight: 'bold'
    }
  });

  // Center of gravity note
  if (config.centerOfGravity?.combinedCoG) {
    const cog = config.centerOfGravity.combinedCoG;
    dimensions.notes.push({
      id: 'cog-note',
      text: `C.G. HEIGHT: ${cog.z.toFixed(1)}" FROM FLOOR`,
      position: { x: 2, y: config.dimensions.height + config.base.skidHeight + 0.5 },
      leader: {
        startPoint: { x: cog.x, y: cog.z },
        endPoint: { x: 2, y: config.dimensions.height + config.base.skidHeight + 0.5 },
        arrowType: 'dot'
      },
      style: {
        textSize: 0.125,
        textColor: 'black',
        fontWeight: 'normal'
      }
    });
  }

  return dimensions;
}

/**
 * Generate dimensions for layout drawings (Sheet 2)
 */
function generateLayoutDimensions(config: CrateConfiguration): DimensionSet {
  const dimensions: DimensionSet = {
    overall: [],
    detail: [],
    reference: [],
    notes: []
  };

  // Forklift entry dimensions
  const skidSpacing = config.base.skidSpacing;
  const skidWidth = config.base.skidWidth;

  dimensions.detail.push(
    createLinearDimension(
      'fork-entry-width',
      skidSpacing - skidWidth,
      { x: skidWidth / 2, y: -0.5 },
      { x: skidSpacing - skidWidth / 2, y: -0.5 },
      { x: skidSpacing / 2, y: -1 },
      STANDARD_TOLERANCES.critical
    )
  );

  // Skid spacing
  dimensions.overall.push(
    createLinearDimension(
      'skid-spacing',
      skidSpacing,
      { x: 0, y: -2 },
      { x: skidSpacing, y: -2 },
      { x: skidSpacing / 2, y: -2.5 },
      STANDARD_TOLERANCES.lumber
    )
  );

  // Panel thickness callouts
  const panels = [
    { name: 'front', thickness: config.cap.frontPanel.thickness },
    { name: 'back', thickness: config.cap.backPanel.thickness },
    { name: 'left', thickness: config.cap.leftPanel.thickness },
    { name: 'right', thickness: config.cap.rightPanel.thickness },
    { name: 'top', thickness: config.cap.topPanel.thickness }
  ];

  panels.forEach((panel, index) => {
    dimensions.notes.push({
      id: `panel-thickness-${panel.name}`,
      text: `${panel.thickness.toFixed(3)}" ${panel.name.toUpperCase()} PANEL`,
      position: { x: config.dimensions.length + 2, y: config.dimensions.height - index * 0.3 },
      style: {
        textSize: 0.1,
        textColor: 'black',
        fontWeight: 'normal'
      }
    });
  });

  return dimensions;
}

/**
 * Generate dimensions for product orientation drawings (Sheet 3)
 */
function generateProductDimensions(config: CrateConfiguration): DimensionSet {
  const dimensions: DimensionSet = {
    overall: [],
    detail: [],
    reference: [],
    notes: []
  };

  // Product clearances (reference dimensions)
  const clearance = 2; // Typical 2" clearance around product

  dimensions.reference.push(
    createReferenceDimension(
      'product-clearance-front',
      clearance,
      { x: 0, y: config.dimensions.height / 2 },
      { x: clearance, y: config.dimensions.height / 2 },
      { x: clearance / 2, y: config.dimensions.height / 2 + 1 }
    )
  );

  // Handling instructions
  dimensions.notes.push({
    id: 'handling-note',
    text: 'DO NOT LIFT BY PANELS',
    position: { x: config.dimensions.length / 2, y: config.dimensions.height + config.base.skidHeight + 2 },
    style: {
      textSize: 0.15,
      textColor: 'black',
      fontWeight: 'bold'
    }
  });

  dimensions.notes.push({
    id: 'orientation-note',
    text: 'THIS SIDE UP ARROW REQUIRED',
    position: { x: config.dimensions.length / 2, y: config.dimensions.height + config.base.skidHeight + 1.5 },
    style: {
      textSize: 0.125,
      textColor: 'black',
      fontWeight: 'normal'
    }
  });

  return dimensions;
}

/**
 * Generate dimensions for detail drawings
 */
function generateDetailDimensions(config: CrateConfiguration): DimensionSet {
  const dimensions: DimensionSet = {
    overall: [],
    detail: [],
    reference: [],
    notes: []
  };

  // Fastener spacing
  if (config.fasteners.spacing) {
    dimensions.detail.push(
      createLinearDimension(
        'fastener-spacing',
        config.fasteners.spacing,
        { x: 0, y: 0 },
        { x: config.fasteners.spacing, y: 0 },
        { x: config.fasteners.spacing / 2, y: -0.5 },
        STANDARD_TOLERANCES.critical
      )
    );
  }

  // Material callouts
  dimensions.notes.push({
    id: 'material-note',
    text: `${config.fasteners.type.toUpperCase()} ${config.fasteners.size} ${config.fasteners.material.toUpperCase()}`,
    position: { x: 1, y: 3 },
    style: {
      textSize: 0.125,
      textColor: 'black',
      fontWeight: 'normal'
    }
  });

  return dimensions;
}

/**
 * Helper function to create linear dimensions
 */
function createLinearDimension(
  id: string,
  value: number,
  startPoint: Point2D,
  endPoint: Point2D,
  textPosition: Point2D,
  tolerance: { upperLimit: number; lowerLimit: number; notation: string }
): Dimension {
  return {
    id,
    type: 'linear',
    value,
    tolerance: {
      type: 'bilateral',
      upperLimit: tolerance.upperLimit,
      lowerLimit: tolerance.lowerLimit,
      notation: tolerance.notation
    },
    precision: 3, // Show to thousandths for most dimensions
    unit: 'inch',
    startPoint,
    endPoint,
    textPosition,
    extensionLines: true,
    dimensionLine: {
      position: [startPoint, endPoint],
      arrowStyle: 'closed',
      arrowSize: STANDARD_DIMENSION_STYLE.arrowSize
    },
    style: STANDARD_DIMENSION_STYLE,
    layer: 'dimensions'
  };
}

/**
 * Helper function to create reference dimensions
 */
function createReferenceDimension(
  id: string,
  value: number,
  startPoint: Point2D,
  endPoint: Point2D,
  textPosition: Point2D
): Dimension {
  const dimension = createLinearDimension(
    id,
    value,
    startPoint,
    endPoint,
    textPosition,
    STANDARD_TOLERANCES.reference
  );
  
  dimension.isReference = true;
  dimension.tolerance = undefined; // Reference dimensions don't have tolerances
  
  return dimension;
}

/**
 * Generate baseline dimension chain
 */
export function generateBaselineDimensions(
  baseId: string,
  values: number[],
  basePoint: Point2D,
  direction: 'horizontal' | 'vertical',
  spacing: number = 0.5
): Dimension[] {
  const dimensions: Dimension[] = [];
  let cumulativeValue = 0;

  values.forEach((value, index) => {
    cumulativeValue += value;
    const isHorizontal = direction === 'horizontal';
    
    const startPoint = basePoint;
    const endPoint = isHorizontal 
      ? { x: basePoint.x + cumulativeValue, y: basePoint.y }
      : { x: basePoint.x, y: basePoint.y + cumulativeValue };
    
    const textPosition = isHorizontal
      ? { x: basePoint.x + cumulativeValue / 2, y: basePoint.y - (index + 1) * spacing }
      : { x: basePoint.x - (index + 1) * spacing, y: basePoint.y + cumulativeValue / 2 };

    dimensions.push(createLinearDimension(
      `${baseId}-baseline-${index}`,
      cumulativeValue,
      startPoint,
      endPoint,
      textPosition,
      STANDARD_TOLERANCES.overall
    ));
  });

  return dimensions;
}

/**
 * Generate chain dimension sequence
 */
export function generateChainDimensions(
  baseId: string,
  values: number[],
  startPoint: Point2D,
  direction: 'horizontal' | 'vertical',
  spacing: number = 0.5
): Dimension[] {
  const dimensions: Dimension[] = [];
  let currentPosition = startPoint;

  values.forEach((value, index) => {
    const isHorizontal = direction === 'horizontal';
    const endPoint = isHorizontal
      ? { x: currentPosition.x + value, y: currentPosition.y }
      : { x: currentPosition.x, y: currentPosition.y + value };
    
    const textPosition = isHorizontal
      ? { x: currentPosition.x + value / 2, y: currentPosition.y - spacing }
      : { x: currentPosition.x - spacing, y: currentPosition.y + value / 2 };

    const dimension = createLinearDimension(
      `${baseId}-chain-${index}`,
      value,
      { ...currentPosition },
      endPoint,
      textPosition,
      STANDARD_TOLERANCES.lumber
    );

    if (index > 0) {
      dimension.chainParent = `${baseId}-chain-${index - 1}`;
    }

    dimensions.push(dimension);
    currentPosition = endPoint;
  });

  return dimensions;
}

/**
 * Format dimension text according to ASME Y14.5 standards
 */
export function formatDimensionText(dimension: Dimension): string {
  let text = '';
  
  if (dimension.isReference) {
    text = `(${dimension.value.toFixed(dimension.precision)}")`;
  } else {
    text = `${dimension.value.toFixed(dimension.precision)}"`;
    
    if (dimension.tolerance && dimension.tolerance.notation !== 'REF') {
      text += ` ${dimension.tolerance.notation}`;
    }
  }

  return text;
}

/**
 * Validate dimensions meet ASME Y14.5 standards
 */
export function validateDimensions(dimensions: Dimension[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  dimensions.forEach(dim => {
    // Check for overlapping dimensions
    const overlapping = dimensions.filter(other => 
      other.id !== dim.id && 
      dimensionsOverlap(dim, other)
    );

    if (overlapping.length > 0) {
      warnings.push(`Dimension ${dim.id} may overlap with ${overlapping[0].id}`);
    }

    // Check text size compliance
    if (dim.style.textSize < 0.125) {
      errors.push(`Dimension ${dim.id} text size ${dim.style.textSize} is below minimum 0.125"`);
    }

    // Check extension line offset
    if (dim.style.extensionLineOffset < 0.0625) {
      warnings.push(`Dimension ${dim.id} extension line offset should be at least 1/16"`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if two dimensions overlap
 */
function dimensionsOverlap(dim1: Dimension, dim2: Dimension): boolean {
  const distance = Math.sqrt(
    Math.pow(dim1.textPosition.x - dim2.textPosition.x, 2) +
    Math.pow(dim1.textPosition.y - dim2.textPosition.y, 2)
  );
  
  const minDistance = (dim1.style.textSize + dim2.style.textSize) * 2;
  return distance < minDistance;
}