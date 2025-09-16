import { CrateConfiguration } from '@/types/crate'
import { calculateCrateDimensions, calculateSkidRequirements, calculatePanelRequirements, calculateHardwareRequirements } from '@/lib/domain/calculations'

export interface NXExpressionFile {
  metadata: {
    generatedAt: string
    version: string
    templateVersion: string
    standardsCompliance: string
    validationChecksum: string
  }
  productSpecs: {
    product_length_in: number
    product_width_in: number
    product_height_in: number
    product_weight_lb: number
    product_center_of_gravity_x: number
    product_center_of_gravity_y: number
    product_center_of_gravity_z: number
  }
  calculatedDimensions: {
    crate_overall_width_OD_in: number
    crate_overall_length_OD_in: number
    crate_overall_height_OD_in: number
    internal_clearance_width: number
    internal_clearance_length: number
    internal_clearance_height: number
  }
  skidSpecs: {
    skid_lumber_size_callout: string
    skid_actual_height_in: number
    skid_actual_width_in: number
    skid_count: number
    skid_pitch_in: number
    skid_overhang_front_in: number
    skid_overhang_back_in: number
  }
  panelSpecs: {
    bottom_panel_width_in: number
    bottom_panel_length_in: number
    bottom_panel_thickness_in: number
    side_panel_width_in: number
    side_panel_length_in: number
    side_panel_thickness_in: number
    end_panel_width_in: number
    end_panel_length_in: number
    end_panel_thickness_in: number
    top_panel_width_in: number
    top_panel_length_in: number
    top_panel_thickness_in: number
  }
  hardwareSpecs: {
    lag_screw_count: number
    klimp_count: number
    flat_washer_count: number
    cleat_screw_count: number
    fastening_pattern: string
  }
  materialSpecs: {
    lumber_grade: string
    lumber_treatment: string
    plywood_grade: string
    plywood_thickness: number
    hardware_coating: string
  }
}

