
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

export default function Settings() {
  const handleSaveGeneralSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your general settings have been updated.",
    });
  };

  const handleSaveConnectionSettings = () => {
    toast({
      title: "Connection settings saved",
      description: "Your Ansible connection settings have been updated.",
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="connection">Connection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input id="app-name" defaultValue="Ansible UI" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-inventory">Default Inventory</Label>
                <Input id="default-inventory" defaultValue="production" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="playbooks-dir">Playbooks Directory</Label>
                <Input id="playbooks-dir" defaultValue="/etc/ansible/playbooks" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneralSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>Ansible Connection Settings</CardTitle>
              <CardDescription>
                Configure how the UI connects to Ansible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ansible-path">Ansible Path</Label>
                <Input id="ansible-path" defaultValue="/usr/bin/ansible" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ansible-playbook-path">Ansible Playbook Path</Label>
                <Input id="ansible-playbook-path" defaultValue="/usr/bin/ansible-playbook" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="private-key">SSH Private Key</Label>
                <Input id="private-key" defaultValue="~/.ssh/id_rsa" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connection-timeout">Connection Timeout (seconds)</Label>
                <Input id="connection-timeout" defaultValue="30" type="number" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveConnectionSettings}>Save Connection Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
