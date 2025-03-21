
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
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { saveConfiguration } from "@/lib/api";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
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
  });

  const handleSaveGeneralSettings = async () => {
    setIsLoading(true);
    try {
      await saveConfiguration({
        type: "general",
        settings: generalSettings
      });
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-4xl mx-auto w-full"
    >
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

      <Tabs defaultValue="general" className="animate-fade-in">
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
                  "Save Custom Paths"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
