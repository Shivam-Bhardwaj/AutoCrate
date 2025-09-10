/**
 * Applied Materials Title Block Template
 * Based on 0251-70054 Rev. 08 Drawing Standards
 * Size D Sheet (34" x 22") Standard Format
 */

export interface TitleBlockTemplate {
  dimensions: {
    width: number;
    height: number;
    position: { x: number; y: number };
  };
  zones: TitleBlockZone[];
  textStyles: Record<string, TextStyle>;
  lineStyles: Record<string, LineStyle>;
}

export interface TitleBlockZone {
  id: string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fields: TitleBlockField[];
  borders: BorderDefinition[];
}

export interface TitleBlockField {
  id: string;
  label: string;
  value: string | number;
  position: { x: number; y: number };
  textStyle: string;
  alignment: 'left' | 'center' | 'right';
  required: boolean;
  maxLength?: number;
  validation?: (value: any) => boolean;
}

export interface BorderDefinition {
  type: 'line' | 'rectangle';
  start: { x: number; y: number };
  end?: { x: number; y: number };
  width?: number;
  height?: number;
  style: string;
}

export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | 'light';
  color: string;
  lineHeight: number;
}

export interface LineStyle {
  width: number;
  color: string;
  type: 'solid' | 'dashed' | 'dotted';
}

/**
 * Applied Materials standard text styles
 */
export const AMAT_TEXT_STYLES: Record<string, TextStyle> = {
  titleLarge: {
    fontSize: 14,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 1.2
  },
  titleMedium: {
    fontSize: 12,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 1.2
  },
  labelBold: {
    fontSize: 8,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 1.1
  },
  labelNormal: {
    fontSize: 8,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    color: '#000000',
    lineHeight: 1.1
  },
  valueNormal: {
    fontSize: 10,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    color: '#000000',
    lineHeight: 1.1
  },
  valueLarge: {
    fontSize: 12,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    color: '#000000',
    lineHeight: 1.1
  },
  companyName: {
    fontSize: 12,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 1.2
  },
  tolerance: {
    fontSize: 7,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    color: '#000000',
    lineHeight: 1.0
  }
};

/**
 * Applied Materials standard line styles
 */
export const AMAT_LINE_STYLES: Record<string, LineStyle> = {
  border: {
    width: 0.7,
    color: '#000000',
    type: 'solid'
  },
  divider: {
    width: 0.5,
    color: '#000000',
    type: 'solid'
  },
  light: {
    width: 0.35,
    color: '#000000',
    type: 'solid'
  }
};

/**
 * Applied Materials Size D Title Block Template
 * Positioned at bottom right of 34" x 22" sheet
 */