export class NXExpressionGenerator {
  private calculateChecksum(config: CrateConfiguration): string {
    // Simple checksum for validation
    const configString = JSON.stringify(config)
    let hash = 0
    for (let i = 0; i < configString.length; i++) {
      const char = configString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  private generatePanelSpecifications(config: CrateConfiguration) {
    const panels = calculatePanelRequirements(config)
    
    return {
      bottom_panel_width_in: panels.bottom.width,
      bottom_panel_length_in: panels.bottom.length,
      bottom_panel_thickness_in: panels.bottom.thickness,
      side_panel_width_in: panels.sides.width,
      side_panel_length_in: panels.sides.length,
      side_panel_thickness_in: panels.sides.thickness,
      end_panel_width_in: panels.ends.width,
      end_panel_length_in: panels.ends.length,
      end_panel_thickness_in: panels.ends.thickness,
      top_panel_width_in: panels.top.width,
      top_panel_length_in: panels.top.length,
      top_panel_thickness_in: panels.top.thickness
    }
  }

  private calculateLagScrewCount(config: CrateConfiguration): number {
    const hardware = calculateHardwareRequirements(config)
    return hardware.lagScrews.count
  }

  private calculateKlimpCount(config: CrateConfiguration): number {
    const hardware = calculateHardwareRequirements(config)
    return hardware.klimps.count
  }

  private calculateWasherCount(config: CrateConfiguration): number {
    const hardware = calculateHardwareRequirements(config)
    return hardware.washers.count
  }

  private calculateCleatScrewCount(config: CrateConfiguration): number {
    const hardware = calculateHardwareRequirements(config)
    return hardware.cleatScrews.count
  }

  private determineFasteningPattern(_config: CrateConfiguration): string {
    return '16" OC' // 16 inches on center
  }

  private calculateOverallWidth(config: CrateConfiguration): number {
    const dimensions = calculateCrateDimensions(config)
    return dimensions.overallWidth
  }

  private calculateOverallLength(config: CrateConfiguration): number {
    const dimensions = calculateCrateDimensions(config)
    return dimensions.overallLength
  }

  private calculateOverallHeight(config: CrateConfiguration): number {
    const dimensions = calculateCrateDimensions(config)
    return dimensions.overallHeight
  }

  async generateExpressions(config: CrateConfiguration): Promise<NXExpressionFile> {
    const skidRequirements = calculateSkidRequirements(config)

    const expressions: NXExpressionFile = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        templateVersion: 'AUTOCRATE_TEMPLATE_V2.0.0',
        standardsCompliance: 'AMAT-0251-70054',
        validationChecksum: this.calculateChecksum(config)
      },
      
      // Product specifications
      productSpecs: {
        product_length_in: config.product.length,
        product_width_in: config.product.width,
        product_height_in: config.product.height,
        product_weight_lb: config.product.weight,
        product_center_of_gravity_x: config.product.centerOfGravity.x,
        product_center_of_gravity_y: config.product.centerOfGravity.y,
        product_center_of_gravity_z: config.product.centerOfGravity.z
      },

      // Calculated dimensions with tolerance analysis
      calculatedDimensions: {
        crate_overall_width_OD_in: this.calculateOverallWidth(config),
        crate_overall_length_OD_in: this.calculateOverallLength(config),
        crate_overall_height_OD_in: this.calculateOverallHeight(config),
        internal_clearance_width: config.clearances.width,
        internal_clearance_length: config.clearances.length,
        internal_clearance_height: config.clearances.height
      },

      // Skid specifications with weight-based selection
      skidSpecs: {
        skid_lumber_size_callout: skidRequirements.lumberCallout,
        skid_actual_height_in: skidRequirements.height,
        skid_actual_width_in: skidRequirements.width,
        skid_count: skidRequirements.count,
        skid_pitch_in: skidRequirements.pitch,
        skid_overhang_front_in: config.skids.overhang.front,
        skid_overhang_back_in: config.skids.overhang.back
      },

      // Panel specifications with cleat calculations
      panelSpecs: this.generatePanelSpecifications(config),

      // Hardware specifications with fastening patterns
      hardwareSpecs: {
        lag_screw_count: this.calculateLagScrewCount(config),
        klimp_count: this.calculateKlimpCount(config),
        flat_washer_count: this.calculateWasherCount(config),
        cleat_screw_count: this.calculateCleatScrewCount(config),
        fastening_pattern: this.determineFasteningPattern(config)
      },

      // Material specifications
      materialSpecs: {
        lumber_grade: config.materials.lumber.grade,
        lumber_treatment: config.materials.lumber.treatment,
        plywood_grade: config.materials.plywood.grade,
        plywood_thickness: config.materials.plywood.thickness,
        hardware_coating: config.materials.hardware.coating
      }
    }

    return expressions
  }

