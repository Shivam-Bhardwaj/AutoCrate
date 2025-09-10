/**
 * Applied Materials Drawing Standards Validation Suite
 * Validates drawing generation against AMAT 0251-70054 Rev. 08 and ASME Y14.5-2009
 */

import { DrawingPackage, DrawingSheet } from './drawingGenerator';
import { TitleBlockData } from './titleBlockGenerator';
import { validateBOMEntries } from '@/templates/applied-materials/bom-table';
import { validateTitleBlockData } from '@/templates/applied-materials/title-block';
import { validateDrawingLayout } from '@/templates/applied-materials/drawing-border';
import { validateDimensions } from './dimensionGenerator';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: string[];
  complianceChecks: ComplianceCheck[];
  summary: ValidationSummary;
}

export interface ValidationError {
  severity: 'critical' | 'major' | 'minor';
  category: 'amat-standards' | 'asme-standards' | 'completeness' | 'format';
  message: string;
  location?: string;
  suggestion?: string;
  standard?: string;
}

export interface ValidationWarning {
  category: 'best-practice' | 'optimization' | 'clarity' | 'consistency';
  message: string;
  location?: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ComplianceCheck {
  standard: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning' | 'not-applicable';
  details: string;
}

export interface ValidationSummary {
  totalSheets: number;
  validSheets: number;
  criticalErrors: number;
  majorErrors: number;
  minorErrors: number;
  warnings: number;
  overallCompliance: number; // percentage
}

/**
 * Complete drawing package validation
 */
export function validateDrawingPackage(drawingPackage: DrawingPackage): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const recommendations: string[] = [];
  const complianceChecks: ComplianceCheck[] = [];

  // Validate package metadata
  validatePackageMetadata(drawingPackage, errors, warnings);

  // Validate each sheet
  drawingPackage.sheets.forEach(sheet => {
    validateSheet(sheet, errors, warnings, recommendations);
  });

  // Check sheet organization
  validateSheetOrganization(drawingPackage.sheets, errors, warnings);

  // Run compliance checks
  runComplianceChecks(drawingPackage, complianceChecks);

  // Generate recommendations
  generateRecommendations(drawingPackage, recommendations);

  // Calculate score
  const score = calculateValidationScore(errors, warnings, complianceChecks);

  const summary: ValidationSummary = {
    totalSheets: drawingPackage.sheets.length,
    validSheets: drawingPackage.sheets.filter(sheet => 
      !errors.some(e => e.location?.includes(`Sheet ${sheet.sheetNumber}`) && e.severity === 'critical')
    ).length,
    criticalErrors: errors.filter(e => e.severity === 'critical').length,
    majorErrors: errors.filter(e => e.severity === 'major').length,
    minorErrors: errors.filter(e => e.severity === 'minor').length,
    warnings: warnings.length,
    overallCompliance: Math.round((complianceChecks.filter(c => c.status === 'pass').length / 
      complianceChecks.filter(c => c.status !== 'not-applicable').length) * 100)
  };

  return {
    isValid: errors.filter(e => e.severity === 'critical').length === 0,
    score,
    errors,
    warnings,
    recommendations,
    complianceChecks,
    summary
  };
}

/**
 * Validate package-level metadata
 */
