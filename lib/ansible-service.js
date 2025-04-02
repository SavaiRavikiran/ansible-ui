import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';

// Utility function to execute commands
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

// Configuration - update these paths to match your Ansible setup
const ANSIBLE_CONFIG = {
  playbooksDir: process.env.ANSIBLE_PLAYBOOKS_DIR || '/etc/ansible/playbooks',
  inventoriesDir: process.env.ANSIBLE_INVENTORIES_DIR || '/etc/ansible/inventories',
  rolesDir: process.env.ANSIBLE_ROLES_DIR || '/etc/ansible/roles',
  configFile: process.env.ANSIBLE_CONFIG_FILE || '/etc/ansible/ansible.cfg',
};

// File operations with error handling
const readFileAsync = async (filePath) => {
  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return '';
  }
};

const writeFileAsync = async (filePath, content) => {
  try {
    // Ensure directory exists
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

// Get available playbooks
export const getPlaybooks = async () => {
  try {
    const playbooks = [];
    
    // Check if directory exists
    if (!fs.existsSync(ANSIBLE_CONFIG.playbooksDir)) {
      console.warn(`Playbooks directory does not exist: ${ANSIBLE_CONFIG.playbooksDir}`);
      try {
        // Try to create the directory if it doesn't exist
        await fs.promises.mkdir(ANSIBLE_CONFIG.playbooksDir, { recursive: true });
        console.log(`Created playbooks directory: ${ANSIBLE_CONFIG.playbooksDir}`);
      } catch (mkdirError) {
        console.error(`Failed to create playbooks directory: ${mkdirError}`);
      }
      return playbooks;
    }
    
    const files = await fs.promises.readdir(ANSIBLE_CONFIG.playbooksDir);
    
    for (const file of files) {
      if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        const filePath = path.join(ANSIBLE_CONFIG.playbooksDir, file);
        const stats = await fs.promises.stat(filePath);
        const content = await readFileAsync(filePath);
        
        // Extract description from playbook content if available
        const descriptionMatch = content.match(/^#\s*Description:\s*(.*)$/m);
        const description = descriptionMatch ? descriptionMatch[1] : 'No description available';
        
        playbooks.push({
          id: Buffer.from(filePath).toString('base64'),
          name: file,
          description,
          path: filePath,
          lastModified: stats.mtime.toISOString(),
          content,
        });
      }
    }
    
    return playbooks;
  } catch (error) {
    console.error('Error loading playbooks:', error);
    return [];
  }
};

// Get available inventories
export const getInventories = async () => {
  try {
    const inventories = [];
    
    if (!fs.existsSync(ANSIBLE_CONFIG.inventoriesDir)) {
      console.warn(`Inventories directory does not exist: ${ANSIBLE_CONFIG.inventoriesDir}`);
      try {
        // Try to create the directory if it doesn't exist
        await fs.promises.mkdir(ANSIBLE_CONFIG.inventoriesDir, { recursive: true });
        console.log(`Created inventories directory: ${ANSIBLE_CONFIG.inventoriesDir}`);
      } catch (mkdirError) {
        console.error(`Failed to create inventories directory: ${mkdirError}`);
      }
      return inventories;
    }
    
    const directories = await fs.promises.readdir(ANSIBLE_CONFIG.inventoriesDir);
    
    for (const dir of directories) {
      const dirPath = path.join(ANSIBLE_CONFIG.inventoriesDir, dir);
      const stats = await fs.promises.stat(dirPath);
      
      if (stats.isDirectory()) {
        // For directories, check for hosts file
        const hostsPath = path.join(dirPath, 'hosts');
        let content = '';
        
        if (fs.existsSync(hostsPath)) {
          content = await readFileAsync(hostsPath);
        } else {
          // Check for inventory files directly
          const inventoryFiles = await fs.promises.readdir(dirPath);
          for (const file of inventoryFiles) {
            if (file === 'hosts.yml' || file === 'hosts.yaml' || file === 'inventory.yml' || file === 'inventory.yaml') {
              content = await readFileAsync(path.join(dirPath, file));
              break;
            }
          }
        }
        
        inventories.push({
          id: Buffer.from(dirPath).toString('base64'),
          name: dir,
          description: `Inventory for ${dir}`,
          path: dirPath,
          lastModified: stats.mtime.toISOString(),
          content,
        });
      } else if (stats.isFile() && (dir.endsWith('.yml') || dir.endsWith('.yaml') || dir === 'hosts')) {
        // For individual inventory files
        const content = await readFileAsync(dirPath);
        
        inventories.push({
          id: Buffer.from(dirPath).toString('base64'),
          name: dir,
          description: `Inventory file`,
          path: dirPath,
          lastModified: stats.mtime.toISOString(),
          content,
        });
      }
    }
    
    return inventories;
  } catch (error) {
    console.error('Error loading inventories:', error);
    return [];
  }
};

// Get available roles
export const getRoles = async () => {
  try {
    const roles = [];
    
    if (!fs.existsSync(ANSIBLE_CONFIG.rolesDir)) {
      console.warn(`Roles directory does not exist: ${ANSIBLE_CONFIG.rolesDir}`);
      try {
        // Try to create the directory if it doesn't exist
        await fs.promises.mkdir(ANSIBLE_CONFIG.rolesDir, { recursive: true });
        console.log(`Created roles directory: ${ANSIBLE_CONFIG.rolesDir}`);
      } catch (mkdirError) {
        console.error(`Failed to create roles directory: ${mkdirError}`);
      }
      return roles;
    }
    
    const directories = await fs.promises.readdir(ANSIBLE_CONFIG.rolesDir);
    
    for (const dir of directories) {
      const dirPath = path.join(ANSIBLE_CONFIG.rolesDir, dir);
      const stats = await fs.promises.stat(dirPath);
      
      if (stats.isDirectory()) {
        // Check for meta/main.yml to get role description
        const metaPath = path.join(dirPath, 'meta', 'main.yml');
        let description = `Role: ${dir}`;
        
        if (fs.existsSync(metaPath)) {
          const metaContent = await readFileAsync(metaPath);
          const descMatch = metaContent.match(/description:\s*(.+)$/m);
          if (descMatch) {
            description = descMatch[1];
          }
        }
        
        roles.push({
          id: Buffer.from(dirPath).toString('base64'),
          name: dir,
          description,
          path: dirPath,
          lastModified: stats.mtime.toISOString(),
        });
      }
    }
    
    return roles;
  } catch (error) {
    console.error('Error loading roles:', error);
    return [];
  }
};

// Get hosts from all inventories
export const getHosts = async () => {
  try {
    const hosts = [];
    const inventories = await getInventories();
    let hostId = 1;
    
    for (const inventory of inventories) {
      if (!inventory.content) continue;
      
      // Parse inventory content
      const lines = inventory.content.split('\n');
      let currentGroup = '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        
        // Check if this is a group
        if (trimmedLine.match(/^\[.+\]$/)) {
          currentGroup = trimmedLine.substring(1, trimmedLine.length - 1);
          continue;
        }
        
        // Process host entry
        if (currentGroup && !trimmedLine.includes('=')) {
          const hostParts = trimmedLine.split(/\s+/);
          const hostName = hostParts[0];
          
          // Skip if it's not a valid hostname
          if (!hostName || hostName.includes('[')) continue;
          
          // Extract variables from the line
          const variables = {};
          
          hostParts.slice(1).forEach(part => {
            const varMatch = part.match(/(.+)=(.+)/);
            if (varMatch) {
              variables[varMatch[1]] = varMatch[2].replace(/["']/g, '');
            }
          });
          
          // Check if this host is already in our list
          const existingHost = hosts.find(h => h.name === hostName);
          
          if (existingHost) {
            // Add this group to existing host
            if (!existingHost.groups.includes(currentGroup)) {
              existingHost.groups.push(currentGroup);
            }
            
            // Add variables
            existingHost.variables = { ...existingHost.variables, ...variables };
          } else {
            // Create new host entry
            hosts.push({
              id: String(hostId++),
              name: hostName,
              groups: [currentGroup],
              variables,
            });
          }
        }
      }
    }
    
    return hosts;
  } catch (error) {
    console.error('Error getting hosts:', error);
    return [];
  }
};

// Get recent playbook runs by checking ansible log files
export const getRecentRuns = async () => {
  try {
    // Try to get data from Ansible log directory if it exists
    const logDir = '/var/log/ansible';
    const recentRuns = [];
    
    if (fs.existsSync(logDir)) {
      const logFiles = await fs.promises.readdir(logDir);
      const sortedFiles = logFiles
        .filter(file => file.endsWith('.log'))
        .sort((a, b) => {
          const statA = fs.statSync(path.join(logDir, a));
          const statB = fs.statSync(path.join(logDir, b));
          return statB.mtime.getTime() - statA.mtime.getTime();
        })
        .slice(0, 5); // Get 5 most recent
      
      for (const [index, file] of sortedFiles.entries()) {
        const filePath = path.join(logDir, file);
        const content = await readFileAsync(filePath);
        const playbookMatch = content.match(/PLAY\s+\[([^\]]+)\]/);
        const statusLine = content.includes('failed=0') ? 'success' : 'failed';
        
        recentRuns.push({
          id: String(index + 1),
          name: playbookMatch ? playbookMatch[1] : file.replace('.log', ''),
          status: statusLine,
          timestamp: fs.statSync(filePath).mtime.toISOString(),
        });
      }
    } else {
      // If we can't access logs, try to get data from ansible-playbook command
      try {
        const result = await execCommand('ansible-playbook --version');
        if (result) {
          // Just check if Ansible is installed
          console.log("Ansible is installed:", result);
        }
      } catch (error) {
        console.warn('Could not detect Ansible installation:', error.message);
      }
    }
    
    return recentRuns;
  } catch (error) {
    console.error('Error getting recent runs:', error);
    return [];
  }
};

// Get system information
export const getSystemInfo = async () => {
  try {
    let cpu = '0%';
    let memory = '0%';
    let disk = '0%';
    
    if (os.platform() === 'linux') {
      // Linux commands
      try {
        cpu = await execCommand('top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk \'{print 100 - $1"%"}\'');
        memory = await execCommand('free | grep Mem | awk \'{print $3/$2 * 100"%"}\'');
        disk = await execCommand('df -h / | awk \'NR==2 {print $5}\'');
      } catch (error) {
        console.warn('Error executing Linux system commands:', error.message);
      }
    } else if (os.platform() === 'darwin') {
      // macOS commands
      try {
        cpu = await execCommand('top -l 1 | grep "CPU usage" | awk \'{print $3}\'');
        memory = await execCommand('top -l 1 | grep "PhysMem" | awk \'{print $2}\'');
        disk = await execCommand('df -h / | awk \'NR==2 {print $5}\'');
      } catch (error) {
        console.warn('Error executing macOS system commands:', error.message);
      }
    } else if (os.platform() === 'win32') {
      // Windows - use Node.js os module as fallback
      cpu = `${Math.round(os.loadavg()[0] * 10)}%`;
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      memory = `${Math.round((totalMem - freeMem) / totalMem * 100)}%`;
      
      try {
        // Attempt to get disk usage with wmic
        disk = await execCommand('wmic logicaldisk where DeviceID="C:" get Size,FreeSpace | findstr /r "[0-9]"');
        const parts = disk.trim().split(/\s+/);
        if (parts.length >= 2) {
          const freeSpace = parseInt(parts[0]);
          const totalSize = parseInt(parts[1]);
          disk = `${Math.round((totalSize - freeSpace) / totalSize * 100)}%`;
        } else {
          disk = '0%';
        }
      } catch (error) {
        console.warn('Error getting Windows disk usage:', error.message);
        disk = '0%';
      }
    } else {
      // Fallback for other platforms using Node.js os module
      cpu = `${Math.round(os.loadavg()[0] * 10)}%`;
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      memory = `${Math.round((totalMem - freeMem) / totalMem * 100)}%`;
      disk = '0%';
    }
    
    return {
      cpu: cpu || '0%',
      memory: memory || '0%',
      disk: disk || '0%',
    };
  } catch (error) {
    console.error('Error getting system info:', error);
    return {
      cpu: '0%',
      memory: '0%',
      disk: '0%',
    };
  }
};

// Get dashboard stats
export const getDashboardStats = async () => {
  const [playbooks, inventories, roles, hosts, recentRuns, system] = await Promise.all([
    getPlaybooks(),
    getInventories(),
    getRoles(),
    getHosts(),
    getRecentRuns(),
    getSystemInfo(),
  ]);
  
  return {
    playbooks: playbooks.length,
    inventories: inventories.length,
    roles: roles.length,
    hosts: hosts.length,
    recentRuns,
    system,
  };
};

// Save a playbook
export const savePlaybook = async (playbook) => {
  let filePath = playbook.path;
  
  // If no path is provided, create a new file
  if (!filePath) {
    filePath = path.join(ANSIBLE_CONFIG.playbooksDir, playbook.name);
    
    // Ensure directory exists
    if (!fs.existsSync(ANSIBLE_CONFIG.playbooksDir)) {
      await fs.promises.mkdir(ANSIBLE_CONFIG.playbooksDir, { recursive: true });
    }
  }
  
  const success = await writeFileAsync(filePath, playbook.content);
  
  if (success) {
    const stats = await fs.promises.stat(filePath);
    
    return {
      ...playbook,
      path: filePath,
      lastModified: stats.mtime.toISOString(),
      id: playbook.id || Buffer.from(filePath).toString('base64'),
    };
  }
  
  throw new Error(`Failed to save playbook: ${playbook.name}`);
};

// Save an inventory
export const saveInventory = async (inventory) => {
  let filePath = inventory.path;
  
  // If no path is provided, create a new file
  if (!filePath) {
    const dirPath = path.join(ANSIBLE_CONFIG.inventoriesDir, inventory.name);
    filePath = path.join(dirPath, 'hosts');
    
    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
  }
  
  const success = await writeFileAsync(filePath, inventory.content);
  
  if (success) {
    const stats = await fs.promises.stat(filePath);
    
    return {
      ...inventory,
      path: filePath,
      lastModified: stats.mtime.toISOString(),
      id: inventory.id || Buffer.from(filePath).toString('base64'),
    };
  }
  
  throw new Error(`Failed to save inventory: ${inventory.name}`);
};

// Create a new role
export const createRole = async (role) => {
  const rolePath = path.join(ANSIBLE_CONFIG.rolesDir, role.name);
  
  // Ensure directory exists
  if (!fs.existsSync(rolePath)) {
    await fs.promises.mkdir(rolePath, { recursive: true });
  }
  
  // Create basic role structure
  const directories = ['defaults', 'files', 'handlers', 'meta', 'tasks', 'templates', 'vars'];
  
  for (const dir of directories) {
    const dirPath = path.join(rolePath, dir);
    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath);
    }
    
    // Create main.yml file
    const mainYml = path.join(dirPath, 'main.yml');
    await writeFileAsync(mainYml, `---\n# ${dir} for role ${role.name}\n`);
  }
  
  // Create meta/main.yml with description
  const metaContent = `---\ngalaxy_info:\n  author: Ansible UI\n  description: ${role.description}\n  company: Your Company\n  license: "license (BSD, MIT)"\n  min_ansible_version: "2.10"\n`;
  await writeFileAsync(path.join(rolePath, 'meta', 'main.yml'), metaContent);
  
  const stats = await fs.promises.stat(rolePath);
  
  return {
    ...role,
    path: rolePath,
    lastModified: stats.mtime.toISOString(),
    id: role.id || Buffer.from(rolePath).toString('base64'),
  };
};

