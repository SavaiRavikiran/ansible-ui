
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const ConfigEditor = () => {
  const [configContent, setConfigContent] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('defaults');
  const [configSections, setConfigSections] = useState<string[]>([
    'defaults', 'inventory', 'privilege_escalation', 'paramiko_connection', 
    'ssh_connection', 'colors', 'diff'
  ]);
  const [sectionParams, setSectionParams] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Mock fetching config data
    const fetchConfigData = async () => {
      try {
        // In production, this would be an API call
        const mockConfig = `
[defaults]
inventory = /etc/ansible/hosts
remote_user = ansible
ask_pass = false
roles_path = /etc/ansible/roles
host_key_checking = false
retry_files_enabled = false
stdout_callback = yaml

[inventory]
enable_plugins = host_list, script, auto, yaml, ini

[privilege_escalation]
become = true
become_method = sudo
become_user = root
become_ask_pass = false

[ssh_connection]
pipelining = true
        `;
        
        setConfigContent(mockConfig);
        
        // Parse sections and parameters
        const sections: Record<string, Record<string, string>> = {};
        let currentSection = '';
        
        mockConfig.split('\n').forEach(line => {
          const trimmed = line.trim();
          
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            currentSection = trimmed.substring(1, trimmed.length - 1);
            sections[currentSection] = {};
          } else if (currentSection && trimmed && !trimmed.startsWith('#')) {
            const parts = trimmed.split('=');
            if (parts.length === 2) {
              const key = parts[0].trim();
              const value = parts[1].trim();
              sections[currentSection][key] = value;
            }
          }
        });
        
        // Load parameters for the selected section
        if (sections[selectedSection]) {
          setSectionParams(sections[selectedSection]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching config:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load Ansible configuration",
        });
        setLoading(false);
      }
    };
    
    fetchConfigData();
  }, []);

  const updateSelectedSection = (section: string) => {
    setSelectedSection(section);
    // In a real app, this would load parameters for the selected section
    // For now, we'll just clear them
    setSectionParams({});
  };

  const saveConfig = async () => {
    try {
      setLoading(true);
      // In production, this would be an API call
      
      // Simulating a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Ansible configuration has been saved",
      });
      setLoading(false);
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save Ansible configuration",
      });
      setLoading(false);
    }
  };

  const addParameter = () => {
    const newParams = { ...sectionParams, 'new_parameter': '' };
    setSectionParams(newParams);
  };

  const updateParameter = (key: string, value: string) => {
    const newParams = { ...sectionParams, [key]: value };
    setSectionParams(newParams);
  };

  const deleteParameter = (key: string) => {
    const newParams = { ...sectionParams };
    delete newParams[key];
    setSectionParams(newParams);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ansible Configuration Editor</h1>
        <Button
          onClick={saveConfig}
          disabled={loading}
        >
          Save Configuration
        </Button>
      </div>
      
      <Tabs defaultValue="gui" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="gui">GUI Editor</TabsTrigger>
          <TabsTrigger value="text">Text Editor</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gui">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Sections</CardTitle>
                <CardDescription>Select a section to edit</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {configSections.map(section => (
                      <Button 
                        key={section}
                        variant={selectedSection === section ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => updateSelectedSection(section)}
                      >
                        {section}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Parameters for [{selectedSection}]</CardTitle>
                <CardDescription>Edit parameters for the selected section</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {Object.entries(sectionParams).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-4">
                        <div className="w-1/3">
                          <Label htmlFor={key}>{key}</Label>
                          <Input 
                            id={key}
                            value={key} 
                            onChange={(e) => {
                              const newParams = { ...sectionParams };
                              delete newParams[key];
                              newParams[e.target.value] = value;
                              setSectionParams(newParams);
                            }}
                          />
                        </div>
                        <div className="w-1/2">
                          <Label htmlFor={`value-${key}`}>Value</Label>
                          <Input 
                            id={`value-${key}`}
                            value={value} 
                            onChange={(e) => updateParameter(key, e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="mt-6"
                            onClick={() => deleteParameter(key)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      onClick={addParameter}
                      className="mt-4"
                    >
                      Add Parameter
                    </Button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>Text Editor</CardTitle>
              <CardDescription>Edit the config file directly</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={configContent} 
                onChange={(e) => setConfigContent(e.target.value)}
                className="font-mono h-[600px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Ansible Configuration Documentation</CardTitle>
              <CardDescription>Learn about Ansible configuration parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3>Common Parameters</h3>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Section</th>
                      <th>Description</th>
                      <th>Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>inventory</td>
                      <td>defaults</td>
                      <td>Path to the inventory file</td>
                      <td>/etc/ansible/hosts</td>
                    </tr>
                    <tr>
                      <td>remote_user</td>
                      <td>defaults</td>
                      <td>User to use for SSH connections</td>
                      <td>Current user</td>
                    </tr>
                    <tr>
                      <td>host_key_checking</td>
                      <td>defaults</td>
                      <td>Enable/disable SSH key checking</td>
                      <td>true</td>
                    </tr>
                    <tr>
                      <td>become</td>
                      <td>privilege_escalation</td>
                      <td>Enable/disable privilege escalation</td>
                      <td>false</td>
                    </tr>
                    <tr>
                      <td>become_method</td>
                      <td>privilege_escalation</td>
                      <td>Method for privilege escalation</td>
                      <td>sudo</td>
                    </tr>
                  </tbody>
                </table>
                
                <h3 className="mt-6">For More Information</h3>
                <p>
                  Check the <a href="https://docs.ansible.com/ansible/latest/reference_appendices/config.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Ansible Configuration Settings
                  </a> documentation for a complete list of parameters.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigEditor;
