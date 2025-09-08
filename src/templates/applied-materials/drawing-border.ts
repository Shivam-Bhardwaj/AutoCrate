/**
 * Applied Materials Drawing Border Template
 * Based on 0251-70054 Rev. 08 Drawing Standards
 * Size D Sheet (34" x 22") with standard margins and zones
 */

export interface DrawingBorder {
  sheetSize: SheetSize;
  margins: Margins;
  zones: DrawingZone[];
  grid: GridDefinition;
  referenceMarks: ReferenceMark[];
  standardElements: StandardElement[];
}

export interface SheetSize {
  name: string;
  width: number; // inches
  height: number; // inches
  printableArea: {
    width: number;
    height: number;
  };
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
  binding?: number; // Additional margin for binding
}

export interface DrawingZone {
  id: string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  purpose: string;
  priority: 'high' | 'medium' | 'low';
}

export interface GridDefinition {
  enabled: boolean;
  spacing: number; // inches
  subdivisions: number;
  style: {
    majorLineWidth: number;
    minorLineWidth: number;
    majorLineColor: string;
    minorLineColor: string;
    opacity: number;
  };
}

export interface ReferenceMark {
  type: 'letter' | 'number' | 'corner' | 'centering';
  position: { x: number; y: number };
  value: string;
  style: {
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    color: string;
  };
}

export interface StandardElement {
  type: 'projection-symbol' | 'scale-note' | 'tolerance-note' | 'confidential' | 'revision-block';
  position: { x: number; y: number };
  content: string;
  style: ElementStyle;
  required: boolean;
}

export interface ElementStyle {
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  backgroundColor?: string;
  borderWidth?: number;
  alignment: 'left' | 'center' | 'right';
}

/**
 * Applied Materials Size D (34" x 22") drawing border
 */
