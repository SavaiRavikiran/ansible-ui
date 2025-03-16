
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPlaybooks, Playbook, executePlaybook, fetchInventories, savePlaybook } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Play, Edit, Trash } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Playbooks() {
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<string>("");
  const [newPlaybook, setNewPlaybook] = useState<Partial<Playbook>>({
    name: '',
    description: '',
    content: '---\n# New Ansible Playbook\n- name: My Playbook\n  hosts: all\n  tasks:\n    - name: Hello World\n      debug:\n        msg: "Hello from Ansible UI"\n'
  });

  const queryClient = useQueryClient();

  const { data: playbooks = [], isLoading: isLoadingPlaybooks } = useQuery({
    queryKey: ['playbooks'],
    queryFn: fetchPlaybooks,
  });

  const { data: inventories = [] } = useQuery({
    queryKey: ['inventories'],
    queryFn: fetchInventories,
  });

  const savePlaybookMutation = useMutation({
    mutationFn: savePlaybook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      toast.success("Playbook saved successfully");
    },
    onError: () => {
      toast.error("Failed to save playbook");
    }
  });

  const handleEditPlaybook = (playbook: Playbook) => {
    setSelectedPlaybook({ ...playbook });
    setIsEditing(true);
  };

  const handleUpdateContent = (content: string) => {
    if (selectedPlaybook) {
      setSelectedPlaybook({ ...selectedPlaybook, content });
    }
  };

  const handleSavePlaybook = async () => {
    if (!selectedPlaybook) return;
    
    try {
      await savePlaybookMutation.mutateAsync(selectedPlaybook);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving playbook:", error);
    }
  };

  const handleCreatePlaybook = async () => {
    if (!newPlaybook.name) {
      toast.error("Playbook name is required");
      return;
    }
    
    try {
      // Ensure the name has .yml extension if not already present
      let name = newPlaybook.name;
      if (!name.endsWith('.yml') && !name.endsWith('.yaml')) {
        name = `${name}.yml`;
      }
      
      const playbook: Playbook = {
        ...newPlaybook as Playbook,
        name,
        id: '',
        path: '',
        lastModified: new Date().toISOString(),
      };
      
      await savePlaybookMutation.mutateAsync(playbook);
      setIsCreating(false);
      setNewPlaybook({
        name: '',
        description: '',
        content: '---\n# New Ansible Playbook\n- name: My Playbook\n  hosts: all\n  tasks:\n    - name: Hello World\n      debug:\n        msg: "Hello from Ansible UI"\n'
      });
    } catch (error) {
      console.error("Error creating playbook:", error);
    }
  };

  const handleRunPlaybook = async (playbook: Playbook) => {
    setSelectedPlaybook(playbook);
    setIsRunning(true);
  };

  const handleExecutePlaybook = async () => {
    if (!selectedPlaybook || !selectedInventory) return;
    
    setIsRunning(false);
    
    try {
      toast.loading(`Running ${selectedPlaybook.name} with inventory ${selectedInventory}`);
      
      const result = await executePlaybook(selectedPlaybook.id, selectedInventory);
      
      if (result.status === 'success') {
        toast.success(`Playbook ${selectedPlaybook.name} completed successfully`);
      } else {
        toast.error(`Playbook ${selectedPlaybook.name} failed`);
      }
      
      // Refresh dashboard data to show the new run
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } catch (error) {
      toast.error("An error occurred while executing the playbook");
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Playbooks</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Playbook
        </Button>
      </div>

      {isLoadingPlaybooks ? (
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
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="hidden md:table-cell">Last Modified</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playbooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No playbooks found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                playbooks.map((playbook) => (
                  <TableRow key={playbook.id}>
                    <TableCell className="font-medium">{playbook.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{playbook.description}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(playbook.lastModified).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPlaybook(playbook)}
                          title="Edit Playbook"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunPlaybook(playbook)}
                          title="Run Playbook"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Playbook Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Playbook</DialogTitle>
            <DialogDescription>
              Create a new Ansible playbook file. The file will be saved to your configured playbooks directory.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="my-playbook.yml"
                value={newPlaybook.name}
                onChange={(e) => setNewPlaybook({...newPlaybook, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Description of what this playbook does"
                value={newPlaybook.description}
                onChange={(e) => setNewPlaybook({...newPlaybook, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                className="font-mono h-[40vh]"
                value={newPlaybook.content}
                onChange={(e) => setNewPlaybook({...newPlaybook, content: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlaybook} disabled={savePlaybookMutation.isPending}>
              Create Playbook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editor Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="sm:max-w-2xl w-[90vw] overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle>Edit Playbook: {selectedPlaybook?.name}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={selectedPlaybook?.name || ""}
                onChange={(e) =>
                  selectedPlaybook &&
                  setSelectedPlaybook({ ...selectedPlaybook, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={selectedPlaybook?.description || ""}
                onChange={(e) =>
                  selectedPlaybook &&
                  setSelectedPlaybook({
                    ...selectedPlaybook,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                className="font-mono h-[40vh]"
                value={selectedPlaybook?.content || ""}
                onChange={(e) => handleUpdateContent(e.target.value)}
              />
            </div>
            <div className="pt-4 space-x-2 flex justify-end">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePlaybook} disabled={savePlaybookMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Run Playbook Sheet */}
      <Sheet open={isRunning} onOpenChange={setIsRunning}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Run Playbook: {selectedPlaybook?.name}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inventory">Select Inventory</Label>
              <Select value={selectedInventory} onValueChange={setSelectedInventory}>
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
            <div className="pt-4 space-x-2 flex justify-end">
              <Button variant="outline" onClick={() => setIsRunning(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleExecutePlaybook}
                disabled={!selectedInventory}
              >
                Run Playbook
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
