'use client'

import { useId, useMemo } from 'react'
import { latestRelease, productMetadata } from '@/data/product-metadata'
import { Box } from 'lucide-react'

type ReleaseInfo = typeof latestRelease

const formatReleaseDate = (releasedAt: ReleaseInfo['releasedAt']) => {
  const releaseDate = new Date(releasedAt)
  if (Number.isNaN(releaseDate.getTime())) {
    return null
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium'
    }).format(releaseDate)
  } catch {
    return null
  }
}

export function ReleaseChangelogTooltip() {
  const tooltipId = useId()
  const release = latestRelease

  const formattedReleaseDate = useMemo(
    () => formatReleaseDate(release.releasedAt),
    [release.releasedAt]
  )

  const highlights = release.highlights ?? []

  return (
    <div className="relative group inline-flex">
      <span className="inline-flex rounded-lg bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-describedby={tooltipId}
          aria-label={`What's new in ${productMetadata.name} ${release.version}`}
        >
          <Box className="h-5 w-5" aria-hidden="true" />
        </button>
      </span>

      <div
        role="tooltip"
        id={tooltipId}
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-3 hidden w-80 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-professional-lg group-hover:block group-focus-within:block"
      >
        <div className="pointer-events-auto">
          <p className="text-sm font-semibold text-slate-900">
            {`What's new in ${productMetadata.name} ${release.version}`}
          </p>

          {release.codename && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
              {release.codename}
            </p>
          )}

          {formattedReleaseDate && (
            <p className="mt-2 text-xs text-slate-500">
              Released {formattedReleaseDate}
            </p>
          )}

          {highlights.length > 0 ? (
            <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-700">
              {highlights.map((highlight, index) => (
                <li key={`${release.version}-${index}`} className="leading-snug">
                  {highlight}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              Release highlights will appear here once this version ships.
            </p>
          )}

          <p className="mt-3 text-xs text-slate-500">
            Hover over the AutoCrate badge any time to revisit these notes.
          </p>
        </div>
      </div>
    </div>
  )
}
