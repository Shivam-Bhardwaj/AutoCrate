'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/separator';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Shield,
  Wrench,
  Download,
  RefreshCw,
  X,
  ChevronRight
} from 'lucide-react';
import { designRulesEngine, ValidationReport, ViolationDetail, DesignRule } from '@/services/designRulesEngine';
import { useCrateStore } from '@/store/crate-store';

export default function DesignRulesValidator() {
  const { configuration } = useCrateStore();
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [expandedViolations, setExpandedViolations] = useState<Set<string>>(new Set());
  const [rules, setRules] = useState<DesignRule[]>([]);
  const [selectedTab, setSelectedTab] = useState('violations');

  useEffect(() => {
    loadRules();
    validateDesign();
  }, [configuration]);

  const loadRules = () => {
    const allRules = designRulesEngine.getAllRules();
    setRules(allRules);
  };

  const validateDesign = () => {
    setIsValidating(true);
    setTimeout(() => {
      const validationReport = designRulesEngine.validate(configuration);
      setReport(validationReport);
      setIsValidating(false);
    }, 500);
  };

  const handleAutoFix = () => {
    const { fixedConfiguration, fixedViolations } = designRulesEngine.autoFix(configuration);
    // In a real app, we would update the configuration through the store
    console.log('Fixed violations:', fixedViolations);
    // Re-validate after fixes
    validateDesign();
  };

  const handleExportReport = () => {
    if (!report) return;
    
    const html = designRulesEngine.exportReport(report, 'html');
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-validation-${Date.now()}.html`;
    a.click();
  };

  const toggleViolationExpansion = (id: string) => {
    const newExpanded = new Set(expandedViolations);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedViolations(newExpanded);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <X className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getComplianceLevel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  if (!report) {
    return (
      <Card className="glass-morphism p-6">
        <div className="flex items-center justify-center h-32">
          <p className="text-white/60">Validating design...</p>
        </div>
      </Card>
    );
  }

  const violationsByCategory = {
    structural: report.violations.filter(v => v.category === 'structural'),
    dimensional: report.violations.filter(v => v.category === 'dimensional'),
    material: report.violations.filter(v => v.category === 'material'),
    safety: report.violations.filter(v => v.category === 'safety'),
    compliance: report.violations.filter(v => v.category === 'compliance')
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Design Validation</h2>
        <div className="flex gap-2">
          {report.canAutoFix && (
            <Button
              onClick={handleAutoFix}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Auto-Fix Issues
            </Button>
          )}
          <Button
            onClick={validateDesign}
            disabled={isValidating}
            variant="outline"
            className="border-white/20"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
            Re-validate
          </Button>
          <Button
            onClick={handleExportReport}
            variant="outline"
            className="border-white/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Score Card */}
      <Card className="glass-morphism p-6">
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-white/10"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(report.score / 100) * 352} 352`}
                  className={getScoreColor(report.score)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <p className={`text-3xl font-bold ${getScoreColor(report.score)}`}>
                    {report.score.toFixed(0)}%
                  </p>
                  <p className="text-xs text-white/60">{getComplianceLevel(report.score)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-3 grid grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-sm text-white/60">Passed</p>
              </div>
              <p className="text-2xl font-bold text-white">{report.rules.passed}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <X className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-sm text-white/60">Failed</p>
              </div>
              <p className="text-2xl font-bold text-white">{report.rules.failed}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="text-sm text-white/60">Warnings</p>
              </div>
              <p className="text-2xl font-bold text-white">{report.rules.warnings}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-sm text-white/60">Total Rules</p>
              </div>
              <p className="text-2xl font-bold text-white">{report.rules.total}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Violations and Rules */}
      <Card className="glass-morphism p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="violations">
              Violations ({report.violations.length})
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              Suggestions ({report.suggestions.length})
            </TabsTrigger>
            <TabsTrigger value="rules">
              Rules ({rules.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="violations" className="space-y-3 mt-4">
            {Object.entries(violationsByCategory).map(([category, violations]) => (
              violations.length > 0 && (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold text-white/60 uppercase">
                    {category} ({violations.length})
                  </h4>
                  {violations.map((violation, idx) => (
                    <div
                      key={`${category}-${idx}`}
                      className="bg-white/5 rounded-lg p-4"
                    >
                      <div
                        className="flex justify-between items-start cursor-pointer"
                        onClick={() => toggleViolationExpansion(`${category}-${idx}`)}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg ${getSeverityColor(violation.severity)} flex items-center justify-center`}>
                            {getSeverityIcon(violation.severity)}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-white">{violation.ruleName}</h5>
                            <p className="text-white/80 mt-1">{violation.message}</p>
                            {violation.currentValue && (
                              <div className="flex gap-4 mt-2">
                                <span className="text-sm text-white/60">
                                  Current: <span className="text-red-400">{violation.currentValue}</span>
                                </span>
                                {violation.expectedValue && (
                                  <span className="text-sm text-white/60">
                                    Expected: <span className="text-green-400">{violation.expectedValue}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {violation.canAutoFix && (
                            <Badge className="bg-green-500/20 text-green-400">
                              Auto-fixable
                            </Badge>
                          )}
                          <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${
                            expandedViolations.has(`${category}-${idx}`) ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </div>
                      
                      {expandedViolations.has(`${category}-${idx}`) && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          {violation.suggestion && (
                            <div className="bg-blue-500/10 rounded-lg p-3 mb-2">
                              <p className="text-sm text-blue-300">
                                <span className="font-medium">Suggestion:</span> {violation.suggestion}
                              </p>
                            </div>
                          )}
                          {violation.reference && (
                            <p className="text-xs text-white/40">
                              Reference: {violation.reference}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ))}
            
            {report.violations.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-white/60">No violations found! Design is fully compliant.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-3 mt-4">
            {report.suggestions.map((suggestion, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4">
                <p className="text-white flex items-start gap-2">
                  <span className="text-blue-400 mt-1">→</span>
                  {suggestion}
                </p>
              </div>
            ))}
            
            {report.suggestions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/60">No additional suggestions at this time.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rules" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {rules.map(rule => (
                <div key={rule.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-semibold text-white">{rule.name}</h5>
                      <p className="text-xs text-white/60">{rule.standard} • {rule.category}</p>
                    </div>
                    <Badge className={`${
                      rule.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/80 mb-2">{rule.description}</p>
                  {rule.reference && (
                    <p className="text-xs text-white/40">Ref: {rule.reference}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        designRulesEngine.setRuleEnabled(rule.id, !rule.enabled);
                        loadRules();
                        validateDesign();
                      }}
                      className="text-xs"
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}