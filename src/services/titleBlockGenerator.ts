export interface TitleBlockData {
  partNumber: string;
  tcNumber: string;
  title: string;
  size: 'A' | 'B' | 'C' | 'D' | 'E';
  sheetNumber: number;
  totalSheets: number;
  weight: number; // in pounds
  material: string;
  finish: string;
  drawnBy?: string;
  checkedBy?: string;
  approvedBy?: string;
  dateDrawn?: string;
  dateChecked?: string;
  dateApproved?: string;
  revision?: string;
  revisionDate?: string;
  scale?: string;
  tolerances: {
    decimal: string;
    fractional: string;
  };
  company: CompanyInfo;
}

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  website?: string;
}

export interface TitleBlockInput {
  partNumber: string;
  tcNumber: string;
  title: string;
  size: 'A' | 'B' | 'C' | 'D' | 'E';
  sheetNumber: number;
  totalSheets: number;
  weight: number;
  material: string;
  finish: string;
  drawnBy?: string;
  checkedBy?: string;
  approvedBy?: string;
  dateDrawn?: string;
  dateChecked?: string;
  dateApproved?: string;
  revision?: string;
  scale?: string;
}

export interface TitleBlockElement {
  type: 'line' | 'text' | 'rectangle';
  position: { x: number; y: number };
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  alignment?: 'left' | 'center' | 'right';
  style?: {
    lineWeight: number;
    lineType: 'solid' | 'dashed';
  };
}

/**
 * Applied Materials standard company information
 */
const APPLIED_MATERIALS_INFO: CompanyInfo = {
  name: 'Applied Materials',
  address: '3050 Bowers Ave',
  city: 'Santa Clara',
  state: 'CA',
  zipCode: '95054',
  phone: '(408) 727-5555',
  website: 'www.appliedmaterials.com'
};

/**
 * Standard tolerances for Applied Materials drawings
 */
const STANDARD_TOLERANCES = {
  decimal: '.XX ±.01, .XXX ±.005',
  fractional: '±1/32"'
};

/**
 * Drawing sheet sizes (in inches)
 */
const SHEET_SIZES = {
  A: { width: 11, height: 8.5 },
  B: { width: 17, height: 11 },
  C: { width: 22, height: 17 },
  D: { width: 34, height: 22 }, // Applied Materials standard
  E: { width: 44, height: 34 }
};

/**
 * Generate complete title block data with Applied Materials standards
 */
export function generateTitleBlock(input: TitleBlockInput): TitleBlockData {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });

  return {
    ...input,
    drawnBy: input.drawnBy || 'AUTOCRATE',
    checkedBy: input.checkedBy || '',
    approvedBy: input.approvedBy || '',
    dateDrawn: input.dateDrawn || currentDate,
    dateChecked: input.dateChecked || '',
    dateApproved: input.dateApproved || '',
    revision: input.revision || '-',
    revisionDate: '',
    scale: input.scale || 'AS NOTED',
    tolerances: STANDARD_TOLERANCES,
    company: APPLIED_MATERIALS_INFO
  };
}

/**
 * Generate title block layout elements for Size D sheets (34" x 22")
 * Applied Materials standard format
 */
