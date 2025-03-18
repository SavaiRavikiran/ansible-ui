
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manual import of the ansible service functions
// This avoids direct import of TypeScript files
const ansibleServicePath = path.join(__dirname, 'src', 'lib', 'ansible-service.ts');
const tsContent = fs.readFileSync(ansibleServicePath, 'utf8');

// Import the required functions from JavaScript equivalent if it exists
// or use a simpler implementation
let ansibleService;
try {
  // Try to import from the compiled JS if it exists
  ansibleService = await import('./lib/ansible-service.js');
} catch (error) {
  console.warn('Could not load ansible-service.js, using simplified implementation.');
  
  // Simple mocked implementations for testing
  ansibleService = {
    getPlaybooks: async () => {
      console.log('Mock: getPlaybooks called');
      return [];
    },
    getInventories: async () => {
      console.log('Mock: getInventories called');
      return [];
    },
    getRoles: async () => {
      console.log('Mock: getRoles called');
      return [];
    },
    getHosts: async () => {
      console.log('Mock: getHosts called');
      return [];
    },
    getDashboardStats: async () => {
      console.log('Mock: getDashboardStats called');
      return {
        playbooks: 0,
        inventories: 0,
        roles: 0,
        hosts: 0,
        recentRuns: [],
        system: { cpu: '0%', memory: '0%', disk: '0%' }
      };
    },
    savePlaybook: async (playbook) => {
      console.log('Mock: savePlaybook called', playbook);
      return { ...playbook, id: 'mock-id' };
    },
    saveInventory: async (inventory) => {
      console.log('Mock: saveInventory called', inventory);
      return { ...inventory, id: 'mock-id' };
    },
    createRole: async (role) => {
      console.log('Mock: createRole called', role);
      return { ...role, id: 'mock-id' };
    },
    executePlaybook: async (playbookId, inventoryId) => {
      console.log('Mock: executePlaybook called', { playbookId, inventoryId });
      return { id: 'mock-run-id', status: 'success' };
    },
    addHostToInventory: async (inventoryId, host) => {
      console.log('Mock: addHostToInventory called', { inventoryId, host });
      return true;
    }
  };
}

const {
  getPlaybooks,
  getInventories,
  getRoles,
  getHosts, 
  getDashboardStats,
  savePlaybook,
  saveInventory,
  createRole,
  executePlaybook,
  addHostToInventory
} = ansibleService;

const app = express();
const PORT = process.env.PORT || 3001;

// Configure middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Add some basic logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Request started`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Response: ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Dashboard stats
app.get('/api/dashboard', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Playbooks
app.get('/api/playbooks', async (req, res) => {
  try {
    const playbooks = await getPlaybooks();
    res.json(playbooks);
  } catch (error) {
    console.error('Error fetching playbooks:', error);
    res.status(500).json({ error: 'Failed to fetch playbooks' });
  }
});

app.post('/api/playbooks', async (req, res) => {
  try {
    const playbook = await savePlaybook(req.body);
    res.json(playbook);
  } catch (error) {
    console.error('Error saving playbook:', error);
    res.status(500).json({ error: 'Failed to save playbook' });
  }
});

// Inventories
app.get('/api/inventories', async (req, res) => {
  try {
    const inventories = await getInventories();
    res.json(inventories);
  } catch (error) {
    console.error('Error fetching inventories:', error);
    res.status(500).json({ error: 'Failed to fetch inventories' });
  }
});

app.post('/api/inventories', async (req, res) => {
  try {
    const inventory = await saveInventory(req.body);
    res.json(inventory);
  } catch (error) {
    console.error('Error saving inventory:', error);
    res.status(500).json({ error: 'Failed to save inventory' });
  }
});

// Roles
app.get('/api/roles', async (req, res) => {
  try {
    const roles = await getRoles();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

app.post('/api/roles', async (req, res) => {
  try {
    const role = await createRole(req.body);
    res.json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Hosts
app.get('/api/hosts', async (req, res) => {
  try {
    const hosts = await getHosts();
    res.json(hosts);
  } catch (error) {
    console.error('Error fetching hosts:', error);
    res.status(500).json({ error: 'Failed to fetch hosts' });
  }
});

app.post('/api/hosts', async (req, res) => {
  try {
    const { inventoryId, host } = req.body;
    const success = await addHostToInventory(inventoryId, host);
    
    if (success) {
      res.json({ success: true, host });
    } else {
      res.status(500).json({ error: 'Failed to add host to inventory' });
    }
  } catch (error) {
    console.error('Error adding host:', error);
    res.status(500).json({ error: 'Failed to add host' });
  }
});

// Execute playbook
app.post('/api/execute-playbook', async (req, res) => {
  try {
    const { playbookId, inventoryId } = req.body;
    const result = await executePlaybook(playbookId, inventoryId);
    res.json(result);
  } catch (error) {
    console.error('Error executing playbook:', error);
    res.status(500).json({ error: 'Failed to execute playbook' });
  }
});

// Serve static files from the React app
app.use(express.static('dist'));

// Catch-all route to return the main index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile('dist/index.html', { root: __dirname });
});

// Start the server
app.listen(PORT, () => {
  console.log(`
  ============================================
  🚀 Ansible UI Server running on port ${PORT} 🚀
  
  Local:            http://localhost:${PORT}
  Network:          http://${getLocalIpAddress()}:${PORT}
  
  Configuration:
  - Playbooks dir:  ${process.env.ANSIBLE_PLAYBOOKS_DIR || '/etc/ansible/playbooks'}
  - Inventories:    ${process.env.ANSIBLE_INVENTORIES_DIR || '/etc/ansible/inventories'}
  - Roles:          ${process.env.ANSIBLE_ROLES_DIR || '/etc/ansible/roles'}
  ============================================
  `);
});

// Helper function to get the local IP address
function getLocalIpAddress() {
  const nets = os.networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  
  return 'localhost';
}
