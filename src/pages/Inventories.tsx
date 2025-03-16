
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInventories, Inventory, saveInventory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Edit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Inventories() {
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newInventory, setNewInventory] = useState<Partial<Inventory>>({
    name: '',
    description: '',
    content: '[all]\n# Add your hosts here\n\n[web_servers]\n# e.g., web01.example.com ansible_host=192.168.1.101\n\n[db_servers]\n# e.g., db01.example.com ansible_host=192.168.1.201\n'
  });

  const queryClient = useQueryClient();

  const { data: inventories = [], isLoading } = useQuery({
    queryKey: ['inventories'],
    queryFn: fetchInventories,
  });

  const saveInventoryMutation = useMutation({
    mutationFn: saveInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      toast.success("Inventory saved successfully");
    },
    onError: () => {
      toast.error("Failed to save inventory");
    }
  });

  const handleEditInventory = (inventory: Inventory) => {
    setSelectedInventory({ ...inventory });
    setIsEditing(true);
  };

  const handleUpdateContent = (content: string) => {
    if (selectedInventory) {
      setSelectedInventory({ ...selectedInventory, content });
    }
  };

  const handleSaveInventory = async () => {
    if (!selectedInventory) return;
    
    try {
      await saveInventoryMutation.mutateAsync(selectedInventory);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving inventory:", error);
    }
  };

  const handleCreateInventory = async () => {
    if (!newInventory.name) {
      toast.error("Inventory name is required");
      return;
    }
    
    try {
      const inventory: Inventory = {
        ...newInventory as Inventory,
        id: '',
        path: '',
        lastModified: new Date().toISOString(),
      };
      
      await saveInventoryMutation.mutateAsync(inventory);
      setIsCreating(false);
      setNewInventory({
        name: '',
        description: '',
        content: '[all]\n# Add your hosts here\n\n[web_servers]\n# e.g., web01.example.com ansible_host=192.168.1.101\n\n[db_servers]\n# e.g., db01.example.com ansible_host=192.168.1.201\n'
      });
    } catch (error) {
      console.error("Error creating inventory:", error);
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Inventories</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Inventory
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
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="hidden md:table-cell">Last Modified</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No inventories found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                inventories.map((inventory) => (
                  <TableRow key={inventory.id}>
                    <TableCell className="font-medium">{inventory.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{inventory.description}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(inventory.lastModified).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInventory(inventory)}
                      >
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

      {/* Create Inventory Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Inventory</DialogTitle>
            <DialogDescription>
              Create a new Ansible inventory. The file will be saved to your configured inventories directory.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="production"
                value={newInventory.name}
                onChange={(e) => setNewInventory({...newInventory, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Production servers inventory"
                value={newInventory.description}
                onChange={(e) => setNewInventory({...newInventory, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                className="font-mono h-[40vh]"
                value={newInventory.content}
                onChange={(e) => setNewInventory({...newInventory, content: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInventory} disabled={saveInventoryMutation.isPending}>
              Create Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editor Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="sm:max-w-2xl w-[90vw] overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle>Edit Inventory: {selectedInventory?.name}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={selectedInventory?.name || ""}
                onChange={(e) =>
                  selectedInventory &&
                  setSelectedInventory({ ...selectedInventory, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={selectedInventory?.description || ""}
                onChange={(e) =>
                  selectedInventory &&
                  setSelectedInventory({
                    ...selectedInventory,
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
                value={selectedInventory?.content || ""}
                onChange={(e) => handleUpdateContent(e.target.value)}
              />
            </div>
            <div className="pt-4 space-x-2 flex justify-end">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveInventory} disabled={saveInventoryMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
