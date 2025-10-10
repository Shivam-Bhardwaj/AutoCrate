'use client'

import React, { useState } from 'react'
import { NXBox } from '@/lib/nx-generator'

interface PlywoodPieceSelectorProps {
  boxes: NXBox[]
  onPieceToggle: (pieceName: string) => void
}

export const PlywoodPieceSelector: React.FC<PlywoodPieceSelectorProps> = ({ boxes, onPieceToggle }) => {
  const [selectedPanel, setSelectedPanel] = useState<string>('FRONT_PANEL')
  const [pieceVisibility, setPieceVisibility] = useState<Record<string, boolean>>({})

  // Group plywood pieces by panel
  const plywoodPieces = boxes.filter(box => box.type === 'plywood')
  const panelGroups = new Map<string, NXBox[]>()

  plywoodPieces.forEach(piece => {
    if (piece.panelName) {
      if (!panelGroups.has(piece.panelName)) {
        panelGroups.set(piece.panelName, [])
      }
      panelGroups.get(piece.panelName)?.push(piece)
    }
  })

  // Sort pieces within each panel by index
  panelGroups.forEach((pieces, _panelName) => {
    pieces.sort((a, b) => (a.plywoodPieceIndex || 0) - (b.plywoodPieceIndex || 0))
  })

  const handlePieceToggle = (pieceName: string) => {
    setPieceVisibility(prev => ({
      ...prev,
      [pieceName]: !prev[pieceName]
    }))
    onPieceToggle(pieceName)
  }

  const getPanelDisplayName = (panelName: string) => {
    return panelName.replace(/_/g, ' ').replace('PANEL', '').trim()
  }

  const selectedPanelPieces = panelGroups.get(selectedPanel) || []

  return (
    <div className="space-y-4">
      {/* Panel Selector */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Select Panel
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Array.from(panelGroups.keys()).map(panelName => (
            <button
              key={panelName}
              onClick={() => setSelectedPanel(panelName)}
              className={`px-3 py-2 text-xs rounded transition-colors ${
                selectedPanel === panelName
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {getPanelDisplayName(panelName)}
            </button>
          ))}
        </div>
      </div>

      {/* Plywood Pieces for Selected Panel */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Plywood Pieces - {getPanelDisplayName(selectedPanel)}
        </label>
        <div className="space-y-2">
          {selectedPanelPieces.map((piece) => {
            const isActive = !piece.suppressed
            const isVisible = pieceVisibility[piece.name] !== false

            return (
              <div
                key={piece.name}
                className={`p-3 rounded border transition-all ${
                  isActive
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isVisible && isActive}
                      onChange={() => handlePieceToggle(piece.name)}
                      disabled={!isActive}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Piece {(piece.plywoodPieceIndex || 0) + 1}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {piece.metadata}
                      </div>
                    </div>
                  </div>

                  {/* 7 Parameters Display */}
                  {isActive && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 grid grid-cols-7 gap-1">
                      <div className="text-center">
                        <div className="font-semibold">X</div>
                        <div>{piece.point1.x.toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Y</div>
                        <div>{piece.point1.y.toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Z</div>
                        <div>{piece.point1.z.toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">W</div>
                        <div>{(piece.point2.x - piece.point1.x).toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">H</div>
                        <div>{(piece.point2.z - piece.point1.z).toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">T</div>
                        <div>{(piece.point2.y - piece.point1.y).toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">R</div>
                        <div>0</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Color indicator */}
                <div className="mt-2 flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: piece.color }}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isActive ? 'Active' : 'Suppressed'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
        <div className="font-semibold mb-1">Panel Summary:</div>
        <div className="space-y-1 text-gray-600 dark:text-gray-400">
          <div>Total pieces: {selectedPanelPieces.length}</div>
          <div>Active pieces: {selectedPanelPieces.filter(p => !p.suppressed).length}</div>
          <div>Suppressed: {selectedPanelPieces.filter(p => p.suppressed).length}</div>
        </div>
      </div>
    </div>
  )
}