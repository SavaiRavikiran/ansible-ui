// Type definitions for Ansible data structures

export interface DashboardStats {
  playbooks: number;
  inventories: number;
  roles: number;
  hosts: number;
  recentRuns: PlaybookRun[];
  system: {
    cpu: string;
    memory: string;
    disk: string;
  };
}

export interface PlaybookRun {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'running';
  timestamp: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  path: string;
  lastModified: string;
  content: string;
}

export interface Inventory {
  id: string;
  name: string;
  description: string;
  path: string;
  lastModified: string;
  content: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  path: string;
  lastModified: string;
}

export interface Host {
  id: string;
  name: string;
  groups: string[];
  variables: Record<string, string>;
}

// New type definitions for job scheduling
export interface ScheduledJob {
  id: string;
  playbookId: string;
  inventoryId: string;
  schedule: {
    type: "once" | "daily" | "weekly" | "monthly";
    time: string;
    date?: string; // For "once" type
    daysOfWeek?: string[]; // For "weekly" type
    dayOfMonth?: number; // For "monthly" type
  };
  isEnabled: boolean;
}

// New type definitions for configurations
export interface Configuration {
  type: 'general' | 'connection' | 'custom';
  settings: Record<string, any>;
}

// API base URL - connects to our Express server
// Use window.location to dynamically determine the API URL
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/api`;

// Helper for API requests
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      // Add headers to prevent caching for real-time data
      headers: {
        ...options?.headers,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    
    if (process.env.NODE_ENV === 'development') {
      // In development, fall back to mock data if the server isn't running
      console.warn('Falling back to mock data in development mode');
      return await mockRequest<T>(endpoint, options);
    }
    
    throw error;
  }
}

// Mock data for development when the server isn't running
async function mockRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock responses based on endpoint
  if (endpoint === '/dashboard') {
    return {
      playbooks: 12,
      inventories: 5,
      roles: 8,
      hosts: 24,
      recentRuns: [
        { id: '1', name: 'Deploy Web Servers', status: 'success', timestamp: '2023-06-15T10:30:00Z' },
        { id: '2', name: 'Database Backup', status: 'success', timestamp: '2023-06-14T22:15:00Z' },
        { id: '3', name: 'Security Updates', status: 'failed', timestamp: '2023-06-13T18:45:00Z' },
      ],
      system: {
        cpu: '32%',
        memory: '45%',
        disk: '67%'
      }
    } as unknown as T;
  }
  
  if (endpoint === '/playbooks') {
    if (options?.method === 'POST') {
      // Return the posted playbook with an ID
      const body = JSON.parse((options.body as string));
      return {
        ...body,
        id: Math.random().toString(36).substring(2, 10),
        lastModified: new Date().toISOString()
      } as unknown as T;
    }
    
    return [
      {
        id: '1',
        name: 'deploy-web.yml',
        description: 'Deploy web application to production servers',
        path: '/etc/ansible/playbooks/deploy-web.yml',
        lastModified: '2023-06-10T14:30:00Z',
        content: `---
- name: Deploy Web Application
  hosts: web_servers
  become: true
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        
    - name: Install required packages
      apt:
        name: 
          - nginx
          - nodejs
          - npm
        state: present
        
    - name: Start and enable Nginx
      service:
        name: nginx
        state: started
        enabled: yes`
      },
      {
        id: '2',
        name: 'database-backup.yml',
        description: 'Perform database backup every night',
        path: '/etc/ansible/playbooks/database-backup.yml',
        lastModified: '2023-05-28T09:15:00Z',
        content: `---
- name: Database Backup
  hosts: db_servers
  become: true
  tasks:
    - name: Create backup directory
      file:
        path: /var/backups/postgres
        state: directory
        mode: '0755'
        
    - name: Backup PostgreSQL databases
      shell: pg_dumpall -U postgres > /var/backups/postgres/all_dbs_$(date +%Y-%m-%d).sql`
      },
      {
        id: '3',
        name: 'security-updates.yml',
        description: 'Apply security updates to all servers',
        path: '/etc/ansible/playbooks/security-updates.yml',
        lastModified: '2023-06-05T11:45:00Z',
        content: `---
