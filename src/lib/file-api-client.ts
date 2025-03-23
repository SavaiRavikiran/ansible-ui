
import { toast } from "@/hooks/use-toast";

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'template';
  path: string;
  size?: string;
  lastModified: string;
  content?: string;
}

// API client for file operations
export const fileApiClient = {
  // Fetch files in a directory
  async fetchFiles(directoryPath: string, searchQuery: string = ''): Promise<FileItem[]> {
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(directoryPath)}&search=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch files');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  },
  
  // Read file content
  async readFile(filePath: string): Promise<string> {
    try {
      const response = await fetch(`/api/files/read?path=${encodeURIComponent(filePath)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to read file');
      }
      
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  },
  
  // Write file
  async writeFile(filePath: string, content: string): Promise<boolean> {
    try {
      const response = await fetch('/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to write file');
      }
      
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  },
  
  // Create directory
  async createDirectory(dirPath: string): Promise<boolean> {
    try {
      const response = await fetch('/api/files/mkdir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: dirPath }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create directory');
      }
      
      return true;
    } catch (error) {
      console.error('Error creating directory:', error);
      throw error;
    }
  },
  
  // Delete file or directory
  async deleteItem(itemPath: string, isDirectory: boolean): Promise<boolean> {
    try {
      const response = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: itemPath, isDirectory }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },
  
  // Upload file
  async uploadFile(directoryPath: string, file: File): Promise<FileItem> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directoryPath', directoryPath);
      
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
};
