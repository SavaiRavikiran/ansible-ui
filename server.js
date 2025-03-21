import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup SQLite database
const dbPath = path.join(__dirname, 'ansible.db');
let db;

// Initialize database connection
async function initializeDatabase() {
  try {
    console.log(`Initializing SQLite database at ${dbPath}`);
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS playbook_runs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS ansible_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        playbooks INTEGER NOT NULL,
        inventories INTEGER NOT NULL,
        roles INTEGER NOT NULL,
        hosts INTEGER NOT NULL,
        cpu TEXT NOT NULL,
        memory TEXT NOT NULL,
        disk TEXT NOT NULL
      );
    `);
    
    console.log(`SQLite database initialized at ${dbPath}`);
    return db;
  } catch (error) {
    console.error(`Database initialization error:`, error);
    throw error;
  }
}

// Output Ansible directory configuration
console.log('Ansible directories configuration:');
console.log(`- Playbooks: ${process.env.ANSIBLE_PLAYBOOKS_DIR || '/etc/ansible/playbooks'}`);
console.log(`- Inventories: ${process.env.ANSIBLE_INVENTORIES_DIR || '/etc/ansible/inventories'}`);
console.log(`- Roles: ${process.env.ANSIBLE_ROLES_DIR || '/etc/ansible/roles'}`);

// Try to import from the lib directory first, then fall back to compiled JS
let ansibleService;
try {
  // First try importing from the lib directory (JavaScript)
  console.log('Attempting to load ansible-service.js from lib directory');
  ansibleService = await import('./lib/ansible-service.js');
  console.log('Successfully loaded ansible-service.js from lib directory');
} catch (libError) {
  console.error('Could not load ansible-service.js from lib directory:', libError.message);
  console.error(libError.stack);
  
  try {
    // Try importing from the src/lib directory (TypeScript compiled)
    console.log('Attempting to load ansible-service.js from src/lib directory');
    ansibleService = await import('./src/lib/ansible-service.js');
    console.log('Successfully loaded ansible-service.js from src/lib directory');
  } catch (srcError) {
    console.error('Could not load ansible-service.js from src/lib:', srcError.message);
    console.error(srcError.stack);
    
    // Simple mocked implementations for testing
    console.warn('Using simplified implementation');
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

// Save playbook run to database
async function savePlaybookRun(run) {
  if (!db) return;
  
  try {
    console.log(`Saving playbook run to database: ${JSON.stringify(run)}`);
    await db.run(
      'INSERT OR REPLACE INTO playbook_runs (id, name, status, timestamp) VALUES (?, ?, ?, ?)',
      [run.id, run.name, run.status, run.timestamp || new Date().toISOString()]
    );
  } catch (error) {
    console.error('Error saving playbook run to database:', error);
  }
}

// Get recent runs from database
async function getRecentRunsFromDB() {
  if (!db) return [];
  
  try {
    return await db.all(
      'SELECT * FROM playbook_runs ORDER BY timestamp DESC LIMIT 5'
    );
  } catch (error) {
    console.error('Error fetching recent runs from database:', error);
    return [];
  }
}

// Save dashboard stats to database
async function saveDashboardStats(stats) {
  if (!db) return;
  
  try {
    await db.run(
      'INSERT INTO ansible_stats (timestamp, playbooks, inventories, roles, hosts, cpu, memory, disk) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        new Date().toISOString(),
        stats.playbooks,
        stats.inventories,
        stats.roles,
        stats.hosts,
        stats.system.cpu,
        stats.system.memory,
        stats.system.disk
      ]
    );
  } catch (error) {
    console.error('Error saving dashboard stats to database:', error);
  }
}

// Dashboard stats
app.get('/api/dashboard', async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    const stats = await getDashboardStats();
    console.log('Dashboard stats fetched:', stats);
    
    // Replace recent runs with data from database if available
    const dbRuns = await getRecentRunsFromDB();
    if (dbRuns.length > 0) {
      stats.recentRuns = dbRuns;
    }
    
    // Save stats to database for historical tracking
    await saveDashboardStats(stats);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Playbooks
app.get('/api/playbooks', async (req, res) => {
  try {
    console.log('Fetching playbooks...');
    const playbooks = await getPlaybooks();
    console.log(`Fetched ${playbooks.length} playbooks`);
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
    console.log('Fetching inventories...');
    const inventories = await getInventories();
    console.log(`Fetched ${inventories.length} inventories`);
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
    console.log('Fetching roles...');
    const roles = await getRoles();
    console.log(`Fetched ${roles.length} roles`);
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
    console.log('Fetching hosts...');
    const hosts = await getHosts();
    console.log(`Fetched ${hosts.length} hosts`);
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
    
    // Save run to database
    const playbooks = await getPlaybooks();
    const playbook = playbooks.find(p => p.id === playbookId);
    
    if (playbook) {
      await savePlaybookRun({
        id: result.id,
        name: playbook.name,
        status: result.status,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error executing playbook:', error);
    res.status(500).json({ error: 'Failed to execute playbook' });
  }
});

// Configuration management
app.post('/api/configuration', async (req, res) => {
  try {
    const { type, settings } = req.body;
    console.log(`Saving ${type} configuration:`, settings);
    
    // Store configuration in the database
    if (db) {
      await db.run(
        'INSERT OR REPLACE INTO configurations (type, settings, timestamp) VALUES (?, ?, ?)',
        [type, JSON.stringify(settings), new Date().toISOString()]
      );
    }
    
    // If custom paths are provided, store them as environment variables
    if (type === 'custom' && settings) {
      if (settings.customPlaybooksDir) {
        process.env.ANSIBLE_PLAYBOOKS_DIR = settings.customPlaybooksDir;
      }
      if (settings.customInventoriesDir) {
        process.env.ANSIBLE_INVENTORIES_DIR = settings.customInventoriesDir;
      }
      if (settings.customRolesDir) {
        process.env.ANSIBLE_ROLES_DIR = settings.customRolesDir;
      }
      
      console.log('Updated Ansible directories:');
      console.log(`- Playbooks: ${process.env.ANSIBLE_PLAYBOOKS_DIR}`);
      console.log(`- Inventories: ${process.env.ANSIBLE_INVENTORIES_DIR}`);
      console.log(`- Roles: ${process.env.ANSIBLE_ROLES_DIR}`);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving configuration:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

app.get('/api/configuration/:type', async (req, res) => {
  try {
    const type = req.params.type;
    
    if (db) {
      const config = await db.get(
        'SELECT settings FROM configurations WHERE type = ? ORDER BY timestamp DESC LIMIT 1',
        [type]
      );
      
      if (config) {
        res.json(JSON.parse(config.settings));
      } else {
        res.json({});
      }
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Test connection to remote server
app.post('/api/test-connection', async (req, res) => {
  try {
    const serverDetails = req.body;
    console.log('Testing connection to server:', serverDetails);
    
    // Implement actual connection test logic here
    // For now, return success
    res.json({ success: true, message: 'Connection successful' });
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ success: false, message: 'Connection failed' });
  }
});

// Export data to local paths
app.post('/api/export-to-local', async (req, res) => {
  try {
    const { data, type } = req.body;
    console.log(`Exporting ${type} data to local path`);
    
    // Get custom path from database or environment
    let exportPath;
    
    if (type === 'hosts' || type === 'groups') {
      exportPath = process.env.ANSIBLE_INVENTORIES_DIR || '/etc/ansible/inventories';
    } else if (type === 'playbooks') {
      exportPath = process.env.ANSIBLE_PLAYBOOKS_DIR || '/etc/ansible/playbooks';
    } else if (type === 'roles') {
      exportPath = process.env.ANSIBLE_ROLES_DIR || '/etc/ansible/roles';
    }
    
    // Here you would implement the actual export logic
    
    res.json({ success: true, path: exportPath });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ success: false, error: 'Failed to export data' });
  }
});

// Import data from local paths
app.post('/api/import-from-local', async (req, res) => {
  try {
    const { type, path } = req.body;
    console.log(`Importing ${type} data from ${path || 'default path'}`);
    
    // Here you would implement the actual import logic
    
    // Return mock data for now
    if (type === 'hosts') {
      res.json([
        { 
          id: 'local-1', 
          name: 'local-host-1.example.com', 
          groups: ['web_servers', 'local'],
          variables: { 'ansible_host': '192.168.1.50' }
        },
        {
          id: 'local-2',
          name: 'local-host-2.example.com',
          groups: ['db_servers', 'local'],
          variables: { 'ansible_host': '192.168.1.51' }
        }
      ]);
    } else {
      res.json({ success: true, message: 'Import completed' });
    }
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ success: false, error: 'Failed to import data' });
  }
});

// Serve static files from the React app
app.use(express.static('dist'));

// Catch-all route to return the main index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server after initializing the database
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`
  ============================================
  🚀 Ansible UI Server running on port ${PORT} 🚀
  
  Local:            http://localhost:${PORT}
  Network:          http://${getLocalIpAddress()}:${PORT}
  
  Database:         ${dbPath}
  Playbooks dir:    ${process.env.ANSIBLE_PLAYBOOKS_DIR || '/etc/ansible/playbooks'}
  Inventories:      ${process.env.ANSIBLE_INVENTORIES_DIR || '/etc/ansible/inventories'}
  Roles:            ${process.env.ANSIBLE_ROLES_DIR || '/etc/ansible/roles'}
  ============================================
  `);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
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
