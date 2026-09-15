#include "TCPServer.h"

#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <stdexcept>
#include <cstring>
#include <iostream>
#include <string>

namespace {
// Sent when the pool's bounded queue is full: the server sheds load explicitly
// instead of queueing connections without limit.
constexpr const char* kBusyResponse = "503 Service Unavailable\n";
}

TCPServer::TCPServer(int port, IClientHandler& handler, std::size_t threadCount)
    : port(port),
      handler(handler),
      serverSocket(-1),
      isRunning(false)
{
    // 1. Create the socket
    const int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) {
        throw std::runtime_error("error creating socket");
    }

    // Quality of life for TDD: Allows the port to be reused immediately after a test finishes
    int opt = 1;
    setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    // 2. Bind the socket to the port
    struct sockaddr_in sin;
    memset(&sin, 0, sizeof(sin));
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = INADDR_ANY;
    sin.sin_port = htons(static_cast<uint16_t>(port));

    if (bind(sock, (struct sockaddr *) &sin, sizeof(sin)) < 0) {
        close(sock);
        throw std::runtime_error("error binding socket");
    }

    // 3. Start listening for incoming connections.
    // Backlog raised from 5 to SOMAXCONN: with many clients arriving at once,
    // a short backlog makes the kernel drop connections before accept() ever
    // sees them, which looks like a server bug but is really a listen() limit.
    if (listen(sock, SOMAXCONN) < 0) {
        close(sock);
        throw std::runtime_error("error listening to a socket");
    }

    serverSocket.store(sock, std::memory_order_release);

    // 4. Build the worker pool up front so the very first client is served
    // without paying thread-creation cost, and so the number of live threads
    // stays bounded no matter how many clients connect.
    pool = std::make_unique<ThreadPool>(threadCount);
}

TCPServer::~TCPServer()
{
    // stop() blocks until the acceptor has left start() and every worker is
    // joined, so no thread can still be touching these members while the
    // members below are destroyed.
    stop();
}

void TCPServer::start()
{
    // Held for the whole accept loop. stop() waits on this, which is what
    // guarantees the pool is never destroyed while this thread is still using
    // it. See the contract in the header.
    std::lock_guard<std::mutex> acceptorGuard(acceptorMutex);

    isRunning.store(true, std::memory_order_release);

    while (isRunning.load(std::memory_order_acquire)) {
        const int listenFd = serverSocket.load(std::memory_order_acquire);
        if (listenFd < 0) {
            break;
        }

        struct sockaddr_in client_sin;
        socklen_t addr_len = sizeof(client_sin);

        // The acceptor thread's only job: take the connection and hand it off.
        const int client_sock = accept(listenFd, (struct sockaddr *) &client_sin, &addr_len);

        if (client_sock < 0) {
            if (isRunning.load(std::memory_order_acquire)) {
                std::cerr << "error accepting client" << std::endl;
                continue;
            }
            break; // stop() shut the listening socket down
        }

        if (!isRunning.load(std::memory_order_acquire)) {
            close(client_sock);
            break;
        }

        registerClient(client_sock);

        // Hand the connection to the pool. The acceptor immediately loops back
        // to accept(), so the next client waits microseconds instead of waiting
        // for this one to finish.
        const bool queued = pool->submit([this, client_sock]() {
            serveClient(client_sock);
        });

        if (!queued) {
            // Backpressure: the queue is full (or we are shutting down). Tell
            // the client instead of silently dropping or queueing forever.
            send(client_sock, kBusyResponse, strlen(kBusyResponse), MSG_NOSIGNAL);
            unregisterClient(client_sock);
            close(client_sock);
        }
    }

    isRunning.store(false, std::memory_order_release);
}

