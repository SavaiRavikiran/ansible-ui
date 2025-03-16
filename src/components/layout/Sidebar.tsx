
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { Server, FileCode, Folder, List, Settings, Home } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/playbooks", label: "Playbooks", icon: FileCode },
  { href: "/inventories", label: "Inventories", icon: List },
  { href: "/roles", label: "Roles", icon: Folder },
  { href: "/hosts", label: "Hosts", icon: Server },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold">Ansible UI</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Ansible UI v1.0.0
        </div>
      </div>
    </div>
  );
}
