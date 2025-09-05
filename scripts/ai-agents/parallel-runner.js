/**
 * Parallel Agent Runner
 * Executes multiple AI agents concurrently for faster validation
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class ParallelAgentRunner {
  constructor() {
    this.results = {};
    this.startTime = Date.now();
    this.runningProcesses = new Map();
  }

  async runAgents(agents = ['math', 'ui', 'quality', 'test'], options = {}) {
    console.log('========================================');
    console.log('   PARALLEL AI AGENT EXECUTION');
    console.log('========================================');
    console.log(`Running agents: ${agents.join(', ')}`);
    console.log(`Options: ${JSON.stringify(options)}`);
    console.log('');

    // Create agent promises
    const agentPromises = agents.map((agent) => this.runSingleAgent(agent, options));

    // Run all agents in parallel
    try {
      await Promise.all(agentPromises);
    } catch (error) {
      console.error('Error during parallel execution:', error);
    }

    // Generate summary
    this.generateSummary();

    // Save results to file
    await this.saveResults();

    return this.results;
  }

  runSingleAgent(agentType, options) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      console.log(`[${agentType}] Starting...`);

      const args = [path.join(__dirname, 'agent-system.js'), agentType];

      // Add options
      if (options.autoFix && (agentType === 'quality' || agentType === 'all')) {
        args.push('--fix');
      }
      if (options.e2e && agentType === 'test') {
        args.push('--e2e');
      }

      const child = spawn('node', args, {
        stdio: 'pipe',
        shell: true,
      });

      this.runningProcesses.set(agentType, child);

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        // Show progress in real-time
        const lines = data.toString().split('\n');
        lines.forEach((line) => {
          if (line.trim() && !line.includes('===')) {
            console.log(`[${agentType}] ${line.trim()}`);
          }
        });
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        this.runningProcesses.delete(agentType);

        // Parse results
        const result = {
          agent: agentType,
          success: code === 0,
          exitCode: code,
          duration: duration,
          output: stdout,
          errors: stderr,
          summary: this.extractSummary(stdout, agentType),
        };

        this.results[agentType] = result;

        // Display completion
        const status = result.success ? '✅ PASSED' : '❌ FAILED';
        console.log(`[${agentType}] ${status} (${duration}ms)`);

        resolve(result);
      });

      child.on('error', (error) => {
        console.error(`[${agentType}] Process error: ${error.message}`);
        this.runningProcesses.delete(agentType);

        this.results[agentType] = {
          agent: agentType,
          success: false,
          error: error.message,
          duration: Date.now() - startTime,
        };

        resolve(this.results[agentType]);
      });
    });
  }

  extractSummary(output, agentType) {
    const summary = {
      issues: [],
      fixes: [],
      warnings: [],
    };

    const lines = output.split('\n');

    lines.forEach((line) => {
      if (line.includes('error') || line.includes('ERROR')) {
        summary.issues.push(line.trim());
      } else if (line.includes('Fixed') || line.includes('fixed')) {
        summary.fixes.push(line.trim());
      } else if (line.includes('warning') || line.includes('WARNING')) {
        summary.warnings.push(line.trim());
      }
    });

    // Agent-specific parsing
    switch (agentType) {
      case 'test':
        const testMatch = output.match(/(\d+) total.*?(\d+) failed/);
        if (testMatch) {
          summary.testsTotal = parseInt(testMatch[1]);
          summary.testsFailed = parseInt(testMatch[2]);
        }
        break;

      case 'quality':
        if (output.includes('ESLint')) {
          summary.lintingPassed = !output.includes('error');
        }
        if (output.includes('TypeScript')) {
          summary.typeCheckPassed = !output.includes('error TS');
        }
        break;
    }

    return summary;
  }

  generateSummary() {
    const totalDuration = Date.now() - this.startTime;
    const passedAgents = Object.values(this.results).filter((r) => r.success).length;
    const totalAgents = Object.keys(this.results).length;

    console.log('');
    console.log('========================================');
    console.log('           EXECUTION SUMMARY');
    console.log('========================================');
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log(`Agents Passed: ${passedAgents}/${totalAgents}`);
    console.log('');

    // Individual agent summaries
    Object.entries(this.results).forEach(([agent, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${agent.toUpperCase()}`);
      console.log(`   Duration: ${result.duration}ms`);

      if (result.summary) {
        if (result.summary.issues.length > 0) {
          console.log(`   Issues: ${result.summary.issues.length}`);
        }
        if (result.summary.fixes.length > 0) {
          console.log(`   Fixes Applied: ${result.summary.fixes.length}`);
        }
        if (result.summary.warnings.length > 0) {
          console.log(`   Warnings: ${result.summary.warnings.length}`);
        }
        if (result.summary.testsTotal) {
          console.log(
            `   Tests: ${result.summary.testsTotal - result.summary.testsFailed}/${result.summary.testsTotal} passed`
          );
        }
      }
    });

    // Overall status
    console.log('');
    if (passedAgents === totalAgents) {
      console.log('🎉 All agents passed successfully!');
    } else {
      console.log(`⚠️  ${totalAgents - passedAgents} agent(s) failed. Review the output above.`);
    }
    console.log('========================================');
  }

  async saveResults() {
    const reportPath = path.join(process.cwd(), 'parallel-agent-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      results: this.results,
      summary: {
        total: Object.keys(this.results).length,
        passed: Object.values(this.results).filter((r) => r.success).length,
        failed: Object.values(this.results).filter((r) => !r.success).length,
      },
    };

    try {
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`\nDetailed report saved to: ${reportPath}`);
    } catch (error) {
      console.error('Failed to save report:', error.message);
    }
  }

  async quickValidation() {
    // Fast validation - only critical agents
    console.log('Running quick validation (math, quality)...\n');
    return this.runAgents(['math', 'quality'], { autoFix: true });
  }

  async fullValidation() {
    // Complete validation - all agents
    console.log('Running full validation (all agents)...\n');
    return this.runAgents(['math', 'ui', 'quality', 'test'], { autoFix: true });
  }

  async preDeployValidation() {
    // Pre-deployment validation
    console.log('Running pre-deployment validation...\n');
    return this.runAgents(['math', 'ui', 'quality', 'test', 'deploy'], {
      autoFix: true,
      e2e: true,
    });
  }

  killAll() {
    // Kill all running processes
    this.runningProcesses.forEach((process, agent) => {
      console.log(`Killing ${agent} agent...`);
      process.kill();
    });
    this.runningProcesses.clear();
  }
}

// CLI interface
async function main() {
  const runner = new ParallelAgentRunner();
  const args = process.argv.slice(2);
  const command = args[0] || 'quick';

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\nReceived interrupt signal, stopping agents...');
    runner.killAll();
    process.exit(1);
  });

  try {
    switch (command) {
      case 'quick':
        await runner.quickValidation();
        break;

      case 'full':
        await runner.fullValidation();
        break;

      case 'deploy':
        await runner.preDeployValidation();
        break;

      case 'custom':
        // Custom agents from command line
        const agents = args.slice(1).filter((a) => !a.startsWith('--'));
        const options = {
          autoFix: args.includes('--fix'),
          e2e: args.includes('--e2e'),
        };

        if (agents.length === 0) {
          console.log('No agents specified for custom run');
          process.exit(1);
        }

        await runner.runAgents(agents, options);
        break;

      case 'help':
      default:
        console.log('Parallel Agent Runner - Run multiple agents concurrently');
        console.log('');
        console.log('Usage: node parallel-runner.js [command] [options]');
        console.log('');
        console.log('Commands:');
        console.log('  quick    Quick validation (math, quality) - DEFAULT');
        console.log('  full     Full validation (all agents)');
        console.log('  deploy   Pre-deployment validation (all + deploy agent)');
        console.log('  custom   Run specific agents');
        console.log('  help     Show this help');
        console.log('');
        console.log('Custom usage:');
        console.log('  node parallel-runner.js custom math ui quality --fix');
        console.log('');
        console.log('Options:');
        console.log('  --fix    Enable auto-fix for quality agent');
        console.log('  --e2e    Include E2E tests');
        break;
    }

    // Exit with appropriate code
    const allPassed = Object.values(runner.results).every((r) => r.success);
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Export for use as module
module.exports = ParallelAgentRunner;

// Run if called directly
if (require.main === module) {
  main();
}
