
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw, Download, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion } from "framer-motion";
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
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated log generation
  useEffect(() => {
    if (!isRunning) return;
    
    const logMessages = [
      `PLAY [${playbook.name}] ******************************************************************`,
      "TASK [Gathering Facts] ******************************************************************",
      "ok: [server1.example.com]",
      "ok: [server2.example.com]",
      `TASK [Run ${playbook.name}] *************************************************************`,
      "changed: [server1.example.com]",
      "changed: [server2.example.com]",
      "TASK [Restart services] *****************************************************************",
      "ok: [server1.example.com]",
    ];
    
    let index = 0;
    
    logIntervalRef.current = setInterval(() => {
      if (index < logMessages.length) {
        setLogs(prev => [...prev, logMessages[index]]);
        index++;
      } else {
        clearInterval(logIntervalRef.current as NodeJS.Timeout);
        
        // Randomly decide if the playbook succeeds or fails for demonstration
        const result = Math.random() > 0.3 ? 'success' : 'failed';
        
        if (result === 'success') {
          setLogs(prev => [
            ...prev, 
            "PLAY RECAP **************************************************************************",
            "server1.example.com : ok=3 changed=1 unreachable=0 failed=0 skipped=0 rescued=0 ignored=0",
            "server2.example.com : ok=3 changed=1 unreachable=0 failed=0 skipped=0 rescued=0 ignored=0"
          ]);
          setStatus('success');
        } else {
          setLogs(prev => [
            ...prev,
            "TASK [Verify deployment] **************************************************************",
            "fatal: [server2.example.com]: FAILED! => {\"changed\": false, \"msg\": \"Connection timed out\"}",
            "PLAY RECAP **************************************************************************",
            "server1.example.com : ok=3 changed=1 unreachable=0 failed=0 skipped=0 rescued=0 ignored=0",
            "server2.example.com : ok=2 changed=1 unreachable=0 failed=1 skipped=0 rescued=0 ignored=0"
          ]);
          setStatus('failed');
        }
        
        setIsRunning(false);
      }
    }, 800);
    
    return () => {
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    };
  }, [isRunning, playbook.name]);
  
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
      // In a real implementation, we would call the API to re-run the playbook
      // For now, we'll just simulate it
      toast.success(`Rerunning playbook ${playbook.name}`);
    } catch (error) {
      toast.error("Failed to rerun playbook");
      console.error(error);
    }
  };
  
  const handleDownloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playbook.name}-execution-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Logs downloaded successfully");
  };

  return (
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
            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs rounded-full">
              Success
            </span>
          )}
          {status === 'failed' && (
            <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs rounded-full">
              Failed
            </span>
          )}
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
      
      <ScrollArea className="h-[400px] border rounded-md bg-black text-green-400 font-mono text-sm p-2" ref={scrollAreaRef}>
        {logs.map((log, index) => (
          <div key={index} className="py-1 whitespace-pre-wrap">
            {log}
          </div>
        ))}
        {isRunning && (
          <motion.div 
            className="inline-block animate-pulse"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            _
          </motion.div>
        )}
      </ScrollArea>
      
      <div className="mt-4 flex justify-end gap-2">
        {status === 'failed' && (
          <Button onClick={handleRerun} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Rerun Playbook
          </Button>
        )}
      </div>
    </motion.div>
  );
}
