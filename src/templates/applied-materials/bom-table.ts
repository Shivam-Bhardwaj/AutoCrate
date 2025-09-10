/**
 * Applied Materials Bill of Materials (BOM) Table Template
 * Based on 0251-70054 Rev. 08 Drawing Standards
 */

export interface BOMTableTemplate {
  dimensions: {
    position: { x: number; y: number };
    columnWidths: number[];
    rowHeight: number;
    headerHeight: number;
    maxRows: number;
  };
  columns: BOMColumn[];
  styles: BOMStyles;
}

export interface BOMColumn {
  id: string;
  header: string;
  width: number;
  alignment: 'left' | 'center' | 'right';
  dataType: 'text' | 'number' | 'integer';
  required: boolean;
  maxLength?: number;
  format?: string; // For number formatting
}

export interface BOMEntry {
  item: number;
  quantity: number | string;
  partNumber: string;
  description: string;
  tcEngNumber: string;
  material?: string;
  length?: number;
  width?: number;
  thickness?: number;
  finish?: string;
  notes?: string;
  weight?: number;
  isAssembly?: boolean;
  isCritical?: boolean;
}

export interface BOMStyles {
  header: {
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    backgroundColor: string;
    textColor: string;
    borderWidth: number;
  };
  row: {
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    alternateBackgroundColor?: string;
    textColor: string;
    borderWidth: number;
  };
  title: {
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    textColor: string;
  };
}

/**
 * Applied Materials standard BOM table template
 * Positioned in upper right area of drawing sheet
 */
export const AMAT_BOM_TABLE_TEMPLATE: BOMTableTemplate = {
  dimensions: {
    position: { x: 18, y: 12 }, // Upper right quadrant
    columnWidths: [0.6, 0.8, 2.0, 4.0, 2.0], // ITEM, QTY, PART NO., DESCRIPTION, TC ENG NO.
    rowHeight: 0.25,
    headerHeight: 0.35,
    maxRows: 20
  },
  columns: [
    {
      id: 'item',
      header: 'ITEM',
      width: 0.6,
      alignment: 'center',
      dataType: 'integer',
      required: true
    },
    {
      id: 'quantity',
      header: 'QTY',
      width: 0.8,
      alignment: 'center',
      dataType: 'text', // Can be number or "AR" (As Required)
      required: true
    },
    {
      id: 'partNumber',
      header: 'PART NO.',
      width: 2.0,
      alignment: 'left',
      dataType: 'text',
      required: true,
      maxLength: 20
    },
    {
      id: 'description',
      header: 'DESCRIPTION',
      width: 4.0,
      alignment: 'left',
      dataType: 'text',
      required: true,
      maxLength: 50
    },
    {
      id: 'tcEngNumber',
      header: 'TC ENG NO.',
      width: 2.0,
      alignment: 'left',
      dataType: 'text',
      required: false,
      maxLength: 20
    }
  ],
  styles: {
    header: {
      fontSize: 10,
      fontWeight: 'bold',
      backgroundColor: '#E6E6E6',
      textColor: '#000000',
      borderWidth: 1.0
    },
    row: {
      fontSize: 9,
      fontWeight: 'normal',
      alternateBackgroundColor: '#F5F5F5',
      textColor: '#000000',
      borderWidth: 0.5
    },
    title: {
      fontSize: 12,
      fontWeight: 'bold',
      textColor: '#000000'
    }
  }
};

/**
 * Generate BOM entries from crate configuration
 */
