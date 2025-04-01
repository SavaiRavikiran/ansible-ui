
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Progress } from "@/components/ui/progress";

interface SystemStatsProps {
  system: {
    cpu: string;
    memory: string;
    disk: string;
  };
}

export const SystemStats = ({ system }: SystemStatsProps) => {
  // Convert percentage strings to numbers
  const getCpuValue = () => {
    try {
      return parseInt(system.cpu.replace("%", ""));
    } catch (e) {
      return 0;
    }
  };
  
  const getMemoryValue = () => {
    try {
      return parseInt(system.memory.replace("%", ""));
    } catch (e) {
      return 0;
    }
  };
  
  const getDiskValue = () => {
    try {
      return parseInt(system.disk.replace("%", ""));
    } catch (e) {
      return 0;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium">System Stats</CardTitle>
        <HelpTooltip 
          content="Shows the current system resource usage statistics"
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">CPU Usage</span>
            <span className="text-sm font-medium">{system.cpu}</span>
          </div>
          <Progress value={getCpuValue()} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Memory Usage</span>
            <span className="text-sm font-medium">{system.memory}</span>
          </div>
          <Progress value={getMemoryValue()} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Disk Usage</span>
            <span className="text-sm font-medium">{system.disk}</span>
          </div>
          <Progress value={getDiskValue()} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
