
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
import TaskTemplates from "./pages/TaskTemplates";
import ExportLogs from "./pages/ExportLogs";
import JobScheduler from "./pages/JobScheduler";
import ConfigEditor from "./pages/ConfigEditor";
import Variables from "./pages/Variables";
import FileManager from "./pages/FileManager";
import UserManagement from "./pages/UserManagement";
import SecretsVault from "./pages/SecretsVault";
import CloudInventory from "./pages/CloudInventory";
import Notifications from "./pages/Notifications";
import Backup from "./pages/Backup";
import NotFound from "./pages/NotFound";
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
              <Route path="/task-templates" element={<TaskTemplates />} />
              <Route path="/inventories" element={<Inventories />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/hosts" element={<Hosts />} />
              <Route path="/variables" element={<Variables />} />
              <Route path="/files" element={<FileManager />} />
              <Route path="/config-editor" element={<ConfigEditor />} />
              <Route path="/job-scheduler" element={<JobScheduler />} />
              <Route path="/export-logs" element={<ExportLogs />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/secrets" element={<SecretsVault />} />
              <Route path="/cloud-inventory" element={<CloudInventory />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/backup" element={<Backup />} />
              <Route path="/settings" element={<Settings />} />
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