export function generateTitleBlockElements(titleBlock: TitleBlockData): TitleBlockElement[] {
  const elements: TitleBlockElement[] = [];
  const sheetSize = SHEET_SIZES[titleBlock.size];
  
  // Title block dimensions for Size D (Applied Materials standard)
  const titleBlockWidth = 8.5; // inches
  const titleBlockHeight = 4.0; // inches
  const startX = sheetSize.width - titleBlockWidth - 0.5; // 0.5" margin from right
  const startY = 0.5; // 0.5" margin from bottom

  // Main title block border
  elements.push({
    type: 'rectangle',
    position: { x: startX, y: startY },
    width: titleBlockWidth,
    height: titleBlockHeight,
    style: { lineWeight: 0.7, lineType: 'solid' }
  });

  // Horizontal divider lines
  const dividerLines = [1.0, 2.0, 2.8, 3.4];
  dividerLines.forEach(offset => {
    elements.push({
      type: 'line',
      position: { x: startX, y: startY + offset },
      width: titleBlockWidth,
      height: 0,
      style: { lineWeight: 0.5, lineType: 'solid' }
    });
  });

  // Vertical divider lines
  const verticalDividers = [2.0, 4.0, 6.0];
  verticalDividers.forEach(offset => {
    elements.push({
      type: 'line',
      position: { x: startX + offset, y: startY },
      width: 0,
      height: titleBlockHeight,
      style: { lineWeight: 0.5, lineType: 'solid' }
    });
  });

  // Company logo area (top section)
  elements.push({
    type: 'text',
    position: { x: startX + 0.1, y: startY + 3.6 },
    text: titleBlock.company.name,
    fontSize: 12,
    fontWeight: 'bold',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 0.1, y: startY + 3.3 },
    text: titleBlock.company.address,
    fontSize: 8,
    fontWeight: 'normal',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 0.1, y: startY + 3.1 },
    text: `${titleBlock.company.city}, ${titleBlock.company.state} ${titleBlock.company.zipCode}`,
    fontSize: 8,
    fontWeight: 'normal',
    alignment: 'left'
  });

  // Drawing title (large text)
  elements.push({
    type: 'text',
    position: { x: startX + 2.2, y: startY + 3.6 },
    text: titleBlock.title,
    fontSize: 14,
    fontWeight: 'bold',
    alignment: 'left'
  });

  // Part number
  elements.push({
    type: 'text',
    position: { x: startX + 0.1, y: startY + 2.6 },
    text: 'PART NO.',
    fontSize: 8,
    fontWeight: 'bold',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 0.1, y: startY + 2.4 },
    text: titleBlock.partNumber,
    fontSize: 10,
    fontWeight: 'normal',
    alignment: 'left'
  });

  // TC Number
  elements.push({
    type: 'text',
    position: { x: startX + 2.2, y: startY + 2.6 },
    text: 'TC ENG NO.',
    fontSize: 8,
    fontWeight: 'bold',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 2.2, y: startY + 2.4 },
    text: titleBlock.tcNumber,
    fontSize: 10,
    fontWeight: 'normal',
    alignment: 'left'
  });

  // Size
  elements.push({
    type: 'text',
    position: { x: startX + 4.2, y: startY + 2.6 },
    text: 'SIZE',
    fontSize: 8,
    fontWeight: 'bold',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 4.2, y: startY + 2.4 },
    text: titleBlock.size,
    fontSize: 14,
    fontWeight: 'bold',
    alignment: 'left'
  });

  // Sheet number
  elements.push({
    type: 'text',
    position: { x: startX + 6.2, y: startY + 2.6 },
    text: 'SHEET',
    fontSize: 8,
    fontWeight: 'bold',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 6.2, y: startY + 2.4 },
    text: `${titleBlock.sheetNumber} OF ${titleBlock.totalSheets}`,
    fontSize: 10,
    fontWeight: 'normal',
    alignment: 'left'
  });

  // Weight
  elements.push({
    type: 'text',
    position: { x: startX + 0.1, y: startY + 1.8 },
    text: 'WEIGHT',
    fontSize: 8,
    fontWeight: 'bold',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 0.1, y: startY + 1.6 },
    text: `${titleBlock.weight} LB REF`,
    fontSize: 10,
    fontWeight: 'normal',
    alignment: 'left'
  });

  // Material
  elements.push({
    type: 'text',
    position: { x: startX + 2.2, y: startY + 1.8 },
    text: 'MATERIAL',
    fontSize: 8,
    fontWeight: 'bold',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 2.2, y: startY + 1.6 },
    text: titleBlock.material,
    fontSize: 10,
    fontWeight: 'normal',
    alignment: 'left'
  });

  // Finish
  elements.push({
    type: 'text',
    position: { x: startX + 4.2, y: startY + 1.8 },
    text: 'FINISH',
    fontSize: 8,
    fontWeight: 'bold',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 4.2, y: startY + 1.6 },
    text: titleBlock.finish,
    fontSize: 10,
    fontWeight: 'normal',
    alignment: 'left'
  });

  // Scale
  elements.push({
    type: 'text',
    position: { x: startX + 6.2, y: startY + 1.8 },
    text: 'SCALE',
    fontSize: 8,
    fontWeight: 'bold',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 6.2, y: startY + 1.6 },
    text: titleBlock.scale || 'AS NOTED',
    fontSize: 10,
    fontWeight: 'normal',
    alignment: 'left'
  });

  // Tolerances
  elements.push({
    type: 'text',
    position: { x: startX + 0.1, y: startY + 1.2 },
    text: 'TOLERANCES:',
    fontSize: 8,
    fontWeight: 'bold',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 0.1, y: startY + 1.0 },
    text: titleBlock.tolerances.decimal,
    fontSize: 8,
    fontWeight: 'normal',
    alignment: 'left'
  });

  // Signature block (bottom section)
  elements.push({
    type: 'text',
    position: { x: startX + 0.1, y: startY + 0.7 },
    text: 'DRAWN',
    fontSize: 8,
    fontWeight: 'bold',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 0.1, y: startY + 0.5 },
    text: titleBlock.drawnBy || '',
    fontSize: 8,
    fontWeight: 'normal',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 0.1, y: startY + 0.3 },
    text: titleBlock.dateDrawn || '',
    fontSize: 8,
    fontWeight: 'normal',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 2.2, y: startY + 0.7 },
    text: 'CHECKED',
    fontSize: 8,
    fontWeight: 'bold',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 4.2, y: startY + 0.7 },
    text: 'APPROVED',
    fontSize: 8,
    fontWeight: 'bold',
    alignment: 'left'
  });

  // Revision block
  elements.push({
    type: 'text',
    position: { x: startX + 6.2, y: startY + 0.7 },
    text: 'REV',
    fontSize: 8,
    fontWeight: 'bold',
    alignment: 'left'
  });

  elements.push({
    type: 'text',
    position: { x: startX + 6.2, y: startY + 0.5 },
    text: titleBlock.revision || '-',
    fontSize: 12,
    fontWeight: 'bold',
    alignment: 'left'
  });

  return elements;
}

