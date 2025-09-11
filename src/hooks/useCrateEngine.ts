'use client';

import { useEffect, useCallback, useState } from 'react';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { calculateCrateDimensions } from '@/services/crateCalculations';
import { BOMGenerator } from '@/services/bomGenerator';
import { NXExpressionGenerator } from '@/services/nx-generator';
import { calculateEnhancedCrateWeight, WeightBreakdown } from '@/services/weightCalculations';
import { ComplianceValidator, ComplianceReport } from '@/services/complianceValidator';
import { CostCalculator, CostBreakdown } from '@/services/costCalculator';
import { PerformanceMonitor } from '@/utils/performanceMonitor';

interface ComputeResults {
  dimensions: {
    external: { width: number; length: number; height: number };
    internal: { width: number; length: number; height: number };
  };
  weight: {
    product: number;
    estimatedGross: number;
    safetyFactor: number;
    breakdown?: WeightBreakdown;
  };
  bom: Array<{
    item: string;
    material: string;
    quantity: number;
    cost: number;
    total: number;
  }>;
  nxExpressions: string[];
  summary: {
    baseType: string;
    panelMaterial: string;
    fastenerType: string;
    vinyl: string;
    totalCost: number;
  };
  compliance?: ComplianceReport;
  cost?: CostBreakdown;
  performance?: {
    calculationTime: number;
    lastUpdated: Date;
  };
}

