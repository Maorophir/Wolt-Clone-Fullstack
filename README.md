# Product Recommendation System Server (Exercise 2)

## Overview
A C++ TCP server application that manages user product viewing history and provides personalized product recommendations using collaborative filtering. Built as an HTTP-like REST API running over TCP with command-based interaction.

## Key Features
- **Five HTTP-like commands**: POST (create), PATCH (update), GET (query), DELETE (remove), help
- **Collaborative filtering**: Recommends products based on similar users' viewing history
- **Persistent storage**: Automatically saves user data to `data/user_history.txt`
- **Efficient lookups**: Uses `std::unordered_map` and `std::unordered_set` for O(1) average operations
- **Comprehensive error handling**: Distinguishes between malformed (400) and logically invalid (404) requests
- **TCP server**: Listens for incoming connections and processes commands

## Project Structure

```text
wolt_project_ex2/
├── src/
│   ├── main.cpp                    # Application entry point (takes port as argument)
│   ├── StandardInputReader.h
│   ├── StandardOutputWriter.h
│   ├── command_parser/
│   │   ├── CommandParser.cpp       # Parses commands and routes to handlers
│   │   └── CommandParser.h
│   ├── commands/
│   │   ├── PostCommand.cpp/h       # Create new user (201 Created)
│   │   ├── PatchCommand.cpp/h      # Add products to user (204 No Content)
│   │   ├── GetCommand.cpp/h        # Get recommendations (200 Ok)
│   │   ├── DeleteCommand.cpp/h     # Remove products (204 No Content)
│   │   └── HelpCommand.cpp/h       # Show available commands
│   ├── data_management/
│   │   ├── StorageManager.cpp      # User history persistence
│   │   └── StorageManager.h
│   ├── interfaces/
│   │   ├── ICommandHandler.h       # Command interface
│   │   ├── IClientHandler.h        # Client connection interface
│   │   ├── IStorageManager.h       # Storage interface
│   │   ├── IRecommendationEngine.h # Recommendation interface
│   │   ├── IUserHistoryProvider.h  # History provider interface
│   │   ├── IInputReader.h
│   │   └── IOutputWriter.h
│   ├── network/
│   │   ├── TCPServer.cpp           # TCP server implementation
│   │   └── TCPServer.h
│   ├── recommendation/
│   │   ├── RecommendationEngine.cpp    # Exercise 1 recommendation logic
│   │   ├── RecommendationEngine.h
│   │   ├── StoredRecommendationEngine.cpp
│   │   └── StoredRecommendationEngine.h
│   ├── client/
│   │   └── client.py               # Python test client
│   └── tests/                      # Google Test (GTest) test suites
├── data/                           # Persistent storage (auto-created)
│   └── user_history.txt            # User viewing history
├── CMakeLists.txt
├── Dockerfile
├── docker-compose.yml
├── run_server.sh                   # Docker Compose wrapper script
├── run_tests.sh                    # Test runner script
└── README.md
```

## Prerequisites

- Docker and Docker Compose (recommended for easy setup)
- OR: CMake 3.10+, C++17 compatible compiler (GCC, Clang, MSVC)

## Running with Docker Compose (Recommended)

```bash
docker-compose up
```

This will:
- Build the Docker image automatically
- Run the server listening on port 5555
- Mount the `data/` directory for persistent storage
- Keep user history even after container restarts

To stop:
```bash
docker-compose down
```

## Running with Docker (Manual)

```bash
docker build -t wolt-recommendation .
docker run -it -p 5555:5555 -v $(pwd)/data:/app/data wolt-recommendation
```

Windows (PowerShell):
```bash
docker run -it -p 5555:5555 -v ${PWD}/data:/app/data wolt-recommendation
```

## Building Locally

```bash
mkdir build
cd build
cmake ..
make
```

## Running the Server Locally

```bash
./build/RecommendationSystem 5555
```

Replace `5555` with your desired port number.

## Running Tests

### With Docker:
```bash
./run_tests.sh
```

### Locally:
```bash
cd build
ctest --output-on-failure
```

Or run the full test suite:
```bash
./build/RecommendationSystemTests
```

**All 120 tests pass** ✅

## CLI Commands

All commands return HTTP-like status codes. Connect to the server via TCP (default port 5555) and send commands.

### POST [userid] [productid1] [productid2] ...
**Create a new user with their initial product viewing history.**

- Succeeds only if the user doesn't exist
- Returns: `201 Created`
- Example: `post 1 100 200 300`
- Error responses:
  - `404 Not Found` - User already exists
  - `400 Bad Request` - Missing userid or productids

