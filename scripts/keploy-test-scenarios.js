#!/usr/bin/env node

/**
 * Keploy Test Scenarios for AutoCrate NX Generator
 * This script creates various test scenarios to be recorded by Keploy
 */

const testScenarios = {
  // Standard Crate Calculations
  standardCrates: [
    {
      name: "Small Package Crate",
      endpoint: "/api/calculate-crate",
      method: "POST",
      body: {
        productDimensions: { length: 500, width: 400, height: 300 },
        productWeight: 50,
        quantity: 1,
        materialType: "plywood",
        crateType: "standard"
      }
    },
    {
      name: "Medium Equipment Crate",
      endpoint: "/api/calculate-crate",
      method: "POST",
      body: {
        productDimensions: { length: 1200, width: 800, height: 900 },
        productWeight: 250,
        quantity: 1,
        materialType: "plywood",
        crateType: "standard"
      }
    },
    {
      name: "Large Machinery Crate",
      endpoint: "/api/calculate-crate",
      method: "POST",
      body: {
        productDimensions: { length: 2500, width: 1500, height: 1800 },
        productWeight: 1500,
        quantity: 1,
        materialType: "lumber",
        crateType: "heavy-duty"
      }
    }
  ],

  // Export Crate Specifications
  exportCrates: [
    {
      name: "ISPM-15 Export Crate",
      endpoint: "/api/calculate-crate",
      method: "POST",
      body: {
        productDimensions: { length: 1000, width: 1000, height: 1000 },
        productWeight: 500,
        quantity: 1,
        materialType: "lumber",
        crateType: "export"
      }
    },
    {
      name: "Air Freight Crate",
      endpoint: "/api/calculate-crate",
      method: "POST",
      body: {
        productDimensions: { length: 800, width: 600, height: 500 },
        productWeight: 100,
        quantity: 2,
        materialType: "plywood",
        crateType: "standard"
      }
    }
  ],

  // Plywood Optimization Tests
  plywoodOptimization: [
    {
      name: "Single Panel Optimization",
      endpoint: "/api/plywood-optimization",
      method: "POST",
      body: {
        panelDimensions: { width: 800, height: 1200 },
        stockSheetSize: { width: 1220, height: 2440 },
        minimizeWaste: true,
        allowRotation: true
      }
    },
    {
      name: "Multiple Panel Layout",
      endpoint: "/api/plywood-optimization",
      method: "POST",
      body: {
        panelDimensions: { width: 600, height: 900 },
        stockSheetSize: { width: 1220, height: 2440 },
        minimizeWaste: true,
        allowRotation: false
      }
    },
    {
      name: "Large Panel Splicing",
      endpoint: "/api/plywood-optimization",
      method: "POST",
      body: {
        panelDimensions: { width: 1500, height: 3000 },
        stockSheetSize: { width: 1220, height: 2440 },
        minimizeWaste: true,
        allowRotation: true
      }
    }
  ],

  // Cleat Placement Tests
  cleatPlacement: [
    {
      name: "Light Load Cleats",
      endpoint: "/api/cleat-placement",
      method: "POST",
      body: {
        panelDimensions: { width: 1000, height: 1500, thickness: 18 },
        loadCapacity: 200,
        cleatType: "standard",
        material: "pine"
      }
    },
    {
      name: "Heavy Load Reinforcement",
      endpoint: "/api/cleat-placement",
      method: "POST",
      body: {
        panelDimensions: { width: 2000, height: 2500, thickness: 25 },
        loadCapacity: 1500,
        cleatType: "reinforced",
        material: "oak"
      }
    },
    {
      name: "Corner Cleat Configuration",
      endpoint: "/api/cleat-placement",
      method: "POST",
      body: {
        panelDimensions: { width: 1200, height: 1200, thickness: 20 },
        loadCapacity: 800,
        cleatType: "corner",
        material: "metal"
      }
    }
  ],

  // NX Export Tests
  nxExport: [
    {
      name: "Standard Expression Export",
      endpoint: "/api/nx-export",
      method: "POST",
      body: {
        dimensions: { length: 1000, width: 800, height: 600 },
        weight: 300,
        exportFormat: "expressions",
        includeDrawings: false,
        units: "mm"
      }
    },
    {
      name: "STEP File Export",
      endpoint: "/api/nx-export",
      method: "POST",
      body: {
        dimensions: { length: 1500, width: 1000, height: 1000 },
        weight: 500,
        exportFormat: "step",
        includeDrawings: true,
        units: "mm"
      }
    },
    {
      name: "Imperial Units Export",
      endpoint: "/api/nx-export",
      method: "POST",
      body: {
        dimensions: { length: 48, width: 36, height: 24 },
        weight: 150,
        exportFormat: "expressions",
        includeDrawings: false,
        units: "inch"
      }
    }
  ],

  // Edge Cases and Validation Tests
  edgeCases: [
    {
      name: "Minimum Size Crate",
      endpoint: "/api/calculate-crate",
      method: "POST",
      body: {
        productDimensions: { length: 100, width: 100, height: 100 },
        productWeight: 1,
        materialType: "plywood",
        crateType: "standard"
      }
    },
    {
      name: "Maximum Size Crate",
      endpoint: "/api/calculate-crate",
      method: "POST",
      body: {
        productDimensions: { length: 6000, width: 3000, height: 3000 },
        productWeight: 5000,
        materialType: "lumber",
        crateType: "heavy-duty"
      }
    },
    {
      name: "Invalid Input Test",
      endpoint: "/api/calculate-crate",
      method: "POST",
      body: {
        productDimensions: { length: -100, width: 0, height: "invalid" },
        productWeight: -50
      }
    }
  ],

  // Performance Tests
  performanceTests: [
    {
      name: "Batch Calculation",
      endpoint: "/api/calculate-crate",
      method: "POST",
      body: {
        productDimensions: { length: 1000, width: 1000, height: 1000 },
        productWeight: 500,
        quantity: 10,
        materialType: "plywood",
        crateType: "standard"
      }
    },
    {
      name: "Complex Optimization",
      endpoint: "/api/plywood-optimization",
      method: "POST",
      body: {
        panelDimensions: { width: 1875, height: 2625 },
        stockSheetSize: { width: 1220, height: 2440 },
        minimizeWaste: true,
        allowRotation: true
      }
    }
  ],

  // Health Check Tests
  healthChecks: [
    {
      name: "Calculate API Health",
      endpoint: "/api/calculate-crate",
      method: "GET"
    },
    {
      name: "Plywood API Health",
      endpoint: "/api/plywood-optimization",
      method: "GET"
    },
    {
      name: "Cleat API Health",
      endpoint: "/api/cleat-placement",
      method: "GET"
    },
    {
      name: "NX Export API Health",
      endpoint: "/api/nx-export",
      method: "GET"
    }
  ]
};

