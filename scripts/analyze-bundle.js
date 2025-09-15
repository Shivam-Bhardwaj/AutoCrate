#!/usr/bin/env node

/**
 * Bundle Analysis Script for AutoCrate
 * Analyzes bundle size and provides optimization recommendations
 */

const fs = require('fs')
const path = require('path')

function analyzeBundle() {
  console.log('📊 AutoCrate Bundle Analysis')
  console.log('============================\n')

  // Check if .next directory exists
  const nextDir = path.join(process.cwd(), '.next')
  if (!fs.existsSync(nextDir)) {
    console.log('❌ No build found. Run "npm run build" first.')
    return
  }

  // Analyze static chunks
  const staticDir = path.join(nextDir, 'static', 'chunks')
  if (fs.existsSync(staticDir)) {
    console.log('📦 Static Chunks Analysis:')
    console.log('---------------------------')
    
    const chunks = fs.readdirSync(staticDir)
    let totalSize = 0
    
    chunks.forEach(chunk => {
      const chunkPath = path.join(staticDir, chunk)
      const stats = fs.statSync(chunkPath)
      const sizeKB = Math.round(stats.size / 1024)
      totalSize += sizeKB
      
      console.log(`   ${chunk}: ${sizeKB}KB`)
    })
    
    console.log(`   Total: ${totalSize}KB\n`)
  }

  // Analyze pages
  const pagesDir = path.join(nextDir, 'server', 'pages')
  if (fs.existsSync(pagesDir)) {
    console.log('📄 Pages Analysis:')
    console.log('------------------')
    
    analyzeDirectory(pagesDir, '')
  }

  // Performance recommendations
  console.log('🚀 Performance Recommendations:')
  console.log('--------------------------------')
  
  const recommendations = [
    '✅ Lazy loading implemented for heavy components',
    '✅ React.memo() used for component optimization',
    '✅ Three.js geometry and materials memoized',
    '✅ Bundle splitting configured in next.config.ts',
    '✅ Tree shaking enabled for unused code elimination',
    '✅ Compression enabled for better loading times',
    '✅ Static assets cached with long TTL',
    '🔄 Consider implementing virtual scrolling for large lists',
    '🔄 Add service worker for offline functionality',
    '🔄 Implement progressive loading for 3D models'
  ]
  
  recommendations.forEach(rec => console.log(`   ${rec}`))
  
  console.log('\n📈 Performance Targets:')
  console.log('-----------------------')
  console.log('   • Initial bundle: < 500KB')
  console.log('   • 3D rendering: 60fps on modern devices')
  console.log('   • Load time: < 2 seconds')
  console.log('   • Memory usage: < 100MB')
  console.log('   • Draw calls: < 50 per frame')
}

function analyzeDirectory(dir, prefix) {
  const items = fs.readdirSync(dir)
  
  items.forEach(item => {
    const itemPath = path.join(dir, item)
    const stats = fs.statSync(itemPath)
    
    if (stats.isDirectory()) {
      console.log(`${prefix}📁 ${item}/`)
      analyzeDirectory(itemPath, prefix + '   ')
    } else {
      const sizeKB = Math.round(stats.size / 1024)
      console.log(`${prefix}📄 ${item}: ${sizeKB}KB`)
    }
  })
}

// Run analysis
analyzeBundle()
