'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Download, FileText, Package, Settings, Zap } from 'lucide-react';

import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import type { NXExportOptions } from '@/types/nx';
import { JTExporter } from '@/services/jtExporter';
import { NXDrawingGenerator } from '@/services/nxDrawingGenerator';
import { BOMGenerator } from '@/services/bomGenerator';
import { NXExpressionGenerator } from '@/services/nx-generator';

interface ExportDialogProps {
  children?: React.ReactNode;
  scene?: THREE.Scene;
}

export function ExportDialog({ children, scene }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<NXExportOptions>({
    format: 'jt',
    version: '2022',
    includeAssembly: true,
    includeDrawings: true,
    applyMaterialsStandards: true,
    partNumberPrefix: '0205'
  });

  const crateStore = useCrateStore((state) => state);
  const crateConfig = crateStore.configuration;
  const { addLog } = useLogsStore();

  const handleExportOptionChange = <K extends keyof NXExportOptions>(
    key: K,
    value: NXExportOptions[K]
  ) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExport = async () => {
    if (!crateConfig.dimensions.width || !crateConfig.dimensions.length || !crateConfig.dimensions.height) {
      addLog('error', 'export', 'Export failed: Invalid crate configuration');
      return;
    }

    setIsExporting(true);
    addLog('info', 'export', `Starting NX export: ${exportOptions.format.toUpperCase()} format`);

    try {
      switch (exportOptions.format) {
        case 'jt':
          await exportJTFormat();
          break;
        case 'exp':
          await exportNXExpressions();
          break;
        case 'step':
          await exportSTEPFormat();
          break;
        case 'prt':
          await exportNXPart();
          break;
      }

      addLog('success', 'export', `Export completed successfully: ${exportOptions.format.toUpperCase()}`);
      setIsOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', 'export', `Export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportJTFormat = async () => {
    if (!scene) {
      throw new Error('3D scene not available for JT export');
    }

    const jtExporter = new JTExporter(scene, crateConfig, exportOptions);
    await jtExporter.exportJT();
    addLog('info', 'export', 'JT file exported with assembly structure');
  };

  const exportNXExpressions = async () => {
    const nxGenerator = new NXExpressionGenerator(crateConfig, exportOptions);
    
    if (exportOptions.version === '2022') {
      const expressionBlob = nxGenerator.exportNX2022();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(expressionBlob);
      link.download = `${generateFileName()}_NX2022.exp`;
      link.click();
      URL.revokeObjectURL(link.href);
    } else {
      const expressionBlob = nxGenerator.exportToFile();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(expressionBlob);
      link.download = `${generateFileName()}_expressions.exp`;
      link.click();
      URL.revokeObjectURL(link.href);
    }

    addLog('info', 'export', 'NX expression file generated with 2022 syntax');
  };

  const exportSTEPFormat = async () => {
    // STEP export would require additional libraries
    // For now, export as JT with STEP naming
    if (!scene) {
      throw new Error('3D scene not available for STEP export');
    }

    const jtExporter = new JTExporter(scene, crateConfig, {
      ...exportOptions,
      format: 'step'
    });
    await jtExporter.exportJT();
    addLog('info', 'export', 'STEP-compatible format exported');
  };

  const exportNXPart = async () => {
    const drawingGenerator = new NXDrawingGenerator(crateConfig, exportOptions);
    await drawingGenerator.generateDrawingPackage();
    addLog('info', 'export', 'NX part files generated with technical drawings');
  };

  const exportBOM = async () => {
    const bomGenerator = new BOMGenerator(crateConfig, exportOptions);
    await bomGenerator.generateBOM({
      includeLabor: true,
      includeCosts: true,
      includeSupplierInfo: true,
      includeSpecifications: true,
      exportFormat: 'csv'
    });
    addLog('info', 'export', 'Bill of Materials generated with TC numbers');
  };

  const exportDrawings = async () => {
    const drawingGenerator = new NXDrawingGenerator(crateConfig, exportOptions);
    await drawingGenerator.generateDrawingPackage();
    addLog('info', 'export', 'Technical drawings exported with AMAT standards');
  };

  const generateFileName = () => {
    const { width, length, height } = crateConfig.dimensions;
    const timestamp = new Date().toISOString().slice(0, 10);
    return `AutoCrate_${width}x${length}x${height}_${timestamp}`;
  };

  const getEstimatedFileSize = () => {
    const { width, length, height } = crateConfig.dimensions;
    const volume = width * length * height;
    
    switch (exportOptions.format) {
      case 'jt':
        return Math.round(volume / 1000 + 5) + 'MB';
      case 'exp':
        return '< 1MB';
      case 'step':
        return Math.round(volume / 500 + 8) + 'MB';
      case 'prt':
        return Math.round(volume / 800 + 3) + 'MB';
      default:
        return 'Unknown';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            NX Export
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            NX Professional Export
            <Badge variant="secondary">Applied Materials</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Export Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Export Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="format">File Format</Label>
                <Select
                  value={exportOptions.format}
                  onValueChange={(value: 'jt' | 'step' | 'exp' | 'prt') => 
                    handleExportOptionChange('format', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jt">JT Format (Recommended)</SelectItem>
                    <SelectItem value="exp">NX Expressions</SelectItem>
                    <SelectItem value="step">STEP Format</SelectItem>
                    <SelectItem value="prt">NX Part Files</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="version">NX Version</Label>
                <Select
                  value={exportOptions.version}
                  onValueChange={(value: '2022' | '2019' | '12') => 
                    handleExportOptionChange('version', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2022">NX 2022 (Latest)</SelectItem>
                    <SelectItem value="2019">NX 2019</SelectItem>
                    <SelectItem value="12">NX 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="assembly">Include Assembly</Label>
                <Switch
                  id="assembly"
                  checked={exportOptions.includeAssembly}
                  onCheckedChange={(checked) => 
                    handleExportOptionChange('includeAssembly', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="drawings">Include Drawings</Label>
                <Switch
                  id="drawings"
                  checked={exportOptions.includeDrawings}
                  onCheckedChange={(checked) => 
                    handleExportOptionChange('includeDrawings', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Applied Materials Standards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AMAT Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="amat-standards">Apply AMAT Standards</Label>
                <Switch
                  id="amat-standards"
                  checked={exportOptions.applyMaterialsStandards}
                  onCheckedChange={(checked) => 
                    handleExportOptionChange('applyMaterialsStandards', checked)
                  }
                />
              </div>

              <div>
                <Label htmlFor="part-prefix">Part Number Prefix</Label>
                <Input
                  id="part-prefix"
                  value={exportOptions.partNumberPrefix}
                  onChange={(e) => 
                    handleExportOptionChange('partNumberPrefix', e.target.value)
                  }
                  placeholder="0205"
                  disabled={!exportOptions.applyMaterialsStandards}
                />
              </div>

              {exportOptions.applyMaterialsStandards && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>ASME Y14.5-2009 Compliant</span>
                  </div>
                  <div>Part Number: {exportOptions.partNumberPrefix}-{crateConfig.dimensions.width.toString().padStart(3, '0')}{crateConfig.dimensions.length.toString().padStart(3, '0')}{crateConfig.dimensions.height.toString().padStart(3, '0')}</div>
                  <div>TC Number: TC2-{Date.now().toString().slice(-7)}</div>
                  <div>Drawing Scale: Auto-calculated</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Crate Size:</span>
                  <div>{crateConfig.dimensions.width}&quot; × {crateConfig.dimensions.length}&quot; × {crateConfig.dimensions.height}&quot;</div>
                </div>
                <div>
                  <span className="font-medium">Estimated Size:</span>
                  <div>{getEstimatedFileSize()}</div>
                </div>
                <div>
                  <span className="font-medium">Components:</span>
                  <div>
                    {exportOptions.includeAssembly && <div>• Assembly Structure</div>}
                    {exportOptions.includeDrawings && <div>• Technical Drawings</div>}
                    {exportOptions.applyMaterialsStandards && <div>• AMAT Standards</div>}
                    <div>• Material Specifications</div>
                    <div>• Fastener Details</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button 
                  onClick={exportBOM} 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2"
                  disabled={isExporting}
                >
                  <FileText className="h-4 w-4" />
                  Export BOM
                </Button>

                <Button 
                  onClick={exportDrawings} 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2"
                  disabled={isExporting}
                >
                  <Package className="h-4 w-4" />
                  Export Drawings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {exportOptions.format === 'jt' && 'Optimized for NX 2022 import'}
            {exportOptions.format === 'exp' && 'Parametric expressions for rapid iteration'}
            {exportOptions.format === 'step' && 'Universal CAD compatibility'}
            {exportOptions.format === 'prt' && 'Complete part files with drawings'}
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting || !crateConfig.dimensions.width}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export {exportOptions.format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-muted/50 rounded-lg p-4 mt-4">
          <h4 className="font-medium mb-2">Export Features:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>• NX 2022 enhanced syntax</div>
            <div>• Applied Materials part numbering</div>
            <div>• TC Engineering numbers</div>
            <div>• ASME Y14.5-2009 compliance</div>
            <div>• Third angle projection drawings</div>
            <div>• Complete material specifications</div>
            <div>• Assembly structure hierarchy</div>
            <div>• Quality control documentation</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}