export const AMAT_TITLE_BLOCK_TEMPLATE: TitleBlockTemplate = {
  dimensions: {
    width: 8.5,
    height: 4.0,
    position: { x: 25.0, y: 0.5 } // 0.5" margin from bottom and right edges
  },
  textStyles: AMAT_TEXT_STYLES,
  lineStyles: AMAT_LINE_STYLES,
  zones: [
    // Company Information Zone (Top)
    {
      id: 'company',
      name: 'Company Information',
      bounds: { x: 0, y: 2.8, width: 8.5, height: 1.2 },
      fields: [
        {
          id: 'companyName',
          label: 'Company',
          value: 'Applied Materials',
          position: { x: 0.1, y: 3.6 },
          textStyle: 'companyName',
          alignment: 'left',
          required: true
        },
        {
          id: 'companyAddress1',
          label: 'Address Line 1',
          value: '3050 Bowers Ave',
          position: { x: 0.1, y: 3.3 },
          textStyle: 'labelNormal',
          alignment: 'left',
          required: true
        },
        {
          id: 'companyAddress2',
          label: 'Address Line 2',
          value: 'Santa Clara, CA 95054',
          position: { x: 0.1, y: 3.1 },
          textStyle: 'labelNormal',
          alignment: 'left',
          required: true
        },
        {
          id: 'drawingTitle',
          label: 'Drawing Title',
          value: '',
          position: { x: 2.2, y: 3.6 },
          textStyle: 'titleLarge',
          alignment: 'left',
          required: true,
          maxLength: 50
        }
      ],
      borders: [
        { type: 'rectangle', start: { x: 0, y: 2.8 }, width: 8.5, height: 1.2, style: 'border' },
        { type: 'line', start: { x: 2.0, y: 2.8 }, end: { x: 2.0, y: 4.0 }, style: 'divider' }
      ]
    },

    // Drawing Information Zone (Middle)
    {
      id: 'drawingInfo',
      name: 'Drawing Information',
      bounds: { x: 0, y: 1.6, width: 8.5, height: 1.2 },
      fields: [
        {
          id: 'partNumber',
          label: 'PART NO.',
          value: '',
          position: { x: 0.1, y: 2.4 },
          textStyle: 'valueNormal',
          alignment: 'left',
          required: true,
          maxLength: 20,
          validation: (value: string) => /^0205-\d{5}$/.test(value)
        },
        {
          id: 'partNumberLabel',
          label: '',
          value: 'PART NO.',
          position: { x: 0.1, y: 2.6 },
          textStyle: 'labelBold',
          alignment: 'left',
          required: true
        },
        {
          id: 'tcNumber',
          label: 'TC ENG NO.',
          value: '',
          position: { x: 2.2, y: 2.4 },
          textStyle: 'valueNormal',
          alignment: 'left',
          required: true,
          maxLength: 20,
          validation: (value: string) => /^TC2-\d{7}$/.test(value)
        },
        {
          id: 'tcNumberLabel',
          label: '',
          value: 'TC ENG NO.',
          position: { x: 2.2, y: 2.6 },
          textStyle: 'labelBold',
          alignment: 'left',
          required: true
        },
        {
          id: 'size',
          label: 'SIZE',
          value: 'D',
          position: { x: 4.2, y: 2.4 },
          textStyle: 'titleLarge',
          alignment: 'left',
          required: true
        },
        {
          id: 'sizeLabel',
          label: '',
          value: 'SIZE',
          position: { x: 4.2, y: 2.6 },
          textStyle: 'labelBold',
          alignment: 'left',
          required: true
        },
        {
          id: 'sheetNumber',
          label: 'SHEET',
          value: '',
          position: { x: 6.2, y: 2.4 },
          textStyle: 'valueNormal',
          alignment: 'left',
          required: true
        },
        {
          id: 'sheetLabel',
          label: '',
          value: 'SHEET',
          position: { x: 6.2, y: 2.6 },
          textStyle: 'labelBold',
          alignment: 'left',
          required: true
        }
      ],
      borders: [
        { type: 'rectangle', start: { x: 0, y: 1.6 }, width: 8.5, height: 1.2, style: 'border' },
        { type: 'line', start: { x: 2.0, y: 1.6 }, end: { x: 2.0, y: 2.8 }, style: 'divider' },
        { type: 'line', start: { x: 4.0, y: 1.6 }, end: { x: 4.0, y: 2.8 }, style: 'divider' },
        { type: 'line', start: { x: 6.0, y: 1.6 }, end: { x: 6.0, y: 2.8 }, style: 'divider' }
      ]
    },

    // Material & Properties Zone
    {
      id: 'properties',
      name: 'Material and Properties',
      bounds: { x: 0, y: 0.8, width: 8.5, height: 0.8 },
      fields: [
        {
          id: 'weight',
          label: 'WEIGHT',
          value: '',
          position: { x: 0.1, y: 1.2 },
          textStyle: 'valueNormal',
          alignment: 'left',
          required: true
        },
        {
          id: 'weightLabel',
          label: '',
          value: 'WEIGHT',
          position: { x: 0.1, y: 1.4 },
          textStyle: 'labelBold',
          alignment: 'left',
          required: true
        },
        {
          id: 'material',
          label: 'MATERIAL',
          value: '',
          position: { x: 2.2, y: 1.2 },
          textStyle: 'valueNormal',
          alignment: 'left',
          required: true
        },
        {
          id: 'materialLabel',
          label: '',
          value: 'MATERIAL',
          position: { x: 2.2, y: 1.4 },
          textStyle: 'labelBold',
          alignment: 'left',
          required: true
        },
        {
          id: 'finish',
          label: 'FINISH',
          value: '',
          position: { x: 4.2, y: 1.2 },
          textStyle: 'valueNormal',
          alignment: 'left',
          required: true
        },
        {
          id: 'finishLabel',
          label: '',
          value: 'FINISH',
          position: { x: 4.2, y: 1.4 },
          textStyle: 'labelBold',
          alignment: 'left',
          required: true
        },
        {
          id: 'scale',
          label: 'SCALE',
          value: 'AS NOTED',
          position: { x: 6.2, y: 1.2 },
          textStyle: 'valueNormal',
          alignment: 'left',
          required: true
        },
        {
          id: 'scaleLabel',
          label: '',
          value: 'SCALE',
          position: { x: 6.2, y: 1.4 },
          textStyle: 'labelBold',
          alignment: 'left',
          required: true
        },
        {
          id: 'tolerances',
          label: 'TOLERANCES:',
          value: '.XX ±.01, .XXX ±.005',
          position: { x: 0.1, y: 0.95 },
          textStyle: 'tolerance',
          alignment: 'left',
          required: true
        },
        {
          id: 'tolerancesLabel',
          label: '',
          value: 'TOLERANCES:',
          position: { x: 0.1, y: 1.05 },
          textStyle: 'labelBold',
          alignment: 'left',
          required: true
        }
      ],
      borders: [
        { type: 'rectangle', start: { x: 0, y: 0.8 }, width: 8.5, height: 0.8, style: 'border' },
        { type: 'line', start: { x: 2.0, y: 0.8 }, end: { x: 2.0, y: 1.6 }, style: 'divider' },
        { type: 'line', start: { x: 4.0, y: 0.8 }, end: { x: 4.0, y: 1.6 }, style: 'divider' },
        { type: 'line', start: { x: 6.0, y: 0.8 }, end: { x: 6.0, y: 1.6 }, style: 'divider' }
      ]
    },

    // Approval Zone (Bottom)
    {
      id: 'approval',
      name: 'Approval and Revision',
      bounds: { x: 0, y: 0, width: 8.5, height: 0.8 },
      fields: [
        {
          id: 'drawn',
          label: 'DRAWN',
          value: '',
          position: { x: 0.1, y: 0.4 },
          textStyle: 'valueNormal',
          alignment: 'left',
          required: false
        },
        {
          id: 'drawnLabel',
          label: '',
          value: 'DRAWN',
          position: { x: 0.1, y: 0.6 },
          textStyle: 'labelBold',
          alignment: 'left',
          required: true
        },
        {
          id: 'drawnDate',
          label: 'Date',
          value: '',
          position: { x: 0.1, y: 0.2 },
          textStyle: 'labelNormal',
          alignment: 'left',
          required: false
        },
        {
          id: 'checked',
          label: 'CHECKED',
          value: '',
          position: { x: 2.2, y: 0.4 },
          textStyle: 'valueNormal',
          alignment: 'left',
          required: false
        },
        {
          id: 'checkedLabel',
          label: '',
          value: 'CHECKED',
          position: { x: 2.2, y: 0.6 },
          textStyle: 'labelBold',
          alignment: 'left',
          required: true
        },
        {
          id: 'checkedDate',
          label: 'Date',
          value: '',
          position: { x: 2.2, y: 0.2 },
          textStyle: 'labelNormal',
          alignment: 'left',
          required: false
        },
        {
          id: 'approved',
          label: 'APPROVED',
          value: '',
          position: { x: 4.2, y: 0.4 },
          textStyle: 'valueNormal',
          alignment: 'left',
          required: false
        },
        {
          id: 'approvedLabel',
          label: '',
          value: 'APPROVED',
          position: { x: 4.2, y: 0.6 },
          textStyle: 'labelBold',
          alignment: 'left',
          required: true
        },
        {
          id: 'approvedDate',
          label: 'Date',
          value: '',
          position: { x: 4.2, y: 0.2 },
          textStyle: 'labelNormal',
          alignment: 'left',
          required: false
        },
        {
          id: 'revision',
          label: 'REV',
          value: '-',
          position: { x: 6.4, y: 0.4 },
          textStyle: 'titleMedium',
          alignment: 'center',
          required: true
        },
        {
          id: 'revisionLabel',
          label: '',
          value: 'REV',
          position: { x: 6.4, y: 0.6 },
          textStyle: 'labelBold',
          alignment: 'center',
          required: true
        }
      ],
      borders: [
        { type: 'rectangle', start: { x: 0, y: 0 }, width: 8.5, height: 0.8, style: 'border' },
        { type: 'line', start: { x: 2.0, y: 0 }, end: { x: 2.0, y: 0.8 }, style: 'divider' },
        { type: 'line', start: { x: 4.0, y: 0 }, end: { x: 4.0, y: 0.8 }, style: 'divider' },
        { type: 'line', start: { x: 6.0, y: 0 }, end: { x: 6.0, y: 0.8 }, style: 'divider' }
      ]
    }
  ]
};

