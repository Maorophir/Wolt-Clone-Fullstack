# Wolt-Clone Project — Exercise 5 (React Native + React + Node.js + MongoDB + C++)

## 📖 Full Documentation & App Previews

For a comprehensive guide, detailed running instructions, and screenshots of all the app's features (including the React Native mobile client and MongoDB integration), please visit our **[Project Wiki](https://github.com/Maorophir/Wolt-Clone-Finale/wiki)**.

## Description of the Project
This repository contains the complete implementation for **Exercise 5**: a full-stack system replicating the core features and design of the **Wolt** food delivery platform across multiple clients.

This final phase introduces a dynamic, premium **React Native (Expo) Mobile Application** for customers, seamlessly integrated with the RESTful API built in Exercise 3 (Node.js MVC server). Furthermore, we've transitioned the backend from in-memory arrays to a robust **MongoDB database** using Mongoose. The system continues to interoperate with the C++ TCP Server from Exercise 2 for user tracking — now rebuilt around a **thread pool** so it serves many clients concurrently instead of one at a time. The React Web Application from Exercise 4 handles cross-platform management.

### 🌟 Key Features
- **Premium Mobile App (React Native/Expo)**: A highly-polished, Wolt-inspired native mobile app with smooth transitions, modern typography, and a "Favorites" restaurant system.
- **Persistent Database (MongoDB)**: All data (restaurants, products, users, favorites) is now fully persisted in MongoDB via Mongoose.
- **Concurrent C++ Server (Thread Pool)**: The Exercise 2 TCP server was converted from a serial accept loop to a fixed-size thread pool, and its shared state hardened against data races — verified with ThreadSanitizer and a load test. See [the write-up](cpp-server/CONCURRENCY.md).
- **Cross-Platform**: Web Client (React) handles admin/management, while the Mobile Client (React Native) serves as the sleek customer ordering interface.
- **Robust Validation**: Extensive frontend and backend validation for Registration & Login (8+ characters, letter/number mix, visual feedback, mandatory fields).
- **Profile Avatars**: Integrated Image Pickers for users to upload profile pictures from their device.
- **Wolt-Inspired Aesthetics**: Adheres strictly to Wolt's design language, featuring curated color palettes and intuitive navigation (e.g., bottom tabs vs top navbars).
- **JIRA Integration**: Complete Agile workflow managed strictly via JIRA with Epics, User Stories, Sprint cycles, and blocked dependencies.

## 🗂️ Project Structure

```text
Wolt-Clone-Project/
├── mobile/                     # Exercise 5: React Native App (Expo/Customer App)
├── frontend/                   # Exercise 4: React Application (Web/Admin Dashboard)
├── backend/                    # Exercise 3: Node.js MVC server
│   ├── src/models/             # Mongoose schemas (User, Restaurant, Product)
│   └── src/server.js           # Express API with CORS configured
├── cpp-server/                 # Exercise 2: C++ TCP server (multi-threaded)
│   ├── src/network/            # TCPServer (accept loop) + ThreadPool (workers)
│   ├── src/data_management/    # StorageManager — shared_mutex + atomic operations
│   ├── src/tools/LoadTest.cpp  # Concurrent load generator used for benchmarking
│   └── CONCURRENCY.md          # Threading model, races fixed, TSan & benchmark results
├── mongo-data/                 # Persistent MongoDB volume data
├── docker-compose.yml          # Orchestrates Backend, Frontend, MongoDB, and C++ Servers
├── details.txt                 # Student details and GitHub link
└── README.md                   # This file
```

## 🚀 Running Instructions 

We have completely Dockerized the **entire system** (Backend, Database, C++ Server, Web Frontend, and Mobile Expo server). You do **not** need Node.js, npm, or Expo installed on your machine to run the project!

There are two ways to run the project. We recommend Option 1 for the cleanest, zero-config experience.

### Option 1: The Automated Script (Recommended)
We created a helper script that automatically detects your Wi-Fi IP, silently boots the Docker cluster in the background, and isolates the Expo logs so you get a perfectly clean QR code.

**For Mac/Linux:**
```bash
chmod +x run.sh
./run.sh
```

**For Windows:**
```bash
# Double-click run.bat in your file explorer, OR run in terminal:
.\run.bat
```
*(Press `Ctrl+C` to stop the logs, then run `docker-compose down` when you are finished).*

### Option 2: Pure Docker Compose (Manual)
If you prefer not to use the helper scripts, you can run everything purely through Docker Compose. Because Expo is running inside a virtual Linux container, you must manually pass your computer's Wi-Fi IP address so the QR code generates correctly.

1. Find your computer's local Wi-Fi IP address (e.g., `192.168.1.15`).
2. Open a terminal and start the cluster:
   - **Mac/Linux:** `HOST_IP=192.168.1.15 docker-compose up --build`
   - **Windows:** `$env:HOST_IP="192.168.1.15"; docker-compose up --build`
3. Open a second terminal and run `docker logs -f wolt-mobile` to see the QR code without database log spam.
4. Scan the QR code with the **Expo Go** app on your phone.

## ⚡ Concurrent C++ Server (Thread Pool & Race Conditions)

