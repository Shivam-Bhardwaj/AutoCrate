'use client';

import React, { useCallback, useMemo } from 'react';
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
import { useDebouncedCallback } from '@/utils/debounce';

export default function InputFormsOptimized() {
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

  // Create debounced update functions (300ms delay as per requirements)
  const debouncedUpdateDimensions = useDebouncedCallback(
    (dimensions: any) => {
      updateDimensions(dimensions);
      logUser('input', 'Dimensions updated', 'InputForms', dimensions);
    },
    300,
    []
  );

  const debouncedUpdateWeight = useDebouncedCallback(
    (weight: any) => {
      updateWeight(weight);
      logUser('input', 'Weight updated', 'InputForms', weight);
    },
    300,
    []
  );

  const debouncedUpdateProjectName = useDebouncedCallback(
    (name: string) => {
      updateProjectName(name);
      logUser('input', 'Project name updated', 'InputForms', { projectName: name });
    },
    300,
    []
  );

  // Handle dimension changes with debouncing
  const handleDimensionChange = useCallback((field: 'length' | 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 0;
    debouncedUpdateDimensions({
      ...configuration.dimensions,
      [field]: numValue
    });
  }, [configuration.dimensions, debouncedUpdateDimensions]);

  // Handle weight change with debouncing
  const handleWeightChange = useCallback((value: string) => {
    const numValue = parseFloat(value) || 0;
    debouncedUpdateWeight({
      ...configuration.weight,
      product: numValue
    });
  }, [configuration.weight, debouncedUpdateWeight]);

  // Handle project name change with debouncing
  const handleProjectNameChange = useCallback((value: string) => {
    debouncedUpdateProjectName(value);
  }, [debouncedUpdateProjectName]);

  // Non-debounced updates for select dropdowns and switches (instant feedback)
  const handleBaseTypeChange = useCallback((value: string) => {
    updateBase({
      ...configuration.base,
      type: value as 'skid' | 'platform' | 'pallet'
    });
    logUser('input', 'Base type changed', 'InputForms', { baseType: value });
  }, [configuration.base, updateBase, logUser]);

  const handleFastenerTypeChange = useCallback((value: string) => {
    updateFasteners({
      ...configuration.fasteners,
      type: value as 'nails' | 'screws' | 'bolts'
    });
    logUser('input', 'Fastener type changed', 'InputForms', { fastenerType: value });
  }, [configuration.fasteners, updateFasteners, logUser]);

  const handleTopPanelToggle = useCallback((checked: boolean) => {
    updatePanel('topPanel', { enabled: checked });
    logUser('input', 'Top panel toggled', 'InputForms', { topPanel: checked });
  }, [updatePanel, logUser]);

  const handleVinylToggle = useCallback((checked: boolean) => {
    updatePanel('frontPanel', { vinyl: checked });
    logUser('input', 'Vinyl coating toggled', 'InputForms', { vinyl: checked });
  }, [updatePanel, logUser]);

  // Memoize section components for better performance
  const projectSection = useMemo(() => (
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
          defaultValue={configuration.projectName}
          onChange={(e) => handleProjectNameChange(e.target.value)}
          placeholder="Enter project name"
          className="w-full"
        />
      </div>
    </div>
  ), [configuration.projectName, handleProjectNameChange]);

  const dimensionsSection = useMemo(() => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center shadow-xl">
          <span className="text-white text-lg font-black">D</span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Product Dimensions</h3>
      </div>
      
      <div className="bg-gradient-to-r from-green-50/50 to-teal-50/50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-600/50 p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="length" className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Length (inches)
            </Label>
            <Input
              id="length"
              type="number"
              min="1"
              defaultValue={configuration.dimensions.length}
              onChange={(e) => handleDimensionChange('length', e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="width" className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Width (inches)
            </Label>
            <Input
              id="width"
              type="number"
              min="1"
              defaultValue={configuration.dimensions.width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Height (inches)
            </Label>
            <Input
              id="height"
              type="number"
              min="1"
              defaultValue={configuration.dimensions.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="weight" className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Product Weight (lbs)
          </Label>
          <Input
            id="weight"
            type="number"
            min="0"
            step="0.1"
            defaultValue={configuration.weight.product}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  ), [configuration.dimensions, configuration.weight.product, handleDimensionChange, handleWeightChange]);

  const configSection = useMemo(() => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-xl">
          <span className="text-white text-lg font-black">C</span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Configuration</h3>
      </div>
      
      <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-600/50 p-6 space-y-4">
        <div>
          <Label htmlFor="baseType" className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Base Type
          </Label>
          <Select value={configuration.base.type} onValueChange={handleBaseTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select base type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skid">Skid</SelectItem>
              <SelectItem value="platform">Platform</SelectItem>
              <SelectItem value="pallet">Pallet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="fastenerType" className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Fastener Type
          </Label>
          <Select value={configuration.fasteners.type} onValueChange={handleFastenerTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select fastener type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nails">Nails</SelectItem>
              <SelectItem value="screws">Screws</SelectItem>
              <SelectItem value="bolts">Bolts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="topPanel" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Include Top Panel
            </Label>
            <Switch
              id="topPanel"
              checked={configuration.cap.topPanel?.enabled || false}
              onCheckedChange={handleTopPanelToggle}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="vinyl" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Apply Vinyl Coating
            </Label>
            <Switch
              id="vinyl"
              checked={configuration.cap.frontPanel?.vinyl || false}
              onCheckedChange={handleVinylToggle}
            />
          </div>
        </div>
      </div>
    </div>
  ), [configuration.base.type, configuration.fasteners.type, configuration.cap, handleBaseTypeChange, handleFastenerTypeChange, handleTopPanelToggle, handleVinylToggle]);

  return (
    <div className="h-full overflow-y-auto" role="form" aria-label="Crate configuration form">
      <div className="p-6 space-y-8">
        {projectSection}
        {dimensionsSection}
        {configSection}
      </div>
    </div>
  );
}