export const AMAT_SIZE_D_BORDER: DrawingBorder = {
  sheetSize: {
    name: 'D',
    width: 34.0,
    height: 22.0,
    printableArea: {
      width: 33.0,
      height: 21.0
    }
  },
  margins: {
    top: 0.5,
    right: 0.5,
    bottom: 0.5,
    left: 0.5,
    binding: 0.0 // No binding margin for standard sheets
  },
  zones: [
    // Main drawing area (central zone)
    {
      id: 'drawing-main',
      name: 'Main Drawing Area',
      bounds: { x: 0.5, y: 4.5, width: 24.5, height: 17.0 },
      purpose: 'Primary drawing content, views, and dimensions',
      priority: 'high'
    },
    // Title block area (bottom right)
    {
      id: 'title-block',
      name: 'Title Block',
      bounds: { x: 25.0, y: 0.5, width: 8.5, height: 4.0 },
      purpose: 'Drawing identification and approval information',
      priority: 'high'
    },
    // BOM area (upper right)
    {
      id: 'bom-table',
      name: 'Bill of Materials',
      bounds: { x: 25.0, y: 12.0, width: 8.5, height: 9.5 },
      purpose: 'Parts list and material specifications',
      priority: 'high'
    },
    // Revision block (upper right above BOM)
    {
      id: 'revision-block',
      name: 'Revision Block',
      bounds: { x: 26.0, y: 18.0, width: 7.5, height: 3.5 },
      purpose: 'Drawing revision history',
      priority: 'medium'
    },
    // Notes area (lower left)
    {
      id: 'notes-area',
      name: 'General Notes',
      bounds: { x: 0.5, y: 0.5, width: 12.0, height: 4.0 },
      purpose: 'General notes and specifications',
      priority: 'medium'
    },
    // Logo/Company area (left of title block)
    {
      id: 'company-info',
      name: 'Company Information',
      bounds: { x: 13.0, y: 0.5, width: 11.5, height: 4.0 },
      purpose: 'Company logo and contact information',
      priority: 'low'
    }
  ],
  grid: {
    enabled: false, // Typically disabled for final drawings
    spacing: 0.5,
    subdivisions: 4,
    style: {
      majorLineWidth: 0.25,
      minorLineWidth: 0.1,
      majorLineColor: '#CCCCCC',
      minorLineColor: '#EEEEEE',
      opacity: 0.3
    }
  },
  referenceMarks: [
    // Corner marks
    { type: 'corner', position: { x: 0.25, y: 0.25 }, value: '⌜', style: { fontSize: 12, fontWeight: 'bold', color: '#000000' } },
    { type: 'corner', position: { x: 33.75, y: 0.25 }, value: '⌝', style: { fontSize: 12, fontWeight: 'bold', color: '#000000' } },
    { type: 'corner', position: { x: 0.25, y: 21.75 }, value: '⌞', style: { fontSize: 12, fontWeight: 'bold', color: '#000000' } },
    { type: 'corner', position: { x: 33.75, y: 21.75 }, value: '⌟', style: { fontSize: 12, fontWeight: 'bold', color: '#000000' } },
    
    // Zone reference letters (top)
    { type: 'letter', position: { x: 4.0, y: 21.75 }, value: 'A', style: { fontSize: 10, fontWeight: 'bold', color: '#000000' } },
    { type: 'letter', position: { x: 10.0, y: 21.75 }, value: 'B', style: { fontSize: 10, fontWeight: 'bold', color: '#000000' } },
    { type: 'letter', position: { x: 16.0, y: 21.75 }, value: 'C', style: { fontSize: 10, fontWeight: 'bold', color: '#000000' } },
    { type: 'letter', position: { x: 22.0, y: 21.75 }, value: 'D', style: { fontSize: 10, fontWeight: 'bold', color: '#000000' } },
    { type: 'letter', position: { x: 28.0, y: 21.75 }, value: 'E', style: { fontSize: 10, fontWeight: 'bold', color: '#000000' } },

    // Zone reference numbers (right side)
    { type: 'number', position: { x: 33.75, y: 18.0 }, value: '1', style: { fontSize: 10, fontWeight: 'bold', color: '#000000' } },
    { type: 'number', position: { x: 33.75, y: 14.0 }, value: '2', style: { fontSize: 10, fontWeight: 'bold', color: '#000000' } },
    { type: 'number', position: { x: 33.75, y: 10.0 }, value: '3', style: { fontSize: 10, fontWeight: 'bold', color: '#000000' } },
    { type: 'number', position: { x: 33.75, y: 6.0 }, value: '4', style: { fontSize: 10, fontWeight: 'bold', color: '#000000' } },
    { type: 'number', position: { x: 33.75, y: 2.0 }, value: '5', style: { fontSize: 10, fontWeight: 'bold', color: '#000000' } },

    // Centering marks
    { type: 'centering', position: { x: 17.0, y: 0.125 }, value: '⊥', style: { fontSize: 8, fontWeight: 'normal', color: '#000000' } },
    { type: 'centering', position: { x: 17.0, y: 21.875 }, value: '⊥', style: { fontSize: 8, fontWeight: 'normal', color: '#000000' } },
    { type: 'centering', position: { x: 0.125, y: 11.0 }, value: '⊣', style: { fontSize: 8, fontWeight: 'normal', color: '#000000' } },
    { type: 'centering', position: { x: 33.875, y: 11.0 }, value: '⊢', style: { fontSize: 8, fontWeight: 'normal', color: '#000000' } }
  ],
  standardElements: [
    // Third angle projection symbol
    {
      type: 'projection-symbol',
      position: { x: 1.0, y: 0.75 },
      content: '⟲ THIRD ANGLE PROJECTION',
      style: {
        fontSize: 8,
        fontWeight: 'normal',
        color: '#000000',
        alignment: 'left'
      },
      required: true
    },
    // Scale note
    {
      type: 'scale-note',
      position: { x: 1.0, y: 1.25 },
      content: 'SCALE: AS NOTED',
      style: {
        fontSize: 8,
        fontWeight: 'normal',
        color: '#000000',
        alignment: 'left'
      },
      required: true
    },
    // Tolerance note
    {
      type: 'tolerance-note',
      position: { x: 1.0, y: 1.75 },
      content: 'TOLERANCES: .XX ±.01, .XXX ±.005',
      style: {
        fontSize: 8,
        fontWeight: 'normal',
        color: '#000000',
        alignment: 'left'
      },
      required: true
    },
    // Units note
    {
      type: 'tolerance-note',
      position: { x: 1.0, y: 2.25 },
      content: 'ALL DIMENSIONS IN INCHES UNLESS OTHERWISE SPECIFIED',
      style: {
        fontSize: 8,
        fontWeight: 'normal',
        color: '#000000',
        alignment: 'left'
      },
      required: true
    },
    // Confidential notice
    {
      type: 'confidential',
      position: { x: 17.0, y: 0.25 },
      content: 'APPLIED MATERIALS CONFIDENTIAL',
      style: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000000',
        alignment: 'center'
      },
      required: true
    },
    // Material note
    {
      type: 'tolerance-note',
      position: { x: 1.0, y: 2.75 },
      content: 'WOOD MOISTURE CONTENT NOT TO EXCEED 19%',
      style: {
        fontSize: 8,
        fontWeight: 'normal',
        color: '#000000',
        alignment: 'left'
      },
      required: true
    },
    // Lumber specification
    {
      type: 'tolerance-note',
      position: { x: 1.0, y: 3.25 },
      content: 'ALL LUMBER TO BE KILN DRIED CONSTRUCTION GRADE',
      style: {
        fontSize: 8,
        fontWeight: 'normal',
        color: '#000000',
        alignment: 'left'
      },
      required: true
    },
    // ASME standard reference
    {
      type: 'tolerance-note',
      position: { x: 1.0, y: 3.75 },
      content: 'INTERPRET DRAWING PER ASME Y14.5-2009',
      style: {
        fontSize: 8,
        fontWeight: 'normal',
        color: '#000000',
        alignment: 'left'
      },
      required: true
    }
  ]
};

