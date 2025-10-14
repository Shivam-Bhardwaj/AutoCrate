'use client'

import { useState, useEffect } from 'react'
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
  const match = branch.match(/issue-(\d+)/i)
  return match ? match[1] : null
}

function parseChangeInfo(metadata: ProjectMetadata): ChangeInfo | null {
  const issueNumber = parseIssueFromBranch(metadata.branch) ||
                      metadata.tiNumber.replace(/^TI-/, '')

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
  const [isExpanded, setIsExpanded] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

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

  const toggleCheck = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const getTypeIcon = (type: TestItem['type']) => {
    switch (type) {
      case 'visual':
        return '👁️'
      case 'interaction':
        return '🖱️'
      case 'functional':
        return '⚙️'
      default:
        return '✓'
    }
  }

  const getTypeColor = (type: TestItem['type']) => {
    switch (type) {
      case 'visual':
        return 'text-blue-600 dark:text-blue-400'
      case 'interaction':
        return 'text-purple-600 dark:text-purple-400'
      case 'functional':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
      {/* Compact header bar */}
      <div
        className="px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 text-xs">
          {/* Issue badge */}
          <a
            href={`https://github.com/Shivam-Bhardwaj/AutoCrate/issues/${changeInfo.issueNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-mono">#{changeInfo.issueNumber}</span>
          </a>

          {/* Change title */}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {changeInfo.title}
          </span>

          {/* Version and commit */}
          <span className="text-gray-500 dark:text-gray-400">
            v{metadata.version} • {metadata.lastCommit}
          </span>
        </div>

        {/* Expand/collapse indicator */}
        <div className="flex items-center gap-2">
          {changeInfo.testItems.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {checkedItems.size}/{changeInfo.testItems.length} tested
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expandable test checklist */}
      {isExpanded && (
        <div className="px-3 pb-2 border-t border-gray-100 dark:border-gray-800">
          <div className="mt-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Visual Testing Checklist:
            </h4>
            <div className="space-y-1">
              {changeInfo.testItems.map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={checkedItems.has(item.id)}
                    onChange={() => toggleCheck(item.id)}
                    className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-xs ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                  </span>
                  <span className={`text-xs ${checkedItems.has(item.id) ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional metadata */}
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <span>{metadata.branch}</span>
              <span>•</span>
              <span>by {metadata.updatedBy.split('@')[0]}</span>
              <span>•</span>
              <span>{new Date(metadata.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}