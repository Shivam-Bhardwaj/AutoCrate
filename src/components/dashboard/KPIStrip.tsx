'use client';

import { useCrateStore } from '@/store/crate-store';
import { useCrateEngine } from '@/hooks/useCrateEngine';
import { Package, Weight, Ruler, CheckCircle2, FileText, Activity } from 'lucide-react';

export default function KPIStrip() {
  const { configuration } = useCrateStore();
  const { results } = useCrateEngine();
  const calculations = results;
  const bomData = results;

  // Calculate key metrics
  const totalWeight = calculations?.weight?.estimatedGross || 0;
  const externalDims = `${configuration.dimensions.width}" × ${configuration.dimensions.length}" × ${configuration.dimensions.height}"`;
  const volume = ((configuration.dimensions.width * configuration.dimensions.length * configuration.dimensions.height) / 1728).toFixed(1);
  const bomCount = calculations?.bom?.length || 0;
  const boardFeet = '12.5'; // Mock data - would come from calculations

  const kpis = [
    {
      icon: Weight,
      label: 'Total Weight',
      value: `${totalWeight.toFixed(0)} lbs`,
      subtext: `${(totalWeight * 0.453592).toFixed(0)} kg`,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20'
    },
    {
      icon: Ruler,
      label: 'External Dims',
      value: externalDims,
      subtext: `${volume} ft³`,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/20'
    },
    {
      icon: Package,
      label: 'Board Feet',
      value: boardFeet,
      subtext: 'lumber vol.',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/20'
    },
    {
      icon: FileText,
      label: 'BOM Items',
      value: bomCount.toString(),
      subtext: 'components',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/20'
    },
    {
      icon: CheckCircle2,
      label: 'ISPM-15',
      value: 'PASS',
      subtext: 'compliant',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20'
    },
    {
      icon: Activity,
      label: 'Status',
      value: 'READY',
      subtext: 'to export',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-6 gap-4 mb-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className="glass-morphism backdrop-blur-2xl rounded-2xl p-4 card-glow hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${kpi.color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/60 uppercase tracking-wide">{kpi.label}</p>
                <p className="text-lg font-black text-white text-glow">{kpi.value}</p>
                <p className="text-xs text-white/50">{kpi.subtext}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}