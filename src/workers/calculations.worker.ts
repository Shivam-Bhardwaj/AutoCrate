/**
 * Web Worker for heavy calculations
 * Handles BOM generation, weight calculations, and NX generation in a background thread
 */

import { CrateConfiguration } from '@/types/crate';
import { calculateEnhancedCrateWeight, WeightBreakdown } from '@/services/weightCalculations';
import { calculateCrateDimensions } from '@/services/crateCalculations';
import { NXExpressionGenerator } from '@/services/nx-generator';
import { ComplianceValidator, ComplianceReport } from '@/services/complianceValidator';
import { CostCalculator, CostBreakdown } from '@/services/costCalculator';

export interface WorkerMessage {
  type: 'calculate' | 'cancel';
  id: string;
  payload?: {
    configuration: CrateConfiguration;
    options?: any;
  };
}

export interface WorkerResponse {
  type: 'result' | 'error' | 'progress';
  id: string;
  data?: any;
  error?: string;
  progress?: number;
}

// Helper to post progress updates
const postProgress = (id: string, progress: number, message?: string) => {
  self.postMessage({
    type: 'progress',
    id,
    progress,
    data: { message }
  } as WorkerResponse);
};

// Main calculation pipeline
const runCalculations = async (id: string, configuration: CrateConfiguration) => {
  try {
    // Step 1: Geometry calculations (10%)
    postProgress(id, 10, 'Calculating geometry...');
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

    // Step 2: Weight analysis (25%)
    postProgress(id, 25, 'Analyzing weight...');
    const weightBreakdown = calculateEnhancedCrateWeight(configuration);
    const weights = {
      product: configuration.weight.product,
      estimatedGross: Math.round(weightBreakdown.total),
      safetyFactor: 20,
      breakdown: weightBreakdown
    };

    // Step 3: Cost analysis (40%)
    postProgress(id, 40, 'Calculating costs...');
    const costCalculator = new CostCalculator(configuration);
    const costBreakdown = costCalculator.calculateCosts();

    // Step 4: Compliance validation (55%)
    postProgress(id, 55, 'Validating compliance...');
    const complianceValidator = new ComplianceValidator(configuration);
    const complianceReport = complianceValidator.validateCompliance();

    // Step 5: BOM generation (70%)
    postProgress(id, 70, 'Generating BOM...');
    const bomItems = costBreakdown.materials.items.map(item => ({
      item: item.item,
      material: item.material,
      quantity: item.quantity,
      cost: item.unitCost,
      total: item.totalCost
    }));

    // Step 6: NX expressions (85%)
    postProgress(id, 85, 'Generating NX expressions...');
    let nxExpressions: string[] = [];
    try {
      const nxGen = new NXExpressionGenerator(configuration);
      nxExpressions = nxGen.generateExpression().code.split('\n').filter(line => line.trim());
    } catch (error) {
      // Fallback to basic expressions
      nxExpressions = [
        `Length = ${configuration.dimensions.length}.000`,
        `Width = ${configuration.dimensions.width}.000`,
        `Height = ${configuration.dimensions.height}.000`,
        'Base_Thickness = 0.750',
        'Panel_Thickness = 0.750'
      ];
    }

    // Step 7: Final summary (100%)
    postProgress(id, 100, 'Finalizing...');
    const summary = {
      baseType: configuration.base.type,
      panelMaterial: 'plywood',
      fastenerType: configuration.fasteners.type,
      vinyl: configuration.vinyl ? 'Applied' : 'None',
      totalCost: costBreakdown.summary.total
    };

    // Return complete results
    self.postMessage({
      type: 'result',
      id,
      data: {
        dimensions: geometry,
        weight: weights,
        bom: bomItems,
        nxExpressions,
        summary,
        compliance: complianceReport,
        cost: costBreakdown,
        performance: {
          calculationTime: Date.now(),
          lastUpdated: new Date()
        }
      }
    } as WorkerResponse);

  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      error: error instanceof Error ? error.message : 'Unknown calculation error'
    } as WorkerResponse);
  }
};

// Handle messages from main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, id, payload } = event.data;

  switch (type) {
    case 'calculate':
      if (payload?.configuration) {
        runCalculations(id, payload.configuration);
      } else {
        self.postMessage({
          type: 'error',
          id,
          error: 'No configuration provided'
        } as WorkerResponse);
      }
      break;

    case 'cancel':
      // In a real implementation, we'd track and cancel ongoing calculations
      self.postMessage({
        type: 'error',
        id,
        error: 'Calculation cancelled'
      } as WorkerResponse);
      break;

    default:
      self.postMessage({
        type: 'error',
        id,
        error: `Unknown message type: ${type}`
      } as WorkerResponse);
  }
});

// Export for TypeScript
export default null;