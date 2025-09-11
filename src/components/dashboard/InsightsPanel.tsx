'use client';

import { useCrateStore } from '@/store/crate-store';
import { useCrateEngine } from '@/hooks/useCrateEngine';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function InsightsPanel() {
  const { configuration } = useCrateStore();
  const { results } = useCrateEngine();
  const calculations = results;

  // Mock data for weight breakdown - in real app from weightCalculations service
  const weightBreakdown = [
    { component: 'Panels', weight: 45, color: 'bg-blue-500' },
    { component: 'Skids', weight: 32, color: 'bg-purple-500' },
    { component: 'Floor', weight: 28, color: 'bg-emerald-500' },
    { component: 'Cleats', weight: 15, color: 'bg-orange-500' },
    { component: 'Fasteners', weight: 8, color: 'bg-pink-500' }
  ];

  const totalWeight = weightBreakdown.reduce((sum, item) => sum + item.weight, 0);

  // Material usage data
  const materialUsage = [
    { size: '2x4', quantity: 24, color: 'bg-cyan-500' },
    { size: '2x6', quantity: 8, color: 'bg-indigo-500' },
    { size: '3/4" Ply', quantity: 6, color: 'bg-teal-500' },
    { size: '1x4', quantity: 16, color: 'bg-purple-500' }
  ];

  const maxUsage = Math.max(...materialUsage.map(m => m.quantity));

  return (
    <div className="space-y-6">
      {/* Weight Breakdown */}
      <div className="glass-morphism backdrop-blur-2xl rounded-2xl p-6 card-glow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
            <PieChart className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Weight Distribution</h3>
        </div>
        
        <div className="space-y-3">
          {weightBreakdown.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-white/90">{item.component}</span>
                  <span className="text-sm text-white/70">{item.weight} lbs</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                    style={{ width: `${(item.weight / totalWeight) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-white/60 min-w-[3rem] text-right">
                {((item.weight / totalWeight) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Material Usage */}
      <div className="glass-morphism backdrop-blur-2xl rounded-2xl p-6 card-glow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Material Usage</h3>
        </div>
        
        <div className="space-y-4">
          {materialUsage.map((material, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white/90">{material.size}</span>
                <span className="text-sm text-white/70">{material.quantity} pcs</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${material.color} transition-all duration-1000 delay-${index * 100}`}
                  style={{ width: `${(material.quantity / maxUsage) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="glass-morphism backdrop-blur-2xl rounded-2xl p-6 card-glow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Performance</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <p className="text-2xl font-black text-white">60</p>
            <p className="text-xs text-white/60">FPS</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <p className="text-2xl font-black text-white">16</p>
            <p className="text-xs text-white/60">ms frame</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <p className="text-2xl font-black text-white">1.2</p>
            <p className="text-xs text-white/60">sec calc</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <p className="text-2xl font-black text-white">98%</p>
            <p className="text-xs text-white/60">accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
}