// Function to execute test scenarios
async function runTestScenario(scenario, baseUrl = 'http://localhost:3000') {
  const url = `${baseUrl}${scenario.endpoint}`;
  const options = {
    method: scenario.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Scenario': scenario.name
    }
  };

  if (scenario.body) {
    options.body = JSON.stringify(scenario.body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    console.log(`✓ ${scenario.name}: ${response.status}`);
    return { success: true, scenario: scenario.name, status: response.status, data };
  } catch (error) {
    console.error(`✗ ${scenario.name}: ${error.message}`);
    return { success: false, scenario: scenario.name, error: error.message };
  }
}

// Execute all test scenarios
async function runAllTests() {
  console.log('🚀 Starting Keploy Test Scenarios\n');

  const results = [];

  for (const [category, scenarios] of Object.entries(testScenarios)) {
    console.log(`\n📦 Running ${category} tests:`);

    for (const scenario of scenarios) {
      const result = await runTestScenario(scenario);
      results.push(result);

      // Add delay between tests to allow Keploy to record properly
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('\n📊 Test Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✓ Successful: ${successful}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total: ${results.length}`);

  return results;
}

// Export for use in other scripts
module.exports = {
  testScenarios,
  runTestScenario,
  runAllTests
};

// Run if executed directly
if (require.main === module) {
  runAllTests().then(() => {
    console.log('\n✨ Test scenarios completed!');
    process.exit(0);
  }).catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
}