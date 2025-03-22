
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, UserPlus, UserCog, Shield, Key, Lock, Plus, Trash, Edit, Search, 
  UserCheck, UserX, ChevronDown, Mail, CheckCircle2, AlertCircle, UserCircle, User
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  active: boolean;
  lastLogin?: string;
  teams: string[];
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "viewer",
    active: true,
    teams: [],
  });
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: "",
    description: "",
    permissions: [],
  });
  const [newTeam, setNewTeam] = useState<Partial<Team>>({
    name: "",
    description: "",
    members: [],
  });
  const [newPermission, setNewPermission] = useState<Partial<Permission>>({
    name: "",
    description: "",
    category: "system",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock Users
        const mockUsers: User[] = [
          {
            id: "1",
            name: "John Doe",
            email: "john.doe@example.com",
            role: "admin",
            active: true,
            lastLogin: "2023-10-15T14:30:00Z",
            teams: ["dev", "ops"],
            avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=John",
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            role: "operator",
            active: true,
            lastLogin: "2023-10-15T10:00:00Z",
            teams: ["dev"],
            avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Jane",
          },
          {
            id: "3",
            name: "Alice Johnson",
            email: "alice.johnson@example.com",
            role: "viewer",
            active: false,
            lastLogin: "2023-10-14T18:45:00Z",
            teams: ["qa"],
            avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Alice",
          },
          {
            id: "4",
            name: "Bob Williams",
            email: "bob.williams@example.com",
            role: "operator",
            active: true,
            lastLogin: "2023-10-15T09:15:00Z",
            teams: ["ops"],
            avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Bob",
          },
          {
            id: "5",
            name: "Charlie Brown",
            email: "charlie.brown@example.com",
            role: "viewer",
            active: false,
            lastLogin: "2023-10-13T22:00:00Z",
            teams: ["security"],
            avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Charlie",
          },
        ];

        // Mock Roles
        const mockRoles: Role[] = [
          {
            id: "admin",
            name: "Administrator",
            description: "Full access to all resources",
            permissions: ["read", "write", "delete", "manage"],
          },
          {
            id: "operator",
            name: "Operator",
            description: "Can perform operational tasks",
            permissions: ["read", "write"],
          },
          {
            id: "viewer",
            name: "Viewer",
            description: "Read-only access to resources",
            permissions: ["read"],
          },
        ];

        // Mock Teams
        const mockTeams: Team[] = [
          {
            id: "dev",
            name: "Development",
            description: "Development team",
            members: ["1", "2"],
          },
          {
            id: "ops",
            name: "Operations",
            description: "Operations team",
            members: ["1", "4"],
          },
          {
            id: "qa",
            name: "Quality Assurance",
            description: "Quality assurance team",
            members: ["3"],
          },
          {
            id: "security",
            name: "Security",
            description: "Security team",
            members: ["5"],
          },
        ];

        // Mock Permissions
        const mockPermissions: Permission[] = [
          {
            id: "read",
            name: "Read",
            description: "Read access",
            category: "system",
          },
          {
            id: "write",
            name: "Write",
            description: "Write access",
            category: "system",
          },
          {
            id: "delete",
            name: "Delete",
            description: "Delete access",
            category: "system",
          },
          {
            id: "manage",
            name: "Manage",
            description: "Manage access",
            category: "system",
          },
        ];

        setUsers(mockUsers);
        setRoles(mockRoles);
        setTeams(mockTeams);
        setPermissions(mockPermissions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data"
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm);

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new user
      const newUserData: User = {
        id: Math.random().toString(36).substring(7),
        name: newUser.name || "",
        email: newUser.email || "",
        role: newUser.role as 'admin' | 'operator' | 'viewer',
        active: newUser.active !== undefined ? newUser.active : true,
        teams: newUser.teams || [],
        avatar: `https://api.dicebear.com/7.x/lorelei/svg?seed=${newUser.name}`,
      };

      setUsers([...users, newUserData]);
      setCreateDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "User created successfully"
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create user"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !newUser.name || !newUser.email || !newUser.role) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            name: newUser.name || user.name,
            email: newUser.email || user.email,
            role: newUser.role || user.role,
            active: newUser.active !== undefined ? newUser.active : user.active,
            teams: newUser.teams || user.teams,
            avatar: `https://api.dicebear.com/7.x/lorelei/svg?seed=${newUser.name}`,
          };
        }
        return user;
      });

      setUsers(updatedUsers);
      setEditDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "User updated successfully"
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Delete user
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);

      toast({
        title: "Success",
        description: "User deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name || !newRole.description) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new role
      const newRoleData: Role = {
        id: Math.random().toString(36).substring(7),
        name: newRole.name || "",
        description: newRole.description || "",
        permissions: newRole.permissions || [],
      };

      setRoles([...roles, newRoleData]);
      setRoleDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Role created successfully"
      });
    } catch (error) {
      console.error("Error creating role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create role"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole || !newRole.name || !newRole.description) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update role
      const updatedRoles = roles.map(role => {
        if (role.id === selectedRole.id) {
          return {
            ...role,
            name: newRole.name || role.name,
            description: newRole.description || role.description,
            permissions: newRole.permissions || role.permissions,
          };
        }
        return role;
      });

      setRoles(updatedRoles);
      setRoleDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Role updated successfully"
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update role"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Delete role
      const updatedRoles = roles.filter(role => role.id !== roleId);
      setRoles(updatedRoles);

      toast({
        title: "Success",
        description: "Role deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete role"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name || !newTeam.description) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new team
      const newTeamData: Team = {
        id: Math.random().toString(36).substring(7),
        name: newTeam.name || "",
        description: newTeam.description || "",
        members: newTeam.members || [],
      };

      setTeams([...teams, newTeamData]);
      setTeamDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Team created successfully"
      });
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create team"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeam || !newTeam.name || !newTeam.description) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update team
      const updatedTeams = teams.map(team => {
        if (team.id === selectedTeam.id) {
          return {
            ...team,
            name: newTeam.name || team.name,
            description: newTeam.description || team.description,
            members: newTeam.members || team.members,
          };
        }
        return team;
      });

      setTeams(updatedTeams);
      setTeamDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Team updated successfully"
      });
    } catch (error) {
      console.error("Error updating team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update team"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Delete team
      const updatedTeams = teams.filter(team => team.id !== teamId);
      setTeams(updatedTeams);

      toast({
        title: "Success",
        description: "Team deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete team"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermission = async () => {
    if (!newPermission.name || !newPermission.description || !newPermission.category) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new permission
      const newPermissionData: Permission = {
        id: Math.random().toString(36).substring(7),
        name: newPermission.name || "",
        description: newPermission.description || "",
        category: newPermission.category || "system",
      };

      setPermissions([...permissions, newPermissionData]);
      setPermissionDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Permission created successfully"
      });
    } catch (error) {
      console.error("Error creating permission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create permission"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = async () => {
    if (!selectedPermission || !newPermission.name || !newPermission.description || !newPermission.category) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update permission
      const updatedPermissions = permissions.map(permission => {
        if (permission.id === selectedPermission.id) {
          return {
            ...permission,
            name: newPermission.name || permission.name,
            description: newPermission.description || permission.description,
            category: newPermission.category || permission.category,
          };
        }
        return permission;
      });

      setPermissions(updatedPermissions);
      setPermissionDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Permission updated successfully"
      });
    } catch (error) {
      console.error("Error updating permission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update permission"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Delete permission
      const updatedPermissions = permissions.filter(permission => permission.id !== permissionId);
      setPermissions(updatedPermissions);

      toast({
        title: "Success",
        description: "Permission deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete permission"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewUser({
      name: "",
      email: "",
      role: "viewer",
      active: true,
      teams: [],
    });
    setNewRole({
      name: "",
      description: "",
      permissions: [],
    });
    setNewTeam({
      name: "",
      description: "",
      members: [],
    });
    setNewPermission({
      name: "",
      description: "",
      category: "system",
    });
    setSelectedUser(null);
    setSelectedRole(null);
    setSelectedTeam(null);
    setSelectedPermission(null);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      teams: user.teams,
    });
    setEditDialogOpen(true);
  };

  const openRoleDialog = (role: Role) => {
    setSelectedRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setRoleDialogOpen(true);
  };

  const openTeamDialog = (team: Team) => {
    setSelectedTeam(team);
    setNewTeam({
      name: team.name,
      description: team.description,
      members: team.members,
    });
    setTeamDialogOpen(true);
  };

  const openPermissionDialog = (permission: Permission) => {
    setSelectedPermission(permission);
    setNewPermission({
      name: permission.name,
      description: permission.description,
      category: permission.category,
    });
    setPermissionDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Users className="h-4 w-4 mr-2" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Key className="h-4 w-4 mr-2" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">User Management</h2>
            <div className="flex space-x-2">
              <Input
                type="search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                    <DialogDescription>
                      Create a new user account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Name</Label>
                      <Input
                        id="user-name"
                        placeholder="e.g., John Doe"
                        value={newUser.name || ""}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email</Label>
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="e.g., john.doe@example.com"
                        value={newUser.email || ""}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-role">Role</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value as 'admin' | 'operator' | 'viewer'})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="operator">Operator</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="user-active"
                        checked={newUser.active}
                        onCheckedChange={(checked) => setNewUser({...newUser, active: checked})}
                      />
                      <Label htmlFor="user-active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser} disabled={loading}>
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage user accounts and their roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <span>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          {user.active ? (
                            <Badge variant="outline">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <UserX className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Edit an existing user account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Name</Label>
                  <Input
                    id="user-name"
                    placeholder="e.g., John Doe"
                    value={newUser.name || ""}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="e.g., john.doe@example.com"
                    value={newUser.email || ""}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value as 'admin' | 'operator' | 'viewer'})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="user-active"
                    checked={newUser.active}
                    onCheckedChange={(checked) => setNewUser({...newUser, active: checked})}
                  />
                  <Label htmlFor="user-active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser} disabled={loading}>
                  Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="roles">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Role Management</h2>
            <Button onClick={() => setRoleDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                Manage roles and their permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openRoleDialog(role)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Team Management</h2>
            <Button onClick={() => setTeamDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
              <CardDescription>
                Manage teams and their members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>{team.description}</TableCell>
                        <TableCell>{team.members.length} members</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openTeamDialog(team)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTeam(team.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Permission Management</h2>
            <Button onClick={() => setPermissionDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Permission
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Manage system permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>{permission.description}</TableCell>
                        <TableCell>{permission.category}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openPermissionDialog(permission)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePermission(permission.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
