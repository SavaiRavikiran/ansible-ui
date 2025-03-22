
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, Key, File, Eye, EyeOff, Plus, Trash, Edit, Search, 
  Copy, Lock, FileLock, Share2, History, RefreshCw, KeyRound, FileText
} from "lucide-react";

interface Secret {
  id: string;
  name: string;
  description: string;
  type: 'string' | 'file' | 'ssh_key' | 'password';
  value: string;
  encrypted: boolean;
  created: string;
  updated: string;
  accessed?: string;
  tags: string[];
  createdBy: string;
}

interface VaultConfig {
  id: string;
  name: string;
  description: string;
  provider: 'ansible' | 'hashicorp' | 'aws' | 'azure';
  path?: string;
  url?: string;
  options: Record<string, string>;
  active: boolean;
}

const SecretsVault = () => {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [vaults, setVaults] = useState<VaultConfig[]>([]);
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(null);
  const [selectedVault, setSelectedVault] = useState<VaultConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSecrets, setFilteredSecrets] = useState<Secret[]>([]);
  const [secretDialogOpen, setSecretDialogOpen] = useState(false);
  const [vaultDialogOpen, setVaultDialogOpen] = useState(false);
  const [showSecretValue, setShowSecretValue] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("secrets");
  
  const [newSecret, setNewSecret] = useState<Partial<Secret>>({
    name: "",
    description: "",
    type: "string",
    value: "",
    encrypted: true,
    tags: []
  });
  
  const [newVault, setNewVault] = useState<Partial<VaultConfig>>({
    name: "",
    description: "",
    provider: "ansible",
    path: "",
    url: "",
    options: {},
    active: true
  });
  
  const [newTag, setNewTag] = useState("");
  const [secretHistoryOpen, setSecretHistoryOpen] = useState(false);
  
  useEffect(() => {
    // Mock data fetching
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock Secrets
        const mockSecrets: Secret[] = [
          {
            id: "1",
            name: "database_password",
            description: "PostgreSQL database admin password",
            type: "password",
            value: "supersecretpassword",
            encrypted: true,
            created: "2023-09-10T14:30:00Z",
            updated: "2023-09-10T14:30:00Z",
            accessed: "2023-10-15T08:45:00Z",
            tags: ["database", "prod"],
            createdBy: "admin"
          },
          {
            id: "2",
            name: "api_key",
            description: "API key for external service",
            type: "string",
            value: "api_123456789abcdef",
            encrypted: true,
            created: "2023-09-12T10:15:00Z",
            updated: "2023-09-12T10:15:00Z",
            accessed: "2023-10-14T11:20:00Z",
            tags: ["api", "external"],
            createdBy: "admin"
          },
          {
            id: "3",
            name: "ssh_private_key",
            description: "SSH key for deployment server",
            type: "ssh_key",
            value: "-----BEGIN RSA PRIVATE KEY-----\nMIIEogIBAAKCAQEAqLt...\n-----END RSA PRIVATE KEY-----",
            encrypted: true,
            created: "2023-09-15T09:45:00Z",
            updated: "2023-09-15T09:45:00Z",
            tags: ["ssh", "deployment"],
            createdBy: "deployer"
          },
          {
            id: "4",
            name: "ssl_certificate",
            description: "SSL certificate for web servers",
            type: "file",
            value: "-----BEGIN CERTIFICATE-----\nMIIDazCCAlOgAwIBAgI...\n-----END CERTIFICATE-----",
            encrypted: false,
            created: "2023-09-18T15:20:00Z",
            updated: "2023-09-18T15:20:00Z",
            tags: ["ssl", "web"],
            createdBy: "admin"
          }
        ];
        
        // Mock Vaults
        const mockVaults: VaultConfig[] = [
          {
            id: "1",
            name: "Ansible Vault",
            description: "Default Ansible Vault for encrypted variables",
            provider: "ansible",
            path: "/etc/ansible/vault",
            options: {
              "vault_id": "default"
            },
            active: true
          },
          {
            id: "2",
            name: "HashiCorp Vault",
            description: "Enterprise secrets management",
            provider: "hashicorp",
            url: "https://vault.example.com:8200",
            options: {
              "token_path": "/etc/vault/token",
              "kv_mount_point": "kv"
            },
            active: false
          },
          {
            id: "3",
            name: "AWS Secrets Manager",
            description: "AWS-managed secrets service",
            provider: "aws",
            options: {
              "region": "us-east-1",
              "profile": "ansible"
            },
            active: false
          }
        ];
        
        setSecrets(mockSecrets);
        setFilteredSecrets(mockSecrets);
        setVaults(mockVaults);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vault data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load secrets vault data"
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = secrets.filter(secret => 
        secret.name.toLowerCase().includes(lowercaseQuery) || 
        secret.description.toLowerCase().includes(lowercaseQuery) ||
        secret.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredSecrets(filtered);
    } else {
      setFilteredSecrets(secrets);
    }
  }, [searchQuery, secrets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search already handled by the useEffect above
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The secret value has been copied to your clipboard."
    });
  };

  const maskValue = (value: string, type: string) => {
    if (type === 'password') {
      return '••••••••••••••••';
    } else if (type === 'ssh_key' || type === 'file') {
      return value.substring(0, 20) + '...' + value.substring(value.length - 20);
    }
    return value.substring(0, 5) + '••••••••••••' + value.substring(value.length - 5);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getSecretIcon = (type: string) => {
    switch (type) {
      case 'password': return <Lock className="h-4 w-4" />;
      case 'ssh_key': return <KeyRound className="h-4 w-4" />;
      case 'file': return <FileText className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  const getVaultIcon = (provider: string) => {
    switch (provider) {
      case 'hashicorp': return <Shield className="h-4 w-4" />;
      case 'aws': return <Lock className="h-4 w-4" />;
      case 'azure': return <FileLock className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  const resetSecretForm = () => {
    setNewSecret({
      name: "",
      description: "",
      type: "string",
      value: "",
      encrypted: true,
      tags: []
    });
    setNewTag("");
    setSelectedSecret(null);
    setEditMode(false);
    setShowSecretValue(false);
  };

  const resetVaultForm = () => {
    setNewVault({
      name: "",
      description: "",
      provider: "ansible",
      path: "",
      url: "",
      options: {},
      active: true
    });
    setSelectedVault(null);
    setEditMode(false);
  };

  const openEditSecretDialog = (secret: Secret) => {
    setSelectedSecret(secret);
    setNewSecret({
      name: secret.name,
      description: secret.description,
      type: secret.type,
      value: secret.value,
      encrypted: secret.encrypted,
      tags: [...secret.tags]
    });
    setEditMode(true);
    setSecretDialogOpen(true);
  };

  const openEditVaultDialog = (vault: VaultConfig) => {
    setSelectedVault(vault);
    setNewVault({
      name: vault.name,
      description: vault.description,
      provider: vault.provider,
      path: vault.path,
      url: vault.url,
      options: { ...vault.options },
      active: vault.active
    });
    setEditMode(true);
    setVaultDialogOpen(true);
  };

  const handleAddTag = () => {
    if (newTag && !newSecret.tags?.includes(newTag)) {
      setNewSecret({
        ...newSecret,
        tags: [...(newSecret.tags || []), newTag]
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewSecret({
      ...newSecret,
      tags: (newSecret.tags || []).filter(t => t !== tag)
    });
  };

  const handleSaveSecret = async () => {
    if (!newSecret.name || !newSecret.type) {
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
      
      if (editMode && selectedSecret) {
        // Update existing secret
        const updatedSecrets = secrets.map(secret => {
          if (secret.id === selectedSecret.id) {
            return {
              ...secret,
              name: newSecret.name || secret.name,
              description: newSecret.description || secret.description,
              type: newSecret.type as 'string' | 'file' | 'ssh_key' | 'password',
              value: newSecret.value || secret.value,
              encrypted: newSecret.encrypted !== undefined ? newSecret.encrypted : secret.encrypted,
              tags: newSecret.tags || secret.tags,
              updated: new Date().toISOString()
            };
          }
          return secret;
        });
        
        setSecrets(updatedSecrets);
        toast({
          title: "Success",
          description: "Secret updated successfully"
        });
      } else {
        // Create new secret
        const newSecretData: Secret = {
          id: Math.random().toString(36).substring(7),
          name: newSecret.name || "",
          description: newSecret.description || "",
          type: newSecret.type as 'string' | 'file' | 'ssh_key' | 'password',
          value: newSecret.value || "",
          encrypted: newSecret.encrypted !== undefined ? newSecret.encrypted : true,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          tags: newSecret.tags || [],
          createdBy: "current_user" // In a real app, this would be the current user
        };
        
        setSecrets([...secrets, newSecretData]);
        toast({
          title: "Success",
          description: "Secret created successfully"
        });
      }
      
      setSecretDialogOpen(false);
      resetSecretForm();
    } catch (error) {
      console.error("Error saving secret:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editMode ? 'update' : 'create'} secret`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVault = async () => {
    if (!newVault.name || !newVault.provider) {
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
      
      if (editMode && selectedVault) {
        // Update existing vault
        const updatedVaults = vaults.map(vault => {
          if (vault.id === selectedVault.id) {
            return {
              ...vault,
              name: newVault.name || vault.name,
              description: newVault.description || vault.description,
              provider: newVault.provider as 'ansible' | 'hashicorp' | 'aws' | 'azure',
              path: newVault.path,
              url: newVault.url,
              options: newVault.options || vault.options,
              active: newVault.active !== undefined ? newVault.active : vault.active
            };
          }
          return vault;
        });
        
        setVaults(updatedVaults);
        toast({
          title: "Success",
          description: "Vault updated successfully"
        });
      } else {
        // Create new vault
        const newVaultData: VaultConfig = {
          id: Math.random().toString(36).substring(7),
          name: newVault.name || "",
          description: newVault.description || "",
          provider: newVault.provider as 'ansible' | 'hashicorp' | 'aws' | 'azure',
          path: newVault.path,
          url: newVault.url,
          options: newVault.options || {},
          active: newVault.active !== undefined ? newVault.active : true
        };
        
        setVaults([...vaults, newVaultData]);
        toast({
          title: "Success",
          description: "Vault created successfully"
        });
      }
      
      setVaultDialogOpen(false);
      resetVaultForm();
    } catch (error) {
      console.error("Error saving vault:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editMode ? 'update' : 'create'} vault`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSecret = async (secretId: string) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Delete secret
      const updatedSecrets = secrets.filter(secret => secret.id !== secretId);
      setSecrets(updatedSecrets);
      
      toast({
        title: "Success",
        description: "Secret deleted successfully"
      });
      
      if (selectedSecret?.id === secretId) {
        setSelectedSecret(null);
      }
    } catch (error) {
      console.error("Error deleting secret:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete secret"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVault = async (vaultId: string) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Delete vault
      const updatedVaults = vaults.filter(vault => vault.id !== vaultId);
      setVaults(updatedVaults);
      
      toast({
        title: "Success",
        description: "Vault deleted successfully"
      });
      
      if (selectedVault?.id === vaultId) {
        setSelectedVault(null);
      }
    } catch (error) {
      console.error("Error deleting vault:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete vault"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Secrets & Vault Management</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTab(activeTab === "secrets" ? "vaults" : "secrets")}
          >
            {activeTab === "secrets" ? (
              <>
                <Shield className="h-4 w-4 mr-2" />
                View Vaults
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                View Secrets
              </>
            )}
          </Button>
          
          {activeTab === "secrets" ? (
            <Dialog open={secretDialogOpen} onOpenChange={(open) => {
              setSecretDialogOpen(open);
              if (!open) resetSecretForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Secret
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editMode ? "Edit Secret" : "Create New Secret"}
                  </DialogTitle>
                  <DialogDescription>
                    {editMode 
                      ? "Update the secret details below." 
                      : "Enter details for the new secret."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="secret-name">Secret Name</Label>
                    <Input 
                      id="secret-name"
                      value={newSecret.name || ""}
                      onChange={(e) => setNewSecret({...newSecret, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secret-description">Description</Label>
                    <Textarea 
                      id="secret-description"
                      value={newSecret.description || ""}
                      onChange={(e) => setNewSecret({...newSecret, description: e.target.value})}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secret-type">Secret Type</Label>
                    <Select 
                      value={newSecret.type} 
                      onValueChange={(value) => setNewSecret({...newSecret, type: value as any})}
                    >
                      <SelectTrigger id="secret-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">Text String</SelectItem>
                        <SelectItem value="password">Password</SelectItem>
                        <SelectItem value="ssh_key">SSH Key</SelectItem>
                        <SelectItem value="file">File Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="secret-value">Secret Value</Label>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowSecretValue(!showSecretValue)}
                      >
                        {showSecretValue ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {(newSecret.type === 'ssh_key' || newSecret.type === 'file') ? (
                      <Textarea 
                        id="secret-value"
                        value={newSecret.value || ""}
                        onChange={(e) => setNewSecret({...newSecret, value: e.target.value})}
                        rows={6}
                        className="font-mono"
                        type={showSecretValue ? "text" : "password"}
                      />
                    ) : (
                      <Input 
                        id="secret-value"
                        value={newSecret.value || ""}
                        onChange={(e) => setNewSecret({...newSecret, value: e.target.value})}
                        type={showSecretValue ? "text" : "password"}
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="encrypted"
                      checked={newSecret.encrypted}
                      onCheckedChange={(checked) => 
                        setNewSecret({...newSecret, encrypted: checked as boolean})
                      }
                    />
                    <Label htmlFor="encrypted">Encrypt this secret</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        placeholder="Add tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleAddTag}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(newSecret.tags || []).map(tag => (
                        <div 
                          key={tag} 
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm flex items-center"
                        >
                          <span>{tag}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 ml-1 p-0"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSecretDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSecret} disabled={loading}>
                    {editMode ? "Update Secret" : "Create Secret"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={vaultDialogOpen} onOpenChange={(open) => {
              setVaultDialogOpen(open);
              if (!open) resetVaultForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Vault
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editMode ? "Edit Vault" : "Create New Vault"}
                  </DialogTitle>
                  <DialogDescription>
                    {editMode 
                      ? "Update the vault configuration below." 
                      : "Configure a new secrets vault."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="vault-name">Vault Name</Label>
                    <Input 
                      id="vault-name"
                      value={newVault.name || ""}
                      onChange={(e) => setNewVault({...newVault, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vault-description">Description</Label>
                    <Textarea 
                      id="vault-description"
                      value={newVault.description || ""}
                      onChange={(e) => setNewVault({...newVault, description: e.target.value})}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vault-provider">Provider</Label>
                    <Select 
                      value={newVault.provider} 
                      onValueChange={(value) => setNewVault({...newVault, provider: value as any})}
                    >
                      <SelectTrigger id="vault-provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ansible">Ansible Vault</SelectItem>
                        <SelectItem value="hashicorp">HashiCorp Vault</SelectItem>
                        <SelectItem value="aws">AWS Secrets Manager</SelectItem>
                        <SelectItem value="azure">Azure Key Vault</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newVault.provider === 'ansible' && (
                    <div className="space-y-2">
                      <Label htmlFor="vault-path">Vault Path</Label>
                      <Input 
                        id="vault-path"
                        value={newVault.path || ""}
                        onChange={(e) => setNewVault({...newVault, path: e.target.value})}
                        placeholder="/etc/ansible/vault"
                      />
                    </div>
                  )}
                  
                  {(newVault.provider === 'hashicorp' || newVault.provider === 'aws' || newVault.provider === 'azure') && (
                    <div className="space-y-2">
                      <Label htmlFor="vault-url">URL/Endpoint</Label>
                      <Input 
                        id="vault-url"
                        value={newVault.url || ""}
                        onChange={(e) => setNewVault({...newVault, url: e.target.value})}
                        placeholder={
                          newVault.provider === 'hashicorp' 
                            ? "https://vault.example.com:8200" 
                            : newVault.provider === 'aws'
                              ? "https://secretsmanager.us-east-1.amazonaws.com"
                              : "https://mykeyvault.vault.azure.net"
                        }
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Provider Options</Label>
                    {newVault.provider === 'ansible' && (
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          placeholder="vault_id"
                          value={newVault.options?.vault_id || ""}
                          onChange={(e) => setNewVault({
                            ...newVault, 
                            options: {...newVault.options, vault_id: e.target.value}
                          })}
                        />
                        <Input 
                          placeholder="vault_password_file"
                          value={newVault.options?.vault_password_file || ""}
                          onChange={(e) => setNewVault({
                            ...newVault, 
                            options: {...newVault.options, vault_password_file: e.target.value}
                          })}
                        />
                      </div>
                    )}
                    
                    {newVault.provider === 'hashicorp' && (
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          placeholder="token_path"
                          value={newVault.options?.token_path || ""}
                          onChange={(e) => setNewVault({
                            ...newVault, 
                            options: {...newVault.options, token_path: e.target.value}
                          })}
                        />
                        <Input 
                          placeholder="kv_mount_point"
                          value={newVault.options?.kv_mount_point || ""}
                          onChange={(e) => setNewVault({
                            ...newVault, 
                            options: {...newVault.options, kv_mount_point: e.target.value}
                          })}
                        />
                      </div>
                    )}
                    
                    {newVault.provider === 'aws' && (
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          placeholder="region"
                          value={newVault.options?.region || ""}
                          onChange={(e) => setNewVault({
                            ...newVault, 
                            options: {...newVault.options, region: e.target.value}
                          })}
                        />
                        <Input 
                          placeholder="profile"
                          value={newVault.options?.profile || ""}
                          onChange={(e) => setNewVault({
                            ...newVault, 
                            options: {...newVault.options, profile: e.target.value}
                          })}
                        />
                      </div>
                    )}
                    
                    {newVault.provider === 'azure' && (
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          placeholder="tenant_id"
                          value={newVault.options?.tenant_id || ""}
                          onChange={(e) => setNewVault({
                            ...newVault, 
                            options: {...newVault.options, tenant_id: e.target.value}
                          })}
                        />
                        <Input 
                          placeholder="client_id"
                          value={newVault.options?.client_id || ""}
                          onChange={(e) => setNewVault({
                            ...newVault, 
                            options: {...newVault.options, client_id: e.target.value}
                          })}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={newVault.active}
                      onCheckedChange={(checked) => setNewVault({...newVault, active: checked})}
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setVaultDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveVault} disabled={loading}>
                    {editMode ? "Update Vault" : "Create Vault"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="secrets">
            <Key className="h-4 w-4 mr-2" />
            Secrets
          </TabsTrigger>
          <TabsTrigger value="vaults">
            <Shield className="h-4 w-4 mr-2" />
            Vault Configurations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="secrets">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Secrets</CardTitle>
                <CardDescription>
                  Manage secure credentials and sensitive data
                </CardDescription>
                <form onSubmit={handleSearch} className="mt-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search secrets..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1">
                    {filteredSecrets.map((secret) => (
                      <Button 
                        key={secret.id}
                        variant={selectedSecret?.id === secret.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedSecret(secret)}
                      >
                        <div className="flex items-center w-full">
                          {getSecretIcon(secret.type)}
                          <span className="ml-2 truncate">{secret.name}</span>
                          {secret.encrypted && (
                            <Lock className="ml-auto h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </Button>
                    ))}
                    
                    {filteredSecrets.length === 0 && !loading && (
                      <div className="text-center py-4 text-muted-foreground">
                        No secrets found.
                      </div>
                    )}
                    
                    {loading && (
                      <div className="text-center py-4 text-muted-foreground">
                        Loading...
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              {selectedSecret ? (
                <>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          {getSecretIcon(selectedSecret.type)}
                          <span className="ml-2">{selectedSecret.name}</span>
                          {selectedSecret.encrypted && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              <Lock className="h-3 w-3 mr-1" />
                              Encrypted
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>{selectedSecret.description}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog open={secretHistoryOpen} onOpenChange={setSecretHistoryOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <History className="h-4 w-4 mr-2" />
                              History
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Secret History</DialogTitle>
                              <DialogDescription>
                                View the history of changes to this secret
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <div className="space-y-4">
                                <div className="rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>User</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell>
                                          {formatDate(selectedSecret.updated)}
                                        </TableCell>
                                        <TableCell>Updated</TableCell>
                                        <TableCell>admin</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>
                                          {formatDate(selectedSecret.created)}
                                        </TableCell>
                                        <TableCell>Created</TableCell>
                                        <TableCell>{selectedSecret.createdBy}</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Access history is available for 90 days
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={() => setSecretHistoryOpen(false)}>
                                Close
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditSecretDialog(selectedSecret)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteSecret(selectedSecret.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium mb-1">Type</h3>
                          <p className="text-sm">
                            {selectedSecret.type.charAt(0).toUpperCase() + selectedSecret.type.slice(1)}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium mb-1">Created</h3>
                          <p className="text-sm">
                            {formatDate(selectedSecret.created)}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                          <p className="text-sm">
                            {formatDate(selectedSecret.updated)}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium mb-1">Last Accessed</h3>
                          <p className="text-sm">
                            {formatDate(selectedSecret.accessed)}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="text-sm font-medium">Value</h3>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowSecretValue(!showSecretValue)}
                            >
                              {showSecretValue ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(selectedSecret.value)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="rounded-md bg-muted p-3 font-mono text-sm overflow-x-auto">
                          {showSecretValue ? (
                            <pre className="whitespace-pre-wrap">{selectedSecret.value}</pre>
                          ) : (
                            <pre>{maskValue(selectedSecret.value, selectedSecret.type)}</pre>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSecret.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {selectedSecret.tags.length === 0 && (
                            <span className="text-sm text-muted-foreground">No tags</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Usage</h3>
                        <div className="rounded-md border p-4">
                          <p className="text-sm text-muted-foreground mb-2">
                            Use this secret in Ansible playbooks or templates:
                          </p>
                          <div className="bg-muted p-2 rounded-md font-mono text-xs">
                            <pre>{% raw %}{{ lookup('ansible.builtin.vault', '{selectedSecret.name}') }}{% endraw %}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] p-8">
                  <div className="bg-muted rounded-full p-6 mb-4">
                    <Key className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Select a Secret</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Choose a secret from the list to view its details, or create a new one to store sensitive data securely.
                  </p>
                  <Dialog open={secretDialogOpen} onOpenChange={(open) => {
                    setSecretDialogOpen(open);
                    if (!open) resetSecretForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Secret
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="vaults">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vaults.map((vault) => (
              <Card key={vault.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {getVaultIcon(vault.provider)}
                      <CardTitle className="ml-2">{vault.name}</CardTitle>
                      {vault.active ? (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditVaultDialog(vault)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteVault(vault.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{vault.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Provider</h3>
                      <p className="text-sm capitalize">
                        {vault.provider === 'aws' ? 'AWS Secrets Manager' : 
                         vault.provider === 'azure' ? 'Azure Key Vault' :
                         vault.provider === 'hashicorp' ? 'HashiCorp Vault' : 
                         'Ansible Vault'}
                      </p>
                    </div>
                    
                    {vault.path && (
                      <div>
                        <h3 className="text-sm font-medium mb-1">Path</h3>
                        <p className="text-sm font-mono">{vault.path}</p>
                      </div>
                    )}
                    
                    {vault.url && (
                      <div>
                        <h3 className="text-sm font-medium mb-1">URL</h3>
                        <div className="flex items-center">
                          <p className="text-sm font-mono truncate">{vault.url}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-2 h-7 w-7 p-0" 
                            onClick={() => window.open(vault.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {Object.keys(vault.options).length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-1">Options</h3>
                        <div className="rounded-md bg-muted p-3 text-sm">
                          {Object.entries(vault.options).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-medium">{key}:</span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Simulate vault test
                        toast({
                          title: "Success",
                          description: `Connection to ${vault.name} successful`
                        });
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                    
                    <Button 
                      variant={vault.active ? "outline" : "default"} 
                      size="sm"
                      onClick={() => {
                        // Toggle vault active state
                        const updatedVaults = vaults.map(v => {
                          if (v.id === vault.id) {
                            return { ...v, active: !v.active };
                          }
                          return v;
                        });
                        setVaults(updatedVaults);
                      }}
                    >
                      {vault.active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
            
            <Card className="flex flex-col justify-center items-center p-8">
              <div className="text-center space-y-4">
                <div className="bg-muted rounded-full p-4 inline-block">
                  <Shield className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium">Add Vault Integration</h3>
                <p className="text-muted-foreground max-w-md">
                  Connect to external vault providers to manage secrets across your infrastructure.
                </p>
                <Dialog open={vaultDialogOpen} onOpenChange={(open) => {
                  setVaultDialogOpen(open);
                  if (!open) resetVaultForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Configure New Vault
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

export default SecretsVault;
