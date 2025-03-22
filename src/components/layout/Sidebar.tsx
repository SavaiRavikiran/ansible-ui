
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { Server, FileCode, Folder, List, Settings, Home, ChevronLeft, ChevronRight, Code, Activity, History, Building, Wrench, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/playbooks", label: "Playbooks", icon: FileCode },
  { href: "/task-templates", label: "Task Templates", icon: Code },
  { href: "/inventories", label: "Inventories", icon: List },
  { href: "/roles", label: "Roles", icon: Folder },
  { href: "/hosts", label: "Hosts", icon: Server },
  { href: "/export-logs", label: "Export Logs", icon: Download },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  return (
    <div 
      className={cn(
        "border-r border-border h-screen flex flex-col bg-card relative transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("p-4 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && <h1 className="text-xl font-bold">Ansible UI</h1>}
        {collapsed && <Server className="h-6 w-6" />}
        
        {onToggleCollapse && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleCollapse}
            className="absolute right-[-12px] top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-1">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground",
                        collapsed && "justify-center px-2"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </ScrollArea>
      
      <div className={cn("p-4 border-t border-border", collapsed && "text-center")}>
        <div className="text-sm text-muted-foreground">
          {!collapsed ? "Ansible UI v1.0.0" : "v1.0.0"}
        </div>
      </div>
    </div>
  );
}
