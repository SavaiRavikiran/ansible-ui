
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRoles, createRole, Role } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Roles() {
  const [isCreating, setIsCreating] = useState(false);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: '',
    description: '',
  });

  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });

  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success("Role created successfully");
    },
    onError: () => {
      toast.error("Failed to create role");
    }
  });

  const handleCreateRole = async () => {
    if (!newRole.name) {
      toast.error("Role name is required");
      return;
    }
    
    try {
      const role: Role = {
        ...newRole as Role,
        id: '',
        path: '',
        lastModified: new Date().toISOString(),
      };
      
      await createRoleMutation.mutateAsync(role);
      setIsCreating(false);
      setNewRole({
        name: '',
        description: '',
      });
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Roles</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Role
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
                <TableHead className="hidden md:table-cell">Path</TableHead>
                <TableHead className="hidden md:table-cell">Last Modified</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No roles found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{role.description}</TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm">{role.path}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(role.lastModified).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Role Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a new Ansible role with the basic directory structure. The role will be created in your configured roles directory.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="nginx"
                value={newRole.name}
                onChange={(e) => setNewRole({...newRole, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Install and configure Nginx web server"
                value={newRole.description}
                onChange={(e) => setNewRole({...newRole, description: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={createRoleMutation.isPending}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