export function generateBOMFromCrateConfig(config: any): BOMEntry[] {
  const bomEntries: BOMEntry[] = [];
  let itemNumber = 1;

  // Base/Skid components
  bomEntries.push({
    item: itemNumber++,
    quantity: config.base.skidCount,
    partNumber: generateSkidPartNumber(config.base),
    description: `SKID, ${config.base.skidWidth}" x ${config.base.skidHeight}", ${config.base.material.toUpperCase()}`,
    tcEngNumber: '',
    material: config.base.material.toUpperCase(),
    length: config.dimensions.length,
    width: config.base.skidWidth,
    thickness: config.base.skidHeight,
    isCritical: true
  });

  // Floorboard
  bomEntries.push({
    item: itemNumber++,
    quantity: calculateFloorboardQuantity(config),
    partNumber: generateFloorboardPartNumber(config),
    description: `FLOORBOARD, ${config.base.floorboardThickness}" ${config.base.material.toUpperCase()}`,
    tcEngNumber: '',
    material: config.base.material.toUpperCase(),
    length: config.dimensions.length,
    width: config.dimensions.width,
    thickness: config.base.floorboardThickness
  });

  // Panel components
  const panels = [
    { name: 'FRONT', config: config.cap.frontPanel, dimensions: [config.dimensions.length, config.dimensions.height] },
    { name: 'BACK', config: config.cap.backPanel, dimensions: [config.dimensions.length, config.dimensions.height] },
    { name: 'LEFT', config: config.cap.leftPanel, dimensions: [config.dimensions.width, config.dimensions.height] },
    { name: 'RIGHT', config: config.cap.rightPanel, dimensions: [config.dimensions.width, config.dimensions.height] },
    { name: 'TOP', config: config.cap.topPanel, dimensions: [config.dimensions.length, config.dimensions.width] }
  ];

  panels.forEach(panel => {
    bomEntries.push({
      item: itemNumber++,
      quantity: 1,
      partNumber: generatePanelPartNumber(panel.config, panel.name),
      description: `PANEL, ${panel.name}, ${panel.config.thickness}" ${panel.config.material.toUpperCase()}`,
      tcEngNumber: '',
      material: panel.config.material.toUpperCase(),
      length: panel.dimensions[0],
      width: panel.dimensions[1],
      thickness: panel.config.thickness,
      isAssembly: panel.config.reinforcement
    });

    // Add cleats if reinforcement is enabled
    if (panel.config.reinforcement) {
      bomEntries.push({
        item: itemNumber++,
        quantity: 'AR',
        partNumber: generateCleatPartNumber(panel.dimensions),
        description: `CLEAT, ${panel.name} PANEL REINFORCEMENT`,
        tcEngNumber: '',
        material: 'PINE',
        notes: 'AS REQUIRED FOR REINFORCEMENT'
      });
    }
  });

  // Fasteners
  bomEntries.push({
    item: itemNumber++,
    quantity: 'AR',
    partNumber: generateFastenerPartNumber(config.fasteners),
    description: `${config.fasteners.type.toUpperCase()}, ${config.fasteners.size}, ${config.fasteners.material.toUpperCase()}`,
    tcEngNumber: '',
    material: config.fasteners.material.toUpperCase(),
    notes: `${config.fasteners.spacing}" SPACING TYP`
  });

  // Vinyl liner if specified
  if (config.vinyl?.enabled) {
    bomEntries.push({
      item: itemNumber++,
      quantity: 1,
      partNumber: generateVinylPartNumber(config.vinyl),
      description: `VINYL LINER, ${config.vinyl.type.toUpperCase()}, ${config.vinyl.thickness}" THICK`,
      tcEngNumber: '',
      material: 'VINYL',
      notes: `${config.vinyl.coverage.toUpperCase()} COVERAGE`
    });
  }

  // AMAT compliance items
  if (config.amatCompliance?.requiresMoistureBag) {
    bomEntries.push({
      item: itemNumber++,
      quantity: 1,
      partNumber: 'AMAT-MBB-001',
      description: 'MOISTURE BARRIER BAG, ESD SHIELDING',
      tcEngNumber: 'TC2-MBB001',
      material: 'ALUMINUM FOIL LAMINATE',
      isCritical: true
    });
  }

  if (config.amatCompliance?.requiresShockIndicator) {
    bomEntries.push({
      item: itemNumber++,
      quantity: config.amatCompliance.shockIndicatorCount || 1,
      partNumber: 'AMAT-SHOCK-001',
      description: 'SHOCK INDICATOR LABEL',
      tcEngNumber: 'TC2-SHOCK01',
      material: 'ADHESIVE LABEL',
      isCritical: true
    });
  }

  if (config.amatCompliance?.requiresTiltIndicator) {
    bomEntries.push({
      item: itemNumber++,
      quantity: config.amatCompliance.tiltIndicatorCount || 1,
      partNumber: 'AMAT-TILT-001',
      description: 'TILT INDICATOR LABEL',
      tcEngNumber: 'TC2-TILT001',
      material: 'ADHESIVE LABEL',
      isCritical: true
    });
  }

  return bomEntries;
}

/**
 * Part number generation functions
 */
function generateSkidPartNumber(baseConfig: any): string {
  const materialCode = getMaterialCode(baseConfig.material);
  const sizeCode = `${baseConfig.skidWidth}x${baseConfig.skidHeight}`;
  return `SKID-${materialCode}-${sizeCode}`;
}

function generateFloorboardPartNumber(config: any): string {
  const materialCode = getMaterialCode(config.base.material);
  const thicknessCode = config.base.floorboardThickness.toString().replace('.', '');
  return `FB-${materialCode}-${thicknessCode}`;
}

function generatePanelPartNumber(panelConfig: any, panelName: string): string {
  const materialCode = getMaterialCode(panelConfig.material);
  const thicknessCode = panelConfig.thickness.toString().replace('.', '');
  const nameCode = panelName.substring(0, 2);
  return `PNL-${nameCode}-${materialCode}-${thicknessCode}`;
}

function generateCleatPartNumber(dimensions: number[]): string {
  return `CLT-PINE-2X2`;
}

function generateFastenerPartNumber(fastenerConfig: any): string {
  const typeCode = fastenerConfig.type.toUpperCase().substring(0, 3);
  const materialCode = fastenerConfig.material.toUpperCase().substring(0, 3);
  const sizeCode = fastenerConfig.size.replace(/[^0-9]/g, '');
  return `${typeCode}-${materialCode}-${sizeCode}`;
}

