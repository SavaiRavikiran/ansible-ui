
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Save, RefreshCw, Download, Upload, Clock, FileArchive, MoreHorizontal, 
  ArrowRight, Check, X, Loader2, Calendar, Filter, Play, Cloud, HardDrive,
  Server, FileSpreadsheet, FileText
} from "lucide-react";

interface BackupItem {
  id: string;
  name: string;
  createdAt: string;
  size: string;
  status: 'complete' | 'failed' | 'in_progress';
  type: 'full' | 'playbooks' | 'inventories' | 'configs';
  location: 'local' | 's3' | 'azure';
  path?: string;
  url?: string;
}

interface ScheduledBackup {
  id: string;
  name: string;
  enabled: boolean;
  type: 'full' | 'playbooks' | 'inventories' | 'configs';
  schedule: 'daily' | 'weekly' | 'monthly';
  time: string;
  daysOfWeek?: string[];
  dayOfMonth?: number;
  retention: number;
  destination: 'local' | 's3' | 'azure';
  config: {
    path?: string;
    bucket?: string;
    container?: string;
    [key: string]: any;
  };
  lastRun?: string;
  nextRun?: string;
}

interface RestoreConfig {
  items: string[];
  overwrite: boolean;
}

const Backup = () => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduledBackup[]>([]);
  const [filteredBackups, setFilteredBackups] = useState<BackupItem[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<BackupItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [backupProgress, setBackupProgress] = useState<number | null>(null);
  const [backupType, setBackupType] = useState<string>("full");
  const [backupDestination, setBackupDestination] = useState<string>("local");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [newScheduleDialogOpen, setNewScheduleDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledBackup | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  const [backupConfig, setBackupConfig] = useState({
    s3: {
      bucket: "",
      region: "us-east-1",
      accessKey: "",
      secretKey: "",
    },
    azure: {
      container: "",
      connectionString: "",
    },
    local: {
      path: "/var/backups/ansible",
    }
  });
  
  const [newSchedule, setNewSchedule] = useState<Partial<ScheduledBackup>>({
    name: "",
    enabled: true,
    type: "full",
    schedule: "daily",
    time: "00:00",
    retention: 7,
    destination: "local",
    config: {}
  });
  
  const [restoreConfig, setRestoreConfig] = useState<RestoreConfig>({
    items: ["playbooks", "inventories", "configs", "roles"],
    overwrite: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock Backups
        const mockBackups: BackupItem[] = [
          {
            id: "1",
            name: "full_backup_20231015_083000",
            createdAt: "2023-10-15T08:30:00Z",
            size: "15.2 MB",
            status: 'complete',
            type: 'full',
            location: 'local',
            path: "/var/backups/ansible/full_backup_20231015_083000.tar.gz"
          },
          {
            id: "2",
            name: "playbooks_backup_20231014_143000",
            createdAt: "2023-10-14T14:30:00Z",
            size: "5.7 MB",
            status: 'complete',
            type: 'playbooks',
            location: 'local',
            path: "/var/backups/ansible/playbooks_backup_20231014_143000.tar.gz"
          },
          {
            id: "3",
            name: "inventories_backup_20231014_143000",
            createdAt: "2023-10-14T14:30:00Z",
            size: "2.1 MB",
            status: 'complete',
            type: 'inventories',
            location: 'local',
            path: "/var/backups/ansible/inventories_backup_20231014_143000.tar.gz"
          },
          {
            id: "4",
            name: "configs_backup_20231014_143000",
            createdAt: "2023-10-14T14:30:00Z",
            size: "1.3 MB",
            status: 'complete',
            type: 'configs',
            location: 'local',
            path: "/var/backups/ansible/configs_backup_20231014_143000.tar.gz"
          },
          {
            id: "5",
            name: "full_backup_20231010_020000",
            createdAt: "2023-10-10T02:00:00Z",
            size: "14.9 MB",
            status: 'complete',
            type: 'full',
            location: 's3',
            url: "s3://ansible-backups/full_backup_20231010_020000.tar.gz"
          },
          {
            id: "6",
            name: "full_backup_20231003_020000",
            createdAt: "2023-10-03T02:00:00Z",
            size: "14.5 MB",
            status: 'complete',
            type: 'full',
            location: 's3',
            url: "s3://ansible-backups/full_backup_20231003_020000.tar.gz"
          },
          {
            id: "7",
            name: "backup_in_progress",
            createdAt: new Date().toISOString(),
            size: "0 B",
            status: 'in_progress',
            type: 'full',
            location: 'local'
          }
        ];
        
        // Mock Schedules
        const mockSchedules: ScheduledBackup[] = [
          {
            id: "1",
            name: "Daily Full Backup",
            enabled: true,
            type: 'full',
            schedule: 'daily',
            time: "02:00",
            retention: 7,
            destination: 'local',
            config: {
              path: "/var/backups/ansible"
            },
            lastRun: "2023-10-15T02:00:00Z",
            nextRun: "2023-10-16T02:00:00Z"
          },
          {
            id: "2",
            name: "Weekly S3 Backup",
            enabled: true,
            type: 'full',
            schedule: 'weekly',
            time: "03:00",
            daysOfWeek: ["Sunday"],
            retention: 4,
            destination: 's3',
            config: {
              bucket: "ansible-backups",
              region: "us-east-1"
            },
            lastRun: "2023-10-08T03:00:00Z",
            nextRun: "2023-10-15T03:00:00Z"
          },
          {
            id: "3",
            name: "Monthly Azure Backup",
            enabled: false,
            type: 'full',
            schedule: 'monthly',
            time: "04:00",
            dayOfMonth: 1,
            retention: 6,
            destination: 'azure',
            config: {
              container: "ansible-backups"
            },
            lastRun: "2023-10-01T04:00:00Z",
            nextRun: "2023-11-01T04:00:00Z"
          }
        ];
        
        setBackups(mockBackups);
        setFilteredBackups(mockBackups);
        setSchedules(mockSchedules);
        
        // Set backup in progress if there's an in-progress backup
        const inProgressBackup = mockBackups.find(backup => backup.status === 'in_progress');
        if (inProgressBackup) {
          setBackupProgress(45); // Simulated progress
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching backup data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load backup data"
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...backups];
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(backup => backup.status === statusFilter);
    }
    
    if (typeFilter !== "all") {
      filtered = filtered.filter(backup => backup.type === typeFilter);
    }
    
    setFilteredBackups(filtered);
  }, [statusFilter, typeFilter, backups]);

  const handleCreateBackup = async () => {
    if (backupProgress !== null) {
      toast({
        variant: "destructive",
        title: "Backup in Progress",
        description: "Please wait for the current backup to complete"
      });
      return;
    }
    
    try {
      setBackupProgress(0);
      
      // Create a temporary backup entry
      const tempBackup: BackupItem = {
        id: `temp-${Date.now()}`,
        name: "backup_in_progress",
        createdAt: new Date().toISOString(),
        size: "0 B",
        status: 'in_progress',
        type: backupType as any,
        location: backupDestination as any
      };
      
      setBackups([tempBackup, ...backups]);
      
      // Simulate backup progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Create the completed backup
          const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
          const backupName = `${backupType}_backup_${timestamp}`;
          const newBackup: BackupItem = {
            id: Math.random().toString(36).substring(7),
            name: backupName,
            createdAt: new Date().toISOString(),
            size: `${(Math.random() * 15 + 5).toFixed(1)} MB`,
            status: 'complete',
            type: backupType as any,
            location: backupDestination as any
          };
          
          if (backupDestination === 'local') {
            newBackup.path = `${backupConfig.local.path}/${backupName}.tar.gz`;
          } else if (backupDestination === 's3') {
            newBackup.url = `s3://${backupConfig.s3.bucket}/${backupName}.tar.gz`;
          } else if (backupDestination === 'azure') {
            newBackup.url = `https://${backupConfig.azure.container}.blob.core.windows.net/${backupName}.tar.gz`;
          }
          
          // Replace the temporary backup with the completed one
          const updatedBackups = backups.filter(b => b.id !== tempBackup.id);
          setBackups([newBackup, ...updatedBackups]);
          
          setBackupProgress(null);
          
          toast({
            title: "Backup Complete",
            description: `${backupType} backup completed successfully`
          });
        } else {
          setBackupProgress(progress);
        }
      }, 500);
    } catch (error) {
      console.error("Error creating backup:", error);
      setBackupProgress(null);
      
      toast({
        variant: "destructive",
        title: "Backup Failed",
        description: "Failed to create backup"
      });
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Restore Complete",
        description: `Backup ${selectedBackup.name} restored successfully`
      });
      
      setRestoreDialogOpen(false);
    } catch (error) {
      console.error("Error restoring backup:", error);
      toast({
        variant: "destructive",
        title: "Restore Failed",
        description: "Failed to restore backup"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Delete backup
      const updatedBackups = backups.filter(backup => backup.id !== backupId);
      setBackups(updatedBackups);
      
      if (selectedBackup?.id === backupId) {
        setSelectedBackup(null);
      }
      
      toast({
        title: "Success",
        description: "Backup deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting backup:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete backup"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backup: BackupItem) => {
    try {
      // Simulate download process
      toast({
        title: "Download Started",
        description: `Downloading ${backup.name}`
      });
      
      // In a real application, this would trigger a download
    } catch (error) {
      console.error("Error downloading backup:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download backup"
      });
    }
  };

  const resetScheduleForm = () => {
    setNewSchedule({
      name: "",
      enabled: true,
      type: "full",
      schedule: "daily",
      time: "00:00",
      retention: 7,
      destination: "local",
      config: {}
    });
    setSelectedSchedule(null);
    setEditMode(false);
  };

  const openEditScheduleDialog = (schedule: ScheduledBackup) => {
    setSelectedSchedule(schedule);
    setNewSchedule({
      name: schedule.name,
      enabled: schedule.enabled,
      type: schedule.type,
      schedule: schedule.schedule,
      time: schedule.time,
      daysOfWeek: schedule.daysOfWeek,
      dayOfMonth: schedule.dayOfMonth,
      retention: schedule.retention,
      destination: schedule.destination,
      config: { ...schedule.config }
    });
    setEditMode(true);
    setScheduleDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!newSchedule.name) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Schedule name is required"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editMode && selectedSchedule) {
        // Update existing schedule
        const updatedSchedules = schedules.map(schedule => {
          if (schedule.id === selectedSchedule.id) {
            return {
              ...schedule,
              name: newSchedule.name || schedule.name,
              enabled: newSchedule.enabled !== undefined ? newSchedule.enabled : schedule.enabled,
              type: newSchedule.type as any || schedule.type,
              schedule: newSchedule.schedule as any || schedule.schedule,
              time: newSchedule.time || schedule.time,
              daysOfWeek: newSchedule.daysOfWeek || schedule.daysOfWeek,
              dayOfMonth: newSchedule.dayOfMonth || schedule.dayOfMonth,
              retention: newSchedule.retention || schedule.retention,
              destination: newSchedule.destination as any || schedule.destination,
              config: newSchedule.config || schedule.config
            };
          }
          return schedule;
        });
        
        setSchedules(updatedSchedules);
        toast({
          title: "Success",
          description: "Backup schedule updated successfully"
        });
      } else {
        // Create new schedule
        const newScheduleData: ScheduledBackup = {
          id: Math.random().toString(36).substring(7),
          name: newSchedule.name || "",
          enabled: newSchedule.enabled !== undefined ? newSchedule.enabled : true,
          type: newSchedule.type as any || "full",
          schedule: newSchedule.schedule as any || "daily",
          time: newSchedule.time || "00:00",
          daysOfWeek: newSchedule.daysOfWeek,
          dayOfMonth: newSchedule.dayOfMonth,
          retention: newSchedule.retention || 7,
          destination: newSchedule.destination as any || "local",
          config: newSchedule.config || {},
          nextRun: calculateNextRun(newSchedule as ScheduledBackup)
        };
        
        setSchedules([...schedules, newScheduleData]);
        toast({
          title: "Success",
          description: "Backup schedule created successfully"
        });
      }
      
      setScheduleDialogOpen(false);
      resetScheduleForm();
    } catch (error) {
      console.error("Error saving backup schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editMode ? 'update' : 'create'} backup schedule`
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateNextRun = (schedule: ScheduledBackup): string => {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    let nextRun = new Date(now);
    
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1); // Next day
    }
    
    if (schedule.schedule === 'weekly' && schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
      const dayMap: Record<string, number> = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6
      };
      const targetDay = dayMap[schedule.daysOfWeek[0]];
      const currentDay = nextRun.getDay();
      
      if (currentDay !== targetDay) {
        // Calculate days to add to reach the target day
        const daysToAdd = (targetDay - currentDay + 7) % 7;
        nextRun.setDate(nextRun.getDate() + daysToAdd);
      }
    } else if (schedule.schedule === 'monthly' && schedule.dayOfMonth) {
      const currentMonth = nextRun.getMonth();
      const currentYear = nextRun.getFullYear();
      
      // Set to the specified day of the current month
      nextRun.setDate(schedule.dayOfMonth);
      
      // If the date has already passed this month, move to the next month
      if (nextRun <= now) {
        nextRun.setMonth(currentMonth + 1);
      }
      
      // Handle day of month that doesn't exist in some months
      if (nextRun.getMonth() !== (currentMonth + 1) % 12 && nextRun <= now) {
        nextRun.setDate(0); // Last day of the previous month
      }
    }
    
    return nextRun.toISOString();
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Delete schedule
      const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
      setSchedules(updatedSchedules);
      
      toast({
        title: "Success",
        description: "Backup schedule deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting backup schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete backup schedule"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunNow = async (scheduleId: string) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) return;
      
      toast({
        title: "Backup Triggered",
        description: `Manual backup for "${schedule.name}" started`
      });
      
      // In a real application, this would trigger the backup process
      
      // For simulation, update the lastRun timestamp
      const updatedSchedules = schedules.map(s => {
        if (s.id === scheduleId) {
          return {
            ...s,
            lastRun: new Date().toISOString()
          };
        }
        return s;
      });
      
      setSchedules(updatedSchedules);
    } catch (error) {
      console.error("Error triggering backup:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to trigger backup"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'local': return <HardDrive className="h-4 w-4" />;
      case 's3': return <Cloud className="h-4 w-4" />;
      case 'azure': return <Cloud className="h-4 w-4" />;
      default: return <Save className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'playbooks': return <FileText className="h-4 w-4" />;
      case 'inventories': return <FileSpreadsheet className="h-4 w-4" />;
      case 'configs': return <FileText className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Backup & Recovery</h1>
        <Dialog open={scheduleDialogOpen} onOpenChange={(open) => {
          setScheduleDialogOpen(open);
          if (!open) resetScheduleForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Backups
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editMode ? "Edit Backup Schedule" : "Create Backup Schedule"}
              </DialogTitle>
              <DialogDescription>
                {editMode 
                  ? "Update the backup schedule configuration."
                  : "Configure automated backups on a schedule."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-name">Schedule Name</Label>
                <Input 
                  id="schedule-name"
                  value={newSchedule.name || ""}
                  onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
                  placeholder="e.g., Daily Full Backup"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backup-type">Backup Type</Label>
                <Select 
                  value={newSchedule.type} 
                  onValueChange={(value) => setNewSchedule({...newSchedule, type: value as any})}
                >
                  <SelectTrigger id="backup-type">
                    <SelectValue placeholder="Select backup type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Backup</SelectItem>
                    <SelectItem value="playbooks">Playbooks Only</SelectItem>
                    <SelectItem value="inventories">Inventories Only</SelectItem>
                    <SelectItem value="configs">Configurations Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schedule-frequency">Schedule Frequency</Label>
                <Select 
                  value={newSchedule.schedule} 
                  onValueChange={(value) => setNewSchedule({...newSchedule, schedule: value as any})}
                >
                  <SelectTrigger id="schedule-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Time</Label>
                <Input 
                  id="schedule-time"
                  type="time"
                  value={newSchedule.time || "00:00"}
                  onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                />
              </div>
              
              {newSchedule.schedule === 'weekly' && (
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select 
                    value={(newSchedule.daysOfWeek && newSchedule.daysOfWeek[0]) || "Sunday"} 
                    onValueChange={(value) => setNewSchedule({...newSchedule, daysOfWeek: [value]})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {newSchedule.schedule === 'monthly' && (
                <div className="space-y-2">
                  <Label>Day of Month</Label>
                  <Select 
                    value={String(newSchedule.dayOfMonth || 1)} 
                    onValueChange={(value) => setNewSchedule({...newSchedule, dayOfMonth: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <SelectItem key={day} value={String(day)}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="retention">Retention Period (days)</Label>
                <Input 
                  id="retention"
                  type="number"
                  min="1"
                  value={newSchedule.retention || 7}
                  onChange={(e) => setNewSchedule({
                    ...newSchedule, 
                    retention: parseInt(e.target.value)
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backup-destination">Backup Destination</Label>
                <Select 
                  value={newSchedule.destination} 
                  onValueChange={(value) => setNewSchedule({
                    ...newSchedule, 
                    destination: value as any,
                    config: {} // Reset config when destination changes
                  })}
                >
                  <SelectTrigger id="backup-destination">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Storage</SelectItem>
                    <SelectItem value="s3">Amazon S3</SelectItem>
                    <SelectItem value="azure">Azure Blob Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 border rounded-md p-4">
                <h3 className="text-sm font-medium">Destination Configuration</h3>
                
                {newSchedule.destination === 'local' && (
                  <div className="space-y-2">
                    <Label htmlFor="local-path">Backup Path</Label>
                    <Input 
                      id="local-path"
                      value={newSchedule.config?.path || "/var/backups/ansible"}
                      onChange={(e) => setNewSchedule({
                        ...newSchedule,
                        config: { ...newSchedule.config, path: e.target.value }
                      })}
                    />
                  </div>
                )}
                
                {newSchedule.destination === 's3' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="s3-bucket">S3 Bucket</Label>
                      <Input 
                        id="s3-bucket"
                        value={newSchedule.config?.bucket || ""}
                        onChange={(e) => setNewSchedule({
                          ...newSchedule,
                          config: { ...newSchedule.config, bucket: e.target.value }
                        })}
                        placeholder="ansible-backups"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s3-region">AWS Region</Label>
                      <Input 
                        id="s3-region"
                        value={newSchedule.config?.region || "us-east-1"}
                        onChange={(e) => setNewSchedule({
                          ...newSchedule,
                          config: { ...newSchedule.config, region: e.target.value }
                        })}
                      />
                    </div>
                  </>
                )}
                
                {newSchedule.destination === 'azure' && (
                  <div className="space-y-2">
                    <Label htmlFor="azure-container">Storage Container</Label>
                    <Input 
                      id="azure-container"
                      value={newSchedule.config?.container || ""}
                      onChange={(e) => setNewSchedule({
                        ...newSchedule,
                        config: { ...newSchedule.config, container: e.target.value }
                      })}
                      placeholder="ansible-backups"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={newSchedule.enabled}
                  onCheckedChange={(checked) => setNewSchedule({...newSchedule, enabled: checked})}
                />
                <Label htmlFor="enabled">Enable schedule</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSchedule} disabled={loading}>
                {editMode ? "Update Schedule" : "Create Schedule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="backups" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="backups">
            <FileArchive className="h-4 w-4 mr-2" />
            Backups
          </TabsTrigger>
          <TabsTrigger value="schedules">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled Backups
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="backups">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Backup</CardTitle>
                  <CardDescription>Back up your Ansible data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="backup-type">Backup Type</Label>
                    <Select value={backupType} onValueChange={setBackupType}>
                      <SelectTrigger id="backup-type">
                        <SelectValue placeholder="Select backup type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Backup</SelectItem>
                        <SelectItem value="playbooks">Playbooks Only</SelectItem>
                        <SelectItem value="inventories">Inventories Only</SelectItem>
                        <SelectItem value="configs">Configurations Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backup-destination">Backup Destination</Label>
                    <Select value={backupDestination} onValueChange={setBackupDestination}>
                      <SelectTrigger id="backup-destination">
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local Storage</SelectItem>
                        <SelectItem value="s3">Amazon S3</SelectItem>
                        <SelectItem value="azure">Azure Blob Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 border rounded-md p-4">
                    <h3 className="text-sm font-medium">Destination Configuration</h3>
                    
                    {backupDestination === 'local' && (
                      <div className="space-y-2">
                        <Label htmlFor="local-path">Backup Path</Label>
                        <Input 
                          id="local-path"
                          value={backupConfig.local.path}
                          onChange={(e) => setBackupConfig({
                            ...backupConfig,
                            local: { ...backupConfig.local, path: e.target.value }
                          })}
                        />
                      </div>
                    )}
                    
                    {backupDestination === 's3' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="s3-bucket">S3 Bucket</Label>
                          <Input 
                            id="s3-bucket"
                            value={backupConfig.s3.bucket}
                            onChange={(e) => setBackupConfig({
                              ...backupConfig,
                              s3: { ...backupConfig.s3, bucket: e.target.value }
                            })}
                            placeholder="ansible-backups"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="s3-region">AWS Region</Label>
                          <Input 
                            id="s3-region"
                            value={backupConfig.s3.region}
                            onChange={(e) => setBackupConfig({
                              ...backupConfig,
                              s3: { ...backupConfig.s3, region: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="s3-access-key">Access Key</Label>
                          <Input 
                            id="s3-access-key"
                            value={backupConfig.s3.accessKey}
                            onChange={(e) => setBackupConfig({
                              ...backupConfig,
                              s3: { ...backupConfig.s3, accessKey: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="s3-secret-key">Secret Key</Label>
                          <Input 
                            id="s3-secret-key"
                            type="password"
                            value={backupConfig.s3.secretKey}
                            onChange={(e) => setBackupConfig({
                              ...backupConfig,
                              s3: { ...backupConfig.s3, secretKey: e.target.value }
                            })}
                          />
                        </div>
                      </>
                    )}
                    
                    {backupDestination === 'azure' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="azure-container">Storage Container</Label>
                          <Input 
                            id="azure-container"
                            value={backupConfig.azure.container}
                            onChange={(e) => setBackupConfig({
                              ...backupConfig,
                              azure: { ...backupConfig.azure, container: e.target.value }
                            })}
                            placeholder="ansible-backups"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="azure-connection">Connection String</Label>
                          <Input 
                            id="azure-connection"
                            type="password"
                            value={backupConfig.azure.connectionString}
                            onChange={(e) => setBackupConfig({
                              ...backupConfig,
                              azure: { ...backupConfig.azure, connectionString: e.target.value }
                            })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleCreateBackup} 
                    disabled={backupProgress !== null}
                    className="w-full"
                  >
                    {backupProgress !== null ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating Backup...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Backup
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              {backupProgress !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle>Backup in Progress</CardTitle>
                    <CardDescription>Creating {backupType} backup</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span>{backupProgress}%</span>
                      </div>
                      <Progress value={backupProgress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Filter Backups</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status-filter">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type-filter">Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger id="type-filter">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="full">Full Backup</SelectItem>
                        <SelectItem value="playbooks">Playbooks Only</SelectItem>
                        <SelectItem value="inventories">Inventories Only</SelectItem>
                        <SelectItem value="configs">Configurations Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Available Backups</CardTitle>
                  <CardDescription>
                    {filteredBackups.length} {filteredBackups.length === 1 ? 'backup' : 'backups'} available
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBackups.map((backup) => (
                          <TableRow key={backup.id} onClick={() => setSelectedBackup(backup)} className="cursor-pointer">
                            <TableCell className="font-medium">{backup.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getTypeIcon(backup.type)}
                                <span className="ml-2 capitalize">{backup.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>{backup.size}</TableCell>
                            <TableCell>
                              {backup.status === 'complete' ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  Complete
                                </span>
                              ) : backup.status === 'failed' ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <X className="h-3 w-3 mr-1" />
                                  Failed
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  In Progress
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{formatTimestamp(backup.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getLocationIcon(backup.location)}
                                <span className="ml-2 capitalize">{backup.location}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                {backup.status === 'complete' && (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent row click
                                        setSelectedBackup(backup);
                                        setRestoreDialogOpen(true);
                                      }}
                                    >
                                      <ArrowRight className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent row click
                                        handleDownloadBackup(backup);
                                      }}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click
                                    handleDeleteBackup(backup.id);
                                  }}
                                  disabled={backup.status === 'in_progress'}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {filteredBackups.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                              No backups found matching the current filters.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <Dialog open={restoreDialogOpen && selectedBackup !== null} onOpenChange={setRestoreDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Restore Backup</DialogTitle>
                        <DialogDescription>
                          Restore data from the selected backup.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="space-y-4">
                          <div className="bg-muted rounded-md p-4">
                            <h3 className="text-sm font-medium mb-2">Backup Details</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Name:</span>
                                <span>{selectedBackup?.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Type:</span>
                                <span className="capitalize">{selectedBackup?.type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Created:</span>
                                <span>{formatTimestamp(selectedBackup?.createdAt)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Size:</span>
                                <span>{selectedBackup?.size}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Items to Restore</Label>
                            {selectedBackup?.type === 'full' ? (
                              <>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id="restore-playbooks"
                                    checked={restoreConfig.items.includes('playbooks')}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setRestoreConfig({
                                          ...restoreConfig,
                                          items: [...restoreConfig.items, 'playbooks']
                                        });
                                      } else {
                                        setRestoreConfig({
                                          ...restoreConfig,
                                          items: restoreConfig.items.filter(item => item !== 'playbooks')
                                        });
                                      }
                                    }}
                                  />
                                  <Label htmlFor="restore-playbooks">Playbooks</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id="restore-inventories"
                                    checked={restoreConfig.items.includes('inventories')}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setRestoreConfig({
                                          ...restoreConfig,
                                          items: [...restoreConfig.items, 'inventories']
                                        });
                                      } else {
                                        setRestoreConfig({
                                          ...restoreConfig,
                                          items: restoreConfig.items.filter(item => item !== 'inventories')
                                        });
                                      }
                                    }}
                                  />
                                  <Label htmlFor="restore-inventories">Inventories</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id="restore-configs"
                                    checked={restoreConfig.items.includes('configs')}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setRestoreConfig({
                                          ...restoreConfig,
                                          items: [...restoreConfig.items, 'configs']
                                        });
                                      } else {
                                        setRestoreConfig({
                                          ...restoreConfig,
                                          items: restoreConfig.items.filter(item => item !== 'configs')
                                        });
                                      }
                                    }}
                                  />
                                  <Label htmlFor="restore-configs">Configurations</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id="restore-roles"
                                    checked={restoreConfig.items.includes('roles')}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setRestoreConfig({
                                          ...restoreConfig,
                                          items: [...restoreConfig.items, 'roles']
                                        });
                                      } else {
                                        setRestoreConfig({
                                          ...restoreConfig,
                                          items: restoreConfig.items.filter(item => item !== 'roles')
                                        });
                                      }
                                    }}
                                  />
                                  <Label htmlFor="restore-roles">Roles</Label>
                                </div>
                              </>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                This backup only contains {selectedBackup?.type}.
                              </div>
                            )}
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="overwrite"
                              checked={restoreConfig.overwrite}
                              onCheckedChange={(checked) => setRestoreConfig({
                                ...restoreConfig,
                                overwrite: checked
                              })}
                            />
                            <Label htmlFor="overwrite">Overwrite existing files</Label>
                          </div>
                          
                          <div className="text-sm text-orange-500 bg-orange-50 p-3 rounded-md flex items-start">
                            <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                            <span>
                              Restoring will replace your current data with the backed up version. 
                              This action cannot be undone.
                            </span>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleRestoreBackup} 
                          disabled={loading || restoreConfig.items.length === 0}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Restoring...
                            </>
                          ) : (
                            <>
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Restore Backup
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="schedules">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <CardTitle>{schedule.name}</CardTitle>
                        {schedule.enabled ? (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Enabled
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Disabled
                          </span>
                        )}
                      </div>
                      <CardDescription>
                        {schedule.schedule === 'daily' 
                          ? 'Daily' 
                          : schedule.schedule === 'weekly' 
                            ? `Weekly on ${schedule.daysOfWeek?.[0] || 'Sunday'}` 
                            : `Monthly on day ${schedule.dayOfMonth || 1}`} at {schedule.time}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditScheduleDialog(schedule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Backup Type</p>
                        <p className="font-medium capitalize">{schedule.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Destination</p>
                        <p className="font-medium capitalize flex items-center">
                          {getLocationIcon(schedule.destination)}
                          <span className="ml-1">{schedule.destination}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Run</p>
                        <p className="font-medium">{formatTimestamp(schedule.lastRun)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Run</p>
                        <p className="font-medium">{formatTimestamp(schedule.nextRun)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Retention</p>
                      <p className="font-medium">{schedule.retention} days</p>
                    </div>
                    
                    <div className="bg-muted rounded-md p-3">
                      <h3 className="text-sm font-medium mb-1">Destination Details</h3>
                      {schedule.destination === 'local' && (
                        <p className="text-sm font-mono">{schedule.config.path}</p>
                      )}
                      {schedule.destination === 's3' && (
                        <p className="text-sm font-mono">s3://{schedule.config.bucket}/{schedule.type === 'full' ? 'full' : schedule.type}</p>
                      )}
                      {schedule.destination === 'azure' && (
                        <p className="text-sm font-mono">
                          https://{schedule.config.container}.blob.core.windows.net/{schedule.type === 'full' ? 'full' : schedule.type}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`toggle-${schedule.id}`}
                      checked={schedule.enabled}
                      onCheckedChange={(checked) => {
                        const updatedSchedules = schedules.map(s => {
                          if (s.id === schedule.id) {
                            return { ...s, enabled: checked };
                          }
                          return s;
                        });
                        setSchedules(updatedSchedules);
                      }}
                    />
                    <Label htmlFor={`toggle-${schedule.id}`}>
                      {schedule.enabled ? "Enabled" : "Disabled"}
                    </Label>
                  </div>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleRunNow(schedule.id)}
                    disabled={!schedule.enabled}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            <Card className="flex flex-col justify-center items-center p-8">
              <div className="text-center space-y-4">
                <div className="bg-muted rounded-full p-4 inline-block">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium">Schedule Backups</h3>
                <p className="text-muted-foreground max-w-md">
                  Create automated backup schedules to ensure your Ansible data is protected and regularly backed up.
                </p>
                <Dialog open={newScheduleDialogOpen} onOpenChange={setNewScheduleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Backup Schedule</DialogTitle>
                      <DialogDescription>
                        Configure automated backups on a schedule.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-schedule-name">Schedule Name</Label>
                        <Input 
                          id="new-schedule-name"
                          value={newSchedule.name || ""}
                          onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
                          placeholder="e.g., Daily Full Backup"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-backup-type">Backup Type</Label>
                        <Select 
                          value={newSchedule.type} 
                          onValueChange={(value) => setNewSchedule({...newSchedule, type: value as any})}
                        >
                          <SelectTrigger id="new-backup-type">
                            <SelectValue placeholder="Select backup type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Backup</SelectItem>
                            <SelectItem value="playbooks">Playbooks Only</SelectItem>
                            <SelectItem value="inventories">Inventories Only</SelectItem>
                            <SelectItem value="configs">Configurations Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-schedule-frequency">Schedule Frequency</Label>
                        <Select 
                          value={newSchedule.schedule} 
                          onValueChange={(value) => setNewSchedule({...newSchedule, schedule: value as any})}
                        >
                          <SelectTrigger id="new-schedule-frequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-schedule-time">Time</Label>
                        <Input 
                          id="new-schedule-time"
                          type="time"
                          value={newSchedule.time || "00:00"}
                          onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                        />
                      </div>
                      
                      {newSchedule.schedule === 'weekly' && (
                        <div className="space-y-2">
                          <Label>Day of Week</Label>
                          <Select 
                            value={(newSchedule.daysOfWeek && newSchedule.daysOfWeek[0]) || "Sunday"} 
                            onValueChange={(value) => setNewSchedule({...newSchedule, daysOfWeek: [value]})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sunday">Sunday</SelectItem>
                              <SelectItem value="Monday">Monday</SelectItem>
                              <SelectItem value="Tuesday">Tuesday</SelectItem>
                              <SelectItem value="Wednesday">Wednesday</SelectItem>
                              <SelectItem value="Thursday">Thursday</SelectItem>
                              <SelectItem value="Friday">Friday</SelectItem>
                              <SelectItem value="Saturday">Saturday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {newSchedule.schedule === 'monthly' && (
                        <div className="space-y-2">
                          <Label>Day of Month</Label>
                          <Select 
                            value={String(newSchedule.dayOfMonth || 1)} 
                            onValueChange={(value) => setNewSchedule({...newSchedule, dayOfMonth: parseInt(value)})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                <SelectItem key={day} value={String(day)}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 mb-4">
                        <Switch
                          id="new-enabled"
                          checked={newSchedule.enabled}
                          onCheckedChange={(checked) => setNewSchedule({...newSchedule, enabled: checked})}
                        />
                        <Label htmlFor="new-enabled">Enable schedule</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewScheduleDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => {
                          handleSaveSchedule();
                          setNewScheduleDialogOpen(false);
                        }}
                        disabled={loading}
                      >
                        Create Schedule
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Backup;
