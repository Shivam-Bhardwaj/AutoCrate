/**
 * Integration Hub Component
 * Central UI for managing all enterprise integrations
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  Factory, 
  FileCode, 
  Plug, 
  Settings, 
  Shield, 
  Activity,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Key,
  Link2,
  Unlink,
  FileText,
  Package,
  Cpu,
  Layers,
  Calendar,
  TrendingUp,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { IntegrationHubService } from '@/services/integrationHub';
import {
  IntegrationConfig,
  IntegrationType,
  IntegrationStatus,
  IntegrationJob,
  IntegrationTemplate,
  CADSystem,
  ERPSystem,
  ManufacturingSystem,
} from '@/types/integration';

export function IntegrationHub() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [jobs, setJobs] = useState<IntegrationJob[]>([]);
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const integrationHub = IntegrationHubService.getInstance();

  useEffect(() => {
    loadIntegrations();
    loadJobs();
    loadTemplates();

    // Set up polling for job status
    const interval = setInterval(() => {
      loadJobs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadIntegrations = () => {
    const allIntegrations = integrationHub.getAllIntegrations();
    setIntegrations(allIntegrations);
  };

  const loadJobs = () => {
    const allJobs = integrationHub.getAllJobs();
    setJobs(allJobs.filter(job => 
      job.status === 'running' || job.status === 'pending' || job.status === 'retrying'
    ));
  };

  const loadTemplates = () => {
    const allTemplates = integrationHub.getAllTemplates();
    setTemplates(allTemplates);
  };

  const getIntegrationIcon = (type: IntegrationType) => {
    switch (type) {
      case 'cad':
        return <FileCode className="h-5 w-5" />;
      case 'erp':
        return <Database className="h-5 w-5" />;
      case 'manufacturing':
        return <Factory className="h-5 w-5" />;
      case 'warehouse':
        return <Package className="h-5 w-5" />;
      case 'quality':
        return <Shield className="h-5 w-5" />;
      default:
        return <Plug className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary"><Unlink className="h-3 w-3 mr-1" />Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'syncing':
        return <Badge variant="default" className="bg-blue-500"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Syncing</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'unauthorized':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Unauthorized</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleConnect = async (integration: IntegrationConfig) => {
    setIsConnecting(true);
    try {
      const connected = await integrationHub.testConnection(integration.id);
      if (connected) {
        integration.status = 'connected';
        integrationHub.updateIntegration(integration.id, { status: 'connected' });
        toast({
          title: 'Connection Successful',
          description: `Connected to ${integration.name}`,
        });
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
      loadIntegrations();
    }
  };

  const handleDisconnect = (integration: IntegrationConfig) => {
    integration.status = 'disconnected';
    integrationHub.updateIntegration(integration.id, { status: 'disconnected' });
    loadIntegrations();
    toast({
      title: 'Disconnected',
      description: `Disconnected from ${integration.name}`,
    });
  };

  const handleToggleIntegration = (integration: IntegrationConfig, enabled: boolean) => {
    integrationHub.updateIntegration(integration.id, { enabled });
    loadIntegrations();
    toast({
      title: enabled ? 'Integration Enabled' : 'Integration Disabled',
      description: `${integration.name} has been ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handleSyncNow = (integration: IntegrationConfig) => {
    const jobId = integrationHub.createJob(integration.type, integration.id, 'sync', {});
    toast({
      title: 'Sync Started',
      description: `Syncing data with ${integration.name}`,
    });
    loadJobs();
  };

  const handleExport = (integration: IntegrationConfig) => {
    const jobId = integrationHub.createJob(integration.type, integration.id, 'export', {});
    toast({
      title: 'Export Started',
      description: `Exporting to ${integration.name}`,
    });
    loadJobs();
  };

  const handleImport = (integration: IntegrationConfig) => {
    const jobId = integrationHub.createJob(integration.type, integration.id, 'import', {});
    toast({
      title: 'Import Started',
      description: `Importing from ${integration.name}`,
    });
    loadJobs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Integration Hub</h2>
          <p className="text-muted-foreground">
            Manage enterprise connections and data synchronization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadIntegrations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plug className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Integration</DialogTitle>
                <DialogDescription>
                  Configure a new connection to an external system
                </DialogDescription>
              </DialogHeader>
              <AddIntegrationForm onSuccess={loadIntegrations} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cad">CAD Systems</TabsTrigger>
          <TabsTrigger value="erp">ERP Systems</TabsTrigger>
          <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Statistics Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Integrations
                </CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{integrations.length}</div>
                <p className="text-xs text-muted-foreground">
                  {integrations.filter(i => i.status === 'connected').length} connected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Jobs
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobs.length}</div>
                <p className="text-xs text-muted-foreground">
                  {jobs.filter(j => j.status === 'running').length} running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Last Sync
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2h ago</div>
                <p className="text-xs text-muted-foreground">
                  Next sync in 4 hours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* All Integrations List */}
          <Card>
            <CardHeader>
              <CardTitle>All Integrations</CardTitle>
              <CardDescription>
                Manage and monitor all configured integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {integrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onToggle={handleToggleIntegration}
                  onSync={handleSyncNow}
                  onExport={handleExport}
                  onImport={handleImport}
                  icon={getIntegrationIcon(integration.type)}
                  statusBadge={getStatusBadge(integration.status)}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CAD Systems Tab */}
        <TabsContent value="cad" className="space-y-4">
          <IntegrationTypeView
            type="cad"
            integrations={integrations.filter(i => i.type === 'cad')}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onToggle={handleToggleIntegration}
            onSync={handleSyncNow}
            onExport={handleExport}
            onImport={handleImport}
          />
        </TabsContent>

        {/* ERP Systems Tab */}
        <TabsContent value="erp" className="space-y-4">
          <IntegrationTypeView
            type="erp"
            integrations={integrations.filter(i => i.type === 'erp')}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onToggle={handleToggleIntegration}
            onSync={handleSyncNow}
            onExport={handleExport}
            onImport={handleImport}
          />
        </TabsContent>

        {/* Manufacturing Tab */}
        <TabsContent value="manufacturing" className="space-y-4">
          <IntegrationTypeView
            type="manufacturing"
            integrations={integrations.filter(i => i.type === 'manufacturing')}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onToggle={handleToggleIntegration}
            onSync={handleSyncNow}
            onExport={handleExport}
            onImport={handleImport}
          />
        </TabsContent>

        {/* Active Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <JobsView jobs={jobs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Integration Card Component
function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onToggle,
  onSync,
  onExport,
  onImport,
  icon,
  statusBadge,
}: {
  integration: IntegrationConfig;
  onConnect: (integration: IntegrationConfig) => void;
  onDisconnect: (integration: IntegrationConfig) => void;
  onToggle: (integration: IntegrationConfig, enabled: boolean) => void;
  onSync: (integration: IntegrationConfig) => void;
  onExport: (integration: IntegrationConfig) => void;
  onImport: (integration: IntegrationConfig) => void;
  icon: React.ReactNode;
  statusBadge: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-muted rounded-lg">{icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{integration.name}</h4>
            {statusBadge}
          </div>
          <p className="text-sm text-muted-foreground">
            Type: {integration.type} | ID: {integration.id}
          </p>
          {integration.lastSync && (
            <p className="text-xs text-muted-foreground">
              Last sync: {new Date(integration.lastSync).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={integration.enabled}
          onCheckedChange={(checked) => onToggle(integration, checked)}
        />
        {integration.status === 'connected' ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSync(integration)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExport(integration)}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onImport(integration)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDisconnect(integration)}
            >
              <Unlink className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="default"
            onClick={() => onConnect(integration)}
          >
            <Link2 className="h-4 w-4 mr-1" />
            Connect
          </Button>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Integration Settings</DialogTitle>
              <DialogDescription>
                Configure {integration.name} settings
              </DialogDescription>
            </DialogHeader>
            <IntegrationSettings integration={integration} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Integration Type View Component
function IntegrationTypeView({
  type,
  integrations,
  onConnect,
  onDisconnect,
  onToggle,
  onSync,
  onExport,
  onImport,
}: {
  type: IntegrationType;
  integrations: IntegrationConfig[];
  onConnect: (integration: IntegrationConfig) => void;
  onDisconnect: (integration: IntegrationConfig) => void;
  onToggle: (integration: IntegrationConfig, enabled: boolean) => void;
  onSync: (integration: IntegrationConfig) => void;
  onExport: (integration: IntegrationConfig) => void;
  onImport: (integration: IntegrationConfig) => void;
}) {
  const getIcon = () => {
    switch (type) {
      case 'cad':
        return <FileCode className="h-5 w-5" />;
      case 'erp':
        return <Database className="h-5 w-5" />;
      case 'manufacturing':
        return <Factory className="h-5 w-5" />;
      default:
        return <Plug className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          {type.toUpperCase()} Systems
        </CardTitle>
        <CardDescription>
          Manage {type} system integrations and connections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {integrations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No {type} integrations configured
          </p>
        ) : (
          integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              onToggle={onToggle}
              onSync={onSync}
              onExport={onExport}
              onImport={onImport}
              icon={getIcon()}
              statusBadge={getStatusBadge(integration.status)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

// Jobs View Component
function JobsView({ jobs }: { jobs: IntegrationJob[] }) {
  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-blue-500">Running</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'retrying':
        return <Badge variant="default" className="bg-yellow-500">Retrying</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Jobs</CardTitle>
        <CardDescription>
          Monitor running integration jobs and tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No active jobs
          </p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.jobId}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{job.operation}</span>
                    {getJobStatusBadge(job.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {job.integrationId} • Started {new Date(job.startTime).toLocaleTimeString()}
                  </p>
                </div>
                {job.progress !== undefined && (
                  <div className="w-32">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center mt-1">{job.progress}%</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add Integration Form Component
function AddIntegrationForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'cad' as IntegrationType,
    system: '',
    apiKey: '',
    endpoint: '',
    username: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add integration logic
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Integration Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Main SolidWorks"
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Integration Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as IntegrationType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cad">CAD System</SelectItem>
              <SelectItem value="erp">ERP System</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.type === 'cad' && (
        <div>
          <Label htmlFor="system">CAD System</Label>
          <Select
            value={formData.system}
            onValueChange={(value) => setFormData({ ...formData, system: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select CAD system" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solidworks">SolidWorks</SelectItem>
              <SelectItem value="autocad">AutoCAD</SelectItem>
              <SelectItem value="nx">Siemens NX</SelectItem>
              <SelectItem value="catia">CATIA</SelectItem>
              <SelectItem value="creo">Creo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.type === 'erp' && (
        <div>
          <Label htmlFor="system">ERP System</Label>
          <Select
            value={formData.system}
            onValueChange={(value) => setFormData({ ...formData, system: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ERP system" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sap">SAP</SelectItem>
              <SelectItem value="oracle">Oracle</SelectItem>
              <SelectItem value="microsoft-dynamics">Microsoft Dynamics</SelectItem>
              <SelectItem value="netsuite">NetSuite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Authentication</h4>
        <div>
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            placeholder="Enter API key"
          />
        </div>
        <div>
          <Label htmlFor="endpoint">API Endpoint</Label>
          <Input
            id="endpoint"
            value={formData.endpoint}
            onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
            placeholder="https://api.example.com"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Add Integration</Button>
      </div>
    </form>
  );
}

// Integration Settings Component
function IntegrationSettings({ integration }: { integration: IntegrationConfig }) {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <Label>Integration ID</Label>
        <Input value={integration.id} readOnly />
      </div>
      <div>
        <Label>API Endpoint</Label>
        <Input
          value={integration.apiEndpoint || ''}
          placeholder="Not configured"
          readOnly
        />
      </div>
      {integration.authentication?.apiKey && (
        <div>
          <Label>API Key</Label>
          <div className="flex gap-2">
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={integration.authentication.apiKey}
              readOnly
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
      <div>
        <Label>Sync Interval</Label>
        <Select value={String(integration.syncInterval || 0)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Manual</SelectItem>
            <SelectItem value="15">Every 15 minutes</SelectItem>
            <SelectItem value="60">Every hour</SelectItem>
            <SelectItem value="360">Every 6 hours</SelectItem>
            <SelectItem value="1440">Daily</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}