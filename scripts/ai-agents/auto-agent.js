/**
 * AutoCrate Automatic Agent Runner
 * Runs validation agents automatically in background
 */

const { spawn } = require('child_process');
const path = require('path');

class AutoAgent {
  constructor() {
    this.isRunning = false;
    this.lastRun = 0;
    this.minInterval = 5000; // Minimum 5 seconds between runs
  }

  async runValidation(trigger = 'auto') {
    // Prevent multiple simultaneous runs
    if (this.isRunning) return;

    // Throttle runs
    const now = Date.now();
    if (now - this.lastRun < this.minInterval) return;

    this.isRunning = true;
    this.lastRun = now;

    // Run math and quality agents in parallel (fastest combo)
    const agents = ['math', 'quality'];
    const promises = agents.map((agent) => this.runAgent(agent));

    try {
      const results = await Promise.all(promises);
      const allPassed = results.every((r) => r.success);

      if (!allPassed) {
        console.log('[AutoAgent] Issues detected, check output above');
      }
    } catch (error) {
      console.error('[AutoAgent] Error:', error.message);
    }

    this.isRunning = false;
  }

  runAgent(type) {
    return new Promise((resolve) => {
      const args = ['scripts/ai-agents/agent-system.js', type];

      // Auto-fix for quality agent
      if (type === 'quality') {
        args.push('--fix');
      }

      const child = spawn('node', args, {
        stdio: 'pipe',
        shell: true,
      });

      let hasIssues = false;

      child.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('FAIL') || output.includes('error')) {
          hasIssues = true;
        }
      });

      child.on('close', (code) => {
        resolve({
          success: code === 0 && !hasIssues,
          agent: type,
        });
      });
    });
  }
}

// Export singleton
module.exports = new AutoAgent();
