'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface NXToolbarProps {
  className?: string;
  onMenuSelect?: (menu: string, item: string) => void;
}

interface MenuTab {
  id: string;
  label: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
}

const NXToolbar: React.FC<NXToolbarProps> = ({ className, onMenuSelect }) => {
  const [activeTab, setActiveTab] = useState('modeling');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuTabs: MenuTab[] = [
    {
      id: 'file',
      label: 'File',
      items: [
        { id: 'new', label: 'New', icon: '📄' },
        { id: 'open', label: 'Open', icon: '📁' },
        { id: 'save', label: 'Save', icon: '💾' },
        { id: 'save-as', label: 'Save As', icon: '💾' },
        { id: 'separator1', label: '', separator: true },
        { id: 'export', label: 'Export', icon: '📤' },
        { id: 'print', label: 'Print', icon: '🖨️' },
      ]
    },
    {
      id: 'modeling',
      label: 'Modeling',
      items: [
        { id: 'block', label: 'Block', icon: '🧊' },
        { id: 'extrude', label: 'Extrude', icon: '↗️' },
        { id: 'revolve', label: 'Revolve', icon: '🔄' },
        { id: 'sweep', label: 'Sweep', icon: '〰️' },
        { id: 'separator1', label: '', separator: true },
        { id: 'boolean', label: 'Boolean', icon: '⚡' },
        { id: 'fillet', label: 'Fillet', icon: '🔵' },
        { id: 'chamfer', label: 'Chamfer', icon: '◇' },
      ]
    },
    {
      id: 'assembly',
      label: 'Assembly',
      items: [
        { id: 'component', label: 'Component', icon: '🔧' },
        { id: 'constraints', label: 'Constraints', icon: '🔗' },
        { id: 'interference', label: 'Interference', icon: '⚠️' },
        { id: 'explode', label: 'Explode', icon: '💥' },
      ]
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { id: 'fit', label: 'Fit View', icon: '🔍' },
        { id: 'zoom-in', label: 'Zoom In', icon: '🔎' },
        { id: 'zoom-out', label: 'Zoom Out', icon: '🔍' },
        { id: 'separator1', label: '', separator: true },
        { id: 'wireframe', label: 'Wireframe', icon: '📐' },
        { id: 'shaded', label: 'Shaded', icon: '🎨' },
        { id: 'hidden-edges', label: 'Hidden Edges', icon: '👁️' },
      ]
    },
    {
      id: 'tools',
      label: 'Tools',
      items: [
        { id: 'measure', label: 'Measure', icon: '📏' },
        { id: 'mass-props', label: 'Mass Properties', icon: '⚖️' },
        { id: 'draft-check', label: 'Draft Check', icon: '📊' },
        { id: 'section', label: 'Section', icon: '🔪' },
      ]
    }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled || item.separator) return;
    onMenuSelect?.(activeTab, item.id);
  };

  const currentTab = menuTabs.find(tab => tab.id === activeTab);

  return (
    <div className={cn('nx-toolbar', className)}>
      {/* Tab Headers */}
      <div className="flex border-b border-nx-border bg-nx-panel">
        {menuTabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'px-4 py-2 text-xs nx-text hover:bg-nx-toolbar transition-colors',
              activeTab === tab.id && 'bg-nx-toolbar border-b-2 border-nx-siemens-blue'
            )}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ribbon Content */}
      <div className="bg-nx-panel border-b border-nx-border min-h-[80px]">
        <div className="flex flex-wrap gap-1 p-2">
          {currentTab?.items.map((item) => {
            if (item.separator) {
              return (
                <div
                  key={item.id}
                  className="w-px h-12 bg-nx-border mx-1 my-1"
                />
              );
            }

            return (
              <button
                key={item.id}
                className={cn(
                  'nx-button flex flex-col items-center justify-center min-w-[48px] h-12 p-1 text-xs',
                  item.disabled && 'opacity-50 cursor-not-allowed',
                  hoveredItem === item.id && !item.disabled && 'nx-hover'
                )}
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                title={item.label}
              >
                <span className="text-sm mb-1">{item.icon}</span>
                <span className="text-[10px] leading-tight text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Access Toolbar */}
      <div className="bg-nx-toolbar border-b border-nx-border px-2 py-1">
        <div className="flex items-center gap-1">
          <button className="nx-button p-1" title="Save (Ctrl+S)">💾</button>
          <button className="nx-button p-1" title="Undo (Ctrl+Z)">↶</button>
          <button className="nx-button p-1" title="Redo (Ctrl+Y)">↷</button>
          <div className="w-px h-4 bg-nx-border mx-1" />
          <button className="nx-button p-1" title="Fit View (F8)">🔍</button>
          <button className="nx-button p-1" title="Zoom In">🔎</button>
          <button className="nx-button p-1" title="Zoom Out">🔍</button>
          <div className="w-px h-4 bg-nx-border mx-1" />
          <button className="nx-button p-1" title="Wireframe">📐</button>
          <button className="nx-button p-1" title="Shaded">🎨</button>
        </div>
      </div>
    </div>
  );
};

export default NXToolbar;