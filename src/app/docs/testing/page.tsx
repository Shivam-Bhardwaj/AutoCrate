import fs from 'fs';
import path from 'path';
import React from 'react';
import Markdown from 'react-markdown';

// Simple docs page that renders the existing TESTING.md file
export default function TestingDocsPage() {
  let markdown = '# Testing Documentation\n\nTESTING.md not found.';
  try {
    const filePath = path.join(process.cwd(), 'docs', 'TESTING.md');
    markdown = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    // ignore
  }
  return (
    <div className="prose max-w-4xl mx-auto p-6">
      <Markdown>{markdown}</Markdown>
    </div>
  );
}
