# Wolt-Clone Project — Exercise 3 (Node.js MVC)

## 📖 Description of the Project
This repository contains a modernized implementation for **Exercise 3**: a Node.js MVC web server that implements a RESTful API for a food delivery app (similar to Wolt). 

The Node server acts as the primary web backend, exposing JSON API endpoints for:
- User Registration & Authentication (Login)
- Restaurant & Menu (Product) Management
- Order Processing
- Searching functionality

**Architectural Highlights:**
- **MVC Pattern**: Clear separation of concerns with Routes, Controllers, and Models.
- **In-Memory Storage**: Data is kept volatile in process memory without a persistent DB, per exercise requirements.
- **Microservice Interoperability**: Designed to communicate with the C++ TCP Server from Exercise 2 (`cpp-server/`) via client sockets for recording user-product views and fetching recommendations.
- **RESTful Principles**: Uses appropriate HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`) and strict status codes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`).

## 🗂️ Project Structure

```text
Wolt-Clone-Project/
├── cpp-server/                 # Exercise 2 C++ TCP server (for interoperability)
├── src/                        # Exercise 3 Node.js MVC server (main submission)
│   ├── server.js               # Express application entry point
│   ├── controllers/            # Request handlers (e.g., restaurantController.js)
│   ├── models/                 # In-memory data models & storage logic
│   ├── routes/                 # API route definitions
│   ├── services/               # Background services (e.g., TCP client for Ex2)
│   └── middlewares/            # Auth/Validation middlewares
├── docker-compose.yml          # Runs both Node server and Ex2 C++ server
├── Dockerfile                  # Container definition for the Node server
└── package.json                # Project dependencies and npm scripts
```

## 🚀 Running Instructions

There are two primary ways to run the server:

### Option 1: Docker Compose (Recommended)
This spins up both the Node.js API server and the C++ Recommendation server, linking them automatically.

1. Ensure Docker and Docker Compose are installed.
2. Run the following command from the root of the project:
   ```bash
   docker-compose up --build
   ```
3. The Node.js server will be available at `http://localhost:3000`.

To stop the containers:
```bash
docker-compose down
```

### Option 2: Run Locally (Node Server Only)
If you only want to test the REST API without the C++ service:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server (runs on port 3000 by default):
   ```bash
   npm start
   ```

---

## 💻 Running Examples (curl)

Below are example API calls matching the workflows described in the Exercise 3 specification.

**1. Create a User (Registration)**
```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe", "phone":"050-1234567", "address":"Tel Aviv", "password":"123"}'
```
*Expected Output:* `201 Created`

**2. Login (Tokens)**
```bash
curl -i -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe", "password":"123"}'
```
*Expected Output:* `200 OK` (with User ID in the JSON body)

**3. Create a Restaurant**
```bash
curl -i -X POST http://localhost:3000/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{"name":"Pizza Place", "description":"Best Pizza"}'
```
*Expected Output:* `201 Created` (returns the new restaurant object with ID)

**4. List all Restaurants**
```bash
curl -i http://localhost:3000/api/restaurants
```
*Expected Output:* `200 OK` (returns a JSON array of restaurant objects)

**5. Get a Specific Restaurant**
```bash
# Replace <id> with the actual ID returned from the POST request
curl -i http://localhost:3000/api/restaurants/<id>
```
*Expected Output:* `200 OK` (returns the specific restaurant JSON)

**6. Update a Restaurant**
```bash
curl -i -X PATCH http://localhost:3000/api/restaurants/<id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Pizza Place & Pasta"}'
```
*Expected Output:* `204 No Content`

**7. Add a Product to a Restaurant Menu**
```bash
curl -i -X POST http://localhost:3000/api/restaurants/<id>/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Margherita", "price":50}'
```
*Expected Output:* `201 Created`

**8. Delete a Restaurant**
```bash
curl -i -X DELETE http://localhost:3000/api/restaurants/<id>
```
*Expected Output:* `204 No Content`

> Note: For actions requiring an authenticated user (like placing an order or viewing a product), you must pass the connected user's ID within the HTTP headers. 
Example: -H "x-user-id: <user_id>"
