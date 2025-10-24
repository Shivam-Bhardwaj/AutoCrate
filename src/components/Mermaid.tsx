'use client'

import { useEffect, useId, useRef, useState } from 'react'

declare global {
  interface Window {
    mermaid?: any
  }
}

type MermaidProps = {
  chart: string
  className?: string
  theme?: 'default' | 'dark' | 'neutral' | 'forest'
}

export default function Mermaid({ chart, className, theme = 'default' }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const renderId = useId().replace(/:/g, '-')

  useEffect(() => {
    let cancelled = false

    async function ensureMermaid() {
      if (window.mermaid) return
      await new Promise<void>((resolve, reject) => {
        const existing = document.querySelector('script[data-mermaid="1"]') as HTMLScriptElement | null
        if (existing) {
          existing.addEventListener('load', () => resolve(), { once: true })
          existing.addEventListener('error', () => reject(new Error('Failed to load mermaid')), { once: true })
          return
        }
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
        s.async = true
        s.defer = true
        s.dataset.mermaid = '1'
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('Failed to load mermaid'))
        document.head.appendChild(s)
      })
      if (!window.mermaid) throw new Error('Mermaid not available after load')
      window.mermaid.initialize({ startOnLoad: false, theme, securityLevel: 'strict' })
    }

    async function render() {
      try {
        await ensureMermaid()
        if (cancelled) return
        const { svg } = await window.mermaid.render(`m-${renderId}`, chart)
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
          setReady(true)
        }
      } catch {
        setReady(false)
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [chart, renderId, theme])

  return (
    <div ref={containerRef} className={className}>
      {!ready && (
        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
{chart}
        </pre>
      )}
    </div>
  )
}

