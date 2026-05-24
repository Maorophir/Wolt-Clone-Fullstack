#include <gtest/gtest.h>
#include <thread>
#include <chrono>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>

#include "../src/network/TCPServer.h"
#include "../src/interfaces/IClientHandler.h"

// Fake handler that just echoes the request with a prefix
class FakeEchoHandler : public IClientHandler {
public:
    std::string handleRequest(const std::string& request) override {
        return "ECHO: " + request;
    }
};

class TCPServerTest : public ::testing::Test {
protected:
    int testPort = 9999;
    FakeEchoHandler fakeHandler;
    TCPServer* server = nullptr;
    std::thread serverThread;

    void SetUp() override {
        server = new TCPServer(testPort, fakeHandler);
        
        // Run server in a detached thread so it doesn't block the test
        serverThread = std::thread([this]() {
            server->start();
        });
        
        // Give the server a moment to bind and listen
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    void TearDown() override {
        if (server) {
            server->stop();
            // Give it a moment to shut down gracefully
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
            delete server;
        }
        if (serverThread.joinable()) {
            serverThread.join();
        }
    }

    // Helper function to act as a dumb TCP client
    std::string sendRequestAsClient(const std::string& message) {
        int sock = socket(AF_INET, SOCK_STREAM, 0);
        struct sockaddr_in serv_addr;
        serv_addr.sin_family = AF_INET;
        serv_addr.sin_port = htons(testPort);
        inet_pton(AF_INET, "127.0.0.1", &serv_addr.sin_addr);

        if (connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0) {
            return "CONNECTION_FAILED";
        }

        // Send message with newline as required by Ex2
        std::string msgWithNewline = message + "\n";
        send(sock, msgWithNewline.c_str(), msgWithNewline.length(), 0);

        // Read response
        char buffer[1024] = {0};
        read(sock, buffer, 1024);
        close(sock);

        return std::string(buffer);
    }
};

// Test: Verify server receives message, passes to handler, and appends newline
TEST_F(TCPServerTest, HandlesSingleClientRequestSuccessfully) {
    // Send request without newline (client handles adding it)
    std::string response = sendRequestAsClient("Hello Server");
    
    // Ex2 explicitly requires every response to end with a newline
    EXPECT_EQ("ECHO: Hello Server\n", response);
}