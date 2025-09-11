/**
 * Design Rules Engine Service
 * ASME Y14.5-2009 compliance checking and custom rule validation
 */

import { CrateConfiguration } from '@/types/crate';
import { calculateCrateDimensions } from './crateCalculations';
import { calculateEnhancedCrateWeight } from './weightCalculations';

export interface DesignRule {
  id: string;
  category: 'structural' | 'dimensional' | 'material' | 'safety' | 'compliance' | 'custom';
  standard: 'ASME' | 'ISO' | 'AMAT' | 'ISPM-15' | 'CUSTOM';
  severity: 'error' | 'warning' | 'info';
  name: string;
  description: string;
  expression: (config: CrateConfiguration, context: RuleContext) => RuleResult;
  autoFix?: (config: CrateConfiguration) => Partial<CrateConfiguration>;
  reference?: string;
  enabled: boolean;
}

export interface RuleContext {
  dimensions: ReturnType<typeof calculateCrateDimensions>;
  weight: ReturnType<typeof calculateEnhancedCrateWeight>;
  aspectRatios: {
    lengthToWidth: number;
    lengthToHeight: number;
    widthToHeight: number;
  };
  volumetricDensity: number;
  centerOfGravity?: { x: number; y: number; z: number };
}

export interface RuleResult {
  passed: boolean;
  message: string;
  value?: number | string;
  expectedValue?: number | string;
  suggestion?: string;
}

export interface ValidationReport {
  configuration: CrateConfiguration;
  timestamp: Date;
  rules: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  violations: ViolationDetail[];
  suggestions: string[];
  canAutoFix: boolean;
  score: number; // 0-100
}

export interface ViolationDetail {
  ruleId: string;
  ruleName: string;
  category: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  currentValue?: number | string;
  expectedValue?: number | string;
  suggestion?: string;
  canAutoFix: boolean;
  reference?: string;
}

export class DesignRulesEngine {
  private rules: Map<string, DesignRule> = new Map();
  private customRules: Map<string, DesignRule> = new Map();
  
  constructor() {
    this.initializeStandardRules();
  }
  
