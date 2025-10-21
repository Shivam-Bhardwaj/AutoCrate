/**
 * Script to parse all STEP files and extract their dimensions
 * Run with: npx tsx scripts/parse-step-files.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { StepParser, ComponentDescriptor, createComponentDescriptor } from '../src/lib/step-parser'

const STEP_FILES_DIR = path.join(process.cwd(), '..', 'step file')
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'lib', 'step-file-catalog.json')

interface StepFileCatalog {
  [fileName: string]: ComponentDescriptor
}

async function parseAllStepFiles() {
  console.log('🔍 Searching for STEP files in:', STEP_FILES_DIR)

  if (!fs.existsSync(STEP_FILES_DIR)) {
    console.error('❌ STEP files directory not found:', STEP_FILES_DIR)
    process.exit(1)
  }

  const files = fs.readdirSync(STEP_FILES_DIR)
    .filter(file => file.toLowerCase().endsWith('.stp') || file.toLowerCase().endsWith('.step'))

  console.log(`📁 Found ${files.length} STEP files`)

  const catalog: StepFileCatalog = {}

  for (const file of files) {
    console.log(`\n📄 Parsing: ${file}`)

    try {
      const filePath = path.join(STEP_FILES_DIR, file)
      const content = fs.readFileSync(filePath, 'utf-8')

      const info = StepParser.parseAsInches(content, file)
      const descriptor = createComponentDescriptor(info)

      console.log(`  ✅ Product: ${info.productName}`)
      console.log(`  📏 Dimensions: ${descriptor.dimensions.length.toFixed(3)}" × ${descriptor.dimensions.width.toFixed(3)}" × ${descriptor.dimensions.height.toFixed(3)}"`)
      console.log(`  📦 Bounding Box:`)
      console.log(`     Min: (${info.boundingBox.min.x.toFixed(3)}, ${info.boundingBox.min.y.toFixed(3)}, ${info.boundingBox.min.z.toFixed(3)})`)
      console.log(`     Max: (${info.boundingBox.max.x.toFixed(3)}, ${info.boundingBox.max.y.toFixed(3)}, ${info.boundingBox.max.z.toFixed(3)})`)
      console.log(`  🎯 Type: ${descriptor.type}`)
      console.log(`  🎨 Color: ${descriptor.color}`)

      // Additional analysis
      if (StepParser.isFlatStencil(info)) {
        console.log(`  🏷️  Detected as FLAT STENCIL`)
      }
      if (StepParser.isLShaped(info)) {
        console.log(`  📐 Detected as L-SHAPED`)
      }

      catalog[file] = descriptor

    } catch (error) {
      console.error(`  ❌ Error parsing ${file}:`, error)
    }
  }

  // Write catalog to JSON file
  console.log(`\n💾 Writing catalog to: ${OUTPUT_FILE}`)
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(catalog, null, 2), 'utf-8')

  console.log('\n✨ Done! Catalog saved.')
  console.log(`\n📊 Summary:`)
  console.log(`   Total files: ${Object.keys(catalog).length}`)
  console.log(`   Klimps: ${Object.values(catalog).filter(c => c.type === 'klimp').length}`)
  console.log(`   Stencils: ${Object.values(catalog).filter(c => c.type === 'stencil').length}`)
  console.log(`   Fasteners: ${Object.values(catalog).filter(c => c.type === 'fastener').length}`)
  console.log(`   Unknown: ${Object.values(catalog).filter(c => c.type === 'unknown').length}`)
}

parseAllStepFiles().catch(console.error)
