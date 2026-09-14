#pragma once

#include "../interfaces/IClientHandler.h"
#include "ThreadPool.h"

#include <atomic>
#include <cstddef>
#include <memory>
#include <mutex>
#include <unordered_set>

/*
 * Concurrent TCP server.
 *
 * Threading model
 * ---------------
 *   acceptor thread (the one that called start())
 *       -> accept() in a loop, does nothing but hand the socket off
 *   worker threads (ThreadPool, fixed size)
 *       -> own one client connection each for its whole lifetime:
 *          recv -> frame on '\n' -> handler.handleRequest -> send
 *
 * The acceptor never touches application state and never blocks on a client,
 * so one slow or idle client can no longer stall every other connection. The
 * previous single-threaded version served exactly one client at a time: a
 * client that connected and simply stayed silent blocked the accept loop until
 * it disconnected.
 *
 * Shared-state contract
 * ---------------------
 *   isRunning        std::atomic<bool>. Written by stop() on one thread and
 *                    read by the acceptor and every worker - a plain bool here
 *                    is a data race (ThreadSanitizer flags it) and the compiler
 *                    is free to hoist the read out of the loop.
 *   serverSocket     std::atomic<int>, for the same reason: stop() invalidates
 *                    the descriptor the acceptor is using.
 *   activeClients    guarded by clientsMutex. Needed so stop() can shutdown()
 *                    sockets that workers are currently blocked in recv() on;
 *                    without it shutdown would hang until every client happened
 *                    to disconnect.
 *   acceptorMutex    held for the ENTIRE duration of start(). This is a
 *                    lifetime guard, not a data guard: stop() blocks on it so
 *                    it cannot tear the pool down while the acceptor is still
 *                    inside submit(). Without it, ~ThreadPool destroyed a
 *                    condition variable the acceptor was about to notify -
 *                    a use-after-free that only shows up under load.
 *   handler          shared by all workers, so the injected IClientHandler must
 *                    itself be thread-safe (CommandParser is: its commands are
 *                    stateless and the StorageManager underneath is locked).
 */
class TCPServer {
public:
    // threadCount == 0 -> one worker per hardware thread.
    explicit TCPServer(int port, IClientHandler& handler, std::size_t threadCount = 0);

    ~TCPServer();

    TCPServer(const TCPServer&) = delete;
    TCPServer& operator=(const TCPServer&) = delete;

    // Starts listening and accepting clients (blocking call).
    // Returns when stop() or requestStop() is called.
    void start();

    // Full shutdown: unblocks the acceptor, WAITS for it to leave start(),
    // then unblocks and joins every worker. Idempotent.
    // Must not be called from the acceptor thread itself - use requestStop().
    void stop();

    // Async-signal-safe-ish "please wind down": flips the flag and shuts the
    // listening socket down so accept() returns, without waiting or joining.
    // This is what a SIGINT/SIGTERM handler calls; the thread that owns
    // start() then returns from it and calls stop() normally.
    void requestStop();

    // Number of worker threads in the pool.
    std::size_t workerCount() const;

    // Number of client connections currently being served.
    std::size_t activeConnectionCount() const;

private:
    // Runs on a pool worker: owns one client socket end to end.
    void serveClient(int clientSocket);

    void registerClient(int clientSocket);
    void unregisterClient(int clientSocket);
    void shutdownActiveClients();

    int port;
    IClientHandler& handler;

    std::atomic<int> serverSocket;
    std::atomic<bool> isRunning;

    std::unique_ptr<ThreadPool> pool;

    mutable std::mutex clientsMutex;
    std::unordered_set<int> activeClients;   // guarded by clientsMutex

    std::mutex acceptorMutex;                // held for the lifetime of start()
    std::mutex stopMutex;                    // makes stop() safe to call twice
};