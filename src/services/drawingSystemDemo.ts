/**
 * Applied Materials Drawing System Demonstration
 * Complete end-to-end validation and demonstration of the drawing generation system
 */

import { generateExampleDrawingPackage, generateSampleDrawingPackage, EXAMPLE_CRATE_CONFIG } from './drawingExampleGenerator';
import { validateDrawingPackage, generateValidationReport } from './drawingValidator';
import { CrateConfiguration } from '@/types/crate';

/**
 * Run complete system demonstration
 */
export function runDrawingSystemDemo(): {
  success: boolean;
  results: DemoResults;
  report: string;
} {
  console.log('🚀 Starting Applied Materials Drawing System Demo...\n');

  const results: DemoResults = {
    packageGeneration: { success: false, duration: 0, errors: [] },
    validation: { success: false, score: 0, errors: [], warnings: [] },
    compliance: { amat: false, asme: false, completeness: false },
    performance: { generationTime: 0, validationTime: 0, memoryUsed: 0 },
    features: {
      multiSheet: false,
      titleBlock: false,
      bom: false,
      dimensions: false,
      views: false
    }
  };

  try {
    // 1. Test Drawing Package Generation
    console.log('📋 Testing Drawing Package Generation...');
    const genStart = performance.now();
    
    const drawingPackage = generateExampleDrawingPackage();
    
    const genEnd = performance.now();
    results.packageGeneration.duration = genEnd - genStart;
    results.performance.generationTime = genEnd - genStart;

    // Verify package structure
    if (!drawingPackage || !drawingPackage.sheets || drawingPackage.sheets.length === 0) {
      results.packageGeneration.errors.push('Failed to generate drawing package');
      throw new Error('Drawing package generation failed');
    }

    results.packageGeneration.success = true;
    console.log(`✅ Generated ${drawingPackage.sheets.length} sheets in ${Math.round(genEnd - genStart)}ms`);

    // 2. Test Feature Completeness
    console.log('\n🔍 Testing Feature Completeness...');
    
    results.features.multiSheet = drawingPackage.sheets.length >= 3;
    results.features.titleBlock = drawingPackage.sheets.every(s => s.titleBlock && s.titleBlock.partNumber);
    results.features.bom = drawingPackage.sheets[0]?.views.some(v => v.name.includes('Materials'));
    results.features.dimensions = drawingPackage.sheets.some(s => 
      s.dimensions && (s.dimensions.overall.length > 0 || s.dimensions.detail.length > 0)
    );
    results.features.views = drawingPackage.sheets.every(s => s.views.length > 0);

    console.log(`   📄 Multi-sheet: ${results.features.multiSheet ? '✅' : '❌'}`);
    console.log(`   📋 Title blocks: ${results.features.titleBlock ? '✅' : '❌'}`);
    console.log(`   📊 BOM: ${results.features.bom ? '✅' : '❌'}`);
    console.log(`   📏 Dimensions: ${results.features.dimensions ? '✅' : '❌'}`);
    console.log(`   👁️  Views: ${results.features.views ? '✅' : '❌'}`);

    // 3. Test Validation System
    console.log('\n🔍 Testing Validation System...');
    const valStart = performance.now();
    
    const validationResult = validateDrawingPackage(drawingPackage);
    
    const valEnd = performance.now();
    results.validation.duration = valEnd - valStart;
    results.performance.validationTime = valEnd - valStart;

    results.validation.success = validationResult.isValid;
    results.validation.score = validationResult.score;
    results.validation.errors = validationResult.errors.map(e => e.message);
    results.validation.warnings = validationResult.warnings.map(w => w.message);

    console.log(`✅ Validation completed in ${Math.round(valEnd - valStart)}ms`);
    console.log(`   📊 Score: ${validationResult.score}/100`);
    console.log(`   🚫 Errors: ${validationResult.errors.length}`);
    console.log(`   ⚠️  Warnings: ${validationResult.warnings.length}`);

    // 4. Test Standards Compliance
    console.log('\n🏛️ Testing Standards Compliance...');
    
    results.compliance.amat = validationResult.complianceChecks
      .filter(c => c.standard.includes('AMAT'))
      .every(c => c.status === 'pass' || c.status === 'warning');
    
    results.compliance.asme = validationResult.complianceChecks
      .filter(c => c.standard.includes('ASME'))
      .every(c => c.status === 'pass');
    
    results.compliance.completeness = validationResult.complianceChecks
      .filter(c => c.standard === 'Completeness')
      .every(c => c.status === 'pass' || c.status === 'warning');

    console.log(`   🏢 AMAT 0251-70054: ${results.compliance.amat ? '✅' : '❌'}`);
    console.log(`   📐 ASME Y14.5-2009: ${results.compliance.asme ? '✅' : '❌'}`);
    console.log(`   📋 Completeness: ${results.compliance.completeness ? '✅' : '❌'}`);

    // 5. Performance Metrics
    console.log('\n⚡ Performance Metrics...');
    results.performance.memoryUsed = JSON.stringify(drawingPackage).length / 1024; // KB
    
    console.log(`   ⏱️  Generation: ${Math.round(results.performance.generationTime)}ms`);
    console.log(`   🔍 Validation: ${Math.round(results.performance.validationTime)}ms`);
    console.log(`   💾 Memory: ${Math.round(results.performance.memoryUsed)}KB`);

    // Generate comprehensive report
    const report = generateDemoReport(results, validationResult, drawingPackage);

    const overallSuccess = results.packageGeneration.success && 
                          results.validation.success && 
                          results.compliance.amat && 
                          results.compliance.asme;

    console.log(`\n${overallSuccess ? '🎉' : '⚠️'} Demo ${overallSuccess ? 'PASSED' : 'COMPLETED WITH ISSUES'}`);

    return {
      success: overallSuccess,
      results,
      report
    };

  } catch (error) {
    console.error('❌ Demo failed:', error);
    results.packageGeneration.errors.push(error instanceof Error ? error.message : 'Unknown error');
    
    return {
      success: false,
      results,
      report: `Demo failed: ${error}`
    };
  }
}

