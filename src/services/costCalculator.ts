/**
 * Cost Calculator Service
 * Provides detailed cost breakdowns for materials, labor, and shipping
 */

import { CrateConfiguration } from '@/types/crate';
import { AMATCrateStyle, determineAMATSkidSize, determineAMATCleating } from '@/types/amat-specifications';
import { calculateEnhancedCrateWeight } from './weightCalculations';

export interface MaterialCost {
  item: string;
  category: string;
  material: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  leadTime?: number; // days
}

export interface LaborCost {
  task: string;
  category: string;
  hours: number;
  rate: number;
  totalCost: number;
  skillLevel: 'basic' | 'skilled' | 'expert';
}

export interface ShippingCost {
  mode: 'air' | 'ocean' | 'ground' | 'rail';
  carrier?: string;
  baseCost: number;
  fuelSurcharge: number;
  insurance: number;
  customs?: number;
  handling: number;
  totalCost: number;
  transitTime: number; // days
}

export interface CostBreakdown {
  materials: {
    items: MaterialCost[];
    subtotal: number;
  };
  labor: {
    items: LaborCost[];
    subtotal: number;
  };
  shipping: {
    options: ShippingCost[];
    recommended: ShippingCost;
  };
  overhead: {
    design: number;
    quality: number;
    management: number;
    subtotal: number;
  };
  summary: {
    materialsCost: number;
    laborCost: number;
    shippingCost: number;
    overheadCost: number;
    subtotal: number;
    margin: number;
    tax: number;
    total: number;
  };
  metrics: {
    costPerPound: number;
    costPerCubicFoot: number;
    marginPercentage: number;
    leadTimeDays: number;
  };
}

// Material pricing database (per unit)
const MATERIAL_PRICES = {
  // Lumber (per board foot)
  pine_2x4: 0.85,
  pine_2x6: 1.10,
  pine_2x8: 1.45,
  pine_4x4: 2.20,
  pine_4x6: 3.30,
  pine_6x6: 5.50,
  pine_8x8: 9.80,
  
  // Plywood (per sheet - 4x8)
  plywood_half: 28.00,
  plywood_three_quarter: 42.00,
  plywood_one: 56.00,
  osb_half: 18.00,
  osb_three_quarter: 26.00,
  
  // Fasteners (per piece)
  nail_16d: 0.08,
  nail_10d: 0.06,
  screw_3in: 0.12,
  screw_2in: 0.09,
  bolt_half_6in: 1.20,
  bolt_half_8in: 1.60,
  washer_half: 0.15,
  nut_half: 0.20,
  
  // Hardware
  hinge_heavy: 12.00,
  latch_heavy: 18.00,
  corner_bracket: 4.50,
  strap_metal: 6.00,
  
  // Protection materials
  foam_pe_sheet: 8.50, // per sq ft
  foam_corner: 3.20, // per piece
  mbb_sqft: 0.85, // per sq ft
  desiccant_bag: 2.40, // per bag
  
  // Indicators
  shock_indicator: 18.00,
  tilt_indicator: 14.00,
  humidity_indicator: 8.00,
  
  // Miscellaneous
  plastic_wrap: 0.02, // per sq ft
  strapping_steel: 0.45, // per foot
  label_warning: 0.50,
  paint_marking: 12.00, // per quart
};

// Labor rates (per hour)
const LABOR_RATES = {
  basic: 25.00,    // Basic assembly
  skilled: 40.00,  // Skilled carpentry
  expert: 60.00,   // Expert/specialized work
};

export class CostCalculator {
  private config: CrateConfiguration;
  private marginPercentage: number = 35; // Default margin
  private taxRate: number = 0.0875; // Default tax rate (8.75%)
  
  constructor(config: CrateConfiguration, marginPercentage?: number, taxRate?: number) {
    this.config = config;
    if (marginPercentage !== undefined) this.marginPercentage = marginPercentage;
    if (taxRate !== undefined) this.taxRate = taxRate;
  }

