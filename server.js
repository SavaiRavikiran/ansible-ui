
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const { exec } = require('child_process');
const { createServer: createViteServer } = require('vite');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Utility function for executing commands
const execCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`Command stderr: ${stderr}`);
      }
      resolve(stdout.trim());
    });
  });
};

// Format file size for display
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// API endpoint to list files in a directory
app.get('/api/files', async (req, res) => {
  try {
    const directoryPath = req.query.path || '/etc/ansible';
    const searchQuery = req.query.search || '';
    
    if (!fs.existsSync(directoryPath)) {
      return res.status(404).json({ message: `Directory does not exist: ${directoryPath}` });
    }
    
    const files = await fs.promises.readdir(directoryPath);
    const fileItems = [];
    
    for (const file of files) {
      try {
        const filePath = path.join(directoryPath, file);
        const stats = await fs.promises.stat(filePath);
        
        if (searchQuery && !file.toLowerCase().includes(searchQuery.toLowerCase())) {
          continue;
        }
        
        if (stats.isDirectory()) {
          fileItems.push({
            id: Buffer.from(filePath).toString('base64'),
            name: file,
            type: 'folder',
            path: filePath,
            lastModified: stats.mtime.toISOString()
          });
        } else {
          const isTemplate = file.endsWith('.j2') || file.endsWith('.template') || file.endsWith('.tpl');
          
          fileItems.push({
            id: Buffer.from(filePath).toString('base64'),
            name: file,
            type: isTemplate ? 'template' : 'file',
            path: filePath,
            size: formatFileSize(stats.size),
            lastModified: stats.mtime.toISOString()
          });
        }
      } catch (fileError) {
        console.error(`Error processing file ${file}:`, fileError);
      }
    }
    
    fileItems.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
    
    res.json(fileItems);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ message: `Error listing files: ${error.message}` });
  }
});

// API endpoint to read file content
app.get('/api/files/read', async (req, res) => {
  try {
    const filePath = req.query.path;
    
    if (!filePath) {
      return res.status(400).json({ message: 'File path is required' });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: `File does not exist: ${filePath}` });
    }
    
    const stats = await fs.promises.stat(filePath);
    
    if (stats.isDirectory()) {
      return res.status(400).json({ message: 'Cannot read content of a directory' });
    }
    
    const content = await fs.promises.readFile(filePath, 'utf8');
    
    res.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ message: `Error reading file: ${error.message}` });
  }
});

// API endpoint to write file content
app.post('/api/files/write', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ message: 'File path is required' });
    }
    
    // Ensure directory exists
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    
    await fs.promises.writeFile(filePath, content, 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ message: `Error writing file: ${error.message}` });
  }
});

// API endpoint to create directory
app.post('/api/files/mkdir', async (req, res) => {
  try {
    const { path: dirPath } = req.body;
    
    if (!dirPath) {
      return res.status(400).json({ message: 'Directory path is required' });
    }
    
    await fs.promises.mkdir(dirPath, { recursive: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating directory:', error);
    res.status(500).json({ message: `Error creating directory: ${error.message}` });
  }
});

// API endpoint to delete file or directory
app.delete('/api/files/delete', async (req, res) => {
  try {
    const { path: itemPath, isDirectory } = req.body;
    
    if (!itemPath) {
      return res.status(400).json({ message: 'Item path is required' });
    }
    
    if (!fs.existsSync(itemPath)) {
      return res.status(404).json({ message: `Item does not exist: ${itemPath}` });
    }
    
    if (isDirectory) {
      await fs.promises.rmdir(itemPath, { recursive: true });
    } else {
      await fs.promises.unlink(itemPath);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: `Error deleting item: ${error.message}` });
  }
});

// API endpoint to upload file
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const directoryPath = req.body.directoryPath || '/etc/ansible';
    const fileName = req.file.originalname;
    const filePath = path.join(directoryPath, fileName);
    
    // Ensure directory exists
    await fs.promises.mkdir(directoryPath, { recursive: true });
    
    // Write the file
    await fs.promises.writeFile(filePath, req.file.buffer);
    
    // Get file stats
    const stats = await fs.promises.stat(filePath);
    
    const isTemplate = fileName.endsWith('.j2') || fileName.endsWith('.template') || fileName.endsWith('.tpl');
    
    // Return the new file item
    const fileItem = {
      id: Buffer.from(filePath).toString('base64'),
      name: fileName,
      type: isTemplate ? 'template' : 'file',
      path: filePath,
      size: formatFileSize(req.file.size),
      lastModified: stats.mtime.toISOString()
    };
    
    res.json(fileItem);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: `Error uploading file: ${error.message}` });
  }
});

// Development server setup with Vite
async function createServer() {
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Start the server
createServer().catch((err) => {
  console.error('Error starting server:', err);
});
