'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { NXExpressionGenerator } from '@/services/nx-generator';
import { Download, Copy, Check } from 'lucide-react';
import NXInstructions from '@/components/NXInstructions';
import NXVisualGuide from '@/components/NXVisualGuide';
import { formatInches } from '@/utils/format-inches';

export default function OutputSection() {
  const configuration = useCrateStore((state) => state.configuration);
  const { logSuccess, logError, logInfo, logUser } = useLogsStore();
  const [nxCode, setNxCode] = useState('');
  const [variables, setVariables] = useState<Record<string, number | string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    logInfo('calculation', 'Generating NX expression code', undefined, 'OutputSection');
    const generator = new NXExpressionGenerator(configuration);
    const expression = generator.generateExpression();
    setNxCode(expression.code);
    setVariables(expression.variables);
    logSuccess(
      'calculation',
      'NX expression generated',
      `${expression.code.length} characters`,
      'OutputSection'
    );
  }, [configuration, logInfo, logSuccess]);

  const handleDownload = () => {
    try {
      logUser('export', 'Initiating NX expression download', undefined, 'OutputSection');
      const generator = new NXExpressionGenerator(configuration);
      const blob = generator.exportToFile();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `${configuration.projectName.replace(/\s+/g, '_')}_NX_Expression.exp`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log successful download
      logSuccess('export', 'NX Expression downloaded successfully', filename, 'OutputSection');
    } catch (error: unknown) {
      // Log error
      logError(
        'export',
        'Download failed',
        error instanceof Error ? error.message : 'Unknown error',
        'OutputSection'
      );
    }
  };

  const handleCopy = async () => {
    try {
      logUser('export', 'Copying NX expression to clipboard', undefined, 'OutputSection');
      await navigator.clipboard.writeText(nxCode);
      setCopied(true);
      logSuccess(
        'export',
        'NX Expression copied to clipboard',
        `${nxCode.length} characters`,
        'OutputSection'
      );
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
    const woodVolume = Object.entries(variables)
      .filter(([key]) => key.includes('volume'))
      .reduce(
        (sum: number, [, val]: [string, number | string]) =>
          sum + (typeof val === 'number' ? val : 0),
        0
      );

    const estimatedCost = (woodVolume / 1000000) * 450; // $450 per cubic meter estimate
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
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="expression"
              className="w-full"
              onValueChange={(value) => {
                logUser('navigation', `Switched to ${value} tab`, undefined, 'OutputSection');
              }}
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="expression">Expression</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="visual">Visual Guide</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="bom">BOM</TabsTrigger>
              </TabsList>

              <TabsContent value="expression">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs font-mono whitespace-pre">
                    <code>{nxCode}</code>
                  </pre>
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

              <TabsContent value="instructions">
                <NXInstructions />
              </TabsContent>

              <TabsContent value="visual">
                <NXVisualGuide />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
