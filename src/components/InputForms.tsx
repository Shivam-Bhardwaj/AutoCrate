'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InputForms() {
  const {
    configuration,
    updateDimensions,
    updateBase,
    updatePanel,
    updateFasteners,
    updateVinyl,
    updateWeight,
    updateProjectName,
  } = useCrateStore();

  const { logUser } = useLogsStore();

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={configuration.projectName}
                onChange={(e) => {
                  updateProjectName(e.target.value);
                  logUser('ui', `Project renamed to: ${e.target.value}`, undefined, 'InputForms');
                }}
                placeholder="Enter project name"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="dimensions" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dimensions">Product</TabsTrigger>
            <TabsTrigger value="base">Base</TabsTrigger>
            <TabsTrigger value="panels">Panels</TabsTrigger>
            <TabsTrigger value="fasteners">Fasteners</TabsTrigger>
            <TabsTrigger value="vinyl">Vinyl</TabsTrigger>
          </TabsList>

          <TabsContent value="dimensions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Dimensions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Enter the dimensions of the product you want to ship. The crate will be
                    automatically sized to accommodate your product with proper clearances.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Product Width (inches)</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.125"
                      value={configuration.dimensions.length}
                      onChange={(e) => {
                        const newLength = Number(e.target.value);
                        updateDimensions({ length: newLength });
                        logUser(
                          'dimension',
                          `Product width changed to ${newLength} inches`,
                          undefined,
                          'InputForms'
                        );
                      }}
                      placeholder="Width from front view"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Product Depth (inches)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.125"
                      value={configuration.dimensions.width}
                      onChange={(e) => {
                        const newWidth = Number(e.target.value);
                        updateDimensions({ width: newWidth });
                        logUser(
                          'dimension',
                          `Product depth changed to ${newWidth} inches`,
                          undefined,
                          'InputForms'
                        );
                      }}
                      placeholder="Depth from side view"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Product Height (inches)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.125"
                    value={configuration.dimensions.height}
                    onChange={(e) => {
                      const newHeight = Number(e.target.value);
                      updateDimensions({ height: newHeight });
                      logUser(
                        'dimension',
                        `Product height changed to ${newHeight} inches`,
                        undefined,
                        'InputForms'
                      );
                    }}
                    placeholder="Vertical height"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productWeight">Product Weight (pounds)</Label>
                  <Input
                    id="productWeight"
                    type="number"
                    value={configuration.weight.product}
                    onChange={(e) => updateWeight({ product: Number(e.target.value) })}
                    placeholder="Weight of product to ship"
                  />
                </div>
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                  <h4 className="text-sm font-semibold mb-2">Calculated Crate Dimensions</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Crate size includes 2-4&quot; clearance on each side plus panel thickness
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>Width: {configuration.dimensions.length + 8}&quot; </div>
                    <div>Depth: {configuration.dimensions.width + 8}&quot;</div>
                    <div>Height: {configuration.dimensions.height + 8}&quot;</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="base" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Base Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="baseType">Base Type</Label>
                  <Select
                    value={configuration.base.type}
                    onValueChange={(value: 'standard' | 'heavy-duty' | 'export') =>
                      updateBase({ type: value })
                    }
                  >
                    <SelectTrigger id="baseType" aria-label="Base Type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="heavy-duty">Heavy Duty</SelectItem>
                      <SelectItem value="export">Export Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floorboardThickness">Floorboard Thickness</Label>
                  <Input
                    id="floorboardThickness"
                    type="number"
                    value={configuration.base.floorboardThickness}
                    onChange={(e) => updateBase({ floorboardThickness: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2">
                      Automatically Calculated Skid Configuration
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Skid dimensions and spacing are automatically determined based on crate weight
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Skid Size (H x W)</Label>
                      <div className="p-2 bg-muted rounded text-sm">
                        {configuration.base.skidHeight} x {configuration.base.skidWidth} inches
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Skids</Label>
                      <div className="p-2 bg-muted rounded text-sm">
                        {configuration.base.skidCount}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Skid Spacing</Label>
                      <div className="p-2 bg-muted rounded text-sm">
                        {configuration.base.skidSpacing} inches (center-to-center)
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Rub Strips Required</Label>
                      <div className="p-2 bg-muted rounded text-sm">
                        {configuration.base.requiresRubStrips ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>

                  {configuration.base.requiresRubStrips && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        Rub strips are required for crate bases longer than 96 inches. These must
                        extend the width of the crate and be beveled at 45-60 degrees for half their
                        height.
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseMaterial">Material</Label>
                  <Select
                    value={configuration.base.material}
                    onValueChange={(value: 'pine' | 'oak' | 'plywood' | 'osb') =>
                      updateBase({ material: value })
                    }
                  >
                    <SelectTrigger id="baseMaterial" aria-label="Material">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pine">Pine</SelectItem>
                      <SelectItem value="oak">Oak</SelectItem>
                      <SelectItem value="plywood">Plywood</SelectItem>
                      <SelectItem value="osb">OSB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="panels" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Panel Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="top" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="top">Top</TabsTrigger>
                    <TabsTrigger value="front">Front</TabsTrigger>
                    <TabsTrigger value="back">Back</TabsTrigger>
                    <TabsTrigger value="left">Left</TabsTrigger>
                    <TabsTrigger value="right">Right</TabsTrigger>
                  </TabsList>
                  {['topPanel', 'frontPanel', 'backPanel', 'leftPanel', 'rightPanel'].map(
                    (panelKey) => (
                      <TabsContent
                        key={panelKey}
                        value={panelKey.replace('Panel', '')}
                        className="space-y-4"
                      >
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Thickness</Label>
                            <Input
                              type="number"
                              value={
                                configuration.cap[panelKey as keyof typeof configuration.cap]
                                  .thickness
                              }
                              onChange={(e) =>
                                updatePanel(panelKey as keyof typeof configuration.cap, {
                                  thickness: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Material</Label>
                            <Select
                              value={
                                configuration.cap[panelKey as keyof typeof configuration.cap]
                                  .material
                              }
                              onValueChange={(value: 'plywood' | 'osb' | 'solid-wood') =>
                                updatePanel(panelKey as keyof typeof configuration.cap, {
                                  material: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="plywood">Plywood</SelectItem>
                                <SelectItem value="osb">OSB</SelectItem>
                                <SelectItem value="solid-wood">Solid Wood</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={
                                configuration.cap[panelKey as keyof typeof configuration.cap]
                                  .reinforcement
                              }
                              onCheckedChange={(checked) =>
                                updatePanel(panelKey as keyof typeof configuration.cap, {
                                  reinforcement: checked,
                                })
                              }
                            />
                            <Label>Reinforcement</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={
                                configuration.cap[panelKey as keyof typeof configuration.cap]
                                  .ventilation.enabled
                              }
                              onCheckedChange={(checked) =>
                                updatePanel(panelKey as keyof typeof configuration.cap, {
                                  ventilation: {
                                    ...configuration.cap[panelKey as keyof typeof configuration.cap]
                                      .ventilation,
                                    enabled: checked,
                                  },
                                })
                              }
                            />
                            <Label>Ventilation</Label>
                          </div>
                        </div>
                      </TabsContent>
                    )
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fasteners" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fastener Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fastenerType">Fastener Type</Label>
                  <Select
                    value={configuration.fasteners.type}
                    onValueChange={(value: 'klimp' | 'nails' | 'screws' | 'bolts') =>
                      updateFasteners({ type: value })
                    }
                  >
                    <SelectTrigger id="fastenerType" aria-label="Fastener Type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="klimp">Klimp Connector</SelectItem>
                      <SelectItem value="nails">Nails</SelectItem>
                      <SelectItem value="screws">Screws</SelectItem>
                      <SelectItem value="bolts">Bolts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fastenerSize">Size</Label>
                    <Input
                      id="fastenerSize"
                      value={configuration.fasteners.size}
                      onChange={(e) => updateFasteners({ size: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fastenerSpacing">Spacing (mm)</Label>
                    <Input
                      id="fastenerSpacing"
                      type="number"
                      value={configuration.fasteners.spacing}
                      onChange={(e) => updateFasteners({ spacing: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Material</Label>
                  <Select
                    value={configuration.fasteners.material}
                    onValueChange={(value: 'steel' | 'stainless' | 'galvanized') =>
                      updateFasteners({ material: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="steel">Steel</SelectItem>
                      <SelectItem value="stainless">Stainless Steel</SelectItem>
                      <SelectItem value="galvanized">Galvanized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vinyl" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vinyl Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vinylEnabled"
                    checked={configuration.vinyl.enabled}
                    onCheckedChange={(checked) => updateVinyl({ enabled: checked })}
                  />
                  <Label htmlFor="vinylEnabled">Enable Vinyl Wrapping</Label>
                </div>
                {configuration.vinyl.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="vinylType">Vinyl Type</Label>
                      <Select
                        value={configuration.vinyl.type}
                        onValueChange={(value: 'waterproof' | 'vapor-barrier' | 'cushion') =>
                          updateVinyl({ type: value })
                        }
                      >
                        <SelectTrigger id="vinylType" aria-label="Vinyl Type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="waterproof">Waterproof</SelectItem>
                          <SelectItem value="vapor-barrier">Vapor Barrier</SelectItem>
                          <SelectItem value="cushion">Cushion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Thickness (mm)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={configuration.vinyl.thickness}
                          onChange={(e) => updateVinyl({ thickness: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Coverage</Label>
                        <Select
                          value={configuration.vinyl.coverage}
                          onValueChange={(value: 'full' | 'partial') =>
                            updateVinyl({ coverage: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Coverage</SelectItem>
                            <SelectItem value="partial">Partial Coverage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
