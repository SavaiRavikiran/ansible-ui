
import { Home, Book, Server, Users, Settings, FileText, FileSpreadsheet, Layout, CalendarClock, FileOutput, HardDrive, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavLink } from "react-router-dom";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            <NavLink to="/" end>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              )}
            </NavLink>
            <NavLink to="/playbooks">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Book className="mr-2 h-4 w-4" />
                  Playbooks
                </Button>
              )}
            </NavLink>
            <NavLink to="/task-templates">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Layout className="mr-2 h-4 w-4" />
                  Task Templates
                </Button>
              )}
            </NavLink>
            <NavLink to="/inventories">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Inventories
                </Button>
              )}
            </NavLink>
            <NavLink to="/roles">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Roles
                </Button>
              )}
            </NavLink>
            <NavLink to="/hosts">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Server className="mr-2 h-4 w-4" />
                  Hosts
                </Button>
              )}
            </NavLink>
            <NavLink to="/job-scheduler">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Job Scheduler
                </Button>
              )}
            </NavLink>
            <NavLink to="/export-logs">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <FileOutput className="mr-2 h-4 w-4" />
                  Export Logs
                </Button>
              )}
            </NavLink>
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Administration
          </h2>
          <div className="space-y-1">
            <NavLink to="/settings">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
