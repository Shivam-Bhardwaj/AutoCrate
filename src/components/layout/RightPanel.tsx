'use client';

import { useState } from 'react';
import { useCrateStore } from '@/store/crate-store';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  FileText, 
  Download, 
  Wrench,
  Package,
  BarChart3,
  FileCode,
  Layers
} from 'lucide-react';

type TabType = 'summary' | 'bom' | 'nx' | 'export';

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const { configuration } = useCrateStore();

  // Mock data - will be replaced with actual computed values
  const mockData = {
    summary: {
      externalDimensions: `${configuration.dimensions.width + 2}" × ${configuration.dimensions.length + 2}" × ${configuration.dimensions.height + 2}"`,
      internalDimensions: `${configuration.dimensions.width - 1}" × ${configuration.dimensions.length - 1}" × ${configuration.dimensions.height - 1}"`,
      weight: `${configuration.weight.product} lbs`,
      estimatedGross: `${Math.round(configuration.weight.product * 1.2)} lbs`,
      safetyFactor: '20%'
    },
    bom: [
      { item: 'Base Panel', material: 'Plywood 3/4"', qty: 1, cost: '$45.00' },
      { item: 'Side Panels', material: 'Plywood 3/4"', qty: 4, cost: '$120.00' },
      { item: 'Top Panel', material: 'Plywood 3/4"', qty: 1, cost: '$45.00' },
      { item: 'Corner Braces', material: 'Pine 2x2"', qty: 4, cost: '$32.00' },
      { item: 'Screws', material: 'Stainless Steel', qty: 48, cost: '$18.00' },
      { item: 'Hinges', material: 'Heavy Duty', qty: 2, cost: '$24.00' }
    ],
    nxExpressions: [
      'Length = 48.000',
      'Width = 36.000', 
      'Height = 24.000',
      'Base_Thickness = 0.750',
      'Panel_Thickness = 0.750',
      'Corner_Radius = 0.125'
    ]
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'bom', label: 'BOM', icon: FileText },
    { id: 'nx', label: 'NX Code', icon: FileCode },
    { id: 'export', label: 'Export', icon: Download }
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="space-y-6">
            {/* Configuration Summary */}
            <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg p-4 border border-slate-200/50 dark:border-slate-600/50">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Configuration Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Base Type:</span>
                  <span className="text-slate-800 dark:text-slate-200">{configuration.base.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Panel Material:</span>
                  <span className="text-slate-800 dark:text-slate-200">plywood</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Fastener Type:</span>
                  <span className="text-slate-800 dark:text-slate-200">nails</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Vinyl:</span>
                  <span className="text-slate-800 dark:text-slate-200">None</span>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-slate-200/50 dark:border-slate-600/50">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Dimensions
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">External:</span>
                  <div className="font-mono text-slate-800 dark:text-slate-200 ml-4">
                    {mockData.summary.externalDimensions}
                  </div>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Internal:</span>
                  <div className="font-mono text-slate-800 dark:text-slate-200 ml-4">
                    {mockData.summary.internalDimensions}
                  </div>
                </div>
              </div>
            </div>

            {/* Weight Capacity */}
            <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-slate-200/50 dark:border-slate-600/50">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Weight Capacity
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Product Weight:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{mockData.summary.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Estimated Gross:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{mockData.summary.estimatedGross}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Safety Factor:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{mockData.summary.safetyFactor}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'bom':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bill of Materials
              </h4>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-slate-600/50">
                      <th className="text-left p-3 font-semibold text-slate-700 dark:text-slate-300">Item</th>
                      <th className="text-left p-3 font-semibold text-slate-700 dark:text-slate-300">Material</th>
                      <th className="text-center p-3 font-semibold text-slate-700 dark:text-slate-300">Qty</th>
                      <th className="text-right p-3 font-semibold text-slate-700 dark:text-slate-300">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.bom.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                        <td className="p-3 text-slate-800 dark:text-slate-200">{item.item}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{item.material}</td>
                        <td className="p-3 text-center text-slate-800 dark:text-slate-200">{item.qty}</td>
                        <td className="p-3 text-right font-mono text-slate-800 dark:text-slate-200">{item.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-200/50 dark:border-slate-600/50 p-3 bg-slate-50/50 dark:bg-slate-700/30">
                <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                  <span>Total Estimated Cost:</span>
                  <span className="font-mono">$284.00</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'nx':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                NX Expressions
              </h4>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            
            <div className="bg-slate-900 dark:bg-slate-800 rounded-lg border border-slate-200/50 dark:border-slate-600/50 p-4">
              <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                <code>
{`// AutoCrate Generated NX Expressions
// Project: ${configuration.projectName}
// Generated: ${new Date().toLocaleDateString()}

${mockData.nxExpressions.join('\n')}

// Clearance Calculations
Clearance_X = 1.500
Clearance_Y = 1.500  
Clearance_Z = 1.500

// Panel Assembly
Panel_Count = 6
Base_Area = Length * Width
Total_Volume = Length * Width * Height`}
                </code>
              </pre>
            </div>
          </div>
        );

      case 'export':
        return (
          <div className="space-y-6">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Options
            </h4>

            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Export Bill of Materials (CSV)
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <FileCode className="h-4 w-4 mr-2" />
                Export NX Expressions (.exp)
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                Export Engineering Report (PDF)
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Wrench className="h-4 w-4 mr-2" />
                Export 3D Model (STEP)
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Export Complete Package (ZIP)
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-slate-200/50 dark:border-slate-700/50 p-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-xs">📊</span>
          </div>
          Output Panel
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
              activeTab === id
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {renderTabContent()}
      </div>
    </div>
  );
}