function validatePackageMetadata(
  drawingPackage: DrawingPackage,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const { metadata } = drawingPackage;

  // Check required metadata
  if (!metadata.partNumber) {
    errors.push({
      severity: 'critical',
      category: 'completeness',
      message: 'Part number is required in package metadata',
      suggestion: 'Add valid AMAT part number (format: 0205-XXXXX)'
    });
  } else if (!/^0205-\d{5}$/.test(metadata.partNumber)) {
    errors.push({
      severity: 'major',
      category: 'amat-standards',
      message: 'Part number does not follow AMAT format',
      suggestion: 'Use format: 0205-XXXXX where X is a digit',
      standard: 'AMAT 0251-70054 Rev. 08'
    });
  }

  if (!metadata.tcNumber) {
    errors.push({
      severity: 'critical',
      category: 'completeness',
      message: 'TC number is required in package metadata',
      suggestion: 'Add valid TC engineering number (format: TC2-XXXXXXX)'
    });
  } else if (!/^TC2-\d{7}$/.test(metadata.tcNumber)) {
    errors.push({
      severity: 'major',
      category: 'amat-standards',
      message: 'TC number does not follow AMAT format',
      suggestion: 'Use format: TC2-XXXXXXX where X is a digit',
      standard: 'AMAT 0251-70054 Rev. 08'
    });
  }

  if (!metadata.projectName || metadata.projectName.trim().length === 0) {
    errors.push({
      severity: 'major',
      category: 'completeness',
      message: 'Project name is required',
      suggestion: 'Add descriptive project name for the crate assembly'
    });
  }

  if (metadata.totalSheets < 3) {
    warnings.push({
      category: 'best-practice',
      message: 'Minimum 3 sheets recommended for complete documentation',
      impact: 'medium'
    });
  }
}

/**
 * Validate individual sheet
 */
function validateSheet(
  sheet: DrawingSheet,
  errors: ValidationError[],
  warnings: ValidationWarning[],
  recommendations: string[]
): void {
  const location = `Sheet ${sheet.sheetNumber}`;

  // Validate sheet size (AMAT standard is Size D)
  if (sheet.size !== 'D') {
    warnings.push({
      category: 'best-practice',
      message: `${location}: AMAT standard uses Size D sheets (34" x 22")`,
      location,
      impact: 'medium'
    });
  }

  // Validate title block
  const titleBlockValidation = validateTitleBlockData(sheet.titleBlock);
  titleBlockValidation.errors.forEach(error => {
    errors.push({
      severity: 'major',
      category: 'amat-standards',
      message: `${location}: ${error}`,
      location,
      standard: 'AMAT 0251-70054 Rev. 08'
    });
  });

  titleBlockValidation.warnings.forEach(warning => {
    warnings.push({
      category: 'best-practice',
      message: `${location}: ${warning}`,
      location,
      impact: 'low'
    });
  });

  // Validate views
  if (sheet.views.length === 0) {
    errors.push({
      severity: 'critical',
      category: 'completeness',
      message: `${location}: At least one view is required`,
      location,
      suggestion: 'Add assembly, detail, or section views as appropriate'
    });
  }

  // Validate required views by sheet number
  validateRequiredViews(sheet, errors, warnings);

  // Validate dimensions
  if (sheet.dimensions) {
    const dimensionValidation = validateDimensions([
      ...sheet.dimensions.overall,
      ...sheet.dimensions.detail
    ]);
    
    dimensionValidation.errors.forEach(error => {
      errors.push({
        severity: 'major',
        category: 'asme-standards',
        message: `${location}: ${error}`,
        location,
        standard: 'ASME Y14.5-2009'
      });
    });

    dimensionValidation.warnings.forEach(warning => {
      warnings.push({
        category: 'clarity',
        message: `${location}: ${warning}`,
        location,
        impact: 'medium'
      });
    });
  }

  // Validate notes
  validateSheetNotes(sheet, errors, warnings);

  // Check for revision information
  if (sheet.revisions.length === 0) {
    warnings.push({
      category: 'best-practice',
      message: `${location}: Consider adding revision information`,
      location,
      impact: 'low'
    });
  }
}

/**
 * Validate required views for different sheet types
 */
