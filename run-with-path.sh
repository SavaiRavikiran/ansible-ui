
#!/bin/bash

# Check if a path argument was provided
if [ -z "$1" ]; then
  echo "Please provide the path to your Ansible directory"
  echo "Usage: $0 /path/to/ansible/project"
  exit 1
fi

# Run dev.sh with the provided path
./dev.sh -p "$1"
