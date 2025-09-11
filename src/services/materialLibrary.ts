/**
 * Material Library Service
 * Comprehensive material database with vendor pricing and availability
 */

export interface MaterialSpec {
  id: string;
  name: string;
  category: 'lumber' | 'plywood' | 'fasteners' | 'hardware' | 'protection' | 'packaging';
  type: string;
  dimensions?: {
    thickness?: number;
    width?: number;
    length?: number;
    diameter?: number;
  };
  unit: 'piece' | 'sheet' | 'board-foot' | 'pound' | 'sqft' | 'linear-foot';
  properties: {
    density?: number; // lbs/ft³
    strength?: number; // PSI
    moistureResistance?: 'high' | 'medium' | 'low';
    fireRating?: string;
    sustainabilityCert?: string[];
    ispm15Compliant?: boolean;
  };
  vendors: VendorInfo[];
  alternatives: string[]; // IDs of alternative materials
  applications: string[];
  certifications: string[];
  environmentalImpact: {
    recyclable: boolean;
    biodegradable: boolean;
    carbonFootprint: number; // kg CO2 per unit
    sustainabilityRating: 'A' | 'B' | 'C' | 'D' | 'E';
  };
}

export interface VendorInfo {
  vendorId: string;
  vendorName: string;
  sku: string;
  pricing: PricingTier[];
  availability: {
    inStock: boolean;
    quantity: number;
    leadTimeDays: number;
    minOrderQuantity: number;
  };
  location: string;
  lastUpdated: Date;
  reliability: number; // 0-100 score
}

export interface PricingTier {
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
  bulkDiscount?: number;
}

export interface MaterialFilter {
  category?: string[];
  priceRange?: { min: number; max: number };
  availability?: 'in-stock' | 'all';
  properties?: Partial<MaterialSpec['properties']>;
  certifications?: string[];
  vendorIds?: string[];
}

export interface MaterialComparison {
  materials: MaterialSpec[];
  comparisonMetrics: {
    metric: string;
    values: (number | string)[];
    unit: string;
    bestIndex: number;
  }[];
  recommendation: {
    bestOverall: string;
    bestValue: string;
    mostSustainable: string;
    fastestAvailable: string;
  };
}

export class MaterialLibrary {
  private materials: Map<string, MaterialSpec> = new Map();
  private vendors: Map<string, VendorDetails> = new Map();
  private priceUpdateListeners: Set<(materialId: string, newPrice: number) => void> = new Set();
  
  constructor() {
    this.initializeMaterials();
    this.initializeVendors();
  }
  
