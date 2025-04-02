
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw, Download, XCircle, CheckCircle, AlertCircle, Terminal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { executePlaybook } from "@/lib/api";

interface PlaybookExecutionLogsProps {
  playbook: {
    id: string;
    name: string;
  };
  inventoryId: string;
  onClose: () => void;
}

export function PlaybookExecutionLogs({ playbook, inventoryId, onClose }: PlaybookExecutionLogsProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [status, setStatus] = useState<'running' | 'success' | 'failed'>('running');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionStartTime, setExecutionStartTime] = useState<Date>(new Date());
  const [executionEndTime, setExecutionEndTime] = useState<Date | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [pollingRetryCount, setPollingRetryCount] = useState<number>(0);
  const [hasAnsibleError, setHasAnsibleError] = useState<boolean>(false);
  const MAX_RETRY_ATTEMPTS = 120; // Increase to 2 minutes worth of retries

  // Execute the playbook and get real logs
  useEffect(() => {
    if (!isRunning) return;
    
    // Record start time when execution begins
    setExecutionStartTime(new Date());
    setExecutionEndTime(null);
    setConnectionError(false);
    setPollingRetryCount(0);
    setHasAnsibleError(false);
    
    const runPlaybook = async () => {
      try {
        setLogs([`Executing playbook ${playbook.name} with inventory ID ${inventoryId}...`]);
        
        // Call the API to execute the playbook
        const result = await executePlaybook(playbook.id, inventoryId);
        console.log("Playbook execution started with ID:", result.id);
        setExecutionId(result.id);
        
        // Start polling for logs
        pollForLogs(result.id);
      } catch (error) {
        console.error("Error executing playbook:", error);
        setLogs(prev => [...prev, 
          "Error: Failed to execute playbook. Check server logs for details.",
          "Make sure the ansible-playbook command is available on your system.",
          "You can try running the playbook from the command line to verify if it works.",
          "Command to try manually: ansible-playbook --become -i <inventory-path> <playbook-path>"
        ]);
        setStatus('failed');
        setIsRunning(false);
        setExecutionEndTime(new Date());
        setHasAnsibleError(true);
      }
    };
    
    runPlaybook();
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isRunning, playbook, inventoryId]);
  
  // Poll for logs from the server
  const pollForLogs = (execId: string) => {
    // Clear any existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/playbook-logs/${execId}`);
        
        if (!response.ok) {
          console.error(`Error fetching logs: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch logs: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Reset connection error flag if we received a successful response
        if (connectionError) {
          setConnectionError(false);
          setPollingRetryCount(0);
        }
        
        // Update logs if we have them
        if (Array.isArray(data.logs) && data.logs.length > 0) {
          setLogs(data.logs);
        }
        
        // Check if the execution is complete
        if (data.status && data.status !== 'running') {
          setStatus(data.status as 'success' | 'failed');
          setIsRunning(false);
          setExecutionEndTime(new Date());
          clearInterval(interval);
          setPollingInterval(null);
          
          // Check if there are any error messages in the logs
          const errorIndicators = ['fatal', 'failed=', 'ERROR!', 'error:', 'permission denied'];
          const hasErrors = data.logs.some(log => 
            errorIndicators.some(indicator => 
              log.toLowerCase().includes(indicator) && 
              !log.includes('failed=0')
            )
          );
          
          if (hasErrors || data.status === 'failed') {
            setHasAnsibleError(true);
            // Add helpful information for debugging
            setLogs(prev => [...prev, 
              "Note: This playbook may require elevated permissions.",
              "Try running it manually with: ansible-playbook --become -i <inventory-path> <playbook-path>",
              "Make sure the paths in your playbook are accessible to the user running Ansible UI."
            ]);
          }
        }
      } catch (error) {
        console.error("Error polling for logs:", error);
        
        // Track connection errors and attempts
        setConnectionError(true);
        setPollingRetryCount(prev => prev + 1);
        
        // If we've hit the retry limit, stop polling and report an error
        if (pollingRetryCount >= MAX_RETRY_ATTEMPTS) {
          setLogs(prev => [...prev, 
            "Error: Connection lost while retrieving logs. Please check server status.",
            "The playbook may still be running in the background.",
            "If this is a permission issue, try running the playbook with elevated permissions."
          ]);
          setStatus('failed');
          setIsRunning(false);
          setExecutionEndTime(new Date());
          clearInterval(interval);
          setPollingInterval(null);
          setHasAnsibleError(true);
        }
      }
    }, 1000); // Poll every 1 second
    
    setPollingInterval(interval);
  };
  
  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs]);
  
  const handleRerun = async () => {
    setLogs([`Rerunning playbook ${playbook.name}...`]);
    setIsRunning(true);
    setStatus('running');
    
    try {
      toast.success(`Rerunning playbook ${playbook.name}`);
    } catch (error) {
      toast.error("Failed to rerun playbook");
      console.error(error);
    }
  };
  
  const handleDownloadLogs = () => {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const content = `
====================================
Playbook: ${playbook.name}
Execution Start: ${executionStartTime.toLocaleString()}
Execution End: ${executionEndTime ? executionEndTime.toLocaleString() : 'In Progress'}
Status: ${status.toUpperCase()}
====================================

${logs.join('\n')}
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playbook.name}-execution-logs-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Logs downloaded successfully");
  };

  // Calculate execution time
  const getExecutionTime = () => {
    if (!executionEndTime) {
      const now = new Date();
      const diffMs = now.getTime() - executionStartTime.getTime();
      return formatDuration(diffMs);
    }
    
    const diffMs = executionEndTime.getTime() - executionStartTime.getTime();
    return formatDuration(diffMs);
  };
  
  // Format duration in milliseconds to readable format
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format log line with appropriate styling
  const formatLogLine = (line: string) => {
    if (line.includes("FAILED") || line.includes("fatal") || line.includes("failed=") && !line.includes("failed=0") || line.includes("ERROR!")) {
      return <span className="text-red-400">{line}</span>;
    } else if (line.includes("ok:")) {
      return <span className="text-green-400">{line}</span>;
    } else if (line.includes("changed:") || line.includes("changed=") && !line.includes("changed=0")) {
      return <span className="text-yellow-400">{line}</span>;
    } else if (line.includes("PLAY") || line.includes("TASK") || line.includes("RECAP")) {
      return <span className="text-blue-400 font-bold">{line}</span>;
    } else if (line.includes("Error:") || line.includes("error:")) {
      return <span className="text-red-400 font-bold">{line}</span>;
    } else if (line.includes("Note:")) {
      return <span className="text-amber-400 font-bold">{line}</span>;
    } else {
      return line;
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="bg-background border rounded-lg shadow-lg p-4 w-full max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Execution Logs: {playbook.name}</h3>
            {isRunning && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="h-4 w-4 text-primary" />
              </motion.div>
            )}
            {status === 'success' && (
              <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Success
              </span>
            )}
            {status === 'failed' && (
              <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs rounded-full flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Failed
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-2">
              Runtime: {getExecutionTime()}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadLogs} title="Download logs">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} title="Close">
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[400px] border rounded-md bg-black/5 dark:bg-black text-green-400 font-mono text-sm p-2" ref={scrollAreaRef}>
          {logs.length === 0 && isRunning && (
            <div className="py-2">Waiting for logs...</div>
          )}
          {logs.map((log, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="py-1 whitespace-pre-wrap"
            >
              {formatLogLine(log)}
            </motion.div>
          ))}
          {isRunning && (
            <motion.div 
              className="inline-block"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              _
            </motion.div>
          )}
        </ScrollArea>
        
        <div className="mt-4 flex justify-between">
          <div>
            {hasAnsibleError && (
              <div className="text-amber-500 text-sm">
                <Terminal className="h-4 w-4 inline-block mr-1" />
                <span>This may be a permissions issue. Try running with <code className="bg-black/10 dark:bg-white/10 p-1 rounded">--become</code> flag.</span>
              </div>
            )}
            {connectionError && isRunning && (
              <div className="text-amber-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Reconnecting... ({pollingRetryCount}/{MAX_RETRY_ATTEMPTS})
              </div>
            )}
          </div>
          <div>
            {(status === 'failed' || !isRunning) && (
              <Button onClick={handleRerun} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Rerun Playbook
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