/**
 * Generate revision block elements
 */
export function generateRevisionBlock(revisions: Array<{
  revision: string;
  description: string;
  date: string;
  engineer: string;
}>): TitleBlockElement[] {
  const elements: TitleBlockElement[] = [];
  const blockX = 26; // Position on sheet
  const blockY = 18;
  const rowHeight = 0.25;

  // Revision block header
  elements.push({
    type: 'rectangle',
    position: { x: blockX, y: blockY },
    width: 6,
    height: 2,
    style: { lineWeight: 0.5, lineType: 'solid' }
  });

  elements.push({
    type: 'text',
    position: { x: blockX + 0.1, y: blockY + 1.8 },
    text: 'REVISIONS',
    fontSize: 10,
    fontWeight: 'bold',
    alignment: 'left'
  });

  // Column headers
  const headers = ['REV', 'DESCRIPTION', 'DATE', 'BY'];
  const columnWidths = [0.5, 3.5, 1, 1];
  let currentX = blockX + 0.1;

  headers.forEach((header, index) => {
    elements.push({
      type: 'text',
      position: { x: currentX, y: blockY + 1.5 },
      text: header,
      fontSize: 8,
      fontWeight: 'bold',
      alignment: 'left'
    });
    currentX += columnWidths[index];
  });

  // Revision entries
  revisions.forEach((revision, index) => {
    const rowY = blockY + 1.2 - (index * rowHeight);
    currentX = blockX + 0.1;

    elements.push({
      type: 'text',
      position: { x: currentX, y: rowY },
      text: revision.revision,
      fontSize: 8,
      fontWeight: 'normal',
      alignment: 'left'
    });
    currentX += columnWidths[0];

    elements.push({
      type: 'text',
      position: { x: currentX, y: rowY },
      text: revision.description,
      fontSize: 8,
      fontWeight: 'normal',
      alignment: 'left'
    });
    currentX += columnWidths[1];

    elements.push({
      type: 'text',
      position: { x: currentX, y: rowY },
      text: revision.date,
      fontSize: 8,
      fontWeight: 'normal',
      alignment: 'left'
    });
    currentX += columnWidths[2];

    elements.push({
      type: 'text',
      position: { x: currentX, y: rowY },
      text: revision.engineer,
      fontSize: 8,
      fontWeight: 'normal',
      alignment: 'left'
    });
  });

  return elements;
}

/**
 * Generate third angle projection symbol
 */
export function generateProjectionSymbol(): TitleBlockElement[] {
  return [
    {
      type: 'text',
      position: { x: 0.5, y: 0.5 },
      text: '⟲', // Third angle projection symbol
      fontSize: 16,
      fontWeight: 'bold',
      alignment: 'left'
    },
    {
      type: 'text',
      position: { x: 1.0, y: 0.5 },
      text: 'THIRD ANGLE PROJECTION',
      fontSize: 8,
      fontWeight: 'normal',
      alignment: 'left'
    }
  ];
}