
#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up local development environment...${NC}"

# Create ansible directories if they don't exist
echo "Creating local ansible directories..."
ANSIBLE_PLAYBOOKS_DIR="./dev/ansible/playbooks"
ANSIBLE_INVENTORIES_DIR="./dev/ansible/inventories" 
ANSIBLE_ROLES_DIR="./dev/ansible/roles"

mkdir -p "$ANSIBLE_PLAYBOOKS_DIR" "$ANSIBLE_INVENTORIES_DIR" "$ANSIBLE_ROLES_DIR"

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed. Please install it first.${NC}"
    exit 1
fi

echo "Setting up environment variables..."
export ANSIBLE_PLAYBOOKS_DIR="$ANSIBLE_PLAYBOOKS_DIR"
export ANSIBLE_INVENTORIES_DIR="$ANSIBLE_INVENTORIES_DIR"
export ANSIBLE_ROLES_DIR="$ANSIBLE_ROLES_DIR"

echo -e "${GREEN}Building and starting the application with Docker Compose...${NC}"
docker-compose up --build

echo -e "${YELLOW}Application is shutting down...${NC}"
