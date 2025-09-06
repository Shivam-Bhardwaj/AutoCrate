import { MaterialSpecificationSet, MaterialValidation } from './material-specifications';

export interface CrateDimensions {
  length: number;
  width: number;
  height: number;
}

export interface ShippingBase {
  type: 'standard' | 'heavy-duty' | 'export';
  floorboardThickness: number;
  skidHeight: number;
  skidWidth: number;
  skidCount: number;
  skidSpacing: number; // Center-to-center spacing
  requiresRubStrips: boolean;
  material: 'pine' | 'oak' | 'plywood' | 'osb';
}

export interface CrateCap {
  topPanel: PanelConfig;
  frontPanel: PanelConfig;
  backPanel: PanelConfig;
  leftPanel: PanelConfig;
  rightPanel: PanelConfig;
}

export interface PanelConfig {
  thickness: number;
  material: 'plywood' | 'osb' | 'solid-wood';
  reinforcement: boolean;
  ventilation: VentilationConfig;
}

export interface VentilationConfig {
  enabled: boolean;
  type: 'slots' | 'holes' | 'mesh';
  count: number;
  size: number;
}

export interface Fasteners {
  type: 'klimp' | 'nails' | 'screws' | 'bolts';
  size: string;
  spacing: number;
  material: 'steel' | 'stainless' | 'galvanized';
}

export interface VinylConfig {
  enabled: boolean;
  type: 'waterproof' | 'vapor-barrier' | 'cushion';
  thickness: number;
  coverage: 'full' | 'partial';
}

export interface AMATCompliance {
  style: 'A' | 'B' | 'C' | 'D';
  isInternational: boolean;
  requiresMoistureBag: boolean;
  requiresShockIndicator: boolean;
  requiresTiltIndicator: boolean;
  foamDensity?: number;
  desiccantUnits?: number;
  // MBB-specific configurations
  moistureSensitivityLevel?: 'MSL1' | 'MSL2' | 'MSL3' | 'MSL4' | 'MSL5' | 'MSL6';
  isESDSensitive?: boolean;
  mbbConfiguration?: {
    enabled: boolean;
    bagType: 'static-shielding' | 'moisture-barrier' | 'combination';
    sealType: 'heat-seal' | 'zipper' | 'fold-over';
    thickness: number; // in mils
    materialType: 'polyethylene' | 'polyester' | 'aluminum-foil-laminate';
    sealIntegrityTest: boolean;
  };
  desiccantConfiguration?: {
    type: 'silica-gel' | 'clay' | 'molecular-sieve' | 'calcium-oxide';
    quantity: number; // in grams
    packaging: 'sachet' | 'canister' | 'strip';
    placement: 'inside-bag' | 'outside-bag' | 'both';
  };
  humidityIndicator?: {
    type: '10%' | '20%' | '30%' | '40%' | '50%' | '60%';
    quantity: number;
    placement: 'inside-bag' | 'outside-bag' | 'on-product';
    reversible: boolean;
  };
  comprehensiveMaterials?: MaterialSpecificationSet;
  materialValidation?: MaterialValidation;
}

export interface AirShipmentConfig {
  enabled: boolean;
  chamfer: {
    enabled: boolean;
    angle: number; // degrees (typically 15-45)
    depth: number; // inches
  };
  costPerPound: number; // USD per pound for air freight
  dimensionalWeightFactor: number; // typically 166 for air freight (lbs per cubic foot)
}

export interface CrateConfiguration {
  projectName: string;
  dimensions: CrateDimensions;
  base: ShippingBase;
  cap: CrateCap;
  fasteners: Fasteners;
  vinyl?: VinylConfig;
  weight: {
    product: number;
  };
  specialRequirements: string[];
  amatCompliance?: AMATCompliance;
  airShipment?: AirShipmentConfig;
  centerOfGravity?: {
    productCoG: { x: number; y: number; z: number };
    combinedCoG?: { x: number; y: number; z: number };
  };
  headerRailConfig?: import('./amat-specifications').HeaderRailConfiguration;
}

export interface NXExpression {
  variables: Record<string, number | string>;
  features: string[];
  constraints: string[];
  code: string;
}

export interface Block {
  position: [number, number, number];
  dimensions: [number, number, number];
}
