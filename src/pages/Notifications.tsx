
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Bell, Mail, MessageSquare, Webhook, Link2, Plus, Trash, Edit, 
  Send, CheckCircle2, AlertCircle, Code, RefreshCw, Settings, Play,
  MailCheck, Vibrate, ArrowRight, Search
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'matrix';
  config: {
    recipients?: string[];
    webhook_url?: string;
    channel?: string;
    username?: string;
    icon?: string;
    [key: string]: any;
  };
  enabled: boolean;
  events: string[];
  lastSent?: string;
  lastStatus?: 'success' | 'failed';
  lastError?: string;
}

interface NotificationEvent {
  id: string;
  name: string;
  description: string;
  category: 'task' | 'system' | 'security';
}

interface NotificationLog {
  id: string;
  timestamp: string;
  channel: string;
  channelType: 'email' | 'slack' | 'webhook' | 'matrix';
  event: string;
  status: 'success' | 'failed';
  recipients: string;
  message: string;
  error?: string;
}

const Notifications = () => {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sending, setSending] = useState(false);
  
  const [newChannel, setNewChannel] = useState<Partial<NotificationChannel>>({
    name: "",
    type: "email",
    config: {},
    enabled: true,
    events: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock Notification Channels
        const mockChannels: NotificationChannel[] = [
          {
            id: "1",
            name: "Dev Team Email",
            type: "email",
            config: {
              recipients: ["devteam@example.com", "admin@example.com"]
            },
            enabled: true,
            events: ["playbook_start", "playbook_complete", "playbook_error", "system_update"],
            lastSent: "2023-10-15T09:30:00Z",
            lastStatus: "success"
          },
          {
            id: "2",
            name: "Ops Slack Channel",
            type: "slack",
            config: {
              webhook_url: "https://hooks.slack.com/services/TXXXXXXXXX/BXXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX",
              channel: "#ansible-alerts",
              username: "Ansible Bot",
              icon: ":robot_face:"
            },
            enabled: true,
            events: ["playbook_error", "system_critical", "security_alert"],
            lastSent: "2023-10-14T16:45:00Z",
            lastStatus: "success"
          },
          {
            id: "3",
            name: "Monitoring Webhook",
            type: "webhook",
            config: {
              webhook_url: "https://monitoring.example.com/api/hooks/ansible",
              headers: {
                "X-API-Key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              }
            },
            enabled: false,
            events: ["playbook_complete", "playbook_error", "system_critical", "system_update"],
            lastSent: "2023-10-10T11:20:00Z",
            lastStatus: "failed",
            lastError: "Webhook endpoint returned 403 Forbidden"
          },
          {
            id: "4",
            name: "Matrix DevOps Room",
            type: "matrix",
            config: {
              homeserver: "https://matrix.org",
              room_id: "!abcdefghijklmnopqr:matrix.org",
              access_token: "syt_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            },
            enabled: true,
            events: ["playbook_error", "security_alert"],
            lastSent: "2023-10-13T14:10:00Z",
            lastStatus: "success"
          }
        ];
        
        // Mock Notification Events
        const mockEvents: NotificationEvent[] = [
          {
            id: "playbook_start",
            name: "Playbook Started",
            description: "A playbook has started execution",
            category: "task"
          },
          {
            id: "playbook_complete",
            name: "Playbook Completed",
            description: "A playbook has completed successfully",
            category: "task"
          },
          {
            id: "playbook_error",
            name: "Playbook Error",
            description: "A playbook has failed with errors",
            category: "task"
          },
          {
            id: "system_update",
            name: "System Update",
            description: "System has been updated",
            category: "system"
          },
          {
            id: "system_critical",
            name: "System Critical",
            description: "Critical system event occurred",
            category: "system"
          },
          {
            id: "security_alert",
            name: "Security Alert",
            description: "Security-related event detected",
            category: "security"
          },
          {
            id: "user_login",
            name: "User Login",
            description: "User logged into the system",
            category: "security"
          }
        ];
        
        // Mock Notification Logs
        const mockLogs: NotificationLog[] = [
          {
            id: "1",
            timestamp: "2023-10-15T09:30:00Z",
            channel: "Dev Team Email",
            channelType: "email",
            event: "Playbook Completed",
            status: "success",
            recipients: "devteam@example.com, admin@example.com",
            message: "Playbook 'deploy-webapp.yml' completed successfully on 3 hosts"
          },
          {
            id: "2",
            timestamp: "2023-10-14T16:45:00Z",
            channel: "Ops Slack Channel",
            channelType: "slack",
            event: "Playbook Error",
            status: "success",
            recipients: "#ansible-alerts",
            message: "Playbook 'db-backup.yml' failed with error: Connection timeout on host db01.example.com"
          },
          {
            id: "3",
            timestamp: "2023-10-13T14:10:00Z",
            channel: "Matrix DevOps Room",
            channelType: "matrix",
            event: "Security Alert",
            status: "success",
            recipients: "DevOps Room",
            message: "Security update required for 5 hosts: CVE-2023-12345 detected"
          },
          {
            id: "4",
            timestamp: "2023-10-10T11:20:00Z",
            channel: "Monitoring Webhook",
            channelType: "webhook",
            event: "System Update",
            status: "failed",
            recipients: "monitoring.example.com",
            message: "System configuration updated with new inventory",
            error: "Webhook endpoint returned 403 Forbidden"
          },
          {
            id: "5",
            timestamp: "2023-10-09T10:15:00Z",
            channel: "Dev Team Email",
            channelType: "email",
            event: "Playbook Started",
            status: "success",
            recipients: "devteam@example.com, admin@example.com",
            message: "Playbook 'deploy-webapp.yml' started execution"
          }
        ];
        
        setChannels(mockChannels);
        setEvents(mockEvents);
        setLogs(mockLogs);
        setFilteredLogs(mockLogs);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notification data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load notification data"
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Filter logs based on search query and status filter
    let filtered = [...logs];
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.channel.toLowerCase().includes(lowerQuery) || 
        log.event.toLowerCase().includes(lowerQuery) || 
        log.message.toLowerCase().includes(lowerQuery) ||
        log.recipients.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(log => log.status === statusFilter);
    }
    
    setFilteredLogs(filtered);
  }, [searchQuery, statusFilter, logs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search already handled by the useEffect above
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'slack': return <MessageSquare className="h-4 w-4" />;
      case 'webhook': return <Webhook className="h-4 w-4" />;
      case 'matrix': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelName = (type: string) => {
    switch (type) {
      case 'email': return "Email";
      case 'slack': return "Slack";
      case 'webhook': return "Webhook";
      case 'matrix': return "Matrix";
      default: return type;
    }
  };

  const resetChannelForm = () => {
    setNewChannel({
      name: "",
      type: "email",
      config: {},
      enabled: true,
      events: []
    });
    setSelectedChannel(null);
    setEditMode(false);
  };

  const openEditChannelDialog = (channel: NotificationChannel) => {
    setSelectedChannel(channel);
    setNewChannel({
      name: channel.name,
      type: channel.type,
      config: { ...channel.config },
      enabled: channel.enabled,
      events: [...channel.events]
    });
    setEditMode(true);
    setChannelDialogOpen(true);
  };

  const handleSaveChannel = async () => {
    if (!newChannel.name || !newChannel.type) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }
    
    // Validate channel-specific requirements
    if (newChannel.type === 'email' && (!newChannel.config?.recipients || newChannel.config.recipients.length === 0)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Email recipients are required"
      });
      return;
    }
    
    if ((newChannel.type === 'slack' || newChannel.type === 'webhook') && !newChannel.config?.webhook_url) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Webhook URL is required"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editMode && selectedChannel) {
        // Update existing channel
        const updatedChannels = channels.map(channel => {
          if (channel.id === selectedChannel.id) {
            return {
              ...channel,
              name: newChannel.name || channel.name,
              type: newChannel.type as any,
              config: newChannel.config || channel.config,
              enabled: newChannel.enabled !== undefined ? newChannel.enabled : channel.enabled,
              events: newChannel.events || channel.events
            };
          }
          return channel;
        });
        
        setChannels(updatedChannels);
        toast({
          title: "Success",
          description: "Notification channel updated successfully"
        });
      } else {
        // Create new channel
        const newChannelData: NotificationChannel = {
          id: Math.random().toString(36).substring(7),
          name: newChannel.name || "",
          type: newChannel.type as any,
          config: newChannel.config || {},
          enabled: newChannel.enabled !== undefined ? newChannel.enabled : true,
          events: newChannel.events || []
        };
        
        setChannels([...channels, newChannelData]);
        toast({
          title: "Success",
          description: "Notification channel created successfully"
        });
      }
      
      setChannelDialogOpen(false);
      resetChannelForm();
    } catch (error) {
      console.error("Error saving notification channel:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editMode ? 'update' : 'create'} notification channel`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Delete channel
      const updatedChannels = channels.filter(channel => channel.id !== channelId);
      setChannels(updatedChannels);
      
      toast({
        title: "Success",
        description: "Notification channel deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting notification channel:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notification channel"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEvent = (eventId: string) => {
    const currentEvents = newChannel.events || [];
    
    if (currentEvents.includes(eventId)) {
      setNewChannel({
        ...newChannel,
        events: currentEvents.filter(id => id !== eventId)
      });
    } else {
      setNewChannel({
        ...newChannel,
        events: [...currentEvents, eventId]
      });
    }
  };

  const handleTestNotification = async () => {
    if (!selectedChannel) return;
    
    try {
      setSending(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the channel's last sent info
      const now = new Date().toISOString();
      const updatedChannels = channels.map(channel => {
        if (channel.id === selectedChannel.id) {
          return {
            ...channel,
            lastSent: now,
            lastStatus: 'success'
          };
        }
        return channel;
      });
      
      // Add a new log entry
      const newLog: NotificationLog = {
        id: Math.random().toString(36).substring(7),
        timestamp: now,
        channel: selectedChannel.name,
        channelType: selectedChannel.type,
        event: "Test Notification",
        status: 'success',
        recipients: selectedChannel.type === 'email' 
          ? (selectedChannel.config.recipients || []).join(', ')
          : selectedChannel.type === 'slack'
            ? selectedChannel.config.channel || ''
            : '',
        message: "This is a test notification from Ansible UI"
      };
      
      setChannels(updatedChannels);
      setLogs([newLog, ...logs]);
      setFilteredLogs([newLog, ...filteredLogs]);
      
      toast({
        title: "Success",
        description: "Test notification sent successfully"
      });
      
      setTestDialogOpen(false);
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send test notification"
      });
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventsByCategory = () => {
    const categorized: Record<string, NotificationEvent[]> = {};
    
    events.forEach(event => {
      if (!categorized[event.category]) {
        categorized[event.category] = [];
      }
      categorized[event.category].push(event);
    });
    
    return categorized;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Dialog open={channelDialogOpen} onOpenChange={(open) => {
          setChannelDialogOpen(open);
          if (!open) resetChannelForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Notification Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editMode ? "Edit Notification Channel" : "Add Notification Channel"}
              </DialogTitle>
              <DialogDescription>
                {editMode 
                  ? "Update the notification channel details." 
                  : "Configure a new notification channel to receive alerts."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="channel-name">Channel Name</Label>
                <Input 
                  id="channel-name"
                  value={newChannel.name || ""}
                  onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                  placeholder="e.g., DevOps Email Alerts"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="channel-type">Channel Type</Label>
                <Select 
                  value={newChannel.type} 
                  onValueChange={(value) => setNewChannel({
                    ...newChannel, 
                    type: value as any,
                    config: {} // Reset config when type changes
                  })}
                >
                  <SelectTrigger id="channel-type">
                    <SelectValue placeholder="Select channel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="matrix">Matrix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-sm font-medium">Channel Configuration</h3>
                
                {newChannel.type === 'email' && (
                  <div className="space-y-2">
                    <Label htmlFor="email-recipients">Recipients (comma-separated)</Label>
                    <Textarea 
                      id="email-recipients"
                      value={Array.isArray(newChannel.config?.recipients) 
                        ? newChannel.config.recipients.join(', ')
                        : newChannel.config?.recipients || ""}
                      onChange={(e) => setNewChannel({
                        ...newChannel,
                        config: {
                          ...newChannel.config,
                          recipients: e.target.value.split(',').map(email => email.trim())
                        }
                      })}
                      placeholder="user@example.com, admin@example.com"
                    />
                    
                    <Label htmlFor="email-from" className="mt-4">From Address (optional)</Label>
                    <Input 
                      id="email-from"
                      value={newChannel.config?.from_address || ""}
                      onChange={(e) => setNewChannel({
                        ...newChannel,
                        config: {
                          ...newChannel.config,
                          from_address: e.target.value
                        }
                      })}
                      placeholder="ansible@example.com"
                    />
                    
                    <Label htmlFor="email-subject-prefix" className="mt-4">Subject Prefix (optional)</Label>
                    <Input 
                      id="email-subject-prefix"
                      value={newChannel.config?.subject_prefix || ""}
                      onChange={(e) => setNewChannel({
                        ...newChannel,
                        config: {
                          ...newChannel.config,
                          subject_prefix: e.target.value
                        }
                      })}
                      placeholder="[Ansible Alert]"
                    />
                  </div>
                )}
                
                {newChannel.type === 'slack' && (
                  <div className="space-y-2">
                    <Label htmlFor="slack-webhook">Webhook URL</Label>
                    <Input 
                      id="slack-webhook"
                      value={newChannel.config?.webhook_url || ""}
                      onChange={(e) => setNewChannel({
                        ...newChannel,
                        config: {
                          ...newChannel.config,
                          webhook_url: e.target.value
                        }
                      })}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                    
                    <Label htmlFor="slack-channel" className="mt-4">Channel</Label>
                    <Input 
                      id="slack-channel"
                      value={newChannel.config?.channel || ""}
                      onChange={(e) => setNewChannel({
                        ...newChannel,
                        config: {
                          ...newChannel.config,
                          channel: e.target.value
                        }
                      })}
                      placeholder="#ansible-alerts"
                    />
                    
                    <Label htmlFor="slack-username" className="mt-4">Username (optional)</Label>
                    <Input 
                      id="slack-username"
                      value={newChannel.config?.username || ""}
                      onChange={(e) => setNewChannel({
                        ...newChannel,
                        config: {
                          ...newChannel.config,
                          username: e.target.value
                        }
                      })}
                      placeholder="Ansible Bot"
                    />
                    
                    <Label htmlFor="slack-icon" className="mt-4">Icon (optional)</Label>
                    <Input 
                      id="slack-icon"
                      value={newChannel.config?.icon || ""}
                      onChange={(e) => setNewChannel({
                        ...newChannel,
                        config: {
                          ...newChannel.config,
                          icon: e.target.value
                        }
                      })}
                      placeholder=":robot_face:"
                    />
                  </div>
                )}
                
                {newChannel.type === 'webhook' && (
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input 
                      id="webhook-url"
                      value={newChannel.config?.webhook_url || ""}
                      onChange={(e) => setNewChannel({
                        ...newChannel,
                        config: {
                          ...newChannel.config,
                          webhook_url: e.target.value
                        }
                      })}
                      placeholder="https://example.com/webhook"
                    />
                    
                    <Label htmlFor="webhook-method" className="mt-4">HTTP Method</Label>
                    <Select 
                      value={newChannel.config?.method || "POST"}
                      onValueChange={(value) => setNewChannel({
                        ...newChannel,
                        config: {
                          ...newChannel.config,
                          method: value
                        }
                      })}
                    >
                      <SelectTrigger id="webhook-method">
                        <SelectValue placeholder="Select HTTP method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Label htmlFor="webhook-headers" className="mt-4">HTTP Headers (JSON)</Label>
                    <Textarea 
                      id="webhook-headers"
                      value={newChannel.config?.headers 
                        ? JSON.stringify(newChannel.config.headers, null, 2)
                        : ""}
                      onChange={(e) => {
                        try {
                          const headers = e.target.value ? JSON.parse(e.target.value) : {};
                          setNewChannel({
                            ...newChannel,
                            config: {
                              ...newChannel.config,
                              headers
                            }
                          });
                        } catch (error) {
                          // Invalid JSON, just store as string for now
                          setNewChannel({
                            ...newChannel,
                            config: {
                              ...newChannel.config,
                              _headersText: e.target.value
                            }
                          });
                        }
                      }}
                      placeholder='{"Content-Type": "application/json", "X-API-Key": "your-api-key"}'
                      className="font-mono text-sm"
                    />
                  </div>
                )}
                
                {newChannel.type === 'matrix' && (
                  <div className="space-y-2">
                    <Label htmlFor="matrix-homeserver">Homeserver URL</Label>
                    <Input 
                      id="matrix-homeserver"
                      value={newChannel.config?.homeserver || ""}
                      onChange={(e) => setNewChannel({
                        ...newChannel,
                        config: {
                          ...newChannel.config,
                          homeserver: e.target.value
                        }
                      })}
                      placeholder="https://matrix.org"
                    />
                    
                    <Label htmlFor="matrix-room" className="mt-4">Room ID</Label>
                    <Input 
                      id="matrix-room"
                      value={newChannel.config?.room_id || ""}
                      onChange={(e) => setNewChannel({
                        ...newChannel,
                        config: {
                          ...newChannel.config,
                          room_id: e.target.value
                        }
                      })}
                      placeholder="!roomid:matrix.org"
                    />
                    
                    <Label htmlFor="matrix-token" className="mt-4">Access Token</Label>
                    <Input 
                      id="matrix-token"
                      type="password"
                      value={newChannel.config?.access_token || ""}
                      onChange={(e) => setNewChannel({
                        ...newChannel,
                        config: {
                          ...newChannel.config,
                          access_token: e.target.value
                        }
                      })}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Notification Events</Label>
                <ScrollArea className="h-48 border rounded-md p-2">
                  {Object.entries(getEventsByCategory()).map(([category, categoryEvents]) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-sm font-medium mb-2 capitalize">{category} Events</h4>
                      {categoryEvents.map(event => (
                        <div key={event.id} className="flex items-center space-x-2 py-1">
                          <Checkbox 
                            id={`event-${event.id}`}
                            checked={(newChannel.events || []).includes(event.id)}
                            onCheckedChange={() => handleToggleEvent(event.id)}
                          />
                          <div>
                            <Label htmlFor={`event-${event.id}`} className="cursor-pointer">
                              {event.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </ScrollArea>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={newChannel.enabled}
                  onCheckedChange={(checked) => setNewChannel({...newChannel, enabled: checked})}
                />
                <Label htmlFor="enabled">Enable notifications</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setChannelDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveChannel} disabled={loading}>
                {editMode ? "Update Channel" : "Create Channel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="channels">
            <Bell className="h-4 w-4 mr-2" />
            Notification Channels
          </TabsTrigger>
          <TabsTrigger value="logs">
            <MessageSquare className="h-4 w-4 mr-2" />
            Notification Logs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="channels">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {channels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {getChannelIcon(channel.type)}
                      <div className="ml-2">
                        <CardTitle>{channel.name}</CardTitle>
                        <CardDescription>{getChannelName(channel.type)}</CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog open={selectedChannel?.id === channel.id && testDialogOpen} onOpenChange={(open) => {
                        setTestDialogOpen(open);
                        if (open) {
                          setSelectedChannel(channel);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Send className="h-4 w-4 mr-2" />
                            Test
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Test Notification</DialogTitle>
                            <DialogDescription>
                              Send a test notification to verify the channel configuration.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <div className="space-y-4">
                              <div className="bg-muted rounded-md p-4">
                                <h3 className="text-sm font-medium mb-2">Channel Details</h3>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type:</span>
                                    <span>{getChannelName(channel.type)}</span>
                                  </div>
                                  {channel.type === 'email' && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Recipients:</span>
                                      <span className="truncate max-w-[250px]">
                                        {channel.config.recipients?.join(', ')}
                                      </span>
                                    </div>
                                  )}
                                  {channel.type === 'slack' && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Channel:</span>
                                      <span>{channel.config.channel}</span>
                                    </div>
                                  )}
                                  {channel.type === 'webhook' && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">URL:</span>
                                      <span className="truncate max-w-[250px]">
                                        {channel.config.webhook_url}
                                      </span>
                                    </div>
                                  )}
                                  {channel.type === 'matrix' && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Room:</span>
                                      <span className="truncate max-w-[250px]">
                                        {channel.config.room_id}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm">
                                A test notification will be sent with the message:
                              </p>
                              <div className="bg-muted rounded-md p-3 text-sm">
                                <p>This is a test notification from Ansible UI</p>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleTestNotification} 
                              disabled={sending}
                            >
                              {sending ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Test
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditChannelDialog(channel)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteChannel(channel.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`toggle-${channel.id}`}
                          checked={channel.enabled}
                          onCheckedChange={(checked) => {
                            const updatedChannels = channels.map(c => {
                              if (c.id === channel.id) {
                                return { ...c, enabled: checked };
                              }
                              return c;
                            });
                            setChannels(updatedChannels);
                          }}
                        />
                        <Label htmlFor={`toggle-${channel.id}`}>
                          {channel.enabled ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Last sent: {channel.lastSent ? formatTimestamp(channel.lastSent) : "Never"}
                      </div>
                    </div>
                    
                    {channel.lastStatus === 'failed' && channel.lastError && (
                      <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                        <p className="font-medium">Error:</p>
                        <p>{channel.lastError}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Configuration</h3>
                      <div className="rounded-md border p-3 space-y-2 text-sm">
                        {channel.type === 'email' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Recipients:</span>
                              <span className="font-medium truncate max-w-[250px]">
                                {channel.config.recipients?.join(', ')}
                              </span>
                            </div>
                            {channel.config.from_address && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">From:</span>
                                <span className="font-medium">{channel.config.from_address}</span>
                              </div>
                            )}
                            {channel.config.subject_prefix && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Subject Prefix:</span>
                                <span className="font-medium">{channel.config.subject_prefix}</span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {channel.type === 'slack' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Webhook URL:</span>
                              <span className="font-medium truncate max-w-[250px]">
                                {channel.config.webhook_url?.substring(0, 30)}...
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Channel:</span>
                              <span className="font-medium">{channel.config.channel}</span>
                            </div>
                            {channel.config.username && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Username:</span>
                                <span className="font-medium">{channel.config.username}</span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {channel.type === 'webhook' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">URL:</span>
                              <span className="font-medium truncate max-w-[250px]">
                                {channel.config.webhook_url}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Method:</span>
                              <span className="font-medium">{channel.config.method || "POST"}</span>
                            </div>
                            {channel.config.headers && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Headers:</span>
                                <span className="font-medium truncate max-w-[250px]">
                                  {Object.keys(channel.config.headers).join(', ')}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {channel.type === 'matrix' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Homeserver:</span>
                              <span className="font-medium">{channel.config.homeserver}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Room ID:</span>
                              <span className="font-medium truncate max-w-[250px]">
                                {channel.config.room_id}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Events</h3>
                      <div className="flex flex-wrap gap-1">
                        {channel.events.map(eventId => {
                          const event = events.find(e => e.id === eventId);
                          return event ? (
                            <Badge key={eventId} variant="outline" className="bg-secondary/50">
                              {event.name}
                            </Badge>
                          ) : null;
                        })}
                        {channel.events.length === 0 && (
                          <span className="text-sm text-muted-foreground">No events configured</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="flex flex-col justify-center items-center p-8">
              <div className="text-center space-y-4">
                <div className="bg-muted rounded-full p-4 inline-block">
                  <Bell className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium">Add Notification Channel</h3>
                <p className="text-muted-foreground max-w-md">
                  Configure notification channels to receive alerts about playbook runs, system events, and security issues.
                </p>
                <Dialog open={channelDialogOpen} onOpenChange={(open) => {
                  setChannelDialogOpen(open);
                  if (!open) resetChannelForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Channel
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Notification Logs</CardTitle>
                  <CardDescription>History of sent notifications</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search logs..."
                        className="pl-8 w-[200px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </form>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead className="w-[300px]">Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getChannelIcon(log.channelType)}
                            <span className="ml-2">{log.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell>{log.event}</TableCell>
                        <TableCell>
                          {log.status === 'success' ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="truncate max-w-[200px]">{log.recipients}</TableCell>
                        <TableCell className="truncate max-w-[300px]">{log.message}</TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No notification logs found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline"
                onClick={() => {
                  // This would export logs to CSV in a real app
                  toast({
                    title: "Info",
                    description: "Logs would be exported to CSV"
                  });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
