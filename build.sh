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

echo "Build completed successfully!" 