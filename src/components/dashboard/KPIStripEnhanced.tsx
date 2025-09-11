'use client';

import { useCrateStore } from '@/store/crate-store';
import { useCrateEngine } from '@/hooks/useCrateEngine';
import { Package, Weight, Ruler, CheckCircle2, FileText, Activity, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

export default function KPIStrip() {
  const { configuration } = useCrateStore();
  const { results, isComputing } = useCrateEngine();

  // Use real data from results
  const totalWeight = results?.weight?.estimatedGross || 0;
  const externalDims = results ? 
    `${results.dimensions.external.width}" × ${results.dimensions.external.length}" × ${results.dimensions.external.height}"` :
    `${configuration.dimensions.width}" × ${configuration.dimensions.length}" × ${configuration.dimensions.height}"`;
  const volume = results ? 
    ((results.dimensions.external.width * results.dimensions.external.length * results.dimensions.external.height) / 1728).toFixed(1) :
    ((configuration.dimensions.width * configuration.dimensions.length * configuration.dimensions.height) / 1728).toFixed(1);
  const bomCount = results?.bom?.length || 0;
  
  // Calculate board feet from BOM materials
  const boardFeet = results?.cost ? 
    (results.cost.materials.items
      .filter(item => item.category === 'Panels' || item.category === 'Base' || item.category === 'Reinforcement')
      .reduce((sum, item) => sum + (item.quantity * (item.unit === 'sheets' ? 32 : item.unit === 'pieces' ? 8 : 1)), 0) / 12).toFixed(1) :
    '0.0';
  
  // Get compliance status
  const complianceStatus = results?.compliance?.overall === 'compliant' ? 'PASS' :
                          results?.compliance?.overall === 'partial' ? 'WARN' : 
                          results?.compliance?.overall === 'non-compliant' ? 'FAIL' : 'PENDING';
  
  // Get cost from real calculations
  const totalCost = results?.cost?.summary?.total || 0;
  
  // Get performance metrics
  const calcTime = results?.performance?.calculationTime || 0;
  
  // Determine system status based on results
  const systemStatus = isComputing ? 'COMPUTING' :
                      !results ? 'INITIALIZING' :
                      complianceStatus === 'PASS' ? 'READY' :
                      complianceStatus === 'WARN' ? 'REVIEW' : 'BLOCKED';

  const kpis = [
    {
      icon: Weight,
      label: 'Total Weight',
      value: `${totalWeight.toFixed(0)} lbs`,
      subtext: `${(totalWeight * 0.453592).toFixed(0)} kg`,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      highlight: totalWeight > 5000
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
      icon: DollarSign,
      label: 'Total Cost',
      value: `$${totalCost.toFixed(0)}`,
      subtext: `${bomCount} items`,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/20'
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
      icon: complianceStatus === 'PASS' ? CheckCircle2 : complianceStatus === 'WARN' ? AlertTriangle : CheckCircle2,
      label: 'Compliance',
      value: complianceStatus,
      subtext: results?.compliance?.certifications?.length ? `${results.compliance.certifications.length} certs` : 'checking',
      color: complianceStatus === 'PASS' ? 'from-green-500 to-emerald-500' : 
             complianceStatus === 'WARN' ? 'from-amber-500 to-yellow-500' : 
             complianceStatus === 'FAIL' ? 'from-red-500 to-pink-500' : 
             'from-gray-500 to-slate-500',
      bgColor: complianceStatus === 'PASS' ? 'bg-green-500/20' : 
               complianceStatus === 'WARN' ? 'bg-amber-500/20' : 
               complianceStatus === 'FAIL' ? 'bg-red-500/20' : 
               'bg-gray-500/20'
    },
    {
      icon: systemStatus === 'COMPUTING' ? Activity : 
            systemStatus === 'READY' ? TrendingUp : Activity,
      label: 'Status',
      value: systemStatus,
      subtext: calcTime > 0 ? `${calcTime.toFixed(0)}ms` : 'initializing',
      color: systemStatus === 'READY' ? 'from-indigo-500 to-blue-500' : 
             systemStatus === 'COMPUTING' ? 'from-yellow-500 to-orange-500' : 
             systemStatus === 'REVIEW' ? 'from-amber-500 to-yellow-500' : 
             'from-gray-500 to-slate-500',
      bgColor: systemStatus === 'READY' ? 'bg-indigo-500/20' : 
               systemStatus === 'COMPUTING' ? 'bg-yellow-500/20' : 
               systemStatus === 'REVIEW' ? 'bg-amber-500/20' : 
               'bg-gray-500/20',
      pulse: systemStatus === 'COMPUTING'
    }
  ];

  return (
    <div className="grid grid-cols-6 gap-4 mb-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className={`glass-morphism backdrop-blur-2xl rounded-2xl p-4 card-glow hover:scale-105 transition-all duration-300 ${kpi.pulse ? 'animate-pulse' : ''}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${kpi.color} flex items-center justify-center shadow-lg ${kpi.highlight ? 'ring-2 ring-white/50' : ''}`}>
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