#!/usr/bin/env node

/**
 * Performance Test Script for AutoCrate
 * Tests 3D rendering performance and provides metrics
 */

const puppeteer = require('puppeteer')

async function runPerformanceTest() {
  console.log('🚀 AutoCrate Performance Test')
  console.log('==============================\n')

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    
    // Enable performance metrics
    await page.setCacheEnabled(false)
    
    // Navigate to the app
    console.log('📱 Loading AutoCrate application...')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' })
    
    // Wait for 3D scene to load
    console.log('⏳ Waiting for 3D scene to initialize...')
    await page.waitForSelector('canvas', { timeout: 10000 })
    
    // Measure performance metrics
    console.log('📊 Measuring performance metrics...')
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const startTime = performance.now()
        let frameCount = 0
        let lastTime = startTime
        
        function measureFrame() {
          frameCount++
          const currentTime = performance.now()
          
          if (currentTime - startTime >= 5000) { // Measure for 5 seconds
            const fps = Math.round((frameCount * 1000) / (currentTime - startTime))
            const avgFrameTime = (currentTime - startTime) / frameCount
            
            // Get memory usage
            const memoryInfo = performance.memory
            const memoryUsage = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0
            
            resolve({
              fps,
              avgFrameTime: Math.round(avgFrameTime * 100) / 100,
              memoryUsage,
              frameCount,
              duration: Math.round((currentTime - startTime) / 1000)
            })
          } else {
            requestAnimationFrame(measureFrame)
          }
        }
        
        requestAnimationFrame(measureFrame)
      })
    })
    
    // Display results
    console.log('\n📈 Performance Results:')
    console.log('------------------------')
    console.log(`   FPS: ${metrics.fps}`)
    console.log(`   Average Frame Time: ${metrics.avgFrameTime}ms`)
    console.log(`   Memory Usage: ${metrics.memoryUsage}MB`)
    console.log(`   Frames Rendered: ${metrics.frameCount}`)
    console.log(`   Test Duration: ${metrics.duration}s`)
    
    // Performance assessment
    console.log('\n🎯 Performance Assessment:')
    console.log('--------------------------')
    
    if (metrics.fps >= 60) {
      console.log('   ✅ Excellent: 60+ FPS - Smooth performance')
    } else if (metrics.fps >= 30) {
      console.log('   🟡 Good: 30-59 FPS - Acceptable performance')
    } else {
      console.log('   ❌ Poor: <30 FPS - Performance issues detected')
    }
    
    if (metrics.avgFrameTime <= 16.67) {
      console.log('   ✅ Frame time: <16.67ms - Optimal')
    } else if (metrics.avgFrameTime <= 33.33) {
      console.log('   🟡 Frame time: 16.67-33.33ms - Acceptable')
    } else {
      console.log('   ❌ Frame time: >33.33ms - Too slow')
    }
    
    if (metrics.memoryUsage <= 50) {
      console.log('   ✅ Memory: <50MB - Efficient')
    } else if (metrics.memoryUsage <= 100) {
      console.log('   🟡 Memory: 50-100MB - Acceptable')
    } else {
      console.log('   ❌ Memory: >100MB - High usage')
    }
    
    // Recommendations
    console.log('\n💡 Optimization Recommendations:')
    console.log('---------------------------------')
    
    if (metrics.fps < 30) {
      console.log('   • Reduce shadow map size')
      console.log('   • Disable antialiasing')
      console.log('   • Lower device pixel ratio')
      console.log('   • Use instanced rendering for repeated objects')
    }
    
    if (metrics.memoryUsage > 100) {
      console.log('   • Implement geometry disposal')
      console.log('   • Use texture compression')
      console.log('   • Reduce model complexity')
      console.log('   • Implement LOD (Level of Detail)')
    }
    
    if (metrics.avgFrameTime > 33.33) {
      console.log('   • Optimize shader complexity')
      console.log('   • Reduce draw calls')
      console.log('   • Use frustum culling')
      console.log('   • Implement occlusion culling')
    }
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message)
    console.log('\n💡 Make sure the development server is running:')
    console.log('   npm run dev')
  } finally {
    await browser.close()
  }
}

// Check if puppeteer is available
try {
  require.resolve('puppeteer')
  runPerformanceTest()
} catch (error) {
  console.log('❌ Puppeteer not found. Install it to run performance tests:')
  console.log('   npm install --save-dev puppeteer')
}
