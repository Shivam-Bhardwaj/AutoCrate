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
    <div className="h-full overflow-y-auto panel" role="form" aria-label="Crate configuration form">
      <div className="panel-header">
        <h2 className="text-small font-semibold text-text-primary">Part Properties</h2>
      </div>
      <div className="panel-content space-y-6">
        {/* Project Information */}
        <div className="form-group">
          <h3 className="text-body font-semibold text-text-primary border-b border-borders pb-1">Project Information</h3>
          <div className="form-group">
            <Label htmlFor="projectName" className="form-label">Project Name</Label>
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
        </div>        <Separator />

        {/* Product Dimensions */}
        <div className="space-y-4">
          <h3 className="text-h3 font-semibold text-text-primary">Product Dimensions</h3>
          <div className="p-4 bg-surface border border-borders rounded-md">
            <p className="text-body text-text-primary">
              Enter the dimensions of the product you want to ship. The crate will be automatically
              sized to accommodate your product with proper clearances.
            </p>
            <p className="text-small text-text-secondary mt-2">
              <strong>Size Limits:</strong> Minimum 10 inches, Maximum 150 inches per dimension.
              Values outside these ranges will be automatically adjusted.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <Label htmlFor="width" className="form-label">Product Width (inches)</Label>
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
            <div className="form-group">
              <Label htmlFor="length" className="form-label">Product Depth (inches)</Label>
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
            <div className="form-group">
              <Label htmlFor="height" className="form-label">Product Height (inches)</Label>
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
            <div className="form-group">
              <Label htmlFor="productWeight" className="form-label">Product Weight (pounds)</Label>
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

          <div className="p-4 bg-surface border border-borders rounded-md">
            <h4 className="text-small font-semibold mb-2 text-text-primary">Calculated Crate Dimensions</h4>
            <p className="text-caption text-text-secondary mb-2">
              Crate size includes 2&quot; clearance + panel thickness on each side
            </p>
            <div className="grid grid-cols-3 gap-2 text-small text-text-primary">
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
          <h3 className="text-h3 font-semibold text-text-primary">Shipping Base Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <Label htmlFor="baseType" className="form-label">Base Type</Label>
              <Select
                value={configuration.base.type}
                onValueChange={(value: 'standard' | 'heavy-duty' | 'export') =>
                  updateBase({ type: value })
                }
              >
                <SelectTrigger className="input" id="baseType" aria-label="Base Type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="heavy-duty">Heavy Duty</SelectItem>
                  <SelectItem value="export">Export Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="form-group">
              <Label htmlFor="floorboardThickness" className="form-label">Floorboard Thickness</Label>
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
                className="input"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-t border-borders pt-4">
              <h4 className="text-body font-semibold mb-2 text-text-primary">
                Automatically Calculated Skid Configuration
              </h4>
              <p className="text-caption text-text-secondary mb-3">
                Skid dimensions and spacing are automatically determined based on crate weight
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <Label className="form-label">Skid Size (H x W)</Label>
                <div className="p-3 bg-surface border border-borders rounded-md text-body text-text-primary">
                  {configuration.base.skidHeight} x {configuration.base.skidWidth} inches
                </div>
              </div>
              <div className="form-group">
                <Label className="form-label">Number of Skids</Label>
                <div className="p-3 bg-surface border border-borders rounded-md text-body text-text-primary">{configuration.base.skidCount}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <Label className="form-label">Skid Spacing</Label>
                <div className="p-3 bg-surface border border-borders rounded-md text-body text-text-primary">
                  {configuration.base.skidSpacing} inches (center-to-center)
                </div>
              </div>
              <div className="form-group">
                <Label className="form-label">Rub Strips Required</Label>
                <div className="p-3 bg-surface border border-borders rounded-md text-body text-text-primary">
                  {configuration.base.requiresRubStrips ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            {configuration.base.requiresRubStrips && (
              <div className="p-4 bg-warning-bg border border-warning-border rounded-md">
                <p className="text-caption text-text-primary">
                  Rub strips are required for crate bases longer than 96 inches. These must extend
                  the width of the crate and be beveled at 45-60 degrees for half their height.
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <Label htmlFor="baseMaterial" className="form-label">Material</Label>
            <Select
              value={configuration.base.material}
              onValueChange={(value: 'pine' | 'oak' | 'plywood' | 'osb') =>
                updateBase({ material: value })
              }
            >
              <SelectTrigger className="input" id="baseMaterial" aria-label="Material">
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
          <h3 className="text-h3 font-semibold text-text-primary">Panel Configuration</h3>
          <p className="text-body text-text-secondary">
            Default settings applied to all panels. Customize individual panels as needed.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <Label className="form-label">Default Thickness</Label>
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
                className="input"
              />
            </div>
            <div className="form-group">
              <Label className="form-label">Default Material</Label>
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
                  className="input"
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
            <div className="flex items-center space-x-3">
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
              <Label className="form-label">Apply Reinforcement</Label>
            </div>
            <div className="flex items-center space-x-3">
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
              <Label className="form-label">Add Ventilation</Label>
            </div>
          </div>

          {/* TODO: Add simplified AMAT Style B specific options here */}
          <div className="space-y-4 mt-4 p-4 bg-surface border border-borders rounded-md">
            <h4 className="text-body font-semibold text-text-primary">Style B Specific Configuration</h4>
            <p className="text-caption text-text-secondary">Style B crate with drop-end cleated plywood cap</p>
          </div>

          {/* TODO: Add simplified AMAT Style B specific options here */}
          <div className="space-y-4 mt-4 p-4 bg-surface border border-borders rounded-md">
            <h4 className="text-body font-semibold text-text-primary">Style B Specific Configuration</h4>
            <p className="text-caption text-text-secondary">Style B crate with drop-end cleated plywood cap</p>
          </div>
        </div>

        <Separator />

        {/* Fastener Configuration */}
        <div className="space-y-4">
          <h3 className="text-h3 font-semibold text-text-primary">Fastener Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <Label htmlFor="fastenerType" className="form-label">Fastener Type</Label>
              <Select
                value={configuration.fasteners.type}
                onValueChange={(value: 'klimp' | 'nails' | 'screws' | 'bolts') =>
                  updateFasteners({ type: value })
                }
              >
                <SelectTrigger className="input" id="fastenerType" aria-label="Fastener Type">
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
            <div className="form-group">
              <Label className="form-label">Material</Label>
              <Select
                value={configuration.fasteners.material}
                onValueChange={(value: 'steel' | 'stainless' | 'galvanized') =>
                  updateFasteners({ material: value })
                }
              >
                <SelectTrigger className="input" aria-label="Fastener material">
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
            <div className="form-group">
              <Label htmlFor="fastenerSize" className="form-label">Size</Label>
              <Input
                id="fastenerSize"
                value={configuration.fasteners.size}
                onChange={(e) => updateFasteners({ size: e.target.value })}
                className="input"
              />
            </div>
            <div className="form-group">
              <Label htmlFor="fastenerSpacing" className="form-label">Spacing (mm)</Label>
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
                className="input"
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
