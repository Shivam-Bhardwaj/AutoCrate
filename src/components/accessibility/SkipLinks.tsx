'use client'

import { useEffect } from 'react'

export function SkipLinks() {
  useEffect(() => {
    // Add skip links to the document
    const skipLinksContainer = document.createElement('div')
    skipLinksContainer.className = 'skip-links'
    skipLinksContainer.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#configuration-panel" class="skip-link">Skip to configuration panel</a>
      <a href="#3d-viewer" class="skip-link">Skip to 3D viewer</a>
      <a href="#validation-panel" class="skip-link">Skip to validation panel</a>
      <a href="#export-panel" class="skip-link">Skip to export panel</a>
    `
    
    document.body.insertBefore(skipLinksContainer, document.body.firstChild)
    
    return () => {
      if (skipLinksContainer.parentNode) {
        skipLinksContainer.parentNode.removeChild(skipLinksContainer)
      }
    }
  }, [])

  return null
}

// CSS for skip links (should be added to global CSS)
export const skipLinksCSS = `
.skip-links {
  position: absolute;
  top: -100px;
  left: 0;
  z-index: 1000;
}

.skip-link {
  position: absolute;
  top: -100px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 0 0 4px 4px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1001;
  transition: top 0.3s ease;
}

.skip-link:focus {
  top: 0;
  outline: 2px solid #fff;
  outline-offset: -2px;
}

.skip-link:hover {
  background: #333;
}
`
