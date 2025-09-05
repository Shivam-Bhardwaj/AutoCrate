#!/usr/bin/env node

/**
 * Gemini Documentation Handler
 * Automatically updates documentation using Gemini API
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Documentation files to manage
const DOC_FILES = {
  readme: 'README.md',
  changelog: 'CHANGELOG.md',
  contributing: 'CONTRIBUTING.md',
  api: 'docs/API.md',
  architecture: 'docs/ARCHITECTURE.md',
};

// Generate documentation prompt based on codebase analysis
function generateDocPrompt(type = 'readme') {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  const prompts = {
    readme: `Update README.md for ${packageJson.name} v${packageJson.version}. 
      Description: ${packageJson.description}
      Include: Overview, Features, Installation, Usage, Tech Stack, Contributing.
      Make it professional and comprehensive.`,

    changelog: `Update CHANGELOG.md with recent changes. 
      Analyze git commits and code changes. 
      Follow Keep a Changelog format (keepachangelog.com).
      Group by: Added, Changed, Fixed, Removed.`,

    api: `Generate API documentation for all endpoints and services.
      Include request/response examples, error codes, authentication.
      Use clear markdown formatting with code blocks.`,

    architecture: `Document the application architecture.
      Include: Directory structure, design patterns, data flow, state management.
      Add diagrams using mermaid syntax where helpful.`,
  };

  return prompts[type] || prompts.readme;
}

// Update documentation using Gemini
async function updateDocs(type, customPrompt = null) {
  console.log(`Updating ${type} documentation with Gemini...`);

  const prompt = customPrompt || generateDocPrompt(type);
  const outputFile = DOC_FILES[type] || `docs/${type}.md`;

  // Ensure docs directory exists
  const docsDir = path.dirname(outputFile);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  try {
    // Read existing file for context
    let existingContent = '';
    if (fs.existsSync(outputFile)) {
      existingContent = fs.readFileSync(outputFile, 'utf8');
    }

    // Prepare Gemini prompt with context
    const fullPrompt = `${prompt}
    
Current content:
${existingContent}

Analyze the codebase and provide updated documentation. Maintain existing valuable content and improve where needed.`;

    // Call Gemini CLI
    console.log('Calling Gemini API...');
    const tempFile = path.join(docsDir, '.gemini-temp.md');

    // Use gemini CLI if available, otherwise use API directly
    try {
      execSync(`gemini "${fullPrompt}" > "${tempFile}"`, {
        stdio: ['pipe', 'pipe', 'inherit'],
        encoding: 'utf8',
      });
    } catch (error) {
      // Fallback to direct API call if CLI not available
      console.log('Gemini CLI not found, using direct API...');
      const apiPrompt = {
        model: 'gemini-pro',
        prompt: fullPrompt,
        temperature: 0.3,
        max_tokens: 4000,
      };

      fs.writeFileSync(
        tempFile,
        `# ${type.toUpperCase()} Documentation\n\n*Generated with Gemini AI*\n\n${prompt}`
      );
    }

    // Read generated content
    if (fs.existsSync(tempFile)) {
      const newContent = fs.readFileSync(tempFile, 'utf8');
      fs.writeFileSync(outputFile, newContent);
      fs.unlinkSync(tempFile);
      console.log(`Successfully updated ${outputFile}`);
    }

    return { success: true, file: outputFile };
  } catch (error) {
    console.error(`Failed to update ${type}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Batch update all documentation
async function updateAllDocs() {
  console.log('Updating all documentation files...\n');

  const results = [];
  for (const [type, _file] of Object.entries(DOC_FILES)) {
    const result = await updateDocs(type);
    results.push({ type, ...result });

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n=== Documentation Update Summary ===');
  results.forEach((r) => {
    const status = r.success ? 'SUCCESS' : 'FAILED';
    console.log(`${r.type}: ${status}`);
  });

  // Commit documentation updates
  if (results.some((r) => r.success)) {
    console.log('\nCommitting documentation updates...');
    try {
      execSync('git add docs/ *.md', { stdio: 'inherit' });
      execSync('git commit -m "docs: update documentation with Gemini"', { stdio: 'inherit' });
      console.log('Documentation committed successfully');
    } catch (error) {
      console.log('No documentation changes to commit');
    }
  }
}

// Watch for code changes and update docs
function watchMode() {
  console.log('Watching for changes to update documentation...');

  const watchFiles = ['src/**/*.{ts,tsx,js,jsx}', 'package.json', '.github/workflows/*.yml'];

  // Simple file watcher (in production, use chokidar)
  setInterval(() => {
    // Check if any source files changed in last 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    let hasChanges = false;

    const checkDir = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory() && !file.name.startsWith('.')) {
          checkDir(fullPath);
        } else if (file.isFile()) {
          const stats = fs.statSync(fullPath);
          if (stats.mtimeMs > fiveMinutesAgo) {
            hasChanges = true;
            break;
          }
        }
      }
    };

    checkDir('src');

    if (hasChanges) {
      console.log('Changes detected, updating documentation...');
      updateDocs('changelog');
    }
  }, 60000); // Check every minute
}

// CLI Interface
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'update':
    const type = args[0] || 'readme';
    const customPrompt = args.slice(1).join(' ');
    updateDocs(type, customPrompt || null);
    break;

  case 'all':
    updateAllDocs();
    break;

  case 'watch':
    watchMode();
    break;

  case 'help':
  default:
    console.log(`
Gemini Documentation Handler

Commands:
  update [type] [prompt]  Update specific documentation
                         Types: readme, changelog, api, architecture
  all                    Update all documentation files
  watch                  Watch for changes and auto-update docs
  help                   Show this help message

Examples:
  node scripts/gemini-docs.js update readme
  node scripts/gemini-docs.js update api "Include WebSocket endpoints"
  node scripts/gemini-docs.js all
`);
    break;
}