  /**
   * Initialize default materials database
   */
  private initializeMaterials() {
    const defaultMaterials: MaterialSpec[] = [
      {
        id: 'ply_3/4_cdx',
        name: '3/4" CDX Plywood',
        category: 'plywood',
        type: 'CDX',
        dimensions: { thickness: 0.75, width: 48, length: 96 },
        unit: 'sheet',
        properties: {
          density: 34,
          strength: 1500,
          moistureResistance: 'medium',
          fireRating: 'Class C',
          ispm15Compliant: true
        },
        vendors: [
          {
            vendorId: 'vendor_hd',
            vendorName: 'Home Depot',
            sku: 'PLY34CDX',
            pricing: [
              { minQuantity: 1, maxQuantity: 10, unitPrice: 42.00 },
              { minQuantity: 11, maxQuantity: 50, unitPrice: 38.00, bulkDiscount: 10 },
              { minQuantity: 51, maxQuantity: 999, unitPrice: 35.00, bulkDiscount: 15 }
            ],
            availability: {
              inStock: true,
              quantity: 250,
              leadTimeDays: 1,
              minOrderQuantity: 1
            },
            location: 'Local',
            lastUpdated: new Date(),
            reliability: 95
          },
          {
            vendorId: 'vendor_lowes',
            vendorName: 'Lowes',
            sku: 'CDX750PLY',
            pricing: [
              { minQuantity: 1, maxQuantity: 10, unitPrice: 43.50 },
              { minQuantity: 11, maxQuantity: 999, unitPrice: 39.00, bulkDiscount: 10 }
            ],
            availability: {
              inStock: true,
              quantity: 180,
              leadTimeDays: 1,
              minOrderQuantity: 1
            },
            location: 'Local',
            lastUpdated: new Date(),
            reliability: 93
          }
        ],
        alternatives: ['ply_3/4_osb', 'ply_1/2_cdx'],
        applications: ['Crate panels', 'Flooring', 'Structural sheathing'],
        certifications: ['FSC', 'CARB Phase 2'],
        environmentalImpact: {
          recyclable: true,
          biodegradable: true,
          carbonFootprint: 12.5,
          sustainabilityRating: 'B'
        }
      },
      {
        id: 'ply_3/4_osb',
        name: '3/4" OSB',
        category: 'plywood',
        type: 'OSB',
        dimensions: { thickness: 0.75, width: 48, length: 96 },
        unit: 'sheet',
        properties: {
          density: 38,
          strength: 1200,
          moistureResistance: 'low',
          fireRating: 'Class C',
          ispm15Compliant: true
        },
        vendors: [
          {
            vendorId: 'vendor_hd',
            vendorName: 'Home Depot',
            sku: 'OSB34',
            pricing: [
              { minQuantity: 1, maxQuantity: 10, unitPrice: 26.00 },
              { minQuantity: 11, maxQuantity: 999, unitPrice: 23.00, bulkDiscount: 12 }
            ],
            availability: {
              inStock: true,
              quantity: 500,
              leadTimeDays: 0,
              minOrderQuantity: 1
            },
            location: 'Local',
            lastUpdated: new Date(),
            reliability: 98
          }
        ],
        alternatives: ['ply_3/4_cdx'],
        applications: ['Crate panels', 'Non-structural sheathing', 'Temporary structures'],
        certifications: ['CARB Phase 2'],
        environmentalImpact: {
          recyclable: true,
          biodegradable: true,
          carbonFootprint: 8.5,
          sustainabilityRating: 'C'
        }
      },
      {
        id: 'lumber_2x4_pine',
        name: '2x4 Pine Lumber',
        category: 'lumber',
        type: 'Dimensional',
        dimensions: { thickness: 1.5, width: 3.5, length: 96 },
        unit: 'piece',
        properties: {
          density: 35,
          strength: 875,
          moistureResistance: 'medium',
          ispm15Compliant: true
        },
        vendors: [
          {
            vendorId: 'vendor_lumber_yard',
            vendorName: 'Local Lumber Yard',
            sku: 'PINE24X8',
            pricing: [
              { minQuantity: 1, maxQuantity: 20, unitPrice: 6.80 },
              { minQuantity: 21, maxQuantity: 100, unitPrice: 6.20, bulkDiscount: 9 },
              { minQuantity: 101, maxQuantity: 999, unitPrice: 5.80, bulkDiscount: 15 }
            ],
            availability: {
              inStock: true,
              quantity: 1000,
              leadTimeDays: 0,
              minOrderQuantity: 1
            },
            location: 'Local',
            lastUpdated: new Date(),
            reliability: 96
          }
        ],
        alternatives: ['lumber_2x6_pine', 'lumber_2x4_oak'],
        applications: ['Cleats', 'Frame construction', 'Skids'],
        certifications: ['FSC', 'SFI'],
        environmentalImpact: {
          recyclable: true,
          biodegradable: true,
          carbonFootprint: 3.2,
          sustainabilityRating: 'B'
        }
      },
      {
        id: 'lumber_4x4_pine',
        name: '4x4 Pine Lumber',
        category: 'lumber',
        type: 'Dimensional',
        dimensions: { thickness: 3.5, width: 3.5, length: 96 },
        unit: 'piece',
        properties: {
          density: 35,
          strength: 875,
          moistureResistance: 'medium',
          ispm15Compliant: true
        },
        vendors: [
          {
            vendorId: 'vendor_lumber_yard',
            vendorName: 'Local Lumber Yard',
            sku: 'PINE44X8',
            pricing: [
              { minQuantity: 1, maxQuantity: 10, unitPrice: 17.60 },
              { minQuantity: 11, maxQuantity: 50, unitPrice: 15.80, bulkDiscount: 10 },
              { minQuantity: 51, maxQuantity: 999, unitPrice: 14.50, bulkDiscount: 18 }
            ],
            availability: {
              inStock: true,
              quantity: 200,
              leadTimeDays: 1,
              minOrderQuantity: 1
            },
            location: 'Local',
            lastUpdated: new Date(),
            reliability: 94
          }
        ],
        alternatives: ['lumber_4x6_pine', 'lumber_6x6_pine'],
        applications: ['Heavy-duty skids', 'Corner posts', 'Main supports'],
        certifications: ['FSC', 'SFI'],
        environmentalImpact: {
          recyclable: true,
          biodegradable: true,
          carbonFootprint: 7.5,
          sustainabilityRating: 'B'
        }
      },
      {
        id: 'fastener_nail_16d',
        name: '16d Common Nail',
        category: 'fasteners',
        type: 'Nail',
        dimensions: { diameter: 0.162, length: 3.5 },
        unit: 'pound',
        properties: {
          strength: 100,
          moistureResistance: 'low'
        },
        vendors: [
          {
            vendorId: 'vendor_fastenal',
            vendorName: 'Fastenal',
            sku: 'NAIL16D',
            pricing: [
              { minQuantity: 1, maxQuantity: 10, unitPrice: 4.50 },
              { minQuantity: 11, maxQuantity: 50, unitPrice: 4.00, bulkDiscount: 11 },
              { minQuantity: 51, maxQuantity: 999, unitPrice: 3.50, bulkDiscount: 22 }
            ],
            availability: {
              inStock: true,
              quantity: 5000,
              leadTimeDays: 0,
              minOrderQuantity: 1
            },
            location: 'Local',
            lastUpdated: new Date(),
            reliability: 99
          }
        ],
        alternatives: ['fastener_screw_3in', 'fastener_nail_10d'],
        applications: ['Panel attachment', 'Frame assembly', 'General construction'],
        certifications: ['ASTM F1667'],
        environmentalImpact: {
          recyclable: true,
          biodegradable: false,
          carbonFootprint: 0.5,
          sustainabilityRating: 'C'
        }
      },
      {
        id: 'protection_foam_pe',
        name: 'Polyethylene Foam Sheet',
        category: 'protection',
        type: 'Foam',
        dimensions: { thickness: 2, width: 48, length: 96 },
        unit: 'sheet',
        properties: {
          density: 2.2,
          moistureResistance: 'high'
        },
        vendors: [
          {
            vendorId: 'vendor_uline',
            vendorName: 'Uline',
            sku: 'S-2448',
            pricing: [
              { minQuantity: 1, maxQuantity: 5, unitPrice: 68.00 },
              { minQuantity: 6, maxQuantity: 20, unitPrice: 62.00, bulkDiscount: 9 },
              { minQuantity: 21, maxQuantity: 999, unitPrice: 56.00, bulkDiscount: 18 }
            ],
            availability: {
              inStock: true,
              quantity: 100,
              leadTimeDays: 2,
              minOrderQuantity: 1
            },
            location: 'Regional',
            lastUpdated: new Date(),
            reliability: 97
          }
        ],
        alternatives: ['protection_bubble_wrap', 'protection_foam_pu'],
        applications: ['Product cushioning', 'Shock absorption', 'Surface protection'],
        certifications: ['RoHS'],
        environmentalImpact: {
          recyclable: true,
          biodegradable: false,
          carbonFootprint: 15.0,
          sustainabilityRating: 'D'
        }
      }
    ];
    
    defaultMaterials.forEach(material => {
      this.materials.set(material.id, material);
    });
  }
  
