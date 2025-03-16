
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPlaybooks, Playbook, executePlaybook, fetchInventories } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Play, Edit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

export default function Playbooks() {
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<string>("");

  const { data: playbooks = [], isLoading: isLoadingPlaybooks } = useQuery({
    queryKey: ['playbooks'],
    queryFn: fetchPlaybooks,
  });

  const { data: inventories = [] } = useQuery({
    queryKey: ['inventories'],
    queryFn: fetchInventories,
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
    // In a real app, this would save to the backend
    toast({
      title: "Playbook saved",
      description: `Successfully updated ${selectedPlaybook?.name}`,
    });
    setIsEditing(false);
  };

  const handleRunPlaybook = async (playbook: Playbook) => {
    setSelectedPlaybook(playbook);
    setIsRunning(true);
  };

  const handleExecutePlaybook = async () => {
    if (!selectedPlaybook || !selectedInventory) return;
    
    setIsRunning(false);
    
    try {
      toast({
        title: "Playbook execution started",
        description: `Running ${selectedPlaybook.name} with inventory ${selectedInventory}`,
      });
      
      const result = await executePlaybook(selectedPlaybook.id, selectedInventory);
      
      toast({
        title: result.status === 'success' ? "Execution successful" : "Execution failed",
        description: `Playbook ${selectedPlaybook.name} ${result.status === 'success' ? 'completed successfully' : 'failed'}`,
        variant: result.status === 'success' ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Execution failed",
        description: "An error occurred while executing the playbook",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Playbooks</h1>
        <Button>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playbooks.map((playbook) => (
              <TableRow key={playbook.id}>
                <TableCell className="font-medium">{playbook.name}</TableCell>
                <TableCell>{playbook.description}</TableCell>
                <TableCell>
                  {new Date(playbook.lastModified).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPlaybook(playbook)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunPlaybook(playbook)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Editor Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="sm:max-w-2xl w-[90vw]" side="right">
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
              <Button onClick={handleSavePlaybook}>Save Changes</Button>
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