/**
 * Test different crate configurations
 */
export function runConfigurationTests(): {
  success: boolean;
  results: ConfigTestResults[];
} {
  console.log('🧪 Running Configuration Tests...\n');

  const testConfigs: Array<{ name: string; config: Partial<CrateConfiguration> }> = [
    {
      name: 'Small Component Crate',
      config: {
        projectName: 'RF GENERATOR MODULE',
        dimensions: { length: 24, width: 18, height: 12 },
        weight: { product: 50 },
        amatCompliance: { style: 'A', isInternational: false, requiresMoistureBag: false, requiresShockIndicator: false, requiresTiltIndicator: false }
      }
    },
    {
      name: 'Medium Equipment Crate',
      config: {
        projectName: 'PROCESS CHAMBER ASSEMBLY',
        dimensions: { length: 48, width: 36, height: 24 },
        weight: { product: 300 },
        amatCompliance: { style: 'B', isInternational: false, requiresMoistureBag: false, requiresShockIndicator: false, requiresTiltIndicator: false }
      }
    },
    {
      name: 'Large System Crate',
      config: {
        projectName: 'MAINFRAME CONTROLLER',
        dimensions: { length: 72, width: 48, height: 36 },
        weight: { product: 1200 },
        amatCompliance: { style: 'C', isInternational: false, requiresMoistureBag: true, requiresShockIndicator: false, requiresTiltIndicator: false }
      }
    },
    {
      name: 'International Export Crate',
      config: {
        projectName: 'SEMICONDUCTOR TOOL',
        dimensions: { length: 60, width: 40, height: 30 },
        weight: { product: 800 },
        amatCompliance: { 
          style: 'D', 
          isInternational: true,
          requiresMoistureBag: true,
          requiresShockIndicator: true,
          requiresTiltIndicator: true
        }
      }
    }
  ];

  const results: ConfigTestResults[] = [];
  let overallSuccess = true;

  testConfigs.forEach((test, index) => {
    console.log(`${index + 1}. Testing ${test.name}...`);
    
    try {
      const start = performance.now();
      const { drawingPackage } = generateSampleDrawingPackage(test.name, test.config);
      const validation = validateDrawingPackage(drawingPackage);
      const end = performance.now();

      const result: ConfigTestResults = {
        configName: test.name,
        success: validation.score >= 80,
        score: validation.score,
        sheetCount: drawingPackage.sheets.length,
        duration: end - start,
        errors: validation.errors.length,
        warnings: validation.warnings.length,
        features: {
          hasAssemblyView: drawingPackage.sheets.some(s => s.views.some(v => v.type === 'assembly')),
          hasBOM: drawingPackage.sheets[0]?.views.some(v => v.name.includes('Materials')) || false,
          hasDimensions: drawingPackage.sheets.some(s => s.dimensions && s.dimensions.overall.length > 0),
          hasCompliantTitleBlock: validation.complianceChecks.some(c => 
            c.requirement.includes('Part number') && c.status === 'pass'
          )
        }
      };

      results.push(result);

      console.log(`   ${result.success ? '✅' : '❌'} Score: ${result.score}/100 (${result.sheetCount} sheets, ${Math.round(result.duration)}ms)`);
      
      if (!result.success) {
        overallSuccess = false;
      }

    } catch (error) {
      const result: ConfigTestResults = {
        configName: test.name,
        success: false,
        score: 0,
        sheetCount: 0,
        duration: 0,
        errors: 1,
        warnings: 0,
        features: {
          hasAssemblyView: false,
          hasBOM: false,
          hasDimensions: false,
          hasCompliantTitleBlock: false
        }
      };
      results.push(result);
      overallSuccess = false;
      console.log(`   ❌ Failed: ${error}`);
    }
  });

  console.log(`\n${overallSuccess ? '🎉' : '⚠️'} Configuration Tests ${overallSuccess ? 'PASSED' : 'COMPLETED WITH ISSUES'}`);

  return { success: overallSuccess, results };
}

