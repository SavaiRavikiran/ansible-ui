
import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import multer from 'multer';
import cors from 'cors';
import { exec } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import {
  getDashboardStats,
  getPlaybooks,
  getInventories,
  getRoles,
  getHosts,
  savePlaybook,
  saveInventory,
  createRole,
  executePlaybook,
  addHostToInventory
} from './lib/ansible-service.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Check if path exists
const pathExists = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch (error) {
    return false;
  }
};

// Check if Ansible is installed and working properly
const checkAnsibleAvailability = async () => {
  try {
    const result = await execCommand('ansible --version');
    return { available: true, version: result.split('\n')[0] };
  } catch (error) {
    console.warn('Ansible not found or not working properly:', error.message);
    return { available: false, error: error.message };
  }
};

// API endpoint to check Ansible availability
app.get('/api/ansible-status', async (req, res) => {
  try {
    const status = await checkAnsibleAvailability();
    res.json(status);
  } catch (error) {
    console.error('Error checking Ansible status:', error);
    res.status(500).json({ 
      message: `Error checking Ansible status: ${error.message}`,
      available: false
    });
  }
});

// API endpoints for the Ansible UI
app.get('/api/dashboard', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: `Error fetching dashboard stats: ${error.message}` });
  }
});

// API endpoint to search for Ansible resources in custom paths
app.post('/api/search-ansible-resources', async (req, res) => {
  try {
    const { customPath } = req.body;
    
    if (!customPath) {
      return res.status(400).json({ message: 'Custom path is required' });
    }
    
    // Check if the path exists
    try {
      const exists = await pathExists(customPath);
      if (!exists) {
        return res.status(404).json({ 
          message: `Directory does not exist: ${customPath}`,
          exists: false 
        });
      }
    } catch (error) {
      return res.status(404).json({ 
        message: `Error checking directory: ${customPath}, ${error.message}`,
        exists: false 
      });
    }
    
    // Check for common Ansible structures
    const hasPlaybooks = await pathExists(path.join(customPath, 'playbooks')) || 
                         await pathExists(path.join(customPath, 'site.yml'));
    const hasInventories = await pathExists(path.join(customPath, 'inventories')) || 
                           await pathExists(path.join(customPath, 'hosts'));
    const hasRoles = await pathExists(path.join(customPath, 'roles'));
    
    res.json({
      exists: true,
      hasAnsibleResources: hasPlaybooks || hasInventories || hasRoles,
      resources: {
        playbooks: hasPlaybooks,
        inventories: hasInventories,
        roles: hasRoles
      }
    });
  } catch (error) {
    console.error('Error searching for Ansible resources:', error);
    res.status(500).json({ message: `Error searching for Ansible resources: ${error.message}` });
  }
});

// Helper function to create sample Ansible project
const createSampleAnsibleProject = async (targetDir) => {
  try {
    // Create directory structure
    await fs.mkdir(targetDir, { recursive: true });
    await fs.mkdir(path.join(targetDir, 'playbooks'), { recursive: true });
    await fs.mkdir(path.join(targetDir, 'inventories'), { recursive: true });
    await fs.mkdir(path.join(targetDir, 'roles'), { recursive: true });
    
    // Create sample playbook
    const samplePlaybook = `---
# Description: Sample playbook for beginners
- name: Sample Playbook
  hosts: all
  become: true
  
  tasks:
    - name: Ensure system is updated
      apt:
        update_cache: yes
        upgrade: dist
      when: ansible_os_family == "Debian"
      
    - name: Print system information
      debug:
        msg: "Running on {{ ansible_distribution }} {{ ansible_distribution_version }}"
`;
    
    await fs.writeFile(path.join(targetDir, 'playbooks', 'sample.yml'), samplePlaybook);
    
    // Create sample inventory
    const sampleInventory = `[webservers]
web1.example.com
web2.example.com

[dbservers]
db1.example.com

[all:vars]
ansible_user=ansible
`;
    
    await fs.writeFile(path.join(targetDir, 'inventories', 'hosts'), sampleInventory);
    
    // Create ansible.cfg
    const ansibleConfig = `[defaults]
inventory = ./inventories/hosts
remote_user = ansible
host_key_checking = False
roles_path = ./roles
`;
    
    await fs.writeFile(path.join(targetDir, 'ansible.cfg'), ansibleConfig);
    
    return {
      success: true,
      path: targetDir
    };
  } catch (error) {
    console.error('Error creating sample Ansible project:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// API endpoint to create sample Ansible project
app.post('/api/create-sample-project', async (req, res) => {
  try {
    const { targetDir } = req.body;
    
    if (!targetDir) {
      return res.status(400).json({ message: 'Target directory is required' });
    }
    
    const result = await createSampleAnsibleProject(targetDir);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Sample Ansible project created successfully',
        path: result.path
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to create sample project: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Error creating sample Ansible project:', error);
    res.status(500).json({ message: `Error creating sample Ansible project: ${error.message}` });
  }
});

app.get('/api/playbooks', async (req, res) => {
  try {
    const playbooks = await getPlaybooks();
    res.json(playbooks);
  } catch (error) {
    console.error('Error fetching playbooks:', error);
    res.status(500).json({ message: `Error fetching playbooks: ${error.message}` });
  }
});

app.get('/api/inventories', async (req, res) => {
  try {
    const inventories = await getInventories();
    res.json(inventories);
  } catch (error) {
    console.error('Error fetching inventories:', error);
    res.status(500).json({ message: `Error fetching inventories: ${error.message}` });
  }
});

app.get('/api/roles', async (req, res) => {
  try {
    const roles = await getRoles();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: `Error fetching roles: ${error.message}` });
  }
});

app.get('/api/hosts', async (req, res) => {
  try {
    const hosts = await getHosts();
    res.json(hosts);
  } catch (error) {
    console.error('Error fetching hosts:', error);
    res.status(500).json({ message: `Error fetching hosts: ${error.message}` });
  }
});

app.post('/api/playbooks', async (req, res) => {
  try {
    const playbook = await savePlaybook(req.body);
    res.json(playbook);
  } catch (error) {
    console.error('Error saving playbook:', error);
    res.status(500).json({ message: `Error saving playbook: ${error.message}` });
  }
});

app.post('/api/inventories', async (req, res) => {
  try {
    const inventory = await saveInventory(req.body);
    res.json(inventory);
  } catch (error) {
    console.error('Error saving inventory:', error);
    res.status(500).json({ message: `Error saving inventory: ${error.message}` });
  }
});

app.post('/api/roles', async (req, res) => {
  try {
    const role = await createRole(req.body);
    res.json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: `Error creating role: ${error.message}` });
  }
});

