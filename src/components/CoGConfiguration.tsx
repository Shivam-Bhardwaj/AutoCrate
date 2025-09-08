'use client';

import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Target, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  calculateCoG,
  validateCoGStability,
  calculateCoGMarkingPosition,
} from '@/services/cog-calculator';

export function CoGConfiguration() {
  const { configuration, weightBreakdown, updateCenterOfGravity } = useCrateStore();
  const { addLog } = useLogsStore();

  const cog = configuration.centerOfGravity;
  const productWeight = configuration.weight.product;
  const crateWeight = weightBreakdown?.total || 0;

  // Auto-calculate combined CoG when inputs change
  const handleProductCoGChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const currentCoG = cog?.productCoG || { x: 0, y: 0, z: 0 };
    const newProductCoG = {
      ...currentCoG,
      [axis]: value,
    };

    // Calculate combined CoG
    const combinedCoG = calculateCoG(
      productWeight,
      newProductCoG,
      configuration.dimensions,
      crateWeight
    );

    updateCenterOfGravity({
      productCoG: newProductCoG,
      combinedCoG,
    });

    addLog(
      'info',
      'config',
      `Product CoG ${axis.toUpperCase()} updated to ${value}"`,
      undefined,
      undefined,
      'CoGConfiguration'
    );
  };

  // Calculate stability if we have CoG data
  const stability = cog?.combinedCoG
    ? validateCoGStability(cog.combinedCoG, configuration.dimensions)
    : null;

  const markingPositions = cog?.combinedCoG
    ? calculateCoGMarkingPosition(cog.combinedCoG, configuration.dimensions)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Center of Gravity (CoG) Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product CoG Input */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <Label className="text-lg font-medium">Product Center of Gravity</Label>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Enter the product&apos;s center of gravity coordinates relative to the crate&apos;s
              origin (bottom-left-front corner). These coordinates will be used to calculate the
              combined center of gravity for stability analysis.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cog-x">X Coordinate (inches)</Label>
              <Input
                id="cog-x"
                type="number"
                step="0.125"
                value={cog?.productCoG?.x || 0}
                onChange={(e) => handleProductCoGChange('x', Number(e.target.value))}
                placeholder="From left side"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cog-y">Y Coordinate (inches)</Label>
              <Input
                id="cog-y"
                type="number"
                step="0.125"
                value={cog?.productCoG?.y || 0}
                onChange={(e) => handleProductCoGChange('y', Number(e.target.value))}
                placeholder="From front side"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cog-z">Z Coordinate (inches)</Label>
              <Input
                id="cog-z"
                type="number"
                step="0.125"
                value={cog?.productCoG?.z || 0}
                onChange={(e) => handleProductCoGChange('z', Number(e.target.value))}
                placeholder="From bottom"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Combined CoG Display */}
        {cog?.combinedCoG && (
          <div className="space-y-4">
            <Label className="text-lg font-medium">Combined Center of Gravity</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded">
                <div className="text-sm text-muted-foreground">X</div>
                <div className="text-lg font-semibold">{cog.combinedCoG.x.toFixed(2)}&quot;</div>
              </div>
              <div className="p-3 bg-muted rounded">
                <div className="text-sm text-muted-foreground">Y</div>
                <div className="text-lg font-semibold">{cog.combinedCoG.y.toFixed(2)}&quot;</div>
              </div>
              <div className="p-3 bg-muted rounded">
                <div className="text-sm text-muted-foreground">Z</div>
                <div className="text-lg font-semibold">{cog.combinedCoG.z.toFixed(2)}&quot;</div>
              </div>
            </div>
          </div>
        )}

        {/* Stability Analysis */}
        {stability && (
          <>
            <Separator />
            <div className="space-y-4">
              <Label className="text-lg font-medium">Stability Analysis</Label>

              <Alert
                className={
                  stability.isStable
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                }
              >
                {stability.isStable ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <strong>Stability Score: {stability.stabilityScore}/100</strong>
                  {stability.isStable ? (
                    <span className="text-green-800 dark:text-green-200">
                      {' '}
                      - CoG is within safe limits
                    </span>
                  ) : (
                    <span className="text-red-800 dark:text-red-200">
                      {' '}
                      - CoG requires attention
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              {stability.warnings.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Warnings:</Label>
                  <ul className="space-y-1">
                    {stability.warnings.map((warning, index) => (
                      <li
                        key={index}
                        className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2"
                      >
                        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        {/* Marking Positions */}
        {markingPositions && (
          <>
            <Separator />
            <div className="space-y-4">
              <Label className="text-lg font-medium">CoG Marking Positions</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-muted rounded">
                  <div className="text-sm font-medium">Top Face</div>
                  <div className="text-xs text-muted-foreground">
                    X: {markingPositions.top.x.toFixed(2)}&quot; | Y:{' '}
                    {markingPositions.top.y.toFixed(2)}&quot;
                  </div>
                </div>
                <div className="p-3 bg-muted rounded">
                  <div className="text-sm font-medium">Front Face</div>
                  <div className="text-xs text-muted-foreground">
                    X: {markingPositions.front.x.toFixed(2)}&quot; | Y:{' '}
                    {markingPositions.front.y.toFixed(2)}&quot;
                  </div>
                </div>
                <div className="p-3 bg-muted rounded">
                  <div className="text-sm font-medium">Side Face</div>
                  <div className="text-xs text-muted-foreground">
                    X: {markingPositions.side.x.toFixed(2)}&quot; | Y:{' '}
                    {markingPositions.side.y.toFixed(2)}&quot;
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Weight Information */}
        <Separator />
        <div className="space-y-2">
          <Label>Weight Information</Label>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Product Weight:</span>
              <span className="ml-2 font-medium">{productWeight} lbs</span>
            </div>
            <div>
              <span className="text-muted-foreground">Crate Weight:</span>
              <span className="ml-2 font-medium">{crateWeight.toFixed(1)} lbs</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
