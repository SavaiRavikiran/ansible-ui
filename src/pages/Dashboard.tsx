import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getRecentRuns,
  getSystemInfo,
} from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { RecentActivity } from "@/components/RecentActivity";
import { SystemStats } from "@/components/SystemStats";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpTooltip } from "@/components/HelpTooltip";
import DocDrawer from "@/components/DocDrawer";

const Dashboard = () => {
  const {
    data: dashboardStats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    retry: 1,
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 60000); // Refetch every 60 seconds

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-24" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !dashboardStats) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">
          Failed to load dashboard data.
        </h2>
        <p className="text-muted-foreground">
          Please check your network connection and try again.
        </p>
        <button
          onClick={refetch}
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 mt-4 hover:bg-primary/80"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <DocDrawer
          title="Dashboard Overview"
          description="Learn about the key metrics and features of the Ansible UI Dashboard"
        >
          <div className="space-y-4">
            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Key Metrics</h3>
              <p>
                The dashboard provides a high-level overview of your Ansible
                environment. Key metrics include:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Playbooks</strong>: Total number of Ansible playbooks
                  available.
                </li>
                <li>
                  <strong>Inventories</strong>: Total number of Ansible
                  inventories configured.
                </li>
                <li>
                  <strong>Roles</strong>: Total number of Ansible roles
                  available.
                </li>
                <li>
                  <strong>Hosts</strong>: Total number of hosts managed by
                  Ansible.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <p>
                The Recent Activity section displays the most recent playbook
                runs, their status, and timestamps.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold">System Stats</h3>
              <p>
                The System Stats section provides real-time information about
                the system's CPU, memory, and disk usage.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold">Resources</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <a
                    href="https://docs.ansible.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Official Ansible Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ansible.com/resources/get-started"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Ansible Get Started Guide
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </DocDrawer>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Playbooks"
          value={dashboardStats.playbooks}
          description="Total number of Ansible playbooks"
        />
        <MetricCard
          title="Inventories"
          value={dashboardStats.inventories}
          description="Total number of Ansible inventories"
        />
        <MetricCard
          title="Roles"
          value={dashboardStats.roles}
          description="Total number of Ansible roles"
        />
        <MetricCard
          title="Hosts"
          value={dashboardStats.hosts}
          description="Total number of hosts managed by Ansible"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-6">
        <RecentActivity recentRuns={dashboardStats.recentRuns} />
        <SystemStats system={dashboardStats.system} />
      </div>
    </div>
  );
};

export default Dashboard;
