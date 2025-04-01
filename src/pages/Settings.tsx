
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { saveConfiguration } from "@/lib/api";
import { motion } from "framer-motion";
import { RotateCw, FolderOpen } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  
  const [generalSettings, setGeneralSettings] = useState({
    appName: "Ansible UI",
    defaultInventory: "production",
    playbooksDir: "/etc/ansible/playbooks",
  });

  const [connectionSettings, setConnectionSettings] = useState({
    ansiblePath: "/usr/bin/ansible",
    ansiblePlaybookPath: "/usr/bin/ansible-playbook",
    privateKey: "~/.ssh/id_rsa",
    connectionTimeout: "30",
  });

  const [customSettings, setCustomSettings] = useState({
    customPlaybooksDir: "",
    customInventoriesDir: "",
    customRolesDir: "",
    serverConnectionInfo: "",
  });

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedGeneralSettings = localStorage.getItem('generalSettings');
    const savedConnectionSettings = localStorage.getItem('connectionSettings');
    const savedCustomSettings = localStorage.getItem('customSettings');
    
    if (savedGeneralSettings) setGeneralSettings(JSON.parse(savedGeneralSettings));
    if (savedConnectionSettings) setConnectionSettings(JSON.parse(savedConnectionSettings));
    if (savedCustomSettings) setCustomSettings(JSON.parse(savedCustomSettings));
  }, []);

  const handleSaveGeneralSettings = async () => {
    setIsLoading(true);
    try {
      await saveConfiguration({
        type: "general",
        settings: generalSettings
      });
      localStorage.setItem('generalSettings', JSON.stringify(generalSettings));
      toast({
        title: "Settings saved",
        description: "Your general settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive"
      });
      console.error("Error saving general settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConnectionSettings = async () => {
    setIsLoading(true);
    try {
      await saveConfiguration({
        type: "connection",
        settings: connectionSettings
      });
      localStorage.setItem('connectionSettings', JSON.stringify(connectionSettings));
      toast({
        title: "Connection settings saved",
        description: "Your Ansible connection settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was an error saving your connection settings. Please try again.",
        variant: "destructive"
      });
      console.error("Error saving connection settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomSettings = async () => {
    setIsLoading(true);
    try {
      await saveConfiguration({
        type: "custom",
        settings: customSettings
      });
      localStorage.setItem('customSettings', JSON.stringify(customSettings));
      
      // Update environment variables for the backend via API
      try {
        const response = await fetch('/api/update-paths', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ANSIBLE_PLAYBOOKS_DIR: customSettings.customPlaybooksDir || undefined,
            ANSIBLE_INVENTORIES_DIR: customSettings.customInventoriesDir || undefined,
            ANSIBLE_ROLES_DIR: customSettings.customRolesDir || undefined
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            toast({
              title: "Path settings updated",
              description: "The application will use your custom paths. You may need to refresh to see changes.",
            });
          }
        }
      } catch (pathError) {
        console.error("Error updating paths:", pathError);
      }
      
      toast({
        title: "Custom path settings saved",
        description: "Your custom path settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was an error saving your custom path settings. Please try again.",
        variant: "destructive"
      });
      console.error("Error saving custom settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scanForAnsibleResources = async () => {
    if (!customSettings.customPlaybooksDir) {
      toast({
        title: "Path required",
        description: "Please enter a path to scan for Ansible resources.",
        variant: "destructive"
      });
      return;
    }
    
    setIsScanning(true);
    setScanResult(null);
    
    try {
      const response = await fetch('/api/search-ansible-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customPath: customSettings.customPlaybooksDir
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const result = await response.json();
      setScanResult(result);
      
      if (result.exists) {
        if (result.hasAnsibleResources) {
          // If resources are found, populate the other fields
          const updatedSettings = { ...customSettings };
          
          if (result.resources.playbooks) {
            updatedSettings.customPlaybooksDir = customSettings.customPlaybooksDir;
          }
          
          if (result.resources.inventories) {
            updatedSettings.customInventoriesDir = customSettings.customPlaybooksDir + '/inventories';
          }
          
          if (result.resources.roles) {
            updatedSettings.customRolesDir = customSettings.customPlaybooksDir + '/roles';
          }
          
          setCustomSettings(updatedSettings);
          
          toast({
            title: "Ansible resources found",
            description: "Found Ansible resources in the specified directory.",
          });
        } else {
          toast({
            title: "No Ansible resources found",
            description: "The directory exists but no Ansible resources were detected.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Directory not found",
          description: "The specified directory does not exist.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error scanning for Ansible resources:", error);
      toast({
        title: "Error scanning",
        description: "There was an error scanning for Ansible resources.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-4xl mx-auto w-full"
    >
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

      <Tabs defaultValue="custom-paths" className="animate-fade-in">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="custom-paths">Custom Paths</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input 
                  id="app-name" 
                  value={generalSettings.appName}
                  onChange={(e) => setGeneralSettings({...generalSettings, appName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-inventory">Default Inventory</Label>
                <Input 
                  id="default-inventory" 
                  value={generalSettings.defaultInventory}
                  onChange={(e) => setGeneralSettings({...generalSettings, defaultInventory: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="playbooks-dir">Playbooks Directory</Label>
                <Input 
                  id="playbooks-dir" 
                  value={generalSettings.playbooksDir}
                  onChange={(e) => setGeneralSettings({...generalSettings, playbooksDir: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveGeneralSettings} 
                disabled={isLoading}
                className="relative"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="connection">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>Ansible Connection Settings</CardTitle>
              <CardDescription>
                Configure how the UI connects to Ansible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ansible-path">Ansible Path</Label>
                <Input 
                  id="ansible-path" 
                  value={connectionSettings.ansiblePath}
                  onChange={(e) => setConnectionSettings({...connectionSettings, ansiblePath: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ansible-playbook-path">Ansible Playbook Path</Label>
                <Input 
                  id="ansible-playbook-path" 
                  value={connectionSettings.ansiblePlaybookPath}
                  onChange={(e) => setConnectionSettings({...connectionSettings, ansiblePlaybookPath: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="private-key">SSH Private Key</Label>
                <Input 
                  id="private-key" 
                  value={connectionSettings.privateKey}
                  onChange={(e) => setConnectionSettings({...connectionSettings, privateKey: e.target.value})}
                  type="password" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connection-timeout">Connection Timeout (seconds)</Label>
                <Input 
                  id="connection-timeout" 
                  value={connectionSettings.connectionTimeout}
                  onChange={(e) => setConnectionSettings({...connectionSettings, connectionTimeout: e.target.value})}
                  type="number" 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveConnectionSettings}
                disabled={isLoading}
                className="relative"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Connection Settings"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="custom-paths">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>Custom Path Settings</CardTitle>
              <CardDescription>
                Configure custom paths for development or override server paths
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-2 mb-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="scan-path">Scan for Ansible Project</Label>
                  <Input 
                    id="scan-path" 
                    value={customSettings.customPlaybooksDir}
                    onChange={(e) => setCustomSettings({...customSettings, customPlaybooksDir: e.target.value})}
                    placeholder="/path/to/ansible/project"
                  />
                </div>
                <Button 
                  onClick={scanForAnsibleResources} 
                  disabled={isScanning}
                  className="mb-0.5"
                >
                  {isScanning ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Scan
                    </>
                  )}
                </Button>
              </div>
              
              {scanResult && scanResult.exists && scanResult.hasAnsibleResources && (
                <Alert className="bg-green-50 mb-4 border-green-200">
                  <AlertDescription className="text-green-700">
                    Ansible resources detected! Playbooks: {scanResult.resources.playbooks ? "✓" : "✗"}, 
                    Inventories: {scanResult.resources.inventories ? "✓" : "✗"}, 
                    Roles: {scanResult.resources.roles ? "✓" : "✗"}
                  </AlertDescription>
                </Alert>
              )}
              
              {scanResult && scanResult.exists && !scanResult.hasAnsibleResources && (
                <Alert className="bg-yellow-50 mb-4 border-yellow-200">
                  <AlertDescription className="text-yellow-700">
                    The directory exists but no Ansible resources were detected.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="custom-playbooks-dir">Custom Playbooks Directory</Label>
                <Input 
                  id="custom-playbooks-dir" 
                  value={customSettings.customPlaybooksDir}
                  onChange={(e) => setCustomSettings({...customSettings, customPlaybooksDir: e.target.value})}
                  placeholder="/path/to/custom/playbooks"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If set, this will override the default playbooks directory on the server
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-inventories-dir">Custom Inventories Directory</Label>
                <Input 
                  id="custom-inventories-dir" 
                  value={customSettings.customInventoriesDir}
                  onChange={(e) => setCustomSettings({...customSettings, customInventoriesDir: e.target.value})}
                  placeholder="/path/to/custom/inventories"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If set, this will override the default inventories directory on the server
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-roles-dir">Custom Roles Directory</Label>
                <Input 
                  id="custom-roles-dir" 
                  value={customSettings.customRolesDir}
                  onChange={(e) => setCustomSettings({...customSettings, customRolesDir: e.target.value})}
                  placeholder="/path/to/custom/roles"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If set, this will override the default roles directory on the server
                </p>
              </div>
              <div className="pt-4">
                <Label htmlFor="server-info" className="mb-2 block">Server Connection Info</Label>
                <Textarea 
                  id="server-info" 
                  placeholder="Server connection details for remote Ansible deployment (optional)"
                  className="min-h-[100px]"
                  value={customSettings.serverConnectionInfo}
                  onChange={(e) => setCustomSettings({...customSettings, serverConnectionInfo: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Add server connection details if you're connecting to a remote Kubernetes deployment
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveCustomSettings}
                disabled={isLoading}
                className="relative"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Apply Custom Paths"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
