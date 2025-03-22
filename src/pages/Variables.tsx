
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash, Plus, Save, FileJson, Edit, Folder } from "lucide-react";

interface Variable {
  id: string;
  key: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'list' | 'dictionary';
}

interface VariableGroup {
  id: string;
  name: string;
  path: string;
  variables: Variable[];
  lastModified: string;
}

const Variables = () => {
  const [activeTab, setActiveTab] = useState("host_vars");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [hostVarGroups, setHostVarGroups] = useState<VariableGroup[]>([]);
  const [groupVarGroups, setGroupVarGroups] = useState<VariableGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [variableDialogOpen, setVariableDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [yamlView, setYamlView] = useState(false);
  const [yamlContent, setYamlContent] = useState("");

  useEffect(() => {
    // Mock data fetching
    const fetchVariableGroups = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock host variables
        const mockHostVars: VariableGroup[] = [
          {
            id: "1",
            name: "web01.example.com",
            path: "/etc/ansible/host_vars/web01.example.com.yml",
            variables: [
              { id: "1", key: "ansible_host", value: "192.168.1.101", type: "string" },
              { id: "2", key: "http_port", value: "80", description: "HTTP port for web server", type: "number" },
              { id: "3", key: "enable_ssl", value: "true", type: "boolean" },
              { id: "4", key: "allowed_origins", value: '["localhost", "example.com"]', type: "list" }
            ],
            lastModified: "2023-10-12T14:30:00Z"
          },
          {
            id: "2",
            name: "db01.example.com",
            path: "/etc/ansible/host_vars/db01.example.com.yml",
            variables: [
              { id: "5", key: "ansible_host", value: "192.168.1.201", type: "string" },
              { id: "6", key: "postgres_version", value: "14", type: "string" },
              { id: "7", key: "backup_enabled", value: "true", type: "boolean" },
              { id: "8", key: "database_config", value: '{"max_connections": 100, "shared_buffers": "4GB"}', type: "dictionary" }
            ],
            lastModified: "2023-10-10T09:15:00Z"
          }
        ];
        
        // Mock group variables
        const mockGroupVars: VariableGroup[] = [
          {
            id: "3",
            name: "web_servers",
            path: "/etc/ansible/group_vars/web_servers.yml",
            variables: [
              { id: "9", key: "nginx_version", value: "1.20", type: "string" },
              { id: "10", key: "deploy_user", value: "www-data", type: "string" },
              { id: "11", key: "firewall_ports", value: '[80, 443, 8080]', type: "list" }
            ],
            lastModified: "2023-10-08T16:45:00Z"
          },
          {
            id: "4",
            name: "db_servers",
            path: "/etc/ansible/group_vars/db_servers.yml",
            variables: [
              { id: "12", key: "backup_schedule", value: "0 2 * * *", description: "Cron schedule for backups", type: "string" },
              { id: "13", key: "max_connections", value: "200", type: "number" },
              { id: "14", key: "replication_enabled", value: "true", type: "boolean" }
            ],
            lastModified: "2023-10-05T11:30:00Z"
          }
        ];
        
        setHostVarGroups(mockHostVars);
        setGroupVarGroups(mockGroupVars);
        
        // Select the first item by default
        if (mockHostVars.length > 0) {
          setSelectedGroup(mockHostVars[0].id);
          
          // Generate YAML view
          const yaml = generateYaml(mockHostVars[0].variables);
          setYamlContent(yaml);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching variables:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load variables"
        });
        setLoading(false);
      }
    };
    
    fetchVariableGroups();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedGroup(null);
    
    // Select the first group in the new tab
    const groups = value === "host_vars" ? hostVarGroups : groupVarGroups;
    if (groups.length > 0) {
      setSelectedGroup(groups[0].id);
      
      // Update YAML view
      const yaml = generateYaml(groups[0].variables);
      setYamlContent(yaml);
    }
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId);
    
    // Get the selected group
    const groups = activeTab === "host_vars" ? hostVarGroups : groupVarGroups;
    const group = groups.find(g => g.id === groupId);
    
    if (group) {
      // Update YAML view
      const yaml = generateYaml(group.variables);
      setYamlContent(yaml);
    }
  };

  const saveVariables = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Variables saved successfully"
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error saving variables:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save variables"
      });
      
      setLoading(false);
    }
  };

  const generateYaml = (variables: Variable[]): string => {
    let yaml = "---\n";
    
    variables.forEach(variable => {
      if (variable.description) {
        yaml += `# ${variable.description}\n`;
      }
      
      let value = variable.value;
      
      // Format based on type
      if (variable.type === 'number') {
        yaml += `${variable.key}: ${value}\n`;
      } else if (variable.type === 'boolean') {
        yaml += `${variable.key}: ${value.toLowerCase()}\n`;
      } else if (variable.type === 'list' || variable.type === 'dictionary') {
        try {
          const parsedValue = JSON.parse(value);
          
          if (variable.type === 'list') {
            yaml += `${variable.key}:\n`;
            if (Array.isArray(parsedValue)) {
              parsedValue.forEach(item => {
                yaml += `  - ${item}\n`;
              });
            }
          } else {
            yaml += `${variable.key}:\n`;
            if (typeof parsedValue === 'object') {
              Object.entries(parsedValue).forEach(([k, v]) => {
                yaml += `  ${k}: ${v}\n`;
              });
            }
          }
        } catch (e) {
          yaml += `${variable.key}: ${value}\n`;
        }
      } else {
        yaml += `${variable.key}: "${value}"\n`;
      }
    });
    
    return yaml;
  };

  const addVariable = () => {
    setEditingVariable({
      id: "",
      key: "",
      value: "",
      type: "string"
    });
    setVariableDialogOpen(true);
  };

  const editVariable = (variable: Variable) => {
    setEditingVariable({ ...variable });
    setVariableDialogOpen(true);
  };

  const saveVariable = () => {
    if (!editingVariable || !selectedGroup) return;
    
    const isNew = !editingVariable.id;
    const groups = activeTab === "host_vars" ? [...hostVarGroups] : [...groupVarGroups];
    const groupIndex = groups.findIndex(g => g.id === selectedGroup);
    
    if (groupIndex === -1) return;
    
    if (isNew) {
      // Add new variable
      const newVariable = {
        ...editingVariable,
        id: Math.random().toString(36).substring(7),
      };
      
      groups[groupIndex].variables.push(newVariable);
    } else {
      // Update existing variable
      const variableIndex = groups[groupIndex].variables.findIndex(v => v.id === editingVariable.id);
      
      if (variableIndex !== -1) {
        groups[groupIndex].variables[variableIndex] = editingVariable;
      }
    }
    
    // Update state based on active tab
    if (activeTab === "host_vars") {
      setHostVarGroups(groups);
    } else {
      setGroupVarGroups(groups);
    }
    
    // Update YAML view
    const yaml = generateYaml(groups[groupIndex].variables);
    setYamlContent(yaml);
    
    setVariableDialogOpen(false);
    setEditingVariable(null);
    
    toast({
      title: "Success",
      description: `Variable ${isNew ? 'added' : 'updated'} successfully`,
    });
  };

  const deleteVariable = (variableId: string) => {
    if (!selectedGroup) return;
    
    const groups = activeTab === "host_vars" ? [...hostVarGroups] : [...groupVarGroups];
    const groupIndex = groups.findIndex(g => g.id === selectedGroup);
    
    if (groupIndex === -1) return;
    
    const variables = groups[groupIndex].variables.filter(v => v.id !== variableId);
    groups[groupIndex].variables = variables;
    
    // Update state based on active tab
    if (activeTab === "host_vars") {
      setHostVarGroups(groups);
    } else {
      setGroupVarGroups(groups);
    }
    
    // Update YAML view
    const yaml = generateYaml(variables);
    setYamlContent(yaml);
    
    toast({
      title: "Success",
      description: "Variable deleted successfully",
    });
  };

  // Get current variables
  const getCurrentGroup = () => {
    const groups = activeTab === "host_vars" ? hostVarGroups : groupVarGroups;
    return groups.find(g => g.id === selectedGroup);
  };

  const getVariables = () => {
    const currentGroup = getCurrentGroup();
    return currentGroup ? currentGroup.variables : [];
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ansible Variables</h1>
        <Button onClick={saveVariables} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          Save Variables
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="host_vars">Host Variables</TabsTrigger>
          <TabsTrigger value="group_vars">Group Variables</TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>{activeTab === "host_vars" ? "Hosts" : "Groups"}</CardTitle>
              <CardDescription>
                Select a {activeTab === "host_vars" ? "host" : "group"} to edit its variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {(activeTab === "host_vars" ? hostVarGroups : groupVarGroups).map((group) => (
                    <Button 
                      key={group.id}
                      variant={selectedGroup === group.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleGroupSelect(group.id)}
                    >
                      <Folder className="mr-2 h-4 w-4" />
                      {group.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add {activeTab === "host_vars" ? "Host" : "Group"}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="md:col-span-3">
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {getCurrentGroup()?.name || "No selection"}
                  </CardTitle>
                  <CardDescription>
                    {getCurrentGroup()?.path || "Select a file to edit variables"}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={yamlView ? "outline" : "default"} 
                    size="sm"
                    onClick={() => setYamlView(false)}
                  >
                    Table View
                  </Button>
                  <Button 
                    variant={yamlView ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setYamlView(true)}
                  >
                    <FileJson className="mr-2 h-4 w-4" />
                    YAML View
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {yamlView ? (
                  <Textarea 
                    value={yamlContent}
                    onChange={(e) => setYamlContent(e.target.value)}
                    className="font-mono h-[400px]"
                  />
                ) : (
                  <>
                    <div className="flex justify-end mb-4">
                      <Button onClick={addVariable} disabled={!selectedGroup}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Variable
                      </Button>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Key</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getVariables().map((variable) => (
                            <TableRow key={variable.id}>
                              <TableCell className="font-medium">{variable.key}</TableCell>
                              <TableCell>{variable.value}</TableCell>
                              <TableCell>{variable.type}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => editVariable(variable)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => deleteVariable(variable.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          
                          {getVariables().length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                No variables found. Add your first variable.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {!yamlView && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p><strong>Host Variables</strong> apply to specific hosts and override group variables.</p>
                    <p><strong>Group Variables</strong> apply to all hosts in a group.</p>
                    <p>Variables can be simple values or complex data structures like lists and dictionaries.</p>
                    <p>Use the YAML View to edit complex data structures directly in YAML format.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Tabs>
      
      <Dialog open={variableDialogOpen} onOpenChange={setVariableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVariable?.id ? "Edit Variable" : "Add Variable"}</DialogTitle>
            <DialogDescription>
              {editingVariable?.id 
                ? "Update the variable details below."
                : "Enter the details for the new variable."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input 
                id="key"
                value={editingVariable?.key || ""}
                onChange={(e) => setEditingVariable(prev => prev ? {...prev, key: e.target.value} : null)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={editingVariable?.type || "string"} 
                onValueChange={(value) => setEditingVariable(prev => prev ? {...prev, type: value as any} : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="dictionary">Dictionary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Textarea 
                id="value"
                value={editingVariable?.value || ""}
                onChange={(e) => setEditingVariable(prev => prev ? {...prev, value: e.target.value} : null)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input 
                id="description"
                value={editingVariable?.description || ""}
                onChange={(e) => setEditingVariable(prev => prev ? {...prev, description: e.target.value} : null)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVariableDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveVariable}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Variables;
