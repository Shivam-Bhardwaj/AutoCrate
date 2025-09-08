'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { Download, Copy, Check } from 'lucide-react';
import { NXExpressionGenerator } from '@/services/nx-generator';
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
      const summary = `${configuration.projectName}\nDimensions: ${configuration.dimensions.length}x${configuration.dimensions.width}x${configuration.dimensions.height} inches\nWeight: ${configuration.weight.product} lbs`;
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

  const handleNXExport = () => {
    try {
      logUser('export', 'Generating NX expression', undefined, 'OutputSection');

      const generator = new NXExpressionGenerator(configuration);
      const expression = generator.generateExpression();

      // Create filename with format: {ProductName}_{L}x{W}x{H}_{Weight}lbs_{YYYYMMDD}_{HHMMSS}_UTC.exp
      const now = new Date();
      const timestamp = now
        .toISOString()
        .replace(/[:-]/g, '')
        .replace('T', '_')
        .replace('Z', '_UTC');
      const filename = `${configuration.projectName.replace(/\s+/g, '_')}_${configuration.dimensions.length}x${configuration.dimensions.width}x${configuration.dimensions.height}_${configuration.weight.product}lbs_${timestamp}.exp`;

      const blob = new Blob([expression.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logSuccess('export', 'NX expression exported successfully', filename, 'OutputSection');
    } catch (error: unknown) {
      logError(
        'export',
        'NX export failed',
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
    <div className="h-full overflow-y-auto p-6" role="main" aria-label="Generated output and analysis">
      <div className="space-y-6">
        <Card className="panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-h3 font-semibold text-text-primary">Generated Output</CardTitle>
            <div className="flex gap-3">
              <Button size="sm" variant="outline" onClick={handleCopy} className="btn btn-outline">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button size="sm" onClick={handleExport} className="btn btn-primary">
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
              <TabsList
                className="grid w-full grid-cols-4 bg-surface border border-borders"
                aria-label="Output data sections"
              >
                <TabsTrigger value="summary" aria-label="Show summary view" className="text-body text-text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-contrast">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="bom" aria-label="Show bill of materials view" className="text-body text-text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-contrast">
                  BOM
                </TabsTrigger>
                <TabsTrigger value="analysis" aria-label="Show analysis view" className="text-body text-text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-contrast">
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="nx-expression" aria-label="Show NX expression view" className="text-body text-text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-contrast">
                  NX Expression
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analysis">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="panel">
                      <CardHeader>
                        <CardTitle className="text-h4 font-semibold text-text-primary flex items-center gap-2">
                          Load Capacity Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="text-caption text-text-secondary block mb-1">Product Weight</label>
                            <p className="text-h2 font-bold text-primary">
                              {configuration.weight.product} lbs
                            </p>
                          </div>
                          <div>
                            <label className="text-caption text-text-secondary block mb-1">Estimated Gross</label>
                            <p className="text-h2 font-bold text-success">
                              {(configuration.weight.product * 1.2).toFixed(0)} lbs
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="panel">
                      <CardHeader>
                        <CardTitle className="text-h4 font-semibold text-text-primary">Load Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-6">
                          <p className="font-mono text-h3 text-text-primary">W = F / A</p>
                        </div>
                        <p className="text-caption text-text-secondary">Where W is weight per unit area</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="panel">
                    <CardHeader>
                      <CardTitle className="text-h4 font-semibold text-text-primary">Structural Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-surface border border-borders rounded-md">
                          <div>
                            <p className="text-body font-medium text-text-primary">Corner joints</p>
                            <p className="text-caption text-text-secondary">
                              Reinforce with brackets for heavy loads
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-warning-bg text-warning-contrast rounded-md text-small font-medium">
                            Medium
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-surface border border-borders rounded-md">
                          <div>
                            <p className="text-body font-medium text-text-primary">Center floor</p>
                            <p className="text-caption text-text-secondary">
                              Add center support for loads &gt; 1000kg
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-accent text-accent-contrast rounded-md text-small font-medium">
                            Low
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="panel">
                    <CardHeader>
                      <CardTitle className="text-h4 font-semibold text-text-primary">ISPM-15 Compliance Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-accent border-2 border-borders rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-accent-contrast rounded-full"></div>
                          </div>
                          <span className="text-body text-text-primary">Heat treatment (56°C for 30 min)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-success border-2 border-borders rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="text-body text-text-primary">Moisture content &lt; 20%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-success border-2 border-borders rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <span className="text-body text-text-primary">Debarked wood</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-warning-bg border-2 border-warning-border rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-warning-contrast rounded-full"></div>
                          </div>
                          <span className="text-body text-text-primary">IPPC marking required</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="summary" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="panel">
                    <CardHeader>
                      <CardTitle className="text-h4 font-semibold text-text-primary">Dimensions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-3 text-body">
                        <div className="flex justify-between items-center">
                          <dt className="text-text-secondary">External:</dt>
                          <dd className="font-medium text-text-primary">
                            {formatInches(configuration.dimensions.length)} x{' '}
                            {formatInches(configuration.dimensions.width)} x{' '}
                            {formatInches(configuration.dimensions.height)} inches
                          </dd>
                        </div>
                        <div className="flex justify-between items-center">
                          <dt className="text-text-secondary">Internal:</dt>
                          <dd className="font-medium text-text-primary">
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

                  <Card className="panel">
                    <CardHeader>
                      <CardTitle className="text-h4 font-semibold text-text-primary">Weight Capacity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-3 text-body">
                        <div className="flex justify-between items-center">
                          <dt className="text-text-secondary">Product Weight:</dt>
                          <dd className="font-medium text-text-primary">{configuration.weight.product} lbs</dd>
                        </div>
                        <div className="flex justify-between items-center">
                          <dt className="text-text-secondary">Estimated Gross:</dt>
                          <dd className="font-medium text-text-primary">
                            {(configuration.weight.product * 1.2).toFixed(0)} lbs
                          </dd>
                        </div>
                        <div className="flex justify-between items-center">
                          <dt className="text-text-secondary">Safety Factor:</dt>
                          <dd className="font-medium text-text-primary">20%</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>

                <Card className="panel">
                  <CardHeader>
                    <CardTitle className="text-h4 font-semibold text-text-primary">Configuration Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-6 text-body">
                      <div>
                        <dt className="text-text-secondary mb-2">Base Type:</dt>
                        <dd className="font-medium text-text-primary capitalize">{configuration.base.type}</dd>
                      </div>
                      <div>
                        <dt className="text-text-secondary mb-2">Panel Material:</dt>
                        <dd className="font-medium text-text-primary capitalize">
                          {configuration.cap.topPanel.material}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-text-secondary mb-2">Fastener Type:</dt>
                        <dd className="font-medium text-text-primary capitalize">{configuration.fasteners.type}</dd>
                      </div>
                      <div>
                        <dt className="text-text-secondary mb-2">Vinyl:</dt>
                        <dd className="font-medium text-text-primary">
                          {configuration.vinyl?.enabled
                            ? `${configuration.vinyl?.type} (${configuration.vinyl?.coverage})`
                            : 'None'}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bom" className="space-y-6">
                <Card className="panel">
                  <CardHeader>
                    <CardTitle className="text-h4 font-semibold text-text-primary">Bill of Materials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-body border-collapse">
                      <thead>
                        <tr className="border-b border-borders">
                          <th className="text-left py-3 text-text-primary font-semibold">Component</th>
                          <th className="text-right py-3 text-text-primary font-semibold">Quantity</th>
                          <th className="text-right py-3 text-text-primary font-semibold">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-borders hover:bg-surface-accent">
                          <td className="py-3 text-text-primary">Base Skids</td>
                          <td className="text-right py-3 text-text-primary">{configuration.base.skidCount}</td>
                          <td className="text-right py-3 text-text-secondary">pcs</td>
                        </tr>
                        <tr className="border-b border-borders hover:bg-surface-accent">
                          <td className="py-3 text-text-primary">Floorboard</td>
                          <td className="text-right py-3 text-text-primary">1</td>
                          <td className="text-right py-3 text-text-secondary">panel</td>
                        </tr>
                        <tr className="border-b border-borders hover:bg-surface-accent">
                          <td className="py-3 text-text-primary">Side Panels</td>
                          <td className="text-right py-3 text-text-primary">5</td>
                          <td className="text-right py-3 text-text-secondary">panels</td>
                        </tr>
                        <tr className="border-b border-borders hover:bg-surface-accent">
                          <td className="py-3 text-text-primary">{configuration.fasteners.type}</td>
                          <td className="text-right py-3 text-text-primary">
                            {Math.ceil(
                              (configuration.dimensions.length * 4 +
                                configuration.dimensions.width * 4 +
                                configuration.dimensions.height * 4) /
                                configuration.fasteners.spacing
                            )}
                          </td>
                          <td className="text-right py-3 text-text-secondary">pcs</td>
                        </tr>
                        {configuration.vinyl?.enabled && (
                          <tr className="border-b border-borders hover:bg-surface-accent">
                            <td className="py-3 text-text-primary">Vinyl Sheet</td>
                            <td className="text-right py-3 text-text-primary">
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
                            <td className="text-right py-3 text-text-secondary">m²</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <div className="mt-6 pt-4 border-t border-borders">
                      <div className="flex justify-between items-center text-body font-semibold">
                        <span className="text-text-primary">Estimated Material Cost:</span>
                        <span className="text-success">${calculateMaterialCost()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nx-expression">
                <div className="space-y-6">
                  <Card className="panel">
                    <CardHeader>
                      <CardTitle className="text-h4 font-semibold text-text-primary">NX CAD Expression</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="p-4 bg-surface border border-borders rounded-md">
                          <p className="text-body text-text-primary">
                            Generate NX CAD expressions for parametric crate design. Import the
                            generated .exp file into NX for automated crate construction.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-body font-semibold text-text-primary mb-3">Features Include:</h4>
                            <ul className="text-caption text-text-secondary space-y-2">
                              <li>• Parametric dimensions</li>
                              <li>• Two-point diagonal construction</li>
                              <li>• Material specifications</li>
                              <li>• Assembly instructions</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-body font-semibold text-text-primary mb-3">Export Details:</h4>
                            <ul className="text-caption text-text-secondary space-y-2">
                              <li>• Filename includes dimensions</li>
                              <li>• UTC timestamp for versioning</li>
                              <li>• Product weight in filename</li>
                              <li>• Ready for NX import</li>
                            </ul>
                          </div>
                        </div>
                        <div className="text-center pt-4">
                          <Button size="lg" className="w-full btn btn-primary" onClick={handleNXExport}>
                            Generate NX Expression
                          </Button>
                          <p className="text-caption text-text-secondary mt-3">
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