  /**
   * Initialize vendors database
   */
  private initializeVendors() {
    const vendors: VendorDetails[] = [
      {
        id: 'vendor_hd',
        name: 'Home Depot',
        type: 'retail',
        contactInfo: {
          phone: '1-800-HOME-DEPOT',
          email: 'commercial@homedepot.com',
          website: 'homedepot.com'
        },
        rating: 4.5,
        deliveryOptions: ['same-day', 'next-day', 'scheduled'],
        paymentTerms: 'Net 30',
        minimumOrder: 0,
        locations: ['Nationwide']
      },
      {
        id: 'vendor_lowes',
        name: 'Lowes',
        type: 'retail',
        contactInfo: {
          phone: '1-800-LOWES',
          email: 'pro@lowes.com',
          website: 'lowes.com'
        },
        rating: 4.3,
        deliveryOptions: ['next-day', 'scheduled'],
        paymentTerms: 'Net 30',
        minimumOrder: 0,
        locations: ['Nationwide']
      },
      {
        id: 'vendor_lumber_yard',
        name: 'Local Lumber Yard',
        type: 'wholesale',
        contactInfo: {
          phone: '555-LUMBER',
          email: 'sales@locallumber.com',
          website: 'locallumber.com'
        },
        rating: 4.7,
        deliveryOptions: ['same-day', 'scheduled'],
        paymentTerms: 'Net 15',
        minimumOrder: 100,
        locations: ['Local']
      },
      {
        id: 'vendor_fastenal',
        name: 'Fastenal',
        type: 'industrial',
        contactInfo: {
          phone: '1-877-FASTENAL',
          email: 'sales@fastenal.com',
          website: 'fastenal.com'
        },
        rating: 4.6,
        deliveryOptions: ['next-day', 'scheduled'],
        paymentTerms: 'Net 30',
        minimumOrder: 25,
        locations: ['Nationwide']
      },
      {
        id: 'vendor_uline',
        name: 'Uline',
        type: 'industrial',
        contactInfo: {
          phone: '1-800-ULINE',
          email: 'customerservice@uline.com',
          website: 'uline.com'
        },
        rating: 4.8,
        deliveryOptions: ['next-day', 'two-day'],
        paymentTerms: 'Net 30',
        minimumOrder: 50,
        locations: ['Nationwide']
      }
    ];
    
    vendors.forEach(vendor => {
      this.vendors.set(vendor.id, vendor);
    });
  }
  
