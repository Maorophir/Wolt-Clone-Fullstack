// Standalone throughput benchmark for the TCP server.
//
//   ./build/WoltLoadTest <host> <port> <clients> <requestsPerClient>
//
// Spawns `clients` threads, each opening one persistent connection and issuing
// `requestsPerClient` requests back to back. All clients are released from a
// barrier at the same instant so the server sees a genuine burst rather than a
// staggered trickle. Prints total wall time, throughput and latency percentiles.
//
// This is what produces the before/after numbers: point it at the old
// single-threaded build and at the pooled build and compare.

#include <arpa/inet.h>
#include <netdb.h>
#include <sys/socket.h>
#include <unistd.h>

#include <algorithm>
#include <atomic>
#include <chrono>
#include <condition_variable>
#include <cstring>
#include <iomanip>
#include <iostream>
#include <mutex>
#include <string>
#include <thread>
#include <vector>

namespace {

int connectTo(const std::string& host, int port) {
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) {
        return -1;
    }

    struct sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(static_cast<uint16_t>(port));

    if (inet_pton(AF_INET, host.c_str(), &addr.sin_addr) != 1) {
        struct hostent* entry = gethostbyname(host.c_str());
        if (entry == nullptr) {
            close(sock);
            return -1;
        }
        memcpy(&addr.sin_addr, entry->h_addr, static_cast<size_t>(entry->h_length));
    }

    if (connect(sock, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
        close(sock);
        return -1;
    }
    return sock;
}

bool exchange(int sock, const std::string& line) {
    const std::string out = line + "\n";
    if (send(sock, out.c_str(), out.size(), 0) < 0) {
        return false;
    }

    char buffer[4096];
    std::string response;
    for (;;) {
        ssize_t n = recv(sock, buffer, sizeof(buffer), 0);
        if (n <= 0) {
            return false;
        }
        response.append(buffer, static_cast<size_t>(n));
        if (response.find('\n') != std::string::npos) {
            return true;
        }
    }
}

double percentile(std::vector<double>& sorted, double p) {
    if (sorted.empty()) {
        return 0.0;
    }
    const size_t index = std::min(sorted.size() - 1,
        static_cast<size_t>(p / 100.0 * static_cast<double>(sorted.size())));
    return sorted[index];
}

} // namespace

int main(int argc, char* argv[]) {
    if (argc != 5) {
        std::cerr << "usage: " << argv[0]
                  << " <host> <port> <clients> <requestsPerClient>\n";
        return 1;
    }

    const std::string host = argv[1];
    const int port = std::stoi(argv[2]);
    const int clientCount = std::stoi(argv[3]);
    const int requestsPerClient = std::stoi(argv[4]);

    std::mutex gateMutex;
    std::condition_variable gate;
    bool open = false;

    std::atomic<long long> ok{0};
    std::atomic<long long> failed{0};

    std::mutex latencyMutex;
    std::vector<double> latenciesMs;
    latenciesMs.reserve(static_cast<size_t>(clientCount) * requestsPerClient);

    std::vector<std::thread> clients;
    clients.reserve(static_cast<size_t>(clientCount));

    for (int c = 0; c < clientCount; ++c) {
        clients.emplace_back([&, c]() {
            int sock = connectTo(host, port);
            if (sock < 0) {
                failed.fetch_add(requestsPerClient);
                return;
            }

            // Seed one user per client so GETs have something to chew on.
            exchange(sock, "POST " + std::to_string(500000 + c) + " 1 2 3 4 5");

            std::vector<double> local;
            local.reserve(static_cast<size_t>(requestsPerClient));

            {
                std::unique_lock<std::mutex> lock(gateMutex);
                gate.wait(lock, [&]() { return open; });
            }

            for (int i = 0; i < requestsPerClient; ++i) {
                // Mixed read/write traffic: 3 reads per write, which is where
                // the reader/writer lock earns its keep.
                const std::string command =
                    (i % 4 == 3)
                        ? "PATCH " + std::to_string(500000 + c) + " " + std::to_string(i)
                        : "GET " + std::to_string(500000 + c) + " 1";

                const auto begin = std::chrono::steady_clock::now();
                const bool success = exchange(sock, command);
                const auto end = std::chrono::steady_clock::now();

                if (success) {
                    ok.fetch_add(1, std::memory_order_relaxed);
                    local.push_back(
                        std::chrono::duration<double, std::milli>(end - begin).count());
                } else {
                    failed.fetch_add(1, std::memory_order_relaxed);
                }
            }

            close(sock);

            std::lock_guard<std::mutex> lock(latencyMutex);
            latenciesMs.insert(latenciesMs.end(), local.begin(), local.end());
        });
    }

    // Let every client finish connecting before starting the clock.
    std::this_thread::sleep_for(std::chrono::milliseconds(300));

    const auto start = std::chrono::steady_clock::now();
    {
        std::lock_guard<std::mutex> lock(gateMutex);
        open = true;
    }
    gate.notify_all();

    for (auto& t : clients) {
        t.join();
    }
    const auto finish = std::chrono::steady_clock::now();

    const double seconds = std::chrono::duration<double>(finish - start).count();
    std::sort(latenciesMs.begin(), latenciesMs.end());

    std::cout << std::fixed << std::setprecision(2)
              << "clients            : " << clientCount << "\n"
              << "requests/client    : " << requestsPerClient << "\n"
              << "successful         : " << ok.load() << "\n"
              << "failed             : " << failed.load() << "\n"
              << "wall time (s)      : " << seconds << "\n"
              << "throughput (req/s) : "
              << (seconds > 0 ? static_cast<double>(ok.load()) / seconds : 0.0) << "\n"
              << "latency p50 (ms)   : " << percentile(latenciesMs, 50) << "\n"
              << "latency p95 (ms)   : " << percentile(latenciesMs, 95) << "\n"
              << "latency p99 (ms)   : " << percentile(latenciesMs, 99) << "\n";

    return failed.load() == 0 ? 0 : 2;
}