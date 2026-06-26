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

### Part 1: The Backend & Web Infrastructure (Docker Compose)
The easiest way to spin up the servers, databases, and the Web app is via Docker Compose.

1. **Ensure Docker and Docker Compose are running.**
2. **Open a terminal in the root of the project.**
3. **Run the following command:**
   ```bash
   docker-compose up --build
   ```
4. **Access the infrastructure:**
   - **Frontend (React Web):** Open your browser to `http://localhost:3000`
   - **Backend API (Node.js):** Available at `http://localhost:3001`
   - **MongoDB Admin GUI (Mongo Express):** Available at `http://localhost:8082`
   - **C++ Server:** Runs internally on port `5555`

### Part 2: The Mobile App (React Native / Expo)
The mobile app runs natively on your host machine to easily connect to your physical device or simulator.

1. **Open a separate terminal.**
2. **Navigate to the `mobile` directory:**
   ```bash
   cd mobile
   ```
3. **Start the Expo server:**
   ```bash
   npx expo start
   ```
   *(If you are running the backend in Docker/WSL and testing on a physical phone, you may need to use `npx expo start --tunnel` and ensure your mobile's IP is configured correctly in `mobile/app.config.js` or `mobile/src/api/client.js`).*
4. **Run the app:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for Web Browser
   - Or scan the QR code with the Expo Go app on your physical device.

## 🛠️ Work Process & JIRA
This entire phase was managed using Agile methodology on JIRA. 
- All features were divided into **Epics** and **User Stories**.
- Tasks were assigned before work began, and their states actively managed (`In Progress` → `Code Review` → `Done`).
- We identified bottlenecks and marked tasks appropriately (e.g., `is blocked by`).
- We utilized **Git Feature Branches** mirroring our JIRA issue keys.
- Code was successfully merged to the `main` branch via **Pull Requests (PRs)**, which strictly required code review and independent approval from teammates.