/**
 * Border line definitions for drawing sheet
 */
export interface BorderLine {
  type: 'outer' | 'inner' | 'zone';
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  style: {
    width: number;
    color: string;
    type: 'solid' | 'dashed' | 'dotted';
  };
}

/**
 * Generate border lines for Size D sheet
 */
export function generateBorderLines(border: DrawingBorder): BorderLine[] {
  const lines: BorderLine[] = [];
  const { width, height } = border.sheetSize;
  const { top, right, bottom, left } = border.margins;

  // Outer border (sheet edge)
  lines.push(
    // Top
    {
      type: 'outer',
      startPoint: { x: 0, y: height },
      endPoint: { x: width, y: height },
      style: { width: 2.0, color: '#000000', type: 'solid' }
    },
    // Right
    {
      type: 'outer',
      startPoint: { x: width, y: height },
      endPoint: { x: width, y: 0 },
      style: { width: 2.0, color: '#000000', type: 'solid' }
    },
    // Bottom
    {
      type: 'outer',
      startPoint: { x: width, y: 0 },
      endPoint: { x: 0, y: 0 },
      style: { width: 2.0, color: '#000000', type: 'solid' }
    },
    // Left
    {
      type: 'outer',
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 0, y: height },
      style: { width: 2.0, color: '#000000', type: 'solid' }
    }
  );

  // Inner border (drawing area)
  const innerLeft = left;
  const innerRight = width - right;
  const innerTop = height - top;
  const innerBottom = bottom;

  lines.push(
    // Top
    {
      type: 'inner',
      startPoint: { x: innerLeft, y: innerTop },
      endPoint: { x: innerRight, y: innerTop },
      style: { width: 1.0, color: '#000000', type: 'solid' }
    },
    // Right
    {
      type: 'inner',
      startPoint: { x: innerRight, y: innerTop },
      endPoint: { x: innerRight, y: innerBottom },
      style: { width: 1.0, color: '#000000', type: 'solid' }
    },
    // Bottom
    {
      type: 'inner',
      startPoint: { x: innerRight, y: innerBottom },
      endPoint: { x: innerLeft, y: innerBottom },
      style: { width: 1.0, color: '#000000', type: 'solid' }
    },
    // Left
    {
      type: 'inner',
      startPoint: { x: innerLeft, y: innerBottom },
      endPoint: { x: innerLeft, y: innerTop },
      style: { width: 1.0, color: '#000000', type: 'solid' }
    }
  );

  // Zone divider lines
  border.zones.forEach(zone => {
    const zoneBounds = zone.bounds;
    const zoneX = zoneBounds.x;
    const zoneY = zoneBounds.y;
    const zoneWidth = zoneBounds.width;
    const zoneHeight = zoneBounds.height;
    
    if (zoneX > innerLeft && zoneX < innerRight) {
      lines.push({
        type: 'zone',
        startPoint: { x: zoneX, y: zoneY },
        endPoint: { x: zoneX, y: zoneY + zoneHeight },
        style: { width: 0.5, color: '#666666', type: 'dashed' }
      });
    }
    
    if (zoneY > innerBottom && zoneY < innerTop) {
      lines.push({
        type: 'zone',
        startPoint: { x: zoneX, y: zoneY },
        endPoint: { x: zoneX + zoneWidth, y: zoneY },
        style: { width: 0.5, color: '#666666', type: 'dashed' }
      });
    }
  });

  return lines;
}