  /**
   * Get material by ID
   */
  public getMaterial(id: string): MaterialSpec | null {
    return this.materials.get(id) || null;
  }
  
  /**
   * Search materials with filters
   */
  public searchMaterials(filter: MaterialFilter): MaterialSpec[] {
    let results = Array.from(this.materials.values());
    
    if (filter.category && filter.category.length > 0) {
      results = results.filter(m => filter.category!.includes(m.category));
    }
    
    if (filter.priceRange) {
      results = results.filter(m => {
        const minPrice = Math.min(...m.vendors.flatMap(v => v.pricing.map(p => p.unitPrice)));
        return minPrice >= filter.priceRange!.min && minPrice <= filter.priceRange!.max;
      });
    }
    
    if (filter.availability === 'in-stock') {
      results = results.filter(m => 
        m.vendors.some(v => v.availability.inStock && v.availability.quantity > 0)
      );
    }
    
    if (filter.properties) {
      results = results.filter(m => {
        return Object.entries(filter.properties!).every(([key, value]) => 
          m.properties[key as keyof typeof m.properties] === value
        );
      });
    }
    
    if (filter.certifications && filter.certifications.length > 0) {
      results = results.filter(m => 
        filter.certifications!.every(cert => m.certifications.includes(cert))
      );
    }
    
    if (filter.vendorIds && filter.vendorIds.length > 0) {
      results = results.filter(m => 
        m.vendors.some(v => filter.vendorIds!.includes(v.vendorId))
      );
    }
    
    return results;
  }
  
  /**
   * Get alternatives for a material
   */
  public getAlternatives(materialId: string): MaterialSpec[] {
    const material = this.materials.get(materialId);
    if (!material) return [];
    
    return material.alternatives
      .map(altId => this.materials.get(altId))
      .filter(Boolean) as MaterialSpec[];
  }
  
