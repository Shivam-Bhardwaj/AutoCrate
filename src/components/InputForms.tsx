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
            <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
            <TabsTrigger value="base">Base</TabsTrigger>
            <TabsTrigger value="panels">Panels</TabsTrigger>
            <TabsTrigger value="fasteners">Fasteners</TabsTrigger>
            <TabsTrigger value="vinyl">Vinyl</TabsTrigger>
          </TabsList>

          <TabsContent value="dimensions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Crate Dimensions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (inches)</Label>
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
                          `Length changed to ${newLength} inches`,
                          undefined,
                          'InputForms'
                        );
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (inches)</Label>
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
                          `Width changed to ${newWidth} inches`,
                          undefined,
                          'InputForms'
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (inches)</Label>
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
                        `Height changed to ${newHeight} inches`,
                        undefined,
                        'InputForms'
                      );
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productWeight">Product Weight (kg)</Label>
                    <Input
                      id="productWeight"
                      type="number"
                      value={configuration.weight.product}
                      onChange={(e) => updateWeight({ product: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxWeight">Max Gross Weight (kg)</Label>
                    <Input
                      id="maxWeight"
                      type="number"
                      value={configuration.weight.maxGross}
                      onChange={(e) => updateWeight({ maxGross: Number(e.target.value) })}
                    />
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
                    <SelectTrigger>
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
                  <Label htmlFor="floorThickness">Floorboard Thickness</Label>
                  <Input
                    id="floorThickness"
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
                    <SelectTrigger>
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
                  <Label>Fastener Type</Label>
                  <Select
                    value={configuration.fasteners.type}
                    onValueChange={(value: 'klimp' | 'nails' | 'screws' | 'bolts') =>
                      updateFasteners({ type: value })
                    }
                  >
                    <SelectTrigger>
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
                    <Label>Size</Label>
                    <Input
                      value={configuration.fasteners.size}
                      onChange={(e) => updateFasteners({ size: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Spacing (mm)</Label>
                    <Input
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
                    checked={configuration.vinyl.enabled}
                    onCheckedChange={(checked) => updateVinyl({ enabled: checked })}
                  />
                  <Label>Enable Vinyl Wrapping</Label>
                </div>
                {configuration.vinyl.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Vinyl Type</Label>
                      <Select
                        value={configuration.vinyl.type}
                        onValueChange={(value: 'waterproof' | 'vapor-barrier' | 'cushion') =>
                          updateVinyl({ type: value })
                        }
                      >
                        <SelectTrigger>
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
