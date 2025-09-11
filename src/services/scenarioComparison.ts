/**
 * Scenario Comparison Service
 * Enables comparing multiple crate configurations side-by-side
 */

import { CrateConfiguration } from '@/types/crate';
import { calculateEnhancedCrateWeight, WeightBreakdown } from './weightCalculations';
import { CostCalculator, CostBreakdown } from './costCalculator';
import { ComplianceValidator, ComplianceReport } from './complianceValidator';
import { calculateCrateDimensions } from './crateCalculations';
import { BOMGenerator } from './bomGenerator';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  configuration: CrateConfiguration;
  createdAt: Date;
  modifiedAt: Date;
  tags: string[];
  results?: {
    weight: WeightBreakdown;
    cost: CostBreakdown;
    compliance: ComplianceReport;
    dimensions: ReturnType<typeof calculateCrateDimensions>;
    bom: ReturnType<BOMGenerator['generateBOM']>;
  };
}

export interface ComparisonDelta {
  metric: string;
  category: string;
  scenarioA: number | string;
  scenarioB: number | string;
  difference: number | string;
  percentageChange?: number;
  unit: string;
  significance: 'high' | 'medium' | 'low';
  favorable: 'A' | 'B' | 'neutral';
}

export interface ComparisonReport {
  scenarioA: Scenario;
  scenarioB: Scenario;
  deltas: ComparisonDelta[];
  recommendations: string[];
  overallComparison: {
    costEfficiency: 'A' | 'B' | 'equal';
    weightOptimization: 'A' | 'B' | 'equal';
    complianceScore: 'A' | 'B' | 'equal';
    overallWinner: 'A' | 'B' | 'draw';
  };
  timestamp: Date;
}

export class ScenarioComparisonService {
  private scenarios: Map<string, Scenario> = new Map();
  
