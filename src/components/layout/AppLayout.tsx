
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div 
        className={cn(
          "hidden md:flex transition-all duration-300", 
          sidebarCollapsed ? "md:w-20" : "md:w-64"
        )}
      >
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden fixed left-4 top-4 z-40">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar collapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 pb-8 pt-16 md:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
