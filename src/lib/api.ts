
// Mock data for development - this will be replaced with actual API calls

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

// Mock data fetching functions
export async function fetchDashboardStats(): Promise<DashboardStats> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
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
  };
}

export async function fetchPlaybooks(): Promise<Playbook[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
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
  ];
}

export async function fetchInventories(): Promise<Inventory[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
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
  ];
}

export async function fetchRoles(): Promise<Role[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
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
  ];
}

export async function fetchHosts(): Promise<Host[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
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
  ];
}

// Save operations - these would actually send data to the backend
export async function savePlaybook(playbook: Playbook): Promise<Playbook> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log('Saving playbook:', playbook);
  return playbook;
}

export async function saveInventory(inventory: Inventory): Promise<Inventory> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log('Saving inventory:', inventory);
  return inventory;
}

export async function executePlaybook(playbookId: string, inventory: string): Promise<{ id: string, status: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log(`Executing playbook ${playbookId} with inventory ${inventory}`);
  
  // Simulate a successful execution most of the time
  const success = Math.random() > 0.2;
  
  return {
    id: Math.random().toString(36).substring(2, 10),
    status: success ? 'success' : 'failed'
  };
}
