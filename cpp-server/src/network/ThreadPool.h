#pragma once

#include <atomic>
#include <condition_variable>
#include <cstddef>
#include <functional>
#include <mutex>
#include <queue>
#include <thread>
#include <vector>

/*
 * A fixed-size pool of worker threads fed by a single shared task queue.
 *
 * Concurrency contract
 * --------------------
 *  - `tasks`, `stopping` and `acceptingWork` are ALL guarded by `queueMutex`.
 *    No member of that group may be read or written without holding the lock.
 *  - Workers block on `taskAvailable` instead of spinning, so an idle pool
 *    costs no CPU.
 *  - `submit()` is safe to call from any thread, including from inside a task.
 *  - Destruction is always safe: the destructor stops the pool and joins every
 *    worker, so no thread can outlive the object it reads members from.
 *
 * Backpressure
 * ------------
 * The queue is bounded (`maxQueueSize`). A full queue makes `submit()` fail
 * instead of growing without limit, which lets the caller shed load (the TCP
 * server closes the connection) rather than run out of memory under a flood of
 * connections.
 */
class ThreadPool {
public:
    // threadCount == 0 -> std::thread::hardware_concurrency() (min 2).
    // maxQueueSize == 0 -> unbounded queue.
    explicit ThreadPool(std::size_t threadCount = 0, std::size_t maxQueueSize = 1024);

    ~ThreadPool();

    // A pool owns OS threads; copying or moving it would duplicate that
    // ownership and is therefore forbidden.
    ThreadPool(const ThreadPool&) = delete;
    ThreadPool& operator=(const ThreadPool&) = delete;

    // Queues a task. Returns false if the pool is shutting down or the queue
    // is full; in that case the task is NOT queued and never runs.
    bool submit(std::function<void()> task);

    // Stops accepting new work, lets already-queued tasks drain, then joins
    // every worker. Idempotent and safe to call from any non-worker thread.
    void shutdown();

    // Number of worker threads (fixed for the lifetime of the pool).
    std::size_t size() const;

    // Snapshot of the number of tasks waiting in the queue.
    std::size_t pendingTasks() const;

    // Total number of tasks that have finished running.
    std::size_t completedTasks() const;

private:
    void workerLoop();

    std::vector<std::thread> workers;
    std::queue<std::function<void()>> tasks;

    // mutable: const observers (pendingTasks) still need to lock.
    mutable std::mutex queueMutex;
    std::condition_variable taskAvailable;

    bool stopping;        // guarded by queueMutex
    bool acceptingWork;   // guarded by queueMutex
    std::size_t maxQueueSize;

    // Serialises shutdown() so a second caller waits for the join to finish
    // instead of returning early and letting the object be destroyed while
    // workers are still alive.
    std::mutex shutdownMutex;

    // Fixed at construction and never mutated, so size() needs no lock and
    // stays correct after shutdown() has cleared the thread vector.
    std::size_t threadCount;

    // Not guarded by queueMutex on purpose: incremented by workers outside the
    // critical section, so it must be atomic to avoid a data race.
    std::atomic<std::size_t> completed;
};