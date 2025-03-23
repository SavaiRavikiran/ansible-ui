import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Folder, File, Upload, Download, Plus, Trash, Edit, 
  Copy, FileUp, ExternalLink, FolderUp, RefreshCw, Search, FileCog
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fileApiClient } from "@/lib/file-api-client";

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'template';
  path: string;
  size?: string;
  lastModified: string;
  content?: string;
}

const FileManager = () => {
  const [currentPath, setCurrentPath] = useState<string>("/etc/ansible");
  const [items, setItems] = useState<FileItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState<boolean>(false);
  const [newFileDialogOpen, setNewFileDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems(currentPath);
    
    const parts = currentPath.split('/').filter(Boolean);
    setBreadcrumbs(['/', ...parts]);
  }, [currentPath]);

  const fetchItems = async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const fileItems = await fileApiClient.fetchFiles(path, searchQuery);
      setItems(fileItems);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError(`Failed to load directory: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load files and directories"
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    setCurrentPath(path);
  };

  const navigateUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length > 0) {
      parts.pop();
      const newPath = parts.length === 0 ? '/' : `/${parts.join('/')}`;
      setCurrentPath(newPath);
    }
  };

  const openItem = async (item: FileItem) => {
    if (item.type === 'folder') {
      navigateTo(item.path);
    } else {
      try {
        const content = await fileApiClient.readFile(item.path);
        const updatedItem = { ...item, content };
        setSelectedItem(updatedItem);
        setFileContent(content);
      } catch (error) {
        console.error('Error reading file:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to read file: ${error.message}`
        });
      }
    }
  };

  const handleUpload = async () => {
    if (fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0];
      
      setLoading(true);
      
      try {
        const newItem = await fileApiClient.uploadFile(currentPath, file);
        setItems([...items, newItem]);
        
        toast({
          title: "Success",
          description: `File ${file.name} uploaded successfully`,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to upload file: ${error.message}`
        });
      } finally {
        setLoading(false);
        setUploadDialogOpen(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleCreateFolder = async () => {
    if (!newItemName) return;
    
    try {
      setLoading(true);
      
      const dirPath = `${currentPath}/${newItemName}`;
      const success = await fileApiClient.createDirectory(dirPath);
      
      if (success) {
        await fetchItems(currentPath);
        
        toast({
          title: "Success",
          description: `Folder ${newItemName} created successfully`,
        });
        
        setNewItemName("");
        setNewFolderDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create folder: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFile = async () => {
    if (!newItemName) return;
    
    try {
      setLoading(true);
      
      const filePath = `${currentPath}/${newItemName}`;
      const success = await fileApiClient.writeFile(filePath, '');
      
      if (success) {
        await fetchItems(currentPath);
        
        toast({
          title: "Success",
          description: `File ${newItemName} created successfully`,
        });
        
        setNewItemName("");
        setNewFileDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create file: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedItem) return;
    
    try {
      setLoading(true);
      
      const success = await fileApiClient.writeFile(selectedItem.path, fileContent);
      
      if (success) {
        const updatedItem = {
          ...selectedItem,
          content: fileContent,
          lastModified: new Date().toISOString()
        };
        
        setSelectedItem(updatedItem);
        
        const updatedItems = items.map(item => {
          if (item.id === selectedItem.id) {
            return updatedItem;
          }
          return item;
        });
        
        setItems(updatedItems);
        
        toast({
          title: "Success",
          description: `File ${selectedItem.name} saved successfully`,
        });
        
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save file: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!selectedItem || !selectedItem.content) return;
    
    const element = document.createElement('a');
    const file = new Blob([selectedItem.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedItem.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleEditFile = () => {
    if (selectedItem && (selectedItem.type === 'file' || selectedItem.type === 'template')) {
      setFileContent(selectedItem.content || '');
      setEditDialogOpen(true);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      setLoading(true);
      
      const success = await fileApiClient.deleteItem(
        selectedItem.path, 
        selectedItem.type === 'folder'
      );
      
      if (success) {
        const updatedItems = items.filter(item => item.id !== selectedItem.id);
        setItems(updatedItems);
        
        toast({
          title: "Success",
          description: `${selectedItem.type === 'folder' ? 'Folder' : 'File'} ${selectedItem.name} deleted successfully`,
        });
        
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete ${selectedItem.type === 'folder' ? 'folder' : 'file'}: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchItems(currentPath);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems(currentPath);
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchItems(currentPath);
  };

  const getFileIcon = (item: FileItem) => {
    switch (item.type) {
      case 'folder': return <Folder className="h-4 w-4" />;
      case 'template': return <FileCog className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">File & Template Manager</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Select a file to upload to the current directory.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input id="file" type="file" ref={fileInputRef} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={loading}>
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>File Browser</CardTitle>
              <CardDescription>
                Browse files and directories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={navigateUp} disabled={currentPath === '/'}>
                  <FolderUp className="h-4 w-4 mr-2" />
                  Up
                </Button>
                <div className="text-sm text-muted-foreground overflow-hidden overflow-ellipsis whitespace-nowrap">
                  {currentPath}
                </div>
              </div>
              
              <div className="mb-4">
                <form onSubmit={handleSearch} className="flex space-x-2">
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="icon" variant="ghost">
                    <Search className="h-4 w-4" />
                  </Button>
                  {searchQuery && (
                    <Button type="button" size="icon" variant="ghost" onClick={clearSearch}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </form>
              </div>
              
              <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                  {error && (
                    <div className="text-center py-4 text-destructive">
                      {error}
                    </div>
                  )}
                  
                  {items.map((item) => (
                    <Button 
                      key={item.id}
                      variant={selectedItem?.id === item.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => openItem(item)}
                    >
                      {getFileIcon(item)}
                      <span className="ml-2">{item.name}</span>
                    </Button>
                  ))}
                  
                  {items.length === 0 && !loading && !error && (
                    <div className="text-center py-4 text-muted-foreground">
                      No files found.
                    </div>
                  )}
                  
                  {loading && (
                    <div className="text-center py-4 text-muted-foreground">
                      Loading...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Folder className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                    <DialogDescription>
                      Enter a name for the new folder.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="folder-name">Folder Name</Label>
                      <Input 
                        id="folder-name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFolder} disabled={!newItemName || loading}>
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={newFileDialogOpen} onOpenChange={setNewFileDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <File className="h-4 w-4 mr-2" />
                    New File
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New File</DialogTitle>
                    <DialogDescription>
                      Enter a name for the new file.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="file-name">File Name</Label>
                      <Input 
                        id="file-name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewFileDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFile} disabled={!newItemName || loading}>
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {selectedItem ? (
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {getFileIcon(selectedItem)}
                      <span className="ml-2">{selectedItem.name}</span>
                    </CardTitle>
                    <CardDescription>
                      {selectedItem.path}
                      {selectedItem.size && ` • ${selectedItem.size}`}
                      {` • Last modified: ${new Date(selectedItem.lastModified).toLocaleString()}`}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {(selectedItem.type === 'file' || selectedItem.type === 'template') && (
                      <>
                        <Button variant="outline" size="sm" onClick={handleEditFile}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </>
                    )}
                    <Button variant="destructive" size="sm" onClick={handleDeleteItem}>
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow">
                {(selectedItem.type === 'file' || selectedItem.type === 'template') && selectedItem.content !== undefined ? (
                  <ScrollArea className="h-[500px] w-full">
                    <pre className="p-4 rounded bg-muted font-mono text-sm">
                      {selectedItem.content}
                    </pre>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {selectedItem.type === 'folder' ? 'This is a folder. Double click to open.' : 'No content available.'}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex flex-col justify-center items-center p-8">
              <div className="text-center space-y-4">
                <div className="bg-primary/10 rounded-full p-4 inline-block">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-medium">No file selected</h3>
                <p className="text-muted-foreground max-w-md">
                  Select a file or folder from the file browser to view its details. You can also upload, create, or delete files and folders.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  <Button variant="outline" onClick={() => setNewFileDialogOpen(true)}>
                    <File className="h-4 w-4 mr-2" />
                    New File
                  </Button>
                  <Button variant="outline" onClick={() => setNewFolderDialogOpen(true)}>
                    <Folder className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit File: {selectedItem?.name}</DialogTitle>
            <DialogDescription>
              Make changes to the file content.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={fileContent} 
              onChange={(e) => setFileContent(e.target.value)}
              className="font-mono h-[500px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFile} disabled={loading}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileManager;
