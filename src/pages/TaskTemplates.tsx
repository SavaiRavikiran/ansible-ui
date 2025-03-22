
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Clock, Code, Play, Plus, Settings, Edit, Copy, FileCheck, TerminalSquare, Workflow } from "lucide-react";
import { motion } from "framer-motion";

// Mock template data
const mockTemplates = [
  {
    id: "1",
    name: "Deploy Web Application",
    description: "Deploy the web application to production servers",
    type: "deploy",
    content: "---\n- name: Deploy Web Application\n  hosts: web_servers\n  tasks:\n    - name: Pull latest code\n      git:\n        repo: https://github.com/company/webapp\n        dest: /var/www/html\n\n    - name: Restart web service\n      service:\n        name: nginx\n        state: restarted",
    lastRun: "2023-09-15T14:30:00Z",
    status: "success",
    runs: 24
  },
  {
    id: "2",
    name: "Build Frontend Assets",
    description: "Build and minify frontend assets for production",
    type: "build",
    content: "---\n- name: Build Frontend\n  hosts: build_servers\n  tasks:\n    - name: Install dependencies\n      npm:\n        path: /var/repo/frontend\n        state: present\n\n    - name: Build assets\n      command:\n        cmd: npm run build\n        chdir: /var/repo/frontend",
    lastRun: "2023-09-10T11:20:00Z",
    status: "failed",
    runs: 18
  },
  {
    id: "3",
    name: "Database Backup",
    description: "Create a backup of the production database",
    type: "backup",
    content: "---\n- name: Backup Database\n  hosts: db_servers\n  tasks:\n    - name: Create backup directory\n      file:\n        path: /var/backups/db\n        state: directory\n\n    - name: Run pg_dump\n      command:\n        cmd: pg_dump -U postgres -F c main_db > /var/backups/db/main_db_$(date +%Y%m%d).dump",
    lastRun: "2023-09-14T23:00:00Z",
    status: "success",
    runs: 56
  },
];

export default function TaskTemplates() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    type: "deploy",
    content: "---\n# New Task Template\n- name: My Task\n  hosts: all\n  tasks:\n    - name: Example Task\n      debug:\n        msg: \"Hello from Task Template\"",
  });

  // Filter templates based on active tab and search query
  const filteredTemplates = mockTemplates.filter(template => {
    const matchesTab = activeTab === "all" || template.type === activeTab;
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateTemplate = () => {
    // In a real app, we would send this to the API
    toast.success("Template created successfully");
    setIsCreateDialogOpen(false);
    
    // Reset form for next use
    setNewTemplate({
      name: "",
      description: "",
      type: "deploy",
      content: "---\n# New Task Template\n- name: My Task\n  hosts: all\n  tasks:\n    - name: Example Task\n      debug:\n        msg: \"Hello from Task Template\"",
    });
  };
  
  const handleRunTemplate = (templateId: string, templateName: string) => {
    toast.success(`Running template: ${templateName}`);
  };
  
  const handleDuplicateTemplate = (templateId: string, templateName: string) => {
    toast.success(`Duplicated template: ${templateName}`);
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case "build":
        return <Code className="h-5 w-5 text-blue-500" />;
      case "deploy":
        return <FileCheck className="h-5 w-5 text-green-500" />;
      case "backup":
        return <TerminalSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <Workflow className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Task Templates</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter template name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter template description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={newTemplate.type} 
                  onValueChange={(value) => setNewTemplate({...newTemplate, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="build">Build</SelectItem>
                    <SelectItem value="deploy">Deploy</SelectItem>
                    <SelectItem value="backup">Backup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Template Content</Label>
                <Textarea
                  id="content"
                  className="font-mono h-[300px]"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="build">Build</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No templates found. Create a new template to get started.
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTemplateIcon(template.type)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      template.status === 'success' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {template.status}
                    </span>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="border rounded p-2 bg-black/5 dark:bg-white/5 text-xs font-mono h-20 overflow-hidden">
                    {template.content.split('\n').slice(0, 3).join('\n')}
                    {template.content.split('\n').length > 3 && '...'}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Last run: {new Date(template.lastRun).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{template.runs} runs</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleDuplicateTemplate(template.id, template.name)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleRunTemplate(template.id, template.name)}>
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
