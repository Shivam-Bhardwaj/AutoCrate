#!/usr/bin/env node

/**
 * Unified Change Processor
 * Handles multiple change requests in parallel using Claude for code and Gemini for docs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHANGES_FILE = path.join(process.cwd(), 'changes.json');
const LOG_FILE = path.join(process.cwd(), '.change-log');

// Load change queue
function loadQueue() {
  if (!fs.existsSync(CHANGES_FILE)) {
    return { queue: [], processing: false, config: {} };
  }
  return JSON.parse(fs.readFileSync(CHANGES_FILE, 'utf8'));
}

// Save change queue
function saveQueue(data) {
  fs.writeFileSync(CHANGES_FILE, JSON.stringify(data, null, 2));
}

// Log activity
function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logEntry);
  console.log(message);
}

// Create unique branch name
function createBranchName(change) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const sanitized = change.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 30);
  return `auto/${sanitized}-${timestamp}`;
}

// Process a single change
async function processChange(change) {
  const branch = createBranchName(change);
  log(`Processing: ${change.title}`);

  try {
    // Create and checkout new branch
    execSync(`git checkout -b ${branch}`, { stdio: 'inherit' });

    // Determine which LLM to use
    const isDocumentation =
      change.type === 'documentation' ||
      change.title.toLowerCase().includes('doc') ||
      change.title.toLowerCase().includes('readme');

    if (isDocumentation) {
      log('Using Gemini for documentation update...');
      // Use Gemini CLI for documentation
      const prompt = `Update documentation: ${change.description}. Focus on clarity, completeness, and proper formatting.`;
      execSync(`gemini "${prompt}"`, { stdio: 'inherit' });
    } else {
      log('Using Claude for code changes...');
      // Let Claude handle the code changes directly
      // This will be triggered by the user's prompt
    }

    // Run quality checks
    log('Running quality checks...');
    execSync('npm run lint', { stdio: 'inherit' });
    execSync('npm run type-check', { stdio: 'inherit' });
    execSync('npm run test:unit', { stdio: 'inherit' });

    // Commit changes
    execSync('git add -A', { stdio: 'inherit' });
    const commitMsg = `feat: ${change.title}\n\n${change.description}\n\nAuto-processed by unified pipeline`;
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });

    // Push branch
    execSync(`git push -u origin ${branch}`, { stdio: 'inherit' });

    // Create PR using GitHub CLI
    const prCmd = `gh pr create --title "${change.title}" --body "${change.description}\n\nAuto-generated PR" --base main`;
    const prUrl = execSync(prCmd, { encoding: 'utf8' }).trim();

    log(`PR created: ${prUrl}`);

    // Return to main branch
    execSync('git checkout main', { stdio: 'inherit' });

    return { success: true, branch, prUrl };
  } catch (error) {
    log(`Error processing change: ${error.message}`);
    // Cleanup - return to main branch
    try {
      execSync('git checkout main', { stdio: 'inherit' });
      execSync(`git branch -D ${branch}`, { stdio: 'inherit' });
    } catch (_e) {
      // Ignore cleanup errors
    }
    return { success: false, error: error.message };
  }
}

// Main processor
async function processQueue() {
  const data = loadQueue();

  if (data.processing) {
    log('Already processing changes...');
    return;
  }

  if (data.queue.length === 0) {
    log('No changes to process');
    return;
  }

  data.processing = true;
  saveQueue(data);

  log(`Processing ${data.queue.length} changes...`);

  // Process changes in parallel if configured
  const parallel = data.config.parallelBranches !== false;

  if (parallel) {
    // Process up to 3 changes in parallel
    const batchSize = 3;
    for (let i = 0; i < data.queue.length; i += batchSize) {
      const batch = data.queue.slice(i, i + batchSize);
      await Promise.all(batch.map(processChange));
    }
  } else {
    // Process sequentially
    for (const change of data.queue) {
      await processChange(change);
    }
  }

  // Clear queue and update status
  data.queue = [];
  data.processing = false;
  data.lastProcessed = new Date().toISOString();
  saveQueue(data);

  log('All changes processed successfully!');
}

// Add change to queue
function addChange(title, description, type = 'feature') {
  const data = loadQueue();
  const change = {
    id: Date.now(),
    title,
    description,
    type,
    created: new Date().toISOString(),
  };

  data.queue.push(change);
  saveQueue(data);

  log(`Added to queue: ${title}`);

  // Auto-process if configured
  if (data.config.autoProcess !== false) {
    processQueue();
  }
}

// CLI interface
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'add':
    if (args.length < 2) {
      console.error('Usage: process-changes add "title" "description" [type]');
      process.exit(1);
    }
    addChange(args[0], args[1], args[2]);
    break;

  case 'process':
    processQueue();
    break;

  case 'status':
    const data = loadQueue();
    console.log(`Queue: ${data.queue.length} changes`);
    console.log(`Processing: ${data.processing}`);
    console.log(`Last processed: ${data.lastProcessed || 'Never'}`);
    break;

  case 'clear':
    saveQueue({ queue: [], processing: false, config: loadQueue().config });
    log('Queue cleared');
    break;

  default:
    console.log('Commands: add, process, status, clear');
}