- name: Apply Security Updates
  hosts: all
  become: true
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        
    - name: Apply security updates
      apt:
        upgrade: dist
        security: yes`
      }
    ] as unknown as T;
  }
  
  if (endpoint === '/inventories') {
    if (options?.method === 'POST') {
      // Return the posted inventory with an ID
      const body = JSON.parse((options.body as string));
      return {
        ...body,
        id: Math.random().toString(36).substring(2, 10),
        lastModified: new Date().toISOString()
      } as unknown as T;
    }
    
    return [
      {
        id: '1',
        name: 'production',
        description: 'Production environment servers',
        path: '/etc/ansible/inventories/production',
        lastModified: '2023-06-12T16:20:00Z',
        content: `[web_servers]
web01.example.com ansible_host=192.168.1.101
web02.example.com ansible_host=192.168.1.102
web03.example.com ansible_host=192.168.1.103

[db_servers]
db01.example.com ansible_host=192.168.1.201
db02.example.com ansible_host=192.168.1.202

[load_balancers]
lb01.example.com ansible_host=192.168.1.10
lb02.example.com ansible_host=192.168.1.11`
      },
      {
        id: '2',
        name: 'staging',
        description: 'Staging environment servers',
        path: '/etc/ansible/inventories/staging',
        lastModified: '2023-06-08T10:30:00Z',
        content: `[web_servers]
web-staging01.example.com ansible_host=192.168.2.101
web-staging02.example.com ansible_host=192.168.2.102

[db_servers]
db-staging01.example.com ansible_host=192.168.2.201

[load_balancers]
lb-staging01.example.com ansible_host=192.168.2.10`
      },
      {
        id: '3',
        name: 'development',
        description: 'Development environment servers',
        path: '/etc/ansible/inventories/development',
        lastModified: '2023-05-20T08:45:00Z',
        content: `[web_servers]
web-dev01.example.com ansible_host=192.168.3.101

