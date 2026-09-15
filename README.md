# Wolt-Clone Project — (React Native + React + Node.js + MongoDB + C++)

## 📖 Full Documentation & App Previews

For a comprehensive guide, detailed running instructions, and screenshots of all the app's features (including the React Native mobile client and MongoDB integration), please visit our **[Project Wiki](https://github.com/Maorophir/Wolt-Clone-Fullstack/wiki)**.

## Description of the Project
This repository contains the complete implementation for **Exercise 5**: a full-stack system replicating the core features and design of the **Wolt** food delivery platform across multiple clients.

This final phase introduces a dynamic, premium **React Native (Expo) Mobile Application** for customers, seamlessly integrated with the RESTful API built in Exercise 3 (Node.js MVC server). Furthermore, we've transitioned the backend from in-memory arrays to a robust **MongoDB database** using Mongoose. The system continues to interoperate with the C++ TCP Server from Exercise 2 for user tracking - now rebuilt around a **thread pool** so it serves many clients concurrently instead of one at a time. The React Web Application from Exercise 4 handles cross-platform management.

### 🌟 Key Features
- **Premium Mobile App (React Native/Expo)**: A highly-polished, Wolt-inspired native mobile app with smooth transitions, modern typography, and a "Favorites" restaurant system.
- **Persistent Database (MongoDB)**: All data (restaurants, products, users, favorites) is now fully persisted in MongoDB via Mongoose.
- **Concurrent C++ Server (Thread Pool)**: The Exercise 2 TCP server was converted from a serial accept loop to a fixed-size thread pool.
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



## 🛠️ Work Process & JIRA
This entire phase was managed using Agile methodology on JIRA. 
- All features were divided into **Epics** and **User Stories**.
- Tasks were assigned before work began, and their states actively managed (`In Progress` → `Code Review` → `Done`).
- We identified bottlenecks and marked tasks appropriately (e.g., `is blocked by`).
- We utilized **Git Feature Branches** mirroring our JIRA issue keys.
- Code was successfully merged to the `main` branch via **Pull Requests (PRs)**, which strictly required code review and independent approval from teammates.
