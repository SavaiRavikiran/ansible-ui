
# Ansible UI Project

A modern web interface for managing Ansible and other popular DevOps tools.

## Project info

**URL**: https://lovable.dev/projects/d11c8467-6c82-4de0-ad4c-84ab54b87fee

## Overview

Ansible UI is a modern web interface for managing popular DevOps tools.
The UI allows you to:
- Easily run Ansible playbooks, as well as Bash and PowerShell scripts
- Receive notifications about failed tasks
- View real-time execution logs
- Control access to your deployment system
- Import and export configurations between UI and local filesystem

## Key Concepts

- **Projects**: A collection of related resources, configurations, and tasks
- **Task Templates**: Reusable definitions of tasks that can be executed on demand or scheduled
- **Task**: A specific instance of a job or operation executed by UI
- **Schedules**: Allow you to automate task execution at specified times or intervals
- **Inventory**: A collection of target hosts (servers, virtual machines, containers, etc.) on which tasks will be executed
- **Variable Group**: A configuration context that holds sensitive information such as environment variables and secrets used by tasks during execution

## Testing Guide

### Prerequisites
1. Make sure you have Node.js installed on your system
2. Ensure you have Ansible installed if you want to test with actual Ansible data
3. Git clone of the repository on your local machine

### Step 1: Local Development Testing

```bash
# Clone the repository
git clone <your-repository-url>
cd <repository-directory>

# Install dependencies
npm install

# Start the development server
npm run dev

# Or build and start the production server
npm run build
node server.js
```

The application should now be accessible at http://localhost:3001

### Step 2: Testing with Docker

```bash
# Build and run using Docker
docker build -t ansible-ui .
docker run -p 3001:3001 ansible-ui

# Or use Docker Compose
docker-compose up --build

# Or use the test-locally.sh script
chmod +x test-locally.sh
./test-locally.sh
```

### Step 3: Testing Individual Features

1. **Dashboard Testing**
   - Navigate to http://localhost:3001
   - Verify system stats, recent runs, and other dashboard widgets load
   - Check that charts and metrics display correctly
   - Review History, Activity, and Building sections
   - Test NEW RUNNER functionality
   - Verify the log exporting feature

2. **Playbooks Management**
   - Go to the Playbooks section
   - Try to create a new playbook
   - Verify you can view existing playbooks
   - Test executing a playbook against an inventory
   - Ensure real-time logs appear when running a playbook
   - Verify the "Rerun" option appears for failed playbooks

3. **Task Templates**
   - Navigate to the Task Templates section
   - Test creating new templates using the All, Build, Deploy options
   - Edit existing templates
   - Run a template and verify it executes correctly

4. **Inventories and Hosts**
   - Navigate to Inventories and Hosts sections
   - Test creating a new inventory
   - Add hosts to an inventory
   - Verify host data displays correctly in both table and grid views

5. **Custom Paths Configuration**
   - Go to Settings
   - Set custom paths for playbooks, inventories, and roles
   - Save configuration and check if paths are properly stored
   - Restart the application and verify if it uses the custom paths

6. **Import/Export functionality**
   - Test importing data from your local Ansible directories
   - Try exporting UI data to local filesystem
   - Verify the data integrity after the import/export operations

### Step 4: Testing Kubernetes Deployment

```bash
# Assuming you have a Kubernetes cluster and Helm installed

# Create a Helm chart if you don't have one
helm create ansible-ui

# Package the chart
helm package ./ansible-ui

# Install the chart to your Kubernetes cluster
helm install ansible-ui ./ansible-ui-0.1.0.tgz --set service.type=LoadBalancer

# Get the external IP
kubectl get svc ansible-ui

# Access the application using the external IP
# http://<EXTERNAL-IP>:3001
```

### Step 5: Testing API Endpoints

Use tools like Postman or curl to test the API endpoints:

```bash
# Test the health endpoint
curl http://localhost:3001/api/health

# Get dashboard stats
curl http://localhost:3001/api/dashboard

# Get playbooks
curl http://localhost:3001/api/playbooks

# Get inventories
curl http://localhost:3001/api/inventories

# Get hosts
curl http://localhost:3001/api/hosts
```

### Step 6: Testing Browser Compatibility

Test the application on different browsers:
- Chrome
- Firefox
- Safari
- Edge

### Step 7: Testing Responsive Design

Test the application on:
- Desktop (various resolutions)
- Tablet
- Mobile devices

### Troubleshooting Common Issues

1. If the server fails to start, check server-logs.txt for error details
2. Ensure the database file has proper permissions
3. Verify that the Ansible directories exist and are accessible
4. Check that SQLite is properly installed for database operations
5. Look at the console logs in the browser for frontend issues
6. Ensure the server is running when you try to access the UI

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d11c8467-6c82-4de0-ad4c-84ab54b87fee) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Express.js (Backend server)
- SQLite (Database)
- Docker (Containerization)
- Kubernetes (Deployment)

## How can I deploy this project?

### Web Deployment
Simply open [Lovable](https://lovable.dev/projects/d11c8467-6c82-4de0-ad4c-84ab54b87fee) and click on Share -> Publish.

### Kubernetes Deployment
The project includes a Dockerfile and configuration for Kubernetes deployment. Use Helm charts for simplified deployment to Kubernetes clusters.

## Environment Variables

The following environment variables can be configured:

- `ANSIBLE_PLAYBOOKS_DIR`: Directory for Ansible playbooks (default: /etc/ansible/playbooks)
- `ANSIBLE_INVENTORIES_DIR`: Directory for Ansible inventories (default: /etc/ansible/inventories)
- `ANSIBLE_ROLES_DIR`: Directory for Ansible roles (default: /etc/ansible/roles)
- `PORT`: Server port (default: 3001)
- `SERVER_MODE`: Server mode (default: kubernetes)

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
