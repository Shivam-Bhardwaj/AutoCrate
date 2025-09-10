import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import type { BOMItem, AssemblyStructure, NXExportOptions } from '@/types/nx';
import type { CrateConfiguration } from '@/types/crate';
import { AppliedMaterialsStandardsService } from './appliedMaterialsStandards';

interface BOMConfiguration {
  includeLabor: boolean;
  includeCosts: boolean;
  includeSupplierInfo: boolean;
  includeSpecifications: boolean;
  exportFormat: 'csv' | 'excel' | 'pdf' | 'json';
}

export class BOMGenerator {
  private config: CrateConfiguration;
  private options: NXExportOptions;
  private amatsService: AppliedMaterialsStandardsService;

  constructor(config: CrateConfiguration, options: NXExportOptions) {
    this.config = config;
    this.options = options;
    this.amatsService = new AppliedMaterialsStandardsService(config);
  }

  async generateBOM(bomConfig: BOMConfiguration = this.getDefaultBOMConfig()): Promise<void> {
    try {
      const bomStructure = this.generateBOMStructure();
      const bomItems = this.generateBOMItems();
      
      const zip = new JSZip();
      
      // Generate main BOM file
      const bomFile = await this.createBOMFile(bomItems, bomConfig);
      zip.file(`BOM_${this.generateProjectNumber()}.${bomConfig.exportFormat}`, bomFile);
      
      // Generate detailed specifications if requested
      if (bomConfig.includeSpecifications) {
        const specsFile = await this.generateSpecifications(bomItems);
        zip.file('Material_Specifications.txt', specsFile);
      }
      
      // Generate supplier information if requested
      if (bomConfig.includeSupplierInfo) {
        const supplierFile = await this.generateSupplierInfo(bomItems);
        zip.file('Supplier_Information.txt', supplierFile);
      }
      
      // Generate cost analysis if requested
      if (bomConfig.includeCosts) {
        const costFile = await this.generateCostAnalysis(bomItems);
        zip.file('Cost_Analysis.txt', costFile);
      }
      
      // Generate assembly structure
      const structureFile = await this.generateAssemblyStructure(bomStructure);
      zip.file('Assembly_Structure.json', structureFile);
      
      // Generate quality control checklist
      const qcFile = await this.generateQualityChecklist(bomItems);
      zip.file('Quality_Control_Checklist.txt', qcFile);
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${this.generateProjectNumber()}_BOM_Package.zip`);
      
    } catch (error) {
      console.error('BOM generation failed:', error);
      throw new Error(`BOM generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateBOMStructure(): AssemblyStructure {
    const rootAssembly = {
      id: 'root',
      name: 'Shipping Crate Assembly',
      partNumber: this.amatsService.generatePartNumber('assembly'),
      tcNumber: this.amatsService.generateTCNumber().fullNumber,
      filePath: '',
      transform: [],
      children: ['subasm_floor', 'subasm_walls', ...(this.config.cap.topPanel ? ['subasm_top'] : [])],
    };

    const components = [
      {
        id: 'subasm_floor',
        name: 'Floor Subassembly',
        partNumber: this.amatsService.generatePartNumber('floor_asm'),
        tcNumber: this.amatsService.generateTCNumber().fullNumber,
        filePath: '',
        transform: [],
        children: ['comp_skid', 'comp_floor_panel'],
        parent: 'root'
      },
      {
        id: 'subasm_walls',
        name: 'Wall Subassembly',
        partNumber: this.amatsService.generatePartNumber('wall_asm'),
        tcNumber: this.amatsService.generateTCNumber().fullNumber,
        filePath: '',
        transform: [],
        children: ['comp_front_panel', 'comp_back_panel', 'comp_left_panel', 'comp_right_panel'],
        parent: 'root'
      },
      {
        id: 'comp_skid',
        name: 'Skid Structure',
        partNumber: this.amatsService.generatePartNumber('skid'),
        tcNumber: this.amatsService.generateTCNumber().fullNumber,
        filePath: '',
        transform: [],
        children: [],
        parent: 'subasm_floor'
      },
      {
        id: 'comp_floor_panel',
        name: 'Floor Panel',
        partNumber: this.amatsService.generatePartNumber('floor_panel'),
        tcNumber: this.amatsService.generateTCNumber().fullNumber,
        filePath: '',
        transform: [],
        children: [],
        parent: 'subasm_floor'
      },
      {
        id: 'comp_front_panel',
        name: 'Front Panel',
        partNumber: this.amatsService.generatePartNumber('front_panel'),
        tcNumber: this.amatsService.generateTCNumber().fullNumber,
        filePath: '',
        transform: [],
        children: [],
        parent: 'subasm_walls'
      },
      {
        id: 'comp_back_panel',
        name: 'Back Panel',
        partNumber: this.amatsService.generatePartNumber('back_panel'),
        tcNumber: this.amatsService.generateTCNumber().fullNumber,
        filePath: '',
        transform: [],
        children: [],
        parent: 'subasm_walls'
      },
      {
        id: 'comp_left_panel',
        name: 'Left Panel',
        partNumber: this.amatsService.generatePartNumber('left_panel'),
        tcNumber: this.amatsService.generateTCNumber().fullNumber,
        filePath: '',
        transform: [],
        children: [],
        parent: 'subasm_walls'
      },
      {
        id: 'comp_right_panel',
        name: 'Right Panel',
        partNumber: this.amatsService.generatePartNumber('right_panel'),
        tcNumber: this.amatsService.generateTCNumber().fullNumber,
        filePath: '',
        transform: [],
        children: [],
        parent: 'subasm_walls'
      }
    ];

    if (this.config.cap.topPanel) {
      components.push({
        id: 'subasm_top',
        name: 'Top Subassembly',
        partNumber: this.amatsService.generatePartNumber('top_asm'),
        tcNumber: this.amatsService.generateTCNumber().fullNumber,
        filePath: '',
        transform: [],
        children: ['comp_top_panel'],
        parent: 'root'
      });
      
      components.push({
        id: 'comp_top_panel',
        name: 'Top Panel',
        partNumber: this.amatsService.generatePartNumber('top_panel'),
        tcNumber: this.amatsService.generateTCNumber().fullNumber,
        filePath: '',
        transform: [],
        children: [],
        parent: 'subasm_top'
      });
    }

    return {
      rootAssembly,
      components,
      constraints: [], // Will be populated with assembly constraints
      bomStructure: this.generateBOMItems()
    };
  }

  private generateBOMItems(): BOMItem[] {
    const items: BOMItem[] = [];
    let itemNumber = 1;

    // Lumber components
    const skidRunnerLength = Math.ceil(this.config.dimensions.width / 12) * 12; // Round up to nearest foot
    const skidCrossLength = Math.ceil((this.config.dimensions.length - 7) / 12) * 12;
    
    items.push({
      itemNumber: itemNumber++,
      partNumber: this.amatsService.generatePartNumber('lumber_runner'),
      tcNumber: this.amatsService.generateTCNumber().fullNumber,
      description: 'Skid Runner - Douglas Fir 2x4',
      quantity: 2,
      material: 'Douglas Fir Lumber',
      dimensions: `2x4x${skidRunnerLength}"`,
      weight: this.calculateLumberWeight(2, 4, skidRunnerLength) * 2,
      supplier: 'Pre-approved lumber supplier',
      notes: 'Construction grade, kiln dried, ISPM-15 compliant'
    });

    items.push({
      itemNumber: itemNumber++,
      partNumber: this.amatsService.generatePartNumber('lumber_cross'),
      tcNumber: this.amatsService.generateTCNumber().fullNumber,
      description: 'Skid Cross Member - Douglas Fir 2x4',
      quantity: 2,
      material: 'Douglas Fir Lumber',
      dimensions: `2x4x${skidCrossLength}"`,
      weight: this.calculateLumberWeight(2, 4, skidCrossLength) * 2,
      supplier: 'Pre-approved lumber supplier',
      notes: 'Construction grade, kiln dried, ISPM-15 compliant'
    });

    // Plywood components
    items.push({
      itemNumber: itemNumber++,
      partNumber: this.amatsService.generatePartNumber('plywood_floor'),
      tcNumber: this.amatsService.generateTCNumber().fullNumber,
      description: 'Floor Panel - CDX Plywood',
      quantity: 1,
      material: 'CDX Plywood',
      dimensions: `3/4" x ${this.config.dimensions.width}" x ${this.config.dimensions.length}"`,
      weight: this.calculatePlywoodWeight(0.75, this.config.dimensions.width, this.config.dimensions.length),
      supplier: 'Pre-approved plywood supplier',
      notes: 'Exterior grade, no added formaldehyde'
    });

    // Wall panels
    const wallPanels = [
      { name: 'Front Panel', width: this.config.dimensions.width, height: this.config.dimensions.height },
      { name: 'Back Panel', width: this.config.dimensions.width, height: this.config.dimensions.height },
      { name: 'Left Panel', width: this.config.dimensions.length, height: this.config.dimensions.height },
      { name: 'Right Panel', width: this.config.dimensions.length, height: this.config.dimensions.height }
    ];

    wallPanels.forEach(panel => {
      items.push({
        itemNumber: itemNumber++,
        partNumber: this.amatsService.generatePartNumber(`plywood_${panel.name.toLowerCase().replace(' ', '_')}`),
        tcNumber: this.amatsService.generateTCNumber().fullNumber,
        description: `${panel.name} - CDX Plywood`,
        quantity: 1,
        material: 'CDX Plywood',
        dimensions: `3/4" x ${panel.width}" x ${panel.height}"`,
        weight: this.calculatePlywoodWeight(0.75, panel.width, panel.height),
        supplier: 'Pre-approved plywood supplier',
        notes: 'Exterior grade, no added formaldehyde'
      });
    });

    // Top panel if required
    if (this.config.cap.topPanel) {
      items.push({
        itemNumber: itemNumber++,
        partNumber: this.amatsService.generatePartNumber('plywood_top'),
        tcNumber: this.amatsService.generateTCNumber().fullNumber,
        description: 'Top Panel - CDX Plywood',
        quantity: 1,
        material: 'CDX Plywood',
        dimensions: `3/4" x ${this.config.dimensions.width}" x ${this.config.dimensions.length}"`,
        weight: this.calculatePlywoodWeight(0.75, this.config.dimensions.width, this.config.dimensions.length),
        supplier: 'Pre-approved plywood supplier',
        notes: 'Exterior grade, no added formaldehyde'
      });
    }

    // Hardware components
    items.push({
      itemNumber: itemNumber++,
      partNumber: this.amatsService.generatePartNumber('hardware_lag_bolts'),
      tcNumber: this.amatsService.generateTCNumber().fullNumber,
      description: 'Lag Bolts 3/8" x 6"',
      quantity: 12,
      material: 'Galvanized Steel',
      dimensions: '3/8" x 6"',
      weight: 0.25 * 12, // 0.25 lbs each
      supplier: 'Fastener supply house',
      notes: 'Hot dipped galvanized, Grade 2'
    });

    items.push({
      itemNumber: itemNumber++,
      partNumber: this.amatsService.generatePartNumber('hardware_wood_screws'),
      tcNumber: this.amatsService.generateTCNumber().fullNumber,
      description: 'Wood Screws #10 x 2-1/2"',
      quantity: 48,
      material: 'Galvanized Steel',
      dimensions: '#10 x 2-1/2"',
      weight: 0.05 * 48, // 0.05 lbs each
      supplier: 'Fastener supply house',
      notes: 'Hot dipped galvanized, self-drilling'
    });

    items.push({
      itemNumber: itemNumber++,
      partNumber: this.amatsService.generatePartNumber('hardware_corner_screws'),
      tcNumber: this.amatsService.generateTCNumber().fullNumber,
      description: 'Wood Screws #10 x 3"',
      quantity: 32,
      material: 'Galvanized Steel',
      dimensions: '#10 x 3"',
      weight: 0.06 * 32, // 0.06 lbs each
      supplier: 'Fastener supply house',
      notes: 'Hot dipped galvanized, for corner blocks'
    });

    // Construction adhesive
    items.push({
      itemNumber: itemNumber++,
      partNumber: this.amatsService.generatePartNumber('adhesive_construction'),
      tcNumber: this.amatsService.generateTCNumber().fullNumber,
      description: 'Construction Adhesive',
      quantity: 1,
      material: 'Polyurethane',
      dimensions: '10.1 fl oz tube',
      weight: 0.75,
      supplier: 'Adhesive supplier',
      notes: 'Waterproof, structural grade'
    });

    // Corner blocks
    items.push({
      itemNumber: itemNumber++,
      partNumber: this.amatsService.generatePartNumber('lumber_corner_blocks'),
      tcNumber: this.amatsService.generateTCNumber().fullNumber,
      description: 'Corner Blocks - Douglas Fir 2x2',
      quantity: 16,
      material: 'Douglas Fir Lumber',
      dimensions: '2x2x3.5"',
      weight: this.calculateLumberWeight(2, 2, 3.5) * 16,
      supplier: 'Pre-approved lumber supplier',
      notes: 'Construction grade, for corner reinforcement'
    });

    return items;
  }

  private async createBOMFile(items: BOMItem[], config: BOMConfiguration): Promise<Blob> {
    switch (config.exportFormat) {
      case 'csv':
        return this.generateCSVBOM(items, config);
      case 'json':
        return this.generateJSONBOM(items, config);
      default:
        return this.generateTextBOM(items, config);
    }
  }

  private generateCSVBOM(items: BOMItem[], config: BOMConfiguration): Blob {
    const headers = [
      'Item',
      'Part Number',
      'TC Number',
      'Description',
      'Qty',
      'Material',
      'Dimensions',
      'Weight (lbs)',
      ...(config.includeSupplierInfo ? ['Supplier'] : []),
      ...(config.includeCosts ? ['Unit Cost', 'Total Cost'] : []),
      'Notes'
    ];

    const rows = items.map(item => [
      item.itemNumber.toString(),
      item.partNumber,
      item.tcNumber,
      item.description,
      item.quantity.toString(),
      item.material,
      item.dimensions,
      item.weight.toFixed(2),
      ...(config.includeSupplierInfo ? [item.supplier || ''] : []),
      ...(config.includeCosts ? ['$0.00', '$0.00'] : []), // Placeholder for costs
      item.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }

  private generateJSONBOM(items: BOMItem[], config: BOMConfiguration): Blob {
    const bomData = {
      projectInfo: {
        projectName: `AutoCrate ${this.config.dimensions.width}x${this.config.dimensions.length}x${this.config.dimensions.height}`,
        projectNumber: this.generateProjectNumber(),
        generatedDate: new Date().toISOString(),
        generatedBy: 'AutoCrate Professional',
        configuration: this.config
      },
      bomItems: items,
      summary: {
        totalItems: items.length,
        totalWeight: items.reduce((sum, item) => sum + item.weight, 0),
        materialTypes: Array.from(new Set(items.map(item => item.material)))
      },
      standards: this.amatsService.getStandards(),
      ...(config.includeCosts ? { costAnalysis: this.calculateCostSummary() } : {})
    };

    return new Blob([JSON.stringify(bomData, null, 2)], { type: 'application/json' });
  }

  private generateTextBOM(items: BOMItem[], config: BOMConfiguration): Blob {
    const projectNumber = this.generateProjectNumber();
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    
    const lines = [
      'APPLIED MATERIALS - BILL OF MATERIALS',
      '=' .repeat(60),
      '',
      `Project: AutoCrate Shipping Container ${this.config.dimensions.width}x${this.config.dimensions.length}x${this.config.dimensions.height}`,
      `Project Number: ${projectNumber}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Generated By: AutoCrate Professional`,
      `Total Weight: ${totalWeight.toFixed(2)} lbs`,
      '',
      'CONFIGURATION:',
      `Width: ${this.config.dimensions.width}"`,
      `Depth: ${this.config.dimensions.length}"`,
      `Height: ${this.config.dimensions.height}"`,
      `Has Top: ${this.config.cap.topPanel ? 'Yes' : 'No'}`,
      `Weight Capacity: ${this.config.weight.product} lbs`,
      '',
      'BILL OF MATERIALS:',
      '-' .repeat(60),
      ''
    ];

    // Table header
    const headerFormat = '%-4s %-20s %-15s %-25s %-5s %-10s %-8s';
    lines.push(
      sprintf(headerFormat, 'Item', 'Part Number', 'TC Number', 'Description', 'Qty', 'Material', 'Weight')
    );
    lines.push('-' .repeat(100));

    // BOM items
    items.forEach(item => {
      lines.push(
        sprintf(headerFormat,
          item.itemNumber.toString(),
          item.partNumber.substring(0, 20),
          item.tcNumber.substring(0, 15),
          item.description.substring(0, 25),
          item.quantity.toString(),
          item.material.substring(0, 10),
          item.weight.toFixed(1)
        )
      );
      
      if (item.dimensions) {
        lines.push(`     Dimensions: ${item.dimensions}`);
      }
      if (item.notes) {
        lines.push(`     Notes: ${item.notes}`);
      }
      if (config.includeSupplierInfo && item.supplier) {
        lines.push(`     Supplier: ${item.supplier}`);
      }
      lines.push('');
    });

    lines.push('');
    lines.push('MATERIAL SUMMARY:');
    lines.push('-' .repeat(30));
    
    const materialSummary = this.generateMaterialSummary(items);
    Object.entries(materialSummary).forEach(([material, data]) => {
      lines.push(`${material}: ${data.quantity} items, ${data.weight.toFixed(1)} lbs`);
    });

    return new Blob([lines.join('\n')], { type: 'text/plain' });
  }

  private async generateSpecifications(items: BOMItem[]): Promise<Blob> {
    const specs = [
      'MATERIAL SPECIFICATIONS',
      '=' .repeat(40),
      '',
      `Project: ${this.generateProjectNumber()}`,
      `Date: ${new Date().toLocaleDateString()}`,
      ''
    ];

    const materialTypes = Array.from(new Set(items.map(item => item.material)));
    
    materialTypes.forEach(material => {
      const materialItems = items.filter(item => item.material === material);
      specs.push(`${material.toUpperCase()}:`);
      specs.push('-' .repeat(material.length + 1));
      
      materialItems.forEach(item => {
        specs.push(`  ${item.description}`);
        specs.push(`    Part Number: ${item.partNumber}`);
        specs.push(`    Dimensions: ${item.dimensions}`);
        if (item.notes) {
          specs.push(`    Specifications: ${item.notes}`);
        }
        specs.push('');
      });
      specs.push('');
    });

    return new Blob([specs.join('\n')], { type: 'text/plain' });
  }

  private async generateSupplierInfo(items: BOMItem[]): Promise<Blob> {
    const suppliers = Array.from(new Set(items.map(item => item.supplier).filter(Boolean)));
    
    const supplierInfo = [
      'SUPPLIER INFORMATION',
      '=' .repeat(30),
      '',
      `Project: ${this.generateProjectNumber()}`,
      `Date: ${new Date().toLocaleDateString()}`,
      ''
    ];

    suppliers.forEach(supplier => {
      const supplierItems = items.filter(item => item.supplier === supplier);
      supplierInfo.push(`${supplier?.toUpperCase()}:`);
      supplierInfo.push('-' .repeat((supplier?.length || 0) + 1));
      
      supplierItems.forEach(item => {
        supplierInfo.push(`  ${item.description} (${item.quantity})`);
      });
      
      supplierInfo.push('');
      supplierInfo.push('  Contact Information:');
      supplierInfo.push('    [To be filled by procurement]');
      supplierInfo.push('');
      supplierInfo.push('  Quality Requirements:');
      supplierInfo.push('    - Supplier certification required');
      supplierInfo.push('    - Material test reports required');
      supplierInfo.push('    - ISPM-15 compliance for wood products');
      supplierInfo.push('');
    });

    return new Blob([supplierInfo.join('\n')], { type: 'text/plain' });
  }

  private async generateCostAnalysis(items: BOMItem[]): Promise<Blob> {
    const costs = this.amatsService.estimateMaterialCosts();
    
    const analysis = [
      'COST ANALYSIS',
      '=' .repeat(20),
      '',
      `Project: ${this.generateProjectNumber()}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      'MATERIAL COSTS:',
      '-' .repeat(20)
    ];

    Object.entries(costs).forEach(([category, cost]) => {
      if (typeof cost === 'number') {
        analysis.push(`${category.replace(/_/g, ' ').toUpperCase()}: $${cost.toFixed(2)}`);
      }
    });

    analysis.push('');
    analysis.push('NOTE: Costs are estimates based on current market pricing.');
    analysis.push('Contact procurement for actual supplier quotes.');

    return new Blob([analysis.join('\n')], { type: 'text/plain' });
  }

  private async generateAssemblyStructure(structure: AssemblyStructure): Promise<Blob> {
    const structureData = {
      projectInfo: {
        projectNumber: this.generateProjectNumber(),
        generatedDate: new Date().toISOString()
      },
      assemblyStructure: structure
    };

    return new Blob([JSON.stringify(structureData, null, 2)], { type: 'application/json' });
  }

  private async generateQualityChecklist(items: BOMItem[]): Promise<Blob> {
    const checklist = [
      'QUALITY CONTROL CHECKLIST',
      '=' .repeat(35),
      '',
      `Project: ${this.generateProjectNumber()}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      'MATERIAL INSPECTION:',
      '☐ All lumber inspected for grade compliance',
      '☐ Lumber moisture content verified (<19%)',
      '☐ Plywood grade marks verified (CDX)',
      '☐ Fastener certifications reviewed',
      '☐ ISMP-15 stamps present on all wood',
      '',
      'DIMENSIONAL VERIFICATION:',
      '☐ Cut dimensions verified against drawings',
      '☐ Assembly dimensions checked',
      '☐ Squareness verified (±1/8")',
      '',
      'FABRICATION QUALITY:',
      '☐ All joints properly fitted',
      '☐ Fasteners properly installed',
      '☐ No splits or damage present',
      '☐ Surface finish acceptable',
      '',
      'FINAL INSPECTION:',
      '☐ Overall dimensions verified',
      '☐ Weight capacity test passed',
      '☐ All documentation complete',
      '☐ Quality stamp applied',
      '',
      'Inspector: _________________ Date: _________',
      'Signature: _________________________________'
    ];

    return new Blob([checklist.join('\n')], { type: 'text/plain' });
  }

  // Helper methods
  private calculateLumberWeight(width: number, height: number, length: number): number {
    // Douglas Fir density: approximately 32 lb/ft³
    const volume = (width * height * length) / 1728; // cubic inches to cubic feet
    return volume * 32; // 32 lb/ft³
  }

  private calculatePlywoodWeight(thickness: number, width: number, height: number): number {
    // CDX plywood density: approximately 36 lb/ft³
    const volume = (thickness * width * height) / 1728; // cubic inches to cubic feet
    return volume * 36; // 36 lb/ft³
  }

  private generateProjectNumber(): string {
    return this.amatsService.generatePartNumber('project');
  }

  private generateMaterialSummary(items: BOMItem[]): Record<string, {quantity: number, weight: number}> {
    const summary: Record<string, {quantity: number, weight: number}> = {};
    
    items.forEach(item => {
      if (!summary[item.material]) {
        summary[item.material] = { quantity: 0, weight: 0 };
      }
      summary[item.material].quantity += item.quantity;
      summary[item.material].weight += item.weight;
    });
    
    return summary;
  }

  private calculateCostSummary(): Record<string, number> {
    return this.amatsService.estimateMaterialCosts();
  }

  private getDefaultBOMConfig(): BOMConfiguration {
    return {
      includeLabor: true,
      includeCosts: true,
      includeSupplierInfo: true,
      includeSpecifications: true,
      exportFormat: 'csv'
    };
  }
}

// Simple sprintf implementation for formatting
function sprintf(format: string, ...args: any[]): string {
  let i = 0;
  return format.replace(/%-?(\d+)?s/g, (match, width) => {
    const arg = args[i++] || '';
    const w = parseInt(width) || 0;
    return w > 0 ? arg.toString().padEnd(w) : arg.toString();
  });
}