  /**
   * Compare multiple materials
   */
  public compareMaterials(materialIds: string[]): MaterialComparison | null {
    const materials = materialIds
      .map(id => this.materials.get(id))
      .filter(Boolean) as MaterialSpec[];
    
    if (materials.length < 2) return null;
    
    const metrics: MaterialComparison['comparisonMetrics'] = [];
    
    // Price comparison
    const prices = materials.map(m => 
      Math.min(...m.vendors.flatMap(v => v.pricing.map(p => p.unitPrice)))
    );
    metrics.push({
      metric: 'Price',
      values: prices,
      unit: 'USD',
      bestIndex: prices.indexOf(Math.min(...prices))
    });
    
    // Lead time comparison
    const leadTimes = materials.map(m => 
      Math.min(...m.vendors.map(v => v.availability.leadTimeDays))
    );
    metrics.push({
      metric: 'Lead Time',
      values: leadTimes,
      unit: 'days',
      bestIndex: leadTimes.indexOf(Math.min(...leadTimes))
    });
    
    // Strength comparison
    const strengths = materials.map(m => m.properties.strength || 0);
    if (strengths.some(s => s > 0)) {
      metrics.push({
        metric: 'Strength',
        values: strengths,
        unit: 'PSI',
        bestIndex: strengths.indexOf(Math.max(...strengths))
      });
    }
    
    // Environmental impact
    const carbonFootprints = materials.map(m => m.environmentalImpact.carbonFootprint);
    metrics.push({
      metric: 'Carbon Footprint',
      values: carbonFootprints,
      unit: 'kg CO2',
      bestIndex: carbonFootprints.indexOf(Math.min(...carbonFootprints))
    });
    
    // Determine recommendations
    const bestOverall = materials[metrics.filter(m => m.metric !== 'Carbon Footprint')
      .map(m => m.bestIndex)
      .reduce((acc, idx) => {
        acc[idx] = (acc[idx] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
      [0]].id;
    
    const bestValue = materials[prices.indexOf(Math.min(...prices))].id;
    const mostSustainable = materials[carbonFootprints.indexOf(Math.min(...carbonFootprints))].id;
    const fastestAvailable = materials[leadTimes.indexOf(Math.min(...leadTimes))].id;
    
    return {
      materials,
      comparisonMetrics: metrics,
      recommendation: {
        bestOverall,
        bestValue,
        mostSustainable,
        fastestAvailable
      }
    };
  }
  
  /**
   * Update material pricing
   */
  public updatePricing(materialId: string, vendorId: string, newPricing: PricingTier[]): boolean {
    const material = this.materials.get(materialId);
    if (!material) return false;
    
    const vendor = material.vendors.find(v => v.vendorId === vendorId);
    if (!vendor) return false;
    
    vendor.pricing = newPricing;
    vendor.lastUpdated = new Date();
    
    // Notify listeners
    const avgPrice = newPricing[0].unitPrice;
    this.priceUpdateListeners.forEach(listener => listener(materialId, avgPrice));
    
    return true;
  }
  
  /**
   * Subscribe to price updates
   */
  public subscribeToPriceUpdates(callback: (materialId: string, newPrice: number) => void): () => void {
    this.priceUpdateListeners.add(callback);
    return () => this.priceUpdateListeners.delete(callback);
  }
  
  /**
   * Calculate material requirements
   */
  public calculateMaterialRequirements(
    materialId: string,
    quantity: number,
    vendorId?: string
  ): {
    totalCost: number;
    vendor: VendorInfo;
    pricePerUnit: number;
    discount: number;
    leadTime: number;
  } | null {
    const material = this.materials.get(materialId);
    if (!material) return null;
    
    // Find best vendor if not specified
    let selectedVendor: VendorInfo;
    if (vendorId) {
      const vendor = material.vendors.find(v => v.vendorId === vendorId);
      if (!vendor) return null;
      selectedVendor = vendor;
    } else {
      // Select vendor with best price for quantity
      selectedVendor = material.vendors.reduce((best, current) => {
        const bestPrice = this.getPriceForQuantity(best.pricing, quantity);
        const currentPrice = this.getPriceForQuantity(current.pricing, quantity);
        return currentPrice < bestPrice ? current : best;
      });
    }
    
    const pricing = this.getPricingTierForQuantity(selectedVendor.pricing, quantity);
    if (!pricing) return null;
    
    const totalCost = quantity * pricing.unitPrice;
    const discount = pricing.bulkDiscount || 0;
    
    return {
      totalCost,
      vendor: selectedVendor,
      pricePerUnit: pricing.unitPrice,
      discount,
      leadTime: selectedVendor.availability.leadTimeDays
    };
  }
  
  /**
   * Get price for quantity
   */
  private getPriceForQuantity(pricing: PricingTier[], quantity: number): number {
    const tier = this.getPricingTierForQuantity(pricing, quantity);
    return tier ? tier.unitPrice : Infinity;
  }
  
  /**
   * Get pricing tier for quantity
   */
  private getPricingTierForQuantity(pricing: PricingTier[], quantity: number): PricingTier | null {
    return pricing.find(p => quantity >= p.minQuantity && quantity <= p.maxQuantity) || null;
  }
}

interface VendorDetails {
  id: string;
  name: string;
  type: 'wholesale' | 'retail' | 'industrial';
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  rating: number;
  deliveryOptions: string[];
  paymentTerms: string;
  minimumOrder: number;
  locations: string[];
}

// Singleton instance
export const materialLibrary = new MaterialLibrary();