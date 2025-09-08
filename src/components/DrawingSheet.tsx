'use client';

import React from 'react';
import { DrawingSheet } from '@/services/drawingGenerator';
import { cn } from '@/lib/utils';

interface DrawingSheetProps {
  sheet: DrawingSheet;
  showGrid?: boolean;
  showDimensions?: boolean;
  showTitleBlock?: boolean;
  showBOM?: boolean;
  className?: string;
  scale?: number;
}

export function DrawingSheetComponent({
  sheet,
  showGrid = false,
  showDimensions = true,
  showTitleBlock = true,
  showBOM = true,
  className,
  scale = 1
}: DrawingSheetProps) {
  // Convert sheet size to pixel dimensions (96 DPI)
  const DPI = 96;
  const sheetWidth = sheet.size === 'D' ? 34 * DPI : 22 * DPI;
  const sheetHeight = sheet.size === 'D' ? 22 * DPI : 17 * DPI;

  const renderBorder = () => {
    const elements = [];

    // Outer border
    elements.push(
      <rect
        key="outer-border"
        x={0}
        y={0}
        width={sheetWidth}
        height={sheetHeight}
        fill="none"
        stroke="#000000"
        strokeWidth={2}
      />
    );

    // Inner border (drawing area)
    const margin = 0.5 * DPI;
    elements.push(
      <rect
        key="inner-border"
        x={margin}
        y={margin}
        width={sheetWidth - 2 * margin}
        height={sheetHeight - 2 * margin}
        fill="none"
        stroke="#000000"
        strokeWidth={1}
      />
    );

    return elements;
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const elements = [];
    const gridSpacing = 0.5 * DPI;

    // Vertical grid lines
    for (let x = gridSpacing; x < sheetWidth; x += gridSpacing) {
      elements.push(
        <line
          key={`grid-v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={sheetHeight}
          stroke="#E0E0E0"
          strokeWidth={0.25}
          opacity={0.5}
        />
      );
    }

    // Horizontal grid lines
    for (let y = gridSpacing; y < sheetHeight; y += gridSpacing) {
      elements.push(
        <line
          key={`grid-h-${y}`}
          x1={0}
          y1={y}
          x2={sheetWidth}
          y2={y}
          stroke="#E0E0E0"
          strokeWidth={0.25}
          opacity={0.5}
        />
      );
    }

    return elements;
  };

  const renderTitleBlock = () => {
    if (!showTitleBlock) return null;

    const titleBlockX = (34 - 8.5) * DPI;
    const titleBlockY = 0.5 * DPI;
    const titleBlockWidth = 8.5 * DPI;
    const titleBlockHeight = 4.0 * DPI;

    return (
      <g key="title-block">
        <rect
          x={titleBlockX}
          y={sheetHeight - titleBlockY - titleBlockHeight}
          width={titleBlockWidth}
          height={titleBlockHeight}
          fill="#F8F9FA"
          stroke="#000000"
          strokeWidth={1}
        />
        
        <text
          x={titleBlockX + 0.1 * DPI}
          y={sheetHeight - titleBlockY - titleBlockHeight + 0.5 * DPI}
          fontSize={12}
          fontFamily="Arial"
          fontWeight="bold"
          fill="#000000"
        >
          Applied Materials
        </text>
        
        <text
          x={titleBlockX + 2.2 * DPI}
          y={sheetHeight - titleBlockY - titleBlockHeight + 0.5 * DPI}
          fontSize={14}
          fontFamily="Arial"
          fontWeight="bold"
          fill="#000000"
        >
          {sheet.titleBlock.title || 'CRATE ASSEMBLY'}
        </text>

        <text
          x={titleBlockX + 0.1 * DPI}
          y={sheetHeight - titleBlockY - titleBlockHeight + 1.5 * DPI}
          fontSize={8}
          fontFamily="Arial"
          fontWeight="bold"
          fill="#000000"
        >
          PART NO.
        </text>
        
        <text
          x={titleBlockX + 0.1 * DPI}
          y={sheetHeight - titleBlockY - titleBlockHeight + 1.8 * DPI}
          fontSize={10}
          fontFamily="Arial"
          fill="#000000"
        >
          {sheet.titleBlock.partNumber}
        </text>

        <text
          x={titleBlockX + 6.2 * DPI}
          y={sheetHeight - titleBlockY - titleBlockHeight + 1.5 * DPI}
          fontSize={8}
          fontFamily="Arial"
          fontWeight="bold"
          fill="#000000"
        >
          SHEET
        </text>
        
        <text
          x={titleBlockX + 6.2 * DPI}
          y={sheetHeight - titleBlockY - titleBlockHeight + 1.8 * DPI}
          fontSize={10}
          fontFamily="Arial"
          fill="#000000"
        >
          {sheet.sheetNumber} OF {sheet.totalSheets}
        </text>

        <text
          x={titleBlockX + 4.2 * DPI}
          y={sheetHeight - titleBlockY - titleBlockHeight + 1.5 * DPI}
          fontSize={8}
          fontFamily="Arial"
          fontWeight="bold"
          fill="#000000"
        >
          SIZE
        </text>
        
        <text
          x={titleBlockX + 4.2 * DPI}
          y={sheetHeight - titleBlockY - titleBlockHeight + 1.8 * DPI}
          fontSize={14}
          fontFamily="Arial"
          fontWeight="bold"
          fill="#000000"
        >
          {sheet.size}
        </text>
      </g>
    );
  };

  const renderBOM = () => {
    if (!showBOM || sheet.sheetNumber !== 1) return null;

    const bomX = 25 * DPI;
    const bomY = 12 * DPI;
    const bomWidth = 8.5 * DPI;
    const bomHeight = 9.5 * DPI;

    return (
      <g key="bom-table">
        <rect
          x={bomX}
          y={sheetHeight - bomY - bomHeight}
          width={bomWidth}
          height={bomHeight}
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth={1}
        />
        
        <text
          x={bomX + 0.1 * DPI}
          y={sheetHeight - bomY - bomHeight + 0.3 * DPI}
          fontSize={12}
          fontFamily="Arial"
          fontWeight="bold"
          fill="#000000"
        >
          BILL OF MATERIALS
        </text>

        {/* BOM headers */}
        {(() => {
          const headers = ['ITEM', 'QTY', 'PART NO.', 'DESCRIPTION'];
          const columnX = [0.1, 0.8, 1.8, 4.0];
          
          return headers.map((header, index) => (
            <text
              key={`bom-header-${index}`}
              x={bomX + columnX[index] * DPI}
              y={sheetHeight - bomY - bomHeight + 0.8 * DPI}
              fontSize={8}
              fontFamily="Arial"
              fontWeight="bold"
              fill="#000000"
            >
              {header}
            </text>
          ));
        })()}

        {/* Sample BOM entries */}
        <text
          x={bomX + 0.1 * DPI}
          y={sheetHeight - bomY - bomHeight + 1.2 * DPI}
          fontSize={8}
          fontFamily="Arial"
          fill="#000000"
        >
          1
        </text>
        
        <text
          x={bomX + 0.8 * DPI}
          y={sheetHeight - bomY - bomHeight + 1.2 * DPI}
          fontSize={8}
          fontFamily="Arial"
          fill="#000000"
        >
          2
        </text>
        
        <text
          x={bomX + 1.8 * DPI}
          y={sheetHeight - bomY - bomHeight + 1.2 * DPI}
          fontSize={8}
          fontFamily="Arial"
          fill="#000000"
        >
          SKID-PINE-4X4
        </text>
        
        <text
          x={bomX + 4.0 * DPI}
          y={sheetHeight - bomY - bomHeight + 1.2 * DPI}
          fontSize={8}
          fontFamily="Arial"
          fill="#000000"
        >
          SKID, 4" X 4", PINE
        </text>
      </g>
    );
  };

  const renderViews = () => {
    return sheet.views.map((view, index) => {
      const viewX = view.position.x * DPI;
      const viewY = (22 - view.position.y) * DPI;

      return (
        <g key={`view-${index}`}>
          <text
            x={viewX}
            y={viewY + 20}
            fontSize={10}
            fontFamily="Arial"
            fontWeight="bold"
            fill="#000000"
          >
            {view.name} (Scale: {view.scale}:1)
          </text>
          
          {/* Simple placeholder geometry */}
          <rect
            x={viewX}
            y={viewY - 100}
            width={150}
            height={80}
            fill="none"
            stroke="#000000"
            strokeWidth={1}
          />
        </g>
      );
    });
  };

  const renderNotes = () => {
    const notesX = 0.5 * DPI;
    const notesY = 4 * DPI;

    return (
      <g key="notes">
        <text
          x={notesX}
          y={sheetHeight - notesY}
          fontSize={10}
          fontFamily="Arial"
          fontWeight="bold"
          fill="#000000"
        >
          NOTES:
        </text>
        
        {sheet.notes.slice(0, 8).map((note, index) => (
          <text
            key={`note-${index}`}
            x={notesX}
            y={sheetHeight - notesY + (index + 1) * 15}
            fontSize={8}
            fontFamily="Arial"
            fill="#000000"
          >
            {index + 1}. {note}
          </text>
        ))}
      </g>
    );
  };

  const renderStandardElements = () => {
    const elements = [];

    // Third angle projection symbol
    elements.push(
      <text
        key="projection-symbol"
        x={1 * DPI}
        y={sheetHeight - 0.75 * DPI}
        fontSize={8}
        fontFamily="Arial"
        fill="#000000"
      >
        ⟲ THIRD ANGLE PROJECTION
      </text>
    );

    // Confidential notice
    elements.push(
      <text
        key="confidential"
        x={sheetWidth / 2}
        y={sheetHeight - 0.25 * DPI}
        fontSize={10}
        fontFamily="Arial"
        fontWeight="bold"
        textAnchor="middle"
        fill="#000000"
      >
        APPLIED MATERIALS CONFIDENTIAL
      </text>
    );

    return elements;
  };

  return (
    <div className={cn("drawing-sheet bg-white", className)}>
      <svg
        width={sheetWidth * scale}
        height={sheetHeight * scale}
        viewBox={`0 0 ${sheetWidth} ${sheetHeight}`}
        className="border border-gray-300"
        style={{ backgroundColor: 'white' }}
      >
        {/* Background */}
        <rect
          width={sheetWidth}
          height={sheetHeight}
          fill="white"
        />
        
        {/* Grid */}
        {renderGrid()}
        
        {/* Border */}
        {renderBorder()}
        
        {/* Views */}
        {renderViews()}
        
        {/* Title Block */}
        {renderTitleBlock()}
        
        {/* BOM */}
        {renderBOM()}
        
        {/* Notes */}
        {renderNotes()}
        
        {/* Standard Elements */}
        {renderStandardElements()}
      </svg>
    </div>
  );
}