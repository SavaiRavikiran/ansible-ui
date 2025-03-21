
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Download, Server, ServerCrash, Upload, Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface HostsStatsProps {
  stats: {
    total: number;
    groups: number;
    online: number;
    offline: number;
  };
}

export function HostsStats({ stats }: HostsStatsProps) {
  const handleExportToLocal = (type: string) => {
    toast({
      title: `Exporting ${type} to local`,
      description: "The data will be saved to your custom path if configured.",
    });
    // This would be implemented to actually export the data
  };

  const handleImportFromLocal = (type: string) => {
    toast({
      title: `Importing ${type} from local`,
      description: "Loading data from your custom path.",
    });
    // This would be implemented to actually import the data
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      }
    })
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="hover-scale transition-all duration-300 hover:shadow-md">
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
          <CardFooter className="flex justify-between p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-xs"
              onClick={() => handleExportToLocal('hosts')}
            >
              <Download className="h-3 w-3 mr-1" /> Export
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-xs"
              onClick={() => handleImportFromLocal('hosts')}
            >
              <Upload className="h-3 w-3 mr-1" /> Import
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="hover-scale transition-all duration-300 hover:shadow-md">
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
          <CardFooter className="flex justify-between p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-xs"
              onClick={() => handleExportToLocal('groups')}
            >
              <Download className="h-3 w-3 mr-1" /> Export
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-xs"
              onClick={() => handleImportFromLocal('groups')}
            >
              <Upload className="h-3 w-3 mr-1" /> Import
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="hover-scale transition-all duration-300 hover:shadow-md">
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
          <CardFooter className="flex justify-center p-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-green-500 h-2.5 rounded-full transition-all duration-1000" 
                style={{ width: `${stats.total > 0 ? Math.round((stats.online / stats.total) * 100) : 0}%` }}
              ></div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="hover-scale transition-all duration-300 hover:shadow-md">
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
          <CardFooter className="flex justify-center p-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-red-500 h-2.5 rounded-full transition-all duration-1000" 
                style={{ width: `${stats.total > 0 ? Math.round((stats.offline / stats.total) * 100) : 0}%` }}
              ></div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
