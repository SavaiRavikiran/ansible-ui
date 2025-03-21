
import { Host } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, MoreHorizontal, Terminal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface HostsGridProps {
  hosts: Host[];
  isLoading: boolean;
}

export function HostsGrid({ hosts, isLoading }: HostsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (hosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
        <h3 className="text-lg font-medium">No hosts found</h3>
        <p className="text-muted-foreground">
          No hosts have been added to this group yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hosts.map((host) => {
        // Determine if host is "online" or "offline" (randomly for demo)
        const isOnline = Math.random() > 0.15;
        const ipAddress = host.variables.ansible_host || '192.168.1.1';
        
        return (
          <Card key={host.id} className="border overflow-hidden group hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <CardTitle className="text-lg">{host.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Host</DropdownMenuItem>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Run Playbook</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Delete Host
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{ipAddress}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Groups:</p>
                  <div className="flex flex-wrap gap-1">
                    {host.groups.map((group) => (
                      <Badge key={group} variant="outline">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {Object.keys(host.variables).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Variables:</p>
                    <div className="text-sm max-h-20 overflow-auto">
                      {Object.entries(host.variables).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="font-medium">{key}:</span>
                          <span className="truncate">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" className="text-xs">
                <Server className="h-3 w-3 mr-1" /> Details
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Terminal className="h-3 w-3 mr-1" /> Run Playbook
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
