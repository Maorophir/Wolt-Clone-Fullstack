#include "command_parser/CommandParser.h"
#include "network/TCPServer.h"
#include <iostream>
#include <string>

// Application entry point for the TCP Recommendation Server.
// Expects exactly one argument: the port number to listen on.
int main(int argc, char* argv[]) {
    if (argc != 2) {
        return 1;
    }

    // Convert argument to integer
    int port = std::stoi(argv[1]);

    try {
        // Instantiate the parser (which now acts as the IClientHandler)
        CommandParser parser("data/user_history.txt");

        // Instantiate the TCP server and inject the parser
        TCPServer server(port, parser);

        // Start the infinite server loop
        server.start();

    } catch (...) {
        return 1;
    }

    return 0;
}
