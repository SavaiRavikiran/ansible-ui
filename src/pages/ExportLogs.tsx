
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

export default function ExportLogs() {
  const [logType, setLogType] = useState("playbook");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [format, setFormat] = useState("json");
  const [includeSystem, setIncludeSystem] = useState(true);
  const [includeDebug, setIncludeDebug] = useState(false);
  
  const handleExport = () => {
    toast.success("Logs export started", {
      description: "Your logs will be available shortly."
    });
  };

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Export Logs</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Export System Logs</CardTitle>
          <CardDescription>
            Export logs from your system for analysis or record-keeping
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="log-type">Log Type</Label>
            <Select value={logType} onValueChange={setLogType}>
              <SelectTrigger id="log-type">
                <SelectValue placeholder="Select log type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="playbook">Playbook Logs</SelectItem>
                <SelectItem value="system">System Logs</SelectItem>
                <SelectItem value="task">Task Logs</SelectItem>
                <SelectItem value="user">User Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <DatePicker
                selected={dateRange.from}
                onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                mode="single"
              />
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <DatePicker
                selected={dateRange.to}
                onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                mode="single"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="txt">Plain Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <Label>Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeSystem" 
                checked={includeSystem}
                onCheckedChange={(checked) => setIncludeSystem(checked as boolean)}
              />
              <Label htmlFor="includeSystem" className="cursor-pointer">Include system information</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeDebug" 
                checked={includeDebug}
                onCheckedChange={(checked) => setIncludeDebug(checked as boolean)}
              />
              <Label htmlFor="includeDebug" className="cursor-pointer">Include debug messages</Label>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline">Reset</Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Exports</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">System Logs {i}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(2023, 5, i * 3).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
