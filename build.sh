#!/bin/bash

# Install root dependencies
npm install

# Navigate to client directory and install dependencies
cd client
npm install

# Build the client
npm run build

# Navigate back to root
cd ..

# Ensure client/dist exists and is accessible
echo "Checking if client/dist directory exists:"
ls -la client/dist

# Check if the index.html exists in the expected location
echo "Checking for index.html:"
ls -la client/dist/index.html

# Log directory structure for debugging
echo "Directory structure from project root:"
find . -type d -maxdepth 3 | sort

echo "Build completed successfully!" 