import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export interface ProjectMetadata {
  version: string
  tiNumber: string
  branch: string
  lastCommit: string
  lastChange: string
  timestamp: string
  updatedBy: string
}

export async function GET() {
  try {
    const { execSync } = await import('node:child_process')

    // Read package.json for version, TI number, and maintainer
    const packageJsonPath = join(process.cwd(), 'package.json')
    const packageJsonContent = await readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageJsonContent)

    // Get git metadata
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
    const lastCommit = execSync('git log -1 --format=%h', { encoding: 'utf-8' }).trim()
    const lastChange = execSync('git log -1 --format=%s', { encoding: 'utf-8' }).trim()
    const timestamp = execSync('git log -1 --format=%cI', { encoding: 'utf-8' }).trim()

    const metadata: ProjectMetadata = {
      version: packageJson.version || '1.0.0',
      tiNumber: packageJson.tiNumber || 'TI-000',
      branch,
      lastCommit,
      lastChange,
      timestamp,
      updatedBy: packageJson.maintainer || 'unknown@designviz.com'
    }

    return NextResponse.json(metadata)
  } catch (error) {
    // Fallback when git or file system is unavailable
    const fallbackMetadata: ProjectMetadata = {
      version: '1.0.0',
      tiNumber: 'TI-000',
      branch: 'unknown',
      lastCommit: 'unknown',
      lastChange: 'Git metadata unavailable',
      timestamp: new Date().toISOString(),
      updatedBy: 'unknown@designviz.com'
    }
    return NextResponse.json(fallbackMetadata, { status: 200 })
  }
}