[db_servers]
db-dev01.example.com ansible_host=192.168.3.201`
      }
    ] as unknown as T;
  }
  
  if (endpoint === '/roles') {
    if (options?.method === 'POST') {
      // Return the posted role with an ID
      const body = JSON.parse((options.body as string));
      return {
        ...body,
        id: Math.random().toString(36).substring(2, 10),
        lastModified: new Date().toISOString()
      } as unknown as T;
    }
    
    return [
      {
        id: '1',
        name: 'nginx',
        description: 'Install and configure Nginx web server',
        path: '/etc/ansible/roles/nginx',
        lastModified: '2023-06-10T14:30:00Z'
      },
      {
        id: '2',
        name: 'postgresql',
        description: 'Install and configure PostgreSQL database',
        path: '/etc/ansible/roles/postgresql',
        lastModified: '2023-05-28T09:15:00Z'
      },
      {
        id: '3',
        name: 'nodejs',
        description: 'Install Node.js and NPM',
        path: '/etc/ansible/roles/nodejs',
        lastModified: '2023-06-05T11:45:00Z'
      }
    ] as unknown as T;
  }
  
  if (endpoint === '/hosts') {
    if (options?.method === 'POST') {
      // Return success for adding host
      return { success: true } as unknown as T;
    }
    
    return [
      {
        id: '1',
        name: 'web01.example.com',
        groups: ['web_servers', 'production'],
        variables: {
          'ansible_host': '192.168.1.101',
          'ansible_user': 'ansible',
          'http_port': '80'
        }
      },
      {
        id: '2',
        name: 'db01.example.com',
        groups: ['db_servers', 'production'],
        variables: {
          'ansible_host': '192.168.1.201',
          'ansible_user': 'ansible',
          'postgres_version': '14'
        }
      },
      {
        id: '3',
        name: 'web-staging01.example.com',
        groups: ['web_servers', 'staging'],
        variables: {
          'ansible_host': '192.168.2.101',
          'ansible_user': 'ansible',
          'http_port': '8080'
        }
      }
    ] as unknown as T;
  }
  
  if (endpoint === '/execute-playbook') {
    return {
      id: Math.random().toString(36).substring(2, 10),
      status: Math.random() > 0.2 ? 'success' : 'failed'
    } as unknown as T;
  }
  
  if (endpoint === '/scheduled-jobs') {
    if (options?.method === 'POST') {
      // Return the posted job with an ID
      const body = JSON.parse((options.body as string));
      return {
        ...body,
        id: Math.random().toString(36).substring(2, 10),
      } as unknown as T;
    }
    
    return [
      {
        id: '1',
        playbookId: '1',
        playbookName: 'deploy-web.yml',
        inventoryId: '1',
        inventoryName: 'production',
        nextRunTime: '2023-07-01T12:00:00Z',
        schedule: {
          type: 'daily',
          time: '12:00',
        },
        isEnabled: true,
      },
      {
        id: '2',
        playbookId: '2',
        playbookName: 'database-backup.yml',
        inventoryId: '1',
        inventoryName: 'production',
        nextRunTime: '2023-07-02T00:00:00Z',
        schedule: {
          type: 'weekly',
          time: '00:00',
          daysOfWeek: ['Sunday'],
        },
        isEnabled: true,
      },
    ] as unknown as T;
  }
  
  return {} as T;
}

// API functions
export async function fetchDashboardStats(): Promise<DashboardStats> {
  return await apiRequest<DashboardStats>('/dashboard');
}

export async function fetchPlaybooks(): Promise<Playbook[]> {
  return await apiRequest<Playbook[]>('/playbooks');
}

export async function fetchInventories(): Promise<Inventory[]> {
  return await apiRequest<Inventory[]>('/inventories');
}

export async function fetchRoles(): Promise<Role[]> {
  return await apiRequest<Role[]>('/roles');
}

export async function fetchHosts(): Promise<Host[]> {
  return await apiRequest<Host[]>('/hosts');
}

export async function savePlaybook(playbook: Playbook): Promise<Playbook> {
  return await apiRequest<Playbook>('/playbooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(playbook),
  });
}

export async function saveInventory(inventory: Inventory): Promise<Inventory> {
  return await apiRequest<Inventory>('/inventories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inventory),
  });
}

export async function createRole(role: Role): Promise<Role> {
  return await apiRequest<Role>('/roles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(role),
  });
}

export async function addHost(inventoryId: string, host: Host): Promise<{ success: boolean }> {
  return await apiRequest<{ success: boolean }>('/hosts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inventoryId, host }),
  });
}

export async function executePlaybook(playbookId: string, inventoryId: string): Promise<{ id: string, status: string }> {
  return await apiRequest<{ id: string, status: string }>('/execute-playbook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playbookId, inventoryId }),
  });
}

// New API functions for configuration and server integration
export async function saveConfiguration(config: Configuration): Promise<{ success: boolean }> {
  return await apiRequest<{ success: boolean }>('/configuration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
}

export async function getConfiguration(type: string): Promise<Record<string, any>> {
  return await apiRequest<Record<string, any>>(`/configuration/${type}`);
}

export async function testServerConnection(serverDetails: Record<string, any>): Promise<{ success: boolean, message: string }> {
  return await apiRequest<{ success: boolean, message: string }>('/test-connection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(serverDetails),
  });
}

export async function exportToLocal(data: any, type: string): Promise<{ success: boolean, path: string }> {
  return await apiRequest<{ success: boolean, path: string }>('/export-to-local', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data, type }),
  });
}

export async function importFromLocal(type: string, path?: string): Promise<any> {
  return await apiRequest<any>('/import-from-local', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, path }),
  });
}

// New functions for job scheduling
export async function fetchScheduledJobs(): Promise<ScheduledJob[]> {
  return await apiRequest<ScheduledJob[]>('/scheduled-jobs');
}

export async function schedulePlaybook(job: ScheduledJob): Promise<ScheduledJob> {
  return await apiRequest<ScheduledJob>('/scheduled-jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(job),
  });
}

export async function updateScheduledJob(job: ScheduledJob): Promise<ScheduledJob> {
  return await apiRequest<ScheduledJob>(`/scheduled-jobs/${job.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(job),
  });
}

export async function deleteScheduledJob(jobId: string): Promise<{ success: boolean }> {
  return await apiRequest<{ success: boolean }>(`/scheduled-jobs/${jobId}`, {
    method: 'DELETE',
  });
}

export async function toggleScheduledJob(jobId: string, isEnabled: boolean): Promise<{ success: boolean }> {
  return await apiRequest<{ success: boolean }>(`/scheduled-jobs/${jobId}/toggle`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isEnabled }),
  });
}

export async function runScheduledJobNow(jobId: string): Promise<{ id: string, status: string }> {
  return await apiRequest<{ id: string, status: string }>(`/scheduled-jobs/${jobId}/run-now`, {
    method: 'POST',
  });
}