  /**
   * Initialize standard ASME and industry rules
   */
  private initializeStandardRules() {
    const standardRules: DesignRule[] = [
      // ASME Y14.5-2009 Rules
      {
        id: 'asme_aspect_ratio',
        category: 'dimensional',
        standard: 'ASME',
        severity: 'warning',
        name: 'Aspect Ratio Limits',
        description: 'ASME Y14.5-2009: Aspect ratios should not exceed 3:1 for stability',
        expression: (config, context) => {
          const maxRatio = Math.max(
            context.aspectRatios.lengthToWidth,
            context.aspectRatios.lengthToHeight,
            context.aspectRatios.widthToHeight
          );
          return {
            passed: maxRatio <= 3,
            message: maxRatio > 3 ? 
              `Aspect ratio ${maxRatio.toFixed(2)}:1 exceeds recommended 3:1 limit` :
              'Aspect ratios within acceptable limits',
            value: maxRatio,
            expectedValue: '≤3:1',
            suggestion: maxRatio > 3 ? 
              'Consider adjusting dimensions to improve stability' : undefined
          };
        },
        reference: 'ASME Y14.5-2009 Section 1.4',
        enabled: true
      },
      {
        id: 'asme_min_panel_thickness',
        category: 'structural',
        standard: 'ASME',
        severity: 'error',
        name: 'Minimum Panel Thickness',
        description: 'ASME requirement for minimum panel thickness based on span',
        expression: (config, context) => {
          const maxSpan = Math.max(config.dimensions.width, config.dimensions.length);
          const minThickness = maxSpan > 60 ? 1.0 : maxSpan > 40 ? 0.75 : 0.5;
          const actualThickness = config.cap.topPanel.thickness;
          
          return {
            passed: actualThickness >= minThickness,
            message: actualThickness < minThickness ?
              `Panel thickness ${actualThickness}" insufficient for ${maxSpan}" span` :
              'Panel thickness meets requirements',
            value: actualThickness,
            expectedValue: `≥${minThickness}"`,
            suggestion: actualThickness < minThickness ?
              `Increase panel thickness to at least ${minThickness}"` : undefined
          };
        },
        autoFix: (config) => {
          const maxSpan = Math.max(config.dimensions.width, config.dimensions.length);
          const minThickness = maxSpan > 60 ? 1.0 : maxSpan > 40 ? 0.75 : 0.5;
          return {
            cap: {
              ...config.cap,
              topPanel: { ...config.cap.topPanel, thickness: minThickness }
            }
          };
        },
        reference: 'ASME Y14.5-2009 Table 3.2',
        enabled: true
      },
      {
        id: 'asme_fastener_spacing',
        category: 'structural',
        standard: 'ASME',
        severity: 'warning',
        name: 'Fastener Spacing',
        description: 'Maximum fastener spacing for structural integrity',
        expression: (config, context) => {
          const maxSpacing = context.weight.estimatedGross > 2000 ? 8 : 12;
          const actualSpacing = config.fasteners.spacing;
          
          return {
            passed: actualSpacing <= maxSpacing,
            message: actualSpacing > maxSpacing ?
              `Fastener spacing ${actualSpacing}" exceeds maximum ${maxSpacing}"` :
              'Fastener spacing within limits',
            value: actualSpacing,
            expectedValue: `≤${maxSpacing}"`,
            suggestion: actualSpacing > maxSpacing ?
              `Reduce fastener spacing to ${maxSpacing}" or less` : undefined
          };
        },
        autoFix: (config) => {
          const weight = calculateEnhancedCrateWeight(config);
          const maxSpacing = weight.estimatedGross > 2000 ? 8 : 12;
          return {
            fasteners: { ...config.fasteners, spacing: maxSpacing }
          };
        },
        reference: 'ASME Y14.5-2009 Section 5.3',
        enabled: true
      },
      
      // Structural Rules
      {
        id: 'struct_load_distribution',
        category: 'structural',
        standard: 'ASME',
        severity: 'error',
        name: 'Load Distribution',
        description: 'Ensure proper load distribution across skids',
        expression: (config, context) => {
          const loadPerSkid = context.weight.estimatedGross / config.base.skidCount;
          const maxLoadPerSkid = config.base.skidWidth === 4 ? 2000 : 
                                 config.base.skidWidth === 6 ? 3500 : 5000;
          
          return {
            passed: loadPerSkid <= maxLoadPerSkid,
            message: loadPerSkid > maxLoadPerSkid ?
              `Load per skid (${loadPerSkid.toFixed(0)} lbs) exceeds capacity` :
              'Load distribution acceptable',
            value: loadPerSkid,
            expectedValue: `≤${maxLoadPerSkid} lbs`,
            suggestion: loadPerSkid > maxLoadPerSkid ?
              'Add more skids or use larger skid dimensions' : undefined
          };
        },
        reference: 'ASME BTH-1-2017',
        enabled: true
      },
      {
        id: 'struct_skid_spacing',
        category: 'structural',
        standard: 'ASME',
        severity: 'warning',
        name: 'Skid Spacing Uniformity',
        description: 'Skids should be evenly spaced for optimal load distribution',
        expression: (config, context) => {
          const idealSpacing = config.dimensions.length / (config.base.skidCount + 1);
          const spacingDeviation = Math.abs(config.base.skidSpacing - idealSpacing);
          const deviationPercent = (spacingDeviation / idealSpacing) * 100;
          
          return {
            passed: deviationPercent <= 10,
            message: deviationPercent > 10 ?
              `Skid spacing deviates ${deviationPercent.toFixed(1)}% from ideal` :
              'Skid spacing is uniform',
            value: config.base.skidSpacing,
            expectedValue: idealSpacing.toFixed(1),
            suggestion: deviationPercent > 10 ?
              `Adjust skid spacing to ${idealSpacing.toFixed(1)}" for even distribution` : undefined
          };
        },
        enabled: true
      },
      
      // Material Rules
      {
        id: 'mat_moisture_protection',
        category: 'material',
        standard: 'AMAT',
        severity: 'warning',
        name: 'Moisture Protection',
        description: 'International shipments require moisture protection',
        expression: (config, context) => {
          const needsProtection = config.amatCompliance?.isInternational || 
                                  context.weight.estimatedGross > 2000;
          const hasProtection = config.amatCompliance?.mbbConfiguration?.enabled || 
                               config.vinyl?.enabled;
          
          return {
            passed: !needsProtection || hasProtection,
            message: needsProtection && !hasProtection ?
              'Moisture protection required but not configured' :
              'Moisture protection adequate',
            value: hasProtection ? 'Protected' : 'Unprotected',
            expectedValue: needsProtection ? 'Protected' : 'Optional',
            suggestion: needsProtection && !hasProtection ?
              'Add MBB or vinyl barrier for moisture protection' : undefined
          };
        },
        reference: 'AMAT-STD-2019',
        enabled: true
      },
      {
        id: 'mat_wood_treatment',
        category: 'material',
        standard: 'ISPM-15',
        severity: 'error',
        name: 'Wood Treatment Compliance',
        description: 'International shipments require ISPM-15 heat treatment',
        expression: (config, context) => {
          const isInternational = config.amatCompliance?.isInternational;
          const isCompliant = config.amatCompliance?.comprehensiveMaterials?.woodTreatment === 'heat-treated';
          
          return {
            passed: !isInternational || isCompliant,
            message: isInternational && !isCompliant ?
              'ISPM-15 heat treatment required for international shipping' :
              'Wood treatment compliance met',
            value: isCompliant ? 'Heat Treated' : 'Untreated',
            expectedValue: isInternational ? 'Heat Treated' : 'Optional',
            suggestion: isInternational && !isCompliant ?
              'Ensure all wood materials are ISPM-15 heat treated and marked' : undefined
          };
        },
        reference: 'ISPM-15 International Standard',
        enabled: true
      },
      
      // Safety Rules
      {
        id: 'safety_weight_marking',
        category: 'safety',
        standard: 'ASME',
        severity: 'error',
        name: 'Weight Marking Requirement',
        description: 'Crates over 1000 lbs must display weight warnings',
        expression: (config, context) => {
          const requiresMarking = context.weight.estimatedGross > 1000;
          
          return {
            passed: !requiresMarking || config.specialRequirements.includes('weight-marking'),
            message: requiresMarking && !config.specialRequirements.includes('weight-marking') ?
              `Weight marking required for ${context.weight.estimatedGross.toFixed(0)} lbs load` :
              'Weight marking requirements met',
            value: context.weight.estimatedGross,
            expectedValue: requiresMarking ? 'Marked' : 'Not Required',
            suggestion: requiresMarking ? 'Add visible weight markings on all sides' : undefined
          };
        },
        reference: 'ASME B30.20-2018',
        enabled: true
      },
      {
        id: 'safety_cog_stability',
        category: 'safety',
        standard: 'ASME',
        severity: 'warning',
        name: 'Center of Gravity Stability',
        description: 'CoG should be centered for safe handling',
        expression: (config, context) => {
          if (!context.centerOfGravity) {
            return {
              passed: true,
              message: 'Center of gravity not specified',
              value: 'N/A'
            };
          }
          
          const maxOffset = 0.1; // 10% of dimension
          const xOffset = Math.abs(context.centerOfGravity.x / config.dimensions.width);
          const yOffset = Math.abs(context.centerOfGravity.y / config.dimensions.length);
          const zOffset = Math.abs(context.centerOfGravity.z / config.dimensions.height);
          const maxActualOffset = Math.max(xOffset, yOffset, zOffset);
          
          return {
            passed: maxActualOffset <= maxOffset,
            message: maxActualOffset > maxOffset ?
              `CoG offset ${(maxActualOffset * 100).toFixed(1)}% exceeds 10% limit` :
              'Center of gravity within safe limits',
            value: `${(maxActualOffset * 100).toFixed(1)}%`,
            expectedValue: '≤10%',
            suggestion: maxActualOffset > maxOffset ?
              'Redistribute load or add ballast to center the CoG' : undefined
          };
        },
        reference: 'ASME B30.20-2018 Section 20-1.2',
        enabled: true
      },
      
      // Dimensional Rules
      {
        id: 'dim_forklift_access',
        category: 'dimensional',
        standard: 'ASME',
        severity: 'warning',
        name: 'Forklift Access Clearance',
        description: 'Ensure adequate clearance for forklift entry',
        expression: (config, context) => {
          const minClearance = 4; // inches
          const hasAdequateClearance = config.base.skidHeight >= minClearance;
          
          return {
            passed: hasAdequateClearance,
            message: !hasAdequateClearance ?
              `Skid height ${config.base.skidHeight}" insufficient for forklift access` :
              'Forklift access clearance adequate',
            value: config.base.skidHeight,
            expectedValue: `≥${minClearance}"`,
            suggestion: !hasAdequateClearance ?
              `Increase skid height to at least ${minClearance}"` : undefined
          };
        },
        reference: 'ASME B56.1-2018',
        enabled: true
      },
      {
        id: 'dim_shipping_constraints',
        category: 'dimensional',
        standard: 'ISO',
        severity: 'info',
        name: 'Standard Container Fit',
        description: 'Check fit within standard shipping containers',
        expression: (config, context) => {
          const container20ft = { length: 232, width: 90, height: 90 };
          const container40ft = { length: 474, width: 90, height: 90 };
          
          const fits20ft = context.dimensions.external.length <= container20ft.length &&
                          context.dimensions.external.width <= container20ft.width &&
                          context.dimensions.external.height <= container20ft.height;
          
          const fits40ft = context.dimensions.external.length <= container40ft.length &&
                          context.dimensions.external.width <= container40ft.width &&
                          context.dimensions.external.height <= container40ft.height;
          
          return {
            passed: fits20ft || fits40ft,
            message: !fits40ft ? 
              'Crate exceeds standard container dimensions' :
              fits20ft ? 'Fits in 20ft container' : 'Fits in 40ft container',
            value: `${context.dimensions.external.length}"×${context.dimensions.external.width}"×${context.dimensions.external.height}"`,
            suggestion: !fits40ft ?
              'Consider modular design for oversized shipments' : undefined
          };
        },
        reference: 'ISO 668:2013',
        enabled: true
      }
    ];
    
    standardRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }
  
