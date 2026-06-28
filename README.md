# Wolt-Clone Project — Exercise 5 (React Native + React + Node.js + MongoDB + C++)

## 📖 Full Documentation & App Previews

For a comprehensive guide, detailed running instructions, and screenshots of all the app's features (including the React Native mobile client and MongoDB integration), please visit our **[Project Wiki](https://github.com/Maorophir/Wolt-Clone-Finale/wiki)**.

## Description of the Project
This repository contains the complete implementation for **Exercise 5**: a full-stack system replicating the core features and design of the **Wolt** food delivery platform across multiple clients.

This final phase introduces a dynamic, premium **React Native (Expo) Mobile Application** for customers, seamlessly integrated with the RESTful API built in Exercise 3 (Node.js MVC server). Furthermore, we've transitioned the backend from in-memory arrays to a robust **MongoDB database** using Mongoose. The system continues to interoperate with the C++ TCP Server from Exercise 2 for user tracking, and the React Web Application from Exercise 4 for cross-platform management.

### 🌟 Key Features
- **Premium Mobile App (React Native/Expo)**: A highly-polished, Wolt-inspired native mobile app with smooth transitions, modern typography, and a "Favorites" restaurant system.
- **Persistent Database (MongoDB)**: All data (restaurants, products, users, favorites) is now fully persisted in MongoDB via Mongoose.
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
├── cpp-server/                 # Exercise 2: C++ TCP server
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

## 🛠️ Work Process & JIRA
This entire phase was managed using Agile methodology on JIRA. 
- All features were divided into **Epics** and **User Stories**.
- Tasks were assigned before work began, and their states actively managed (`In Progress` → `Code Review` → `Done`).
- We identified bottlenecks and marked tasks appropriately (e.g., `is blocked by`).
- We utilized **Git Feature Branches** mirroring our JIRA issue keys.
- Code was successfully merged to the `main` branch via **Pull Requests (PRs)**, which strictly required code review and independent approval from teammates.
