/**
 * AutoCrate AI Agent Watcher
 * Monitors file changes and automatically runs relevant agents in parallel
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { OrchestratorAgent } = require('./agent-system');

class AgentWatcher {
  constructor() {
    this.watchers = new Map();
    this.runningAgents = new Map();
    this.debounceTimers = new Map();
    this.changeQueue = new Set();
    this.isProcessing = false;

    // Configuration for which agents to run based on file changes
    this.filePatterns = {
      math: [
        'src/services/crateCalculations',
        'src/services/skidCalculations',
        'src/services/bomCalculations',
        'src/services/nx-generator',
      ],
      ui: ['src/components/', 'src/app/', 'styles/', '.css', '.scss'],
      quality: ['.ts', '.tsx', '.js', '.jsx'],
      test: ['tests/', '.test.', '.spec.'],
    };

    // Agent run configuration
    this.agentConfig = {
      parallel: true,
      autoFix: true,
      throttleMs: 2000, // Wait 2 seconds after last change before running
      maxParallel: 3, // Max agents running at once
    };
  }

  start() {
    console.log('Starting AI Agent Watcher...');
    console.log('Agents will run automatically on file changes');
    console.log('Press Ctrl+C to stop\n');

    // Watch src directory
    this.watchDirectory(path.join(process.cwd(), 'src'));

    // Watch test directory
    this.watchDirectory(path.join(process.cwd(), 'tests'));

    // Watch root config files
    this.watchFiles(['package.json', 'tsconfig.json', 'next.config.js', 'tailwind.config.js']);

    // Start periodic full validation (every 10 minutes)
    this.startPeriodicValidation();

    console.log('Watching for changes...\n');
  }

  watchDirectory(dir) {
    if (!fs.existsSync(dir)) {
      return;
    }

    const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename) {
        this.handleFileChange(path.join(dir, filename));
      }
    });

    this.watchers.set(dir, watcher);
  }

  watchFiles(files) {
    files.forEach((file) => {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const watcher = fs.watch(fullPath, (eventType) => {
          this.handleFileChange(fullPath);
        });
        this.watchers.set(fullPath, watcher);
      }
    });
  }

  handleFileChange(filepath) {
    // Ignore certain files/directories
    if (this.shouldIgnore(filepath)) {
      return;
    }

    console.log(`File changed: ${path.relative(process.cwd(), filepath)}`);

    // Add to change queue
    this.changeQueue.add(filepath);

    // Determine which agents to run
    const agents = this.determineAgents(filepath);

    // Debounce agent runs
    agents.forEach((agent) => {
      if (this.debounceTimers.has(agent)) {
        clearTimeout(this.debounceTimers.get(agent));
      }

      const timer = setTimeout(() => {
        this.runAgent(agent, filepath);
        this.debounceTimers.delete(agent);
      }, this.agentConfig.throttleMs);

      this.debounceTimers.set(agent, timer);
    });
  }

  shouldIgnore(filepath) {
    const ignorePaths = [
      'node_modules',
      '.next',
      '.git',
      'coverage',
      'dist',
      'out',
      '.cache',
      'agent-report.json',
    ];

    return ignorePaths.some((ignore) => filepath.includes(ignore));
  }

  determineAgents(filepath) {
    const agents = new Set();
    const relPath = path.relative(process.cwd(), filepath);

    // Check each pattern
    Object.entries(this.filePatterns).forEach(([agent, patterns]) => {
      const shouldRun = patterns.some((pattern) => {
        return relPath.includes(pattern) || filepath.endsWith(pattern);
      });

      if (shouldRun) {
        agents.add(agent);
      }
    });

    // Always run quality check for code files
    if (filepath.match(/\.(ts|tsx|js|jsx)$/)) {
      agents.add('quality');
    }

    return Array.from(agents);
  }

  async runAgent(agentType, triggerFile) {
    // Check if agent is already running
    if (this.runningAgents.has(agentType)) {
      console.log(`Agent ${agentType} is already running, queuing...`);
      return;
    }

    // Check parallel limit
    if (this.runningAgents.size >= this.agentConfig.maxParallel) {
      console.log(`Max parallel agents reached, queuing ${agentType}...`);
      setTimeout(() => this.runAgent(agentType, triggerFile), 5000);
      return;
    }

    console.log(`\n[${new Date().toLocaleTimeString()}] Running ${agentType} agent...`);
    this.runningAgents.set(agentType, true);

    try {
      // Run agent in background
      const args = ['scripts/ai-agents/agent-system.js', agentType];

      if (this.agentConfig.autoFix && agentType === 'quality') {
        args.push('--fix');
      }

      const child = spawn('node', args, {
        stdio: 'pipe',
        shell: true,
      });

      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        console.error(`[${agentType}] Error: ${data}`);
      });

      child.on('close', (code) => {
        this.runningAgents.delete(agentType);

        // Parse and display results
        this.displayAgentResults(agentType, output, code);

        // If fixes were applied, run tests
        if (agentType === 'quality' && code === 0 && output.includes('Fixed')) {
          console.log('Fixes applied, running tests...');
          this.runAgent('test', 'auto-fix');
        }
      });
    } catch (error) {
      console.error(`Failed to run ${agentType} agent: ${error.message}`);
      this.runningAgents.delete(agentType);
    }
  }

  displayAgentResults(agentType, output, exitCode) {
    const timestamp = new Date().toLocaleTimeString();

    if (exitCode === 0) {
      // Extract key information from output
      const lines = output.split('\n');
      const relevantLines = lines.filter(
        (line) =>
          line.includes('PASS') ||
          line.includes('FAIL') ||
          line.includes('Fixed') ||
          line.includes('issues') ||
          line.includes('error') ||
          line.includes('warning')
      );

      if (relevantLines.length > 0) {
        console.log(`\n[${timestamp}] ${agentType.toUpperCase()} Results:`);
        relevantLines.forEach((line) => {
          if (line.includes('FAIL') || line.includes('error')) {
            console.error(`  ❌ ${line.trim()}`);
          } else if (line.includes('warning')) {
            console.warn(`  ⚠️  ${line.trim()}`);
          } else if (line.includes('Fixed')) {
            console.log(`  🔧 ${line.trim()}`);
          } else {
            console.log(`  ✅ ${line.trim()}`);
          }
        });
      } else {
        console.log(`[${timestamp}] ${agentType} agent: ✅ All checks passed`);
      }
    } else {
      console.error(`[${timestamp}] ${agentType} agent: ❌ Failed with code ${exitCode}`);
    }

    console.log(''); // Empty line for readability
  }

  startPeriodicValidation() {
    // Run full validation every 10 minutes
    setInterval(
      () => {
        if (this.runningAgents.size === 0) {
          console.log('\n[Periodic] Running full validation...');
          this.runFullValidation();
        }
      },
      10 * 60 * 1000
    );
  }

  async runFullValidation() {
    const orchestrator = new OrchestratorAgent();

    try {
      const results = await orchestrator.execute({
        autoFix: true,
        e2e: false, // Skip E2E for periodic checks
      });

      console.log('\n[Periodic] Validation Results:');
      console.log(`  Status: ${results.success ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`  Duration: ${results.duration}ms`);
      console.log(`  Summary: ${results.summary.passed} passed, ${results.summary.failed} failed`);

      if (results.summary.warnings > 0) {
        console.log(`  Warnings: ${results.summary.warnings}`);
      }
    } catch (error) {
      console.error('[Periodic] Validation failed:', error.message);
    }
  }

  stop() {
    console.log('\nStopping AI Agent Watcher...');

    // Clear all watchers
    this.watchers.forEach((watcher) => watcher.close());
    this.watchers.clear();

    // Clear timers
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();

    console.log('Watcher stopped.');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  if (watcher) {
    watcher.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (watcher) {
    watcher.stop();
  }
  process.exit(0);
});

// CLI interface
const watcher = new AgentWatcher();

const args = process.argv.slice(2);
const command = args[0] || 'start';

switch (command) {
  case 'start':
    watcher.start();
    break;

  case 'help':
    console.log('AI Agent Watcher - Automatic validation on file changes');
    console.log('');
    console.log('Usage: node agent-watcher.js [command]');
    console.log('');
    console.log('Commands:');
    console.log('  start    Start watching for file changes (default)');
    console.log('  help     Show this help message');
    console.log('');
    console.log('The watcher will:');
    console.log('  - Monitor file changes in src/ and tests/');
    console.log('  - Automatically run relevant agents');
    console.log('  - Fix issues automatically where possible');
    console.log('  - Run up to 3 agents in parallel');
    console.log('  - Perform periodic full validation');
    break;

  default:
    console.log(`Unknown command: ${command}`);
    console.log('Run "node agent-watcher.js help" for usage information');
}

module.exports = AgentWatcher;