Valid POST stores every supplied product ID and returns exactly "201 Created"**

### PATCH [userid] [productid1] [productid2] ...
**Add products to an existing user's viewing history.**

- Appends products (idempotent: duplicate products are ignored)
- User must have been created with POST first
- Returns: `204 No Content`
- Example: `patch 1 400 500`
- Error responses:
  - `404 Not Found` - User doesn't exist or specified products not in user's history
  - `400 Bad Request` - Missing userid or productids

PATCH appends to existing user's history. Returns exactly "204 No Content"**

### GET [userid] [productid]
**Get product recommendations for a user based on a specific product.**

- Uses collaborative filtering: finds similar users and returns products they viewed
- User must have been created with POST first
- Returns: `200 Ok` followed by two newlines, then space-separated product IDs
- Example: `get 1 100`
- Possible responses:
  - `200 Ok\n\n[product_ids]` - Success with recommendations
  - `200 Ok\n\n` - Success with no recommendations (user has no similar users)
  - `404 Not Found` - User doesn't exist
  - `400 Bad Request` - Invalid arguments

GET returns "200 Ok" followed by exactly two newlines, then recommendations**

### DELETE [userid] [productid1] [productid2] ...
**Remove products from a user's viewing history.**

- Removes specified products from user's history
- All specified products must exist in user's history
- Returns: `204 No Content`
- Example: `delete 1 100`
- Error responses:
  - `404 Not Found` - User doesn't exist or any specified product not in user's history
  - `400 Bad Request` - Missing userid or productids

DELETE removes products. Fails atomically if any product is missing. Returns "204 No Content"**

### help
**Display all available commands.**

- No arguments required
- Returns: Alphabetically sorted list of commands with their syntax
- Example: `help`

Commands are listed alphabetically, with 'help' pinned last**

## Response Format Details

### Success Responses
- **POST**: `201 Created\n`
- **PATCH**: `204 No Content\n`
- **DELETE**: `204 No Content\n`
- **GET**: `200 Ok\n\n<body>\n` (where body is space-separated product IDs or empty)
- **help**: `<command list>\n`

