
#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up development environment for Ansible UI...${NC}"

# Create local ansible test directories if they don't exist
echo "Creating local ansible test directories..."
mkdir -p ./dev-ansible/playbooks
mkdir -p ./dev-ansible/inventories
mkdir -p ./dev-ansible/roles

# Set environment variables
export ANSIBLE_PLAYBOOKS_DIR="$(pwd)/dev-ansible/playbooks"
export ANSIBLE_INVENTORIES_DIR="$(pwd)/dev-ansible/inventories"
export ANSIBLE_ROLES_DIR="$(pwd)/dev-ansible/roles"
export PORT=3001
export NODE_ENV=development

# Check if we have a package manager
if command -v npm &> /dev/null; then
  PACKAGE_MANAGER="npm"
elif command -v yarn &> /dev/null; then
  PACKAGE_MANAGER="yarn"
elif command -v pnpm &> /dev/null; then
  PACKAGE_MANAGER="pnpm"
else
  echo -e "${RED}No package manager (npm, yarn, or pnpm) found.${NC}"
  exit 1
fi

echo -e "${YELLOW}Using $PACKAGE_MANAGER as the package manager${NC}"

# Create a sample playbook if none exists
if [ ! -f "$ANSIBLE_PLAYBOOKS_DIR/sample.yml" ]; then
  echo "Creating sample playbook..."
  cat > "$ANSIBLE_PLAYBOOKS_DIR/sample.yml" << 'EOF'
---
# Sample playbook
- name: Sample Playbook
  hosts: all
  tasks:
    - name: Print a message
      debug:
        msg: "Hello from Ansible UI!"
EOF
fi

# Create a sample inventory if none exists
if [ ! -f "$ANSIBLE_INVENTORIES_DIR/hosts" ]; then
  echo "Creating sample inventory..."
  cat > "$ANSIBLE_INVENTORIES_DIR/hosts" << 'EOF'
[webservers]
localhost ansible_connection=local

[databases]
db.example.com
EOF
fi

# Run the server in the background and store its PID
echo -e "${GREEN}Starting backend server on port 3001...${NC}"
node server.js &
SERVER_PID=$!

# Wait a moment to ensure the server starts
sleep 2

# Run the frontend dev server
echo -e "${GREEN}Starting frontend development server...${NC}"
$PACKAGE_MANAGER run dev

# When the frontend server is stopped (Ctrl+C), stop the backend server too
kill $SERVER_PID
echo -e "${YELLOW}Servers stopped${NC}"
