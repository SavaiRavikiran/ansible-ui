
FROM node:18-alpine

WORKDIR /app

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

# Start the server
CMD ["node", "server.js"]
