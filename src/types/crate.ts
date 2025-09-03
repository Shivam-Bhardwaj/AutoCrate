export interface CrateDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'mm' | 'inch';
}

export interface ShippingBase {
  type: 'standard' | 'heavy-duty' | 'export';
  floorboardThickness: number;
  skidHeight: number;
  skidWidth: number;
  skidCount: number;
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

export interface CrateConfiguration {
  projectName: string;
  dimensions: CrateDimensions;
  base: ShippingBase;
  cap: CrateCap;
  fasteners: Fasteners;
  vinyl: VinylConfig;
  weight: {
    product: number;
    maxGross: number;
  };
  specialRequirements: string[];
}

export interface NXExpression {
  variables: Record<string, number | string>;
  features: string[];
  constraints: string[];
  code: string;
}
