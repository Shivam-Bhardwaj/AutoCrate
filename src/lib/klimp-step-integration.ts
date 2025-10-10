// Klimp STEP File Integration
// Manages the actual Crate Spring Clamp geometry from STEP file

export interface KlimpInstance {
  id: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number } // Euler angles in degrees
  edge: 'top' | 'left' | 'right'
  active: boolean // Whether this instance is used
}

export interface KlimpGeometry {
  longerSideLength: number  // Length of the longer leg
  shorterSideLength: number // Length of the shorter leg
  thickness: number         // Material thickness
  width: number            // Width of the klimp
}

export class KlimpSTEPIntegration {
  private static readonly MAX_KLIMP_COUNT = 20
  private static readonly KLIMP_STEP_PATH = '/CAD FILES/Klimp 4.stp'

  // Klimp physical dimensions (in inches, from STEP analysis)
  private static readonly KLIMP_GEOMETRY: KlimpGeometry = {
    longerSideLength: 4.0,   // Longer leg 4"
    shorterSideLength: 3.0,  // Shorter leg 3"
    thickness: 0.125,        // Material thickness ~1/8"
    width: 1.0               // Width ~1"
  }

  /**
   * Generate klimp instances for NX CAD with proper orientation
   * @param klimps Array of calculated klimp positions
   * @returns Array of all 20 klimp instances (active and suppressed)
   */
  static generateKlimpInstances(klimps: Array<{
    id: string
    edge: 'top' | 'left' | 'right'
    position: number
    x: number
    y: number
    z: number
  }>): KlimpInstance[] {
    const instances: KlimpInstance[] = []

    // Process active klimps
    for (let i = 0; i < Math.min(klimps.length, this.MAX_KLIMP_COUNT); i++) {
      const klimp = klimps[i]
      instances.push(this.createKlimpInstance(klimp, i, true))
    }

    // Fill remaining with suppressed instances
    for (let i = klimps.length; i < this.MAX_KLIMP_COUNT; i++) {
      instances.push({
        id: `KLIMP_INSTANCE_${i + 1}`,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        edge: 'top',
        active: false
      })
    }

    return instances
  }

  /**
   * Create a single klimp instance with proper orientation
   */
  private static createKlimpInstance(
    klimp: { id: string; edge: 'top' | 'left' | 'right'; x: number; y: number; z: number },
    index: number,
    active: boolean
  ): KlimpInstance {
    let rotation = { x: 0, y: 0, z: 0 }
    let position = { x: klimp.x, y: klimp.y, z: klimp.z }

    // Adjust position and rotation based on edge
    switch (klimp.edge) {
      case 'top':
        // Top edge: longer side vertical (Z), shorter horizontal (Y)
        // Base orientation - no rotation needed
        // Position adjustment: shorter leg extends inward (positive Y)
        position.y = 0 // Will be set based on panel thickness
        break

      case 'left':
        // Left edge: rotate 90° around X-axis
        // Longer side horizontal (Y), shorter vertical (Z)
        rotation.z = 90 // Rotate around Z to orient on left edge
        rotation.y = 90 // Rotate to point inward
        // Position adjustment for left panel
        position.y = 0 // Will be set based on panel position
        break

      case 'right':
        // Right edge: rotate -90° around X-axis
        // Longer side horizontal (Y), shorter vertical (Z)
        rotation.z = -90 // Rotate around Z to orient on right edge
        rotation.y = -90 // Rotate to point inward
        // Position adjustment for right panel
        position.y = 0 // Will be set based on panel position
        break
    }

    return {
      id: `KLIMP_INSTANCE_${index + 1}`,
      position,
      rotation,
      edge: klimp.edge,
      active
    }
  }

  /**
   * Get the path to the klimp STEP file
   * In NX, this would be imported as a component
   */
  static getKlimpSTEPPath(): string {
    return this.KLIMP_STEP_PATH
  }

  /**
   * Generate STEP assembly references for klimps
   * This creates STEP entities that reference the klimp geometry at different positions
   */
  static generateSTEPReferences(instances: KlimpInstance[]): string[] {
    const references: string[] = []

    for (const instance of instances) {
      if (!instance.active) continue

      // Generate transformation matrix for this instance
      const transform = this.generateTransformationMatrix(
        instance.position,
        instance.rotation
      )

      // Create STEP reference (simplified - actual implementation would be more complex)
      references.push(`
#${1000 + parseInt(instance.id.split('_').pop()!)} = NEXT_ASSEMBLY_USAGE_OCCURRENCE('${instance.id}','','',#KLIMP_PRODUCT,#ASSEMBLY,'');
#${2000 + parseInt(instance.id.split('_').pop()!)} = PRODUCT_DEFINITION_SHAPE('','',#${1000 + parseInt(instance.id.split('_').pop()!)});
#${3000 + parseInt(instance.id.split('_').pop()!)} = ITEM_DEFINED_TRANSFORMATION('','',${transform});
      `.trim())
    }

    return references
  }

  /**
   * Generate transformation matrix for STEP
   */
  private static generateTransformationMatrix(
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number }
  ): string {
    // Convert rotation to radians
    const rx = rotation.x * Math.PI / 180
    const ry = rotation.y * Math.PI / 180
    const rz = rotation.z * Math.PI / 180

    // Calculate rotation matrix components
    const cx = Math.cos(rx), sx = Math.sin(rx)
    const cy = Math.cos(ry), sy = Math.sin(ry)
    const cz = Math.cos(rz), sz = Math.sin(rz)

    // Combined rotation matrix
    const m11 = cy * cz
    const m12 = -cy * sz
    const m13 = sy
    const m21 = sx * sy * cz + cx * sz
    const m22 = -sx * sy * sz + cx * cz
    const m23 = -sx * cy
    const m31 = -cx * sy * cz + sx * sz
    const m32 = cx * sy * sz + sx * cz
    const m33 = cx * cy

    // Return as STEP transformation
    return `#AXIS2_PLACEMENT_3D('',#CARTESIAN_POINT('',(${position.x},${position.y},${position.z})),#DIRECTION('',(${m13},${m23},${m33})),#DIRECTION('',(${m11},${m21},${m31})))`
  }

  /**
   * Get klimp geometry for calculations
   */
  static getKlimpGeometry(): KlimpGeometry {
    return this.KLIMP_GEOMETRY
  }

  /**
   * Get maximum klimp count
   */
  static getMaxKlimpCount(): number {
    return this.MAX_KLIMP_COUNT
  }

  /**
   * Generate NX import instructions for the klimp
   */
  static generateNXImportInstructions(): string {
    return `
# KLIMP IMPORT INSTRUCTIONS:
# 1. Import the Klimp 4 STEP file as a component:
#    File -> Import -> STEP214 -> "${this.KLIMP_STEP_PATH}"
# 2. Name the component "KLIMP_BASE"
# 3. Create an array of this component using the instance parameters
# 4. For each active instance:
#    - Position at (POS_X, POS_Y, POS_Z)
#    - Rotate by (ROT_X, ROT_Y, ROT_Z) degrees
# 5. Suppress instances where ACTIVE=FALSE
#
# Note: The klimp has asymmetric geometry:
# - Height: ${this.KLIMP_GEOMETRY.longerSideLength}" (4 inches) - vertical dimension
# - Depth: ${this.KLIMP_GEOMETRY.shorterSideLength}" (3 inches) - horizontal reach
# - Origin: At bottom of SHORT (3") side
# - Function: Bridges corners between perpendicular panels
# - Top klimps: Connect front panel to top panel
# - Side klimps: Connect front panel to side panels
    `.trim()
  }
}