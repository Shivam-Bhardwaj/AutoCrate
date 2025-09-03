import { create } from 'zustand';
import {
  CrateConfiguration,
  CrateDimensions,
  ShippingBase,
  CrateCap,
  Fasteners,
  VinylConfig,
  PanelConfig,
} from '@/types/crate';

interface CrateStore {
  configuration: CrateConfiguration;
  updateDimensions: (dimensions: Partial<CrateDimensions>) => void;
  updateBase: (base: Partial<ShippingBase>) => void;
  updatePanel: (panelKey: keyof CrateCap, panel: Partial<PanelConfig>) => void;
  updateFasteners: (fasteners: Partial<Fasteners>) => void;
  updateVinyl: (vinyl: Partial<VinylConfig>) => void;
  updateWeight: (weight: Partial<CrateConfiguration['weight']>) => void;
  updateProjectName: (name: string) => void;
  resetConfiguration: () => void;
}

const defaultPanelConfig: PanelConfig = {
  thickness: 18,
  material: 'plywood',
  reinforcement: false,
  ventilation: {
    enabled: false,
    type: 'holes',
    count: 4,
    size: 50,
  },
};

const defaultConfiguration: CrateConfiguration = {
  projectName: 'New Crate Project',
  dimensions: {
    length: 1200,
    width: 1000,
    height: 1000,
    unit: 'mm',
  },
  base: {
    type: 'standard',
    floorboardThickness: 18,
    skidHeight: 100,
    skidWidth: 100,
    skidCount: 3,
    material: 'pine',
  },
  cap: {
    topPanel: { ...defaultPanelConfig },
    frontPanel: { ...defaultPanelConfig },
    backPanel: { ...defaultPanelConfig },
    leftPanel: { ...defaultPanelConfig },
    rightPanel: { ...defaultPanelConfig },
  },
  fasteners: {
    type: 'nails',
    size: '3.5mm',
    spacing: 150,
    material: 'steel',
  },
  vinyl: {
    enabled: false,
    type: 'waterproof',
    thickness: 0.2,
    coverage: 'full',
  },
  weight: {
    product: 500,
    maxGross: 1000,
  },
  specialRequirements: [],
};

export const useCrateStore = create<CrateStore>((set) => ({
  configuration: defaultConfiguration,

  updateDimensions: (dimensions) =>
    set((state) => ({
      configuration: {
        ...state.configuration,
        dimensions: { ...state.configuration.dimensions, ...dimensions },
      },
    })),

  updateBase: (base) =>
    set((state) => ({
      configuration: {
        ...state.configuration,
        base: { ...state.configuration.base, ...base },
      },
    })),

  updatePanel: (panelKey, panel) =>
    set((state) => ({
      configuration: {
        ...state.configuration,
        cap: {
          ...state.configuration.cap,
          [panelKey]: { ...state.configuration.cap[panelKey], ...panel },
        },
      },
    })),

  updateFasteners: (fasteners) =>
    set((state) => ({
      configuration: {
        ...state.configuration,
        fasteners: { ...state.configuration.fasteners, ...fasteners },
      },
    })),

  updateVinyl: (vinyl) =>
    set((state) => ({
      configuration: {
        ...state.configuration,
        vinyl: { ...state.configuration.vinyl, ...vinyl },
      },
    })),

  updateWeight: (weight) =>
    set((state) => ({
      configuration: {
        ...state.configuration,
        weight: { ...state.configuration.weight, ...weight },
      },
    })),

  updateProjectName: (projectName) =>
    set((state) => ({
      configuration: {
        ...state.configuration,
        projectName,
      },
    })),

  resetConfiguration: () =>
    set(() => ({
      configuration: defaultConfiguration,
    })),
}));
