'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ResourceBarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

interface ResourceTab {
  id: string;
  label: string;
  icon: string;
  tooltip: string;
}

const ResourceBar: React.FC<ResourceBarProps> = ({ 
  className, 
  isCollapsed = false,
  onToggle 
}) => {
  const [activeTab, setActiveTab] = useState('navigator');
  const [collapsed, setCollapsed] = useState(isCollapsed);

  const resourceTabs: ResourceTab[] = [
    { id: 'navigator', label: 'Part Navigator', icon: '🌲', tooltip: 'Part Navigator (F12)' },
    { id: 'history', label: 'History', icon: '📚', tooltip: 'Feature History' },
    { id: 'roles', label: 'Roles', icon: '👤', tooltip: 'Model Roles' },
    { id: 'layers', label: 'Layers', icon: '📋', tooltip: 'Layers (Ctrl+L)' },
    { id: 'selection', label: 'Selection', icon: '🎯', tooltip: 'Selection Filter' },
  ];

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onToggle?.(newCollapsed);
  };

  const handleTabClick = (tabId: string) => {
    if (collapsed) {
      setCollapsed(false);
    }
    setActiveTab(tabId);
  };

  const renderPartNavigator = () => (
    <div className="flex-1 p-2">
      <div className="space-y-1">
        <div className="flex items-center space-x-1 hover:bg-nx-hover p-1 rounded">
          <span className="text-xs">📦</span>
          <span className="text-xs nx-text">CrateAssembly</span>
        </div>
        <div className="ml-4 space-y-1">
          <div className="flex items-center space-x-1 hover:bg-nx-hover p-1 rounded">
            <span className="text-xs">🔧</span>
            <span className="text-xs nx-text">Base</span>
          </div>
          <div className="flex items-center space-x-1 hover:bg-nx-hover p-1 rounded">
            <span className="text-xs">🔧</span>
            <span className="text-xs nx-text">Sides</span>
          </div>
          <div className="flex items-center space-x-1 hover:bg-nx-hover p-1 rounded">
            <span className="text-xs">🔧</span>
            <span className="text-xs nx-text">Top</span>
          </div>
          <div className="flex items-center space-x-1 hover:bg-nx-hover p-1 rounded">
            <span className="text-xs">🔧</span>
            <span className="text-xs nx-text">Skid</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="flex-1 p-2">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 p-1 hover:bg-nx-hover rounded">
          <span className="text-xs">✓</span>
          <span className="text-xs nx-text">Block(1)</span>
        </div>
        <div className="flex items-center space-x-2 p-1 hover:bg-nx-hover rounded">
          <span className="text-xs">✓</span>
          <span className="text-xs nx-text">Extrude(1)</span>
        </div>
        <div className="flex items-center space-x-2 p-1 hover:bg-nx-hover rounded">
          <span className="text-xs">✓</span>
          <span className="text-xs nx-text">Pattern Feature(1)</span>
        </div>
      </div>
    </div>
  );

  const renderLayers = () => (
    <div className="flex-1 p-2">
      <div className="space-y-1">
        <div className="flex items-center justify-between p-1 hover:bg-nx-hover rounded">
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="w-3 h-3" defaultChecked />
            <span className="text-xs nx-text">1 - Construction</span>
          </div>
          <span className="text-xs nx-text-secondary">Blue</span>
        </div>
        <div className="flex items-center justify-between p-1 hover:bg-nx-hover rounded">
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="w-3 h-3" defaultChecked />
            <span className="text-xs nx-text">21 - Dimensions</span>
          </div>
          <span className="text-xs nx-text-secondary">White</span>
        </div>
        <div className="flex items-center justify-between p-1 hover:bg-nx-hover rounded">
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="w-3 h-3" defaultChecked />
            <span className="text-xs nx-text">256 - Work</span>
          </div>
          <span className="text-xs nx-text-secondary">Yellow</span>
        </div>
      </div>
    </div>
  );

  const renderSelectionFilter = () => (
    <div className="flex-1 p-2">
      <div className="space-y-2">
        <div className="text-xs nx-text-secondary">Selection Filter</div>
        <div className="space-y-1">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="w-3 h-3" defaultChecked />
            <span className="text-xs nx-text">Bodies</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="w-3 h-3" defaultChecked />
            <span className="text-xs nx-text">Faces</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="w-3 h-3" defaultChecked />
            <span className="text-xs nx-text">Edges</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="w-3 h-3" defaultChecked />
            <span className="text-xs nx-text">Vertices</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="w-3 h-3" />
            <span className="text-xs nx-text">Components</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'navigator':
        return renderPartNavigator();
      case 'history':
        return renderHistory();
      case 'layers':
        return renderLayers();
      case 'selection':
        return renderSelectionFilter();
      default:
        return renderPartNavigator();
    }
  };

  if (collapsed) {
    return (
      <div className={cn('nx-panel border-r border-nx-border flex flex-col', className)}>
        {/* Collapsed Tab Icons */}
        <div className="space-y-1 p-1">
          {resourceTabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                'w-8 h-8 flex items-center justify-center text-xs hover:bg-nx-hover rounded',
                activeTab === tab.id && 'bg-nx-toolbar'
              )}
              onClick={() => handleTabClick(tab.id)}
              title={tab.tooltip}
            >
              {tab.icon}
            </button>
          ))}
        </div>
        
        {/* Expand Button */}
        <div className="mt-auto p-1">
          <button
            className="w-8 h-6 flex items-center justify-center text-xs hover:bg-nx-hover rounded nx-text"
            onClick={handleToggleCollapse}
            title="Expand Resource Bar"
          >
            ▶
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('nx-panel border-r border-nx-border flex flex-col w-64', className)}>
      {/* Tab Headers */}
      <div className="border-b border-nx-border">
        <div className="flex overflow-x-auto">
          {resourceTabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                'flex-shrink-0 px-2 py-1 text-xs nx-text hover:bg-nx-toolbar border-b-2 border-transparent',
                activeTab === tab.id && 'border-nx-siemens-blue bg-nx-toolbar'
              )}
              onClick={() => setActiveTab(tab.id)}
              title={tab.tooltip}
            >
              <span className="mr-1">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {renderContent()}

      {/* Collapse Button */}
      <div className="border-t border-nx-border p-1">
        <button
          className="w-full h-6 flex items-center justify-center text-xs hover:bg-nx-hover rounded nx-text"
          onClick={handleToggleCollapse}
          title="Collapse Resource Bar"
        >
          ◀
        </button>
      </div>
    </div>
  );
};

export default ResourceBar;