/**
 * Generate revision block template
 */
export function generateRevisionBlock(): {
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  columns: Array<{
    header: string;
    width: number;
    alignment: 'left' | 'center' | 'right';
  }>;
  maxEntries: number;
} {
  return {
    position: { x: 26.0, y: 18.0 },
    dimensions: { width: 7.5, height: 3.5 },
    columns: [
      { header: 'REV', width: 0.5, alignment: 'center' },
      { header: 'DESCRIPTION', width: 4.0, alignment: 'left' },
      { header: 'DATE', width: 1.5, alignment: 'center' },
      { header: 'BY', width: 1.5, alignment: 'center' }
    ],
    maxEntries: 10
  };
}

/**
 * Validate drawing layout against Applied Materials standards
 */
export function validateDrawingLayout(elements: any[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required elements
  const requiredElements = ['projection-symbol', 'tolerance-note', 'confidential'];
  requiredElements.forEach(elementType => {
    const found = elements.some(el => el.type === elementType);
    if (!found) {
      errors.push(`Required element missing: ${elementType}`);
    }
  });

  // Check margins
  elements.forEach(element => {
    const { x, y } = element.position;
    if (x < 0.5 || x > 33.5 || y < 0.5 || y > 21.5) {
      warnings.push(`Element ${element.type} may be outside printable area`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate standard notes for Applied Materials drawings
 */
export function generateStandardNotes(crateConfig?: any): string[] {
  const notes = [
    'ALL DIMENSIONS IN INCHES UNLESS OTHERWISE SPECIFIED',
    'TOLERANCES: .XX ±.01, .XXX ±.005',
    'THIRD ANGLE PROJECTION',
    'INTERPRET DRAWING PER ASME Y14.5-2009',
    'WOOD MOISTURE CONTENT NOT TO EXCEED 19%',
    'ALL LUMBER TO BE KILN DRIED CONSTRUCTION GRADE',
    'FASTENERS TO BE GALVANIZED STEEL UNLESS NOTED',
    'ASSEMBLY PER APPLIED MATERIALS SPEC 0251-70054'
  ];

  if (crateConfig?.amatCompliance?.isInternational) {
    notes.push('WOOD TREATMENT REQUIRED FOR INTERNATIONAL SHIPPING');
    notes.push('ISPM-15 COMPLIANCE CERTIFICATION REQUIRED');
  }

  if (crateConfig?.amatCompliance?.requiresMoistureBag) {
    notes.push('MOISTURE SENSITIVE DEVICE - HANDLE PER ESD PROCEDURES');
    notes.push('MAINTAIN DESICCANT SEAL UNTIL INSTALLATION');
  }

  return notes;
}

/**
 * Generate Applied Materials compliant drawing sheet
 */
export function generateDrawingSheet(config: {
  sheetNumber: number;
  totalSheets: number;
  title: string;
  crateConfig?: any;
}): {
  border: DrawingBorder;
  borderLines: BorderLine[];
  standardNotes: string[];
  revisionBlock: ReturnType<typeof generateRevisionBlock>;
} {
  return {
    border: AMAT_SIZE_D_BORDER,
    borderLines: generateBorderLines(AMAT_SIZE_D_BORDER),
    standardNotes: generateStandardNotes(config.crateConfig),
    revisionBlock: generateRevisionBlock()
  };
}