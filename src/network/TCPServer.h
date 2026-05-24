#pragma once
#include "../interfaces/IClientHandler.h"

class TCPServer {
public:
    TCPServer(int port, IClientHandler &handler);

    ~TCPServer();

    // Starts listening and accepting clients (blocking call)
    void start();

    // Stops the server and closes the socket
    void stop();

private:
    int port;
    IClientHandler &handler;
    int serverSocket;
    bool isRunning;
};
