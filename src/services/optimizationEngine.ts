/**
 * Optimization Engine Service
 * Provides intelligent recommendations for crate design optimization
 */

import { CrateConfiguration } from '@/types/crate';
import { calculateEnhancedCrateWeight } from './weightCalculations';
import { CostCalculator } from './costCalculator';
import { ComplianceValidator } from './complianceValidator';
import { determineAMATSkidSize, determineAMATCleating } from '@/types/amat-specifications';

export interface OptimizationSuggestion {
  id: string;
  category: 'weight' | 'cost' | 'material' | 'structural' | 'compliance';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  currentValue: number | string;
  suggestedValue: number | string;
  impact: {
    weightChange: number;
    costChange: number;
    complianceImpact: 'positive' | 'negative' | 'neutral';
  };
  implementation: string;
  estimatedSavings: number;
  implementationDifficulty: 'easy' | 'moderate' | 'complex';
  configChanges?: Partial<CrateConfiguration>;
}

export interface OptimizationReport {
  configuration: CrateConfiguration;
  currentMetrics: {
    totalWeight: number;
    totalCost: number;
    complianceScore: number;
    materialEfficiency: number;
    structuralIntegrity: number;
  };
  suggestions: OptimizationSuggestion[];
  potentialSavings: {
    weight: number;
    cost: number;
    percentageImprovement: number;
  };
  optimizedConfiguration?: CrateConfiguration;
  timestamp: Date;
}

export class OptimizationEngine {
  private configuration: CrateConfiguration;
  
  constructor(configuration: CrateConfiguration) {
    this.configuration = configuration;
  }
  