void TCPServer::serveClient(int clientSocket)
{
    // Everything below is per-connection state living on the worker's stack.
    // Nothing here is shared between workers, so no locking is needed on this
    // path; the only shared thing touched is `handler`, which is thread-safe.
    char buffer[4096];
    std::string currentData;

    for (;;) {
        memset(buffer, 0, sizeof(buffer));

        // Recv data from client until newline is found.
        // No isRunning check around this: stop() shuts the socket down, which
        // makes this call return 0 straight away. Polling a flag here would
        // still leave the thread parked inside a blocking recv().
        const ssize_t read_bytes = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);

        if (read_bytes <= 0) {
            break; // client closed, socket shut down by stop(), or read error
        }

        currentData.append(buffer, static_cast<size_t>(read_bytes));

        // Handle TCP Byte Stream: extract commands ending with '\n'
        size_t pos;
        while ((pos = currentData.find('\n')) != std::string::npos) {
            std::string request = currentData.substr(0, pos);
            currentData.erase(0, pos + 1);

            if (!request.empty() && request.back() == '\r') {
                request.pop_back(); // Handle Windows CRLF
            }

            // Pass to our abstract handler. Concurrent workers call this at the
            // same time, which is exactly why StorageManager is locked.
            std::string response = handler.handleRequest(request);
            response += "\n"; // Newline at the end of output

            // Send the whole response: send() is allowed to write fewer bytes
            // than asked, and a partial write here would corrupt the protocol
            // framing for that client.
            size_t totalSent = 0;
            bool sendFailed = false;
            while (totalSent < response.size()) {
                const ssize_t sent = send(clientSocket,
                                          response.data() + totalSent,
                                          response.size() - totalSent,
                                          MSG_NOSIGNAL);
                if (sent <= 0) {
                    sendFailed = true;
                    break;
                }
                totalSent += static_cast<size_t>(sent);
            }

            if (sendFailed) {
                unregisterClient(clientSocket);
                close(clientSocket);
                return;
            }
        }
    }

    unregisterClient(clientSocket);
    close(clientSocket);
}

void TCPServer::registerClient(int clientSocket)
{
    std::lock_guard<std::mutex> lock(clientsMutex);
    activeClients.insert(clientSocket);
}

void TCPServer::unregisterClient(int clientSocket)
{
    // Always remove from the set BEFORE close(). If the order were reversed,
    // stop() could call shutdown() on a descriptor number that close() had
    // already freed and the kernel had handed to some other socket.
    std::lock_guard<std::mutex> lock(clientsMutex);
    activeClients.erase(clientSocket);
}

void TCPServer::shutdownActiveClients()
{
    std::lock_guard<std::mutex> lock(clientsMutex);
    for (int clientSocket : activeClients) {
        // Unblocks a worker parked inside recv(): the call returns 0 at once.
        // Without this, joining the pool would wait for every client to
        // disconnect on its own, which an idle client never does.
        shutdown(clientSocket, SHUT_RDWR);
    }
}

void TCPServer::requestStop()
{
    isRunning.store(false, std::memory_order_release);

    const int listenFd = serverSocket.load(std::memory_order_acquire);
    if (listenFd >= 0) {
        // Unblocks accept() without closing the descriptor, so the acceptor
        // never races against the number being reused.
        shutdown(listenFd, SHUT_RDWR);
    }
}

void TCPServer::stop()
{
    std::lock_guard<std::mutex> stopGuard(stopMutex);

    requestStop();

    // Wait for the acceptor to actually leave start(). Only after this can the
    // pool be torn down safely: the acceptor calls pool->submit(), which
    // touches the pool's condition variable.
    {
        std::lock_guard<std::mutex> acceptorGuard(acceptorMutex);

        // Now that nobody can accept new connections, close the listening
        // socket for real.
        const int listenFd = serverSocket.exchange(-1, std::memory_order_acq_rel);
        if (listenFd >= 0) {
            close(listenFd);
        }
    }

    // Wake workers parked on client sockets, then join them all.
    shutdownActiveClients();

    if (pool) {
        pool->shutdown();
    }

    std::lock_guard<std::mutex> lock(clientsMutex);
    activeClients.clear();
}

std::size_t TCPServer::workerCount() const
{
    return pool ? pool->size() : 0;
}

std::size_t TCPServer::activeConnectionCount() const
{
    std::lock_guard<std::mutex> lock(clientsMutex);
    return activeClients.size();
}