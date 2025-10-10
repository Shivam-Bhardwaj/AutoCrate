#!/usr/bin/env node
/**
 * Version Sync Script
 * Syncs version from package.json to all other version-related files
 * Run after: npm version patch/minor/major
 */

const fs = require('fs');
const path = require('path');

// Paths
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const versionConfigPath = path.join(__dirname, '..', '.claude', 'version-config.json');
const projectStatusPath = path.join(__dirname, '..', '.claude', 'project-status.json');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

if (!version) {
  console.error('❌ Error: No version found in package.json');
  process.exit(1);
}

console.log(`📦 Syncing version: ${version}`);

// Parse version
const versionParts = version.split('.');
if (versionParts.length !== 3) {
  console.error(`❌ Error: Invalid version format: ${version}`);
  console.error('   Expected format: OVERALL.CURRENT.CHANGE (e.g., 13.1.0)');
  process.exit(1);
}

const [overall, current, change] = versionParts.map(Number);

// Update .claude/version-config.json
try {
  const versionConfig = JSON.parse(fs.readFileSync(versionConfigPath, 'utf8'));

  versionConfig.version = version;
  versionConfig.versionScheme = {
    overall,
    current,
    change
  };
  versionConfig.lastUpdate = new Date().toISOString();

  fs.writeFileSync(
    versionConfigPath,
    JSON.stringify(versionConfig, null, 2) + '\n',
    'utf8'
  );

  console.log(`✅ Updated .claude/version-config.json`);
} catch (error) {
  console.error(`❌ Error updating version-config.json: ${error.message}`);
  process.exit(1);
}

// Update .claude/project-status.json
try {
  const projectStatus = JSON.parse(fs.readFileSync(projectStatusPath, 'utf8'));

  projectStatus.currentVersion = version;

  fs.writeFileSync(
    projectStatusPath,
    JSON.stringify(projectStatus, null, 2) + '\n',
    'utf8'
  );

  console.log(`✅ Updated .claude/project-status.json`);
} catch (error) {
  console.error(`❌ Error updating project-status.json: ${error.message}`);
  process.exit(1);
}

// Display summary
console.log('');
console.log('✨ Version sync complete!');
console.log('');
console.log(`   Version: ${version}`);
console.log(`   Overall: ${overall}`);
console.log(`   Current: ${current}`);
console.log(`   Change:  ${change}`);
console.log('');
console.log('📝 Next steps:');
console.log('   1. Update CHANGELOG.md');
console.log('   2. git add .');
console.log(`   3. git commit -m "chore: bump version to ${version}"`);
console.log('   4. git push origin main');
console.log('');
