# Wolt-Clone Project — Exercise 4 (React + Node.js + C++)

## 📖 Description of the Project
This repository contains the complete implementation for **Exercise 4**: a full-stack web application replicating the core features and design of the **Wolt** food delivery platform.

This phase introduces a dynamic, responsive **React Frontend**, which communicates with the RESTful API built in Exercise 3 (Node.js MVC server). The system also continues to interoperate with the C++ TCP Server from Exercise 2 for user tracking.

### 🌟 Key Features
- **Wolt-Inspired Design**: A beautiful, modern UI inspired by Wolt, complete with smooth animations, high-quality images, and a fully functional layout.
- **Dynamic Data**: All data (restaurants, products, users) is dynamically loaded from the Node.js server. No hardcoded mock data!
- **User Authentication**: Secure Login & Registration using JWT (JSON Web Tokens). Includes both frontend and backend validation for passwords (8+ chars, letters + numbers).
- **Dark Mode**: Fully functional Light & Dark themes with a toggle switch in the navigation bar.
- **Restaurant Management**: Business owners can create restaurants, upload images, and manage their menus.
- **Cart & Ordering System**: Add items to your cart from a restaurant and checkout.
- **Search**: Search for restaurants and dishes right from the navbar.
- **Routing**: Single Page Application (SPA) routing powered by React Router.
- **JIRA Integration**: Agile workflow managed strictly via JIRA with Epics, User Stories, and Sprint cycles.

## 🗂️ Project Structure

```text
Wolt-Clone-Project/
├── frontend/                   # Exercise 4: React Application (SPA)
│   ├── src/                    # React components, pages, context, and hooks
│   ├── public/                 # Static assets
│   └── package.json            # Frontend dependencies
├── src/                        # Exercise 3: Node.js MVC server
│   ├── server.js               # Express application entry point
│   ├── controllers/            # Request handlers
│   ├── models/                 # In-memory data models & storage
│   ├── routes/                 # API route definitions
│   └── middlewares/            # Auth/Validation middlewares
├── cpp-server/                 # Exercise 2: C++ TCP server
├── docker-compose.yml          # Runs React, Node.js, and C++ servers together
├── details.txt                 # Student details and GitHub link
└── README.md                   # This file
```

## 🚀 Running Instructions (Docker Compose)

The easiest and recommended way to run the entire stack (React UI, Node.js API, and C++ Server) is using Docker Compose.

1. **Ensure Docker and Docker Compose are installed and running.**
2. **Open a terminal in the root of the project.**
3. **Run the following command:**
   ```bash
   docker-compose up --build
   ```
4. **Access the application:**
   - **Frontend (React UI):** Open your browser and go to `http://localhost:3000`
   - **Backend API (Node.js):** Available internally to the frontend or directly via `http://localhost:3001`
   - **C++ Server:** Runs internally on port `5555`

To stop the containers gracefully, press `Ctrl+C` or run:
```bash
docker-compose down
```

## 🛠️ Work Process & JIRA
This sprint was managed using Agile methodology on JIRA. 
- All tasks were divided into Epics and User Stories.
- Tasks were assigned before work began.
- We used Git Feature Branches matching our JIRA issue keys.
- Code was merged to the `main` branch via Pull Requests (PRs), which required code review and approval from teammates.

