
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchHosts, fetchInventories, addHost, Host } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface VariableEntry {
  key: string;
  value: string;
}

export default function Hosts() {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>("");
  const [newHost, setNewHost] = useState<Partial<Host>>({
    name: '',
    groups: [],
    variables: {},
  });
  const [variables, setVariables] = useState<VariableEntry[]>([
    { key: 'ansible_host', value: '' },
    { key: 'ansible_user', value: '' },
  ]);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { data: hosts = [], isLoading } = useQuery({
    queryKey: ['hosts'],
    queryFn: fetchHosts,
  });

  const { data: inventories = [] } = useQuery({
    queryKey: ['inventories'],
    queryFn: fetchInventories,
  });

  const addHostMutation = useMutation({
    mutationFn: ({ inventoryId, host }: { inventoryId: string; host: Host }) => 
      addHost(inventoryId, host),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosts'] });
      toast.success("Host added successfully");
    },
    onError: () => {
      toast.error("Failed to add host");
    }
  });

  const handleInventoryChange = (inventoryId: string) => {
    setSelectedInventoryId(inventoryId);
    
    // Extract groups from the selected inventory
    const inventory = inventories.find(inv => inv.id === inventoryId);
    if (inventory && inventory.content) {
      const groups: string[] = [];
      const lines = inventory.content.split('\n');
      
      lines.forEach(line => {
        const groupMatch = line.match(/^\[([^\]]+)\]/);
        if (groupMatch && groupMatch[1] !== 'all') {
          groups.push(groupMatch[1]);
        }
      });
      
      setAvailableGroups(groups);
    }
  };

  const handleGroupToggle = (group: string) => {
    setSelectedGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const handleVariableChange = (index: number, field: 'key' | 'value', value: string) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);
  };

  const addVariable = () => {
    setVariables([...variables, { key: '', value: '' }]);
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleCreateHost = async () => {
    if (!newHost.name) {
      toast.error("Host name is required");
      return;
    }
    
    if (!selectedInventoryId) {
      toast.error("Please select an inventory");
      return;
    }
    
    if (selectedGroups.length === 0) {
      toast.error("Please select at least one group");
      return;
    }
    
    try {
      // Convert variables array to object
      const variablesObj: Record<string, string> = {};
      variables.forEach(v => {
        if (v.key && v.value) {
          variablesObj[v.key] = v.value;
        }
      });
      
      const host: Host = {
        id: '',
        name: newHost.name,
        groups: selectedGroups,
        variables: variablesObj,
      };
      
      await addHostMutation.mutateAsync({ inventoryId: selectedInventoryId, host });
      setIsCreating(false);
      resetForm();
    } catch (error) {
      console.error("Error adding host:", error);
    }
  };

  const resetForm = () => {
    setNewHost({
      name: '',
      groups: [],
      variables: {},
    });
    setVariables([
      { key: 'ansible_host', value: '' },
      { key: 'ansible_user', value: '' },
    ]);
    setSelectedInventoryId("");
    setSelectedGroups([]);
    setAvailableGroups([]);
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hosts</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Host
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Groups</TableHead>
                <TableHead className="hidden md:table-cell">Variables</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No hosts found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                hosts.map((host) => (
                  <TableRow key={host.id}>
                    <TableCell className="font-medium">{host.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {host.groups.map((group) => (
                          <Badge key={group} variant="outline">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm">
                        {Object.entries(host.variables)
                          .map(([key, value]) => `${key}=${value}`)
                          .join(', ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Host Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Host</DialogTitle>
            <DialogDescription>
              Add a new host to an inventory. Select the inventory and configure the host details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inventory">Inventory</Label>
              <Select value={selectedInventoryId} onValueChange={handleInventoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select inventory" />
                </SelectTrigger>
                <SelectContent>
                  {inventories.map((inventory) => (
                    <SelectItem key={inventory.id} value={inventory.id}>
                      {inventory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hostname">Hostname</Label>
              <Input
                id="hostname"
                placeholder="web01.example.com"
                value={newHost.name}
                onChange={(e) => setNewHost({...newHost, name: e.target.value})}
              />
            </div>
            
            {availableGroups.length > 0 && (
              <div className="space-y-2">
                <Label>Groups</Label>
                <div className="border rounded-md p-3 space-y-2">
                  {availableGroups.map((group) => (
                    <div key={group} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`group-${group}`}
                        checked={selectedGroups.includes(group)}
                        onCheckedChange={() => handleGroupToggle(group)}
                      />
                      <Label htmlFor={`group-${group}`} className="cursor-pointer">{group}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Variables</Label>
                <Button type="button" variant="outline" size="sm" onClick={addVariable}>
                  <Plus className="h-3 w-3 mr-1" /> Add Variable
                </Button>
              </div>
              <div className="space-y-2">
                {variables.map((variable, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="Key"
                      value={variable.key}
                      onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <span>=</span>
                    <Input
                      placeholder="Value"
                      value={variable.value}
                      onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeVariable(index)}
                      className="px-2"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateHost} disabled={addHostMutation.isPending}>
              Add Host
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
