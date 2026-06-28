@echo off
echo 🚀 Setting up the Wolt App for testing...

:: 1. Auto-detect the host IP address on Windows
FOR /F "tokens=2 delims=:" %%a IN ('ipconfig ^| findstr /C:"IPv4 Address"') DO (
    SET "HOST_IP=%%a"
    GOTO :FoundIP
)
:FoundIP
:: Trim leading spaces
SET HOST_IP=%HOST_IP:~1%

echo 🌐 Detected Host Network IP: %HOST_IP%

:: 2. Boot up the Docker cluster in the background (-d)
echo 📦 Building and starting Docker containers (this may take a minute)...
call docker-compose up --build -d

:: 3. Attach only to the mobile logs so the tester gets a clean QR code!
echo 📱 Attaching to Mobile Expo server for QR code...
echo (Press Ctrl+C to stop the logs. To completely shut down the server later, run: docker-compose down)
echo --------------------------------------------------------------------------------------------------

call docker logs -f wolt-mobile
