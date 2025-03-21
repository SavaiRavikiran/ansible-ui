
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Server, ServerCrash, Users } from "lucide-react";

interface HostsStatsProps {
  stats: {
    total: number;
    groups: number;
    online: number;
    offline: number;
  };
}

export function HostsStats({ stats }: HostsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hosts</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Hosts managed by Ansible
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Host Groups</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.groups}</div>
          <p className="text-xs text-muted-foreground">
            Logical groupings of hosts
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Online</CardTitle>
          <Check className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.online}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 ? `${Math.round((stats.online / stats.total) * 100)}% of total hosts` : "No hosts available"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Offline</CardTitle>
          <ServerCrash className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.offline}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 ? `${Math.round((stats.offline / stats.total) * 100)}% of total hosts` : "No hosts available"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
