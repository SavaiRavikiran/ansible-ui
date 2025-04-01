
import React, { useState, useEffect } from "react";
import Dashboard from "@/pages/Dashboard";
import NoAnsibleResources from "./NoAnsibleResources";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// API client functions
const checkAnsibleStatus = async () => {
  const response = await fetch('/api/ansible-status');
  if (!response.ok) {
    throw new Error('Failed to check Ansible status');
  }
  return response.json();
};

const searchAnsibleResources = async (path: string) => {
  const response = await fetch('/api/search-ansible-resources', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customPath: path }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to search for Ansible resources');
  }
  
  return response.json();
};

const createSampleProject = async (path: string) => {
  const response = await fetch('/api/create-sample-project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetDir: path }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create sample project');
  }
  
  return response.json();
};

const DashboardWrapper: React.FC = () => {
  const [hasResources, setHasResources] = useState<boolean | null>(null);
  const [isCheckingResources, setIsCheckingResources] = useState(true);

  const { data: ansibleStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['ansible-status'],
    queryFn: checkAnsibleStatus,
    retry: 1,
    gcTime: 0
  });

  // Monitor the query result and show appropriate toasts
  useEffect(() => {
    if (ansibleStatus && !ansibleStatus.available) {
      toast.warning('Ansible is not installed or not accessible');
    }
  }, [ansibleStatus]);

  // Handle errors for the query
  useEffect(() => {
    const handleQueryError = () => {
      console.error('Error checking Ansible status');
      toast.error('Could not verify Ansible installation');
    };
    
    // If the query has failed, show the error toast
    if (isLoadingStatus === false && !ansibleStatus) {
      handleQueryError();
    }
  }, [ansibleStatus, isLoadingStatus]);

  const searchResourcesMutation = useMutation({
    mutationFn: searchAnsibleResources,
    onSuccess: (data) => {
      if (data.exists && data.hasAnsibleResources) {
        setHasResources(true);
        toast.success('Ansible resources found!');
      } else if (data.exists) {
        setHasResources(false);
        toast.warning('No Ansible resources found in the specified path');
      } else {
        setHasResources(false);
        toast.error('The specified path does not exist');
      }
    },
    onError: (error) => {
      console.error('Error searching for resources:', error);
      toast.error('Failed to search for Ansible resources');
    }
  });

  const createSampleMutation = useMutation({
    mutationFn: createSampleProject,
    onSuccess: (data) => {
      if (data.success) {
        setHasResources(true);
        toast.success(`Sample project created at ${data.path}`);
      } else {
        toast.error('Failed to create sample project');
      }
    },
    onError: (error) => {
      console.error('Error creating sample project:', error);
      toast.error('Failed to create sample project');
    }
  });

  useEffect(() => {
    const checkDefaultPaths = async () => {
      setIsCheckingResources(true);
      try {
        // Use sensible defaults for browser environment
        // We can't directly access environment variables in browser
        const defaultPaths = [
          '/etc/ansible',
          '/home/user/ansible', // Generic user home path as fallback
          '/usr/local/etc/ansible'
        ].filter(Boolean);
        
        for (const path of defaultPaths) {
          if (!path) continue;
          
          try {
            const result = await searchAnsibleResources(path);
            if (result.exists && result.hasAnsibleResources) {
              setHasResources(true);
              return;
            }
          } catch (error) {
            console.warn(`Could not check path ${path}:`, error);
          }
        }
        
        setHasResources(false);
      } catch (error) {
        console.error('Error checking default paths:', error);
        setHasResources(false);
      } finally {
        setIsCheckingResources(false);
      }
    };
    
    checkDefaultPaths();
  }, []);

  const handleSearchPath = async (path: string) => {
    return searchResourcesMutation.mutateAsync(path);
  };

  const handleCreateSample = async (path: string) => {
    return createSampleMutation.mutateAsync(path);
  };

  if (isCheckingResources || isLoadingStatus) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Checking for Ansible resources...</p>
      </div>
    );
  }

  if (hasResources === false) {
    return (
      <NoAnsibleResources 
        onSearchPath={handleSearchPath}
        onCreateSample={handleCreateSample}
      />
    );
  }

  return <Dashboard />;
};

export default DashboardWrapper;
