// Lag Screw STEP Integration
// Provides consistent metadata for the 3/8" x 3.00" lag hardware

export interface LagScrewGeometry {
  shankDiameter: number
  headDiameter: number
  headHeight: number
  shankLength: number
}

export class LagSTEPIntegration {
  private static readonly STEP_PATH = '/CAD FILES/LAG SCREW_0.38 X 3.00.stp'

  // Approximated dimensions pulled from vendor CAD for 3/8" x 3.00" lag hardware
  private static readonly GEOMETRY: LagScrewGeometry = {
    shankDiameter: 0.38,
    headDiameter: 0.75,
    headHeight: 0.25,
    shankLength: 3.0
  }

  static getStepPath(): string {
    return this.STEP_PATH
  }

  static getGeometry(): LagScrewGeometry {
    return this.GEOMETRY
  }

  static generateNXImportInstructions(): string {
    return `
# LAG SCREW IMPORT INSTRUCTIONS:
# - File -> Import -> STEP214 -> "${this.STEP_PATH}"
# - Reuse this component for every lag screw instance positioned by the generator
# - Align the shank so the default component axis matches the metadata tag (left panels: +X, right panels: -X, front panel: +Y, back panel: -Y) before placement
# - If the 3.00" STEP is not yet in the CAD FILES directory, duplicate the supplier model and extend the shank before importing
    `.trim()
  }
}

