import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CloudLightning, Server, Plus, Trash, Edit, RefreshCw, Search, 
  Cloud, Filter, Download, Settings, Play, RotateCw, Loader2, 
  CheckCircle2, AlertCircle, Clock
} from "lucide-react";

interface CloudProvider {
  id: string;
  name: string;
  type: 'aws' | 'azure' | 'gcp' | 'digital_ocean' | 'custom';
  credentials: {
    key?: string;
    secret?: string;
    token?: string;
    region?: string;
    project?: string;
    [key: string]: string | undefined;
  };
  syncEnabled: boolean;
  lastSync?: string;
  status: 'active' | 'error' | 'inactive';
  errorMessage?: string;
}

interface CloudHost {
  id: string;
  name: string;
  provider: string;
  providerType: string;
  ip: string;
  status: 'running' | 'stopped' | 'unknown';
  region: string;
  type: string;
  tags: Record<string, string>;
  lastUpdated: string;
  inInventory: boolean;
}

const CloudInventory = () => {
  const [providers, setProviders] = useState<CloudProvider[]>([]);
  const [hosts, setHosts] = useState<CloudHost[]>([]);
  const [filteredHosts, setFilteredHosts] = useState<CloudHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [editMode, setEditMode] = useState(false);
  const [selectedHosts, setSelectedHosts] = useState<string[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  const [newProvider, setNewProvider] = useState<Partial<CloudProvider>>({
    name: "",
    type: "aws",
    credentials: {},
    syncEnabled: true,
    status: 'inactive'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock Cloud Providers
        const mockProviders: CloudProvider[] = [
          {
            id: "1",
            name: "AWS Production",
            type: "aws",
            credentials: {
              key: "AKIAXXXXXXXXXXXXXXXX",
              secret: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
              region: "us-east-1"
            },
            syncEnabled: true,
            lastSync: "2023-10-15T08:30:00Z",
            status: 'active'
          },
          {
            id: "2",
            name: "Azure Development",
            type: "azure",
            credentials: {
              clientId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
              clientSecret: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
              tenantId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
              subscriptionId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            },
            syncEnabled: true,
            lastSync: "2023-10-14T14:15:00Z",
            status: 'active'
          },
          {
            id: "3",
            name: "GCP Staging",
            type: "gcp",
            credentials: {
              project: "my-gcp-project",
              keyFile: "/etc/ansible/credentials/gcp-key.json"
            },
            syncEnabled: false,
            lastSync: "2023-10-10T11:45:00Z",
            status: 'inactive'
          },
          {
            id: "4",
            name: "Digital Ocean",
            type: "digital_ocean",
            credentials: {
              token: "dop_v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            },
            syncEnabled: true,
            lastSync: "2023-10-15T09:20:00Z",
            status: 'error',
            errorMessage: "API rate limit exceeded"
          }
        ];
        
        // Mock Cloud Hosts
        const mockHosts: CloudHost[] = [
          {
            id: "1",
            name: "web-server-01",
            provider: "AWS Production",
            providerType: "aws",
            ip: "172.31.16.21",
            status: 'running',
            region: "us-east-1",
            type: "t3.medium",
            tags: { "Environment": "Production", "Role": "Web" },
            lastUpdated: "2023-10-15T08:30:00Z",
            inInventory: true
          },
          {
            id: "2",
            name: "db-server-01",
            provider: "AWS Production",
            providerType: "aws",
            ip: "172.31.32.10",
            status: 'running',
            region: "us-east-1",
            type: "r5.large",
            tags: { "Environment": "Production", "Role": "Database" },
            lastUpdated: "2023-10-15T08:30:00Z",
            inInventory: true
          },
          {
            id: "3",
            name: "dev-app-vm",
            provider: "Azure Development",
            providerType: "azure",
            ip: "10.1.0.4",
            status: 'running',
            region: "eastus",
            type: "Standard_D2s_v3",
            tags: { "Environment": "Development", "Role": "Application" },
            lastUpdated: "2023-10-14T14:15:00Z",
            inInventory: false
          },
          {
            id: "4",
            name: "dev-db-vm",
            provider: "Azure Development",
            providerType: "azure",
            ip: "10.1.0.5",
            status: 'stopped',
            region: "eastus",
            type: "Standard_D4s_v3",
            tags: { "Environment": "Development", "Role": "Database" },
            lastUpdated: "2023-10-14T14:15:00Z",
            inInventory: false
          },
          {
            id: "5",
            name: "staging-app-1",
            provider: "GCP Staging",
            providerType: "gcp",
            ip: "10.128.0.2",
            status: 'running',
            region: "us-central1",
            type: "e2-standard-2",
            tags: { "Environment": "Staging", "Role": "Application" },
            lastUpdated: "2023-10-10T11:45:00Z",
            inInventory: true
          },
          {
            id: "6",
            name: "droplet-web-1",
            provider: "Digital Ocean",
            providerType: "digital_ocean",
            ip: "64.225.123.456",
            status: 'running',
            region: "nyc1",
            type: "s-2vcpu-4gb",
            tags: { "Environment": "Production", "Role": "Web" },
            lastUpdated: "2023-10-13T16:30:00Z",
            inInventory: true
          }
        ];
        
        setProviders(mockProviders);
        setHosts(mockHosts);
        setFilteredHosts(mockHosts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cloud inventory data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load cloud inventory data"
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...hosts];
    
    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(host => 
        host.name.toLowerCase().includes(lowerQuery) || 
        host.ip.includes(lowerQuery) ||
        Object.values(host.tags).some(value => 
          value.toLowerCase().includes(lowerQuery)
        )
      );
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(host => host.status === statusFilter);
    }
    
    // Filter by provider
    if (providerFilter !== "all") {
      filtered = filtered.filter(host => host.provider === providerFilter);
    }
    
    setFilteredHosts(filtered);
  }, [searchQuery, statusFilter, providerFilter, hosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search already handled by the useEffect above
  };

  const handleRefreshHosts = async () => {
    try {
      setRefreshing(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update lastUpdated timestamps
      const now = new Date().toISOString();
      const updatedHosts = hosts.map(host => ({
        ...host,
        lastUpdated: now
      }));
      
      setHosts(updatedHosts);
      
      toast({
        title: "Success",
        description: "Cloud hosts refreshed successfully"
      });
    } catch (error) {
      console.error("Error refreshing hosts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh cloud hosts"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleSyncProvider = async (providerId: string) => {
    try {
      setSyncingProvider(providerId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update provider lastSync
      const now = new Date().toISOString();
      const updatedProviders = providers.map(provider => {
        if (provider.id === providerId) {
          return {
            ...provider,
            lastSync: now,
            status: 'active' as const
          };
        }
        return provider;
      });
      
      // Update hosts from this provider
      const providerName = providers.find(p => p.id === providerId)?.name;
      const updatedHosts = hosts.map(host => {
        if (host.provider === providerName) {
          return {
            ...host,
            lastUpdated: now
          };
        }
        return host;
      });
      
      setProviders(updatedProviders);
      setHosts(updatedHosts);
      
      toast({
        title: "Success",
        description: "Provider synchronized successfully"
      });
    } catch (error) {
      console.error("Error syncing provider:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to synchronize provider"
      });
    } finally {
      setSyncingProvider(null);
    }
  };

  const resetProviderForm = () => {
    setNewProvider({
      name: "",
      type: "aws",
      credentials: {},
      syncEnabled: true,
      status: 'inactive'
    });
    setSelectedProvider(null);
    setEditMode(false);
  };

  const openEditProviderDialog = (provider: CloudProvider) => {
    setSelectedProvider(provider);
    setNewProvider({
      name: provider.name,
      type: provider.type,
      credentials: { ...provider.credentials },
      syncEnabled: provider.syncEnabled,
      status: provider.status
    });
    setEditMode(true);
    setProviderDialogOpen(true);
  };

  const handleSaveProvider = async () => {
    if (!newProvider.name || !newProvider.type) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editMode && selectedProvider) {
        // Update existing provider
        const updatedProviders = providers.map(provider => {
          if (provider.id === selectedProvider.id) {
            return {
              ...provider,
              name: newProvider.name || provider.name,
              type: newProvider.type as any,
              credentials: newProvider.credentials || provider.credentials,
              syncEnabled: newProvider.syncEnabled !== undefined ? newProvider.syncEnabled : provider.syncEnabled,
              status: 'active' as const
            };
          }
          return provider;
        });
        
        setProviders(updatedProviders);
        toast({
          title: "Success",
          description: "Cloud provider updated successfully"
        });
      } else {
        // Create new provider
        const newProviderData: CloudProvider = {
          id: Math.random().toString(36).substring(7),
          name: newProvider.name || "",
          type: newProvider.type as any,
          credentials: newProvider.credentials || {},
          syncEnabled: newProvider.syncEnabled !== undefined ? newProvider.syncEnabled : true,
          status: 'active' as const
        };
        
        setProviders([...providers, newProviderData]);
        toast({
          title: "Success",
          description: "Cloud provider added successfully"
        });
      }
      
      setProviderDialogOpen(false);
      resetProviderForm();
    } catch (error) {
      console.error("Error saving provider:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editMode ? 'update' : 'add'} cloud provider`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Delete provider
      const providerToDelete = providers.find(p => p.id === providerId);
      const updatedProviders = providers.filter(provider => provider.id !== providerId);
      setProviders(updatedProviders);
      
      // Remove hosts from this provider
      if (providerToDelete) {
        const updatedHosts = hosts.filter(host => host.provider !== providerToDelete.name);
        setHosts(updatedHosts);
      }
      
      toast({
        title: "Success",
        description: "Cloud provider deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting provider:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete cloud provider"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleHostSelection = (hostId: string) => {
    if (selectedHosts.includes(hostId)) {
      setSelectedHosts(selectedHosts.filter(id => id !== hostId));
    } else {
      setSelectedHosts([...selectedHosts, hostId]);
    }
  };

  const selectAllHosts = () => {
    if (selectedHosts.length === filteredHosts.length) {
      setSelectedHosts([]);
    } else {
      setSelectedHosts(filteredHosts.map(host => host.id));
    }
  };

  const handleImportHosts = async () => {
    if (selectedHosts.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select hosts to import"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mark selected hosts as in inventory
      const updatedHosts = hosts.map(host => {
        if (selectedHosts.includes(host.id)) {
          return {
            ...host,
            inInventory: true
          };
        }
        return host;
      });
      
      setHosts(updatedHosts);
      setSelectedHosts([]);
      setImportDialogOpen(false);
      
      toast({
        title: "Success",
        description: `${selectedHosts.length} hosts imported to inventory`
      });
    } catch (error) {
      console.error("Error importing hosts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to import hosts to inventory"
      });
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'aws': return <i className="fab fa-aws text-[#FF9900]"></i>;
      case 'azure': return <i className="fab fa-microsoft text-[#0078D4]"></i>;
      case 'gcp': return <i className="fab fa-google text-[#4285F4]"></i>;
      case 'digital_ocean': return <i className="fab fa-digital-ocean text-[#0080FF]"></i>;
      default: return <Cloud className="h-4 w-4" />;
    }
  };

  const getProviderName = (type: string) => {
    switch (type) {
      case 'aws': return "Amazon Web Services";
      case 'azure': return "Microsoft Azure";
      case 'gcp': return "Google Cloud Platform";
      case 'digital_ocean': return "Digital Ocean";
      default: return "Custom Provider";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Running
          </Badge>
        );
      case 'stopped':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Stopped
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <Clock className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  const getProviderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <Clock className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Cloud Inventory</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshHosts}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          
          <Dialog open={providerDialogOpen} onOpenChange={(open) => {
            setProviderDialogOpen(open);
            if (!open) resetProviderForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Cloud Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editMode ? "Edit Cloud Provider" : "Add Cloud Provider"}
                </DialogTitle>
                <DialogDescription>
                  {editMode 
                    ? "Update the cloud provider configuration."
                    : "Connect to a cloud provider to import hosts."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-name">Provider Name</Label>
                  <Input 
                    id="provider-name"
                    value={newProvider.name || ""}
                    onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                    placeholder="e.g., AWS Production"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="provider-type">Provider Type</Label>
                  <Select 
                    value={newProvider.type} 
                    onValueChange={(value) => setNewProvider({...newProvider, type: value as any})}
                  >
                    <SelectTrigger id="provider-type">
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws">Amazon Web Services</SelectItem>
                      <SelectItem value="azure">Microsoft Azure</SelectItem>
                      <SelectItem value="gcp">Google Cloud Platform</SelectItem>
                      <SelectItem value="digital_ocean">Digital Ocean</SelectItem>
                      <SelectItem value="custom">Custom Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4 border rounded-md p-4">
                  <h3 className="text-sm font-medium">Provider Credentials</h3>
                  
                  {newProvider.type === 'aws' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="aws-key">Access Key</Label>
                        <Input 
                          id="aws-key"
                          value={newProvider.credentials?.key || ""}
                          onChange={(e) => setNewProvider({
                            ...newProvider, 
                            credentials: {...newProvider.credentials, key: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aws-secret">Secret Key</Label>
                        <Input 
                          id="aws-secret"
                          type="password"
                          value={newProvider.credentials?.secret || ""}
                          onChange={(e) => setNewProvider({
                            ...newProvider, 
                            credentials: {...newProvider.credentials, secret: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aws-region">Region</Label>
                        <Input 
                          id="aws-region"
                          value={newProvider.credentials?.region || ""}
                          onChange={(e) => setNewProvider({
                            ...newProvider, 
                            credentials: {...newProvider.credentials, region: e.target.value}
                          })}
                          placeholder="us-east-1"
                        />
                      </div>
                    </>
                  )}
                  
                  {newProvider.type === 'azure' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="azure-client-id">Client ID</Label>
                        <Input 
                          id="azure-client-id"
                          value={newProvider.credentials?.clientId || ""}
                          onChange={(e) => setNewProvider({
                            ...newProvider, 
                            credentials: {...newProvider.credentials, clientId: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="azure-client-secret">Client Secret</Label>
                        <Input 
                          id="azure-client-secret"
                          type="password"
                          value={newProvider.credentials?.clientSecret || ""}
                          onChange={(e) => setNewProvider({
                            ...newProvider, 
                            credentials: {...newProvider.credentials, clientSecret: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="azure-tenant-id">Tenant ID</Label>
                        <Input 
                          id="azure-tenant-id"
                          value={newProvider.credentials?.tenantId || ""}
                          onChange={(e) => setNewProvider({
                            ...newProvider, 
                            credentials: {...newProvider.credentials, tenantId: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="azure-subscription-id">Subscription ID</Label>
                        <Input 
                          id="azure-subscription-id"
                          value={newProvider.credentials?.subscriptionId || ""}
                          onChange={(e) => setNewProvider({
                            ...newProvider, 
                            credentials: {...newProvider.credentials, subscriptionId: e.target.value}
                          })}
                        />
                      </div>
                    </>
                  )}
                  
                  {newProvider.type === 'gcp' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="gcp-project">Project ID</Label>
                        <Input 
                          id="gcp-project"
                          value={newProvider.credentials?.project || ""}
                          onChange={(e) => setNewProvider({
                            ...newProvider, 
                            credentials: {...newProvider.credentials, project: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gcp-key-file">Key File Path</Label>
                        <Input 
                          id="gcp-key-file"
                          value={newProvider.credentials?.keyFile || ""}
                          onChange={(e) => setNewProvider({
                            ...newProvider, 
                            credentials: {...newProvider.credentials, keyFile: e.target.value}
                          })}
                          placeholder="/path/to/key.json"
                        />
                      </div>
                    </>
                  )}
                  
                  {newProvider.type === 'digital_ocean' && (
                    <div className="space-y-2">
                      <Label htmlFor="do-token">API Token</Label>
                      <Input 
                        id="do-token"
                        type="password"
                        value={newProvider.credentials?.token || ""}
                        onChange={(e) => setNewProvider({
                          ...newProvider, 
                          credentials: {...newProvider.credentials, token: e.target.value}
                        })}
                      />
                    </div>
                  )}
                  
                  {newProvider.type === 'custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-url">API URL</Label>
                      <Input 
                        id="custom-url"
                        value={newProvider.credentials?.url || ""}
                        onChange={(e) => setNewProvider({
                          ...newProvider, 
                          credentials: {...newProvider.credentials, url: e.target.value}
                        })}
                        placeholder="https://example.com/api"
                      />
                      <Label htmlFor="custom-token" className="mt-4">API Token</Label>
                      <Input 
                        id="custom-token"
                        type="password"
                        value={newProvider.credentials?.token || ""}
                        onChange={(e) => setNewProvider({
                          ...newProvider, 
                          credentials: {...newProvider.credentials, token: e.target.value}
                        })}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sync-enabled"
                    checked={newProvider.syncEnabled}
                    onCheckedChange={(checked) => setNewProvider({...newProvider, syncEnabled: checked})}
                  />
                  <Label htmlFor="sync-enabled">Enable Automatic Sync</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setProviderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProvider} disabled={loading}>
                  {editMode ? "Update Provider" : "Add Provider"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="hosts" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="hosts">
            <Server className="h-4 w-4 mr-2" />
            Cloud Hosts
          </TabsTrigger>
          <TabsTrigger value="providers">
            <CloudLightning className="h-4 w-4 mr-2" />
            Cloud Providers
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="hosts">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Cloud Hosts</CardTitle>
                  <CardDescription>
                    Hosts discovered from cloud providers
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        disabled={selectedHosts.length === 0}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Import to Inventory
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import Hosts to Inventory</DialogTitle>
                        <DialogDescription>
                          {selectedHosts.length} host(s) will be imported to your Ansible inventory.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <ScrollArea className="h-[200px] rounded-md border p-4">
                          <div className="space-y-2">
                            {selectedHosts.map(hostId => {
                              const host = hosts.find(h => h.id === hostId);
                              return host ? (
                                <div key={hostId} className="flex items-center space-x-2">
                                  <Server className="h-4 w-4" />
                                  <span>{host.name}</span>
                                  <span className="text-muted-foreground">({host.ip})</span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleImportHosts}>
                          Import Hosts
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search hosts..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
                
                <div className="flex space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="stopped">Stopped</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={providerFilter} onValueChange={setProviderFilter}>
                    <SelectTrigger className="w-[160px]">
                      <Cloud className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      {providers.map(provider => (
                        <SelectItem key={provider.id} value={provider.name}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={
                            filteredHosts.length > 0 && 
                            selectedHosts.length === filteredHosts.length
                          }
                          onCheckedChange={selectAllHosts}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Inventory</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHosts.map((host) => (
                      <TableRow key={host.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedHosts.includes(host.id)}
                            onCheckedChange={() => toggleHostSelection(host.id)}
                            aria-label={`Select ${host.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{host.name}</TableCell>
                        <TableCell>{host.ip}</TableCell>
                        <TableCell>{host.provider}</TableCell>
                        <TableCell>{getStatusBadge(host.status)}</TableCell>
                        <TableCell>{host.region}</TableCell>
                        <TableCell>{host.type}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(host.tags).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {host.inInventory ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Added
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                              Not Added
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredHosts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                          No hosts found matching the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredHosts.length} of {hosts.length} hosts
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated: {refreshing ? 'Updating...' : formatTimestamp(hosts[0]?.lastUpdated)}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="providers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <CloudLightning className="h-5 w-5 mr-2" />
                      <div>
                        <CardTitle>{provider.name}</CardTitle>
                        <CardDescription>{getProviderName(provider.type)}</CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditProviderDialog(provider)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteProvider(provider.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div>Status:</div>
                        {getProviderStatusBadge(provider.status)}
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Last Sync: {formatTimestamp(provider.lastSync)}
                        </div>
                      </div>
                    </div>
                    
                    {provider.status === 'error' && provider.errorMessage && (
                      <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                        Error: {provider.errorMessage}
                      </div>
                    )}
                    
                    <div className="rounded-md border p-3">
                      <h3 className="text-sm font-medium mb-2">Credentials</h3>
                      <div className="space-y-1 text-sm">
                        {provider.type === 'aws' && (
                          <>
                            <div className="flex justify-between">
                              <span>Access Key:</span>
                              <span className="font-mono">
                                {provider.credentials.key?.substring(0, 4)}...
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Secret Key:</span>
                              <span className="font-mono">••••••••</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Region:</span>
                              <span>{provider.credentials.region}</span>
                            </div>
                          </>
                        )}
                        
                        {provider.type === 'azure' && (
                          <>
                            <div className="flex justify-between">
                              <span>Client ID:</span>
                              <span className="font-mono">
                                {provider.credentials.clientId?.substring(0, 8)}...
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tenant ID:</span>
                              <span className="font-mono">
                                {provider.credentials.tenantId?.substring(0, 8)}...
                              </span>
                            </div>
                          </>
                        )}
                        
                        {provider.type === 'gcp' && (
                          <>
                            <div className="flex justify-between">
                              <span>Project:</span>
                              <span>{provider.credentials.project}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Key File:</span>
                              <span className="font-mono truncate max-w-[200px]">
                                {provider.credentials.keyFile}
                              </span>
                            </div>
                          </>
                        )}
                        
                        {provider.type === 'digital_ocean' && (
                          <div className="flex justify-between">
                            <span>API Token:</span>
                            <span className="font-mono">••••••••</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`sync-${provider.id}`}
                          checked={provider.syncEnabled}
                          onCheckedChange={(checked) => {
                            const updatedProviders = providers.map(p => {
                              if (p.id === provider.id) {
                                return { ...p, syncEnabled: checked };
                              }
                              return p;
                            });
                            setProviders(updatedProviders);
                          }}
                        />
                        <Label htmlFor={`sync-${provider.id}`}>Automatic Sync</Label>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSyncProvider(provider.id)}
                        disabled={syncingProvider === provider.id}
                      >
                        {syncingProvider === provider.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RotateCw className="h-4 w-4 mr-2" />
                            Sync Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full">
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // In a real app, this would open a dialog with provider settings
                        toast({
                          title: "Info",
                          description: "Advanced provider settings would open here"
                        });
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Settings
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
            
            <Card className="flex flex-col justify-center items-center p-8">
              <div className="text-center space-y-4">
                <div className="bg-muted rounded-full p-4 inline-block">
                  <CloudLightning className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium">Add Cloud Provider</h3>
                <p className="text-muted-foreground max-w-md">
                  Connect to a cloud provider to automatically discover and import hosts into your Ansible inventory.
                </p>
                <Dialog open={providerDialogOpen} onOpenChange={(open) => {
                  setProviderDialogOpen(open);
                  if (!open) resetProviderForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Cloud Provider
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CloudInventory;
