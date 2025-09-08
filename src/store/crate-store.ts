import { create } from 'zustand';
import {
  CrateConfiguration,
  CrateDimensions,
  ShippingBase,
  CrateCap,
  Fasteners,
  PanelConfig,
  VinylConfig,
  AMATCompliance,
} from '@/types/crate';
import { calculateSkidConfiguration } from '@/utils/skid-calculations';
import { calculateEnhancedCrateWeight, WeightBreakdown } from '@/services/weightCalculations';

interface CrateStore {
  configuration: CrateConfiguration;
  weightBreakdown: WeightBreakdown;
  updateDimensions: (dimensions: Partial<CrateDimensions>) => void;
  updateBase: (base: Partial<ShippingBase>) => void;
  updatePanel: (panelKey: keyof CrateCap, panel: Partial<PanelConfig>) => void;
  updateVinyl: (vinyl: Partial<VinylConfig>) => void;
  updateFasteners: (fasteners: Partial<Fasteners>) => void;
  updateWeight: (weight: Partial<CrateConfiguration['weight']>) => void;
  updateAMATCompliance: (compliance: Partial<AMATCompliance>) => void;
  updateProjectName: (name: string) => void;
  updateCenterOfGravity: (cog: Partial<NonNullable<CrateConfiguration['centerOfGravity']>>) => void;
  updateHeaderRailConfig: (
    config: Partial<NonNullable<CrateConfiguration['headerRailConfig']>>
  ) => void;
  resetConfiguration: () => void;
  recalculateWeights: () => void;
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
  1000 // Default estimated gross weight based on product weight
);

const initialDimensions = { length: 48, width: 40, height: 40 };
const initialProductWeight = 500;

const defaultConfiguration: CrateConfiguration = {
  projectName: 'New Crate Project',
  dimensions: initialDimensions,
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
  weight: {
    product: initialProductWeight,
  },
  specialRequirements: [],
  vinyl: {
    enabled: false,
    type: 'waterproof',
    thickness: 0.0625,
    coverage: 'full',
  },
};

// Calculate initial weight breakdown
const initialWeightBreakdown = calculateEnhancedCrateWeight(defaultConfiguration);

export const useCrateStore = create<CrateStore>((set, get) => ({
  configuration: defaultConfiguration,
  weightBreakdown: initialWeightBreakdown,

  recalculateWeights: () => {
    const { configuration } = get();
    const weightBreakdown = calculateEnhancedCrateWeight(configuration);
    set({ weightBreakdown });
  },

  updateDimensions: (dimensions) =>
    set((state) => {
      const newDimensions = { ...state.configuration.dimensions, ...dimensions };
      // Estimate gross weight as product weight + crate materials (roughly 20% additional)
      const estimatedGrossWeight = state.configuration.weight.product * 1.2;
      const skidConfig = calculateSkidConfiguration(newDimensions, estimatedGrossWeight);

      // Recalculate enhanced weight breakdown
      const newConfiguration = {
        ...state.configuration,
        dimensions: newDimensions,
        base: {
          ...state.configuration.base,
          skidCount: skidConfig.count,
          skidSpacing: skidConfig.spacing,
          requiresRubStrips: skidConfig.requiresRubStrips,
        },
      };

      const weightBreakdown = calculateEnhancedCrateWeight(newConfiguration);

      return {
        configuration: newConfiguration,
        weightBreakdown,
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

      // Intentionally excluding skid-related fields from updates
      // These are calculated automatically based on weight

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

  updateWeight: (weight) =>
    set((state) => {
      const newWeight = { ...state.configuration.weight, ...weight };
      // Estimate gross weight as product weight + crate materials (roughly 20% additional)
      const estimatedGrossWeight = newWeight.product * 1.2;
      const skidConfig = calculateSkidConfiguration(
        state.configuration.dimensions,
        estimatedGrossWeight
      );

      const newConfiguration = {
        ...state.configuration,
        weight: newWeight,
        base: {
          ...state.configuration.base,
          skidCount: skidConfig.count,
          skidSpacing: skidConfig.spacing,
          requiresRubStrips: skidConfig.requiresRubStrips,
        },
      };

      // Recalculate enhanced weight breakdown
      const weightBreakdown = calculateEnhancedCrateWeight(newConfiguration);

      return {
        configuration: newConfiguration,
        weightBreakdown,
      };
    }),

  updateProjectName: (projectName) =>
    set((state) => ({
      configuration: {
        ...state.configuration,
        projectName,
      },
    })),

  updateVinyl: (vinyl) =>
    set((state) => ({
      configuration: {
        ...state.configuration,
        vinyl: state.configuration.vinyl
          ? { ...state.configuration.vinyl, ...vinyl }
          : ({ ...vinyl } as VinylConfig),
      },
    })),

  updateAMATCompliance: (compliance) =>
    set((state) => ({
      configuration: {
        ...state.configuration,
        amatCompliance: state.configuration.amatCompliance
          ? { ...state.configuration.amatCompliance, ...compliance }
          : ({ ...compliance } as AMATCompliance),
      },
    })),

  updateCenterOfGravity: (cog) =>
    set((state) => ({
      configuration: {
        ...state.configuration,
        centerOfGravity: state.configuration.centerOfGravity
          ? { ...state.configuration.centerOfGravity, ...cog }
          : ({ ...cog } as NonNullable<CrateConfiguration['centerOfGravity']>),
      },
    })),

  updateHeaderRailConfig: (config) =>
    set((state) => ({
      configuration: {
        ...state.configuration,
        headerRailConfig: state.configuration.headerRailConfig
          ? { ...state.configuration.headerRailConfig, ...config }
          : ({ ...config } as NonNullable<CrateConfiguration['headerRailConfig']>),
      },
    })),

  resetConfiguration: () =>
    set(() => ({
      configuration: defaultConfiguration,
    })),
}));
