'use client';

import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Truck, Ruler, CheckCircle } from 'lucide-react';
import {
  AMATHeaderSpecifications,
  AMATRailSpecifications,
  createHeaderRailConfiguration,
  determineAMATHeaderSize,
  determineAMATRailConfiguration,
} from '@/types/amat-specifications';

export function HeaderRailConfig() {
  const { configuration, updateHeaderRailConfig } = useCrateStore();
  const { addLog } = useLogsStore();

  const headerRailConfig = configuration.headerRailConfig;

  // Auto-calculate configuration if not set
  const handleAutoCalculate = () => {
    const autoConfig = createHeaderRailConfiguration(
      configuration.dimensions,
      configuration.weight.product
    );

    updateHeaderRailConfig(autoConfig);
    addLog(
      'info',
      'config',
      'Header/rail configuration auto-calculated',
      undefined,
      undefined,
      'HeaderRailConfig'
    );
  };

  const handleHeaderSizeChange = (size: '2x4' | '2x6' | '2x8' | '2x10' | '2x12') => {
    if (!headerRailConfig) return;

    const headerSpec = AMATHeaderSpecifications[size];
    updateHeaderRailConfig({
      headers: {
        ...headerRailConfig.headers,
        size,
        material: headerSpec.material,
      },
    });
    addLog(
      'info',
      'config',
      `Header size changed to ${size}`,
      undefined,
      undefined,
      'HeaderRailConfig'
    );
  };

  const handleRailSizeChange = (size: '2x4' | '2x6' | '2x8') => {
    if (!headerRailConfig) return;

    const railSpec = AMATRailSpecifications[size];
    updateHeaderRailConfig({
      rails: {
        ...headerRailConfig.rails,
        size,
        material: railSpec.material,
        spacing: Math.min(headerRailConfig.rails.spacing, railSpec.spacing.maxCenters),
      },
    });
    addLog(
      'info',
      'config',
      `Rail size changed to ${size}`,
      undefined,
      undefined,
      'HeaderRailConfig'
    );
  };

  const handleRailSpacingChange = (spacing: number) => {
    if (!headerRailConfig) return;

    const railSpec = AMATRailSpecifications[headerRailConfig.rails.size];
    const validSpacing = Math.min(spacing, railSpec.spacing.maxCenters);

    updateHeaderRailConfig({
      rails: {
        ...headerRailConfig.rails,
        spacing: validSpacing,
        count: Math.max(2, Math.ceil(configuration.dimensions.width / validSpacing) + 1),
      },
    });
    addLog(
      'info',
      'config',
      `Rail spacing changed to ${validSpacing}"`,
      undefined,
      undefined,
      'HeaderRailConfig'
    );
  };

  // Calculate recommended values
  const recommendedHeaderSize = determineAMATHeaderSize(
    configuration.dimensions,
    configuration.weight.product
  );
  const recommendedRailConfig = determineAMATRailConfiguration(
    configuration.dimensions,
    configuration.weight.product
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Header and Rail Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto-Calculate Button */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto-Calculate Configuration</Label>
            <p className="text-sm text-muted-foreground">
              Automatically determine header and rail specifications based on crate size and weight
            </p>
          </div>
          <button
            onClick={handleAutoCalculate}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Calculate
          </button>
        </div>

        <Separator />

        {/* Current Configuration Status */}
        {headerRailConfig && (
          <Alert
            className={
              headerRailConfig.autoCalculated
                ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                : 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
            }
          >
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {headerRailConfig.autoCalculated
                ? 'Configuration auto-calculated based on AMAT standards'
                : 'Configuration manually adjusted'}
            </AlertDescription>
          </Alert>
        )}

        {/* Header Configuration */}
        {headerRailConfig && (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-blue-500" />
                <Label className="text-lg font-medium">Header Configuration</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="header-size">Header Size</Label>
                  <Select
                    value={headerRailConfig.headers.size}
                    onValueChange={handleHeaderSizeChange}
                  >
                    <SelectTrigger id="header-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AMATHeaderSpecifications).map(([size, spec]) => (
                        <SelectItem key={size} value={size}>
                          {size} ({spec.dimensions.width}&quot; x {spec.dimensions.thickness}&quot;)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="header-count">Header Count</Label>
                  <Input
                    id="header-count"
                    type="number"
                    min="2"
                    max="4"
                    value={headerRailConfig.headers.count}
                    onChange={(e) =>
                      updateHeaderRailConfig({
                        headers: { ...headerRailConfig.headers, count: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Header Spacing</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {headerRailConfig.headers.spacing.toFixed(1)}&quot; centers
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Max Span</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {AMATHeaderSpecifications[headerRailConfig.headers.size].maxSpan}&quot;
                    unsupported
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Rail Configuration */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">Rail Configuration</Label>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rail-size">Rail Size</Label>
                  <Select value={headerRailConfig.rails.size} onValueChange={handleRailSizeChange}>
                    <SelectTrigger id="rail-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AMATRailSpecifications).map(([size, spec]) => (
                        <SelectItem key={size} value={size}>
                          {size} ({spec.dimensions.width}&quot; x {spec.dimensions.thickness}&quot;)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rail-count">Rail Count</Label>
                  <Input
                    id="rail-count"
                    type="number"
                    min="2"
                    value={headerRailConfig.rails.count}
                    onChange={(e) =>
                      updateHeaderRailConfig({
                        rails: { ...headerRailConfig.rails, count: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rail-spacing">Rail Spacing (inches)</Label>
                  <Input
                    id="rail-spacing"
                    type="number"
                    step="0.5"
                    min="12"
                    max={AMATRailSpecifications[headerRailConfig.rails.size].spacing.maxCenters}
                    value={headerRailConfig.rails.spacing}
                    onChange={(e) => handleRailSpacingChange(parseFloat(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Centers</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {AMATRailSpecifications[headerRailConfig.rails.size].spacing.maxCenters}&quot;
                    per AMAT
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Recommendations */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">AMAT Recommendations</Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <div className="text-sm font-medium">Recommended Header Size</div>
                  <div className="text-lg">{recommendedHeaderSize}</div>
                  <div className="text-xs text-muted-foreground">
                    Based on {configuration.dimensions.length}&quot; x{' '}
                    {configuration.dimensions.width}&quot; crate, {configuration.weight.product} lbs
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <div className="text-sm font-medium">Recommended Rail Spacing</div>
                  <div className="text-lg">{recommendedRailConfig.spacing.toFixed(1)}&quot;</div>
                  <div className="text-xs text-muted-foreground">
                    {recommendedRailConfig.count} rails total
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Enable/Disable Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="headers-enabled">Enable Headers</Label>
            <p className="text-sm text-muted-foreground">
              Headers provide additional structural support
            </p>
          </div>
          <Switch
            id="headers-enabled"
            checked={headerRailConfig?.headers.enabled ?? false}
            onCheckedChange={(checked) => {
              if (headerRailConfig) {
                updateHeaderRailConfig({
                  headers: { ...headerRailConfig.headers, enabled: checked },
                });
              }
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="rails-enabled">Enable Rails</Label>
            <p className="text-sm text-muted-foreground">Rails provide forklift access points</p>
          </div>
          <Switch
            id="rails-enabled"
            checked={headerRailConfig?.rails.enabled ?? false}
            onCheckedChange={(checked) => {
              if (headerRailConfig) {
                updateHeaderRailConfig({
                  rails: { ...headerRailConfig.rails, enabled: checked },
                });
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
