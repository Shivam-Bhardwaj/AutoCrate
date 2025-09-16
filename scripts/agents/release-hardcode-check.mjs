#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const scanDirectories = ['src', 'tests', 'scripts']
const skipDirectories = new Set(['node_modules', '.next', '.git', 'coverage', 'dist', 'build', 'out'])
const allowedFiles = new Set([
  path.join('src', 'data', 'product-metadata.ts'),
  path.join('scripts', 'agents', 'release-hardcode-check.mjs')
])

const fileExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])

const patterns = [
  {
    regex: /version\s*:\s*['"]\d+\.\d+\.\d+['"]/g,
    message: 'Hardcoded semantic version literal detected'
  },
  {
    regex: /AUTOCRATE_TEMPLATE_V\d+\.\d+\.\d+/g,
    message: 'Hardcoded AutoCrate template identifier detected'
  }
]

const matches = []

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue
    }

    const fullPath = path.join(directory, entry.name)
    const relativePath = path.relative(projectRoot, fullPath)

    if (entry.isDirectory()) {
      if (skipDirectories.has(entry.name)) {
        continue
      }
      await walk(fullPath)
      continue
    }

    const extension = path.extname(entry.name)
    if (!fileExtensions.has(extension)) {
      continue
    }

    if (allowedFiles.has(relativePath)) {
      continue
    }

    await inspectFile(fullPath, relativePath)
  }
}

const inspectFile = async (fullPath, relativePath) => {
  const content = await readFile(fullPath, 'utf8')

  patterns.forEach(({ regex, message }) => {
    regex.lastIndex = 0
    let match
    while ((match = regex.exec(content)) !== null) {
      const line = content.slice(0, match.index).split('\n').length
      matches.push({
        file: relativePath,
        line,
        fragment: match[0],
        message
      })
    }
  })
}

const main = async () => {
  for (const directory of scanDirectories) {
    const absolute = path.join(projectRoot, directory)
    try {
      const stats = await stat(absolute)
      if (stats.isDirectory()) {
        await walk(absolute)
      }
    } catch (error) {
      // Ignore missing directories (e.g., no tests directory)
    }
  }

  if (matches.length > 0) {
    console.error('\n🚫 Release metadata hardcode violations found:')
    for (const violation of matches) {
      console.error(`  - ${violation.file}:${violation.line} → ${violation.message} (${violation.fragment})`)
    }
    console.error('\nPlease reference releaseIdentity.version or releaseIdentity.templateVersion instead of hardcoded literals.')
    process.exitCode = 1
    return
  }

  console.log('✅ No hardcoded release metadata detected')
}

main().catch((error) => {
  console.error('Failed to run release hardcode check:', error)
  process.exitCode = 1
})
