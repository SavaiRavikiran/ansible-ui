
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add required server dependencies
const serverDeps = [
  'express',
  'cors',
];

console.log('Installing required server dependencies...');
try {
  execSync(`npm install ${serverDeps.join(' ')} --save`, { stdio: 'inherit' });
  console.log('Server dependencies installed successfully!');
} catch (error) {
  console.error('Error installing server dependencies:', error);
  process.exit(1);
}

// Create a README file with instructions
const readmePath = path.join(__dirname, 'README.md');
const readmeContent = `# Ansible UI

A web-based UI for managing Ansible resources on your local machine.

## Getting Started

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Build the application:
   \`\`\`
   npm run build
   \`\`\`

3. Start the server:
   \`\`\`
   node server.js
   \`\`\`

4. Access the application at http://localhost:3001

## Configuration

Update the paths to your Ansible files in \`src/lib/ansible-service.ts\` if your Ansible configuration is located somewhere other than the default locations.

Default paths:
- Playbooks: /etc/ansible/playbooks
- Inventories: /etc/ansible/inventories
- Roles: /etc/ansible/roles
- Config: /etc/ansible/ansible.cfg

You can also set the following environment variables:
- ANSIBLE_PLAYBOOKS_DIR
- ANSIBLE_INVENTORIES_DIR
- ANSIBLE_ROLES_DIR
- ANSIBLE_CONFIG_FILE

## Features

- View and manage playbooks, inventories, roles, and hosts
- Create and edit Ansible resources directly from the UI
- Execute playbooks against selected inventories
- View system health statistics
- Track recent playbook runs
`;

fs.writeFileSync(readmePath, readmeContent);
console.log('README.md file created with instructions');

console.log('\nSetup complete!');
console.log('\nTo run the application:');
console.log('1. Build the application: npm run build');
console.log('2. Start the server: node server.js');
console.log('3. Access the application at http://localhost:3001');
