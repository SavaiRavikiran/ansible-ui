
import { useQuery } from "@tanstack/react-query";
import { fetchHosts } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Hosts() {
  const { data: hosts = [], isLoading } = useQuery({
    queryKey: ['hosts'],
    queryFn: fetchHosts,
  });

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Hosts</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Host
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead>Variables</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hosts.map((host) => (
              <TableRow key={host.id}>
                <TableCell className="font-medium">{host.name}</TableCell>
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
                  <div className="text-sm">
                    {Object.entries(host.variables)
                      .map(([key, value]) => `${key}=${value}`)
                      .join(', ')}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
