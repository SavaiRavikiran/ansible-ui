
import { useQuery } from "@tanstack/react-query";
import { fetchHosts, Host, addHost } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Check, Plus, RefreshCw, Server, Trash } from "lucide-react";
import { HostsHeader } from "@/components/hosts/HostsHeader";
import { HostsTable } from "@/components/hosts/HostsTable";
import { HostsGrid } from "@/components/hosts/HostsGrid";
import { HostsStats } from "@/components/hosts/HostsStats";

const Hosts = () => {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const {
    data: hosts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hosts"],
    queryFn: fetchHosts,
  });

  // Group hosts by their groups
  const hostsByGroup = hosts.reduce((acc: Record<string, Host[]>, host) => {
    host.groups.forEach((group) => {
      if (!acc[group]) acc[group] = [];
      acc[group].push(host);
    });
    return acc;
  }, {});

  // Statistics for the dashboard
  const stats = {
    total: hosts.length,
    groups: Object.keys(hostsByGroup).length,
    online: Math.floor(hosts.length * 0.85), // Simulated online count (85%)
    offline: Math.ceil(hosts.length * 0.15), // Simulated offline count (15%)
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Hosts</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load hosts. Please try again later.</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 animate-fade-in">
      <HostsHeader 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        refetch={refetch} 
      />
      
      <HostsStats stats={stats} />
      
      <Tabs defaultValue="all" className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All Hosts</TabsTrigger>
          {Object.keys(hostsByGroup).map((group) => (
            <TabsTrigger key={group} value={group}>
              {group}
              <Badge variant="outline" className="ml-2">
                {hostsByGroup[group].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {viewMode === "table" ? (
            <HostsTable hosts={hosts} isLoading={isLoading} />
          ) : (
            <HostsGrid hosts={hosts} isLoading={isLoading} />
          )}
        </TabsContent>
        
        {Object.entries(hostsByGroup).map(([group, hostsInGroup]) => (
          <TabsContent key={group} value={group} className="mt-4">
            {viewMode === "table" ? (
              <HostsTable hosts={hostsInGroup} isLoading={isLoading} />
            ) : (
              <HostsGrid hosts={hostsInGroup} isLoading={isLoading} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Hosts;