  /**
   * Create a new scenario
   */
  public createScenario(
    name: string,
    description: string,
    configuration: CrateConfiguration,
    tags: string[] = []
  ): Scenario {
    const id = `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate all results for the scenario
    const results = this.calculateScenarioResults(configuration);
    
    const scenario: Scenario = {
      id,
      name,
      description,
      configuration,
      createdAt: new Date(),
      modifiedAt: new Date(),
      tags,
      results
    };
    
    this.scenarios.set(id, scenario);
    return scenario;
  }
  
  /**
   * Update an existing scenario
   */
  public updateScenario(id: string, updates: Partial<Scenario>): Scenario | null {
    const scenario = this.scenarios.get(id);
    if (!scenario) return null;
    
    const updatedScenario = {
      ...scenario,
      ...updates,
      modifiedAt: new Date()
    };
    
    // Recalculate results if configuration changed
    if (updates.configuration) {
      updatedScenario.results = this.calculateScenarioResults(updates.configuration);
    }
    
    this.scenarios.set(id, updatedScenario);
    return updatedScenario;
  }
  
  /**
   * Delete a scenario
   */
  public deleteScenario(id: string): boolean {
    return this.scenarios.delete(id);
  }
  
  /**
   * Get all scenarios
   */
  public getAllScenarios(): Scenario[] {
    return Array.from(this.scenarios.values());
  }
  
  /**
   * Get scenario by ID
   */
  public getScenario(id: string): Scenario | null {
    return this.scenarios.get(id) || null;
  }
  
  /**
   * Compare two scenarios
   */
  public compareScenarios(scenarioAId: string, scenarioBId: string): ComparisonReport | null {
    const scenarioA = this.scenarios.get(scenarioAId);
    const scenarioB = this.scenarios.get(scenarioBId);
    
    if (!scenarioA || !scenarioB) return null;
    
    // Ensure both scenarios have results
    if (!scenarioA.results) {
      scenarioA.results = this.calculateScenarioResults(scenarioA.configuration);
    }
    if (!scenarioB.results) {
      scenarioB.results = this.calculateScenarioResults(scenarioB.configuration);
    }
    
    const deltas = this.calculateDeltas(scenarioA, scenarioB);
    const recommendations = this.generateRecommendations(deltas, scenarioA, scenarioB);
    const overallComparison = this.determineOverallComparison(deltas, scenarioA, scenarioB);
    
    return {
      scenarioA,
      scenarioB,
      deltas,
      recommendations,
      overallComparison,
      timestamp: new Date()
    };
  }
  
  /**
   * Calculate results for a scenario
   */
  private calculateScenarioResults(configuration: CrateConfiguration) {
    const weight = calculateEnhancedCrateWeight(configuration);
    const costCalculator = new CostCalculator(configuration);
    const cost = costCalculator.calculateCosts();
    const complianceValidator = new ComplianceValidator(configuration);
    const compliance = complianceValidator.validateCompliance();
    const dimensions = calculateCrateDimensions(configuration);
    const bomGenerator = new BOMGenerator(configuration);
    const bom = bomGenerator.generateBOM();
    
    return {
      weight,
      cost,
      compliance,
      dimensions,
      bom
    };
  }
  
  /**
   * Calculate deltas between two scenarios
   */
  private calculateDeltas(scenarioA: Scenario, scenarioB: Scenario): ComparisonDelta[] {
    const deltas: ComparisonDelta[] = [];
    
    if (!scenarioA.results || !scenarioB.results) return deltas;
    
    // Weight comparisons
    deltas.push({
      metric: 'Total Weight',
      category: 'Weight',
      scenarioA: scenarioA.results.weight.estimatedGross,
      scenarioB: scenarioB.results.weight.estimatedGross,
      difference: scenarioB.results.weight.estimatedGross - scenarioA.results.weight.estimatedGross,
      percentageChange: ((scenarioB.results.weight.estimatedGross - scenarioA.results.weight.estimatedGross) / scenarioA.results.weight.estimatedGross) * 100,
      unit: 'lbs',
      significance: 'high',
      favorable: scenarioA.results.weight.estimatedGross < scenarioB.results.weight.estimatedGross ? 'A' : 'B'
    });
    
    // Cost comparisons
    deltas.push({
      metric: 'Total Cost',
      category: 'Cost',
      scenarioA: scenarioA.results.cost.summary.total,
      scenarioB: scenarioB.results.cost.summary.total,
      difference: scenarioB.results.cost.summary.total - scenarioA.results.cost.summary.total,
      percentageChange: ((scenarioB.results.cost.summary.total - scenarioA.results.cost.summary.total) / scenarioA.results.cost.summary.total) * 100,
      unit: 'USD',
      significance: 'high',
      favorable: scenarioA.results.cost.summary.total < scenarioB.results.cost.summary.total ? 'A' : 'B'
    });
    
    deltas.push({
      metric: 'Material Cost',
      category: 'Cost',
      scenarioA: scenarioA.results.cost.summary.materialsCost,
      scenarioB: scenarioB.results.cost.summary.materialsCost,
      difference: scenarioB.results.cost.summary.materialsCost - scenarioA.results.cost.summary.materialsCost,
      percentageChange: ((scenarioB.results.cost.summary.materialsCost - scenarioA.results.cost.summary.materialsCost) / scenarioA.results.cost.summary.materialsCost) * 100,
      unit: 'USD',
      significance: 'medium',
      favorable: scenarioA.results.cost.summary.materialsCost < scenarioB.results.cost.summary.materialsCost ? 'A' : 'B'
    });
    
    deltas.push({
      metric: 'Labor Cost',
      category: 'Cost',
      scenarioA: scenarioA.results.cost.summary.laborCost,
      scenarioB: scenarioB.results.cost.summary.laborCost,
      difference: scenarioB.results.cost.summary.laborCost - scenarioA.results.cost.summary.laborCost,
      percentageChange: ((scenarioB.results.cost.summary.laborCost - scenarioA.results.cost.summary.laborCost) / scenarioA.results.cost.summary.laborCost) * 100,
      unit: 'USD',
      significance: 'medium',
      favorable: scenarioA.results.cost.summary.laborCost < scenarioB.results.cost.summary.laborCost ? 'A' : 'B'
    });
    
    // Dimension comparisons
    const volumeA = (scenarioA.results.dimensions.external.width * 
                     scenarioA.results.dimensions.external.length * 
                     scenarioA.results.dimensions.external.height) / 1728;
    const volumeB = (scenarioB.results.dimensions.external.width * 
                     scenarioB.results.dimensions.external.length * 
                     scenarioB.results.dimensions.external.height) / 1728;
    
    deltas.push({
      metric: 'Total Volume',
      category: 'Dimensions',
      scenarioA: volumeA,
      scenarioB: volumeB,
      difference: volumeB - volumeA,
      percentageChange: ((volumeB - volumeA) / volumeA) * 100,
      unit: 'ft³',
      significance: 'medium',
      favorable: volumeA < volumeB ? 'A' : 'B'
    });
    
    // Compliance comparisons
    const complianceScoreA = scenarioA.results.compliance.checks.filter(c => c.status === 'pass').length;
    const complianceScoreB = scenarioB.results.compliance.checks.filter(c => c.status === 'pass').length;
    
    deltas.push({
      metric: 'Compliance Score',
      category: 'Compliance',
      scenarioA: complianceScoreA,
      scenarioB: complianceScoreB,
      difference: complianceScoreB - complianceScoreA,
      percentageChange: ((complianceScoreB - complianceScoreA) / complianceScoreA) * 100,
      unit: 'checks passed',
      significance: 'high',
      favorable: complianceScoreA > complianceScoreB ? 'A' : 'B'
    });
    
    // Performance metrics
    deltas.push({
      metric: 'Cost per Pound',
      category: 'Efficiency',
      scenarioA: scenarioA.results.cost.metrics.costPerPound,
      scenarioB: scenarioB.results.cost.metrics.costPerPound,
      difference: scenarioB.results.cost.metrics.costPerPound - scenarioA.results.cost.metrics.costPerPound,
      percentageChange: ((scenarioB.results.cost.metrics.costPerPound - scenarioA.results.cost.metrics.costPerPound) / scenarioA.results.cost.metrics.costPerPound) * 100,
      unit: 'USD/lb',
      significance: 'low',
      favorable: scenarioA.results.cost.metrics.costPerPound < scenarioB.results.cost.metrics.costPerPound ? 'A' : 'B'
    });
    
    deltas.push({
      metric: 'Lead Time',
      category: 'Production',
      scenarioA: scenarioA.results.cost.metrics.leadTimeDays,
      scenarioB: scenarioB.results.cost.metrics.leadTimeDays,
      difference: scenarioB.results.cost.metrics.leadTimeDays - scenarioA.results.cost.metrics.leadTimeDays,
      percentageChange: ((scenarioB.results.cost.metrics.leadTimeDays - scenarioA.results.cost.metrics.leadTimeDays) / scenarioA.results.cost.metrics.leadTimeDays) * 100,
      unit: 'days',
      significance: 'medium',
      favorable: scenarioA.results.cost.metrics.leadTimeDays < scenarioB.results.cost.metrics.leadTimeDays ? 'A' : 'B'
    });
    
    return deltas;
  }
  
  /**
   * Generate recommendations based on comparison
   */
  private generateRecommendations(
    deltas: ComparisonDelta[],
    scenarioA: Scenario,
    scenarioB: Scenario
  ): string[] {
    const recommendations: string[] = [];
    
    // Cost recommendations
    const costDelta = deltas.find(d => d.metric === 'Total Cost');
    if (costDelta && Math.abs(costDelta.percentageChange || 0) > 10) {
      const cheaper = costDelta.favorable === 'A' ? scenarioA : scenarioB;
      const expensive = costDelta.favorable === 'A' ? scenarioB : scenarioA;
      recommendations.push(
        `Consider ${cheaper.name} for cost savings of $${Math.abs(costDelta.difference as number).toFixed(2)} (${Math.abs(costDelta.percentageChange || 0).toFixed(1)}% reduction)`
      );
    }
    
    // Weight recommendations
    const weightDelta = deltas.find(d => d.metric === 'Total Weight');
    if (weightDelta && Math.abs(weightDelta.percentageChange || 0) > 5) {
      const lighter = weightDelta.favorable === 'A' ? scenarioA : scenarioB;
      recommendations.push(
        `${lighter.name} offers ${Math.abs(weightDelta.difference as number).toFixed(0)} lbs weight reduction, potentially lowering shipping costs`
      );
    }
    
    // Compliance recommendations
    const complianceDelta = deltas.find(d => d.metric === 'Compliance Score');
    if (complianceDelta && (complianceDelta.difference as number) !== 0) {
      const better = complianceDelta.favorable === 'A' ? scenarioA : scenarioB;
      recommendations.push(
        `${better.name} has better compliance with ${Math.abs(complianceDelta.difference as number)} more checks passed`
      );
    }
    
    // Volume efficiency
    const volumeDelta = deltas.find(d => d.metric === 'Total Volume');
    if (volumeDelta && Math.abs(volumeDelta.percentageChange || 0) > 10) {
      const smaller = volumeDelta.favorable === 'A' ? scenarioA : scenarioB;
      recommendations.push(
        `${smaller.name} is more space-efficient with ${Math.abs(volumeDelta.percentageChange || 0).toFixed(1)}% less volume`
      );
    }
    
    // Lead time
    const leadTimeDelta = deltas.find(d => d.metric === 'Lead Time');
    if (leadTimeDelta && Math.abs(leadTimeDelta.difference as number) > 2) {
      const faster = leadTimeDelta.favorable === 'A' ? scenarioA : scenarioB;
      recommendations.push(
        `${faster.name} can be delivered ${Math.abs(leadTimeDelta.difference as number)} days faster`
      );
    }
    
    return recommendations;
  }
  
  /**
   * Determine overall comparison winner
   */
  private determineOverallComparison(
    deltas: ComparisonDelta[],
    scenarioA: Scenario,
    scenarioB: Scenario
  ): ComparisonReport['overallComparison'] {
    const costDelta = deltas.find(d => d.metric === 'Total Cost');
    const weightDelta = deltas.find(d => d.metric === 'Total Weight');
    const complianceDelta = deltas.find(d => d.metric === 'Compliance Score');
    
    const costEfficiency = costDelta?.favorable === 'A' ? 'A' : costDelta?.favorable === 'B' ? 'B' : 'equal';
    const weightOptimization = weightDelta?.favorable === 'A' ? 'A' : weightDelta?.favorable === 'B' ? 'B' : 'equal';
    const complianceScore = complianceDelta?.favorable === 'A' ? 'A' : complianceDelta?.favorable === 'B' ? 'B' : 'equal';
    
    // Count wins
    let aWins = 0;
    let bWins = 0;
    
    deltas.forEach(delta => {
      if (delta.significance === 'high') {
        if (delta.favorable === 'A') aWins += 2;
        else if (delta.favorable === 'B') bWins += 2;
      } else if (delta.significance === 'medium') {
        if (delta.favorable === 'A') aWins += 1;
        else if (delta.favorable === 'B') bWins += 1;
      }
    });
    
    const overallWinner = aWins > bWins ? 'A' : bWins > aWins ? 'B' : 'draw';
    
    return {
      costEfficiency,
      weightOptimization,
      complianceScore,
      overallWinner
    };
  }
  
  /**
   * Export comparison report
   */
  public exportComparisonReport(report: ComparisonReport, format: 'json' | 'csv' | 'pdf' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
        
      case 'csv':
        const headers = ['Metric', 'Category', 'Scenario A', 'Scenario B', 'Difference', '% Change', 'Unit', 'Favorable'];
        const rows = report.deltas.map(d => [
          d.metric,
          d.category,
          d.scenarioA,
          d.scenarioB,
          d.difference,
          d.percentageChange?.toFixed(2) || '',
          d.unit,
          d.favorable
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
        
      case 'pdf':
        // Would integrate with a PDF generation library
        return 'PDF export not yet implemented';
        
      default:
        return JSON.stringify(report, null, 2);
    }
  }
}

// Singleton instance
export const scenarioComparisonService = new ScenarioComparisonService();