/**
 * Service for loading markdown documentation files
 */

const documentationFiles: Record<string, string> = {
  'getting-started': '/docs/getting-started.md',
  'nx-integration': '/docs/nx-integration.md',
  'api-reference': '/docs/api-reference.md',
  'keyboard-shortcuts': '/docs/keyboard-shortcuts.md',
  'troubleshooting': '/docs/troubleshooting.md',
  'contributing': '/docs/contributing.md',
  'applied-materials-standards': '/docs/applied-materials-standards.md',
  'architecture': '/docs/architecture.md',
  'critical-geometry': '/docs/critical-geometry.md',
  'traceability-matrix': '/docs/traceability-matrix.md',
};

/**
 * Load markdown content from documentation files
 */
export async function loadMarkdownFile(docId: string): Promise<string> {
  const filePath = documentationFiles[docId];
  
  if (!filePath) {
    throw new Error(`Documentation file not found: ${docId}`);
  }

  try {
    // In production, load from GitHub raw content or static files
    if (typeof window !== 'undefined') {
      // Client-side: fetch from public directory or API
      const response = await fetch(`/api/docs/${docId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documentation: ${response.status}`);
      }
      
      return await response.text();
    } else {
      // Server-side: load from file system (for SSG)
      const fs = await import('fs');
      const path = await import('path');
      
      const fullPath = path.join(process.cwd(), 'docs', `${docId}.md`);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Documentation file does not exist: ${fullPath}`);
      }
      
      return fs.readFileSync(fullPath, 'utf8');
    }
  } catch (error) {
    console.error(`Error loading markdown file ${docId}:`, error);
    throw error;
  }
}

/**
 * Get list of available documentation files
 */
export function getAvailableDocuments(): string[] {
  return Object.keys(documentationFiles);
}

/**
 * Check if a documentation file exists
 */
export function documentExists(docId: string): boolean {
  return docId in documentationFiles;
}

/**
 * Get the file path for a documentation ID
 */
export function getDocumentPath(docId: string): string | null {
  return documentationFiles[docId] || null;
}

/**
 * Search through documentation content
 */
export async function searchDocumentation(query: string): Promise<Array<{
  docId: string;
  title: string;
  excerpt: string;
  matches: number;
}>> {
  const results = [];
  const searchTerm = query.toLowerCase();
  
  for (const docId of Object.keys(documentationFiles)) {
    try {
      const content = await loadMarkdownFile(docId);
      const contentLower = content.toLowerCase();
      
      // Count matches
      const matches = (contentLower.match(new RegExp(searchTerm, 'g')) || []).length;
      
      if (matches > 0) {
        // Extract title from first heading
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : docId;
        
        // Create excerpt around first match
        const firstMatchIndex = contentLower.indexOf(searchTerm);
        const excerptStart = Math.max(0, firstMatchIndex - 100);
        const excerptEnd = Math.min(content.length, firstMatchIndex + 200);
        let excerpt = content.substring(excerptStart, excerptEnd);
        
        // Clean up excerpt
        excerpt = excerpt.replace(/#+\s+/g, '').trim();
        if (excerptStart > 0) excerpt = '...' + excerpt;
        if (excerptEnd < content.length) excerpt = excerpt + '...';
        
        results.push({
          docId,
          title,
          excerpt,
          matches,
        });
      }
    } catch (error) {
      console.warn(`Failed to search in document ${docId}:`, error);
    }
  }
  
  // Sort by relevance (number of matches)
  return results.sort((a, b) => b.matches - a.matches);
}

/**
 * Get table of contents for a document
 */
export async function getTableOfContents(docId: string): Promise<Array<{
  level: number;
  title: string;
  anchor: string;
}>> {
  try {
    const content = await loadMarkdownFile(docId);
    const headings = [];
    
    // Match all headings
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const anchor = title.toLowerCase().replace(/[^\w]+/g, '-');
      
      headings.push({
        level,
        title,
        anchor,
      });
    }
    
    return headings;
  } catch (error) {
    console.error(`Error generating table of contents for ${docId}:`, error);
    return [];
  }
}

/**
 * Extract metadata from markdown frontmatter
 */
export async function getDocumentMetadata(docId: string): Promise<{
  title?: string;
  description?: string;
  lastModified?: string;
  version?: string;
  tags?: string[];
}> {
  try {
    const content = await loadMarkdownFile(docId);
    
    // Check for frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const metadata: any = {};
      
      // Parse simple YAML-like frontmatter
      const lines = frontmatter.split('\n');
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
          
          if (key === 'tags') {
            metadata[key] = value.split(',').map(tag => tag.trim());
          } else {
            metadata[key] = value;
          }
        }
      }
      
      return metadata;
    }
    
    // Fallback: extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return {
      title: titleMatch ? titleMatch[1] : docId,
    };
  } catch (error) {
    console.error(`Error getting metadata for ${docId}:`, error);
    return {};
  }
}