
# Ansible UI Project

A modern web interface for managing Ansible and other popular DevOps tools.

## Project Overview

Ansible UI is a modern web interface for managing Ansible automation. It provides a clean, intuitive interface for:
- Running Ansible playbooks, as well as Bash and PowerShell scripts
- Receiving notifications about failed tasks
- Viewing real-time execution logs
- Controlling access to your deployment system
- Importing and exporting configurations between UI and local filesystem

## Quick Deployment Options

### 1. Docker (Recommended)

The fastest way to get started is using Docker:

```bash
# Clone the repository
git clone <repository-url>
cd ansible-ui

# Build and run with Docker Compose
docker-compose up --build
```

This will make the application available at `http://localhost:3001`.

### 2. Direct Run Script

For direct installation on your host system:

```bash
# Download the runner script
wget -O run-ansible-ui.sh https://raw.githubusercontent.com/your-org/ansible-ui/main/run-ansible-ui.sh

# Make it executable
chmod +x run-ansible-ui.sh

# Run the script
./run-ansible-ui.sh
```

The script will handle downloading the application, installing dependencies, building the app, and running it.

### 3. Kubernetes (with Helm)

For deployment on Kubernetes clusters:

```bash
# Clone the repository to get the Helm chart
git clone <repository-url>
cd ansible-ui

# Install the Helm chart
helm install ansible-ui ./helm/ansible-ui

# To expose the service (if needed)
kubectl port-forward svc/ansible-ui 3001:3001
```

Alternatively, you can customize the deployment by modifying values:

```bash
# Create a custom values file
cat > my-values.yaml << EOF
service:
  type: LoadBalancer
replicaCount: 2
persistence:
  enabled: true
  playbooks:
    size: 5Gi
EOF

# Install with custom values
helm install ansible-ui ./helm/ansible-ui -f my-values.yaml
```

## Environment Configuration

The following environment variables can be configured:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `ANSIBLE_PLAYBOOKS_DIR` | Directory for Ansible playbooks | /etc/ansible/playbooks |
| `ANSIBLE_INVENTORIES_DIR` | Directory for Ansible inventories | /etc/ansible/inventories |
| `ANSIBLE_ROLES_DIR` | Directory for Ansible roles | /etc/ansible/roles |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Node environment | production |

## Requirements

- Node.js 18 or higher
- Ansible 2.9 or higher (for playbook execution)
- Docker (for containerized deployment)
- Kubernetes & Helm (for Kubernetes deployment)

## Auto-Detection of Ansible Resources

On startup, Ansible UI automatically detects:
1. Ansible installation on the host system
2. Existing playbooks, inventories, and roles in standard locations
3. If no resources are found, offers to create sample resources

## Components and Tools

Ansible UI includes several components to help manage Ansible automation:

- **Dashboard**: Overview of system status, recent runs, and resource counts
- **Playbooks**: Manage and run Ansible playbooks
- **Inventories**: Manage hosts and host groups
- **Roles**: Manage Ansible roles and their components
- **Variables**: Manage host and group variables
- **Scheduler**: Schedule playbook runs on a recurring basis
- **Settings**: Configure paths, credentials, and other options

## Technologies Used

This project is built with:

- **Frontend**:
  - React
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - Vite

- **Backend**:
  - Express.js
  - SQLite (for data storage)
  - Ansible (for automation execution)

- **Deployment**:
  - Docker
  - Kubernetes (with Helm)
  - Direct installation script

## Development Guide

To set up the application for development:

```bash
# Clone the repository
git clone <repository-url>
cd ansible-ui

# Install dependencies
npm install

# Start development server with hot reload
npm run dev
```

For testing with Docker during development:

```bash
# Use the test-locally script
chmod +x test-locally.sh
./test-locally.sh
```

## Troubleshooting

### Common Issues

1. **Ansible not detected**: Ensure Ansible is installed and in PATH
2. **Permission issues**: Ensure appropriate permissions for Ansible directories
3. **Connection refused**: Check if the application port is open and not in use
4. **Docker build fails**: Make sure Docker has enough resources allocated

### Logs

- Server logs: `server-logs.txt`
- Browser console: Check Developer Tools in your browser

## License

[MIT License](LICENSE)
