'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCrateStore } from '@/store/crate-store';
import { ChevronDown, ChevronUp, Weight, Package, Hammer, Shield, Droplets } from 'lucide-react';
import { useState } from 'react';

export default function WeightBreakdown() {
  const { weightBreakdown } = useCrateStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    panels: true,
    framing: false,
    base: false,
    hardware: false,
    protection: false,
    accessories: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatWeight = (weight: number) => `${weight.toFixed(1)} lbs`;

  const getWeightPercentage = (weight: number) => {
    if (weightBreakdown.total === 0) return 0;
    return (weight / weightBreakdown.total) * 100;
  };

  if (!weightBreakdown) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Weight className="w-5 h-5" />
          Weight Breakdown
        </CardTitle>
        <CardDescription>Detailed breakdown of crate weight by component</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Weight Summary */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Crate Weight</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatWeight(weightBreakdown.total)}
            </span>
          </div>
        </div>

        {/* Panels Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('panels')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Panels</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatWeight(weightBreakdown.panels.total)} (
                {getWeightPercentage(weightBreakdown.panels.total).toFixed(1)}%)
              </span>
            </div>
            {expandedSections.panels ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.panels && (
            <div className="px-4 pb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Top Panel</span>
                <span>{formatWeight(weightBreakdown.panels.top)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Front Panel</span>
                <span>{formatWeight(weightBreakdown.panels.front)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Back Panel</span>
                <span>{formatWeight(weightBreakdown.panels.back)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Left Panel</span>
                <span>{formatWeight(weightBreakdown.panels.left)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Right Panel</span>
                <span>{formatWeight(weightBreakdown.panels.right)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Framing Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('framing')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Hammer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Framing & Cleats</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatWeight(weightBreakdown.framing.total)} (
                {getWeightPercentage(weightBreakdown.framing.total).toFixed(1)}%)
              </span>
            </div>
            {expandedSections.framing ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.framing && (
            <div className="px-4 pb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cleats</span>
                <span>{formatWeight(weightBreakdown.framing.cleats)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Reinforcements</span>
                <span>{formatWeight(weightBreakdown.framing.reinforcements)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Base Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('base')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Base & Skids</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatWeight(weightBreakdown.base.total)} (
                {getWeightPercentage(weightBreakdown.base.total).toFixed(1)}%)
              </span>
            </div>
            {expandedSections.base ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.base && (
            <div className="px-4 pb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Skids</span>
                <span>{formatWeight(weightBreakdown.base.skids)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Floorboards</span>
                <span>{formatWeight(weightBreakdown.base.floorboards)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Hardware Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('hardware')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Hammer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Hardware</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatWeight(weightBreakdown.hardware.total)} (
                {getWeightPercentage(weightBreakdown.hardware.total).toFixed(1)}%)
              </span>
            </div>
            {expandedSections.hardware ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.hardware && (
            <div className="px-4 pb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fasteners</span>
                <span>{formatWeight(weightBreakdown.hardware.fasteners)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Brackets</span>
                <span>{formatWeight(weightBreakdown.hardware.brackets)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Protection Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('protection')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Protection Materials</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatWeight(weightBreakdown.protection.total)} (
                {getWeightPercentage(weightBreakdown.protection.total).toFixed(1)}%)
              </span>
            </div>
            {expandedSections.protection ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.protection && (
            <div className="px-4 pb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Foam Cushioning</span>
                <span>{formatWeight(weightBreakdown.protection.foam)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Moisture Barrier Bag</span>
                <span>{formatWeight(weightBreakdown.protection.mbb)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Desiccant</span>
                <span>{formatWeight(weightBreakdown.protection.desiccant)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Accessories Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('accessories')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Droplets className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Accessories</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatWeight(weightBreakdown.accessories.total)} (
                {getWeightPercentage(weightBreakdown.accessories.total).toFixed(1)}%)
              </span>
            </div>
            {expandedSections.accessories ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.accessories && (
            <div className="px-4 pb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shock Indicators</span>
                <span>{formatWeight(weightBreakdown.accessories.shockIndicators)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tilt Indicators</span>
                <span>{formatWeight(weightBreakdown.accessories.tiltIndicators)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Labels & Documentation</span>
                <span>{formatWeight(weightBreakdown.accessories.labels)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Weight Summary Chart */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-3">Weight Distribution</h4>
          <div className="space-y-2">
            {[
              { name: 'Panels', weight: weightBreakdown.panels.total, color: 'bg-blue-500' },
              { name: 'Framing', weight: weightBreakdown.framing.total, color: 'bg-green-500' },
              { name: 'Base', weight: weightBreakdown.base.total, color: 'bg-yellow-500' },
              { name: 'Hardware', weight: weightBreakdown.hardware.total, color: 'bg-red-500' },
              {
                name: 'Protection',
                weight: weightBreakdown.protection.total,
                color: 'bg-purple-500',
              },
              {
                name: 'Accessories',
                weight: weightBreakdown.accessories.total,
                color: 'bg-gray-500',
              },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-16 text-xs text-gray-600 dark:text-gray-400">{item.name}</div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{
                      width: `${getWeightPercentage(item.weight)}%`,
                    }}
                  />
                </div>
                <div className="w-12 text-xs text-gray-600 dark:text-gray-400 text-right">
                  {getWeightPercentage(item.weight).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
