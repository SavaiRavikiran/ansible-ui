
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, FolderSearch, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import DocDrawer from "../DocDrawer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface NoAnsibleResourcesProps {
  onSearchPath: (path: string) => Promise<void>;
  onCreateSample: (path: string) => Promise<void>;
}

const NoAnsibleResources: React.FC<NoAnsibleResourcesProps> = ({ 
  onSearchPath, 
  onCreateSample 
}) => {
  const [customPath, setCustomPath] = useState("");
  const [samplePath, setSamplePath] = useState("/home/ansible/sample-project");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = async () => {
    if (!customPath) {
      toast.error("Please enter a valid path");
      return;
    }

    setIsSearching(true);
    try {
      await onSearchPath(customPath);
    } catch (error) {
      console.error("Error searching path:", error);
      toast.error("Failed to search for Ansible resources");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateSample = async () => {
    if (!samplePath) {
      toast.error("Please enter a valid path");
      return;
    }

    setIsCreating(true);
    try {
      await onCreateSample(samplePath);
      toast.success("Sample Ansible project created successfully");
    } catch (error) {
      console.error("Error creating sample project:", error);
      toast.error("Failed to create sample Ansible project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">No Ansible Resources Found</h2>
        <DocDrawer 
          title="Learning Ansible" 
          description="A guide to getting started with Ansible"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">What is Ansible?</h3>
            <p>
              Ansible is an open-source automation tool that simplifies configuration management, 
              application deployment, task automation, and orchestration. It uses a simple YAML 
              syntax called playbooks to describe automation jobs.
            </p>
            
            <h3 className="text-lg font-semibold">Key Ansible Components</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Playbooks</strong>: YAML files containing automation tasks
              </li>
              <li>
                <strong>Inventories</strong>: Lists of managed hosts grouped logically
              </li>
              <li>
                <strong>Roles</strong>: Reusable units of playbooks and related files
              </li>
              <li>
                <strong>Modules</strong>: Units of code that Ansible executes
              </li>
            </ul>
            
            <h3 className="text-lg font-semibold">Getting Started</h3>
            <p>
              To start using Ansible, you need:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Ansible installed on your control node</li>
              <li>SSH access to your managed nodes</li>
              <li>An inventory file defining your managed nodes</li>
              <li>Playbooks to define what you want to automate</li>
            </ol>
            
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <a 
                  href="https://docs.ansible.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Official Ansible Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://www.ansible.com/resources/get-started" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Ansible Get Started Guide
                </a>
              </li>
            </ul>
          </div>
        </DocDrawer>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderSearch className="h-5 w-5" />
              Search for Ansible Resources
            </CardTitle>
            <CardDescription>
              Specify a custom path where your Ansible resources might be located
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-path">Custom Path</Label>
                <div className="flex space-x-2">
                  <Input
                    id="custom-path"
                    placeholder="/path/to/ansible/resources"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter the full path to your Ansible directory
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="w-full"
            >
              {isSearching ? "Searching..." : "Search Path"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Create Sample Project
            </CardTitle>
            <CardDescription>
              Create a sample Ansible project with example playbooks and inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sample-path">Target Directory</Label>
                <Input
                  id="sample-path"
                  placeholder="/path/to/create/sample"
                  value={samplePath}
                  onChange={(e) => setSamplePath(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Where to create the sample Ansible project
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Create Sample Project</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Sample Ansible Project</DialogTitle>
                  <DialogDescription>
                    This will create a basic Ansible project structure with example files.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="rounded-md bg-amber-50 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">
                          What will be created:
                        </h3>
                        <div className="mt-2 text-sm text-amber-700 space-y-1">
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Sample playbook with documentation</li>
                            <li>Inventory file with example hosts</li>
                            <li>Basic role structure</li>
                            <li>ansible.cfg configuration file</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {}}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateSample}
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default NoAnsibleResources;