function generateVinylPartNumber(vinylConfig: any): string {
  const typeCode = vinylConfig.type.toUpperCase().substring(0, 3);
  const thicknessCode = (vinylConfig.thickness * 1000).toString(); // Convert to mils
  return `VNL-${typeCode}-${thicknessCode}`;
}

function getMaterialCode(material: string): string {
  const codes: Record<string, string> = {
    'pine': 'PINE',
    'oak': 'OAK',
    'plywood': 'PLY',
    'osb': 'OSB',
    'solid-wood': 'WOOD'
  };
  return codes[material] || material.toUpperCase();
}

/**
 * Calculate quantities for components
 */
function calculateFloorboardQuantity(config: any): number {
  // Calculate number of floorboard pieces based on standard lumber sizes
  const standardWidth = 12; // 12" standard plywood width
  const totalArea = config.dimensions.length * config.dimensions.width;
  const standardArea = config.dimensions.length * standardWidth;
  return Math.ceil(totalArea / standardArea);
}

/**
 * Format BOM table for drawing output
 */
export function formatBOMTable(
  entries: BOMEntry[],
  template: BOMTableTemplate = AMAT_BOM_TABLE_TEMPLATE
): {
  title: string;
  headers: string[];
  rows: string[][];
  dimensions: typeof template.dimensions;
  styles: typeof template.styles;
} {
  const headers = template.columns.map(col => col.header);
  
  const rows = entries.map(entry => {
    return template.columns.map(col => {
      const value = entry[col.id as keyof BOMEntry];
      
      if (value === undefined || value === null) {
        return '';
      }
      
      if (col.dataType === 'number' && typeof value === 'number') {
        return col.format ? formatNumber(value, col.format) : value.toString();
      }
      
      return value.toString();
    });
  });

  return {
    title: 'BILL OF MATERIALS',
    headers,
    rows,
    dimensions: template.dimensions,
    styles: template.styles
  };
}

/**
 * Format numbers according to specified format
 */
function formatNumber(value: number, format: string): string {
  switch (format) {
    case 'decimal2':
      return value.toFixed(2);
    case 'decimal3':
      return value.toFixed(3);
    case 'integer':
      return Math.round(value).toString();
    default:
      return value.toString();
  }
}

/**
 * Validate BOM entries
 */
export function validateBOMEntries(entries: BOMEntry[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  entries.forEach((entry, index) => {
    // Check required fields
    if (!entry.item || entry.item <= 0) {
      errors.push(`Entry ${index + 1}: Invalid item number`);
    }
    
    if (!entry.quantity || (typeof entry.quantity === 'number' && entry.quantity <= 0) || (typeof entry.quantity === 'string' && entry.quantity !== 'AR' && parseInt(entry.quantity) <= 0)) {
      errors.push(`Entry ${index + 1}: Invalid quantity`);
    }
    
    if (!entry.partNumber || entry.partNumber.trim() === '') {
      errors.push(`Entry ${index + 1}: Part number is required`);
    }
    
    if (!entry.description || entry.description.trim() === '') {
      errors.push(`Entry ${index + 1}: Description is required`);
    }

    // Check field length limits
    if (entry.partNumber && entry.partNumber.length > 20) {
      warnings.push(`Entry ${index + 1}: Part number exceeds 20 characters`);
    }
    
    if (entry.description && entry.description.length > 50) {
      warnings.push(`Entry ${index + 1}: Description exceeds 50 characters`);
    }

    // Check for duplicate item numbers
    const duplicates = entries.filter(other => 
      other !== entry && other.item === entry.item
    );
    if (duplicates.length > 0) {
      errors.push(`Duplicate item number ${entry.item} found`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate BOM notes for special requirements
 */
export function generateBOMNotes(config: any): string[] {
  const notes: string[] = [];

  notes.push('ALL LUMBER TO BE KILN DRIED, MOISTURE CONTENT < 19%');
  notes.push('FASTENERS TO BE GALVANIZED STEEL UNLESS NOTED');
  notes.push('ASSEMBLY PER APPLIED MATERIALS SPEC 0251-70054');

  if (config.amatCompliance?.isInternational) {
    notes.push('WOOD TREATMENT REQUIRED FOR INTERNATIONAL SHIPPING');
    notes.push('ISPM-15 COMPLIANCE CERTIFICATION REQUIRED');
  }

  if (config.amatCompliance?.style) {
    notes.push(`AMAT CRATE STYLE ${config.amatCompliance.style} CONFIGURATION`);
  }

  if (config.specialRequirements && config.specialRequirements.length > 0) {
    notes.push('SPECIAL REQUIREMENTS:');
    config.specialRequirements.forEach((req: string) => {
      notes.push(`  - ${req.toUpperCase()}`);
    });
  }

  return notes;
}