  /**
   * Calculate complete cost breakdown
   */
  public calculateCosts(): CostBreakdown {
    const materials = this.calculateMaterialCosts();
    const labor = this.calculateLaborCosts();
    const shipping = this.calculateShippingCosts();
    const overhead = this.calculateOverheadCosts(materials.subtotal, labor.subtotal);
    
    const subtotal = materials.subtotal + labor.subtotal + shipping.recommended.totalCost + overhead.subtotal;
    const margin = subtotal * (this.marginPercentage / 100);
    const beforeTax = subtotal + margin;
    const tax = beforeTax * this.taxRate;
    const total = beforeTax + tax;
    
    // Calculate metrics
    const grossWeight = this.config.weight.product * 1.2;
    const volume = (this.config.dimensions.width * this.config.dimensions.length * this.config.dimensions.height) / 1728;
    
    return {
      materials,
      labor,
      shipping,
      overhead,
      summary: {
        materialsCost: materials.subtotal,
        laborCost: labor.subtotal,
        shippingCost: shipping.recommended.totalCost,
        overheadCost: overhead.subtotal,
        subtotal,
        margin,
        tax,
        total
      },
      metrics: {
        costPerPound: total / grossWeight,
        costPerCubicFoot: total / volume,
        marginPercentage: this.marginPercentage,
        leadTimeDays: this.calculateLeadTime(materials.items)
      }
    };
  }

  /**
   * Calculate material costs
   */
  private calculateMaterialCosts(): { items: MaterialCost[]; subtotal: number } {
    const items: MaterialCost[] = [];
    
    // Calculate panel materials
    const panelArea = this.calculatePanelArea();
    const panelSheets = Math.ceil(panelArea / 32); // 4x8 sheets
    
    items.push({
      item: 'Plywood Panels',
      category: 'Panels',
      material: '3/4" Plywood',
      quantity: panelSheets,
      unit: 'sheets',
      unitCost: MATERIAL_PRICES.plywood_three_quarter,
      totalCost: panelSheets * MATERIAL_PRICES.plywood_three_quarter,
      supplier: 'Local Lumber',
      leadTime: 1
    });
    
    // Calculate skid materials
    const skidSize = determineAMATSkidSize(this.config.weight.product * 1.2);
    const skidPieces = this.calculateSkidPieces(skidSize);
    
    items.push({
      item: 'Skid Lumber',
      category: 'Base',
      material: skidSize,
      quantity: skidPieces,
      unit: 'pieces',
      unitCost: this.getSkidPrice(skidSize),
      totalCost: skidPieces * this.getSkidPrice(skidSize),
      supplier: 'Local Lumber',
      leadTime: 1
    });
    
    // Calculate floorboards
    const floorboards = this.calculateFloorboards();
    items.push({
      item: 'Floorboards',
      category: 'Base',
      material: '2x6 Pine',
      quantity: floorboards,
      unit: 'pieces',
      unitCost: MATERIAL_PRICES.pine_2x6 * 8, // 8ft pieces
      totalCost: floorboards * MATERIAL_PRICES.pine_2x6 * 8,
      supplier: 'Local Lumber',
      leadTime: 1
    });
    
    // Calculate cleating
    const maxDim = Math.max(this.config.dimensions.width, this.config.dimensions.length);
    const cleating = determineAMATCleating(maxDim);
    const cleatPieces = this.calculateCleatPieces(cleating.cleatSize);
    
    items.push({
      item: 'Cleats',
      category: 'Reinforcement',
      material: cleating.cleatSize,
      quantity: cleatPieces,
      unit: 'pieces',
      unitCost: this.getCleatPrice(cleating.cleatSize),
      totalCost: cleatPieces * this.getCleatPrice(cleating.cleatSize),
      supplier: 'Local Lumber',
      leadTime: 1
    });
    
    // Calculate fasteners
    const fastenerCount = this.calculateFastenerCount();
    items.push({
      item: 'Nails',
      category: 'Fasteners',
      material: '16d Common',
      quantity: fastenerCount.nails,
      unit: 'pieces',
      unitCost: MATERIAL_PRICES.nail_16d,
      totalCost: fastenerCount.nails * MATERIAL_PRICES.nail_16d,
      supplier: 'Hardware Store',
      leadTime: 0
    });
    
    items.push({
      item: 'Screws',
      category: 'Fasteners',
      material: '3" Wood Screws',
      quantity: fastenerCount.screws,
      unit: 'pieces',
      unitCost: MATERIAL_PRICES.screw_3in,
      totalCost: fastenerCount.screws * MATERIAL_PRICES.screw_3in,
      supplier: 'Hardware Store',
      leadTime: 0
    });
    
    // Add optional materials
    if (this.config.foam) {
      const foamArea = this.calculateFoamArea();
      items.push({
        item: 'Foam Cushioning',
        category: 'Protection',
        material: 'PE Foam 2"',
        quantity: foamArea,
        unit: 'sq ft',
        unitCost: MATERIAL_PRICES.foam_pe_sheet,
        totalCost: foamArea * MATERIAL_PRICES.foam_pe_sheet,
        supplier: 'Packaging Supplier',
        leadTime: 3
      });
    }
    
    if (this.config.mbb) {
      const mbbArea = this.calculateMBBArea();
      items.push({
        item: 'Moisture Barrier',
        category: 'Protection',
        material: 'MBB Film',
        quantity: mbbArea,
        unit: 'sq ft',
        unitCost: MATERIAL_PRICES.mbb_sqft,
        totalCost: mbbArea * MATERIAL_PRICES.mbb_sqft,
        supplier: 'Packaging Supplier',
        leadTime: 2
      });
      
      // Add desiccant
      const desiccantBags = Math.ceil(this.config.weight.product / 500); // 1 bag per 500 lbs
      items.push({
        item: 'Desiccant',
        category: 'Protection',
        material: 'Silica Gel Bags',
        quantity: desiccantBags,
        unit: 'bags',
        unitCost: MATERIAL_PRICES.desiccant_bag,
        totalCost: desiccantBags * MATERIAL_PRICES.desiccant_bag,
        supplier: 'Packaging Supplier',
        leadTime: 2
      });
    }
    
    if (this.config.shockIndicators) {
      items.push({
        item: 'Shock Indicators',
        category: 'Monitoring',
        material: '25G Indicators',
        quantity: 2,
        unit: 'pieces',
        unitCost: MATERIAL_PRICES.shock_indicator,
        totalCost: 2 * MATERIAL_PRICES.shock_indicator,
        supplier: 'Specialty Supplier',
        leadTime: 5
      });
    }
    
    if (this.config.tiltIndicators) {
      items.push({
        item: 'Tilt Indicators',
        category: 'Monitoring',
        material: 'TiltWatch Plus',
        quantity: 2,
        unit: 'pieces',
        unitCost: MATERIAL_PRICES.tilt_indicator,
        totalCost: 2 * MATERIAL_PRICES.tilt_indicator,
        supplier: 'Specialty Supplier',
        leadTime: 5
      });
    }
    
    // Add miscellaneous
    items.push({
      item: 'Warning Labels',
      category: 'Miscellaneous',
      material: 'Weatherproof Labels',
      quantity: 8,
      unit: 'pieces',
      unitCost: MATERIAL_PRICES.label_warning,
      totalCost: 8 * MATERIAL_PRICES.label_warning,
      supplier: 'Local Supplier',
      leadTime: 1
    });
    
    const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0);
    
