#!/usr/bin/env node

/**
 * Demo script to show STEP file export functionality
 * Run with: node scripts/demo-step-export.js
 */

const { STEPExporter } = require('../src/lib/step-processor/step-exporter')
const { generatePMIAnnotations } = require('../src/lib/step-processor/pmi-annotations')
const { defaultCrateConfiguration } = require('../src/types/crate')
const { calculateCrateDimensions } = require('../src/lib/domain/calculations')

async function demoSTEPExport() {
  console.log('🚀 AutoCrate STEP Export Demo')
  console.log('================================\n')

  // Use default configuration
  const config = defaultCrateConfiguration
  console.log('📦 Configuration:')
  console.log(`   Product: ${config.product.length}" × ${config.product.width}" × ${config.product.height}"`)
  console.log(`   Weight: ${config.product.weight} lbs`)
  console.log(`   Materials: ${config.materials.lumber.grade} lumber, ${config.materials.plywood.grade} plywood`)
  console.log(`   Standards: ${config.standards.version}\n`)

  // Calculate dimensions
  const dimensions = calculateCrateDimensions(config)
  console.log('📏 Calculated Dimensions:')
  console.log(`   Crate: ${dimensions.overallLength}" × ${dimensions.overallWidth}" × ${dimensions.overallHeight}"`)
  console.log(`   Internal: ${dimensions.internalLength}" × ${dimensions.internalWidth}" × ${dimensions.internalHeight}"\n`)

  // Generate PMI annotations
  console.log('🏷️  Generating PMI Annotations...')
  const pmiAnnotations = generatePMIAnnotations(config, dimensions)
  console.log(`   ✅ ${pmiAnnotations.dimensions.length} dimensional annotations`)
  console.log(`   ✅ ${pmiAnnotations.geometricTolerances.length} geometric tolerances`)
  console.log(`   ✅ ${pmiAnnotations.notes.length} manufacturing notes`)
  console.log(`   ✅ ${pmiAnnotations.datumFeatures.length} datum features\n`)

  // Generate STEP file
  console.log('📄 Generating STEP AP242 File...')
  const stepExporter = new STEPExporter()
  const stepFile = await stepExporter.exportWithPMI(config, pmiAnnotations)
  
  console.log(`   ✅ File: ${stepFile.filename}`)
  console.log(`   ✅ Size: ${stepFile.content.length} characters`)
  console.log(`   ✅ PMI Included: ${stepFile.metadata.pmiIncluded}`)
  console.log(`   ✅ Standards: ${stepFile.metadata.standardsCompliance}\n`)

  // Show sample content
  console.log('📋 Sample STEP File Content:')
  console.log('================================')
  const lines = stepFile.content.split('\n')
  const headerLines = lines.slice(0, 15)
  const dataLines = lines.slice(15, 25)
  const footerLines = lines.slice(-5)
  
  console.log(headerLines.join('\n'))
  console.log('...')
  console.log(dataLines.join('\n'))
  console.log('...')
  console.log(footerLines.join('\n'))
  console.log('================================\n')

  // Show PMI details
  console.log('🏷️  PMI Annotation Details:')
  console.log('================================')
  
  // Show first few dimensions
  console.log('Dimensional Annotations:')
  pmiAnnotations.dimensions.slice(0, 3).forEach(dim => {
    console.log(`   ${dim.id}: ${dim.value}" (${dim.semanticReference})`)
    if (dim.tolerance) {
      console.log(`     Tolerance: ${dim.tolerance.lowerLimit}" to ${dim.tolerance.upperLimit}"`)
    }
  })
  
  // Show geometric tolerances
  console.log('\nGeometric Tolerances:')
  pmiAnnotations.geometricTolerances.forEach(gtol => {
    console.log(`   ${gtol.id}: ${gtol.type} ${gtol.tolerance}"`)
  })
  
  // Show manufacturing notes
  console.log('\nManufacturing Notes:')
  pmiAnnotations.notes.forEach(note => {
    console.log(`   ${note.id}: ${note.type}`)
    console.log(`     ${note.text.substring(0, 80)}...`)
  })

  console.log('\n✅ STEP Export Demo Complete!')
  console.log('   The STEP file includes:')
  console.log('   • Complete geometric model')
  console.log('   • Dimensional annotations with tolerances')
  console.log('   • Geometric tolerances (GD&T)')
  console.log('   • Manufacturing notes and instructions')
  console.log('   • Material specifications')
  console.log('   • Applied Materials standards compliance')
  console.log('   • Semantic references for downstream manufacturing')
}

// Run the demo
demoSTEPExport().catch(console.error)
