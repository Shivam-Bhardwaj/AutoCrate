'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { Download, Copy, Check } from 'lucide-react';
import { formatInches } from '@/utils/format-inches';

export default function OutputSection() {
  const configuration = useCrateStore((state) => state.configuration);
  const { logSuccess, logError, logUser } = useLogsStore();
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    try {
      logUser('export', 'Exporting crate design', undefined, 'OutputSection');
      // Create a simple design summary for export
      const designData = {
        projectName: configuration.projectName,
        dimensions: configuration.dimensions,
        weight: configuration.weight,
        timestamp: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(designData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `${configuration.projectName.replace(/\s+/g, '_')}_Design.json`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logSuccess('export', 'Design exported successfully', filename, 'OutputSection');
    } catch (error: unknown) {
      logError(
        'export',
        'Export failed',
        error instanceof Error ? error.message : 'Unknown error',
        'OutputSection'
      );
    }
  };

  const handleCopy = async () => {
    try {
      logUser('export', 'Copying design summary to clipboard', undefined, 'OutputSection');
      const summary = `${configuration.projectName}\nDimensions: ${configuration.dimensions.length}x${configuration.dimensions.width}x${configuration.dimensions.height} inches\nWeight: ${configuration.weight.product} kg (Max: ${configuration.weight.maxGross} kg)`;
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      logSuccess('export', 'Design summary copied to clipboard', undefined, 'OutputSection');
      setTimeout(() => setCopied(false), 2000);
    } catch (error: unknown) {
      logError(
        'export',
        'Failed to copy to clipboard',
        error instanceof Error ? error.message : 'Unknown error',
        'OutputSection'
      );
    }
  };

  const calculateMaterialCost = () => {
    // Rough estimate based on crate dimensions
    const volume =
      (configuration.dimensions.length *
        configuration.dimensions.width *
        configuration.dimensions.height) /
      1728; // cubic feet
    const estimatedCost = volume * 15; // $15 per cubic foot estimate for lumber
    return estimatedCost.toFixed(2);
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Generated Output</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="summary"
              className="w-full"
              onValueChange={(value) => {
                logUser('navigation', `Switched to ${value} tab`, undefined, 'OutputSection');
              }}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="bom">BOM</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="nx-expression">NX Expression</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="glass-panel">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          Load Capacity Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-600">Maximum Load</label>
                            <p className="text-2xl font-bold text-blue-600">
                              {configuration.weight.maxGross} kg
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Safety Factor</label>
                            <p className="text-2xl font-bold text-green-600">
                              {(
                                configuration.weight.maxGross / configuration.weight.product
                              ).toFixed(1)}
                              x
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-panel hover:scale-105 transition-transform">
                      <CardHeader>
                        <CardTitle className="text-lg">Load Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-4">
                          <p className="font-mono text-lg">W = F / A</p>
                        </div>
                        <p className="text-sm text-gray-600">Where W is weight per unit area</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="glass-panel">
                    <CardHeader>
                      <CardTitle>Structural Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Corner joints</p>
                            <p className="text-sm text-gray-600">
                              Reinforce with brackets for heavy loads
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-sm">
                            Medium
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Center floor</p>
                            <p className="text-sm text-gray-600">
                              Add center support for loads &gt; 1000kg
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm">
                            Low
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-panel">
                    <CardHeader>
                      <CardTitle>ISPM-15 Compliance Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="text-sm">Heat treatment (56°C for 30 min)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="text-sm">Moisture content &lt; 20%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="text-sm">Debarked wood</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="text-sm">IPPC marking required</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Dimensions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">External:</dt>
                          <dd className="font-medium">
                            {formatInches(configuration.dimensions.length)} x{' '}
                            {formatInches(configuration.dimensions.width)} x{' '}
                            {formatInches(configuration.dimensions.height)} inches
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Internal:</dt>
                          <dd className="font-medium">
                            {formatInches(
                              configuration.dimensions.length -
                                configuration.cap.leftPanel.thickness -
                                configuration.cap.rightPanel.thickness
                            )}{' '}
                            x{' '}
                            {formatInches(
                              configuration.dimensions.width -
                                configuration.cap.frontPanel.thickness -
                                configuration.cap.backPanel.thickness
                            )}{' '}
                            x{' '}
                            {formatInches(
                              configuration.dimensions.height -
                                configuration.base.floorboardThickness -
                                configuration.cap.topPanel.thickness
                            )}{' '}
                            inches
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Weight Capacity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Product Weight:</dt>
                          <dd className="font-medium">{configuration.weight.product} kg</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Max Gross:</dt>
                          <dd className="font-medium">{configuration.weight.maxGross} kg</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Safety Factor:</dt>
                          <dd className="font-medium">
                            {(
                              (configuration.weight.maxGross / configuration.weight.product) * 100 -
                              100
                            ).toFixed(0)}
                            %
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configuration Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-muted-foreground mb-1">Base Type:</dt>
                        <dd className="font-medium capitalize">{configuration.base.type}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground mb-1">Panel Material:</dt>
                        <dd className="font-medium capitalize">
                          {configuration.cap.topPanel.material}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground mb-1">Fastener Type:</dt>
                        <dd className="font-medium capitalize">{configuration.fasteners.type}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground mb-1">Vinyl:</dt>
                        <dd className="font-medium">
                          {configuration.vinyl.enabled
                            ? `${configuration.vinyl.type} (${configuration.vinyl.coverage})`
                            : 'None'}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bom" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bill of Materials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Component</th>
                          <th className="text-right py-2">Quantity</th>
                          <th className="text-right py-2">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Base Skids</td>
                          <td className="text-right">{configuration.base.skidCount}</td>
                          <td className="text-right">pcs</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Floorboard</td>
                          <td className="text-right">1</td>
                          <td className="text-right">panel</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Side Panels</td>
                          <td className="text-right">5</td>
                          <td className="text-right">panels</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">{configuration.fasteners.type}</td>
                          <td className="text-right">
                            {Math.ceil(
                              (configuration.dimensions.length * 4 +
                                configuration.dimensions.width * 4 +
                                configuration.dimensions.height * 4) /
                                configuration.fasteners.spacing
                            )}
                          </td>
                          <td className="text-right">pcs</td>
                        </tr>
                        {configuration.vinyl.enabled && (
                          <tr className="border-b">
                            <td className="py-2">Vinyl Sheet</td>
                            <td className="text-right">
                              {Math.ceil(
                                (configuration.dimensions.length *
                                  configuration.dimensions.width *
                                  2 +
                                  configuration.dimensions.length *
                                    configuration.dimensions.height *
                                    2 +
                                  configuration.dimensions.width *
                                    configuration.dimensions.height *
                                    2) /
                                  1000000
                              )}
                            </td>
                            <td className="text-right">m²</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between font-medium">
                        <span>Estimated Material Cost:</span>
                        <span>${calculateMaterialCost()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nx-expression">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">NX CAD Expression</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Generate NX CAD expressions for parametric crate design. Import the
                            generated .exp file into NX for automated crate construction.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Features Include:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Parametric dimensions</li>
                              <li>• Two-point diagonal construction</li>
                              <li>• Material specifications</li>
                              <li>• Assembly instructions</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Export Details:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Filename includes dimensions</li>
                              <li>• UTC timestamp for versioning</li>
                              <li>• Product weight in filename</li>
                              <li>• Ready for NX import</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-center">
                          <Button size="lg" className="w-full" disabled>
                            Generate NX Expression
                            <span className="ml-2 text-xs">(Coming Soon)</span>
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Filename format: ProductName_LxWxH_WeightLbs_YYYYMMDD_HHMMSS_UTC.exp
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
