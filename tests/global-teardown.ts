import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Clean up any global test data
    // await cleanupTestData();
    
    // Optional: Generate test reports or upload artifacts
    console.log('📊 Test run completed');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw here to avoid masking test failures
  }
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;

