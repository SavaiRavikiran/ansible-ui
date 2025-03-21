
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { LayoutGrid, List, Plus, RefreshCw, Search, Server } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { addHost } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";

interface HostsHeaderProps {
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  refetch: () => void;
}

export function HostsHeader({ viewMode, setViewMode, refetch }: HostsHeaderProps) {
  const [newHost, setNewHost] = useState({
    name: "",
    group: "",
    variables: {} as Record<string, string>,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [variableKey, setVariableKey] = useState("");
  const [variableValue, setVariableValue] = useState("");

  const handleAddVariable = () => {
    if (!variableKey) return;
    
    setNewHost({
      ...newHost,
      variables: {
        ...newHost.variables,
        [variableKey]: variableValue,
      },
    });
    
    setVariableKey("");
    setVariableValue("");
  };

  const handleSubmit = async () => {
    try {
      if (!newHost.name || !newHost.group) {
        toast({
          title: "Missing Information",
          description: "Host name and group are required.",
          variant: "destructive",
        });
        return;
      }

      // Since we don't have an actual inventory ID from the form, we'll use a mock one
      // In a real implementation, you would select an inventory from a dropdown
      const inventoryId = "inventory1";
      
      await addHost(inventoryId, {
        id: "",
        name: newHost.name,
        groups: [newHost.group],
        variables: newHost.variables,
      });
      
      toast({
        title: "Host Added",
        description: `Host ${newHost.name} has been added successfully.`,
      });
      
      setNewHost({ name: "", group: "", variables: {} });
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add host. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Hosts</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}>
            {viewMode === "table" ? (
              <LayoutGrid className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Host
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Host</DialogTitle>
                <DialogDescription>
                  Add a new host to your infrastructure. Fill out the details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hostname" className="text-right">
                    Hostname
                  </Label>
                  <Input
                    id="hostname"
                    value={newHost.name}
                    onChange={(e) => setNewHost({ ...newHost, name: e.target.value })}
                    className="col-span-3"
                    placeholder="web01.example.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="group" className="text-right">
                    Group
                  </Label>
                  <Input
                    id="group"
                    value={newHost.group}
                    onChange={(e) => setNewHost({ ...newHost, group: e.target.value })}
                    className="col-span-3"
                    placeholder="web_servers"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Variables</Label>
                  <div className="col-span-3 space-y-2">
                    {Object.entries(newHost.variables).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                    
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Key"
                        value={variableKey}
                        onChange={(e) => setVariableKey(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        value={variableValue}
                        onChange={(e) => setVariableValue(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" size="sm" onClick={handleAddVariable}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  <Server className="mr-2 h-4 w-4" /> Add Host
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search hosts by name, group, or variable..."
          className="pl-10 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
