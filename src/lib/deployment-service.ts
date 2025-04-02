
import { toast } from "sonner";

export interface DeploymentConfig {
  id: string;
  name: string;
  description: string;
  deploymentType: 'docker' | 'kubernetes' | 'helm' | 'custom';
  clusterUrl?: string;
  customDomain?: string;
  sslEnabled: boolean;
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  environmentVariables: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// Sample deployment configurations
export const deploymentTemplates: DeploymentConfig[] = [
  {
    id: 'docker-standard',
    name: 'Docker Standard',
    description: 'Standard Docker deployment with docker-compose',
    deploymentType: 'docker',
    sslEnabled: false,
    resources: {
      cpu: '0.5',
      memory: '512Mi',
      storage: '1Gi'
    },
    environmentVariables: {
      NODE_ENV: 'production',
      PORT: '3001'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'k8s-standard',
    name: 'Kubernetes Standard',
    description: 'Standard Kubernetes deployment with persistent volumes',
    deploymentType: 'kubernetes',
    sslEnabled: true,
    resources: {
      cpu: '1',
      memory: '1Gi',
      storage: '10Gi'
    },
    environmentVariables: {
      NODE_ENV: 'production',
      PORT: '3001'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'helm-standard',
    name: 'Helm Standard',
    description: 'Standard Helm chart deployment with configurable values',
    deploymentType: 'helm',
    sslEnabled: true,
    resources: {
      cpu: '1',
      memory: '1Gi',
      storage: '10Gi'
    },
    environmentVariables: {
      NODE_ENV: 'production',
      PORT: '3001'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Get saved deployment configuration
export function getSavedDeploymentConfig(): DeploymentConfig | null {
  try {
    const savedConfig = localStorage.getItem('ansible_ui_deployment_config');
    if (savedConfig) {
      return JSON.parse(savedConfig) as DeploymentConfig;
    }
    return null;
  } catch (error) {
    console.error('Failed to get deployment config:', error);
    return null;
  }
}

// Save deployment configuration
export async function saveDeploymentConfig(config: DeploymentConfig): Promise<DeploymentConfig> {
  try {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update timestamps
    const now = new Date().toISOString();
    const updatedConfig: DeploymentConfig = {
      ...config,
      updatedAt: now
    };
    
    // Save to localStorage
    localStorage.setItem('ansible_ui_deployment_config', JSON.stringify(updatedConfig));
    
    toast.success('Deployment configuration saved successfully');
    return updatedConfig;
  } catch (error) {
    console.error('Failed to save deployment config:', error);
    toast.error(`Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Generate deployment YAML
export async function generateDeploymentYaml(config: DeploymentConfig): Promise<string> {
  // Simulate network request
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  if (config.deploymentType === 'docker') {
    return `version: '3.8'
services:
  ansible-ui:
    image: ansible-ui:latest
    ports:
      - "3001:3001"
    volumes:
      - playbooks:/etc/ansible/playbooks
      - inventories:/etc/ansible/inventories
      - roles:/etc/ansible/roles
    environment:
      - PORT=${config.environmentVariables.PORT || '3001'}
      - NODE_ENV=${config.environmentVariables.NODE_ENV || 'production'}
      - ANSIBLE_PLAYBOOKS_DIR=/etc/ansible/playbooks
      - ANSIBLE_INVENTORIES_DIR=/etc/ansible/inventories
      - ANSIBLE_ROLES_DIR=/etc/ansible/roles
    restart: unless-stopped
    ${config.resources ? `deploy:
      resources:
        limits:
          cpus: '${config.resources.cpu}'
          memory: ${config.resources.memory}` : ''}
volumes:
  playbooks:
  inventories:
  roles:`;
  } else if (config.deploymentType === 'kubernetes') {
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ansible-ui
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ansible-ui
  template:
    metadata:
      labels:
        app: ansible-ui
    spec:
      containers:
        - name: ansible-ui
          image: ansible-ui:latest
          ports:
            - containerPort: ${config.environmentVariables.PORT || '3001'}
          env:
            - name: PORT
              value: "${config.environmentVariables.PORT || '3001'}"
            - name: NODE_ENV
              value: "${config.environmentVariables.NODE_ENV || 'production'}"
            - name: ANSIBLE_PLAYBOOKS_DIR
              value: "/etc/ansible/playbooks"
            - name: ANSIBLE_INVENTORIES_DIR
              value: "/etc/ansible/inventories"
            - name: ANSIBLE_ROLES_DIR
              value: "/etc/ansible/roles"
          resources:
            limits:
              cpu: ${config.resources.cpu}
              memory: ${config.resources.memory}
            requests:
              cpu: ${config.resources.cpu}
              memory: ${config.resources.memory}
          volumeMounts:
            - name: playbooks-volume
              mountPath: /etc/ansible/playbooks
            - name: inventories-volume
              mountPath: /etc/ansible/inventories
            - name: roles-volume
              mountPath: /etc/ansible/roles
      volumes:
        - name: playbooks-volume
          persistentVolumeClaim:
            claimName: ansible-ui-playbooks
        - name: inventories-volume
          persistentVolumeClaim:
            claimName: ansible-ui-inventories
        - name: roles-volume
          persistentVolumeClaim:
            claimName: ansible-ui-roles
---
apiVersion: v1
kind: Service
metadata:
  name: ansible-ui
spec:
  selector:
    app: ansible-ui
  ports:
    - port: 80
      targetPort: ${config.environmentVariables.PORT || '3001'}
  type: ClusterIP`;
  } else if (config.deploymentType === 'helm') {
    return `# values.yaml for Helm chart
replicaCount: 1

image:
  repository: ansible-ui
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: ${config.environmentVariables.PORT || '3001'}

ingress:
  enabled: ${config.customDomain ? 'true' : 'false'}
  annotations:
    kubernetes.io/ingress.class: nginx
    ${config.sslEnabled ? 'cert-manager.io/cluster-issuer: letsencrypt-prod' : ''}
  hosts:
    - host: ${config.customDomain || 'ansible-ui.local'}
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: ${config.resources.cpu}
    memory: ${config.resources.memory}
  requests:
    cpu: ${config.resources.cpu}
    memory: ${config.resources.memory}

persistence:
  enabled: true
  playbooks:
    storageClass: ""
    accessMode: ReadWriteOnce
    size: ${config.resources.storage}
  inventories:
    storageClass: ""
    accessMode: ReadWriteOnce
    size: ${config.resources.storage}
  roles:
    storageClass: ""
    accessMode: ReadWriteOnce
    size: ${config.resources.storage}

env:
  PORT: ${config.environmentVariables.PORT || '3001'}
  NODE_ENV: ${config.environmentVariables.NODE_ENV || 'production'}
  ANSIBLE_PLAYBOOKS_DIR: /etc/ansible/playbooks
  ANSIBLE_INVENTORIES_DIR: /etc/ansible/inventories
  ANSIBLE_ROLES_DIR: /etc/ansible/roles`;
  }
  
  // Default to custom deployment
  return `# Custom deployment configuration
# Configure according to your deployment environment

# For Docker:
# Use docker-compose.yml from the repository

# For Kubernetes:
# Use the Kubernetes manifests from the repository

# For Helm:
# Use the Helm chart from the repository

# Environment variables:
${Object.entries(config.environmentVariables).map(([key, value]) => `# ${key}=${value}`).join('\n')}

# Resource requirements:
# CPU: ${config.resources.cpu}
# Memory: ${config.resources.memory}
# Storage: ${config.resources.storage}
`;
}

// Test deployment configuration
export async function testDeploymentConfig(config: DeploymentConfig): Promise<{ success: boolean; message: string }> {
  try {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate validation
    if (!config.name || !config.deploymentType) {
      return { 
        success: false, 
        message: 'Missing required configuration: name and deployment type' 
      };
    }
    
    if (config.deploymentType === 'kubernetes' && !config.clusterUrl) {
      return {
        success: false,
        message: 'Kubernetes deployment requires a cluster URL'
      };
    }
    
    if (config.customDomain && !config.customDomain.includes('.')) {
      return {
        success: false,
        message: 'Invalid custom domain format'
      };
    }
    
    // Simulate successful validation
    return {
      success: true,
      message: 'Configuration validated successfully'
    };
  } catch (error) {
    console.error('Deployment test failed:', error);
    return { 
      success: false, 
      message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}
