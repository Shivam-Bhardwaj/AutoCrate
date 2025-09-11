'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Download, Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { scenarioComparisonService, Scenario, ComparisonReport } from '@/services/scenarioComparison';
import { useCrateStore } from '@/store/crate-store';
import { CrateConfiguration } from '@/types/crate';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ScenarioComparison() {
  const { configuration } = useCrateStore();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [selectedB, setSelectedB] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ComparisonReport | null>(null);
  const [showNewScenarioDialog, setShowNewScenarioDialog] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');

  useEffect(() => {
    // Load saved scenarios
    const savedScenarios = scenarioComparisonService.getAllScenarios();
    setScenarios(savedScenarios);
  }, []);

  useEffect(() => {
    // Compare scenarios when selection changes
    if (selectedA && selectedB) {
      const report = scenarioComparisonService.compareScenarios(selectedA, selectedB);
      setComparison(report);
    } else {
      setComparison(null);
    }
  }, [selectedA, selectedB]);

  const handleCreateScenario = () => {
    if (!newScenarioName) return;
    
    const scenario = scenarioComparisonService.createScenario(
      newScenarioName,
      newScenarioDescription,
      configuration,
      ['current']
    );
    
    setScenarios([...scenarios, scenario]);
    setShowNewScenarioDialog(false);
    setNewScenarioName('');
    setNewScenarioDescription('');
  };

  const handleDeleteScenario = (id: string) => {
    scenarioComparisonService.deleteScenario(id);
    setScenarios(scenarios.filter(s => s.id !== id));
    if (selectedA === id) setSelectedA(null);
    if (selectedB === id) setSelectedB(null);
  };

  const handleExportComparison = () => {
    if (!comparison) return;
    
    const csv = scenarioComparisonService.exportComparisonReport(comparison, 'csv');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison_${Date.now()}.csv`;
    a.click();
  };

  const renderDeltaIcon = (favorable: 'A' | 'B' | 'neutral') => {
    if (favorable === 'A') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (favorable === 'B') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const formatValue = (value: number | string, unit: string): string => {
    if (typeof value === 'number') {
      if (unit === 'USD') return `$${value.toFixed(2)}`;
      if (unit === 'lbs') return `${value.toFixed(0)} ${unit}`;
      if (unit === 'ft³') return `${value.toFixed(1)} ${unit}`;
      return `${value.toFixed(2)} ${unit}`;
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Scenario Comparison</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowNewScenarioDialog(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Save Current Design
          </Button>
          {comparison && (
            <Button
              onClick={handleExportComparison}
              variant="outline"
              className="border-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-morphism p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Scenario A</h3>
          <div className="space-y-2">
            {scenarios.map(scenario => (
              <div
                key={scenario.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedA === scenario.id 
                    ? 'bg-blue-500/20 border-2 border-blue-500' 
                    : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                }`}
                onClick={() => setSelectedA(scenario.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-white">{scenario.name}</p>
                    <p className="text-sm text-white/60">{scenario.description}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {new Date(scenario.modifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteScenario(scenario.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-morphism p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Scenario B</h3>
          <div className="space-y-2">
            {scenarios.map(scenario => (
              <div
                key={scenario.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedB === scenario.id 
                    ? 'bg-purple-500/20 border-2 border-purple-500' 
                    : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                }`}
                onClick={() => setSelectedB(scenario.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-white">{scenario.name}</p>
                    <p className="text-sm text-white/60">{scenario.description}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {new Date(scenario.modifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteScenario(scenario.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <Card className="glass-morphism p-6">
          <div className="flex items-center gap-3 mb-4">
            <ArrowLeftRight className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">Comparison Results</h3>
            <Badge 
              className={`ml-auto ${
                comparison.overallComparison.overallWinner === 'A' 
                  ? 'bg-blue-500' 
                  : comparison.overallComparison.overallWinner === 'B'
                  ? 'bg-purple-500'
                  : 'bg-gray-500'
              }`}
            >
              {comparison.overallComparison.overallWinner === 'draw' 
                ? 'Draw' 
                : `Scenario ${comparison.overallComparison.overallWinner} Wins`}
            </Badge>
          </div>

          <Tabs defaultValue="deltas" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deltas">Key Metrics</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="deltas" className="space-y-4 mt-4">
              {comparison.deltas.slice(0, 6).map((delta, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {renderDeltaIcon(delta.favorable)}
                      <div>
                        <p className="font-medium text-white">{delta.metric}</p>
                        <p className="text-sm text-white/60">{delta.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-4 items-center">
                        <div>
                          <p className="text-sm text-blue-400">Scenario A</p>
                          <p className="font-mono text-white">
                            {formatValue(delta.scenarioA, delta.unit)}
                          </p>
                        </div>
                        <div className="text-white/40">vs</div>
                        <div>
                          <p className="text-sm text-purple-400">Scenario B</p>
                          <p className="font-mono text-white">
                            {formatValue(delta.scenarioB, delta.unit)}
                          </p>
                        </div>
                      </div>
                      {delta.percentageChange !== undefined && (
                        <p className={`text-sm mt-1 ${
                          delta.favorable === 'A' ? 'text-green-400' : 
                          delta.favorable === 'B' ? 'text-red-400' : 
                          'text-gray-400'
                        }`}>
                          {delta.percentageChange > 0 ? '+' : ''}
                          {delta.percentageChange.toFixed(1)}% change
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-3 mt-4">
              {comparison.recommendations.map((rec, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <p className="text-white flex items-start gap-2">
                    <span className="text-green-400 mt-1">→</span>
                    {rec}
                  </p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="detailed" className="mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-white/60 mb-2">Cost Efficiency</p>
                  <p className="text-2xl font-bold text-white">
                    Scenario {comparison.overallComparison.costEfficiency === 'equal' ? '=' : comparison.overallComparison.costEfficiency}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-white/60 mb-2">Weight Optimization</p>
                  <p className="text-2xl font-bold text-white">
                    Scenario {comparison.overallComparison.weightOptimization === 'equal' ? '=' : comparison.overallComparison.weightOptimization}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-white/60 mb-2">Compliance Score</p>
                  <p className="text-2xl font-bold text-white">
                    Scenario {comparison.overallComparison.complianceScore === 'equal' ? '=' : comparison.overallComparison.complianceScore}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {comparison.deltas.map((delta, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-white/80">{delta.metric}</span>
                    <div className="flex gap-4">
                      <span className={delta.favorable === 'A' ? 'text-blue-400' : 'text-white/60'}>
                        {formatValue(delta.scenarioA, delta.unit)}
                      </span>
                      <span className="text-white/40">|</span>
                      <span className={delta.favorable === 'B' ? 'text-purple-400' : 'text-white/60'}>
                        {formatValue(delta.scenarioB, delta.unit)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      {/* New Scenario Dialog */}
      <Dialog open={showNewScenarioDialog} onOpenChange={setShowNewScenarioDialog}>
        <DialogContent className="bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Save Current Design as Scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white/80">Scenario Name</Label>
              <Input
                id="name"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="e.g., Lightweight Option"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-white/80">Description</Label>
              <Input
                id="description"
                value={newScenarioDescription}
                onChange={(e) => setNewScenarioDescription(e.target.value)}
                placeholder="e.g., Optimized for air shipping"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNewScenarioDialog(false)}
                className="border-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateScenario}
                className="bg-gradient-to-r from-blue-500 to-purple-500"
              >
                Save Scenario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}