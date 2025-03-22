
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  UserPlus, Edit, Trash, ShieldCheck, Lock, Key, Users, UserCheck, Mail, Search, 
  Eye, EyeOff, RefreshCw, CheckCircle2, X, Settings, Filter
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "viewer",
    active: true,
    teams: []
  });
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: "",
    description: "",
    permissions: []
  });
  const [newTeam, setNewTeam] = useState<Partial<Team>>({
    name: "",
    description: "",
    members: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock Users
        const mockUsers: User[] = [
          {
            id: "1",
            name: "John Doe",
            email: "john.doe@example.com",
            role: "admin",
            active: true,
            lastLogin: "2023-10-15T14:30:00Z",
            teams: ["1", "2"],
            avatar: "https://i.pravatar.cc/150?u=john"
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            role: "operator",
            active: true,
            lastLogin: "2023-10-14T09:45:00Z",
            teams: ["1"],
            avatar: "https://i.pravatar.cc/150?u=jane"
          },
          {
            id: "3",
            name: "Michael Johnson",
            email: "michael.johnson@example.com",
            role: "viewer",
            active: true,
            lastLogin: "2023-10-13T11:20:00Z",
            teams: ["2"],
            avatar: "https://i.pravatar.cc/150?u=michael"
          },
          {
            id: "4",
            name: "Lisa Anderson",
            email: "lisa.anderson@example.com",
            role: "operator",
            active: false,
            lastLogin: "2023-09-28T16:15:00Z",
            teams: [],
            avatar: "https://i.pravatar.cc/150?u=lisa"
          }
        ];
        
        // Mock Roles
        const mockRoles: Role[] = [
          {
            id: "1",
            name: "Administrator",
            description: "Full access to all features",
            permissions: ["manage_users", "manage_roles", "manage_playbooks", "manage_inventory", "manage_settings", "execute_playbooks"]
          },
          {
            id: "2",
            name: "Operator",
            description: "Can execute playbooks and manage inventory",
            permissions: ["view_playbooks", "execute_playbooks", "manage_inventory", "view_logs"]
          },
          {
            id: "3",
            name: "Viewer",
            description: "Read-only access to playbooks and logs",
            permissions: ["view_playbooks", "view_inventory", "view_logs"]
          }
        ];
        
        // Mock Teams
        const mockTeams: Team[] = [
          {
            id: "1",
            name: "DevOps Team",
            description: "Server infrastructure management",
            members: ["1", "2"]
          },
          {
            id: "2",
            name: "Security Team",
            description: "Security compliance and management",
            members: ["1", "3"]
          }
        ];
        
        // Mock Permissions
        const mockPermissions: Permission[] = [
          { id: "manage_users", name: "Manage Users", description: "Create, edit, and delete users", category: "Administration" },
          { id: "manage_roles", name: "Manage Roles", description: "Create, edit, and delete roles", category: "Administration" },
          { id: "manage_playbooks", name: "Manage Playbooks", description: "Create, edit, and delete playbooks", category: "Content" },
          { id: "view_playbooks", name: "View Playbooks", description: "View playbooks", category: "Content" },
          { id: "execute_playbooks", name: "Execute Playbooks", description: "Run playbooks", category: "Operations" },
          { id: "manage_inventory", name: "Manage Inventory", description: "Create, edit, and delete inventory", category: "Content" },
          { id: "view_inventory", name: "View Inventory", description: "View inventory", category: "Content" },
          { id: "manage_settings", name: "Manage Settings", description: "Change system settings", category: "Administration" },
          { id: "view_logs", name: "View Logs", description: "View execution logs", category: "Operations" }
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
          description: "Failed to load user management data",
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search implementation would go here in a real app
  };

  const getRoleName = (roleId: 'admin' | 'operator' | 'viewer') => {
    const roleNames: Record<string, string> = {
      admin: "Administrator",
      operator: "Operator",
      viewer: "Viewer"
    };
    return roleNames[roleId] || roleId;
  };

  const getTeamNames = (teamIds: string[]) => {
    return teamIds.map(id => {
      const team = teams.find(t => t.id === id);
      return team ? team.name : "";
    }).filter(Boolean).join(", ");
  };

  const getPermissionsByCategory = () => {
    const categories: Record<string, Permission[]> = {};
    
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    
    return categories;
  };

  const filterPermissions = (permissionIds: string[]) => {
    return permissions.filter(p => permissionIds.includes(p.id));
  };

  const openEditUserDialog = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      teams: user.teams
    });
    setEditMode(true);
    setPassword(""); // Clear password field for editing
    setUserDialogOpen(true);
  };

  const openEditRoleDialog = (role: Role) => {
    setSelectedRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setEditMode(true);
    setRoleDialogOpen(true);
  };

  const openEditTeamDialog = (team: Team) => {
    setSelectedTeam(team);
    setNewTeam({
      name: team.name,
      description: team.description,
      members: team.members
    });
    setEditMode(true);
    setTeamDialogOpen(true);
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }
    
    if (!editMode && !password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Password is required for new users",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editMode && selectedUser) {
        // Update existing user
        const updatedUsers = users.map(user => {
          if (user.id === selectedUser.id) {
            return {
              ...user,
              name: newUser.name || user.name,
              email: newUser.email || user.email,
              role: newUser.role as 'admin' | 'operator' | 'viewer',
              active: newUser.active !== undefined ? newUser.active : user.active,
              teams: newUser.teams || user.teams
            };
          }
          return user;
        });
        
        setUsers(updatedUsers);
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        // Create new user
        const newUserWithId: User = {
          id: Math.random().toString(36).substring(7),
          name: newUser.name || "",
          email: newUser.email || "",
          role: newUser.role as 'admin' | 'operator' | 'viewer',
          active: newUser.active !== undefined ? newUser.active : true,
          teams: newUser.teams || [],
          lastLogin: undefined,
          avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
        };
        
        setUsers([...users, newUserWithId]);
        toast({
          title: "Success",
          description: "User created successfully",
        });
      }
      
      setUserDialogOpen(false);
      resetUserForm();
    } catch (error) {
      console.error("Error creating/updating user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editMode ? 'update' : 'create'} user`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Role name is required",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editMode && selectedRole) {
        // Update existing role
        const updatedRoles = roles.map(role => {
          if (role.id === selectedRole.id) {
            return {
              ...role,
              name: newRole.name || role.name,
              description: newRole.description || role.description,
              permissions: newRole.permissions || role.permissions
            };
          }
          return role;
        });
        
        setRoles(updatedRoles);
        toast({
          title: "Success",
          description: "Role updated successfully",
        });
      } else {
        // Create new role
        const newRoleWithId: Role = {
          id: Math.random().toString(36).substring(7),
          name: newRole.name || "",
          description: newRole.description || "",
          permissions: newRole.permissions || []
        };
        
        setRoles([...roles, newRoleWithId]);
        toast({
          title: "Success",
          description: "Role created successfully",
        });
      }
      
      setRoleDialogOpen(false);
      resetRoleForm();
    } catch (error) {
      console.error("Error creating/updating role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editMode ? 'update' : 'create'} role`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Team name is required",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editMode && selectedTeam) {
        // Update existing team
        const updatedTeams = teams.map(team => {
          if (team.id === selectedTeam.id) {
            return {
              ...team,
              name: newTeam.name || team.name,
              description: newTeam.description || team.description,
              members: newTeam.members || team.members
            };
          }
          return team;
        });
        
        setTeams(updatedTeams);
        toast({
          title: "Success",
          description: "Team updated successfully",
        });
      } else {
        // Create new team
        const newTeamWithId: Team = {
          id: Math.random().toString(36).substring(7),
          name: newTeam.name || "",
          description: newTeam.description || "",
          members: newTeam.members || []
        };
        
        setTeams([...teams, newTeamWithId]);
        toast({
          title: "Success",
          description: "Team created successfully",
        });
      }
      
      setTeamDialogOpen(false);
      resetTeamForm();
    } catch (error) {
      console.error("Error creating/updating team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editMode ? 'update' : 'create'} team`,
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
      
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user",
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
      
      const updatedRoles = roles.filter(role => role.id !== roleId);
      setRoles(updatedRoles);
      
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete role",
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
      
      const updatedTeams = teams.filter(team => team.id !== teamId);
      setTeams(updatedTeams);
      
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete team",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetUserForm = () => {
    setNewUser({
      name: "",
      email: "",
      role: "viewer",
      active: true,
      teams: []
    });
    setPassword("");
    setSelectedUser(null);
    setEditMode(false);
  };

  const resetRoleForm = () => {
    setNewRole({
      name: "",
      description: "",
      permissions: []
    });
    setSelectedRole(null);
    setEditMode(false);
  };

  const resetTeamForm = () => {
    setNewTeam({
      name: "",
      description: "",
      members: []
    });
    setSelectedTeam(null);
    setEditMode(false);
  };

  const togglePermission = (permissionId: string) => {
    const permissions = newRole.permissions || [];
    
    if (permissions.includes(permissionId)) {
      setNewRole({
        ...newRole,
        permissions: permissions.filter(id => id !== permissionId)
      });
    } else {
      setNewRole({
        ...newRole,
        permissions: [...permissions, permissionId]
      });
    }
  };

  const toggleTeamMember = (userId: string) => {
    const members = newTeam.members || [];
    
    if (members.includes(userId)) {
      setNewTeam({
        ...newTeam,
        members: members.filter(id => id !== userId)
      });
    } else {
      setNewTeam({
        ...newTeam,
        members: [...members, userId]
      });
    }
  };

  const toggleUserTeam = (teamId: string) => {
    const teams = newUser.teams || [];
    
    if (teams.includes(teamId)) {
      setNewUser({
        ...newUser,
        teams: teams.filter(id => id !== teamId)
      });
    } else {
      setNewUser({
        ...newUser,
        teams: [...teams, teamId]
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex space-x-2">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-60"
            />
            <Button type="submit" size="icon" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          <Dialog open={userDialogOpen} onOpenChange={(open) => {
            setUserDialogOpen(open);
            if (!open) resetUserForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editMode ? "Edit User" : "Create New User"}</DialogTitle>
                <DialogDescription>
                  {editMode 
                    ? "Update the user details below." 
                    : "Fill in the details to create a new user."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name"
                    value={newUser.name || ""}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={newUser.email || ""}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({...newUser, role: value as 'admin' | 'operator' | 'viewer'})}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {!editMode && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input 
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Teams</Label>
                  <ScrollArea className="h-24 border rounded-md p-2">
                    {teams.map(team => (
                      <div key={team.id} className="flex items-center space-x-2 py-1">
                        <Checkbox 
                          id={`team-${team.id}`}
                          checked={(newUser.teams || []).includes(team.id)}
                          onCheckedChange={() => toggleUserTeam(team.id)}
                        />
                        <Label htmlFor={`team-${team.id}`} className="cursor-pointer">
                          {team.name}
                        </Label>
                      </div>
                    ))}
                    {teams.length === 0 && (
                      <div className="text-muted-foreground text-sm p-2">
                        No teams available.
                      </div>
                    )}
                  </ScrollArea>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newUser.active}
                    onCheckedChange={(checked) => setNewUser({...newUser, active: checked})}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} disabled={loading}>
                  {editMode ? "Update User" : "Create User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="teams">
            <UserCheck className="h-4 w-4 mr-2" />
            Teams
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Teams</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{getRoleName(user.role)}</div>
                        </TableCell>
                        <TableCell>
                          {getTeamNames(user.teams) || "No teams"}
                        </TableCell>
                        <TableCell>
                          {user.active ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <X className="h-3 w-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditUserDialog(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No users found. Create your first user.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Roles</CardTitle>
                  <Dialog open={roleDialogOpen} onOpenChange={(open) => {
                    setRoleDialogOpen(open);
                    if (!open) resetRoleForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editMode ? "Edit Role" : "Create New Role"}</DialogTitle>
                        <DialogDescription>
                          {editMode 
                            ? "Update the role details below." 
                            : "Fill in the details to create a new role."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="role-name">Role Name</Label>
                          <Input 
                            id="role-name"
                            value={newRole.name || ""}
                            onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="role-description">Description</Label>
                          <Textarea 
                            id="role-description"
                            value={newRole.description || ""}
                            onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <Label>Permissions</Label>
                          <ScrollArea className="h-48 border rounded-md p-2">
                            {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                              <div key={category} className="mb-4">
                                <h4 className="text-sm font-medium mb-2">{category}</h4>
                                {categoryPermissions.map(permission => (
                                  <div key={permission.id} className="flex items-center space-x-2 py-1">
                                    <Checkbox 
                                      id={`permission-${permission.id}`}
                                      checked={(newRole.permissions || []).includes(permission.id)}
                                      onCheckedChange={() => togglePermission(permission.id)}
                                    />
                                    <div>
                                      <Label htmlFor={`permission-${permission.id}`} className="cursor-pointer">
                                        {permission.name}
                                      </Label>
                                      <p className="text-xs text-muted-foreground">
                                        {permission.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </ScrollArea>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateRole} disabled={loading}>
                          {editMode ? "Update Role" : "Create Role"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>Define user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {roles.map(role => (
                      <Card key={role.id} className="overflow-hidden">
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{role.name}</CardTitle>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditRoleDialog(role)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteRole(role.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <CardDescription>{role.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3">
                          <div className="text-sm text-muted-foreground">
                            <p className="mb-1 font-medium">Permissions:</p>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.map(permId => {
                                const perm = permissions.find(p => p.id === permId);
                                return perm ? (
                                  <span key={permId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    {perm.name}
                                  </span>
                                ) : null;
                              })}
                              {role.permissions.length === 0 && (
                                <span className="text-xs">No permissions assigned</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {roles.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No roles defined. Create your first role.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Permissions Overview</CardTitle>
                <CardDescription>Available permissions and their usage</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-8">
                    {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                      <div key={category}>
                        <h3 className="text-lg font-medium mb-3">{category}</h3>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[250px]">Permission</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Used by Roles</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {categoryPermissions.map(permission => {
                                const usedByRoles = roles.filter(r => r.permissions.includes(permission.id));
                                return (
                                  <TableRow key={permission.id}>
                                    <TableCell className="font-medium">{permission.name}</TableCell>
                                    <TableCell>{permission.description}</TableCell>
                                    <TableCell>
                                      <div className="flex flex-wrap gap-1">
                                        {usedByRoles.map(role => (
                                          <span key={role.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                            {role.name}
                                          </span>
                                        ))}
                                        {usedByRoles.length === 0 && (
                                          <span className="text-muted-foreground text-sm">Not used</span>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="teams">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Teams</CardTitle>
                  <Dialog open={teamDialogOpen} onOpenChange={(open) => {
                    setTeamDialogOpen(open);
                    if (!open) resetTeamForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editMode ? "Edit Team" : "Create New Team"}</DialogTitle>
                        <DialogDescription>
                          {editMode 
                            ? "Update the team details below." 
                            : "Fill in the details to create a new team."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="team-name">Team Name</Label>
                          <Input 
                            id="team-name"
                            value={newTeam.name || ""}
                            onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="team-description">Description</Label>
                          <Textarea 
                            id="team-description"
                            value={newTeam.description || ""}
                            onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <Label>Team Members</Label>
                          <ScrollArea className="h-48 border rounded-md p-2">
                            {users.map(user => (
                              <div key={user.id} className="flex items-center space-x-2 py-2">
                                <Checkbox 
                                  id={`member-${user.id}`}
                                  checked={(newTeam.members || []).includes(user.id)}
                                  onCheckedChange={() => toggleTeamMember(user.id)}
                                />
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <Label htmlFor={`member-${user.id}`} className="cursor-pointer">
                                      {user.name}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      {getRoleName(user.role)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {users.length === 0 && (
                              <div className="text-muted-foreground text-sm p-2">
                                No users available.
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateTeam} disabled={loading}>
                          {editMode ? "Update Team" : "Create Team"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>Organize users into teams for easier management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teams.map((team) => {
                        const memberUsers = users.filter(user => team.members.includes(user.id));
                        return (
                          <TableRow key={team.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{team.name}</p>
                                <p className="text-sm text-muted-foreground">{team.description}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex -space-x-2">
                                {memberUsers.slice(0, 3).map(user => (
                                  <Avatar key={user.id} className="border-2 border-background">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                ))}
                                {memberUsers.length > 3 && (
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-medium">
                                    +{memberUsers.length - 3}
                                  </div>
                                )}
                                {memberUsers.length === 0 && (
                                  <span className="text-muted-foreground text-sm">No members</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditTeamDialog(team)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTeam(team.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      
                      {teams.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            No teams found. Create your first team.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Reference</CardTitle>
                <CardDescription>User management information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">User Roles</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Administrator</p>
                          <p className="text-sm text-muted-foreground">Full access to all features and settings.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Settings className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Operator</p>
                          <p className="text-sm text-muted-foreground">Can execute playbooks and manage inventory.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Eye className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Viewer</p>
                          <p className="text-sm text-muted-foreground">Read-only access to playbooks and logs.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Best Practices</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Assign the least privilege necessary for each user</li>
                      <li>Regularly review and audit user permissions</li>
                      <li>Organize users into teams based on job functions</li>
                      <li>Deactivate unused accounts instead of deleting them</li>
                      <li>Enforce strong password policies</li>
                      <li>Consider implementing SSO for enterprise environments</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Security Recommendations</h3>
                    <div className="rounded-md bg-muted p-4 text-sm">
                      <p className="font-medium mb-2">For production environments, consider:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Implementing LDAP/Active Directory integration</li>
                        <li>Setting up multi-factor authentication</li>
                        <li>Configuring SAML/OAuth for SSO capabilities</li>
                        <li>Enabling detailed audit logging for user actions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
