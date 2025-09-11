'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function InputForms() {
  const {
    configuration,
    updateDimensions,
    updateBase,
    updatePanel,
    updateFasteners,
    updateWeight,
    updateProjectName,
  } = useCrateStore();

  const { logUser } = useLogsStore();

  return (
    <div className="h-full overflow-y-auto" role="form" aria-label="Crate configuration form">
      <div className="p-6 space-y-8">
        {/* Project Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-xl">
              <span className="text-white text-lg font-black">P</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Project Information</h3>
          </div>
          <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-600/50 p-6">
            <Label htmlFor="projectName" className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-3">
              Project Name
            </Label>
            <Input
              id="projectName"
              value={configuration.projectName}
              onChange={(e) => {
                updateProjectName(e.target.value);
                logUser('ui', `Project renamed to: ${e.target.value}`, undefined, 'InputForms');
              }}
              placeholder="Enter your project name..."
              className="transition-all duration-300 hover:border-blue-400 focus:border-purple-500 focus:ring-purple-500/20 dark:hover:border-purple-400 dark:focus:border-blue-500"
            />
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>

        {/* Product Dimensions */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center shadow-xl">
              <span className="text-white text-lg font-black">D</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Product Dimensions</h3>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-600/50 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 dark:bg-blue-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 dark:text-blue-400 text-xs">ℹ</span>
              </div>
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Enter the dimensions of the product you want to ship. The crate will be automatically
                  sized to accommodate your product with proper clearances.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  <strong>Size Limits:</strong> Minimum 10", Maximum 150" per dimension.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="width" className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-blue-500/30 flex items-center justify-center text-xs">W</span> Width (inches)
                </Label>
                <Input
                  id="width"
                  type="number"
                  step="0.125"
                  min="10"
                  max="150"
                  value={configuration.dimensions.width}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || !isNaN(Number(value))) {
                      updateDimensions({ width: value === '' ? 10 : Number(value) });
                    }
                  }}
                  onBlur={(e) => {
                    let newWidth = Number(e.target.value);
                    if (isNaN(newWidth) || newWidth < 10) newWidth = 10;
                    if (newWidth > 150) newWidth = 150;
                    updateDimensions({ width: newWidth });
                    logUser(
                      'dimension',
                      `Product width set to ${newWidth} inches`,
                      undefined,
                      'InputForms'
                    );
                  }}
                  placeholder="10-150 inches"
                  aria-label="Product width in inches"
                  className="transition-all duration-300 hover:border-purple-400 focus:border-pink-500 focus:ring-pink-500/20 dark:hover:border-pink-400 dark:focus:border-purple-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="length" className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-purple-500/30 flex items-center justify-center text-xs">L</span> Depth (inches)
                </Label>
                <Input
                  id="length"
                  type="number"
                  step="0.125"
                  min="10"
                  max="150"
                  value={configuration.dimensions.length}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || !isNaN(Number(value))) {
                      updateDimensions({ length: value === '' ? 10 : Number(value) });
                    }
                  }}
                  onBlur={(e) => {
                    let newLength = Number(e.target.value);
                    if (isNaN(newLength) || newLength < 10) newLength = 10;
                    if (newLength > 150) newLength = 150;
                    updateDimensions({ length: newLength });
                    logUser(
                      'dimension',
                      `Product depth set to ${newLength} inches`,
                      undefined,
                      'InputForms'
                    );
                  }}
                  placeholder="10-150 inches"
                  aria-label="Product depth in inches"
                  className="transition-all duration-300 hover:border-purple-400 focus:border-pink-500 focus:ring-pink-500/20 dark:hover:border-pink-400 dark:focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}