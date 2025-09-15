#!/usr/bin/env node

/**
 * Test script for STEP export API endpoint
 * Run with: node scripts/test-step-api.js
 */

const { defaultCrateConfiguration } = require('../src/types/crate')

async function testSTEPAPI() {
  console.log('🧪 Testing STEP Export API')
  console.log('==========================\n')

  const config = defaultCrateConfiguration
  
  try {
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/export-step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Get the STEP file content
    const stepContent = await response.text()
    
    console.log('✅ API Response:')
    console.log(`   Status: ${response.status}`)
    console.log(`   Content-Type: ${response.headers.get('content-type')}`)
    console.log(`   Content-Length: ${response.headers.get('content-length')}`)
    console.log(`   STEP Version: ${response.headers.get('x-step-version')}`)
    console.log(`   PMI Included: ${response.headers.get('x-pmi-included')}`)
    console.log(`   Standards: ${response.headers.get('x-standards-compliance')}`)
    
    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('content-disposition')
    const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'unknown.stp'
    console.log(`   Filename: ${filename}\n`)

    // Show sample content
    console.log('📄 STEP File Content Preview:')
    console.log('==============================')
    const lines = stepContent.split('\n')
    const previewLines = lines.slice(0, 20)
    console.log(previewLines.join('\n'))
    console.log('...')
    console.log(`(Total: ${lines.length} lines, ${stepContent.length} characters)`)
    console.log('==============================\n')

    // Validate STEP file structure
    console.log('🔍 STEP File Validation:')
    const hasHeader = stepContent.includes('ISO-10303-21')
    const hasData = stepContent.includes('DATA;')
    const hasPMI = stepContent.includes('DIMENSIONAL_SIZE')
    const hasStandards = stepContent.includes('AMAT-0251-70054')
    
    console.log(`   ✅ ISO-10303-21 Header: ${hasHeader}`)
    console.log(`   ✅ DATA Section: ${hasData}`)
    console.log(`   ✅ PMI Annotations: ${hasPMI}`)
    console.log(`   ✅ Standards Compliance: ${hasStandards}`)
    
    if (hasHeader && hasData && hasPMI && hasStandards) {
      console.log('\n🎉 STEP Export API Test PASSED!')
      console.log('   The API successfully generates STEP AP242 files with PMI annotations.')
    } else {
      console.log('\n❌ STEP Export API Test FAILED!')
      console.log('   Some required elements are missing from the generated file.')
    }

  } catch (error) {
    console.error('❌ API Test Failed:', error.message)
    console.log('\n💡 Make sure the development server is running:')
    console.log('   npm run dev')
  }
}

// Run the test
testSTEPAPI()
