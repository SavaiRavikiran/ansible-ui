
#!/bin/bash

# Ansible UI Runner Script
# This script helps to set up and run the Ansible UI application

# Default directory where Ansible UI will be downloaded
INSTALL_DIR="$HOME/ansible-ui"
REPO_URL="https://github.com/your-organization/ansible-ui.git"
NODE_VERSION="18"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}Error: $1 is not installed. Please install it first.${NC}"
    return 1
  fi
  return 0
}

echo -e "${GREEN}==== Welcome to Ansible UI Setup ====${NC}"

# Check for required dependencies
echo "Checking required dependencies..."

check_command node || { echo -e "${RED}Please install Node.js v${NODE_VERSION} or later.${NC}"; exit 1; }
check_command npm || { echo -e "${RED}Please install npm.${NC}"; exit 1; }
check_command git || { echo -e "${RED}Please install git.${NC}"; exit 1; }

# Verify Node.js version
NODE_CURRENT_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_CURRENT_VERSION" -lt "$NODE_VERSION" ]; then
  echo -e "${RED}Error: Node.js version ${NODE_VERSION} or higher is required.${NC}"
  echo -e "Current version: $(node -v)"
  exit 1
fi

# Check for Ansible installation
if ! check_command ansible; then
  echo -e "${YELLOW}Warning: Ansible not found. Some features may not work.${NC}"
  echo -e "${YELLOW}Would you like to install Ansible now? (y/n)${NC}"
  read -r install_ansible
  
  if [[ "$install_ansible" =~ ^[Yy]$ ]]; then
    echo "Installing Ansible..."
    if command -v apt-get &> /dev/null; then
      sudo apt-get update && sudo apt-get install -y ansible
    elif command -v dnf &> /dev/null; then
      sudo dnf install -y ansible
    elif command -v yum &> /dev/null; then
      sudo yum install -y ansible
    elif command -v pip3 &> /dev/null; then
      pip3 install --user ansible
    else
      echo -e "${RED}Could not determine how to install Ansible on your system.${NC}"
      echo -e "${RED}Please install Ansible manually.${NC}"
    fi
  fi
fi

# Check if directory already exists
if [ -d "$INSTALL_DIR" ]; then
  echo -e "${YELLOW}Directory $INSTALL_DIR already exists.${NC}"
  echo -e "${YELLOW}Would you like to update the application? (y/n)${NC}"
  read -r update_app
  
  if [[ "$update_app" =~ ^[Yy]$ ]]; then
    echo "Updating Ansible UI..."
    cd "$INSTALL_DIR"
    git pull
    npm install
    npm run build
  fi
else
  echo "Downloading Ansible UI..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
  npm install
  npm run build
fi

# Ask for port configuration
echo -e "${GREEN}Which port would you like to run Ansible UI on? (default: 3001)${NC}"
read -r port
port=${port:-3001}

# Configure environment variables
echo "Setting up environment variables..."
export PORT="$port"
export NODE_ENV="production"
export ANSIBLE_PLAYBOOKS_DIR="${ANSIBLE_PLAYBOOKS_DIR:-/etc/ansible/playbooks}"
export ANSIBLE_INVENTORIES_DIR="${ANSIBLE_INVENTORIES_DIR:-/etc/ansible/inventories}"
export ANSIBLE_ROLES_DIR="${ANSIBLE_ROLES_DIR:-/etc/ansible/roles}"

# Ensure directories exist
mkdir -p "$ANSIBLE_PLAYBOOKS_DIR" "$ANSIBLE_INVENTORIES_DIR" "$ANSIBLE_ROLES_DIR"

echo -e "${GREEN}Starting Ansible UI on port $port...${NC}"
echo -e "${GREEN}You can access it at http://localhost:$port${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the application.${NC}"

cd "$INSTALL_DIR"
node server.js
