
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Host } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Check, MoreHorizontal, X } from "lucide-react";

interface HostsTableProps {
  hosts: Host[];
  isLoading: boolean;
}

export function HostsTable({ hosts, isLoading }: HostsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
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
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Hostname</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Groups</TableHead>
            <TableHead>Variables</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hosts.map((host) => {
            // Determine if host is "online" or "offline" (randomly for demo)
            const isOnline = Math.random() > 0.15;
            const ipAddress = host.variables.ansible_host || '192.168.1.1';
            
            return (
              <TableRow key={host.id}>
                <TableCell>
                  {isOnline ? (
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-xs">Online</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-xs">Offline</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{host.name}</TableCell>
                <TableCell>{ipAddress}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {host.groups.map((group) => (
                      <Badge key={group} variant="outline">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {Object.keys(host.variables).length > 0 ? (
                    <Badge variant="secondary">
                      {Object.keys(host.variables).length} variable{Object.keys(host.variables).length !== 1 ? 's' : ''}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
