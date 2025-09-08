'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface PartNavigatorProps {
  className?: string;
  onSelectionChange?: (selectedItems: string[]) => void;
}

interface NavigatorNode {
  id: string;
  label: string;
  type: 'part' | 'component' | 'feature' | 'body' | 'sketch';
  icon: string;
  children?: NavigatorNode[];
  expanded?: boolean;
  visible?: boolean;
  selected?: boolean;
}

const PartNavigator: React.FC<PartNavigatorProps> = ({ 
  className,
  onSelectionChange 
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['crate-assembly', 'base-component']));

  const navigatorTree: NavigatorNode[] = [
    {
      id: 'crate-assembly',
      label: 'CrateAssembly.prt',
      type: 'part',
      icon: '📦',
      expanded: true,
      visible: true,
      children: [
        {
          id: 'base-component',
          label: 'Base Component',
          type: 'component',
          icon: '🔧',
          expanded: true,
          visible: true,
          children: [
            {
              id: 'base-body',
              label: 'BODY(1)',
              type: 'body',
              icon: '🧊',
              visible: true,
              children: [
                { id: 'base-sketch', label: 'Sketch(1)', type: 'sketch', icon: '📐', visible: true },
                { id: 'base-extrude', label: 'Extrude(1)', type: 'feature', icon: '↗️', visible: true },
                { id: 'base-fillet', label: 'Edge Blend(1)', type: 'feature', icon: '🔵', visible: true }
              ]
            }
          ]
        },
        {
          id: 'sides-component',
          label: 'Sides Component',
          type: 'component',
          icon: '🔧',
          visible: true,
          children: [
            {
              id: 'sides-body',
              label: 'BODY(2)',
              type: 'body',
              icon: '🧊',
              visible: true,
              children: [
                { id: 'sides-sketch', label: 'Sketch(2)', type: 'sketch', icon: '📐', visible: true },
                { id: 'sides-extrude', label: 'Extrude(2)', type: 'feature', icon: '↗️', visible: true },
                { id: 'sides-pattern', label: 'Pattern Feature(1)', type: 'feature', icon: '🔄', visible: true }
              ]
            }
          ]
        },
        {
          id: 'top-component',
          label: 'Top Component',
          type: 'component',
          icon: '🔧',
          visible: true,
          children: [
            {
              id: 'top-body',
              label: 'BODY(3)',
              type: 'body',
              icon: '🧊',
              visible: true,
              children: [
                { id: 'top-sketch', label: 'Sketch(3)', type: 'sketch', icon: '📐', visible: true },
                { id: 'top-extrude', label: 'Extrude(3)', type: 'feature', icon: '↗️', visible: true }
              ]
            }
          ]
        },
        {
          id: 'skid-component',
          label: 'Skid Component',
          type: 'component',
          icon: '🔧',
          visible: true,
          children: [
            {
              id: 'skid-body',
              label: 'BODY(4)',
              type: 'body',
              icon: '🧊',
              visible: true,
              children: [
                { id: 'skid-sketch', label: 'Sketch(4)', type: 'sketch', icon: '📐', visible: true },
                { id: 'skid-extrude', label: 'Extrude(4)', type: 'feature', icon: '↗️', visible: true },
                { id: 'skid-runner', label: 'Skid Runners', type: 'feature', icon: '📏', visible: true }
              ]
            }
          ]
        }
      ]
    }
  ];

  const handleNodeToggle = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeSelect = (nodeId: string, event: React.MouseEvent) => {
    let newSelection: string[];

    if (event.ctrlKey) {
      // Multi-select with Ctrl
      if (selectedItems.includes(nodeId)) {
        newSelection = selectedItems.filter(id => id !== nodeId);
      } else {
        newSelection = [...selectedItems, nodeId];
      }
    } else if (event.shiftKey && selectedItems.length > 0) {
      // Range select with Shift (simplified)
      newSelection = [...selectedItems, nodeId];
    } else {
      // Single select
      newSelection = [nodeId];
    }

    setSelectedItems(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleVisibilityToggle = (nodeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // Toggle visibility logic would go here
    console.log('Toggle visibility for:', nodeId);
  };

  const renderNode = (node: NavigatorNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedItems.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 16;

    return (
      <React.Fragment key={node.id}>
        <div
          className={cn(
            'flex items-center hover:bg-nx-hover cursor-pointer',
            isSelected && 'nx-selected bg-nx-selection-orange/10'
          )}
          style={{ paddingLeft: `${indent + 4}px` }}
          onClick={(e) => handleNodeSelect(node.id, e)}
        >
          {/* Expand/Collapse Button */}
          <button
            className="w-4 h-4 flex items-center justify-center text-xs hover:bg-nx-hover"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) handleNodeToggle(node.id);
            }}
            style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          >
            {hasChildren ? (isExpanded ? '−' : '+') : ''}
          </button>

          {/* Visibility Toggle */}
          <button
            className="w-4 h-4 flex items-center justify-center text-xs hover:bg-nx-hover ml-1"
            onClick={(e) => handleVisibilityToggle(node.id, e)}
            title={node.visible ? 'Hide' : 'Show'}
          >
            {node.visible ? '👁' : '🙈'}
          </button>

          {/* Icon */}
          <span className="text-xs mx-1">{node.icon}</span>

          {/* Label */}
          <span className={cn(
            'text-xs nx-text flex-1 truncate py-1',
            node.type === 'part' && 'font-semibold',
            node.type === 'component' && 'font-medium',
            !node.visible && 'opacity-50'
          )}>
            {node.label}
          </span>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && node.children?.map(child => 
          renderNode(child, level + 1)
        )}
      </React.Fragment>
    );
  };

  return (
    <div className={cn('nx-panel flex flex-col h-full', className)}>
      {/* Header */}
      <div className="nx-toolbar border-b border-nx-border p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold nx-text">Part Navigator</span>
          <div className="flex space-x-1">
            <button 
              className="nx-button p-1 text-xs" 
              title="Refresh"
            >
              🔄
            </button>
            <button 
              className="nx-button p-1 text-xs" 
              title="Expand All"
            >
              ⬇
            </button>
            <button 
              className="nx-button p-1 text-xs" 
              title="Collapse All"
            >
              ⬆
            </button>
            <button 
              className="nx-button p-1 text-xs" 
              title="Show All"
            >
              👁
            </button>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-1">
        {navigatorTree.map(node => renderNode(node))}
      </div>

      {/* Footer with Selection Info */}
      <div className="nx-status-line">
        <span className="text-xs">
          {selectedItems.length > 0 
            ? `${selectedItems.length} item(s) selected`
            : 'No selection'
          }
        </span>
      </div>
    </div>
  );
};

export default PartNavigator;