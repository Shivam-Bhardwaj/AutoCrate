'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  Lightbulb, 
  Package, 
  Shield, 
  GitCompare,
  DollarSign,
  TrendingUp,
  Zap
} from 'lucide-react';
import ScenarioComparison from './ScenarioComparison';
import OptimizationSuggestions from './OptimizationSuggestions';
import MaterialLibraryBrowser from './MaterialLibraryBrowser';
import DesignRulesValidator from './DesignRulesValidator';
import { useCrateStore } from '@/store/crate-store';
import { useCrateEngine } from '@/hooks/useCrateEngine';

export default function ProfessionalDashboard() {
  const [activeTab, setActiveTab] = useState('optimization');
  const { configuration } = useCrateStore();
  const { results } = useCrateEngine();

  // Calculate quick metrics
  const totalCost = results?.cost?.summary?.total || 0;
  const complianceScore = results?.compliance ? 
    (results.compliance.checks.filter(c => c.status === 'pass').length / results.compliance.checks.length * 100) : 0;
  const materialEfficiency = results?.weight ? 
    (configuration.weight.product / results.weight.estimatedGross * 100) : 0;
  const optimizationPotential = 15; // Placeholder - would be calculated from optimization engine

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="glass-morphism backdrop-blur-2xl rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Professional Engineering Suite</h1>
            <p className="text-white/60">Advanced design optimization and validation tools</p>
          </div>
          <div className="flex gap-3">
            <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-xs text-white/60">Optimization Potential</p>
                  <p className="text-xl font-bold text-white">{optimizationPotential}%</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-xs text-white/60">Compliance Score</p>
                  <p className="text-xl font-bold text-white">{complianceScore.toFixed(0)}%</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-6 gap-4">
          <MetricCard
            icon={<DollarSign className="w-4 h-4" />}
            label="Total Cost"
            value={`$${totalCost.toFixed(0)}`}
            trend="+5%"
            trendUp={false}
          />
          <MetricCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Material Efficiency"
            value={`${materialEfficiency.toFixed(0)}%`}
            trend="+12%"
            trendUp={true}
          />
          <MetricCard
            icon={<Shield className="w-4 h-4" />}
            label="Structural Score"
            value="92/100"
            trend="Stable"
            trendUp={true}
          />
          <MetricCard
            icon={<Package className="w-4 h-4" />}
            label="Weight Ratio"
            value="1.2:1"
            trend="Optimal"
            trendUp={true}
          />
          <MetricCard
            icon={<BarChart3 className="w-4 h-4" />}
            label="Cost/lb"
            value={`$${(totalCost / (results?.weight?.estimatedGross || 1)).toFixed(2)}`}
            trend="-8%"
            trendUp={true}
          />
          <MetricCard
            icon={<Lightbulb className="w-4 h-4" />}
            label="Suggestions"
            value="12"
            trend="New"
            trendUp={true}
          />
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-morphism">
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Optimization
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Validation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="optimization" className="mt-6">
          <OptimizationSuggestions />
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          <ScenarioComparison />
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <MaterialLibraryBrowser />
        </TabsContent>

        <TabsContent value="validation" className="mt-6">
          <DesignRulesValidator />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon,
  label,
  value,
  trend,
  trendUp
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs text-white/60">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className={`text-xs ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
        {trend}
      </p>
    </div>
  );
}