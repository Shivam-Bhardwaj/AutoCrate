import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export interface ProjectMetadata {
  version: string
  tiNumber: string  // Deprecated - kept for backwards compatibility
  issueNumber: string  // Current issue being worked on
  branch: string
  lastCommit: string
  lastChange: string
  timestamp: string
  updatedBy: string
  testInstructions?: string[]
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

  // Extract issue number from branch name (e.g., feature/issue-69-description -> 69)
  const issueMatch = branch.match(/issue-(\d+)/i)
  const issueNumber = issueMatch ? issueMatch[1] : '0'

  // Generate smart test instructions based on commit message
  const testInstructions: string[] = []
  const lowerChange = lastChange.toLowerCase()

  if (lowerChange.includes('ui') || lowerChange.includes('display') || lowerChange.includes('component')) {
    testInstructions.push('Check UI components render correctly')
  }
  if (lowerChange.includes('3d') || lowerChange.includes('visualization')) {
    testInstructions.push('Verify 3D visualization works properly')
  }
  if (lowerChange.includes('export') || lowerChange.includes('download')) {
    testInstructions.push('Test file export functionality')
  }
  if (lowerChange.includes('fix')) {
    testInstructions.push('Verify the bug fix resolves the issue')
  }
  if (lowerChange.includes('add') || lowerChange.includes('feat')) {
    testInstructions.push('Test the new feature thoroughly')
  }

  const metadata: ProjectMetadata = {
    version: packageJson.version || '1.0.0',
    tiNumber: `TI-${issueNumber}`,  // Kept for backwards compatibility
    issueNumber,  // The actual issue number
    branch,
    lastCommit,
    lastChange,
    timestamp,
    updatedBy,
    testInstructions: testInstructions.length > 0 ? testInstructions : ['Verify changes work as expected']
  }

  return NextResponse.json(metadata)
}
