'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';

interface WeightSavings {
  standardWeight: number;
  chamferedWeight: number;
  savings: number;
  savingsPercentage: number;
}

interface VolumeReduction {
  standardVolume: number;
  chamferedVolume: number;
  reduction: number;
  reductionPercentage: number;
  dimensionalWeightReduction?: number;
}

interface CostSavings {
  standardCost: number;
  chamferedCost: number;
  savings: number;
  savingsPercentage: number;
  handlingFeeSavings?: number;
}

type AirShipmentUpdate = Partial<{
  enabled?: boolean;
  chamfer?: Partial<{
    enabled: boolean;
    angle: number;
    depth: number;
  }>;
  costPerPound?: number;
  dimensionalWeightFactor?: number;
}>;

export default function AirShipmentOptimization() {
  const { configuration, weightBreakdown } = useCrateStore();
  const updateAirShipment = (_p: AirShipmentUpdate) => {};
  const { logUser } = useLogsStore();

  const [weightSavings, setWeightSavings] = useState<WeightSavings>({
    standardWeight: 0,
    chamferedWeight: 0,
    savings: 0,
    savingsPercentage: 0,
  });

  const [volumeReduction, setVolumeReduction] = useState<VolumeReduction>({
    standardVolume: 0,
    chamferedVolume: 0,
    reduction: 0,
    reductionPercentage: 0,
  });

  const [costSavings, setCostSavings] = useState<CostSavings>({
    standardCost: 0,
    chamferedCost: 0,
    savings: 0,
    savingsPercentage: 0,
  });

  // Calculate weight savings based on enhanced weight calculations
  const calculateWeightSavings = () => {
    if (!configuration.airShipment?.enabled || !configuration.airShipment?.chamfer.enabled) {
      return;
    }

    const { chamfer } = configuration.airShipment;

    // Get the actual crate weight from enhanced calculations
    const standardCrateWeight = weightBreakdown?.total || 0;

    // Calculate weight reduction from chamfering using material density
    const { dimensions } = configuration;
    const materialDensity = 35; // lbs/cubic foot for plywood
    const chamferVolumeReduction = (chamfer.depth ** 2 / 2) * chamfer.depth * 8; // 8 corners
    const volumeReductionCubicFeet = chamferVolumeReduction / 1728;
    const weightReduction = volumeReductionCubicFeet * materialDensity * 0.8; // 80% efficiency factor

    const chamferedWeight = Math.max(
      standardCrateWeight * 0.7,
      standardCrateWeight - weightReduction
    );

    setWeightSavings({
      standardWeight: standardCrateWeight,
      chamferedWeight,
      savings: standardCrateWeight - chamferedWeight,
      savingsPercentage:
        standardCrateWeight > 0
          ? ((standardCrateWeight - chamferedWeight) / standardCrateWeight) * 100
          : 0,
    });
  };

  // Calculate volume reduction
  const calculateVolumeReduction = () => {
    if (!configuration.airShipment?.enabled || !configuration.airShipment?.chamfer.enabled) {
      return;
    }

    const { dimensions } = configuration;
    const { chamfer } = configuration.airShipment;

    // Calculate external dimensions
    const standardVolume = dimensions.length * dimensions.width * dimensions.height;

    // More accurate chamfered volume calculation
    // Chamfer affects the external dimensions, but not the internal product space
    const chamferReduction = chamfer.depth * 2; // Reduction on each side
    const chamferedLength = Math.max(0.1, dimensions.length - chamferReduction);
    const chamferedWidth = Math.max(0.1, dimensions.width - chamferReduction);
    const chamferedHeight = Math.max(0.1, dimensions.height - chamferReduction);

    const chamferedVolume = chamferedLength * chamferedWidth * chamferedHeight;
    const volumeReduction = standardVolume - chamferedVolume;

    // Calculate dimensional weight impact
    const standardDimensionalWeight =
      (standardVolume / 1728) * configuration.airShipment.dimensionalWeightFactor;
    const chamferedDimensionalWeight =
      (chamferedVolume / 1728) * configuration.airShipment.dimensionalWeightFactor;

    setVolumeReduction({
      standardVolume,
      chamferedVolume,
      reduction: volumeReduction,
      reductionPercentage: standardVolume > 0 ? (volumeReduction / standardVolume) * 100 : 0,
      dimensionalWeightReduction: standardDimensionalWeight - chamferedDimensionalWeight,
    });
  };

  // Calculate cost savings
  const calculateCostSavings = () => {
    if (!configuration.airShipment?.enabled) {
      return;
    }

    const { airShipment } = configuration;
    const { costPerPound, dimensionalWeightFactor } = airShipment;

    // Calculate dimensional weights
    const standardVolumeCubicFeet = volumeReduction.standardVolume / 1728;
    const chamferedVolumeCubicFeet = volumeReduction.chamferedVolume / 1728;

    const standardDimensionalWeight = standardVolumeCubicFeet * dimensionalWeightFactor;
    const chamferedDimensionalWeight = chamferedVolumeCubicFeet * dimensionalWeightFactor;

    // Use dimensional weight vs actual weight, whichever is greater for each scenario
    const standardBillableWeight = Math.max(
      weightSavings.standardWeight,
      standardDimensionalWeight
    );
    const chamferedBillableWeight = Math.max(
      weightSavings.chamferedWeight,
      chamferedDimensionalWeight
    );

    // Calculate costs
    const standardCost = standardBillableWeight * costPerPound;
    const chamferedCost = chamferedBillableWeight * costPerPound;
    const costSavingsAmount = Math.max(0, standardCost - chamferedCost);

    // Additional savings from reduced handling fees (smaller dimensions)
    const handlingFeeSavings = (volumeReduction.reduction / 1728) * 0.5; // $0.50 per cubic foot saved
    const totalSavings = costSavingsAmount + handlingFeeSavings;

    setCostSavings({
      standardCost,
      chamferedCost,
      savings: totalSavings,
      savingsPercentage: standardCost > 0 ? (totalSavings / standardCost) * 100 : 0,
      handlingFeeSavings,
    });
  };

  // Recalculate when configuration changes
  useEffect(() => {
    calculateWeightSavings();
    calculateVolumeReduction();
  }, [
    configuration.dimensions,
    configuration.cap.topPanel.thickness,
    configuration.airShipment?.enabled,
    configuration.airShipment?.chamfer.enabled,
    configuration.airShipment?.chamfer.angle,
    configuration.airShipment?.chamfer.depth,
    weightBreakdown?.total,
    calculateVolumeReduction,
    calculateWeightSavings,
  ]);

  useEffect(() => {
    calculateCostSavings();
  }, [weightSavings, volumeReduction, calculateCostSavings]);

  // Force 3D viewer update when air shipment settings change
  useEffect(() => {
    if (configuration.airShipment?.enabled) {
      // Dispatch custom event to trigger 3D viewer update
      window.dispatchEvent(
        new CustomEvent('airShipmentUpdated', {
          detail: {
            enabled: true,
            chamfer: configuration.airShipment.chamfer,
          },
        })
      );
    }
  }, [configuration.airShipment?.enabled, configuration.airShipment?.chamfer]);

  const handleAirShipmentToggle = (enabled: boolean) => {
    updateAirShipment({ enabled });
    logUser(
      'ui',
      `Air shipment mode ${enabled ? 'enabled' : 'disabled'}`,
      undefined,
      'AirShipmentOptimization'
    );
  };

  const handleChamferToggle = (enabled: boolean) => {
    if (configuration.airShipment) {
      updateAirShipment({
        chamfer: {
          ...configuration.airShipment.chamfer,
          enabled,
        },
      });
      logUser(
        'ui',
        `Chamfer ${enabled ? 'enabled' : 'disabled'}`,
        undefined,
        'AirShipmentOptimization'
      );
    }
  };

  const handleChamferAngleChange = (angle: number) => {
    if (configuration.airShipment) {
      updateAirShipment({
        chamfer: {
          ...configuration.airShipment.chamfer,
          angle: Math.max(15, Math.min(45, angle)), // Clamp between 15-45 degrees
        },
      });
    }
  };

  const handleChamferDepthChange = (depth: number) => {
    if (configuration.airShipment) {
      updateAirShipment({
        chamfer: {
          ...configuration.airShipment.chamfer,
          depth: Math.max(0.5, Math.min(6, depth)), // Clamp between 0.5-6 inches
        },
      });
    }
  };

  const handleCostPerPoundChange = (cost: number) => {
    updateAirShipment({ costPerPound: Math.max(0.5, cost) });
  };

  if (!configuration.airShipment) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Air Shipment Optimization</CardTitle>
        <CardDescription>
          Optimize crate design for air freight by reducing weight and volume through chamfering
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Air Shipment Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="air-shipment-toggle">Enable Air Shipment Mode</Label>
            <p className="text-sm text-muted-foreground">
              Optimize crate design for air freight cost reduction
            </p>
          </div>
          <Switch
            id="air-shipment-toggle"
            checked={configuration.airShipment.enabled}
            onCheckedChange={handleAirShipmentToggle}
          />
        </div>

        {configuration.airShipment.enabled && (
          <>
            <Separator />

            {/* Chamfer Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="chamfer-toggle">Enable Chamfering</Label>
                  <p className="text-sm text-muted-foreground">
                    Round crate corners to reduce weight and volume
                  </p>
                </div>
                <Switch
                  id="chamfer-toggle"
                  checked={configuration.airShipment.chamfer.enabled}
                  onCheckedChange={handleChamferToggle}
                />
              </div>

              {configuration.airShipment.chamfer.enabled && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="chamfer-angle">Chamfer Angle (degrees)</Label>
                    <Input
                      id="chamfer-angle"
                      type="number"
                      min="15"
                      max="45"
                      value={configuration.airShipment.chamfer.angle}
                      onChange={(e) => handleChamferAngleChange(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chamfer-depth">Chamfer Depth (inches)</Label>
                    <Input
                      id="chamfer-depth"
                      type="number"
                      min="0.5"
                      max="6"
                      step="0.125"
                      value={configuration.airShipment.chamfer.depth}
                      onChange={(e) => handleChamferDepthChange(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Cost Configuration */}
            <div className="space-y-4">
              <Label htmlFor="cost-per-pound">Air Freight Cost per Pound (USD)</Label>
              <Input
                id="cost-per-pound"
                type="number"
                min="0.5"
                step="0.1"
                value={configuration.airShipment.costPerPound}
                onChange={(e) => handleCostPerPoundChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Calculations Display */}
            <div className="space-y-4">
              <h4 className="font-semibold">Optimization Results</h4>

              {/* Weight Savings */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Weight Savings
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Standard:</span>
                    <br />
                    <span className="font-medium">
                      {weightSavings.standardWeight.toFixed(1)} lbs
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chamfered:</span>
                    <br />
                    <span className="font-medium">
                      {weightSavings.chamferedWeight.toFixed(1)} lbs
                    </span>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-800/30 rounded">
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    Savings: {weightSavings.savings.toFixed(1)} lbs (
                    {weightSavings.savingsPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Volume Reduction */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Volume Reduction
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Standard:</span>
                    <br />
                    <span className="font-medium">
                      {volumeReduction.standardVolume.toFixed(0)} in³
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chamfered:</span>
                    <br />
                    <span className="font-medium">
                      {volumeReduction.chamferedVolume.toFixed(0)} in³
                    </span>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-green-100 dark:bg-green-800/30 rounded">
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Reduction: {volumeReduction.reduction.toFixed(0)} in³ (
                    {volumeReduction.reductionPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Cost Savings */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  Cost Savings
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Standard:</span>
                    <br />
                    <span className="font-medium">${costSavings.standardCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chamfered:</span>
                    <br />
                    <span className="font-medium">${costSavings.chamferedCost.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-purple-100 dark:bg-purple-800/30 rounded">
                  <span className="font-medium text-purple-800 dark:text-purple-200">
                    Savings: ${costSavings.savings.toFixed(2)} (
                    {costSavings.savingsPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Comparison */}
            <div className="space-y-4">
              <h4 className="font-semibold">Visual Comparison</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                  <h5 className="font-medium mb-2">Standard Design</h5>
                  <div className="w-16 h-16 mx-auto bg-gray-400 dark:bg-gray-600 rounded-sm" />
                  <p className="text-xs text-muted-foreground mt-2">Sharp corners</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                  <h5 className="font-medium mb-2">Chamfered Design</h5>
                  <div className="w-16 h-16 mx-auto bg-blue-400 dark:bg-blue-600 rounded" />
                  <p className="text-xs text-muted-foreground mt-2">Rounded corners</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