The Exercise 2 TCP server originally handled **one client at a time**: `TCPServer::start()` accepted a connection and then stayed inside that client's `recv` loop until it disconnected, leaving every other client waiting in the kernel's listen backlog. Because only one thread ever existed, nothing in `StorageManager` needed synchronisation.

It is now a **fixed-size thread pool server**, and the shared state was hardened to match.

### Threading model

```text
acceptor thread   accept()  →  ThreadPool::submit(serveClient(fd))  →  back to accept()
worker threads    own one connection end to end:
                  recv → frame on '\n' → handler.handleRequest → send → repeat
```

The acceptor touches no application state and never blocks on a client, so a single slow or silent client can no longer stall the entire server. `ThreadPool` uses a `std::mutex` + `std::condition_variable` task queue, is **bounded** so a connection flood sheds load (`503 Service Unavailable`) rather than growing until it runs out of memory, and **drains before joining** on shutdown so an in-flight request is never dropped.

### Race conditions found and fixed

| Where | Problem | Fix |
|---|---|---|
| `StorageManager` | `getUserHistory()` / `getUserProducts()` returned **references into the live hash table** — readers could walk it while a writer rehashed | `std::shared_mutex`; both return a snapshot **by value**, taken under the lock |
| `PostCommand` | `userExists()` then `addProductsToUser()` = two critical sections, so two threads could both create the same user (**measured: 2 of 64 threads both got `201`**) | `createUserWithProducts()` — check and insert under one exclusive lock |
| `PatchCommand` | Same shape; concurrent appends lost updates (**measured: 2000 products where 2001 were written**) | `appendProductsIfUserExists()` |
| `DeleteCommand` | Verify-then-erase across two locks, so a rejected delete could still apply partially | `deleteProductsIfAllPresent()` — all-or-nothing under one lock |
| `CommandParser` | Dispatched with `commands[name]`; `operator[]` **inserts** on a miss, making every malformed request a write to a map other workers were reading | Private, dispatched with `find()` |
| `TCPServer` | `isRunning` was a plain `bool` shared across threads; shutdown could destroy the pool while the acceptor was still inside `submit()`; unhandled `SIGPIPE` could kill the process; partial `send()` corrupted framing; `listen()` backlog of 5 dropped connections under burst | `std::atomic`, an acceptor lifetime guard + `requestStop()`, `SIG_IGN`, looped `send()`, `SOMAXCONN` |

### Verification

| | Before | After |
|---|---|---|
| Tests passing | 120 | **144** (the original 120 unchanged, + 24 new) |
| ThreadSanitizer data races | **41** | **0** |

The 24 new tests are written to **fail on the original code**, not merely to pass on the new: `SlowClientDoesNotBlockOtherClients` hangs the old server until the harness kills it, and the storage tests reproduce the wrong counts above. Every thread waits on a start gate and is released simultaneously — staggered thread startup is how these bugs hide from tests.

### Throughput

`WoltLoadTest` opens N persistent connections, releases them from a barrier at once, and issues a 3:1 read/write mix (`GET` runs the full recommendation pass). Measured on a 2-core container, 100 requests per client:

| Concurrent clients | Before | After (8 workers) | Wall time |
|---|---|---|---|
| 1 | 14,055 req/s | 10,884 req/s | 0.04s → 0.05s |
| 16 | 1,589 req/s | **6,802 req/s** | 1.01s → 0.24s |
| 64 | 232 req/s | **~4,400 req/s** | **27.6s → 1.4s** |

Two honest caveats: at **one** client the pool is ~20% *slower*, because handing the connection through a queue is pure overhead when there is nothing to overlap — that is the expected trade. And the old server's per-request p50 latency looks *better* only because its clock starts once a client is already being served, so the 27 seconds its clients spent queued are invisible to that number; wall time is the honest comparison.

### Building and testing the C++ server on its own

```bash
cd cpp-server
mkdir -p build && cd build
cmake .. && make -j$(nproc)

./WoltProjectTests              # 144 tests
./WoltProject 5555 8            # port, worker count (default: hardware_concurrency)
./WoltLoadTest 127.0.0.1 5555 64 100
```

```bash
# Data-race check (instruments every memory access; ~5-15x slower, debug only)
mkdir -p build-tsan && cd build-tsan
cmake -DENABLE_TSAN=ON .. && make -j$(nproc)
TSAN_OPTIONS="halt_on_error=0" ./WoltProjectTests 2> tsan.log
grep -c "WARNING: ThreadSanitizer" tsan.log     # expect 0
```

`-DENABLE_ASAN=ON` is also available for AddressSanitizer + UBSan. Both sanitizers are off by default, so the normal build and the Docker image are unaffected. Full details, including the shutdown-ordering bug that ThreadSanitizer caught after all 144 tests were already passing, are in **[cpp-server/CONCURRENCY.md](cpp-server/CONCURRENCY.md)**.

## 🛠️ Work Process & JIRA
This entire phase was managed using Agile methodology on JIRA. 
- All features were divided into **Epics** and **User Stories**.
- Tasks were assigned before work began, and their states actively managed (`In Progress` → `Code Review` → `Done`).
- We identified bottlenecks and marked tasks appropriately (e.g., `is blocked by`).
- We utilized **Git Feature Branches** mirroring our JIRA issue keys.
- Code was successfully merged to the `main` branch via **Pull Requests (PRs)**, which strictly required code review and independent approval from teammates.