  /**
   * Run full optimization analysis
   */
  public runOptimization(): OptimizationReport {
    const currentMetrics = this.calculateCurrentMetrics();
    const suggestions: OptimizationSuggestion[] = [];
    
    // Weight optimization
    suggestions.push(...this.optimizeWeight());
    
    // Cost optimization
    suggestions.push(...this.optimizeCost());
    
    // Material efficiency
    suggestions.push(...this.optimizeMaterials());
    
    // Structural optimization
    suggestions.push(...this.optimizeStructure());
    
    // Compliance improvements
    suggestions.push(...this.optimizeCompliance());
    
    // Sort by priority and potential savings
    suggestions.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.estimatedSavings - a.estimatedSavings;
    });
    
    // Calculate potential savings
    const potentialSavings = this.calculatePotentialSavings(suggestions);
    
    // Generate optimized configuration if suggestions exist
    const optimizedConfiguration = suggestions.length > 0 ? 
      this.generateOptimizedConfiguration(suggestions.slice(0, 5)) : // Apply top 5 suggestions
      undefined;
    
    return {
      configuration: this.configuration,
      currentMetrics,
      suggestions,
      potentialSavings,
      optimizedConfiguration,
      timestamp: new Date()
    };
  }
  
  /**
   * Calculate current metrics
   */
  private calculateCurrentMetrics() {
    const weight = calculateEnhancedCrateWeight(this.configuration);
    const costCalculator = new CostCalculator(this.configuration);
    const cost = costCalculator.calculateCosts();
    const complianceValidator = new ComplianceValidator(this.configuration);
    const compliance = complianceValidator.validateCompliance();
    
    const complianceScore = compliance.checks.filter(c => c.status === 'pass').length / 
                           compliance.checks.length * 100;
    
    // Calculate material efficiency (ratio of product weight to total material weight)
    const materialEfficiency = (this.configuration.weight.product / weight.estimatedGross) * 100;
    
    // Estimate structural integrity based on skid configuration and weight distribution
    const structuralIntegrity = this.calculateStructuralIntegrity();
    
    return {
      totalWeight: weight.estimatedGross,
      totalCost: cost.summary.total,
      complianceScore,
      materialEfficiency,
      structuralIntegrity
    };
  }
  
  /**
   * Optimize weight
   */
  private optimizeWeight(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const currentWeight = calculateEnhancedCrateWeight(this.configuration);
    
    // Check panel thickness optimization
    if (this.configuration.cap.topPanel.thickness > 0.5 && this.configuration.weight.product < 500) {
      suggestions.push({
        id: 'weight_panel_thickness',
        category: 'weight',
        priority: 'medium',
        title: 'Reduce Panel Thickness',
        description: 'For loads under 500 lbs, 1/2" plywood provides sufficient strength',
        currentValue: this.configuration.cap.topPanel.thickness,
        suggestedValue: 0.5,
        impact: {
          weightChange: -15,
          costChange: -25,
          complianceImpact: 'neutral'
        },
        implementation: 'Change all panel materials to 1/2" plywood',
        estimatedSavings: 25,
        implementationDifficulty: 'easy',
        configChanges: {
          cap: {
            ...this.configuration.cap,
            topPanel: { ...this.configuration.cap.topPanel, thickness: 0.5 }
          }
        }
      });
    }
    
    // Check skid optimization
    const grossWeight = this.configuration.weight.product * 1.2;
    const currentSkidSize = determineAMATSkidSize(grossWeight);
    const optimalSkidSize = determineAMATSkidSize(grossWeight * 0.9); // Check if slightly lighter estimate works
    
    if (currentSkidSize !== optimalSkidSize && optimalSkidSize.includes('2x4')) {
      suggestions.push({
        id: 'weight_skid_optimization',
        category: 'weight',
        priority: 'high',
        title: 'Optimize Skid Size',
        description: 'Current weight allows for lighter skid configuration',
        currentValue: currentSkidSize,
        suggestedValue: optimalSkidSize,
        impact: {
          weightChange: -20,
          costChange: -30,
          complianceImpact: 'positive'
        },
        implementation: 'Adjust skid dimensions to optimal size for load',
        estimatedSavings: 30,
        implementationDifficulty: 'moderate'
      });
    }
    
    // Check for unnecessary reinforcements
    if (this.configuration.cap.topPanel.reinforcement && this.configuration.weight.product < 1000) {
      suggestions.push({
        id: 'weight_remove_reinforcement',
        category: 'weight',
        priority: 'low',
        title: 'Remove Unnecessary Reinforcement',
        description: 'Panel reinforcement not required for loads under 1000 lbs',
        currentValue: 'Reinforced',
        suggestedValue: 'Standard',
        impact: {
          weightChange: -8,
          costChange: -15,
          complianceImpact: 'neutral'
        },
        implementation: 'Remove panel reinforcement cleats',
        estimatedSavings: 15,
        implementationDifficulty: 'easy'
      });
    }
    
    return suggestions;
  }
  
  /**
   * Optimize cost
   */
  private optimizeCost(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const costCalculator = new CostCalculator(this.configuration);
    const currentCost = costCalculator.calculateCosts();
    
    // Material substitution
    if (this.configuration.cap.topPanel.material === 'plywood' && !this.configuration.amatCompliance?.isInternational) {
      suggestions.push({
        id: 'cost_material_substitution',
        category: 'cost',
        priority: 'medium',
        title: 'Use OSB Instead of Plywood',
        description: 'OSB provides similar strength at 40% lower cost for domestic shipping',
        currentValue: 'Plywood',
        suggestedValue: 'OSB',
        impact: {
          weightChange: 2,
          costChange: -currentCost.summary.materialsCost * 0.15,
          complianceImpact: 'neutral'
        },
        implementation: 'Replace plywood panels with OSB for non-international shipments',
        estimatedSavings: currentCost.summary.materialsCost * 0.15,
        implementationDifficulty: 'easy',
        configChanges: {
          cap: {
            ...this.configuration.cap,
            topPanel: { ...this.configuration.cap.topPanel, material: 'osb' }
          }
        }
      });
    }
    
    // Fastener optimization
    if (this.configuration.fasteners.type === 'screws' && this.configuration.weight.product < 2000) {
      suggestions.push({
        id: 'cost_fastener_optimization',
        category: 'cost',
        priority: 'low',
        title: 'Use Nails Instead of Screws',
        description: 'Nails provide adequate strength for lighter loads at 60% lower cost',
        currentValue: 'Screws',
        suggestedValue: 'Nails',
        impact: {
          weightChange: -1,
          costChange: -20,
          complianceImpact: 'neutral'
        },
        implementation: 'Replace screws with 16d common nails',
        estimatedSavings: 20,
        implementationDifficulty: 'easy',
        configChanges: {
          fasteners: { ...this.configuration.fasteners, type: 'nails' }
        }
      });
    }
    
    // Bulk material purchasing
    if (currentCost.materials.items.length > 5) {
      suggestions.push({
        id: 'cost_bulk_purchasing',
        category: 'cost',
        priority: 'medium',
        title: 'Bulk Material Purchasing',
        description: 'Order materials in bulk for 10-15% discount',
        currentValue: 'Individual pricing',
        suggestedValue: 'Bulk pricing',
        impact: {
          weightChange: 0,
          costChange: -currentCost.summary.materialsCost * 0.12,
          complianceImpact: 'neutral'
        },
        implementation: 'Negotiate bulk pricing with suppliers for volume orders',
        estimatedSavings: currentCost.summary.materialsCost * 0.12,
        implementationDifficulty: 'moderate'
      });
    }
    
    return suggestions;
  }
  
  /**
   * Optimize materials
   */
  private optimizeMaterials(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Panel sizing optimization to reduce waste
    const panelDimensions = {
      width: this.configuration.dimensions.width,
      height: this.configuration.dimensions.height,
      length: this.configuration.dimensions.length
    };
    
    // Check if dimensions can be adjusted to standard sheet sizes (48" x 96")
    const wastePercentage = this.calculateMaterialWaste(panelDimensions);
    
    if (wastePercentage > 15) {
      suggestions.push({
        id: 'material_waste_reduction',
        category: 'material',
        priority: 'high',
        title: 'Optimize Dimensions for Standard Sheets',
        description: `Current dimensions result in ${wastePercentage.toFixed(1)}% material waste`,
        currentValue: `${wastePercentage.toFixed(1)}% waste`,
        suggestedValue: '<10% waste',
        impact: {
          weightChange: -5,
          costChange: -50,
          complianceImpact: 'neutral'
        },
        implementation: 'Adjust crate dimensions to align with 48"x96" standard sheets',
        estimatedSavings: 50,
        implementationDifficulty: 'moderate'
      });
    }
    
    // Cleating optimization
    const maxDim = Math.max(this.configuration.dimensions.width, this.configuration.dimensions.length);
    const cleating = determineAMATCleating(maxDim);
    
    if (cleating.reinforcementRequired && this.configuration.weight.product < 500) {
      suggestions.push({
        id: 'material_cleating_optimization',
        category: 'material',
        priority: 'low',
        title: 'Reduce Cleating Requirements',
        description: 'Lighter loads may not require full cleating reinforcement',
        currentValue: cleating.cleatSize,
        suggestedValue: '2x2',
        impact: {
          weightChange: -10,
          costChange: -25,
          complianceImpact: 'neutral'
        },
        implementation: 'Use smaller cleats for non-critical reinforcement',
        estimatedSavings: 25,
        implementationDifficulty: 'easy'
      });
    }
    
    return suggestions;
  }
  
  /**
   * Optimize structure
   */
  private optimizeStructure(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Check center of gravity optimization
    if (this.configuration.centerOfGravity) {
      const cogOffset = Math.sqrt(
        Math.pow(this.configuration.centerOfGravity.productCoG.x, 2) +
        Math.pow(this.configuration.centerOfGravity.productCoG.y, 2)
      );
      
      if (cogOffset > 5) {
        suggestions.push({
          id: 'structure_cog_optimization',
          category: 'structural',
          priority: 'high',
          title: 'Optimize Center of Gravity',
          description: 'Center of gravity offset may cause instability during handling',
          currentValue: `${cogOffset.toFixed(1)}" offset`,
          suggestedValue: '<3" offset',
          impact: {
            weightChange: 5,
            costChange: 10,
            complianceImpact: 'positive'
          },
          implementation: 'Add ballast or adjust product positioning',
          estimatedSavings: -10, // Small cost increase for better stability
          implementationDifficulty: 'complex'
        });
      }
    }
    
    // Check skid spacing optimization
    const optimalSpacing = this.configuration.dimensions.length / (this.configuration.base.skidCount + 1);
    const currentSpacing = this.configuration.base.skidSpacing;
    
    if (Math.abs(optimalSpacing - currentSpacing) > 2) {
      suggestions.push({
        id: 'structure_skid_spacing',
        category: 'structural',
        priority: 'medium',
        title: 'Optimize Skid Spacing',
        description: 'Evenly distributed skids provide better load distribution',
        currentValue: `${currentSpacing}" spacing`,
        suggestedValue: `${optimalSpacing.toFixed(1)}" spacing`,
        impact: {
          weightChange: 0,
          costChange: 0,
          complianceImpact: 'positive'
        },
        implementation: 'Adjust skid positions for optimal load distribution',
        estimatedSavings: 0,
        implementationDifficulty: 'moderate'
      });
    }
    
    return suggestions;
  }
  
  /**
   * Optimize compliance
   */
  private optimizeCompliance(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const complianceValidator = new ComplianceValidator(this.configuration);
    const compliance = complianceValidator.validateCompliance();
    
    // Check for failing compliance items
    const failedChecks = compliance.checks.filter(c => c.status === 'fail');
    
    failedChecks.forEach(check => {
      if (check.category === 'ISPM-15' && !this.configuration.amatCompliance?.isInternational) {
        suggestions.push({
          id: `compliance_${check.requirement.toLowerCase().replace(/\s+/g, '_')}`,
          category: 'compliance',
          priority: 'high',
          title: `Fix: ${check.requirement}`,
          description: check.details,
          currentValue: check.value || 'Non-compliant',
          suggestedValue: check.min ? `≥${check.min} ${check.unit}` : 'Compliant',
          impact: {
            weightChange: 0,
            costChange: 50, // Certification cost
            complianceImpact: 'positive'
          },
          implementation: 'Obtain necessary certifications or adjust specifications',
          estimatedSavings: -50, // Cost to fix
          implementationDifficulty: 'moderate'
        });
      }
    });
    
    // MBB recommendation for sensitive equipment
    if (!this.configuration.amatCompliance?.mbbConfiguration?.enabled && 
        this.configuration.weight.product > 1000) {
      suggestions.push({
        id: 'compliance_add_mbb',
        category: 'compliance',
        priority: 'medium',
        title: 'Add Moisture Barrier Bag',
        description: 'Protect sensitive equipment from moisture damage',
        currentValue: 'No MBB',
        suggestedValue: 'MBB Applied',
        impact: {
          weightChange: 2,
          costChange: 75,
          complianceImpact: 'positive'
        },
        implementation: 'Add moisture barrier bag with desiccant and humidity indicators',
        estimatedSavings: -75,
        implementationDifficulty: 'easy'
      });
    }
    
    return suggestions;
  }
  
  /**
   * Calculate structural integrity score
   */
  private calculateStructuralIntegrity(): number {
    let score = 100;
    
    // Check weight to size ratio
    const volume = (this.configuration.dimensions.width * 
                   this.configuration.dimensions.length * 
                   this.configuration.dimensions.height) / 1728;
    const density = this.configuration.weight.product / volume;
    
    if (density > 50) score -= 10; // Heavy load penalty
    if (density < 5) score -= 5; // Too light may indicate oversizing
    
    // Check aspect ratios
    const aspectRatioLW = this.configuration.dimensions.length / this.configuration.dimensions.width;
    const aspectRatioLH = this.configuration.dimensions.length / this.configuration.dimensions.height;
    
    if (aspectRatioLW > 3 || aspectRatioLW < 0.33) score -= 15; // Poor aspect ratio
    if (aspectRatioLH > 3 || aspectRatioLH < 0.33) score -= 15;
    
    // Check skid configuration
    const skidScore = this.configuration.base.skidCount >= 3 ? 10 : 5;
    score = Math.min(100, score + skidScore);
    
    return Math.max(0, score);
  }
  
  /**
   * Calculate material waste percentage
   */
  private calculateMaterialWaste(dimensions: { width: number; height: number; length: number }): number {
    const standardSheet = { width: 48, height: 96 }; // Standard plywood sheet
    
    // Calculate how many panels can be cut from standard sheets
    const panels = [
      { width: dimensions.width, height: dimensions.height }, // Front/back
      { width: dimensions.length, height: dimensions.height }, // Sides
      { width: dimensions.width, height: dimensions.length }  // Top/bottom
    ];
    
    let totalWaste = 0;
    let totalArea = 0;
    
    panels.forEach(panel => {
      const panelsPerSheet = Math.floor(standardSheet.width / panel.width) * 
                             Math.floor(standardSheet.height / panel.height);
      if (panelsPerSheet === 0) {
        // Panel is larger than sheet, need multiple sheets
        const sheetsNeeded = Math.ceil(panel.width / standardSheet.width) * 
                            Math.ceil(panel.height / standardSheet.height);
        const usedArea = panel.width * panel.height;
        const sheetArea = sheetsNeeded * standardSheet.width * standardSheet.height;
        totalWaste += sheetArea - usedArea;
        totalArea += sheetArea;
      } else {
        const usedArea = panel.width * panel.height;
        const sheetArea = standardSheet.width * standardSheet.height;
        totalWaste += (sheetArea / panelsPerSheet) - usedArea;
        totalArea += sheetArea / panelsPerSheet;
      }
    });
    
    return totalArea > 0 ? (totalWaste / totalArea) * 100 : 0;
  }
  
  /**
   * Calculate potential savings
   */
  private calculatePotentialSavings(suggestions: OptimizationSuggestion[]) {
    const weightSavings = suggestions
      .filter(s => s.impact.weightChange < 0)
      .reduce((sum, s) => sum + Math.abs(s.impact.weightChange), 0);
    
    const costSavings = suggestions
      .filter(s => s.estimatedSavings > 0)
      .reduce((sum, s) => sum + s.estimatedSavings, 0);
    
    const currentMetrics = this.calculateCurrentMetrics();
    const percentageImprovement = (costSavings / currentMetrics.totalCost) * 100;
    
    return {
      weight: weightSavings,
      cost: costSavings,
      percentageImprovement
    };
  }
  
  /**
   * Generate optimized configuration
   */
  private generateOptimizedConfiguration(topSuggestions: OptimizationSuggestion[]): CrateConfiguration {
    let optimizedConfig = { ...this.configuration };
    
    topSuggestions.forEach(suggestion => {
      if (suggestion.configChanges) {
        optimizedConfig = {
          ...optimizedConfig,
          ...suggestion.configChanges
        };
      }
    });
    
    return optimizedConfig;
  }
}