/**
 * Validate title block data against Applied Materials standards
 */
export function validateTitleBlockData(data: Record<string, any>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate part number format
  if (data.partNumber && !/^0205-\d{5}$/.test(data.partNumber)) {
    errors.push('Part number must follow format: 0205-XXXXX');
  }

  // Validate TC number format
  if (data.tcNumber && !/^TC2-\d{7}$/.test(data.tcNumber)) {
    errors.push('TC number must follow format: TC2-XXXXXXX');
  }

  // Check required fields
  const requiredFields = ['drawingTitle', 'partNumber', 'tcNumber', 'size', 'sheetNumber'];
  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`Required field missing: ${field}`);
    }
  });

  // Validate drawing title length
  if (data.drawingTitle && data.drawingTitle.length > 50) {
    warnings.push('Drawing title exceeds recommended 50 character limit');
  }

  // Validate size is D for Applied Materials standard
  if (data.size && data.size !== 'D') {
    warnings.push('Applied Materials standard uses Size D sheets (34" x 22")');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate title block field values from crate configuration
 */
export function generateTitleBlockFromConfig(
  projectName: string,
  partNumber: string,
  tcNumber: string,
  sheetNumber: number,
  totalSheets: number,
  weight: number,
  material: string = 'SEE BOM',
  finish: string = 'NONE'
): Record<string, any> {
  return {
    drawingTitle: `CRATE ASSY, ${projectName.toUpperCase()}`,
    partNumber,
    tcNumber,
    size: 'D',
    sheetNumber: `${sheetNumber} OF ${totalSheets}`,
    weight: `${weight} LB REF`,
    material,
    finish,
    scale: 'AS NOTED',
    drawn: 'AUTOCRATE',
    drawnDate: new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }),
    revision: '-'
  };
}