    return { items, subtotal };
  }

  /**
   * Calculate labor costs
   */
  private calculateLaborCosts(): { items: LaborCost[]; subtotal: number } {
    const items: LaborCost[] = [];
    const complexity = this.getComplexityFactor();
    
    // Base assembly
    const baseHours = 2.0 * complexity;
    items.push({
      task: 'Base Assembly',
      category: 'Construction',
      hours: baseHours,
      rate: LABOR_RATES.skilled,
      totalCost: baseHours * LABOR_RATES.skilled,
      skillLevel: 'skilled'
    });
    
    // Panel cutting and preparation
    const panelHours = 1.5 * complexity;
    items.push({
      task: 'Panel Preparation',
      category: 'Preparation',
      hours: panelHours,
      rate: LABOR_RATES.basic,
      totalCost: panelHours * LABOR_RATES.basic,
      skillLevel: 'basic'
    });
    
    // Wall assembly
    const wallHours = 3.0 * complexity;
    items.push({
      task: 'Wall Assembly',
      category: 'Construction',
      hours: wallHours,
      rate: LABOR_RATES.skilled,
      totalCost: wallHours * LABOR_RATES.skilled,
      skillLevel: 'skilled'
    });
    
    // Top assembly (if applicable)
    if (this.config.cap.topPanel) {
      const topHours = 1.0 * complexity;
      items.push({
        task: 'Top Panel Assembly',
        category: 'Construction',
        hours: topHours,
        rate: LABOR_RATES.skilled,
        totalCost: topHours * LABOR_RATES.skilled,
        skillLevel: 'skilled'
      });
    }
    
    // Cleating and reinforcement
    const cleatHours = 1.5 * complexity;
    items.push({
      task: 'Cleating Installation',
      category: 'Reinforcement',
      hours: cleatHours,
      rate: LABOR_RATES.skilled,
      totalCost: cleatHours * LABOR_RATES.skilled,
      skillLevel: 'skilled'
    });
    
    // Special features
    if (this.config.foam) {
      items.push({
        task: 'Foam Installation',
        category: 'Protection',
        hours: 1.0,
        rate: LABOR_RATES.basic,
        totalCost: 1.0 * LABOR_RATES.basic,
        skillLevel: 'basic'
      });
    }
    
    if (this.config.mbb) {
      items.push({
        task: 'MBB Application',
        category: 'Protection',
        hours: 1.5,
        rate: LABOR_RATES.skilled,
        totalCost: 1.5 * LABOR_RATES.skilled,
        skillLevel: 'skilled'
      });
    }
    
    // Quality inspection
    items.push({
      task: 'Quality Inspection',
      category: 'Quality',
      hours: 0.5,
      rate: LABOR_RATES.expert,
      totalCost: 0.5 * LABOR_RATES.expert,
      skillLevel: 'expert'
    });
    
    // Documentation and marking
    items.push({
      task: 'Marking & Documentation',
      category: 'Finishing',
      hours: 0.5,
      rate: LABOR_RATES.basic,
      totalCost: 0.5 * LABOR_RATES.basic,
      skillLevel: 'basic'
    });
    
    const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0);
    
    return { items, subtotal };
  }

  /**
   * Calculate shipping costs
   */
  private calculateShippingCosts(): { options: ShippingCost[]; recommended: ShippingCost } {
    const options: ShippingCost[] = [];
    const grossWeight = this.config.weight.product * 1.2;
    const volume = (this.config.dimensions.width * this.config.dimensions.length * this.config.dimensions.height) / 1728;
    const distance = 2500; // Default distance in miles
    
    // Ground shipping
    const groundBase = this.calculateGroundShipping(grossWeight, volume, distance);
    options.push({
      mode: 'ground',
      carrier: 'FedEx Freight',
      baseCost: groundBase,
      fuelSurcharge: groundBase * 0.15,
      insurance: grossWeight * 0.02,
      handling: 75,
      totalCost: groundBase + (groundBase * 0.15) + (grossWeight * 0.02) + 75,
      transitTime: 5
    });
    
    // Ocean shipping
    if (this.config.dimensions.length <= 474) { // Fits in container
      const oceanBase = volume * 12; // $12 per cubic foot
      options.push({
        mode: 'ocean',
        carrier: 'Maersk',
        baseCost: oceanBase,
        fuelSurcharge: oceanBase * 0.20,
        insurance: grossWeight * 0.015,
        customs: 250,
        handling: 150,
        totalCost: oceanBase + (oceanBase * 0.20) + (grossWeight * 0.015) + 250 + 150,
        transitTime: 30
      });
    }
    
    // Air shipping (if within limits)
    if (grossWeight <= 7000 && Math.max(this.config.dimensions.width, this.config.dimensions.length, this.config.dimensions.height) <= 120) {
      const airBase = grossWeight * 2.5; // $2.50 per pound
      options.push({
        mode: 'air',
        carrier: 'DHL Express',
        baseCost: airBase,
        fuelSurcharge: airBase * 0.25,
        insurance: grossWeight * 0.03,
        customs: 150,
        handling: 200,
        totalCost: airBase + (airBase * 0.25) + (grossWeight * 0.03) + 150 + 200,
        transitTime: 3
      });
    }
    
    // Rail shipping (for domestic)
    const railBase = volume * 8; // $8 per cubic foot
    options.push({
      mode: 'rail',
      carrier: 'BNSF Railway',
      baseCost: railBase,
      fuelSurcharge: railBase * 0.10,
      insurance: grossWeight * 0.01,
      handling: 100,
      totalCost: railBase + (railBase * 0.10) + (grossWeight * 0.01) + 100,
      transitTime: 7
    });
    
    // Determine recommended option
    let recommended = options[0]; // Default to ground
    
    // If international, prefer ocean
    if (this.config.shipping?.international) {
      const ocean = options.find(o => o.mode === 'ocean');
      if (ocean) recommended = ocean;
    }
    
    // If urgent, prefer air
    if (this.config.shipping?.urgent && options.find(o => o.mode === 'air')) {
      const air = options.find(o => o.mode === 'air');
      if (air) recommended = air;
    }
    
    return { options, recommended };
  }

  /**
   * Calculate overhead costs
   */
  private calculateOverheadCosts(materialsCost: number, laborCost: number): {
    design: number;
    quality: number;
    management: number;
    subtotal: number;
  } {
    const baseCost = materialsCost + laborCost;
    
    const design = baseCost * 0.05;     // 5% for design/engineering
    const quality = baseCost * 0.03;     // 3% for quality control
    const management = baseCost * 0.07;  // 7% for project management
    
    return {
      design,
      quality,
      management,
      subtotal: design + quality + management
    };
  }

  // Helper methods
  private calculatePanelArea(): number {
    const { width, length, height } = this.config.dimensions;
    // Front + back + left + right + top (if applicable)
    let area = 2 * (width * height) + 2 * (length * height);
    if (this.config.cap.topPanel) {
      area += width * length;
    }
    return area / 144; // Convert to square feet
  }

  private calculateSkidPieces(skidSize: string): number {
    const pieces: Record<string, number> = {
      '3x4': 3,
      '4x4': 3,
      '4x6': 2,
      '6x6': 2,
      '8x8': 2
    };
    return pieces[skidSize] || 3;
  }

  private calculateFloorboards(): number {
    const width = this.config.dimensions.width;
    return Math.ceil(width / 5.5); // 2x6 actual width is 5.5"
  }

  private calculateCleatPieces(cleatSize: string): number {
    const perimeter = 2 * (this.config.dimensions.width + this.config.dimensions.length);
    const cleatLength = 8; // 8 foot pieces
    return Math.ceil((perimeter / 12) / cleatLength) * 4; // 4 sides
  }

  private calculateFastenerCount(): { nails: number; screws: number } {
    const perimeter = 2 * (this.config.dimensions.width + this.config.dimensions.length + this.config.dimensions.height);
    const spacing = 6; // inches
    const nails = Math.ceil(perimeter / spacing) * 2;
    const screws = Math.ceil(perimeter / (spacing * 2));
    return { nails, screws };
  }

  private calculateFoamArea(): number {
    // Foam on all interior surfaces
    const { width, length, height } = this.config.dimensions;
    return (2 * (width * height) + 2 * (length * height) + (width * length)) / 144;
  }

  private calculateMBBArea(): number {
    // MBB covers entire exterior with 20% overlap
    const { width, length, height } = this.config.dimensions;
    return ((2 * (width * height) + 2 * (length * height) + 2 * (width * length)) / 144) * 1.2;
  }

  private getSkidPrice(skidSize: string): number {
    const prices: Record<string, number> = {
      '3x4': MATERIAL_PRICES.pine_4x4 * 8,
      '4x4': MATERIAL_PRICES.pine_4x4 * 8,
      '4x6': MATERIAL_PRICES.pine_4x6 * 8,
      '6x6': MATERIAL_PRICES.pine_6x6 * 8,
      '8x8': MATERIAL_PRICES.pine_8x8 * 8
    };
    return prices[skidSize] || MATERIAL_PRICES.pine_4x4 * 8;
  }

  private getCleatPrice(cleatSize: string): number {
    const prices: Record<string, number> = {
      '1x2': MATERIAL_PRICES.pine_2x4 * 4,
      '1x3': MATERIAL_PRICES.pine_2x4 * 5,
      '1x4': MATERIAL_PRICES.pine_2x4 * 6,
      '1x6': MATERIAL_PRICES.pine_2x6 * 8
    };
    return prices[cleatSize] || MATERIAL_PRICES.pine_2x4 * 6;
  }

  private getComplexityFactor(): number {
    let factor = 1.0;
    
    // Size complexity
    const volume = (this.config.dimensions.width * this.config.dimensions.length * this.config.dimensions.height) / 1728;
    if (volume > 100) factor += 0.2;
    if (volume > 200) factor += 0.3;
    
    // Weight complexity
    if (this.config.weight.product > 2000) factor += 0.2;
    if (this.config.weight.product > 5000) factor += 0.3;
    
    // Feature complexity
    if (this.config.foam) factor += 0.1;
    if (this.config.mbb) factor += 0.15;
    if (this.config.diagonalBracing) factor += 0.1;
    
    return factor;
  }

  private calculateGroundShipping(weight: number, volume: number, distance: number): number {
    // Base rate calculation
    const weightRate = weight * 0.15; // $0.15 per pound
    const volumeRate = volume * 5;    // $5 per cubic foot
    const distanceRate = distance * 0.02; // $0.02 per mile
    
    // Use the higher of weight or volume rate (dimensional weight)
    const baseRate = Math.max(weightRate, volumeRate);
    
    return baseRate + distanceRate;
  }

  private calculateLeadTime(materials: MaterialCost[]): number {
    return Math.max(...materials.map(m => m.leadTime || 0)) + 2; // Add 2 days for assembly
  }
}