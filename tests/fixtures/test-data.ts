import { CrateConfiguration } from '../../src/types/crate';

/**
 * Test data fixtures for AutoCrate testing
 */

export const testConfigurations: Record<string, CrateConfiguration> = {
  basic: {
    product: {
      length: 100,
      width: 80,
      height: 60,
      weight: 500,
      description: 'Basic Test Product'
    },
    materials: {
      plywood: {
        thickness: 0.75,
        grade: 'Marine',
        supplier: 'Test Supplier'
      },
      hardwood: {
        thickness: 1.0,
        grade: 'Oak',
        supplier: 'Test Supplier'
      },
      steel: {
        thickness: 0.125,
        grade: 'Galvanized',
        supplier: 'Test Supplier'
      }
    },
    hardware: {
      screws: {
        type: 'Wood Screws',
        size: '#8 x 1.5"',
        quantity: 24
      },
      handles: {
        type: 'Lifting Handles',
        size: 'Heavy Duty',
        quantity: 4
      }
    },
    clearance: {
      sides: 2,
      top: 3,
      bottom: 1
    }
  },

  large: {
    product: {
      length: 200,
      width: 150,
      height: 100,
      weight: 2000,
      description: 'Large Test Product'
    },
    materials: {
      plywood: {
        thickness: 1.0,
        grade: 'Marine',
        supplier: 'Test Supplier'
      },
      hardwood: {
        thickness: 1.5,
        grade: 'Oak',
        supplier: 'Test Supplier'
      },
      steel: {
        thickness: 0.25,
        grade: 'Galvanized',
        supplier: 'Test Supplier'
      }
    },
    hardware: {
      screws: {
        type: 'Wood Screws',
        size: '#10 x 2"',
        quantity: 48
      },
      handles: {
        type: 'Lifting Handles',
        size: 'Heavy Duty',
        quantity: 6
      }
    },
    clearance: {
      sides: 3,
      top: 4,
      bottom: 2
    }
  },

  heavy: {
    product: {
      length: 150,
      width: 120,
      height: 80,
      weight: 5000,
      description: 'Heavy Test Product'
    },
    materials: {
      plywood: {
        thickness: 1.25,
        grade: 'Marine',
        supplier: 'Test Supplier'
      },
      hardwood: {
        thickness: 2.0,
        grade: 'Oak',
        supplier: 'Test Supplier'
      },
      steel: {
        thickness: 0.375,
        grade: 'Galvanized',
        supplier: 'Test Supplier'
      }
    },
    hardware: {
      screws: {
        type: 'Wood Screws',
        size: '#12 x 2.5"',
        quantity: 72
      },
      handles: {
        type: 'Lifting Handles',
        size: 'Heavy Duty',
        quantity: 8
      }
    },
    clearance: {
      sides: 4,
      top: 5,
      bottom: 3
    }
  },

  minimal: {
    product: {
      length: 50,
      width: 40,
      height: 30,
      weight: 100,
      description: 'Minimal Test Product'
    },
    materials: {
      plywood: {
        thickness: 0.5,
        grade: 'Standard',
        supplier: 'Test Supplier'
      },
      hardwood: {
        thickness: 0.75,
        grade: 'Pine',
        supplier: 'Test Supplier'
      },
      steel: {
        thickness: 0.0625,
        grade: 'Standard',
        supplier: 'Test Supplier'
      }
    },
    hardware: {
      screws: {
        type: 'Wood Screws',
        size: '#6 x 1"',
        quantity: 12
      },
      handles: {
        type: 'Lifting Handles',
        size: 'Standard',
        quantity: 2
      }
    },
    clearance: {
      sides: 1,
      top: 2,
      bottom: 0.5
    }
  }
};

export const invalidConfigurations = {
  negativeDimensions: {
    product: {
      length: -10,
      width: 80,
      height: 60,
      weight: 500,
      description: 'Invalid Product'
    }
  },
  zeroDimensions: {
    product: {
      length: 0,
      width: 80,
      height: 60,
      weight: 500,
      description: 'Invalid Product'
    }
  },
  excessiveWeight: {
    product: {
      length: 100,
      width: 80,
      height: 60,
      weight: 50000,
      description: 'Invalid Product'
    }
  },
  missingRequired: {
    product: {
      length: 100,
      width: 80,
      // height missing
      weight: 500,
      description: 'Invalid Product'
    }
  }
};

export const exportOptions = {
  default: {
    includePMI: true,
    includeMaterials: true,
    includeHardware: true
  },
  minimal: {
    includePMI: false,
    includeMaterials: false,
    includeHardware: false
  },
  pmiOnly: {
    includePMI: true,
    includeMaterials: false,
    includeHardware: false
  },
  materialsOnly: {
    includePMI: false,
    includeMaterials: true,
    includeHardware: false
  },
  hardwareOnly: {
    includePMI: false,
    includeMaterials: false,
    includeHardware: true
  }
};

export const viewportSizes = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  largeDesktop: { width: 2560, height: 1440 }
};

export const performanceThresholds = {
  loadTime: 3000, // 3 seconds
  firstPaint: 1500, // 1.5 seconds
  firstContentfulPaint: 2000, // 2 seconds
  domContentLoaded: 1000 // 1 second
};

