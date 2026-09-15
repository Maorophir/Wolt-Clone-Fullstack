#include "command_parser/CommandParser.h"
#include "network/TCPServer.h"

#include <atomic>
#include <csignal>
#include <cstddef>
#include <iostream>
#include <string>
#include <thread>

// The server instance the signal handler needs to reach. A signal handler may
// only touch objects of type std::atomic (lock-free) or volatile sig_atomic_t,
// so the pointer itself is atomic rather than a plain global.
static std::atomic<TCPServer*> g_server{nullptr};

// Async-signal-safe: does nothing but flip flags and shut sockets down.
static void handleSignal(int)
{
    TCPServer* server = g_server.load(std::memory_order_acquire);
    if (server != nullptr) {
        // requestStop(), not stop(): the handler usually runs on the very
        // thread that is sitting inside start(), and stop() waits for that
        // thread to finish - i.e. it would deadlock against itself. This only
        // flips the flag and shuts the listening socket down; main() does the
        // real join once start() returns.
        server->requestStop();
    }
}

// Application entry point for the TCP Recommendation Server.
// Usage: WoltProject <port> [threadCount]
//   threadCount defaults to one worker per hardware thread.
int main(int argc, char* argv[]) {
    if (argc < 2 || argc > 3) {
        std::cerr << "usage: " << argv[0] << " <port> [threadCount]" << std::endl;
        return 1;
    }

    int port = 0;
    std::size_t threadCount = 0; // 0 -> hardware_concurrency

    try {
        port = std::stoi(argv[1]);
        if (argc == 3) {
            threadCount = static_cast<std::size_t>(std::stoul(argv[2]));
        }
    } catch (...) {
        return 1;
    }

    try {
        // One parser, one storage table, shared by every worker thread.
        // Both are thread-safe by construction (see CommandParser.h).
        CommandParser parser("data/user_history.txt");

        TCPServer server(port, parser, threadCount);
        g_server.store(&server, std::memory_order_release);

        // Ctrl-C / docker stop now unwind cleanly: workers are joined and the
        // data file is flushed instead of the process being killed mid-write.
        std::signal(SIGINT, handleSignal);
        std::signal(SIGTERM, handleSignal);
        // A client that disconnects mid-response would otherwise kill the whole
        // process with SIGPIPE, taking every other connection down with it.
        std::signal(SIGPIPE, SIG_IGN);

        std::cerr << "server listening on port " << port
                  << " with " << server.workerCount() << " worker threads"
                  << std::endl;

        // Blocks in the accept loop until stop()/requestStop() is called.
        server.start();

        g_server.store(nullptr, std::memory_order_release);

        // Drain: joins every worker so in-flight requests finish and the data
        // file is left in a consistent state.
        server.stop();
    } catch (...) {
        g_server.store(nullptr, std::memory_order_release);
        return 1;
    }

    return 0;
}