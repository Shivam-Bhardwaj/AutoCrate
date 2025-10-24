'use client'

import { Fragment, useState, useEffect } from 'react'
import type { ProjectMetadata } from '@/app/api/last-update/route'

interface TestItem {
  id: string
  description: string
  type: 'visual' | 'functional' | 'interaction'
}

interface ChangeInfo {
  issueNumber: string
  title: string
  testItems: TestItem[]
}

function parseIssueFromBranch(branch: string): string | null {
  // Extract issue number from branch name (e.g., feature/issue-69-change-tracking -> 69)
  const match = branch.match(/issue[_-](\d+)/i)
  return match ? match[1] : null
}

function deriveIssueNumber(metadata: ProjectMetadata): string {
  const normalizedIssue = metadata.issueNumber?.trim()
  if (normalizedIssue && normalizedIssue !== '0') {
    return normalizedIssue
  }

  const branchIssue = parseIssueFromBranch(metadata.branch)
  if (branchIssue) {
    return branchIssue
  }

  const commitMatch = metadata.lastChange?.match(/\(#(\d+)\)/)
  if (commitMatch?.[1]) {
    return commitMatch[1]
  }

  const tiMatch = metadata.tiNumber?.match(/(\d+)/)
  if (tiMatch?.[1]) {
    return tiMatch[1]
  }

  return '0'
}

function parseChangeInfo(metadata: ProjectMetadata): ChangeInfo | null {
  const issueNumber = deriveIssueNumber(metadata)

  // Extract simple title from commit message (first line, remove prefixes)
  const title = metadata.lastChange
    .split('\n')[0]
    .replace(/^(feat|fix|chore|docs|test|refactor|style|perf):\s*/i, '')
    .trim()

  // Generate test items based on the change type
  const testItems: TestItem[] = []

  // Auto-generate test suggestions based on keywords in the title
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes('ui') || lowerTitle.includes('display') || lowerTitle.includes('visual')) {
    testItems.push({
      id: 'visual-1',
      description: 'Check that the UI displays correctly',
      type: 'visual'
    })
  }

  if (lowerTitle.includes('3d') || lowerTitle.includes('visualization') || lowerTitle.includes('crate')) {
    testItems.push({
      id: 'visual-2',
      description: 'Verify 3D crate visualization renders properly',
      type: 'visual'
    })
  }

  if (lowerTitle.includes('button') || lowerTitle.includes('click') || lowerTitle.includes('toggle')) {
    testItems.push({
      id: 'interaction-1',
      description: 'Test interactive elements respond correctly',
      type: 'interaction'
    })
  }

  if (lowerTitle.includes('export') || lowerTitle.includes('download') || lowerTitle.includes('step')) {
    testItems.push({
      id: 'functional-1',
      description: 'Verify file export/download works',
      type: 'functional'
    })
  }

  // Default test item if no specific ones were added
  if (testItems.length === 0) {
    testItems.push({
      id: 'general-1',
      description: 'Verify the change works as expected',
      type: 'functional'
    })
  }

  return {
    issueNumber,
    title,
    testItems
  }
}

export function ChangeTracker() {
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null)
  const [changeInfo, setChangeInfo] = useState<ChangeInfo | null>(null)

  useEffect(() => {
    fetch('/api/last-update')
      .then(res => res.json())
      .then((data: ProjectMetadata) => {
        setMetadata(data)
        setChangeInfo(parseChangeInfo(data))
      })
      .catch(() => {
        setMetadata(null)
        setChangeInfo(null)
      })
  }, [])

  if (!metadata || !changeInfo) return null

  const issueNumber = changeInfo.issueNumber
  const hasIssueLink = issueNumber !== '0'
  const issueLabel = hasIssueLink ? `Issue #${issueNumber}` : 'Issue #N/A'
  const issueHref = hasIssueLink
    ? `https://github.com/Shivam-Bhardwaj/AutoCrate/issues/${issueNumber}`
    : undefined
  const contributor = metadata.updatedBy?.split('@')[0] ?? 'unknown'
  const formattedTimestamp = metadata.timestamp ? new Date(metadata.timestamp).toLocaleString() : null

  const headerSegments: Array<{ id: string; node: JSX.Element }> = [
    {
      id: 'title',
      node: (
        <span className="font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
          {changeInfo.title}
        </span>
      )
    },
    {
      id: 'version',
      node: (
        <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
          v{metadata.version}
        </span>
      )
    }
  ]

  if (metadata.lastCommit) {
    headerSegments.push({
      id: 'commit',
      node: (
        <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 font-mono">
          {metadata.lastCommit}
        </span>
      )
    })
  }

  headerSegments.push({
    id: 'contributor',
    node: (
      <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
        by {contributor}
      </span>
    )
  })

  if (formattedTimestamp) {
    headerSegments.push({
      id: 'timestamp',
      node: (
        <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
          {formattedTimestamp}
        </span>
      )
    })
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div className="px-3 py-1.5">
        <div className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap overflow-x-auto">
          {/* Issue badge */}
          {hasIssueLink ? (
            <a
              href={issueHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 flex-shrink-0"
            >
              <span className="font-mono">{issueLabel}</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full flex-shrink-0">
              <span className="font-mono">{issueLabel}</span>
            </span>
          )}

          {headerSegments.map(segment => (
            <Fragment key={segment.id}>
              <span className="text-gray-400 dark:text-gray-600 flex-shrink-0" aria-hidden="true">
                •
              </span>
              {segment.node}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
