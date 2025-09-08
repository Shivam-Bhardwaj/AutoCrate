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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function InputForms() {
  const {
    configuration,
    updateDimensions,
    updateBase,
    updatePanel,
    updateFasteners,
    updateWeight,
    updateProjectName,
  } = useCrateStore();

  const { logUser } = useLogsStore();

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-6">
        {/* Project Information */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Project Information</h3>
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

        <Separator />

        {/* Product Dimensions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Product Dimensions</h3>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Enter the dimensions of the product you want to ship. The crate will be automatically
              sized to accommodate your product with proper clearances.
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              <strong>Size Limits:</strong> Minimum 10 inches, Maximum 150 inches per dimension.
              Values outside these ranges will be automatically adjusted.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Product Width (inches)</Label>
              <Input
                id="width"
                type="number"
                step="0.125"
                min="10"
                max="150"
                value={configuration.dimensions.width}
                onChange={(e) => {
                  // Allow free typing, just ensure it's a valid number
                  const value = e.target.value;
                  if (value === '' || !isNaN(Number(value))) {
                    updateDimensions({ width: value === '' ? 10 : Number(value) });
                  }
                }}
                onBlur={(e) => {
                  // Enforce limits when user finishes editing
                  let newWidth = Number(e.target.value);
                  if (isNaN(newWidth) || newWidth < 10) newWidth = 10;
                  if (newWidth > 150) newWidth = 150;
                  updateDimensions({ width: newWidth });
                  logUser(
                    'dimension',
                    `Product width set to ${newWidth} inches`,
                    undefined,
                    'InputForms'
                  );
                }}
                placeholder="Width from front view (10-150 inches)"
                aria-label="Product width in inches"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Product Depth (inches)</Label>
              <Input
                id="length"
                type="number"
                step="0.125"
                min="10"
                max="150"
                value={configuration.dimensions.length}
                onChange={(e) => {
                  // Allow free typing, just ensure it's a valid number
                  const value = e.target.value;
                  if (value === '' || !isNaN(Number(value))) {
                    updateDimensions({ length: value === '' ? 10 : Number(value) });
                  }
                }}
                onBlur={(e) => {
                  // Enforce limits when user finishes editing
                  let newLength = Number(e.target.value);
                  if (isNaN(newLength) || newLength < 10) newLength = 10;
                  if (newLength > 150) newLength = 150;
                  updateDimensions({ length: newLength });
                  logUser(
                    'dimension',
                    `Product depth set to ${newLength} inches`,
                    undefined,
                    'InputForms'
                  );
                }}
                placeholder="Depth from side view (10-150 inches)"
                aria-label="Product depth in inches"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Product Height (inches)</Label>
              <Input
                id="height"
                type="number"
                step="0.125"
                min="10"
                max="150"
                value={configuration.dimensions.height}
                onChange={(e) => {
                  // Allow free typing, just ensure it's a valid number
                  const value = e.target.value;
                  if (value === '' || !isNaN(Number(value))) {
                    updateDimensions({ height: value === '' ? 10 : Number(value) });
                  }
                }}
                onBlur={(e) => {
                  // Enforce limits when user finishes editing
                  let newHeight = Number(e.target.value);
                  if (isNaN(newHeight) || newHeight < 10) newHeight = 10;
                  if (newHeight > 150) newHeight = 150;
                  updateDimensions({ height: newHeight });
                  logUser(
                    'dimension',
                    `Product height set to ${newHeight} inches`,
                    undefined,
                    'InputForms'
                  );
                }}
                placeholder="Vertical height (10-150 inches)"
                aria-label="Product height in inches"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productWeight">Product Weight (pounds)</Label>
              <Input
                id="productWeight"
                type="number"
                min="1"
                max="50000"
                step="0.1"
                value={configuration.weight.product}
                onChange={(e) => {
                  // Allow free typing, just ensure it's a valid number
                  const value = e.target.value;
                  if (value === '' || !isNaN(Number(value))) {
                    updateWeight({ product: value === '' ? 1 : Number(value) });
                  }
                }}
                onBlur={(e) => {
                  // Enforce limits when user finishes editing
                  let val = Number(e.target.value);
                  if (isNaN(val) || val < 1) val = 1;
                  if (val > 50000) val = 50000;
                  updateWeight({ product: val });
                }}
                placeholder="Weight of product to ship (1-50,000 lbs)"
                aria-label="Product weight in pounds"
              />
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
            <h4 className="text-sm font-semibold mb-2">Calculated Crate Dimensions</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Crate size includes 2&quot; clearance + panel thickness on each side
            </p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                Width:{' '}
                {configuration.dimensions.length + 2 * (configuration.cap.leftPanel.thickness + 2)}
                &quot;
              </div>
              <div>
                Depth:{' '}
                {configuration.dimensions.width + 2 * (configuration.cap.frontPanel.thickness + 2)}
                &quot;
              </div>
              <div>
                Height:{' '}
                {configuration.dimensions.height +
                  configuration.base.floorboardThickness +
                  configuration.cap.topPanel.thickness +
                  4}
                &quot;
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Base Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Shipping Base Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
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
                min="0.5"
                max="3"
                step="0.125"
                value={configuration.base.floorboardThickness}
                onChange={(e) => {
                  // Allow free typing, just ensure it's a valid number
                  const value = e.target.value;
                  if (value === '' || !isNaN(Number(value))) {
                    updateBase({ floorboardThickness: value === '' ? 0.5 : Number(value) });
                  }
                }}
                onBlur={(e) => {
                  // Enforce limits when user finishes editing
                  let thickness = Number(e.target.value);
                  if (isNaN(thickness) || thickness < 0.5) thickness = 0.5;
                  if (thickness > 3) thickness = 3;
                  updateBase({ floorboardThickness: thickness });
                }}
                placeholder="Floorboard thickness (0.5-3 inches)"
              />
            </div>
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
                <div className="p-2 bg-muted rounded text-sm">{configuration.base.skidCount}</div>
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
                  Rub strips are required for crate bases longer than 96 inches. These must extend
                  the width of the crate and be beveled at 45-60 degrees for half their height.
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
        </div>

        <Separator />

        {/* Panel Configuration - Simplified */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Panel Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Default settings applied to all panels. Customize individual panels as needed.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Thickness</Label>
              <Input
                id="panelDefaultThickness"
                type="number"
                min="0.5"
                max="4"
                step="0.125"
                value={configuration.cap.topPanel.thickness}
                onChange={(e) => {
                  // Allow free typing, just ensure it's a valid number
                  const value = e.target.value;
                  if (value === '' || !isNaN(Number(value))) {
                    const thickness = value === '' ? 0.5 : Number(value);
                    ['topPanel', 'frontPanel', 'backPanel', 'leftPanel', 'rightPanel'].forEach(
                      (panel) => updatePanel(panel as keyof typeof configuration.cap, { thickness })
                    );
                  }
                }}
                onBlur={(e) => {
                  // Enforce limits when user finishes editing
                  let thickness = Number(e.target.value);
                  if (isNaN(thickness) || thickness < 0.5) thickness = 0.5;
                  if (thickness > 4) thickness = 4;
                  ['topPanel', 'frontPanel', 'backPanel', 'leftPanel', 'rightPanel'].forEach(
                    (panel) => updatePanel(panel as keyof typeof configuration.cap, { thickness })
                  );
                }}
                placeholder="Panel thickness (0.5-4 inches)"
                aria-label="Default panel thickness in inches"
              />
            </div>
            <div className="space-y-2">
              <Label>Default Material</Label>
              <Select
                aria-label="Default panel material"
                value={configuration.cap.topPanel.material}
                onValueChange={(value: 'plywood' | 'osb' | 'solid-wood') => {
                  ['topPanel', 'frontPanel', 'backPanel', 'leftPanel', 'rightPanel'].forEach(
                    (panel) =>
                      updatePanel(panel as keyof typeof configuration.cap, { material: value })
                  );
                }}
              >
                <SelectTrigger
                  id="panelDefaultMaterial"
                  aria-label="Default panel material selection"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plywood">Plywood</SelectItem>
                  <SelectItem value="osb">OSB</SelectItem>
                  <SelectItem value="solid-wood">Solid Wood</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="reinforcementSwitch"
                checked={configuration.cap.topPanel.reinforcement}
                onCheckedChange={(checked) => {
                  ['topPanel', 'frontPanel', 'backPanel', 'leftPanel', 'rightPanel'].forEach(
                    (panel) =>
                      updatePanel(panel as keyof typeof configuration.cap, {
                        reinforcement: checked,
                      })
                  );
                }}
                aria-label="Toggle panel reinforcement"
              />
              <Label>Apply Reinforcement</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ventilationSwitch"
                checked={configuration.cap.topPanel.ventilation.enabled}
                onCheckedChange={(checked) => {
                  ['topPanel', 'frontPanel', 'backPanel', 'leftPanel', 'rightPanel'].forEach(
                    (panel) =>
                      updatePanel(panel as keyof typeof configuration.cap, {
                        ventilation: {
                          ...configuration.cap.topPanel.ventilation,
                          enabled: checked,
                        },
                      })
                  );
                }}
                aria-label="Toggle panel ventilation"
              />
              <Label>Add Ventilation</Label>
            </div>
          </div>

          {/* TODO: Add simplified AMAT Style B specific options here */}
          <div className="space-y-4 mt-4 p-4 bg-blue-50 rounded">
            <h4 className="text-sm font-semibold">Style B Specific Configuration</h4>
            <p className="text-xs">Style B crate with drop-end cleated plywood cap</p>
          </div>

          {/* TODO: Add simplified AMAT Style B specific options here */}
          <div className="space-y-4 mt-4 p-4 bg-blue-50 rounded">
            <h4 className="text-sm font-semibold">Style B Specific Configuration</h4>
            <p className="text-xs">Style B crate with drop-end cleated plywood cap</p>
          </div>
        </div>

        <Separator />

        {/* Fastener Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Fastener Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label>Material</Label>
              <Select
                value={configuration.fasteners.material}
                onValueChange={(value: 'steel' | 'stainless' | 'galvanized') =>
                  updateFasteners({ material: value })
                }
              >
                <SelectTrigger aria-label="Fastener material">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="steel">Steel</SelectItem>
                  <SelectItem value="stainless">Stainless Steel</SelectItem>
                  <SelectItem value="galvanized">Galvanized</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                min="50"
                max="500"
                step="5"
                value={configuration.fasteners.spacing}
                onChange={(e) => {
                  // Allow free typing, just ensure it's a valid number
                  const value = e.target.value;
                  if (value === '' || !isNaN(Number(value))) {
                    updateFasteners({ spacing: value === '' ? 50 : Number(value) });
                  }
                }}
                onBlur={(e) => {
                  // Enforce limits when user finishes editing
                  let spacing = Number(e.target.value);
                  if (isNaN(spacing) || spacing < 50) spacing = 50;
                  if (spacing > 500) spacing = 500;
                  updateFasteners({ spacing });
                }}
                placeholder="Fastener spacing (50-500 mm)"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* TODO: Re-enable for future crate styles - Vinyl Configuration */}
        {/*
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vinyl Configuration</h3>
          ...
        </div>
        */}

        {/*
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vinyl Configuration</h3>
          ...
        </div>
        */}

        {/* <Separator /> */}

        {/* TODO: Re-enable for future crate styles - AMAT Compliance Section */}
        {/* <AMATComplianceSection /> */}

        {/* TODO: Re-enable for future crate styles - MBB Configuration Section */}
        {/* <MBBConfigurationSection /> */}

        {/* <Separator /> */}

        {/* TODO: Re-enable for future crate styles - Air Shipment Optimization */}
        {/* <AirShipmentOptimization /> */}
      </div>
    </div>
  );
}
