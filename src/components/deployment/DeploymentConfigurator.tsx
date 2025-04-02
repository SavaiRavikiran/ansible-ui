
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { 
  DeploymentConfig, 
  deploymentTemplates,
  saveDeploymentConfig,
  generateDeploymentYaml,
  testDeploymentConfig
} from "@/lib/deployment-service";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Copy, Download, Server, Cloud, CloudUpload } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  deploymentType: z.enum(["docker", "kubernetes", "helm", "custom"]),
  clusterUrl: z.string().optional(),
  customDomain: z.string().optional(),
  sslEnabled: z.boolean().default(false),
  resources: z.object({
    cpu: z.string(),
    memory: z.string(),
    storage: z.string(),
  }),
  environmentVariables: z.record(z.string(), z.string()),
});

type FormValues = z.infer<typeof formSchema>;

export function DeploymentConfigurator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [deploymentYaml, setDeploymentYaml] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("config");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Ansible UI",
      description: "Ansible UI deployment",
      deploymentType: "docker",
      sslEnabled: false,
      resources: {
        cpu: "0.5",
        memory: "512Mi",
        storage: "1Gi",
      },
      environmentVariables: {
        NODE_ENV: "production",
        PORT: "3001",
      },
    },
  });
  
  const deploymentType = form.watch("deploymentType");
  
  // Load template
  const loadTemplate = (templateId: string) => {
    const template = deploymentTemplates.find((t) => t.id === templateId);
    if (!template) return;
    
    form.reset({
      name: template.name,
      description: template.description,
      deploymentType: template.deploymentType,
      clusterUrl: template.clusterUrl,
      customDomain: template.customDomain,
      sslEnabled: template.sslEnabled,
      resources: template.resources,
      environmentVariables: template.environmentVariables,
    });
    
    setSelectedTemplate(templateId);
  };
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSaving(true);
      
      const config: DeploymentConfig = {
        id: `custom-${Math.random().toString(36).substring(2, 10)}`,
        ...values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await saveDeploymentConfig(config);
      
      // Generate YAML
      const yaml = await generateDeploymentYaml(config);
      setDeploymentYaml(yaml);
      
      setCurrentTab("yaml");
    } catch (error) {
      console.error("Failed to save configuration:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Test configuration
  const testConfig = async () => {
    try {
      setIsTesting(true);
      
      const values = form.getValues();
      const config: DeploymentConfig = {
        id: `test-${Math.random().toString(36).substring(2, 10)}`,
        ...values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const result = await testDeploymentConfig(config);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Test failed:", error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };
  
  // Copy YAML to clipboard
  const copyYamlToClipboard = () => {
    if (!deploymentYaml) return;
    
    navigator.clipboard.writeText(deploymentYaml)
      .then(() => toast.success("YAML copied to clipboard"))
      .catch((error) => toast.error(`Failed to copy: ${error.message}`));
  };
  
  // Download YAML
  const downloadYaml = () => {
    if (!deploymentYaml) return;
    
    const blob = new Blob([deploymentYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ansible-ui-${form.getValues().deploymentType}-config.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Add environment variable
  const addEnvironmentVariable = () => {
    const currentVars = form.getValues().environmentVariables;
    form.setValue("environmentVariables", {
      ...currentVars,
      ["NEW_VAR"]: "",
    });
  };
  
  // Remove environment variable
  const removeEnvironmentVariable = (key: string) => {
    const currentVars = { ...form.getValues().environmentVariables };
    delete currentVars[key];
    form.setValue("environmentVariables", currentVars);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Deployment Configuration</h2>
        
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                Load Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deployment Templates</DialogTitle>
                <DialogDescription>
                  Choose a deployment template to get started quickly
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {deploymentTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer hover:border-primary transition-colors ${selectedTemplate === template.id ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => loadTemplate(template.id)}
                  >
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center">
                          {template.deploymentType === 'docker' && <Server className="h-4 w-4 mr-2" />}
                          {template.deploymentType === 'kubernetes' && <Cloud className="h-4 w-4 mr-2" />}
                          {template.deploymentType === 'helm' && <CloudUpload className="h-4 w-4 mr-2" />}
                          {template.name}
                        </CardTitle>
                        <Badge>{template.deploymentType}</Badge>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    {selectedTemplate === template.id && (
                      <CardFooter className="pt-0 pb-4">
                        <Check className="h-4 w-4 text-primary mr-2" />
                        <span className="text-primary text-sm">Selected</span>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={() => {}} 
                  variant="outline"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button onClick={testConfig} disabled={isTesting}>
            {isTesting ? "Testing..." : "Test Config"}
          </Button>
        </div>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="yaml" disabled={!deploymentYaml}>
            Generated YAML
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="p-0 mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    General information about your deployment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          A name for this deployment configuration
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          A brief description of this deployment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deploymentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deployment Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select deployment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="docker">Docker</SelectItem>
                            <SelectItem value="kubernetes">Kubernetes</SelectItem>
                            <SelectItem value="helm">Helm Chart</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How you want to deploy Ansible UI
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {(deploymentType === 'kubernetes' || deploymentType === 'helm') && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cluster Configuration</CardTitle>
                    <CardDescription>
                      Configure your Kubernetes or Helm deployment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="clusterUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cluster URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://your-cluster-api" />
                          </FormControl>
                          <FormDescription>
                            The URL of your Kubernetes cluster
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Access Configuration</CardTitle>
                  <CardDescription>
                    Configure how users will access your deployment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customDomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Domain (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ansible.yourdomain.com" />
                        </FormControl>
                        <FormDescription>
                          A custom domain to access your Ansible UI
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sslEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Enable SSL/TLS
                          </FormLabel>
                          <FormDescription>
                            Use HTTPS for secure connections
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                  <CardDescription>
                    Configure the resources for your deployment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="resources.cpu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPU</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0.5" />
                        </FormControl>
                        <FormDescription>
                          CPU allocation (e.g., 0.5, 1, 2)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="resources.memory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Memory</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="512Mi" />
                        </FormControl>
                        <FormDescription>
                          Memory allocation (e.g., 512Mi, 1Gi, 2Gi)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="resources.storage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1Gi" />
                        </FormControl>
                        <FormDescription>
                          Storage allocation for persistent data (e.g., 1Gi, 5Gi, 10Gi)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Environment Variables</CardTitle>
                      <CardDescription>
                        Configure environment variables for your deployment
                      </CardDescription>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addEnvironmentVariable}
                    >
                      Add Variable
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(form.getValues().environmentVariables || {}).map(([key, _]) => (
                      <div key={key} className="flex gap-4 items-end">
                        <FormItem className="flex-1">
                          <FormLabel>Key</FormLabel>
                          <FormControl>
                            <Input 
                              value={key} 
                              onChange={(e) => {
                                const newKey = e.target.value;
                                const currentVars = { ...form.getValues().environmentVariables };
                                const value = currentVars[key];
                                delete currentVars[key];
                                form.setValue("environmentVariables", {
                                  ...currentVars,
                                  [newKey]: value,
                                });
                              }} 
                            />
                          </FormControl>
                        </FormItem>
                        <FormField
                          control={form.control}
                          name={`environmentVariables.${key}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          className="mb-0.5"
                          onClick={() => removeEnvironmentVariable(key)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Generating Configuration..." : "Generate Deployment Configuration"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Configuration Generated</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your deployment configuration has been generated successfully. You can now view the YAML.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction onClick={() => setCurrentTab("yaml")}>
                        View YAML
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="yaml" className="p-0 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Generated YAML</CardTitle>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={copyYamlToClipboard}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Copy to clipboard
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={downloadYaml}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Download YAML
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <CardDescription>
                Use this YAML to deploy Ansible UI to your environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="font-mono h-[500px]"
                value={deploymentYaml || ""}
                readOnly
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentTab("config")}>
                Back to Configuration
              </Button>
              <Button onClick={downloadYaml}>
                Download Configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DeploymentConfigurator;
