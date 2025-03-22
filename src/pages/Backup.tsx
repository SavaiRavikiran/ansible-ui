import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowDown, ArrowUp, Calendar, Download, Upload, Clock, Settings, Trash, RotateCw, 
  AlertCircle, CheckCircle2, Plus, Edit, FileText, HardDrive, Database, Server
} from "lucide-react";

interface BackupJob {
  id: string;
  name: string;
  source: string;
  destination: string;
  schedule: string;
  status: 'active' | 'inactive' | 'failed' | 'completed';
  lastRun: string | null;
  nextRun: string | null;
  progress: number;
  log: string;
}

const Backup = () => {
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null);
  const [newJob, setNewJob] = useState<Partial<BackupJob>>({
    name: "",
    source: "",
    destination: "",
    schedule: "",
    status: "inactive",
    progress: 0,
    log: "",
  });
  const [logs, setLogs] = useState<{[key: string]: string}>({});
  const [showLogs, setShowLogs] = useState<{[key: string]: boolean}>({});
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock Backup Jobs
        const mockBackupJobs: BackupJob[] = [
          {
            id: "1",
            name: "Web Server Backup",
            source: "/var/www/html",
            destination: "s3://backup-bucket/web-server",
            schedule: "0 0 * * *",
            status: "active" as const,
            lastRun: "2023-10-15T00:00:00Z",
            nextRun: "2023-10-16T00:00:00Z",
            progress: 75,
            log: "Backup completed successfully",
          },
          {
            id: "2",
            name: "Database Backup",
            source: "postgres://user:password@host:port/database",
            destination: "gs://backup-bucket/database",
            schedule: "0 6 * * *",
            status: "completed" as const,
            lastRun: "2023-10-15T06:00:00Z",
            nextRun: "2023-10-16T06:00:00Z",
            progress: 100,
            log: "Backup completed successfully",
          },
          {
            id: "3",
            name: "Files Backup",
            source: "/home/user/documents",
            destination: "/mnt/backup/documents",
            schedule: "0 12 * * *",
            status: "failed" as const,
            lastRun: "2023-10-15T12:00:00Z",
            nextRun: "2023-10-16T12:00:00Z",
            progress: 0,
            log: "Backup failed due to insufficient permissions",
          },
          {
            id: "4",
            name: "Important Data Backup",
            source: "/opt/data",
            destination: "sftp://backup-server/data",
            schedule: "0 18 * * *",
            status: "active" as const,
            lastRun: "2023-10-15T18:00:00Z",
            nextRun: "2023-10-16T18:00:00Z",
            progress: 25,
            log: "Backup in progress",
          },
          {
            id: "5",
            name: "Configuration Files Backup",
            source: "/etc",
            destination: "azure://backup-container/config",
            schedule: "0 0 1 * *",
            status: "inactive" as const,
            lastRun: null,
            nextRun: "2023-11-01T00:00:00Z",
            progress: 0,
            log: "Waiting for next scheduled run",
          },
        ];

        setBackupJobs(mockBackupJobs);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching backup jobs:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load backup jobs"
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateJob = async () => {
    if (!newJob.name || !newJob.source || !newJob.destination || !newJob.schedule) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new job
      const newJobData: BackupJob = {
        id: Math.random().toString(36).substring(7),
        name: newJob.name || "",
        source: newJob.source || "",
        destination: newJob.destination || "",
        schedule: newJob.schedule || "",
        status: newJob.status || "inactive",
        lastRun: null,
        nextRun: null,
        progress: 0,
        log: "",
      };

      setBackupJobs([...backupJobs, newJobData]);
      setCreateDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Backup job created successfully"
      });
    } catch (error) {
      console.error("Error creating backup job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create backup job"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJob = async () => {
    if (!selectedJob || !newJob.name || !newJob.source || !newJob.destination || !newJob.schedule) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update job
      const updatedJobs = backupJobs.map(job => {
        if (job.id === selectedJob.id) {
          return {
            ...job,
            name: newJob.name || job.name,
            source: newJob.source || job.source,
            destination: newJob.destination || job.destination,
            schedule: newJob.schedule || job.schedule,
            status: newJob.status || job.status,
          };
        }
        return job;
      });

      setBackupJobs(updatedJobs);
      setEditDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Backup job updated successfully"
      });
    } catch (error) {
      console.error("Error updating backup job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update backup job"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Delete job
      const updatedJobs = backupJobs.filter(job => job.id !== jobId);
      setBackupJobs(updatedJobs);

      toast({
        title: "Success",
        description: "Backup job deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting backup job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete backup job"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunJob = async (jobId: string) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update job status and logs
      const updatedJobs = backupJobs.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            status: "active" as const,
            lastRun: new Date().toISOString(),
            progress: 50,
            log: "Backup job started",
          };
        }
        return job;
      });

      setBackupJobs(updatedJobs);

      toast({
        title: "Success",
        description: "Backup job started successfully"
      });
    } catch (error) {
      console.error("Error running backup job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to run backup job"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update job status and logs
      const updatedJobs = backupJobs.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            status: "inactive" as const,
            progress: 0,
            log: "Backup job cancelled",
          };
        }
        return job;
      });

      setBackupJobs(updatedJobs);

      toast({
        title: "Success",
        description: "Backup job cancelled successfully"
      });
    } catch (error) {
      console.error("Error cancelling backup job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel backup job"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewLog = (jobId: string) => {
    // Simulate fetching logs from an API
    const mockLogs = `
      [2023-10-15 14:00:00] - Backup job started
      [2023-10-15 14:00:05] - Backing up /var/www/html
      [2023-10-15 14:00:10] - Compressing files
      [2023-10-15 14:00:15] - Uploading to s3://backup-bucket/web-server
      [2023-10-15 14:00:20] - Backup completed successfully
    `;

    setLogs({...logs, [jobId]: mockLogs});
    setShowLogs({...showLogs, [jobId]: true});
  };

  const resetForm = () => {
    setNewJob({
      name: "",
      source: "",
      destination: "",
      schedule: "",
      status: "inactive",
      progress: 0,
      log: "",
    });
    setSelectedJob(null);
  };

  const openEditDialog = (job: BackupJob) => {
    setSelectedJob(job);
    setNewJob({
      name: job.name,
      source: job.source,
      destination: job.destination,
      schedule: job.schedule,
      status: job.status,
      progress: job.progress,
      log: job.log,
    });
    setEditDialogOpen(true);
  };

  const toggleJobSelection = (jobId: string) => {
    if (selectedJobs.includes(jobId)) {
      setSelectedJobs(selectedJobs.filter(id => id !== jobId));
    } else {
      setSelectedJobs([...selectedJobs, jobId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(backupJobs.map(job => job.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkDelete = async () => {
    if (selectedJobs.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select jobs to delete"
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Delete selected jobs
      const updatedJobs = backupJobs.filter(job => !selectedJobs.includes(job.id));
      setBackupJobs(updatedJobs);
      setSelectedJobs([]);
      setSelectAll(false);

      toast({
        title: "Success",
        description: `${selectedJobs.length} backup jobs deleted successfully`
      });
    } catch (error) {
      console.error("Error deleting backup jobs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete backup jobs"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <Clock className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Backup Management</h1>
        <div className="flex space-x-2">
          <Button variant="destructive" onClick={handleBulkDelete} disabled={selectedJobs.length === 0}>
            <Trash className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Backup Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Backup Job</DialogTitle>
                <DialogDescription>
                  Define a new backup job to automate data backups.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="job-name">Job Name</Label>
                  <Input
                    id="job-name"
                    placeholder="e.g., Web Server Backup"
                    value={newJob.name || ""}
                    onChange={(e) => setNewJob({...newJob, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    placeholder="e.g., /var/www/html"
                    value={newJob.source || ""}
                    onChange={(e) => setNewJob({...newJob, source: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="e.g., s3://backup-bucket/web-server"
                    value={newJob.destination || ""}
                    onChange={(e) => setNewJob({...newJob, destination: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule (Cron Expression)</Label>
                  <Input
                    id="schedule"
                    placeholder="e.g., 0 0 * * *"
                    value={newJob.schedule || ""}
                    onChange={(e) => setNewJob({...newJob, schedule: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newJob.status} onValueChange={(value) => setNewJob({...newJob, status: value as "active" | "inactive" | "failed" | "completed"})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateJob} disabled={loading}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup Jobs</CardTitle>
          <CardDescription>
            Manage and monitor your backup jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backupJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="w-[50px]">
                      <Checkbox
                        checked={selectedJobs.includes(job.id)}
                        onCheckedChange={() => toggleJobSelection(job.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{job.name}</TableCell>
                    <TableCell>{job.source}</TableCell>
                    <TableCell>{job.destination}</TableCell>
                    <TableCell>{job.schedule}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>{formatTimestamp(job.lastRun)}</TableCell>
                    <TableCell>{formatTimestamp(job.nextRun)}</TableCell>
                    <TableCell>
                      <Progress value={job.progress} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewLog(job.id)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(job)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteJob(job.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {backupJobs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-4">
                      No backup jobs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => console.log("Export to CSV clicked")}>
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Backup Job</DialogTitle>
            <DialogDescription>
              Update the details of the selected backup job.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="job-name">Job Name</Label>
              <Input
                id="job-name"
                placeholder="e.g., Web Server Backup"
                value={newJob.name || ""}
                onChange={(e) => setNewJob({...newJob, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                placeholder="e.g., /var/www/html"
                value={newJob.source || ""}
                onChange={(e) => setNewJob({...newJob, source: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="e.g., s3://backup-bucket/web-server"
                value={newJob.destination || ""}
                onChange={(e) => setNewJob({...newJob, destination: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule (Cron Expression)</Label>
              <Input
                id="schedule"
                placeholder="e.g., 0 0 * * *"
                value={newJob.schedule || ""}
                onChange={(e) => setNewJob({...newJob, schedule: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newJob.status} onValueChange={(value) => setNewJob({...newJob, status: value as "active" | "inactive" | "failed" | "completed"})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateJob} disabled={loading}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {Object.keys(showLogs).map(jobId => (
        showLogs[jobId] && (
          <Dialog key={jobId} open={showLogs[jobId]} onOpenChange={() => setShowLogs({...showLogs, [jobId]: false})}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Backup Job Logs</DialogTitle>
                <DialogDescription>
                  Logs for backup job: {backupJobs.find(job => job.id === jobId)?.name}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <pre className="font-mono text-sm">
                  {logs[jobId]}
                </pre>
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLogs({...showLogs, [jobId]: false})}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      ))}
    </div>
  );
};

export default Backup;
