#include "ThreadPool.h"

#include <algorithm>
#include <utility>

ThreadPool::ThreadPool(std::size_t threadCount, std::size_t maxQueueSize)
    : stopping(false),
      acceptingWork(true),
      maxQueueSize(maxQueueSize),
      threadCount(0),
      completed(0)
{
    if (threadCount == 0) {
        threadCount = std::thread::hardware_concurrency();
        // hardware_concurrency() may legitimately report 0 in containers.
        if (threadCount == 0) {
            threadCount = 4;
        }
        threadCount = std::max<std::size_t>(threadCount, 2);
    }

    this->threadCount = threadCount;

    workers.reserve(threadCount);
    for (std::size_t i = 0; i < threadCount; ++i) {
        workers.emplace_back([this]() { workerLoop(); });
    }
}

ThreadPool::~ThreadPool()
{
    // Never let a worker outlive the object whose members it touches.
    shutdown();
}

bool ThreadPool::submit(std::function<void()> task)
{
    if (!task) {
        return false;
    }

    {
        std::unique_lock<std::mutex> lock(queueMutex);

        if (!acceptingWork || stopping) {
            return false;
        }
        // Bounded queue: shed load instead of growing without limit.
        if (maxQueueSize != 0 && tasks.size() >= maxQueueSize) {
            return false;
        }

        tasks.push(std::move(task));
    }

    // Notify outside the lock so the woken worker does not immediately block
    // on a mutex this thread still holds.
    taskAvailable.notify_one();
    return true;
}

void ThreadPool::shutdown()
{
    // Held for the whole shutdown, so a concurrent second call blocks here and
    // returns only once the workers really are joined. Returning early on
    // `stopping` alone would let a caller destroy the pool mid-join.
    std::lock_guard<std::mutex> shutdownGuard(shutdownMutex);

    {
        std::unique_lock<std::mutex> lock(queueMutex);
        if (stopping && workers.empty()) {
            return; // already shut down and joined; keep this idempotent
        }
        acceptingWork = false;
        stopping = true;
    }

    // Wake every worker so each one re-checks the predicate and exits once the
    // queue has drained.
    taskAvailable.notify_all();

    for (std::thread& worker : workers) {
        if (worker.joinable()) {
            worker.join();
        }
    }
    workers.clear();
}

void ThreadPool::workerLoop()
{
    for (;;) {
        std::function<void()> task;

        {
            std::unique_lock<std::mutex> lock(queueMutex);

            // Waiting on a predicate is what makes this immune to lost wakeups
            // and to spurious wakeups: the condition is re-checked under the
            // lock every time the thread wakes.
            taskAvailable.wait(lock, [this]() {
                return stopping || !tasks.empty();
            });

            // Drain before exiting: a task already queued when shutdown() was
            // called still runs, so an in-flight client is never dropped.
            if (tasks.empty()) {
                if (stopping) {
                    return;
                }
                continue;
            }

            task = std::move(tasks.front());
            tasks.pop();
        }

        // Run the task OUTSIDE the lock. Holding queueMutex here would
        // serialise every worker and defeat the purpose of the pool.
        try {
            task();
        } catch (...) {
            // A throwing task must never take the worker (or the process) down.
        }

        completed.fetch_add(1, std::memory_order_relaxed);
    }
}

std::size_t ThreadPool::size() const
{
    return threadCount;
}

std::size_t ThreadPool::pendingTasks() const
{
    std::unique_lock<std::mutex> lock(queueMutex);
    return tasks.size();
}

std::size_t ThreadPool::completedTasks() const
{
    return completed.load(std::memory_order_relaxed);
}