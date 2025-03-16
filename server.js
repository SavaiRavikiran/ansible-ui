
const express = require('express');
const cors = require('cors');
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
} = require('./dist/lib/ansible-service.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
