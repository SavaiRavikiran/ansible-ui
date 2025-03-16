
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInventories, Inventory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Edit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export default function Inventories() {
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { data: inventories = [], isLoading } = useQuery({
    queryKey: ['inventories'],
    queryFn: fetchInventories,
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
    // In a real app, this would save to the backend
    toast({
      title: "Inventory saved",
      description: `Successfully updated ${selectedInventory?.name}`,
    });
    setIsEditing(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Inventories</h1>
        <Button>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventories.map((inventory) => (
              <TableRow key={inventory.id}>
                <TableCell className="font-medium">{inventory.name}</TableCell>
                <TableCell>{inventory.description}</TableCell>
                <TableCell>
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
            ))}
          </TableBody>
        </Table>
      )}

      {/* Editor Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="sm:max-w-2xl w-[90vw]" side="right">
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
              <Button onClick={handleSaveInventory}>Save Changes</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
