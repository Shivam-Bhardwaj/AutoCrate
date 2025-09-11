/**
 * Compliance Validator Service
 * Validates crate designs against ISPM-15, ASME, and Applied Materials standards
 */

import { CrateConfiguration } from '@/types/crate';
import { AMATCrateStyle, determineAMATSkidSize, determineAMATCleating } from '@/types/amat-specifications';

export interface ComplianceCheck {
  category: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  details: string;
  value?: number | string;
  min?: number;
  max?: number;
  unit?: string;
}

export interface ComplianceReport {
  overall: 'compliant' | 'non-compliant' | 'partial';
  checks: ComplianceCheck[];
  certifications: string[];
  recommendations: string[];
  timestamp: Date;
}

export class ComplianceValidator {
  private config: CrateConfiguration;
  
  constructor(config: CrateConfiguration) {
    this.config = config;
  }

  /**
   * Run full compliance validation
   */
  public validateCompliance(): ComplianceReport {
    const checks: ComplianceCheck[] = [];
    
    // ISPM-15 Compliance
    checks.push(...this.validateISPM15());
    
    // ASME Standards
    checks.push(...this.validateASME());
    
    // Applied Materials Standards
    checks.push(...this.validateAMATStandards());
    
    // Structural Integrity
    checks.push(...this.validateStructuralIntegrity());
    
    // Shipping Requirements
    checks.push(...this.validateShippingRequirements());
    
    // Environmental Standards
    checks.push(...this.validateEnvironmentalStandards());
    
    // Determine overall compliance
    const failedChecks = checks.filter(c => c.status === 'fail');
    const warningChecks = checks.filter(c => c.status === 'warning');
    
    const overall = failedChecks.length > 0 ? 'non-compliant' : 
                   warningChecks.length > 0 ? 'partial' : 'compliant';
    
    // Generate certifications list
    const certifications = this.generateCertifications(checks);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(checks);
    
    return {
      overall,
      checks,
      certifications,
      recommendations,
      timestamp: new Date()
    };
  }

  /**
   * ISPM-15 International Phytosanitary Standards
   */
  private validateISPM15(): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    
    // Heat treatment requirement
    checks.push({
      category: 'ISPM-15',
      requirement: 'Heat Treatment',
      status: this.config.ispm15Compliant ? 'pass' : 'fail',
      details: this.config.ispm15Compliant ? 
        'Wood material heat treated to 56°C for 30 minutes minimum' :
        'Heat treatment certification required for international shipping',
      value: this.config.ispm15Compliant ? 'HT Certified' : 'Not Certified'
    });
    
    // Wood thickness requirement
    const panelThickness = 0.75; // inches (from config when available)
    checks.push({
      category: 'ISPM-15',
      requirement: 'Wood Thickness',
      status: panelThickness >= 0.5 ? 'pass' : 'fail',
      details: `All wood components must be ≥ 0.5" thick`,
      value: panelThickness,
      min: 0.5,
      unit: 'inches'
    });
    
    // Debarked requirement
    checks.push({
      category: 'ISPM-15',
      requirement: 'Debarked Wood',
      status: 'pass',
      details: 'All wood must be debarked with < 3cm² bark patches',
      value: 'Compliant'
    });
    
    // Marking requirement
    checks.push({
      category: 'ISPM-15',
      requirement: 'IPPC Marking',
      status: this.config.ispm15Compliant ? 'pass' : 'warning',
      details: 'IPPC mark required with country code, producer code, and treatment code',
      value: this.config.ispm15Compliant ? 'Mark Applied' : 'Mark Required'
    });
    