export function useCrateEngine() {
  const { configuration } = useCrateStore();
  const { logInfo, logError } = useLogsStore();
  const [isComputing, setIsComputing] = useState(false);
  const [results, setResults] = useState<ComputeResults | null>(null);
  const [computeVersion, setComputeVersion] = useState(0);

  const runComputePipeline = useCallback(async () => {
    if (isComputing) return; // Prevent concurrent runs

    setIsComputing(true);
    PerformanceMonitor.start('compute-pipeline', 'calculation');
    
    try {
      logInfo('system', 'Starting compute pipeline', 'Calculating crate specifications...', 'CrateEngine');

      // Step 1: Crate Mathematics & Geometry
      PerformanceMonitor.start('geometry-calculation', 'calculation');
      const geometryCalc = calculateCrateDimensions(
        configuration.dimensions.length,
        configuration.dimensions.width, 
        configuration.dimensions.height
      );
      
      const geometry = {
        external: {
          width: configuration.dimensions.width + 2,
          length: configuration.dimensions.length + 2,
          height: configuration.dimensions.height + 2
        },
        internal: {
          width: configuration.dimensions.width - 1,
          length: configuration.dimensions.length - 1,
          height: configuration.dimensions.height - 1
        }
      };
      PerformanceMonitor.end('geometry-calculation');
      logInfo('system', 'Geometry calculated', `External: ${geometry.external.width}" × ${geometry.external.length}" × ${geometry.external.height}"`, 'CrateCalculations');

      // Step 2: Weight Analysis
      PerformanceMonitor.start('weight-analysis', 'calculation');
      const weightBreakdown = calculateEnhancedCrateWeight(configuration);
      const weights = {
        product: configuration.weight.product,
        estimatedGross: Math.round(weightBreakdown.total),
        safetyFactor: 20,
        breakdown: weightBreakdown
      };
      PerformanceMonitor.end('weight-analysis');
      logInfo('system', 'Weight analysis complete', `Product: ${weights.product}lbs, Gross: ${weights.estimatedGross}lbs`, 'WeightCalculations');

      // Step 3: Cost Analysis
      PerformanceMonitor.start('cost-analysis', 'calculation');
      const costCalculator = new CostCalculator(configuration);
      const costBreakdown = costCalculator.calculateCosts();
      PerformanceMonitor.end('cost-analysis');
      logInfo('system', 'Cost analysis complete', `Total: $${costBreakdown.summary.total.toFixed(2)}`, 'CostCalculator');

      // Step 4: Compliance Validation
      PerformanceMonitor.start('compliance-validation', 'calculation');
      const complianceValidator = new ComplianceValidator(configuration);
      const complianceReport = complianceValidator.validateCompliance();
      PerformanceMonitor.end('compliance-validation');
      logInfo('system', 'Compliance validation complete', `Status: ${complianceReport.overall}`, 'ComplianceValidator');

      // Step 5: Bill of Materials Generation
      PerformanceMonitor.start('bom-generation', 'calculation');
      const bomItems = costBreakdown.materials.items.map(item => ({
        item: item.item,
        material: item.material,
        quantity: item.quantity,
        cost: item.unitCost,
        total: item.totalCost
      }));
      PerformanceMonitor.end('bom-generation');
      logInfo('system', 'BOM generated', `${bomItems.length} items, Total cost: $${costBreakdown.materials.subtotal.toFixed(2)}`, 'BOMGenerator');

      // Step 6: NX CAD Expressions
      PerformanceMonitor.start('nx-expressions', 'calculation');
      try {
        const nxGen = new NXExpressionGenerator(configuration);
        const nxExpressions = nxGen.generateExpression().split('\n').filter(line => line.trim());
        PerformanceMonitor.end('nx-expressions');
        logInfo('system', 'NX expressions generated', `${nxExpressions.length} parametric expressions`, 'NXGenerator');
        
        // Step 7: Configuration Summary
        const summary = {
          baseType: configuration.base.type,
          panelMaterial: 'plywood',
          fastenerType: configuration.fasteners.type,
          vinyl: configuration.vinyl ? 'Applied' : 'None',
          totalCost: costBreakdown.summary.total
        };

        const performanceMetric = PerformanceMonitor.end('compute-pipeline');
        
        const computedResults: ComputeResults = {
          dimensions: geometry,
          weight: weights,
          bom: bomItems,
          nxExpressions,
          summary,
          compliance: complianceReport,
          cost: costBreakdown,
          performance: {
            calculationTime: performanceMetric?.duration || 0,
            lastUpdated: new Date()
          }
        };

        setResults(computedResults);
        setComputeVersion(prev => prev + 1);

        logInfo('system', 'Pipeline complete', `All calculations finished in ${performanceMetric?.duration.toFixed(0)}ms`, 'CrateEngine');
      } catch (nxError) {
        // Fallback to basic expressions if NX generation fails
        const fallbackExpressions = [
          `Length = ${configuration.dimensions.length}.000`,
          `Width = ${configuration.dimensions.width}.000`,
          `Height = ${configuration.dimensions.height}.000`,
          'Base_Thickness = 0.750',
          'Panel_Thickness = 0.750'
        ];
        
        const summary = {
          baseType: configuration.base.type,
          panelMaterial: 'plywood',
          fastenerType: configuration.fasteners.type,
          vinyl: configuration.vinyl ? 'Applied' : 'None',
          totalCost: costBreakdown.summary.total
        };

        const performanceMetric = PerformanceMonitor.end('compute-pipeline');
        
        const computedResults: ComputeResults = {
          dimensions: geometry,
          weight: weights,
          bom: bomItems,
          nxExpressions: fallbackExpressions,
          summary,
          compliance: complianceReport,
          cost: costBreakdown,
          performance: {
            calculationTime: performanceMetric?.duration || 0,
            lastUpdated: new Date()
          }
        };

        setResults(computedResults);
        setComputeVersion(prev => prev + 1);
        
        logInfo('system', 'Pipeline complete with fallback', `Calculations finished in ${performanceMetric?.duration.toFixed(0)}ms`, 'CrateEngine');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError('system', 'Pipeline failed', errorMessage, 'CrateEngine');
      PerformanceMonitor.end('compute-pipeline', { error: errorMessage });
    } finally {
      setIsComputing(false);
    }
  }, [configuration, isComputing, logInfo, logError]);

  // Debounced execution when configuration changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      runComputePipeline();
    }, 250); // 250ms debounce

    return () => clearTimeout(timeoutId);
  }, [configuration, runComputePipeline]);

  // Initial computation
  useEffect(() => {
    if (results === null) {
      runComputePipeline();
    }
  }, [runComputePipeline, results]);

  return {
    results,
    isComputing,
    computeVersion,
    forceRecompute: runComputePipeline
  };
}