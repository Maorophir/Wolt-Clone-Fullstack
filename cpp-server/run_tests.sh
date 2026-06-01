#!/bin/bash

echo "========================================="
echo " Building Docker Image (wolt-server)..."
echo "========================================="
docker build -t wolt-server .

echo "========================================="
echo " Running WoltProjectTests..."
echo "========================================="
# Run the container and execute the tests application
docker run -it --rm wolt-server ./build/WoltProjectTests