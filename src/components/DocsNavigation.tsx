'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface DocsNavigationProps {
  sections: DocSection[];
  selectedDoc: string;
  onDocumentSelect: (docId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function DocsNavigation({
  sections,
  selectedDoc,
  onDocumentSelect,
  searchQuery,
  onSearchChange,
}: DocsNavigationProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started']));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const groupedSections = {
    'Getting Started': ['getting-started'],
    'NX Integration': ['nx-integration', 'applied-materials-standards'],
    'Reference': ['api-reference', 'keyboard-shortcuts'],
    'Development': ['architecture', 'contributing'],
    'Support': ['troubleshooting'],
  };

  return (
    <div className="p-4 h-full">
      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Quick Links
        </h3>
        <div className="space-y-2">
          <a
            href="https://autocrate.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <span>🚀</span>
            Live Application
          </a>
          <a
            href="https://github.com/applied-materials/autocrate"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <span>📋</span>
            GitHub Repository
          </a>
          <a
            href="https://github.com/applied-materials/autocrate/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <span>🐛</span>
            Report Issues
          </a>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="space-y-4">
        {searchQuery ? (
          // Show filtered results when searching
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Search Results ({sections.length})
            </h3>
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onDocumentSelect(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedDoc === section.id
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{section.icon}</span>
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 ml-6">
                    {section.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Show grouped navigation when not searching
          Object.entries(groupedSections).map(([groupName, sectionIds]) => {
            const groupSections = sections.filter(section => sectionIds.includes(section.id));
            if (groupSections.length === 0) return null;

            return (
              <div key={groupName}>
                <button
                  onClick={() => toggleSection(groupName)}
                  className="flex items-center justify-between w-full text-left mb-2"
                >
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {groupName}
                  </h3>
                  <span className="text-gray-400 text-xs">
                    {expandedSections.has(groupName) ? '▼' : '▶'}
                  </span>
                </button>
                
                {expandedSections.has(groupName) && (
                  <div className="space-y-1 ml-2">
                    {groupSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => onDocumentSelect(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedDoc === section.id
                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{section.icon}</span>
                          <span className="font-medium">{section.title}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 ml-6">
                          {section.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-500">
        <div className="space-y-1">
          <div>AutoCrate v3.0.0</div>
          <div>Applied Materials, Inc.</div>
          <div>© 2025 All rights reserved</div>
        </div>
      </div>
    </div>
  );
}