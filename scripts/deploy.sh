#!/bin/bash

# Variables
SERVER_IP="165.227.44.99"
SERVER_PATH="/var/projects/sparx-api"

# Create tar archive, excluding unnecessary files
tar -czvf project.tar.gz --exclude=node_modules --exclude=.git --exclude=pgdata --exclude=dist .

# Transfer tar archive to server
scp project.tar.gz root@$SERVER_IP:$SERVER_PATH

# Clean up
rm project.tar.gz

echo "Deployment complete."