// Execute a playbook
export const executePlaybook = async (playbookId, inventoryId) => {
  try {
    // Decode base64 IDs to get file paths
    const playbookPath = Buffer.from(playbookId, 'base64').toString();
    const inventoryPath = Buffer.from(inventoryId, 'base64').toString();
    
    console.log(`Executing playbook: ${playbookPath} with inventory: ${inventoryPath}`);
    
    // Check if files exist
    if (!fs.existsSync(playbookPath)) {
      throw new Error(`Playbook not found: ${playbookPath}`);
    }
    
    if (!fs.existsSync(inventoryPath)) {
      throw new Error(`Inventory not found: ${inventoryPath}`);
    }
    
    // Build inventory parameter
    let inventoryParam = inventoryPath;
    
    // If inventory is a directory, look for hosts file
    if ((await fs.promises.stat(inventoryPath)).isDirectory()) {
      console.log(`Inventory path is a directory: ${inventoryPath}`);
      
      const hostsFile = path.join(inventoryPath, 'hosts');
      if (fs.existsSync(hostsFile)) {
        inventoryParam = hostsFile;
        console.log(`Using hosts file: ${hostsFile}`);
      } else {
        // Try to find another inventory file
        const files = await fs.promises.readdir(inventoryPath);
        for (const file of files) {
          if (file === 'hosts.yml' || file === 'hosts.yaml' || file === 'inventory.yml' || file === 'inventory.yaml') {
            inventoryParam = path.join(inventoryPath, file);
            console.log(`Using inventory file: ${inventoryParam}`);
            break;
          }
        }
      }
    }
    
    // Check if ansible-playbook command exists
    try {
      await execCommand('which ansible-playbook');
    } catch (error) {
      console.error('ansible-playbook command not found:', error.message);
      throw new Error('ansible-playbook command not found. Please install Ansible.');
    }
    
    // Create command with verbose flag for more detailed output
    const runId = Math.random().toString(36).substring(2, 10);
    const logFile = path.join(os.tmpdir(), `ansible-run-${runId}.log`);

    // Add verbosity flag if needed
    const verbosityFlag = process.env.ANSIBLE_VERBOSE === 'true' ? '-v' : '';
    const becomeFlag = process.env.ANSIBLE_BECOME_ENABLED === 'true' ? '--become' : '';
    
    const command = `ansible-playbook ${verbosityFlag} ${becomeFlag} -i "${inventoryParam}" "${playbookPath}" | tee "${logFile}"`;
    console.log(`Executing command: ${command}`);
    
    // Execute the playbook asynchronously but don't wait for it to complete
    // This allows us to return quickly while still capturing the logs
    execCommand(command)
      .then(result => {
        console.log('Playbook execution completed successfully');
        console.log('Command result:', result);
      })
      .catch(error => {
        console.error('Error during playbook execution:', error.message);
      });
    
    return {
      id: runId,
      status: 'running',
      logFile,
    };
  } catch (error) {
    console.error('Error executing playbook:', error);
    return {
      id: Math.random().toString(36).substring(2, 10),
      status: 'failed',
      error: error.message,
    };
  }
};

