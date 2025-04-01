
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaybookRun } from "@/lib/api";
import { HelpTooltip } from "@/components/HelpTooltip";

interface RecentActivityProps {
  recentRuns: PlaybookRun[];
}

export const RecentActivity = ({ recentRuns }: RecentActivityProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium">Recent Activity</CardTitle>
        <HelpTooltip 
          content="Shows the most recent Ansible playbook runs and their status"
        />
      </CardHeader>
      <CardContent>
        {recentRuns && recentRuns.length > 0 ? (
          <div className="space-y-4">
            {recentRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    run.status === "success" 
                      ? "bg-green-500" 
                      : run.status === "running" 
                      ? "bg-blue-500"
                      : "bg-red-500"
                  }`}></div>
                  <div>
                    <h3 className="text-sm font-medium">{run.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    run.status === "success" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : run.status === "running" 
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No recent playbook runs found
          </div>
        )}
      </CardContent>
    </Card>
  );
};
