'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react';
import { OptimizationEngine, OptimizationReport, OptimizationSuggestion } from '@/services/optimizationEngine';
import { useCrateStore } from '@/store/crate-store';

export default function OptimizationSuggestions() {
  const { configuration, updateDimensions, updatePanel, updateFasteners } = useCrateStore();
  const [report, setReport] = useState<OptimizationReport | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    runOptimization();
  }, [configuration]);

  const runOptimization = () => {
    setIsOptimizing(true);
    const engine = new OptimizationEngine(configuration);
    const optimizationReport = engine.runOptimization();
    setReport(optimizationReport);
    setIsOptimizing(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weight': return <TrendingDown className="w-4 h-4" />;
      case 'cost': return <DollarSign className="w-4 h-4" />;
      case 'material': return <Package className="w-4 h-4" />;
      case 'structural': return <Shield className="w-4 h-4" />;
      case 'compliance': return <CheckCircle className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return { color: 'bg-green-500/20 text-green-400', text: 'Easy' };
      case 'moderate': return { color: 'bg-yellow-500/20 text-yellow-400', text: 'Moderate' };
      case 'complex': return { color: 'bg-red-500/20 text-red-400', text: 'Complex' };
      default: return { color: 'bg-gray-500/20 text-gray-400', text: 'Unknown' };
    }
  };

  const handleApplySuggestion = (suggestion: OptimizationSuggestion) => {
    if (!suggestion.configChanges) return;
    
    // Apply configuration changes based on suggestion
    if (suggestion.configChanges.cap) {
      Object.entries(suggestion.configChanges.cap).forEach(([panelKey, panel]) => {
        updatePanel(panelKey as any, panel);
      });
    }
    
    if (suggestion.configChanges.fasteners) {
      updateFasteners(suggestion.configChanges.fasteners);
    }
    
    // Mark as applied
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
    
    // Re-run optimization
    setTimeout(runOptimization, 100);
  };

  const handleApplySelected = () => {
    if (!report) return;
    
    report.suggestions
      .filter(s => selectedSuggestions.has(s.id) && s.configChanges)
      .forEach(s => handleApplySuggestion(s));
    
    setSelectedSuggestions(new Set());
  };

  const toggleSuggestionSelection = (id: string) => {
    const newSelection = new Set(selectedSuggestions);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedSuggestions(newSelection);
  };

  if (!report) {
    return (
      <Card className="glass-morphism p-6">
        <div className="flex items-center justify-center h-32">
          <p className="text-white/60">Analyzing configuration...</p>
        </div>
      </Card>
    );
  }

  const categorizedSuggestions = {
    weight: report.suggestions.filter(s => s.category === 'weight'),
    cost: report.suggestions.filter(s => s.category === 'cost'),
    material: report.suggestions.filter(s => s.category === 'material'),
    structural: report.suggestions.filter(s => s.category === 'structural'),
    compliance: report.suggestions.filter(s => s.category === 'compliance')
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Optimization Analysis</h2>
        <Button
          onClick={runOptimization}
          disabled={isOptimizing}
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isOptimizing ? 'Analyzing...' : 'Re-analyze'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="glass-morphism p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/60">Potential Weight Savings</p>
              <p className="text-xl font-bold text-white">{report.potentialSavings.weight.toFixed(0)} lbs</p>
            </div>
          </div>
        </Card>

        <Card className="glass-morphism p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/60">Potential Cost Savings</p>
              <p className="text-xl font-bold text-white">${report.potentialSavings.cost.toFixed(0)}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-morphism p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/60">Suggestions</p>
              <p className="text-xl font-bold text-white">{report.suggestions.length}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-morphism p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/60">Efficiency Score</p>
              <p className="text-xl font-bold text-white">
                {report.currentMetrics.materialEfficiency.toFixed(0)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Suggestions by Category */}
      <Card className="glass-morphism p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Optimization Suggestions</h3>
          {selectedSuggestions.size > 0 && (
            <Button
              onClick={handleApplySelected}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              Apply {selectedSuggestions.size} Selected
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({report.suggestions.length})</TabsTrigger>
            <TabsTrigger value="weight">Weight ({categorizedSuggestions.weight.length})</TabsTrigger>
            <TabsTrigger value="cost">Cost ({categorizedSuggestions.cost.length})</TabsTrigger>
            <TabsTrigger value="material">Material ({categorizedSuggestions.material.length})</TabsTrigger>
            <TabsTrigger value="structural">Structural ({categorizedSuggestions.structural.length})</TabsTrigger>
            <TabsTrigger value="compliance">Compliance ({categorizedSuggestions.compliance.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {report.suggestions.map(suggestion => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                isSelected={selectedSuggestions.has(suggestion.id)}
                isApplied={appliedSuggestions.has(suggestion.id)}
                onToggleSelect={() => toggleSuggestionSelection(suggestion.id)}
                onApply={() => handleApplySuggestion(suggestion)}
                getCategoryIcon={getCategoryIcon}
                getPriorityColor={getPriorityColor}
                getDifficultyBadge={getDifficultyBadge}
              />
            ))}
          </TabsContent>

          {Object.entries(categorizedSuggestions).map(([category, suggestions]) => (
            <TabsContent key={category} value={category} className="space-y-3 mt-4">
              {suggestions.map(suggestion => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  isSelected={selectedSuggestions.has(suggestion.id)}
                  isApplied={appliedSuggestions.has(suggestion.id)}
                  onToggleSelect={() => toggleSuggestionSelection(suggestion.id)}
                  onApply={() => handleApplySuggestion(suggestion)}
                  getCategoryIcon={getCategoryIcon}
                  getPriorityColor={getPriorityColor}
                  getDifficultyBadge={getDifficultyBadge}
                />
              ))}
              {suggestions.length === 0 && (
                <div className="text-center py-8 text-white/40">
                  No suggestions in this category
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}

// Suggestion Card Component
function SuggestionCard({
  suggestion,
  isSelected,
  isApplied,
  onToggleSelect,
  onApply,
  getCategoryIcon,
  getPriorityColor,
  getDifficultyBadge
}: {
  suggestion: OptimizationSuggestion;
  isSelected: boolean;
  isApplied: boolean;
  onToggleSelect: () => void;
  onApply: () => void;
  getCategoryIcon: (category: string) => JSX.Element;
  getPriorityColor: (priority: string) => string;
  getDifficultyBadge: (difficulty: string) => { color: string; text: string };
}) {
  const difficulty = getDifficultyBadge(suggestion.implementationDifficulty);
  
  return (
    <div
      className={`bg-white/5 rounded-lg p-4 transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${isApplied ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            disabled={isApplied}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded-lg ${getPriorityColor(suggestion.priority)} flex items-center justify-center`}>
                {getCategoryIcon(suggestion.category)}
              </div>
              <h4 className="font-semibold text-white">{suggestion.title}</h4>
              <Badge className={difficulty.color}>
                {difficulty.text}
              </Badge>
              {isApplied && (
                <Badge className="bg-green-500/20 text-green-400">
                  Applied
                </Badge>
              )}
            </div>
            
            <p className="text-white/80 mb-3">{suggestion.description}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-xs text-white/60">Current</p>
                <p className="font-mono text-sm text-white">{suggestion.currentValue}</p>
              </div>
              <div>
                <p className="text-xs text-white/60">Suggested</p>
                <p className="font-mono text-sm text-green-400">{suggestion.suggestedValue}</p>
              </div>
              <div>
                <p className="text-xs text-white/60">Impact</p>
                <div className="flex gap-2">
                  {suggestion.impact.weightChange !== 0 && (
                    <span className={`text-sm ${suggestion.impact.weightChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {suggestion.impact.weightChange > 0 ? '+' : ''}{suggestion.impact.weightChange} lbs
                    </span>
                  )}
                  {suggestion.impact.costChange !== 0 && (
                    <span className={`text-sm ${suggestion.impact.costChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {suggestion.impact.costChange > 0 ? '+' : ''}${suggestion.impact.costChange.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-white/60">
              <span className="font-medium">Implementation:</span> {suggestion.implementation}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          {suggestion.estimatedSavings > 0 && (
            <div className="text-right">
              <p className="text-xs text-white/60">Est. Savings</p>
              <p className="text-lg font-bold text-green-400">
                ${suggestion.estimatedSavings.toFixed(0)}
              </p>
            </div>
          )}
          {suggestion.configChanges && !isApplied && (
            <Button
              size="sm"
              onClick={onApply}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <ArrowRight className="w-4 h-4" />
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}