// Add a host to an inventory
export const addHostToInventory = async (inventoryId, host) => {
  try {
    // Decode base64 ID to get file path
    const inventoryPath = Buffer.from(inventoryId, 'base64').toString();
    
    // Check if inventory exists
    if (!fs.existsSync(inventoryPath)) {
      throw new Error(`Inventory not found: ${inventoryPath}`);
    }
    
    // Determine the file to edit
    let filePath = inventoryPath;
    
    if ((await fs.promises.stat(inventoryPath)).isDirectory()) {
      filePath = path.join(inventoryPath, 'hosts');
      if (!fs.existsSync(filePath)) {
        // Create empty hosts file if it doesn't exist
        await writeFileAsync(filePath, '');
      }
    }
    
    // Read current content
    let content = await readFileAsync(filePath);
    
    // For each group, add the host if the group doesn't exist or the host isn't in the group
    for (const group of host.groups) {
      if (!content.includes(`[${group}]`)) {
        // Group doesn't exist, add it
        content += `\n[${group}]\n`;
      }
      
      // Check if host is already in this group
      const groupRegex = new RegExp(`\\[${group}\\]([^\\[]*)`, 'g');
      const match = groupRegex.exec(content);
      
      if (match) {
        const groupContent = match[1];
        if (!groupContent.includes(host.name)) {
          // Host isn't in this group, add it
          const hostVariables = Object.entries(host.variables)
            .map(([key, value]) => `${key}=${value}`)
            .join(' ');
          
          const hostLine = hostVariables ? `${host.name} ${hostVariables}` : host.name;
          const newGroupContent = groupContent + hostLine + '\n';
          content = content.replace(match[0], `[${group}]${newGroupContent}`);
        }
      }
    }
    
    // Write updated content
    return await writeFileAsync(filePath, content);
  } catch (error) {
    console.error('Error adding host to inventory:', error);
    return false;
  }
};
