'use client';

import { Button } from '@/components/ui/button';
import { Download, FileText, Share2, Save, RotateCcw, Camera } from 'lucide-react';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';

export default function QuickActions() {
  const { resetConfiguration } = useCrateStore();
  const { logUser } = useLogsStore();

  const actions = [
    {
      icon: FileText,
      label: 'Generate BOM',
      color: 'from-blue-500 to-cyan-500',
      primary: true,
      action: () => logUser('system', 'BOM generation started', undefined, 'QuickActions')
    },
    {
      icon: Download,
      label: 'Export JT',
      color: 'from-purple-500 to-pink-500',
      primary: true,
      action: () => logUser('system', 'JT export started', undefined, 'QuickActions')
    },
    {
      icon: Share2,
      label: 'Generate NX',
      color: 'from-emerald-500 to-teal-500',
      primary: true,
      action: () => logUser('system', 'NX generation started', undefined, 'QuickActions')
    },
    {
      icon: Camera,
      label: 'Snapshot',
      color: 'from-orange-500 to-red-500',
      primary: false,
      action: () => logUser('system', 'Snapshot captured', undefined, 'QuickActions')
    },
    {
      icon: Save,
      label: 'Save Preset',
      color: 'from-indigo-500 to-blue-500',
      primary: false,
      action: () => logUser('system', 'Configuration saved as preset', undefined, 'QuickActions')
    },
    {
      icon: RotateCcw,
      label: 'Reset',
      color: 'from-gray-500 to-slate-500',
      primary: false,
      action: () => {
        resetConfiguration();
        logUser('system', 'Configuration reset to defaults', undefined, 'QuickActions');
      }
    }
  ];

  const primaryActions = actions.filter(a => a.primary);
  const secondaryActions = actions.filter(a => !a.primary);

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white/80 uppercase tracking-wide">Primary Actions</h3>
        <div className="grid gap-3">
          {primaryActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.action}
                className={`w-full justify-start gap-3 bg-gradient-to-r ${action.color} hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-xl border border-white/20 text-white font-semibold`}
                size="lg"
              >
                <Icon className="w-5 h-5" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wide">Quick Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          {secondaryActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.action}
                variant="outline"
                className="justify-center gap-2 glass-morphism backdrop-blur-xl border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                size="sm"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}