#pragma once

#include <map>
#include <memory>
#include <string>
#include <vector>
#include "interfaces/ICommandHandler.h"
#include "interfaces/IClientHandler.h"
#include "data_management/StorageManager.h"

// Parses user input strings and dispatches to command handlers.
// Acts as the IClientHandler so the TCP server can call into the
// command pipeline without knowing about parsing or storage.
//
// THREAD SAFETY
// -------------
// One CommandParser instance is shared by every worker thread in the server's
// pool, so handleRequest() must be re-entrant. It is, because:
//   * `commands` is built once in the constructor and only ever READ afterwards
//     (concurrent reads of a const map need no lock);
//   * each ICommandHandler is stateless - all per-request data lives on the
//     calling thread's stack;
//   * the only mutable shared state is `watchList`, and StorageManager is
//     internally synchronised.
// `commands` was public and non-const before; it is private and read-only now,
// because a caller mutating it while workers dispatch through it would be an
// unsynchronised write to a container other threads are reading.
class CommandParser : public IClientHandler {
private:
    StorageManager watchList;
    std::map<std::string, std::unique_ptr<ICommandHandler>> commands;

public:
    explicit CommandParser(const std::string& dataFile = "data/user_history.txt");

    std::string handleRequest(const std::string& request) override {
        return processCommand(request);
    }

    // Read-only access for tests that assert which commands are registered.
    bool hasCommand(const std::string& name) const;
    std::size_t commandCount() const;

    std::string processCommand(const std::string& line);
    std::vector<std::string> parseCommand(const std::string& line);
};