#!/bin/bash

# Default port is 5555 if no argument is provided
PORT=${1:-5555}

echo "========================================="
echo " Building Docker Image (wolt-server)..."
echo "========================================="
docker build -t wolt-server .

echo "========================================="
echo " Starting WoltProject server on port $PORT"
echo "========================================="
# Run the container, map the port, and execute the main application
docker run -it --rm -p $PORT:$PORT -v $(pwd)/data:/app/data wolt-server ./build/WoltProject $PORT