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
    <div className="space-y-6 text-sm">
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Skids</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Material</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Cut Length</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Qty</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cutList.skids.map((item, index) => (
                <tr key={`skid-${index}`}>
                  <td className="px-3 py-2">{item.material}</td>
                  <td className="px-3 py-2">{formatInches(item.length)}</td>
                  <td className="px-3 py-2">{item.count}</td>
                  <td className="px-3 py-2 text-gray-500">{item.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Floorboards</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Material</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Cut Length</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Qty</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cutList.floorboards.map((item, index) => (
                <tr key={`floor-${index}`}>
                  <td className="px-3 py-2">{item.material}</td>
                  <td className="px-3 py-2">{formatInches(item.length)}</td>
                  <td className="px-3 py-2">{item.count}</td>
                  <td className="px-3 py-2 text-gray-500">{item.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-gray-900">Cleats</h2>
          <span className="text-xs text-gray-500">
            Total: {formatFeet(cutList.summary.cleatLinearFeet)} • Est. 1x4 boards: {cutList.summary.cleatBoardCount}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-3">All cleats use 1x4 lumber (0.75" × 3.5"). Cut pieces per panel as listed below.</p>
        <div className="space-y-4">
          {cutList.cleats.map(panel => (
            <div key={panel.panel} className="overflow-hidden rounded-lg border border-gray-200">
              <div className="bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                {formatPanelName(panel.panel)}
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Orientation</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Cut Length</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Cleat Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {panel.items.map((item, index) => (
                    <tr key={`${panel.panel}-${index}`}>
                      <td className="px-3 py-2">{item.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}</td>
                      <td className="px-3 py-2">{formatInches(item.length)}</td>
                      <td className="px-3 py-2">{item.count}</td>
                      <td className="px-3 py-2 text-gray-500">{formatCleatTypes(item.types)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-gray-900">Plywood Panels</h2>
          <span className="text-xs text-gray-500">
            Total sheets: {cutList.summary.totalPlywoodSheets} • Thickness: {formatInches(cutList.summary.plywoodThickness)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-3">Cut plywood sections for each panel. Dimensions are shown as width × height.</p>
        <div className="space-y-4">
          {cutList.plywood.map(panel => (
            <div key={panel.panel} className="overflow-hidden rounded-lg border border-gray-200">
              <div className="bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                {formatPanelName(panel.panel)}
              </div>
              <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200">
                Sheets required: {panel.sheetCount}{' '}
                {panel.isRotated ? '• Rotated 90° orientation' : '• Standard orientation'}
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Piece Size</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {panel.pieces.map((piece, index) => (
                    <tr key={`${panel.panel}-piece-${index}`}>
                      <td className="px-3 py-2">{formatInches(piece.width)} × {formatInches(piece.height)}</td>
                      <td className="px-3 py-2">{piece.count}</td>
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
