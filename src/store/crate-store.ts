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
import { calculateSkidConfiguration } from '@/utils/skid-calculations';

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
  thickness: 0.75,
  material: 'plywood',
  reinforcement: false,
  ventilation: {
    enabled: false,
    type: 'holes',
    count: 4,
    size: 2,
  },
};

// Calculate initial skid configuration
const initialSkidConfig = calculateSkidConfiguration(
  { length: 48, width: 40, height: 40 },
  1000 // Default max gross weight
);

const defaultConfiguration: CrateConfiguration = {
  projectName: 'New Crate Project',
  dimensions: {
    length: 48,
    width: 40,
    height: 40,
  },
  base: {
    type: 'standard',
    floorboardThickness: 0.75,
    skidHeight: initialSkidConfig.dimensions.height,
    skidWidth: initialSkidConfig.dimensions.width,
    skidCount: initialSkidConfig.count,
    skidSpacing: initialSkidConfig.spacing,
    requiresRubStrips: initialSkidConfig.requiresRubStrips,
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
    size: '1/8 inch',
    spacing: 6,
    material: 'steel',
  },
  vinyl: {
    enabled: false,
    type: 'waterproof',
    thickness: 0.008,
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
    set((state) => {
      const newDimensions = { ...state.configuration.dimensions, ...dimensions };
      const skidConfig = calculateSkidConfiguration(
        newDimensions,
        state.configuration.weight.maxGross
      );
      return {
        configuration: {
          ...state.configuration,
          dimensions: newDimensions,
          base: {
            ...state.configuration.base,
            skidHeight: skidConfig.dimensions.height,
            skidWidth: skidConfig.dimensions.width,
            skidCount: skidConfig.count,
            skidSpacing: skidConfig.spacing,
            requiresRubStrips: skidConfig.requiresRubStrips,
          },
        },
      };
    }),

  updateBase: (base) =>
    set((state) => {
      // Don't allow manual override of calculated skid values
      const {
        skidHeight: _skidHeight,
        skidWidth: _skidWidth,
        skidCount: _skidCount,
        skidSpacing: _skidSpacing,
        requiresRubStrips: _requiresRubStrips,
        ...allowedUpdates
      } = base;
      return {
        configuration: {
          ...state.configuration,
          base: { ...state.configuration.base, ...allowedUpdates },
        },
      };
    }),

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
    set((state) => {
      const newWeight = { ...state.configuration.weight, ...weight };
      const skidConfig = calculateSkidConfiguration(
        state.configuration.dimensions,
        newWeight.maxGross
      );
      return {
        configuration: {
          ...state.configuration,
          weight: newWeight,
          base: {
            ...state.configuration.base,
            skidHeight: skidConfig.dimensions.height,
            skidWidth: skidConfig.dimensions.width,
            skidCount: skidConfig.count,
            skidSpacing: skidConfig.spacing,
            requiresRubStrips: skidConfig.requiresRubStrips,
          },
        },
      };
    }),

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