function validateRequiredViews(
  sheet: DrawingSheet,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const location = `Sheet ${sheet.sheetNumber}`;

  switch (sheet.sheetNumber) {
    case 1: // Assembly sheet
      const hasAssemblyView = sheet.views.some(v => v.type === 'assembly');
      const hasBOMView = sheet.views.some(v => v.name.toLowerCase().includes('material'));
      
      if (!hasAssemblyView) {
        errors.push({
          severity: 'major',
          category: 'completeness',
          message: `${location}: Assembly view is required on sheet 1`,
          location,
          suggestion: 'Add isometric or primary assembly view'
        });
      }
      
      if (!hasBOMView) {
        warnings.push({
          category: 'best-practice',
          message: `${location}: Bill of Materials should be included on assembly sheet`,
          location,
          impact: 'medium'
        });
      }
      break;

    case 2: // Layout sheet
      const hasOrthographicViews = sheet.views.filter(v => 
        v.name.toLowerCase().includes('top') || 
        v.name.toLowerCase().includes('front') || 
        v.name.toLowerCase().includes('side')
      ).length >= 2;
      
      if (!hasOrthographicViews) {
        warnings.push({
          category: 'best-practice',
          message: `${location}: Multiple orthographic views recommended for layout sheet`,
          location,
          impact: 'medium'
        });
      }
      break;

    case 3: // Orientation sheet
      const hasOrientationView = sheet.views.some(v => 
        v.name.toLowerCase().includes('orientation') || 
        v.name.toLowerCase().includes('product')
      );
      
      if (!hasOrientationView) {
        warnings.push({
          category: 'best-practice',
          message: `${location}: Product orientation view recommended`,
          location,
          impact: 'medium'
        });
      }
      break;
  }
}

/**
 * Validate sheet notes against AMAT and ASME standards
 */
function validateSheetNotes(
  sheet: DrawingSheet,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const location = `Sheet ${sheet.sheetNumber}`;
  const notes = sheet.notes;

  // Required standard notes
  const requiredNotes = [
    { text: 'ASME Y14.5', name: 'ASME standard reference' },
    { text: 'THIRD ANGLE PROJECTION', name: 'Projection method' },
    { text: 'TOLERANCES', name: 'Tolerance specification' },
    { text: 'INCHES', name: 'Units specification' }
  ];

  requiredNotes.forEach(required => {
    const hasNote = notes.some(note => note.toUpperCase().includes(required.text));
    if (!hasNote) {
      if (required.text === 'ASME Y14.5' || required.text === 'TOLERANCES') {
        errors.push({
          severity: 'major',
          category: 'asme-standards',
          message: `${location}: Missing required note: ${required.name}`,
          location,
          suggestion: `Add note referencing ${required.text}`,
          standard: 'ASME Y14.5-2009'
        });
      } else {
        warnings.push({
          category: 'best-practice',
          message: `${location}: Recommended note missing: ${required.name}`,
          location,
          impact: 'low'
        });
      }
    }
  });

  // Check for AMAT-specific notes
  if (sheet.sheetNumber === 1) {
    const amatNotes = [
      'APPLIED MATERIALS',
      'WOOD MOISTURE CONTENT',
      'KILN DRIED'
    ];

    amatNotes.forEach(amatNote => {
      const hasNote = notes.some(note => note.toUpperCase().includes(amatNote));
      if (!hasNote) {
        warnings.push({
          category: 'best-practice',
          message: `${location}: AMAT standard note recommended: ${amatNote}`,
          location,
          impact: 'low'
        });
      }
    });
  }
}

/**
 * Validate sheet organization and numbering
 */
function validateSheetOrganization(
  sheets: DrawingSheet[],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Check sequential numbering
  const sheetNumbers = sheets.map(s => s.sheetNumber).sort((a, b) => a - b);
  for (let i = 0; i < sheetNumbers.length; i++) {
    if (sheetNumbers[i] !== i + 1) {
      errors.push({
        severity: 'major',
        category: 'format',
        message: 'Sheet numbers must be sequential starting from 1',
        suggestion: 'Renumber sheets: 1, 2, 3, ...'
      });
      break;
    }
  }

  // Check for duplicate sheet numbers
  const duplicates = sheetNumbers.filter((num, index) => sheetNumbers.indexOf(num) !== index);
  if (duplicates.length > 0) {
    errors.push({
      severity: 'critical',
      category: 'format',
      message: `Duplicate sheet numbers found: ${duplicates.join(', ')}`,
      suggestion: 'Ensure each sheet has a unique number'
    });
  }

  // Validate total sheets consistency
  sheets.forEach(sheet => {
    if (sheet.totalSheets !== sheets.length) {
      errors.push({
        severity: 'minor',
        category: 'format',
        message: `Sheet ${sheet.sheetNumber}: Total sheets count (${sheet.totalSheets}) doesn't match actual count (${sheets.length})`,
        location: `Sheet ${sheet.sheetNumber}`,
        suggestion: 'Update total sheets count to match package'
      });
    }
  });
}