  generateExpressionFile(expressions: NXExpressionFile): string {
    const lines: string[] = []
    
    // Header
    lines.push('# AutoCrate Generated NX Expressions')
    lines.push(`# Generated: ${expressions.metadata.generatedAt}`)
    lines.push(`# Version: ${expressions.metadata.version}`)
    lines.push(`# Template: ${expressions.metadata.templateVersion}`)
    lines.push(`# Standards: ${expressions.metadata.standardsCompliance}`)
    lines.push(`# Checksum: ${expressions.metadata.validationChecksum}`)
    lines.push('')
    
    // Product specifications
    lines.push('# Product Specifications')
    lines.push(`product_length_in = ${expressions.productSpecs.product_length_in}`)
    lines.push(`product_width_in = ${expressions.productSpecs.product_width_in}`)
    lines.push(`product_height_in = ${expressions.productSpecs.product_height_in}`)
    lines.push(`product_weight_lb = ${expressions.productSpecs.product_weight_lb}`)
    lines.push(`product_center_of_gravity_x = ${expressions.productSpecs.product_center_of_gravity_x}`)
    lines.push(`product_center_of_gravity_y = ${expressions.productSpecs.product_center_of_gravity_y}`)
    lines.push(`product_center_of_gravity_z = ${expressions.productSpecs.product_center_of_gravity_z}`)
    lines.push('')
    
    // Calculated dimensions
    lines.push('# Calculated Dimensions')
    lines.push(`crate_overall_width_OD_in = ${expressions.calculatedDimensions.crate_overall_width_OD_in}`)
    lines.push(`crate_overall_length_OD_in = ${expressions.calculatedDimensions.crate_overall_length_OD_in}`)
    lines.push(`crate_overall_height_OD_in = ${expressions.calculatedDimensions.crate_overall_height_OD_in}`)
    lines.push(`internal_clearance_width = ${expressions.calculatedDimensions.internal_clearance_width}`)
    lines.push(`internal_clearance_length = ${expressions.calculatedDimensions.internal_clearance_length}`)
    lines.push(`internal_clearance_height = ${expressions.calculatedDimensions.internal_clearance_height}`)
    lines.push('')
    
    // Skid specifications
    lines.push('# Skid Specifications')
    lines.push(`skid_lumber_size_callout = "${expressions.skidSpecs.skid_lumber_size_callout}"`)
    lines.push(`skid_actual_height_in = ${expressions.skidSpecs.skid_actual_height_in}`)
    lines.push(`skid_actual_width_in = ${expressions.skidSpecs.skid_actual_width_in}`)
    lines.push(`skid_count = ${expressions.skidSpecs.skid_count}`)
    lines.push(`skid_pitch_in = ${expressions.skidSpecs.skid_pitch_in}`)
    lines.push(`skid_overhang_front_in = ${expressions.skidSpecs.skid_overhang_front_in}`)
    lines.push(`skid_overhang_back_in = ${expressions.skidSpecs.skid_overhang_back_in}`)
    lines.push('')
    
    // Panel specifications
    lines.push('# Panel Specifications')
    lines.push(`bottom_panel_width_in = ${expressions.panelSpecs.bottom_panel_width_in}`)
    lines.push(`bottom_panel_length_in = ${expressions.panelSpecs.bottom_panel_length_in}`)
    lines.push(`bottom_panel_thickness_in = ${expressions.panelSpecs.bottom_panel_thickness_in}`)
    lines.push(`side_panel_width_in = ${expressions.panelSpecs.side_panel_width_in}`)
    lines.push(`side_panel_length_in = ${expressions.panelSpecs.side_panel_length_in}`)
    lines.push(`side_panel_thickness_in = ${expressions.panelSpecs.side_panel_thickness_in}`)
    lines.push(`end_panel_width_in = ${expressions.panelSpecs.end_panel_width_in}`)
    lines.push(`end_panel_length_in = ${expressions.panelSpecs.end_panel_length_in}`)
    lines.push(`end_panel_thickness_in = ${expressions.panelSpecs.end_panel_thickness_in}`)
    lines.push(`top_panel_width_in = ${expressions.panelSpecs.top_panel_width_in}`)
    lines.push(`top_panel_length_in = ${expressions.panelSpecs.top_panel_length_in}`)
    lines.push(`top_panel_thickness_in = ${expressions.panelSpecs.top_panel_thickness_in}`)
    lines.push('')
    
    // Hardware specifications
    lines.push('# Hardware Specifications')
    lines.push(`lag_screw_count = ${expressions.hardwareSpecs.lag_screw_count}`)
    lines.push(`klimp_count = ${expressions.hardwareSpecs.klimp_count}`)
    lines.push(`flat_washer_count = ${expressions.hardwareSpecs.flat_washer_count}`)
    lines.push(`cleat_screw_count = ${expressions.hardwareSpecs.cleat_screw_count}`)
    lines.push(`fastening_pattern = "${expressions.hardwareSpecs.fastening_pattern}"`)
    lines.push('')
    
    // Material specifications
    lines.push('# Material Specifications')
    lines.push(`lumber_grade = "${expressions.materialSpecs.lumber_grade}"`)
    lines.push(`lumber_treatment = "${expressions.materialSpecs.lumber_treatment}"`)
    lines.push(`plywood_grade = "${expressions.materialSpecs.plywood_grade}"`)
    lines.push(`plywood_thickness = ${expressions.materialSpecs.plywood_thickness}`)
    lines.push(`hardware_coating = "${expressions.materialSpecs.hardware_coating}"`)
    
    return lines.join('\n')
  }
}
