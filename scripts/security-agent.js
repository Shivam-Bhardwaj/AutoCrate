#!/usr/bin/env node

/**
 * AutoCrate Security Agent
 * Lightweight secret scanner & asset policy checker.
 *
 * Usage: node scripts/security-agent.js
 * Returns exit code 1 if any high/medium severity issues are detected.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()

const severityRank = {
  high: 3,
  medium: 2,
  low: 1,
}

const textExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.env',
  '.sh',
  '.txt',
  '.css',
  '.scss',
  '.sass',
  '.html',
  '.gitignore',
  '.cjs',
  '.mjs',
  '.tsconfig',
  '.babelrc',
  '.eslintrc',
  '',
])

const binaryExtensions = new Set([
  '.pdf',
  '.zip',
  '.stp',
  '.step',
  '.igs',
  '.iges',
  '.stl',
  '.glb',
  '.prt',
  '.exp',
])

const allowedBinaryPrefixes = ['public/', 'CAD FILES/']

const directoryRules = [
  {
    prefix: 'For Shivam/',
    severity: 'high',
    message: 'Customer crate documentation tracked in git. Move to secure storage or private artifact bucket.',
  },
]

const specialFiles = [
  {
    filename: 'test-report.json',
    severity: 'medium',
    message: 'Test reports should be ephemeral. Ensure this file stays out of git (add to .gitignore).',
  },
]

const secretPatterns = [
  {
    id: 'vercel-token',
    severity: 'high',
    message: 'Potential Vercel token committed.',
    regex: /VERCEL_TOKEN\s*=\s*(?!["']?(?:YOUR|change-me|<|REPLACE|PLACEHOLDER))[A-Za-z0-9_\-]{12,}/gi,
  },
  {
    id: 'generic-secret',
    severity: 'medium',
    message: 'Possible secret or credential assignment.',
    regex: /\b(?:secret|token|password|api[_-]?key)\b\s*[:=]\s*['"]?[A-Za-z0-9_\-\/=]{12,}['"]?/gi,
    ignore: (match) => /YOUR|CHANGE[-_ ]ME|PLACEHOLDER|EXAMPLE/i.test(match),
  },
  {
    id: 'pazz-legacy',
    severity: 'medium',
    message: 'Legacy hard-coded password detected (pazz_*). Replace with environment variable.',
    regex: /pazz_[a-z0-9]+/gi,
  },
  {
    id: 'private-key',
    severity: 'high',
    message: 'Private key material detected.',
    regex: /-----BEGIN [A-Z ]+PRIVATE KEY-----/g,
  },
]

function runGitLsFiles() {
  const output = execSync('git ls-files', { encoding: 'utf8', cwd: ROOT })
  return output.split('\n').filter(Boolean)
}

function fileIsAllowedBinary(file) {
  return allowedBinaryPrefixes.some((prefix) => file.startsWith(prefix))
}

function detectTextIssues(file, content, issues) {
  secretPatterns.forEach((pattern) => {
    const regex = pattern.regex
    regex.lastIndex = 0
    for (const match of content.matchAll(regex)) {
      if (pattern.ignore && pattern.ignore(match[0])) {
        continue
      }
      const before = content.slice(0, match.index ?? 0)
      const line = before.split(/\r?\n/).length
      const snippet = content
        .split(/\r?\n/)[line - 1]
        ?.trim()
        .slice(0, 160)

      const key = `${pattern.id}:${file}:${line}`
      if (!issues.seen.has(key)) {
        issues.seen.add(key)
        issues.list.push({
          severity: pattern.severity,
          file,
          line,
          message: pattern.message,
          snippet,
        })
      }
    }
  })
}

function scan() {
  const files = runGitLsFiles()
  const issues = { list: [], seen: new Set() }

  files.forEach((file) => {
    const filePath = path.join(ROOT, file)

    const dirRule = directoryRules.find((rule) => file.startsWith(rule.prefix))
    if (dirRule) {
      const key = `dir:${dirRule.prefix}`
      if (!issues.seen.has(key)) {
        issues.seen.add(key)
        issues.list.push({
          severity: dirRule.severity,
          file,
          message: dirRule.message,
        })
      }
    }

    const specialRule = specialFiles.find((rule) => path.basename(file) === rule.filename)
    if (specialRule) {
      const key = `special:${file}`
      if (!issues.seen.has(key)) {
        issues.seen.add(key)
        issues.list.push({
          severity: specialRule.severity,
          file,
          message: specialRule.message,
        })
      }
    }

    const ext = path.extname(file).toLowerCase()
    if (binaryExtensions.has(ext) && !fileIsAllowedBinary(file)) {
      const key = `binary:${file}`
      if (!issues.seen.has(key)) {
        issues.seen.add(key)
        issues.list.push({
          severity: 'medium',
          file,
          message: `Binary asset (${ext}) tracked outside approved directories.`,
        })
      }
      return
    }

    if (!textExtensions.has(ext) && ext.length) {
      return
    }

    let stats
    try {
      stats = fs.statSync(filePath)
    } catch (error) {
      console.warn(`WARNING: Skipping ${file}: ${error.message}`)
      return
    }

    if (stats.size > 1024 * 1024) {
      return
    }

    let content = ''
    try {
      content = fs.readFileSync(filePath, 'utf8')
    } catch (error) {
      console.warn(`WARNING: Unable to read ${file}: ${error.message}`)
      return
    }

    detectTextIssues(file, content, issues)
  })

  return issues.list.sort(
    (a, b) => severityRank[b.severity] - severityRank[a.severity]
  )
}

function report(findings) {
  if (!findings.length) {
    console.log('Security agent: no sensitive artifacts detected.')
    return 0
  }

  console.log('WARNING: Security agent detected potential issues:\n')
  findings.forEach((finding) => {
    const location = finding.line ? `${finding.file}:${finding.line}` : finding.file
    console.log(
      `  [${finding.severity.toUpperCase()}] ${location} – ${finding.message}`
    )
    if (finding.snippet) {
      console.log(`      → ${finding.snippet}`)
    }
  })
  console.log(`\nTotal findings: ${findings.length}`)

  const hasHighOrMedium = findings.some(
    (finding) => severityRank[finding.severity] >= severityRank.medium
  )

  return hasHighOrMedium ? 1 : 0
}

try {
  const findings = scan()
  const exitCode = report(findings)
  process.exit(exitCode)
} catch (error) {
  console.error('ERROR: Security agent failed:', error)
  process.exit(2)
}
