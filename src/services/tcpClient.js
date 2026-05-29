// src/services/tcpClient.js

const net = require('net');

// Retrieve host and port from environment variables, fallback to localhost for local testing
const TCP_HOST = process.env.RECOMMENDATION_SERVER_HOST || 'localhost';
const TCP_PORT = process.env.RECOMMENDATION_SERVER_PORT || 5555;

/**
 * Sends a command to the C++ TCP Recommendation Server and awaits the response.
 * @param {string} command - The command string to send (e.g., "POST <params>")
 * @returns {Promise<string>} The response from the server
 */
function sendTcpCommand(command) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();

        // Establish connection to the C++ server
        client.connect(TCP_PORT, TCP_HOST, () => {
            console.log(`[TCP Client] Connected to ${TCP_HOST}:${TCP_PORT}`);

            // Append a newline character if your C++ server requires it to process the command
            client.write(command + '\n');
        });

        // Listen for data coming back from the C++ server
        client.on('data', (data) => {
            const response = data.toString().trim();
            console.log(`[TCP Client] Received: ${response}`);

            resolve(response);

            // Close the connection after receiving the response (4-Way Handshake)
            client.destroy();
        });

        // Handle connection errors (e.g., server is down)
        client.on('error', (err) => {
            console.error(`[TCP Client] Error connecting to ${TCP_HOST}:${TCP_PORT}`, err.message);
            reject(err);
        });

        // Handle unexpected connection closures
        client.on('close', () => {
            // Optional: Log connection closure
            // console.log('[TCP Client] Connection closed');
        });
    });
}

module.exports = {
    sendTcpCommand
};