  /**
   * Validate configuration against all enabled rules
   */
  public validate(configuration: CrateConfiguration): ValidationReport {
    const context = this.buildContext(configuration);
    const violations: ViolationDetail[] = [];
    const suggestions: string[] = [];
    
    let passed = 0;
    let failed = 0;
    let warnings = 0;
    
    // Check standard rules
    this.rules.forEach(rule => {
      if (!rule.enabled) return;
      
      const result = rule.expression(configuration, context);
      
      if (!result.passed) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          category: rule.category,
          severity: rule.severity,
          message: result.message,
          currentValue: result.value,
          expectedValue: result.expectedValue,
          suggestion: result.suggestion,
          canAutoFix: !!rule.autoFix,
          reference: rule.reference
        });
        
        if (rule.severity === 'error') failed++;
        else if (rule.severity === 'warning') warnings++;
        
        if (result.suggestion) {
          suggestions.push(result.suggestion);
        }
      } else {
        passed++;
      }
    });
    
    // Check custom rules
    this.customRules.forEach(rule => {
      if (!rule.enabled) return;
      
      const result = rule.expression(configuration, context);
      
      if (!result.passed) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          category: rule.category,
          severity: rule.severity,
          message: result.message,
          currentValue: result.value,
          expectedValue: result.expectedValue,
          suggestion: result.suggestion,
          canAutoFix: !!rule.autoFix,
          reference: rule.reference
        });
        
        if (rule.severity === 'error') failed++;
        else if (rule.severity === 'warning') warnings++;
        
        if (result.suggestion) {
          suggestions.push(result.suggestion);
        }
      } else {
        passed++;
      }
    });
    
    const total = passed + failed + warnings;
    const score = total > 0 ? (passed / total) * 100 : 100;
    const canAutoFix = violations.some(v => v.canAutoFix);
    
    return {
      configuration,
      timestamp: new Date(),
      rules: {
        total,
        passed,
        failed,
        warnings
      },
      violations,
      suggestions,
      canAutoFix,
      score
    };
  }
  
  /**
   * Auto-fix violations where possible
   */
  public autoFix(configuration: CrateConfiguration): { 
    fixedConfiguration: CrateConfiguration; 
    fixedViolations: string[] 
  } {
    let fixedConfiguration = { ...configuration };
    const fixedViolations: string[] = [];
    
    // Apply fixes from standard rules
    this.rules.forEach(rule => {
      if (!rule.enabled || !rule.autoFix) return;
      
      const context = this.buildContext(fixedConfiguration);
      const result = rule.expression(fixedConfiguration, context);
      
      if (!result.passed) {
        const fixes = rule.autoFix(fixedConfiguration);
        fixedConfiguration = { ...fixedConfiguration, ...fixes };
        fixedViolations.push(rule.name);
      }
    });
    
    // Apply fixes from custom rules
    this.customRules.forEach(rule => {
      if (!rule.enabled || !rule.autoFix) return;
      
      const context = this.buildContext(fixedConfiguration);
      const result = rule.expression(fixedConfiguration, context);
      
      if (!result.passed) {
        const fixes = rule.autoFix(fixedConfiguration);
        fixedConfiguration = { ...fixedConfiguration, ...fixes };
        fixedViolations.push(rule.name);
      }
    });
    
    return { fixedConfiguration, fixedViolations };
  }
  
  /**
   * Add custom rule
   */
  public addCustomRule(rule: Omit<DesignRule, 'id' | 'standard'>): string {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customRule: DesignRule = {
      ...rule,
      id,
      standard: 'CUSTOM'
    };
    
    this.customRules.set(id, customRule);
    return id;
  }
  
  /**
   * Remove custom rule
   */
  public removeCustomRule(id: string): boolean {
    return this.customRules.delete(id);
  }
  
  /**
   * Get all rules
   */
  public getAllRules(): DesignRule[] {
    return [
      ...Array.from(this.rules.values()),
      ...Array.from(this.customRules.values())
    ];
  }
  
  /**
   * Enable/disable rule
   */
  public setRuleEnabled(id: string, enabled: boolean): boolean {
    const rule = this.rules.get(id) || this.customRules.get(id);
    if (!rule) return false;
    
    rule.enabled = enabled;
    return true;
  }
  
  /**
   * Build validation context
   */
  private buildContext(configuration: CrateConfiguration): RuleContext {
    const dimensions = calculateCrateDimensions(configuration);
    const weight = calculateEnhancedCrateWeight(configuration);
    
    const aspectRatios = {
      lengthToWidth: configuration.dimensions.length / configuration.dimensions.width,
      lengthToHeight: configuration.dimensions.length / configuration.dimensions.height,
      widthToHeight: configuration.dimensions.width / configuration.dimensions.height
    };
    
    const volume = (dimensions.external.width * dimensions.external.length * dimensions.external.height) / 1728;
    const volumetricDensity = weight.estimatedGross / volume;
    
    return {
      dimensions,
      weight,
      aspectRatios,
      volumetricDensity,
      centerOfGravity: configuration.centerOfGravity?.combinedCoG
    };
  }
  
  /**
   * Export validation report
   */
  public exportReport(report: ValidationReport, format: 'json' | 'html' | 'pdf' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
        
      case 'html':
        return this.generateHTMLReport(report);
        
      case 'pdf':
        // Would integrate with PDF generation library
        return 'PDF export not yet implemented';
        
      default:
        return JSON.stringify(report, null, 2);
    }
  }
  
  /**
   * Generate HTML report
   */
  private generateHTMLReport(report: ValidationReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Design Validation Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #2c3e50; color: white; padding: 20px; }
    .score { font-size: 48px; font-weight: bold; }
    .violation { margin: 10px 0; padding: 10px; border-left: 4px solid #e74c3c; }
    .warning { border-left-color: #f39c12; }
    .info { border-left-color: #3498db; }
    .suggestion { background: #ecf0f1; padding: 10px; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Design Validation Report</h1>
    <p>Generated: ${report.timestamp.toLocaleString()}</p>
    <div class="score">${report.score.toFixed(1)}%</div>
  </div>
  
  <h2>Summary</h2>
  <p>Total Rules: ${report.rules.total}</p>
  <p>Passed: ${report.rules.passed}</p>
  <p>Failed: ${report.rules.failed}</p>
  <p>Warnings: ${report.rules.warnings}</p>
  
  <h2>Violations</h2>
  ${report.violations.map(v => `
    <div class="violation ${v.severity}">
      <h3>${v.ruleName}</h3>
      <p>${v.message}</p>
      ${v.currentValue ? `<p>Current: ${v.currentValue}</p>` : ''}
      ${v.expectedValue ? `<p>Expected: ${v.expectedValue}</p>` : ''}
      ${v.suggestion ? `<div class="suggestion">${v.suggestion}</div>` : ''}
      ${v.reference ? `<p><small>Reference: ${v.reference}</small></p>` : ''}
    </div>
  `).join('')}
  
  ${report.suggestions.length > 0 ? `
    <h2>Suggestions</h2>
    <ul>
      ${report.suggestions.map(s => `<li>${s}</li>`).join('')}
    </ul>
  ` : ''}
</body>
</html>
    `;
  }
}

// Singleton instance
export const designRulesEngine = new DesignRulesEngine();