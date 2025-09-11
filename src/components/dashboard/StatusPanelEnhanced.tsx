'use client';

import { CheckCircle2, AlertTriangle, XCircle, Loader2, Shield, Info } from 'lucide-react';
import { useCrateEngine } from '@/hooks/useCrateEngine';

export default function StatusPanel() {
  const { results, isComputing } = useCrateEngine();

  // Use real validation checks from compliance service
  const validations = results?.compliance?.checks ? 
    results.compliance.checks
      .filter(check => check.category === 'ISPM-15' || check.category === 'Structural' || check.category === 'ASME' || check.category === 'AMAT')
      .slice(0, 8)
      .map(check => ({
        label: check.requirement,
        category: check.category,
        status: check.status,
        details: check.details,
        value: check.value?.toString() || '',
        requirement: check.min !== undefined && check.max !== undefined ? 
          `${check.min}-${check.max} ${check.unit || ''}` :
          check.min !== undefined ? `≥ ${check.min} ${check.unit || ''}` :
          check.max !== undefined ? `≤ ${check.max} ${check.unit || ''}` :
          check.details
      })) : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending': return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'border-emerald-400/50 bg-emerald-500/10';
      case 'warning': return 'border-amber-400/50 bg-amber-500/10';
      case 'fail': return 'border-red-400/50 bg-red-500/10';
      case 'pending': return 'border-blue-400/50 bg-blue-500/10';
      default: return 'border-gray-400/50 bg-gray-500/10';
    }
  };

  const passedChecks = validations.filter(v => v.status === 'pass').length;
  const totalChecks = validations.length || 1;
  
  // Get certifications
  const certifications = results?.compliance?.certifications || [];
  
  // Get recommendations
  const recommendations = results?.compliance?.recommendations || [];

  // Export readiness status
  const exportStatus = results ? [
    { 
      task: 'BOM Generation', 
      status: results.bom && results.bom.length > 0 ? 'Ready' : 'Pending',
      progress: results.bom && results.bom.length > 0 ? 100 : 0
    },
    { 
      task: 'Cost Analysis', 
      status: results.cost ? 'Ready' : 'Pending',
      progress: results.cost ? 100 : 0
    },
    { 
      task: 'NX Code', 
      status: results.nxExpressions && results.nxExpressions.length > 0 ? 'Ready' : 'Pending',
      progress: results.nxExpressions && results.nxExpressions.length > 0 ? 100 : 0
    },
    { 
      task: 'Compliance Check', 
      status: results.compliance ? 'Ready' : 'Pending',
      progress: results.compliance ? 100 : 0
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Overall Compliance Status */}
      <div className="glass-morphism backdrop-blur-xl rounded-xl p-4 border border-white/20">
        <div className="flex items-center gap-3 mb-3">
          <Shield className={`w-5 h-5 ${
            results?.compliance?.overall === 'compliant' ? 'text-emerald-400' :
            results?.compliance?.overall === 'partial' ? 'text-amber-400' :
            results?.compliance?.overall === 'non-compliant' ? 'text-red-400' :
            'text-gray-400'
          }`} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">
            Compliance Status: {results?.compliance?.overall?.toUpperCase() || 'CHECKING'}
          </h3>
        </div>
        
        {certifications.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {certifications.map((cert, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full">
                {cert}
              </span>
            ))}
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>{passedChecks}/{totalChecks} Checks Passed</span>
            <span>{((passedChecks / totalChecks) * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                results?.compliance?.overall === 'compliant' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                results?.compliance?.overall === 'partial' ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                results?.compliance?.overall === 'non-compliant' ? 'bg-gradient-to-r from-red-400 to-pink-500' :
                'bg-gradient-to-r from-gray-400 to-slate-500'
              }`}
              style={{ width: `${(passedChecks / totalChecks) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Validation Items */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {validations.length > 0 ? (
          validations.map((validation, index) => (
            <div key={index} className={`glass-morphism backdrop-blur-xl rounded-xl p-4 border ${getStatusColor(validation.status)} hover:scale-[1.02] transition-all duration-300`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(validation.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-white">
                      <span className="text-xs text-white/50 mr-2">[{validation.category}]</span>
                      {validation.label}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      validation.status === 'pass' ? 'bg-emerald-500/20 text-emerald-300' :
                      validation.status === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                      validation.status === 'fail' ? 'bg-red-500/20 text-red-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {validation.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-white/70">{validation.details}</p>
                  {validation.value && (
                    <p className="text-xs text-white/50 mt-1">
                      Value: {validation.value} | Req: {validation.requirement}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-white/50">
            {isComputing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span>Running compliance checks...</span>
              </div>
            ) : (
              'No validation data available'
            )}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="glass-morphism backdrop-blur-xl rounded-xl p-4 border border-amber-400/50 bg-amber-500/10">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {recommendations.slice(0, 3).map((rec, index) => (
              <li key={index} className="text-xs text-white/70 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Export Status */}
      <div className="glass-morphism backdrop-blur-xl rounded-xl p-4 border border-blue-400/50 bg-blue-500/10">
        <h4 className="text-sm font-semibold text-white mb-3">Export Readiness</h4>
        <div className="space-y-2">
          {exportStatus.map((task, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-xs text-white/70">{task.task}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-slate-700/50 rounded-full h-1">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      task.progress === 100 ? 'bg-emerald-400' : 'bg-blue-400'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className={`text-xs min-w-[3rem] ${
                  task.status === 'Ready' ? 'text-emerald-300' : 'text-white/60'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Overall Export Status */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Overall Status</span>
            <span className={`text-xs px-3 py-1 rounded-full ${
              exportStatus.every(s => s.status === 'Ready') ? 
                'bg-emerald-500/20 text-emerald-300' : 
                'bg-blue-500/20 text-blue-300'
            }`}>
              {exportStatus.every(s => s.status === 'Ready') ? 'Ready to Export' : 'Processing...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}