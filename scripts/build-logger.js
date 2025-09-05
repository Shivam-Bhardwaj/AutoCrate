const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildLogger {
  constructor() {
    this.logsDir = path.join(process.cwd(), 'build-logs');
    this.currentLogFile = null;
    this.startTime = null;
    this.verbose = process.env.VERBOSE === 'true';

    // Ensure logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  start(buildType = 'build') {
    this.startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentLogFile = path.join(this.logsDir, `${buildType}-${timestamp}.log`);

    // Write header
    this.writeHeader(buildType);

    return this.currentLogFile;
  }

  writeHeader(buildType) {
    const header = [
      '='.repeat(80),
      `BUILD LOG - ${buildType.toUpperCase()}`,
      `Started: ${new Date().toISOString()}`,
      `Node Version: ${process.version}`,
      `Platform: ${process.platform} ${process.arch}`,
      `Working Directory: ${process.cwd()}`,
      '='.repeat(80),
      '',
    ].join('\n');

    this.write(header);
    this.logSystemInfo();
  }

  logSystemInfo() {
    this.section('System Information');

    try {
      // Memory info
      const memInfo = process.memoryUsage();
      this.info(
        `Memory - RSS: ${this.formatBytes(memInfo.rss)}, Heap Used: ${this.formatBytes(memInfo.heapUsed)}`
      );

      // Package versions
      const pkg = require('../package.json');
      this.info(`Project: ${pkg.name}@${pkg.version}`);

      // Key dependencies
      this.subsection('Key Dependencies');
      const deps = ['next', 'react', 'typescript', '@types/node'];
      deps.forEach((dep) => {
        if (pkg.dependencies && pkg.dependencies[dep]) {
          this.info(`  ${dep}: ${pkg.dependencies[dep]}`);
        }
      });

      // Environment
      this.subsection('Environment Variables');
      this.info(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
      this.info(`CI: ${process.env.CI || 'false'}`);
    } catch (error) {
      this.error(`Failed to gather system info: ${error.message}`);
    }
  }

  section(title) {
    const section = ['', '-'.repeat(60), title.toUpperCase(), '-'.repeat(60)].join('\n');

    this.write(section);
    console.log(`\n[BUILD] ${title}`);
  }

  subsection(title) {
    this.write(`\n--- ${title} ---`);
  }

  info(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [INFO] ${message}`;
    this.write(logLine);

    if (this.verbose) {
      console.log(`[INFO] ${message}`);
    }
  }

  warn(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [WARN] ${message}`;
    this.write(logLine);
    console.warn(`[WARN] ${message}`);
  }

  error(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [ERROR] ${message}`;
    this.write(logLine);
    console.error(`[ERROR] ${message}`);
  }

  success(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [SUCCESS] ${message}`;
    this.write(logLine);
    console.log(`[SUCCESS] ${message}`);
  }

  command(cmd, options = {}) {
    this.section(`Executing: ${cmd}`);
    const startTime = Date.now();

    try {
      this.info(`Command: ${cmd}`);
      this.info(`Working Directory: ${options.cwd || process.cwd()}`);

      const output = execSync(cmd, {
        encoding: 'utf8',
        stdio: 'pipe',
        ...options,
      });

      const duration = Date.now() - startTime;

      if (output) {
        this.subsection('Output');
        this.write(output);
      }

      this.success(`Command completed in ${this.formatDuration(duration)}`);

      return { success: true, output, duration };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.error(`Command failed after ${this.formatDuration(duration)}`);

      if (error.stdout) {
        this.subsection('Stdout');
        this.write(error.stdout.toString());
      }

      if (error.stderr) {
        this.subsection('Stderr');
        this.write(error.stderr.toString());
      }

      this.error(`Exit Code: ${error.status || 'unknown'}`);
      this.error(`Error: ${error.message}`);

      return { success: false, error, duration };
    }
  }

  metrics(label, data) {
    this.subsection(`Metrics: ${label}`);

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object') {
        this.info(`  ${key}:`);
        Object.entries(value).forEach(([subKey, subValue]) => {
          this.info(`    ${subKey}: ${subValue}`);
        });
      } else {
        this.info(`  ${key}: ${value}`);
      }
    });
  }

  buildSummary(results) {
    this.section('Build Summary');

    const duration = Date.now() - this.startTime;

    this.info(`Total Duration: ${this.formatDuration(duration)}`);
    this.info(`Status: ${results.success ? 'SUCCESS' : 'FAILED'}`);

    if (results.stats) {
      this.subsection('Build Statistics');
      Object.entries(results.stats).forEach(([key, value]) => {
        this.info(`  ${key}: ${value}`);
      });
    }

    if (results.errors && results.errors.length > 0) {
      this.subsection('Errors Summary');
      results.errors.forEach((error, index) => {
        this.error(`  ${index + 1}. ${error}`);
      });
    }

    if (results.warnings && results.warnings.length > 0) {
      this.subsection('Warnings Summary');
      results.warnings.forEach((warning, index) => {
        this.warn(`  ${index + 1}. ${warning}`);
      });
    }
  }

  write(message) {
    if (this.currentLogFile) {
      try {
        fs.appendFileSync(this.currentLogFile, message + '\n');
      } catch (err) {
        console.error(`Write error: ${err.message}`);
      }
    }
  }

  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  formatDuration(ms) {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(0);
      return `${minutes}m ${seconds}s`;
    }
  }

  analyzeBuildOutput(outputPath) {
    if (!fs.existsSync(outputPath)) {
      this.warn(`Build output path does not exist: ${outputPath}`);
      return;
    }

    this.section('Build Output Analysis');

    const stats = this.getDirectoryStats(outputPath);

    this.subsection('Output Statistics');
    this.info(`Total Files: ${stats.fileCount}`);
    this.info(`Total Size: ${this.formatBytes(stats.totalSize)}`);
    this.info(
      `Largest File: ${stats.largestFile.name} (${this.formatBytes(stats.largestFile.size)})`
    );

    // Analyze by file type
    this.subsection('Files by Type');
    Object.entries(stats.byExtension).forEach(([ext, data]) => {
      this.info(`  .${ext}: ${data.count} files, ${this.formatBytes(data.size)}`);
    });
  }

  getDirectoryStats(dir, stats = null) {
    if (!stats) {
      stats = {
        fileCount: 0,
        totalSize: 0,
        byExtension: {},
        largestFile: { name: '', size: 0 },
      };
    }

    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        this.getDirectoryStats(filePath, stats);
      } else {
        stats.fileCount++;
        stats.totalSize += stat.size;

        const ext = path.extname(file).slice(1) || 'no-ext';
        if (!stats.byExtension[ext]) {
          stats.byExtension[ext] = { count: 0, size: 0 };
        }
        stats.byExtension[ext].count++;
        stats.byExtension[ext].size += stat.size;

        if (stat.size > stats.largestFile.size) {
          stats.largestFile = {
            name: path.relative(process.cwd(), filePath),
            size: stat.size,
          };
        }
      }
    });

    return stats;
  }

  close() {
    if (this.currentLogFile) {
      const duration = Date.now() - this.startTime;

      this.write('\n' + '='.repeat(80));
      this.write(`Build completed at: ${new Date().toISOString()}`);
      this.write(`Total Duration: ${this.formatDuration(duration)}`);
      this.write(`Log file: ${this.currentLogFile}`);
      this.write('='.repeat(80));

      // Clean up old logs (keep last 10)
      this.cleanupOldLogs();

      return {
        logFile: this.currentLogFile,
        duration: duration,
      };
    }
  }

  cleanupOldLogs() {
    try {
      if (!fs.existsSync(this.logsDir)) {
        return;
      }

      const logs = fs
        .readdirSync(this.logsDir)
        .filter((file) => file.endsWith('.log'))
        .map((file) => ({
          name: file,
          path: path.join(this.logsDir, file),
          time: fs.statSync(path.join(this.logsDir, file)).mtime,
        }))
        .sort((a, b) => b.time - a.time);

      // Keep only the last 10 logs
      if (logs.length > 10) {
        logs.slice(10).forEach((log) => {
          fs.unlinkSync(log.path);
          this.info(`Removed old log: ${log.name}`);
        });
      }
    } catch (error) {
      // Silently ignore cleanup errors
    }
  }
}

module.exports = BuildLogger;
