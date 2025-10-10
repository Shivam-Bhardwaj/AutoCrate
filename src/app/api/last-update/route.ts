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

async function readPackageJson() {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json')
    const packageJsonContent = await readFile(packageJsonPath, 'utf-8')
    return JSON.parse(packageJsonContent)
  } catch {
    return {}
  }
}

export async function GET() {
  const packageJson = await readPackageJson()

  const { execSync } = await import('node:child_process')
  const safeExec = (command: string) => {
    try {
      return execSync(command, { encoding: 'utf-8' }).trim()
    } catch {
      return undefined
    }
  }

  const vercelBranch = process.env.VERCEL_GIT_COMMIT_REF
  const vercelSha = process.env.VERCEL_GIT_COMMIT_SHA
  const vercelMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE
  const vercelTimestamp = process.env.VERCEL_GIT_COMMIT_AUTHOR_DATE || process.env.VERCEL_GIT_COMMIT_COMMITTED_AT
  const vercelAuthor =
    process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN ||
    process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME ||
    process.env.VERCEL_GIT_COMMIT_AUTHOR_EMAIL

  const branch = vercelBranch || safeExec('git rev-parse --abbrev-ref HEAD') || 'unknown'
  const lastCommit =
    (vercelSha && vercelSha.substring(0, 7)) || safeExec('git log -1 --format=%h') || 'unknown'
  const lastChange = vercelMessage || safeExec('git log -1 --format=%s') || 'Git metadata unavailable'
  const timestamp =
    vercelTimestamp || safeExec('git log -1 --format=%cI') || new Date().toISOString()
  const updatedBy = packageJson.maintainer || vercelAuthor || 'unknown@designviz.com'

  const metadata: ProjectMetadata = {
    version: packageJson.version || '1.0.0',
    tiNumber: packageJson.tiNumber || 'TI-000',
    branch,
    lastCommit,
    lastChange,
    timestamp,
    updatedBy
  }

  return NextResponse.json(metadata)
}
