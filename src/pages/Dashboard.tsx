
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCode, Folder, List, Server, RefreshCw, History, Activity, Settings, Building, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/lib/api";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const StatCard = ({ title, value, icon: Icon, href }: { 
  title: string; 
  value: number | string; 
  icon: React.ElementType;
  href: string;
}) => (
  <Card className="animate-fade-in hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <Button variant="link" className="p-0 h-auto" asChild>
        <Link to={href}>View all</Link>
      </Button>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { toast } = useToast();
  const { 
    data: stats, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error loading dashboard data",
        description: String(error),
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const handleRefresh = async () => {
    toast({
      title: "Refreshing dashboard data",
      description: "Fetching latest data from server",
    });
    await refetch();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            New Runner
          </Button>
          <Button onClick={handleRefresh} className="gap-2 hover:scale-105 transition-transform duration-200">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="h-[140px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Playbooks"
            value={stats?.playbooks || 0}
            icon={FileCode}
            href="/playbooks"
          />
          <StatCard
            title="Inventories"
            value={stats?.inventories || 0}
            icon={List}
            href="/inventories"
          />
          <StatCard
            title="Roles"
            value={stats?.roles || 0} 
            icon={Folder}
            href="/roles"
          />
          <StatCard
            title="Hosts"
            value={stats?.hosts || 0}
            icon={Server} 
            href="/hosts"
          />
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="animate-fade-in transition-all duration-300 hover:shadow-lg md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Playbook Runs</CardTitle>
              <CardDescription>
                View your most recent playbook executions
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded-md animate-pulse" />
                ))}
              </div>
            ) : stats?.recentRuns?.length ? (
              <div className="space-y-2">
                {stats.recentRuns.map((run, i) => (
                  <div key={i} className="flex justify-between items-center p-2 border rounded-md hover:bg-accent transition-colors duration-200">
                    <div className="font-medium truncate max-w-[250px]" title={run.name}>
                      {run.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        {new Date(run.timestamp).toLocaleString()}
                      </div>
                      <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                        run.status === 'success' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {run.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No recent playbook runs
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">History</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isLoading ? (
                <div className="h-20 bg-muted rounded-md animate-pulse" />
              ) : (
                <div className="space-y-1">
                  {['Yesterday', '2 days ago', '3 days ago'].map((date, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>Playbook run #{i+1}</span>
                      <span className="text-muted-foreground">{date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isLoading ? (
                <div className="h-20 bg-muted rounded-md animate-pulse" />
              ) : (
                <div className="space-y-1">
                  {['User login', 'Config change', 'Inventory update'].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{activity}</span>
                      <span className="text-muted-foreground">{i+1}h ago</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Building</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isLoading ? (
                <div className="h-20 bg-muted rounded-md animate-pulse" />
              ) : (
                <div className="space-y-1">
                  {['Frontend', 'Backend', 'Database'].map((component, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{component}</span>
                      <span className="text-green-500">Ready</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Settings</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isLoading ? (
                <div className="h-20 bg-muted rounded-md animate-pulse" />
              ) : (
                <div className="space-y-1">
                  {['System', 'Security', 'Notifications'].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{setting}</span>
                      <Link to="/settings" className="text-blue-500 hover:underline">Configure</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in transition-all duration-300 hover:shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Monitor the health of your Ansible control node
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded-md animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>CPU Usage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                        style={{ width: stats?.system?.cpu || "0%" }} 
                      ></div>
                    </div>
                    <span>{stats?.system?.cpu || "0%"}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Memory Usage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                        style={{ width: stats?.system?.memory || "0%" }} 
                      ></div>
                    </div>
                    <span>{stats?.system?.memory || "0%"}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Disk Usage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                        style={{ width: stats?.system?.disk || "0%" }} 
                      ></div>
                    </div>
                    <span>{stats?.system?.disk || "0%"}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
