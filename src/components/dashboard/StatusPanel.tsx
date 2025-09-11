'use client';

import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { useCrateStore } from '@/store/crate-store';

export default function StatusPanel() {
  const { configuration } = useCrateStore();

  // Mock validation checks - in real app, these would come from validation services
  const validations = [
    {
      label: 'Structural Integrity',
      status: 'pass',
      details: 'Skid capacity: 2,400 lbs',
      requirement: '> 2,000 lbs'
    },
    {
      label: 'Fastener Spacing',
      status: configuration.dimensions.width < 50 ? 'pass' : 'warning',
      details: 'Screw spacing: 8" O.C.',
      requirement: '≤ 12" O.C.'
    },
    {
      label: 'Panel Thickness',
      status: 'pass',
      details: 'Min thickness: 0.75"',
      requirement: '≥ 0.5"'
    },
    {
      label: 'ISPM-15 Compliance',
      status: 'pass',
      details: 'Heat treatment certified',
      requirement: 'HT stamping'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'border-emerald-400/50 bg-emerald-500/10';
      case 'warning': return 'border-amber-400/50 bg-amber-500/10';
      case 'fail': return 'border-red-400/50 bg-red-500/10';
      default: return 'border-blue-400/50 bg-blue-500/10';
    }
  };

  const passedChecks = validations.filter(v => v.status === 'pass').length;
  const totalChecks = validations.length;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white/80 uppercase tracking-wide">System Status</h3>
          <span className="text-xs text-white/60">{passedChecks}/{totalChecks} Checks Passed</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 ease-out"
            style={{ width: `${(passedChecks / totalChecks) * 100}%` }}
          />
        </div>
      </div>

      {/* Validation Items */}
      <div className="space-y-3">
        {validations.map((validation, index) => (
          <div key={index} className={`glass-morphism backdrop-blur-xl rounded-xl p-4 border ${getStatusColor(validation.status)} hover:scale-[1.02] transition-all duration-300`}>
            <div className="flex items-start gap-3">
              {getStatusIcon(validation.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-white">{validation.label}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    validation.status === 'pass' ? 'bg-emerald-500/20 text-emerald-300' :
                    validation.status === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {validation.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-white/70">{validation.details}</p>
                <p className="text-xs text-white/50 mt-1">Req: {validation.requirement}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Generation Status */}
      <div className="glass-morphism backdrop-blur-xl rounded-xl p-4 border border-blue-400/50 bg-blue-500/10">
        <h4 className="text-sm font-semibold text-white mb-3">Export Status</h4>
        <div className="space-y-2">
          {[
            { task: 'BOM Generation', status: 'Ready', progress: 100 },
            { task: 'Drawing Export', status: 'Ready', progress: 100 },
            { task: 'NX Code', status: 'Ready', progress: 100 },
            { task: 'JT Export', status: 'Idle', progress: 0 }
          ].map((task, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-xs text-white/70">{task.task}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-slate-700/50 rounded-full h-1">
                  <div 
                    className="h-full bg-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="text-xs text-white/60 min-w-[3rem]">{task.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}