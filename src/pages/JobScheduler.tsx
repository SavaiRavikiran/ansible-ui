
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPlaybooks, fetchInventories, schedulePlaybook } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CalendarDays, Clock, Play, Trash } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScheduledJob {
  id: string;
  playbookId: string;
  playbookName: string;
  inventoryId: string;
  inventoryName: string;
  nextRunTime: string;
  schedule: {
    type: "once" | "daily" | "weekly" | "monthly";
    time: string;
    daysOfWeek?: string[];
    dayOfMonth?: number;
  };
  isEnabled: boolean;
}

export default function JobScheduler() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<string>("");
  const [selectedInventory, setSelectedInventory] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<"once" | "daily" | "weekly" | "monthly">("once");
  const [scheduleTime, setScheduleTime] = useState("12:00");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date());
  const [selectedDays, setSelectedDays] = useState<string[]>(["Monday"]);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);

  const queryClient = useQueryClient();

  // Mock scheduled jobs data (in a real app, this would come from the API)
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([
    {
      id: "1",
      playbookId: "1",
      playbookName: "deploy-web.yml",
      inventoryId: "1",
      inventoryName: "production",
      nextRunTime: "2023-07-01T12:00:00Z",
      schedule: {
        type: "daily",
        time: "12:00",
      },
      isEnabled: true,
    },
    {
      id: "2",
      playbookId: "2",
      playbookName: "database-backup.yml",
      inventoryId: "1",
      inventoryName: "production",
      nextRunTime: "2023-07-02T00:00:00Z",
      schedule: {
        type: "weekly",
        time: "00:00",
        daysOfWeek: ["Sunday"],
      },
      isEnabled: true,
    },
  ]);

  const { data: playbooks = [] } = useQuery({
    queryKey: ['playbooks'],
    queryFn: fetchPlaybooks,
  });

  const { data: inventories = [] } = useQuery({
    queryKey: ['inventories'],
    queryFn: fetchInventories,
  });

  const schedulePlaybookMutation = useMutation({
    mutationFn: schedulePlaybook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-jobs'] });
      toast.success("Job scheduled successfully");
      setCreateDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to schedule job");
    }
  });

  const handleScheduleJob = () => {
    // Check required fields
    if (!selectedPlaybook || !selectedInventory || !scheduleTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    // For demo purposes, we'll add to our local state
    // In a real implementation, this would call the API
    const playbook = playbooks.find(p => p.id === selectedPlaybook);
    const inventory = inventories.find(i => i.id === selectedInventory);

    if (!playbook || !inventory) {
      toast.error("Invalid playbook or inventory selection");
      return;
    }

    const newJob: ScheduledJob = {
      id: Math.random().toString(36).substring(2, 9),
      playbookId: selectedPlaybook,
      playbookName: playbook.name,
      inventoryId: selectedInventory,
      inventoryName: inventory.name,
      nextRunTime: calculateNextRunTime(),
      schedule: {
        type: scheduleType,
        time: scheduleTime,
        ...(scheduleType === "weekly" && { daysOfWeek: selectedDays }),
        ...(scheduleType === "monthly" && { dayOfMonth }),
      },
      isEnabled: true,
    };

    setScheduledJobs([...scheduledJobs, newJob]);
    toast.success("Job scheduled successfully");
    setCreateDialogOpen(false);
    resetForm();
  };

  const calculateNextRunTime = (): string => {
    // This is a simplified implementation
    // In a real app, this would need more sophisticated logic
    const now = new Date();
    
    if (scheduleType === "once" && scheduleDate) {
      const date = new Date(scheduleDate);
      const [hours, minutes] = scheduleTime.split(":").map(Number);
      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();
    }
    
    // For recurring schedules, just return tomorrow as a placeholder
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, minutes] = scheduleTime.split(":").map(Number);
    tomorrow.setHours(hours, minutes, 0, 0);
    return tomorrow.toISOString();
  };

  const toggleJobStatus = (jobId: string) => {
    setScheduledJobs(
      scheduledJobs.map(job => 
        job.id === jobId ? { ...job, isEnabled: !job.isEnabled } : job
      )
    );
    toast.success("Job status updated");
  };

  const deleteJob = (jobId: string) => {
    setScheduledJobs(scheduledJobs.filter(job => job.id !== jobId));
    toast.success("Job deleted successfully");
  };

  const resetForm = () => {
    setSelectedPlaybook("");
    setSelectedInventory("");
    setScheduleType("once");
    setScheduleTime("12:00");
    setScheduleDate(new Date());
    setSelectedDays(["Monday"]);
    setDayOfMonth(1);
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto w-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Job Scheduler</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Schedule New Job</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Playbook Execution</DialogTitle>
              <DialogDescription>
                Set up when and how often your playbook should run.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="playbook">Playbook</Label>
                <Select value={selectedPlaybook} onValueChange={setSelectedPlaybook}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select playbook" />
                  </SelectTrigger>
                  <SelectContent>
                    {playbooks.map((playbook) => (
                      <SelectItem key={playbook.id} value={playbook.id}>
                        {playbook.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inventory">Inventory</Label>
                <Select value={selectedInventory} onValueChange={setSelectedInventory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inventory" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventories.map((inventory) => (
                      <SelectItem key={inventory.id} value={inventory.id}>
                        {inventory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schedule-type">Schedule Type</Label>
                <Select value={scheduleType} onValueChange={(value: "once" | "daily" | "weekly" | "monthly") => setScheduleType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {scheduleType === "once" && (
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <DatePicker
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                  />
                </div>
              )}
              
              {scheduleType === "weekly" && (
                <div className="grid gap-2">
                  <Label htmlFor="days">Days of Week</Label>
                  <ScrollArea className="h-24 rounded-md border">
                    <div className="p-2">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="flex items-center space-x-2 py-1">
                          <Switch
                            checked={selectedDays.includes(day)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedDays([...selectedDays, day]);
                              } else {
                                setSelectedDays(selectedDays.filter((d) => d !== day));
                              }
                            }}
                          />
                          <Label>{day}</Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              {scheduleType === "monthly" && (
                <div className="grid gap-2">
                  <Label htmlFor="day-of-month">Day of Month</Label>
                  <Input
                    id="day-of-month"
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                  />
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleScheduleJob}>
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Jobs</CardTitle>
          <CardDescription>
            View and manage all your scheduled Ansible playbook executions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledJobs.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              No scheduled jobs found. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Playbook</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.playbookName}</TableCell>
                    <TableCell>{job.inventoryName}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {job.schedule.type === "once" 
                            ? "Once" 
                            : job.schedule.type === "daily" 
                              ? "Daily" 
                              : job.schedule.type === "weekly" 
                                ? `Weekly (${job.schedule.daysOfWeek?.join(", ")})` 
                                : `Monthly (Day ${job.schedule.dayOfMonth})`}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="mr-2 h-3 w-3" />
                        <span>{job.schedule.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(job.nextRunTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={job.isEnabled}
                        onCheckedChange={() => toggleJobStatus(job.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // In a real app, this would trigger an immediate execution
                            toast.success(`Triggered immediate execution of ${job.playbookName}`);
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteJob(job.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
