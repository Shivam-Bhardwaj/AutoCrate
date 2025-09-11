'use client';

import { useEffect, useCallback, useState } from 'react';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { calculateCrateDimensions } from '@/services/crateCalculations';
import { BOMGenerator } from '@/services/bomGenerator';
import { NXExpressionGenerator } from '@/services/nx-generator';
import { calculateEnhancedCrateWeight } from '@/services/weightCalculations';

interface ComputeResults {
  dimensions: {
    external: { width: number; length: number; height: number };
    internal: { width: number; length: number; height: number };
  };
  weight: {
    product: number;
    estimatedGross: number;
    safetyFactor: number;
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
    const startTime = Date.now();
    
    try {
      logInfo('system', 'Starting compute pipeline', 'Calculating crate specifications...', 'CrateEngine');

      // Step 1: Crate Mathematics & Geometry
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
      
      logInfo('system', 'Geometry calculated', `External: ${geometry.external.width}" × ${geometry.external.length}" × ${geometry.external.height}"`, 'CrateCalculations');

      // Step 2: Weight Analysis
      const weightBreakdown = calculateEnhancedCrateWeight(configuration);
      const weights = {
        product: configuration.weight.product,
        estimatedGross: Math.round(configuration.weight.product * 1.2),
        safetyFactor: 20
      };
      logInfo('system', 'Weight analysis complete', `Product: ${weights.product}lbs, Gross: ${weights.estimatedGross}lbs`, 'WeightCalculations');

      // Step 3: Bill of Materials Generation  
      // TODO: Integrate with full BOMGenerator service
      // const bomGen = new BOMGenerator(configuration, bomOptions);
      const mockBOM = [
        { item: 'Base Panel', material: 'Plywood 3/4"', quantity: 1, cost: 45.00, total: 45.00 },
        { item: 'Side Panels', material: 'Plywood 3/4"', quantity: 4, cost: 30.00, total: 120.00 },
        { item: 'Top Panel', material: 'Plywood 3/4"', quantity: 1, cost: 45.00, total: 45.00 },
        { item: 'Corner Braces', material: 'Pine 2x2"', quantity: 4, cost: 8.00, total: 32.00 },
        { item: 'Screws', material: 'Stainless Steel', quantity: 48, cost: 0.375, total: 18.00 },
        { item: 'Hinges', material: 'Heavy Duty', quantity: 2, cost: 12.00, total: 24.00 }
      ];
      const totalCost = mockBOM.reduce((sum, item) => sum + item.total, 0);
      logInfo('system', 'BOM generated', `${mockBOM.length} items, Total cost: $${totalCost.toFixed(2)}`, 'BOMGenerator');

      // Step 4: NX CAD Expressions
      // TODO: Integrate with full NXExpressionGenerator service  
      // const nxGen = new NXExpressionGenerator(configuration);
      // const nxExpression = nxGen.generateExpression();
      const mockExpressions = [
        `Length = ${configuration.dimensions.length}.000`,
        `Width = ${configuration.dimensions.width}.000`,
        `Height = ${configuration.dimensions.height}.000`,
        'Base_Thickness = 0.750',
        'Panel_Thickness = 0.750',
        'Corner_Radius = 0.125',
        'Clearance_X = 1.500',
        'Clearance_Y = 1.500',
        'Clearance_Z = 1.500'
      ];
      logInfo('system', 'NX expressions generated', `${mockExpressions.length} parametric expressions`, 'NXGenerator');

      // Step 5: Configuration Summary
      const summary = {
        baseType: configuration.base.type,
        panelMaterial: 'plywood', // From configuration when available
        fastenerType: 'nails',    // From configuration when available  
        vinyl: configuration.vinyl ? 'Applied' : 'None',
        totalCost
      };

      const computedResults: ComputeResults = {
        dimensions: geometry,
        weight: weights,
        bom: mockBOM,
        nxExpressions: mockExpressions,
        summary
      };

      setResults(computedResults);
      setComputeVersion(prev => prev + 1);

      const duration = Date.now() - startTime;
      logInfo('system', 'Pipeline complete', `All calculations finished in ${duration}ms`, 'CrateEngine');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError('system', 'Pipeline failed', errorMessage, 'CrateEngine');
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