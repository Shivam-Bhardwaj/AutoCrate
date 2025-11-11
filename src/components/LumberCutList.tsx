'use client'

import { LumberCutList as LumberCutListData } from '@/lib/nx-generator'

interface LumberCutListProps {
  cutList: LumberCutListData
}

const formatNumber = (value: number) => {
  const rounded = Math.round(value * 100) / 100
  if (Math.abs(rounded - Math.round(rounded)) < 0.01) {
    return Math.round(rounded).toString()
  }
  if (Math.abs(rounded - Math.round(rounded * 10) / 10) < 0.01) {
    return (Math.round(rounded * 10) / 10).toFixed(1)
  }
  return rounded.toFixed(2)
}

const formatInches = (value: number) => `${formatNumber(value)}"`
const formatFeet = (value: number) => `${formatNumber(value)} ft`

const formatPanelName = (panel: string) =>
  panel
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const formatCleatTypes = (types: string[]) =>
  types
    .map(type => type.charAt(0).toUpperCase() + type.slice(1))
    .join(', ')

export function LumberCutList({ cutList }: LumberCutListProps) {
  return (
    <div className="space-y-4 md:space-y-6 text-sm" role="region" aria-label="Lumber cut list">
      <section>
        <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 md:mb-3">Skids</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm min-w-[500px]" role="table" aria-label="Skids cut list">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Material</th>
                <th scope="col" className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Cut Length</th>
                <th scope="col" className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Qty</th>
                <th scope="col" className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {cutList.skids.map((item, index) => (
                <tr key={`skid-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{item.material}</td>
                  <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{formatInches(item.length)}</td>
                  <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{item.count}</td>
                  <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{item.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 md:mb-3">Floorboards</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm min-w-[500px]" role="table" aria-label="Floorboards cut list">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Material</th>
                <th scope="col" className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Cut Length</th>
                <th scope="col" className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Qty</th>
                <th scope="col" className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {cutList.floorboards.map((item, index) => (
                <tr key={`floor-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{item.material}</td>
                  <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{formatInches(item.length)}</td>
                  <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{item.count}</td>
                  <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{item.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
          <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">Cleats</h2>
          <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
            Total: {formatFeet(cutList.summary.cleatLinearFeet)} • Est. 1x4 boards: {cutList.summary.cleatBoardCount}
          </span>
        </div>
        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-3">All cleats use 1x4 lumber (0.75" × 3.5"). Cut pieces per panel as listed below.</p>
        <div className="space-y-3 md:space-y-4">
          {cutList.cleats.map(panel => (
            <div key={panel.panel} className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="bg-gray-50 dark:bg-gray-800 px-2 md:px-3 py-2 text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                {formatPanelName(panel.panel)}
              </div>
              <table className="w-full text-sm min-w-[500px]" role="table" aria-label={`Cleats for ${formatPanelName(panel.panel)}`}>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Orientation</th>
                    <th scope="col" className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Cut Length</th>
                    <th scope="col" className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Qty</th>
                    <th scope="col" className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Cleat Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {panel.items.map((item, index) => (
                    <tr key={`${panel.panel}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{item.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}</td>
                      <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{formatInches(item.length)}</td>
                      <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{item.count}</td>
                      <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{formatCleatTypes(item.types)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
          <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">Plywood Panels</h2>
          <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
            Total sheets: {cutList.summary.totalPlywoodSheets} • Thickness: {formatInches(cutList.summary.plywoodThickness)}
          </span>
        </div>
        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-3">Cut plywood sections for each panel. Dimensions are shown as width × height.</p>
        <div className="space-y-3 md:space-y-4">
          {cutList.plywood.map(panel => (
            <div key={panel.panel} className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="bg-gray-50 dark:bg-gray-800 px-2 md:px-3 py-2 text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                {formatPanelName(panel.panel)}
              </div>
              <div className="px-2 md:px-3 py-2 text-[10px] md:text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                Sheets required: {panel.sheetCount}{' '}
                {panel.isRotated ? '• Rotated 90° orientation' : '• Standard orientation'}
              </div>
              <table className="w-full text-sm min-w-[300px]">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Piece Size</th>
                    <th className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {panel.pieces.map((piece, index) => (
                    <tr key={`${panel.panel}-piece-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{formatInches(piece.width)} × {formatInches(piece.height)}</td>
                      <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{piece.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