/**
 * Generate comprehensive demo report
 */
function generateDemoReport(
  results: DemoResults,
  validationResult: any,
  drawingPackage: any
): string {
  let report = '';
  
  report += '# Applied Materials Drawing System Demo Report\n\n';
  report += `**Generated:** ${new Date().toISOString()}\n\n`;

  // Executive Summary
  report += '## Executive Summary\n\n';
  report += `The Applied Materials Drawing Generation System has been successfully implemented and tested. `;
  report += `The system generates ${drawingPackage.sheets.length}-sheet drawing packages with `;
  report += `${results.validation.score}/100 validation score.\n\n`;

  // System Capabilities
  report += '## System Capabilities\n\n';
  report += `- **Multi-Sheet Generation:** ${results.features.multiSheet ? '✅' : '❌'} Complete drawing packages\n`;
  report += `- **Applied Materials Title Blocks:** ${results.features.titleBlock ? '✅' : '❌'} AMAT 0251-70054 compliant\n`;
  report += `- **Bill of Materials:** ${results.features.bom ? '✅' : '❌'} Automated parts lists\n`;
  report += `- **ASME Y14.5 Dimensions:** ${results.features.dimensions ? '✅' : '❌'} Standard dimensioning\n`;
  report += `- **Multiple Views:** ${results.features.views ? '✅' : '❌'} Assembly, layout, and orientation\n\n`;

  // Performance Metrics
  report += '## Performance Metrics\n\n';
  report += `- **Generation Time:** ${Math.round(results.performance.generationTime)}ms\n`;
  report += `- **Validation Time:** ${Math.round(results.performance.validationTime)}ms\n`;
  report += `- **Memory Usage:** ${Math.round(results.performance.memoryUsed)}KB\n`;
  report += `- **Total Processing Time:** ${Math.round(results.performance.generationTime + results.performance.validationTime)}ms\n\n`;

  // Standards Compliance
  report += '## Standards Compliance\n\n';
  report += `- **AMAT 0251-70054 Rev. 08:** ${results.compliance.amat ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}\n`;
  report += `- **ASME Y14.5-2009:** ${results.compliance.asme ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}\n`;
  report += `- **Completeness:** ${results.compliance.completeness ? '✅ COMPLETE' : '❌ INCOMPLETE'}\n\n`;

  // Validation Results
  if (results.validation.errors.length > 0) {
    report += '## Validation Errors\n\n';
    results.validation.errors.forEach((error, index) => {
      report += `${index + 1}. ${error}\n`;
    });
    report += '\n';
  }

  if (results.validation.warnings.length > 0) {
    report += '## Validation Warnings\n\n';
    results.validation.warnings.forEach((warning, index) => {
      report += `${index + 1}. ${warning}\n`;
    });
    report += '\n';
  }

  // Drawing Package Details
  report += '## Generated Drawing Package\n\n';
  report += `- **Part Number:** ${drawingPackage.metadata.partNumber}\n`;
  report += `- **TC Number:** ${drawingPackage.metadata.tcNumber}\n`;
  report += `- **Project:** ${drawingPackage.metadata.projectName}\n`;
  report += `- **Total Sheets:** ${drawingPackage.metadata.totalSheets}\n`;
  report += `- **Created:** ${drawingPackage.metadata.createdDate}\n\n`;

  // Sheet Breakdown
  report += '### Sheet Breakdown\n\n';
  drawingPackage.sheets.forEach((sheet: any, index: number) => {
    report += `**Sheet ${sheet.sheetNumber}:** ${sheet.title}\n`;
    report += `- Size: ${sheet.size} (${sheet.orientation})\n`;
    report += `- Views: ${sheet.views.length}\n`;
    report += `- Notes: ${sheet.notes.length}\n`;
    report += `- Dimensions: ${sheet.dimensions.overall.length + sheet.dimensions.detail.length}\n\n`;
  });

  report += '## Conclusion\n\n';
  const overallSuccess = results.packageGeneration.success && 
                        results.validation.success && 
                        results.compliance.amat && 
                        results.compliance.asme;
                        
  if (overallSuccess) {
    report += `✅ **SUCCESS:** The Applied Materials Drawing System is fully functional and meets all requirements.\n`;
  } else {
    report += `⚠️ **ATTENTION REQUIRED:** The system is functional but has issues that should be addressed.\n`;
  }

  report += '\n---\n';
  report += `*AutoCrate Drawing System v1.0 - Generated ${new Date().toLocaleString()}*\n`;

  return report;
}

// Type definitions
interface DemoResults {
  packageGeneration: {
    success: boolean;
    duration: number;
    errors: string[];
  };
  validation: {
    success: boolean;
    score: number;
    errors: string[];
    warnings: string[];
    duration?: number;
  };
  compliance: {
    amat: boolean;
    asme: boolean;
    completeness: boolean;
  };
  performance: {
    generationTime: number;
    validationTime: number;
    memoryUsed: number;
  };
  features: {
    multiSheet: boolean;
    titleBlock: boolean;
    bom: boolean;
    dimensions: boolean;
    views: boolean;
  };
}

interface ConfigTestResults {
  configName: string;
  success: boolean;
  score: number;
  sheetCount: number;
  duration: number;
  errors: number;
  warnings: number;
  features: {
    hasAssemblyView: boolean;
    hasBOM: boolean;
    hasDimensions: boolean;
    hasCompliantTitleBlock: boolean;
  };
}

// Export for use in development and testing
export type { DemoResults, ConfigTestResults };