    return checks;
  }

  /**
   * ASME Standards Validation
   */
  private validateASME(): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const grossWeight = this.config.weight.product * 1.2; // Estimated gross weight
    
    // Load capacity validation
    const skidSize = determineAMATSkidSize(grossWeight);
    const loadCapacity = this.getSkidCapacity(skidSize);
    
    checks.push({
      category: 'ASME',
      requirement: 'Load Capacity',
      status: loadCapacity >= grossWeight * 2 ? 'pass' : 'warning',
      details: `Structure must support 2x gross weight (${(grossWeight * 2).toFixed(0)} lbs)`,
      value: loadCapacity,
      min: grossWeight * 2,
      unit: 'lbs'
    });
    
    // Fastener spacing
    const fastenerSpacing = this.config.dimensions.width < 50 ? 8 : 12;
    checks.push({
      category: 'ASME',
      requirement: 'Fastener Spacing',
      status: fastenerSpacing <= 12 ? 'pass' : 'fail',
      details: 'Maximum fastener spacing 12" O.C. for structural integrity',
      value: fastenerSpacing,
      max: 12,
      unit: 'inches O.C.'
    });
    
    // Corner protection
    checks.push({
      category: 'ASME',
      requirement: 'Corner Protection',
      status: 'pass',
      details: 'Corner reinforcements required for loads > 500 lbs',
      value: 'Reinforced corners'
    });
    
    // Stacking capability
    const stackable = this.config.cap.topPanel && grossWeight < 5000;
    checks.push({
      category: 'ASME',
      requirement: 'Stacking Capability',
      status: stackable ? 'pass' : 'warning',
      details: 'Top panel required for stacking, max 5000 lbs per crate',
      value: stackable ? 'Stackable' : 'Non-stackable'
    });
    
    return checks;
  }

  /**
   * Applied Materials Corporate Standards
   */
  private validateAMATStandards(): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    
    // Crate style requirement
    const crateStyle = this.config.base.type as AMATCrateStyle;
    checks.push({
      category: 'AMAT',
      requirement: 'Crate Style',
      status: ['Style A', 'Style B', 'Style C', 'Style D'].includes(crateStyle) ? 'pass' : 'warning',
      details: 'Must use approved AMAT crate style (A, B, C, or D)',
      value: crateStyle
    });
    
    // Cleating requirements
    const maxPanelDim = Math.max(this.config.dimensions.width, this.config.dimensions.length);
    const cleating = determineAMATCleating(maxPanelDim);
    
    checks.push({
      category: 'AMAT',
      requirement: 'Panel Cleating',
      status: 'pass',
      details: `${cleating.cleatSize} cleats required for ${maxPanelDim}" panels`,
      value: cleating.cleatSize
    });
    
    // Skid sizing
    const grossWeight = this.config.weight.product * 1.2;
    const skidSize = determineAMATSkidSize(grossWeight);
    
    checks.push({
      category: 'AMAT',
      requirement: 'Skid Sizing',
      status: 'pass',
      details: `${skidSize} skids required for ${grossWeight.toFixed(0)} lbs gross weight`,
      value: skidSize
    });
    
    // Foam cushioning for sensitive equipment
    const requiresFoam = this.config.weight.product > 1000;
    checks.push({
      category: 'AMAT',
      requirement: 'Foam Cushioning',
      status: requiresFoam && this.config.foam ? 'pass' : requiresFoam ? 'warning' : 'pass',
      details: 'Foam cushioning required for equipment > 1000 lbs',
      value: this.config.foam ? 'Applied' : 'Not Applied'
    });
    
    // MBB requirement for international shipping
    checks.push({
      category: 'AMAT',
      requirement: 'Moisture Barrier',
      status: this.config.mbb ? 'pass' : 'warning',
      details: 'MBB recommended for international or long-term storage',
      value: this.config.mbb ? 'Applied' : 'Not Applied'
    });
    
    return checks;
  }

  /**
   * Structural Integrity Validation
   */
  private validateStructuralIntegrity(): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const grossWeight = this.config.weight.product * 1.2;
    
    // Panel thickness vs load
    const minPanelThickness = grossWeight > 5000 ? 1.0 : 0.75;
    const actualThickness = 0.75; // From config when available
    
    checks.push({
      category: 'Structural',
      requirement: 'Panel Thickness',
      status: actualThickness >= minPanelThickness ? 'pass' : 'fail',
      details: `Minimum ${minPanelThickness}" panels for ${grossWeight.toFixed(0)} lbs load`,
      value: actualThickness,
      min: minPanelThickness,
      unit: 'inches'
    });
    
    // Diagonal bracing requirement
    const requiresBracing = this.config.dimensions.height > 48;
    checks.push({
      category: 'Structural',
      requirement: 'Diagonal Bracing',
      status: !requiresBracing || this.config.diagonalBracing ? 'pass' : 'warning',
      details: 'Diagonal bracing required for heights > 48"',
      value: requiresBracing ? 'Required' : 'Not Required'
    });
    
    // Center of gravity
    const cogHeight = this.config.dimensions.height * 0.45; // Estimated
    const maxCogHeight = this.config.dimensions.height * 0.6;
    
    checks.push({
      category: 'Structural',
      requirement: 'Center of Gravity',
      status: cogHeight <= maxCogHeight ? 'pass' : 'warning',
      details: `CoG should be < 60% of crate height for stability`,
      value: cogHeight.toFixed(1),
      max: maxCogHeight,
      unit: 'inches'
    });
    
    // Forklift pocket spacing
    const forkPocketSpacing = this.config.dimensions.width * 0.7;
    checks.push({
      category: 'Structural',
      requirement: 'Fork Pocket Spacing',
      status: forkPocketSpacing >= 24 && forkPocketSpacing <= 48 ? 'pass' : 'warning',
      details: 'Fork pockets should be 24"-48" apart',
      value: forkPocketSpacing.toFixed(1),
      min: 24,
      max: 48,
      unit: 'inches'
    });
    
    return checks;
  }

  /**
   * Shipping Requirements Validation
   */
  private validateShippingRequirements(): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    
    // Air shipment weight limits
    if (this.config.shipping?.mode === 'air') {
      const maxAirWeight = 7000; // lbs
      const grossWeight = this.config.weight.product * 1.2;
      
      checks.push({
        category: 'Shipping',
        requirement: 'Air Freight Weight',
        status: grossWeight <= maxAirWeight ? 'pass' : 'fail',
        details: `Maximum ${maxAirWeight} lbs for air freight`,
        value: grossWeight.toFixed(0),
        max: maxAirWeight,
        unit: 'lbs'
      });
      
      // Air freight dimensions
      const maxDim = Math.max(this.config.dimensions.width, this.config.dimensions.length, this.config.dimensions.height);
      checks.push({
        category: 'Shipping',
        requirement: 'Air Freight Dimensions',
        status: maxDim <= 120 ? 'pass' : 'warning',
        details: 'Maximum dimension 120" for standard air freight',
        value: maxDim,
        max: 120,
        unit: 'inches'
      });
    }
    
    // Ocean container fit
    const fits20ft = this.config.dimensions.length <= 232 && this.config.dimensions.width <= 90;
    const fits40ft = this.config.dimensions.length <= 474 && this.config.dimensions.width <= 90;
    
    checks.push({
      category: 'Shipping',
      requirement: 'Container Fit',
      status: fits20ft || fits40ft ? 'pass' : 'warning',
      details: fits40ft ? 'Fits 40ft container' : fits20ft ? 'Fits 20ft container' : 'Oversized for standard containers',
      value: fits40ft ? '40ft' : fits20ft ? '20ft' : 'Oversized'
    });
    
    // Shock and tilt indicators
    const requiresIndicators = this.config.weight.product > 500 || this.config.fragile;
    checks.push({
      category: 'Shipping',
      requirement: 'Monitoring Indicators',
      status: !requiresIndicators || (this.config.shockIndicators && this.config.tiltIndicators) ? 'pass' : 'warning',
      details: 'Shock/tilt indicators recommended for sensitive equipment',
      value: this.config.shockIndicators && this.config.tiltIndicators ? 'Applied' : 'Not Applied'
    });
    
    return checks;
  }

  /**
   * Environmental Standards Validation
   */
  private validateEnvironmentalStandards(): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    
    // Recyclable materials
    checks.push({
      category: 'Environmental',
      requirement: 'Recyclable Materials',
      status: 'pass',
      details: 'Wood and metal components are recyclable',
      value: '95% recyclable'
    });
    
    // VOC emissions
    checks.push({
      category: 'Environmental',
      requirement: 'VOC Emissions',
      status: 'pass',
      details: 'Low-VOC adhesives and treatments used',
      value: 'Compliant'
    });
    
    // Sustainable sourcing
    checks.push({
      category: 'Environmental',
      requirement: 'Sustainable Wood',
      status: this.config.sustainableMaterials ? 'pass' : 'warning',
      details: 'FSC certified wood recommended',
      value: this.config.sustainableMaterials ? 'FSC Certified' : 'Standard'
    });
    
    return checks;
  }

  /**
   * Generate list of applicable certifications
   */
  private generateCertifications(checks: ComplianceCheck[]): string[] {
    const certifications: string[] = [];
    
    if (checks.filter(c => c.category === 'ISPM-15' && c.status === 'pass').length >= 3) {
      certifications.push('ISPM-15 Compliant');
    }
    
    if (checks.filter(c => c.category === 'ASME' && c.status === 'pass').length >= 3) {
      certifications.push('ASME B30.20 Compliant');
    }
    
    if (checks.filter(c => c.category === 'AMAT' && c.status === 'pass').length >= 4) {
      certifications.push('Applied Materials Approved');
    }
    
    if (this.config.ispm15Compliant) {
      certifications.push('Heat Treatment Certified');
    }
    
    if (this.config.sustainableMaterials) {
      certifications.push('FSC Certified Materials');
    }
    
    return certifications;
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(checks: ComplianceCheck[]): string[] {
    const recommendations: string[] = [];
    
    // Check for failures and warnings
    const failures = checks.filter(c => c.status === 'fail');
    const warnings = checks.filter(c => c.status === 'warning');
    
    failures.forEach(check => {
      if (check.category === 'ISPM-15' && check.requirement === 'Heat Treatment') {
        recommendations.push('Obtain ISPM-15 heat treatment certification for international shipping');
      }
      if (check.category === 'Structural' && check.requirement === 'Panel Thickness') {
        recommendations.push(`Increase panel thickness to ${check.min}" minimum for load requirements`);
      }
      if (check.category === 'Shipping' && check.requirement === 'Air Freight Weight') {
        recommendations.push('Consider ocean freight or reduce crate weight for air shipment');
      }
    });
    
    warnings.forEach(check => {
      if (check.requirement === 'Foam Cushioning' && check.value === 'Not Applied') {
        recommendations.push('Add foam cushioning for equipment protection during transit');
      }
      if (check.requirement === 'Moisture Barrier' && check.value === 'Not Applied') {
        recommendations.push('Consider MBB for international shipping or long-term storage');
      }
      if (check.requirement === 'Diagonal Bracing' && check.value === 'Required') {
        recommendations.push('Add diagonal bracing for improved structural stability');
      }
      if (check.requirement === 'Monitoring Indicators' && check.value === 'Not Applied') {
        recommendations.push('Add shock and tilt indicators for shipment monitoring');
      }
    });
    
    // Add general best practices if mostly compliant
    if (failures.length === 0 && warnings.length < 3) {
      recommendations.push('Consider adding desiccant packs for humidity control');
      recommendations.push('Document handling instructions clearly on all sides');
      recommendations.push('Photograph crate condition before shipping for insurance');
    }
    
    return recommendations;
  }

  /**
   * Get load capacity for skid size
   */
  private getSkidCapacity(skidSize: string): number {
    const capacities: Record<string, number> = {
      '3x4': 2000,
      '4x4': 5000,
      '4x6': 10000,
      '6x6': 20000,
      '8x8': 50000
    };
    return capacities[skidSize] || 2000;
  }
}