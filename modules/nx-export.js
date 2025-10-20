/**
 * @fileoverview NX Export Module
 * Handles exporting crate assembly data to NX-compatible formats, including processing uploaded STEP files
 * for accurate model orientation and replacement of mock components.
 *
 * @module nx-export
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Configuration for NX export
 * @typedef {Object} NXExportConfig
 * @property {string} outputDir - Directory to save exported files
 * @property {string} stepToStlConverter - Path to STEP to STL converter tool (e.g., FreeCAD or custom script)
 * @property {boolean} useBoundingBoxes - Whether to use dark bounding boxes instead of full models initially
 */

/**
 * Represents a processed model component
 * @typedef {Object} ModelComponent
 * @property {string} name - Component name (e.g., 'klimp', 'stencil')
 * @property {string} stlPath - Path to the generated STL file
 * @property {Array<number>} position - [x, y, z] position in space
 * @property {Array<number>} rotation - [rx, ry, rz] rotation angles in degrees
 * @property {Array<number>} boundingBox - [minX, minY, minZ, maxX, maxY, maxZ] for bounding box visualization
 */

/**
 * Processes an uploaded STEP file and converts it to STL with correct orientation
 * @param {string} stepFilePath - Path to the uploaded STEP file
 * @param {NXExportConfig} config - Export configuration
 * @param {Object} orientation - Orientation data {position: [x,y,z], rotation: [rx,ry,rz]}
 * @returns {Promise<ModelComponent>} Processed model component
 * @throws {Error} If conversion fails or file is invalid
 */
async function processStepFile(stepFilePath, config, orientation) {
  try {
    // Validate input
    if (!stepFilePath || !fs.access(stepFilePath)) {
      throw new Error('Invalid STEP file path');
    }

    const fileName = path.basename(stepFilePath, '.stp');
    const stlOutputPath = path.join(config.outputDir, `${fileName}.stl`);

    // Convert STEP to STL using external tool (e.g., FreeCAD command line)
    // Note: This assumes FreeCAD or similar is installed and configured
    const convertCommand = `${config.stepToStlConverter} "${stepFilePath}" "${stlOutputPath}"`;
    await execAsync(convertCommand);

    // Calculate bounding box (simplified; in practice, use a 3D library like three.js)
    const boundingBox = await calculateBoundingBox(stlOutputPath);

    return {
      name: fileName,
      stlPath: stlOutputPath,
      position: orientation.position || [0, 0, 0],
      rotation: orientation.rotation || [0, 0, 0],
      boundingBox: boundingBox
    };
  } catch (error) {
    throw new Error(`Failed to process STEP file: ${error.message}`);
  }
}

/**
 * Calculates bounding box from STL file (placeholder implementation)
 * In production, integrate with three.js or similar for accurate calculation
 * @param {string} stlPath - Path to STL file
 * @returns {Promise<Array<number>>} Bounding box [minX, minY, minZ, maxX, maxY, maxZ]
 */
async function calculateBoundingBox(stlPath) {
  // Placeholder: Return a default bounding box
  // TODO: Implement actual STL parsing with three.js or stl-parser library
  return [-10, -10, -1, 10, 10, 1]; // Example for a flat stencil
}

/**
 * Generates NX export data, replacing mocks with processed models
 * @param {Array<Object>} components - List of components with STEP file paths and orientations
 * @param {NXExportConfig} config - Export configuration
 * @returns {Promise<Object>} NX export data structure
 * @throws {Error} If processing fails
 */
async function generateNXExport(components, config) {
  const processedComponents = [];

  for (const component of components) {
    let modelComponent;

    if (component.stepFilePath) {
      // Process uploaded STEP file
      modelComponent = await processStepFile(component.stepFilePath, config, component.orientation);
    } else {
      // Use mock or bounding box
      modelComponent = {
        name: component.name,
        stlPath: null,
        position: component.position || [0, 0, 0],
        rotation: component.rotation || [0, 0, 0],
        boundingBox: component.boundingBox || [-5, -5, -0.5, 5, 5, 0.5]
      };
    }

    // If using bounding boxes, set STL path to null
    if (config.useBoundingBoxes) {
      modelComponent.stlPath = null;
    }

    processedComponents.push(modelComponent);
  }

  // Generate NX-compatible output (e.g., JSON structure or script for NX)
  const nxData = {
    version: '1.0',
    components: processedComponents,
    metadata: {
      generatedAt: new Date().toISOString(),
      useBoundingBoxes: config.useBoundingBoxes
    }
  };

  // Save to file
  const outputPath = path.join(config.outputDir, 'nx_export.json');
  await fs.writeFile(outputPath, JSON.stringify(nxData, null, 2));

  return nxData;
}

/**
 * Validates NX export configuration
 * @param {NXExportConfig} config - Configuration to validate
 * @throws {Error} If configuration is invalid
 */
function validateConfig(config) {
  if (!config.outputDir) {
    throw new Error('Output directory is required');
  }
  if (!config.stepToStlConverter) {
    throw new Error('STEP to STL converter path is required');
  }
  if (typeof config.useBoundingBoxes !== 'boolean') {
    throw new Error('useBoundingBoxes must be a boolean');
  }
}

module.exports = {
  processStepFile,
  generateNXExport,
  validateConfig
};
