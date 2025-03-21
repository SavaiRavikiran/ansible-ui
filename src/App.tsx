
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Playbooks from "./pages/Playbooks";
import Inventories from "./pages/Inventories";
import Roles from "./pages/Roles";
import Hosts from "./pages/Hosts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import TaskTemplates from "./pages/TaskTemplates";
import { ThemeProvider } from "./components/theme-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="ansible-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/playbooks" element={<Playbooks />} />
              <Route path="/inventories" element={<Inventories />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/hosts" element={<Hosts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/task-templates" element={<TaskTemplates />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
