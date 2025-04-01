
FROM node:18-alpine

WORKDIR /app

# Install system dependencies including Ansible
RUN apk add --no-cache python3 py3-pip openssh-client bash curl && \
    # Create and use a virtual environment for Ansible installation
    python3 -m venv /opt/ansible-venv && \
    . /opt/ansible-venv/bin/activate && \
    pip3 install --no-cache-dir ansible && \
    # Make the ansible executables available in PATH
    ln -s /opt/ansible-venv/bin/ansible /usr/local/bin/ansible && \
    ln -s /opt/ansible-venv/bin/ansible-playbook /usr/local/bin/ansible-playbook

# Create ansible directories
RUN mkdir -p /etc/ansible/playbooks /etc/ansible/inventories /etc/ansible/roles

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy server dependencies installation script and run it
COPY install-server-deps.js ./
RUN node install-server-deps.js

# Copy all project files
COPY . .

# Build the React app
RUN npm run build

# Expose the server port
EXPOSE 3001

# Set environment variables (these can be overridden at runtime)
ENV ANSIBLE_PLAYBOOKS_DIR=/etc/ansible/playbooks
ENV ANSIBLE_INVENTORIES_DIR=/etc/ansible/inventories
ENV ANSIBLE_ROLES_DIR=/etc/ansible/roles
ENV PORT=3001
ENV NODE_ENV=production

# Create a volume for ansible directories to allow persistence
VOLUME ["/etc/ansible/playbooks", "/etc/ansible/inventories", "/etc/ansible/roles"]

# Add a healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
