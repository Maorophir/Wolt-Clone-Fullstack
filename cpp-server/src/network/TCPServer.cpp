#include "TCPServer.h"

#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <stdexcept>
#include <cstring>
#include <iostream>

TCPServer::TCPServer(int port, IClientHandler& handler)
    : port(port), handler(handler), serverSocket(-1), isRunning(false)
{
    // 1. Create the socket
    serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket < 0) {
        throw std::runtime_error("error creating socket");
    }

    // Quality of life for TDD: Allows the port to be reused immediately after a test finishes
    int opt = 1;
    setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    // 2. Bind the socket to the port
    struct sockaddr_in sin;
    memset(&sin, 0, sizeof(sin));
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = INADDR_ANY;
    sin.sin_port = htons(port);

    if (bind(serverSocket, (struct sockaddr *) &sin, sizeof(sin)) < 0) {
        throw std::runtime_error("error binding socket");
    }

    // 3. Start listening for incoming connections
    if (listen(serverSocket, 5) < 0) {
        throw std::runtime_error("error listening to a socket");
    }
}

TCPServer::~TCPServer()
{
    stop();
}

void TCPServer::start()
{
    isRunning = true;

    while (isRunning) {
        struct sockaddr_in client_sin;
        unsigned int addr_len = sizeof(client_sin);

        // 4. Accept a client
        int client_sock = accept(serverSocket, (struct sockaddr *) &client_sin, &addr_len);

        if (client_sock < 0) {
            if (isRunning) std::cerr << "error accepting client" << std::endl;
            continue;
        }

        // Handle one client at a time using the same connection
        char buffer[4096];
        std::string currentData = "";

        while (isRunning) {
            memset(buffer, 0, sizeof(buffer));

            // 5. Recv data from client until newline is found
            int read_bytes = recv(client_sock, buffer, sizeof(buffer) - 1, 0);

            if (read_bytes == 0) {
                // Connection is closed by client
                break;
            } else if (read_bytes < 0) {
                // Error reading from socket
                break;
            }

            currentData += buffer;

            // Handle TCP Byte Stream: extract commands ending with '\n'
            size_t pos;
            while ((pos = currentData.find('\n')) != std::string::npos) {
                std::string request = currentData.substr(0, pos);
                currentData = currentData.substr(pos + 1);

                if (!request.empty() && request.back() == '\r') {
                    request.pop_back(); // Handle Windows CRLF
                }

                // Pass to our abstract handler
                std::string response = handler.handleRequest(request);
                response += "\n"; // Newline at the end of output

                // 6. Send response to client
                if (int sent_bytes = send(client_sock, response.c_str(), response.length(), 0); sent_bytes < 0)
                {
                    perror("error sending to client");
                }
            }
        }
        // 7. Close client socket
        close(client_sock);
    }
}

void TCPServer::stop()
{
    isRunning = false;
    if (serverSocket >= 0) {
        shutdown(serverSocket, SHUT_RDWR); // Safely unblocks accept()
        close(serverSocket);
        serverSocket = -1;
    }
}