### Error Responses
- **400 Bad Request**: Malformed command (missing args, non-integer IDs, unknown command)
- **404 Not Found**: Logically invalid request (user doesn't exist, product not in history)

All responses include exactly one trailing newline when sent over TCP.

All response formats are exact — no extra text, no variations**

## Data Persistence

All user data is automatically saved to `data/user_history.txt`:
```
[format] userid productid1 productid2 productid3 ...
[example]
1 100 200 300
2 100 250 400
3 150 300
```

When using Docker Compose, the `data/` directory is mounted to the host, so data persists:
- ✅ After container restarts
- ✅ After `docker-compose down`
- ✅ Files accessible on host machine in `./data/` directory

## TCP Server Communication

The server listens on port 5555 (configurable) and accepts TCP connections.

### Connect via `nc` (netcat):
```bash
nc 127.0.0.1 5555
```

Then type commands:
```
post 1 100 200 300
patch 1 400
get 1 100
delete 1 100
help
```

### Connect via Python client:
```bash
python3 src/client/client.py
```

### Example Session

```
Connected to server on port 5555
> post 1 100 200 300
201 Created
> post 2 100 250 400
201 Created
> post 3 150 300
201 Created
> get 1 100
200 Ok

250 400
> patch 1 400
204 No Content
> delete 1 100
204 No Content
> get 1 100
404 Not Found
> help
DELETE, arguments: [userid] [productid1] [productid2] ...
GET, arguments: [userid] [productid]
PATCH, arguments: [userid] [productid1] [productid2] ...
POST, arguments: [userid] [productid1] [productid2] ...
help
```

## Data Integrity Guarantees

- **Atomicity**: Commands are all-or-nothing (DELETE only deletes if ALL products exist)
- **No partial updates**: Malformed commands don't mutate data
- **Idempotency**: PATCH duplicate products are handled with set semantics (no duplicates)
- **Persistence**: Every mutation is immediately saved to disk

## Architecture & SOLID Principles

### Open/Closed Principle Design

This project is designed to be **closed for modification but open for extension**. Here's how the architecture handles requirement changes without modifying core code:

#### 1. Command Name Changes (add → POST, recommend → GET)
**Solution**: Commands are abstracted behind `ICommandHandler` interface and registered by name in a map.

- **No impact on core code**: The command dispatcher doesn't care what the command is called
- **Change location**: Only modify individual command class names; the parser's command registration remains unchanged
- **Example**: Renaming "add" to "POST" only requires changing the map entry key, not the dispatcher logic

```cpp
// CommandParser.cpp - only place affected:
commands["post"] = std::make_unique<PostCommand>(storageManager);  // name changed here
// Dispatcher logic unchanged:
auto it = commands.find(verb);  // still finds command by name
```

#### 2. New Commands (adding DELETE, PATCH)
**Solution**: `ICommandHandler` interface enables adding new command classes without modifying existing code.

- **No impact on parser**: Just implement `ICommandHandler` and register in the map
- **No impact on command classes**: Each command is independent
- **Example**: Added `DeleteCommand`, `PatchCommand`, `PatchCommand` without modifying:
  - `CommandParser` logic
  - `PostCommand`, `GetCommand`, `HelpCommand`
  - Any core infrastructure

#### 3. Output Format Changes (201 Created, 204 No Content)
**Solution**: Each command controls its own response format.

- **No impact on other commands**: When POST output changed to "201 Created", only PostCommand was modified
- **When PATCH was added with "204 No Content"**: DeleteCommand and PatchCommand independently define their output
- **Parser doesn't care**: Dispatcher just forwards responses blindly

#### 4. I/O Changes (Console → Sockets)
**Solution**: `IClientHandler` interface abstracts input/output from business logic.

- **Dependency Inversion**: Commands depend on `StorageManager` (data layer), not I/O
- **No impact on commands**: Whether I/O comes from console or socket, command logic is identical
- **Parser is I/O-agnostic**: Implements `IClientHandler` interface, works with any I/O source
- **In Exercise 1**: Used standard input/output via `main()`
- **In Exercise 2**: Same `CommandParser` class works with TCP sockets via `IClientHandler`

```cpp
// IClientHandler interface (abstraction)
class IClientHandler {
    virtual std::string handleRequest(const std::string& request) = 0;
};

// CommandParser implements both (polymorphism)
class CommandParser : public IClientHandler {
    std::string handleRequest(const std::string& request) override {
        return processCommand(request);  // Same logic, different I/O source
    }
};

// TCPServer uses the abstraction (doesn't care about implementation)
TCPServer(int port, IClientHandler &handler);
```

### Extensibility for Future Requirements

#### Concurrent Client Support
The current design supports this transition with minimal changes:

- **Storage layer**: `StorageManager` is already thread-safe at the data structure level (could add mutex for concurrent access)
- **Command handlers**: Stateless design means multiple threads can safely execute commands
- **I/O layer**: `IClientHandler` abstraction makes it easy to:
  - Create `ThreadedTCPServer` subclass handling multiple connections
  - Delegate each connection to a handler instance
  - No changes needed to commands or parser logic

**Future implementation**:
```cpp
// New: ThreadedTCPServer (without changing existing code)
class ThreadedTCPServer : public TCPServer {
    void start() override {  // overrides parent
        for (each incoming connection) {
            std::thread([this]() { 
                handler->handleRequest(data);  // Uses same handler interface
            }).detach();
        }
    }
};
```

### Key Design Patterns Used

1. **Strategy Pattern**: `ICommandHandler` lets different commands implement different strategies
2. **Factory Pattern**: Map-based command registration (could extend to factory class)
3. **Dependency Injection**: Commands receive `StorageManager*` rather than creating it
4. **Adapter Pattern**: `CommandParser` adapts command execution to `IClientHandler` interface
5. **Interface Segregation**: Separate `ICommandHandler`, `IStorageManager`, `IClientHandler` interfaces

### SOLID Principles Compliance

| Principle | How Achieved | Benefits |
|-----------|-------------|----------|
| **S** - Single Responsibility | Each command handles one action; Parser only dispatches; TCPServer only manages connections | Easy to test, modify, understand |
| **O** - Open/Closed | New commands added via `ICommandHandler` without modifying dispatcher | Exercise 2 added 4 commands without touching existing code |
| **L** - Liskov Substitution | All commands implement `ICommandHandler` identically; can swap implementations | Commands are interchangeable |
| **I** - Interface Segregation | Separate interfaces for different concerns (`ICommandHandler`, `IStorageManager`, `IClientHandler`) | Commands don't depend on unnecessary abstractions |
| **D** - Dependency Inversion | Commands depend on abstractions (`IStorageManager`, `ICommandHandler`) not concrete classes | Easy to mock for testing, swap implementations |
