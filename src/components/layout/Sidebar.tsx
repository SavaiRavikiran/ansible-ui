
import { Home, Book, Server, Users, Settings, FileText, FileSpreadsheet, Layout, CalendarClock, FileOutput, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavLink } from "react-router-dom";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ className, collapsed = false, onToggleCollapse }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      {onToggleCollapse && (
        <div className="flex justify-end p-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
      )}
      
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className={cn("mb-2 px-4 text-lg font-semibold tracking-tight", collapsed && "hidden")}>
            Navigation
          </h2>
          <div className="space-y-1">
            <NavLink to="/" end>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
                >
                  <Home className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                  {!collapsed && <span>Dashboard</span>}
                </Button>
              )}
            </NavLink>
            <NavLink to="/playbooks">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
                >
                  <Book className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                  {!collapsed && <span>Playbooks</span>}
                </Button>
              )}
            </NavLink>
            <NavLink to="/task-templates">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
                >
                  <Layout className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                  {!collapsed && <span>Task Templates</span>}
                </Button>
              )}
            </NavLink>
            <NavLink to="/inventories">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
                >
                  <FileSpreadsheet className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                  {!collapsed && <span>Inventories</span>}
                </Button>
              )}
            </NavLink>
            <NavLink to="/roles">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
                >
                  <FileText className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                  {!collapsed && <span>Roles</span>}
                </Button>
              )}
            </NavLink>
            <NavLink to="/hosts">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
                >
                  <Server className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                  {!collapsed && <span>Hosts</span>}
                </Button>
              )}
            </NavLink>
            <NavLink to="/job-scheduler">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
                >
                  <CalendarClock className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                  {!collapsed && <span>Job Scheduler</span>}
                </Button>
              )}
            </NavLink>
            <NavLink to="/export-logs">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
                >
                  <FileOutput className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                  {!collapsed && <span>Export Logs</span>}
                </Button>
              )}
            </NavLink>
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className={cn("mb-2 px-4 text-lg font-semibold tracking-tight", collapsed && "hidden")}>
            Administration
          </h2>
          <div className="space-y-1">
            <NavLink to="/settings">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
                >
                  <Settings className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                  {!collapsed && <span>Settings</span>}
                </Button>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
