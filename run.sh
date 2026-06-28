#!/bin/bash
echo "🚀 Setting up the Wolt App for testing..."

# 1. Auto-detect the host IP address (Mac or Linux)
if command -v ipconfig >/dev/null 2>&1; then
    # Mac
    export HOST_IP=$(ipconfig getifaddr en0)
else
    # Linux (Grab the first IP that isn't localhost or docker/wsl if possible)
    export HOST_IP=$(hostname -I | awk '{print $1}')
fi

echo "🌐 Detected Host Network IP: $HOST_IP"

# 2. Boot up the Docker cluster in the background (-d)
echo "📦 Building and starting Docker containers (this may take a minute)..."
docker-compose up --build -d

# 3. Attach only to the mobile logs so the tester gets a clean QR code!
echo "📱 Attaching to Mobile Expo server for QR code..."
echo "(Press Ctrl+C to stop the logs. To completely shut down the server later, run: docker-compose down)"
echo "--------------------------------------------------------------------------------------------------"

docker logs -f wolt-mobile
