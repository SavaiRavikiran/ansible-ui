
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Testing Ansible UI Application =====${NC}"

# Step 1: Check if Node.js is installed
echo -e "${YELLOW}Checking if Node.js is installed...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi
echo -e "${GREEN}Node.js is installed.${NC}"

# Step 2: Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
node install-server-deps.js

# Step 3: Build the application
echo -e "${YELLOW}Building the application...${NC}"
npm run build

# Step 4: Check if Ansible is installed and configured
echo -e "${YELLOW}Checking Ansible configuration...${NC}"
ANSIBLE_PLAYBOOKS_DIR=${ANSIBLE_PLAYBOOKS_DIR:-/etc/ansible/playbooks}
ANSIBLE_INVENTORIES_DIR=${ANSIBLE_INVENTORIES_DIR:-/etc/ansible/inventories}
ANSIBLE_ROLES_DIR=${ANSIBLE_ROLES_DIR:-/etc/ansible/roles}

# Create directories if they don't exist
mkdir -p $ANSIBLE_PLAYBOOKS_DIR
mkdir -p $ANSIBLE_INVENTORIES_DIR
mkdir -p $ANSIBLE_ROLES_DIR

echo -e "Using the following Ansible directories:"
echo -e "  Playbooks: ${GREEN}$ANSIBLE_PLAYBOOKS_DIR${NC}"
echo -e "  Inventories: ${GREEN}$ANSIBLE_INVENTORIES_DIR${NC}"
echo -e "  Roles: ${GREEN}$ANSIBLE_ROLES_DIR${NC}"

# Step 5: Start the server
echo -e "${YELLOW}Starting the server...${NC}"
echo -e "The server will start in the background. Press Ctrl+C to stop it."
echo -e "Server logs will be saved to server-logs.txt"

# Export environment variables
export ANSIBLE_PLAYBOOKS_DIR=$ANSIBLE_PLAYBOOKS_DIR
export ANSIBLE_INVENTORIES_DIR=$ANSIBLE_INVENTORIES_DIR
export ANSIBLE_ROLES_DIR=$ANSIBLE_ROLES_DIR

# Start the server in the background and redirect output to a file
node server.js > server-logs.txt 2>&1 &
SERVER_PID=$!

# Wait for the server to start
echo -e "${YELLOW}Waiting for the server to start...${NC}"
sleep 5

# Check if the server is running
if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}Server started successfully with PID $SERVER_PID${NC}"
    echo -e "${GREEN}You can access the application at http://localhost:3001${NC}"
    echo -e "${YELLOW}To stop the server, run: kill $SERVER_PID${NC}"
else
    echo -e "${RED}Failed to start the server. Check server-logs.txt for details.${NC}"
    exit 1
fi

echo -e "${YELLOW}===== Testing Instructions =====${NC}"
echo -e "1. Open your browser and navigate to ${GREEN}http://localhost:3001${NC}"
echo -e "2. Check if the dashboard, playbooks, inventories, and hosts are displayed correctly"
echo -e "3. Try to create, edit, and delete items"
echo -e "4. Try to execute a playbook"
echo -e "5. Check the server logs in server-logs.txt for any errors"

# Save the PID to a file for later use
echo $SERVER_PID > server.pid
echo -e "${YELLOW}Server PID saved to server.pid${NC}"
echo -e "${YELLOW}To stop the server later, run: kill \$(cat server.pid)${NC}"