app.post('/api/hosts', async (req, res) => {
  try {
    const { inventoryId, host } = req.body;
    const success = await addHostToInventory(inventoryId, host);
    res.json({ success });
  } catch (error) {
    console.error('Error adding host:', error);
    res.status(500).json({ message: `Error adding host: ${error.message}` });
  }
});

app.post('/api/execute-playbook', async (req, res) => {
  try {
    const { playbookId, inventoryId } = req.body;
    const result = await executePlaybook(playbookId, inventoryId);
    res.json(result);
  } catch (error) {
    console.error('Error executing playbook:', error);
    res.status(500).json({ message: `Error executing playbook: ${error.message}` });
  }
});

// API endpoint to list files in a directory
app.get('/api/files', async (req, res) => {
  try {
    const directoryPath = req.query.path || '/etc/ansible';
    const searchQuery = req.query.search || '';
    
    const dirExists = await pathExists(directoryPath);
    if (!dirExists) {
      return res.status(404).json({ message: `Directory does not exist: ${directoryPath}` });
    }
    
    const files = await fs.readdir(directoryPath);
    const fileItems = [];
    
    for (const file of files) {
      try {
        const filePath = path.join(directoryPath, file);
        const stats = await fs.stat(filePath);
        
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
    
    const exists = await pathExists(filePath);
    if (!exists) {
      return res.status(404).json({ message: `File does not exist: ${filePath}` });
    }
    
    const stats = await fs.stat(filePath);
    
    if (stats.isDirectory()) {
      return res.status(400).json({ message: 'Cannot read content of a directory' });
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    
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
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    await fs.writeFile(filePath, content, 'utf8');
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
    
    await fs.mkdir(dirPath, { recursive: true });
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
    
    const exists = await pathExists(itemPath);
    if (!exists) {
      return res.status(404).json({ message: `Item does not exist: ${itemPath}` });
    }
    
    if (isDirectory) {
      await fs.rmdir(itemPath, { recursive: true });
    } else {
      await fs.unlink(itemPath);
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
    await fs.mkdir(directoryPath, { recursive: true });
    
    // Write the file
    await fs.writeFile(filePath, req.file.buffer);
    
    // Get file stats
    const stats = await fs.stat(filePath);
    
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Main startup function
async function startServer() {
  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode...`);
  
  // Check if we're in a Docker container
  const isDocker = await pathExists('/.dockerenv') || 
                   (await pathExists('/proc/1/cgroup') && 
                   (await fs.readFile('/proc/1/cgroup', 'utf8')).includes('docker'));
  
  console.log(`Running in Docker: ${isDocker ? 'Yes' : 'No'}`);
  console.log(`Ansible directories:`);
  console.log(`- Playbooks: ${process.env.ANSIBLE_PLAYBOOKS_DIR || '/etc/ansible/playbooks'}`);
  console.log(`- Inventories: ${process.env.ANSIBLE_INVENTORIES_DIR || '/etc/ansible/inventories'}`);
  console.log(`- Roles: ${process.env.ANSIBLE_ROLES_DIR || '/etc/ansible/roles'}`);
  
  // Check Ansible availability
  const ansibleStatus = await checkAnsibleAvailability();
  console.log(`Ansible availability: ${ansibleStatus.available ? 'Yes' : 'No'}`);
  if (ansibleStatus.available) {
    console.log(`Ansible version: ${ansibleStatus.version}`);
  }
  
  // In development, set up Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    try {
      // Create Vite server in middleware mode
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      
      // Use vite's connect instance as middleware
      app.use(vite.middlewares);
      
      console.log('Vite development server middleware is active');
    } catch (error) {
      console.error('Error creating Vite development server:', error);
    }
  } else {
    // Serve static files from the build directory in production
    const staticPath = path.join(__dirname, 'dist');
    console.log(`Serving static files from: ${staticPath}`);
    app.use(express.static(staticPath));
    
    // For SPA, serve index.html for any route not matched by API routes or static files
    app.get('*', (req, res) => {
      const indexPath = path.join(__dirname, 'dist', 'index.html');
      console.log(`Serving index.html from: ${indexPath}`);
      res.sendFile(indexPath);
    });
  }

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
  });
}

// Start the server
startServer().catch((err) => {
  console.error('Error starting server:', err);
});