/**
 * Run compliance checks against standards
 */
function runComplianceChecks(
  drawingPackage: DrawingPackage,
  complianceChecks: ComplianceCheck[]
): void {
  // AMAT 0251-70054 Rev. 08 compliance
  complianceChecks.push({
    standard: 'AMAT 0251-70054 Rev. 08',
    requirement: 'Part number format (0205-XXXXX)',
    status: /^0205-\d{5}$/.test(drawingPackage.metadata.partNumber) ? 'pass' : 'fail',
    details: `Part number: ${drawingPackage.metadata.partNumber}`
  });

  complianceChecks.push({
    standard: 'AMAT 0251-70054 Rev. 08',
    requirement: 'TC number format (TC2-XXXXXXX)',
    status: /^TC2-\d{7}$/.test(drawingPackage.metadata.tcNumber) ? 'pass' : 'fail',
    details: `TC number: ${drawingPackage.metadata.tcNumber}`
  });

  complianceChecks.push({
    standard: 'AMAT 0251-70054 Rev. 08',
    requirement: 'Size D sheet format (34" x 22")',
    status: drawingPackage.sheets.every(s => s.size === 'D') ? 'pass' : 'warning',
    details: `Sheet sizes: ${drawingPackage.sheets.map(s => s.size).join(', ')}`
  });

  // ASME Y14.5-2009 compliance
  const hasASMEReference = drawingPackage.sheets.some(s => 
    s.notes.some(n => n.includes('ASME Y14.5'))
  );
  complianceChecks.push({
    standard: 'ASME Y14.5-2009',
    requirement: 'Standard reference in notes',
    status: hasASMEReference ? 'pass' : 'fail',
    details: hasASMEReference ? 'ASME Y14.5 referenced' : 'ASME Y14.5 not referenced'
  });

  const hasThirdAngle = drawingPackage.sheets.some(s => 
    s.notes.some(n => n.toUpperCase().includes('THIRD ANGLE'))
  );
  complianceChecks.push({
    standard: 'ASME Y14.5-2009',
    requirement: 'Third angle projection notation',
    status: hasThirdAngle ? 'pass' : 'fail',
    details: hasThirdAngle ? 'Third angle projection noted' : 'Third angle projection not noted'
  });

  // Completeness checks
  complianceChecks.push({
    standard: 'Completeness',
    requirement: 'Minimum 3 sheets (Assembly, Layout, Orientation)',
    status: drawingPackage.sheets.length >= 3 ? 'pass' : 'warning',
    details: `${drawingPackage.sheets.length} sheets provided`
  });

  const sheet1HasBOM = drawingPackage.sheets[0]?.views.some(v => 
    v.name.toLowerCase().includes('material') || v.name.toLowerCase().includes('bom')
  );
  complianceChecks.push({
    standard: 'Completeness',
    requirement: 'Bill of Materials on Sheet 1',
    status: sheet1HasBOM ? 'pass' : 'warning',
    details: sheet1HasBOM ? 'BOM included' : 'BOM not found on Sheet 1'
  });
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(
  drawingPackage: DrawingPackage,
  recommendations: string[]
): void {
  // Check for missing beneficial elements
  if (drawingPackage.sheets.length === 1) {
    recommendations.push('Consider adding layout and orientation sheets for comprehensive documentation');
  }

  if (!drawingPackage.sheets.some(s => s.views.some(v => v.name.includes('Isometric')))) {
    recommendations.push('Add an isometric view to improve visualization');
  }

  if (!drawingPackage.sheets.some(s => s.notes.some(n => n.includes('MOISTURE')))) {
    recommendations.push('Consider adding moisture content requirements for lumber');
  }

  if (!drawingPackage.sheets.some(s => s.notes.some(n => n.includes('INTERNATIONAL')))) {
    recommendations.push('Add international shipping requirements if applicable');
  }

  // Performance recommendations
  if (drawingPackage.sheets.length > 5) {
    recommendations.push('Consider consolidating views to reduce sheet count for easier review');
  }

  if (drawingPackage.sheets.some(s => s.notes.length > 15)) {
    recommendations.push('Consider organizing extensive notes into categories or separate sheets');
  }
}

/**
 * Calculate overall validation score
 */
function calculateValidationScore(
  errors: ValidationError[],
  warnings: ValidationWarning[],
  complianceChecks: ComplianceCheck[]
): number {
  let score = 100;

  // Deduct for errors
  errors.forEach(error => {
    switch (error.severity) {
      case 'critical':
        score -= 25;
        break;
      case 'major':
        score -= 10;
        break;
      case 'minor':
        score -= 3;
        break;
    }
  });

  // Deduct for warnings
  warnings.forEach(warning => {
    switch (warning.impact) {
      case 'high':
        score -= 5;
        break;
      case 'medium':
        score -= 2;
        break;
      case 'low':
        score -= 1;
        break;
    }
  });

  // Deduct for compliance failures
  complianceChecks.forEach(check => {
    if (check.status === 'fail') {
      score -= 15;
    } else if (check.status === 'warning') {
      score -= 5;
    }
  });

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate validation report
 */
export function generateValidationReport(result: ValidationResult): string {
  let report = '';
  
  report += '# Drawing Package Validation Report\n\n';
  report += `**Overall Score:** ${result.score}/100\n`;
  report += `**Status:** ${result.isValid ? 'VALID' : 'REQUIRES ATTENTION'}\n\n`;

  // Summary
  report += '## Summary\n';
  report += `- Total Sheets: ${result.summary.totalSheets}\n`;
  report += `- Valid Sheets: ${result.summary.validSheets}\n`;
  report += `- Critical Errors: ${result.summary.criticalErrors}\n`;
  report += `- Major Errors: ${result.summary.majorErrors}\n`;
  report += `- Minor Errors: ${result.summary.minorErrors}\n`;
  report += `- Warnings: ${result.summary.warnings}\n`;
  report += `- Compliance: ${result.summary.overallCompliance}%\n\n`;

  // Errors
  if (result.errors.length > 0) {
    report += '## Errors\n';
    result.errors.forEach((error, index) => {
      report += `${index + 1}. **${error.severity.toUpperCase()}** (${error.category}): ${error.message}\n`;
      if (error.location) report += `   - Location: ${error.location}\n`;
      if (error.suggestion) report += `   - Suggestion: ${error.suggestion}\n`;
      if (error.standard) report += `   - Standard: ${error.standard}\n`;
      report += '\n';
    });
  }

  // Warnings
  if (result.warnings.length > 0) {
    report += '## Warnings\n';
    result.warnings.forEach((warning, index) => {
      report += `${index + 1}. **${warning.impact.toUpperCase()} IMPACT** (${warning.category}): ${warning.message}\n`;
      if (warning.location) report += `   - Location: ${warning.location}\n`;
      report += '\n';
    });
  }

  // Compliance
  report += '## Compliance Checks\n';
  result.complianceChecks.forEach((check, index) => {
    const status = check.status.toUpperCase();
    const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
    report += `${index + 1}. ${icon} **${status}** - ${check.standard}: ${check.requirement}\n`;
    report += `   - ${check.details}\n\n`;
  });

  // Recommendations
  if (result.recommendations.length > 0) {
    report += '## Recommendations\n';
    result.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
    report += '\n';
  }

  report += '---\n';
  report += `*Generated: ${new Date().toISOString()}*\n`;

  return report;
}